const express = require('express');
const router = express.Router();
const {
  createStockEntry,
  getStockEntries,
  getStockEntryById,
  updateStockEntry,
  patchStockEntry,
  deleteStockEntry
} = require('../controllers/stockEntryController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getStockEntries);
router.get('/:id', protect, getStockEntryById);
router.post('/', protect, checkPermission('manage_stock'), createStockEntry);
router.put('/:id', protect, checkPermission('manage_stock'), updateStockEntry);
router.patch('/:id', protect, checkPermission('manage_stock'), patchStockEntry);
router.delete('/:id', protect, checkPermission('manage_stock'), deleteStockEntry);

module.exports = router;
