const prisma = require('../utils/prisma');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const { search, roleId, isActive, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } }
            ];
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        if (roleId) {
            where.roles = {
                some: { roleId: parseInt(roleId) }
            };
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                include: {
                    roles: { include: { role: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.user.count({ where })
        ]);

        const formattedUsers = users.map(user => {
            const { password: _, ...userWithoutPassword } = user;
            return {
                ...userWithoutPassword,
                roleNames: user.roles.map(ur => ur.role.name)
            };
        });

        res.json({
            success: true,
            data: {
                users: formattedUsers,
                pagination: {
                    page: parseInt(page),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                roles: { include: { role: true } },
                addresses: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { password: _, ...userWithoutPassword } = user;
        const formattedUser = {
            ...userWithoutPassword,
            roleNames: user.roles.map(ur => ur.role.name)
        };

        res.json({
            success: true,
            data: formattedUser
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, isActive } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (isActive !== undefined) updateData.isActive = isActive;

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                roles: { include: { role: true } }
            }
        });

        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: 'User updated successfully',
            data: userWithoutPassword
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({ success: false, message: 'isActive field is required' });
        }

        await prisma.user.update({
            where: { id },
            data: { isActive: !!isActive }
        });

        res.json({ success: true, message: `User status updated to ${isActive ? 'active' : 'inactive'}` });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
    try {
        const { id } = req.params;
        const orders = await prisma.foodOrder.findMany({
            where: { userId: id },
            include: {
                restaurant: { select: { nameEn: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
