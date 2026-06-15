-- ============================================
-- DEVICE FINGERPRINT MANAGEMENT ENHANCEMENT
-- Add device alias and device type support
-- ============================================

-- Step 1: Add device_alias column to device_fingerprints table
ALTER TABLE device_fingerprints 
ADD COLUMN IF NOT EXISTS device_alias VARCHAR(255),
ADD COLUMN IF NOT EXISTS device_type VARCHAR(50) DEFAULT 'Unknown',
ADD COLUMN IF NOT EXISTS browser_version VARCHAR(50),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Step 2: Add constraint for device_type
DO $$ BEGIN
  ALTER TABLE device_fingerprints 
  ADD CONSTRAINT device_fingerprints_device_type_check 
  CHECK (device_type IN ('Desktop', 'Laptop', 'Mobile', 'Tablet', 'Unknown'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 3: Create index for device_alias
CREATE INDEX IF NOT EXISTS idx_device_fingerprints_alias ON device_fingerprints(device_alias);

-- Step 4: Add comments
COMMENT ON COLUMN device_fingerprints.device_alias IS 'Custom device name assigned by administrator (e.g., Reception PC, HR Laptop)';
COMMENT ON COLUMN device_fingerprints.device_type IS 'Type of device: Desktop, Laptop, Mobile, Tablet, or Unknown';
COMMENT ON COLUMN device_fingerprints.browser_version IS 'Browser version information';
COMMENT ON COLUMN device_fingerprints.updated_at IS 'Last update timestamp for device alias';

-- Step 5: Create trigger to update updated_at on device_alias change
CREATE OR REPLACE FUNCTION update_device_fingerprints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_device_fingerprints_updated_at ON device_fingerprints;

CREATE TRIGGER trigger_device_fingerprints_updated_at
BEFORE UPDATE ON device_fingerprints
FOR EACH ROW
WHEN (OLD.device_alias IS DISTINCT FROM NEW.device_alias)
EXECUTE FUNCTION update_device_fingerprints_updated_at();

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 
  'device_fingerprints table updated' AS status,
  COUNT(*) AS total_devices
FROM device_fingerprints;

SELECT 'Migration completed successfully!' AS message;
