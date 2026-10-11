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

router.get('/', protect, checkPermission('view_units'), getUnits);
router.get('/:id', protect, checkPermission('view_units'), getUnitById);
router.post('/', protect, checkPermission('create_units'), createUnit);
router.put('/:id', protect, checkPermission('edit_units'), updateUnit);
router.patch('/:id', protect, checkPermission('edit_units'), patchUnit);
router.delete('/:id', protect, checkPermission('delete_units'), deleteUnit);

module.exports = router;
