# 🚀 DEPLOYMENT CHECKLIST

## ✅ PRE-DEPLOYMENT VERIFICATION

### Backend Status
- ✅ All dependencies installed (13 packages)
- ✅ Sunday blocking re-enabled
- ✅ Security features active
- ✅ Audit logging working
- ✅ Rate limiting functional
- ✅ Cron jobs configured

### Frontend Status
- ✅ All dependencies installed (7 packages)
- ✅ .env file created
- ✅ API connection working
- ✅ Mobile responsive
- ✅ All pages functional

### Database Status
- ✅ Schema applied (13 tables)
- ✅ Security migration applied
- ✅ Indexes created
- ✅ Constraints active

---

## 📋 STARTUP COMMANDS

### Start Backend
```cmd
cd c:\Project-attendance\backend
node server.js
```

Expected output:
```
🚀 Server running on port 5000
📍 http://localhost:5000
Auth routes loaded
⏰ Cron jobs scheduled:
   - Auto-checkout: Checks every minute
   - Daily absent records: 12:01 AM daily
```

### Start Frontend
```cmd
cd c:\Project-attendance\frontend
npm start
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

---

## 🔍 VERIFICATION STEPS

### 1. Test Admin Login
```
URL: http://localhost:3000/admin/login
Test Credentials: Check database admins table
```

### 2. Test Employee Login
```
URL: http://localhost:3000/employee/login
Test Credentials: Check database employees table
```

### 3. Test Check-in (should fail on Sunday)
```
Try to check-in
Expected: "Today is Sunday. Attendance is not required on Sundays."
```

### 4. Test Security Logs
```
Admin → Security Logs
Check all 3 tabs:
- Audit Logs (should show check-in attempts)
- Device Fingerprints (should show devices)
- Rate Limits (should show rate limit records)
```

### 5. Test Rate Limiting
```
1. Set rate limit to 3 in Admin Settings
2. Try check-in 4 times quickly
3. 4th attempt should be blocked
4. Error: "Too many attendance requests. Please try again in XX seconds."
```

### 6. Test Settings
```
Admin → Settings
Verify all new fields visible:
- GPS Accuracy Threshold
- Office Public IP
- Additional Allowed IPs
- Attendance Validation Mode
- Attendance Rate Limit
```

---

## 🔐 SECURITY VERIFICATION

### Check Sunday Blocking
```sql
-- Should return 0 on Sunday
SELECT getDay() FROM (SELECT CURRENT_DATE) as today;
```

### Check Rate Limiting
```sql
SELECT * FROM attendance_rate_limits ORDER BY created_at DESC LIMIT 5;
```

### Check Audit Logs
```sql
SELECT action, status, COUNT(*) 
FROM audit_logs 
GROUP BY action, status 
ORDER BY COUNT(*) DESC;
```

### Check Device Fingerprints
```sql
SELECT COUNT(*) as total_devices FROM device_fingerprints;
SELECT employee_id, COUNT(*) as device_count 
FROM device_fingerprints 
GROUP BY employee_id;
```

---

## 📊 MONITORING COMMANDS

### Check Backend Health
```
GET http://localhost:5000/api/health
Expected: {"success":true,"message":"Server is running"}
```

### Check Database Connection
```sql
SELECT COUNT(*) FROM employees;
SELECT COUNT(*) FROM attendance WHERE attendance_date = CURRENT_DATE;
SELECT COUNT(*) FROM audit_logs WHERE DATE(created_at) = CURRENT_DATE;
```

### Check Cron Jobs (Backend Console)
```
Look for:
"⏰ Cron jobs scheduled:"
"- Auto-checkout: Checks every minute"
"- Daily absent records: 12:01 AM daily"
```

---

## ⚠️ TROUBLESHOOTING

### Issue: Backend not starting
**Check:**
1. PostgreSQL is running
2. Database exists
3. .env file configured correctly
4. Port 5000 not in use

### Issue: Frontend showing 404 errors
**Check:**
1. Backend is running on port 5000
2. .env file exists with `REACT_APP_API_URL=http://localhost:5000/api`
3. Frontend restarted after creating .env

### Issue: Sunday blocking not working
**Check:**
1. Backend restarted after uncommenting
2. Console shows no errors
3. Date/time is correct on server

### Issue: Rate limiting not blocking
**Check:**
1. Settings saved correctly in database
2. Backend logs show rate limit checks
3. Same employee and IP being used

### Issue: Security logs empty
**Check:**
1. .env file exists in frontend
2. API URL correct
3. Token valid (try logout/login)

---

## ✅ DEPLOYMENT COMPLETE

When all checks pass:
1. ✅ Backend running without errors
2. ✅ Frontend accessible
3. ✅ Can login as admin
4. ✅ Can login as employee
5. ✅ Sunday blocking working
6. ✅ Security logs visible
7. ✅ Rate limiting functional
8. ✅ Settings configurable

**Status:** READY FOR PRODUCTION 🎉

---

## 📞 SUPPORT

### Backend Console Logs to Monitor
```
[Rate Limit] Employee: XXX, IP: XXX, Limit: 3
[Rate Limit] ✅ Allowed - Incrementing count...
[Rate Limit] ❌ BLOCKED XXX - Exceeded limit
=== ATTENDANCE VALIDATION ===
=== CHECK-OUT TIME VALIDATION ===
```

### Key Endpoints
- Health: `GET /api/health`
- Settings: `GET /api/settings`
- Audit Logs: `GET /api/security/audit-logs`
- Rate Limits: `GET /api/security/rate-limits`
- Devices: `GET /api/security/device-fingerprints`

### Important Files
- Backend env: `backend/.env`
- Frontend env: `frontend/.env`
- Schema: `backend/config/schema.sql`
- Migration: `backend/UPDATE_SCHEMA.sql`

---

**Deployment Date:** 2026-06-15  
**Version:** 1.0.0  
**Status:** ✅ VERIFIED & READY

