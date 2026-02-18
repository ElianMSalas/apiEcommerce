const { Order, OrderItem, Product } = require('../models/index');
const cartStore = require('../utils/cart');
const { generateOrderNumber, calculateOrderTotals } = require('../utils/helpers');
const { sequelize } = require('../config/database');

// GET /api/orders (mis órdenes)
const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'images'],
        }],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      orders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error en getMyOrders:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/orders/:orderNumber
const getByOrderNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({
      where: { orderNumber, userId: req.user.id },
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'images'],
        }],
      }],
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Error en getByOrderNumber:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/orders (crear orden desde carrito)
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { shippingAddress, notes } = req.body;

    if (!shippingAddress) {
      await transaction.rollback();
      return res.status(400).json({ message: 'La dirección de envío es requerida' });
    }

    const { street, city, state, zipCode, country } = shippingAddress;
    if (!street || !city || !state || !zipCode || !country) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'La dirección debe incluir: street, city, state, zipCode, country',
      });
    }

    // Obtener carrito del usuario
    const cart = cartStore.getCart(req.user.id);
    if (!cart.items.length) {
      await transaction.rollback();
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    // Verificar stock y obtener precios actuales de cada producto
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findOne({
        where: { id: item.productId, isActive: true },
        transaction,
        lock: true, // bloquear fila para evitar condición de carrera
      });

      if (!product) {
        await transaction.rollback();
        return res.status(400).json({
          message: `El producto "${item.name}" ya no está disponible`,
        });
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`,
        });
      }

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: parseFloat(product.price),
        subtotal: parseFloat(product.price) * item.quantity,
      });
    }

    // Calcular totales
    const totals = calculateOrderTotals(orderItems, 0, 0);

    // Crear la orden
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: req.user.id,
      status: 'pending',
      shippingAddress,
      notes,
      ...totals,
    }, { transaction });

    // Crear los items de la orden
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      orderId: order.id,
    }));
    await OrderItem.bulkCreate(itemsWithOrderId, { transaction });

    await transaction.commit();

    // Limpiar carrito después de crear la orden
    cartStore.clearCart(req.user.id);

    // Cargar orden completa con items
    const fullOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug', 'images'] }],
      }],
    });

    return res.status(201).json({
      message: 'Orden creada exitosamente',
      order: fullOrder,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error en createOrder:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PUT /api/orders/:orderNumber/cancel (cancelar orden)
const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({
      where: { orderNumber, userId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    if (!['pending', 'paid'].includes(order.status)) {
      await transaction.rollback();
      return res.status(400).json({
        message: `No se puede cancelar una orden con estado "${order.status}"`,
      });
    }

    // Restaurar stock
    for (const item of order.items) {
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction,
      });
    }

    await order.update({ status: 'cancelled' }, { transaction });
    await transaction.commit();

    return res.status(200).json({ message: 'Orden cancelada exitosamente', order });
  } catch (error) {
    await transaction.rollback();
    console.error('Error en cancelOrder:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/orders (admin - todas las órdenes)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug'] }],
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      orders,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error en getAllOrders:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PUT /api/orders/:orderNumber/status (admin - actualizar estado)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const order = await Order.findOne({ where: { orderNumber } });
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    await order.update({ status });

    return res.status(200).json({
      message: 'Estado de orden actualizado',
      order,
    });
  } catch (error) {
    console.error('Error en updateOrderStatus:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getMyOrders, getByOrderNumber, createOrder, cancelOrder, getAllOrders, updateOrderStatus };