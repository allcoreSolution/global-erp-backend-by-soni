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
    const branch = await Branch.findOneAndDelete({ _id: req.params.id, company: req.user.company });
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
