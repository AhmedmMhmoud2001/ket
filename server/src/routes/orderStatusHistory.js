const express = require('express');
const router = express.Router();
const orderStatusHistoryController = require('../controllers/orderStatusHistoryController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get order status history
router.get('/order/:orderId', orderStatusHistoryController.getOrderStatusHistory);

// Create status history entry (usually called automatically when order status changes)
router.post('/', orderStatusHistoryController.createStatusHistory);

// Get all status histories (admin)
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), orderStatusHistoryController.getAllStatusHistories);

module.exports = router;

