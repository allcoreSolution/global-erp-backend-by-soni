const express = require('express');
const router = express.Router();
const {
  getQuarantineList,
  inspectQuarantineItem,
  getNearExpiryList,
  getWriteOffList,
  createWriteOff
} = require('../controllers/pharmaController');
const { protect } = require('../middlewares/authMiddleware');

// Quarantine & Return Inspection
router.get('/quarantine', protect, getQuarantineList);
router.post('/quarantine/:id/inspect', protect, inspectQuarantineItem);

// Near Expiry Tracker
router.get('/near-expiry', protect, getNearExpiryList);

// Damage & Expiry Stock Write-Off
router.get('/write-offs', protect, getWriteOffList);
router.post('/write-off', protect, createWriteOff);

module.exports = router;
