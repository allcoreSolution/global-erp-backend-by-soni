const mongoose = require('mongoose');
const { Courier } = require('../models/Courier');

const getQueryById = (idParam, company) => {
  const or = [];
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    or.push({ _id: idParam });
  }
  or.push({ courierCode: idParam });

  if (company) {
    return { company, $or: or };
  }
  return { $or: or };
};

// @desc    Create a new Courier
// @route   POST /api/couriers
// @access  Private
const createCourier = async (req, res, next) => {
  try {
    const company = req.user?.companyId || req.user?.company || req.body.company || '';
    let code = req.body.courierCode;

    // Check if code is missing or already exists in this company
    const filter = company ? { company, courierCode: code } : { courierCode: code };
    const codeExists = code ? await Courier.collection.findOne(filter) : false;

    if (!code || codeExists) {
      // Find highest existing CR- number for this company
      const companyQuery = company ? { company } : {};
      const allCouriers = await Courier.collection.find(companyQuery, { projection: { courierCode: 1 } }).toArray();
      let maxNum = 0;
      for (const c of allCouriers) {
        const val = c.courierCode || '';
        const match = String(val).match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
      code = `CR-${String(maxNum + 1).padStart(5, '0')}`;
      while (await Courier.collection.findOne(company ? { company, courierCode: code } : { courierCode: code })) {
        maxNum++;
        code = `CR-${String(maxNum).padStart(5, '0')}`;
      }
    }

    const newCourier = await Courier.create({
      ...req.body,
      courierCode: code,
      company
    });

    res.status(201).json({ success: true, data: newCourier });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Couriers
// @route   GET /api/couriers
// @access  Private
const getCouriers = async (req, res, next) => {
  try {
    const company = req.user?.companyId || req.user?.company || '';
    const query = company ? { company } : {};
    const couriers = await Courier.find(query);
    res.json({ success: true, data: couriers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Courier by ID
// @route   GET /api/couriers/:id
// @access  Private
const getCourierById = async (req, res, next) => {
  try {
    const company = req.user?.companyId || req.user?.company || '';
    const query = getQueryById(req.params.id, company);
    const courier = await Courier.findOne(query);
    if (!courier) {
      res.status(404);
      return next(new Error('Courier not found'));
    }
    res.json({ success: true, data: courier });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Courier
// @route   PUT /api/couriers/:id
// @access  Private
const updateCourier = async (req, res, next) => {
  try {
    const company = req.user?.companyId || req.user?.company || '';
    const query = getQueryById(req.params.id, company);
    const courier = await Courier.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true
    });
    if (!courier) {
      res.status(404);
      return next(new Error('Courier not found'));
    }
    res.json({ success: true, data: courier });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Courier
// @route   DELETE /api/couriers/:id
// @access  Private
const deleteCourier = async (req, res, next) => {
  try {
    const company = req.user?.companyId || req.user?.company || '';
    const query = getQueryById(req.params.id, company);
    const courier = await Courier.findOneAndDelete(query);
    if (!courier) {
      res.status(404);
      return next(new Error('Courier not found'));
    }
    res.json({ success: true, message: 'Courier deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourier,
  getCouriers,
  getCourierById,
  updateCourier,
  deleteCourier
};
