
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/:category')
  .get(checkPermission('view_settings'), getSettings)
  .put(checkPermission('edit_settings'), updateSettings);

module.exports = router;
