const pool = require('../config/database');

/**
 * Create daily attendance records with "Absent" status for all active employees
 * This should be run at the start of each day (e.g., via cron job or manual trigger)
 */
async function createDailyAbsentRecords(date = null) {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    console.log(`Creating absent records for date: ${targetDate}`);

    // Get all active employees who don't have attendance record for today
    const result = await pool.query(`
      INSERT INTO attendance (employee_id, attendance_date, attendance_status)
      SELECT e.employee_id, $1, 'Absent'
      FROM employees e
      WHERE e.status = 'Active'
      AND NOT EXISTS (
        SELECT 1 FROM attendance a
        WHERE a.employee_id = e.employee_id AND a.attendance_date = $1
      )
      RETURNING *
    `, [targetDate]);

    console.log(`✅ Created ${result.rowCount} absent records for ${targetDate}`);
    return {
      success: true,
      recordsCreated: result.rowCount,
      date: targetDate
    };

  } catch (error) {
    console.error('❌ Error creating daily absent records:', error);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  createDailyAbsentRecords()
    .then(result => {
      console.log('✅ Job completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Job failed:', error);
      process.exit(1);
    });
}

module.exports = { createDailyAbsentRecords };
