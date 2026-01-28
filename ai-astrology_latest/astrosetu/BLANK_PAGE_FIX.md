# 🔧 Blank Page Fix Guide

## Common Causes & Solutions

### 1. **Browser Cache Issue** (Most Common)
**Symptoms**: Blank page, no errors in console

**Solution**:
1. **Hard Refresh**: 
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`
2. **Clear Cache**:
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Firefox: Settings → Privacy → Clear Data → Cached Web Content
   - Safari: Develop → Empty Caches
3. **Use Incognito/Private Mode**: Test in a fresh browser session

---

### 2. **Server Not Running**
**Symptoms**: Blank page, connection error

**Solution**:
```bash
cd astrosetu
npm run dev
```
Server should start on `http://localhost:3001`

---

### 3. **Build Cache Corruption**
**Symptoms**: Blank page, build errors

**Solution**:
```bash
cd astrosetu
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

---

### 4. **JavaScript Runtime Error**
**Symptoms**: Blank page, errors in browser console

**Solution**:
1. Open Browser DevTools (F12)
2. Check **Console** tab for errors
3. Check **Network** tab for failed requests (red entries)
4. Share error messages for debugging

---

### 5. **Missing Environment Variables**
**Symptoms**: Blank page, API errors

**Solution**:
1. Check if `.env.local` exists
2. If not, create it (can be empty for basic functionality)
3. Restart dev server

---

### 6. **Component Import Error**
**Symptoms**: Blank page, module not found errors

**Solution**:
```bash
cd astrosetu
npm install
npm run dev
```

---

## 🔍 Diagnostic Steps

### Step 1: Check Browser Console
1. Open `http://localhost:3001`
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Look for **red error messages**
5. Copy any errors you see

### Step 2: Check Network Tab
1. In DevTools, go to **Network** tab
2. Refresh the page (`F5`)
3. Look for **failed requests** (red entries)
4. Click on failed requests to see error details

### Step 3: Check Server Logs
1. Look at the terminal where `npm run dev` is running
2. Check for any error messages
3. Look for compilation errors

### Step 4: Verify Server is Running
```bash
# Check if port 3001 is in use
lsof -i :3001

# Or check in browser
# Navigate to http://localhost:3001
# Should see something (even if blank)
```

---

## 🚀 Quick Fix Script

Run this script to clear caches and restart:

```bash
cd astrosetu
./fix-blank-page.sh
```

Or manually:

```bash
cd astrosetu
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

Then:
1. Clear browser cache
2. Open `http://localhost:3001` in incognito mode
3. Check browser console for errors

---

## 📋 What to Check

- [ ] Dev server is running (`npm run dev`)
- [ ] Browser console has no errors
- [ ] Network tab shows no failed requests
- [ ] Server terminal shows no compilation errors
- [ ] `.env.local` exists (can be empty)
- [ ] Browser cache is cleared
- [ ] Testing in incognito/private mode

---

## 🆘 Still Not Working?

If the page is still blank after trying all above:

1. **Share Browser Console Errors**: 
   - Open DevTools (F12)
   - Go to Console tab
   - Copy all red error messages

2. **Share Server Terminal Output**:
   - Copy the output from `npm run dev` terminal

3. **Check Specific Page**:
   - Try navigating to `http://localhost:3001/kundli`
   - Try `http://localhost:3001/match`
   - See if other pages work

4. **Check Browser**:
   - Try a different browser (Chrome, Firefox, Safari)
   - Try incognito/private mode

---

**Last Updated**: For troubleshooting blank page issues

