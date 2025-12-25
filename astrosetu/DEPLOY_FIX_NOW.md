# 🚨 Deploy ProKerala Fix - URGENT

## Current Issue
The deployed version on Vercel is still using the **old code** that calls panchang with POST. You need to deploy the fixes.

## ✅ What Was Fixed (Already Done)
1. ✅ Panchang endpoint changed from POST → GET
2. ✅ Authentication changed to Basic Auth (OAuth2 standard)
3. ✅ Both files updated: `astrologyAPI.ts` and `diagnostic/route.ts`

## 🚀 Deploy Steps (Run These Now)

### Step 1: Check Git Status
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
git status
```

You should see:
- `src/lib/astrologyAPI.ts` (modified)
- `src/app/api/astrology/diagnostic/route.ts` (modified)

### Step 2: Stage & Commit
```bash
git add src/lib/astrologyAPI.ts src/app/api/astrology/diagnostic/route.ts
git commit -m "Fix ProKerala: Change panchang to GET and use Basic Auth"
```

### Step 3: Push to GitHub
```bash
git push origin main
```
(Replace `main` with your branch name if different)

### Step 4: Wait for Vercel Auto-Deploy
- Vercel will automatically detect the push
- Go to: https://vercel.com/dashboard
- Find your project and watch the deployment
- Wait 2-5 minutes for build to complete

### Step 5: Verify Deployment
After deployment completes, test:

```bash
# Test diagnostic endpoint
curl https://astrosetu-8yfzxcbd4-amits-projects-a49d49fa.vercel.app/api/astrology/diagnostic
```

**Expected Response:**
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

**Should NOT see:** Panchang POST error anymore!

---

## 🔄 Manual Redeploy (If Auto-Deploy Doesn't Work)

### Option A: Via Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Go to **Deployments** tab
4. Click **"..."** on latest deployment
5. Click **"Redeploy"**

### Option B: Via Vercel CLI
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
vercel --prod
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Diagnostic endpoint shows `"status": "connected"` (not error)
- [ ] No panchang POST errors in diagnostic response
- [ ] Kundli page works without authentication errors
- [ ] Panchang page works without 405 errors

---

## 🐛 If Still Getting Errors After Deploy

1. **Check Vercel Build Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on the latest deployment
   - Check "Build Logs" for any errors

2. **Verify Environment Variables:**
   - Vercel Dashboard → Settings → Environment Variables
   - Ensure `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET` are set
   - Make sure they're enabled for **Production, Preview, and Development**

3. **Clear Cache & Redeploy:**
   - In Vercel, go to Deployments
   - Click "..." → "Redeploy" → Check "Use existing Build Cache" = OFF
   - Redeploy

---

## 📝 Quick Command Summary

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
git add src/lib/astrologyAPI.ts src/app/api/astrology/diagnostic/route.ts
git commit -m "Fix ProKerala: Change panchang to GET and use Basic Auth"
git push origin main
```

Then wait for Vercel to auto-deploy (2-5 minutes).

---

**Time to fix:** ~5 minutes (push + deploy)

