const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { protect, authorize } = require('../middleware/auth');

// Privacy Policy routes
router.get('/privacy-policy', protect, contentController.getPrivacyPolicy);
router.post('/privacy-policy', protect, authorize('ADMIN', 'SUPER_ADMIN'), contentController.createOrUpdatePrivacyPolicy);

// Terms of Service routes
router.get('/terms-of-service', protect, contentController.getTermsOfService);
router.post('/terms-of-service', protect, authorize('ADMIN', 'SUPER_ADMIN'), contentController.createOrUpdateTermsOfService);

// About App routes
router.get('/about-app', protect, contentController.getAboutApp);
router.post('/about-app', protect, authorize('ADMIN', 'SUPER_ADMIN'), contentController.createOrUpdateAboutApp);

module.exports = router;

