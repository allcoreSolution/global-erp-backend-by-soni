const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const { setContext } = require('./tenantContext');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecure_global_erp_secret_key_12345');

      // Get user from token and populate role
      req.user = await User.findById(decoded.id).select('-password').populate('role');
      
      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }

      if (!req.user.isActive) {
        res.status(403);
        return next(new Error('User account is deactivated'));
      }

      // Dynamic Company Switching via x-company-id Header
      const requestedCompanyId = req.headers['x-company-id'];
      const userRoleName = req.user.role?.name || '';
      let activeCompanyId = req.user.company ? req.user.company.toString() : null;

      if (requestedCompanyId && mongoose.Types.ObjectId.isValid(requestedCompanyId)) {
        // SuperAdmin & Admin can switch to any active company
        if (userRoleName === 'SuperAdmin' || userRoleName === 'Admin') {
          activeCompanyId = requestedCompanyId;
        } else if (
          (req.user.company && req.user.company.toString() === requestedCompanyId) ||
          (Array.isArray(req.user.assignedCompanies) && req.user.assignedCompanies.some(c => c.toString() === requestedCompanyId))
        ) {
          activeCompanyId = requestedCompanyId;
        }
      }

      // Set context for tenant isolation
      if (activeCompanyId) {
        req.user.companyId = activeCompanyId;
        setContext('companyId', activeCompanyId);
      }
      if (req.user.role) {
        setContext('roleName', userRoleName);
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      return next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }
};

const { MODULE_KEY_MAP } = require('../config/permissions');

// Permission checker middleware: supports string keys, module names, and action checks
const checkPermission = (permission, explicitAction = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ success: false, message: 'Access denied: Role info missing' });
      }

      const role = req.user.role;

      // 1. SuperAdmin and Admin get full bypass
      if (role.name === 'SuperAdmin' || role.name === 'Admin') {
        return next();
      }

      // Determine required action based on HTTP method if not explicitly passed
      let action = explicitAction;
      if (!action) {
        switch (req.method) {
          case 'GET': action = 'view'; break;
          case 'POST': action = 'create'; break;
          case 'PUT':
          case 'PATCH': action = 'edit'; break;
          case 'DELETE': action = 'delete'; break;
          default: action = 'view';
        }
      }

      const permList = Array.isArray(permission) ? permission : [permission];

      // 2. Direct string permissions array match (legacy or explicit)
      const hasDirectPerm = permList.some(p => Array.isArray(role.permissions) && role.permissions.includes(p));
      if (hasDirectPerm) {
        return next();
      }

      // 3. Module Permissions Matrix check
      if (Array.isArray(role.modulePermissions) && role.modulePermissions.length > 0) {
        for (const singlePerm of permList) {
          const mapped = MODULE_KEY_MAP[singlePerm];
          const targetModuleName = typeof (mapped ? mapped.module : singlePerm) === 'string'
            ? (mapped ? mapped.module : singlePerm)
            : String(singlePerm || '');
          const targetAction = mapped && !explicitAction ? mapped.action : action;

          const modPerm = role.modulePermissions.find(
            m => (m.module || m.name || '').toLowerCase() === targetModuleName.toLowerCase()
          );

          if (modPerm) {
            if (targetAction === 'view' && modPerm.view) return next();
            if (targetAction === 'create' && (modPerm.create || modPerm.edit)) return next();
            if (targetAction === 'edit' && modPerm.edit) return next();
            if (targetAction === 'delete' && modPerm.delete) return next();
            if (targetAction === 'approve' && modPerm.approve) return next();
            if (targetAction === 'export' && modPerm.export) return next();
          }
        }
      }

      // If neither check passed, deny access
      return res.status(403).json({
        success: false,
        message: `Access denied: Missing permission '${Array.isArray(permission) ? permission.join(', ') : permission}' (${action})`
      });
    } catch (error) {
      next(error);
    }
  };
};

const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role && req.user.role.name === 'SuperAdmin') {
    return next();
  }
  res.status(403);
  next(new Error('Not authorized. Super Admin only.'));
};

module.exports = { protect, checkPermission, superAdminOnly };
