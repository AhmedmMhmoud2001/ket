const express = require('express');
const router = express.Router();
const driverLocationController = require('../controllers/driverLocationController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Update driver location
router.put('/driver/:driverId', authorize('DELIVERY_DRIVER', 'ADMIN'), driverLocationController.updateDriverLocation);

// Get driver location
router.get('/driver/:driverId', driverLocationController.getDriverLocation);

// Get all drivers locations (admin/restaurant owner)
router.get('/', authorize('ADMIN', 'RESTAURANT_OWNER', 'SUPER_ADMIN'), driverLocationController.getAllDriversLocations);

module.exports = router;


