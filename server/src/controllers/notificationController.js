const prisma = require('../utils/prisma');

// Get all notifications for the current user
exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, type, isRead } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = { userId };
        if (type) {
            where.type = type;
        }
        if (isRead !== undefined) {
            where.isRead = isRead === 'true';
        }

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                include: {
                    order: {
                        select: {
                            id: true,
                            status: true,
                            totalPrice: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.notification.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get my notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await prisma.notification.findFirst({
            where: {
                id,
                userId
            },
            include: {
                order: {
                    select: {
                        id: true,
                        status: true,
                        totalPrice: true,
                        restaurant: {
                            select: {
                                id: true,
                                nameEn: true,
                                nameAr: true
                            }
                        }
                    }
                }
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Get notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notification',
            error: error.message
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await prisma.notification.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: updated
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification',
            error: error.message
        });
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        res.json({
            success: true,
            message: 'All notifications marked as read',
            data: {
                count: result.count
            }
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notifications',
            error: error.message
        });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const notification = await prisma.notification.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await prisma.notification.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message
        });
    }
};

// Create notification (admin/system)
exports.createNotification = async (req, res) => {
    try {
        const { userId, type, title, message, data, orderId } = req.body;

        if (!userId || !type || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'userId, type, title, and message are required'
            });
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data: data || null,
                orderId: orderId || null,
                isRead: false
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                order: {
                    select: {
                        id: true,
                        status: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating notification',
            error: error.message
        });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const count = await prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        });

        res.json({
            success: true,
            data: {
                unreadCount: count
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
