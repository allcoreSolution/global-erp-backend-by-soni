const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecure_global_erp_secret_key_12345', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Private/SuperAdmin
const registerUser = async (req, res, next) => {
  const { username, email, password, roleName } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email or username'));
    }

    // Find the role
    const role = await Role.findOne({ name: roleName || 'SalesStaff' });
    if (!role) {
      res.status(400);
      return next(new Error('Specified role does not exist'));
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role._id
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: role.name,
        token: generateToken(user._id)
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, username, password } = req.body;
  const loginIdentifier = email || username;

  try {
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { username: loginIdentifier }]
    }).populate('role').populate({
      path: 'company',
      populate: { path: 'subscriptionPlan' }
    });

    if (user && (await user.comparePassword(password))) {
      
      if (!user.isActive) {
        res.status(403);
        throw new Error('Your account is deactivated');
      }

      // Check Company Subscription Expiry
      if (user.company && user.role?.name !== 'SuperAdmin') {
        const company = user.company;
        if (company.subscriptionStatus === 'Suspended') {
          res.status(403);
          throw new Error('Your company account is suspended. Please contact support.');
        }
        if (company.subscriptionExpiry && new Date(company.subscriptionExpiry) < new Date()) {
          res.status(403);
          throw new Error('Subscription Expired. Please ask your administrator to renew the plan.');
        }
      }

      const ALL_MODULES = ['Dashboard', 'Sales', 'Purchase', 'Inventory', 'Customers', 'Accounts', 'HRMS', 'Attendance', 'Leave', 'Payroll', 'Reports', 'Settings'];
      const allowedModules = user.role?.name === 'SuperAdmin'
        ? ALL_MODULES
        : (user.company?.subscriptionPlan?.allowedModules || []);

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role?.name || 'Staff',
        permissions: user.role?.permissions || [],
        modulePermissions: user.role?.modulePermissions || [],
        allowedModules: allowedModules,
        company: user.company ? {
          _id: user.company._id,
          name: user.company.name,
          logoUrl: user.company.logoUrl,
          themeColor: user.company.themeColor,
          allowedModules: allowedModules
        } : null,
        token: generateToken(user._id)
      });
    } else {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('role')
      .populate({
        path: 'company',
        populate: { path: 'subscriptionPlan' }
      })
      .populate('department')
      .populate('designation');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const ALL_MODULES = ['Dashboard', 'Sales', 'Purchase', 'Inventory', 'Customers', 'Accounts', 'HRMS', 'Attendance', 'Leave', 'Payroll', 'Reports', 'Settings'];
    const allowedModules = user.role?.name === 'SuperAdmin'
      ? ALL_MODULES
      : (user.company?.subscriptionPlan?.allowedModules || []);

    res.json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      profilePhoto: user.profilePhoto || '',
      role: user.role?.name || 'Staff',
      roleId: user.role?._id,
      permissions: user.role?.permissions || [],
      modulePermissions: user.role?.modulePermissions || [],
      allowedModules: allowedModules,
      department: user.department?.name || '',
      designation: user.designation?.name || '',
      company: user.company ? {
        _id: user.company._id,
        name: user.company.name,
        logoUrl: user.company.logoUrl,
        themeColor: user.company.themeColor,
        allowedModules: allowedModules
      } : null,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { username, email, phone, currentPassword, newPassword, profilePhoto } = req.body;

    // Validate and update email
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'This email is already in use by another user' });
      }
      user.email = email.toLowerCase().trim();
    }

    // Validate and update username
    if (username && username.trim() !== user.username) {
      const usernameExists = await User.findOne({ username: username.trim(), _id: { $ne: user._id } });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'This username is already taken' });
      }
      user.username = username.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (profilePhoto !== undefined) {
      user.profilePhoto = profilePhoto;
    }

    // Multer file upload support
    if (req.file) {
      user.profilePhoto = `/uploads/employees/${req.file.filename}`;
    }

    // Change password logic if requested
    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
      }
      if (currentPassword) {
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password does not match' });
        }
      }
      user.password = newPassword.trim();
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('role')
      .populate('company')
      .populate('department')
      .populate('designation');

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        profilePhoto: updatedUser.profilePhoto || '',
        role: updatedUser.role?.name || 'Staff',
        roleId: updatedUser.role?._id,
        permissions: updatedUser.role?.permissions || [],
        modulePermissions: updatedUser.role?.modulePermissions || [],
        department: updatedUser.department?.name || '',
        designation: updatedUser.designation?.name || '',
        company: updatedUser.company ? {
          _id: updatedUser.company._id,
          name: updatedUser.company.name,
          logoUrl: updatedUser.company.logoUrl,
          themeColor: updatedUser.company.themeColor
        } : null,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password'
      });
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match. Please verify and try again.'
      });
    }

    user.password = newPassword.trim();
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully!'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword
};
