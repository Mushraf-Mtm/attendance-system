# Attendance Security Enhancement - Setup & Testing Guide

## 🎯 What Was Implemented

### ✅ New Features Added

1. **GPS Accuracy Threshold in Admin Settings**
   - Configurable threshold (50m, 100m, 200m, 300m, 500m)
   - Stored in database, no hardcoded values

2. **Office Public IP Validation**
   - Primary office IP address
   - Multiple allowed IPs (comma-separated)
   - Supports Ethernet-connected systems

3. **4 Attendance Validation Modes**
   - Location Only
   - Network Only
   - Location OR Network (Recommended for Ethernet)
   - Location AND Network

4. **Device Fingerprint Logging**
   - Browser, OS, Screen Resolution, Timezone
   - Logged for audit purposes
   - Non-blocking (doesn't prevent attendance)

5. **API Rate Limiting**
   - Configurable requests per minute (default: 5)
   - Prevents spam and abuse
   - Per employee, per IP

6. **Backend-Only Attendance Status**
   - Frontend NEVER decides status
   - Backend calculates: Present, Late, WFH, etc.

7. **Security Audit Logs**
   - All attendance attempts logged
   - Includes IP, device, validation method
   - Success and failure events

---

## 📦 Installation Steps

### Step 1: Update Database Schema

Run the migration SQL file on your database:

```bash
# Using psql (PostgreSQL command line)
psql -U your_username -d attendance_db -f backend/UPDATE_SCHEMA.sql

# Or using pgAdmin:
# 1. Open pgAdmin
# 2. Connect to your database
# 3. Open Query Tool
# 4. Copy and paste content from UPDATE_SCHEMA.sql
# 5. Execute
```

### Step 2: Install Dependencies (if needed)

No new npm packages required! All features use existing dependencies.

### Step 3: Restart Backend Server

```bash
cd backend
npm start
```

### Step 4: Restart Frontend

```bash
cd frontend
npm start
```

---

## 🔧 Admin Configuration

### Access Admin Settings

1. Login as Admin
2. Navigate to **Settings** from sidebar
3. You'll see new fields added

### New Settings Available

#### 1. GPS Accuracy Threshold
- **Field**: GPS Accuracy Threshold (meters)
- **Default**: 100 meters
- **Recommended**: 
  - Mobile/WiFi: 50-100m
  - Desktop/Ethernet: 200-500m
- **What it does**: Rejects attendance if GPS accuracy is worse than this value

#### 2. Office Public IP
- **Field**: Office Public IP
- **Example**: `122.165.45.100`
- **How to find**: Google "what is my IP" from office computer
- **What it does**: Allows attendance from this IP address

#### 3. Allowed IPs (Multiple)
- **Field**: Allowed IPs
- **Example**: `122.165.45.100, 122.165.45.101, 192.168.1.0/24`
- **Format**: Comma-separated list
- **Supports CIDR**: Yes (e.g., `192.168.1.0/24`)
- **What it does**: Allows attendance from any of these IPs

#### 4. Attendance Validation Mode
- **Field**: Attendance Validation Mode
- **Options**:
  - `Location Only` - GPS + Radius only
  - `Network Only` - Office IP only (best for Ethernet)
  - `Location OR Network` - Pass if either valid (RECOMMENDED)
  - `Location AND Network` - Must pass both (strictest)
- **Default**: `Location OR Network`

#### 5. Attendance Rate Limit
- **Field**: Rate Limit (requests per minute)
- **Default**: 5
- **What it does**: Blocks if employee tries more than X requests per minute

---

## 🧪 Testing Guide

### Test 1: GPS Accuracy Threshold

**Goal**: Verify that attendance is rejected if GPS accuracy is too low

**Steps**:
1. Set GPS Accuracy Threshold to 50 meters in Admin Settings
2. Try to check-in from a location with poor GPS signal
3. Expected: "GPS accuracy too low. Please enable high accuracy mode."

**How to simulate poor GPS**:
- Go to Chrome DevTools → Sensors → Location → Select "Other" → Set accuracy to 200

### Test 2: Office IP Validation

**Goal**: Verify network-based validation works

**Steps**:
1. Find your current public IP: https://www.whatismyip.com/
2. Add it to "Office Public IP" in Admin Settings
3. Set Validation Mode to "Network Only"
4. Try to check-in
5. Expected: Success!

**Test from different network**:
1. Connect to mobile hotspot (different IP)
2. Try to check-in
3. Expected: "Request from unauthorized network. Your IP: X.X.X.X"

### Test 3: Location OR Network Mode (Recommended for Ethernet)

**Goal**: Check-in works with either location OR network

**Setup**:
1. Set Validation Mode to "Location OR Network"
2. Add your office IP to settings
3. Set GPS Accuracy Threshold to 100m

**Scenario A - Good GPS + Good Network**:
- Check-in from office with good GPS
- Expected: Success! (both validations pass)

**Scenario B - Poor GPS + Good Network**:
- Check-in from office Ethernet (poor GPS)
- Expected: Success! (network validation passes)

**Scenario C - Good GPS + Different Network**:
- Check-in from field with good GPS but different IP
- Expected: Success! (location validation passes)

**Scenario D - Poor GPS + Different Network**:
- Check-in with poor GPS and different IP
- Expected: Failed (both validations fail)

### Test 4: Rate Limiting

**Goal**: Verify rate limiting prevents spam

**Steps**:
1. Set Rate Limit to 3 in Admin Settings
2. Try to check-in 4 times within 1 minute
3. Expected on 4th attempt: "Too many attendance requests. Please try again in X seconds."

### Test 5: Device Fingerprinting

**Goal**: Verify device info is logged

**Steps**:
1. Check-in successfully
2. Check database:
```sql
SELECT * FROM device_fingerprints WHERE employee_id = 'MTM-01';
```
3. Expected: Record with browser, OS, screen resolution, timezone

### Test 6: Audit Logging

**Goal**: Verify all attempts are logged

**Steps**:
1. Try to check-in (success or failure)
2. Check database:
```sql
SELECT * FROM audit_logs 
WHERE user_id = 'MTM-01' 
AND action LIKE '%checkin%' 
ORDER BY created_at DESC 
LIMIT 10;
```
3. Expected: Logs showing attempts with IP, device fingerprint, status

---

## 📊 Database Tables & Data

### New Tables Created

#### 1. `device_fingerprints`
**Stores**: Device information for security tracking

**View your devices**:
```sql
SELECT 
  employee_id,
  browser,
  operating_system,
  screen_resolution,
  timezone,
  first_seen_at,
  last_seen_at,
  is_approved
FROM device_fingerprints
WHERE employee_id = 'MTM-01';
```

#### 2. `attendance_rate_limits`
**Stores**: Rate limit tracking

**View rate limits**:
```sql
SELECT 
  employee_id,
  ip_address,
  request_count,
  window_start
FROM attendance_rate_limits
WHERE employee_id = 'MTM-01';
```

**Reset rate limit** (for testing):
```sql
DELETE FROM attendance_rate_limits WHERE employee_id = 'MTM-01';
```

### Enhanced Existing Tables

#### `attendance` - New Columns
- `device_fingerprint` - Device hash used during check-in
- `validation_method` - Which method passed (location/network/both)

**View validation methods used**:
```sql
SELECT 
  employee_id,
  attendance_date,
  validation_method,
  device_fingerprint,
  ip_address
FROM attendance
WHERE employee_id = 'MTM-01'
ORDER BY attendance_date DESC
LIMIT 10;
```

#### `audit_logs` - New Column
- `device_fingerprint` - Device hash for security events

**View security events**:
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
AND action LIKE '%checkin%'
ORDER BY created_at DESC
LIMIT 20;
```

---

## 💻 Testing on Your Personal Laptop

### Scenario: Office Desktop (Ethernet) vs Personal Laptop

#### Setup for Office Desktop
1. **Find office public IP**: Visit https://www.whatismyip.com/ from office
2. **Add to settings**: Add this IP to "Office Public IP" in Admin Settings
3. **Set validation mode**: "Location OR Network"
4. **Set GPS threshold**: 300 meters (relaxed for Ethernet)

#### Setup for Personal Laptop
**Option A - Allow home IP**:
1. Find your home IP: https://www.whatismyip.com/
2. Add to "Allowed IPs": `office_ip, home_ip`

**Option B - Use Location Only**:
1. Temporarily change to "Location Only" mode
2. Set your home coordinates in Admin Settings
3. Test check-in

#### Testing Steps

**Test 1 - Office Desktop (Ethernet)**:
```
✓ Connected to office network via Ethernet
✓ GPS accuracy might be poor (200-500m)
✓ Office IP matches configured IP
→ Result: SUCCESS (network validation passes)
```

**Test 2 - Personal Laptop at Home**:
```
✗ Different network (home IP)
✗ Different location
✗ GPS might be poor
→ Result: FAILED (both validations fail)
→ Expected behavior!
```

**Test 3 - Personal Laptop at Office (WiFi)**:
```
✓ Connected to office WiFi
✓ Office IP matches
✓ GPS might be good
→ Result: SUCCESS (network validation passes)
```

---

## 🎛️ Recommended Settings by Use Case

### Use Case 1: Pure Office Environment (Ethernet)
```
GPS Accuracy Threshold: 300m (relaxed)
Office Public IP: <your office IP>
Validation Mode: Network Only OR Location OR Network
Rate Limit: 5
```

### Use Case 2: Hybrid (Office + Field)
```
GPS Accuracy Threshold: 100m
Office Public IP: <your office IP>
Validation Mode: Location OR Network
Rate Limit: 5
```

### Use Case 3: Strict Security
```
GPS Accuracy Threshold: 50m
Office Public IP: <your office IP>
Validation Mode: Location AND Network
Rate Limit: 3
```

### Use Case 4: Field-Only Employees
```
GPS Accuracy Threshold: 100m
Office Public IP: (leave empty)
Validation Mode: Location Only
Rate Limit: 5
```

---

## 🐛 Troubleshooting

### Issue: "GPS accuracy too low"
**Cause**: GPS accuracy worse than threshold
**Solution**:
1. Increase GPS Accuracy Threshold in settings (300m or 500m)
2. OR switch to "Location OR Network" mode
3. OR add office IP and use "Network Only" mode

### Issue: "Request from unauthorized network"
**Cause**: IP address not in allowed list
**Solution**:
1. Find your current IP: https://www.whatismyip.com/
2. Add to "Allowed IPs" in Admin Settings
3. OR switch to "Location Only" mode

### Issue: "Too many attendance requests"
**Cause**: Rate limit exceeded
**Solution**:
1. Wait 1 minute and try again
2. OR increase rate limit in settings
3. OR reset: `DELETE FROM attendance_rate_limits WHERE employee_id = 'YOUR_ID';`

### Issue: Check-in works at home but should only work at office
**Cause**: Validation mode too permissive
**Solution**:
1. Ensure office IP is configured correctly
2. Switch to "Network Only" mode (office only)
3. OR switch to "Location AND Network" (strictest)

---

## 📈 Monitoring & Reports

### View Validation Methods Used
```sql
SELECT 
  validation_method,
  COUNT(*) as count
FROM attendance
WHERE attendance_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY validation_method;
```

### View Failed Attempts
```sql
SELECT 
  user_id,
  action,
  ip_address,
  details,
  created_at
FROM audit_logs
WHERE status = 'failed'
AND action LIKE '%checkin%'
ORDER BY created_at DESC
LIMIT 50;
```

### View Rate Limit Violations
```sql
SELECT 
  user_id,
  COUNT(*) as violations
FROM audit_logs
WHERE action = 'attendance_rate_limit_exceeded'
AND created_at >= CURRENT_DATE
GROUP BY user_id
ORDER BY violations DESC;
```

---

## ✅ Checklist After Setup

- [ ] Database migration completed
- [ ] Backend restarted
- [ ] Frontend restarted
- [ ] Admin settings page loads with new fields
- [ ] Office IP configured
- [ ] GPS Accuracy Threshold set
- [ ] Validation Mode selected
- [ ] Tested check-in from office (success)
- [ ] Tested check-in from home (expected result)
- [ ] Verified audit logs are working
- [ ] Verified device fingerprints are logged

---

## 🔐 Security Notes

1. **IP addresses are not 100% reliable** - Users can use VPN
2. **Device fingerprints are not unique** - Same browser/OS = same fingerprint
3. **This is defense-in-depth** - Multiple layers, not one silver bullet
4. **Audit logs are crucial** - Monitor for suspicious patterns
5. **Rate limiting helps** - Prevents automated abuse

---

## 📞 Support

If you encounter issues:
1. Check backend logs: `cd backend && npm start`
2. Check frontend console: F12 → Console
3. Check database: Verify migration ran successfully
4. Test with simple settings first, then add complexity

**Need Help?**
- Check audit_logs table for error details
- Verify settings table has new columns
- Ensure device_fingerprints table exists
- Confirm attendance_rate_limits table exists
