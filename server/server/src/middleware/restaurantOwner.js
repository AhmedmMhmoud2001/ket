const prisma = require('../utils/prisma');

/**
 * Middleware to verify that the authenticated user is the manager of a restaurant
 * This middleware should be used after protect middleware
 * It checks if the user is a RESTAURANT_MANAGER and owns/manages the restaurant
 */
exports.verifyRestaurantOwner = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Super admin can access any restaurant
        if (userRole === 'SUPER_ADMIN') {
            return next();
        }

        // Check if user is a restaurant manager
        if (userRole !== 'RESTAURANT_MANAGER') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only restaurant managers can access this resource.'
            });
        }

        // Get restaurant ID from params or body
        const restaurantId = req.params.restaurantId || req.params.id || req.body.restaurantId;

        if (!restaurantId) {
            // If no restaurant ID is provided, we'll allow access but set req.restaurantId to null
            // The controller should handle getting the user's restaurant
            req.restaurantId = null;
            return next();
        }

        // Verify that the user is the manager of this restaurant
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { id: true, managerId: true }
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        if (restaurant.managerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You are not the manager of this restaurant.'
            });
        }

        // Add restaurant ID to request for use in controllers
        req.restaurantId = restaurant.id;
        req.restaurant = restaurant;

        next();
    } catch (error) {
        console.error('Restaurant owner verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying restaurant ownership',
            error: error.message
        });
    }
};

/**
 * Middleware to get the user's restaurant automatically
 * This should be used when the restaurant ID is not in the URL/body
 */
exports.getUserRestaurant = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Super admin can access any restaurant, but we need restaurantId in params
        if (userRole === 'SUPER_ADMIN') {
            return next();
        }

        // For restaurant managers, get their restaurant
        if (userRole === 'RESTAURANT_MANAGER') {
            const restaurant = await prisma.restaurant.findFirst({
                where: { managerId: userId },
                select: { id: true, name: true, managerId: true }
            });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'No restaurant found for this user. Please contact support.'
                });
            }

            req.restaurantId = restaurant.id;
            req.restaurant = restaurant;
        }

        next();
    } catch (error) {
        console.error('Get user restaurant error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error getting user restaurant',
            error: error.message
        });
    }
};

