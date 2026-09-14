const User = require('../models/User');
const Role = require('../models/Role');

// @desc    Get all users for the current company
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
  const users = await User.find({})
 .select('-password')
  .populate('role')
  .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user in the current company
// @route   POST /api/users
// @access  Private (Needs manage_users permission)
const createUser = async (req, res, next) => {
  try {
    const { username, email, password, roleId, branch } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email or username in the system');
    }

    const role = await Role.findById(roleId);
    if (!role) {
      res.status(400);
      throw new Error('Role not found');
    }

  const user = await User.create({
  username,
      email,
      password,
      role: role._id,
      branch: branch || 'HO'
    });

const populatedUser = await User.findById(user._id)
  .select('-password')
  .populate('role');
    res.status(201).json(populatedUser);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status (Active/Inactive)
// @route   PUT /api/users/:id/toggle-status
// @access  Private
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    const userResponse = user.toObject();
delete userResponse.password;

res.json({
  message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`,
  user: userResponse
});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  toggleUserStatus
};
