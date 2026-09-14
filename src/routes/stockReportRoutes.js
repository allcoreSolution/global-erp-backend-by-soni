const express = require('express');
const router = express.Router();
const { getStockSummary, getLowStockReport } = require('../controllers/stockReportController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/summary', getStockSummary);
router.get('/low-stock', getLowStockReport);

module.exports = router;
