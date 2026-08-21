const express = require('express');
const router = express.Router();
const { getOurStory, updateOurStory } = require('../controllers/ourStoryController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// GET /api/our-story (Public)
router.get('/', getOurStory);

// PUT /api/our-story (Admin only)
router.put('/', authenticateToken, requireAdmin, updateOurStory);

module.exports = router;
