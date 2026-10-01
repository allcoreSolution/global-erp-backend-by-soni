const express = require('express');
const router = express.Router();
const {
  addLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest
} = require('../controllers/leaveRequestController');
const { protect, checkPermission } = require('../middlewares/authMiddleware');

router.post('/', protect, checkPermission('manage_hrms'), addLeaveRequest);
router.get('/', protect, checkPermission('manage_hrms'), getLeaveRequests);
router.get('/:id', protect, checkPermission('manage_hrms'), getLeaveRequestById);
router.put('/:id', protect, checkPermission('manage_hrms'), updateLeaveRequest);
router.delete('/:id', protect, checkPermission('manage_hrms'), deleteLeaveRequest);

module.exports = router;
