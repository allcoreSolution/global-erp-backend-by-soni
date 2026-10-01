const mongoose = require('mongoose');

const countTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a count type name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CountType', countTypeSchema);
