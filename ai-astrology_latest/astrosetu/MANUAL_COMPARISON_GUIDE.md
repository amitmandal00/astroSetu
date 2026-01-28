# 📖 Manual AstroSage Comparison Guide

## Quick Start

This guide helps you manually compare AstroSetu with AstroSage step-by-step.

---

## 🎯 Test User Data (Copy-Paste Ready)

```
Name: Amit Kumar Mandal
Gender: Male
Date of Birth: 26 November 1984
Time: 21:40:00 (9:40 PM)
Place: Noamundi, Jharkhand, India
```

---

## 📋 Step-by-Step Comparison

### Step 1: Kundli Generation

#### On AstroSage:
1. Go to https://www.astrosage.com/
2. Click "Free Kundli" or find Kundli section
3. Enter:
   - Name: `Amit Kumar Mandal`
   - Gender: `Male`
   - Date: `26/11/1984`
   - Time: `21:40`
   - Place: `Noamundi, Jharkhand, India`
4. Click "Get Kundli" or "Submit"
5. **Screenshot the results**
6. **Note down:**
   - Ascendant (Lagna)
   - Moon Sign (Rashi)
   - Nakshatra
   - Planetary positions (Sun, Moon, Mars, etc.)

#### On AstroSetu:
1. Go to http://localhost:3001/kundli
2. Enter same data
3. Click "SHOW KUNDLI"
4. **Screenshot the results**
5. **Note down same values**

#### Compare:
- [ ] Ascendant matches exactly?
- [ ] Moon Sign matches exactly?
- [ ] Nakshatra matches exactly?
- [ ] Planetary positions match (±1 degree)?

**If mismatch:** Note the difference and check:
- Is Prokerala API configured?
- Are coordinates correct?
- Is timezone correct?

---

### Step 2: Horoscope Matching

#### On AstroSage:
1. Go to Horoscope Matching section
2. Enter Boy's details (same as above)
3. Enter Girl's details (use test data)
4. Generate match
5. **Note down:**
   - Total Guna Score
   - Guna breakdown (Varna, Vashya, Tara, etc.)
   - Manglik status
   - Verdict

#### On AstroSetu:
1. Go to http://localhost:3001/match
2. Enter same details
3. Generate match
4. **Note down same values**

#### Compare:
- [ ] Total Guna matches (±1 point)?
- [ ] Manglik status matches exactly?
- [ ] Verdict matches?

---

### Step 3: Panchang

#### On AstroSage:
1. Go to Panchang section
2. Select today's date
3. Select place: `New Delhi, India`
4. **Note down:**
   - Tithi
   - Nakshatra
   - Yoga
   - Karana
   - Sunrise time
   - Sunset time
   - Rahu Kaal

#### On AstroSetu:
1. Go to http://localhost:3001/panchang
2. Select same date and place
3. **Note down same values**

#### Compare:
- [ ] Tithi matches exactly?
- [ ] Nakshatra matches exactly?
- [ ] Sunrise/Sunset match (±5 minutes)?

---

### Step 4: Numerology

#### On AstroSage:
1. Go to Numerology Calculator
2. Enter:
   - Name: `Amit Kumar Mandal`
   - Date: `26/11/1984`
3. **Note down:**
   - Life Path Number
   - Destiny Number
   - Soul Number
   - Personality Number

#### On AstroSetu:
1. Go to http://localhost:3001/numerology
2. Enter same data
3. **Note down same values**

#### Compare:
- [ ] All numbers match exactly?

---

### Step 5: Dosha Analysis

#### On AstroSage:
1. Generate Kundli (from Step 1)
2. Find Dosha Analysis section
3. **Note down:**
   - Manglik Dosha: [Yes/No]
   - Kaal Sarp Dosha: [Yes/No]
   - Shani Dosha: [Yes/No]

#### On AstroSetu:
1. Generate Kundli (from Step 1)
2. Check Dosha Analysis section
3. **Note down same values**

#### Compare:
- [ ] All dosha statuses match exactly?

---

## 🔍 What to Look For

### ✅ Must Match Exactly:
- Ascendant Sign
- Moon Sign
- Nakshatra
- Dosha Status (Manglik/Non-Manglik)
- Numerology Numbers
- Tithi, Yoga, Karana

### ⚠️ Acceptable Differences (± tolerance):
- Planetary Positions: ±1 degree
- Time Calculations: ±5 minutes
- Guna Score: ±1 point
- Muhurat Times: ±15 minutes

### 📝 Text Predictions:
- Don't need exact match
- Should be relevant and similar in meaning
- Should be personalized (not generic)

---

## 🐛 Troubleshooting

### If calculations don't match:

1. **Check API Configuration:**
   ```bash
   # Check if Prokerala API is configured
   cat .env.local | grep PROKERALA
   ```

2. **Check Coordinates:**
   - Verify place coordinates are correct
   - Use same coordinates on both sites

3. **Check Timezone:**
   - Ensure timezone is correct (Asia/Kolkata for India)
   - Verify DST handling

4. **Check Ayanamsa:**
   - Both should use Lahiri
   - Verify in calculation parameters

5. **Check House System:**
   - Note which house system AstroSage uses
   - Compare with AstroSetu settings

---

## 📊 Comparison Template

Use this template to document your findings:

```
## Test: [Kundli/Match/Panchang/etc.]

### AstroSage Results:
- Ascendant: ___________
- Moon Sign: ___________
- Nakshatra: ___________
- [Other values]

### AstroSetu Results:
- Ascendant: ___________
- Moon Sign: ___________
- Nakshatra: ___________
- [Other values]

### Comparison:
✅ Match / ❌ Mismatch

### Notes:
[Any observations or issues]

### Screenshots:
- AstroSage: [path]
- AstroSetu: [path]
```

---

## ✅ Testing Checklist

### Before Testing:
- [ ] AstroSetu server running (http://localhost:3001)
- [ ] Prokerala API configured (check `.env.local`)
- [ ] Test data ready (Amit Kumar Mandal details)
- [ ] Browser tabs open for both sites
- [ ] Screenshot tool ready

### During Testing:
- [ ] Test each feature on AstroSage first
- [ ] Document all results
- [ ] Take screenshots
- [ ] Test same feature on AstroSetu
- [ ] Compare side-by-side
- [ ] Note any differences

### After Testing:
- [ ] Review all comparisons
- [ ] Categorize differences (Critical/High/Medium/Low)
- [ ] Document findings
- [ ] Create action items for fixes

---

## 🎯 Priority Fixes

### Critical (Must Fix Immediately):
- Ascendant mismatch
- Moon Sign mismatch
- Nakshatra mismatch
- Dosha status mismatch

### High Priority (Fix Soon):
- Planetary positions >1 degree difference
- Guna matching >1 point difference
- Time calculations >5 minutes difference

### Medium Priority (Fix When Possible):
- Minor calculation differences within tolerance
- UI/UX improvements
- Report formatting

---

**Happy Testing! 🚀**

