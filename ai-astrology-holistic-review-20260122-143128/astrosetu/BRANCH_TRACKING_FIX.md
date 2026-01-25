# 🔧 Fix: Automatic Deployments Not Triggering

## Issue
Fresh deployments not being triggered automatically from branches.

---

## ✅ Solution: Enable Branch Tracking

### Step 1: Remove Branch Filter
**You're currently viewing only `main` branch deployments.**

1. **In Vercel Dashboard:**
   - Click the **"All Branches..."** dropdown (top of deployments list)
   - Or remove `?filterBranch=main` from URL
   - Select **"All Branches"** to see all deployments

2. **Check for preview deployments:**
   - Look for `test/verify-preview` branch
   - Look for `test/deployment-fix` branch
   - These should show as **Preview** deployments

---

### Step 2: Verify Git Integration

1. **Go to Settings → Git**
2. **Check "Connected Git Repository":**
   - Repository: `amitmandal00/astroSetu`
   - Status: Should be **Active**
   - If not connected or inactive, reconnect

3. **Check for "Deploy all branches" option:**
   - Some Vercel projects have this toggle
   - Should be enabled for automatic deployments

---

### Step 3: Check Branch Detection

Vercel may need to detect branches first. Try:

**Option A: Create Pull Request**
1. Go to GitHub repository
2. Create PR from `test/verify-preview` → `main`
3. This triggers Vercel to detect the branch
4. Should create preview deployment

**Option B: Manual Trigger via Dashboard**
1. Go to Deployments tab
2. Click **"Create Deployment"** (if available)
3. Select branch: `test/verify-preview`
4. Trigger manually

---

### Step 4: Verify Ignore Command Not Blocking Everything

The ignore command should only block `main`, not other branches.

**Check if command is correct:**
```json
"ignoreCommand": "[ \"$VERCEL_GIT_COMMIT_REF\" = \"main\" ] && exit 0 || exit 1"
```

**Logic:**
- If branch = `main` → Exit 0 (skip)
- If branch ≠ `main` → Exit 1 (proceed)

**Test:**
- Push to `main` → Should be ignored ✅
- Push to other branch → Should deploy ✅

---

## 🧪 Quick Diagnostic Test

### Test 1: Check All Deployments
1. **Remove branch filter** in Vercel dashboard
2. **Look for any deployment from:**
   - `test/verify-preview`
   - `test/deployment-fix`
   - `test/preview-deployment`

**If none exist:**
- Branches aren't being tracked
- Need to enable branch tracking

### Test 2: Create New Branch and Push
```bash
git checkout -b test/manual-trigger
echo "// Manual trigger test" >> test.txt
git add test.txt
git commit -m "TEST: Manual trigger deployment"
git push origin test/manual-trigger
```

**Wait 3-5 minutes, then:**
- Check Deployments (all branches)
- Should see preview deployment

---

## 🔧 Common Fixes

### Fix 1: Reconnect Git Integration
1. Settings → Git
2. Disconnect repository
3. Reconnect repository
4. Wait for sync

### Fix 2: Check Project Settings
1. Settings → General
2. Check **"Automatically deploy all branches"** (if option exists)
3. Save

### Fix 3: Use Deploy Hooks
1. Settings → Git → Deploy Hooks
2. Create a hook for `test/*` branches
3. Use hook URL to trigger deployments

### Fix 4: Verify Vercel App Settings
The project root is `astrosetu` subdirectory. Verify:
1. Settings → Build and Deployment
2. Root Directory: `astrosetu`
3. If incorrect, Vercel may not detect changes

---

## ✅ Expected Behavior After Fix

| Branch | Push Commit | Expected Result |
|--------|-------------|----------------|
| `main` | ✅ | ❌ NO deployment (ignored) |
| `test/*` | ✅ | ✅ Preview deployment |
| `feature/*` | ✅ | ✅ Preview deployment |

---

## 📋 Checklist

- [ ] Removed branch filter (viewing all branches)
- [ ] Checked for `test/verify-preview` deployment
- [ ] Verified Git integration is active
- [ ] Checked "Automatically deploy all branches" (if available)
- [ ] Root directory set to `astrosetu`
- [ ] Ignore command only blocks `main`
- [ ] Created test branch and pushed (manual trigger test)

---

**Next Step:** Remove the branch filter in Vercel and check for preview deployments from test branches.

