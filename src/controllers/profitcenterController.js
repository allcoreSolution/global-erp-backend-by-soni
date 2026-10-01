const ProfitCenter = require('../models/ProfitCenter');

exports.getAllProfitCenters = async (req, res) => {
  try {
    const data = await ProfitCenter.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProfitCenter = async (req, res) => {
  try {
    const newData = new ProfitCenter(req.body);
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProfitCenter = async (req, res) => {
  try {
    const updatedData = await ProfitCenter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProfitCenter = async (req, res) => {
  try {
    await ProfitCenter.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'ProfitCenter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
