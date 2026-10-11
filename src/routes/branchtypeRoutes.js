const express = require('express');
const router = express.Router();
const branchtypeController = require('../controllers/branchtypeController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(checkPermission('view_branch_types'), branchtypeController.getAllBranchTypes)
  .post(checkPermission('create_branch_types'), branchtypeController.createBranchType);

router.route('/:id')
  .put(checkPermission('edit_branch_types'), branchtypeController.updateBranchType)
  .delete(checkPermission('delete_branch_types'), branchtypeController.deleteBranchType);

module.exports = router;
