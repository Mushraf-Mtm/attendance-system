# 🚀 Attendance System Deployment Guide

## 📋 Architecture Overview

Your attendance system has two parts:
1. **Frontend (React)** - Can be deployed to Vercel
2. **Backend (Node.js + Express + PostgreSQL)** - Needs a separate host

---

## ⚠️ IMPORTANT: Vercel Limitations

**Vercel is NOT suitable for:**
- ❌ Long-running Node.js servers
- ❌ WebSocket connections
- ❌ PostgreSQL database hosting
- ❌ Express.js REST APIs (as a standalone server)

**Vercel IS suitable for:**
- ✅ Static React/Next.js frontends
- ✅ Serverless functions (with limitations)

---

## 🎯 Recommended Deployment Strategy

### Option 1: **RECOMMENDED** - Separate Hosting

**Frontend → Vercel**  
**Backend → Railway/Render/Heroku**  
**Database → Railway/Render/Neon**

This is the best approach for your Express.js + PostgreSQL setup.

### Option 2: All-in-One Platform

**Frontend + Backend + Database → Railway/Render**

Easier setup but slightly more expensive.

---

## 📦 OPTION 1: Frontend on Vercel + Backend on Railway (RECOMMENDED)

### Part A: Deploy Database to Railway


#### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

#### Step 2: Create PostgreSQL Database
1. Click "Add Service" → "Database" → "PostgreSQL"
2. Railway will automatically provision a database
3. Click on the PostgreSQL service
4. Go to "Variables" tab
5. Copy these values:
   - `DATABASE_URL` (complete connection string)
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

#### Step 3: Import Database Schema
1. Download Railway CLI or use their web terminal
2. Connect to database:
   ```bash
   psql <YOUR_DATABASE_URL>
   ```
3. Run your schema:
   ```sql
   \i backend/config/schema.sql
   ```

---

### Part B: Deploy Backend to Railway

#### Step 1: Prepare Backend for Deployment

Create `backend/vercel.json` (actually for Railway):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

Update `backend/package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

#### Step 2: Create Environment Variables File

Create `backend/.env.production`:
```env
# Database (from Railway PostgreSQL)
DB_HOST=your-railway-db-host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (will be your Vercel URL)
FRONTEND_URL=https://your-app.vercel.app
```

#### Step 3: Update CORS in Backend

Update `backend/server.js`:
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### Step 4: Deploy Backend to Railway

1. In Railway dashboard, click "New Service" → "GitHub Repo"
2. Connect your GitHub account
3. Select your attendance project repository
4. Railway will auto-detect Node.js
5. Set "Root Directory" to `backend`
6. Add environment variables from your `.env.production`
7. Click "Deploy"


#### Step 5: Get Backend URL

After deployment:
1. Railway will provide a URL like: `https://your-backend.railway.app`
2. Copy this URL - you'll need it for the frontend

---

### Part C: Deploy Frontend to Vercel

#### Step 1: Update Frontend API URL

Update `frontend/src/services/api.js`:
```javascript
// Change this line:
const API_BASE_URL = 'http://localhost:5000/api';

// To:
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

#### Step 2: Create Frontend Environment File

Create `frontend/.env.production`:
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

#### Step 3: Update Frontend Build Configuration

Update `frontend/package.json` (should already have this):
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

#### Step 4: Create Vercel Configuration

Create `frontend/vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "@api-url"
  }
}
```

#### Step 5: Deploy to Vercel

**Option A: Using Vercel CLI**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? **Select your account**
   - Link to existing project? **N**
   - Project name? **attendance-system** (or your choice)
   - In which directory is your code? **./**
   - Want to override settings? **N**

6. Set environment variable:
   ```bash
   vercel env add REACT_APP_API_URL production
   ```
   Enter your Railway backend URL when prompted

7. Deploy to production:
   ```bash
   vercel --prod
   ```

**Option B: Using Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
5. Add Environment Variables:
   - `REACT_APP_API_URL` = `https://your-backend.railway.app/api`
6. Click "Deploy"

#### Step 6: Update Backend CORS with Vercel URL

Once deployed, go back to Railway backend:
1. Update `FRONTEND_URL` environment variable
2. Set it to your Vercel URL: `https://your-app.vercel.app`
3. Redeploy backend

