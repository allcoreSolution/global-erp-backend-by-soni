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

router.route('/import').post(protect, importDebitNotes);

router.route('/')
  .post(protect, checkPermission('manage_purchases'), createDebitNote)
  .get(protect, getDebitNotes);

router.route('/:id')
  .get(protect, getDebitNoteById)
  .put(protect, checkPermission('manage_purchases'), updateDebitNote)
  .delete(protect, checkPermission('manage_purchases'), deleteDebitNote);

module.exports = router;
