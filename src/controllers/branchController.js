const mongoose = require('mongoose');
const { Branch } = require('../models/Branch');

const createBranch = async (req, res, next) => {
  try {
    let id = req.body.id;
    if (!id) {
      id = `BR-${Date.now().toString().slice(-4)}`;
    }
    
    const companyId = req.user?.company || req.user?.companyId || req.body.company;

    const branch = await Branch.create({
      ...req.body,
      id,
      company: companyId || null
    });
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      return next(new Error('Yeh Branch pehle se hi registered hai! Kripya dusra Branch Name ya ID use karein.'));
    }
    next(error);
  }
};

const getBranches = async (req, res, next) => {
  try {
    const userCompany = req.user?.company || req.user?.companyId;
    const query = userCompany ? { company: userCompany } : {};
    
    const branches = await Branch.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    next(error);
  }
};

const getBranchById = async (req, res, next) => {
  try {
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { id: req.params.id };

    if (req.user?.company) {
      query.company = req.user.company;
    }

    const branch = await Branch.findOne(query);
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
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { id: req.params.id };

    if (req.user?.company) {
      query.company = req.user.company;
    }

    const branch = await Branch.findOneAndUpdate(query, req.body, {
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
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { id: req.params.id };

    if (req.user?.company) {
      query.company = req.user.company;
    }

    const branch = await Branch.findOneAndUpdate(
      query, 
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
    const query = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { id: req.params.id };

    if (req.user?.company) {
      query.company = req.user.company;
    }

    const branch = await Branch.findOneAndDelete(query);
    if (!branch) {
      res.status(404);
      return next(new Error('Branch not found'));
    }
    res.json({ message: 'Branch removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create branches
// @route   POST /api/branches/bulk
// @access  Private (Needs manage_settings permission)
const bulkImportBranches = async (req, res, next) => {
  try {
    const branches = req.body.branches;
    if (!branches || !Array.isArray(branches)) {
      res.status(400);
      return next(new Error('Invalid branches data'));
    }

    // Attach company to all branches
    const branchesToInsert = branches.map(b => ({
      ...b,
      company: req.user.company,
      // Provide default id if missing
      id: b.id || `BR-${Math.floor(Math.random() * 10000)}`
    }));

    const result = await Branch.insertMany(branchesToInsert, { ordered: false });
    res.status(201).json({ message: `${result.length} branches imported successfully`, data: result });
  } catch (error) {
    // If it's a validation or duplicate key error, we can still report partial success or fail safely
    next(error);
  }
};

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  patchBranch,
  deleteBranch,
  bulkImportBranches
};
