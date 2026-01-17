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
        // Get all roles from database
        const dbRoles = await prisma.role.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { id: 'asc' }
        });

        // Create role definitions with permissions
        const roleDefinitions = {
            'ADMIN': {
                name: 'Admin',
                description: 'Full system access with all permissions',
                permissions: AVAILABLE_PERMISSIONS,
                isSystem: true
            },
            'RESTAURANT_OWNER': {
                name: 'Restaurant Owner',
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
            'DRIVER': {
                name: 'Driver',
                description: 'Delivery driver',
                permissions: {
                    orders: ['view', 'manage_status']
                },
                isSystem: true
            },
            'CUSTOMER': {
                name: 'Customer',
                description: 'Regular customer with basic access',
                permissions: {},
                isSystem: true
            }
        };

        // Map database roles to our definitions
        const roles = dbRoles.map(dbRole => {
            const roleName = dbRole.name.toUpperCase();
            const definition = roleDefinitions[roleName] || {
                name: dbRole.name,
                description: `${dbRole.name} role`,
                permissions: {},
                isSystem: false
            };

            return {
                id: dbRole.id.toString(),
                name: dbRole.name,
                description: definition.description,
                permissions: definition.permissions,
                isSystem: definition.isSystem,
                userCount: dbRole._count?.users || 0
            };
        });

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

        // Find role in database - try by ID first, then by name
        const roleId = parseInt(id);
        const roleRecord = await prisma.role.findFirst({
            where: roleId ? { id: roleId } : { name: { equals: id, mode: 'insensitive' } },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });

        if (!roleRecord) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        // Get role definition
        const roleDefinitions = {
            'ADMIN': {
                name: 'Admin',
                description: 'Full system access with all permissions',
                permissions: AVAILABLE_PERMISSIONS,
                isSystem: true
            },
            'RESTAURANT_OWNER': {
                name: 'Restaurant Owner',
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
            'DRIVER': {
                name: 'Driver',
                description: 'Delivery driver',
                permissions: {
                    orders: ['view', 'manage_status']
                },
                isSystem: true
            },
            'CUSTOMER': {
                name: 'Customer',
                description: 'Regular customer with basic access',
                permissions: {},
                isSystem: true
            }
        };

        const roleName = roleRecord.name.toUpperCase();
        const definition = roleDefinitions[roleName] || {
            name: roleRecord.name,
            description: `${roleRecord.name} role`,
            permissions: {},
            isSystem: false
        };

        const role = {
            id: roleRecord.id.toString(),
            name: roleRecord.name,
            description: definition.description,
            permissions: definition.permissions,
            isSystem: definition.isSystem,
            userCount: roleRecord._count?.users || 0
        };

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

        // Find role by ID or name
        const roleRecord = await prisma.role.findFirst({
            where: {
                OR: [
                    { id: parseInt(role) || -1 },
                    { name: role.toUpperCase() }
                ]
            }
        });

        if (!roleRecord) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: {
                    roles: {
                        some: {
                            roleId: roleRecord.id
                        }
                    }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    isActive: true,
                    createdAt: true,
                    roles: {
                        include: {
                            role: true
                        }
                    }
                },
                skip,
                take,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({
                where: {
                    roles: {
                        some: {
                            roleId: roleRecord.id
                        }
                    }
                }
            })
        ]);

        // Format users
        const formattedUsers = users.map(user => ({
            ...user,
            full_name: user.name
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

