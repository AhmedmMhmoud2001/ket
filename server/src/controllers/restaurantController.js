const prisma = require('../utils/prisma');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
    try {
        const { search, isActive, categoryId, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { nameAr: { contains: search } },
                { nameEn: { contains: search } }
            ];
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        const [restaurants, total] = await Promise.all([
            prisma.restaurant.findMany({
                where,
                include: {
                    category: true,
                    owner: { select: { id: true, name: true, phone: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.restaurant.count({ where })
        ]);

        // Format response
        const formattedRestaurants = restaurants;

        res.json({
            success: true,
            data: {
                restaurants: formattedRestaurants,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get restaurants error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurants',
            error: error.message
        });
    }
};

// Get restaurant by ID
exports.getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
            include: {
                category: true,
                owner: { select: { id: true, name: true, phone: true } }
            }
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        // Format response
        const formattedRestaurant = restaurant;

        res.json({
            success: true,
            data: formattedRestaurant
        });
    } catch (error) {
        console.error('Get restaurant error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurant',
            error: error.message
        });
    }
};

// Helper to sync user role based on restaurant ownership and management
async function syncUserRestaurantRole(userId) {
    if (!userId) return;
    try {
        const [ownerRole, adminRole, customerRole] = await Promise.all([
            prisma.role.findUnique({ where: { name: 'RESTAURANT_OWNER' } }),
            prisma.role.findUnique({ where: { name: 'RESTAURANT_ADMIN' } }),
            prisma.role.findUnique({ where: { name: 'CUSTOMER' } })
        ]);

        if (!ownerRole || !adminRole || !customerRole) return;

        // Check responsibilities
        const [ownedCount, managedCount] = await Promise.all([
            prisma.restaurant.count({ where: { ownerId: userId } }),
            prisma.restaurant.count({ where: { adminId: userId } })
        ]);

        const rolesToHave = [];
        const rolesToRemove = [];

        if (ownedCount > 0) {
            rolesToHave.push(ownerRole.id);
        } else {
            rolesToRemove.push(ownerRole.id);
        }

        if (managedCount > 0) {
            rolesToHave.push(adminRole.id);
        } else {
            rolesToRemove.push(adminRole.id);
        }

        // If no responsibility, must be CUSTOMER. If has responsibility, remove CUSTOMER.
        if (ownedCount === 0 && managedCount === 0) {
            rolesToHave.push(customerRole.id);
        } else {
            rolesToRemove.push(customerRole.id);
        }

        // Apply changes
        for (const roleId of rolesToHave) {
            await prisma.userrole.upsert({
                where: { userId_roleId: { userId, roleId } },
                update: {},
                create: { userId, roleId }
            });
        }

        if (rolesToRemove.length > 0) {
            await prisma.userrole.deleteMany({
                where: {
                    userId,
                    roleId: { in: rolesToRemove }
                }
            });
        }
    } catch (error) {
        console.error('Error syncing user restaurant role:', error);
    }
}

// Create restaurant
exports.createRestaurant = async (req, res) => {
    try {
        const {
            nameAr,
            nameEn,
            descriptionAr,
            descriptionEn,
            phone,
            deliveryType,
            categoryId,
            ownerId,
            adminId,
            imageUrl
        } = req.body;

        if (!nameAr || !nameEn || !phone || !categoryId || !ownerId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide required fields (nameAr, nameEn, phone, categoryId, ownerId)'
            });
        }

        const restaurant = await prisma.restaurant.create({
            data: {
                nameAr,
                nameEn,
                descriptionAr,
                descriptionEn,
                phone,
                deliveryType: deliveryType || 'CAR',
                categoryId,
                ownerId,
                adminId: adminId || null,
                imageUrl: imageUrl || null,
                isActive: true
            }
        });

        // Sync user roles
        await Promise.all([
            syncUserRestaurantRole(ownerId),
            adminId ? syncUserRestaurantRole(adminId) : Promise.resolve()
        ]);

        res.status(201).json({
            success: true,
            message: 'Restaurant created successfully',
            data: restaurant
        });
    } catch (error) {
        console.error('Create restaurant error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating restaurant',
            error: error.message
        });
    }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Get current restaurant to check for owner change
        const currentRestaurant = await prisma.restaurant.findUnique({
            where: { id },
            select: { ownerId: true, adminId: true }
        });

        if (!currentRestaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        const mappedData = {};
        if (updateData.nameAr) mappedData.nameAr = updateData.nameAr;
        if (updateData.nameEn) mappedData.nameEn = updateData.nameEn;
        if (updateData.descriptionAr) mappedData.descriptionAr = updateData.descriptionAr;
        if (updateData.descriptionEn) mappedData.descriptionEn = updateData.descriptionEn;
        if (updateData.phone) mappedData.phone = updateData.phone;
        if (updateData.deliveryType) mappedData.deliveryType = updateData.deliveryType;
        if (updateData.categoryId) mappedData.categoryId = updateData.categoryId;
        if (updateData.isActive !== undefined) mappedData.isActive = updateData.isActive;
        if (updateData.adminId !== undefined) mappedData.adminId = updateData.adminId ? updateData.adminId : null;
        if (updateData.imageUrl !== undefined) mappedData.imageUrl = updateData.imageUrl;
        if (updateData.ownerId) mappedData.ownerId = updateData.ownerId;

        const restaurant = await prisma.restaurant.update({
            where: { id },
            data: mappedData
        });

        // Sync roles for all involved parties (old and new owners/admins)
        const syncTasks = [];

        if (mappedData.ownerId) {
            syncTasks.push(syncUserRestaurantRole(mappedData.ownerId));
            if (mappedData.ownerId !== currentRestaurant.ownerId) {
                syncTasks.push(syncUserRestaurantRole(currentRestaurant.ownerId));
            }
        }

        if (mappedData.adminId !== undefined) {
            if (mappedData.adminId) {
                syncTasks.push(syncUserRestaurantRole(mappedData.adminId));
            }
            if (currentRestaurant.adminId && mappedData.adminId !== currentRestaurant.adminId) {
                syncTasks.push(syncUserRestaurantRole(currentRestaurant.adminId));
            }
        }

        if (syncTasks.length > 0) {
            await Promise.all(syncTasks);
        }

        res.json({
            success: true,
            message: 'Restaurant updated successfully',
            data: restaurant
        });
    } catch (error) {
        console.error('Update restaurant error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating restaurant',
            error: error.message
        });
    }
};

// Delete restaurant
exports.deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        // Get owner first
        const restaurant = await prisma.restaurant.findUnique({
            where: { id },
            select: { ownerId: true, adminId: true }
        });

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        await prisma.restaurant.delete({
            where: { id }
        });

        // Sync roles after deletion
        await Promise.all([
            syncUserRestaurantRole(restaurant.ownerId),
            restaurant.adminId ? syncUserRestaurantRole(restaurant.adminId) : Promise.resolve()
        ]);

        res.json({
            success: true,
            message: 'Restaurant deleted successfully'
        });
    } catch (error) {
        console.error('Delete restaurant error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting restaurant (likely has related data)',
            error: error.message
        });
    }
};
