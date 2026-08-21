const express = require('express');
const router = express.Router();
const { uploadSingle } = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');

router.post('/', upload.single('file'), uploadSingle);

module.exports = router;
