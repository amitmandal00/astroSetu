# AstroSetu vs AstroSage Accuracy Test

## Test User Data

**Name:** Amit Kumar Mandal  
**Date of Birth:** 26th November 1984  
**Time of Birth:** 21:40:00 (9:40 PM)  
**Place of Birth:** Noamundi, Jharkhand, India

---

## Test Execution

### Step 1: Start Server
```bash
cd astrosetu
npm run dev
```

### Step 2: Run Accuracy Test
```bash
./test-astrosage-accuracy.sh
```

### Step 3: Manual Comparison
Follow the comparison instructions in the test output to verify results against AstroSage.

---

## Test Cases

### 1. Kundli Generation

**AstroSetu Endpoint:** `POST /api/astrology/kundli`

**Test Data:**
```json
{
  "name": "Amit Kumar Mandal",
  "day": 26,
  "month": 11,
  "year": 1984,
  "hours": "21",
  "minutes": "40",
  "place": "Noamundi, Jharkhand"
}
```

**Compare with AstroSage:**
- Visit: https://www.astrosage.com/kundli/
- Enter the same birth details
- Compare:
  - **Ascendant (Lagna)** - Should match exactly
  - **Moon Sign (Rashi)** - Should match exactly
  - **Nakshatra** - Should match exactly
  - **Planetary Positions** - Should match within ±1 degree
  - **Sun Sign** - Should match exactly

**Expected Tolerance:** ±1 degree for planetary positions

---

### 2. Daily Horoscope

**AstroSetu Endpoint:** `GET /api/astrology/horoscope?mode=daily&sign={SUN_SIGN}`

**Compare with AstroSage:**
- Visit: https://www.astrosage.com/horoscope/
- Select the Sun Sign from Kundli
- Select "Daily" horoscope
- Compare general predictions and trends

**Note:** Horoscope predictions may vary as they are interpretive, but general trends should align.

---

### 3. Panchang

**AstroSetu Endpoint:** `GET /api/astrology/panchang?date={TODAY}&place=Noamundi, Jharkhand`

**Compare with AstroSage:**
- Visit: https://www.astrosage.com/panchang/
- Enter today's date and place: Noamundi, Jharkhand
- Compare:
  - **Tithi** - Should match exactly
  - **Nakshatra** - Should match exactly
  - **Yoga** - Should match exactly
  - **Karana** - Should match exactly
  - **Sunrise/Sunset times** - Should match within ±5 minutes

**Expected Tolerance:** ±5 minutes for time calculations

---

### 4. Numerology

**AstroSetu Endpoint:** `POST /api/astrology/numerology`

**Test Data:**
```json
{
  "name": "Amit Kumar Mandal",
  "dob": "1984-11-26"
}
```

**Compare with AstroSage:**
- Visit: https://www.astrosage.com/numerology/
- Enter name: "Amit Kumar Mandal"
- Enter DOB: 26th November 1984
- Compare:
  - **Life Path Number** - Should match exactly
  - **Destiny Number** - Should match exactly
  - **Soul Number** - Should match exactly
  - **Personality Number** - Should match exactly

**Expected Tolerance:** Exact match (no tolerance)

---

### 5. Dosha Analysis

**AstroSetu Endpoint:** `POST /api/astrology/dosha`

**Test Data:**
```json
{
  "day": 26,
  "month": 11,
  "year": 1984,
  "hours": "21",
  "minutes": "40",
  "place": "Noamundi, Jharkhand"
}
```

**Compare with AstroSage:**
- Visit: https://www.astrosage.com/kundli/
- Generate Kundli with same details
- Check Dosha section
- Compare:
  - **Manglik Status** - Should match exactly (Manglik/Non-Manglik)
  - **Kaal Sarp Dosha** - Should match exactly
  - **Shani Dosha** - Should match exactly
  - **Rahu-Ketu Dosha** - Should match exactly

**Expected Tolerance:** Exact match (no tolerance)

---

