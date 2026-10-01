const mongoose = require('mongoose');

const performanceRatingSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  jobRole: { type: String, required: true },
  department: { type: String },
  ratingScore: { type: Number, required: true, min: 1, max: 5 },
  eligibilityStatus: { type: String },
  evaluationCycle: { type: String },
  remarks: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('PerformanceRating', performanceRatingSchema);
