const express = require('express');
const router = express.Router();
const {
  addDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.post('/', protect, checkPermission('manage_hrms'), addDepartment);
router.get('/', protect, checkPermission('manage_hrms'), getDepartments);
router.get('/:id', protect, checkPermission('manage_hrms'), getDepartmentById);
router.put('/:id', protect, checkPermission('manage_hrms'), updateDepartment);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteDepartment);

module.exports = router;
