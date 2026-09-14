const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unitCode: { type: String, required: true, unique: true, trim: true },
  unitName: { type: String, required: true, trim: true },
  baseUnit: { type: String, default: 'None (Root Unit)' },
  operator: { type: String, default: 'None' },
  operationValue: { type: Number, default: 1 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
}, { timestamps: true });

const Unit = mongoose.model('Unit', unitSchema);

module.exports = { Unit };
