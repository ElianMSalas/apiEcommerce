// Estructura: Map<userId, { items: [], updatedAt: Date }>
const carts = new Map();

const getCart = (userId) => {
  if (!carts.has(userId)) {
    carts.set(userId, { items: [], updatedAt: new Date() });
  }
  return carts.get(userId);
};

const addItem = (userId, product, quantity) => {
  const cart = getCart(userId);
  const existingIndex = cart.items.findIndex((i) => i.productId === product.id);

  if (existingIndex >= 0) {
    // Si ya existe solo actualizamos la cantidad
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price),
      image: product.images[0] || null,
      quantity,
    });
  }

  cart.updatedAt = new Date();
  return cart;
};

const updateItem = (userId, productId, quantity) => {
  const cart = getCart(userId);
  const index = cart.items.findIndex((i) => i.productId === productId);

  if (index === -1) return null;

  if (quantity <= 0) {
    cart.items.splice(index, 1);
  } else {
    cart.items[index].quantity = quantity;
  }

  cart.updatedAt = new Date();
  return cart;
};

const removeItem = (userId, productId) => {
  const cart = getCart(userId);
  cart.items = cart.items.filter((i) => i.productId !== productId);
  cart.updatedAt = new Date();
  return cart;
};

const clearCart = (userId) => {
  carts.set(userId, { items: [], updatedAt: new Date() });
};

const calculateTotals = (cart) => {
  const subtotal = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return {
    ...cart,
    subtotal: parseFloat(subtotal.toFixed(2)),
    itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
  };
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, calculateTotals };