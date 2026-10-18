const mongoose = require('mongoose');
const BackupHistory = require('../models/BackupHistory');
const fs = require('fs');
const path = require('path');

// Ensure all models are registered in Mongoose
const modelsDir = path.join(__dirname, '../models');
if (fs.existsSync(modelsDir)) {
  fs.readdirSync(modelsDir).forEach(file => {
    if (file.endsWith('.js')) {
      try {
        require(path.join(modelsDir, file));
      } catch (_) {}
    }
  });
}

// Helper to ensure backups directory exists
const getBackupDir = () => {
  const dir = path.join(__dirname, '../../public/backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// @desc    Get all backups for the company or all if SuperAdmin
// @route   GET /api/backups
// @access  Private (Admins)
const getBackups = async (req, res, next) => {
  try {
    const companyId = req.user?.company || req.user?.companyId;
    const isSuperAdmin = req.user?.role && (req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin');
    const filter = (companyId && !isSuperAdmin) ? { company: companyId } : {};
    const backups = await BackupHistory.find(filter).populate('company', 'name code email').sort({ createdAt: -1 });
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
    const isSuperAdmin = req.user?.role && (req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin');
    const requestedCompanyId = req.body?.companyId || req.body?.company || req.body?.tenantId;
    const targetCompanyId = isSuperAdmin
      ? (requestedCompanyId && requestedCompanyId !== 'ALL' && requestedCompanyId !== 'All' ? requestedCompanyId : null)
      : (req.user?.company || req.user?.companyId);

    const backupData = {
      meta: {
        createdAt: new Date().toISOString(),
        companyId: targetCompanyId ? String(targetCompanyId) : 'All',
        createdBy: req.user?.username || 'SuperAdmin',
        type: req.body?.type || (targetCompanyId ? 'Tenant-Specific Backup' : 'Full Database Backup'),
        scope: targetCompanyId ? 'Selected Tenant' : 'Entire Platform'
      },
      collections: {}
    };
    
    // Iterate over all registered Mongoose models
    const modelNames = mongoose.modelNames();
    let totalRecords = 0;
    let collectionsCount = 0;

    for (const modelName of modelNames) {
      if (modelName === 'BackupHistory') continue; // Don't backup backup history itself

      const Model = mongoose.model(modelName);
      let records = [];

      // If company isolation applies
      if (modelName === 'Company' && targetCompanyId) {
        records = await Model.find({ _id: targetCompanyId }).lean();
      } else if (Model.schema.paths['company'] && targetCompanyId) {
        records = await Model.find({ company: targetCompanyId }).lean();
      } else if (!targetCompanyId) {
        records = await Model.find({}).lean();
      }

      if (records && records.length > 0) {
        backupData.collections[modelName] = records;
        totalRecords += records.length;
        collectionsCount++;
      }
    }

    const jsonString = JSON.stringify(backupData, null, 2);
    const sizeInBytes = Buffer.byteLength(jsonString, 'utf8');
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    
    const version = `v1.0.0_${Date.now().toString().slice(-4)}`;
    const filename = `backup_${targetCompanyId || 'sys'}_${Date.now()}.json`;
    const filePath = path.join(getBackupDir(), filename);
    
    fs.writeFileSync(filePath, jsonString, 'utf8');

    const backupDoc = {
      version,
      size: sizeInMB,
      storage: req.body?.storageDestination || 'Local Drive',
      status: 'Success',
      filePath: filename
    };
    if (targetCompanyId) {
      backupDoc.company = targetCompanyId;
    }

    const backup = await BackupHistory.create(backupDoc);
    const populated = await BackupHistory.findById(backup._id).populate('company', 'name code email');

    res.status(201).json({
      success: true,
      message: 'Backup created successfully!',
      backup: populated || backup,
      collectionsCount,
      totalRecords
    });
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
    const companyId = req.user?.company || req.user?.companyId;
    const isSuperAdmin = req.user?.role && (req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin');
    const filter = (companyId && !isSuperAdmin) ? { version, company: companyId } : { version };
    const backup = await BackupHistory.findOne(filter);
    
    if (!backup) {
      return res.status(404).json({ success: false, message: 'Backup snapshot not found' });
    }

    const filePath = path.join(getBackupDir(), backup.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found on server drive' });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(fileContent);
    const collections = parsedData.collections || parsedData;
    const targetCompanyId = backup.company || (parsedData.meta?.companyId !== 'All' ? parsedData.meta?.companyId : null);

    let restoredCollections = 0;
    let restoredRecords = 0;

    // Restore logic: clear existing company data and insert backup data
    for (const [modelName, records] of Object.entries(collections)) {
      if (modelName === 'meta' || modelName === 'BackupHistory') continue;

      const Model = mongoose.models[modelName];
      if (Model) {
        if (modelName === 'Company' && targetCompanyId) {
          await Model.deleteMany({ _id: targetCompanyId });
        } else if (Model.schema.paths['company'] && targetCompanyId) {
          await Model.deleteMany({ company: targetCompanyId });
        } else if (!targetCompanyId && isSuperAdmin) {
          // Safeguard: Protect active SuperAdmin user from being wiped
          if (modelName === 'User' && req.user?._id) {
            await Model.deleteMany({ _id: { $ne: req.user._id } });
          } else {
            await Model.deleteMany({});
          }
        }

        if (Array.isArray(records) && records.length > 0) {
          try {
            let docsToInsert = records;
            // Prevent duplicate key collision if current SuperAdmin is already in database
            if (modelName === 'User' && req.user?._id) {
              docsToInsert = records.filter(r => String(r._id) !== String(req.user._id));
            }
            if (docsToInsert.length > 0) {
              await Model.insertMany(docsToInsert, { ordered: false });
              restoredRecords += docsToInsert.length;
            }
            restoredCollections++;
          } catch (insertErr) {
            console.warn(`Partial insert warning on ${modelName}:`, insertErr.message);
          }
        }
      }
    }

    res.json({
      success: true,
      message: `System database successfully restored to snapshot ${version}!`,
      restoredCollections,
      restoredRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload and restore a backup file (.json)
// @route   POST /api/backups/upload
// @access  Private (Admins)
const uploadBackup = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a valid JSON backup file' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const parsedData = JSON.parse(fileContent);
    const collections = parsedData.collections || parsedData;
    const isSuperAdmin = req.user?.role && (req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin');
    const targetCompanyId = !isSuperAdmin ? (req.user?.company || req.user?.companyId) : (parsedData.meta?.companyId !== 'All' ? parsedData.meta?.companyId : null);

    let restoredCollections = 0;
    let restoredRecords = 0;

    for (const [modelName, records] of Object.entries(collections)) {
      if (modelName === 'meta' || modelName === 'BackupHistory') continue;

      const Model = mongoose.models[modelName];
      if (Model) {
        if (modelName === 'Company' && targetCompanyId) {
          await Model.deleteMany({ _id: targetCompanyId });
        } else if (Model.schema.paths['company'] && targetCompanyId) {
          await Model.deleteMany({ company: targetCompanyId });
        } else if (!targetCompanyId && isSuperAdmin) {
          if (modelName === 'User' && req.user?._id) {
            await Model.deleteMany({ _id: { $ne: req.user._id } });
          } else {
            await Model.deleteMany({});
          }
        }

        if (Array.isArray(records) && records.length > 0) {
          try {
            let docsToInsert = records;
            if (modelName === 'User' && req.user?._id) {
              docsToInsert = records.filter(r => String(r._id) !== String(req.user._id));
            }
            if (docsToInsert.length > 0) {
              await Model.insertMany(docsToInsert, { ordered: false });
              restoredRecords += docsToInsert.length;
            }
            restoredCollections++;
          } catch (insertErr) {
            console.warn(`Partial insert warning on ${modelName}:`, insertErr.message);
          }
        }
      }
    }
    
    // Clean up temp file
    try {
      fs.unlinkSync(req.file.path);
    } catch (_) {}

    // Record this in history
    const sizeInBytes = Buffer.byteLength(fileContent, 'utf8');
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    
    const version = `v1.0.0_uploaded_${Date.now().toString().slice(-4)}`;
    const filename = `backup_${targetCompanyId || 'uploaded'}_${Date.now()}.json`;
    const filePath = path.join(getBackupDir(), filename);
    fs.writeFileSync(filePath, fileContent, 'utf8');

    const backupDoc = {
      version,
      size: sizeInMB,
      storage: 'Local Drive',
      status: 'Success',
      filePath: filename
    };
    if (targetCompanyId) {
      backupDoc.company = targetCompanyId;
    }

    const backup = await BackupHistory.create(backupDoc);
    const populated = await BackupHistory.findById(backup._id).populate('company', 'name code email');

    res.json({
      success: true,
      message: 'Backup file uploaded and database restored successfully!',
      backup: populated || backup,
      restoredCollections,
      restoredRecords
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    next(error);
  }
};

// @desc    Download backup JSON file to browser
// @route   GET /api/backups/download/:version
// @access  Private (Admins)
const downloadBackup = async (req, res, next) => {
  try {
    const { version } = req.params;
    const companyId = req.user?.company || req.user?.companyId;
    const isSuperAdmin = req.user?.role && (req.user?.role?.name === 'SuperAdmin' || req.user?.role === 'SuperAdmin');
    const filter = (companyId && !isSuperAdmin) ? { version, company: companyId } : { version };
    const backup = await BackupHistory.findOne(filter);

    if (!backup) {
      return res.status(404).json({ success: false, message: 'Backup snapshot not found' });
    }

    const filePath = path.join(getBackupDir(), backup.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Backup file not found on disk' });
    }

    res.download(filePath, `ERP_Backup_${backup.version}.json`);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a backup snapshot
// @route   DELETE /api/backups/:id
// @access  Private (Admins)
const deleteBackup = async (req, res, next) => {
  try {
    const backup = await BackupHistory.findById(req.params.id);
    if (!backup) {
      return res.status(404).json({ success: false, message: 'Backup snapshot not found' });
    }

    // Delete file from disk
    const filePath = path.join(getBackupDir(), backup.filePath);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (_) {}
    }

    await BackupHistory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Backup snapshot deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBackups,
  createBackup,
  restoreBackup,
  uploadBackup,
  downloadBackup,
  deleteBackup
};
