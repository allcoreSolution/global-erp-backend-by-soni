const CountType = require('../models/CountType');

exports.getCountTypes = async (req, res) => {
  try {
    const countTypes = await CountType.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: countTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCountType = async (req, res) => {
  try {
    const countType = await CountType.create(req.body);
    res.status(201).json({ success: true, data: countType });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Count Type already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCountType = async (req, res) => {
  try {
    const countType = await CountType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!countType) {
      return res.status(404).json({ success: false, message: 'Count Type not found' });
    }
    res.status(200).json({ success: true, data: countType });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCountType = async (req, res) => {
  try {
    const countType = await CountType.findByIdAndDelete(req.params.id);
    if (!countType) {
      return res.status(404).json({ success: false, message: 'Count Type not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
