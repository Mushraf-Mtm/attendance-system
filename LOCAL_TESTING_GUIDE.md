# 🧪 Complete Local Testing Guide

## 📋 Table of Contents
1. [Setup & Installation](#setup--installation)
2. [Feature Explanations](#feature-explanations)
3. [Step-by-Step Testing](#step-by-step-testing)
4. [Viewing New Tables](#viewing-new-tables)
5. [Common Issues & Solutions](#common-issues--solutions)

---

## 🚀 Setup & Installation

### Step 1: Run Database Migration

Open **Command Prompt** (not PowerShell due to execution policy):

```cmd
cd c:\Project-attendance\backend
psql -U postgres -d attendance_db -f UPDATE_SCHEMA.sql
```

**OR** if you have pgAdmin:
1. Open pgAdmin
2. Connect to your database
3. Right-click on your database → Query Tool
4. Open file: `c:\Project-attendance\backend\UPDATE_SCHEMA.sql`
5. Click Execute (F5)

**Expected Output:**
```
ALTER TABLE
CREATE TABLE
CREATE INDEX
...
Migration completed successfully!
```

### Step 2: Configure Settings

Find your laptop's public IP:
```
Visit: https://www.whatismyip.com/
```

Configure in database:
```sql
-- Replace YOUR_IP with your actual IP
UPDATE settings SET 
  gps_accuracy_threshold = 300,
  office_public_ip = 'YOUR_IP',
  attendance_validation_mode = 'location_or_network',
  attendance_rate_limit = 5;
```

### Step 3: Restart Servers

**Terminal 1 - Backend:**
```cmd
cd c:\Project-attendance\backend
npm start
```

**Terminal 2 - Frontend:**
```cmd
cd c:\Project-attendance\frontend
npm start
```

**Expected Output:**
- Backend: `🚀 Server running on port 5000`
- Frontend: Opens `http://localhost:3000`

---

## 📚 Feature Explanations

### Feature 1: GPS Accuracy Threshold
**What it does:** Rejects check-in if GPS accuracy is worse than configured value

**Why it's useful:** 
- Desktop computers on Ethernet have poor GPS (200-500 meters)
- Mobile phones with Wi-Fi have good GPS (10-50 meters)
- You can now configure different thresholds for different scenarios

**Example:**
- Threshold = 100m → Rejects if GPS accuracy > 100m
- Threshold = 300m → More lenient, works with Ethernet

### Feature 2: Office IP Validation
**What it does:** Allows check-in from specific office network IP addresses

**Why it's useful:**
- Ethernet-connected desktops don't have good GPS
- Office network IP proves employee is physically in office
- Works as backup when GPS fails

**Example:**
- Office IP: 122.165.45.100
- Employee checks in from office → Network validation passes
- Employee checks in from home → Network validation fails

### Feature 3: Validation Modes
**What it does:** 4 different strategies to validate attendance

**Modes Explained:**

#### Mode 1: Location Only
- ✅ Checks: GPS + Office Radius
- ❌ Ignores: Office IP
- **Best for:** Field employees, mobile workforce

#### Mode 2: Network Only
- ✅ Checks: Office IP
- ❌ Ignores: GPS/Location
- **Best for:** Pure office environment with Ethernet

#### Mode 3: Location OR Network ⭐ RECOMMENDED
- ✅ Pass if: GPS valid OR Office IP valid
- **Best for:** Hybrid office (some Ethernet, some Wi-Fi)
- **Most flexible!**

#### Mode 4: Location AND Network
- ✅ Pass only if: GPS valid AND Office IP valid
- **Best for:** Maximum security, office only

### Feature 4: Device Fingerprinting
**What it does:** Logs device information for security tracking

**Information Captured:**
- Browser (Chrome, Firefox, Edge)
- Operating System (Windows, Mac, Linux)
- Screen Resolution (1920x1080, etc.)
- Timezone (Asia/Kolkata, etc.)
- Unique device hash

**Why it's useful:**
- Track which devices are used for check-in
- Detect suspicious login patterns
- Audit trail for compliance

### Feature 5: Rate Limiting
**What it does:** Prevents spam/abuse of attendance APIs

**How it works:**
- Max 5 requests per minute (configurable)
- Per employee, per IP address
- Blocks 6th attempt, shows "Too many requests"
- Window resets after 60 seconds

**Why it's useful:**
- Prevents automated scripts
- Stops Postman/API abuse
- Protects backend from overload

### Feature 6: Backend Status Calculation
**What it does:** Backend decides attendance status, not frontend

**Status Types:**
- Present → Checked in before late time
- Late → Checked in after late time
- Work From Home → WFH permission + not late
- Half Day → Working hours < threshold
- Absent → No check-in

**Why it's useful:**
- Frontend can't be trusted (can be modified)
- Backend ensures consistency
- All business logic in one place

### Feature 7: Security Audit Logs
**What it does:** Logs all attendance attempts with full details

**Information Logged:**
- Employee ID & Name
- Action (check-in, check-out)
- Status (success, failed)
- IP Address
- Device Fingerprint
- Timestamp
- Failure reason (if failed)

**Why it's useful:**
- Complete audit trail
- Investigate suspicious activity
- Compliance requirements
- Debug issues

### Feature 8: Admin Security Dashboard
**What it does:** View all security data in admin panel

**Three Tabs:**
1. **Audit Logs** - All attendance attempts
2. **Device Fingerprints** - All devices used
3. **Rate Limits** - Current rate limit status

---

## 🧪 Step-by-Step Testing

### Test 1: GPS Accuracy Threshold

**Objective:** Verify different GPS thresholds work

**Steps:**
1. Set threshold to 50m:
```sql
UPDATE settings SET gps_accuracy_threshold = 50;
```

2. Try check-in (will likely fail if using Ethernet)
3. Expected: "GPS accuracy too low"

4. Set threshold to 300m:
```sql
UPDATE settings SET gps_accuracy_threshold = 300;
```

5. Try check-in again
6. Expected: Success!

**Verify in Database:**
```sql
SELECT gps_accuracy FROM attendance 
WHERE employee_id = 'MTM-01' 
ORDER BY attendance_date DESC LIMIT 1;
```

---

### Test 2: Office IP Validation

**Objective:** Verify network validation works

**Setup:**
1. Find your IP: https://www.whatismyip.com/
2. Note it down (e.g., 122.165.45.100)

**Test A - With Correct IP:**
```sql
UPDATE settings SET 
  office_public_ip = 'YOUR_ACTUAL_IP',
  attendance_validation_mode = 'network_only';
```

Try check-in → Expected: ✅ Success!

**Test B - With Wrong IP:**
```sql
UPDATE settings SET office_public_ip = '1.2.3.4';
```

Try check-in → Expected: ❌ "Request from unauthorized network"

**Verify in Database:**
```sql
SELECT ip_address, validation_method FROM attendance 
WHERE employee_id = 'MTM-01' 
ORDER BY attendance_date DESC LIMIT 1;
```

---

### Test 3: Validation Modes

**Objective:** Test all 4 modes

**Setup:**
```sql
-- Your actual IP
UPDATE settings SET office_public_ip = 'YOUR_IP';
UPDATE settings SET gps_accuracy_threshold = 100;
```

**Test Mode 1: Location Only**
```sql
UPDATE settings SET attendance_validation_mode = 'location_only';
```
- Good GPS → ✅ Pass
- Poor GPS → ❌ Fail
- Network ignored

**Test Mode 2: Network Only**
```sql
UPDATE settings SET attendance_validation_mode = 'network_only';
```
- Correct IP → ✅ Pass
- Wrong IP → ❌ Fail
- GPS ignored

**Test Mode 3: Location OR Network** ⭐
```sql
UPDATE settings SET attendance_validation_mode = 'location_or_network';
```
- Good GPS + Correct IP → ✅ Pass (both)
- Poor GPS + Correct IP → ✅ Pass (network)
- Good GPS + Wrong IP → ✅ Pass (location)
- Poor GPS + Wrong IP → ❌ Fail (both)

**Test Mode 4: Location AND Network**
```sql
UPDATE settings SET attendance_validation_mode = 'location_and_network';
```
- Good GPS + Correct IP → ✅ Pass
- Good GPS + Wrong IP → ❌ Fail
- Poor GPS + Correct IP → ❌ Fail
- Poor GPS + Wrong IP → ❌ Fail

**Verify:**
```sql
SELECT validation_method, ip_address, gps_accuracy 
FROM attendance 
WHERE employee_id = 'MTM-01' 
ORDER BY attendance_date DESC LIMIT 5;
```

---

### Test 4: Device Fingerprinting

**Objective:** Verify device information is captured

**Steps:**
1. Check-in from Chrome
2. Check-in from different browser (Edge/Firefox)
3. Check database:

```sql
SELECT 
  employee_id,
  device_fingerprint,
  browser,
  operating_system,
  screen_resolution,
  timezone,
  first_seen_at,
  last_seen_at
FROM device_fingerprints 
WHERE employee_id = 'MTM-01';
```

**Expected:**
- 1-2 records (one per browser)
- Browser name visible (Chrome, Edge, etc.)
- OS visible (Windows)
- Screen resolution (e.g., 1920x1080)
- Timezone (e.g., Asia/Kolkata)

---

### Test 5: Rate Limiting

**Objective:** Verify API abuse prevention

**Steps:**
1. Set rate limit to 3 for easy testing:
```sql
UPDATE settings SET attendance_rate_limit = 3;
```

2. Delete today's attendance (to test multiple times):
```sql
DELETE FROM attendance WHERE employee_id = 'MTM-01' AND attendance_date = CURRENT_DATE;
```

3. Try check-in 4 times quickly
4. Expected results:
   - Attempt 1: ✅ Success
   - Attempt 2: ❌ "Already checked in"
   - Delete and try again
   - Attempt 3: ✅ Success
   - Attempt 4: ❌ "Too many requests. Please try again in X seconds"

5. Check database:
```sql
SELECT * FROM attendance_rate_limits WHERE employee_id = 'MTM-01';
```

Expected: Shows request_count = 3

6. Wait 60 seconds, try again → Should work!

**Reset rate limit:**
```sql
DELETE FROM attendance_rate_limits WHERE employee_id = 'MTM-01';
```

---

### Test 6: Backend Status Calculation

**Objective:** Verify backend decides status, not frontend

**Setup:**
```sql
-- Set late time to current time + 2 minutes
UPDATE settings SET late_after_time = '14:30:00';  -- Replace with current time + 2 min
```

**Test Present:**
1. Check-in before late time
2. Verify:
```sql
SELECT attendance_status FROM attendance 
WHERE employee_id = 'MTM-01' AND attendance_date = CURRENT_DATE;
```
Expected: 'Present'

**Test Late:**
1. Wait until after late time
2. Delete attendance and check-in again
3. Expected: 'Late'

---

### Test 7: Security Audit Logs

**Objective:** Verify all attempts are logged

**Steps:**
1. Try successful check-in
2. Try failed check-in (wrong IP or poor GPS)
3. View logs:

```sql
SELECT 
  user_id,
  action,
  status,
  ip_address,
  device_fingerprint,
  details,
  created_at
FROM audit_logs 
WHERE user_id = 'MTM-01'
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected:**
- Both success and failed attempts logged
- IP address captured
- Device fingerprint captured
- Details show failure reason (if failed)

---

### Test 8: Admin Security Dashboard

**Objective:** View all data in admin panel

**Steps:**
1. Login as admin
2. Click **Security Logs** in sidebar
3. See 3 tabs:
   - **Audit Logs** → All attempts
   - **Device Fingerprints** → All devices
   - **Rate Limits** → Current limits

4. Click **Refresh** button to reload data
5. Click **View Details** icon to see audit log details

---

## 📊 Viewing New Tables

### Option 1: Using pgAdmin (Visual)

1. Open pgAdmin
2. Connect to your database
3. Expand: Databases → attendance_db → Schemas → public → Tables
4. Right-click table → View/Edit Data → All Rows

**New Tables:**
- `device_fingerprints`
- `attendance_rate_limits`

**Updated Tables:**
- `settings` (new columns)
- `attendance` (new columns)
- `audit_logs` (new column)

### Option 2: Using SQL (Command Line)

```sql
-- View Device Fingerprints
SELECT * FROM device_fingerprints ORDER BY last_seen_at DESC;

-- View Rate Limits
SELECT * FROM attendance_rate_limits ORDER BY window_start DESC;

-- View Audit Logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;

-- View Attendance with new columns
SELECT 
  employee_id,
  attendance_date,
  validation_method,
  device_fingerprint,
  ip_address,
  gps_accuracy
FROM attendance 
ORDER BY attendance_date DESC 
LIMIT 10;

-- View Settings with new columns
SELECT 
  gps_accuracy_threshold,
  office_public_ip,
  allowed_ips,
  attendance_validation_mode,
  attendance_rate_limit
FROM settings;
```

### Option 3: Admin Panel (New!)

1. Login as admin
2. Go to **Security Logs** (in sidebar)
3. Switch between tabs:
   - **Audit Logs**
   - **Device Fingerprints**
   - **Rate Limits**

---

## 🔍 Common Issues & Solutions

### Issue 1: "GPS accuracy too low"
**Cause:** GPS accuracy worse than threshold

**Solutions:**
```sql
-- Option 1: Increase threshold
UPDATE settings SET gps_accuracy_threshold = 500;

-- Option 2: Switch to network validation
UPDATE settings SET attendance_validation_mode = 'network_only';

-- Option 3: Use OR mode
UPDATE settings SET attendance_validation_mode = 'location_or_network';
```

### Issue 2: "Request from unauthorized network"
**Cause:** Your IP not in allowed list

**Solutions:**
```sql
-- Option 1: Add your IP
UPDATE settings SET office_public_ip = 'YOUR_IP';

-- Option 2: Use location only
UPDATE settings SET attendance_validation_mode = 'location_only';

-- Option 3: Check your IP is correct
-- Visit: https://www.whatismyip.com/
```

### Issue 3: "Too many requests"
**Cause:** Rate limit exceeded

**Solutions:**
```sql
-- Option 1: Wait 60 seconds

-- Option 2: Clear rate limit manually
DELETE FROM attendance_rate_limits WHERE employee_id = 'MTM-01';

-- Option 3: Increase limit
UPDATE settings SET attendance_rate_limit = 10;
```

### Issue 4: Check-in works at home (should fail)
**Cause:** Validation mode too permissive or GPS passing

**Solutions:**
```sql
-- Option 1: Use network only (strictest for office)
UPDATE settings SET attendance_validation_mode = 'network_only';

-- Option 2: Use AND mode
UPDATE settings SET attendance_validation_mode = 'location_and_network';

-- Option 3: Remove home IP if added
UPDATE settings SET office_public_ip = 'OFFICE_IP_ONLY';
```

### Issue 5: Tables empty / No data
**Cause:** Haven't checked in yet after migration

**Solution:**
1. Delete today's attendance:
```sql
DELETE FROM attendance WHERE employee_id = 'MTM-01' AND attendance_date = CURRENT_DATE;
```

2. Try check-in again
3. Data will populate

### Issue 6: Admin Security Logs page blank
**Cause:** Backend route not registered or API error

**Check:**
```cmd
# Backend terminal should show:
# Server running on port 5000

# Test API directly:
curl http://localhost:5000/api/security/audit-logs -H "Authorization: Bearer YOUR_TOKEN"
```

**Solution:**
- Restart backend
- Check `server.js` has security routes loaded
- Check browser console for errors

---

## ✅ Complete Testing Checklist

Use this to verify everything works:

### Database Setup
- [ ] Migration ran successfully
- [ ] New tables created (device_fingerprints, attendance_rate_limits)
- [ ] Settings table has new columns
- [ ] Attendance table has new columns

### Backend
- [ ] Backend starts without errors
- [ ] Security routes loaded
- [ ] Can access `/api/security/audit-logs` endpoint
- [ ] Can access `/api/security/device-fingerprints` endpoint
- [ ] Can access `/api/security/rate-limits` endpoint

### Frontend
- [ ] Frontend starts without errors
- [ ] Can login as admin
- [ ] Security Logs menu item visible in sidebar
- [ ] Security Logs page loads
- [ ] Can switch between tabs (Audit/Devices/Rates)
- [ ] Data loads and displays

### Features Testing
- [ ] GPS threshold works (reject/allow based on value)
- [ ] Office IP validation works
- [ ] All 4 validation modes work
- [ ] Device fingerprint captured
- [ ] Rate limiting triggers after X attempts
- [ ] Backend calculates status correctly
- [ ] Audit logs capture all attempts
- [ ] Admin can view all security data

### Data Verification
- [ ] Device fingerprints table has records
- [ ] Attendance_rate_limits table updates
- [ ] Audit_logs table growing
- [ ] Attendance has validation_method value
- [ ] Settings has new values

---

## 📞 Quick Reference Commands

### Reset Everything for Fresh Test
```sql
-- Delete today's attendance
DELETE FROM attendance WHERE employee_id = 'MTM-01' AND attendance_date = CURRENT_DATE;

-- Clear rate limits
DELETE FROM attendance_rate_limits WHERE employee_id = 'MTM-01';

-- Reset settings to defaults
UPDATE settings SET 
  gps_accuracy_threshold = 100,
  office_public_ip = NULL,
  attendance_validation_mode = 'location_or_network',
  attendance_rate_limit = 5;
```

### View All Data
```sql
-- Quick overview
SELECT COUNT(*) as total FROM device_fingerprints;
SELECT COUNT(*) as total FROM attendance_rate_limits;
SELECT COUNT(*) as total FROM audit_logs WHERE DATE(created_at) = CURRENT_DATE;

-- Detailed view
SELECT * FROM device_fingerprints ORDER BY last_seen_at DESC LIMIT 5;
SELECT * FROM attendance_rate_limits ORDER BY window_start DESC LIMIT 5;
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

### Check Current Settings
```sql
SELECT 
  gps_accuracy_threshold,
  office_public_ip,
  attendance_validation_mode,
  attendance_rate_limit
FROM settings;
```

---

## 🎯 Testing Scenarios

### Scenario 1: Office Desktop (Ethernet)
```sql
UPDATE settings SET 
  gps_accuracy_threshold = 300,
  office_public_ip = 'YOUR_OFFICE_IP',
  attendance_validation_mode = 'location_or_network';
```
**Result:** ✅ Works even with poor GPS

### Scenario 2: Mobile Phone (Wi-Fi)
```sql
UPDATE settings SET 
  gps_accuracy_threshold = 50,
  attendance_validation_mode = 'location_only';
```
**Result:** ✅ Works with good GPS

### Scenario 3: Maximum Security
```sql
UPDATE settings SET 
  gps_accuracy_threshold = 50,
  office_public_ip = 'YOUR_OFFICE_IP',
  attendance_validation_mode = 'location_and_network';
```
**Result:** ✅ Must pass BOTH validations

### Scenario 4: Testing from Home
```sql
UPDATE settings SET 
  attendance_validation_mode = 'network_only',
  office_public_ip = 'OFFICE_IP_NOT_HOME_IP';
```
**Result:** ❌ Should fail (not on office network)

---

## 🎉 Success Criteria

You'll know everything works when:

1. ✅ Migration completed without errors
2. ✅ All new tables exist and visible
3. ✅ Backend starts successfully
4. ✅ Frontend loads Security Logs page
5. ✅ Can check-in successfully
6. ✅ Device fingerprint appears in database
7. ✅ Audit logs show your check-in
8. ✅ Rate limiting triggers after X attempts
9. ✅ Different validation modes behave differently
10. ✅ Admin panel shows all security data

---

**Testing Complete!** You now have a fully secured attendance system! 🚀
