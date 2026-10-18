const AccountGroup = require('../models/AccountGroup');

exports.createAccountGroup = async (req, res) => {
  try {
    const { groupName, parentGroup, description } = req.body;
    const newGroup = new AccountGroup({ groupName, parentGroup, description });
    await newGroup.save();
    res.status(201).json({ success: true, data: newGroup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAccountGroups = async (req, res) => {
  try {
    const groups = await AccountGroup.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAccountGroup = async (req, res) => {
  try {
    await AccountGroup.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
