-- Migration: Move settings from JSON to Database
-- This creates a settings table to store all application settings

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    
    -- Company Location Settings
    company_name VARCHAR(200) DEFAULT 'Company Office',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    allowed_radius INTEGER NOT NULL DEFAULT 100,
    gps_accuracy_threshold INTEGER DEFAULT 100,
    
    -- Working Hours Settings
    office_start_time TIME NOT NULL DEFAULT '09:00',
    office_end_time TIME NOT NULL DEFAULT '18:00',
    late_after_time TIME NOT NULL DEFAULT '09:30',
    half_day_threshold DECIMAL(3, 1) NOT NULL DEFAULT 4.0,
    
    -- Enable/Disable Controls
    check_in_enabled BOOLEAN DEFAULT TRUE,
    check_out_enabled BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_settings_id ON settings(id);

-- Insert default settings from current settings.json
INSERT INTO settings (
    company_name,
    latitude,
    longitude,
    allowed_radius,
    gps_accuracy_threshold,
    office_start_time,
    office_end_time,
    late_after_time,
    half_day_threshold,
    check_in_enabled,
    check_out_enabled
) VALUES (
    'Company Office',
    13.015837,
    77.721172,
    100,
    100,
    '14:10',
    '22:30',
    '14:11',
    4.0,
    true,
    true
) ON CONFLICT DO NOTHING;

-- Ensure only one settings row exists
-- This prevents multiple settings entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_singleton ON settings ((id IS NOT NULL));
