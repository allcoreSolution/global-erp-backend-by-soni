const express = require('express');
const router = express.Router();
const {
  createLedger,
  getLedgers,
  getLedgerById,
  updateLedger,
  deleteLedger
} = require('../controllers/accountLedgerController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.post('/', protect, checkPermission('manage_hrms'), createLedger);
router.get('/', protect, checkPermission('manage_hrms'), getLedgers);
router.get('/:id', protect, checkPermission('manage_hrms'), getLedgerById);
router.put('/:id', protect, checkPermission('manage_hrms'), updateLedger);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteLedger);

module.exports = router;
