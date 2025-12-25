# 🔑 Update Local .env.local for Development

## New ProKerala Credentials

```
PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk
```

---

## Step 1: Update .env.local File

### Option A: Using Terminal

```bash
cd astrosetu

# Check if .env.local exists
ls -la .env.local

# Update or create .env.local
cat > .env.local << 'EOF'
# ProKerala API Credentials
PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk
EOF

# Verify
cat .env.local
```

### Option B: Using Text Editor

1. Open: `astrosetu/.env.local` (create if it doesn't exist)
2. Add or update these lines:
   ```bash
   # ProKerala API Credentials
   PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
   PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk
   ```
3. **Important:**
   - ✅ No spaces around `=`
   - ✅ No quotes around values
   - ✅ Exact match with credentials above
4. Save the file

---

## Step 2: Verify File Format

```bash
cd astrosetu
cat .env.local
```

**Should show:**
```
PROKERALA_CLIENT_ID=70b7ffb3-78f1-4a2f-9044-835ac8e5e642
PROKERALA_CLIENT_SECRET=Oz9iwYNzgCtkIAsXOcC0BWw6IwboDVx7uNfV5Ilk
```

**Common Issues:**
- ❌ `PROKERALA_CLIENT_ID = 70b7ffb3...` (has spaces)
- ✅ `PROKERALA_CLIENT_ID=70b7ffb3...` (correct)
- ❌ `PROKERALA_CLIENT_ID="70b7ffb3..."` (has quotes)
- ✅ `PROKERALA_CLIENT_ID=70b7ffb3...` (correct)

---

## Step 3: Restart Development Server

**CRITICAL:** Environment variables only load when the server starts!

```bash
# Stop current server (Ctrl+C in terminal where server is running)

# Then restart:
cd astrosetu
npm run dev
```

---

## Step 4: Verify Configuration

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

## Important Notes

### ✅ Code Doesn't Need Changes

The code reads credentials from environment variables:
- `process.env.PROKERALA_CLIENT_ID`
- `process.env.PROKERALA_CLIENT_SECRET`

**No code changes needed!** Just update `.env.local` for local development.

### ✅ Production (Vercel) Already Updated

You mentioned you've already updated in Vercel - that's correct! Production uses Vercel environment variables, not `.env.local`.

### ✅ .env.local is Gitignored

The `.env.local` file is in `.gitignore`, so it won't be committed to git. This is correct - credentials should never be in git.

---

## Summary

**For Local Development:**
1. ✅ Update `.env.local` with new credentials
2. ✅ Restart development server
3. ✅ Test configuration

**For Production (Vercel):**
- ✅ Already updated (you mentioned)
- ✅ Will use Vercel environment variables
- ✅ No code changes needed

**Code:**
- ✅ No changes needed - reads from environment variables

---

## Quick Checklist

- [ ] Updated `.env.local` with new credentials
- [ ] No spaces around `=`
- [ ] No quotes around values
- [ ] Restarted development server
- [ ] Tested configuration endpoint
- [ ] Got `{"configured":true}` response

