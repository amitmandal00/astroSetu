# Fix Vercel Build Errors - Module Resolution

## Issue

Build is failing with:
```
Module not found: Can't resolve '@/lib/supabase'
Module not found: Can't resolve '@/lib/apiHelpers'
Module not found: Can't resolve '@/lib/mockAstrologers'
```

## Root Cause

The TypeScript path aliases (`@/*`) are not being resolved correctly during the Vercel build process.

## Solution Applied

Updated `tsconfig.json` to use `moduleResolution: "node"` instead of `"bundler"` for better compatibility with Vercel's build environment.

## Changes Made

1. ✅ Updated `tsconfig.json`:
   - Changed `moduleResolution` from `"bundler"` to `"node"`
   - Ensured paths are correctly configured: `"@/*": ["./src/*"]`

## Next Steps

1. **Commit and push the changes:**
   ```bash
   git add astrosetu/tsconfig.json
   git commit -m "Fix TypeScript path resolution for Vercel build"
   git push
   ```

2. **Vercel will automatically redeploy** when you push

3. **Monitor the build** in Vercel dashboard

## Alternative Fix (If Still Failing)

If the issue persists, try:

### Option 1: Add jsconfig.json

Create `astrosetu/jsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Option 2: Verify Vercel Root Directory

1. Go to Vercel → Your Project → Settings
2. Verify **Root Directory** is set to: `astrosetu`
3. If not, set it and redeploy

### Option 3: Check File Extensions

Ensure all import statements use the correct file extensions:
- ✅ `@/lib/supabase` (no extension needed for .ts files)
- ❌ `@/lib/supabase.ts` (don't include .ts extension)

## Verification

After pushing, check:
- ✅ Build completes without module resolution errors
- ✅ All `@/lib/*` imports resolve correctly
- ✅ Application deploys successfully

## Files Modified

- `astrosetu/tsconfig.json` - Updated moduleResolution
