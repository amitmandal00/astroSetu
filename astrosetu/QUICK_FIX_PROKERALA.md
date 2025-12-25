# Quick Fix: Add Prokerala Credentials

## Problem
Prokerala credentials are not configured, causing the app to use mock data instead of real calculations.

## Solution

### Step 1: Open `.env.local` File

The `.env.local` file should be in the `astrosetu` directory:
```
astrosetu/
  ├── .env.local  ← This file
  ├── package.json
  └── ...
```

If it doesn't exist, create it.

### Step 2: Add These Lines

Add or update these lines in `.env.local`:

```bash
# Prokerala API Credentials
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

### Step 3: Save the File

Save `.env.local` and close it.

### Step 4: Restart Server

**CRITICAL:** You must restart the server for environment variables to load:

```bash
# Stop current server (Ctrl+C)
# Then restart:
cd astrosetu
npm run dev
```

### Step 5: Verify Configuration

Check if credentials are loaded:

```bash
curl http://localhost:3001/api/astrology/config
```

Should return:
```json
{"ok":true,"data":{"configured":true}}
```

Or visit: http://localhost:3001/api/astrology/config in your browser.

---

## Why This Happens

1. **`.env.local` is in `.gitignore`** - This is correct (secrets shouldn't be in git)
2. **Environment variables only load on server start** - Must restart after adding
3. **File might not exist** - Need to create it manually

---

## Troubleshooting

### Issue: Still shows "not configured" after restart

**Check:**
1. File is named exactly `.env.local` (not `.env` or `.env.local.txt`)
2. File is in `astrosetu` directory (not parent directory)
3. No extra spaces around `=`
4. No quotes around values (unless needed)
5. Server was fully restarted (not just reloaded)

### Issue: "Cannot find module" or other errors

**Solution:**
- Check file syntax (no special characters)
- Ensure file encoding is UTF-8
- Try removing and re-adding the lines

### Issue: Credentials don't work

**Check:**
- Credentials are correct (copy-paste from ADD_CREDENTIALS.md)
- No typos in variable names
- Prokerala account is active
- API key hasn't expired

---

## Your Credentials

From `ADD_CREDENTIALS.md`:

- **Client ID:** `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
- **Client Secret:** `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o`
- **Status:** Live Client ✅

---

## After Adding Credentials

Once configured:
- ✅ Demo mode banner will disappear
- ✅ Real Prokerala calculations will be used
- ✅ Results will match AstroSage
- ✅ No more mock data fallback

---

**Last Updated:** $(date)

