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

router.get('/', protect, getContraEntries);
router.get('/:id', protect, getContraEntryById);
router.post('/', protect, checkPermission('manage_accounts'), createContraEntry);
router.put('/:id', protect, checkPermission('manage_accounts'), updateContraEntry);
router.patch('/:id', protect, checkPermission('manage_accounts'), patchContraEntry);
router.delete('/:id', protect, checkPermission('manage_accounts'), deleteContraEntry);

module.exports = router;
