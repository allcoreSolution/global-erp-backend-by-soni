const CostCenter = require('../models/CostCenter');

exports.getAllCostCenters = async (req, res) => {
  try {
    const data = await CostCenter.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCostCenter = async (req, res) => {
  try {
    const newData = new CostCenter(req.body);
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCostCenter = async (req, res) => {
  try {
    const updatedData = await CostCenter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCostCenter = async (req, res) => {
  try {
    await CostCenter.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'CostCenter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
