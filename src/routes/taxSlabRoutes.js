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

router.get('/', protect, getTaxSlabs);
router.get('/:id', protect, getTaxSlabById);
router.post('/', protect, checkPermission('manage_products'), createTaxSlab);
router.put('/:id', protect, checkPermission('manage_products'), updateTaxSlab);
router.patch('/:id', protect, checkPermission('manage_products'), patchTaxSlab);
router.delete('/:id', protect, checkPermission('manage_products'), deleteTaxSlab);

module.exports = router;
