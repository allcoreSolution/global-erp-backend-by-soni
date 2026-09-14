const mongoose = require('mongoose');

const hrmsMasterSettingSchema = new mongoose.Schema({
  priorities: [{ type: String, trim: true }],
  statuses: [{ type: String, trim: true }],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('HrmsMasterSetting', hrmsMasterSettingSchema);
