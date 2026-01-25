# Quick AstroSage Retest Guide

## ✅ Prerequisites

1. ✅ Prokerala credentials added to `.env.local`
2. ✅ Server restarted after adding credentials
3. ✅ Server is running on http://localhost:3001

---

## 🧪 Quick Test Steps

### Step 1: Verify Configuration

Visit in browser:
```
http://localhost:3001/api/astrology/config
```

**Should return:**
```json
{"ok":true,"data":{"configured":true}}
```

If it shows `"configured":false`, credentials are not loaded - restart server.

---

### Step 2: Run Automated Test

In terminal:
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
./RUN_ASTROSAGE_TEST.sh
```

This will:
- ✅ Check server status
- ✅ Verify Prokerala configuration
- ✅ Generate Kundli with test user
- ✅ Compare results with expected AstroSage values
- ✅ Show detailed comparison

---

### Step 3: Manual Browser Test

#### Test in AstroSetu:
1. Visit: http://localhost:3001/kundli
2. Enter:
   - Name: Amit Kumar Mandal
   - DOB: 26 Nov 1984
   - TOB: 21:40
   - Place: **Type "Noamundi" and select from autocomplete dropdown**
3. Click "Generate Kundli"
4. Note the results

#### Test in AstroSage:
1. Visit: https://www.astrosage.com/kundli/
2. Enter the same details
3. Generate Kundli
4. Compare results

---

## 📊 Expected Results Comparison

### AstroSage (Benchmark)

| Field | Value |
|---|---|
| Ascendant | Aries (Mesha) |
| Ascendant Degree | ~18° |
| Moon Sign | Cancer (Karka) |
| Moon Degree | ~27° |
| Nakshatra | Ashlesha |
| Sun | Scorpio |
| Moon | Cancer |
| Mars | Sagittarius |
| Mercury | Scorpio |
| Jupiter | Capricorn |
| Venus | Libra |
| Saturn | Scorpio |
| Rahu | Taurus |
| Ketu | Scorpio |

### AstroSetu (Should Match)

After running the test, compare your results with the above.

**Tolerance:**
- Signs: Must match exactly
- Degrees: ±1° acceptable
- Nakshatra: Must match exactly

---

## 🔍 What to Check

### Tier-1 (Critical - Must Match)
- [ ] Ascendant sign = Aries
- [ ] Moon sign = Cancer
- [ ] Nakshatra = Ashlesha

### Tier-2 (Important - Within Tolerance)
- [ ] Ascendant degree: ~18° ±1°
- [ ] Moon degree: ~27° ±1°
- [ ] All planetary positions: ±1° tolerance

### Tier-3 (Dosha Analysis)
- [ ] Manglik status matches
- [ ] Kaal Sarp status matches

---

## ✅ Success Criteria

**Pass:** All Tier-1 fields match, Tier-2 within tolerance  
**Partial:** Most fields match, minor discrepancies  
**Fail:** Significant mismatches

---

## 🐛 Troubleshooting

### Issue: Still getting wrong results

**Check:**
1. ✅ Prokerala shows `configured:true`
2. ✅ Coordinates are being passed (check browser console)
3. ✅ Place was selected from autocomplete (not just typed)
4. ✅ Server was restarted after adding credentials
5. ✅ Check server logs for Prokerala API errors

### Issue: "Coordinates are required" error

**Solution:**
- Select place from autocomplete dropdown
- Or use "Current Location" button
- Or enter manual coordinates in Advanced Settings

---

**Test User:**
- Name: Amit Kumar Mandal
- DOB: 26 Nov 1984
- TOB: 21:40
- Place: Noamundi, Jharkhand

---

**Ready to test!** 🚀

