const path = require('path');
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

    const companyId = req.user?.company || req.user?.companyId || req.body.company;

    const newEmployee = await Employee.create({
      ...employeeData,
      company: companyId
    });

    // Auto-create ERP Login User if createLogin is 'Yes'
    if (employeeData.createLogin === 'Yes' && (employeeData.email || employeeData.username)) {
      const loginEmail = (employeeData.email || '').trim().toLowerCase();
      const loginUsername = (employeeData.username || loginEmail.split('@')[0] || employeeData.employeeId).trim();
      const rawPassword = employeeData.password || employeeData.mobile || 'Emp@123';

      // Check if User already exists
      const existingUser = await User.findOne({
        $or: [{ email: loginEmail }, { username: loginUsername }]
      });

      if (!existingUser) {
        // Resolve selected Role
        let roleDoc = null;
        if (employeeData.role) {
          roleDoc = await Role.findOne({
            name: employeeData.role,
            ...(companyId ? { $or: [{ company: companyId }, { company: null }] } : {})
          });
        }
        if (!roleDoc) {
          roleDoc = await Role.findOne({ name: 'Staff' }) || await Role.findOne();
        }

        if (roleDoc) {
          await User.create({
            username: loginUsername,
            email: loginEmail,
            password: rawPassword, // will be hashed automatically by userSchema.pre('save')
            role: roleDoc._id,
            company: companyId || null,
            isActive: employeeData.loginStatus !== 'Inactive'
          });
        }
      }
    }

    res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
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
      const companyId = req.user?.company || req.user?.companyId;
      const query = companyId ? { $or: [{ company: companyId }, { company: null }] } : {};
      const employees = await Employee.find(query);
      return res.json({ success: true, data: employees });
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
