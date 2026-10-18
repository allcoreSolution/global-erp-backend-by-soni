const express = require('express');
const router = express.Router();
const {
  createClearance,
  getClearances,
  getClearanceById,
  updateClearance,
  patchClearance,
  deleteClearance
} = require('../controllers/clearanceController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, checkPermission('view_clearance'), getClearances);
router.get('/:id', protect, checkPermission('view_clearance'), getClearanceById);
router.post('/', protect, checkPermission('create_clearance'), createClearance);
router.put('/:id', protect, checkPermission('edit_clearance'), updateClearance);
router.patch('/:id', protect, checkPermission('edit_clearance'), patchClearance);
router.delete('/:id', protect, checkPermission('delete_clearance'), deleteClearance);

module.exports = router;
