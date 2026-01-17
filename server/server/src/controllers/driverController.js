const prisma = require('../utils/prisma');

// Get all delivery drivers
exports.getAllDrivers = async (req, res) => {
    try {
        const { search, isOnline, isPlatformDriver, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (search) {
            where.user = {
                OR: [
                    { name: { contains: search } },
                    { phone: { contains: search } }
                ]
            };
        }

        if (isOnline !== undefined) {
            where.isOnline = isOnline === 'true';
        }

        if (isPlatformDriver !== undefined) {
            where.isPlatformDriver = isPlatformDriver === 'true';
        }

        const [drivers, total] = await Promise.all([
            prisma.deliveryDriver.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, phone: true, email: true } },
                    restaurant: { select: { id: true, nameEn: true } }
                },
                orderBy: { rating: 'desc' },
                skip,
                take
            }),
            prisma.deliveryDriver.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                drivers,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching drivers',
            error: error.message
        });
    }
};

// Get driver by ID
exports.getDriverById = async (req, res) => {
    try {
        const { id } = req.params;

        const driver = await prisma.deliveryDriver.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, phone: true, email: true } },
                restaurant: { select: { id: true, nameEn: true } }
            }
        });

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            data: driver
        });
    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching driver',
            error: error.message
        });
    }
};

// Create driver (assuming user already exists or created separately)
exports.createDriver = async (req, res) => {
    try {
        const {
            userId,
            restaurantId,
            isPlatformDriver
        } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const driver = await prisma.deliveryDriver.create({
            data: {
                userId,
                restaurantId: restaurantId || null,
                isPlatformDriver: isPlatformDriver !== undefined ? isPlatformDriver : true,
                isOnline: false,
                rating: 0
            }
        });

        res.status(201).json({
            success: true,
            message: 'Driver created successfully',
            data: driver
        });
    } catch (error) {
        console.error('Create driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating driver',
            error: error.message
        });
    }
};

// Update driver status
exports.updateDriverStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isOnline } = req.body;

        const updatedDriver = await prisma.deliveryDriver.update({
            where: { id },
            data: { isOnline }
        });

        res.json({
            success: true,
            message: `Driver is now ${isOnline ? 'ONLINE' : 'OFFLINE'}`,
            data: updatedDriver
        });
    } catch (error) {
        console.error('Update driver status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating driver status',
            error: error.message
        });
    }
};

// Delete driver
exports.deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.deliveryDriver.delete({ where: { id } });

        res.json({
            success: true,
            message: 'Driver profile deleted successfully'
        });
    } catch (error) {
        console.error('Delete driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting driver',
            error: error.message
        });
    }
};
