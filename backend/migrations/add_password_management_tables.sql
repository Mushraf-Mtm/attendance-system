-- Password Management Migration
-- This migration adds tables for OTP-based password reset and change functionality

-- 1. Add OTP settings to existing settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS otp_expiry_minutes INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS otp_resend_seconds INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS otp_max_attempts INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS otp_requests_per_hour INTEGER DEFAULT 5;

-- Update existing settings row with default OTP values
UPDATE settings SET 
    otp_expiry_minutes = 5,
    otp_resend_seconds = 60,
    otp_max_attempts = 3,
    otp_requests_per_hour = 5
WHERE otp_expiry_minutes IS NULL;

-- 2. Create password_reset_otps table
CREATE TABLE IF NOT EXISTS password_reset_otps (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('password_reset', 'password_change')),
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    used BOOLEAN DEFAULT FALSE,
    last_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_employee ON password_reset_otps(employee_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires ON password_reset_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_used ON password_reset_otps(used);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_purpose ON password_reset_otps(purpose);

-- 3. Create audit_logs table for security tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    user_type VARCHAR(20) CHECK (user_type IN ('employee', 'admin')),
    action VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    ip_address VARCHAR(50),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_type ON audit_logs(user_type);

-- 4. Create rate limiting table for OTP requests
CREATE TABLE IF NOT EXISTS otp_rate_limits (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id)
);

-- Create index for rate limiting
CREATE INDEX IF NOT EXISTS idx_otp_rate_limits_employee ON otp_rate_limits(employee_id);
CREATE INDEX IF NOT EXISTS idx_otp_rate_limits_window ON otp_rate_limits(window_start);

-- 5. Add password change tracking columns to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN DEFAULT FALSE;

-- Comments for documentation
COMMENT ON TABLE password_reset_otps IS 'Stores hashed OTPs for password reset and change operations';
COMMENT ON TABLE audit_logs IS 'Centralized audit logging for security-sensitive operations';
COMMENT ON TABLE otp_rate_limits IS 'Rate limiting for OTP requests to prevent abuse';
COMMENT ON COLUMN settings.otp_expiry_minutes IS 'OTP expiration time in minutes';
COMMENT ON COLUMN settings.otp_resend_seconds IS 'Minimum seconds before OTP can be resent';
COMMENT ON COLUMN settings.otp_max_attempts IS 'Maximum OTP verification attempts';
COMMENT ON COLUMN settings.otp_requests_per_hour IS 'Maximum OTP requests per hour per employee';
