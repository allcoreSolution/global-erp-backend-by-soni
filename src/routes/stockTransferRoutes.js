const express = require('express');
const router = express.Router();
const {
  createStockTransfer,
  getStockTransfers,
  getStockTransferById,
  updateStockTransfer,
  patchStockTransfer,
  deleteStockTransfer
} = require('../controllers/stockTransferController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getStockTransfers);
router.get('/:id', protect, getStockTransferById);
router.post('/', protect, checkPermission('manage_stock'), createStockTransfer);
router.put('/:id', protect, checkPermission('manage_stock'), updateStockTransfer);
router.patch('/:id', protect, checkPermission('manage_stock'), patchStockTransfer);
router.delete('/:id', protect, checkPermission('manage_stock'), deleteStockTransfer);

module.exports = router;
