const { Product, Category, Brand } = require('../models/Product');

// Product Controllers
const addProduct = async (req, res, next) => {
  try {
    const productExists = await Product.findOne({ sku: req.body.sku });
    if (productExists) {
      res.status(400);
      return next(new Error('Product SKU already exists'));
    }

    const product = await Product.create({ ...req.body, company: req.user?.companyId });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ company: req.user?.companyId, isActive: true }).populate('brand').populate('category');
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('brand').populate('category');
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }
    product.isActive = false; // Soft delete
    await product.save();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Search products by name, SKU or barcode (useful for POS scanner)
const searchProducts = async (req, res, next) => {
  const { query } = req.query;
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { sku: { $regex: query, $options: 'i' } },
        { barcode: query }
      ]
    }).populate('brand').populate('category');
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

// Categories Controllers
const addCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ company: req.user?.companyId, company: req.user?.companyId });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// Brands Controllers
const addBrand = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const brand = await Brand.create({ name, description });
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ company: req.user?.companyId, company: req.user?.companyId });
    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  addCategory,
  getCategories,
  addBrand,
  getBrands
};
