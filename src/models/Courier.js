const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
  // Basic Information
  courierCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String },
  company: { type: String, default: '' },
  branch: { type: String },
  status: { type: String, default: 'Active' },
  description: { type: String },

  // Contact Details
  contactPerson: { type: String },
  phone: { type: String, required: true },
  alternateMobile: { type: String },
  email: { type: String },
  website: { type: String },
  customerCare: { type: String },

  // Address
  addressLine1: { type: String },
  addressLine2: { type: String },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  district: { type: String },
  pincode: { type: String },

  // Service Details
  serviceType: { type: String },
  deliveryMode: { type: String },
  deliveryDays: { type: String },
  pickupAvailable: { type: Boolean, default: false },
  codAvailable: { type: Boolean, default: false },
  trackingAvailable: { type: Boolean, default: false },
  reversePickup: { type: Boolean, default: false },
  internationalShipping: { type: Boolean, default: false },

  // Service Area
  serviceAreaStates: [{ type: String }],
  serviceAreaCities: [{ type: String }],
  serviceAreaPincodes: [{ type: String }],

  // Shipping Charges
  baseCharge: { type: Number, default: 0 },
  perKgCharge: { type: Number, default: 0 },
  additionalKgCharge: { type: Number, default: 0 },
  codCharge: { type: Number, default: 0 },
  fuelSurcharge: { type: Number, default: 0 },
  returnCharge: { type: Number, default: 0 },
  tax: { type: String },
  currency: { type: String, default: 'INR' },

  // Tracking & Integration
  trackingUrl: { type: String },
  trackingPrefix: { type: String },
  apiAvailable: { type: Boolean, default: false },
  apiProvider: { type: String },
  autoTrackingUpdate: { type: Boolean, default: false },

  // Documents
  agreementDoc: { type: String },
  gstCertificateDoc: { type: String },
  rateContractDoc: { type: String },

  // Additional Information
  isDefaultCourier: { type: Boolean, default: false },
  priority: { type: Number },
  remarks: { type: String }
}, { timestamps: true });

const Courier = mongoose.model('Courier', courierSchema);

module.exports = { Courier };
