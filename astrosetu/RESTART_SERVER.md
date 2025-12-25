# 🔄 How to Fix the 500 Error

## The Problem
You're seeing a 500 Internal Server Error. This is caused by a webpack runtime issue that happens when the server cache is stale.

## The Solution

### Step 1: Stop the Current Server
In the terminal where `npm run dev` is running:
- Press **Ctrl+C** to stop the server

### Step 2: Clear Cache (Already Done ✅)
The cache has been cleared automatically.

### Step 3: Restart the Server
```bash
cd astrosetu
npm run dev
```

### Step 4: Wait for Server to Start
You should see:
```
✓ Ready in X.Xs
```

### Step 5: Test
Open http://localhost:3001 in your browser.

## What Was Fixed

1. ✅ **Supabase Client** - Better error handling for missing credentials
2. ✅ **Auth Route** - Graceful error handling
3. ✅ **Build Cache** - Cleared stale cache

## If It Still Doesn't Work

Try these steps in order:

1. **Full Clean Restart:**
   ```bash
   # Stop server (Ctrl+C)
   rm -rf .next node_modules/.cache
   npm run dev
   ```

2. **Check for Port Conflicts:**
   ```bash
   # Check if port 3001 is in use
   lsof -i :3001
   
   # Kill if needed
   kill -9 <PID>
   ```

3. **Reinstall Dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

## Expected Result

After restarting, you should see:
- ✅ Home page loads correctly
- ✅ No 500 error
- ✅ All features work

---

**Action Required**: Stop the server (Ctrl+C) and restart with `npm run dev`

