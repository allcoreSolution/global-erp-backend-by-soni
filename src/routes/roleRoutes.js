const express = require('express');
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole } = require('../controllers/roleController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(checkPermission('view_roles'), getRoles)
  .post(checkPermission('create_roles'), createRole);

router.route('/:id')
  .put(checkPermission('edit_roles'), updateRole)
  .delete(checkPermission('delete_roles'), deleteRole);

module.exports = router;
