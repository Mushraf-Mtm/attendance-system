-- Add is_auto_checkout column to attendance table
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS is_auto_checkout BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN attendance.is_auto_checkout IS 'Indicates if the employee was automatically checked out by the system';
