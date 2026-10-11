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
  .post(protect, checkPermission('create_departments'), createDepartment)
  .get(protect, checkPermission('view_departments'), getDepartments);

router.route('/:id')
  .get(protect, checkPermission('view_departments'), getDepartmentById)
  .put(protect, checkPermission('edit_departments'), updateDepartment)
  .delete(protect, checkPermission('delete_departments'), deleteDepartment);

module.exports = router;
