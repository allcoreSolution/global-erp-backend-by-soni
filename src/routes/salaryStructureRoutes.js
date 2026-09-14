const express = require('express');
const router = express.Router();
const {
  addSalaryStructure,
  getSalaryStructures,
  getSalaryStructureById,
  updateSalaryStructure,
  deleteSalaryStructure
} = require('../controllers/salaryStructureController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.post('/', protect, checkPermission('manage_hrms'), addSalaryStructure);
router.get('/', protect, checkPermission('manage_hrms'), getSalaryStructures);
router.get('/:id', protect, checkPermission('manage_hrms'), getSalaryStructureById);
router.put('/:id', protect, checkPermission('manage_hrms'), updateSalaryStructure);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteSalaryStructure);

module.exports = router;
