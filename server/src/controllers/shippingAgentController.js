const prisma = require('../utils/prisma');

// Get all shipping agents
exports.getAllAgents = async (req, res) => {
    try {
        const { search, isActive, page = 1, limit = 10 } = req.query;
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

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const [agents, total] = await Promise.all([
            prisma.shippingAgent.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, phone: true, email: true } }
                },
                orderBy: { rating: 'desc' },
                skip,
                take
            }),
            prisma.shippingAgent.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                agents,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get shipping agents error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Get agent by ID
exports.getAgentById = async (req, res) => {
    try {
        const { id } = req.params;

        const agent = await prisma.shippingAgent.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, phone: true, email: true } },
                orders: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!agent) {
            return res.status(404).json({ success: false, message: 'Agent not found' });
        }

        res.json({ success: true, data: agent });
    } catch (error) {
        console.error('Get agent error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Create agent profile
exports.createAgent = async (req, res) => {
    try {
        const { userId, vehicleType } = req.body;

        if (!userId || !vehicleType) {
            return res.status(400).json({ success: false, message: 'userId and vehicleType are required' });
        }

        const agent = await prisma.shippingAgent.create({
            data: {
                userId,
                vehicleType,
                isActive: true,
                rating: 0
            }
        });

        res.status(201).json({ success: true, message: 'Shipping agent profile created', data: agent });
    } catch (error) {
        console.error('Create agent error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Update agent
exports.updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const { vehicleType, isActive, rating } = req.body;

        const updateData = {};
        if (vehicleType) updateData.vehicleType = vehicleType;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (rating !== undefined) updateData.rating = parseFloat(rating);

        const agent = await prisma.shippingAgent.update({
            where: { id },
            data: updateData
        });

        res.json({ success: true, message: 'Agent updated successfully', data: agent });
    } catch (error) {
        console.error('Update agent error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Delete agent
exports.deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.shippingAgent.delete({ where: { id } });
        res.json({ success: true, message: 'Shipping agent profile deleted' });
    } catch (error) {
        console.error('Delete agent error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
