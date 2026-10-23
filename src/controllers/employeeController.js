const path = require('path');
const mongoose = require('mongoose');
const { Employee } = require('../models/Employee');
const User = require('../models/User');
const Role = require('../models/Role');
const Company = require('../models/Company');

// @desc    Create a new Employee
// @route   POST /api/employees
// @access  Private
const createEmployee = async (req, res, next) => {
  try {
    const employeeData = { ...req.body };
    if (req.file && req.file.filename) {
      employeeData.profilePhoto = `/uploads/employees/${req.file.filename}`;
    } else if (req.file && req.file.path) {
      employeeData.profilePhoto = `/uploads/employees/${path.basename(req.file.path)}`;
    }

    const rawCompany = req.user?.company || req.user?.companyId || req.body.company;
    let companyId = null;

    if (rawCompany) {
      if (typeof rawCompany === 'object' && rawCompany._id) {
        companyId = rawCompany._id;
      } else if (mongoose.Types.ObjectId.isValid(rawCompany)) {
        companyId = rawCompany;
      } else if (typeof rawCompany === 'string') {
        const compDoc = await Company.findOne({ name: rawCompany });
        if (compDoc) {
          companyId = compDoc._id;
        }
      }
    }

    const finalCompanyId = companyId ? companyId.toString() : (req.user?.companyId ? req.user.companyId.toString() : (req.user?.company ? req.user.company.toString() : ''));

    const newEmployee = await Employee.create({
      ...employeeData,
      company: finalCompanyId
    });

    // Auto-create ERP Login User if createLogin is 'Yes'
    if (employeeData.createLogin === 'Yes' && (employeeData.email || employeeData.username)) {
      try {
        const loginEmail = (employeeData.email || '').trim().toLowerCase();
        let loginUsername = (employeeData.username || (loginEmail ? loginEmail.split('@')[0] : '') || employeeData.employeeId).trim();
        const rawPassword = employeeData.password || employeeData.mobile || 'Emp@123';

        // Check if username is taken, make it unique if needed
        const usernameExists = await User.findOne({ username: loginUsername });
        if (usernameExists && usernameExists.email !== loginEmail) {
          loginUsername = `${loginUsername}_${Date.now().toString().slice(-4)}`;
        }

        const existingUser = await User.findOne({
          $or: [{ email: loginEmail }, { username: loginUsername }]
        });

        if (!existingUser) {
          // Resolve selected Role
          let roleDoc = null;
          if (employeeData.role) {
            const trimmedRole = employeeData.role.trim();
            const roleConditions = [
              { name: trimmedRole },
              { roleCode: trimmedRole }
            ];
            const roleQuery = { $or: roleConditions };
            if (companyId) {
              roleQuery.$and = [{ $or: [{ company: companyId }, { company: null }] }];
            }
            roleDoc = await Role.findOne(roleQuery);
          }
          if (!roleDoc) {
            roleDoc = await Role.findOne({ name: 'Staff' }) || await Role.findOne({ name: 'Admin' }) || await Role.findOne();
          }

          if (roleDoc) {
            await User.create({
              username: loginUsername,
              email: loginEmail,
              password: rawPassword,
              role: roleDoc._id,
              company: companyId || null,
              isActive: employeeData.loginStatus !== 'Inactive'
            });
          }
        }
      } catch (userErr) {
        console.error("Warning: Failed to auto-create ERP login user:", userErr.message);
      }
    }

    res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
    console.error("CREATE EMPLOYEE ERROR:", error);
    next(error);
  }
};

// @desc    Get all Employees
// @route   GET /api/employees
// Helper to check if user has company-wide employee viewing permission
const canViewAllEmployees = (user) => {
  if (!user || !user.role) return false;
  const roleName = user.role.name || '';
  if (roleName === 'SuperAdmin' || roleName === 'Admin') return true;

  const perms = Array.isArray(user.role.permissions) ? user.role.permissions : [];
  if (perms.some(p => ['view_employees', 'view_hrms', 'view_attendance', 'manage_hrms'].includes(p))) {
    return true;
  }

  const modPerms = Array.isArray(user.role.modulePermissions) ? user.role.modulePermissions : [];
  const empMod = modPerms.find(m => ['employees', 'employee', 'hrms', 'attendance'].includes((m.module || m.name || '').toLowerCase()));
  if (empMod && empMod.view) return true;

  return false;
};

