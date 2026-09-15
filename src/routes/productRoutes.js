const express = require('express');
const router = express.Router();
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
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
  getAdjustments
} = require('../controllers/productController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

// Product Routes
router.get('/', protect, getProducts);
router.get('/search', protect, searchProducts);
router.post('/', protect, checkPermission('manage_stock'), addProduct);
router.put('/:id', protect, checkPermission('manage_stock'), updateProduct);
router.delete('/:id', protect, checkPermission('manage_stock'), deleteProduct);

// Category Routes
router.get('/categories', protect, getCategories);
router.post('/categories', protect, checkPermission('manage_stock'), addCategory);
router.put('/categories/:id', protect, checkPermission('manage_stock'), updateCategory);
router.delete('/categories/:id', protect, checkPermission('manage_stock'), deleteCategory);

// Brand Routes
router.get('/brands', protect, getBrands);
router.post('/brands', protect, checkPermission('manage_stock'), addBrand);
router.put('/brands/:id', protect, checkPermission('manage_stock'), updateBrand);
router.delete('/brands/:id', protect, checkPermission('manage_stock'), deleteBrand);

// Unit Routes
router.get('/units', protect, getUnits);
router.post('/units', protect, checkPermission('manage_stock'), addUnit);
router.put('/units/:id', protect, checkPermission('manage_stock'), updateUnit);
router.delete('/units/:id', protect, checkPermission('manage_stock'), deleteUnit);

// Adjustment Routes
router.get('/adjustments', protect, getAdjustments);
router.post('/adjustments', protect, checkPermission('manage_stock'), addAdjustment);

// Product BY ID Route (Must be at the end to prevent catching /categories)
router.get('/:id', protect, getProductById);

module.exports = router;
