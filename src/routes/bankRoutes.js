const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getBanks } = require('../controllers/bankController');

router.use(protect);

router.get('/', getBanks);

module.exports = router;
