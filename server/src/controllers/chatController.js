const prisma = require('../utils/prisma');

// Get chat messages for an order
exports.getChatMessages = async (req, res) => {
    try {
        const { order_id, courier_order_id } = req.query;
        const userId = req.user.id;

        if (!order_id && !courier_order_id) {
            return res.status(400).json({
                success: false,
                message: 'Please provide order_id or courier_order_id'
            });
        }

        const where = {};
        if (order_id) {
            where.orderId = order_id;
        }
        if (courier_order_id) {
            where.courierOrderId = courier_order_id;
        }

        // Verify user has access to this order
        if (order_id) {
            const order = await prisma.order.findUnique({
                where: { id: order_id },
                select: { userId: true, driverId: true }
            });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Check if user is the customer or driver
            const driver = await prisma.driver.findUnique({
                where: { id: order.driverId || '' },
                select: { userId: true }
            });

            if (order.userId !== userId && driver?.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        if (courier_order_id) {
            const courierOrder = await prisma.courierOrder.findUnique({
                where: { id: courier_order_id },
                select: { userId: true, driverId: true }
            });

            if (!courierOrder) {
                return res.status(404).json({
                    success: false,
                    message: 'Courier order not found'
                });
            }

            // Check if user is the customer or driver
            const driver = await prisma.driver.findUnique({
                where: { id: courierOrder.driverId || '' },
                select: { userId: true }
            });

            if (courierOrder.userId !== userId && driver?.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        const messages = await prisma.chatMessage.findMany({
            where,
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json({
            success: true,
            data: {
                messages
            }
        });
    } catch (error) {
        console.error('Get chat messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching chat messages',
            error: error.message
        });
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { order_id, courier_order_id } = req.body;
        const userId = req.user.id;

        if (!order_id && !courier_order_id) {
            return res.status(400).json({
                success: false,
                message: 'Please provide order_id or courier_order_id'
            });
        }

        const where = {
            receiverId: userId,
            isRead: false
        };

        if (order_id) {
            where.orderId = order_id;
        }
        if (courier_order_id) {
            where.courierOrderId = courier_order_id;
        }

        await prisma.chatMessage.updateMany({
            where,
            data: {
                isRead: true
            }
        });

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking messages as read',
            error: error.message
        });
    }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await prisma.chatMessage.count({
            where: {
                receiverId: userId,
                isRead: false
            }
        });

        res.json({
            success: true,
            data: {
                unread_count: count
            }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unread count',
            error: error.message
        });
    }
};

