const State = require('../models/State');

exports.getAllStates = async (req, res) => {
  try {
    const data = await State.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createState = async (req, res) => {
  try {
    const newData = new State(req.body);
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateState = async (req, res) => {
  try {
    const updatedData = await State.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteState = async (req, res) => {
  try {
    await State.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'State deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
