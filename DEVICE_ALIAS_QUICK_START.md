# 🚀 Device Alias Management - Quick Start Guide

## ⚡ 3-Step Setup

### Step 1: Run Database Migration (1 minute)
```cmd
cd c:\Project-attendance\backend
psql -U postgres -d attendance_db -f DEVICE_ALIAS_MIGRATION.sql
```

### Step 2: Restart Backend (30 seconds)
```cmd
cd c:\Project-attendance\backend
node server.js
```

### Step 3: Restart Frontend (30 seconds)
```cmd
cd c:\Project-attendance\frontend
npm start
```

---

## 🎯 How to Use

### Add Device Alias
1. Login as Admin
2. Go to **Security Logs** → **Device Fingerprints** tab
3. Click **Edit (✏️)** button on any device
4. Type alias (e.g., "Reception PC", "HR Laptop")
5. Click **Save (✓)**
6. Done! ✅

### Edit Existing Alias
1. Click **Edit (✏️)** button
2. Change the name
3. Click **Save (✓)**

### Cancel Editing
1. Click **Cancel (✗)** button

---

## 📋 What Changed

### New Columns in Device Table
- **Device Alias** - Custom name you set
- **Device Type** - Auto-detected (Desktop/Laptop/Mobile/Tablet)
- **Browser Version** - Auto-detected (e.g., Chrome 120.0)

### Old vs New

**Before:** `b50aaa97ce05c797c5b3e58e6b77cfe7`  
**After:** `Reception PC` (ID: b50aaa97...)

---

## ✅ Verification

After setup, verify:
1. Open: `http://localhost:3000/admin/login`
2. Go to: Security Logs → Device Fingerprints
3. Check: New columns visible ✅
4. Click: Edit button works ✅
5. Save: Alias persists ✅

---

## 🐛 Quick Fixes

**Edit not working?**
→ Restart frontend

**Columns missing?**
→ Run migration again

**Changes not saving?**
→ Check backend console for errors

---

**Ready to use!** 🎉
