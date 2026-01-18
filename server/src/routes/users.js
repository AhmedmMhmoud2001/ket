const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

// All routes require authentication
router.use(protect);

// Get all users (admin, manager)
router.get('/', authorize('ADMIN', 'RESTAURANT_OWNER'), userController.getAllUsers);
router.post('/', authorize('ADMIN'), userController.createUser);

// Get all customers (End users)
router.get('/customers', authorize('ADMIN', 'RESTAURANT_OWNER'), customerController.getAllCustomers);
router.post('/customers', authorize('ADMIN', 'RESTAURANT_OWNER'), customerController.createCustomer);
router.put('/customers/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), customerController.updateCustomer);
router.patch('/customers/:id/status', authorize('ADMIN', 'RESTAURANT_OWNER'), customerController.updateCustomerStatus);

// Get user by ID
router.get('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), userController.getUserById);

// Update user
router.put('/:id', authorize('ADMIN'), userController.updateUser);

// Update user status (ban/activate)
router.patch('/:id/status', authorize('ADMIN'), userController.updateUserStatus);

// Delete user
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);

// Get user orders
router.get('/:id/orders', authorize('ADMIN', 'RESTAURANT_OWNER', 'OPERATIONS_MANAGER'), userController.getUserOrders);

module.exports = router;