### 6. Horoscope Matching

**AstroSetu Endpoint:** `POST /api/astrology/match`

**Test Data (Self-Match for Testing):**
```json
{
  "a": {
    "day": 26,
    "month": 11,
    "year": 1984,
    "hours": "21",
    "minutes": "40",
    "place": "Noamundi, Jharkhand"
  },
  "b": {
    "day": 26,
    "month": 11,
    "year": 1984,
    "hours": "21",
    "minutes": "40",
    "place": "Noamundi, Jharkhand"
  }
}
```

**Compare with AstroSage:**
- Visit: https://www.astrosage.com/match-making/
- Enter same details for both persons (self-match)
- Compare:
  - **Total Guna** - Should match within ±1 point
  - **Guna Breakdown** - Should match closely
  - **Verdict** - Should match (Compatible/Incompatible)

**Expected Tolerance:** ±1 point for total Guna

---

## Comparison Checklist

### Kundli Generation
- [ ] Ascendant (Lagna) matches
- [ ] Moon Sign (Rashi) matches
- [ ] Nakshatra matches
- [ ] Sun Sign matches
- [ ] Planetary positions within ±1 degree
- [ ] Tithi matches
- [ ] Yoga matches

### Horoscope
- [ ] General trends align
- [ ] Predictions are similar in nature
- [ ] Time periods mentioned are reasonable

### Panchang
- [ ] Tithi matches exactly
- [ ] Nakshatra matches exactly
- [ ] Yoga matches exactly
- [ ] Karana matches exactly
- [ ] Sunrise/Sunset within ±5 minutes

### Numerology
- [ ] Life Path Number matches
- [ ] Destiny Number matches
- [ ] Soul Number matches
- [ ] Personality Number matches

### Dosha Analysis
- [ ] Manglik status matches
- [ ] Kaal Sarp Dosha matches
- [ ] Shani Dosha matches
- [ ] Rahu-Ketu Dosha matches

### Horoscope Matching
- [ ] Total Guna within ±1 point
- [ ] Guna breakdown matches
- [ ] Verdict matches

---

## Expected Results

### Must Match Exactly
- Ascendant (Lagna)
- Moon Sign (Rashi)
- Nakshatra
- Dosha Status (Manglik/Non-Manglik)
- Numerology Numbers
- Panchang Tithi, Nakshatra, Yoga, Karana

### Acceptable Tolerance
- **Planetary Positions:** ±1 degree
- **Time Calculations:** ±5 minutes
- **Guna Matching:** ±1 point

---

## Troubleshooting

### Issue: Results don't match AstroSage
**Possible Causes:**
1. Different calculation methods (Ayanamsa)
2. Different timezone handling
3. Place coordinates difference
4. API configuration issues

**Solutions:**
1. Verify Prokerala API is configured correctly
2. Check timezone settings
3. Verify place coordinates
4. Compare calculation methods

### Issue: API calls failing
**Solutions:**
1. Check if server is running: `curl http://localhost:3001/api/astrologers`
2. Check server logs for errors
3. Verify API credentials in `.env.local`
4. Check network connectivity

---

## Test Results Template

```
Date: ___________
Tester: ___________

### Kundli Generation
- Ascendant: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- Moon Sign: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- Nakshatra: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- Planetary Positions: Within tolerance: Yes/No

### Panchang
- Tithi: Match: Yes/No
- Nakshatra: Match: Yes/No
- Yoga: Match: Yes/No

### Numerology
- Life Path: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- Destiny: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)

### Dosha Analysis
- Manglik: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)
- Kaal Sarp: AstroSetu: _____, AstroSage: _____ (Match: Yes/No)

### Overall Accuracy: _____%
```

---

## Notes

- AstroSage uses their own calculation engine, so minor differences may occur
- Prokerala API (if configured) should provide accurate calculations
- Timezone handling is critical for accuracy
- Place coordinates must be accurate for precise calculations

---

**Last Updated:** $(date)

