const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');

// Get settings - available to all authenticated users
router.get('/', verifyToken, getSettings);

// Update settings - admin only
router.put('/', verifyToken, isAdmin, updateSettings);

module.exports = router;
