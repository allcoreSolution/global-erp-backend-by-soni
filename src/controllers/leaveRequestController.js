const mongoose = require('mongoose');
const LeaveRequest = require('../models/LeaveRequest');
const EmployeeModel = require('../models/Employee');
const Employee = EmployeeModel.Employee || EmployeeModel;

const calculateDuration = (start, end) => {
  if (!start) return 1;
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1;
  const diffTime = Math.abs(e - s);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};

// 1. Create a Leave Request
const addLeaveRequest = async (req, res, next) => {
  try {
    const data = { ...req.body, company: req.user?.companyId };
    
    // Auto calculate duration
    if (data.startDate) {
      data.durationDays = calculateDuration(data.startDate, data.endDate || data.startDate);
    }

    // Auto-fill from logged-in user if not provided
    if (!data.employeeName && req.user) {
      data.employeeName = req.user.name || req.user.fullName || 'User';
    }
    if (!data.employee && req.user?.employeeId) {
      data.employeeId = req.user.employeeId;
    }

    // Try finding employee ID if valid ObjectId reference was provided
    if (data.employee && mongoose.Types.ObjectId.isValid(data.employee)) {
      try {
        const emp = await Employee.findById(data.employee);
        if (emp) {
          if (!data.employeeId) data.employeeId = emp.employeeId;
          if (!data.employeeName) data.employeeName = emp.employeeName;
        }
      } catch (err) {
        console.warn("Could not find employee reference:", err.message);
      }
    } else {
      delete data.employee;
    }

    const leave = await LeaveRequest.create(data);
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

// 2. Get Leave Requests (Supports filtering by employee, employeeId, status, and role)
const getLeaveRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user?.companyId) {
      filter.company = req.user.companyId;
    }

    // Filter by specific employee (by MongoDB _id or employeeId code)
    if (req.query.employee) {
      filter.employee = req.query.employee;
    }
    if (req.query.employeeId) {
      filter.employeeId = req.query.employeeId;
    }
    if (req.query.employeeName) {
      filter.employeeName = new RegExp(req.query.employeeName, 'i');
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // If logged-in user is an Employee role and linked to an employee profile, filter to own leaves
    if (req.user?.role === 'Employee' && req.user?.employeeId) {
      filter.employeeId = req.user.employeeId;
    }

    const leaves = await LeaveRequest.find(filter)
      .populate('employee', 'employeeName employeeId department role mobile email')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (error) {
    next(error);
  }
};

// 3. Get Single Leave Request by ID
const getLeaveRequestById = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id)
      .populate('employee', 'employeeName employeeId department role mobile email')
      .populate('approvedBy', 'name email role');

    if (!leave) {
      res.status(404);
      return next(new Error('Leave request not found'));
    }
    res.json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

// 4. Update Leave Request / Approve or Reject
const updateLeaveRequest = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // If status is changed to Approved or Rejected, track approver details
    if (updateData.status && ['Approved', 'Rejected'].includes(updateData.status)) {
      updateData.approvedBy = req.user?._id;
      updateData.approverName = req.user?.name || req.user?.email || 'Admin';
      updateData.approvedAt = new Date();
    }

    if (updateData.startDate || updateData.endDate) {
      updateData.durationDays = calculateDuration(updateData.startDate, updateData.endDate || updateData.startDate);
    }

    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('employee', 'employeeName employeeId department role mobile email')
      .populate('approvedBy', 'name email role');

    if (!leave) {
      res.status(404);
      return next(new Error('Leave request not found'));
    }
    res.json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Leave Request
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
