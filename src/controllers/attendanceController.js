const Attendance = require('../models/Attendance');
const Holiday = require('../models/Holiday');
const LeaveRequest = require('../models/LeaveRequest');

const resolveCompanyId = (user) => {
  return user?.company || user?.companyId || null;
};

const userCanViewAllAttendance = (user) => {
  if (!user || !user.role) return false;
  const roleName = user.role.name || '';
  if (roleName === 'SuperAdmin' || roleName === 'Admin') return true;

  const perms = Array.isArray(user.role.permissions) ? user.role.permissions : [];
  if (perms.some(p => ['view_hrms', 'view_attendance', 'manage_hrms'].includes(p))) {
    return true;
  }

  const modPerms = Array.isArray(user.role.modulePermissions) ? user.role.modulePermissions : [];
  const hrmsMod = modPerms.find(m => ['hrms', 'attendance', 'attendances'].includes((m.module || m.name || '').toLowerCase()));
  if (hrmsMod && hrmsMod.view) return true;

  return false;
};

const findEmployeeForUser = async (user) => {
  const EmployeeModel = require('../models/Employee');
  const Employee = EmployeeModel.Employee || EmployeeModel;

  let emp = null;
  if (user?.employeeId) {
    emp = await Employee.findOne({ employeeId: user.employeeId });
  }
  if (!emp && user?.email) {
    emp = await Employee.findOne({ email: user.email });
  }
  if (!emp && (user?.username || user?.name)) {
    const uname = (user.username || user.name).trim();
    emp = await Employee.findOne({
      $or: [
        { employeeName: new RegExp(`^${uname}$`, 'i') },
        { employeeId: uname }
      ]
    });
  }
  return emp;
};

// Get all attendance for a specific date (or self-only if regular staff)
const getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required (YYYY-MM-DD)' });

    const companyId = resolveCompanyId(req.user);
    const companyFilter = companyId ? { $or: [{ company: companyId }, { company: null }] } : {};

    const canViewAll = userCanViewAllAttendance(req.user);
    let selfFilter = {};
    if (!canViewAll) {
      const emp = await findEmployeeForUser(req.user);
      selfFilter = {
        $or: [
          ...(emp ? [{ employee: emp._id }, { employeeId: emp.employeeId }] : []),
          { user: req.user._id },
          { employeeName: emp?.employeeName || req.user.username }
        ]
      };
    }

    const [attendanceRecords, holidays, leaves] = await Promise.all([
      Attendance.find({ 
        ...companyFilter,
        ...(!canViewAll ? selfFilter : {}),
        date 
      }).populate('employee', 'employeeName employeeId department designation shift'),
      Holiday.find({
        ...companyFilter,
        $or: [
          { holidayDate: date },
          { startDate: { $lte: date }, endDate: { $gte: date } },
          { startDate: date }
        ]
      }),
      LeaveRequest.find({
        ...companyFilter,
        ...(!canViewAll ? selfFilter : {}),
        status: 'Approved',
        startDate: { $lte: date },
        endDate: { $gte: date }
      })
    ]);

    res.json({ 
      success: true, 
      canViewAll,
      data: attendanceRecords,
      holidays,
      leaves
    });
  } catch (error) {
    next(error);
  }
};

