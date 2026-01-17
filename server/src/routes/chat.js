const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get chat messages
router.get('/messages', chatController.getChatMessages);

// Mark messages as read
router.post('/messages/read', chatController.markAsRead);

// Get unread message count
router.get('/messages/unread-count', chatController.getUnreadCount);

module.exports = router;

