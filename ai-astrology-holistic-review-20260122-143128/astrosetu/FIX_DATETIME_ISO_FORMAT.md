# 🔧 Fix: Datetime Format Error for Kundli Endpoint

## Issue Found! 🎯

**Error Message:**
```
Value should be a string in ISO 8601 (YYYY-MM-DDTHH:MM:SSZ) format. 
Example: 2004-02-12T15:19:21+05:30. 
Your input was of type "object (map)".
```

**Root Cause:** When using GET method, ProKerala API expects `datetime` as an **ISO 8601 string**, but our code was sending it as an **object** (e.g., `datetime[year]=2025&datetime[month]=12`).

---

## ✅ Solution Applied

### Changes Made:

1. **Updated `prokeralaRequest` function** to convert datetime objects to ISO 8601 strings for GET requests:
   - Detects when `datetime` is an object
   - Converts to ISO 8601 format: `YYYY-MM-DDTHH:MM:SS+05:30`
   - Handles timezone offset (defaults to +05:30 for Asia/Kolkata)
   - Logs the conversion for debugging

2. **Format Details:**
   - Date: `YYYY-MM-DD` (e.g., `2025-12-25`)
   - Time: `HH:MM:SS` (e.g., `21:40:00`)
   - Timezone: `+05:30` for IST (Asia/Kolkata)
   - Full format: `2025-12-25T21:40:00+05:30`

---

## 📋 What Changed

### File: `src/lib/astrologyAPI.ts`

**Before:**
```typescript
// Sent as query params: datetime[year]=2025&datetime[month]=12&datetime[day]=25&datetime[hour]=21...
```

**After:**
```typescript
// Sent as ISO string: datetime=2025-12-25T21:40:00+05:30
```

---

## 🧪 Testing

### Test the Fix:

1. **Deploy to Vercel:**
   ```bash
   git add src/lib/astrologyAPI.ts
   git commit -m "Fix: Convert datetime to ISO 8601 string for GET requests"
   git push origin main
   ```

2. **Wait for deployment** (3-5 minutes)

3. **Test kundli endpoint:**
   - Go to: `https://astrosetu-app.vercel.app/kundli`
   - Fill in birth details:
     - Date: 26 Nov 1984
     - Time: 21:40:00
     - Place: Noamundi, Jharkhand, India
   - Click "DONE"
   - Should work without datetime format error! ✅

4. **Verify diagnostic still works:**
   ```bash
   curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest.status'
   ```
   **Expected:** `"connected"` ✅

---

## 📝 Technical Details

### ISO 8601 Format:

- **Format:** `YYYY-MM-DDTHH:MM:SS±HH:MM`
- **Example:** `1984-11-26T21:40:00+05:30`
- **Components:**
  - `YYYY-MM-DD`: Date (year-month-day)
  - `T`: Separator between date and time
  - `HH:MM:SS`: Time (hour-minute-second)
  - `±HH:MM`: Timezone offset (e.g., +05:30 for IST)

### ProKerala API Requirements:

| Endpoint | Method | Datetime Format |
|----------|--------|----------------|
| `/panchang` | GET | ISO 8601 string (date only: `YYYY-MM-DD`) |
| `/kundli` | GET | ISO 8601 string (full: `YYYY-MM-DDTHH:MM:SS+05:30`) |
| `/dosha` | POST | Object (no change needed) |

### Timezone Handling:

- Default timezone: `Asia/Kolkata` (+05:30)
- Timezone is also sent as separate `timezone` parameter
- ProKerala uses the timezone parameter for calculations

---

## ✅ Verification Checklist

- [x] Code updated to convert datetime to ISO 8601
- [x] Handles year, month, day, hour, minute, second
- [x] Handles timezone offset
- [x] Logging added for debugging
- [ ] Deployed to Vercel
- [ ] Tested on production
- [ ] Verified kundli works without datetime error
- [ ] Verified panchang still works

---

## 🚀 Next Steps

1. **Commit and push:**
   ```bash
   git add src/lib/astrologyAPI.ts
   git commit -m "Fix: Convert datetime to ISO 8601 string for GET requests (kundli endpoint)"
   git push origin main
   ```

2. **Wait for Vercel deployment** (auto-deploys on push)

3. **Test kundli page** - should work now! ✅

---

## Summary

**Issue:** Datetime sent as object, but ProKerala expects ISO 8601 string  
**Cause:** GET requests need datetime as string, not nested object  
**Fix:** Convert datetime object to ISO 8601 string before building query params  
**Result:** Kundli should now work correctly! ✅