---

## 📦 OPTION 2: Everything on Railway (Simpler)

### Step 1: Create Railway Project
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your attendance repository

### Step 2: Add PostgreSQL Database
1. Click "Add Service" → "Database" → "PostgreSQL"
2. Copy database credentials
3. Import your schema (using Railway CLI or web terminal)

### Step 3: Deploy Backend
1. Click "Add Service" → "GitHub Repo" → Select your repo
2. Set Root Directory: `backend`
3. Add environment variables:
   ```
   DB_HOST=<from Railway DB>
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=<from Railway DB>
   JWT_SECRET=your-secret-key
   JWT_EXPIRE=24h
   PORT=5000
   FRONTEND_URL=https://your-frontend.railway.app
   ```
4. Deploy

### Step 4: Deploy Frontend
1. Click "Add Service" → "GitHub Repo" → Select same repo
2. Set Root Directory: `frontend`
3. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```
4. Deploy

### Step 5: Configure Custom Domains (Optional)
1. Go to each service settings
2. Click "Generate Domain" or add custom domain
3. Update CORS and API URLs accordingly

---

## 📦 OPTION 3: Render.com (Alternative to Railway)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create PostgreSQL Database
1. Click "New" → "PostgreSQL"
2. Name: `attendance-db`
3. Copy Internal Database URL and External Database URL

### Step 3: Deploy Backend
1. Click "New" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name:** attendance-backend
   - **Root Directory:** backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Add environment variables (same as Railway)
5. Click "Create Web Service"

### Step 4: Deploy Frontend
1. Click "New" → "Static Site"
2. Connect your GitHub repo
3. Configure:
   - **Name:** attendance-frontend
   - **Root Directory:** frontend
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** build
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://attendance-backend.onrender.com/api
   ```
5. Click "Create Static Site"

---

## 🔧 Pre-Deployment Checklist

### Backend Changes Required

1. **Update CORS Configuration**
   
   File: `backend/server.js`
   ```javascript
   const cors = require('cors');
   
   const allowedOrigins = [
     process.env.FRONTEND_URL,
     'http://localhost:3000', // for local development
   ].filter(Boolean);
   
   app.use(cors({
     origin: function(origin, callback) {
       if (!origin || allowedOrigins.includes(origin)) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true
   }));
   ```

2. **Environment Variables Check**
   
   Ensure `.env` is in `.gitignore`:
   ```
   .env
   .env.local
   .env.production
   node_modules/
   ```

3. **Database Connection Pool**
   
   File: `backend/config/database.js` - Should already be correct:
   ```javascript
   const { Pool } = require('pg');
   
   const pool = new Pool({
     host: process.env.DB_HOST,
     port: process.env.DB_PORT,
     database: process.env.DB_NAME,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     ssl: process.env.NODE_ENV === 'production' ? {
       rejectUnauthorized: false
     } : false
   });
   ```

4. **Port Configuration**
   
   File: `backend/server.js`:
   ```javascript
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`🚀 Server running on port ${PORT}`);
   });
   ```

### Frontend Changes Required

1. **API Base URL**
   
   File: `frontend/src/services/api.js`:
   ```javascript
   const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
   ```

2. **Settings Configuration**
   
   Make sure settings are loaded from backend, not hardcoded:
   ```javascript
   // In components that use settings
   useEffect(() => {
     fetchSettings(); // Load from backend API
   }, []);
   ```

3. **Build Optimization**
   
   File: `frontend/package.json` should have:
   ```json
   {
     "homepage": ".",
     "scripts": {
       "build": "react-scripts build"
     }
   }
   ```

---

## 📁 Required Files to Create

### 1. Create `frontend/vercel.json`

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Create `backend/Procfile` (for Heroku/Railway)

```
web: node server.js
```

### 3. Create `backend/.env.example`

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=attendance_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 4. Create `frontend/.env.example`

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Update `.gitignore` in Root

```
# Environment variables
.env
.env.local
.env.production
.env.development

# Dependencies
node_modules/
*/node_modules/

# Build outputs
build/
dist/
.next/
out/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Temporary files
temp/
*.tmp

# Security
*.pem
*.key
```

