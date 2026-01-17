const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { protect } = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Public routes (for mobile app)
router.get('/active', onboardingController.getActiveOnboardingScreens);

// Protected routes (admin only)
router.use(protect);
router.use(roleMiddleware('ADMIN'));

router.get('/', onboardingController.getAllOnboardingScreens);
router.get('/:id', onboardingController.getOnboardingScreenById);
router.post('/', onboardingController.createOnboardingScreen);
router.put('/:id', onboardingController.updateOnboardingScreen);
router.patch('/:id/toggle', onboardingController.toggleOnboardingScreen);
router.delete('/:id', onboardingController.deleteOnboardingScreen);

module.exports = router;

