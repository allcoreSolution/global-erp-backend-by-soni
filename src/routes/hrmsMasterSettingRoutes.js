const express = require('express');
const router = express.Router();
const { 
  getHrmsMasterSettings, 
  updateHrmsMasterSettings 
} = require('../controllers/hrmsMasterSettingController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, checkPermission('view_hrms_settings'), getHrmsMasterSettings)
  .put(protect, checkPermission('edit_hrms_settings'), updateHrmsMasterSettings);

module.exports = router;
