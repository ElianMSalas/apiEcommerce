// Middleware genérico de validación con esquemas simples
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} es requerido` });
        continue;
      }

      if (value !== undefined && value !== '') {
        if (rules.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({ field, message: `${field} debe ser un email válido` });
        }
        if (rules.minLength && value.length < rules.minLength) {
          errors.push({ field, message: `${field} debe tener al menos ${rules.minLength} caracteres` });
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({ field, message: `${field} no puede superar ${rules.maxLength} caracteres` });
        }
        if (rules.min && Number(value) < rules.min) {
          errors.push({ field, message: `${field} debe ser mayor o igual a ${rules.min}` });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Error de validación', errors });
    }

    next();
  };
};

// Esquemas reutilizables
const schemas = {
  register: {
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { required: true, isEmail: true },
    password: { required: true, minLength: 6 },
  },
  login: {
    email: { required: true, isEmail: true },
    password: { required: true },
  },
};

module.exports = { validate, schemas };