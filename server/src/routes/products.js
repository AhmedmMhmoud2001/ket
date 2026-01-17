const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all products
router.get('/', authorize('ADMIN', 'RESTAURANT_OWNER'), productController.getAllProducts);

// Get product by ID
router.get('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), productController.getProductById);

// Create product
router.post('/', authorize('ADMIN', 'RESTAURANT_OWNER'), productController.createProduct);

// Update product
router.put('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), productController.updateProduct);

// Delete product
router.delete('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), productController.deleteProduct);

// Product images routes
router.post('/:id/images', authorize('ADMIN', 'RESTAURANT_OWNER'), productController.addProductImage);
router.delete('/:id/images/:imageId', authorize('ADMIN', 'RESTAURANT_OWNER'), productController.deleteProductImage);
router.patch('/:id/images/:imageId/primary', authorize('ADMIN', 'RESTAURANT_OWNER'), productController.setPrimaryImage);
router.patch('/:id/images/:imageId/sort', authorize('ADMIN', 'RESTAURANT_OWNER'), productController.updateImageSortOrder);

module.exports = router;
