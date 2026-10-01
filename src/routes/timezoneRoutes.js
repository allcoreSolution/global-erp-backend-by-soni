const express = require('express');
const router = express.Router();
const timezoneController = require('../controllers/timezoneController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(timezoneController.getAllTimeZones)
  .post(timezoneController.createTimeZone);

router.route('/:id')
  .put(timezoneController.updateTimeZone)
  .delete(timezoneController.deleteTimeZone);

module.exports = router;
