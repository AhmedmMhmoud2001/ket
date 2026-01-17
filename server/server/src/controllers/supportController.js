const prisma = require('../utils/prisma');

// Get all tickets
exports.getAllTickets = async (req, res) => {
    try {
        const { status, priority, userId, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (userId) where.userId = userId;

        const [tickets, total] = await Promise.all([
            prisma.supportTicket.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.supportTicket.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                tickets,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Create ticket
exports.createTicket = async (req, res) => {
    try {
        const { userId, subject, description, priority } = req.body;

        if (!userId || !subject || !description) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                userId,
                subject,
                description,
                status: 'OPEN',
                priority: priority || 'MEDIUM'
            }
        });

        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Get ticket details
exports.getTicketById = async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                replies: {
                    include: {
                        user: { select: { id: true, name: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.json({ success: true, data: ticket });
    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Add reply to ticket
exports.addReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ success: false, message: 'userId and message are required' });
        }

        const reply = await prisma.ticketReply.create({
            data: {
                ticketId: id,
                userId,
                message
            }
        });

        // Update ticket status to IN_PROGRESS if it was OPEN
        await prisma.supportTicket.updateMany({
            where: { id, status: 'OPEN' },
            data: { status: 'IN_PROGRESS' }
        });

        res.status(201).json({ success: true, data: reply });
    } catch (error) {
        console.error('Add reply error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const ticket = await prisma.supportTicket.update({
            where: { id },
            data: { status }
        });

        res.json({ success: true, message: 'Ticket status updated', data: ticket });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
