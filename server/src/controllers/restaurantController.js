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

        res.json({
            success: true,
            data: {
                restaurants,
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
                owner: { select: { id: true, name: true, phone: true } },
                subcategories: {
                    include: {
                        products: true
                    }
                }
            }
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        res.json({
            success: true,
            data: restaurant
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
            adminId
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
                isActive: true
            }
        });

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

        const mappedData = {};
        if (updateData.nameAr) mappedData.nameAr = updateData.nameAr;
        if (updateData.nameEn) mappedData.nameEn = updateData.nameEn;
        if (updateData.descriptionAr) mappedData.descriptionAr = updateData.descriptionAr;
        if (updateData.descriptionEn) mappedData.descriptionEn = updateData.descriptionEn;
        if (updateData.phone) mappedData.phone = updateData.phone;
        if (updateData.deliveryType) mappedData.deliveryType = updateData.deliveryType;
        if (updateData.categoryId) mappedData.categoryId = updateData.categoryId;
        if (updateData.isActive !== undefined) mappedData.isActive = updateData.isActive;
        if (updateData.adminId) mappedData.adminId = updateData.adminId;

        const restaurant = await prisma.restaurant.update({
            where: { id },
            data: mappedData
        });

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

        await prisma.restaurant.delete({
            where: { id }
        });

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
