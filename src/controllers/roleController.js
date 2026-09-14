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
    const { name, description, permissions } = req.body;
    
    // Check if role already exists in this company context
    const roleExists = await Role.findOne({ name });
    if (roleExists) {
      res.status(400);
      throw new Error('Role already exists with this name');
    }

    const role = await Role.create({
      name,
      description,
      permissions
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
