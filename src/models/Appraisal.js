const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  criteria: { type: String, required: true },
  weightage: { type: Number, required: true },
  rating: { type: Number, required: true }
});

const goalSchema = new mongoose.Schema({
  goal: { type: String, required: true },
  target: { type: String, required: true },
  achieved: { type: String, default: 'No' },
  percentage: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  score: { type: Number, default: 0 }
});

const appraisalSchema = new mongoose.Schema({
  company: { type: String, default: '' }, // acts as the tenant isolation key
  
  // Basic Info
  basicInfo: {
    cycle: { type: String, default: '' },
    employee: { type: String, required: true },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    manager: { type: String, default: '' },
    periodFrom: { type: String, default: '' },
    periodTo: { type: String, default: '' }
  },

  // Performance Rating
  ratings: [ratingSchema],

  // KPI / Goals
  goals: [goalSchema],

  // Employee Self-Assessment
  selfAssessment: {
    achievements: { type: String, default: '' },
    challenges: { type: String, default: '' },
    futureGoals: { type: String, default: '' }
  },

  // Manager Evaluation
  managerEvaluation: {
    strengths: { type: String, default: '' },
    improvementAreas: { type: String, default: '' },
    trainingRequired: { type: String, default: '' }
  },

  // Final Appraisal
  finalAppraisal: {
    grade: { type: String, default: '' },
    increment: { type: String, default: 'No' },
    incrementPercent: { type: String, default: '0' },
    promotion: { type: String, default: 'No' },
    remarks: { type: String, default: '' }
  }
}, { timestamps: true });

const Appraisal = mongoose.model('Appraisal', appraisalSchema);

module.exports = { Appraisal };
