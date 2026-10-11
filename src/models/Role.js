const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: { type: String },
  module: { type: String }, // For module permissions
  view: { type: Boolean, default: false },
  create: { type: Boolean, default: false },
  edit: { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
  approve: { type: Boolean, default: false },
  export: { type: Boolean, default: false }
}, { _id: false });

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  roleCode: { type: String },
  roleType: { type: String, default: 'Custom' },
  description: {
    type: String,
    default: ''
  },
  status: { type: String, default: 'Active' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  
  // Access Scopes (Defaults to Single company isolation; SuperAdmin gets All)
  companyAccess: { type: String, default: 'Single' },
  branchAccess: { type: String, default: 'Single' },
  departmentAccess: { type: String, default: 'Single' },
  warehouseAccess: { type: String, default: 'Single' },
  defaultBranch: { type: String },
  defaultWarehouse: { type: String },

  // Detailed Permissions
  modulePermissions: [permissionSchema],
  approvalPermissions: [permissionSchema],
  specialPermissions: [permissionSchema],

  // Fallback for old style array of strings
  permissions: {
    type: [String],
    default: []
  }
}, { timestamps: true });

// Compound index so different companies can have roles with the same name, but inside one company name must be unique
roleSchema.index({ company: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
