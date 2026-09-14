const express = require('express');
const router = express.Router();
const {
  addEmployeeTarget,
  getEmployeeTargets,
  getEmployeeTargetById,
  updateEmployeeTarget,
  deleteEmployeeTarget
} = require('../controllers/employeeTargetController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.post('/', protect, checkPermission('manage_hrms'), addEmployeeTarget);
router.get('/', protect, checkPermission('manage_hrms'), getEmployeeTargets);
router.get('/:id', protect, checkPermission('manage_hrms'), getEmployeeTargetById);
router.put('/:id', protect, checkPermission('manage_hrms'), updateEmployeeTarget);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteEmployeeTarget);

module.exports = router;
