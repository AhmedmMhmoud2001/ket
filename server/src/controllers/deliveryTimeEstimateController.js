const prisma = require('../utils/prisma');

// Get delivery time estimate for restaurant
exports.getDeliveryTimeEstimate = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { lat, lng, distance } = req.query; // distance in km

        let estimate = await prisma.deliveryTimeEstimate.findUnique({
            where: { restaurantId }
        });

        // If no estimate exists, use default values
        if (!estimate) {
            estimate = {
                baseTime: 30,
                perKmTime: 5,
                busyTimeAdd: 10
            };
        }

        // Calculate estimated time
        let estimatedMinutes = estimate.baseTime || 30;
        
        if (distance && estimate.perKmTime) {
            estimatedMinutes += Math.ceil(parseFloat(distance) * estimate.perKmTime);
        }

        // Check if restaurant is busy (simplified: check if it's during peak hours)
        // You can enhance this by checking actual order volume
        const now = new Date();
        const hour = now.getHours();
        const isBusy = (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21); // Lunch and dinner hours
        
        if (isBusy && estimate.busyTimeAdd) {
            estimatedMinutes += estimate.busyTimeAdd;
        }

        res.json({
            success: true,
            data: {
                estimatedMinutes,
                estimatedRange: {
                    min: Math.max(estimatedMinutes - 5, 15),
                    max: estimatedMinutes + 10
                },
                baseTime: estimate.baseTime || 30,
                perKmTime: estimate.perKmTime || 5,
                busyTimeAdd: isBusy ? (estimate.busyTimeAdd || 10) : 0
            }
        });
    } catch (error) {
        console.error('Get delivery time estimate error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating delivery time',
            error: error.message
        });
    }
};

// Create or update delivery time estimate
exports.updateDeliveryTimeEstimate = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { baseTime, perKmTime, busyTimeAdd } = req.body;

        if (!baseTime) {
            return res.status(400).json({
                success: false,
                message: 'Base time is required'
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

        const estimate = await prisma.deliveryTimeEstimate.upsert({
            where: { restaurantId },
            update: {
                baseTime: parseInt(baseTime),
                perKmTime: perKmTime ? parseInt(perKmTime) : null,
                busyTimeAdd: busyTimeAdd ? parseInt(busyTimeAdd) : null
            },
            create: {
                restaurantId,
                baseTime: parseInt(baseTime),
                perKmTime: perKmTime ? parseInt(perKmTime) : null,
                busyTimeAdd: busyTimeAdd ? parseInt(busyTimeAdd) : null
            }
        });

        res.json({
            success: true,
            message: 'Delivery time estimate updated successfully',
            data: estimate
        });
    } catch (error) {
        console.error('Update delivery time estimate error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating delivery time estimate',
            error: error.message
        });
    }
};

// Get all delivery time estimates (admin)
exports.getAllDeliveryTimeEstimates = async (req, res) => {
    try {
        const { restaurantId } = req.query;

        const where = restaurantId ? { restaurantId } : {};

        const estimates = await prisma.deliveryTimeEstimate.findMany({
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
            orderBy: { restaurantId: 'asc' }
        });

        res.json({
            success: true,
            data: estimates
        });
    } catch (error) {
        console.error('Get all delivery time estimates error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching delivery time estimates',
            error: error.message
        });
    }
};


