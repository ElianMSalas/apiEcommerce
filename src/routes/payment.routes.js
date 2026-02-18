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

// Webhook de Stripe (DEBE ir ANTES de express.json())
// Esta ruta recibe el raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Rutas públicas (sin autenticación porque Stripe redirige aquí)
router.get('/success', paymentSuccess);
router.get('/cancel', paymentCancel);

// Rutas protegidas
router.use(authenticate);
router.post('/create-checkout-session', createCheckoutSession);
router.get('/status/:orderId', getPaymentStatus);

module.exports = router;