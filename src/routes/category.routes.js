const express = require('express');
const router = express.Router();
const { getAll, getBySlug, create, update, remove } = require('../controllers/category.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { uploadCategoryImage } = require('../config/cloudinary');

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     description: Lista todas las categorías disponibles
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       description:
 *                         type: string
 *                       image:
 *                         type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/categories/{slug}:
 *   get:
 *     summary: Obtener categoría por slug
 *     description: Obtiene una categoría específica con sus productos
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug de la categoría
 *         example: "electronica"
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: object
 *                 products:
 *                   type: array
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:slug', getBySlug);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crear nueva categoría (Admin)
 *     description: Crea una nueva categoría con imagen opcional
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la categoría
 *                 example: "Electrónica"
 *               description:
 *                 type: string
 *                 description: Descripción de la categoría
 *                 example: "Productos electrónicos y tecnología"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de la categoría
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.post('/', authenticate, authorizeAdmin, uploadCategoryImage, create);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Actualizar categoría (Admin)
 *     description: Actualiza una categoría existente
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
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
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.put('/:id', authenticate, authorizeAdmin, uploadCategoryImage, update);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Eliminar categoría (Admin)
 *     description: Elimina una categoría (solo si no tiene productos asociados)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       400:
 *         description: Categoría tiene productos asociados
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Permisos insuficientes
 */
router.delete('/:id', authenticate, authorizeAdmin, remove);

module.exports = router;