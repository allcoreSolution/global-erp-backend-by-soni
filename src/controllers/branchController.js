const { Branch } = require('../models/Branch');

const createBranch = async (req, res, next) => {
  try {
    let id = req.body.id;
    if (!id) {
      id = `BR-${Date.now().toString().slice(-4)}`;
    }
    
    const branch = await Branch.create({
      ...req.body,
      id,
      company: req.user?.company || req.body.company
    });
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

const getBranches = async (req, res, next) => {
  try {
    const query = req.user?.company ? { company: req.user.company } : {};
    const branches = await Branch.find(query);
    res.json({ success: true, data: branches });
  } catch (error) {
    next(error);
  }
};

const getBranchById = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      res.status(404);
      return next(new Error('Branch not found'));
    }
    res.json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

const updateBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!branch) {
      res.status(404);
      return next(new Error('Branch not found'));
    }
    res.json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

const patchBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: true }
    );
    if (!branch) {
      res.status(404);
      return next(new Error('Branch not found'));
    }
    res.json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

const deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      res.status(404);
      return next(new Error('Branch not found'));
    }
    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  patchBranch,
  deleteBranch
};
