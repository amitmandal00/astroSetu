# Guide: Verify SUPABASE_SERVICE_ROLE_KEY in Vercel (Server-Only)

**Purpose**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel and is **server-only** (never exposed to client)

---

## Step 1: Check if Environment Variable is Set in Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/dashboard
   - Log in to your account

2. **Navigate to Your Project**:
   - Click on your project (e.g., "astrosetu" or "mindveda")
   - Click on **Settings** (gear icon in top navigation)

3. **Go to Environment Variables**:
   - In the left sidebar, click **Environment Variables**
   - You'll see a list of all environment variables

4. **Search for SUPABASE_SERVICE_ROLE_KEY**:
   - Use the search box or scroll to find `SUPABASE_SERVICE_ROLE_KEY`
   - **Check the "Environment" column**:
     - ✅ Should have checkmarks for: **Production**, **Preview**, **Development** (or at least Production)
     - ❌ If missing, you need to add it (see Step 2)

5. **Verify the Value**:
   - The value should start with `eyJ...` (JWT token format)
   - It should be **long** (typically 200+ characters)
   - **DO NOT copy/paste this value anywhere** - it's a secret key

---

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# List environment variables (will show masked values)
vercel env ls

# Check specific variable
vercel env ls | grep SUPABASE_SERVICE_ROLE_KEY
```

**Expected Output**:
```
SUPABASE_SERVICE_ROLE_KEY    Production, Preview, Development    [Hidden]
```

---

## Step 2: Add Environment Variable (If Missing)

### Via Vercel Dashboard:

1. **Go to Settings → Environment Variables** (same as Step 1)

2. **Click "Add New"** button

3. **Fill in the form**:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Paste your Supabase Service Role Key (see "Where to Find It" below)
   - **Environment**: Select all three:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Click "Save"**

5. **Redeploy** (required for changes to take effect):
   - Go to **Deployments** tab
   - Click **"..."** (three dots) on latest deployment
   - Click **"Redeploy"**

---

## Step 3: Verify It's Server-Only (CRITICAL Security Check)

### Why This Matters:
- `SUPABASE_SERVICE_ROLE_KEY` is a **secret key** that bypasses Row Level Security (RLS)
- If exposed to the client, anyone can access your entire Supabase database
- **This is a critical security vulnerability**

### How to Verify It's Server-Only:

#### Method 1: Check Browser DevTools (Production Site)

1. **Open Your Production Site**:
   - Visit: https://your-domain.com (or your Vercel deployment URL)

2. **Open Browser DevTools**:
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
   - Go to **Console** tab

3. **Check for Service Role Key**:
   ```javascript
   // In Console, type:
   console.log(process.env.SUPABASE_SERVICE_ROLE_KEY)
   // Expected: undefined (should NOT show the key)
   ```

4. **Check Network Tab**:
   - Go to **Network** tab
   - Filter by "Fetch/XHR"
   - Click on any API request (e.g., `/api/ai-astrology/input-session`)
   - Check **Response** tab
   - **Search for "SUPABASE_SERVICE_ROLE_KEY"** or "eyJ" (JWT token start)
   - ✅ **Should NOT find it** - if you do, it's a security issue

5. **Check Application/Storage Tab**:
   - Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
   - Check **Local Storage**, **Session Storage**, **Cookies**
   - **Search for "SUPABASE_SERVICE_ROLE_KEY"**
   - ✅ **Should NOT find it**

#### Method 2: Check Source Code (Build Output)

1. **Check Built JavaScript Files**:
   - In DevTools, go to **Sources** tab
   - Navigate to `/_next/static/chunks/` or `/_next/static/js/`
   - Search for "SUPABASE_SERVICE_ROLE_KEY" (Cmd+F / Ctrl+F)
   - ✅ **Should NOT find it** in client-side bundles

2. **Check Page Source**:
   - Right-click page → **View Page Source**
   - Search for "SUPABASE_SERVICE_ROLE_KEY"
   - ✅ **Should NOT find it**

#### Method 3: Check API Route Code (Server-Side Only)

1. **Verify API Route Usage**:
   - Open: `src/app/api/ai-astrology/input-session/route.ts`
   - Check that it uses: `process.env.SUPABASE_SERVICE_ROLE_KEY`
   - ✅ **This is correct** - `process.env` in API routes is server-only

2. **Verify No Client-Side Usage**:
   - Search entire codebase for `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ Should **only** appear in:
     - API routes (`src/app/api/**/*.ts`)
     - Server-side code
     - ❌ Should **NOT** appear in:
       - Client components (`"use client"` files)
       - `NEXT_PUBLIC_*` env var names
       - Browser-accessible code

