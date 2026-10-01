const { Product, Category, Brand, Unit, Adjustment, StockCount } = require('../models/Product');

// Product Controllers
const addProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.company) {
      if (req.user?.companyId) payload.company = req.user.companyId;
      else delete payload.company;
    }
    const product = await Product.create(payload);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const query = req.user?.companyId ? { company: req.user.companyId } : {};
    const products = await Product.find(query).populate('brand category');
    res.json({ success: true, data: products });
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
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
// Categories Controllers
const addCategory = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.company) {
      if (req.user?.companyId) payload.company = req.user.companyId;
      else delete payload.company;
    }
    if (!payload.branch) delete payload.branch;
    const category = await Category.create(payload);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ company: req.user?.companyId });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    if (req.body.company === '') delete req.body.company;
    if (req.body.branch === '') delete req.body.branch;
    
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!category) {
      res.status(404);
      return next(new Error('Category not found'));
    }
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404);
      return next(new Error('Category not found'));
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Brands Controllers
const addBrand = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.company) {
      if (req.user?.companyId) payload.company = req.user.companyId;
      else delete payload.company;
    }
    if (!payload.branch) delete payload.branch;
    
    const brand = await Brand.create(payload);
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ company: req.user?.companyId });
    res.json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    if (req.body.company === '') delete req.body.company;
    if (req.body.branch === '') delete req.body.branch;
    
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!brand) {
      res.status(404);
      return next(new Error('Brand not found'));
    }
    res.json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      res.status(404);
      return next(new Error('Brand not found'));
    }
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Units Controllers
const addUnit = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.company) {
      if (req.user?.companyId) payload.company = req.user.companyId;
      else delete payload.company;
    }
    const unit = await Unit.create(payload);
    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

const getUnits = async (req, res, next) => {
  try {
    const units = await Unit.find({ company: req.user?.companyId });
    res.json({ success: true, data: units });
  } catch (error) {
    next(error);
  }
};

const updateUnit = async (req, res, next) => {
  try {
    if (req.body.company === '') delete req.body.company;

    const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!unit) {
      res.status(404);
      return next(new Error('Unit not found'));
    }
    res.json({ success: true, data: unit });
  } catch (error) {
    next(error);
  }
};

const deleteUnit = async (req, res, next) => {
  try {
    const unit = await Unit.findByIdAndDelete(req.params.id);
    if (!unit) {
      res.status(404);
      return next(new Error('Unit not found'));
    }
    res.json({ success: true, message: 'Unit deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Adjustments Controllers
const addAdjustment = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.company) {
      if (req.user?.companyId) payload.company = req.user.companyId;
      else delete payload.company;
    }
    const adjustment = await Adjustment.create(payload);
    res.status(201).json({ success: true, data: adjustment });
  } catch (error) {
    next(error);
  }
};

const getAdjustments = async (req, res, next) => {
  try {
    const adjustments = await Adjustment.find({ company: req.user?.companyId });
    res.json({ success: true, data: adjustments });
  } catch (error) {
    next(error);
  }
};

// Stock Count Controllers
const addStockCount = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.company && req.user?.companyId) {
      payload.company = req.user.companyId;
    }
    if (!payload.reference) {
      payload.reference = `STK-009${Math.floor(10 + Math.random() * 90)}`;
    }
    const stockCount = await StockCount.create(payload);
    res.status(201).json({ success: true, data: stockCount });
  } catch (error) {
    next(error);
  }
};

const getStockCounts = async (req, res, next) => {
  try {
    const stockCounts = await StockCount.find({ company: req.user?.companyId });
    res.json({ success: true, data: stockCounts });
  } catch (error) {
    next(error);
  }
};

const updateStockCount = async (req, res, next) => {
  try {
    const stockCount = await StockCount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!stockCount) {
      res.status(404);
      return next(new Error('StockCount not found'));
    }
    res.json({ success: true, data: stockCount });
  } catch (error) {
    next(error);
  }
};

const deleteStockCount = async (req, res, next) => {
  try {
    const stockCount = await StockCount.findByIdAndDelete(req.params.id);
    if (!stockCount) {
      res.status(404);
      return next(new Error('StockCount not found'));
    }
    res.json({ success: true, message: 'StockCount deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  addBrand,
  getBrands,
  updateBrand,
  deleteBrand,
  addUnit,
  getUnits,
  updateUnit,
  deleteUnit,
  addAdjustment,
  getAdjustments,
  addStockCount,
  getStockCounts,
  updateStockCount,
  deleteStockCount
};