// @desc    Get all Employees (or self only if no permission)
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res, next) => {
  try {
    const hasViewPerm = canViewAllEmployees(req.user);

    if (hasViewPerm) {
      const rawComp = req.user?.company?._id || req.user?.company || req.user?.companyId;
      const userCompanyId = rawComp ? rawComp.toString() : null;
      let query = {};
      
      if (userCompanyId) {
        query = { $or: [{ company: userCompanyId }, { company: rawComp }, { company: null }, { company: '' }] };
      } else if (req.query.company) {
        // Super Admin filtering by specific company ID or Name
        query = {
          $or: [
            { company: req.query.company },
            { company: new RegExp(`^${req.query.company}$`, 'i') }
          ]
        };
      }

      const employees = await Employee.find(query).lean();

      // Resolve Company names for clear display
      const companies = await Company.find({}).select('_id name email').lean();
      const compMap = new Map();
      companies.forEach(c => {
        compMap.set(c._id.toString(), c.name);
        compMap.set(c.name.toLowerCase(), c.name);
      });

      const enrichedEmployees = employees.map(emp => {
        const cKey = (emp.company || '').toString().trim();
        let resolvedName = compMap.get(cKey) || compMap.get(cKey.toLowerCase());
        
        // If not found in map, or is a 24-character hex ID, do not display hex string
        if (!resolvedName) {
          if (/^[0-9a-fA-F]{24}$/.test(cKey)) {
            // Find if any company matches or default to first registered company name
            resolvedName = companies.length > 0 ? companies[0].name : 'Company';
          } else if (cKey) {
            resolvedName = cKey;
          } else {
            resolvedName = 'Unassigned';
          }
        }

        return {
          ...emp,
          company: resolvedName,
          companyName: resolvedName
        };
      });

      return res.json({ success: true, count: enrichedEmployees.length, data: enrichedEmployees });
    }

    // Normal staff without manager view rights: return only their own employee profile
    let myEmp = null;
    if (req.user?.employeeId) {
      myEmp = await Employee.findOne({ employeeId: req.user.employeeId });
    }
    if (!myEmp && req.user?.email) {
      myEmp = await Employee.findOne({ email: req.user.email });
    }
    if (!myEmp && (req.user?.username || req.user?.name)) {
      const uname = (req.user.username || req.user.name).trim();
      myEmp = await Employee.findOne({
        $or: [
          { employeeName: new RegExp(`^${uname}$`, 'i') },
          { employeeId: uname }
        ]
      });
    }

    if (myEmp) {
      return res.json({ success: true, data: [myEmp] });
    }

    // Fallback self profile
    return res.json({
      success: true,
      data: [{
        _id: req.user._id,
        employeeId: req.user.employeeId || req.user.username || 'EMP-ME',
        employeeName: req.user.username || 'My Profile',
        department: 'Staff',
        designation: req.user.role?.name || 'Employee',
        shift: 'General Shift',
        status: 'Active'
      }]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      res.status(404);
      return next(new Error('Employee not found'));
    }
    const empData = employee.toObject();
    if (empData.company) {
      try {
        const comp = await Company.findById(empData.company);
        if (comp) {
          empData.companyName = comp.name;
        }
      } catch (e) {
        // Fallback silently if company is not a valid ObjectId or not found
      }
    }
    res.json({ success: true, data: empData });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Employee
// @route   PUT /api/employees/:id
// @access  Private
const updateEmployee = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file && req.file.filename) {
      updateData.profilePhoto = `/uploads/employees/${req.file.filename}`;
    } else if (req.file && req.file.path) {
      updateData.profilePhoto = `/uploads/employees/${path.basename(req.file.path)}`;
    }

    const rawCompany = req.user?.company || req.user?.companyId || updateData.company;
    let companyId = null;
    if (rawCompany) {
      if (typeof rawCompany === 'object' && rawCompany._id) {
        companyId = rawCompany._id;
      } else if (mongoose.Types.ObjectId.isValid(rawCompany)) {
        companyId = rawCompany;
      } else if (typeof rawCompany === 'string') {
        const compDoc = await Company.findOne({ name: rawCompany });
        if (compDoc) {
          companyId = compDoc._id;
        }
      }
    }

    if (companyId) {
      updateData.company = companyId.toString();
    } else if (updateData.company && !mongoose.Types.ObjectId.isValid(updateData.company)) {
      delete updateData.company;
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!employee) {
      res.status(404);
      return next(new Error('Employee not found'));
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Employee
// @route   DELETE /api/employees/:id
// @access  Private
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      res.status(404);
      return next(new Error('Employee not found'));
    }
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Import Employees
// @route   POST /api/employees/import
// @access  Private
const importEmployees = async (req, res, next) => {
  try {
    const employees = req.body;
    if (!Array.isArray(employees) || employees.length === 0) {
      res.status(400);
      return next(new Error('Invalid or empty data'));
    }

    const companyId = req.user?.companyId;
    const employeesWithCompany = employees.map(emp => ({
      ...emp,
      company: companyId || emp.company
    }));

    const imported = await Employee.insertMany(employeesWithCompany, { ordered: false });
    res.status(201).json({ success: true, count: imported.length, data: imported });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(207).json({ success: true, message: 'Imported with some duplicate errors', count: error.insertedDocs?.length || 0 });
    }
    next(error);
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  importEmployees
};
