# 🔍 Comprehensive AstroSage Comparison Testing Guide

## Overview
This guide provides a systematic approach to test and compare AstroSetu's functionality, features, and calculations against [AstroSage.com](https://www.astrosage.com/) for accuracy and correctness.

**Reference**: [AstroSage.com](https://www.astrosage.com/)

---

## 📋 Test User Data

### Primary Test User (Amit Kumar Mandal)
- **Name**: Amit Kumar Mandal
- **Gender**: Male
- **Date of Birth**: 26 November 1984 (26/11/1984)
- **Time of Birth**: 21:40:00 (9:40 PM)
- **Place**: Noamundi, Jharkhand, India
- **Coordinates**: ~22.15°N, 85.50°E
- **Timezone**: Asia/Kolkata (IST)

### Secondary Test User (for Matching)
- **Name**: [To be added]
- **Gender**: Female
- **Date of Birth**: [To be added]
- **Time of Birth**: [To be added]
- **Place**: [To be added]

---

## 🎯 Critical Calculations to Verify

### 1. Planetary Positions (±1 degree tolerance)
- [ ] Sun position matches
- [ ] Moon position matches
- [ ] Mars position matches
- [ ] Mercury position matches
- [ ] Jupiter position matches
- [ ] Venus position matches
- [ ] Saturn position matches
- [ ] Rahu position matches
- [ ] Ketu position matches

### 2. House Calculations (Must match exactly)
- [ ] Ascendant (1st House) sign matches
- [ ] All 12 houses match
- [ ] House lords match
- [ ] Planetary aspects match

### 3. Core Astrological Elements (Must match exactly)
- [ ] Ascendant Sign (Lagna)
- [ ] Moon Sign (Rashi)
- [ ] Nakshatra
- [ ] Nakshatra Pada
- [ ] Nakshatra Lord

### 4. Dasha Calculations
- [ ] Current Dasha matches
- [ ] Dasha periods match
- [ ] Antardasha matches
- [ ] Dasha start dates match

### 5. Dosha Analysis (Must match exactly)
- [ ] Manglik Dosha status
- [ ] Kaal Sarp Dosha status
- [ ] Shani Dosha status
- [ ] Rahu-Ketu Dosha status

---

## 📊 Test Cases

### Test Case 1: Basic Kundli Generation

**Test Data:**
- Name: Amit Kumar Mandal
- Gender: Male
- Date: 26/11/1984
- Time: 21:40:00
- Place: Noamundi, Jharkhand, India

**Steps:**

1. **AstroSage:**
   - Go to https://www.astrosage.com/
   - Click "Free Kundli" or navigate to Kundli section
   - Enter test data
   - Generate Kundli
   - Note down all results

2. **AstroSetu:**
   - Go to http://localhost:3001/kundli
   - Enter same test data
   - Generate Kundli
   - Note down all results

**Expected Results (AstroSage):**
- Ascendant: ___________
- Moon Sign: ___________
- Nakshatra: ___________
- Planetary Positions:
  - Sun: ___________
  - Moon: ___________
  - Mars: ___________
  - Mercury: ___________
  - Jupiter: ___________
  - Venus: ___________
  - Saturn: ___________
  - Rahu: ___________
  - Ketu: ___________

**AstroSetu Results:**
- Ascendant: ___________
- Moon Sign: ___________
- Nakshatra: ___________
- Planetary Positions:
  - Sun: ___________
  - Moon: ___________
  - Mars: ___________
  - Mercury: ___________
  - Jupiter: ___________
  - Venus: ___________
  - Saturn: ___________
  - Rahu: ___________
  - Ketu: ___________

**Comparison:**
- [ ] Ascendant matches exactly
- [ ] Moon Sign matches exactly
- [ ] Nakshatra matches exactly
- [ ] All planetary positions match (±1 degree)
- [ ] House positions match
- [ ] Dasha matches

**Screenshots:**
- [ ] AstroSage Kundli screenshot saved
- [ ] AstroSetu Kundli screenshot saved

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

1. **AstroSage:**
   - Go to Horoscope Matching section
   - Enter boy's details
   - Enter girl's details
   - Generate match report
   - Note down results

2. **AstroSetu:**
   - Go to http://localhost:3001/match
   - Enter same details
   - Generate match report
   - Note down results

**Expected Results (AstroSage):**
- Total Guna Score: ___________
- Guna Breakdown:
  - Varna: ___________
  - Vashya: ___________
  - Tara: ___________
  - Yoni: ___________
  - Graha Maitri: ___________
  - Gana: ___________
  - Bhakoot: ___________
  - Nadi: ___________
- Manglik Status: ___________
- Verdict: ___________

**AstroSetu Results:**
- Total Guna Score: ___________
- Guna Breakdown: [Same as above]
- Manglik Status: ___________
- Verdict: ___________

**Comparison:**
- [ ] Total Guna matches (±1 point tolerance)
- [ ] All Guna breakdown matches
- [ ] Verdict matches
- [ ] Manglik status matches exactly
- [ ] Compatibility percentage matches (±2%)

**Screenshots:**
- [ ] AstroSage Match screenshot saved
- [ ] AstroSetu Match screenshot saved

---

### Test Case 3: Panchang

**Test Data:**
- Date: Today's date
- Place: New Delhi, India

**Steps:**

1. **AstroSage:**
   - Go to Panchang section
   - Select today's date and place
   - Note down results

2. **AstroSetu:**
   - Go to http://localhost:3001/panchang
   - Select same date and place
   - Note down results

**Expected Results (AstroSage):**
- Tithi: ___________
- Nakshatra: ___________
- Yoga: ___________
- Karana: ___________
- Sunrise: ___________
- Sunset: ___________
- Rahu Kaal: ___________
- Abhijit Muhurat: ___________

**AstroSetu Results:**
- Tithi: ___________
- Nakshatra: ___________
- Yoga: ___________
- Karana: ___________
- Sunrise: ___________
- Sunset: ___________
- Rahu Kaal: ___________
- Abhijit Muhurat: ___________

**Comparison:**
- [ ] Tithi matches exactly
- [ ] Nakshatra matches exactly
- [ ] Yoga matches exactly
- [ ] Karana matches exactly
- [ ] Sunrise time matches (±5 minutes)
- [ ] Sunset time matches (±5 minutes)
- [ ] Rahu Kaal matches (±5 minutes)

---

### Test Case 4: Daily Horoscope

**Test Data:**
- Sign: Aries (or any sign)
- Date: Today

**Steps:**

1. **AstroSage:**
   - Go to Today's Horoscope
   - Select sign
   - Note down prediction

2. **AstroSetu:**
   - Go to http://localhost:3001/horoscope
   - Select same sign
   - Note down prediction

**Expected Results (AstroSage):**
- Prediction Text: ___________
- Lucky Color: ___________
- Lucky Number: ___________
- Mood: ___________

**AstroSetu Results:**
- Prediction Text: ___________
- Lucky Color: ___________
- Lucky Number: ___________
- Mood: ___________

**Comparison:**
- [ ] Prediction is relevant (exact match not required)
- [ ] Lucky color matches
- [ ] Lucky number matches
- [ ] Mood matches

---

### Test Case 5: Numerology

**Test Data:**
- Name: Amit Kumar Mandal
- Date: 26/11/1984

**Steps:**

1. **AstroSage:**
   - Go to Numerology Calculator
   - Enter name and date
   - Note down numbers

2. **AstroSetu:**
   - Go to http://localhost:3001/numerology
   - Enter same data
   - Note down numbers

**Expected Results (AstroSage):**
- Life Path Number: ___________
- Destiny Number: ___________
- Soul Number: ___________
- Personality Number: ___________
- Expression Number: ___________

**AstroSetu Results:**
- Life Path Number: ___________
- Destiny Number: ___________
- Soul Number: ___________
- Personality Number: ___________
- Expression Number: ___________

**Comparison:**
- [ ] Life Path Number matches exactly
- [ ] Destiny Number matches exactly
- [ ] Soul Number matches exactly
- [ ] Personality Number matches exactly
- [ ] Expression Number matches exactly

---

### Test Case 6: Dosha Analysis

**Test Data:**
- Same as Test Case 1 (Kundli)

**Steps:**

1. **AstroSage:**
   - Generate Kundli
   - Check Dosha analysis section
   - Note down all doshas

2. **AstroSetu:**
   - Generate Kundli
   - Check Dosha analysis section
   - Note down all doshas

**Expected Results (AstroSage):**
- Manglik Dosha: [Yes/No] - Details: ___________
- Kaal Sarp Dosha: [Yes/No] - Details: ___________
- Shani Dosha: [Yes/No] - Details: ___________
- Rahu-Ketu Dosha: [Yes/No] - Details: ___________

**AstroSetu Results:**
- Manglik Dosha: [Yes/No] - Details: ___________
- Kaal Sarp Dosha: [Yes/No] - Details: ___________
- Shani Dosha: [Yes/No] - Details: ___________
- Rahu-Ketu Dosha: [Yes/No] - Details: ___________

**Comparison:**
- [ ] Manglik status matches exactly
- [ ] Kaal Sarp status matches exactly
- [ ] Shani effects match
- [ ] Rahu-Ketu effects match
- [ ] Remedies are relevant

---

### Test Case 7: Muhurat Finder

**Test Data:**
- Event: Marriage (or any event)
- Date Range: [Select range]
- Place: New Delhi, India

**Steps:**

1. **AstroSage:**
   - Go to Muhurat section
   - Enter event details
   - Find muhurat
   - Note down results

2. **AstroSetu:**
   - Go to http://localhost:3001/muhurat
   - Enter same details
   - Find muhurat
   - Note down results

**Expected Results (AstroSage):**
- Best Muhurat: ___________
- Good Muhurat: ___________
- Avoid Times: ___________

**AstroSetu Results:**
- Best Muhurat: ___________
- Good Muhurat: ___________
- Avoid Times: ___________

**Comparison:**
- [ ] Best muhurat times match (±15 minutes)
- [ ] Good muhurat times match (±15 minutes)
- [ ] Avoid times match

---

### Test Case 8: Reports Comparison

#### 8.1 Life Report

**Steps:**

1. **AstroSage:**
   - Generate Kundli
   - Generate Life Report
   - Note down sections

2. **AstroSetu:**
   - Generate Kundli
   - Go to Life Report
   - Note down sections

**Comparison:**
- [ ] Report structure matches
- [ ] Sections match (Birth Chart, Planetary Positions, House Analysis, Dasha, Predictions, Dosha, Remedies)
- [ ] Content is personalized
- [ ] Calculations match

#### 8.2 Ascendant Report

**Comparison:**
- [ ] Ascendant analysis matches
- [ ] Lagna Lord matches
- [ ] Predictions are relevant

#### 8.3 Lal Kitab Report

**Comparison:**
- [ ] Planetary remedies match
- [ ] House analysis matches
- [ ] Remedies are relevant

#### 8.4 Dasha Phal Analysis

**Comparison:**
- [ ] Current Dasha matches
- [ ] Antardasha matches
- [ ] Predictions are relevant

---

## ⚙️ Calculation Parameters Comparison

### Ayanamsa
- **AstroSage**: Lahiri (default)
- **AstroSetu**: Lahiri (configured in Prokerala API)
- **Status**: [ ] Matches

### House System
- **AstroSage**: [Check on AstroSage]
- **AstroSetu**: Placidus (default in Prokerala)
- **Status**: [ ] Matches / [ ] Different (Note: __________)

### Dasha System
- **AstroSage**: Vimshottari (default)
- **AstroSetu**: Vimshottari (default)
- **Status**: [ ] Matches

### Timezone Handling
- **AstroSage**: [Check]
- **AstroSetu**: Uses timezone from place coordinates
- **Status**: [ ] Matches

---

## ⚠️ Tolerance Levels

### Acceptable Differences:
- **Planetary Positions**: ±1 degree (due to different calculation methods or rounding)
- **Time Calculations**: ±5 minutes (due to timezone handling differences)
- **Guna Matching**: ±1 point (due to rounding)
- **Text Predictions**: Similar content (exact match not required, but should be relevant)
- **Muhurat Times**: ±15 minutes (acceptable range)

### Must Match Exactly:
- **Ascendant Sign**: Must match exactly
- **Moon Sign**: Must match exactly
- **Nakshatra**: Must match exactly
- **Nakshatra Pada**: Must match exactly
- **Numerology Numbers**: Must match exactly
- **Dosha Status**: Must match exactly (Manglik/Non-Manglik, etc.)
- **Tithi**: Must match exactly
- **Yoga**: Must match exactly
- **Karana**: Must match exactly

---

## 🐛 Known Differences & Notes

### 1. Ayanamsa Systems
- Different systems may use different ayanamsa values
- **Action**: Verify both use Lahiri

### 2. House Systems
- Different house systems (Placidus, Equal, etc.) give different house cusps
- **Action**: Verify which system AstroSage uses

### 3. Dasha Calculations
- Different dasha calculation methods
- **Action**: Verify both use Vimshottari

### 4. API vs Manual Calculations
- Prokerala API may use slightly different algorithms than AstroSage
- **Action**: Document any differences and verify if within tolerance

---

## 📝 Test Results Template

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

### Screenshots:
- AstroSage: [Link/Path]
- AstroSetu: [Link/Path]

### Notes:
___________
```

---

## ✅ Pre-Testing Checklist

### Setup:
- [ ] Test data prepared (Amit Kumar Mandal details)
- [ ] AstroSage account created (if needed for advanced features)
- [ ] AstroSetu dev server running (http://localhost:3001)
- [ ] Browser DevTools open for debugging
- [ ] Screenshot tool ready
- [ ] Prokerala API configured (check `.env.local`)

### Environment:
- [ ] Prokerala API credentials configured
- [ ] API is responding (not using mock data)
- [ ] Timezone settings correct
- [ ] Date/time format consistent

---

## 🔄 During Testing

### For Each Test Case:
1. [ ] Test on AstroSage first
2. [ ] Document all results
3. [ ] Take screenshots
4. [ ] Test on AstroSetu
5. [ ] Document all results
6. [ ] Take screenshots
7. [ ] Compare side-by-side
8. [ ] Note any differences
9. [ ] Verify if differences are within tolerance
10. [ ] Document findings

---

## 📊 Post-Testing Analysis

### Review All Differences:
- [ ] List all mismatches
- [ ] Categorize by severity (Critical/High/Medium/Low)
- [ ] Identify root causes
- [ ] Determine if fixable or acceptable

### Critical Issues (Must Fix):
- [ ] Ascendant mismatch
- [ ] Moon Sign mismatch
- [ ] Nakshatra mismatch
- [ ] Dosha status mismatch
- [ ] Major calculation errors

### High Priority (Should Fix):
- [ ] Planetary position differences >1 degree
- [ ] Guna matching differences >1 point
- [ ] Time calculation differences >5 minutes

### Medium Priority (Nice to Fix):
- [ ] Minor calculation differences within tolerance
- [ ] UI/UX differences
- [ ] Report formatting differences

### Low Priority (Acceptable):
- [ ] Text prediction variations (as long as relevant)
- [ ] Minor UI differences
- [ ] Styling differences

---

## 🔗 Reference Links

- [AstroSage Home](https://www.astrosage.com/)
- [AstroSage Free Kundli](https://www.astrosage.com/)
- [AstroSage Horoscope Matching](https://www.astrosage.com/)
- [AstroSage Panchang](https://www.astrosage.com/panchang/)
- [AstroSage Horoscope](https://www.astrosage.com/horoscope/)
- [AstroSage Numerology](https://www.astrosage.com/numerology/)

---

## 📈 Testing Progress Tracker

### Completed Tests:
- [ ] Test Case 1: Basic Kundli Generation
- [ ] Test Case 2: Horoscope Matching
- [ ] Test Case 3: Panchang
- [ ] Test Case 4: Daily Horoscope
- [ ] Test Case 5: Numerology
- [ ] Test Case 6: Dosha Analysis
- [ ] Test Case 7: Muhurat Finder
- [ ] Test Case 8: Reports Comparison

### Overall Status:
- **Total Tests**: 8
- **Passed**: ___
- **Failed**: ___
- **Pass Rate**: ___%

---

**Last Updated**: $(date)
**Status**: Ready for Comprehensive Testing
**Next Steps**: Run automated test script and manual verification

