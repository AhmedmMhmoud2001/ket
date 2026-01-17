const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get all tickets (admin/support agent)
router.get('/', authorize('ADMIN', 'SUPPORT_AGENT'), supportController.getAllTickets);

// Create ticket
router.post('/', supportController.createTicket);

// Get ticket details
router.get('/:id', supportController.getTicketById);

// Add reply
router.post('/:id/replies', supportController.addReply);

// Update status
router.patch('/:id/status', authorize('ADMIN', 'SUPPORT_AGENT'), supportController.updateTicketStatus);

module.exports = router;
