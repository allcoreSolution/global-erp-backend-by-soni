const mongoose = require('mongoose');

const hrmsMasterSettingSchema = new mongoose.Schema({
  company: { type: String, required: true, unique: true }, // one setting per company

  priorities: {
    type: [String],
    default: ['High', 'Medium', 'Low']
  },
  
  statuses: {
    type: [String],
    default: ['In Progress', 'Completed', 'Behind Schedule']
  }
}, { timestamps: true });

const HrmsMasterSetting = mongoose.model('HrmsMasterSetting', hrmsMasterSettingSchema);

module.exports = { HrmsMasterSetting };
