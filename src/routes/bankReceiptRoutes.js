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
  .post(protect, checkPermission('create_bank_receipts'), createBankReceipt)
  .get(protect, checkPermission('view_bank_receipts'), getBankReceipts);

router.route('/:id')
  .get(protect, checkPermission('view_bank_receipts'), getBankReceiptById)
  .put(protect, checkPermission('edit_bank_receipts'), updateBankReceipt)
  .delete(protect, checkPermission('delete_bank_receipts'), deleteBankReceipt);

module.exports = router;
