const express = require('express');
const router = express.Router();
const {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getLedgerStatement,
  importVouchers
} = require('../controllers/voucherController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

// Statement/Report endpoints must come before /:id
router.get('/statement', protect, checkPermission('view_vouchers'), getLedgerStatement);
router.post('/import', protect, checkPermission('create_vouchers'), importVouchers);

router.post('/', protect, checkPermission('create_vouchers'), createVoucher);
router.get('/', protect, checkPermission('view_vouchers'), getVouchers);
router.get('/:id', protect, checkPermission('view_vouchers'), getVoucherById);
router.put('/:id', protect, checkPermission('edit_vouchers'), updateVoucher);
router.delete('/:id', protect, checkPermission('delete_vouchers'), deleteVoucher);

module.exports = router;
