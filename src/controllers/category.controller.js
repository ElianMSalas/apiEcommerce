const { Category, Product } = require('../models/index');
const { generateSlug } = require('../utils/helpers');
const { deleteImage } = require('../config/cloudinary');

// GET /api/categories
const getAll = async (req, res) => {
  try {
    const { includeInactive } = req.query;

    const where = {};
    if (!includeInactive || includeInactive !== 'true') {
      where.isActive = true;
    }

    const categories = await Category.findAll({
      where,
      order: [['name', 'ASC']],
    });

    return res.status(200).json({ categories });
  } catch (error) {
    console.error('Error en getAll categories:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/categories/:slug
const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug, isActive: true },
      include: [{
        model: Product,
        as: 'products',
        where: { isActive: true },
        required: false,
      }],
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    return res.status(200).json({ category });
  } catch (error) {
    console.error('Error en getBySlug category:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/categories (admin)
const create = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }

    const slug = generateSlug(name);

    // Verificar slug único
    const existing = await Category.findOne({ where: { slug } });
    if (existing) {
      return res.status(409).json({ message: 'Ya existe una categoría con ese nombre' });
    }

    const imageUrl = req.file ? req.file.path : null;

    const category = await Category.create({
      name,
      slug,
      description,
      image: imageUrl,
    });

    return res.status(201).json({
      message: 'Categoría creada exitosamente',
      category,
    });
  } catch (error) {
    console.error('Error en create category:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PUT /api/categories/:id (admin)
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const updates = { description, isActive };

    if (name && name !== category.name) {
      const slug = generateSlug(name);
      const existing = await Category.findOne({ where: { slug } });
      if (existing && existing.id !== id) {
        return res.status(409).json({ message: 'Ya existe una categoría con ese nombre' });
      }
      updates.name = name;
      updates.slug = slug;
    }

    // Si subió nueva imagen, eliminar la anterior
    if (req.file) {
      if (category.image) await deleteImage(category.image);
      updates.image = req.file.path;
    }

    await category.update(updates);

    return res.status(200).json({
      message: 'Categoría actualizada exitosamente',
      category,
    });
  } catch (error) {
    console.error('Error en update category:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// DELETE /api/categories/:id (admin)
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Verificar si tiene productos activos
    const productCount = await Product.count({
      where: { categoryId: id, isActive: true },
    });

    if (productCount > 0) {
      return res.status(409).json({
        message: `No se puede eliminar, tiene ${productCount} producto(s) activo(s) asociado(s)`,
      });
    }

    if (category.image) await deleteImage(category.image);

    // Soft delete — solo desactivar
    await category.update({ isActive: false });

    return res.status(200).json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error en remove category:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getBySlug, create, update, remove };