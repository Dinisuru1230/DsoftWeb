const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  getAllReviews,
  createAdminReview,
  updateReviewStatus,
  deleteReview,
} = require('../controllers/reviewController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Public routes for product reviews
router.get('/products/:productId/reviews', getProductReviews);
router.post('/products/:productId/reviews', createReview);

// Admin routes for reviewing & moderating reviews
router.get('/admin/reviews', authenticateToken, requireAdmin, getAllReviews);
router.post('/admin/reviews', authenticateToken, requireAdmin, createAdminReview);
router.patch('/admin/reviews/:id/status', authenticateToken, requireAdmin, updateReviewStatus);
router.delete('/admin/reviews/:id', authenticateToken, requireAdmin, deleteReview);

module.exports = router;
