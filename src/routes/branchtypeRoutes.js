const express = require('express');
const router = express.Router();
const branchtypeController = require('../controllers/branchtypeController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(branchtypeController.getAllBranchTypes)
  .post(branchtypeController.createBranchType);

router.route('/:id')
  .put(branchtypeController.updateBranchType)
  .delete(branchtypeController.deleteBranchType);

module.exports = router;
