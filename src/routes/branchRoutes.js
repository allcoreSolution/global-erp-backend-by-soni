const express = require('express');
const router = express.Router();
const {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  patchBranch,
  deleteBranch,
  bulkImportBranches
} = require('../controllers/branchController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getBranches);
router.post('/bulk', protect, checkPermission('manage_settings'), bulkImportBranches);
router.get('/:id', protect, getBranchById);
router.post('/', protect, checkPermission('manage_settings'), createBranch);
router.put('/:id', protect, checkPermission('manage_settings'), updateBranch);
router.patch('/:id', protect, checkPermission('manage_settings'), patchBranch);
router.delete('/:id', protect, checkPermission('manage_settings'), deleteBranch);

module.exports = router;
