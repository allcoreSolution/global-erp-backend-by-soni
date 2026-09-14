const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  patchEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, getEmployees);
router.get('/:id', protect, getEmployeeById);
router.post('/', protect, checkPermission('manage_hrms'), createEmployee);
router.put('/:id', protect, checkPermission('manage_hrms'), updateEmployee);
router.patch('/:id', protect, checkPermission('manage_hrms'), patchEmployee);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteEmployee);

module.exports = router;
