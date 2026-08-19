const express = require('express');
const router = express.Router();
const {
  submitMessage,
  getMessages,
  getStats,
  getMessage,
  updateStatus,
  replyToMessage,
  deleteMessage,
} = require('../controllers/contactController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Public
router.post('/', submitMessage);

// Admin-only
router.get('/', authenticateToken, requireAdmin, getMessages);
router.get('/stats', authenticateToken, requireAdmin, getStats);
router.get('/:id', authenticateToken, requireAdmin, getMessage);
router.put('/:id/status', authenticateToken, requireAdmin, updateStatus);
router.post('/:id/reply', authenticateToken, requireAdmin, replyToMessage);
router.delete('/:id', authenticateToken, requireAdmin, deleteMessage);

module.exports = router;
