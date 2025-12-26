# 🔧 Alternative Methods: Enable Preview Deployments

Since the "Production Branch" setting is not visible in your Vercel dashboard, here are alternative methods:

---

## ✅ Method 1: Use Ignore Build Step (Recommended)

This prevents automatic deployments from `main` but allows manual preview deployments.

### Steps:

1. **Go to Settings → Build and Deployment**
   - Click **Settings** tab
   - Click **"Build and Deployment"** in the left sidebar

2. **Find "Ignore Build Step"**
   - Scroll down to find this section
   - It allows you to skip builds for certain conditions

3. **Add Ignore Condition:**
   ```bash
   # Skip production deployments from main branch
   [ "$VERCEL_GIT_COMMIT_REF" = "main" ] && [ "$VERCEL" = "1" ]
   ```
   
   OR simpler:
   ```bash
   # Always skip automatic deployments from main
   [ "$VERCEL_GIT_COMMIT_REF" = "main" ]
   ```

4. **Save Changes**

**Note:** This will skip ALL deployments from `main`, so you'll need to use manual preview deployments.

---

## ✅ Method 2: Create Dummy Production Branch

Force `main` to be a non-production branch by creating a separate production branch:

```bash
# Create a production branch (but don't use it)
git checkout -b production
git push origin production

# Go back to main
git checkout main
```

Then in Vercel:
1. Go to **Settings → Git**
2. If Production Branch option appears, set it to `production`
3. Now `main` will create preview deployments

---

## ✅ Method 3: Use Vercel CLI

Set production branch via command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project (if not already linked)
cd astrosetu
vercel link

# Create a .vercel/project.json file
mkdir -p .vercel
cat > .vercel/project.json << EOF
{
  "projectId": "prj_0arChV06ayfWJKRAh6wmjGjH9v5K",
  "orgId": "your-org-id"
}
EOF

# Use Vercel CLI to configure
# (Production branch setting might be available via CLI)
```

---

## ✅ Method 4: Use Branch-Based Environment Variables

Set an environment variable that prevents production deployment:

1. **Go to Settings → Environment Variables**
   - Click **Settings** tab
   - Click **"Environment Variables"** in left sidebar

2. **Add Variable:**
   - Name: `VERCEL_PRODUCTION_BRANCH`
   - Value: `production` (or any branch that doesn't exist)
   - Environment: Production, Preview, Development

3. **This might force Vercel to treat main as preview**

---

## ✅ Method 5: Manual Preview Deployment Workflow

If automatic preview deployments aren't possible, use this workflow:

### Workflow:
```bash
# Instead of pushing directly to main, create a feature branch
git checkout -b preview/your-feature-name
git push origin preview/your-feature-name

# This will create a preview deployment automatically
# Test on preview deployment
# When ready, merge to main (but it won't auto-deploy)
```

### Manual Preview Deploy:
```bash
# Deploy as preview manually
vercel --preview

# Or deploy specific branch as preview
vercel --preview --branch=main
```

---

## ✅ Method 6: Check "Build and Deployment" Settings

1. **Go to Settings → Build and Deployment**
   - Click **Settings** tab
   - Click **"Build and Deployment"** in left sidebar

2. **Look for:**
   - "Production Branch" setting (might be here instead of General)
   - "Branch Protection" settings
   - "Deployment Protection" settings

3. **Check "Git" settings again:**
   - Go to **Settings → Git**
   - Look for any branch-related configuration
   - Check if there are per-branch settings

---

## ✅ Method 7: Use GitHub Branch Protection + Vercel

1. **Create a `production` branch in GitHub:**
   ```bash
   git checkout -b production
   git push origin production
   ```

2. **In GitHub:**
   - Go to repository → Settings → Branches
   - Set `production` as the default branch (temporarily)
   - Or add branch protection to `main`

3. **In Vercel:**
   - Disconnect and reconnect Git integration
   - Vercel might pick up `production` as production branch

---

## 🎯 Recommended Solution

Since the Production Branch setting isn't visible, I recommend:

### Option A: Use Feature Branches (Easiest)
```bash
# Always work in feature branches
git checkout -b feature/my-changes
git push origin feature/my-changes
# Creates preview deployment automatically

# When ready, merge to main (won't auto-deploy)
git checkout main
git merge feature/my-changes
git push origin main
```

### Option B: Manual Preview Deployments
```bash
# Push to main
git push origin main

# Then manually deploy as preview
vercel --preview
```

### Option C: Check Other Settings Locations
1. **Settings → Build and Deployment** - Look for branch settings
2. **Settings → Git** - Check for per-branch configuration
3. **Settings → Deployment Protection** - Might have branch rules

---

## 🔍 Troubleshooting

### Check Vercel Plan
The Production Branch setting might only be available on:
- Pro plan or higher
- Team plans
- Enterprise plans

If you're on Hobby plan, you might need to:
- Upgrade to Pro, OR
- Use the alternative methods above

### Check Vercel CLI Version
```bash
vercel --version
# Update if needed
npm i -g vercel@latest
```

### Contact Vercel Support
If none of these work, contact Vercel support:
- They can help configure preview-only deployments
- They can check if Production Branch is available on your plan
- They can manually configure your project settings

---

## 📝 Quick Test

After trying any method, test it:

1. **Make a small change:**
   ```bash
   echo "// test" >> src/app/page.tsx
   git add .
   git commit -m "Test preview deployment"
   git push origin main
   ```

2. **Check Vercel Dashboard:**
   - Go to Deployments tab
   - New deployment should be "Preview" (not Production)

3. **If it still shows Production:**
   - Try Method 1 (Ignore Build Step)
   - Or use feature branch workflow (Method 5)

---

**Last Updated:** December 26, 2024

