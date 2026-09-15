const express = require('express');
const router = express.Router();
const { 
  createStockTransfer, 
  getStockTransfers, 
  getStockTransferById, 
  updateStockTransfer, 
  deleteStockTransfer 
} = require('../controllers/stockTransferController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createStockTransfer)
  .get(protect, getStockTransfers);

router.route('/:id')
  .get(protect, getStockTransferById)
  .put(protect, updateStockTransfer)
  .delete(protect, deleteStockTransfer);

module.exports = router;
