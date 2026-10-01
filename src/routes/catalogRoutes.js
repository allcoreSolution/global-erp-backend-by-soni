const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
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

router.get('/billers', protect, getBillers);
router.post('/billers', protect, createBiller);

router.get('/warehouses', protect, getWarehouses);
router.post('/warehouses', protect, createWarehouse);
router.put('/warehouses/:id', protect, updateWarehouse);
router.delete('/warehouses/:id', protect, deleteWarehouse);

router.get('/currencies', protect, getCurrencies);
router.post('/currencies', protect, createCurrency);

module.exports = router;
