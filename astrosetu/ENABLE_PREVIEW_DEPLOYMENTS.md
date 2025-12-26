# ✅ How to Enable Preview Deployments on Vercel

## 🎯 Correct Location: Settings → Environments

The Production Branch setting is in **Settings → Environments** (NOT General).

---

## 📋 Step-by-Step Instructions

### Step 1: Go to Settings → Environments

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your `astrosetu-app` project

2. **Navigate to Settings → Environments**
   - Click **Settings** tab (top navigation)
   - Click **"Environments"** in the left sidebar
   - (It's in the middle of the list, not at the top)

### Step 2: Modify Production Branch

1. **Click on "Production" environment**
   - You'll see a list: Production, Preview, Development
   - Click on **"Production"** (first one)

2. **Find "Branch Tracking" section**
   - Scroll down within the Production environment settings
   - Look for **"Branch Tracking"** or **"Production Branch"** field

3. **Change the branch**
   - Currently shows: `main`
   - **Change it to:** `production` (or `production-disabled`)
   - Click **Save**

### Step 3: Verify

1. **Push a test commit:**
   ```bash
   echo "// test" >> src/app/page.tsx
   git add .
   git commit -m "Test preview deployment"
   git push origin main
   ```

2. **Check Deployments tab:**
   - New deployment should show **"Preview"** (not Production)
   - URL format: `https://astrosetu-app-git-main-[team].vercel.app`

---

## 🎯 What This Does

**Before:**
- Push to `main` → Creates **Production** deployment ❌

**After:**
- Push to `main` → Creates **Preview** deployment ✅
- Only pushes to `production` branch would create Production deployments
- Since `production` branch doesn't exist, no automatic production deployments

---

## 🔍 If You Still Can't Find It

### Alternative: Check All Settings Locations

1. **Settings → Environments** ← Try this first (correct location)
2. **Settings → Build and Deployment** ← Check here too
3. **Settings → Git** ← Might have branch settings here
4. **Settings → General** ← Usually not here, but check

### If Setting is Not Available

The Production Branch setting might not be available on **Hobby plan**. In that case:

**Use Feature Branch Workflow:**
```bash
# Instead of pushing to main, use feature branches
git checkout -b preview/test-changes
git push origin preview/test-changes
# This automatically creates preview deployment
```

---

## 📞 Quick Checklist

- [ ] Go to Settings → Environments
- [ ] Click "Production" environment
- [ ] Find "Branch Tracking" / "Production Branch"
- [ ] Change from `main` to `production`
- [ ] Save changes
- [ ] Push test commit to `main`
- [ ] Verify it creates Preview deployment

---

**Location:** Settings → Environments → Production → Branch Tracking

