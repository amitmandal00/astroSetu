# 🚨 URGENT: Deploy ProKerala Fixes NOW

## Current Status
- ✅ **Local code:** All fixes applied and correct
- ❌ **Vercel:** Still running old code (POST method for panchang)

## Files Changed (Need to Deploy)
1. `src/lib/astrologyAPI.ts` - Panchang uses GET, Basic Auth
2. `src/app/api/astrology/diagnostic/route.ts` - Tests panchang with GET

---

## 🚀 DEPLOY STEPS (Run These Now)

### Step 1: Check What Needs to Be Committed
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
git status
```

### Step 2: Stage All Changes
```bash
git add src/lib/astrologyAPI.ts src/app/api/astrology/diagnostic/route.ts
```

### Step 3: Commit
```bash
git commit -m "Fix ProKerala: Panchang GET method + Basic Auth + Diagnostic test"
```

### Step 4: Push to Trigger Vercel Deploy
```bash
git push origin main
```

### Step 5: Wait for Vercel Auto-Deploy
- Go to: https://vercel.com/dashboard
- Watch for new deployment
- Wait 2-5 minutes

---

## 🔄 ALTERNATIVE: Force Redeploy via Vercel Dashboard

If git push doesn't trigger deploy:

1. **Go to Vercel Dashboard:**
   https://vercel.com/dashboard

2. **Click Your Project**

3. **Go to Deployments Tab**

4. **Click "..." on Latest Deployment**

5. **Click "Redeploy"**

6. **IMPORTANT:** Uncheck **"Use existing Build Cache"**

7. **Click "Redeploy"**

8. **Wait 2-5 minutes**

---

## ✅ Verify After Deployment

### Test Diagnostic Endpoint:
```bash
curl https://astrosetu-8yfzxcbd4-amits-projects-a49d49fa.vercel.app/api/astrology/diagnostic
```

### Expected Response:
```json
{
  "ok": true,
  "data": {
    "prokeralaConfigured": true,
    "prokeralaTest": {
      "status": "connected",
      "ok": true,
      "panchangTest": "passed"
    }
  }
}
```

### Should NOT See:
- ❌ `"status": "error"`
- ❌ `"POST https://api.prokerala.com/v2/astrology/panchang"`
- ❌ `"Method Not Allowed (Allow: GET)"`
- ❌ `"statusCode": 405`

---

## 🐛 If Still Getting Errors

### Check 1: Verify Deployment Completed
- Go to Vercel Dashboard → Deployments
- Check latest deployment status is "Ready" (green)
- Check build logs for errors

### Check 2: Clear Browser Cache
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Or test in incognito/private window

### Check 3: Verify Environment Variables
- Vercel Dashboard → Settings → Environment Variables
- Ensure `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET` are set
- Make sure they're enabled for **Production**

### Check 4: Check Build Logs
- Vercel Dashboard → Deployments → Latest → Build Logs
- Look for any errors during build

---

## 📋 Quick Command Summary

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
git add src/lib/astrologyAPI.ts src/app/api/astrology/diagnostic/route.ts
git commit -m "Fix ProKerala: Panchang GET + Basic Auth"
git push origin main
```

Then wait for Vercel to auto-deploy (2-5 minutes).

---

**Time to fix:** ~5 minutes (commit + push + deploy)

**Status:** ⏳ Waiting for deployment

