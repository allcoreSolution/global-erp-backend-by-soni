const Attendance = require('../models/Attendance');

// Get all attendance for a specific date
const getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required (YYYY-MM-DD)' });

    const attendanceRecords = await Attendance.find({ 
      company: req.user?.companyId,
      date 
    }).populate('employee', 'username email'); // We will assume role/shift could be populated if added to User later

    res.json({ success: true, data: attendanceRecords });
  } catch (error) {
    next(error);
  }
};

// Create or update single attendance (Quick Mark)
const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, checkIn, checkOut, status } = req.body;
    if (!employeeId || !date) return res.status(400).json({ success: false, message: 'Employee ID and Date are required' });

    let attendance = await Attendance.findOne({ employee: employeeId, date, company: req.user?.companyId });

    if (attendance) {
      if (checkIn) attendance.checkIn = checkIn;
      if (checkOut) attendance.checkOut = checkOut;
      if (status) attendance.status = status;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        employee: employeeId,
        date,
        checkIn: checkIn || '-',
        checkOut: checkOut || '-',
        status: status || 'Present',
        company: req.user?.companyId
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

    const bulkOps = records.map(record => ({
      updateOne: {
        filter: { employee: record.employeeId, date: record.date, company: req.user?.companyId },
        update: { 
          $set: { 
            checkIn: record.checkIn || '09:00 AM', 
            checkOut: record.checkOut || '06:00 PM', 
            status: record.status || 'Present' 
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
    const attendance = await Attendance.findById(req.params.id).populate('employee', 'username email');
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

module.exports = {
  getAttendanceByDate,
  markAttendance,
  markBulkAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance
};
