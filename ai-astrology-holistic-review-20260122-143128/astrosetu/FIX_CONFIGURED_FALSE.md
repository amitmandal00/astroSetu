# Fix: `{"configured":false}` Issue

## Problem

You're seeing:
```json
{"ok":true,"data":{"configured":false}}
```

This means Prokerala credentials are not being detected by the server.

---

## 🔍 Diagnosis Steps

### Step 1: Check if Credentials are in .env.local

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
cat .env.local
```

**Should show:**
```
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

**If not showing:** Credentials are missing - add them (see Step 2)

---

### Step 2: Add Credentials (If Missing)

#### Option A: Using Terminal (Quick)

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu

# Add credentials to .env.local
cat >> .env.local << 'EOF'
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
EOF

# Verify
cat .env.local
```

#### Option B: Using Text Editor

1. Open: `/Users/amitkumarmandal/Documents/astroCursor/astrosetu/.env.local`
2. Add these two lines:
   ```
   PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
   PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
   ```
3. Save the file

---

### Step 3: Verify File Format

Check for common issues:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu

# Check file exists
ls -la .env.local

# Check contents (should show credentials)
cat .env.local

# Check for syntax issues
grep "PROKERALA" .env.local
```

**Common Issues:**
- ❌ Extra spaces: `PROKERALA_CLIENT_ID = value` (wrong)
- ✅ Correct: `PROKERALA_CLIENT_ID=value` (correct)
- ❌ Quotes: `PROKERALA_CLIENT_ID="value"` (wrong - remove quotes)
- ✅ Correct: `PROKERALA_CLIENT_ID=value` (correct)

---

### Step 4: Restart Server

**CRITICAL:** Environment variables only load when the server starts!

```bash
# Stop current server
# Press Ctrl+C in the terminal where server is running

# Then restart:
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npm run dev
```

**Wait for server to fully start** (you'll see "Ready" message)

---

### Step 5: Verify Configuration

After restarting, check again:

```bash
curl http://localhost:3001/api/astrology/config
```

**Should now return:**
```json
{"ok":true,"data":{"configured":true}}
```

Or visit in browser: http://localhost:3001/api/astrology/config

---

## 🔧 Common Issues & Fixes

### Issue 1: Credentials Not Added

**Symptom:** `.env.local` doesn't contain Prokerala credentials

**Fix:**
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
echo 'PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749' >> .env.local
echo 'PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o' >> .env.local
```

### Issue 2: Server Not Restarted

**Symptom:** Credentials are in file but still shows `configured:false`

**Fix:**
1. Stop server (Ctrl+C)
2. Restart: `npm run dev`
3. Wait for "Ready" message
4. Check again

### Issue 3: Wrong File Location

**Symptom:** File exists but server can't read it

**Fix:**
- File must be at: `/Users/amitkumarmandal/Documents/astroCursor/astrosetu/.env.local`
- Not in parent directory
- Not named `.env` or `.env.local.txt`

### Issue 4: Syntax Errors

**Symptom:** Credentials present but not recognized

**Check:**
```bash
# Should show exactly:
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

**Common mistakes:**
- ❌ `PROKERALA_CLIENT_ID = value` (space around =)
- ❌ `PROKERALA_CLIENT_ID="value"` (quotes)
- ❌ `PROKERALA_CLIENT_ID= value` (space after =)
- ✅ `PROKERALA_CLIENT_ID=value` (correct)

### Issue 5: File Encoding

**Symptom:** Credentials look correct but not working

**Fix:**
- Ensure file is UTF-8 encoding
- No BOM (Byte Order Mark)
- Use a simple text editor (VS Code, nano, vim)

---

## ✅ Complete Fix (One Command)

If you want to fix everything at once:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu

# Create/update .env.local with correct credentials
cat > .env.local << 'EOF'
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
EOF

# Verify
echo "✅ File contents:"
cat .env.local

# Then restart server
echo ""
echo "🔄 Now restart your server:"
echo "   npm run dev"
```

---

## 📋 Checklist

- [ ] Credentials added to `.env.local`
- [ ] File is at correct location: `astrosetu/.env.local`
- [ ] No syntax errors (no spaces, no quotes)
- [ ] Server fully restarted after adding credentials
- [ ] Checked `/api/astrology/config` after restart
- [ ] Still shows `configured:false`? Check server logs for errors

---

## 🔍 Debug: Check Server Logs

If still not working, check server console for errors:

1. Look at the terminal where `npm run dev` is running
2. Check for error messages about:
   - "Prokerala API credentials not configured"
   - Environment variable loading errors
   - File read errors

---

## 📝 Your Credentials

```bash
PROKERALA_CLIENT_ID=4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
PROKERALA_CLIENT_SECRET=06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

---

**After fixing, restart server and check again!**

