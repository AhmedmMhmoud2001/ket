const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { protect } = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// All routes require authentication and ADMIN role
router.use(protect);
router.use(roleMiddleware('ADMIN'));

// Get all available permissions
router.get('/permissions', roleController.getAvailablePermissions);

// Get all roles
router.get('/', roleController.getAllRoles);

// Get single role
router.get('/:id', roleController.getRoleById);

// Get users by role
router.get('/:role/users', roleController.getUsersByRole);

module.exports = router;

