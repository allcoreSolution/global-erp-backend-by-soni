const express = require('express');
const router = express.Router();
const {
  createJournalVoucher,
  getJournalVouchers,
  getJournalVoucherById,
  updateJournalVoucher,
  patchJournalVoucher,
  deleteJournalVoucher
} = require('../controllers/journalVoucherController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getJournalVouchers);
router.get('/:id', protect, getJournalVoucherById);
router.post('/', protect, checkPermission('manage_accounts'), createJournalVoucher);
router.put('/:id', protect, checkPermission('manage_accounts'), updateJournalVoucher);
router.patch('/:id', protect, checkPermission('manage_accounts'), patchJournalVoucher);
router.delete('/:id', protect, checkPermission('manage_accounts'), deleteJournalVoucher);

module.exports = router;
