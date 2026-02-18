// Generar slug a partir de un texto
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // espacios → guión
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9-]/g, '')  // eliminar caracteres especiales
    .replace(/--+/g, '-');        // guiones dobles → uno solo
};

// Generar número de orden único
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Calcular totales de una orden
const calculateOrderTotals = (items, shippingCost = 0, taxRate = 0) => {
  const subtotal = items.reduce((acc, item) => {
    return acc + item.unitPrice * item.quantity;
  }, 0);

  const tax = subtotal * taxRate;
  const total = subtotal + tax + shippingCost;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    shippingCost: parseFloat(shippingCost.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

module.exports = { generateSlug, generateOrderNumber, calculateOrderTotals };