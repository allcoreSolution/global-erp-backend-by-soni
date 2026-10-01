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
    unique: true,
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
  
  // Access Scopes
  companyAccess: { type: String, default: 'All' },
  branchAccess: { type: String, default: 'All' },
  departmentAccess: { type: String, default: 'All' },
  warehouseAccess: { type: String, default: 'All' },
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

module.exports = mongoose.model('Role', roleSchema);
