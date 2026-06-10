# 🚀 Attendance Management System - Deployment Guide

## ✨ New Features Added

### 1. Mobile Responsive Design
- ✅ All pages now work perfectly on mobile phones
- ✅ Hamburger menu for mobile navigation
- ✅ Responsive tables and forms
- ✅ Touch-friendly buttons and inputs

### 2. Password Management System
- ✅ **Forgot Password** - Users can reset password via OTP email
- ✅ **Change Password** - Logged-in users can change their password
- ✅ **Email OTP Verification** - Secure 6-digit OTP sent via email
- ✅ **Rate Limiting** - Prevents spam and brute force attacks
- ✅ **Audit Logging** - All security events are logged
- ✅ **Admin OTP Settings** - Configure OTP expiry, cooldown, attempts

---

## 📦 What You Need to Deploy

### Backend Environment Variables (REQUIRED)
```env
DATABASE_URL=your_neon_postgresql_url
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-url.vercel.app

# Email Configuration (REQUIRED for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mtm.support.1@gmail.com
EMAIL_PASS=skvautzggwftbehj
EMAIL_FROM=mtm.support.1@gmail.com
EMAIL_FROM_NAME=Attendance System
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

---

## 🎯 Deployment Steps

### Step 1: Push to GitHub
```bash
cd C:\Project-attendance
git add .
git commit -m "Added password reset feature and mobile responsive design"
git push origin main
```

### Step 2: Deploy Backend
1. Go to **Render.com** (or Railway/Heroku)
2. Create new Web Service
3. Connect your GitHub repository
4. Select `backend` folder as root directory
5. Build command: `npm install`
6. Start command: `npm start`
7. Add all environment variables (see above)
8. Deploy!

### Step 3: Deploy Frontend
1. Go to **Vercel.com**
2. Import your GitHub repository
3. Select `frontend` folder as root directory
4. Framework preset: `Create React App`
5. Add environment variable: `REACT_APP_API_URL`
6. Deploy!

### Step 4: Database Migration
1. Go to **Neon Console** (console.neon.tech)
2. Open SQL Editor
3. Copy content from `backend/migrations/add_password_management_tables.sql`
4. Paste and execute
5. Insert default OTP settings:
```sql
INSERT INTO settings (
  otp_expiry_minutes, 
  otp_resend_seconds, 
  otp_max_attempts, 
  otp_requests_per_hour
) VALUES (5, 60, 3, 5)
ON CONFLICT (id) DO UPDATE SET
  otp_expiry_minutes = 5,
  otp_resend_seconds = 60,
  otp_max_attempts = 3,
  otp_requests_per_hour = 5;
```

### Step 5: Test Everything
1. Open your frontend URL
2. Test mobile responsiveness (use browser DevTools)
3. Test employee login
4. Test forgot password flow
5. Test change password (logged-in user)
6. Test admin OTP settings page

---

## 📧 Email Environment Variables - IMPORTANT!

### ❓ Where to Add Email Variables?
**BACKEND DEPLOYMENT ONLY!** ✅

Email variables should be added to:
- ✅ Render (Backend)
- ✅ Railway (Backend)
- ✅ Heroku (Backend)

Email variables should NOT be added to:
- ❌ Vercel (Frontend)
- ❌ Frontend code
- ❌ Frontend .env file

### 🔐 Gmail App Password Setup
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to "App Passwords"
4. Generate new app password for "Mail"
5. Copy the 16-character password
6. Use this as `EMAIL_PASS` (remove spaces)

---

## 🗂️ Project Structure

```
Project-attendance/
├── backend/
│   ├── controllers/
│   │   ├── passwordController.js (NEW)
│   │   ├── otpSettingsController.js (NEW)
│   │   └── ...
│   ├── services/
│   │   ├── emailService.js (NEW)
│   │   ├── otpService.js (NEW)
│   │   ├── auditService.js (NEW)
│   │   └── ...
│   ├── migrations/
│   │   └── add_password_management_tables.sql (NEW)
│   └── ...
├── frontend/
│   └── src/
│       └── pages/
│           ├── ForgotPassword.js (NEW)
│           ├── ChangePassword.js (NEW)
│           ├── AdminOTPSettings.js (NEW)
│           └── ...
└── Documentation Files
```

---

## 🎨 Features Overview

### For Employees:
- 📱 Mobile-friendly interface
- 🔐 Forgot password with OTP email
- 🔑 Change password (when logged in)
- 📊 View attendance records
- 📅 Request WFH
- 👤 Update profile

### For Admins:
- 📱 Mobile-friendly admin panel
- 👥 Manage employees
- 📊 View all attendance
- 🎉 Manage holidays
- ⚙️ Configure OTP settings (NEW)
- 👨‍💼 Manage admin users
- 📈 Generate reports

---

## 🔒 Security Features

- ✅ **Rate Limiting** - Prevents OTP spam (5 requests per hour)
- ✅ **Cooldown Period** - 60 seconds between resend requests
- ✅ **OTP Expiry** - OTPs expire in 5 minutes
- ✅ **Max Attempts** - 3 attempts to enter correct OTP
- ✅ **Audit Logging** - All security events logged
- ✅ **Password Strength** - Enforced password requirements
- ✅ **Secure Storage** - OTPs hashed with bcrypt
- ✅ **Account Enumeration Prevention** - Generic error messages

---

## 📝 Database Tables Added

- `password_reset_otps` - Stores OTP records
- `audit_logs` - Logs security events
- `otp_rate_limits` - Tracks rate limiting

Plus added columns to `settings` table:
- `otp_expiry_minutes`
- `otp_resend_seconds`
- `otp_max_attempts`
- `otp_requests_per_hour`

---

## 🎉 You're Ready to Deploy!

Follow the steps above and your application will be live with:
- ✅ Mobile responsive design
- ✅ Password reset via email
- ✅ Secure OTP verification
- ✅ Complete audit trail

Good luck! 🚀