---

## Step 4: Where to Find Your Supabase Service Role Key

### If You Don't Have It:

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Log in to your account

2. **Select Your Project**:
   - Click on your project (e.g., "astrosetu" or your project name)

3. **Go to Settings**:
   - Click **Settings** (gear icon in left sidebar)
   - Click **API** (under Project Settings)

4. **Find Service Role Key**:
   - Scroll to **"Project API keys"** section
   - Find **"service_role"** key (NOT "anon" key)
   - **⚠️ WARNING**: This key has **full access** to your database
   - Click **"Reveal"** to show the key
   - Copy the key (starts with `eyJ...`)

5. **Add to Vercel**:
   - Follow Step 2 above to add it to Vercel

---

## Step 5: Security Best Practices

### ✅ DO:
- ✅ Store `SUPABASE_SERVICE_ROLE_KEY` in Vercel Environment Variables
- ✅ Use it **only** in API routes (server-side)
- ✅ Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side code (if needed)
- ✅ Rotate the key if you suspect it's been exposed
- ✅ Use different keys for different environments (dev/staging/prod)

### ❌ DON'T:
- ❌ **NEVER** prefix it with `NEXT_PUBLIC_` (this exposes it to client)
- ❌ **NEVER** commit it to Git (add to `.gitignore`)
- ❌ **NEVER** log it in console.log or API responses
- ❌ **NEVER** return it in API responses
- ❌ **NEVER** use it in client-side code (`"use client"` components)

---

## Step 6: Verify It's Working (Functional Test)

### Test the Input Token API:

1. **Open Your Production Site**:
   - Visit: https://your-domain.com/ai-astrology/input

2. **Fill Birth Details Form**:
   - Enter name, DOB, time, place
   - Submit the form

3. **Check Network Tab**:
   - Open DevTools → **Network** tab
   - Look for request to `/api/ai-astrology/input-session`
   - Check **Response**:
     - ✅ Should return `{ ok: true, data: { token: "..." } }`
     - ❌ If you see `{ ok: false, error: "Input session storage is not available" }`, the key is missing or incorrect

4. **Check Server Logs** (Vercel Dashboard):
   - Go to Vercel Dashboard → Your Project → **Logs**
   - Look for `[input-session]` logs
   - ❌ If you see `"CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in production"`, the key is not set

---

## Step 7: Troubleshooting

### Issue: "Input session storage is not available"

**Possible Causes**:
1. `SUPABASE_SERVICE_ROLE_KEY` not set in Vercel
2. Key is incorrect (typo, wrong key)
3. Deployment didn't pick up the env var (need to redeploy)

**Solution**:
1. Check Step 1 to verify the key is set
2. Verify the key value matches Supabase Dashboard
3. Redeploy the application

### Issue: "CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in production"

**Cause**: The key is not set in Vercel for Production environment

**Solution**:
1. Go to Vercel → Settings → Environment Variables
2. Add `SUPABASE_SERVICE_ROLE_KEY` with Production environment checked
3. Redeploy

### Issue: Key appears in browser DevTools

**Cause**: Key is exposed to client (CRITICAL SECURITY ISSUE)

**Possible Reasons**:
1. Key is prefixed with `NEXT_PUBLIC_` (wrong!)
2. Key is used in client-side code
3. Key is returned in API response

**Solution**:
1. Remove `NEXT_PUBLIC_` prefix if present
2. Move any client-side usage to API routes
3. Check API responses don't include the key
4. **Rotate the key immediately** in Supabase Dashboard

---

## Quick Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (Production environment)
- [ ] Key value starts with `eyJ...` (JWT format)
- [ ] Key is **NOT** prefixed with `NEXT_PUBLIC_`
- [ ] Key is **NOT** visible in browser DevTools (Console, Network, Storage)
- [ ] Key is **NOT** in client-side code (`"use client"` files)
- [ ] Key is **ONLY** used in API routes (server-side)
- [ ] Input token API works (tested in production)
- [ ] No errors in Vercel logs about missing key

---

## Summary

✅ **Correct Setup**:
- `SUPABASE_SERVICE_ROLE_KEY` set in Vercel (server-only env var)
- Used only in API routes (`src/app/api/**/*.ts`)
- Never exposed to client (not in `NEXT_PUBLIC_*`, not in client code)

❌ **Incorrect Setup**:
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` (exposed to client - SECURITY RISK)
- Key used in client components
- Key visible in browser DevTools

---

**Last Updated**: 2026-01-17  
**Status**: Ready for verification

