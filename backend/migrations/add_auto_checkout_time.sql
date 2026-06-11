-- Add auto_checkout_time column to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS auto_checkout_time TIME DEFAULT '18:32:00';

-- Update existing record with default value (office end time + 2 minutes)
UPDATE settings 
SET auto_checkout_time = '18:32:00' 
WHERE auto_checkout_time IS NULL;

-- Add comment
COMMENT ON COLUMN settings.auto_checkout_time IS 'Time when automatic checkout should occur for employees who forgot to checkout manually';
