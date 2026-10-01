const express = require('express');
const router = express.Router();
const stateController = require('../controllers/stateController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(stateController.getAllStates)
  .post(stateController.createState);

router.route('/:id')
  .put(stateController.updateState)
  .delete(stateController.deleteState);

module.exports = router;
