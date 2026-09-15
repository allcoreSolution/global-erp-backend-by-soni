const express = require('express');
const router = express.Router();
const { 
  createCreditNote, 
  getCreditNotes, 
  getCreditNoteById, 
  updateCreditNote, 
  deleteCreditNote 
} = require('../controllers/creditNoteController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('manage_sales'), createCreditNote)
  .get(protect, getCreditNotes);

router.route('/:id')
  .get(protect, getCreditNoteById)
  .put(protect, checkPermission('manage_sales'), updateCreditNote)
  .delete(protect, checkPermission('manage_sales'), deleteCreditNote);

module.exports = router;
