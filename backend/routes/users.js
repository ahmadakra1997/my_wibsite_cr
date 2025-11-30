const express = require('express');
const { updateProfile, changePassword } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);

module.exports = router;
