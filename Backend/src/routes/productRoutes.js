const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductKeys,
  addProductKeys,
  deleteProductKey,
} = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/:id/keys', authenticateToken, requireAdmin, getProductKeys);
router.post('/:id/keys', authenticateToken, requireAdmin, addProductKeys);
router.delete('/:id/keys/:keyId', authenticateToken, requireAdmin, deleteProductKey);
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

module.exports = router;
