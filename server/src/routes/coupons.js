const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all coupons
router.get('/', couponController.getAllCoupons);

// Get coupon by ID
router.get('/:id', couponController.getCouponById);

// Create coupon (admin/manager only)
router.post('/', authorize('ADMIN', 'RESTAURANT_OWNER'), couponController.createCoupon);

// Update coupon (admin/manager only)
router.put('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), couponController.updateCoupon);

// Delete coupon (admin only)
router.delete('/:id', authorize('ADMIN'), couponController.deleteCoupon);

module.exports = router;
