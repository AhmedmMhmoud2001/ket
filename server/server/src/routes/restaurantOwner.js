const express = require('express');
const router = express.Router();
const restaurantOwnerController = require('../controllers/restaurantOwnerController');
const { protect } = require('../middleware/auth');
const { getUserRestaurant, verifyRestaurantOwner } = require('../middleware/restaurantOwner');

// All routes require authentication and restaurant ownership
router.use(protect);
router.use(getUserRestaurant);

// Restaurant Info
router.get('/restaurant', restaurantOwnerController.getMyRestaurant);
router.put('/restaurant', restaurantOwnerController.updateMyRestaurant);

// Products
router.get('/products', restaurantOwnerController.getMyProducts);
router.get('/products/:id', restaurantOwnerController.getMyProductById);
router.post('/products', restaurantOwnerController.createMyProduct);
router.put('/products/:id', restaurantOwnerController.updateMyProduct);
router.delete('/products/:id', restaurantOwnerController.deleteMyProduct);

// Categories
router.get('/categories', restaurantOwnerController.getMyCategories);

// Subcategories
router.get('/subcategories', restaurantOwnerController.getMySubcategories);

// Orders
router.get('/orders', restaurantOwnerController.getMyOrders);

// Statistics
router.get('/statistics', restaurantOwnerController.getMyStatistics);

module.exports = router;

