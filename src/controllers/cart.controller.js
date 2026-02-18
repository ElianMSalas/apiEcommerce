const { Product } = require('../models/index');
const cartStore = require('../utils/cart');

// GET /api/cart
const getCart = (req, res) => {
  const cart = cartStore.getCart(req.user.id);
  return res.status(200).json(cartStore.calculateTotals(cart));
};

// POST /api/cart/items
const addItem = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId es requerido' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }

    // Verificar que el producto exista y tenga stock
    const product = await Product.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar stock disponible
    const cart = cartStore.getCart(req.user.id);
    const existingItem = cart.items.find((i) => i.productId === productId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalRequested = currentQuantity + quantity;

    if (totalRequested > product.stock) {
      return res.status(400).json({
        message: `Stock insuficiente. Disponible: ${product.stock}, en carrito: ${currentQuantity}`,
      });
    }

    const updatedCart = cartStore.addItem(req.user.id, product, quantity);
    return res.status(200).json({
      message: 'Producto agregado al carrito',
      cart: cartStore.calculateTotals(updatedCart),
    });
  } catch (error) {
    console.error('Error en addItem cart:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PUT /api/cart/items/:productId
const updateItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ message: 'quantity es requerido' });
    }

    // Verificar stock si aumenta cantidad
    if (quantity > 0) {
      const product = await Product.findOne({
        where: { id: productId, isActive: true },
      });

      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          message: `Stock insuficiente. Disponible: ${product.stock}`,
        });
      }
    }

    const updatedCart = cartStore.updateItem(req.user.id, productId, quantity);

    if (!updatedCart) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    return res.status(200).json({
      message: quantity <= 0 ? 'Producto eliminado del carrito' : 'Carrito actualizado',
      cart: cartStore.calculateTotals(updatedCart),
    });
  } catch (error) {
    console.error('Error en updateItem cart:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// DELETE /api/cart/items/:productId
const removeItem = (req, res) => {
  const { productId } = req.params;
  const updatedCart = cartStore.removeItem(req.user.id, productId);
  return res.status(200).json({
    message: 'Producto eliminado del carrito',
    cart: cartStore.calculateTotals(updatedCart),
  });
};

// DELETE /api/cart
const clearCart = (req, res) => {
  cartStore.clearCart(req.user.id);
  return res.status(200).json({ message: 'Carrito vaciado exitosamente' });
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };