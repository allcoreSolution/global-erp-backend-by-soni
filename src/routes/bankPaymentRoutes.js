const express = require('express');
const router = express.Router();
const { 
  createBankPayment, 
  getBankPayments, 
  getBankPaymentById, 
  updateBankPayment, 
  deleteBankPayment 
} = require('../controllers/bankPaymentController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('create_bank_payments'), createBankPayment)
  .get(protect, checkPermission('view_bank_payments'), getBankPayments);

router.route('/:id')
  .get(protect, checkPermission('view_bank_payments'), getBankPaymentById)
  .put(protect, checkPermission('edit_bank_payments'), updateBankPayment)
  .delete(protect, checkPermission('delete_bank_payments'), deleteBankPayment);

module.exports = router;
