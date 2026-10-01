
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/:category')
  .get(getSettings)
  .put(updateSettings);

module.exports = router;
