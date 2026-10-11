const express = require('express');
const router = express.Router();
const {
  createTaxSlab,
  getTaxSlabs,
  getTaxSlabById,
  updateTaxSlab,
  patchTaxSlab,
  deleteTaxSlab
} = require('../controllers/taxSlabController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, checkPermission('view_tax_slabs'), getTaxSlabs);
router.get('/:id', protect, checkPermission('view_tax_slabs'), getTaxSlabById);
router.post('/', protect, checkPermission('create_tax_slabs'), createTaxSlab);
router.put('/:id', protect, checkPermission('edit_tax_slabs'), updateTaxSlab);
router.patch('/:id', protect, checkPermission('edit_tax_slabs'), patchTaxSlab);
router.delete('/:id', protect, checkPermission('delete_tax_slabs'), deleteTaxSlab);

module.exports = router;
