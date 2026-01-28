# 🔍 Troubleshooting Vercel Deployment Issues

## Current Issue: No Fresh Deployments

**Problem:** Vercel is not creating deployments from test branches or recent commits.

---

## 🔍 Diagnosis Steps

### Step 1: Verify GitHub Integration

1. **Go to Vercel Dashboard**
   - Settings → Git → Connected Git Repository
   - Verify: `amitmandal00/astroSetu` is connected
   - Verify: Integration is active and synced

### Step 2: Check Branch Tracking

1. **Go to Settings → Environments**
   - Check which branches are being tracked
   - Verify: `main`, `production-disabled`, `test/*` branches are visible

### Step 3: Verify Ignore Command

The `vercel.json` currently has:
```json
"ignoreCommand": "[ \"$VERCEL_GIT_COMMIT_REF\" = \"main\" ] && exit 0 || exit 1"
```

**This means:**
- If branch is `main` → Exit 0 (skip build)
- If branch is NOT `main` → Exit 1 (proceed with build)

---

## 🚨 Possible Issues

### Issue 1: Ignore Command Blocking Everything

**Symptom:** No deployments from any branch

**Test:** Temporarily disable ignore command:

```json
// Comment out or remove ignoreCommand temporarily
// "ignoreCommand": "[ \"$VERCEL_GIT_COMMIT_REF\" = \"main\" ] && exit 0 || exit 1"
```

### Issue 2: Branch Not Tracked by Vercel

**Symptom:** Preview branches don't trigger deployments

**Solution:**
1. Go to Vercel Dashboard → Settings → Git
2. Check "Automatically deploy all branches" is enabled
3. OR manually add branch to tracked branches

### Issue 3: Ignore Command Syntax Error

**Test:** Check build logs for ignore step errors

1. Go to any recent deployment
2. Click to view build logs
3. Look for "Ignoring build step" or errors

---

## ✅ Alternative Solution: Use Dashboard Ignore

If `vercel.json` ignore command is causing issues:

### Option 1: Remove from vercel.json, Use Dashboard

1. **Remove from `vercel.json`:**
   ```json
   // Remove this line:
   // "ignoreCommand": "[ \"$VERCEL_GIT_COMMIT_REF\" = \"main\" ] && exit 0 || exit 1"
   ```

2. **Set in Dashboard:**
   - Settings → Git → Ignored Build Step
   - Enter: `[ "$VERCEL_GIT_COMMIT_REF" = "main" ] && exit 0 || exit 1`

### Option 2: Different Ignore Logic

Try a more explicit command:
```json
"ignoreCommand": "test \"$VERCEL_GIT_COMMIT_REF\" = \"main\""
```

Or inverted logic (skip if NOT main):
```json
"ignoreCommand": "test \"$VERCEL_GIT_COMMIT_REF\" != \"main\" && exit 1 || exit 0"
```

---

## 🧪 Test Steps

### Test 1: Temporarily Disable Ignore

1. Remove `ignoreCommand` from `vercel.json`
2. Push to `main`
3. Should create deployment
4. Re-enable after testing

### Test 2: Force Preview Deployment

```bash
# Push to feature branch
git checkout -b test/force-deploy
git push origin test/force-deploy

# Check Vercel dashboard
# Should create preview deployment
```

### Test 3: Manual Deployment via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy as preview
vercel --preview

# This should work regardless of ignore command
```

---

## 📋 Check These Settings

1. ✅ **Git Integration:** Connected and active?
2. ✅ **Branch Tracking:** Are all branches tracked?
3. ✅ **Ignore Command:** Working correctly?
4. ✅ **Build Settings:** Correct root directory (`astrosetu`)?
5. ✅ **Environment Variables:** All set correctly?

---

## 🔧 Quick Fix: Remove Ignore Command

If deployments aren't working at all, temporarily remove the ignore command:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "regions": ["bom1"],
  // Temporarily removed ignoreCommand
  // "ignoreCommand": "[ \"$VERCEL_GIT_COMMIT_REF\" = \"main\" ] && exit 0 || exit 1",
  "env": {
    "NODE_ENV": "production"
  }
}
```

Then:
1. Push the change
2. Test if deployments work
3. Re-add ignore command with correct syntax if needed

---

**Last Updated:** December 26, 2024

