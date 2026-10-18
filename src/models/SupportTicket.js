const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  senderType: {
    type: String,
    enum: ['Customer', 'Support', 'SuperAdmin'],
    default: 'Customer'
  },
  senderName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    enum: [
      'General Support',
      'Billing & Subscription',
      'Technical / Bug',
      'Feature Request',
      'Module Access',
      'GST & Taxation',
      'Payroll & HRMS',
      'Other'
    ],
    default: 'General Support'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String
  },
  userEmail: {
    type: String
  },
  userPhone: {
    type: String
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  companyName: {
    type: String
  },
  resolutionNotes: {
    type: String
  },
  messages: [messageSchema]
}, { timestamps: true });

// Auto-generate ticketNumber before saving
supportTicketSchema.pre('save', async function () {
  if (!this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `TCK-${1000 + count + 1}`;
  }
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