// Get monthly attendance register / muster roll (or self-only if regular staff)
const getMonthlyAttendance = async (req, res, next) => {
  try {
    const { year, month } = req.query; // year: e.g. 2026, month: 1-12
    if (!year || !month) {
      return res.status(400).json({ success: false, message: 'Year and Month are required' });
    }

    const y = parseInt(year);
    const m = parseInt(month);
    // Dynamic days calculation (handles 28, 29 leap years, 30, 31)
    const totalDays = new Date(y, m, 0).getDate();

    const pad = (n) => String(n).padStart(2, '0');
    const startDate = `${y}-${pad(m)}-01`;
    const endDate = `${y}-${pad(m)}-${pad(totalDays)}`;
    const companyId = resolveCompanyId(req.user);
    const companyFilter = companyId ? { $or: [{ company: companyId }, { company: null }] } : {};

    const canViewAll = userCanViewAllAttendance(req.user);
    let selfFilter = {};
    if (!canViewAll) {
      const emp = await findEmployeeForUser(req.user);
      selfFilter = {
        $or: [
          ...(emp ? [{ employee: emp._id }, { employeeId: emp.employeeId }] : []),
          { user: req.user._id },
          { employeeName: emp?.employeeName || req.user.username }
        ]
      };
    }

    const [attendanceRecords, holidays, leaves] = await Promise.all([
      Attendance.find({
        ...companyFilter,
        ...(!canViewAll ? selfFilter : {}),
        date: { $gte: startDate, $lte: endDate }
      }).populate('employee', 'employeeName employeeId department designation shift'),
      Holiday.find({
        ...companyFilter,
        $or: [
          { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
          { holidayDate: { $gte: startDate, $lte: endDate } },
          { startDate: { $gte: startDate, $lte: endDate } }
        ]
      }),
      LeaveRequest.find({
        ...companyFilter,
        ...(!canViewAll ? selfFilter : {}),
        status: 'Approved',
        $or: [
          { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
          { startDate: { $gte: startDate, $lte: endDate } }
        ]
      })
    ]);

    res.json({
      success: true,
      canViewAll,
      data: {
        year: y,
        month: m,
        totalDays,
        startDate,
        endDate,
        attendanceRecords,
        holidays,
        leaves
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create or update single attendance (Quick Mark)
const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, checkIn, checkOut, status } = req.body;
    if (!employeeId || !date) return res.status(400).json({ success: false, message: 'Employee ID and Date are required' });

    const companyId = resolveCompanyId(req.user);
    const filter = { employee: employeeId, date };
    if (companyId) filter.$or = [{ company: companyId }, { company: null }];

    let attendance = await Attendance.findOne(filter);

    if (attendance) {
      if (checkIn) attendance.checkIn = checkIn;
      if (checkOut) attendance.checkOut = checkOut;
      if (status) attendance.status = status;
      if (companyId && !attendance.company) attendance.company = companyId;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employee: employeeId,
        date,
        checkIn: checkIn || '-',
        checkOut: checkOut || '-',
        status: status || 'Present',
        company: companyId
      });
    }

    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

// Bulk Mark All Present
const markBulkAttendance = async (req, res, next) => {
  try {
    const { records } = req.body; // Array of { employeeId, date, checkIn, checkOut, status }
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Records array is required' });
    }

    const companyId = resolveCompanyId(req.user);
    const bulkOps = records.map(record => ({
      updateOne: {
        filter: { 
          employee: record.employeeId, 
          date: record.date, 
          ...(companyId ? { $or: [{ company: companyId }, { company: null }] } : {}) 
        },
        update: { 
          $set: { 
            checkIn: record.checkIn || '09:00 AM', 
            checkOut: record.checkOut || '06:00 PM', 
            status: record.status || 'Present',
            ...(companyId ? { company: companyId } : {})
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(bulkOps);

    res.json({ success: true, message: `${records.length} attendance records updated successfully` });
  } catch (error) {
    next(error);
  }
};

const getAttendanceById = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate('employee', 'employeeName employeeId department designation');
    if (!attendance) {
      res.status(404);
      return next(new Error('Attendance not found'));
    }
    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!attendance) {
      res.status(404);
      return next(new Error('Attendance not found'));
    }
    res.json({ success: true, data: attendance });
  } catch (error) {
    next(error);
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      res.status(404);
      return next(new Error('Attendance not found'));
    }
    res.json({ success: true, message: 'Attendance deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Helper: Format Time AM/PM
const formatTimeAMPM = (dateObj) => {
  let hours = dateObj.getHours();
  let minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const strMinutes = minutes < 10 ? '0' + minutes : minutes;
  const strHours = hours < 10 ? '0' + hours : hours;
  return `${strHours}:${strMinutes} ${ampm}`;
};

// Helper: Resolve employee's shift and calculate punch status dynamically from ShiftSetup collection
const calculateStatusFromShift = async (emp, dateObj, companyId) => {
  const ShiftSetupModel = require('../models/ShiftSetup');
  const ShiftSetup = ShiftSetupModel.ShiftSetup || ShiftSetupModel;

  let shift = null;

  // 1. Try finding by employee's assigned shift name or code
  if (emp?.shift) {
    shift = await ShiftSetup.findOne({
      $or: [
        { shiftName: emp.shift },
        { shiftCode: emp.shift }
      ]
    });
  }

  // 2. If not found, try default shift in company
  if (!shift) {
    shift = await ShiftSetup.findOne({ defaultShift: 'Yes' });
  }

  // 3. Fallback to any active shift
  if (!shift) {
    shift = await ShiftSetup.findOne({ status: 'Active' });
  }

  // Parse shift timing rules (fallback defaults if not configured)
  let shiftStartHour = 9;
  let shiftStartMin = 0;
  let graceMins = 15;
  let halfDayHours = 4;
  let shiftName = 'General Shift';
  let startTimeStr = '09:00';
  let endTimeStr = '18:00';

  if (shift) {
    shiftName = shift.shiftName || 'General Shift';
    startTimeStr = shift.startTime || '09:00';
    endTimeStr = shift.endTime || '18:00';
    if (shift.startTime) {
      const parts = shift.startTime.split(':');
      if (parts.length >= 2) {
        shiftStartHour = parseInt(parts[0], 10) || 9;
        shiftStartMin = parseInt(parts[1], 10) || 0;
      }
    }
    graceMins = parseInt(shift.graceTime, 10) || parseInt(shift.lateMarkAfter, 10) || 15;
    halfDayHours = parseInt(shift.halfDayAfter, 10) || 4;
  }

  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const currentTotalMins = hours * 60 + minutes;

  const shiftStartTotalMins = shiftStartHour * 60 + shiftStartMin;
  const onTimeCutoffMins = shiftStartTotalMins + graceMins;
  const halfDayCutoffMins = shiftStartTotalMins + (halfDayHours * 60);

  let status = 'Present';
  if (currentTotalMins <= onTimeCutoffMins) {
    status = 'Present';
  } else if (currentTotalMins <= halfDayCutoffMins) {
    status = 'Late';
  } else {
    status = 'Half Day';
  }

  const convert24To12 = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    const strHour = hour12 < 10 ? '0' + hour12 : hour12;
    const strMin = (m !== undefined && m < 10) ? '0' + m : (m || '00');
    return `${strHour}:${strMin} ${period}`;
  };

  const startTime12 = convert24To12(startTimeStr);
  const endTime12 = convert24To12(endTimeStr);

  return { 
    status, 
    shiftName, 
    startTime: startTime12 || startTimeStr, 
    endTime: endTime12 || endTimeStr, 
    timingText: `${startTime12 || startTimeStr} - ${endTime12 || endTimeStr}`,
    graceMins, 
    halfDayHours,
    shiftRecord: shift 
  };
};

// Helper: Calculate working hours
const calculateWorkingDuration = (inTimeStr, outTimeStr) => {
  try {
    const parseTime = (str) => {
      const [time, period] = str.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    const inMins = parseTime(inTimeStr);
    const outMins = parseTime(outTimeStr);
    const diff = outMins - inMins;
    if (diff <= 0) return '0h 0m';
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${mins}m`;
  } catch {
    return '-';
  }
};

// 7. Self Punch In (Employee/User marks their own attendance)
const punchIn = async (req, res, next) => {
  try {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[now.getDay()];
    const inTime = formatTimeAMPM(now);

    const EmployeeModel = require('../models/Employee');
    const Employee = EmployeeModel.Employee || EmployeeModel;

    // Resolve employee reference
    let emp = null;
    if (req.user?.employeeId) {
      emp = await Employee.findOne({ employeeId: req.user.employeeId });
    }
    if (!emp && req.user?.email) {
      emp = await Employee.findOne({ email: req.user.email });
    }

    const employeeRef = emp ? emp._id : undefined;
    const empName = emp?.employeeName || req.user?.name || req.user?.fullName || 'User';
    const empCode = emp?.employeeId || req.user?.employeeId || '';

    const companyId = resolveCompanyId(req.user);
    // Calculate status dynamically from database ShiftSetup
    const { status: autoStatus, shiftName, startTime, graceMins } = await calculateStatusFromShift(emp, now, companyId);

    // Check existing attendance for today
    const query = {
      date: today,
      ...(companyId ? { $or: [{ company: companyId }, { company: null }] } : {}),
      $and: [
        {
          $or: [
            ...(employeeRef ? [{ employee: employeeRef }] : []),
            { user: req.user._id },
            { employeeName: empName }
          ]
        }
      ]
    };

    let attendance = await Attendance.findOne(query);

    if (attendance && attendance.checkIn && attendance.checkIn !== '-') {
      return res.status(400).json({
        success: false,
        message: `You have already punched in today at ${attendance.checkIn}`,
        data: attendance
      });
    }

    if (attendance) {
      attendance.checkIn = inTime;
      attendance.status = autoStatus;
      attendance.shift = shiftName;
      attendance.markedBy = 'Self';
      attendance.day = currentDay;
      if (companyId && !attendance.company) attendance.company = companyId;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employee: employeeRef,
        user: req.user._id,
        employeeName: empName,
        employeeId: empCode,
        date: today,
        day: currentDay,
        checkIn: inTime,
        checkOut: '-',
        workingHours: '-',
        status: autoStatus,
        shift: shiftName,
        markedBy: 'Self',
        company: companyId
      });
    }

    res.json({
      success: true,
      message: `Punched in successfully at ${inTime}. Status: ${autoStatus} (Shift: ${shiftName})`,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// 8. Self Punch Out (Employee/User marks their checkout)
const punchOut = async (req, res, next) => {
  try {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const outTime = formatTimeAMPM(now);

    const EmployeeModel = require('../models/Employee');
    const Employee = EmployeeModel.Employee || EmployeeModel;

    let emp = null;
    if (req.user?.employeeId) {
      emp = await Employee.findOne({ employeeId: req.user.employeeId });
    }
    if (!emp && req.user?.email) {
      emp = await Employee.findOne({ email: req.user.email });
    }

    const employeeRef = emp ? emp._id : undefined;
    const empName = emp?.employeeName || req.user?.name || req.user?.fullName || 'User';
    const companyId = resolveCompanyId(req.user);

    const query = {
      date: today,
      ...(companyId ? { $or: [{ company: companyId }, { company: null }] } : {}),
      $and: [
        {
          $or: [
            ...(employeeRef ? [{ employee: employeeRef }] : []),
            { user: req.user._id },
            { employeeName: empName }
          ]
        }
      ]
    };

    let attendance = await Attendance.findOne(query);

    if (!attendance || !attendance.checkIn || attendance.checkIn === '-') {
      return res.status(400).json({
        success: false,
        message: 'You have not punched in today yet!'
      });
    }

    if (attendance.checkOut && attendance.checkOut !== '-') {
      return res.status(400).json({
        success: false,
        message: `You have already punched out today at ${attendance.checkOut}`,
        data: attendance
      });
    }

    attendance.checkOut = outTime;
    attendance.workingHours = calculateWorkingDuration(attendance.checkIn, outTime);
    if (companyId && !attendance.company) attendance.company = companyId;
    await attendance.save();

    res.json({
      success: true,
      message: `Punched out successfully at ${outTime}. Total hours: ${attendance.workingHours}`,
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

// 9. Get Logged-in User's Today Attendance Status
const getMyTodayAttendance = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const EmployeeModel = require('../models/Employee');
    const Employee = EmployeeModel.Employee || EmployeeModel;

    let emp = null;
    if (req.user?.employeeId) {
      emp = await Employee.findOne({ employeeId: req.user.employeeId });
    }
    if (!emp && req.user?.email) {
      emp = await Employee.findOne({ email: req.user.email });
    }

    const employeeRef = emp ? emp._id : undefined;
    const empName = emp?.employeeName || req.user?.name || req.user?.fullName || 'User';
    const companyId = resolveCompanyId(req.user);

    const query = {
      date: today,
      ...(companyId ? { $or: [{ company: companyId }, { company: null }] } : {}),
      $and: [
        {
          $or: [
            ...(employeeRef ? [{ employee: employeeRef }] : []),
            { user: req.user._id },
            { employeeName: empName }
          ]
        }
      ]
    };

    const attendance = await Attendance.findOne(query);

    const hasPunchedIn = !!(attendance && attendance.checkIn && attendance.checkIn !== '-');
    const hasPunchedOut = !!(attendance && attendance.checkOut && attendance.checkOut !== '-');

    const shiftDetails = await calculateStatusFromShift(emp, new Date(), companyId);

    res.json({
      success: true,
      data: {
        date: today,
        hasPunchedIn,
        hasPunchedOut,
        attendance: attendance || null,
        shift: {
          name: shiftDetails.shiftName,
          startTime: shiftDetails.startTime,
          endTime: shiftDetails.endTime,
          timingText: shiftDetails.timingText,
          graceMins: shiftDetails.graceMins,
          halfDayHours: shiftDetails.halfDayHours,
          expectedStatusNow: shiftDetails.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
