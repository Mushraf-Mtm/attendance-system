# Deployment Environment Variables Guide

## 🎯 Quick Answer
**Email environment variables go on the BACKEND deployment only!**

---

## 📦 Backend Deployment (Render/Railway/Heroku)

Add these environment variables to your **BACKEND** deployment:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=your_neon_connection_string

# JWT
JWT_SECRET=mySecretKey12345ChangeThis
JWT_EXPIRE=7d

# Email Configuration (⚠️ REQUIRED FOR PASSWORD RESET)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mtm.support.1@gmail.com
EMAIL_PASS=skvautzggwftbehj
EMAIL_FROM=mtm.support.1@gmail.com
EMAIL_FROM_NAME=Attendance System

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Important Notes:
- ✅ Replace `EMAIL_USER` and `EMAIL_PASS` with your actual Gmail credentials
- ✅ Use Gmail App Password (not regular password)
- ✅ Replace `FRONTEND_URL` with your actual Vercel frontend URL
- ✅ The `DATABASE_URL` should be your Neon PostgreSQL connection string

---

## 🌐 Frontend Deployment (Vercel)

Add these environment variables to your **FRONTEND** deployment:

```env
# Backend API URL
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

### Important Notes:
- ✅ Replace with your actual backend URL from Render/Railway/Heroku
- ✅ Make sure to include `/api` at the end
- ⚠️ Do NOT add email variables to frontend - they are backend only!

---

## 🔐 Security Checklist

### Backend (Render/Railway/Heroku)
- [ ] All EMAIL_* variables are set
- [ ] DATABASE_URL points to Neon PostgreSQL
- [ ] JWT_SECRET is a strong random string
- [ ] FRONTEND_URL matches your Vercel URL exactly (no trailing slash)
- [ ] Never commit .env file to GitHub

### Frontend (Vercel)
- [ ] REACT_APP_API_URL points to backend
- [ ] URL includes `/api` at the end
- [ ] Never expose backend secrets in frontend

---

## 📝 Database Migration Required

After deploying backend, run this SQL in Neon SQL Editor:

```sql
-- Run the password management migration
-- File: backend/migrations/add_password_management_tables.sql

-- Copy and paste the entire content from that file
```

Then insert default OTP settings:

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

---

## 🚀 Deployment Platforms

### Backend Options:
- **Render** (Recommended) - Free tier, PostgreSQL support
- **Railway** - Easy setup, generous free tier
- **Heroku** - Classic platform, paid plans

### Frontend Options:
- **Vercel** (Recommended) - Automatic React deployment
- **Netlify** - Alternative with similar features

### Database:
- **Neon** (Recommended) - Serverless PostgreSQL, free tier

---

## ✅ Testing Email After Deployment

1. Go to Forgot Password page
2. Enter employee email: `mushraf1.mtm@gmail.com`
3. Check email (might be in spam)
4. Enter OTP and reset password

If email fails, check backend logs for error messages.
