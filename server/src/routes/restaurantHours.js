const express = require('express');
const router = express.Router();
const restaurantHoursController = require('../controllers/restaurantHoursController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get restaurant hours
router.get('/restaurant/:restaurantId', restaurantHoursController.getRestaurantHours);

// Check if restaurant is open
router.get('/restaurant/:restaurantId/is-open', restaurantHoursController.isRestaurantOpen);

// Update restaurant hours
router.put('/restaurant/:restaurantId', authorize('ADMIN', 'RESTAURANT_OWNER'), restaurantHoursController.updateRestaurantHours);

// Get all restaurants hours (admin)
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), restaurantHoursController.getAllRestaurantsHours);

module.exports = router;

