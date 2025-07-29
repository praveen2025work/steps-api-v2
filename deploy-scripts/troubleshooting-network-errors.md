# Troubleshooting Network Errors in IIS Deployment

## Common Issue: Network Errors Due to Endpoint Configuration

### Problem
After deploying to IIS, you're getting network errors because the application is still trying to connect to localhost or incorrect API endpoints.

### Root Cause
In Next.js static export, **environment variables are baked into the build at build time**. Simply placing environment variables on the server after building won't work.

### Solution Steps

#### 1. Update API Endpoints
Edit `deploy-scripts/.env.production` with your actual API endpoints:

```env
# Replace these with your actual API servers
NEXT_PUBLIC_BASE_URL=https://your-actual-dotnet-api-server.com
NEXT_PUBLIC_JAVA_BASE_URL=https://your-actual-java-api-server.com
NEXT_PUBLIC_FORCE_REAL_API=true
NEXT_PUBLIC_API_ENVIRONMENT=prod
```

#### 2. Rebuild with Correct Environment Variables
You MUST rebuild after updating the environment variables:

**Option A: Use the automated script (Recommended)**
```bash
deploy-scripts\build-for-iis.bat
```

**Option B: Use PowerShell script**
```powershell
.\deploy-scripts\build-for-iis.ps1
```

**Option C: Manual rebuild**
```bash
# Copy environment file to root
copy deploy-scripts\.env.production .env.production

# Rebuild
npm run build

# Clean up
del .env.production
```

#### 3. Redeploy to IIS
- Delete old files from IIS directory
- Copy new files from `out` folder to IIS directory
- Copy `deploy-scripts\web.config` to IIS directory

### Verification Steps

#### 1. Check Built Files
After building, you can verify the environment variables were baked in by checking the built files in the `out` folder.

#### 2. Test API Connectivity
1. Open your application in IIS
2. Go to `/admin?tab=api-environments`
3. Test the connection to verify endpoints are correct

#### 3. Check Browser Network Tab
1. Open browser developer tools (F12)
2. Go to Network tab
3. Refresh the page
4. Check if API calls are going to the correct endpoints

### Common Mistakes

❌ **Wrong:** Updating environment variables after building
❌ **Wrong:** Only updating `.env.local` or `.env.prod` in root directory
❌ **Wrong:** Expecting server-side environment variables to work in static export

✅ **Correct:** Update `deploy-scripts/.env.production` then rebuild
✅ **Correct:** Use the build scripts that copy environment variables before building
✅ **Correct:** Redeploy the entire `out` folder after rebuilding

### Quick Fix Checklist

- [ ] Updated `deploy-scripts/.env.production` with correct API URLs
- [ ] Ran `deploy-scripts\build-for-iis.bat` to rebuild
- [ ] Copied new `out` folder contents to IIS directory
- [ ] Copied `deploy-scripts\web.config` to IIS directory
- [ ] Tested API connectivity in admin panel

### Environment Variable Priority

In Next.js static export, environment variables are resolved in this order:
1. `.env.production` (during build)
2. `.env.local` (during build)
3. `.env` (during build)
4. System environment variables (during build)

**Important:** Server-side environment variables are NOT available in static export builds.

### API Endpoint Configuration

Your application uses two types of APIs:

**Core API (.NET Service):**
- Handles: Applications, Roles, Calendars, Hierarchy
- Environment Variable: `NEXT_PUBLIC_BASE_URL`
- Default Path: `/api/WF`

**Java API (Java Service):**
- Handles: Metadata, Stages, Parameters, Email Templates
- Environment Variable: `NEXT_PUBLIC_JAVA_BASE_URL`
- Default Path: `/api`

Make sure both endpoints are correctly configured in your environment file.

### Testing Your Configuration

After deployment, test these URLs in your browser:
- `https://your-iis-site/admin?tab=api-environments` - Test API connectivity
- `https://your-iis-site/workflow-inbox` - Test main application functionality

If you see network errors, check the browser console and network tab to see which endpoints are failing.