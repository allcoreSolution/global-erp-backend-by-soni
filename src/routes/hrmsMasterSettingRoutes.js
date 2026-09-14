const express = require('express');
const router = express.Router();
const {
  getHrmsSettings,
  createHrmsSettings,
  updateHrmsSettings,
  deleteHrmsSettings
} = require('../controllers/hrmsMasterSettingController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, checkPermission('manage_hrms'), getHrmsSettings);
router.post('/', protect, checkPermission('manage_hrms'), createHrmsSettings);
router.put('/', protect, checkPermission('manage_hrms'), updateHrmsSettings);
router.delete('/', protect, checkPermission('manage_hrms'), deleteHrmsSettings);

module.exports = router;
