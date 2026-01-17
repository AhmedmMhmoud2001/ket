const express = require('express');
const router = express.Router();
const shippingOrderController = require('../controllers/shippingOrderController');
const { authenticate, authorize } = require('../middleware/auth');

// Public/Authenticated routes
router.get('/', authenticate, shippingOrderController.getAllOrders);
router.get('/:id', authenticate, shippingOrderController.getOrderById);
router.post('/', authenticate, shippingOrderController.createOrder);

// Admin/Agent only routes
router.put('/:id', authenticate, authorize('ADMIN', 'AGENT'), shippingOrderController.updateOrder);
router.delete('/:id', authenticate, authorize('ADMIN'), shippingOrderController.deleteOrder);

module.exports = router;
