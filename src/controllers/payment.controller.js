const stripe = require('../config/stripe');
const { Order, OrderItem, Product } = require('../models/index');

// POST /api/payments/create-checkout-session
const createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'orderId es requerido' });
    }

    // Buscar la orden
    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'images'],
        }],
      }],
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Verificar que la orden esté en estado válido para pago
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        message: `No se puede procesar el pago para una orden con estado "${order.status}"` 
      });
    }

    // Verificar si ya tiene una sesión activa
    if (order.stripeSessionId) {
      // Verificar si la sesión aún es válida
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        if (existingSession.status === 'open') {
          return res.status(200).json({ 
            sessionId: existingSession.id,
            url: existingSession.url 
          });
        }
      } catch (error) {
        console.log('Sesión anterior expirada o inválida');
      }
    }

    // Crear line items para Stripe
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd', // o 'clp' para pesos chilenos
        product_data: {
          name: item.product.name,
          images: item.product.images && item.product.images.length > 0 
            ? [item.product.images[0]] 
            : [],
        },
        unit_amount: Math.round(item.unitPrice * 100), // Stripe usa centavos
      },
      quantity: item.quantity,
    }));

    // Agregar costos adicionales si existen
    if (order.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Envío',
          },
          unit_amount: Math.round(order.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    if (order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Impuestos',
          },
          unit_amount: Math.round(order.tax * 100),
        },
        quantity: 1,
      });
    }

  // Crear sesión de Checkout
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL || process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&order_number=${order.orderNumber}`,
    cancel_url: `${process.env.FRONTEND_URL || process.env.STRIPE_CANCEL_URL}?order_number=${order.orderNumber}`,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: req.user.id,
    },
    customer_email: req.user.email,
  });

    // Guardar el sessionId en la orden
    await order.update({ 
      stripeSessionId: session.id,
      paymentMethod: 'stripe',
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error en createCheckoutSession:', error);
    return res.status(500).json({ 
      message: 'Error al crear la sesión de pago',
      error: error.message 
    });
  }
};

// POST /api/payments/webhook (para confirmación de pago)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verificar la firma del webhook
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Error en verificación de webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailed(failedPayment);
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
};

// Función auxiliar: Sesión de checkout completada
const handleCheckoutSessionCompleted = async (session) => {
  const orderId = session.metadata.orderId;

  const order = await Order.findByPk(orderId);
  if (!order) {
    console.error(`Orden ${orderId} no encontrada`);
    return;
  }

  // Actualizar la orden
  await order.update({
    status: 'paid',
    paymentStatus: 'completed',
    stripePaymentIntentId: session.payment_intent,
    paidAt: new Date(),
  });

  console.log(`Pago completado para orden ${order.orderNumber}`);
  
  // Aquí podrías enviar un email de confirmación
  // await sendOrderConfirmationEmail(order);
};

// Función auxiliar: Payment Intent exitoso
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  console.log('PaymentIntent exitoso:', paymentIntent.id);
  // Lógica adicional si es necesaria
};

// Función auxiliar: Pago fallido
const handlePaymentFailed = async (paymentIntent) => {
  console.log('PaymentIntent fallido:', paymentIntent.id);
  
  // Buscar orden por payment intent
  const order = await Order.findOne({
    where: { stripePaymentIntentId: paymentIntent.id }
  });

  if (order) {
    await order.update({
      paymentStatus: 'failed',
    });
  }
};

// GET /api/payments/success
const paymentSuccess = async (req, res) => {
  const { session_id, order_number } = req.query;

  if (!session_id || !order_number) {
    return res.status(400).json({ 
      message: 'session_id y order_number son requeridos' 
    });
  }

  try {
    // Verificar la sesión
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Pago completado exitosamente',
        orderNumber: order_number,
        sessionId: session_id,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'El pago no ha sido completado',
        status: session.payment_status,
      });
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
    return res.status(500).json({ 
      message: 'Error verificando el pago' 
    });
  }
};

// GET /api/payments/cancel
const paymentCancel = async (req, res) => {
  const { order_number } = req.query;

  return res.status(200).json({
    success: false,
    message: 'Pago cancelado',
    orderNumber: order_number,
  });
};

// GET /api/payments/status/:orderId
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id },
      attributes: ['id', 'orderNumber', 'status', 'paymentStatus', 'stripeSessionId', 'paidAt'],
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    return res.status(200).json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
    });
  } catch (error) {
    console.error('Error obteniendo estado de pago:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  paymentSuccess,
  paymentCancel,
  getPaymentStatus,
};