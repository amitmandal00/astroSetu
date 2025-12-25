# 🔧 Fix: Kundli Endpoint Method Not Allowed (405 Error)

## Issue Found! 🎯

**Error Message:**
```
No route found for "POST https://api.prokerala.com/v2/astrology/kundli": Method Not Allowed (Allow: GET)
```

**Root Cause:** ProKerala API requires **GET** method for the `/kundli` endpoint, but our code was using **POST**.

---

## ✅ Solution Applied

### Changes Made:

1. **Updated `prokeralaRequest` function** to enforce GET for kundli endpoint (similar to panchang):
   - Added `isKundliEndpoint` check
   - Added `mustUseGet` flag for both panchang and kundli
   - Updated all enforcement checks to include kundli

2. **Updated `getKundli` function** to explicitly pass `"GET"` method:
   ```typescript
   const response = await prokeralaRequest("/kundli", {...}, 2, "GET" as const);
   ```

3. **Updated logging** to reflect both endpoints that require GET

---

## 📋 What Changed

### File: `src/lib/astrologyAPI.ts`

**Before:**
- Only panchang endpoint enforced GET
- Kundli used default POST method
- Error: 405 Method Not Allowed

**After:**
- Both panchang AND kundli endpoints enforce GET
- Parameters converted to query string for GET requests
- No body sent with GET requests

---

## 🧪 Testing

### Test the Fix:

1. **Deploy to Vercel:**
   ```bash
   git add src/lib/astrologyAPI.ts
   git commit -m "Fix: Change kundli endpoint to use GET method"
   git push origin main
   ```

2. **Wait for deployment** (3-5 minutes)

3. **Test kundli endpoint:**
   - Go to: `https://astrosetu-app.vercel.app/kundli`
   - Fill in birth details
   - Click "DONE"
   - Should work without 405 error! ✅

4. **Verify diagnostic still works:**
   ```bash
   curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.status'
   ```
   **Expected:** `"connected"` ✅

---

## 📝 Technical Details

### ProKerala API Endpoints:

| Endpoint | Method | Status |
|----------|--------|--------|
| `/panchang` | GET | ✅ Fixed |
| `/kundli` | GET | ✅ Fixed |
| `/dosha` | POST | ✅ (No change needed) |
| `/match` | POST | ✅ (No change needed) |

### How GET Parameters Work:

For GET requests, nested objects like `datetime` are converted to query parameters:
```
?ayanamsa=1&coordinates=28.6139,77.2090&datetime[year]=2025&datetime[month]=12&datetime[day]=25&datetime[hour]=21&datetime[minute]=40&datetime[second]=0&timezone=Asia/Kolkata
```

---

## ✅ Verification Checklist

- [x] Code updated to use GET for kundli
- [x] Enforcement checks added for kundli
- [x] Logging updated
- [ ] Deployed to Vercel
- [ ] Tested on production
- [ ] Verified diagnostic still works
- [ ] Verified kundli works without 405 error

---

## 🚀 Next Steps

1. **Commit and push:**
   ```bash
   git add src/lib/astrologyAPI.ts
   git commit -m "Fix: Change kundli endpoint to use GET method (405 error)"
   git push origin main
   ```

2. **Wait for Vercel deployment** (auto-deploys on push)

3. **Test kundli page** - should work now! ✅

---

## Summary

**Issue:** Kundli endpoint returned 405 Method Not Allowed  
**Cause:** ProKerala requires GET, but code used POST  
**Fix:** Updated code to use GET method for kundli endpoint  
**Result:** Kundli should now work correctly! ✅

