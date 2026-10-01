const express = require('express');
const router = express.Router();
const { 
  createStockEntry, 
  getStockEntries, 
  getStockEntryById, 
  updateStockEntry, 
  deleteStockEntry 
} = require('../controllers/stockEntryController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createStockEntry)
  .get(protect, getStockEntries);

router.route('/:id')
  .get(protect, getStockEntryById)
  .put(protect, updateStockEntry)
  .delete(protect, deleteStockEntry);

module.exports = router;
