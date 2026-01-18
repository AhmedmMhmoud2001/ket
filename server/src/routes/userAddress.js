const express = require('express');
const router = express.Router();
const userAddressController = require('../controllers/userAddressController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get user addresses
router.get('/', userAddressController.getUserAddresses);
router.get('/user/:userId', authorize('ADMIN', 'SUPER_ADMIN'), userAddressController.getUserAddresses);

// Get address by ID
router.get('/:id', userAddressController.getAddressById);

// Create address
router.post('/', userAddressController.createAddress);

// Update address
router.put('/:id', userAddressController.updateAddress);

// Delete address
router.delete('/:id', userAddressController.deleteAddress);

// Set default address
router.patch('/:id/set-default', userAddressController.setDefaultAddress);

module.exports = router;


