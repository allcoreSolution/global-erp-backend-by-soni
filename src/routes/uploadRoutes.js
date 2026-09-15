const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const uploadLocal = require('../middlewares/uploadLocal');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      return next(new Error('No file uploaded'));
    }
    const filePath = `/uploads/documents/${req.file.filename}`;
    res.json({ success: true, url: filePath });
  } catch (error) {
    next(error);
  }
};

router.post('/', protect, uploadLocal.single('file'), uploadDocument);

module.exports = router;
