const mongoose = require('mongoose');

const backupHistorySchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    required: true,
  },
  storage: {
    type: String,
    default: 'Local Drive'
  },
  status: {
    type: String,
    enum: ['Success', 'Failed', 'In Progress'],
    default: 'Success'
  },
  filePath: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('BackupHistory', backupHistorySchema);
