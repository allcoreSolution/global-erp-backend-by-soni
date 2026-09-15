const express = require('express');
const router = express.Router();
const { 
  getHrmsMasterSettings, 
  updateHrmsMasterSettings 
} = require('../controllers/hrmsMasterSettingController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getHrmsMasterSettings)
  .put(protect, checkPermission('manage_hrms'), updateHrmsMasterSettings);

module.exports = router;
