const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getDashboardSummary, getBranchSummary } = require('../controllers/dashboardController');

// All dashboard routes are protected and fetch data for the logged-in user's company
router.get('/summary', protect, getDashboardSummary);
router.get('/branch-summary/:branchId', protect, getBranchSummary);

module.exports = router;
