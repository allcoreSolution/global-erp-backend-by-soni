const express = require('express');
const router = express.Router();
const {
  addHoliday,
  getHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday
} = require('../controllers/holidayController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.post('/', protect, checkPermission('manage_hrms'), addHoliday);
router.get('/', protect, checkPermission('manage_hrms'), getHolidays);
router.get('/:id', protect, checkPermission('manage_hrms'), getHolidayById);
router.put('/:id', protect, checkPermission('manage_hrms'), updateHoliday);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteHoliday);

module.exports = router;
