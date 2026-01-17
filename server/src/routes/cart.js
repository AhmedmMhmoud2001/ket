const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get user cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/items', cartController.addItemToCart);

// Update cart item
router.put('/items/:id', cartController.updateCartItem);

// Remove item from cart
router.delete('/items/:id', cartController.removeItemFromCart);

// Clear cart
router.delete('/clear', cartController.clearCart);

// Checkout
router.post('/checkout', cartController.checkout);

module.exports = router;

