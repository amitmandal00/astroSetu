# Vercel Auto-Deploy Quick Fix

**Issue:** Auto-deployment not triggering after git push

---

## Most Likely Cause (90% of cases)

**Root Directory not set to `astrosetu`**

Your repository structure:
```
/astroCursor (repo root)
  └── astrosetu/ (project root)
      ├── package.json
      ├── next.config.js
      └── src/
```

Vercel needs to know the project is in the `astrosetu` subdirectory.

---

## Quick Fix (2 minutes)

### Step 1: Check Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **General**
4. Check **Root Directory** field

### Step 2: Set Root Directory
- **If empty or `.`:** Change to `astrosetu`
- **If already `astrosetu`:** Check other settings (see below)

### Step 3: Save and Redeploy
1. Click **Save**
2. Go to **Deployments** tab
3. Click **Redeploy** on latest deployment
4. Or make a small change and push to trigger auto-deploy

---

## Other Common Causes

### 2. Auto-Deploy Disabled
**Check:** Settings → Git → Auto-deploy
**Fix:** Enable auto-deploy

### 3. Wrong Production Branch
**Check:** Settings → Git → Production Branch
**Fix:** Should be `main`

### 4. GitHub Webhook Issue
**Check:** GitHub → Settings → Webhooks → Vercel webhook
**Fix:** If missing/failing, reconnect in Vercel Settings → Git

---

## Manual Deployment (Test)

To verify deployment works:

```bash
cd astrosetu
npx vercel --prod
```

This will:
- Show any errors immediately
- Deploy to production
- Help diagnose the issue

---

## Verification

After fixing:

1. **Make a test change:**
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: Trigger deployment"
   git push origin main
   ```

2. **Check Vercel Dashboard:**
   - Should see new deployment within 1-2 minutes
   - Status should be "Building" then "Ready"

---

## Still Not Working?

Check:
1. ✅ Root Directory = `astrosetu`
2. ✅ Auto-deploy = Enabled
3. ✅ Production Branch = `main`
4. ✅ GitHub webhook exists and is active
5. ✅ No build errors in Vercel logs

If all checked and still not working:
- Check Vercel status: https://www.vercel-status.com/
- Contact Vercel support with project details

---

**Most Common Fix:** Set Root Directory to `astrosetu` in Settings → General

