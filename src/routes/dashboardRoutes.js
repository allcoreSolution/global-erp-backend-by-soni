const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middlewares/authMiddleware');
const { getDashboardSummary } = require('../controllers/dashboardController');

// All dashboard routes are protected and fetch data tailored to the logged-in user's role & permissions
router.get('/summary', protect, getDashboardSummary);

module.exports = router;
