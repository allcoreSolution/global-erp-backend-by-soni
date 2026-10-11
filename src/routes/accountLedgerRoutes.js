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

router.post('/', protect, checkPermission('create_ledgers'), createLedger);
router.get('/', protect, checkPermission('view_ledgers'), getLedgers);
router.get('/:id', protect, checkPermission('view_ledgers'), getLedgerById);
router.put('/:id', protect, checkPermission('edit_ledgers'), updateLedger);
router.delete('/:id', protect, checkPermission('delete_ledgers'), deleteLedger);

module.exports = router;
