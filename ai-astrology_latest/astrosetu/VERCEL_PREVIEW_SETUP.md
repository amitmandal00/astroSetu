# 🔧 Fix: Enable Preview Deployments on Vercel

## Problem
Vercel is not creating preview deployments when pushing to `main` branch. All deployments are being marked as "Production".

## Solution: Multiple Methods to Enable Preview Deployments

The Production Branch setting may not be visible on all Vercel plans. Try these methods:

---

## ✅ Method 1: Check Settings → Build and Deployment

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your `astrosetu-app` project

2. **Navigate to Settings → Build and Deployment**
   - Click **Settings** tab (top navigation)
   - Click **"Build and Deployment"** in the left sidebar

3. **Look for "Production Branch" or Branch Settings**
   - Scroll through all settings
   - Look for any branch-related configuration
   - Production Branch setting might be here instead of General

4. **If found, change it:**
   - Change from `main` to `production` (or non-existent branch)
   - Click **Save**

---

## ✅ Method 2: Use Ignore Build Step (If Production Branch Not Available)

If Production Branch setting is not visible (common on Hobby plan):

1. **Go to Settings → Build and Deployment**
   - Click **Settings** tab
   - Click **"Build and Deployment"** in left sidebar

2. **Find "Ignore Build Step" section**
   - Scroll down to find this option

3. **Add this condition:**
   ```bash
   [ "$VERCEL_GIT_COMMIT_REF" = "main" ]
   ```
   
   This will skip automatic deployments from `main` branch.

4. **For manual preview deployments:**
   ```bash
   # Use Vercel CLI to deploy as preview
   vercel --preview
   ```

---

## ✅ Method 3: Check Settings → Git

1. **Go to Settings → Git**
   - Click **Settings** tab
   - Click **"Git"** in the left sidebar

2. **Look for branch configuration**
   - Check for "Production Branch" option
   - Look for branch-specific deployment settings
   - Check if there are per-branch toggles

---

## ✅ Method 4: Change Production Branch (If Available in General)

**Note:** This setting might only be available on Pro/Team plans.

1. **Navigate to Settings → General**
   - Click **Settings** tab
   - Click **General** in the left sidebar

2. **Scroll to bottom**
   - Production Branch might be near the bottom
   - It might be collapsed or hidden

3. **If visible, change it:**
   - Change from `main` to `production`
   - Click **Save**

---

### Option 2: Disable Production Deployments via Git Settings

1. **Go to Settings → Git**
   - Click **Settings** tab
   - Click **Git** in the left sidebar

2. **Configure Branch Deployments**
   - Under **"Production Branch"** section
   - Look for branch-specific settings
   - Disable automatic deployments for `main` branch

3. **Enable Preview Deployments**
   - Ensure preview deployments are enabled
   - All branches should create preview deployments by default

---

### Option 3: Use Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Link your project (if not already linked)
cd astrosetu
vercel link

# Set production branch to non-existent branch
vercel env pull .env.local  # This will create a .vercel folder if needed
# Then manually edit .vercel/project.json or use dashboard
```

---

## 🎯 Expected Behavior After Fix

### Before Fix:
- Push to `main` → Creates **Production** deployment ❌

### After Fix:
- Push to `main` → Creates **Preview** deployment ✅
- Push to `feature-branch` → Creates **Preview** deployment ✅
- Create PR → Creates **Preview** deployment ✅
- Push to `production` → Creates **Production** deployment (if branch exists)

---

## 🔍 Verify It's Working

1. **Push a commit to main:**
   ```bash
   git add .
   git commit -m "Test preview deployment"
   git push origin main
   ```

2. **Check Vercel Dashboard:**
   - Go to **Deployments** tab
   - New deployment should show:
     - ✅ Environment: **Preview** (not Production)
     - ✅ URL: `https://astrosetu-app-git-main-[team].vercel.app`
     - ✅ Green "Ready" status

3. **Check Deployment Details:**
   - Click on the deployment
   - Should show "Preview Deployment" badge
   - Should NOT show "Production" badge

---

## 📋 Quick Checklist

- [ ] Removed `git.deploymentEnabled` from `vercel.json` (already done)
- [ ] Go to Vercel Dashboard → Settings → General
- [ ] Change Production Branch from `main` to `production` (or non-existent branch)
- [ ] Save changes
- [ ] Push a test commit to `main`
- [ ] Verify preview deployment is created
- [ ] Confirm no production deployment is created

---

## 🚨 Troubleshooting

### Still Creating Production Deployments?

1. **Check Production Branch Setting:**
   - Ensure it's NOT set to `main`
   - Set it to a branch that doesn't exist (like `production`)

2. **Check Git Integration:**
   - Settings → Git
   - Ensure automatic deployments are enabled
   - Preview deployments should be enabled by default

3. **Manual Override:**
   - Delete/cancel any production deployments
   - Next push should create preview instead

### Preview Deployments Not Creating?

1. **Check Vercel Hooks:**
   - Settings → Git
   - Ensure webhooks are active
   - Check GitHub webhook delivery logs

2. **Verify Branch:**
   - Try pushing to a different branch (e.g., `test`)
   - Should create preview deployment
   - If it works, the issue is with `main` branch config

---

## 💡 Alternative: Use Feature Branch Workflow

If you can't change the production branch setting:

1. **Create a feature branch:**
   ```bash
   git checkout -b preview/test-changes
   git push origin preview/test-changes
   ```

2. **This will create a preview deployment automatically**

3. **Merge to main later** (when ready for production)

---

## 📞 Still Not Working?

If preview deployments still don't work:

1. **Check Vercel Project Settings:**
   - Ensure the project is connected to GitHub
   - Verify repository name matches

2. **Check GitHub Webhooks:**
   - Go to GitHub repository → Settings → Webhooks
   - Verify Vercel webhook is active
   - Check recent deliveries

3. **Contact Vercel Support:**
   - If dashboard settings don't work
   - They can help configure preview-only deployments

---

**Last Updated:** December 26, 2024

