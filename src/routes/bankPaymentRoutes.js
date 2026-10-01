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
  .post(protect, checkPermission('manage_finance'), createBankPayment)
  .get(protect, getBankPayments);

router.route('/:id')
  .get(protect, getBankPaymentById)
  .put(protect, checkPermission('manage_finance'), updateBankPayment)
  .delete(protect, checkPermission('manage_finance'), deleteBankPayment);

module.exports = router;
