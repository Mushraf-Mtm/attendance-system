const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin, isEmployee } = require('../middleware/auth');
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getEmployeeMonthlyAttendance,
  getAllAttendance,
  getDashboardStats,
  getAbsentEmployees,
  resetAttendance,
  deleteAttendance,
  toggleEarlyCheckout,
  ensureDailyAttendanceRecords
} = require('../controllers/attendanceController');

// Employee routes
router.post('/checkin', verifyToken, isEmployee, checkIn);
router.post('/checkout', verifyToken, isEmployee, checkOut);
router.get('/today', verifyToken, isEmployee, getTodayAttendance);
router.get('/monthly', verifyToken, isEmployee, getEmployeeMonthlyAttendance);

// Admin routes
router.get('/all', verifyToken, isAdmin, getAllAttendance);
router.get('/stats', verifyToken, isAdmin, getDashboardStats);
router.get('/absent', verifyToken, isAdmin, getAbsentEmployees);
router.post('/reset', verifyToken, isAdmin, resetAttendance);
router.delete('/:id', verifyToken, isAdmin, deleteAttendance);
router.post('/early-checkout', verifyToken, isAdmin, toggleEarlyCheckout);

// Utility route to create daily absent records manually
router.post('/create-daily-records', verifyToken, isAdmin, async (req, res) => {
  try {
    const { date } = req.body;
    const recordsCreated = await ensureDailyAttendanceRecords(date);
    
    res.json({
      success: true,
      message: `Created ${recordsCreated} absent records`,
      recordsCreated
    });
  } catch (error) {
    console.error('Error creating daily records:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating daily records'
    });
  }
});

module.exports = router;
