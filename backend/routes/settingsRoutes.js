const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');

// Admin only routes
router.get('/', verifyToken, isAdmin, getSettings);
router.put('/', verifyToken, isAdmin, updateSettings);

module.exports = router;
