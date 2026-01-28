# Fix Vercel 404 Error

## Issue
Your deployment succeeded, but you're getting a `404: NOT_FOUND` error. This happens because Vercel is trying to build from the repository root, but your Next.js app is in the `astrosetu` subdirectory.

## Solution: Configure Root Directory in Vercel

### Step 1: Go to Vercel Project Settings

1. Go to your Vercel dashboard: https://vercel.com
2. Click on your project (the one you just created)
3. Go to **Settings** tab
4. Scroll down to **General** section
5. Find **Root Directory** setting

### Step 2: Set Root Directory

1. Click **Edit** next to "Root Directory"
2. Enter: `astrosetu`
3. Click **Save**

### Step 3: Redeploy

After saving the root directory:

1. Go to the **Deployments** tab
2. Find your latest deployment
3. Click the **three dots (⋯)** menu
4. Click **Redeploy**

OR

1. Go to **Settings** → **Git**
2. Make sure the repository is connected
3. Push a new commit to trigger a redeploy:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

## Alternative: Quick Fix via Vercel CLI

If you have Vercel CLI installed:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor
vercel --prod
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Your scope
- **Link to existing project?** → Yes (select your project)
- **What's your project's root directory?** → `./astrosetu`
- **Override settings?** → Yes

## Verify Configuration

After setting the root directory, verify these settings in Vercel:

### Build Settings (should auto-detect, but verify):
- **Framework Preset**: Next.js
- **Root Directory**: `astrosetu`
- **Build Command**: `npm run build` (or leave default)
- **Output Directory**: `.next` (or leave default)
- **Install Command**: `npm ci` (or leave default)

### Environment Variables
Make sure you've added all required environment variables in:
**Settings** → **Environment Variables**

## Expected Result

After redeploying with the correct root directory:
- ✅ The 404 error should be gone
- ✅ Your app should load at the deployment URL
- ✅ All routes should work correctly

## Troubleshooting

If you still get 404 after setting root directory:

1. **Check build logs:**
   - Go to **Deployments** → Click on deployment → **Build Logs**
   - Look for any build errors

2. **Verify package.json exists:**
   - Make sure `astrosetu/package.json` exists
   - Make sure it has the correct build scripts

3. **Check Next.js configuration:**
   - Verify `astrosetu/next.config.mjs` exists
   - Check for any custom output settings

4. **Clear cache and redeploy:**
   - In deployment settings, enable "Clear Build Cache"
   - Redeploy

## Summary

**The fix:** Set Root Directory to `astrosetu` in Vercel project settings, then redeploy.
