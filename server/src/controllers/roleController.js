const prisma = require('../utils/prisma');

// Define available permissions by module
const AVAILABLE_PERMISSIONS = {
    users: ['view', 'create', 'edit', 'delete', 'manage_roles'],
    restaurants: ['view', 'create', 'edit', 'delete', 'approve'],
    categories: ['view', 'create', 'edit', 'delete'],
    subcategories: ['view', 'create', 'edit', 'delete'],
    products: ['view', 'create', 'edit', 'delete'],
    orders: ['view', 'create', 'edit', 'delete', 'manage_status'],
    drivers: ['view', 'create', 'edit', 'delete', 'assign'],
    offers: ['view', 'create', 'edit', 'delete'],
    coupons: ['view', 'create', 'edit', 'delete'],
    reviews: ['view', 'edit', 'delete', 'respond'],
    support: ['view', 'respond', 'close'],
    settings: ['view', 'edit'],
    logs: ['view'],
    reports: ['view', 'export']
};

// Get all available permissions
exports.getAvailablePermissions = async (req, res) => {
    try {
        res.json({
            success: true,
            data: AVAILABLE_PERMISSIONS
        });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching permissions',
            error: error.message
        });
    }
};

// Get all roles with their permissions
exports.getAllRoles = async (req, res) => {
    try {
        // Since roles are enum in Prisma, we'll return a hardcoded list with descriptions
        // In a real-world scenario, you might want to create a separate Role table
        const roles = [
            {
                id: 'SUPER_ADMIN',
                name: 'Super Admin',
                description: 'Full system access with all permissions',
                permissions: AVAILABLE_PERMISSIONS,
                isSystem: true, // Cannot be deleted
                userCount: await prisma.user.count({ where: { role: 'SUPER_ADMIN' } })
            },
            {
                id: 'RESTAURANT_MANAGER',
                name: 'Restaurant Manager',
                description: 'Manage restaurant menus, orders, and products',
                permissions: {
                    restaurants: ['view', 'edit'],
                    categories: ['view'],
                    subcategories: ['view'],
                    products: ['view', 'create', 'edit', 'delete'],
                    orders: ['view', 'manage_status'],
                    reviews: ['view', 'respond'],
                    reports: ['view']
                },
                isSystem: true,
                userCount: await prisma.user.count({ where: { role: 'RESTAURANT_MANAGER' } })
            },
            {
                id: 'SUPPORT_AGENT',
                name: 'Support Agent',
                description: 'Handle customer support and inquiries',
                permissions: {
                    users: ['view'],
                    orders: ['view'],
                    support: ['view', 'respond', 'close'],
                    reviews: ['view']
                },
                isSystem: true,
                userCount: await prisma.user.count({ where: { role: 'SUPPORT_AGENT' } })
            },
            {
                id: 'ANALYST',
                name: 'Analyst',
                description: 'View reports and analytics',
                permissions: {
                    users: ['view'],
                    restaurants: ['view'],
                    products: ['view'],
                    orders: ['view'],
                    reports: ['view', 'export'],
                    logs: ['view']
                },
                isSystem: true,
                userCount: await prisma.user.count({ where: { role: 'ANALYST' } })
            },
            {
                id: 'CUSTOMER',
                name: 'Customer',
                description: 'Regular customer with basic access',
                permissions: {},
                isSystem: true,
                userCount: await prisma.user.count({ where: { role: 'CUSTOMER' } })
            },
            {
                id: 'DRIVER',
                name: 'Driver',
                description: 'Delivery driver',
                permissions: {
                    orders: ['view', 'manage_status']
                },
                isSystem: true,
                userCount: await prisma.user.count({ where: { role: 'DRIVER' } })
            }
        ];

        res.json({
            success: true,
            data: { roles }
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching roles',
            error: error.message
        });
    }
};

// Get single role details
exports.getRoleById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the role definition
        const roleDefinitions = {
            'SUPER_ADMIN': {
                id: 'SUPER_ADMIN',
                name: 'Super Admin',
                description: 'Full system access with all permissions',
                permissions: AVAILABLE_PERMISSIONS,
                isSystem: true
            },
            'RESTAURANT_MANAGER': {
                id: 'RESTAURANT_MANAGER',
                name: 'Restaurant Manager',
                description: 'Manage restaurant menus, orders, and products',
                permissions: {
                    restaurants: ['view', 'edit'],
                    categories: ['view'],
                    subcategories: ['view'],
                    products: ['view', 'create', 'edit', 'delete'],
                    orders: ['view', 'manage_status'],
                    reviews: ['view', 'respond'],
                    reports: ['view']
                },
                isSystem: true
            },
            'SUPPORT_AGENT': {
                id: 'SUPPORT_AGENT',
                name: 'Support Agent',
                description: 'Handle customer support and inquiries',
                permissions: {
                    users: ['view'],
                    orders: ['view'],
                    support: ['view', 'respond', 'close'],
                    reviews: ['view']
                },
                isSystem: true
            },
            'ANALYST': {
                id: 'ANALYST',
                name: 'Analyst',
                description: 'View reports and analytics',
                permissions: {
                    users: ['view'],
                    restaurants: ['view'],
                    products: ['view'],
                    orders: ['view'],
                    reports: ['view', 'export'],
                    logs: ['view']
                },
                isSystem: true
            },
            'CUSTOMER': {
                id: 'CUSTOMER',
                name: 'Customer',
                description: 'Regular customer with basic access',
                permissions: {},
                isSystem: true
            },
            'DRIVER': {
                id: 'DRIVER',
                name: 'Driver',
                description: 'Delivery driver',
                permissions: {
                    orders: ['view', 'manage_status']
                },
                isSystem: true
            }
        };

        const role = roleDefinitions[id];

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        // Get user count for this role
        const userCount = await prisma.user.count({ where: { role: id } });
        role.userCount = userCount;

        res.json({
            success: true,
            data: role
        });
    } catch (error) {
        console.error('Error fetching role:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching role',
            error: error.message
        });
    }
};

// Get users by role
exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;
        const take = parseInt(limit);

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: { role: role },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    status: true,
                    createdAt: true
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where: { role: role } })
        ]);

        // Format users with full_name
        const formattedUsers = users.map(user => ({
            ...user,
            full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }));

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
        console.error('Error fetching users by role:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

