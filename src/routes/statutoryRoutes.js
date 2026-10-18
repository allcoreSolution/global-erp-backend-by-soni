const express = require('express');
const router = express.Router();
const { getPfEsiReport } = require('../controllers/statutoryController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/pf-esi', protect, checkPermission('view_statutory_reports'), getPfEsiReport);

module.exports = router;
