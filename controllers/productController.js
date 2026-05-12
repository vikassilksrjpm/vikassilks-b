const Product = require('../models/Product');

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { category, subcategory } = req.query;
    const filter = {};
    if (category) filter.category = category.toLowerCase();
    if (subcategory) filter.subcategory = subcategory.toLowerCase();
    const products = await Product.find(filter).select('name description price image category subcategory stock tags sizes');
    res.status(200).json({ success: true, products });
  } catch (error) { next(error); }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, product });
  } catch (error) { next(error); }
};

// GET /api/products/tag/:tag
exports.getProductsByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const products = await Product.find({ tags: tag }).select('name description price image category subcategory stock tags');
    res.status(200).json({ success: true, products });
  } catch (error) { next(error); }
};

// GET /api/admin/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) { next(error); }
};

// POST /api/admin/products
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, category, subcategory, stock } = req.body;
    if (!name || !price || !category || !subcategory) {
      return res.status(400).json({ success: false, message: 'Name, price, category and subcategory are required' });
    }
    const product = await Product.create({ name, description, price, image, category, subcategory, stock });
    res.status(201).json({ success: true, product });
  } catch (error) { next(error); }
};

// PUT /api/admin/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, product });
  } catch (error) { next(error); }
};

// DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) { next(error); }
};
