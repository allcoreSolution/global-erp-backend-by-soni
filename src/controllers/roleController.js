const Role = require('../models/Role');

// @desc    Get all roles for the current company + global roles
// @route   GET /api/roles
// @access  Private
const getRoles = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user?.role?.name === 'SuperAdmin';
    const userCompanyId = req.user?.company;

    let query = {};

    if (isSuperAdmin) {
      // SuperAdmin can see all roles
      query = {};
    } else {
      // Normal Admin or Staff:
      // 1. Hide SuperAdmin role
      // 2. Only show roles belonging to their company, OR global template roles without company
      query = {
        name: { $ne: 'SuperAdmin' }
      };

      if (userCompanyId) {
        query.$or = [
          { company: userCompanyId },
          { company: { $exists: false } },
          { company: null }
        ];
      }
    }

    const roles = await Role.find(query).sort({ createdAt: -1 });
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new role for the current company
// @route   POST /api/roles
// @access  Private (create_roles permission)
const createRole = async (req, res, next) => {
  try {
    const { 
      roleCode, roleName, name, roleType, description, status,
      companyAccess, branchAccess, departmentAccess, warehouseAccess,
      defaultBranch, defaultWarehouse,
      modulePermissions, approvalPermissions, specialPermissions,
      permissions
    } = req.body;
    
    // We can use roleName or name for backward compatibility
    const finalName = (roleName || name || '').trim();

    if (!finalName) {
      res.status(400);
      throw new Error('Role name is required');
    }

    // Company of the creating user
    const userCompanyId = req.user?.company || null;
    const isSuperAdminUser = req.user?.role?.name === 'SuperAdmin';

    // Prevent non-superadmins from creating a role named SuperAdmin
    if (!isSuperAdminUser && finalName.toLowerCase() === 'superadmin') {
      res.status(403);
      throw new Error('Only SuperAdmin can manage SuperAdmin roles');
    }

    // Check if role already exists in this company context
    const roleExistsQuery = { name: finalName };
    if (userCompanyId) {
      roleExistsQuery.company = userCompanyId;
    }

    const roleExists = await Role.findOne(roleExistsQuery);
    if (roleExists) {
      res.status(400);
      throw new Error(`Role "${finalName}" already exists for this company`);
    }

    const isSuperAdminRole = finalName.toLowerCase() === 'superadmin';
    const defaultScope = isSuperAdminRole ? 'All' : 'Single';

    const role = await Role.create({
      name: finalName,
      roleCode: (roleCode || '').trim(),
      roleType: roleType || 'Custom',
      description: (description || '').trim(),
      status: status || 'Active',
      company: userCompanyId,
      companyAccess: companyAccess || defaultScope,
      branchAccess: branchAccess || defaultScope,
      departmentAccess: departmentAccess || defaultScope,
      warehouseAccess: warehouseAccess || defaultScope,
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

// @desc    Update an existing role
// @route   PUT /api/roles/:id
// @access  Private
const updateRole = async (req, res, next) => {
  try {
    const { 
      roleCode, roleName, name, description, status,
      modulePermissions, approvalPermissions, specialPermissions,
      permissions
    } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      res.status(404);
      throw new Error('Role not found');
    }

    const isSuperAdminUser = req.user?.role?.name === 'SuperAdmin';
    const userCompanyId = req.user?.company;

    // Protection: Normal admin cannot edit SuperAdmin role
    if (!isSuperAdminUser && role.name === 'SuperAdmin') {
      res.status(403);
      throw new Error('You do not have permission to edit the SuperAdmin role');
    }

    // Protection: Normal admin cannot edit another company's role
    if (!isSuperAdminUser && userCompanyId && role.company && role.company.toString() !== userCompanyId.toString()) {
      res.status(403);
      throw new Error('You cannot edit roles belonging to another company');
    }

    const finalName = (roleName || name || role.name).trim();
    if (finalName !== role.name) {
      const existsQuery = { 
        name: finalName, 
        _id: { $ne: req.params.id }
      };
      if (role.company) {
        existsQuery.company = role.company;
      }
      const exists = await Role.findOne(existsQuery);
      if (exists) {
        res.status(400);
        throw new Error(`Another role already exists with name "${finalName}"`);
      }
    }

    role.name = finalName;
    if (roleCode !== undefined) role.roleCode = roleCode;
    if (description !== undefined) role.description = description;
    if (status !== undefined) role.status = status;
    if (modulePermissions !== undefined) role.modulePermissions = modulePermissions;
    if (approvalPermissions !== undefined) role.approvalPermissions = approvalPermissions;
    if (specialPermissions !== undefined) role.specialPermissions = specialPermissions;
    if (permissions !== undefined) role.permissions = permissions;

    await role.save();
    res.json(role);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Private
const deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      res.status(404);
      throw new Error('Role not found');
    }

    if (role.name === 'SuperAdmin' || role.name === 'Admin') {
      res.status(400);
      throw new Error('System default roles (SuperAdmin/Admin) cannot be deleted');
    }

    const isSuperAdminUser = req.user?.role?.name === 'SuperAdmin';
    const userCompanyId = req.user?.company;

    // Protection: Normal admin cannot delete another company's role
    if (!isSuperAdminUser && userCompanyId && role.company && role.company.toString() !== userCompanyId.toString()) {
      res.status(403);
      throw new Error('You cannot delete roles belonging to another company');
    }

    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole
};
