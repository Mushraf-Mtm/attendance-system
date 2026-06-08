const pool = require('../config/database');
const { validateLocation, validateGPSAccuracy } = require('../utils/locationValidator');
const { getSettingsFromDB } = require('../utils/settingsHelper');

// Helper function to convert 24-hour time to 12-hour format
const format24To12Hour = (time24) => {
  if (!time24) return time24;
  
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const minute = minutes;
  
  if (hour === 0) {
    return `12:${minute} AM`;
  } else if (hour < 12) {
    return `${hour}:${minute} AM`;
  } else if (hour === 12) {
    return `12:${minute} PM`;
  } else {
    return `${hour - 12}:${minute} PM`;
  }
};

// Helper function to ensure daily attendance records exist
const ensureDailyAttendanceRecords = async (date) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const dateObj = new Date(targetDate);
  
  try {
    // Check if date is Sunday - skip creating absent records
    if (dateObj.getDay() === 0) {
      return 0; // Sunday - no absent records needed
    }
    
    // Check if date is an enabled holiday - skip creating absent records
    const holidayCheck = await pool.query(
      'SELECT * FROM holidays WHERE holiday_date = $1 AND is_enabled = true',
      [targetDate]
    );
    
    if (holidayCheck.rows.length > 0) {
      return 0; // Holiday - no absent records needed
    }
    
    // Create absent records for all active employees who don't have a record yet
    const result = await pool.query(`
      INSERT INTO attendance (employee_id, attendance_date, attendance_status)
      SELECT e.employee_id, $1, 'Absent'
      FROM employees e
      WHERE e.status = 'Active'
      AND NOT EXISTS (
        SELECT 1 FROM attendance a
        WHERE a.employee_id = e.employee_id AND a.attendance_date = $1
      )
      ON CONFLICT (employee_id, attendance_date) DO NOTHING
    `, [targetDate]);
    
    return result.rowCount;
  } catch (error) {
    console.error('Error ensuring daily attendance records:', error);
    return 0;
  }
};

