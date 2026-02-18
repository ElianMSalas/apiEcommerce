const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  handleWebhook,
  paymentSuccess,
  paymentCancel,
  getPaymentStatus,
} = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Webhook de Stripe
 *     description: Endpoint para recibir notificaciones de eventos de Stripe (uso interno)
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Webhook procesado
 */
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

/**
 * @swagger
 * /api/payments/success:
 *   get:
 *     summary: Página de éxito del pago
 *     description: Endpoint al que Stripe redirige después de un pago exitoso
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de sesión de Stripe
 *       - in: query
 *         name: order_number
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de orden
 *     responses:
 *       200:
 *         description: Pago completado exitosamente
 *       400:
 *         description: Pago no completado
 */
router.get('/success', paymentSuccess);

/**
 * @swagger
 * /api/payments/cancel:
 *   get:
 *     summary: Página de cancelación del pago
 *     description: Endpoint al que Stripe redirige si el usuario cancela el pago
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: order_number
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pago cancelado
 */
router.get('/cancel', paymentCancel);

// Rutas protegidas
router.use(authenticate);

/**
 * @swagger
 * /api/payments/create-checkout-session:
 *   post:
 *     summary: Crear sesión de pago
 *     description: Crea una sesión de checkout de Stripe para procesar el pago de una orden
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la orden a pagar
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Sesión creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: ID de la sesión de Stripe
 *                 url:
 *                   type: string
 *                   format: uri
 *                   description: URL para redirigir al checkout
 *             example:
 *               sessionId: "cs_test_a1b2c3d4"
 *               url: "https://checkout.stripe.com/pay/cs_test_a1b2c3d4"
 *       400:
 *         description: Orden no válida para pago
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autorizado
 */
router.post('/create-checkout-session', createCheckoutSession);

/**
 * @swagger
 * /api/payments/status/{orderId}:
 *   get:
 *     summary: Obtener estado del pago
 *     description: Consulta el estado del pago de una orden
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Estado del pago
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                 orderNumber:
 *                   type: string
 *                 status:
 *                   type: string
 *                 paymentStatus:
 *                   type: string
 *                 paidAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Orden no encontrada
 */
router.get('/status/:orderId', getPaymentStatus);

module.exports = router;