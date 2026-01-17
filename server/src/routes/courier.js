const express = require('express');
const router = express.Router();
const courierOrderController = require('../controllers/courierOrderController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (for cost calculation and payment methods)
router.get('/calculate-cost', courierOrderController.calculateCost);
router.get('/payment-methods', courierOrderController.getPaymentMethods);

// All other routes require authentication
router.use(protect);

// Courier order routes
router.post('/orders', authorize('customer', 'admin'), courierOrderController.createCourierOrder);
router.get('/orders', authorize('admin', 'manager', 'support', 'customer', 'driver'), courierOrderController.getAllCourierOrders);
router.get('/orders/:id', authorize('admin', 'manager', 'support', 'customer', 'driver'), courierOrderController.getCourierOrderById);
router.patch('/orders/:id/status', authorize('admin', 'manager', 'driver'), courierOrderController.updateCourierOrderStatus);
router.patch('/orders/:id/assign-driver', authorize('admin', 'manager'), courierOrderController.assignDriver);
router.get('/orders/:id/tracking', authorize('admin', 'manager', 'support', 'customer', 'driver'), courierOrderController.getCourierOrderTracking);

module.exports = router;

