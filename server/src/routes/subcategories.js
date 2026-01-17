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
router.post('/', authorize('ADMIN', 'RESTAURANT_OWNER'), subcategoryController.createSubcategory);

// Update subcategory
router.put('/:id', authorize('ADMIN', 'RESTAURANT_OWNER'), subcategoryController.updateSubcategory);

// Toggle active status
router.patch('/:id/toggle', authorize('ADMIN', 'RESTAURANT_OWNER'), subcategoryController.toggleSubcategory);

// Delete subcategory
router.delete('/:id', authorize('ADMIN'), subcategoryController.deleteSubcategory);

module.exports = router;
