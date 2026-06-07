# ✅ DEPLOYMENT CHECKLIST

Print this page and check off each step as you complete it!

---

## PHASE 1: PREPARE PROJECT (10 min)

- [ ] Created `.gitignore` file with `node_modules/` entry
- [ ] Removed node_modules from Git: `git rm -r --cached node_modules`
- [ ] Verified `git status` shows NO node_modules
- [ ] Created `.env.example` files (don't commit actual .env)

## PHASE 2: GITHUB (5 min)

- [ ] Initialized Git: `git init`
- [ ] Added files: `git add .`
- [ ] Committed: `git commit -m "Initial commit"`
- [ ] Created GitHub repository
- [ ] Pushed code: `git push -u origin main`
- [ ] Verified NO node_modules in GitHub

## PHASE 3: RAILWAY DATABASE (10 min)

- [ ] Created Railway account (railway.app)
- [ ] Created "New Project"
- [ ] Provisioned PostgreSQL
- [ ] Copied database credentials:
  - [ ] PGHOST
  - [ ] PGPORT
  - [ ] PGDATABASE
  - [ ] PGUSER
  - [ ] PGPASSWORD
- [ ] Imported schema using Data tab or psql

## PHASE 4: RAILWAY BACKEND (10 min)

- [ ] Added GitHub repo to Railway
- [ ] Set Root Directory to `backend`
- [ ] Added environment variables:
  - [ ] DB_HOST
  - [ ] DB_PORT
  - [ ] DB_NAME
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] JWT_SECRET
  - [ ] JWT_EXPIRE
  - [ ] PORT
  - [ ] NODE_ENV
  - [ ] FRONTEND_URL (temp value)
- [ ] Deployment completed successfully
- [ ] Generated domain
- [ ] Copied backend URL
- [ ] Tested: `/api/health` returns success

## PHASE 5: VERCEL FRONTEND (10 min)

- [ ] Created Vercel account (vercel.com)
- [ ] Imported GitHub repository
- [ ] Set Framework: Create React App
- [ ] Set Root Directory: `frontend`
- [ ] Added environment variable:
  - [ ] REACT_APP_API_URL = `https://backend-url.railway.app/api`
- [ ] Clicked Deploy
- [ ] Deployment completed successfully
- [ ] Copied Vercel URL
- [ ] Frontend loads in browser

## PHASE 6: CONNECT (5 min)

- [ ] Updated `FRONTEND_URL` in Railway backend
- [ ] Railway auto-redeployed
- [ ] Tested login - works!

## PHASE 7: ADMIN ACCOUNT (5 min)

- [ ] Created admin account via Railway Data tab
- [ ] Tested admin login
- [ ] Can access admin dashboard

## PHASE 8: INITIAL SETUP (10 min)

- [ ] Set office GPS coordinates
- [ ] Set working hours
- [ ] Added at least one employee
- [ ] Added holidays (optional)

## PHASE 9: TESTING (10 min)

Admin:
- [ ] Login works
- [ ] Dashboard shows stats
- [ ] Employee list visible
- [ ] Can add/edit employees
- [ ] PDF download works
- [ ] Excel download works

Employee:
- [ ] Login works
- [ ] Dashboard visible
- [ ] Check-in works (with location)
- [ ] Check-out works
- [ ] Attendance history visible

## SECURITY (Important!)

- [ ] Changed default admin password
- [ ] Set strong JWT_SECRET
- [ ] Verified .env NOT in GitHub
- [ ] Tested on mobile device
- [ ] HTTPS working (automatic)

---

## YOUR LIVE URLS

Write them here for easy reference:

**Frontend:**
```
https://_____________________________.vercel.app
```

**Backend:**
```
https://_____________________________.railway.app
```

**Database:**
```
Railway PostgreSQL (internal)
```

---

## ADMIN CREDENTIALS

**Username:** _______________

**Password:** _______________

(Keep this secure!)

---

## NOTES

Any issues or things to remember:

```
_________________________________________________

_________________________________________________

_________________________________________________

_________________________________________________
```

---

✅ **All checked off? Congratulations, you're LIVE!**
