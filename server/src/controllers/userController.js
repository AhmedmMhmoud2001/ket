const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

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

// Create user
exports.createUser = async (req, res) => {
    try {
        const { name, email, phone, password, roleIds, isActive = true, avatar } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, phone, and password'
            });
        }

        // Check availability
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { phone }] }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone already in use'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                isActive,
                avatar,
                roles: roleIds && Array.isArray(roleIds) ? {
                    create: roleIds.map(roleId => ({
                        roleId: parseInt(roleId)
                    }))
                } : undefined
            },
            include: {
                roles: { include: { role: true } }
            }
        });

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            success: true,
            data: userWithoutPassword
        });
    } catch (error) {
        console.error('Create user error:', error);
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
        const { name, email, phone, isActive, roleIds, password, avatar } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (roleIds && Array.isArray(roleIds)) {
            // Remove existing roles
            await prisma.userRole.deleteMany({ where: { userId: id } });
            // Add new roles
            updateData.roles = {
                create: roleIds.map(roleId => ({
                    roleId: parseInt(roleId)
                }))
            };
        }

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
