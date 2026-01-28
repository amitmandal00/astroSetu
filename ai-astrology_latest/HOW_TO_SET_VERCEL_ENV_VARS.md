# How to Set Environment Variables in Vercel

**Date**: 2026-01-17 23:00  
**Purpose**: Set `NEXT_PUBLIC_ENABLE_PWA=false` to disable service worker during stabilization

---

## 🚀 Method 1: Vercel Dashboard (Recommended)

### Step 1: Go to Your Project Settings

1. **Open Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `astrosetu-app` (or your project name)
3. **Click "Settings"** (top navigation bar)
4. **Click "Environment Variables"** (left sidebar)

---

### Step 2: Add Environment Variable

**For `NEXT_PUBLIC_ENABLE_PWA`**:

1. **Click "Add New"** (or "Add" button)
2. **Enter the following**:
   - **Key**: `NEXT_PUBLIC_ENABLE_PWA`
   - **Value**: `false`
   - **Environment**: Select **ALL THREE** checkboxes:
     - ☑️ **Production**
     - ☑️ **Preview**
     - ☑️ **Development**
3. **Click "Save"**

**Important**: Make sure all three environments (Production, Preview, Development) are selected, as Preview deployments often don't inherit Production env vars unless explicitly set.

---

### Step 3: Redeploy

**After setting the env var**:

1. **Go to "Deployments"** tab
2. **Find the latest deployment**
3. **Click "..." (three dots) → "Redeploy"**
4. **Or**: Make a new commit and push (will trigger auto-deploy)

**Note**: You may need to redeploy for the env var to take effect. Existing deployments won't pick up new env vars automatically.

---

## 🔧 Method 2: Vercel CLI (Alternative)

If you prefer using the command line:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Add environment variable for all environments
vercel env add NEXT_PUBLIC_ENABLE_PWA

# When prompted:
# - Value: false
# - Environment: Select all (Production, Preview, Development)
```

**Then redeploy**:
```bash
vercel --prod
```

---

## ✅ Verification

### After Setting the Env Var and Redeploying

**In Browser** (DevTools → Console):
```javascript
// Should log "false" or undefined (not "true")
console.log(process.env.NEXT_PUBLIC_ENABLE_PWA);
```

**In DevTools → Application → Service Workers**:
- Should show "No service workers registered" (or service workers should be unregistered)

**In Browser Network Tab**:
- After hard reload, `/sw.js` should NOT appear (or should fail with 404)

---

## 📋 Complete Environment Variables Checklist

While you're in Vercel Settings → Environment Variables, also verify/set these:

### Required for Input Token Flow

- [ ] `SUPABASE_SERVICE_ROLE_KEY` (server-only, sensitive)
  - **Value**: Your Supabase service role key
  - **Environment**: Production, Preview, Development
  - **Note**: Keep "Protect" checked (not exposed to client)

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - **Value**: Your Supabase project URL
  - **Environment**: Production, Preview, Development
  - **Note**: Can be exposed to client (NEXT_PUBLIC_ prefix)

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **Value**: Your Supabase anon key
  - **Environment**: Production, Preview, Development
  - **Note**: Can be exposed to client (NEXT_PUBLIC_ prefix)

### Required for Checkout/Base URL

- [ ] `NEXT_PUBLIC_APP_URL`
  - **Value**: Your production app URL (e.g., `https://www.mindveda.net` or `https://your-app.vercel.app`)
  - **Environment**: Production, Preview, Development
  - **Note**: Can be exposed to client (NEXT_PUBLIC_ prefix)

### Required for Service Worker Disable

- [ ] `NEXT_PUBLIC_ENABLE_PWA`
  - **Value**: `false` (string, not boolean)
  - **Environment**: Production, Preview, Development
  - **Note**: Can be exposed to client (NEXT_PUBLIC_ prefix)

---

## 🐛 Common Issues

### Issue 1: Env Var Not Taking Effect

**Problem**: Set env var but service worker still registers

**Fix**:
1. Check that `NEXT_PUBLIC_ENABLE_PWA=false` (value is string `"false"`, not boolean)
2. Redeploy (existing deployments don't pick up new env vars)
3. Clear browser cache and hard reload (Cmd+Shift+R)

---

### Issue 2: Preview Deployments Missing Env Vars

**Problem**: Env var works in Production but not in Preview

**Fix**:
- Make sure Preview checkbox is selected when adding env var in Vercel
- Preview deployments often don't inherit Production env vars unless explicitly set

---

### Issue 3: Service Worker Still Active After Disable

**Problem**: Set `NEXT_PUBLIC_ENABLE_PWA=false` but service worker still registers

**Fix**:
1. Check code in `layout.tsx` - should check `process.env.NEXT_PUBLIC_ENABLE_PWA === "true"` (not `!== "false"`)
2. Manually unregister service worker in DevTools → Application → Service Workers
3. Clear site data and hard reload

---

## 📝 Quick Reference

**Vercel Dashboard Path**:
```
Dashboard → Your Project → Settings → Environment Variables
```

**Direct Link Format**:
```
https://vercel.com/[your-username]/[your-project]/settings/environment-variables
```

**Value to Set**:
```
NEXT_PUBLIC_ENABLE_PWA = false
```

**Environments to Select**:
- ☑️ Production
- ☑️ Preview
- ☑️ Development

---

**After setting**: Redeploy → Verify service worker is disabled → Test token flow

