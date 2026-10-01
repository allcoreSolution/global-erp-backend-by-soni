const express = require('express');
const router = express.Router();
const { 
  createSaleReturn, 
  getSaleReturns, 
  getSaleReturnById, 
  updateSaleReturn, 
  deleteSaleReturn 
} = require('../controllers/saleReturnController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createSaleReturn)
  .get(protect, getSaleReturns);

router.route('/:id')
  .get(protect, getSaleReturnById)
  .put(protect, updateSaleReturn)
  .delete(protect, deleteSaleReturn);

module.exports = router;
