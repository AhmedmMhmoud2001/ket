const express = require('express');
const router = express.Router();
const deliveryTimeEstimateController = require('../controllers/deliveryTimeEstimateController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get delivery time estimate
router.get('/restaurant/:restaurantId', deliveryTimeEstimateController.getDeliveryTimeEstimate);

// Get all delivery time estimates (admin)
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), deliveryTimeEstimateController.getAllDeliveryTimeEstimates);

// Create or update delivery time estimate
router.put('/restaurant/:restaurantId', authorize('ADMIN', 'RESTAURANT_OWNER'), deliveryTimeEstimateController.updateDeliveryTimeEstimate);

module.exports = router;

