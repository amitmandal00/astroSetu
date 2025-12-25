# 🔍 AstroSage Comparison Testing Guide

## Overview
This guide helps verify that AstroSetu calculations match AstroSage.com results for accuracy and correctness.

**Reference**: [AstroSage.com](https://www.astrosage.com/)

---

## 📋 Test Cases

### Test Case 1: Basic Kundli Generation

**Test Data:**
- Name: Amit Kumar Mandal
- Date: 26/11/1984
- Time: 21:40:00
- Place: Noamundi, Jharkhand, India

**Steps:**
1. Go to AstroSage.com → Free Kundli
2. Enter the test data
3. Generate Kundli
4. Note down:
   - Ascendant (Lagna)
   - Moon Sign (Rashi)
   - Nakshatra
   - Planetary positions
   - House positions

**Expected Results (AstroSage):**
- Ascendant: [To be filled]
- Moon Sign: [To be filled]
- Nakshatra: [To be filled]
- Planets: [To be filled]

**AstroSetu Results:**
- Ascendant: [To be filled]
- Moon Sign: [To be filled]
- Nakshatra: [To be filled]
- Planets: [To be filled]

**Comparison:**
- [ ] Ascendant matches
- [ ] Moon Sign matches
- [ ] Nakshatra matches
- [ ] Planetary positions match (±1 degree tolerance)
- [ ] House positions match

---

### Test Case 2: Horoscope Matching (Kundli Milan)

**Test Data - Boy:**
- Name: Amit Kumar Mandal
- Date: 26/11/1984
- Time: 21:40:00
- Place: Noamundi, Jharkhand, India

**Test Data - Girl:**
- Name: [Test Name]
- Date: [Test Date]
- Time: [Test Time]
- Place: [Test Place]

**Steps:**
1. Go to AstroSage.com → Horoscope Matching
2. Enter boy's details
3. Enter girl's details
4. Generate match report
5. Note down:
   - Total Guna Score
   - Guna breakdown
   - Manglik status
   - Verdict

**Expected Results (AstroSage):**
- Total Guna: [To be filled]
- Verdict: [To be filled]
- Manglik: [To be filled]

**AstroSetu Results:**
- Total Guna: [To be filled]
- Verdict: [To be filled]
- Manglik: [To be filled]

**Comparison:**
- [ ] Total Guna matches (±1 point tolerance)
- [ ] Verdict matches
- [ ] Manglik status matches
- [ ] Guna breakdown matches

---

### Test Case 3: Panchang

**Test Data:**
- Date: Today's date
- Place: New Delhi, India

**Steps:**
1. Go to AstroSage.com → Panchang
2. Select today's date and place
3. Note down:
   - Tithi
   - Nakshatra
   - Yoga
   - Karana
   - Sunrise/Sunset times
   - Rahu Kaal

**Expected Results (AstroSage):**
- Tithi: [To be filled]
- Nakshatra: [To be filled]
- Sunrise: [To be filled]
- Sunset: [To be filled]

**AstroSetu Results:**
- Tithi: [To be filled]
- Nakshatra: [To be filled]
- Sunrise: [To be filled]
- Sunset: [To be filled]

**Comparison:**
- [ ] Tithi matches
- [ ] Nakshatra matches
- [ ] Sunrise time matches (±5 minutes tolerance)
- [ ] Sunset time matches (±5 minutes tolerance)
- [ ] Rahu Kaal matches

---

### Test Case 4: Horoscope (Daily)

**Test Data:**
- Sign: Aries (or any sign)
- Date: Today

**Steps:**
1. Go to AstroSage.com → Today's Horoscope
2. Select sign
3. Note down:
   - Daily prediction text
   - Lucky color
   - Lucky number
   - Mood

**Expected Results (AstroSage):**
- Prediction: [To be filled]
- Lucky Color: [To be filled]
- Lucky Number: [To be filled]

**AstroSetu Results:**
- Prediction: [To be filled]
- Lucky Color: [To be filled]
- Lucky Number: [To be filled]

**Comparison:**
- [ ] Prediction is similar (content may vary, but should be relevant)
- [ ] Lucky color matches
- [ ] Lucky number matches

---

### Test Case 5: Numerology

**Test Data:**
- Name: Amit Kumar Mandal
- Date: 26/11/1984

**Steps:**
1. Go to AstroSage.com → Numerology Calculator
2. Enter name and date
3. Note down:
   - Life Path Number
   - Destiny Number
   - Soul Number
   - Personality Number

**Expected Results (AstroSage):**
- Life Path: [To be filled]
- Destiny: [To be filled]
- Soul: [To be filled]
- Personality: [To be filled]

**AstroSetu Results:**
- Life Path: [To be filled]
- Destiny: [To be filled]
- Soul: [To be filled]
- Personality: [To be filled]

**Comparison:**
- [ ] Life Path Number matches
- [ ] Destiny Number matches
- [ ] Soul Number matches
- [ ] Personality Number matches

---

### Test Case 6: Dosha Analysis

**Test Data:**
- Same as Test Case 1 (Kundli)

**Steps:**
1. Generate Kundli on AstroSage
2. Check Dosha analysis:
   - Manglik Dosha
   - Kaal Sarp Dosha
   - Shani Dosha
   - Rahu-Ketu Dosha

**Expected Results (AstroSage):**
- Manglik: [To be filled]
- Kaal Sarp: [To be filled]
- Shani: [To be filled]

**AstroSetu Results:**
- Manglik: [To be filled]
- Kaal Sarp: [To be filled]
- Shani: [To be filled]

**Comparison:**
- [ ] Manglik status matches
- [ ] Kaal Sarp status matches
- [ ] Shani effects match
- [ ] Remedies are relevant

---

## 🎯 Critical Calculations to Verify

### 1. Planetary Positions
- [ ] Sun position matches (±1 degree)
- [ ] Moon position matches (±1 degree)
- [ ] Mars position matches (±1 degree)
- [ ] Mercury position matches (±1 degree)
- [ ] Jupiter position matches (±1 degree)
- [ ] Venus position matches (±1 degree)
- [ ] Saturn position matches (±1 degree)
- [ ] Rahu position matches (±1 degree)
- [ ] Ketu position matches (±1 degree)

### 2. House Calculations
- [ ] Ascendant (1st House) matches
- [ ] All 12 houses match
- [ ] House lords match
- [ ] Planetary aspects match

### 3. Dasha Calculations
- [ ] Current Dasha matches
- [ ] Dasha periods match
- [ ] Antardasha matches

### 4. Nakshatra Calculations
- [ ] Nakshatra name matches
- [ ] Nakshatra pada matches
- [ ] Nakshatra lord matches

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Test Case: ___________

### AstroSage Results:
[Fill in results from AstroSage]

### AstroSetu Results:
[Fill in results from AstroSetu]

### Comparison:
✅ Match
❌ Mismatch - Details: ___________

### Notes:
___________
```

---

## 🔧 Automated Testing Script

Run the comparison test script:

```bash
cd astrosetu
npm run test:compare-astrosage
```

---

## ⚠️ Tolerance Levels

### Acceptable Differences:
- **Planetary Positions**: ±1 degree (due to different calculation methods)
- **Time Calculations**: ±5 minutes (due to timezone handling)
- **Guna Matching**: ±1 point (due to rounding)
- **Text Predictions**: Similar content (exact match not required)

### Must Match Exactly:
- **Ascendant Sign**: Must match exactly
- **Moon Sign**: Must match exactly
- **Nakshatra**: Must match exactly
- **Numerology Numbers**: Must match exactly
- **Dosha Status**: Must match exactly (Manglik/Non-Manglik)

---

## 🐛 Known Differences

1. **Ayanamsa**: Different systems may use different ayanamsa
   - AstroSage: Lahiri (default)
   - AstroSetu: [Check current setting]

2. **House System**: Different house systems may give different results
   - AstroSage: [Check current setting]
   - AstroSetu: [Check current setting]

3. **Dasha System**: Different dasha calculations
   - AstroSage: Vimshottari (default)
   - AstroSetu: [Check current setting]

---

## ✅ Testing Checklist

### Pre-Testing Setup:
- [ ] Test data prepared
- [ ] AstroSage account created (if needed)
- [ ] AstroSetu dev server running
- [ ] Browser DevTools open for debugging

### During Testing:
- [ ] Test each calculation type
- [ ] Document all results
- [ ] Note any differences
- [ ] Take screenshots of both results

### Post-Testing:
- [ ] Review all differences
- [ ] Identify calculation issues
- [ ] Fix any mismatches
- [ ] Re-test after fixes

---

## 📝 Test Data Reference

**Primary Test User:**
- Name: Amit Kumar Mandal
- Date: 26/11/1984
- Time: 21:40:00
- Place: Noamundi, Jharkhand, India
- Coordinates: ~22.15°N, 85.50°E

**Secondary Test User (for Matching):**
- Name: [To be added]
- Date: [To be added]
- Time: [To be added]
- Place: [To be added]

---

## 🔗 Reference Links

- [AstroSage Free Kundli](https://www.astrosage.com/)
- [AstroSage Horoscope Matching](https://www.astrosage.com/)
- [AstroSage Panchang](https://www.astrosage.com/panchang/)

---

**Last Updated**: $(date)
**Status**: Ready for Testing

