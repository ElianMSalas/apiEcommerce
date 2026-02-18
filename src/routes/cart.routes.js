const express = require('express');
const router = express.Router();
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth');

// Todas las rutas del carrito requieren autenticación
router.use(authenticate);

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);

module.exports = router;