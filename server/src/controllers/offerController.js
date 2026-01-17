const prisma = require('../utils/prisma');

// Get all offers
exports.getAllOffers = async (req, res) => {
    try {
        const { search, restaurant_id, is_active, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        // Build where clause
        const where = {};

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } }
            ];
        }

        if (restaurant_id) {
            where.restaurantId = restaurant_id;
        }

        if (is_active !== undefined) {
            where.isActive = is_active === 'true';
        }

        const [offers, total] = await Promise.all([
            prisma.offer.findMany({
                where,
                include: {
                    restaurant: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.offer.count({ where })
        ]);

        // Format for backward compatibility
        const formattedOffers = offers.map(offer => ({
            ...offer,
            restaurant_id: offer.restaurantId,
            restaurant_name: offer.restaurant?.name,
            discount_type: offer.type,
            discount_value: offer.discountValue,
            min_order_amount: offer.minOrderAmount,
            start_date: offer.startDate,
            end_date: offer.endDate,
            is_active: offer.isActive,
            image_url: offer.image,
            created_at: offer.createdAt
        }));

        res.json({
            success: true,
            data: {
                offers: formattedOffers,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get offers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching offers',
            error: error.message
        });
    }
};

// Get offer by ID
exports.getOfferById = async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await prisma.offer.findUnique({
            where: { id },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        // Format for backward compatibility
        const formattedOffer = {
            ...offer,
            restaurant_id: offer.restaurantId,
            restaurant_name: offer.restaurant?.name,
            discount_type: offer.type,
            discount_value: offer.discountValue,
            min_order_amount: offer.minOrderAmount,
            start_date: offer.startDate,
            end_date: offer.endDate,
            is_active: offer.isActive,
            image_url: offer.image
        };

        res.json({
            success: true,
            data: formattedOffer
        });
    } catch (error) {
        console.error('Get offer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching offer',
            error: error.message
        });
    }
};

// Create offer
exports.createOffer = async (req, res) => {
    try {
        const {
            title,
            title_ar,
            description,
            description_ar,
            image_url,
            discount_type,
            discount_value,
            min_order_amount,
            restaurant_id,
            start_date,
            end_date,
            is_active
        } = req.body;

        if (!title || !discount_type || !discount_value || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate dates
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (startDate > endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be after end date'
            });
        }

        // Validate discount value
        const discountValue = parseFloat(discount_value);
        if (discountValue <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Discount value must be greater than 0'
            });
        }

        if (discount_type.toUpperCase() === 'PERCENTAGE' && discountValue > 100) {
            return res.status(400).json({
                success: false,
                message: 'Discount percentage cannot be greater than 100%'
            });
        }

        const offer = await prisma.offer.create({
            data: {
                title,
                description: description || null,
                type: discount_type.toUpperCase(),
                discountValue: parseFloat(discount_value),
                minOrderAmount: min_order_amount ? parseFloat(min_order_amount) : 0,
                restaurantId: restaurant_id || null,
                startDate: new Date(start_date),
                endDate: new Date(end_date),
                isActive: is_active !== undefined ? is_active : true,
                image: image_url || null
            }
        });

        res.status(201).json({
            success: true,
            message: 'Offer created successfully',
            data: offer
        });
    } catch (error) {
        console.error('Create offer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating offer',
            error: error.message
        });
    }
};

// Update offer
exports.updateOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            image_url,
            discount_type,
            discount_value,
            min_order_amount,
            restaurant_id,
            start_date,
            end_date,
            is_active
        } = req.body;

        const offer = await prisma.offer.findUnique({ where: { id } });

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (image_url !== undefined) updateData.image = image_url;
        if (discount_type !== undefined) updateData.type = discount_type.toUpperCase();
        if (discount_value !== undefined) updateData.discountValue = parseFloat(discount_value);
        if (min_order_amount !== undefined) updateData.minOrderAmount = parseFloat(min_order_amount);
        if (restaurant_id !== undefined) updateData.restaurantId = restaurant_id || null;
        
        // Handle date validation
        const finalStartDate = start_date !== undefined ? new Date(start_date) : offer.startDate;
        const finalEndDate = end_date !== undefined ? new Date(end_date) : offer.endDate;
        
        if (finalStartDate > finalEndDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be after end date'
            });
        }

        // Validate discount value if being updated
        if (discount_value !== undefined) {
            const discountValue = parseFloat(discount_value);
            if (discountValue <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Discount value must be greater than 0'
                });
            }

            const finalDiscountType = discount_type !== undefined ? discount_type.toUpperCase() : offer.type;
            if (finalDiscountType === 'PERCENTAGE' && discountValue > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Discount percentage cannot be greater than 100%'
                });
            }
        }
        
        if (start_date !== undefined) updateData.startDate = finalStartDate;
        if (end_date !== undefined) updateData.endDate = finalEndDate;
        if (is_active !== undefined) updateData.isActive = is_active;

        await prisma.offer.update({
            where: { id },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Offer updated successfully'
        });
    } catch (error) {
        console.error('Update offer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating offer',
            error: error.message
        });
    }
};

// Delete offer
exports.deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await prisma.offer.findUnique({ where: { id } });

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        await prisma.offer.delete({ where: { id } });

        res.json({
            success: true,
            message: 'Offer deleted successfully'
        });
    } catch (error) {
        console.error('Delete offer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting offer',
            error: error.message
        });
    }
};

// Toggle offer active status
exports.toggleOffer = async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await prisma.offer.findUnique({ where: { id } });

        if (!offer) {
            return res.status(404).json({
                success: false,
                message: 'Offer not found'
            });
        }

        const updated = await prisma.offer.update({
            where: { id },
            data: { isActive: !offer.isActive }
        });

        res.json({
            success: true,
            message: `Offer ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
            data: updated
        });
    } catch (error) {
        console.error('Toggle offer error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling offer',
            error: error.message
        });
    }
};
