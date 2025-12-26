# 🔒 Vercel Preview-Only Configuration Guide

This guide explains how to configure Vercel to **only deploy preview/pre-production environments** and **disable production deployments**.

---

## ✅ Configuration Complete

The `vercel.json` has been updated to disable automatic production deployments from the `main` branch.

---

## 🎯 Steps to Disable Production in Vercel Dashboard

### Method 1: Disable Production Deployments via Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in to your account

2. **Navigate to Your Project**
   - Select the `astroSetu` project

3. **Go to Settings → Git**
   - Click on **Settings** tab
   - Navigate to **Git** section

4. **Disable Production Branch**
   - Under **Production Branch**, find the branch (usually `main`)
   - Click on the **Settings** icon next to the branch
   - **Uncheck** or **Disable** "Automatic Deployments"
   - Or set it to a non-existent branch like `production-disabled`

5. **Save Changes**

---

### Method 2: Pause Production Deployment (Temporary)

1. **Go to Deployments Page**
   - In your project, click on **Deployments** tab

2. **Find Production Deployment**
   - Look for the latest production deployment (marked with 🌿 Production badge)

3. **Pause Deployment**
   - Click the **three dots** (⋯) menu
   - Select **Pause** or **Cancel**

---

### Method 3: Delete Production Domain (Removes Public Access)

1. **Go to Settings → Domains**
   - Click on **Settings** tab
   - Navigate to **Domains** section

2. **Remove Production Domain**
   - Find your production domain (e.g., `astrosetu-app.vercel.app`)
   - Click **Remove** or **Delete**
   - Confirm the deletion

   **Note:** This removes public access but the deployment still exists.

---

### Method 4: Use Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Disable production deployments (run from project root)
vercel env rm PRODUCTION --yes 2>/dev/null || echo "No production env var"
```

**Or create a deployment with preview flag:**
```bash
# Deploy only as preview (not production)
vercel --preview
```

---

## 🔍 Verify Configuration

### Check Current Deployment Status

1. **In Vercel Dashboard:**
   - Go to **Deployments** tab
   - You should see:
     - ✅ Preview deployments (for PRs/commits)
     - ❌ No active production deployments

2. **Check Git Configuration:**
   ```bash
   # View vercel.json configuration
   cat vercel.json | grep -A 3 "git"
   ```

---

## 📋 Preview Deployment Workflow

### Deploy Preview Environments Only

**For Pull Requests:**
- When you create a PR, Vercel will automatically create a preview deployment
- Preview URL: `https://astrosetu-app-git-[branch-name]-[your-team].vercel.app`

**For Commits (Manual Preview):**
```bash
# Push to a feature branch (NOT main)
git checkout -b feature/preview-test
git push origin feature/preview-test

# This will create a preview deployment, not production
```

**Using Vercel CLI:**
```bash
# Deploy as preview only
vercel --preview

# Or specify branch
vercel --preview --branch=develop
```

---

## ⚠️ Important Notes

### Current Production Deployment

If you have an **active production deployment**:
1. It will remain accessible until you:
   - Remove the domain (Method 3)
   - Pause the deployment (Method 2)
   - Or let it expire (if not actively maintained)

2. To **completely remove** production access:
   - Remove the production domain from Vercel dashboard
   - Or configure a password protection in Vercel dashboard

### Re-enabling Production Later

When you're ready to re-enable production:

1. **In vercel.json:**
   ```json
   {
     "git": {
       "deploymentEnabled": {
         "main": true  // Change back to true
       }
     }
   }
   ```

2. **In Vercel Dashboard:**
   - Re-enable automatic deployments for `main` branch
   - Re-add production domain (if removed)

---

## 🛡️ Additional Security Measures

### Protect Production Branch (Recommended)

Add branch protection in GitHub:

1. Go to GitHub repository → **Settings** → **Branches**
2. Add branch protection rule for `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Include administrators

### Password Protect Preview Deployments (Optional)

In Vercel Dashboard:
1. Go to **Settings** → **Deployment Protection**
2. Enable **Password Protection** for preview deployments

---

## 📊 Monitoring Preview Deployments

### Check Deployment Status

```bash
# List all deployments
vercel ls

# List only preview deployments
vercel ls --preview
```

### View Deployment Logs

```bash
# View logs for specific deployment
vercel logs [deployment-url]
```

---

## 🔄 Workflow Summary

**Current State:**
- ✅ Preview deployments: **Enabled**
- ❌ Production deployments: **Disabled**
- 🔒 Production domain: **Should be removed/paused**

**What Happens Now:**
1. Pushes to `main` → **No automatic deployment**
2. Pull Requests → **Preview deployment created**
3. Feature branches → **Preview deployment created**
4. Manual preview → **Works via Vercel CLI**

---

## 📞 Support

If you need help:
1. Check Vercel documentation: https://vercel.com/docs
2. Review project settings in Vercel dashboard
3. Contact Vercel support if needed

---

**Last Updated:** December 26, 2024
**Status:** Production deployments disabled, preview-only mode active

