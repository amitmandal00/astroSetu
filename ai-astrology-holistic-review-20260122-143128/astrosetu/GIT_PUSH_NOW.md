# 🚀 Git Push Commands

## Step-by-Step Commands

Run these commands in your terminal:

### 1. Navigate to Project Directory

```bash
cd astrosetu
```

### 2. Check Changed Files

```bash
git status
```

You should see modified files (if any).

### 3. Stage Changes

```bash
git add .
```

Or stage specific files:
```bash
git add src/lib/astrologyAPI.ts src/app/api/astrology/diagnostic/route.ts
```

### 4. Commit Changes

```bash
git commit -m "Update ProKerala credentials and fix authentication"
```

Or more descriptive:
```bash
git commit -m "Fix ProKerala: Update credentials, enhance diagnostics, enforce GET for panchang"
```

### 5. Push to GitHub

```bash
git push origin main
```

---

## Complete Command Sequence

Copy and paste this entire block:

```bash
cd astrosetu
git add .
git commit -m "Update ProKerala credentials and fix authentication"
git push origin main
```

---

## After Pushing

1. **Vercel will auto-deploy** (if connected to GitHub)
2. **Or manually redeploy:**
   - Go to Vercel Dashboard → Deployments
   - Click "..." → "Redeploy"
   - **Uncheck** "Use existing Build Cache"
   - Click "Redeploy"

3. **Wait 3-5 minutes** for deployment

4. **Test:**
   ```bash
   curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
   ```

---

## What's Being Pushed

- ✅ Updated authentication code (form-encoded body per ProKerala docs)
- ✅ Enhanced diagnostic endpoint with credential previews
- ✅ Triple GET method enforcement for panchang
- ✅ Better error logging and debugging
- ✅ Auto-trimming of credentials

**Note:** `.env.local` is NOT pushed (it's in `.gitignore` - correct!)

---

## Quick Test After Deploy

```bash
# Test diagnostic
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'

# Check secret preview
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.authDiagnostic.clientSecretPreview'
```

Should show new secret: `"Oz9i...5Ilk"` (not old `"06SC...YZ6o"`)

---

## Summary

```bash
cd astrosetu
git add .
git commit -m "Update ProKerala credentials and fix authentication"
git push origin main
```

Then redeploy on Vercel and test!

