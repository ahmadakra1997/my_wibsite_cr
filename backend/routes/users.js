const express = require('express');
const { updateUserApiKeys, activateUserBot } = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

// المسارات الجديدة
router.post('/api-keys', auth, updateUserApiKeys);
router.post('/activate-bot', auth, activateUserBot);

// المسارات الحالية
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
