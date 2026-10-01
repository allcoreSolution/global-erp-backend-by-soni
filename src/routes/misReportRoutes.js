const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getBusinessAnalysis,
  getKpiReports,
  getManagementDashboard,
  getPerformanceAnalysis
} = require('../controllers/misReportController');

router.use(protect);

router.get('/business-analysis', getBusinessAnalysis);
router.get('/kpi', getKpiReports);
router.get('/management-dashboard', getManagementDashboard);
router.get('/performance-analysis', getPerformanceAnalysis);

module.exports = router;
