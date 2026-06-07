-- Create Database
-- CREATE DATABASE attendance_db;

-- Connect to database
-- \c attendance_db;

-- Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Admin Login Logs Table
CREATE TABLE IF NOT EXISTS admin_login_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50),
    browser_info TEXT,
    device_info TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_admin ON admin_login_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_login_logs_time ON admin_login_logs(login_time);

-- Create Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    job_role VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create WFH Permissions Table
CREATE TABLE IF NOT EXISTS wfh_permissions (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT FALSE,
    enabled_by INTEGER REFERENCES admins(id),
    enabled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id)
);

-- Create Early Checkout Permissions Table
CREATE TABLE IF NOT EXISTS early_checkout_permissions (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT FALSE,
    enabled_by INTEGER REFERENCES admins(id),
    enabled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id)
);

-- Create Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    login_time TIMESTAMP,
    logout_time TIMESTAMP,
    total_working_hours DECIMAL(5,2),
    latitude_login DECIMAL(10,8),
    longitude_login DECIMAL(11,8),
    latitude_logout DECIMAL(10,8),
    longitude_logout DECIMAL(11,8),
    address_login TEXT,
    address_logout TEXT,
    attendance_status VARCHAR(20) DEFAULT 'Present' CHECK (attendance_status IN ('Present', 'Late', 'Half Day', 'Absent', 'Work From Home')),
    is_wfh BOOLEAN DEFAULT FALSE,
    device_info TEXT,
    browser_info TEXT,
    ip_address VARCHAR(50),
    gps_accuracy DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, attendance_date)
);

-- Create Holidays Table
CREATE TABLE IF NOT EXISTS holidays (
    id SERIAL PRIMARY KEY,
    holiday_date DATE NOT NULL UNIQUE,
    holiday_type VARCHAR(30) NOT NULL CHECK (holiday_type IN ('Government Holiday', 'Office Holiday')),
    holiday_title VARCHAR(200) NOT NULL,
    holiday_note TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_wfh_permissions_employee ON wfh_permissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_early_checkout_permissions_employee ON early_checkout_permissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(holiday_date);
CREATE INDEX IF NOT EXISTS idx_holidays_enabled ON holidays(is_enabled);

-- Insert Sample Departments
INSERT INTO departments (name) VALUES 
    ('IT'),
    ('HR'),
    ('Finance'),
    ('Marketing'),
    ('Operations')
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Admin (password: admin123)
INSERT INTO admins (username, email, password) VALUES 
    ('admin', 'admin@company.com', '$2b$10$rKvVJkzYhZ8qXqxqxqxqxOJ5Yqxqxqxqxqxqxqxqxqxqxqxqxqxqx')
ON CONFLICT (username) DO NOTHING;

-- Note: The password hash above is a placeholder. 
-- Actual hash will be generated when you create admin through API
-- Password: admin123
-- You need to hash it properly using bcrypt

-- Insert Sample Employees
-- MTM-01: MOHAMED MUSHRAF (password: Mushraf123)
-- MTM-02: BILAL S (password: Bilal123)
-- MTM-03: ADITHYA MISHRA (password: Adithya123)
INSERT INTO employees (employee_id, name, department_id, job_role, mobile, email, password, status) VALUES 
    ('MTM-01', 'MOHAMED MUSHRAF', 1, 'WEB DEVELOPER', '9677807887', 'mushraf1.mtm@gmail.com', '$2b$10$8lmqUI4ROUv2GUbDFpwCJuwcWr.fx4ceSobm/5Zo28MsukJjeEk8K', 'Active'),
    ('MTM-02', 'BILAL S', 1, 'SENIOR WEB DEVELOPER', '9113875925', 'bilal.mtm@gmail.com', '$2b$10$oLx2gCIP5dNQmWvM1xjfteLrbgfutmYAx6cvXJsZypbj5Peb/.TOy', 'Active'),
    ('MTM-03', 'ADITHYA MISHRA', 1, 'WEB DEVELOPER', '6360847309', 'adithya.mtm@gmail.com', '$2b$10$.RvgWiG8FlZORY6PBg7VculqfCUgHkbltR5Exifew17xe6WAy4n3q', 'Active')
ON CONFLICT (employee_id) DO NOTHING;