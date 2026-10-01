const PaymentStatus = require('../models/PaymentStatus');

exports.getAllPaymentStatuss = async (req, res) => {
  try {
    const data = await PaymentStatus.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPaymentStatus = async (req, res) => {
  try {
    const newData = new PaymentStatus(req.body);
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const updatedData = await PaymentStatus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePaymentStatus = async (req, res) => {
  try {
    await PaymentStatus.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'PaymentStatus deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
