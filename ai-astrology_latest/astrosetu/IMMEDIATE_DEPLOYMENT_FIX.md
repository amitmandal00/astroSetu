# 🚨 Immediate Fix: Enable Automatic Deployments

## Problem
- Dashboard filtered to `main` branch only
- Preview branches not triggering automatic deployments

---

## ✅ Step 1: View All Branches (Do This First!)

**In Vercel Dashboard:**

1. **Remove the branch filter:**
   - Click **"All Branches..."** dropdown (top of deployments list)
   - Select **"All Branches"** (not just `main`)
   - OR manually remove `?filterBranch=main` from URL

2. **Check for preview deployments:**
   - Look for `test/verify-preview` branch
   - Look for `test/deployment-fix` branch
   - These should appear as **Preview** deployments (if they deployed)

---

## ✅ Step 2: Enable Branch Tracking

### Option A: Via Git Integration Settings

1. **Go to Settings → Git**
2. **Check repository connection:**
   - Repository: `amitmandal00/astroSetu`
   - Status: **Active** ✅
   - If not, reconnect

3. **Look for branch deployment options:**
   - Some Vercel projects have "Deploy all branches" toggle
   - Enable if available

### Option B: Via Project Settings

1. **Settings → General** (or **Build and Deployment**)
2. **Look for:**
   - "Automatically deploy all branches"
   - "Branch deployments"
   - Enable these options

---

## ✅ Step 3: Verify Root Directory

**Critical:** Your project is in `astrosetu` subdirectory.

1. **Settings → Build and Deployment**
2. **Root Directory:** Should be `astrosetu`
3. **If incorrect:**
   - Vercel won't detect changes correctly
   - Update and save

---

## ✅ Step 4: Test Branch Detection

Vercel may need to detect branches first. Try:

### Method 1: Create Pull Request
1. Go to GitHub: https://github.com/amitmandal00/astroSetu
2. Create PR from `test/verify-preview` → `main`
3. This triggers Vercel to detect the branch
4. Should create preview deployment automatically

### Method 2: Use Deploy Hook
1. **Settings → Git → Deploy Hooks**
2. **Create Hook:**
   - Name: `test-branches`
   - Branch: `test/*` (or leave empty for all)
   - Click **"Create Hook"**
   - Use hook URL to trigger deployments

---

## ✅ Step 5: Verify Ignore Command Logic

**Current config:**
```json
"ignoreCommand": "[ \"$VERCEL_GIT_COMMIT_REF\" = \"main\" ] && exit 0 || exit 1"
```

**This means:**
- `main` branch → Exit 0 (skip) ✅
- Other branches → Exit 1 (deploy) ✅

**Test:**
- Push to `main` → Should be ignored
- Push to `test/*` → Should deploy

---

## 🧪 Quick Test

### Create and Push Test Branch:
```bash
git checkout -b test/auto-deploy-check
echo "// Auto deploy test" >> test-auto.txt
git add test-auto.txt
git commit -m "TEST: Auto deploy from branch"
git push origin test/auto-deploy-check
```

**Wait 3-5 minutes, then:**
1. **Remove branch filter** in Vercel
2. **Check Deployments** (all branches)
3. **Should see** preview deployment from `test/auto-deploy-check`

---

## 🔍 Diagnosis Checklist

- [ ] **Removed branch filter** (viewing all branches)
- [ ] **Git integration active** (Settings → Git)
- [ ] **Root directory = `astrosetu`** (Build and Deployment)
- [ ] **"Deploy all branches" enabled** (if option exists)
- [ ] **Ignore command only blocks `main`**
- [ ] **Created test branch and pushed**
- [ ] **Waited 3-5 minutes** for deployment
- [ ] **Checked all branches** (not just main)

---

## ⚠️ If Still Not Working

### Alternative: Use Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Deploy preview manually
cd astrosetu
vercel --preview
```

This bypasses Git integration and deploys directly.

---

## 📋 Next Steps

1. ✅ **Remove branch filter** (see all deployments)
2. ✅ **Check Settings → Git** (verify connection)
3. ✅ **Check Root Directory** (should be `astrosetu`)
4. ✅ **Create PR from test branch** (triggers Vercel)
5. ✅ **Wait and check** deployments (all branches)

---

**Start with Step 1: Remove the branch filter to see all deployments!**

