const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');
const { protect, authorize } = require('../middleware/auth');

// Public/User routes (require authentication)
router.get('/user', protect, pointsController.getUserPoints);
router.get('/user/transactions', protect, pointsController.getPointsTransactions);
router.get('/user/expiring', protect, pointsController.getExpiringPoints);
router.post('/redeem', protect, pointsController.redeemPoints);
router.post('/earn', protect, pointsController.earnPoints);

// Admin routes
router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), pointsController.getAllUsersPoints);
router.post('/adjust', protect, authorize('ADMIN', 'SUPER_ADMIN'), pointsController.adjustPoints);

// User-specific routes (for admin to view any user)
router.get('/:userId', protect, authorize('ADMIN', 'SUPER_ADMIN'), pointsController.getUserPoints);
router.get('/:userId/transactions', protect, authorize('ADMIN', 'SUPER_ADMIN'), pointsController.getPointsTransactions);
router.get('/:userId/expiring', protect, authorize('ADMIN', 'SUPER_ADMIN'), pointsController.getExpiringPoints);

module.exports = router;

