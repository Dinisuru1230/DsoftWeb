const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  reorderCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Public — get active categories (Shop page)
router.get('/', getCategories);

// Admin-only — full CRUD & reorder
router.post('/', authenticateToken, requireAdmin, createCategory);
router.put('/reorder', authenticateToken, requireAdmin, reorderCategories);
router.put('/:id', authenticateToken, requireAdmin, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

module.exports = router;