---

## 🚀 Step-by-Step Deployment (RECOMMENDED PATH)

### Phase 1: Prepare Your Code (30 minutes)

1. **Update Backend CORS**
   ```bash
   cd backend
   ```
   
   Edit `server.js` to add proper CORS configuration (see above)

2. **Update Frontend API URL**
   ```bash
   cd ../frontend
   ```
   
   Edit `src/services/api.js` to use environment variable

3. **Create Configuration Files**
   ```bash
   # In frontend/
   touch vercel.json
   
   # In backend/
   touch Procfile
   ```
   
   Add content from "Required Files" section above

4. **Commit Changes to Git**
   ```bash
   cd ..
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Phase 2: Deploy Database (15 minutes)

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Copy database credentials
5. Use Railway CLI or web terminal to import schema:
   ```bash
   railway run psql < backend/config/schema.sql
   ```

### Phase 3: Deploy Backend (20 minutes)

1. In Railway, click "Add Service" → "GitHub Repo"
2. Select your repository
3. Set Root Directory: `backend`
4. Add environment variables:
   - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (from Railway DB)
   - JWT_SECRET (generate a random string)
   - JWT_EXPIRE = 24h
   - PORT = 5000
   - FRONTEND_URL (will update after frontend is deployed)
5. Click "Deploy"
6. Wait for deployment to complete
7. Copy the backend URL (e.g., `https://attendance-backend-production.railway.app`)

### Phase 4: Deploy Frontend (15 minutes)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - Framework: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add Environment Variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.railway.app/api`
6. Click "Deploy"
7. Wait for deployment
8. Copy the frontend URL (e.g., `https://attendance-system.vercel.app`)

### Phase 5: Update CORS (5 minutes)

1. Go back to Railway backend
2. Update environment variable:
   - FRONTEND_URL = `https://your-frontend.vercel.app`
3. Redeploy backend (it will auto-redeploy)

### Phase 6: Test Everything (15 minutes)

1. Open your Vercel frontend URL
2. Try admin login
3. Try employee login
4. Test check-in/check-out functionality
5. Verify attendance records are saved
6. Check admin dashboard

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error

**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:**
1. Check backend CORS configuration includes your Vercel URL
2. Ensure `FRONTEND_URL` environment variable is set correctly
3. Redeploy backend after changing CORS settings

### Issue 2: API Connection Failed

**Error:** `Network Error` or `Failed to fetch`

**Solution:**
1. Verify `REACT_APP_API_URL` is correct in Vercel
2. Check if backend is running (visit backend URL directly)
3. Ensure backend URL ends with `/api` in frontend env variable

### Issue 3: Database Connection Error

**Error:** `Error connecting to database`

**Solution:**
1. Check all database environment variables are correct
2. Ensure SSL is enabled for production:
   ```javascript
   ssl: {
     rejectUnauthorized: false
   }
   ```
3. Verify database is accessible from Railway backend

### Issue 4: JWT Token Issues

**Error:** `Invalid or expired token`

**Solution:**
1. Ensure `JWT_SECRET` is set in backend environment
2. Use same JWT_SECRET across all backend instances
3. Check JWT expiration time is reasonable

### Issue 5: Location Not Working

**Error:** `Location permission denied`

**Solution:**
- HTTPS is REQUIRED for geolocation API
- Vercel provides HTTPS by default
- Test on actual deployed URL, not localhost

### Issue 6: Build Fails on Vercel

**Error:** `Build failed`

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify `build` script exists in `package.json`
4. Check for any TypeScript or linting errors

### Issue 7: Environment Variables Not Working

**Error:** Variables undefined in production

**Solution:**
1. Vercel: Must start with `REACT_APP_`
2. Redeploy after adding environment variables
3. Check variables in Vercel dashboard → Settings → Environment Variables

---

## 💰 Pricing Comparison

### Railway
- **Free Tier:** 
  - $5/month credit (500 hours)
  - PostgreSQL included
  - Multiple services possible
- **Pro:** $20/month + usage
- **Best for:** Backend + Database

### Vercel
- **Free Tier:**
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic HTTPS
- **Pro:** $20/month per user
- **Best for:** Frontend only

