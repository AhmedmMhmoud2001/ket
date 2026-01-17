const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests using JWT
 */
exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            roles: decoded.roles || []
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// Alias for backward compatibility
exports.protect = exports.authenticate;

/**
 * Middleware to authorize requests based on user roles
 * @param {...string} allowedRoles - List of roles permitted to access the route
 */
exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const userRoles = req.user.roles || [];

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
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action.'
            });
        }

        next();
    };
};
