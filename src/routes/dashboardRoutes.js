const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getDashboardSummary } = require('../controllers/dashboardController');

// All dashboard routes are protected and fetch data for the logged-in user's company
router.get('/summary', protect, getDashboardSummary);

module.exports = router;
