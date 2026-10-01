const TimeZone = require('../models/TimeZone');

exports.getAllTimeZones = async (req, res) => {
  try {
    const data = await TimeZone.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTimeZone = async (req, res) => {
  try {
    const newData = new TimeZone(req.body);
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateTimeZone = async (req, res) => {
  try {
    const updatedData = await TimeZone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteTimeZone = async (req, res) => {
  try {
    await TimeZone.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'TimeZone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
