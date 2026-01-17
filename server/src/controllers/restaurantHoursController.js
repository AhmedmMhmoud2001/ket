const prisma = require('../utils/prisma');

// Get restaurant hours
exports.getRestaurantHours = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const hours = await prisma.restaurantHours.findMany({
            where: { restaurantId },
            orderBy: { dayOfWeek: 'asc' }
        });

        // If no hours exist, return default structure
        if (hours.length === 0) {
            const defaultHours = Array.from({ length: 7 }, (_, i) => ({
                dayOfWeek: i,
                openTime: '09:00',
                closeTime: '22:00',
                isOpen: true
            }));
            return res.json({
                success: true,
                data: defaultHours
            });
        }

        res.json({
            success: true,
            data: hours
        });
    } catch (error) {
        console.error('Get restaurant hours error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurant hours',
            error: error.message
        });
    }
};

// Create or update restaurant hours
exports.updateRestaurantHours = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { hours } = req.body; // Array of { dayOfWeek, openTime, closeTime, isOpen }

        if (!hours || !Array.isArray(hours)) {
            return res.status(400).json({
                success: false,
                message: 'Hours array is required'
            });
        }

        // Verify restaurant exists
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId }
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        // Delete existing hours
        await prisma.restaurantHours.deleteMany({
            where: { restaurantId }
        });

        // Create new hours
        const createdHours = await prisma.restaurantHours.createMany({
            data: hours.map(hour => ({
                restaurantId,
                dayOfWeek: parseInt(hour.dayOfWeek),
                openTime: hour.openTime,
                closeTime: hour.closeTime,
                isOpen: hour.isOpen !== undefined ? hour.isOpen : true
            }))
        });

        // Fetch created hours
        const updatedHours = await prisma.restaurantHours.findMany({
            where: { restaurantId },
            orderBy: { dayOfWeek: 'asc' }
        });

        res.json({
            success: true,
            message: 'Restaurant hours updated successfully',
            data: updatedHours
        });
    } catch (error) {
        console.error('Update restaurant hours error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating restaurant hours',
            error: error.message
        });
    }
};

// Get if restaurant is currently open
exports.isRestaurantOpen = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const now = new Date();
        const currentDay = now.getDay(); // 0-6 (Sunday-Saturday)
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const todayHours = await prisma.restaurantHours.findFirst({
            where: {
                restaurantId,
                dayOfWeek: currentDay
            }
        });

        if (!todayHours || !todayHours.isOpen) {
            return res.json({
                success: true,
                data: {
                    isOpen: false,
                    message: 'Restaurant is closed today'
                }
            });
        }

        const isOpen = currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;

        res.json({
            success: true,
            data: {
                isOpen,
                openTime: todayHours.openTime,
                closeTime: todayHours.closeTime,
                message: isOpen ? 'Restaurant is open' : `Restaurant opens at ${todayHours.openTime}`
            }
        });
    } catch (error) {
        console.error('Check restaurant open error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking restaurant status',
            error: error.message
        });
    }
};

// Get all restaurants hours (admin)
exports.getAllRestaurantsHours = async (req, res) => {
    try {
        const { restaurantId, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};
        if (restaurantId) {
            where.restaurantId = restaurantId;
        }

        const [hours, total] = await Promise.all([
            prisma.restaurantHours.findMany({
                where,
                include: {
                    restaurant: {
                        select: {
                            id: true,
                            nameEn: true,
                            nameAr: true
                        }
                    }
                },
                orderBy: [
                    { restaurantId: 'asc' },
                    { dayOfWeek: 'asc' }
                ],
                skip,
                take
            }),
            prisma.restaurantHours.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                hours,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get all restaurants hours error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching restaurants hours',
            error: error.message
        });
    }
};

