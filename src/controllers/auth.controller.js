const { User } = require('../models/index');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const user = await User.create({ name, email, password });

    const payload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Guardar refresh token en la DB
    await user.update({ refreshToken });

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      accessToken,
      refreshToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, isActive: true } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const payload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await user.update({ refreshToken });

    return res.status(200).json({
      message: 'Login exitoso',
      accessToken,
      refreshToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token requerido' });
    }

    // Verificar token
    const decoded = verifyRefreshToken(refreshToken);

    // Buscar usuario y verificar que el refresh token coincida
    const user = await User.findOne({
      where: { id: decoded.id, refreshToken, isActive: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Refresh token inválido o expirado' });
    }

    const payload = { id: user.id, role: user.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await user.update({ refreshToken: newRefreshToken });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token inválido o expirado' });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    // El middleware authenticate ya verificó el token y cargó req.user
    await req.user.update({ refreshToken: null });
    return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user.toSafeObject() });
};

module.exports = { register, login, refresh, logout, getMe };