const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// GET /api/settings — Public (frontend needs for shipping calculation)
router.get('/', getSettings);

// PUT /api/settings — Admin only
router.put('/', authenticateToken, requireAdmin, updateSettings);

module.exports = router;
