// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectDB } = require('./src/config/database');
const { syncDB } = require('./src/models/index');
const authRoutes = require('./src/routes/auth.routes');

// 👇 app debe declararse ANTES de cualquier app.use()
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);

// Salud del servidor
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
  });
});

// Arrancar
const start = async () => {
  await connectDB();
  await syncDB();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

start();