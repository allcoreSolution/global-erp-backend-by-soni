const express = require('express');
const router = express.Router();
const {
  createHsnMapping,
  getHsnMappings,
  getHsnMappingById,
  updateHsnMapping,
  patchHsnMapping,
  deleteHsnMapping
} = require('../controllers/hsnMappingController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getHsnMappings);
router.get('/:id', protect, getHsnMappingById);
router.post('/', protect, checkPermission('manage_products'), createHsnMapping);
router.put('/:id', protect, checkPermission('manage_products'), updateHsnMapping);
router.patch('/:id', protect, checkPermission('manage_products'), patchHsnMapping);
router.delete('/:id', protect, checkPermission('manage_products'), deleteHsnMapping);

module.exports = router;
