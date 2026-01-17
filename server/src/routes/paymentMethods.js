const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get user payment methods
router.get('/', paymentMethodController.getUserPaymentMethods);
router.get('/user/:userId', authorize('ADMIN', 'SUPER_ADMIN'), paymentMethodController.getUserPaymentMethods);

// Add payment method
router.post('/', paymentMethodController.addPaymentMethod);

// Update payment method
router.put('/:id', paymentMethodController.updatePaymentMethod);

// Delete payment method
router.delete('/:id', paymentMethodController.deletePaymentMethod);

module.exports = router;

