const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all restaurants
router.get('/', authorize('ADMIN', 'RESTAURANT_OWNER'), restaurantController.getAllRestaurants);

// Get restaurant by ID
router.get('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), restaurantController.getRestaurantById);

// Create restaurant
router.post('/', authorize('ADMIN'), restaurantController.createRestaurant);

// Update restaurant
router.put('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), restaurantController.updateRestaurant);

// Delete restaurant
router.delete('/:id', authorize('ADMIN'), restaurantController.deleteRestaurant);

module.exports = router;
