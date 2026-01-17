const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Get all subcategories
router.get('/', subcategoryController.getAllSubcategories);

// Get single subcategory
router.get('/:id', subcategoryController.getSubcategoryById);

// Create subcategory
router.post('/', authorize('SUPER_ADMIN', 'RESTAURANT_MANAGER'), subcategoryController.createSubcategory);

// Update subcategory
router.put('/:id', authorize('SUPER_ADMIN', 'RESTAURANT_MANAGER'), subcategoryController.updateSubcategory);

// Toggle active status
router.patch('/:id/toggle', authorize('SUPER_ADMIN', 'RESTAURANT_MANAGER'), subcategoryController.toggleSubcategory);

// Delete subcategory
router.delete('/:id', authorize('SUPER_ADMIN'), subcategoryController.deleteSubcategory);

module.exports = router;
