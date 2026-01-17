const prisma = require('../utils/prisma');

// Update driver location
exports.updateDriverLocation = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { lat, lng, heading, speed } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // Use driverId from params or from authenticated user
        const actualDriverId = driverId || req.user?.id;

        if (!actualDriverId) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID is required'
            });
        }

        // Verify driver exists
        const driver = await prisma.deliveryDriver.findFirst({
            where: {
                OR: [
                    { userId: actualDriverId },
                    { id: actualDriverId }
                ]
            }
        });

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Use driver.userId for location
        const locationDriverId = driver.userId;

        // Upsert location (update if exists, create if not)
        const location = await prisma.driverLocation.upsert({
            where: { driverId: locationDriverId },
            update: {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                heading: heading !== undefined ? parseFloat(heading) : null,
                speed: speed !== undefined ? parseFloat(speed) : null
            },
            create: {
                driverId: locationDriverId,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                heading: heading !== undefined ? parseFloat(heading) : null,
                speed: speed !== undefined ? parseFloat(speed) : null
            }
        });

        res.json({
            success: true,
            message: 'Driver location updated successfully',
            data: location
        });
    } catch (error) {
        console.error('Update driver location error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating driver location',
            error: error.message
        });
    }
};

// Get driver location
exports.getDriverLocation = async (req, res) => {
    try {
        const { driverId } = req.params;

        const location = await prisma.driverLocation.findUnique({
            where: { driverId },
            include: {
                driver: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone: true
                            }
                        }
                    }
                }
            }
        });

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Driver location not found'
            });
        }

        res.json({
            success: true,
            data: location
        });
    } catch (error) {
        console.error('Get driver location error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching driver location',
            error: error.message
        });
    }
};

// Get all active drivers locations (for admin/restaurant)
exports.getAllDriversLocations = async (req, res) => {
    try {
        const { restaurantId, isOnline } = req.query;

        const driverWhere = {};
        if (isOnline !== undefined) {
            driverWhere.isOnline = isOnline === 'true' || isOnline === true;
        }
        if (restaurantId) {
            driverWhere.restaurantId = restaurantId;
        }

        const where = Object.keys(driverWhere).length > 0 ? {
            driver: driverWhere
        } : undefined;

        const locations = await prisma.driverLocation.findMany({
            where,
            include: {
                driver: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone: true
                            }
                        },
                        restaurant: {
                            select: {
                                id: true,
                                nameEn: true,
                                nameAr: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        res.json({
            success: true,
            data: locations
        });
    } catch (error) {
        console.error('Get all drivers locations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching drivers locations',
            error: error.message
        });
    }
};

