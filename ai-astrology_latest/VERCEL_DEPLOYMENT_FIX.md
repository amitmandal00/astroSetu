# Vercel Deployment Fix

## Issue
Vercel project name validation error:
> "A Project name can only contain up to 100 lowercase letters, digits, and the characters '.', '_', and '-'."

## Solution

### Quick Fix
In the Vercel "New Project" page:

1. **Change the "Private Repository Name" field from:**
   - `astroSetu` ❌ (has uppercase 'S')

2. **To:**
   - `astrosetu` ✅ (all lowercase)

3. **Click "Create"**

### Valid Project Name Examples
- ✅ `astrosetu` (all lowercase)
- ✅ `astro-setu` (with hyphen)
- ✅ `astro_setu` (with underscore)
- ✅ `astrosetu123` (with numbers)
- ❌ `astroSetu` (uppercase not allowed)
- ❌ `AstroSetu` (uppercase not allowed)

## Additional Configuration

After creating the project, make sure to configure:

### 1. Root Directory
Set the **Root Directory** to:
```
astrosetu
```

### 2. Framework Preset
- **Framework Preset**: Next.js

### 3. Build Settings
- **Build Command**: `npm run build` (or leave default)
- **Output Directory**: `.next` (or leave default)
- **Install Command**: `npm ci` (or leave default)

### 4. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (optional)

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-secret-key

# Prokerala (Optional)
PROKERALA_CLIENT_ID=your-client-id
PROKERALA_CLIENT_SECRET=your-client-secret

# App Config
NEXT_PUBLIC_APP_NAME=AstroSetu
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Summary

**The fix is simple:** Change `astroSetu` → `astrosetu` in the project name field on Vercel.

Your repository name on GitHub can still be `astroSetu` (with uppercase) - Vercel only requires the **project name** to be lowercase.
