const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentTermController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, controller.getAll).post(protect, controller.create);

module.exports = router;
