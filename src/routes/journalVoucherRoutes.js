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

router.get('/', protect, checkPermission('view_journal_vouchers'), getJournalVouchers);
router.get('/:id', protect, checkPermission('view_journal_vouchers'), getJournalVoucherById);
router.post('/', protect, checkPermission('create_journal_vouchers'), createJournalVoucher);
router.put('/:id', protect, checkPermission('edit_journal_vouchers'), updateJournalVoucher);
router.patch('/:id', protect, checkPermission('edit_journal_vouchers'), patchJournalVoucher);
router.delete('/:id', protect, checkPermission('delete_journal_vouchers'), deleteJournalVoucher);

module.exports = router;
