# Comprehensive Retest Guide - Based on Previous Test Report

## Overview

This retest validates all fixes implemented to address the previous test observation report.

---

## Test User (Same as Previous Report)

| Field | Value |
|---|---|
| Name | Amit Kumar Mandal |
| Date of Birth | 26 Nov 1984 |
| Time of Birth | 21:40 |
| Place of Birth | Noamundi, Jharkhand, India |
| Coordinates | 22.1667°N, 85.5167°E |
| Timezone | Asia/Kolkata (IST) |
| Ayanamsa | Lahiri (1) |

---

## Expected Results (AstroSage Benchmark)

### Tier-1: Core Kundli Identifiers

| Field | AstroSage (Expected) | Tolerance |
|---|---|---|
| Ascendant (Lagna) | Aries (Mesha) | Exact match |
| Ascendant Degree | ~18° Aries | ±1° |
| Moon Sign (Rashi) | Cancer (Karka) | Exact match |
| Moon Degree | ~27° Cancer | ±1° |
| Nakshatra | Ashlesha | Exact match |

### Tier-2: Planetary Positions

| Planet | AstroSage Sign | Tolerance |
|---|---|---|
| Sun | Scorpio | Exact match |
| Moon | Cancer | Exact match |
| Mars | Sagittarius | Exact match |
| Mercury | Scorpio | Exact match |
| Jupiter | Capricorn | Exact match |
| Venus | Libra | Exact match |
| Saturn | Scorpio | Exact match |
| Rahu | Taurus | Exact match |
| Ketu | Scorpio | Exact match |

**Degree Tolerance:** ±1° for all planets

### Tier-3: Dosha & Dasha

| Field | AstroSage (Expected) |
|---|---|
| Manglik Dosha | Yes (Moderate) |
| Kaal Sarp Dosha | No |
| Birth Mahadasha | Mercury |
| Current Mahadasha | Venus |

---

## Running the Retest

### Automated Test (Recommended)

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu

# Ensure server is running
npm run dev

# In another terminal:
./RETEST_BASED_ON_REPORT.sh
```

### Manual Browser Test

#### Step 1: Test in AstroSetu
1. Visit: http://localhost:3001/kundli
2. Enter:
   - Name: Amit Kumar Mandal
   - DOB: 26 Nov 1984
   - TOB: 21:40
   - Place: **Type "Noamundi" and select from autocomplete**
3. Click "Generate Kundli"
4. Note all results

#### Step 2: Test in AstroSage
1. Visit: https://www.astrosage.com/kundli/
2. Enter the same details
3. Generate Kundli
4. Note all results

#### Step 3: Compare Field-by-Field

Use the comparison checklist below.

---

## Comparison Checklist

### Tier-1: Core Identifiers

- [ ] **Ascendant Sign**
  - AstroSetu: _____
  - AstroSage: Aries
  - Match: Yes/No

- [ ] **Ascendant Degree**
  - AstroSetu: _____
  - AstroSage: ~18°
  - Within ±1°: Yes/No

- [ ] **Moon Sign (Rashi)**
  - AstroSetu: _____
  - AstroSage: Cancer
  - Match: Yes/No

- [ ] **Moon Degree**
  - AstroSetu: _____
  - AstroSage: ~27°
  - Within ±1°: Yes/No

- [ ] **Nakshatra**
  - AstroSetu: _____
  - AstroSage: Ashlesha
  - Match: Yes/No

### Tier-2: Planetary Positions

- [ ] **Sun**
  - AstroSetu: _____
  - AstroSage: Scorpio
  - Match: Yes/No

- [ ] **Moon**
  - AstroSetu: _____
  - AstroSage: Cancer
  - Match: Yes/No

- [ ] **Mars**
  - AstroSetu: _____
  - AstroSage: Sagittarius
  - Match: Yes/No

- [ ] **Mercury**
  - AstroSetu: _____
  - AstroSage: Scorpio
  - Match: Yes/No

- [ ] **Jupiter**
  - AstroSetu: _____
  - AstroSage: Capricorn
  - Match: Yes/No

- [ ] **Venus**
  - AstroSetu: _____
  - AstroSage: Libra
  - Match: Yes/No

- [ ] **Saturn**
  - AstroSetu: _____
  - AstroSage: Scorpio
  - Match: Yes/No

- [ ] **Rahu**
  - AstroSetu: _____
  - AstroSage: Taurus
  - Match: Yes/No

- [ ] **Ketu**
  - AstroSetu: _____
  - AstroSage: Scorpio
  - Match: Yes/No

### Tier-3: Dosha & Dasha

- [ ] **Manglik Dosha**
  - AstroSetu: _____
  - AstroSage: Yes (Moderate)
  - Match: Yes/No

- [ ] **Kaal Sarp Dosha**
  - AstroSetu: _____
  - AstroSage: No
  - Match: Yes/No

- [ ] **Current Mahadasha**
  - AstroSetu: _____
  - AstroSage: Venus
  - Match: Yes/No

---

## Success Criteria

### ✅ Pass Criteria
- **Tier-1:** All 3 fields match exactly (Ascendant, Moon Sign, Nakshatra)
- **Tier-2:** At least 7 out of 9 planets match (within ±1° tolerance)
- **Tier-3:** Manglik status matches

### ⚠️ Partial Pass Criteria
- **Tier-1:** 2 out of 3 fields match
- **Tier-2:** 5-6 out of 9 planets match
- **Tier-3:** Partial matches

### ❌ Fail Criteria
- **Tier-1:** Less than 2 fields match
- **Tier-2:** Less than 5 planets match
- **Tier-3:** No matches

---

## What Was Fixed

### P0 Fixes (Implemented)
- ✅ Prokerala API integration (real ephemeris engine)
- ✅ Place → Coordinates resolution (autocomplete)
- ✅ Ayanamsa locked to Lahiri (1)
- ✅ Coordinate validation (rejects without coordinates)
- ✅ Enhanced response transformation
- ✅ Improved error handling

### Expected Improvements
- ✅ Ascendant should now match Aries (not Pisces)
- ✅ Moon Sign should match Cancer (not Gemini)
- ✅ Nakshatra should match Ashlesha (not Ardra)
- ✅ Planetary positions should be accurate
- ✅ Dosha analysis should be correct

---

## Troubleshooting

### Issue: Still getting wrong results

**Check:**
1. ✅ Prokerala shows `configured:true` at `/api/astrology/config`
2. ✅ Coordinates are being passed (check browser console)
3. ✅ Place was selected from autocomplete (not just typed)
4. ✅ Server was restarted after adding credentials
5. ✅ Check server logs for Prokerala API errors

### Issue: Prokerala API errors

**Check server logs for:**
- Authentication errors
- Rate limit errors
- Network connectivity issues
- Invalid request format errors

---

## Test Report Template

After running the test, document results:

```
Date: ___________
Tester: ___________

### Tier-1 Results
- Ascendant: Match: Yes/No
- Moon Sign: Match: Yes/No
- Nakshatra: Match: Yes/No

### Tier-2 Results
- Planets Matching: X/9
- Specific Mismatches: ___________

### Tier-3 Results
- Manglik: Match: Yes/No
- Dasha: Match: Yes/No

### Overall Verdict: PASS / PARTIAL / FAIL

### Notes:
___________
```

---

**Ready for comprehensive retest!** 🚀

