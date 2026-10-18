const express = require('express');
const router = express.Router();
const {
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
  getAdjustments
} = require('../controllers/productController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

// Product Routes
router.get('/', protect, checkPermission('view_products'), getProducts);
router.post('/', protect, checkPermission('create_products'), addProduct);
router.put('/:id', protect, checkPermission('edit_products'), updateProduct);
router.delete('/:id', protect, checkPermission('delete_products'), deleteProduct);
// Category Routes
router.get('/categories', protect, checkPermission('view_products'), getCategories);
router.post('/categories', protect, checkPermission('create_products'), addCategory);
router.put('/categories/:id', protect, checkPermission('edit_products'), updateCategory);
router.delete('/categories/:id', protect, checkPermission('delete_products'), deleteCategory);

// Brand Routes
router.get('/brands', protect, checkPermission('view_products'), getBrands);
router.post('/brands', protect, checkPermission('create_products'), addBrand);
router.put('/brands/:id', protect, checkPermission('edit_products'), updateBrand);
router.delete('/brands/:id', protect, checkPermission('delete_products'), deleteBrand);

// Unit Routes
router.get('/units', protect, checkPermission('view_products'), getUnits);
router.post('/units', protect, checkPermission('create_products'), addUnit);
router.put('/units/:id', protect, checkPermission('edit_products'), updateUnit);
router.delete('/units/:id', protect, checkPermission('delete_products'), deleteUnit);

// Adjustment Routes
router.get('/adjustments', protect, checkPermission('view_adjustments'), getAdjustments);
router.post('/adjustments', protect, checkPermission('create_adjustments'), addAdjustment);

// Product BY ID Route removed

module.exports = router;
