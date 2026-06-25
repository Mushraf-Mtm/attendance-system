const express = require('express');
const router = express.Router();
const {
  clearEmployeeAuditLogs,
  clearAdminActivityLogs,
  clearMonthlyAttendance
} = require('../controllers/clearDataController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(verifyToken);
router.use(isAdmin);

// Clear employee audit logs
router.delete('/employee-audit', clearEmployeeAuditLogs);

// Clear admin activity logs
router.delete('/admin-activity', clearAdminActivityLogs);

// Clear monthly attendance
router.delete('/monthly-attendance', clearMonthlyAttendance);

module.exports = router;
