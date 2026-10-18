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

router.post('/', protect, checkPermission('create_holidays'), addHoliday);
router.get('/', protect, checkPermission('view_holidays'), getHolidays);
router.get('/:id', protect, checkPermission('view_holidays'), getHolidayById);
router.put('/:id', protect, checkPermission('edit_holidays'), updateHoliday);
router.delete('/:id', protect, checkPermission('delete_holidays'), deleteHoliday);

module.exports = router;
