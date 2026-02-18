const express = require('express');
const router = express.Router();
const { getAll, getBySlug, create, update, remove } = require('../controllers/product.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { uploadProductImages } = require('../config/cloudinary');

router.get('/', getAll);
router.get('/:slug', getBySlug);
router.post('/', authenticate, authorizeAdmin, uploadProductImages, create);
router.put('/:id', authenticate, authorizeAdmin, uploadProductImages, update);
router.delete('/:id', authenticate, authorizeAdmin, remove);

module.exports = router;