const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, testSmtpEmail } = require('../controllers/settingsController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// GET /api/settings — Public (frontend needs for shipping calculation)
router.get('/', getSettings);

// PUT /api/settings — Admin only
router.put('/', authenticateToken, requireAdmin, updateSettings);

// POST /api/settings/test-email — Admin only
router.post('/test-email', authenticateToken, requireAdmin, testSmtpEmail);

module.exports = router;
