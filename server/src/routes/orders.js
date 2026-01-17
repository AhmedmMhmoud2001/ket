const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all orders
router.get('/', authorize('ADMIN', 'RESTAURANT_OWNER'), orderController.getAllOrders);

// Get order by ID
router.get('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), orderController.getOrderById);

// Update order status
router.patch('/:id/status', authorize('ADMIN', 'RESTAURANT_OWNER'), orderController.updateOrderStatus);

// Assign driver to order
router.patch('/:id/assign-driver', authorize('ADMIN', 'RESTAURANT_OWNER'), orderController.assignDriver);

// Cancel order
router.patch('/:id/cancel', authorize('ADMIN', 'RESTAURANT_OWNER', 'CUSTOMER'), orderController.cancelOrder);

// Reorder (Order Again)
router.post('/:id/reorder', protect, orderController.reorder);

module.exports = router;
