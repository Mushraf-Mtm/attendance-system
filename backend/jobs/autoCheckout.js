const pool = require('../config/database');
const { getSettingsFromDB } = require('../utils/settingsHelper');

// Auto checkout employees who checked in but forgot to checkout after office end time
const autoCheckoutEmployees = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const settings = await getSettingsFromDB();
    
    // Get current time in IST
    const currentTime = new Date();
    const istOffset = 5.5 * 60; // IST is UTC+5:30 in minutes
    const localTime = new Date(currentTime.getTime() + (istOffset * 60 * 1000));
    const currentHour = localTime.getUTCHours();
    const currentMinute = localTime.getUTCMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [endHour, endMinute] = settings.workingHours.officeEndTime.split(':').map(Number);
    const endTimeInMinutes = endHour * 60 + endMinute;

    // Only run if current time is past office end time
    if (currentTimeInMinutes <= endTimeInMinutes) {
      console.log('Auto-checkout: Not yet office end time');
      return { success: false, message: 'Not yet office end time' };
    }

    // Get all employees who checked in today but haven't checked out
    const result = await pool.query(
      `SELECT a.*, e.name 
       FROM attendance a
       JOIN employees e ON a.employee_id = e.employee_id
       WHERE a.attendance_date = $1 
       AND a.login_time IS NOT NULL 
       AND a.logout_time IS NULL`,
      [today]
    );

    if (result.rows.length === 0) {
      console.log('Auto-checkout: No employees to auto-checkout');
      return { success: true, checkedOut: 0, message: 'No employees to auto-checkout' };
    }

    let checkedOutCount = 0;
    const halfDayThreshold = settings.workingHours.halfDayThreshold;

    for (const attendance of result.rows) {
      // Calculate working hours from login_time to now
      const loginTime = new Date(attendance.login_time);
      const logoutTime = new Date();
      const workingHours = ((logoutTime - loginTime) / (1000 * 60 * 60)).toFixed(2);

      // Determine final status
      let finalStatus = attendance.attendance_status;
      if (parseFloat(workingHours) < halfDayThreshold) {
        finalStatus = 'Half Day';
      }

      // Auto checkout
      await pool.query(
        `UPDATE attendance 
         SET logout_time = CURRENT_TIMESTAMP,
             total_working_hours = $1,
             attendance_status = $2,
             address_logout = 'Auto checkout at office end time',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [workingHours, finalStatus, attendance.id]
      );

      checkedOutCount++;
      console.log(`✅ Auto-checkout: ${attendance.name} (${attendance.employee_id}) - ${workingHours}h`);
    }

    console.log(`Auto-checkout completed: ${checkedOutCount} employee(s) checked out`);
    return {
      success: true,
      checkedOut: checkedOutCount,
      message: `${checkedOutCount} employee(s) auto-checked out`
    };

  } catch (error) {
    console.error('Auto-checkout error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { autoCheckoutEmployees };
