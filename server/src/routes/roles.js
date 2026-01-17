const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect } = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// All routes require authentication and SUPER_ADMIN role
router.use(protect);
router.use(roleMiddleware('SUPER_ADMIN'));

// Get all available permissions
router.get('/permissions', roleController.getAvailablePermissions);

// Get all roles
router.get('/', roleController.getAllRoles);

// Get single role
router.get('/:id', roleController.getRoleById);

// Get users by role
router.get('/:role/users', roleController.getUsersByRole);

module.exports = router;

