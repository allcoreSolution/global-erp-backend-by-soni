const mongoose = require('mongoose');

const billerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  company: { type: String, default: '' } // Tenant association
}, { timestamps: true });

const Biller = mongoose.model('Biller', billerSchema);

module.exports = { Biller };
