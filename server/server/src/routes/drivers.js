const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all drivers
router.get('/', authorize('ADMIN', 'RESTAURANT_OWNER'), driverController.getAllDrivers);

// Get single driver
router.get('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), driverController.getDriverById);

// Create driver profile
router.post('/', authorize('ADMIN'), driverController.createDriver);

// Update driver status
router.patch('/:id/status', authorize('ADMIN', 'RESTAURANT_OWNER'), driverController.updateDriverStatus);

// Delete driver profile
router.delete('/:id', authorize('ADMIN'), driverController.deleteDriver);

module.exports = router;
