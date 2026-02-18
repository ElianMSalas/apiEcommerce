const express = require('express');
const router = express.Router();
const { getAll, getBySlug, create, update, remove } = require('../controllers/category.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { uploadCategoryImage } = require('../config/cloudinary');

router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', authenticate, authorizeAdmin, uploadCategoryImage, create);
router.put('/:id', authenticate, authorizeAdmin, uploadCategoryImage, update);
router.delete('/:id', authenticate, authorizeAdmin, remove);

module.exports = router;