const express = require('express');
const router = express.Router();
const shippingAgentController = require('../controllers/shippingAgentController');
const { authenticate, authorize } = require('../middleware/auth');

// Public/Authenticated routes
router.get('/', authenticate, shippingAgentController.getAllAgents);
router.get('/:id', authenticate, shippingAgentController.getAgentById);

// Admin only routes
router.post('/', authenticate, authorize('ADMIN'), shippingAgentController.createAgent);
router.put('/:id', authenticate, authorize('ADMIN'), shippingAgentController.updateAgent);
router.delete('/:id', authenticate, authorize('ADMIN'), shippingAgentController.deleteAgent);

module.exports = router;
