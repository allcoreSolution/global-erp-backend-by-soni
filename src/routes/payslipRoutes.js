const express = require('express');
const router = express.Router();
const {
  generatePayslipPreview,
  createPayslip,
  getPayslips,
  getPayslipById,
  deletePayslip
} = require('../controllers/payslipController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/generate', protect, checkPermission('manage_hrms'), generatePayslipPreview);
router.post('/', protect, checkPermission('manage_hrms'), createPayslip);
router.get('/', protect, checkPermission('manage_hrms'), getPayslips);
router.get('/:id', protect, checkPermission('manage_hrms'), getPayslipById);
router.delete('/:id', protect, checkPermission('manage_hrms'), deletePayslip);

module.exports = router;
