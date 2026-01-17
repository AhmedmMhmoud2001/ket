const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

// All routes require authentication
router.use(protect);

// Get all users (admin, manager)
router.get('/', authorize('admin', 'manager'), userController.getAllUsers);

// Get all customers (End users)
router.get('/customers', authorize('admin', 'manager'), customerController.getAllCustomers);
router.post('/customers', authorize('admin', 'manager'), customerController.createCustomer);
router.put('/customers/:id', authorize('admin', 'manager'), customerController.updateCustomer);
router.patch('/customers/:id/status', authorize('admin', 'manager'), customerController.updateCustomerStatus);

// Get user by ID
router.get('/:id', authorize('admin', 'manager'), userController.getUserById);

// Update user
router.put('/:id', authorize('admin'), userController.updateUser);

// Update user status (ban/activate)
router.patch('/:id/status', authorize('admin'), userController.updateUserStatus);

// Delete user
router.delete('/:id', authorize('admin'), userController.deleteUser);

// Get user orders
router.get('/:id/orders', authorize('admin', 'manager', 'support'), userController.getUserOrders);

module.exports = router;
