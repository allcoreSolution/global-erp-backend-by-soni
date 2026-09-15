const express = require('express');
const router = express.Router();
const { 
  createEmployee, 
  getEmployees, 
  getEmployeeById, 
  updateEmployee, 
  deleteEmployee 
} = require('../controllers/employeeController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
  .post(protect, checkPermission('manage_employees'), upload.single('profilePhoto'), createEmployee)
  .get(protect, getEmployees);

router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, checkPermission('manage_employees'), upload.single('profilePhoto'), updateEmployee)
  .delete(protect, checkPermission('manage_employees'), deleteEmployee);

module.exports = router;
