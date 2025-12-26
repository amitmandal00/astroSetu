# 🔧 Solution: Ignore Build Step for Main Branch

Since the Production Branch setting isn't preventing deployments from `main`, we'll use **Ignore Build Step** to skip automatic deployments.

---

## ✅ Method 1: Using `vercel.json` (Recommended)

The `vercel.json` file already contains the correct configuration:

```json
{
  "ignoreCommand": "[ \"$VERCEL_GIT_COMMIT_REF\" = \"main\" ] && exit 0 || exit 1"
}
```

**What this does:**
- Checks if the branch is `main`
- If true, exits with code 0 (skip build)
- If false, exits with code 1 (proceed with build)

**This is already configured in your `vercel.json`!** ✅

---

## ✅ Method 2: Using Vercel Dashboard (Alternative)

If you prefer to set it in the dashboard:

### Step 1: Go to Settings → Git

1. **Vercel Dashboard**
   - Go to your project: `astrosetu-app`
   - Click **Settings** tab
   - Click **"Git"** in the left sidebar (NOT "Build and Deployment")

### Step 2: Find "Ignored Build Step"

1. **Scroll down** to find the **"Ignored Build Step"** field
2. **Enter this command:**
   ```bash
   [ "$VERCEL_GIT_COMMIT_REF" = "main" ] && exit 0 || exit 1
   ```
3. **Click Save**

**Note:** The `vercel.json` method is already configured, so you don't need to do this manually unless you want to override the file setting.

---

## 🎯 Result

**After configuration:**
- ✅ Push to `main` → Build is **skipped** → No deployment created
- ✅ Push to `feature-branch` → Build runs → Creates **Preview** deployment
- ✅ Create PR → Build runs → Creates **Preview** deployment
- ✅ Manual deploy via CLI → Always works

---

## ✅ To Deploy Manually (When Needed)

When you want to deploy from `main`, use Vercel CLI:

```bash
# Deploy as preview (not production)
vercel --preview

# Or deploy to production explicitly
vercel --prod
```

---

## ⚠️ Important Note

With this approach:
- Automatic deployments from `main` are **disabled**
- You must manually deploy when needed
- All other branches will deploy normally (as preview)

---

## 🔍 Verify It Works

1. **Push a commit to `main`:**
   ```bash
   git add .
   git commit -m "Test ignore build"
   git push origin main
   ```

2. **Check Vercel Dashboard:**
   - Should **NOT** create a new deployment
   - No build triggered for `main` branch

3. **Push to feature branch:**
   ```bash
   git checkout -b test/preview
   git push origin test/preview
   ```
   - Should create **Preview** deployment

---

## 📋 Current Configuration

**Location:** `vercel.json`  
**Command:** `[ "$VERCEL_GIT_COMMIT_REF" = "main" ] && exit 0 || exit 1`  
**Status:** ✅ Active

**How it works:**
- Exit code 0 = Skip build (deployment ignored)
- Exit code 1 (or any non-zero) = Proceed with build (deployment created)

---

**This is the most reliable way to prevent automatic production deployments from main.**
