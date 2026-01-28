# Vercel API Route Verification Guide

This guide helps you verify that your API routes are correctly recognized by Vercel and troubleshoot 307 redirect issues.

## Step 1: Verify Route Structure in Code

### ✅ Route File Location
Your API routes should be in the App Router format:
```
astrosetu/src/app/api/billing/subscription/route.ts
astrosetu/src/app/api/billing/subscription/verify-session/route.ts
```

**Status**: ✅ Correctly structured

### ✅ Route Exports
Each route file should export HTTP method handlers:
```typescript
export async function GET(req: Request) { ... }
export async function POST(req: Request) { ... }
```

**Status**: ✅ Already verified in code

### ✅ Runtime Configuration
Ensure routes have proper runtime config (prevents caching issues):
```typescript
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
```

**Status**: ✅ Already added to billing routes and vapid-public-key

---

## Step 2: Check Vercel Project Settings (Dashboard)

### 2.1 Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project (likely `astroSetu` or `astrosetu`)

### 2.2 Verify Project Settings
Navigate to: **Settings** → **General**

**Check these settings:**

#### Framework Preset
- Should be: **Next.js** (or auto-detected)
- If not, verify `package.json` has Next.js dependency

#### Build & Development Settings
- **Build Command**: Should be `npm run build` or `next build`
- **Output Directory**: Leave blank (Next.js handles this)
- **Install Command**: `npm install` or `yarn install`

#### Root Directory
- If your project is in a subdirectory (e.g., `astrosetu/`), set **Root Directory** to `astrosetu`
- Otherwise, leave blank

### 2.3 Check Environment Variables
Navigate to: **Settings** → **Environment Variables**

**Verify these are set:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Any other required env vars

**Important**: Make sure variables are set for **Production**, **Preview**, and **Development** environments as needed.

---

## Step 3: Verify API Routes in Vercel Deployment

### 3.1 Check Deployment Logs
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Check **Build Logs**

**Look for:**
```
✓ Compiled /api/billing/subscription/route
✓ Compiled /api/billing/subscription/verify-session/route
```

**If routes are missing**, the build logs will show warnings or errors.

### 3.2 Check Functions Tab
1. In the deployment view, click **Functions** tab
2. Look for your API routes listed:
   - `/api/billing/subscription`
   - `/api/billing/subscription/verify-session`
   - `/api/notifications/vapid-public-key`

**If routes are NOT listed**, they weren't recognized as API routes.

### 3.3 Check Function Logs
1. Click on a function (e.g., `/api/billing/subscription`)
2. Check **Logs** tab
3. Look for:
   - `[billing] / status=307` ← This indicates a redirect
   - Any error messages
   - Request/response details

---

## Step 4: Test API Routes Directly

### 4.1 Using cURL (Terminal)
Test each route to see actual HTTP responses:

```bash
# Test GET /api/billing/subscription
curl -v https://www.mindveda.net/api/billing/subscription

# Test POST /api/billing/subscription/verify-session
curl -v -X POST https://www.mindveda.net/api/billing/subscription/verify-session \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test"}'

# Test GET /api/notifications/vapid-public-key
curl -v https://www.mindveda.net/api/notifications/vapid-public-key
```

**What to look for:**
- Status code in response (should be 200, 400, or 500, NOT 307)
- Response body (should be JSON, not HTML)
- `Location` header (307 redirects include this)

### 4.2 Using Browser DevTools
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by `Fetch/XHR`
4. Navigate to a page that calls the API
5. Check the request/response:
   - **Status**: Should be 200/400/500, NOT 307
   - **Response**: Should be JSON, not HTML
   - **Headers**: Check if `Location` header exists (indicates redirect)

---

## Step 5: Check Vercel Configuration Files

### 5.1 Check `vercel.json`
Location: `astrosetu/vercel.json`

**Common issues:**
- `rewrites` or `redirects` that interfere with API routes
- `headers` that cause redirects
- `functions` config that overrides runtime settings

**What should be there:**
```json
{
  "rewrites": [],
  "redirects": [],
  "headers": []
}
```

