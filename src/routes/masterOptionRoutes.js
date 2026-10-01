const express = require('express');
const router = express.Router();
const { getMasterOptions, createMasterOption } = require('../controllers/masterOptionController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getMasterOptions)
  .post(protect, createMasterOption);

module.exports = router;
