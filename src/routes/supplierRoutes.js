const express = require('express');
const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  patchSupplier,
  deleteSupplier,
  getSuppliersLedgerSummary,
  getSupplierLedgerDetails
} = require('../controllers/supplierController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/ledger/summary', protect, checkPermission('view_suppliers'), getSuppliersLedgerSummary);
router.get('/:id/ledger', protect, checkPermission('view_suppliers'), getSupplierLedgerDetails);

router.get('/', protect, checkPermission('view_suppliers'), getSuppliers);
router.get('/:id', protect, checkPermission('view_suppliers'), getSupplierById);
router.post('/', protect, checkPermission('create_suppliers'), createSupplier);
router.put('/:id', protect, checkPermission('edit_suppliers'), updateSupplier);
router.patch('/:id', protect, checkPermission('edit_suppliers'), patchSupplier);
router.delete('/:id', protect, checkPermission('delete_suppliers'), deleteSupplier);

module.exports = router;
