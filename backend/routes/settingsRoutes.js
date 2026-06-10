const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { getOTPSettings, updateOTPSettings } = require('../controllers/otpSettingsController');

// Get settings - available to all authenticated users
router.get('/', verifyToken, getSettings);

// Update settings - admin only
router.put('/', verifyToken, isAdmin, updateSettings);

// OTP Settings - admin only
router.get('/otp', verifyToken, isAdmin, getOTPSettings);
router.put('/otp', verifyToken, isAdmin, updateOTPSettings);

module.exports = router;
