const express = require('express');
const router = express.Router();
const cidController = require('../controllers/cidController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/points', optionalAuth, cidController.getCidPoints);
router.post('/get-confirmation-id', optionalAuth, cidController.getConfirmationId);

module.exports = router;
