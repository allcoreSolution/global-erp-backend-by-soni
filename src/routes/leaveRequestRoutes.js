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

router.post('/', protect, checkPermission('create_leave'), addLeaveRequest);
router.get('/', protect, checkPermission('view_leave'), getLeaveRequests);
router.get('/:id', protect, checkPermission('view_leave'), getLeaveRequestById);
router.put('/:id', protect, checkPermission('edit_leave'), updateLeaveRequest);
router.delete('/:id', protect, checkPermission('delete_leave'), deleteLeaveRequest);

module.exports = router;
