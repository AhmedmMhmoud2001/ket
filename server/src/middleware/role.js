const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // Check if user exists (should be set by auth middleware)
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Get user roles (can be array or single role for backward compatibility)
            const userRoles = req.user.roles || (req.user.role ? [req.user.role] : []);
            
            // Normalize roles to uppercase for comparison
            const normalizedUserRoles = Array.isArray(userRoles)
                ? userRoles.map(role => String(role).toUpperCase())
                : [];
            
            // Normalize allowed roles to uppercase
            const normalizedAllowedRoles = allowedRoles.map(role => String(role).toUpperCase());
            
            // Check if user has at least one of the allowed roles
            const hasPermission = normalizedAllowedRoles.some(role =>
                normalizedUserRoles.includes(role)
            );

            if (!hasPermission) {
                console.log('Role check failed:', {
                    userRoles: normalizedUserRoles,
                    allowedRoles: normalizedAllowedRoles,
                    reqUser: req.user
                });
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient permissions.',
                    debug: process.env.NODE_ENV === 'development' ? {
                        userRoles: normalizedUserRoles,
                        requiredRoles: normalizedAllowedRoles
                    } : undefined
                });
            }

            next();
        } catch (error) {
            console.error('Role middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking permissions',
                error: error.message
            });
        }
    };
};

module.exports = roleMiddleware;
