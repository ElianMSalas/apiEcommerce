const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage para productos
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// Storage para categorías
const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ecommerce/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
  },
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no válido. Use JPG, PNG o WebP'), false);
  }
};

const uploadProductImages = multer({
  storage: productStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
}).array('images', 5); // máximo 5 imágenes

const uploadCategoryImage = multer({
  storage: categoryStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
}).single('image');

// Helper para eliminar imagen de Cloudinary
const deleteImage = async (imageUrl) => {
  try {
    // Extraer public_id de la URL
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts.slice(-2).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error);
  }
};

module.exports = { cloudinary, uploadProductImages, uploadCategoryImage, deleteImage };