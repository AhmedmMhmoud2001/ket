const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get single category
router.get('/:id', categoryController.getCategoryById);

// Create category
router.post('/', authorize('ADMIN'), categoryController.createCategory);

// Update category
router.put('/:id', authorize('ADMIN'), categoryController.updateCategory);

// Delete category
router.delete('/:id', authorize('ADMIN'), categoryController.deleteCategory);

module.exports = router;
