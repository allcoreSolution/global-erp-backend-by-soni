const LeaveRequest = require('../models/LeaveRequest');

const addLeaveRequest = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.create({ ...req.body, company: req.user?.companyId });
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

const getLeaveRequests = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ company: req.user?.companyId }).sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

const getLeaveRequestById = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      res.status(404);
      return next(new Error('Leave request not found'));
    }
    res.json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

const updateLeaveRequest = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!leave) {
      res.status(404);
      return next(new Error('Leave request not found'));
    }
    res.json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

const deleteLeaveRequest = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findByIdAndDelete(req.params.id);
    if (!leave) {
      res.status(404);
      return next(new Error('Leave request not found'));
    }
    res.json({ success: true, message: 'Leave request deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest
};
