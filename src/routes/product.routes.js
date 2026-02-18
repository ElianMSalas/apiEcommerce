const express = require('express');
const router = express.Router();
const { getAll, getBySlug, create, update, remove } = require('../controllers/product.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { uploadProductImages } = require('../config/cloudinary');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     description: Lista todos los productos con paginación, búsqueda y filtros
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Productos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o descripción
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría (slug)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, name_asc, name_desc, newest]
 *         description: Ordenar resultados
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/products/{slug}:
 *   get:
 *     summary: Obtener producto por slug
 *     description: Obtiene el detalle completo de un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug del producto
 *         example: "laptop-dell-inspiron"
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     stock:
 *                       type: integer
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     category:
 *                       type: object
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:slug', getBySlug);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto (Admin)
 *     description: Crea un nuevo producto con imágenes
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laptop Dell Inspiron"
 *               description:
 *                 type: string
 *                 example: "Laptop potente para trabajo y gaming"
 *               price:
 *                 type: number
 *                 example: 899.99
 *               stock:
 *                 type: integer
 *                 example: 15
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Hasta 5 imágenes
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.post('/', authenticate, authorizeAdmin, uploadProductImages, create);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto (Admin)
 *     description: Actualiza un producto existente
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.put('/:id', authenticate, authorizeAdmin, uploadProductImages, update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar producto (Admin)
 *     description: Desactiva un producto (soft delete)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.delete('/:id', authenticate, authorizeAdmin, remove);

module.exports = router;