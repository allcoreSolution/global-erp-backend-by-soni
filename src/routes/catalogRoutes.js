const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middlewares/authMiddleware');
const {
  getBillers,
  createBiller,
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getCurrencies,
  createCurrency
} = require('../controllers/catalogController');

router.get('/billers', protect, checkPermission('view_catalog_stock'), getBillers);
router.post('/billers', protect, checkPermission('create_catalog_stock'), createBiller);

router.get('/warehouses', protect, checkPermission('view_catalog_stock'), getWarehouses);
router.post('/warehouses', protect, checkPermission('create_catalog_stock'), createWarehouse);
router.put('/warehouses/:id', protect, checkPermission('edit_catalog_stock'), updateWarehouse);
router.delete('/warehouses/:id', protect, checkPermission('delete_catalog_stock'), deleteWarehouse);

router.get('/currencies', protect, checkPermission('view_currencies'), getCurrencies);
router.post('/currencies', protect, checkPermission('create_currencies'), createCurrency);

module.exports = router;
