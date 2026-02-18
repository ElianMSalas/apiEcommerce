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

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Obtener mis órdenes
 *     description: Lista todas las órdenes del usuario autenticado
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Resultados por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, processing, shipped, delivered, cancelled, refunded]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de órdenes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: No autorizado
 */
router.get('/my-orders', getMyOrders);

/**
 * @swagger
 * /api/orders/my-orders/{orderNumber}:
 *   get:
 *     summary: Obtener detalle de una orden
 *     description: Obtiene el detalle completo de una orden específica
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de orden
 *         example: "ORD-20240218-001"
 *     responses:
 *       200:
 *         description: Detalle de la orden
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autorizado
 */
router.get('/my-orders/:orderNumber', getByOrderNumber);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear una nueva orden
 *     description: Crea una orden desde los items del carrito
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zipCode
 *                   - country
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "Av. Principal 123"
 *                   city:
 *                     type: string
 *                     example: "Santiago"
 *                   state:
 *                     type: string
 *                     example: "Región Metropolitana"
 *                   zipCode:
 *                     type: string
 *                     example: "8320000"
 *                   country:
 *                     type: string
 *                     example: "Chile"
 *               notes:
 *                 type: string
 *                 description: Notas adicionales
 *                 example: "Entregar en horario de oficina"
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *       400:
 *         description: Error de validación o carrito vacío
 *       401:
 *         description: No autorizado
 */
router.post('/', createOrder);

/**
 * @swagger
 * /api/orders/{orderNumber}/cancel:
 *   put:
 *     summary: Cancelar una orden
 *     description: Cancela una orden y restaura el stock de productos
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de orden
 *     responses:
 *       200:
 *         description: Orden cancelada exitosamente
 *       400:
 *         description: No se puede cancelar la orden en su estado actual
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autorizado
 */
router.put('/:orderNumber/cancel', cancelOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Obtener todas las órdenes (Admin)
 *     description: Lista todas las órdenes del sistema
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de órdenes
 *       403:
 *         description: Permisos insuficientes
 *       401:
 *         description: No autorizado
 */
router.get('/', authorizeAdmin, getAllOrders);

/**
 * @swagger
 * /api/orders/{orderNumber}/status:
 *   put:
 *     summary: Actualizar estado de orden (Admin)
 *     description: Cambia el estado de una orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, processing, shipped, delivered, cancelled, refunded]
 *                 example: "shipped"
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Estado no válido
 *       403:
 *         description: Permisos insuficientes
 *       404:
 *         description: Orden no encontrada
 */
router.put('/:orderNumber/status', authorizeAdmin, updateOrderStatus);

module.exports = router;