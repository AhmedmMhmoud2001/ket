const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all offers
router.get('/', offerController.getAllOffers);

// Get offer by ID
router.get('/:id', offerController.getOfferById);

// Create offer (admin/manager only)
router.post('/', authorize('admin', 'manager'), offerController.createOffer);

// Update offer (admin/manager only)
router.put('/:id', authorize('admin', 'manager'), offerController.updateOffer);

// Delete offer (admin only)
router.delete('/:id', authorize('admin'), offerController.deleteOffer);

module.exports = router;
