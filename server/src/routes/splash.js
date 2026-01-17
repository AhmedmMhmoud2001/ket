const express = require('express');
const router = express.Router();
const splashController = require('../controllers/splashController');
const { protect } = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Public routes (for mobile app)
router.get('/active', splashController.getActiveSplashScreens);

// Protected routes (admin only)
router.use(protect);
router.use(roleMiddleware('SUPER_ADMIN'));

router.get('/', splashController.getAllSplashScreens);
router.get('/:id', splashController.getSplashScreenById);
router.post('/', splashController.createSplashScreen);
router.put('/:id', splashController.updateSplashScreen);
router.patch('/:id/toggle', splashController.toggleSplashScreen);
router.delete('/:id', splashController.deleteSplashScreen);

module.exports = router;

