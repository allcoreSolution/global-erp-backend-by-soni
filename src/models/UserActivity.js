const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    name: { type: String, default: 'System Operator' },
    email: { type: String, default: '' },
    role: { type: String, default: 'Staff' },
    avatar: { type: String, default: 'U' }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  company: {
    name: { type: String, default: 'Global Core HQ' },
    slug: { type: String, default: 'global-hq' },
    isInternal: { type: Boolean, default: false }
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  activity: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  module: {
    type: String,
    default: 'General'
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  location: {
    type: String,
    default: 'Local Network'
  },
  device: {
    type: String,
    default: 'Chrome Desktop'
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet'],
    default: 'desktop'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  result: {
    type: String,
    enum: ['Success', 'Failed'],
    default: 'Success'
  },
  statusCode: {
    type: Number,
    default: 200
  },
  endpoint: {
    type: String,
    default: ''
  },
  isSuspicious: {
    type: Boolean,
    default: false
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserActivity', userActivitySchema);
