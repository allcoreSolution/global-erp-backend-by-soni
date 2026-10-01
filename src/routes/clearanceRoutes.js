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

router.get('/', protect, getClearances);
router.get('/:id', protect, getClearanceById);
router.post('/', protect, checkPermission('manage_accounts'), createClearance);
router.put('/:id', protect, checkPermission('manage_accounts'), updateClearance);
router.patch('/:id', protect, checkPermission('manage_accounts'), patchClearance);
router.delete('/:id', protect, checkPermission('manage_accounts'), deleteClearance);

module.exports = router;
