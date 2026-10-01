const mongoose = require('mongoose');
const BackupHistory = require('../models/BackupHistory');
const fs = require('fs');
const path = require('path');

// Helper to ensure backups directory exists
const getBackupDir = () => {
  const dir = path.join(__dirname, '../../public/backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// @desc    Get all backups for the company
// @route   GET /api/backups
// @access  Private (Admins)
const getBackups = async (req, res, next) => {
  try {
    const backups = await BackupHistory.find({ company: req.user.company })
      .sort({ createdAt: -1 });
    res.json(backups);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new backup
// @route   POST /api/backups/create
// @access  Private (Admins)
const createBackup = async (req, res, next) => {
  try {
    const companyId = req.user.company;
    const backupData = {};
    
    // Iterate over all registered Mongoose models
    const modelNames = mongoose.modelNames();
    for (const modelName of modelNames) {
      const Model = mongoose.model(modelName);
      
      // Check if schema has 'company' path
      if (Model.schema.paths['company']) {
        const records = await Model.find({ company: companyId }).lean();
        backupData[modelName] = records;
      } else if (modelName === 'Company') {
        // Include the company record itself
        const companyRecord = await Model.findById(companyId).lean();
        if (companyRecord) {
          backupData[modelName] = [companyRecord];
        }
      }
    }

    const jsonString = JSON.stringify(backupData);
    const sizeInBytes = Buffer.byteLength(jsonString, 'utf8');
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    
    const version = `v1.0.0_${Date.now().toString().slice(-4)}`;
    const filename = `backup_${companyId}_${Date.now()}.json`;
    const filePath = path.join(getBackupDir(), filename);
    
    fs.writeFileSync(filePath, jsonString, 'utf8');

    const backup = await BackupHistory.create({
      version,
      size: sizeInMB,
      storage: 'Local Drive',
      status: 'Success',
      filePath: filename,
      company: companyId
    });

    res.status(201).json(backup);
  } catch (error) {
    next(error);
  }
};

// @desc    Restore a backup
// @route   POST /api/backups/restore/:version
// @access  Private (Admins)
const restoreBackup = async (req, res, next) => {
  try {
    const { version } = req.params;
    const backup = await BackupHistory.findOne({ version, company: req.user.company });
    
    if (!backup) {
      res.status(404);
      throw new Error('Backup not found');
    }

    const filePath = path.join(getBackupDir(), backup.filePath);
    if (!fs.existsSync(filePath)) {
      res.status(404);
      throw new Error('Backup file not found on server');
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const backupData = JSON.parse(fileContent);

    const companyId = req.user.company;

    // Restore logic: clear existing company data and insert backup data
    for (const [modelName, records] of Object.entries(backupData)) {
      const Model = mongoose.models[modelName];
      if (Model && Model.schema.paths['company']) {
        await Model.deleteMany({ company: companyId });
        if (records && records.length > 0) {
          await Model.insertMany(records);
        }
      }
    }

    res.json({ message: 'Backup restored successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload and restore a backup
// @route   POST /api/backups/upload
// @access  Private (Admins)
const uploadBackup = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a backup file');
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const backupData = JSON.parse(fileContent);

    const companyId = req.user.company;

    for (const [modelName, records] of Object.entries(backupData)) {
      const Model = mongoose.models[modelName];
      if (Model && Model.schema.paths['company']) {
        await Model.deleteMany({ company: companyId });
        if (records && records.length > 0) {
          await Model.insertMany(records);
        }
      }
    }
    
    // Clean up temp file
    fs.unlinkSync(req.file.path);

    // Record this in history
    const sizeInBytes = Buffer.byteLength(fileContent, 'utf8');
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    
    const version = `v1.0.0_uploaded_${Date.now().toString().slice(-4)}`;
    
    // Copy the file to backups dir just to keep it in history if needed
    const filename = `backup_${companyId}_${Date.now()}.json`;
    const filePath = path.join(getBackupDir(), filename);
    fs.writeFileSync(filePath, fileContent, 'utf8');

    const backup = await BackupHistory.create({
      version,
      size: sizeInMB,
      storage: 'Local Drive',
      status: 'Success',
      filePath: filename,
      company: companyId
    });

    res.json({ message: 'Backup uploaded and restored successfully', backup });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

module.exports = {
  getBackups,
  createBackup,
  restoreBackup,
  uploadBackup
};
