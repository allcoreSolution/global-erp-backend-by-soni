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
      // 2. Only show roles specifically belonging to their company (no global template fallback)
      query = {
        name: { $ne: 'SuperAdmin' }
      };

      if (userCompanyId) {
        query.company = userCompanyId;
      }
    }

    const roles = await Role.find(query).sort({ createdAt: -1 });
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

// @desc    Get next auto-generated sequential role code (guaranteed unique)
// @route   GET /api/roles/next-code
// @access  Private
const getNextRoleCode = async (req, res, next) => {
  try {
    // Check all roles in database to guarantee global uniqueness
    const roles = await Role.find({}).select('roleCode');
    const existingCodes = new Set(
      roles
        .map(r => (r.roleCode || '').toUpperCase().trim())
        .filter(Boolean)
    );

    let maxNum = 0;
    roles.forEach(r => {
      const match = (r.roleCode || '').match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });

    let nextNum = Math.max(maxNum, roles.length) + 1;
    let nextCode = `ROL-${String(nextNum).padStart(3, '0')}`;

    // Loop until we find a code that has never been used
    while (existingCodes.has(nextCode.toUpperCase())) {
      nextNum++;
      nextCode = `ROL-${String(nextNum).padStart(3, '0')}`;
    }

    res.json({ success: true, nextCode });
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
      roleCode, roleName, name, roleType, status,
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

    // Check if role name already exists in this company context
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

    // Enforce strictly unique, non-repeating roleCode across entire DB
    const allRoles = await Role.find({}).select('roleCode');
    const existingCodes = new Set(
      allRoles
        .map(r => (r.roleCode || '').toUpperCase().trim())
        .filter(Boolean)
    );

    let finalRoleCode = (roleCode || '').trim();
    if (!finalRoleCode) {
      let maxNum = 0;
      allRoles.forEach(r => {
        const match = (r.roleCode || '').match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      let nextNum = Math.max(maxNum, allRoles.length) + 1;
      finalRoleCode = `ROL-${String(nextNum).padStart(3, '0')}`;
      while (existingCodes.has(finalRoleCode.toUpperCase())) {
        nextNum++;
        finalRoleCode = `ROL-${String(nextNum).padStart(3, '0')}`;
      }
    } else {
      if (existingCodes.has(finalRoleCode.toUpperCase())) {
        res.status(400);
        throw new Error(`Role Code "${finalRoleCode}" is already in use and cannot be reused. Please use a unique Role Code.`);
      }
    }

    const role = await Role.create({
      name: finalName,
      roleCode: finalRoleCode,
      roleType: roleType || 'Custom',
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
      roleCode, roleName, name, status,
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
    if (roleCode !== undefined) {
      const trimmedCode = roleCode.trim();
      if (trimmedCode && trimmedCode !== (role.roleCode || '').trim()) {
        const codeExists = await Role.findOne({
          _id: { $ne: req.params.id },
          roleCode: { $regex: new RegExp(`^${trimmedCode}$`, 'i') }
        });
        if (codeExists) {
          res.status(400);
          throw new Error(`Role Code "${trimmedCode}" is already in use by another role.`);
        }
      }
      role.roleCode = trimmedCode;
    }
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
  getNextRoleCode,
  createRole,
  updateRole,
  deleteRole
};
