# 🚀 IIS Deployment Steps - Quick Guide

## ⚠️ IMPORTANT: Environment Variables Must Be Set BEFORE Building

In Next.js static export, environment variables are **baked into the build**. You cannot change them after building.

## 📋 Step-by-Step Deployment Process

### Step 1: Update API Endpoints
1. Open `deploy-scripts/.env.production`
2. Replace placeholder URLs with your actual API servers:
   ```env
   NEXT_PUBLIC_BASE_URL=https://your-actual-dotnet-api-server.com
   NEXT_PUBLIC_JAVA_BASE_URL=https://your-actual-java-api-server.com
   ```

### Step 2: Build with Production Environment
Choose one of these options:

**Option A: Automated Batch Script (Windows)**
```bash
deploy-scripts\build-for-iis.bat
```

**Option B: PowerShell Script (Windows)**
```powershell
.\deploy-scripts\build-for-iis.ps1
```

**Option C: Manual Commands**
```bash
# Copy environment variables to root
copy deploy-scripts\.env.production .env.production

# Build the application
npm run build

# Clean up
del .env.production
```

### Step 3: Deploy to IIS Server
1. **Clear IIS directory** (remove old files)
2. **Copy `out` folder contents** to your IIS website directory
3. **Copy `deploy-scripts\web.config`** to your IIS website directory

### Step 4: Verify Deployment
1. Open your IIS website in browser
2. Navigate to `/admin?tab=api-environments`
3. Click "Test Connection" to verify API endpoints
4. Test main functionality at `/workflow-inbox`

## 🔧 If You Get Network Errors

### The Problem
You're getting network errors because the application is trying to connect to wrong endpoints (like localhost).

### The Solution
You **MUST rebuild** after updating environment variables:

1. ✅ Update `deploy-scripts/.env.production`
2. ✅ Run `deploy-scripts\build-for-iis.bat`
3. ✅ Redeploy the new `out` folder to IIS

### ❌ What Doesn't Work
- Updating environment variables after building
- Changing environment variables on the IIS server
- Expecting the application to pick up new environment variables without rebuilding

## 📁 File Structure After Build

```
out/                    ← Deploy this entire folder to IIS
├── index.html
├── _next/
│   ├── static/
│   └── ...
├── workflow-inbox/
├── admin/
└── ...

deploy-scripts/
├── web.config          ← Copy this to IIS directory
└── .env.production     ← Update this before building
```

## 🎯 Quick Troubleshooting

**Problem:** Network errors, API calls failing
**Solution:** Rebuild with correct environment variables

**Problem:** 404 errors on page refresh
**Solution:** Ensure `web.config` is in IIS directory and URL Rewrite Module is installed

**Problem:** Static files not loading
**Solution:** Check IIS permissions and MIME types

## 📞 Environment Variables Reference

Your application needs these environment variables:

```env
# Core API (.NET Service) - for applications, roles, calendars, hierarchy
NEXT_PUBLIC_BASE_URL=https://your-dotnet-api-server.com

# Java API Service - for metadata, stages, parameters
NEXT_PUBLIC_JAVA_BASE_URL=https://your-java-api-server.com

# Force real API calls (disable mock data)
NEXT_PUBLIC_FORCE_REAL_API=true

# Environment identifier
NEXT_PUBLIC_API_ENVIRONMENT=prod
```

## ✅ Success Checklist

- [ ] Updated `deploy-scripts/.env.production` with correct API URLs
- [ ] Ran build script: `deploy-scripts\build-for-iis.bat`
- [ ] Copied `out` folder contents to IIS directory
- [ ] Copied `web.config` to IIS directory
- [ ] Tested API connectivity at `/admin?tab=api-environments`
- [ ] Verified main application works at `/workflow-inbox`

---

**Remember:** Every time you change API endpoints, you must rebuild and redeploy!