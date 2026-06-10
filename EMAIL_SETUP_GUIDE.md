# 📧 Complete Email Configuration Guide

## Required Environment Variables

Add these to your `backend/.env` file:

```env
# Email Configuration (for OTP and Password Reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Attendance System
```

---

## ⭐ OPTION 1: Gmail (Recommended - Most Common)

### Step-by-Step Setup

#### 1. Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click **"Security"** in the left sidebar
3. Under **"Signing in to Google"**, click **"2-Step Verification"**
4. Click **"Get Started"** and follow the prompts
5. Verify your phone number and enable 2FA

#### 2. Generate App Password
1. After enabling 2FA, go back to: https://myaccount.google.com/security
2. Scroll down to **"Signing in to Google"**
3. Click **"App passwords"** (you'll only see this after enabling 2FA)
4. You may need to sign in again
5. Select **"Mail"** from the first dropdown
6. Select **"Other (Custom name)"** from the second dropdown
7. Type **"Attendance System"** as the name
8. Click **"Generate"**
9. **IMPORTANT**: Copy the 16-character password shown (e.g., `abcd efgh ijkl mnop`)

#### 3. Configure .env File
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop  # 16 chars, remove spaces
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Attendance System
```

### Gmail Configuration Summary
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=your-gmail@gmail.com
EMAIL_FROM_NAME=Attendance System
```

---

## OPTION 2: Outlook / Hotmail

### Step-by-Step Setup

#### 1. Enable 2FA (Required for SMTP)
1. Go to: https://account.microsoft.com/security
2. Click **"Advanced security options"**
3. Under **"Additional security"**, click **"Turn on"** for 2FA
4. Follow the prompts to set up 2FA

#### 2. Enable SMTP Authentication
1. Go to: https://outlook.live.com/mail/
2. Click **Settings** (gear icon) → **"View all Outlook settings"**
3. Go to **"Mail"** → **"Sync email"**
4. Find **"POP and IMAP"** section
5. Make sure **"Let devices and apps use POP"** is enabled
6. Save changes

#### 3. Configure .env File
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-outlook-password  # Your actual password
EMAIL_FROM=your-email@outlook.com
EMAIL_FROM_NAME=Attendance System
```

### Outlook Configuration Summary
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-outlook-password
EMAIL_FROM=your-email@outlook.com
EMAIL_FROM_NAME=Attendance System
```

---

## OPTION 3: SendGrid (Professional - Best for Production)

### Step-by-Step Setup

#### 1. Create SendGrid Account
1. Go to: https://signup.sendgrid.com/
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

#### 2. Create API Key
1. Login to SendGrid Dashboard
2. Go to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Enter name: "Attendance System"
5. Select **"Full Access"** or **"Mail Send"** only
6. Click **"Create & View"**
7. **IMPORTANT**: Copy the API key (starts with `SG.`)
8. You can only see this once!

#### 3. Verify Sender Email
1. Go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill in your details:
   - From Email: your-email@yourdomain.com
   - From Name: Attendance System
   - Reply To: your-email@yourdomain.com
4. Click **"Create"**
5. Check your email and click verification link

#### 4. Configure .env File
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey  # Literally the word "apikey"
EMAIL_PASS=SG.your-actual-api-key-here
EMAIL_FROM=your-verified-sender@yourdomain.com
EMAIL_FROM_NAME=Attendance System
```

### SendGrid Configuration Summary
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=verified-sender@yourdomain.com
EMAIL_FROM_NAME=Attendance System
```

---

## OPTION 4: Mailgun (Alternative Professional Service)

### Step-by-Step Setup

#### 1. Create Mailgun Account
1. Go to: https://signup.mailgun.com/
2. Sign up (500 emails/month free)
3. Verify your email

#### 2. Get SMTP Credentials
1. Login to Mailgun Dashboard
2. Go to **Sending** → **Domain settings**
3. Select your domain (or use sandbox domain for testing)
4. Click **"SMTP"** tab
5. Note down:
   - Hostname: smtp.mailgun.org
   - Port: 587
   - Username: postmaster@your-domain.mailgun.org
   - Password: (click "Reset password" if needed)

#### 3. Configure .env File
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-password
EMAIL_FROM=postmaster@your-domain.mailgun.org
EMAIL_FROM_NAME=Attendance System
```

### Mailgun Configuration Summary
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-smtp-password
EMAIL_FROM=postmaster@your-domain.mailgun.org
EMAIL_FROM_NAME=Attendance System
```

---

## OPTION 5: Custom SMTP Server

If you have your own SMTP server:

```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Attendance System
```

---

## 🧪 Testing Email Configuration

### Method 1: Test in Code

Create a test file `backend/test-email.js`:

```javascript
require('dotenv').config();
const { testEmailConfig, sendOTPEmail } = require('./services/emailService');

async function test() {
  console.log('Testing email configuration...');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  
  // Test connection
  const configTest = await testEmailConfig();
  console.log('Connection test:', configTest);
  
  if (configTest.success) {
    // Try sending a test email
    console.log('\nSending test OTP email...');
    const result = await sendOTPEmail(
      'your-test-email@example.com',  // Change this!
      'Test User',
      '123456',
      5,
      'password_reset'
    );
    console.log('Send result:', result);
  }
}

test();
```

Run the test:
```bash
cd backend
node test-email.js
```

### Method 2: Test via API

1. Start your backend server:
```bash
cd backend
npm run dev
```

2. Use the forgot password endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

3. Check your email for the OTP

---

## 🔧 Common Issues & Solutions

### Issue 1: "Invalid login" or "Authentication failed"

**For Gmail:**
- Make sure 2FA is enabled
- Use App Password, NOT your regular password
- Remove spaces from the 16-character app password

**For Outlook:**
- Enable "Let devices and apps use POP"
- Make sure 2FA is enabled
- Use your actual account password

**For SendGrid/Mailgun:**
- Double-check your API key
- Make sure sender email is verified
- Check if you've hit your sending limit

### Issue 2: "Connection refused" or "ECONNREFUSED"

**Solutions:**
- Check if PORT is correct (587 for TLS, 465 for SSL)
- Make sure your firewall isn't blocking SMTP ports
- Try changing from PORT 587 to 465 (and vice versa)
- Check if your hosting provider blocks SMTP

### Issue 3: "Self-signed certificate" error

Add to your `.env`:
```env
NODE_TLS_REJECT_UNAUTHORIZED=0
```

**Warning**: Only use this in development! In production, fix the SSL certificates.

### Issue 4: Emails going to Spam

**Solutions:**
- Add SPF, DKIM, and DMARC records to your domain
- Use a professional service (SendGrid, Mailgun)
- Avoid spammy words in subject/content
- Verify your sender email domain

### Issue 5: "Daily sending quota exceeded"

**Solutions:**
- Gmail free: Limited to ~100 emails/day
- Outlook free: Limited to ~100 emails/day
- SendGrid free: 100 emails/day
- Mailgun free: 500 emails/month

**Solution**: Upgrade to paid plan or use a different service

---

## 📊 Service Comparison

| Service | Free Tier | Reliability | Setup Difficulty | Best For |
|---------|-----------|-------------|------------------|----------|
| **Gmail** | ~100/day | Good | Easy | Development/Testing |
| **Outlook** | ~100/day | Good | Easy | Development/Testing |
| **SendGrid** | 100/day | Excellent | Medium | Production |
| **Mailgun** | 500/month | Excellent | Medium | Production |
| **Custom SMTP** | Unlimited* | Varies | Hard | Enterprise |

*Subject to your server limits

---

## 🎯 Recommended Configuration

### For Development/Testing:
**Use Gmail** - Easiest to set up, good enough for testing

### For Production (Small Scale):
**Use SendGrid** - Professional, reliable, 100 emails/day free

### For Production (Medium/Large Scale):
**Use SendGrid or Mailgun Paid Plan** - Best deliverability, analytics

---

## 📝 Final Checklist

- [ ] Created email account (Gmail/Outlook) or service account (SendGrid/Mailgun)
- [ ] Enabled 2FA (if required)
- [ ] Generated App Password or API Key
- [ ] Added all EMAIL_* variables to backend/.env
- [ ] Removed spaces from EMAIL_PASS
- [ ] Tested email sending with test script
- [ ] Verified OTP emails are delivered
- [ ] Checked spam folder
- [ ] Emails have nice formatting (HTML templates)

---

## 🆘 Still Having Issues?

1. **Check backend console** for error messages
2. **Verify .env file** - Make sure no typos
3. **Test SMTP directly** - Use an online SMTP tester
4. **Check email service status** - Gmail/Outlook might be down
5. **Try a different service** - If one doesn't work, try another

---

## 📧 Sample .env File (Complete)

```env
# Database Configuration
DB_HOST=your-neon-host.neon.tech
DB_PORT=5432
DB_NAME=attendance_db
DB_USER=your-username
DB_PASSWORD=your-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend.vercel.app

# Email Configuration - CHOOSE ONE OPTION BELOW:

# OPTION 1: Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM=your-gmail@gmail.com
EMAIL_FROM_NAME=Attendance System

# OPTION 2: SendGrid (Uncomment if using)
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_USER=apikey
# EMAIL_PASS=SG.your-sendgrid-api-key
# EMAIL_FROM=verified@yourdomain.com
# EMAIL_FROM_NAME=Attendance System
```

---

## ✅ You're Done!

Once configured correctly, your system will:
- ✅ Send OTPs for password resets
- ✅ Send OTPs for password changes
- ✅ Use beautiful HTML email templates
- ✅ Include expiry time and security notices
- ✅ Work immediately without server restart

**Note**: Changes to OTP settings (expiry, attempts, etc.) can be managed from the Admin OTP Settings page after this is set up!
