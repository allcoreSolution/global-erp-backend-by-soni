const express = require('express');
const router = express.Router();
const {
  getAttendanceByDate,
  markAttendance,
  markBulkAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.get('/', protect, checkPermission('manage_hrms'), getAttendanceByDate);
router.post('/', protect, checkPermission('manage_hrms'), markAttendance);
router.post('/bulk', protect, checkPermission('manage_hrms'), markBulkAttendance);
router.get('/:id', protect, checkPermission('manage_hrms'), getAttendanceById);
router.put('/:id', protect, checkPermission('manage_hrms'), updateAttendance);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteAttendance);

module.exports = router;
