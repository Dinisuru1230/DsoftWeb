const express = require('express');
const router = express.Router();
const {
  createOrder,
  uploadBankSlip,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderItemLicenseKey,
  resendOrderEmail,
  trackOrder,
  getDashboardStats,
} = require('../controllers/orderController');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', optionalAuth, createOrder);
router.post('/:id/bank-slip', upload.single('bankSlip'), uploadBankSlip);
router.get('/my-orders', authenticateToken, getMyOrders);
router.get('/dashboard-stats', authenticateToken, requireAdmin, getDashboardStats);
router.get('/track/:orderNumber', trackOrder);
router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.get('/:id', authenticateToken, requireAdmin, getOrderById);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);
router.put('/:orderId/items/:itemId/license-key', authenticateToken, requireAdmin, updateOrderItemLicenseKey);
router.post('/:id/resend-email', authenticateToken, requireAdmin, resendOrderEmail);

module.exports = router;
