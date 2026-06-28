const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  getEmployeesForManualAttendance,
  createManualAttendance,
  updateManualAttendance,
  deleteManualAttendance
} = require('../controllers/manualAttendanceController');

// All routes are admin-only
router.use(verifyToken, isAdmin);

router.get('/employees', getEmployeesForManualAttendance);
router.post('/', createManualAttendance);
router.put('/:id', updateManualAttendance);
router.delete('/:id', deleteManualAttendance);

module.exports = router;
