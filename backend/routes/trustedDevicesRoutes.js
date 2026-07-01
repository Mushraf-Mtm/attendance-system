const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  getAllTrustedDevices,
  getDeviceStats,
  approveDevice,
  rejectDevice,
  updateDeviceAlias,
  removeApproval,
  deleteDevice,
  blockDevice,
  unblockDevice
} = require('../controllers/trustedDevicesController');

// All routes require authentication and admin role
router.use(verifyToken);
router.use(isAdmin);

// Get all trusted devices with filtering
router.get('/', getAllTrustedDevices);

// Get device statistics
router.get('/stats', getDeviceStats);

// Approve device
router.post('/approve', approveDevice);

// Reject device
router.post('/reject', rejectDevice);

// Update device alias
router.put('/alias', updateDeviceAlias);

// Remove approval
router.post('/remove-approval', removeApproval);

// Delete device
router.delete('/:id', deleteDevice);

// Block device
router.post('/block', blockDevice);

// Unblock device
router.post('/unblock', unblockDevice);

module.exports = router;
