const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { logAdminActivity, ADMIN_ACTION_TYPES, MODULE_NAMES } = require('../services/adminActivityService');

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Find admin
    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username',
        field: 'username'
      });
    }

    const admin = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password',
        field: 'password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Log admin login
    try {
      await pool.query(
        `INSERT INTO admin_login_logs (admin_id, username, ip_address, browser_info, device_info)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          admin.id,
          admin.username,
          req.body.ip_address || req.ip || 'Unknown',
          req.body.browser_info || req.headers['user-agent'] || 'Unknown',
          req.body.device_info || 'Unknown'
        ]
      );

      // Log admin activity
      await logAdminActivity({
        adminId: admin.id,
        adminName: admin.username,
        adminEmail: admin.email,
        actionType: ADMIN_ACTION_TYPES.ADMIN_LOGIN,
        moduleName: MODULE_NAMES.ADMIN,
        description: `Admin ${admin.username} logged in successfully`,
        ipAddress: req.body.ip_address || req.ip || 'Unknown',
        deviceInfo: req.body.device_info || 'Unknown',
        browserInfo: req.body.browser_info || req.headers['user-agent'] || 'Unknown'
      });
    } catch (logError) {
      console.error('Error logging admin login:', logError);
      // Continue even if logging fails
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Employee Login
const employeeLogin = async (req, res) => {
  try {
    const { employee_id, password } = req.body;

    if (!employee_id || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID and password are required' 
      });
    }

    // Find employee with department info
    const result = await pool.query(
      `SELECT e.*, d.name as department_name 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       WHERE e.employee_id = $1`,
      [employee_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid employee ID',
        field: 'employee_id'
      });
    }

    const employee = result.rows[0];

    // Check if employee is active
    if (employee.status !== 'Active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is inactive. Please contact admin.',
        field: 'status'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, employee.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password',
        field: 'password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: employee.id, 
        employee_id: employee.employee_id, 
        role: 'employee' 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: employee.id,
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        department: employee.department_name,
        job_role: employee.job_role,
        mobile: employee.mobile,
        role: 'employee'
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = { adminLogin, employeeLogin };
