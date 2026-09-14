const express = require('express');
const router = express.Router();
const {
  createBankPayment,
  getBankPayments,
  getBankPaymentById,
  updateBankPayment,
  patchBankPayment,
  deleteBankPayment
} = require('../controllers/bankPaymentController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getBankPayments);
router.get('/:id', protect, getBankPaymentById);
router.post('/', protect, checkPermission('manage_accounts'), createBankPayment);
router.put('/:id', protect, checkPermission('manage_accounts'), updateBankPayment);
router.patch('/:id', protect, checkPermission('manage_accounts'), patchBankPayment);
router.delete('/:id', protect, checkPermission('manage_accounts'), deleteBankPayment);

module.exports = router;
