const SaleStatus = require('../models/SaleStatus');

exports.getAllSaleStatuss = async (req, res) => {
  try {
    const data = await SaleStatus.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSaleStatus = async (req, res) => {
  try {
    const newData = new SaleStatus(req.body);
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSaleStatus = async (req, res) => {
  try {
    const updatedData = await SaleStatus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSaleStatus = async (req, res) => {
  try {
    await SaleStatus.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'SaleStatus deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
