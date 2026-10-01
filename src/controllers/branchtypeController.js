const BranchType = require('../models/BranchType');

exports.getAllBranchTypes = async (req, res) => {
  try {
    const data = await BranchType.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBranchType = async (req, res) => {
  try {
    const newData = new BranchType(req.body);
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateBranchType = async (req, res) => {
  try {
    const updatedData = await BranchType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBranchType = async (req, res) => {
  try {
    await BranchType.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'BranchType deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
