const CustomerType = require('../models/CustomerType');

exports.createCustomerType = async (req, res) => {
  try {
    const customerType = new CustomerType(req.body);
    await customerType.save();
    res.status(201).json({ success: true, data: customerType });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCustomerTypes = async (req, res) => {
  try {
    const customerTypes = await CustomerType.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: customerTypes });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCustomerType = async (req, res) => {
  try {
    const customerType = await CustomerType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customerType) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: customerType });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCustomerType = async (req, res) => {
  try {
    const customerType = await CustomerType.findByIdAndDelete(req.params.id);
    if (!customerType) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
