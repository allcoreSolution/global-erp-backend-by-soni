const express = require('express');
const router = express.Router();
const {
  createVoucher,
  getVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  getLedgerStatement
} = require('../controllers/voucherController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

// Statement/Report endpoints must come before /:id
router.get('/statement', protect, checkPermission('manage_hrms'), getLedgerStatement);

router.post('/', protect, checkPermission('manage_hrms'), createVoucher);
router.get('/', protect, checkPermission('manage_hrms'), getVouchers);
router.get('/:id', protect, checkPermission('manage_hrms'), getVoucherById);
router.put('/:id', protect, checkPermission('manage_hrms'), updateVoucher);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteVoucher);

module.exports = router;
