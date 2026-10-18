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

router.get('/', protect, checkPermission('view_branches'), getBranches);
router.post('/bulk', protect, checkPermission('create_branches'), bulkImportBranches);
router.get('/:id', protect, checkPermission('view_branches'), getBranchById);
router.post('/', protect, checkPermission('create_branches'), createBranch);
router.put('/:id', protect, checkPermission('edit_branches'), updateBranch);
router.patch('/:id', protect, checkPermission('edit_branches'), patchBranch);
router.delete('/:id', protect, checkPermission('delete_branches'), deleteBranch);

module.exports = router;
