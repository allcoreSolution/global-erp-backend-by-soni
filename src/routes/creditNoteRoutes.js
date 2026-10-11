const express = require('express');
const router = express.Router();
const { 
  createCreditNote, 
  getCreditNotes, 
  getCreditNoteById, 
  updateCreditNote, 
  deleteCreditNote,
  importCreditNotes
} = require('../controllers/creditNoteController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/import').post(protect, checkPermission('create_credit_notes'), importCreditNotes);

router.route('/')
  .post(protect, checkPermission('create_credit_notes'), createCreditNote)
  .get(protect, checkPermission('view_credit_notes'), getCreditNotes);

router.route('/:id')
  .get(protect, checkPermission('view_credit_notes'), getCreditNoteById)
  .put(protect, checkPermission('edit_credit_notes'), updateCreditNote)
  .delete(protect, checkPermission('delete_credit_notes'), deleteCreditNote);

module.exports = router;
