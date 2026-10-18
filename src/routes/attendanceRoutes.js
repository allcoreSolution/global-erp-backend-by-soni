const express = require('express');
const router = express.Router();
const {
  getAttendanceByDate,
  getMonthlyAttendance,
  markAttendance,
  markBulkAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  punchIn,
  punchOut,
  getMyTodayAttendance
} = require('../controllers/attendanceController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

// Self Attendance Actions (Any authenticated user can punch in/out for themselves)
router.post('/punch-in', protect, punchIn);
router.post('/punch-out', protect, punchOut);
router.get('/my-today', protect, getMyTodayAttendance);

// Attendance Register Routes (Admins see all staff; normal employees see their own records)
router.get('/monthly', protect, getMonthlyAttendance);
router.get('/', protect, getAttendanceByDate);
router.post('/', protect, checkPermission('create_hrms'), markAttendance);
router.post('/bulk', protect, checkPermission('create_hrms'), markBulkAttendance);
router.get('/:id', protect, checkPermission(['view_hrms', 'view_attendance', 'view_leave']), getAttendanceById);
router.put('/:id', protect, checkPermission('edit_hrms'), updateAttendance);
router.delete('/:id', protect, checkPermission('delete_hrms'), deleteAttendance);

module.exports = router;
