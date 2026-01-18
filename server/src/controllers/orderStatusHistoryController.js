const prisma = require('../utils/prisma');

// Get order status history
exports.getOrderStatusHistory = async (req, res) => {
    try {
        const { orderId } = req.params;

        const history = await prisma.orderStatusHistory.findMany({
            where: { orderId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Get order status history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order status history',
            error: error.message
        });
    }
};

// Create order status history entry
exports.createStatusHistory = async (req, res) => {
    try {
        const { orderId, status, notes, expectedAt, userId } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and status are required'
            });
        }

        // Verify order exists
        const order = await prisma.foodorder.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const historyEntry = await prisma.orderStatusHistory.create({
            data: {
                orderId,
                status,
                userId: userId || req.user?.id || null,
                notes: notes || null,
                expectedAt: expectedAt ? new Date(expectedAt) : null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Status history entry created successfully',
            data: historyEntry
        });
    } catch (error) {
        console.error('Create status history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating status history entry',
            error: error.message
        });
    }
};

// Get all status histories (admin)
exports.getAllStatusHistories = async (req, res) => {
    try {
        const { orderId, status, page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};
        if (orderId) where.orderId = orderId;
        if (status) where.status = status;

        const [histories, total] = await Promise.all([
            prisma.orderStatusHistory.findMany({
                where,
                include: {
                    order: {
                        select: {
                            id: true,
                            totalPrice: true,
                            status: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.orderStatusHistory.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                histories,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get all status histories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching status histories',
            error: error.message
        });
    }
};

