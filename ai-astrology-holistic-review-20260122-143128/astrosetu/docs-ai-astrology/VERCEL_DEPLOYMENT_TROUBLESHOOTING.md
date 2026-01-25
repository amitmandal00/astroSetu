# Vercel Auto-Deployment Troubleshooting

**Issue:** Automated deployment didn't trigger after git push

---

## Common Reasons & Solutions

### 1. ✅ Check Vercel Project Settings

**Problem:** Vercel might not be watching the correct branch or repository.

**Solution:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Git**
4. Verify:
   - ✅ **Production Branch:** Should be `main` (or `master`)
   - ✅ **Repository:** Should be connected to your GitHub repo
   - ✅ **Auto-deploy:** Should be enabled

**Fix if needed:**
- If repository is not connected, click **Connect Git Repository**
- If wrong branch, update **Production Branch** to `main`
- If auto-deploy is disabled, enable it

---

### 2. ✅ Check Root Directory Configuration

**Problem:** Your project is in `astrosetu/` subdirectory, but Vercel might be looking at root.

**Solution:**
1. Go to **Settings** → **General**
2. Check **Root Directory** setting:
   - Should be: `astrosetu` (not `.` or empty)
   - If wrong, update to `astrosetu`
3. Save and redeploy

**Why this matters:**
- Vercel needs to know where your `package.json` and `next.config.js` are located
- If root directory is wrong, Vercel won't find the project files

---

### 3. ✅ Check GitHub Webhook

**Problem:** GitHub webhook might not be configured or might have failed.

**Solution:**
1. Go to your GitHub repository
2. Go to **Settings** → **Webhooks**
3. Look for Vercel webhook (should have `vercel.com` in URL)
4. Check:
   - ✅ Webhook exists
   - ✅ Status is "Active"
   - ✅ Recent deliveries show success (green checkmarks)

**If webhook is missing or failing:**
1. Go to Vercel Dashboard → Project → Settings → Git
2. Click **Disconnect** then **Connect Git Repository** again
3. This will recreate the webhook

---

### 4. ✅ Check Vercel Build Logs

**Problem:** Deployment might have been triggered but failed silently.

**Solution:**
1. Go to Vercel Dashboard → Your Project
2. Check **Deployments** tab
3. Look for:
   - Recent deployment attempts (even if failed)
   - Error messages in build logs
   - Build status (Building, Error, Ready)

**If deployment failed:**
- Check build logs for errors
- Common issues:
  - Missing environment variables
  - Build command failing
  - TypeScript errors
  - Missing dependencies

---

### 5. ✅ Manual Trigger Test

**Problem:** Auto-deploy might be disabled or misconfigured.

**Solution:**
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Or click **Deploy** → **Deploy Git Commit**
5. Select your latest commit (`10ce6f4`)
6. Click **Deploy**

**If manual deploy works:**
- Auto-deploy is likely misconfigured
- Check Settings → Git → Auto-deploy settings

---

### 6. ✅ Check Branch Protection

**Problem:** Branch might be protected or require manual approval.

**Solution:**
1. Go to Vercel Dashboard → Project → Settings → Git
2. Check **Deploy Hooks** and **Branch Protection**
3. Verify:
   - No branch protection rules blocking auto-deploy
   - No required approvals for production deployments

---

### 7. ✅ Verify Commit Was Pushed

**Problem:** Commit might not have been pushed to the correct branch.

**Solution:**
```bash
# Check current branch
git branch --show-current

# Check if commit exists on remote
git log origin/main --oneline -5

# Verify push was successful
git status
```

**If commit is missing:**
```bash
# Push again
git push origin main
```

---

### 8. ✅ Check Vercel Project Connection

**Problem:** Project might not be connected to the repository.

**Solution:**
1. Go to Vercel Dashboard
2. Check if project exists
3. If project doesn't exist:
   - Click **Add New Project**
   - Import your GitHub repository
   - Set **Root Directory** to `astrosetu`
   - Configure build settings
   - Deploy

---

## Quick Diagnostic Checklist

Run through this checklist:

- [ ] **Vercel project exists** and is connected to GitHub
- [ ] **Root Directory** is set to `astrosetu` (not `.`)
- [ ] **Production Branch** is set to `main` (or your default branch)
- [ ] **Auto-deploy** is enabled in Settings → Git
- [ ] **GitHub webhook** exists and is active
- [ ] **Commit was pushed** to `main` branch
- [ ] **No build errors** in Vercel logs
- [ ] **Manual deploy works** (test with Redeploy button)

