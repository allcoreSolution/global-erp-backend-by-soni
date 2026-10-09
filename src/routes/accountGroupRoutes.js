const express = require('express');
const router = express.Router();
const accountGroupController = require('../controllers/accountGroupController');

router.post('/', accountGroupController.createAccountGroup);
router.get('/', accountGroupController.getAccountGroups);
router.delete('/:id', accountGroupController.deleteAccountGroup);

module.exports = router;
