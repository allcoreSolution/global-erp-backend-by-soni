const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
  // Basic Information
  courierCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String },
  company: { type: String, default: '' },
  status: { type: String, default: 'Active' },

  // Contact Details
  contactPerson: { type: String },
  phone: { type: String, required: true },
  email: { type: String },

  // Address
  addressLine1: { type: String },
  state: { type: String },
  city: { type: String },
  pincode: { type: String },

  // Service Details
  serviceType: { type: String },
  deliveryMode: { type: String },
  deliveryDays: { type: String },
  pickupAvailable: { type: Boolean, default: false },
  codAvailable: { type: Boolean, default: false },
  trackingAvailable: { type: Boolean, default: false },
  reversePickup: { type: Boolean, default: false },

  // Default Fleet Info & Settings
  defaultVehicleNo: { type: String, default: '' },
  defaultDriverName: { type: String, default: '' },
  defaultDriverMobile: { type: String, default: '' },
  volumetricDivisor: { type: Number, default: 5000 },

  // Tracking & Integration
  trackingUrl: { type: String },

  // Additional Information
  isDefaultCourier: { type: Boolean, default: false }
}, { timestamps: true });

const Courier = mongoose.model('Courier', courierSchema);

module.exports = { Courier };
