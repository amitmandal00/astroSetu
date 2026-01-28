# Quick AstroSage Accuracy Test Guide

## Quick Start

### 1. Start Server
```bash
cd astrosetu
npm run dev
```

### 2. Run Test
```bash
./test-astrosage-accuracy.sh
```

### 3. Manual Comparison

Open two browser windows:
- **Window 1:** http://localhost:3001 (AstroSetu)
- **Window 2:** https://www.astrosage.com/ (AstroSage)

---

## Test User Data

**Name:** Amit Kumar Mandal  
**DOB:** 26th November 1984  
**TOB:** 21:40:00 (9:40 PM)  
**Place:** Noamundi, Jharkhand, India

---

## Quick Comparison Steps

### 1. Kundli Generation

**AstroSetu:**
1. Go to http://localhost:3001/kundli
2. Enter:
   - Name: Amit Kumar Mandal
   - Date: 26 Nov 1984
   - Time: 21:40
   - Place: Noamundi, Jharkhand
3. Click "Generate Kundli"
4. Note: Ascendant, Moon Sign, Nakshatra, Planetary Positions

**AstroSage:**
1. Go to https://www.astrosage.com/kundli/
2. Enter same details
3. Compare results

**Key Comparisons:**
- ✅ Ascendant (Lagna) - Must match exactly
- ✅ Moon Sign (Rashi) - Must match exactly
- ✅ Nakshatra - Must match exactly
- ✅ Planetary Positions - Within ±1 degree

---

### 2. Numerology

**AstroSetu:**
1. Go to http://localhost:3001/numerology
2. Enter:
   - Name: Amit Kumar Mandal
   - DOB: 26 Nov 1984
3. Note: Life Path, Destiny, Soul Numbers

**AstroSage:**
1. Go to https://www.astrosage.com/numerology/
2. Enter same details
3. Compare numbers

**Key Comparisons:**
- ✅ Life Path Number - Must match exactly
- ✅ Destiny Number - Must match exactly
- ✅ Soul Number - Must match exactly

---

### 3. Panchang

**AstroSetu:**
1. Go to http://localhost:3001/panchang
2. Enter: Today's date, Noamundi, Jharkhand
3. Note: Tithi, Nakshatra, Yoga, Karana

**AstroSage:**
1. Go to https://www.astrosage.com/panchang/
2. Enter same details
3. Compare

**Key Comparisons:**
- ✅ Tithi - Must match exactly
- ✅ Nakshatra - Must match exactly
- ✅ Yoga - Must match exactly
- ✅ Karana - Must match exactly

---

### 4. Dosha Analysis

**AstroSetu:**
1. Generate Kundli first (see step 1)
2. Check Dosha section
3. Note: Manglik status, Kaal Sarp, Shani Dosha

**AstroSage:**
1. Generate Kundli with same details
2. Check Dosha section
3. Compare

**Key Comparisons:**
- ✅ Manglik Status - Must match exactly
- ✅ Kaal Sarp Dosha - Must match exactly
- ✅ Shani Dosha - Must match exactly

---

## Expected Results

### Must Match Exactly (No Tolerance)
- Ascendant (Lagna)
- Moon Sign (Rashi)
- Nakshatra
- Dosha Status
- Numerology Numbers
- Panchang Tithi, Nakshatra, Yoga, Karana

### Acceptable Tolerance
- **Planetary Positions:** ±1 degree
- **Time Calculations:** ±5 minutes
- **Guna Matching:** ±1 point

---

## Test Results Checklist

```
Date: ___________

### Kundli
- [ ] Ascendant matches
- [ ] Moon Sign matches
- [ ] Nakshatra matches
- [ ] Planetary positions within ±1 degree

### Numerology
- [ ] Life Path Number matches
- [ ] Destiny Number matches
- [ ] Soul Number matches

### Panchang
- [ ] Tithi matches
- [ ] Nakshatra matches
- [ ] Yoga matches
- [ ] Karana matches

### Dosha
- [ ] Manglik status matches
- [ ] Kaal Sarp matches
- [ ] Shani Dosha matches

### Overall Accuracy: _____%
```

---

## Troubleshooting

**Results don't match?**
1. Check if Prokerala API is configured
2. Verify timezone settings
3. Check place coordinates
4. Compare calculation methods (Ayanamsa)

**API errors?**
1. Check server logs
2. Verify API credentials
3. Check network connectivity

---

**For detailed testing, see:** `ASTROSAGE_ACCURACY_TEST.md`

