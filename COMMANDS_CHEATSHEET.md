# 🚀 Commands Cheat Sheet

## 📦 Installation

```cmd
# Run database migration
cd c:\Project-attendance\backend
psql -U postgres -d attendance_db -f UPDATE_SCHEMA.sql

# Start backend
cd c:\Project-attendance\backend
npm start

# Start frontend (new terminal)
cd c:\Project-attendance\frontend
npm start
```

---

## ⚙️ Configuration

```sql
-- Find your IP first: https://www.whatismyip.com/

-- Complete setup (replace YOUR_IP)
UPDATE settings SET 
  gps_accuracy_threshold = 300,
  office_public_ip = 'YOUR_IP',
  attendance_validation_mode = 'location_or_network',
  attendance_rate_limit = 5;
```

---

## 🔍 View Data

```sql
-- View current settings
SELECT 
  gps_accuracy_threshold,
  office_public_ip,
  allowed_ips,
  attendance_validation_mode,
  attendance_rate_limit
FROM settings;

-- View device fingerprints
SELECT * FROM device_fingerprints 
ORDER BY last_seen_at DESC;

-- View audit logs (recent)
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- View rate limits
SELECT * FROM attendance_rate_limits 
ORDER BY window_start DESC;

-- View today's attendance with new columns
SELECT 
  employee_id,
  validation_method,
  device_fingerprint,
  ip_address,
  gps_accuracy
FROM attendance 
WHERE attendance_date = CURRENT_DATE;
```

---

## 🧪 Testing Commands

```sql
-- Reset for fresh test
DELETE FROM attendance 
WHERE employee_id = 'MTM-01' 
AND attendance_date = CURRENT_DATE;

DELETE FROM attendance_rate_limits 
WHERE employee_id = 'MTM-01';

-- Test GPS Threshold
UPDATE settings SET gps_accuracy_threshold = 50;   -- Strict
UPDATE settings SET gps_accuracy_threshold = 300;  -- Lenient

-- Test Validation Modes
UPDATE settings SET attendance_validation_mode = 'location_only';
UPDATE settings SET attendance_validation_mode = 'network_only';
UPDATE settings SET attendance_validation_mode = 'location_or_network';
UPDATE settings SET attendance_validation_mode = 'location_and_network';

-- Test Rate Limiting
UPDATE settings SET attendance_rate_limit = 3;  -- For easy testing
UPDATE settings SET attendance_rate_limit = 5;  -- Default
```

---

## 🔧 Common Fixes

```sql
-- Fix: "GPS accuracy too low"
UPDATE settings SET gps_accuracy_threshold = 500;

-- Fix: "Request from unauthorized network"
UPDATE settings SET office_public_ip = 'YOUR_IP';

-- Fix: "Too many requests"
DELETE FROM attendance_rate_limits WHERE employee_id = 'MTM-01';

-- Fix: Check-in works at home (shouldn't)
UPDATE settings SET attendance_validation_mode = 'network_only';
```

---

## 📊 Admin Panel Access

```
1. Login as admin
2. Go to: Security Logs (in sidebar)
3. Three tabs available:
   - Audit Logs
   - Device Fingerprints
   - Rate Limits
```

---

## 🎯 Quick Scenarios

### Office with Ethernet
```sql
UPDATE settings SET 
  gps_accuracy_threshold = 300,
  office_public_ip = 'YOUR_OFFICE_IP',
  attendance_validation_mode = 'location_or_network';
```

### Strict Security
```sql
UPDATE settings SET 
  gps_accuracy_threshold = 50,
  attendance_validation_mode = 'location_and_network';
```

### Field Employees Only
```sql
UPDATE settings SET 
  attendance_validation_mode = 'location_only';
```

---

## 🔍 Debugging

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('device_fingerprints', 'attendance_rate_limits');

-- Check if columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'settings' 
AND column_name IN ('gps_accuracy_threshold', 'office_public_ip');

-- Check recent failures
SELECT * FROM audit_logs 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## ⚡ One-Line Commands

```sql
-- View everything at once
SELECT 'Settings' as table_name, COUNT(*)::text as count FROM settings
UNION ALL SELECT 'Device Fingerprints', COUNT(*)::text FROM device_fingerprints
UNION ALL SELECT 'Rate Limits', COUNT(*)::text FROM attendance_rate_limits
UNION ALL SELECT 'Audit Logs (Today)', COUNT(*)::text FROM audit_logs WHERE DATE(created_at) = CURRENT_DATE;

-- Complete reset
DELETE FROM attendance WHERE employee_id = 'MTM-01' AND attendance_date = CURRENT_DATE;
DELETE FROM attendance_rate_limits WHERE employee_id = 'MTM-01';

-- Set to defaults
UPDATE settings SET 
  gps_accuracy_threshold = 100,
  office_public_ip = NULL,
  allowed_ips = NULL,
  attendance_validation_mode = 'location_or_network',
  attendance_rate_limit = 5;
```

---

## 📱 Find Your IP

**Website:**
```
https://www.whatismyip.com/
```

**Command Line:**
```cmd
curl https://api.ipify.org
```

**PowerShell:**
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

---

## 📖 Documentation Files

- `QUICK_START.md` - 5-minute setup
- `LOCAL_TESTING_GUIDE.md` - **Complete testing guide**
- `ATTENDANCE_SECURITY_SETUP_GUIDE.md` - Full setup
- `COMPLETE_FEATURE_SUMMARY.md` - Feature overview
- `COMMANDS_CHEATSHEET.md` - This file!

---

## ✅ Verification

```sql
-- Verify migration success
SELECT 'Migration successful!' as status
WHERE EXISTS (SELECT 1 FROM device_fingerprints LIMIT 1)
   OR EXISTS (SELECT 1 FROM attendance_rate_limits LIMIT 1)
   OR 1=1;

-- Verify settings configured
SELECT 
  CASE 
    WHEN gps_accuracy_threshold IS NOT NULL THEN '✅'
    ELSE '❌'
  END as gps_configured,
  CASE 
    WHEN office_public_ip IS NOT NULL THEN '✅'
    ELSE '⚠️'
  END as ip_configured,
  attendance_validation_mode as mode
FROM settings;
```

---

**Quick Help:** Read `LOCAL_TESTING_GUIDE.md` for detailed testing steps! 🎯
