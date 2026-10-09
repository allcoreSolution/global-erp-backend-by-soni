const mongoose = require('mongoose');

const accountGroupSchema = new mongoose.Schema({
  groupName: { type: String, required: true, trim: true },
  parentGroup: { 
    type: String, 
    required: true, 
    enum: ['Asset', 'Liability', 'Equity', 'Income', 'Expense']
  },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

module.exports = mongoose.model('AccountGroup', accountGroupSchema);