Or leave file empty if not needed.

### 5.2 Check `next.config.mjs`
Location: `astrosetu/next.config.mjs`

**Check for:**
- `redirects()` that might intercept API routes
- `rewrites()` that might interfere
- Output configuration that affects API routes

**API routes should work with default Next.js config.**

---

## Step 6: Verify Middleware Configuration

### 6.1 Check `src/middleware.ts`
Ensure middleware doesn't redirect API routes:

**Current middleware should:**
- Allow static files (`/build.json`, `/sw.js`, `/offline.html`)
- Allow API routes to pass through
- Only apply rate limiting, not redirects

**Check for:**
- Any `NextResponse.redirect()` calls that might affect `/api/*` routes
- Any routing logic that intercepts API requests

---

## Step 7: Troubleshooting 307 Redirects

### 7.1 Common Causes

1. **Next.js Internal Redirect**
   - Next.js might redirect if route handler isn't properly exported
   - Solution: Ensure `export async function GET/POST` is correct

2. **Middleware Interference**
   - Middleware redirecting API requests
   - Solution: Check middleware.ts for API route exceptions

3. **Vercel Build Cache**
   - Old build artifacts causing routing issues
   - Solution: Clear build cache and redeploy

4. **Route Not Recognized**
   - File structure doesn't match Next.js App Router conventions
   - Solution: Verify file location and exports

### 7.2 Debugging Steps

1. **Add logging to route handlers:**
```typescript
export async function GET(req: Request) {
  console.log('[API] GET /api/billing/subscription called');
  console.log('[API] URL:', req.url);
  console.log('[API] Headers:', Object.fromEntries(req.headers.entries()));
  
  // ... rest of handler
}
```

2. **Check Vercel Function Logs:**
   - If logs show `[API] GET /api/billing/subscription called`, route is working
   - If logs don't show, route isn't being called (redirect happening earlier)

3. **Test with different HTTP methods:**
   - If GET works but POST doesn't (or vice versa), check exports

---

## Step 8: Quick Verification Checklist

Run through this checklist:

- [ ] Route files exist in correct location (`src/app/api/*/route.ts`)
- [ ] Route files export HTTP methods (`GET`, `POST`, etc.)
- [ ] Route files have `export const dynamic = 'force-dynamic'`
- [ ] Route files have `export const runtime = 'nodejs'`
- [ ] Vercel project is set to Next.js framework
- [ ] Root directory is correct (if project in subdirectory)
- [ ] Environment variables are set in Vercel
- [ ] Deployment logs show routes compiled successfully
- [ ] Functions tab shows API routes listed
- [ ] cURL test returns JSON (not HTML or 307 redirect)
- [ ] Browser DevTools shows status 200/400/500 (not 307)
- [ ] `vercel.json` doesn't have interfering rewrites/redirects
- [ ] Middleware doesn't redirect API routes

---

## Step 9: If Issues Persist

### Option A: Clear Vercel Cache
1. Go to **Settings** → **General**
2. Click **Clear Build Cache** (if available)
3. Redeploy

### Option B: Force Fresh Deployment
```bash
# In your local terminal
cd astrosetu
git commit --allow-empty -m "Force fresh deployment"
git push origin main
```

### Option C: Check Vercel Support
If routes still don't work after all checks:
1. Collect deployment logs
2. Collect function logs
3. Note the exact error/redirect behavior
4. Contact Vercel support with details

---

## Quick Test Commands

Run these in your terminal to quickly verify:

```bash
# Test from command line
curl -i https://www.mindveda.net/api/billing/subscription

# Should see:
# HTTP/1.1 200 OK (or 400/500 with JSON body)
# Content-Type: application/json

# NOT:
# HTTP/1.1 307 Temporary Redirect
# Location: ...
```

---

## Next Steps

1. **Start with Step 2** (Vercel Dashboard) - Check project settings
2. **Then Step 3** (Deployment) - Check Functions tab
3. **Then Step 4** (cURL test) - Test routes directly
4. **Share results** - Let me know what you find!

