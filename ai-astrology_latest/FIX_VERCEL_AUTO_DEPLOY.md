# Fix Vercel Automatic Deployments

## Issue

Vercel is not automatically triggering builds when you push to GitHub.

**Root Cause:** Repository name mismatch
- Your Git remote: `https://github.com/amitmandal00/astroSetu`
- Vercel is watching: `amitmandal00/astrosetu-app`

## Solution: Update Vercel Git Integration

### Option 1: Connect to the Correct Repository (Recommended)

1. **Go to Vercel Dashboard:**
   - Navigate to your project: `astrosetu-app`
   - Go to **Settings** → **Git**

2. **Disconnect Current Repository:**
   - Find the "Connected Git Repository" section
   - Click **"Disconnect"** or **"Change"**

3. **Connect the Correct Repository:**
   - Click **"Connect Git Repository"**
   - Search for: `astroSetu` (with capital S)
   - Select: `amitmandal00/astroSetu`
   - Choose branch: `main`
   - Click **"Connect"**

4. **Update Root Directory:**
   - Make sure **Root Directory** is set to: `astrosetu`
   - Go to **Settings** → **General** → **Root Directory**

5. **Save and Redeploy:**
   - Click **"Save"**
   - Go to **Deployments** → Click **"Redeploy"**

### Option 2: Rename GitHub Repository (Alternative)

If you prefer to keep the Vercel project name as `astrosetu-app`:

1. **Go to GitHub:**
   - Navigate to: https://github.com/amitmandal00/astroSetu
   - Go to **Settings** → **General**
   - Scroll to **Repository name**
   - Rename to: `astrosetu-app`
   - Click **"Rename"**

2. **Update Local Git Remote:**
   ```bash
   cd /Users/amitkumarmandal/Documents/astroCursor
   git remote set-url origin https://github.com/amitmandal00/astrosetu-app.git
   git remote -v  # Verify
   ```

3. **Push to New Repository Name:**
   ```bash
   git push origin main
   ```

4. **Vercel Should Auto-Detect:**
   - Vercel should now automatically trigger builds

## Verify Current Configuration

### Check Your Git Remote:
```bash
cd /Users/amitkumarmandal/Documents/astroCursor
git remote -v
```

Should show:
```
origin  https://github.com/amitmandal00/astroSetu.git (fetch)
origin  https://github.com/amitmandal00/astroSetu.git (push)
```

### Check Vercel Git Settings:
1. Go to Vercel → Your Project → **Settings** → **Git**
2. Check what repository is connected
3. Verify the branch is `main`

## After Fixing

Once connected correctly:

1. **Test Automatic Deployment:**
   ```bash
   # Make a small change
   echo "# Test" >> README.md
   git add README.md
   git commit -m "Test auto-deploy"
   git push origin main
   ```

2. **Check Vercel Dashboard:**
   - Go to **Deployments**
   - You should see a new deployment start automatically
   - It should show: "Triggered by push to `main`"

## Troubleshooting

### If Still Not Working:

1. **Check GitHub Permissions:**
   - Go to Vercel → **Settings** → **Git**
   - Make sure Vercel has access to your GitHub account
   - Re-authorize if needed

2. **Check Webhook:**
   - Go to GitHub → Your Repository → **Settings** → **Webhooks**
   - Look for Vercel webhook
   - Should show recent deliveries

3. **Manual Trigger:**
   - While fixing, you can manually trigger deployments:
   - Vercel → **Deployments** → **"Redeploy"**

## Quick Fix Summary

**The Problem:** Vercel is watching `astrosetu-app` but your repo is `astroSetu`

**The Solution:** 
- Go to Vercel → Settings → Git
- Disconnect current repo
- Connect to `amitmandal00/astroSetu`
- Set Root Directory to `astrosetu`
- Save and test

---

**After fixing, every `git push origin main` will automatically trigger a Vercel build!** 🚀
