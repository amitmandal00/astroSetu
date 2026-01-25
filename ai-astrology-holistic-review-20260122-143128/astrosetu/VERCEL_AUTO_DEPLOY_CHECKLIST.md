# Vercel Auto-Deploy Not Triggering - Troubleshooting Checklist

**Date:** 2026-01-22  
**Issue:** Auto-deployment not triggering after git push

---

## Quick Checks

### 1. ✅ Verify Git Push Was Successful
```bash
git log --oneline -3
git status
```
**Expected:** Should show recent commits, working tree clean

### 2. ✅ Check vercel.json Configuration
**Current Status:** ✅ No `crons` section (good - was causing issues before)

**File:** `astrosetu/vercel.json`
- ✅ No crons section
- ✅ Build command configured
- ✅ Framework: nextjs

### 3. ⚠️ Check Vercel Dashboard Settings

**Go to Vercel Dashboard → Your Project → Settings:**

#### A. Git Integration
- [ ] Verify GitHub repository is connected
- [ ] Check if webhook is active
- [ ] Verify branch: `main` is set for production

#### B. Build & Development Settings
- [ ] **Root Directory:** Should be `astrosetu` (if repo is in parent folder)
- [ ] **Framework Preset:** Next.js
- [ ] **Build Command:** Should match `vercel.json` or use default
- [ ] **Output Directory:** `.next`

#### C. Deployment Settings
- [ ] **Auto-deploy:** Should be ENABLED
- [ ] **Production Branch:** Should be `main`
- [ ] **Preview Deployments:** Can be enabled/disabled

---

## Common Causes & Solutions

### Cause 1: Root Directory Mismatch ⚠️ MOST COMMON

**Symptom:** Vercel is looking in wrong directory

**Check:**
1. Go to Vercel Dashboard → Settings → General
2. Check "Root Directory" setting
3. Should be: `astrosetu` (if repo root is parent folder)

**Fix:**
1. Set Root Directory to `astrosetu`
2. Save settings
3. Trigger manual deployment to test

---

### Cause 2: GitHub Webhook Not Working

**Symptom:** Git push succeeds but Vercel doesn't detect it

**Check:**
1. Go to Vercel Dashboard → Settings → Git
2. Check webhook status
3. Look for error messages

**Fix:**
1. Disconnect and reconnect GitHub integration
2. Or manually trigger deployment

---

### Cause 3: Auto-Deploy Disabled

**Symptom:** Settings show auto-deploy is off

**Check:**
1. Go to Vercel Dashboard → Settings → Git
2. Check "Auto-deploy" toggle

**Fix:**
1. Enable auto-deploy
2. Save settings

---

### Cause 4: Branch Mismatch

**Symptom:** Pushing to wrong branch

**Check:**
```bash
git branch
git remote show origin
```

**Fix:**
- Ensure you're pushing to `main` branch
- Verify Vercel is configured to deploy from `main`

---

### Cause 5: Build Errors Preventing Deployment

**Symptom:** Deployment starts but fails silently

**Check:**
1. Go to Vercel Dashboard → Deployments
2. Look for failed deployments
3. Check build logs

**Fix:**
- Fix build errors
- Re-push

---

## Immediate Actions

### Step 1: Check Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Check "Deployments" tab
4. Look for:
   - Failed deployments
   - Error messages
   - Recent activity

### Step 2: Verify Root Directory
1. Go to Settings → General
2. Check "Root Directory"
3. Should be: `astrosetu` (if repo is in parent folder)
4. If wrong, set it and save

### Step 3: Check Git Integration
1. Go to Settings → Git
2. Verify repository is connected
3. Check webhook status
4. Verify branch: `main`

### Step 4: Manual Trigger (Test)
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Or click "Deploy" → "Deploy Latest Commit"
4. This will show if deployment works manually

---

## Quick Fix: Manual Deployment

If auto-deploy isn't working, deploy manually:

```bash
cd astrosetu
npx vercel --prod
```

This will:
- Show any errors immediately
- Deploy to production
- Help diagnose the issue

---

## Verification Steps

After fixing:

1. **Make a small change:**
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: Trigger deployment"
   git push origin main
   ```

2. **Check Vercel Dashboard:**
   - Should see new deployment within 1-2 minutes
   - Check deployment status

3. **If still not working:**
   - Check Vercel status page
   - Check GitHub webhook delivery
   - Contact Vercel support

---

## Most Likely Issue

Based on previous experience:
- **Root Directory** is probably not set to `astrosetu`
- Or **Auto-deploy** is disabled

**Quick Check:**
1. Go to Vercel Dashboard → Settings → General
2. Check "Root Directory" - should be `astrosetu`
3. Go to Settings → Git
4. Check "Auto-deploy" is enabled

---

## Next Steps

1. ✅ Check Vercel Dashboard for failed deployments
2. ✅ Verify Root Directory setting
3. ✅ Check Auto-deploy is enabled
4. ✅ Try manual deployment to test
5. ✅ If still not working, check webhook status

---

**Status:** Ready for troubleshooting

