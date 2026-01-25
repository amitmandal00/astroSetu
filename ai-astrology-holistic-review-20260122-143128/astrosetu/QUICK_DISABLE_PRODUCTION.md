# 🚫 Quick Guide: Enable Preview Deployments (Disable Auto-Production)

## 🎯 Goal
Configure Vercel so that pushes to `main` create **Preview** deployments instead of **Production** deployments.

---

## ✅ Method 1: Change Production Branch (RECOMMENDED - Fixes Preview Deployments)

**This is the correct way to enable preview deployments:**

1. **Go to Settings → General**
   - Click **Settings** tab (top navigation)
   - Click **General** in the left sidebar (first option, at the top)

2. **Change Production Branch**
   - Scroll down to find **"Production Branch"** section
   - Currently shows: `main`
   - **Change dropdown to:** `production` (or type a branch name that doesn't exist)
   - Click **Save**

3. **Result:**
   - ✅ Pushes to `main` will now create **Preview** deployments
   - ✅ Production deployments only if you push to `production` branch (which doesn't exist)
   - ✅ Preview URL format: `https://astrosetu-app-git-main-[team].vercel.app`

**This is the ONLY way to enable preview deployments while disabling auto-production from main branch.**

---

## ✅ Method 2: Pause Production Deployment (Temporary Fix)

1. **Go to Deployments Tab**
   - Click **"Deployments"** at the top (next to "Overview", "Analytics", etc.)

2. **Find Production Deployment**
   - Look for the deployment with 🌿 **Production** badge
   - It's usually the most recent one

3. **Pause It**
   - Click the **three dots** (⋯) menu on the right side
   - Select **"Pause"** or **"Cancel Deployment"**
   - Confirm

**Done!** Production site is now paused.

---

## ✅ Method 2: Remove Production Domain (Recommended)

1. **Go to Settings → Domains**
   - Click **"Settings"** tab (you're already there)
   - Click **"Domains"** in the left sidebar (it's under "Build and Deployment")

2. **Remove the Domain**
   - You'll see your production domain (e.g., `astrosetu-app.vercel.app`)
   - Click the **three dots** (⋯) next to it
   - Click **"Remove"**
   - Confirm

**Done!** Production site is no longer accessible.

---

## ✅ Method 3: Check Settings → General (If Available)

1. **Go to Settings → General**
   - Click **"Settings"** tab
   - Click **"General"** at the top of the left sidebar

2. **Look for Production Branch**
   - Scroll down to see if there's a "Production Branch" section
   - If you see it, you can change it to a non-existent branch

**Note:** This option might not be visible on all Vercel plans.

---

## 🎯 Recommended Approach

**For immediate effect, use Method 1 or Method 2:**
- **Method 1** = Pauses the deployment (quick, reversible)
- **Method 2** = Removes public access (more permanent)

Both will effectively disable your production site from being accessed.

---

## 🔍 Verify It Worked

1. Try visiting your production URL (e.g., `https://astrosetu-app.vercel.app`)
2. You should see a 404 or "Deployment not found" error
3. Preview deployments will still work fine

---

## 📝 What Happens After

- ✅ Preview deployments (for PRs/feature branches) will still work
- ✅ Manual preview deployments (`vercel --preview`) will work
- ❌ Production deployments from `main` branch will be disabled/paused
- ❌ Production site will not be publicly accessible

---

**Need help?** The `vercel.json` file already has production disabled configured, so even if you can't find these settings, future pushes to `main` won't auto-deploy to production.

