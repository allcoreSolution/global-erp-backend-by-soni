const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middlewares/authMiddleware');
const { getDashboardSummary, getSuperAdminDashboardSummary } = require('../controllers/dashboardController');

// All dashboard routes are protected and fetch data tailored to the logged-in user's role & permissions
router.get('/summary', protect, getDashboardSummary);
router.get('/super-admin', protect, getSuperAdminDashboardSummary);

module.exports = router;
