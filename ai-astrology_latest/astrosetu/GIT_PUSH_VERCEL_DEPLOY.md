# 🚀 Git Push & Vercel Deployment Guide

## Files Changed
- `src/lib/astrologyAPI.ts` - Fixed panchang endpoint (GET method) and authentication (Basic Auth)
- `src/app/api/astrology/diagnostic/route.ts` - Updated authentication to use Basic Auth

---

## Step 1: Review Changes

Check what files were modified:
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
git status
```

You should see:
- `src/lib/astrologyAPI.ts` (modified)
- `src/app/api/astrology/diagnostic/route.ts` (modified)

---

## Step 2: Stage Changes

Add the modified files:
```bash
git add src/lib/astrologyAPI.ts
git add src/app/api/astrology/diagnostic/route.ts
```

Or add all changes at once:
```bash
git add .
```

---

## Step 3: Commit Changes

Create a commit with a descriptive message:
```bash
git commit -m "Fix ProKerala API: Change panchang to GET method and use Basic Auth for authentication"
```

---

## Step 4: Push to Git Repository

Push to your remote repository:
```bash
git push origin main
```

(Replace `main` with your branch name if different, e.g., `master` or `develop`)

---

## Step 5: Vercel Auto-Deploy

If Vercel is connected to your Git repository, it will **automatically deploy** when you push!

### Check Deployment Status:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `amits-projects-a49d49fa` (or your project name)
3. You should see a new deployment starting automatically
4. Wait for it to complete (usually 2-5 minutes)

---

## Step 6: Verify Environment Variables in Vercel

Make sure your ProKerala credentials are set in Vercel:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify these are set for **Production, Preview, and Development**:
   - `PROKERALA_CLIENT_ID` = `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
   - `PROKERALA_CLIENT_SECRET` = `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ60`

3. If they're missing or incorrect, add/update them and **redeploy**

---

## Step 7: Test After Deployment

Once deployment completes:

1. **Test Diagnostic Endpoint:**
   ```
   https://astrosetu-8yfzxcbd4-amits-projects-a49d49fa.vercel.app/api/astrology/diagnostic
   ```
   
   Should return:
   ```json
   {
     "ok": true,
     "data": {
       "prokeralaConfigured": true,
       "prokeralaTest": {
         "status": "connected",
         "ok": true
       }
     }
   }
   ```

2. **Test Kundli Page:**
   - Go to: `https://astrosetu-8yfzxcbd4-amits-projects-a49d49fa.vercel.app/kundli`
   - The authentication error should be gone
   - Try generating a Kundli

3. **Test Panchang:**
   - Go to: `https://astrosetu-8yfzxcbd4-amits-projects-a49d49fa.vercel.app/panchang`
   - Should work without 405 errors

---

## Manual Redeploy (If Needed)

If auto-deploy doesn't trigger, manually redeploy:

### Option A: Via Vercel Dashboard
1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

### Option B: Via Vercel CLI
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
vercel --prod
```

---

## Troubleshooting

### If deployment fails:
1. Check Vercel build logs for errors
2. Verify all environment variables are set
3. Check that Node.js version is compatible

### If authentication still fails:
1. Double-check environment variables in Vercel
2. Make sure they're set for **Production** environment
3. Redeploy after updating variables

### If you see build errors:
```bash
# Test build locally first
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npm run build
```

---

## Summary

✅ **What was fixed:**
- Panchang endpoint now uses GET method (was causing 405 error)
- Authentication now uses Basic Auth (OAuth2 standard)
- Both fixes applied to main API and diagnostic endpoint

✅ **Next steps:**
1. `git add .`
2. `git commit -m "Fix ProKerala API authentication and panchang endpoint"`
3. `git push origin main`
4. Wait for Vercel auto-deploy (or manually redeploy)
5. Test the endpoints

---

**Estimated time:** 5-10 minutes for git push + Vercel deployment

