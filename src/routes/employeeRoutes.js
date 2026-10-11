const express = require('express');
const router = express.Router();
const { 
  createEmployee, 
  getEmployees, 
  getEmployeeById, 
  updateEmployee, 
  deleteEmployee,
  importEmployees 
} = require('../controllers/employeeController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');
const uploadEmployee = require('../middlewares/uploadEmployee');

router.route('/')
  .post(protect, checkPermission('create_employees'), uploadEmployee.single('profilePhoto'), createEmployee)
  .get(protect, getEmployees);

router.post('/import', protect, checkPermission('create_employees'), importEmployees);

router.route('/:id')
  .get(protect, checkPermission('view_employees'), getEmployeeById)
  .put(protect, checkPermission('edit_employees'), uploadEmployee.single('profilePhoto'), updateEmployee)
  .delete(protect, checkPermission('delete_employees'), deleteEmployee);

module.exports = router;
