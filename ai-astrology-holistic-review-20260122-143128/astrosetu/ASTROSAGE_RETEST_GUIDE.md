# AstroSage Retest Guide

## Test User Details

| Field | Value |
|---|---|
| Name | Amit Kumar Mandal |
| Date of Birth | 26 Nov 1984 |
| Time of Birth | 21:40 |
| Place of Birth | Noamundi, Jharkhand, India |
| Coordinates | 22.1667°N, 85.5167°E |
| Timezone | Asia/Kolkata (IST) |

---

## Expected Results (AstroSage Benchmark)

### Core Kundli Identifiers

| Field | AstroSage (Expected) | Tolerance |
|---|---|---|
| Ascendant (Lagna) | Aries (Mesha) | Exact match |
| Ascendant Degree | ~18° Aries | ±1° |
| Moon Sign (Rashi) | Cancer (Karka) | Exact match |
| Moon Degree | ~27° Cancer | ±1° |
| Nakshatra | Ashlesha | Exact match |

### Planetary Positions

| Planet | AstroSage Sign | Expected Degree Range |
|---|---|---|
| Sun | Scorpio | ±1° |
| Moon | Cancer | ~27° ±1° |
| Mars | Sagittarius | ±1° |
| Mercury | Scorpio | ±1° |
| Jupiter | Capricorn (Debilitated) | ±1° |
| Venus | Libra | ±1° |
| Saturn | Scorpio | ±1° |
| Rahu | Taurus | ±1° |
| Ketu | Scorpio | ±1° |

### Dosha Analysis

| Dosha | AstroSage Status |
|---|---|
| Manglik | Yes (Moderate) |
| Kaal Sarp | No |
| Sade Sati | Completed (Past) |

---

## Testing Steps

### Step 1: Test in AstroSetu

1. Visit: http://localhost:3001/kundli
2. Enter test user data:
   - Name: Amit Kumar Mandal
   - DOB: 26 Nov 1984
   - TOB: 21:40
   - Place: **Select "Noamundi, Jharkhand" from autocomplete** (important for coordinates)
3. Click "Generate Kundli"
4. Note the results

### Step 2: Test in AstroSage

1. Visit: https://www.astrosage.com/kundli/
2. Enter the same details:
   - Date: 26 Nov 1984
   - Time: 21:40
   - Place: Noamundi, Jharkhand
3. Generate Kundli
4. Note the results

### Step 3: Compare Results

Compare field by field:

#### Tier-1 (Must Match Exactly)
- [ ] Ascendant sign matches (Aries)
- [ ] Moon sign matches (Cancer)
- [ ] Nakshatra matches (Ashlesha)

#### Tier-2 (Within Tolerance)
- [ ] Ascendant degree: ~18° ±1°
- [ ] Moon degree: ~27° ±1°
- [ ] Planetary positions: ±1° tolerance

#### Tier-3 (Dosha Analysis)
- [ ] Manglik status matches
- [ ] Kaal Sarp status matches
- [ ] Sade Sati status matches

---

## Automated Test

Run the test script:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
./test-astrosage-accuracy.sh
```

Or use the fix verification script:

```bash
./test-accuracy-fix.sh
```

---

## Comparison Checklist

### Core Fields
- [ ] Ascendant: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- [ ] Moon Sign: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- [ ] Nakshatra: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)

### Planetary Positions
- [ ] Sun: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- [ ] Moon: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- [ ] Mars: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- [ ] Mercury: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- [ ] Jupiter: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- [ ] Venus: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- [ ] Saturn: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- [ ] Rahu: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- [ ] Ketu: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)

### Dosha Analysis
- [ ] Manglik: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- [ ] Kaal Sarp: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)

---

## Troubleshooting

### Issue: Results still don't match

**Check:**
1. ✅ Prokerala credentials configured (should show `configured:true`)
2. ✅ Coordinates are being passed (check browser console logs)
3. ✅ Ayanamsa is set to Lahiri (1) - default
4. ✅ Timezone is Asia/Kolkata - default
5. ✅ Place was selected from autocomplete (not just typed)

### Issue: API errors

**Check server logs:**
- Look for Prokerala API errors
- Check authentication errors
- Verify network connectivity

---

## Success Criteria

✅ **Pass:** All Tier-1 fields match exactly, Tier-2 within tolerance  
⚠️ **Partial:** Most fields match, minor discrepancies  
❌ **Fail:** Significant mismatches

---

**Last Updated:** $(date)

