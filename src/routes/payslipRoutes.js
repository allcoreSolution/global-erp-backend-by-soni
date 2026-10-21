const express = require('express');
const router = express.Router();
const {
  generatePayslipPreview,
  generateMonthlyBulkPayroll,
  updatePayslipStatus,
  updatePayslip,
  completeAllPayslips,
  createPayslip,
  getPayslips,
  getPayslipById,
  deletePayslip
} = require('../controllers/payslipController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/preview', protect, checkPermission('view_payslips'), generatePayslipPreview);
router.post('/bulk-generate', protect, checkPermission(['create_payslips', 'manage_hrms', 'admin']), generateMonthlyBulkPayroll);
router.put('/complete-all', protect, checkPermission(['edit_payslips', 'manage_hrms', 'admin']), completeAllPayslips);
router.put('/:id/status', protect, checkPermission(['edit_payslips', 'manage_hrms', 'admin']), updatePayslipStatus);
router.put('/:id', protect, checkPermission(['edit_payslips', 'manage_hrms', 'admin']), updatePayslip);
router.post('/', protect, checkPermission('create_payslips'), createPayslip);
router.get('/', protect, checkPermission('view_payslips'), getPayslips);
router.get('/:id', protect, checkPermission('view_payslips'), getPayslipById);
router.delete('/:id', protect, checkPermission('delete_payslips'), deletePayslip);

module.exports = router;
