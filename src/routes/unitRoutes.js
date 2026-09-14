const express = require('express');
const router = express.Router();
const {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  patchUnit,
  deleteUnit
} = require('../controllers/unitController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getUnits);
router.get('/:id', protect, getUnitById);
router.post('/', protect, checkPermission('manage_products'), createUnit);
router.put('/:id', protect, checkPermission('manage_products'), updateUnit);
router.patch('/:id', protect, checkPermission('manage_products'), patchUnit);
router.delete('/:id', protect, checkPermission('manage_products'), deleteUnit);

module.exports = router;
