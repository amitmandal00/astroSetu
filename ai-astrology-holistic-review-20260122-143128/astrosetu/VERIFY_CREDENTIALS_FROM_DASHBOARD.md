# ✅ Verify Credentials from ProKerala Dashboard

## Credentials from Dashboard

**Client ID:** `70b7ffb3-78f1-4a2f-9044-835ac8e5e642`  
**Client Secret:** `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk`

---

## ⚠️ CRITICAL: Character Mismatch Detected!

### What You Provided:
```
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk
```
**Has:** `AsXOcC0` (letter **O**)

### What Dashboard Shows:
```
Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk
```
**Has:** `AsX0cC0` (zero **0**)

### The Difference:
- **Position:** After `AsX` and before `cC0`
- **You have:** Letter `O` (capital O)
- **Dashboard has:** Zero `0` (number zero)

**This is why authentication is failing!**

---

## ✅ Correct Credentials

Based on the ProKerala dashboard:

```
PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk
```

**Note:** The secret has `AsX0cC0` (with zero `0`), NOT `AsXOcC0` (with letter `O`)

---

## 🔧 Fix Steps

### Step 1: Update Vercel with CORRECT Secret

1. Go to: https://vercel.com/dashboard
2. Your Project → Settings → Environment Variables
3. Find `PROKERALA_CLIENT_SECRET`
4. Click **"Edit"**
5. **Delete** the current value
6. **Paste** the CORRECT value: `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk`
   - **Important:** Use zero `0`, NOT letter `O`
   - Copy character by character from ProKerala dashboard
7. Click **"Save"**

### Step 2: Update .env.local (for local dev)

```bash
cd astrosetu

cat > .env.local << 'EOF'
# ProKerala API Credentials
PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk
EOF
```

**Note:** Secret has `AsX0cC0` (zero), not `AsXOcC0` (letter O)

### Step 3: Force Redeploy on Vercel

1. Go to Deployments tab
2. Click "..." → "Redeploy"
3. **UNCHECK** "Use existing Build Cache"
4. Click "Redeploy"
5. Wait 5 minutes

### Step 4: Test

```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
```

**Expected:** `"status": "connected"` ✅

---

## 📋 Character-by-Character Comparison

**Your Version (WRONG):**
```
Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk
            ^^^^
            Letter O
```

**Dashboard Version (CORRECT):**
```
Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk
            ^^^^
            Zero 0
```

**Position:** Character 15-18 (after `AsX`)

---

## ✅ Verification Checklist

- [ ] Client ID matches: `70b7ffb3-78f1-4a2f-9044-835ac8e5e642` ✅
- [ ] Client Secret: `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk` (with zero `0`)
- [ ] Updated in Vercel with correct secret (zero, not letter O)
- [ ] Updated in .env.local with correct secret
- [ ] Force redeployed on Vercel
- [ ] Tested diagnostic endpoint
- [ ] Got "connected" status

---

## Summary

**Issue Found:** Character mismatch in Client Secret
- **You had:** `AsXOcC0` (letter O) ❌
- **Dashboard shows:** `AsX0cC0` (zero 0) ✅

**Fix:**
1. Update Vercel with: `Oz9iwYNzgCtkIAsX0cC0BWw6IwboDVx7uNfV5Ilk` (zero 0)
2. Update .env.local with same
3. Force redeploy
4. Test

**After fixing this character mismatch, authentication should work!**

