const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  start: { type: String, default: '' },
  end: { type: String, default: '' },
  duration: { type: String, default: '' },
  paid: { type: String, default: 'Yes' }
});

const shiftSetupSchema = new mongoose.Schema({
  company: { type: String, default: '' }, // acts as the tenant isolation key

  // Basic Info
  shiftCode: { type: String, required: true, unique: true },
  shiftName: { type: String, required: true },
  shiftType: { type: String, default: 'Fixed' },
  branch: { type: String, default: '' },
  department: { type: String, default: '' },
  status: { type: String, default: 'Active' },

  // Shift Timing
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '18:00' },
  workingHours: { type: String, default: '08:30' },
  graceTime: { type: String, default: '15' },
  lateMarkAfter: { type: String, default: '15' },
  earlyLeaving: { type: String, default: 'No' },
  overtime: { type: String, default: 'Yes' },
  otAfter: { type: String, default: '30' },

  // Break Config
  breakApplicable: { type: String, default: 'Yes' },
  breakType: { type: String, default: 'Fixed' },
  breakDuration: { type: String, default: '30' },
  paidBreak: { type: String, default: 'Yes' },
  
  breaks: [breakSchema], // Subdocument array for individual breaks

  // Working Days (object mapping boolean flags for each day)
  workDays: {
    Mon: { type: Boolean, default: true },
    Tue: { type: Boolean, default: true },
    Wed: { type: Boolean, default: true },
    Thu: { type: Boolean, default: true },
    Fri: { type: Boolean, default: true },
    Sat: { type: Boolean, default: true },
    Sun: { type: Boolean, default: false }
  },
  weeklyOff: { type: String, default: 'Sunday' },

  // Attendance Rules
  attendanceRequired: { type: String, default: 'Yes' },
  lateComing: { type: String, default: 'Allowed' },
  halfDayAfter: { type: String, default: '4' },
  minimumHours: { type: String, default: '8' },
  attendanceMethod: { type: String, default: 'Biometric' },
  autoCheckout: { type: String, default: 'No' },

  // Shift Assignment
  assignTo: { type: String, default: 'Department' },
  employee: { type: String, default: '' },
  effectiveFrom: { type: String, default: '' },
  effectiveTo: { type: String, default: '' },
  defaultShift: { type: String, default: 'No' },

  // Night Shift
  nightShift: { type: String, default: 'No' },
  crossMidnight: { type: String, default: 'No' },
  nextDayCheckout: { type: String, default: 'Auto' }
}, { timestamps: true });

const ShiftSetup = mongoose.model('ShiftSetup', shiftSetupSchema);

module.exports = { ShiftSetup };
