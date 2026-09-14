const express = require('express');
const router = express.Router();
const {
  createDebitNote,
  getDebitNotes,
  getDebitNoteById,
  updateDebitNote,
  patchDebitNote,
  deleteDebitNote
} = require('../controllers/debitNoteController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getDebitNotes);
router.get('/:id', protect, getDebitNoteById);
router.post('/', protect, checkPermission('manage_accounts'), createDebitNote);
router.put('/:id', protect, checkPermission('manage_accounts'), updateDebitNote);
router.patch('/:id', protect, checkPermission('manage_accounts'), patchDebitNote);
router.delete('/:id', protect, checkPermission('manage_accounts'), deleteDebitNote);

module.exports = router;
