const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getProductsByTag, getAllProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/products', getProducts);
router.get('/products/tag/:tag', getProductsByTag);
router.get('/products/:id', getProductById);
router.get('/admin/products', protect, adminOnly, getAllProducts);
router.post('/admin/products', protect, adminOnly, createProduct);
router.put('/admin/products/:id', protect, adminOnly, updateProduct);
router.delete('/admin/products/:id', protect, adminOnly, deleteProduct);

module.exports = router;
