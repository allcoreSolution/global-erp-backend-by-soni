const express = require('express');
const router = express.Router();
const { 
  createSalaryStructure, 
  getSalaryStructures, 
  getSalaryStructureById, 
  updateSalaryStructure, 
  deleteSalaryStructure 
} = require('../controllers/salaryStructureController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, checkPermission('create_salary_structures'), createSalaryStructure)
  .get(protect, checkPermission('view_salary_structures'), getSalaryStructures);

router.route('/:id')
  .get(protect, checkPermission('view_salary_structures'), getSalaryStructureById)
  .put(protect, checkPermission('edit_salary_structures'), updateSalaryStructure)
  .delete(protect, checkPermission('delete_salary_structures'), deleteSalaryStructure);

module.exports = router;
