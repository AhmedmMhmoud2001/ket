const prisma = require('../utils/prisma');

// Get all food orders
exports.getAllOrders = async (req, res) => {
    try {
        const { status, restaurantId, userId, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (status) {
            where.status = status;
        }

        if (restaurantId) {
            where.restaurantId = restaurantId;
        }

        if (userId) {
            where.userId = userId;
        }

        const [orders, total] = await Promise.all([
            prisma.foodOrder.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, phone: true } },
                    restaurant: { select: { id: true, nameEn: true, nameAr: true } },
                    driver: {
                        include: {
                            user: { select: { id: true, name: true, phone: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.foodOrder.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.foodOrder.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, phone: true, email: true } },
                restaurant: true,
                driver: {
                    include: {
                        user: { select: { id: true, name: true, phone: true } }
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const updatedOrder = await prisma.foodOrder.update({
            where: { id },
            data: { status }
        });

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// Assign driver to order
exports.assignDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { driverId } = req.body;

        if (!driverId) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID is required'
            });
        }

        const updatedOrder = await prisma.foodOrder.update({
            where: { id },
            data: { driverId }
        });

        res.json({
            success: true,
            message: 'Driver assigned successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Assign driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Error assigning driver',
            error: error.message
        });
    }
};
