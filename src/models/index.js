const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const { sequelize } = require('../config/database');

// User → Orders (un usuario tiene muchas órdenes)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Category → Products (una categoría tiene muchos productos)
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Order → OrderItems (una orden tiene muchos items)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product → OrderItems (un producto aparece en muchos items)
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Sincronizar modelos con la base de datos
const syncDB = async () => {
  await sequelize.sync({ alter: true });
  console.log('✅ Modelos sincronizados con la base de datos');
};

module.exports = { User, Category, Product, Order, OrderItem, syncDB };