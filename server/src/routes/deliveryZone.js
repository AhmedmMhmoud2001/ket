const express = require('express');
const router = express.Router();
const deliveryZoneController = require('../controllers/deliveryZoneController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get delivery zones for restaurant
router.get('/restaurant/:restaurantId', deliveryZoneController.getRestaurantDeliveryZones);

// Check if address is in delivery zone
router.get('/restaurant/:restaurantId/check', deliveryZoneController.checkDeliveryZone);

// Create delivery zone
router.post('/', authorize('ADMIN', 'RESTAURANT_OWNER'), deliveryZoneController.createDeliveryZone);

// Update delivery zone
router.put('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), deliveryZoneController.updateDeliveryZone);

// Delete delivery zone
router.delete('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), deliveryZoneController.deleteDeliveryZone);

module.exports = router;

