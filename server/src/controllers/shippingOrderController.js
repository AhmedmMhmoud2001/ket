const prisma = require('../utils/prisma');

// Get all shipping orders
exports.getAllOrders = async (req, res) => {
    try {
        const { status, userId, agentId, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (status) where.status = status;
        if (userId) where.userId = userId;
        if (agentId) where.agentId = agentId;

        const [orders, total] = await Promise.all([
            prisma.shippingOrder.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, phone: true } },
                    agent: {
                        include: {
                            user: { select: { id: true, name: true, phone: true } }
                        }
                    },
                    images: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.shippingOrder.count({ where })
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
        console.error('Get shipping orders error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.shippingOrder.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, phone: true, email: true } },
                agent: {
                    include: {
                        user: { select: { id: true, name: true, phone: true } }
                    }
                },
                images: true
            }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Create shipping order
exports.createOrder = async (req, res) => {
    try {
        const {
            userId,
            pickupLat,
            pickupLng,
            deliveryLat,
            deliveryLng,
            expectedCost,
            images // Array of image URLs
        } = req.body;

        if (!userId || !pickupLat || !pickupLng || !deliveryLat || !deliveryLng) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const order = await prisma.shippingOrder.create({
            data: {
                userId,
                pickupLat: parseFloat(pickupLat),
                pickupLng: parseFloat(pickupLng),
                deliveryLat: parseFloat(deliveryLat),
                deliveryLng: parseFloat(deliveryLng),
                status: 'PENDING',
                expectedCost: expectedCost ? parseFloat(expectedCost) : 0,
                images: images && Array.isArray(images) ? {
                    create: images.map(url => ({ imageUrl: url }))
                } : undefined
            },
            include: {
                images: true
            }
        });

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error('Create shipping order error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Update order status/agent
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, agentId, finalCost } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (agentId) updateData.agentId = agentId;
        if (finalCost !== undefined) updateData.finalCost = parseFloat(finalCost);

        const order = await prisma.shippingOrder.update({
            where: { id },
            data: updateData
        });

        res.json({ success: true, message: 'Order updated successfully', data: order });
    } catch (error) {
        console.error('Update shipping order error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.shippingOrder.delete({ where: { id } });
        res.json({ success: true, message: 'Shipping order deleted' });
    } catch (error) {
        console.error('Delete shipping order error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
