-- Add new columns to settings for Electron Desktop Validation Mode
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS electron_desktop_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS electron_desktop_validation_mode VARCHAR(80) DEFAULT 'trusted_device_and_network';