---

## Step-by-Step Fix

### If Auto-Deploy Is Not Working:

1. **Verify Repository Connection**
   ```
   Vercel Dashboard → Project → Settings → Git
   → Check repository is connected
   → If not, click "Connect Git Repository"
   ```

2. **Set Root Directory**
   ```
   Settings → General → Root Directory
   → Set to: astrosetu
   → Save
   ```

3. **Verify Branch Settings**
   ```
   Settings → Git → Production Branch
   → Should be: main
   ```

4. **Test Manual Deploy**
   ```
   Deployments → Deploy → Deploy Git Commit
   → Select latest commit
   → Deploy
   ```

5. **Check Webhook**
   ```
   GitHub → Settings → Webhooks
   → Verify Vercel webhook exists and is active
   ```

6. **Force Reconnect (if needed)**
   ```
   Vercel → Settings → Git → Disconnect
   → Then Connect Git Repository again
   ```

---

## Common Configuration Issues

### Issue: Root Directory Wrong

**Symptom:** Build fails with "package.json not found"

**Fix:**
- Set Root Directory to `astrosetu` in Vercel Settings → General

### Issue: Build Command Failing

**Symptom:** Deployment shows "Build Error"

**Fix:**
- Check `vercel.json` build command
- Current: `(bash scripts/regression-check.sh || echo '⚠️ Regression check warning') && (bash scripts/vercel-build.sh || npm run build)`
- Verify scripts exist in `astrosetu/scripts/`

### Issue: Environment Variables Missing

**Symptom:** Build succeeds but app fails at runtime

**Fix:**
- Add all required environment variables in Vercel Settings → Environment Variables
- See `VERCEL_ENV_SETUP_GUIDE.md` for list

---

## Manual Deployment (Workaround)

If auto-deploy isn't working, you can manually trigger:

### Option 1: Vercel Dashboard
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click **Deploy** → **Deploy Git Commit**
4. Select commit `10ce6f4` (or latest)
5. Click **Deploy**

### Option 2: Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Navigate to project
cd astrosetu

# Deploy
vercel --prod
```

### Option 3: GitHub Actions (Alternative)
Set up GitHub Actions to trigger Vercel deployment on push:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Verify Deployment

After fixing the issue, verify:

1. **Check Latest Deployment**
   ```
   Vercel Dashboard → Deployments
   → Should show latest commit (10ce6f4)
   → Status should be "Ready" (green)
   ```

2. **Test Endpoint**
   ```bash
   # Test the new stale reports endpoint
   curl https://YOUR_DOMAIN.vercel.app/api/ai-astrology/process-stale-reports \
     -H "x-api-key: YOUR_API_KEY" \
     -X POST
   ```

3. **Check Cron Job**
   ```
   Vercel Dashboard → Settings → Cron Jobs
   → Should show: /api/ai-astrology/process-stale-reports
   → Schedule: */5 * * * *
   ```

---

## Still Not Working?

If none of the above fixes work:

1. **Check Vercel Status**
   - Visit https://www.vercel-status.com/
   - Check if there are any ongoing incidents

2. **Contact Vercel Support**
   - Go to https://vercel.com/support
   - Provide:
     - Project name
     - Repository URL
     - Commit hash that didn't deploy
     - Screenshots of Settings → Git

3. **Check GitHub Repository Settings**
   - Verify repository is public or Vercel has access
   - Check if there are any branch protection rules

---

## Prevention

To prevent this in the future:

1. ✅ **Set up correctly from start**
   - Connect repository during initial project setup
   - Set root directory immediately
   - Verify auto-deploy is enabled

2. ✅ **Monitor deployments**
   - Check Vercel dashboard after each push
   - Set up deployment notifications (email/Slack)

3. ✅ **Use Vercel CLI for verification**
   ```bash
   vercel ls  # List deployments
   vercel inspect  # Check project configuration
   ```

---

## Summary

**Most Common Issues:**
1. Root Directory not set to `astrosetu` (90% of cases)
2. Auto-deploy disabled in Settings
3. Wrong production branch configured
4. GitHub webhook missing or inactive

**Quick Fix:**
1. Settings → General → Root Directory = `astrosetu`
2. Settings → Git → Production Branch = `main`
3. Settings → Git → Auto-deploy = Enabled
4. Test with manual deploy

---

**Need Help?** Check Vercel documentation: https://vercel.com/docs/concepts/git

