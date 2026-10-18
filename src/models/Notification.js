const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['reminder', 'message', 'alert', 'announcement'],
    default: 'alert'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  targetType: {
    type: String,
    enum: ['all', 'company', 'user'],
    default: 'all'
  },
  targetCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  senderName: {
    type: String,
    default: 'Admin'
  },
  senderRole: {
    type: String,
    default: 'Admin'
  },
  read: {
    type: Boolean,
    default: false
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);