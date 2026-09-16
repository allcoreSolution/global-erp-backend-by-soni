const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getBillers,
  createBiller,
  getWarehouses,
  createWarehouse,
  getCurrencies,
  createCurrency
} = require('../controllers/catalogController');

router.get('/billers', protect, getBillers);
router.post('/billers', protect, createBiller);

router.get('/warehouses', protect, getWarehouses);
router.post('/warehouses', protect, createWarehouse);

router.get('/currencies', protect, getCurrencies);
router.post('/currencies', protect, createCurrency);

module.exports = router;