// Employee Check-in (Login)
const checkIn = async (req, res) => {
  try {
    const employeeCode = req.user.employee_id; // Use employee code from JWT
    const {
      latitude,
      longitude,
      accuracy,
      address,
      device_info,
      browser_info,
      ip_address
    } = req.body;

    const today = new Date().toISOString().split('T')[0];
    const todayDate = new Date(today);

    // Check if today is Sunday
    if (todayDate.getDay() === 0) {
      return res.status(403).json({
        success: false,
        message: 'Today is Sunday. Attendance is not required on Sundays.',
        isHoliday: true,
        holidayType: 'Sunday'
      });
    }

    // Check if today is an enabled holiday
    const holidayCheck = await pool.query(
      'SELECT * FROM holidays WHERE holiday_date = $1 AND is_enabled = true',
      [today]
    );

    if (holidayCheck.rows.length > 0) {
      const holiday = holidayCheck.rows[0];
      return res.status(403).json({
        success: false,
        message: `Today is a ${holiday.holiday_type}: ${holiday.holiday_title}. Attendance is not required today.`,
        isHoliday: true,
        holidayType: holiday.holiday_type,
        holidayTitle: holiday.holiday_title,
        holidayNote: holiday.holiday_note
      });
    }

    // Check if check-in is enabled
    const settings = await getSettingsFromDB();
    if (!settings.workingHours.checkInEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Check-in is currently disabled by administrator'
      });
    }

    // Check if current time is within office hours (after start time and before end time)
    // Get current time in IST (UTC+5:30)
    const currentTime = new Date();
    const istOffset = 5.5 * 60; // IST is UTC+5:30 in minutes
    const localTime = new Date(currentTime.getTime() + (istOffset * 60 * 1000));
    const currentHour = localTime.getUTCHours();
    const currentMinute = localTime.getUTCMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = settings.workingHours.officeStartTime.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = settings.workingHours.officeEndTime.split(':').map(Number);
    const endTimeInMinutes = endHour * 60 + endMinute;

    // Check if before office start time
    if (currentTimeInMinutes < startTimeInMinutes) {
      return res.status(403).json({
        success: false,
        message: `Check-in is not allowed before office start time (${format24To12Hour(settings.workingHours.officeStartTime)})`
      });
    }

    // Check if after office end time
    if (currentTimeInMinutes > endTimeInMinutes) {
      return res.status(403).json({
        success: false,
        message: `Check-in is not allowed after office end time (${format24To12Hour(settings.workingHours.officeEndTime)}). Office hours are ${format24To12Hour(settings.workingHours.officeStartTime)} to ${format24To12Hour(settings.workingHours.officeEndTime)}`
      });
    }

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required'
      });
    }

    // Check GPS accuracy
    const accuracyCheck = await validateGPSAccuracy(accuracy);
    if (!accuracyCheck.valid) {
      return res.status(400).json({
        success: false,
        message: accuracyCheck.message
      });
    }

    // Ensure daily attendance records exist for today (using today declared earlier)
    await ensureDailyAttendanceRecords(today);

    // Check if already checked in today
    const existingAttendance = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [employeeCode, today]
    );

    if (existingAttendance.rows.length > 0 && existingAttendance.rows[0].login_time) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today'
      });
    }

    // Check WFH permission
    const wfhResult = await pool.query(
      'SELECT is_enabled FROM wfh_permissions WHERE employee_id = $1',
      [employeeCode]
    );

    const isWFH = wfhResult.rows.length > 0 && wfhResult.rows[0].is_enabled;

    // Validate location (skip if WFH)
    const locationCheck = await validateLocation(
      parseFloat(latitude),
      parseFloat(longitude),
      isWFH
    );

    if (!locationCheck.valid) {
      return res.status(400).json({
        success: false,
        message: locationCheck.message,
        distance: locationCheck.distance
      });
    }

    // Determine attendance status based on time (using IST time)
    const [lateHour, lateMinute] = settings.workingHours.lateAfterTime.split(':').map(Number);
    
    let attendanceStatus = 'Present';
    
    // Check if late (applies to ALL employees, both office and WFH)
    if (currentHour > lateHour || (currentHour === lateHour && currentMinute > lateMinute)) {
      attendanceStatus = 'Late';
    }

    // Override with WFH status if employee has WFH permission and NOT late
    if (isWFH && attendanceStatus !== 'Late') {
      attendanceStatus = 'Work From Home';
    }

    // Insert or update attendance
    let result;
    if (existingAttendance.rows.length > 0) {
      result = await pool.query(
        `UPDATE attendance 
         SET login_time = CURRENT_TIMESTAMP,
             latitude_login = $1,
             longitude_login = $2,
             address_login = $3,
             attendance_status = $4,
             is_wfh = $5,
             device_info = $6,
             browser_info = $7,
             ip_address = $8,
             gps_accuracy = $9,
             updated_at = CURRENT_TIMESTAMP
         WHERE employee_id = $10 AND attendance_date = $11
         RETURNING *`,
        [latitude, longitude, address, attendanceStatus, isWFH, 
         device_info, browser_info, ip_address, accuracy, employeeCode, today]
      );
    } else {
      result = await pool.query(
        `INSERT INTO attendance 
         (employee_id, attendance_date, login_time, latitude_login, longitude_login, 
          address_login, attendance_status, is_wfh, device_info, browser_info, 
          ip_address, gps_accuracy)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [employeeCode, today, latitude, longitude, address, attendanceStatus, 
         isWFH, device_info, browser_info, ip_address, accuracy]
      );
    }

    res.json({
      success: true,
      message: 'Check-in successful',
      attendance: result.rows[0]
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Employee Check-out (Logout)
const checkOut = async (req, res) => {
  try {
    const employeeCode = req.user.employee_id; // Use employee code from JWT
    const {
      latitude,
      longitude,
      address
    } = req.body;

    // Check if check-out is enabled
    const settings = await getSettingsFromDB();
    if (!settings.workingHours.checkOutEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Check-out is currently disabled by administrator'
      });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if checked in today
    const attendanceResult = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [employeeCode, today]
    );

    if (attendanceResult.rows.length === 0 || !attendanceResult.rows[0].login_time) {
      return res.status(400).json({
        success: false,
        message: 'You must check in first'
      });
    }

    const attendance = attendanceResult.rows[0];

    // Check if already checked out
    if (attendance.logout_time) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today'
      });
    }

    // Check early checkout permission
    const earlyCheckoutResult = await pool.query(
      'SELECT is_enabled FROM early_checkout_permissions WHERE employee_id = $1',
      [employeeCode]
    );

    const hasEarlyCheckoutPermission = earlyCheckoutResult.rows.length > 0 && 
                                        earlyCheckoutResult.rows[0].is_enabled;

    // Check if current time is before office end time
    if (!hasEarlyCheckoutPermission) {
      // Get current time in IST (UTC+5:30)
      const currentTime = new Date();
      const istOffset = 5.5 * 60; // IST is UTC+5:30 in minutes
      const localTime = new Date(currentTime.getTime() + (istOffset * 60 * 1000));
      const currentHour = localTime.getUTCHours();
      const currentMinute = localTime.getUTCMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const [endHour, endMinute] = settings.workingHours.officeEndTime.split(':').map(Number);
      const endTimeInMinutes = endHour * 60 + endMinute;

      if (currentTimeInMinutes < endTimeInMinutes) {
        return res.status(403).json({
          success: false,
          message: `Check-out is not allowed before office end time (${format24To12Hour(settings.workingHours.officeEndTime)}). Contact admin for early checkout permission.`
        });
      }
    }

    // Calculate working hours
    const loginTime = new Date(attendance.login_time);
    const logoutTime = new Date();
    const workingHours = ((logoutTime - loginTime) / (1000 * 60 * 60)).toFixed(2);

    // Update attendance status based on working hours (from database)
    const halfDayThreshold = settings.workingHours.halfDayThreshold;
    let finalStatus = attendance.attendance_status;
    if (parseFloat(workingHours) < halfDayThreshold) {
      finalStatus = 'Half Day';
    }

    // Update attendance
    const result = await pool.query(
      `UPDATE attendance 
       SET logout_time = CURRENT_TIMESTAMP,
           latitude_logout = $1,
           longitude_logout = $2,
           address_logout = $3,
           total_working_hours = $4,
           attendance_status = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE employee_id = $6 AND attendance_date = $7
       RETURNING *`,
      [latitude, longitude, address, workingHours, finalStatus, employeeCode, today]
    );

    res.json({
      success: true,
      message: 'Check-out successful',
      attendance: result.rows[0]
    });

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get today's attendance for employee
const getTodayAttendance = async (req, res) => {
  try {
    const employeeCode = req.user.employee_id; // Use employee code from JWT
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2',
      [employeeCode, today]
    );

    res.json({
      success: true,
      attendance: result.rows[0] || null
    });

  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get employee monthly attendance
const getEmployeeMonthlyAttendance = async (req, res) => {
  try {
    const employeeCode = req.user.employee_id; // Use employee code from JWT
    const { month, year } = req.query;

    let query;
    let values;

    if (month && year) {
      query = `SELECT * FROM attendance 
               WHERE employee_id = $1 
               AND EXTRACT(MONTH FROM attendance_date) = $2 
               AND EXTRACT(YEAR FROM attendance_date) = $3
               ORDER BY attendance_date DESC`;
      values = [employeeCode, month, year];
    } else {
      query = `SELECT * FROM attendance 
               WHERE employee_id = $1 
               ORDER BY attendance_date DESC 
               LIMIT 30`;
      values = [employeeCode];
    }

    const result = await pool.query(query, values);

    res.json({
      success: true,
      attendance: result.rows
    });

  } catch (error) {
    console.error('Get monthly attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin: Get all attendance
const getAllAttendance = async (req, res) => {
  try {
    const { date, status, employee_id } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Ensure daily attendance records exist for the target date
    await ensureDailyAttendanceRecords(targetDate);

    let query = `
      SELECT a.*, e.employee_id as emp_id, e.name, e.mobile, 
             d.name as department, e.job_role
      FROM attendance a
      JOIN employees e ON a.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE a.attendance_date = $1
    `;
    const values = [targetDate];
    let paramCount = 2;

    if (status) {
      // Special filter: "Currently Working" - checked in but not checked out
      if (status === 'Currently Working') {
        query += ` AND a.login_time IS NOT NULL AND a.logout_time IS NULL`;
      }
      // If filtering for "Present", include both "Present" and "Work From Home"
      else if (status === 'Present') {
        query += ` AND a.attendance_status IN ('Present', 'Work From Home')`;
      } else {
        query += ` AND a.attendance_status = $${paramCount}`;
        values.push(status);
        paramCount++;
      }
    }

    if (employee_id) {
      query += ` AND e.employee_id ILIKE $${paramCount}`;
      values.push(`%${employee_id}%`);
      paramCount++;
    }

    query += ' ORDER BY e.employee_id ASC';

    const result = await pool.query(query, values);

    res.json({
      success: true,
      attendance: result.rows
    });

  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin: Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Total employees
    const totalEmployees = await pool.query(
      "SELECT COUNT(*) FROM employees WHERE status = 'Active'"
    );

    // Present today
    const presentToday = await pool.query(
      `SELECT COUNT(*) FROM attendance 
       WHERE attendance_date = $1 AND login_time IS NOT NULL`,
      [today]
    );

    // Late employees
    const lateEmployees = await pool.query(
      `SELECT COUNT(*) FROM attendance 
       WHERE attendance_date = $1 AND attendance_status = 'Late'`,
      [today]
    );

    // WFH employees
    const wfhEmployees = await pool.query(
      `SELECT COUNT(*) FROM attendance 
       WHERE attendance_date = $1 AND is_wfh = true`,
      [today]
    );

    // Currently working (logged in but not logged out)
    const currentlyWorking = await pool.query(
      `SELECT COUNT(*) FROM attendance 
       WHERE attendance_date = $1 AND login_time IS NOT NULL AND logout_time IS NULL`,
      [today]
    );

    const totalEmp = parseInt(totalEmployees.rows[0].count);
    const presentEmp = parseInt(presentToday.rows[0].count);
    const absentEmp = totalEmp - presentEmp;

    res.json({
      success: true,
      stats: {
        totalEmployees: totalEmp,
        presentToday: presentEmp,
        lateEmployees: parseInt(lateEmployees.rows[0].count),
        wfhEmployees: parseInt(wfhEmployees.rows[0].count),
        absentEmployees: absentEmp,
        currentlyWorking: parseInt(currentlyWorking.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin: Get absent employees list
const getAbsentEmployees = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get all active employees who haven't checked in on the target date
    const result = await pool.query(
      `SELECT e.id, e.employee_id, e.name, e.mobile, e.email, e.job_role,
              d.name as department
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN attendance a ON e.employee_id = a.employee_id AND a.attendance_date = $1
       WHERE e.status = 'Active' 
       AND (a.id IS NULL OR a.login_time IS NULL)
       ORDER BY e.employee_id`,
      [targetDate]
    );

    res.json({
      success: true,
      absentEmployees: result.rows,
      date: targetDate
    });

  } catch (error) {
    console.error('Get absent employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin: Reset attendance (allow employee to check-in/check-out again)
const resetAttendance = async (req, res) => {
  try {
    const { attendanceId, resetType } = req.body;

    if (!attendanceId || !resetType) {
      return res.status(400).json({
        success: false,
        message: 'Attendance ID and reset type are required'
      });
    }

    let result;
    if (resetType === 'check-in') {
      // Reset check-in: clear login data
      result = await pool.query(
        `UPDATE attendance 
         SET login_time = NULL,
             latitude_login = NULL,
             longitude_login = NULL,
             address_login = NULL,
             attendance_status = 'Absent',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [attendanceId]
      );
    } else if (resetType === 'check-out') {
      // Reset check-out: clear logout data
      result = await pool.query(
        `UPDATE attendance 
         SET logout_time = NULL,
             latitude_logout = NULL,
             longitude_logout = NULL,
             address_logout = NULL,
             total_working_hours = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [attendanceId]
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset type'
      });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: `${resetType} reset successful`,
      attendance: result.rows[0]
    });

  } catch (error) {
    console.error('Reset attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin: Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM attendance WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });

  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin: Toggle early checkout permission for employee
const toggleEarlyCheckout = async (req, res) => {
  try {
    const { employeeId, enabled } = req.body;
    const adminId = req.user.id;

    if (!employeeId || enabled === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and enabled status are required'
      });
    }

    // Check if permission record exists
    const existingPermission = await pool.query(
      'SELECT * FROM early_checkout_permissions WHERE employee_id = $1',
      [employeeId]
    );

    let result;
    if (existingPermission.rows.length > 0) {
      // Update existing permission
      result = await pool.query(
        `UPDATE early_checkout_permissions 
         SET is_enabled = $1, enabled_by = $2, enabled_at = CURRENT_TIMESTAMP
         WHERE employee_id = $3
         RETURNING *`,
        [enabled, adminId, employeeId]
      );
    } else {
      // Insert new permission
      result = await pool.query(
        `INSERT INTO early_checkout_permissions (employee_id, is_enabled, enabled_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [employeeId, enabled, adminId]
      );
    }

    res.json({
      success: true,
      message: `Early checkout permission ${enabled ? 'enabled' : 'disabled'} successfully`,
      permission: result.rows[0]
    });

  } catch (error) {
    console.error('Toggle early checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
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
};
