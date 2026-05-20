# ChurnSentry MVP - Deployment Guide

This guide walks you through deploying the Customer Churn Predictor application to production.

---

## 📋 Table of Contents

1. [Local Development](#local-development)
2. [Deployment Options](#deployment-options)
3. [Option 1: Render.com](#option-1-rendercom-recommended)
4. [Option 2: Railway.app](#option-2-railwayapp)
5. [Option 3: Vercel + External Backend](#option-3-vercel--external-backend)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Checklist](#post-deployment-checklist)
8. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites

- Node.js 18+ (download from https://nodejs.org)
- npm or yarn
- Git (for cloning from GitHub)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/customer-churn-predictor.git
cd customer-churn-predictor

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env

# 4. (Optional) Add your Gemini API key
# Edit .env and add: GEMINI_API_KEY=your_key_here

# 5. Run development server
npm run dev

# 6. Open browser
# Navigate to http://localhost:3000
```

### Default Test Credentials

- **Email:** `admin@churnpredictor.com`
- **Password:** `admin123`

---

## Deployment Options

| Platform | Cost | Setup Time | Pros | Cons |
|----------|------|-----------|------|------|
| **Render** | Free tier available | 5 min | Simple, GitHub integration, auto-deploy | Limited free resources |
| **Railway** | Pay-as-you-go | 5 min | Clean UI, fast deployment | Requires payment method |
| **Vercel + Backend** | Free (frontend) | 15 min | Optimal performance for frontend | Separate backend setup needed |

---

## Option 1: Render.com (Recommended)

### Step-by-Step

#### 1. Push to GitHub

```bash
# Initialize git if not already
git init
git add .
git commit -m "Initial commit: ChurnSentry MVP"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/customer-churn-predictor.git
git branch -M main
git push -u origin main
```

#### 2. Create Render Account

1. Visit https://render.com
2. Sign up with GitHub account (or email)
3. Authorize Render to access your GitHub repositories

#### 3. Create Web Service

1. Go to Dashboard → **New Web Service**
2. Connect your GitHub repository
3. Fill in the following:
   - **Name:** `churnpredictor` (or your chosen name)
   - **Environment:** `Node`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

#### 4. Add Environment Variables

Click **Environment** tab and add:

```
NODE_ENV=production
JWT_SECRET=your-strong-random-secret-min-32-chars
GEMINI_API_KEY=your-gemini-key-or-leave-blank
PORT=10000
```

> **Note:** Render assigns a port automatically. Keep `PORT=10000` or it will override.

#### 5. Deploy

Click **Create Web Service** → Render automatically deploys from GitHub.

Monitor the deploy log in **Logs** tab. Success typically takes 2-3 minutes.

#### 6. Get Your URL

Once deployed, Render assigns a URL like:
```
https://churnpredictor.onrender.com
```

---

## Option 2: Railway.app

### Step-by-Step

#### 1. Push to GitHub (same as Render)

#### 2. Create Railway Account

1. Visit https://railway.app
2. Sign up with GitHub
3. Connect your GitHub account

#### 3. Create New Project

1. Dashboard → **New Project** → **Deploy from GitHub repo**
2. Select your `customer-churn-predictor` repository
3. Railway auto-detects Node.js and `package.json`

#### 4. Configure Environment Variables

1. Click on the deployment → **Variables**
2. Add:

```
NODE_ENV=production
JWT_SECRET=your-strong-random-secret-min-32-chars
GEMINI_API_KEY=your-gemini-key-or-leave-blank
```

#### 5. Monitor Deployment

Railway auto-deploys on GitHub push. Check **Deployments** tab for status.

#### 6. Get Your URL

Railway assigns a public URL automatically:
```
https://churnpredictor-production.up.railway.app
```

---

## Option 3: Vercel + External Backend

Use this if you want optimized frontend hosting + separate backend server.

### Part A: Deploy Backend to Render/Railway

(Follow Option 1 or 2 above to deploy the full app to Render/Railway)

### Part B: Deploy Frontend to Vercel

#### 1. Create Vercel Account

Visit https://vercel.com and sign up with GitHub.

#### 2. Create New Project

1. New Project → Import Git Repository
2. Select `customer-churn-predictor`
3. Configure:
   - **Framework:** Vite
   - **Root Directory:** `.` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

#### 3. Add Environment Variables

```
VITE_API_URL=https://your-backend-render.onrender.com
```

> This tells the frontend where the API is located.

#### 4. Deploy

Click **Deploy** → Vercel builds and deploys automatically.

#### 5. Update Frontend Code

In `src/App.tsx` and other files, replace hardcoded API calls:

```typescript
// Before (assumes API on same domain)
fetch("/api/auth/login", ...)

// After (uses environment variable)
fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, ...)
```

> Note: Requires code updates. Simpler to use Option 1 or 2.

---

## Environment Variables

### Required

```env
# Server
NODE_ENV=production          # Set to "production" for deployment
JWT_SECRET=your-secret       # Strong random string (min 32 chars)

# Gemini AI (Optional - uses fallback if not set)
GEMINI_API_KEY=your-key      # Get from https://makersuite.google.com/app/apikey
```

### Optional

```env
# Database (defaults to JSON, can use PostgreSQL)
DATABASE_TYPE=json
DATABASE_URL=postgresql://...

# Port (Render/Railway auto-assign, usually safe to omit)
PORT=3000

# CORS
CORS_ORIGIN=https://your-domain.com
```

### Generating Strong JWT_SECRET

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## Post-Deployment Checklist

### ✅ After deploying to production:

- [ ] **Change admin password**
  - Login with `admin@churnpredictor.com` / `admin123`
  - Go to Settings → Profile
  - Set new password

- [ ] **Update JWT_SECRET**
  - Generate new secret: `openssl rand -base64 32`
  - Update environment variable on Render/Railway
  - Redeploy or restart service

- [ ] **Add custom domain** (optional)
  - Render: Settings → Custom Domain → Add domain
  - Railway: Settings → Domain → Add domain
  - Update DNS records accordingly

- [ ] **Enable HTTPS** (automatic on Render/Railway)

- [ ] **Set up monitoring** (optional)
  - Render: Alerts tab → Configure notifications
  - Railway: Infrastructure → Monitoring

- [ ] **Test all features**
  - Login/logout
  - Make predictions
  - Train model
  - Export data
  - Check admin logs

- [ ] **Add Gemini API key** (if using)
  - Get key: https://makersuite.google.com/app/apikey
  - Add to environment variables
  - Restart service

---

## Troubleshooting

### Application won't start

**Error:** `Cannot find module 'express'`

**Solution:** Ensure `npm install` ran successfully during build. Check build logs.

### API returns 401 Unauthorized

**Error:** `Access denied. Authentication token required.`

**Solution:** 
- Clear browser cookies/localStorage
- Login again
- Ensure JWT_SECRET is consistent (redeploy if changed)

### Predictions endpoint returns 500

**Error:** `The core machine learning classifier hasn't been trained`

**Solution:**
- Train model first: Navigate to "Train Pipeline" tab
- Model metrics should appear in Dashboard

### CORS errors in browser console

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Check that backend and frontend URLs match
- Update CORS_ORIGIN environment variable
- Restart backend service

### Database file not found

**Error:** `ENOENT: no such file or directory, open 'data/db.json'`

**Solution:**
- Data directory auto-creates on first run
- Check file permissions on server
- Render/Railway should auto-resolve this

### Gemini API errors

**Error:** `Failed to initialize Gemini SDK`

**Solution:**
- Verify `GEMINI_API_KEY` is set correctly
- Check API key from: https://makersuite.google.com/app/apikey
- Application uses fallback recommendations if key invalid

---

## Scaling & Production Improvements

### Current Limitations (MVP)

- Uses JSON file for database (not suitable for >10k records)
- No caching layer (every request hits database)
- ML model stored in memory (resets on restart)
- No background job queue
- No rate limiting

### Production Upgrades

1. **Database:**
   ```bash
   # Replace JSON with PostgreSQL
   npm install pg
   # Update DATABASE_URL in .env
   ```

2. **Caching:**
   ```bash
   npm install redis
   # Add Redis layer for frequently accessed data
   ```

3. **Background Jobs:**
   ```bash
   npm install bull
   # Use for async model training, email notifications
   ```

4. **Rate Limiting:**
   ```bash
   npm install express-rate-limit
   # Add to server.ts
   ```

5. **Monitoring:**
   - Add Sentry (error tracking)
   - Add New Relic (performance monitoring)
   - Set up log aggregation (LogRocket, Datadog)

---

## Performance Tuning

### Render/Railway Settings

For better performance on free/cheap tiers:

1. **Increase memory:** Upgrade to at least 512MB RAM
2. **Enable auto-scaling:** Let platform scale based on traffic
3. **Set up CDN:** Use Cloudflare for static assets
4. **Optimize bundle:** Reduce gzipped size below 500KB

### Frontend Optimization

Already included:
- ✅ Code splitting with Vite
- ✅ Component lazy loading
- ✅ Image optimization
- ✅ CSS optimization (Tailwind)

### API Optimization

Consider:
- Add response caching headers
- Paginate endpoints (already done)
- Compress responses (gzip)

---

## Custom Domain Setup

### Using Render

1. **Buy domain** from Namecheap, GoDaddy, etc.
2. **Go to Render Dashboard:**
   - Select your service
   - Settings → Custom Domain
   - Add your domain

3. **Update DNS records** at your domain registrar:
   - **Type:** CNAME
   - **Name:** (leave blank or @)
   - **Value:** `your-service-name.onrender.com`

4. **Wait for DNS propagation** (5-30 minutes)

### Using Railway

Similar process:
1. Settings → Domains → Add Domain
2. Update DNS CNAME to Railway-assigned URL

---

## Backup & Recovery

### Backup Your Data

```bash
# Download database file from deployed server
scp user@your-server:/app/data/db.json ./backup-$(date +%s).json
```

### Restore from Backup

1. Upload backup file to `/data/db.json`
2. Restart application
3. Verify data is restored

---

## Getting Help

- **GitHub Issues:** Report bugs at https://github.com/yourusername/customer-churn-predictor/issues
- **Community:** Ask questions on [Dev.to](https://dev.to), Reddit, Stack Overflow
- **Documentation:** Refer to [README.md](README.md) for usage instructions

---

**Deployed successfully? Congratulations! 🎉**

Share your project with others and get feedback. Consider these next steps:
- Add it to your portfolio
- Share on GitHub trending
- Use in job applications
- Demo for potential clients/investors

---
