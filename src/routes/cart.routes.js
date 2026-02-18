const express = require('express');
const router = express.Router();
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cart.controller');
const { authenticate } = require('../middleware/auth');

// Todas las rutas del carrito requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Obtener mi carrito
 *     description: Retorna el carrito del usuario autenticado con todos los items, subtotal y cantidad total
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       price:
 *                         type: number
 *                       image:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                 subtotal:
 *                   type: number
 *                   example: 199.98
 *                 itemCount:
 *                   type: integer
 *                   example: 3
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado
 */
router.get('/', getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Agregar producto al carrito
 *     description: Agrega un producto al carrito o incrementa la cantidad si ya existe
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID del producto
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Cantidad a agregar
 *                 example: 2
 *     responses:
 *       200:
 *         description: Producto agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto agregado al carrito"
 *                 cart:
 *                   type: object
 *       400:
 *         description: Error de validación o stock insuficiente
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 */
router.post('/items', addItem);

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   put:
 *     summary: Actualizar cantidad de un producto
 *     description: Actualiza la cantidad de un producto en el carrito. Si quantity es 0, elimina el producto
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Nueva cantidad (0 para eliminar)
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cantidad actualizada o producto eliminado
 *       400:
 *         description: Error de validación o stock insuficiente
 *       404:
 *         description: Producto no encontrado en el carrito
 *       401:
 *         description: No autorizado
 */
router.put('/items/:productId', updateItem);

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   delete:
 *     summary: Eliminar producto del carrito
 *     description: Elimina completamente un producto del carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto eliminado del carrito"
 *                 cart:
 *                   type: object
 *       401:
 *         description: No autorizado
 */
router.delete('/items/:productId', removeItem);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Vaciar carrito completo
 *     description: Elimina todos los productos del carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Carrito vaciado exitosamente"
 *       401:
 *         description: No autorizado
 */
router.delete('/', clearCart);

module.exports = router;