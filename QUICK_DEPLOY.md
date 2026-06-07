# 🚀 Quick Deploy Guide - 15 Minutes

## Prerequisites
- GitHub account
- Railway account (free)
- Vercel account (free)

---

## 🎯 Step-by-Step (Copy-Paste Ready)

### Step 1: Push to GitHub (2 min)

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create GitHub repo and push
# Go to github.com, create new repo "attendance-system"
git remote add origin https://github.com/YOUR_USERNAME/attendance-system.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Database on Railway (3 min)

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Provision PostgreSQL"
4. Click on PostgreSQL service
5. Go to "Variables" tab
6. **COPY THESE VALUES** (you'll need them):
   - DATABASE_URL
   - PGDATABASE  
   - PGHOST
   - PGPASSWORD
   - PGPORT
   - PGUSER

### Step 3: Import Database Schema (2 min)

1. In Railway PostgreSQL, click "Data" tab
2. Click "Connect"
3. Use Railway CLI or web terminal:
   ```bash
   # Copy-paste your schema from backend/config/schema.sql
   # Or use Railway CLI:
   railway link
   railway run psql < backend/config/schema.sql
   ```

### Step 4: Deploy Backend on Railway (3 min)

1. In Railway, click "New" → "GitHub Repo"
2. Select your attendance-system repo
3. Railway auto-detects Node.js
4. Click "Settings" → "Root Directory" → Set to `backend`
5. Go to "Variables" tab, add these:
   ```
   DB_HOST = (PGHOST from Step 2)
   DB_PORT = (PGPORT from Step 2)  
   DB_NAME = (PGDATABASE from Step 2)
   DB_USER = (PGUSER from Step 2)
   DB_PASSWORD = (PGPASSWORD from Step 2)
   JWT_SECRET = any-random-long-string-change-this
   JWT_EXPIRE = 24h
   PORT = 5000
   NODE_ENV = production
   FRONTEND_URL = https://your-app.vercel.app (update after Step 5)
   ```
6. Click "Deploy"
7. **COPY YOUR BACKEND URL** (e.g., `https://attendance-backend-production.railway.app`)

### Step 5: Deploy Frontend on Vercel (3 min)

**Option A: Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Configure:
   - Framework: Create React App
   - Root Directory: `frontend`  
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add Environment Variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://YOUR-BACKEND-URL.railway.app/api` (from Step 4)
5. Click "Deploy"
6. Wait 2-3 minutes
7. **COPY YOUR FRONTEND URL**

**Option B: Vercel CLI** (faster)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# When prompted:
# - Set up and deploy? Y
# - Which scope? [Select your account]
# - Link to existing project? N  
# - Project name? attendance-system
# - In which directory? ./
# - Override settings? N

# Add environment variable
vercel env add REACT_APP_API_URL production
# Enter: https://YOUR-BACKEND-URL.railway.app/api

# Deploy to production
vercel --prod
```

### Step 6: Update Backend CORS (1 min)

1. Go back to Railway → Your Backend Service
2. Go to "Variables"
3. Update `FRONTEND_URL` to your Vercel URL
4. Railway will auto-redeploy

### Step 7: Test Your Deployment (1 min)

1. Open your Vercel URL
2. Try logging in:
   - Admin: username/password from your database
   - Employee: employee credentials

---

## 🎉 Done!

Your app is now live at:
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.railway.app

---

## ⚠️ If Something Doesn't Work

### CORS Error?
- Check FRONTEND_URL in Railway backend matches your Vercel URL exactly
- Redeploy backend after updating

### Can't Connect to API?
- Verify REACT_APP_API_URL in Vercel includes `/api` at the end
- Check backend is running (visit backend URL directly)

### Database Error?
- Verify all DB_ environment variables are correct
- Check PostgreSQL is running in Railway

### Still Stuck?
- Check deployment logs in Railway/Vercel dashboards
- See full DEPLOYMENT_GUIDE.md for detailed troubleshooting
