const express = require('express');
const router = express.Router();
const {
  getMyOrders,
  getByOrderNumber,
  createOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Rutas de usuario
router.use(authenticate);
router.get('/my-orders', getMyOrders);
router.get('/my-orders/:orderNumber', getByOrderNumber);
router.post('/', createOrder);
router.put('/:orderNumber/cancel', cancelOrder);

// Rutas de admin
router.get('/', authorizeAdmin, getAllOrders);
router.put('/:orderNumber/status', authorizeAdmin, updateOrderStatus);

module.exports = router;