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
  .post(protect, checkPermission('manage_hrms'), createEmployeeTarget)
  .get(protect, getEmployeeTargets);

router.route('/:id')
  .get(protect, getEmployeeTargetById)
  .put(protect, checkPermission('manage_hrms'), updateEmployeeTarget)
  .delete(protect, checkPermission('manage_hrms'), deleteEmployeeTarget);

module.exports = router;
