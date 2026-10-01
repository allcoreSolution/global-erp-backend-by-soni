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

router.post('/', protect, checkPermission('manage_hrms'), addShiftTiming);
router.get('/', protect, checkPermission('manage_hrms'), getShiftTimings);
router.get('/:id', protect, checkPermission('manage_hrms'), getShiftTimingById);
router.put('/:id', protect, checkPermission('manage_hrms'), updateShiftTiming);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteShiftTiming);

module.exports = router;
