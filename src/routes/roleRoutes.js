const express = require('express');
const router = express.Router();
const { getRoles, getNextRoleCode, createRole, updateRole, deleteRole } = require('../controllers/roleController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/next-code', checkPermission(['view_roles', 'view_employees', 'manage_employees']), getNextRoleCode);

router.route('/')
  .get(checkPermission(['view_roles', 'view_employees', 'manage_employees']), getRoles)
  .post(checkPermission(['create_roles', 'create_employees', 'manage_employees']), createRole);

router.route('/:id')
  .put(checkPermission('edit_roles'), updateRole)
  .delete(checkPermission('delete_roles'), deleteRole);

module.exports = router;
