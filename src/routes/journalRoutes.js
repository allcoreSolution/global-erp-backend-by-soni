const express = require('express');
const router = express.Router();
const { 
  createJournal, 
  getJournals, 
  getJournalById, 
  updateJournal, 
  deleteJournal 
} = require('../controllers/journalController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('manage_finance'), createJournal)
  .get(protect, getJournals);

router.route('/:id')
  .get(protect, getJournalById)
  .put(protect, checkPermission('manage_finance'), updateJournal)
  .delete(protect, checkPermission('manage_finance'), deleteJournal);

module.exports = router;
