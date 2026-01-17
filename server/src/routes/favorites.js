const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// All routes require authentication
router.use(protect);

// ========== PRODUCT FAVORITES ==========

// User routes
router.get('/products', favoriteController.getUserFavoriteProducts);
router.post('/products/:productId', favoriteController.addProductToFavorites);
router.delete('/products/:productId', favoriteController.removeProductFromFavorites);

// Admin routes - view who favorited a product
router.get('/products/:productId/users', 
    roleMiddleware('SUPER_ADMIN', 'RESTAURANT_MANAGER'),
    favoriteController.getProductFavoriteUsers
);
router.get('/products/:productId/count', 
    favoriteController.getProductFavoritesCount
);

// ========== RESTAURANT FAVORITES ==========

// User routes
router.get('/restaurants', favoriteController.getUserFavoriteRestaurants);
router.post('/restaurants/:restaurantId', favoriteController.addRestaurantToFavorites);
router.delete('/restaurants/:restaurantId', favoriteController.removeRestaurantFromFavorites);

// Admin routes - view who favorited a restaurant
router.get('/restaurants/:restaurantId/users', 
    roleMiddleware('SUPER_ADMIN'),
    favoriteController.getRestaurantFavoriteUsers
);
router.get('/restaurants/:restaurantId/count', 
    favoriteController.getRestaurantFavoritesCount
);

module.exports = router;

