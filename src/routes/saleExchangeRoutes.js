const express = require('express');
const router = express.Router();
const { 
  createSaleExchange, 
  getSaleExchanges, 
  getSaleExchangeById, 
  updateSaleExchange, 
  deleteSaleExchange 
} = require('../controllers/saleExchangeController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createSaleExchange)
  .get(protect, getSaleExchanges);

router.route('/:id')
  .get(protect, getSaleExchangeById)
  .put(protect, updateSaleExchange)
  .delete(protect, deleteSaleExchange);

module.exports = router;
