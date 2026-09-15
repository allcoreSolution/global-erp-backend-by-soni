const express = require('express');
const router = express.Router();
const { 
  createDepartment, 
  getDepartments, 
  getDepartmentById, 
  updateDepartment, 
  deleteDepartment 
} = require('../controllers/departmentController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('manage_hrms'), createDepartment)
  .get(protect, getDepartments);

router.route('/:id')
  .get(protect, getDepartmentById)
  .put(protect, checkPermission('manage_hrms'), updateDepartment)
  .delete(protect, checkPermission('manage_hrms'), deleteDepartment);

module.exports = router;
