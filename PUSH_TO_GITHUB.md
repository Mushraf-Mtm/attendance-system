# Push to GitHub Commands

## 🚀 Quick Push Commands

Run these commands in your terminal (Command Prompt or Git Bash):

```bash
# Navigate to project folder
cd C:\Project-attendance

# Stage all changes
git add .

# Commit with message
git commit -m "Added password reset feature with OTP email verification"

# Push to GitHub
git push origin main
```

If you get an error about branch name, try:
```bash
git push origin master
```

---

## 📋 Alternative: Step by Step

### 1. Check current status
```bash
git status
```

### 2. Stage specific files (if you don't want to add everything)
```bash
git add backend/
git add frontend/
git add *.md
```

### 3. Commit with descriptive message
```bash
git commit -m "feat: password management system with OTP email verification

- Added password reset with OTP via email
- Added change password for logged-in users
- Added email service with Nodemailer
- Added OTP service with rate limiting and cooldown
- Added audit logging for security events
- Added admin OTP settings page
- Made entire frontend mobile responsive
- Database migration for password management tables"
```

### 4. Push to GitHub
```bash
git push origin main
```

---

## ⚠️ If This is First Push

If you haven't initialized git yet:

```bash
cd C:\Project-attendance

# Initialize git repository
git init

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Stage all files
git add .

# Commit
git commit -m "Initial commit: Attendance Management System with password reset feature"

# Push to main branch
git branch -M main
git push -u origin main
```

---

## 🔍 Common Issues

### Issue: "git not recognized"
**Solution**: Install Git from https://git-scm.com/download/win

### Issue: "Permission denied"
**Solution**: Configure Git credentials:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Issue: "Updates were rejected"
**Solution**: Pull first, then push:
```bash
git pull origin main --rebase
git push origin main
```

---

## ✅ After Successful Push

Your code is now on GitHub! Next steps:

1. **Deploy Backend** to Render/Railway/Heroku
2. **Deploy Frontend** to Vercel
3. **Add environment variables** (see DEPLOYMENT_ENVIRONMENT_VARIABLES.md)
4. **Run database migration** in Neon SQL Editor
5. **Test the application**

---

## 📝 Files Cleaned Up

The following test files were automatically deleted:
- ✅ `backend/test-nodemailer.js`
- ✅ `backend/test-email-import.js`
- ✅ `backend/services/emailServiceNew.js` (renamed to emailService.js)

Your project is clean and ready for deployment! 🎉
