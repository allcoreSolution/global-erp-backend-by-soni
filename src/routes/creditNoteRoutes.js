const express = require('express');
const router = express.Router();
const {
  createCreditNote,
  getCreditNotes,
  getCreditNoteById,
  updateCreditNote,
  patchCreditNote,
  deleteCreditNote
} = require('../controllers/creditNoteController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getCreditNotes);
router.get('/:id', protect, getCreditNoteById);
router.post('/', protect, checkPermission('manage_accounts'), createCreditNote);
router.put('/:id', protect, checkPermission('manage_accounts'), updateCreditNote);
router.patch('/:id', protect, checkPermission('manage_accounts'), patchCreditNote);
router.delete('/:id', protect, checkPermission('manage_accounts'), deleteCreditNote);

module.exports = router;
