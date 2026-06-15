-- ============================================
-- ATTENDANCE SECURITY ENHANCEMENT MIGRATION
-- Run this SQL on your existing database
-- ============================================

-- Step 1: Add new columns to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS office_public_ip TEXT,
ADD COLUMN IF NOT EXISTS allowed_ips TEXT,
ADD COLUMN IF NOT EXISTS attendance_validation_mode VARCHAR(30) DEFAULT 'location_or_network',
ADD COLUMN IF NOT EXISTS attendance_rate_limit INTEGER DEFAULT 5;

-- Add constraint for validation mode
DO $$ BEGIN
  ALTER TABLE settings 
  ADD CONSTRAINT settings_attendance_validation_mode_check 
  CHECK (attendance_validation_mode IN ('location_only', 'network_only', 'location_or_network', 'location_and_network'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add comments
COMMENT ON COLUMN settings.office_public_ip IS 'Primary office public IP address';
COMMENT ON COLUMN settings.allowed_ips IS 'Comma-separated list of allowed office IP addresses';
COMMENT ON COLUMN settings.attendance_validation_mode IS 'Attendance validation strategy: location_only, network_only, location_or_network, location_and_network';
COMMENT ON COLUMN settings.attendance_rate_limit IS 'Maximum attendance API requests per minute per employee';

-- Step 2: Add new columns to attendance table
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS device_fingerprint VARCHAR(255),
ADD COLUMN IF NOT EXISTS validation_method VARCHAR(50);

-- Add comments
COMMENT ON COLUMN attendance.device_fingerprint IS 'Device fingerprint used during check-in';
COMMENT ON COLUMN attendance.validation_method IS 'Which validation passed: location, network, location_and_network, location_or_network';

-- Step 3: Add new column to audit_logs table
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS device_fingerprint VARCHAR(255);

-- Add index
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);

-- Add comment
COMMENT ON COLUMN audit_logs.device_fingerprint IS 'Device fingerprint if applicable';

-- Step 4: Create device_fingerprints table
CREATE TABLE IF NOT EXISTS device_fingerprints (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
    device_fingerprint VARCHAR(255) NOT NULL,
    browser VARCHAR(100),
    operating_system VARCHAR(100),
    screen_resolution VARCHAR(50),
    timezone VARCHAR(50),
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, device_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_device_fingerprints_employee ON device_fingerprints(employee_id);
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_fingerprint ON device_fingerprints(device_fingerprint);

COMMENT ON TABLE device_fingerprints IS 'Stores device fingerprints for audit and security tracking';
COMMENT ON COLUMN device_fingerprints.device_fingerprint IS 'Unique hash identifying the device';
COMMENT ON COLUMN device_fingerprints.is_approved IS 'Whether this device is approved for attendance';

-- Step 5: Create attendance_rate_limits table
CREATE TABLE IF NOT EXISTS attendance_rate_limits (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, ip_address)
);

CREATE INDEX IF NOT EXISTS idx_attendance_rate_limits_employee ON attendance_rate_limits(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_rate_limits_window ON attendance_rate_limits(window_start);

COMMENT ON TABLE attendance_rate_limits IS 'Tracks attendance API rate limiting per employee per IP';
COMMENT ON COLUMN attendance_rate_limits.window_start IS 'Start time of current rate limit window (1 minute)';

-- Step 6: Update existing settings record with default values
UPDATE settings 
SET 
  office_public_ip = NULL,
  allowed_ips = NULL,
  attendance_validation_mode = 'location_or_network',
  attendance_rate_limit = 5
WHERE office_public_ip IS NULL;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify the migration
SELECT 
  'Settings columns added' AS status,
  COUNT(*) AS settings_count
FROM settings;

SELECT 
  'Device fingerprints table created' AS status,
  COUNT(*) AS record_count
FROM device_fingerprints;

SELECT 
  'Attendance rate limits table created' AS status,
  COUNT(*) AS record_count
FROM attendance_rate_limits;

SELECT 'Migration completed successfully!' AS message;
