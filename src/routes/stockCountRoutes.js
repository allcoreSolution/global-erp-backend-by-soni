const express = require('express');
const router = express.Router();
const {
  createStockCount,
  getStockCounts,
  getStockCountById,
  updateStockCount,
  patchStockCount,
  deleteStockCount
} = require('../controllers/stockCountController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getStockCounts);
router.get('/:id', protect, getStockCountById);
router.post('/', protect, checkPermission('manage_stock'), createStockCount);
router.put('/:id', protect, checkPermission('manage_stock'), updateStockCount);
router.patch('/:id', protect, checkPermission('manage_stock'), patchStockCount);
router.delete('/:id', protect, checkPermission('manage_stock'), deleteStockCount);

module.exports = router;
