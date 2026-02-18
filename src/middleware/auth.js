const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models/index');

// Verifica que el token sea válido
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Verificar que el usuario siga existiendo y activo
    const user = await User.findOne({
      where: { id: decoded.id, isActive: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Verifica que el usuario tenga rol de admin
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};

// Verifica que el usuario acceda solo a sus propios recursos
const authorizeOwner = (paramKey = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[paramKey];
    if (req.user.role !== 'admin' && req.user.id !== resourceUserId) {
      return res.status(403).json({ message: 'No tienes permiso para acceder a este recurso' });
    }
    next();
  };
};

module.exports = { authenticate, authorizeAdmin, authorizeOwner };