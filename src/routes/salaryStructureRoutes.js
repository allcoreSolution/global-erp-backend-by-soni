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
  .post(protect, checkPermission('manage_hrms'), createSalaryStructure)
  .get(protect, getSalaryStructures);

router.route('/:id')
  .get(protect, getSalaryStructureById)
  .put(protect, checkPermission('manage_hrms'), updateSalaryStructure)
  .delete(protect, checkPermission('manage_hrms'), deleteSalaryStructure);

module.exports = router;
