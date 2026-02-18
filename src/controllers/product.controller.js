const { Op } = require('sequelize');
const { Product, Category } = require('../models/index');
const { generateSlug } = require('../utils/helpers');
const { deleteImage } = require('../config/cloudinary');

// GET /api/products
const getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      featured,
      sortBy = 'createdAt',
      order = 'DESC',
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { isActive: true };

    // Filtros
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    if (featured === 'true') where.isFeatured = true;

    // Filtro por categoría
    const include = [{
      model: Category,
      as: 'category',
      attributes: ['id', 'name', 'slug'],
      where: category ? { slug: category, isActive: true } : { isActive: true },
    }];

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include,
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error en getAll products:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// GET /api/products/:slug
const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      where: { slug, isActive: true },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
    });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('Error en getBySlug product:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// POST /api/products (admin)
const create = async (req, res) => {
  try {
    const { name, description, price, comparePrice, stock, sku, categoryId, isFeatured } = req.body;

    // Validaciones básicas
    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'Nombre, precio y categoría son requeridos' });
    }

    // Verificar que la categoría exista
    const category = await Category.findOne({ where: { id: categoryId, isActive: true } });
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Verificar SKU único si se proporcionó
    if (sku) {
      const existingSku = await Product.findOne({ where: { sku } });
      if (existingSku) {
        return res.status(409).json({ message: 'El SKU ya está en uso' });
      }
    }

    const slug = generateSlug(name);
    const existing = await Product.findOne({ where: { slug } });
    if (existing) {
      return res.status(409).json({ message: 'Ya existe un producto con ese nombre' });
    }

    // Procesar imágenes subidas
    const images = req.files ? req.files.map((f) => f.path) : [];

    const product = await Product.create({
      name,
      slug,
      description,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      stock: parseInt(stock) || 0,
      sku,
      categoryId,
      isFeatured: isFeatured === 'true',
      images,
    });

    return res.status(201).json({
      message: 'Producto creado exitosamente',
      product,
    });
  } catch (error) {
    console.error('Error en create product:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// PUT /api/products/:id (admin)
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, comparePrice, stock, sku, categoryId, isFeatured, isActive, removeImages } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const updates = {
      description,
      price: price ? parseFloat(price) : product.price,
      comparePrice: comparePrice ? parseFloat(comparePrice) : product.comparePrice,
      stock: stock !== undefined ? parseInt(stock) : product.stock,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : product.isFeatured,
      isActive: isActive !== undefined ? isActive === 'true' : product.isActive,
      categoryId: categoryId || product.categoryId,
    };

    if (name && name !== product.name) {
      const slug = generateSlug(name);
      const existing = await Product.findOne({ where: { slug } });
      if (existing && existing.id !== id) {
        return res.status(409).json({ message: 'Ya existe un producto con ese nombre' });
      }
      updates.name = name;
      updates.slug = slug;
    }

    // Manejar imágenes existentes
    let currentImages = [...product.images];

    // Eliminar imágenes específicas si se solicitó
    if (removeImages) {
      const toRemove = JSON.parse(removeImages);
      for (const url of toRemove) {
        await deleteImage(url);
        currentImages = currentImages.filter((img) => img !== url);
      }
    }

    // Agregar nuevas imágenes
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => f.path);
      currentImages = [...currentImages, ...newImages];
    }

    updates.images = currentImages;

    await product.update(updates);

    return res.status(200).json({
      message: 'Producto actualizado exitosamente',
      product,
    });
  } catch (error) {
    console.error('Error en update product:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// DELETE /api/products/:id (admin)
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Soft delete
    await product.update({ isActive: false });

    return res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error en remove product:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getBySlug, create, update, remove };