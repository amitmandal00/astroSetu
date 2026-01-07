# 🔀 Merge production-disabled to main - Step-by-Step Guide

**Goal**: Merge `production-disabled` → `main` so Vercel deploys to production URL

---

## ✅ **PRE-MERGE CHECKLIST**

Before starting:
- [ ] All changes committed on `production-disabled`
- [ ] Backup/create branch if needed
- [ ] Know how to resolve conflicts (if any)

---

## 🚀 **STEP-BY-STEP COMMANDS**

### **Step 1: Commit Current Changes (if any)**

If you have uncommitted changes:
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
git add .
git commit -m "chore: Prepare for merge to main"
```

### **Step 2: Checkout main**

```bash
git checkout main
```

### **Step 3: Pull Latest main**

```bash
git pull origin main
```

### **Step 4: Merge production-disabled into main**

```bash
git merge production-disabled
```

**If conflicts occur**:
1. Git will show which files have conflicts
2. Open those files and resolve conflicts
3. After resolving:
   ```bash
   git add .
   git commit -m "chore: Merge production-disabled into main"
   ```

**If no conflicts**:
- Git will auto-create merge commit
- You're ready for next step

### **Step 5: Push to main**

```bash
git push origin main
```

---

## 🔍 **AFTER PUSH - VERIFY IN VERCEL**

### **Step 6: Verify Vercel Production Branch**

1. **Go to Vercel Dashboard**:
   - Project Settings → Environments
   - Production section

2. **Check Branch Tracking**:
   - Should show: **"Branch is: main"**
   - **NOT**: `production-disabled`

3. **If it shows `production-disabled`**:
   - Click "Edit" or change branch
   - Select **"main"**
   - Save

### **Step 7: Verify Deployment**

1. **Go to Deployments tab**
2. **Check for new deployment** from `main` branch
3. **Verify it's in Production environment**
4. **Check production URL**: `https://astrosetu-app.vercel.app/`

---

## ⚠️ **IF CONFLICTS OCCUR**

### **How to Resolve Conflicts**:

1. **Git will show conflict files**:
   ```
   Auto-merging path/to/file.ts
   CONFLICT (content): Merge conflict in path/to/file.ts
   ```

2. **Open the file** and look for conflict markers:
   ```typescript
   <<<<<<< HEAD
   // Code from main branch
   =======
   // Code from production-disabled branch
   >>>>>>> production-disabled
   ```

3. **Choose which code to keep** or merge both:
   - Keep main's version: Delete everything between `<<<<<<<` and `=======`
   - Keep production-disabled: Delete everything between `=======` and `>>>>>>>`
   - Keep both: Edit manually to combine changes

4. **After resolving**:
   ```bash
   git add path/to/resolved-file.ts
   git commit -m "chore: Resolve merge conflicts"
   git push origin main
   ```

---

## ✅ **SUCCESS CRITERIA**

After completing all steps:

- [ ] `production-disabled` merged into `main`
- [ ] Changes pushed to `main` branch
- [ ] Vercel Production branch = `main`
- [ ] New deployment triggered from `main`
- [ ] Production URL works: `https://astrosetu-app.vercel.app/`
- [ ] AI section accessible and working

---

## 📋 **QUICK REFERENCE**

**Complete Command Sequence**:
```bash
# 1. Commit any changes on production-disabled
git add .
git commit -m "chore: Prepare for merge"

# 2. Switch to main
git checkout main

# 3. Update main
git pull origin main

# 4. Merge
git merge production-disabled

# 5. If conflicts: resolve, then:
#    git add .
#    git commit -m "chore: Resolve merge conflicts"

# 6. Push
git push origin main
```

---

## 🎯 **EXPECTED OUTCOME**

After push:
1. ✅ Vercel detects changes on `main`
2. ✅ Creates new deployment automatically
3. ✅ Deploys to Production environment
4. ✅ Production URL becomes active: `https://astrosetu-app.vercel.app/`
5. ✅ AI section accessible at base URL (if `AI_ONLY_MODE` enabled)

---

**Last Updated**: January 6, 2026  
**Status**: Ready to Execute

