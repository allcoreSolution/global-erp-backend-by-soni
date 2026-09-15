const express = require('express');
const router = express.Router();
const { 
  createReceipt, 
  getReceipts, 
  getReceiptById, 
  updateReceipt, 
  deleteReceipt 
} = require('../controllers/receiptController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createReceipt)
  .get(protect, getReceipts);

router.route('/:id')
  .get(protect, getReceiptById)
  .put(protect, updateReceipt)
  .delete(protect, deleteReceipt);

module.exports = router;
