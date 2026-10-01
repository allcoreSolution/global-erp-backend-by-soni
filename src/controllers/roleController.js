const Role = require('../models/Role');

// @desc    Get all roles for the current company + global roles
// @route   GET /api/roles
// @access  Private
const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find({});
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new role for the current company
// @route   POST /api/roles
// @access  Private (manage_roles permission)
const createRole = async (req, res, next) => {
  try {
    const { 
      roleCode, roleName, name, roleType, description, status, company,
      companyAccess, branchAccess, departmentAccess, warehouseAccess,
      defaultBranch, defaultWarehouse,
      modulePermissions, approvalPermissions, specialPermissions,
      permissions
    } = req.body;
    
    // We can use roleName or name for backward compatibility
    const finalName = roleName || name;

    if (!finalName) {
      res.status(400);
      throw new Error('Role name is required');
    }

    // Check if role already exists in this company context
    const roleExists = await Role.findOne({ name: finalName });
    if (roleExists) {
      res.status(400);
      throw new Error('Role already exists with this name');
    }

    const mongoose = require('mongoose');
    let validCompanyId = null;
    if (company && mongoose.Types.ObjectId.isValid(company)) {
      validCompanyId = company;
    }

    const role = await Role.create({
      name: finalName,
      roleCode,
      roleType,
      description,
      status,
      company: validCompanyId,
      companyAccess,
      branchAccess,
      departmentAccess,
      warehouseAccess,
      defaultBranch,
      defaultWarehouse,
      modulePermissions: modulePermissions || [],
      approvalPermissions: approvalPermissions || [],
      specialPermissions: specialPermissions || [],
      permissions: permissions || []
    });

    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoles,
  createRole
};
