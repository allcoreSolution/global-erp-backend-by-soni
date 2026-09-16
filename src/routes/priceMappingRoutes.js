const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getPriceMappings } = require('../controllers/priceMappingController');

router.use(protect);

router.get('/', getPriceMappings);

module.exports = router;
