const express = require('express');
const router = express.Router();
const { 
  createBankReceipt, 
  getBankReceipts, 
  getBankReceiptById, 
  updateBankReceipt, 
  deleteBankReceipt 
} = require('../controllers/bankReceiptController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('manage_finance'), createBankReceipt)
  .get(protect, getBankReceipts);

router.route('/:id')
  .get(protect, getBankReceiptById)
  .put(protect, checkPermission('manage_finance'), updateBankReceipt)
  .delete(protect, checkPermission('manage_finance'), deleteBankReceipt);

module.exports = router;
