const express = require('express');
const router = express.Router();
const {
  addShiftTiming,
  getShiftTimings,
  getShiftTimingById,
  updateShiftTiming,
  deleteShiftTiming
} = require('../controllers/shiftTimingController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.post('/', protect, checkPermission('create_shift_timings'), addShiftTiming);
router.get('/', protect, checkPermission('view_shift_timings'), getShiftTimings);
router.get('/:id', protect, checkPermission('view_shift_timings'), getShiftTimingById);
router.put('/:id', protect, checkPermission('edit_shift_timings'), updateShiftTiming);
router.delete('/:id', protect, checkPermission('delete_shift_timings'), deleteShiftTiming);

module.exports = router;
