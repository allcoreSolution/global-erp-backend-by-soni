const express = require('express');
const router = express.Router();
const { 
  createDebitNote, 
  getDebitNotes, 
  getDebitNoteById, 
  updateDebitNote, 
  deleteDebitNote,
  importDebitNotes
} = require('../controllers/debitNoteController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/import').post(protect, checkPermission('create_debit_notes'), importDebitNotes);

router.route('/')
  .post(protect, checkPermission('create_debit_notes'), createDebitNote)
  .get(protect, checkPermission('view_debit_notes'), getDebitNotes);

router.route('/:id')
  .get(protect, checkPermission('view_debit_notes'), getDebitNoteById)
  .put(protect, checkPermission('edit_debit_notes'), updateDebitNote)
  .delete(protect, checkPermission('delete_debit_notes'), deleteDebitNote);

module.exports = router;
