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
  .post(protect, checkPermission('create_journals'), createJournal)
  .get(protect, checkPermission('view_journals'), getJournals);

router.route('/:id')
  .get(protect, checkPermission('view_journals'), getJournalById)
  .put(protect, checkPermission('edit_journals'), updateJournal)
  .delete(protect, checkPermission('delete_journals'), deleteJournal);

module.exports = router;