### Render
- **Free Tier:**
  - 750 hours/month
  - Automatic sleep after 15 min inactivity
  - PostgreSQL free tier available
- **Starter:** $7/month
- **Best for:** All-in-one hosting

### Heroku
- **Eco:** $5/month
- **Basic:** $7/month
- **PostgreSQL:** Starts at $5/month
- **Best for:** Traditional applications

### Recommended Setup (Lowest Cost)
1. **Frontend:** Vercel (FREE)
2. **Backend:** Railway (FREE with $5 credit)
3. **Database:** Railway PostgreSQL (FREE with $5 credit)

**Total:** FREE for first month, then $5-10/month

---

## 🔒 Security Considerations for Production

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong, random JWT secrets
- ✅ Different secrets for production vs development

### 2. Database
- ✅ Enable SSL connections
- ✅ Use strong passwords
- ✅ Limit database access to backend only
- ✅ Regular backups (Railway/Render provide automatic backups)

### 3. CORS
- ✅ Only allow your frontend domain
- ✅ Don't use wildcard (*) in production

### 4. HTTPS
- ✅ Always use HTTPS (Vercel/Railway provide this automatically)
- ✅ Force HTTPS redirects

### 5. Rate Limiting
- ⚠️ Implement rate limiting (see security audit)
- ⚠️ Protect against DDoS attacks

### 6. Monitoring
- ✅ Set up error logging (Sentry, LogRocket)
- ✅ Monitor uptime (UptimeRobot, Pingdom)
- ✅ Track performance (Vercel Analytics, Railway metrics)

---

## 📚 Post-Deployment Tasks

### 1. Custom Domain (Optional)

**For Vercel Frontend:**
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `attendance.yourcompany.com`)
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificate

**For Railway Backend:**
1. Go to Railway → Your Service → Settings
2. Add custom domain
3. Update DNS records as instructed
4. Update frontend `REACT_APP_API_URL` to use custom domain

### 2. Create Admin Account

If database is fresh:
1. SSH into backend or use database client
2. Run:
   ```sql
   INSERT INTO admins (username, email, password) 
   VALUES ('admin', 'admin@yourcompany.com', '<bcrypt-hashed-password>');
   ```
3. Or use the `backend/utils/createAdmin.js` script

### 3. Add Initial Data

1. Import departments
2. Add employees
3. Configure settings (office location, working hours)
4. Add holidays for the year

### 4. Configure Settings

Via admin panel:
1. Set office GPS coordinates
2. Set allowed radius (meters)
3. Set working hours
4. Set late threshold time
5. Enable/disable check-in and check-out

### 5. Test All Features

- [ ] Admin login
- [ ] Employee login
- [ ] Check-in with location
- [ ] Check-out
- [ ] WFH permissions
- [ ] Early checkout permissions
- [ ] Holiday management
- [ ] Attendance reports (PDF/Excel)
- [ ] Employee management
- [ ] Settings updates

### 6. Monitor & Maintain

1. Check Railway/Vercel dashboards regularly
2. Monitor database usage
3. Review error logs
4. Keep dependencies updated
5. Regular database backups

---

## 📞 Support & Resources

### Documentation
- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs

### Community
- **Vercel Discord:** https://vercel.com/discord
- **Railway Discord:** https://discord.gg/railway

### Troubleshooting
- Check deployment logs in platform dashboard
- Use browser developer tools for frontend issues
- Check backend logs for API errors
- Test API endpoints directly with Postman

---

## ✅ Final Checklist

Before going live:

- [ ] All environment variables configured correctly
- [ ] CORS allows only your frontend domain
- [ ] Database schema imported successfully
- [ ] SSL/HTTPS enabled everywhere
- [ ] JWT secret is strong and unique
- [ ] Admin account created
- [ ] Sample data added (departments, employees)
- [ ] Settings configured (location, hours)
- [ ] All features tested end-to-end
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Team trained on the system
- [ ] Documentation updated with live URLs
- [ ] Security audit recommendations implemented (critical ones)

---

**🎉 Congratulations! Your attendance system is now live!**

For any issues, refer to the troubleshooting section or check the platform-specific documentation.
