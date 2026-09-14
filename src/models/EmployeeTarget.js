const mongoose = require('mongoose');

const employeeTargetSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  kpiGoalTitle: { type: String, required: true },
  targetMetricDescription: { type: String, required: true },
  initialProgress: { type: Number, default: 0 },
  targetDeadline: { type: Date, required: true },
  priorityScale: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  currentStatus: { type: String, enum: ['In Progress', 'Completed', 'On Hold', 'Cancelled'], default: 'In Progress' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeTarget', employeeTargetSchema);
