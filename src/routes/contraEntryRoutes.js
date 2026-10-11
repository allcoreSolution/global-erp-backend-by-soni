const express = require('express');
const router = express.Router();
const {
  createContraEntry,
  getContraEntries,
  getContraEntryById,
  updateContraEntry,
  patchContraEntry,
  deleteContraEntry
} = require('../controllers/contraEntryController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, checkPermission('view_contra_entries'), getContraEntries);
router.get('/:id', protect, checkPermission('view_contra_entries'), getContraEntryById);
router.post('/', protect, checkPermission('create_contra_entries'), createContraEntry);
router.put('/:id', protect, checkPermission('edit_contra_entries'), updateContraEntry);
router.patch('/:id', protect, checkPermission('edit_contra_entries'), patchContraEntry);
router.delete('/:id', protect, checkPermission('delete_contra_entries'), deleteContraEntry);

module.exports = router;
