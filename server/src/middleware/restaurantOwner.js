const prisma = require('../utils/prisma');

/**
 * Middleware to verify that the authenticated user is the manager of a restaurant
 * This middleware should be used after protect middleware
 * It checks if the user is a RESTAURANT_MANAGER and owns/manages the restaurant
 */
exports.verifyRestaurantOwner = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userRoles = req.user.roles || [];

        // Super admin can access any restaurant
        if (userRoles.includes('ADMIN')) {
            return next();
        }

        // Check if user is a restaurant owner/manager
        const isManager = userRoles.includes('RESTAURANT_OWNER') || userRoles.includes('RESTAURANT_ADMIN');
        if (!isManager) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only restaurant owners or admins can access this resource.'
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
        const userRoles = req.user.roles || [];

        // Admin can access any restaurant, but usually needs restaurantId in params
        if (userRoles.includes('ADMIN')) {
            return next();
        }

        // For restaurant owners/admins, get their restaurant
        if (userRoles.includes('RESTAURANT_OWNER') || userRoles.includes('RESTAURANT_ADMIN')) {
            const restaurant = await prisma.restaurant.findFirst({
                where: { ownerId: userId }, // Changed from managerId to ownerId to match schema
                select: { id: true, nameAr: true, nameEn: true, ownerId: true }
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

