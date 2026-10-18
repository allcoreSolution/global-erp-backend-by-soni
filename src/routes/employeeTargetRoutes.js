const express = require('express');
const router = express.Router();
const { 
  createEmployeeTarget, 
  getEmployeeTargets, 
  getEmployeeTargetById, 
  updateEmployeeTarget, 
  deleteEmployeeTarget 
} = require('../controllers/employeeTargetController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('create_employee_targets'), createEmployeeTarget)
  .get(protect, checkPermission('view_employee_targets'), getEmployeeTargets);

router.route('/:id')
  .get(protect, checkPermission('view_employee_targets'), getEmployeeTargetById)
  .put(protect, checkPermission('edit_employee_targets'), updateEmployeeTarget)
  .delete(protect, checkPermission('delete_employee_targets'), deleteEmployeeTarget);

module.exports = router;
