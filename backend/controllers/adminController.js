const bcrypt = require('bcrypt');
const pool = require('../config/database');

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM admins ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      admins: result.rows
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins'
    });
  }
};

// Add new admin
const addAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Check if username already exists
    const usernameCheck = await pool.query(
      'SELECT id FROM admins WHERE username = $1',
      [username]
    );

    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if email already exists
    const emailCheck = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin
    const result = await pool.query(
      'INSERT INTO admins (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    res.json({
      success: true,
      message: 'Admin added successfully',
      admin: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add admin'
    });
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username and email are required'
      });
    }

    // Check if admin exists
    const adminCheck = await pool.query(
      'SELECT id FROM admins WHERE id = $1',
      [id]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if username already exists (excluding current admin)
    const usernameCheck = await pool.query(
      'SELECT id FROM admins WHERE username = $1 AND id != $2',
      [username, id]
    );

    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if email already exists (excluding current admin)
    const emailCheck = await pool.query(
      'SELECT id FROM admins WHERE email = $1 AND id != $2',
      [email, id]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Update admin
    const result = await pool.query(
      'UPDATE admins SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, created_at',
      [username, email, id]
    );

    res.json({
      success: true,
      message: 'Admin updated successfully',
      admin: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin'
    });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if admin exists
    const adminCheck = await pool.query(
      'SELECT id FROM admins WHERE id = $1',
      [id]
    );

    if (adminCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if this is the last admin
    const adminCount = await pool.query('SELECT COUNT(*) FROM admins');
    if (parseInt(adminCount.rows[0].count) <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last admin'
      });
    }

    // Delete admin (login logs will be deleted automatically due to CASCADE)
    await pool.query('DELETE FROM admins WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { adminId, currentPassword, newPassword } = req.body;

    if (!adminId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Get admin
    const result = await pool.query(
      'SELECT * FROM admins WHERE id = $1',
      [adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const admin = result.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE admins SET password = $1 WHERE id = $2',
      [hashedPassword, adminId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Get admin login logs
const getLoginLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        al.id,
        al.admin_id,
        al.username,
        al.login_time,
        al.ip_address,
        al.browser_info,
        al.device_info
      FROM admin_login_logs al
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND al.login_time >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND al.login_time <= $${params.length}`;
    }

    query += ' ORDER BY al.login_time DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      logs: result.rows
    });
  } catch (error) {
    console.error('Error fetching login logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch login logs'
    });
  }
};

module.exports = {
  getAllAdmins,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  changePassword,
  getLoginLogs
};
