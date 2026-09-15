const express = require('express');
const router = express.Router();
const {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  patchSupplier,
  deleteSupplier
} = require('../controllers/supplierController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getSuppliers);
router.get('/:id', protect, getSupplierById);
router.post('/', protect, checkPermission('manage_stock'), createSupplier);
router.put('/:id', protect, checkPermission('manage_stock'), updateSupplier);
router.patch('/:id', protect, checkPermission('manage_stock'), patchSupplier);
router.delete('/:id', protect, checkPermission('manage_stock'), deleteSupplier);

module.exports = router;
