# 🔑 Update .env.local File

## New ProKerala Credentials

```
PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk
```

---

## Step 1: Open .env.local File

### Option A: Using Terminal

```bash
cd astrosetu
nano .env.local
# or
code .env.local
# or
open -e .env.local
```

### Option B: Using Finder (Mac)

1. Open Finder
2. Navigate to: `/Users/amitkumarmandal/Documents/astroCursor/astrosetu`
3. Press `Cmd + Shift + .` (to show hidden files)
4. Find `.env.local`
5. Double-click to open in TextEdit

---

## Step 2: Update the File

Replace or add these lines:

```bash
# ProKerala API Credentials
PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk
```

**Important:**
- ✅ No spaces around `=`
- ✅ No quotes around values
- ✅ Exact match with credentials above

---

## Step 3: Save the File

Save and close the file.

---

## Step 4: Verify the File

```bash
cd astrosetu
cat .env.local
```

**Should show:**
```
PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk
```

---

## Step 5: Restart Development Server

**CRITICAL:** Environment variables only load when the server starts!

```bash
# Stop current server (Ctrl+C in terminal where server is running)

# Then restart:
cd astrosetu
npm run dev
```

---

## Step 6: Test Configuration

After restarting, test:

```bash
# Test configuration
curl http://localhost:3001/api/astrology/config

# Should return:
# {"ok":true,"data":{"configured":true}}

# Or test diagnostic
curl http://localhost:3001/api/astrology/diagnostic | jq '.data.prokeralaTest'
```

---

## Quick Terminal Method

If you prefer to update via terminal:

```bash
cd astrosetu

# Backup existing file (if you want)
cp .env.local .env.local.backup 2>/dev/null || true

# Create/update .env.local
cat > .env.local << 'EOF'
# ProKerala API Credentials
PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk
EOF

# Verify
cat .env.local

# Restart server
npm run dev
```

---

## Complete .env.local Example

Your `.env.local` file should look like this:

```bash
# ProKerala API Credentials
PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk

# Add other environment variables below if needed
# NEXT_PUBLIC_SUPABASE_URL=...
# RAZORPAY_KEY_ID=...
```

---

## Verification Checklist

- [ ] Opened `.env.local` file
- [ ] Added/updated `PROKERALA_CLIENT_ID`
- [ ] Added/updated `PROKERALA_CLIENT_SECRET`
- [ ] No spaces around `=`
- [ ] No quotes around values
- [ ] Saved the file
- [ ] Restarted development server
- [ ] Tested configuration endpoint
- [ ] Got `{"configured":true}` response

---

## Troubleshooting

### File Not Found

If `.env.local` doesn't exist:
1. Create it in the `astrosetu` directory
2. Add the credentials
3. Save

### Still Shows "Not Configured"

1. **Check file location:** Should be in `astrosetu/.env.local` (not parent directory)
2. **Check file name:** Should be exactly `.env.local` (not `.env.local.txt`)
3. **Restart server:** Environment variables only load on server start
4. **Check syntax:** No spaces, no quotes

### Credentials Don't Work

1. **Verify in ProKerala:** Check dashboard for exact values
2. **Check for typos:** Compare character by character
3. **Check secret character:** Verify `O` vs `0` (letter vs zero)

---

## Summary

**Credentials to Add:**
```
PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk
```

**Steps:**
1. Open `.env.local`
2. Add/update credentials
3. Save
4. Restart server
5. Test

**After restart, local development should use the new credentials!**

