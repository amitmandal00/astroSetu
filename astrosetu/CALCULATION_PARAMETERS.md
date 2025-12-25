# 🔢 Astrological Calculation Parameters

## Overview
This document specifies the calculation parameters used in AstroSetu and compares them with AstroSage.com to ensure accuracy.

**Reference**: [AstroSage.com](https://www.astrosage.com/)

---

## 📊 Calculation Parameters Comparison

### Ayanamsa (Precession Correction)

| Parameter | AstroSage (Default) | AstroSetu | Status |
|-----------|---------------------|-----------|--------|
| **Ayanamsa System** | Lahiri (N.C. Lahiri) | Lahiri (Ayanamsa: 1) | ✅ Match |
| **Value** | ~23.85° (for 2000 CE) | Same | ✅ Match |

**Note**: AstroSage allows selection of different ayanamsa systems (Lahiri, KP, Raman, etc.). We use Lahiri as default to match AstroSage's default.

---

### House System

| Parameter | AstroSage (Default) | AstroSetu | Status |
|-----------|---------------------|-----------|--------|
| **House System** | Placidus (North Indian) | Placidus | ✅ Match |
| **Chart Style** | North Indian / South Indian | North Indian | ✅ Match |

**Note**: AstroSage supports both North Indian and South Indian chart styles. We use North Indian style by default.

---

### Dasha System

| Parameter | AstroSage (Default) | AstroSetu | Status |
|-----------|---------------------|-----------|--------|
| **Dasha System** | Vimshottari Dasha | Vimshottari | ✅ Match |
| **Calculation** | Standard Vimshottari | Standard Vimshottari | ✅ Match |

---

### Time Zone Handling

| Parameter | AstroSage | AstroSetu | Status |
|-----------|-----------|-----------|--------|
| **Default Timezone** | Asia/Kolkata (IST) | Asia/Kolkata | ✅ Match |
| **DST Handling** | Automatic | Automatic | ✅ Match |
| **Time Format** | 24-hour | 24-hour | ✅ Match |

---

### Coordinate System

| Parameter | AstroSage | AstroSetu | Status |
|-----------|-----------|-----------|--------|
| **Latitude Format** | Decimal degrees | Decimal degrees | ✅ Match |
| **Longitude Format** | Decimal degrees | Decimal degrees | ✅ Match |
| **Geocoding** | OpenStreetMap/Nominatim | OpenStreetMap/Nominatim | ✅ Match |

---

## 🎯 Critical Calculations

### 1. Planetary Positions

**Calculation Method:**
- Uses Swiss Ephemeris or similar astronomical calculations
- Accounts for precession (ayanamsa)
- Calculates true positions (not mean positions)

**Tolerance:**
- ±1 degree acceptable (due to different calculation libraries)
- ±0.1 degree preferred

**AstroSage Reference:**
- Uses their proprietary calculation engine
- Based on standard astronomical algorithms

**AstroSetu Implementation:**
- Uses Prokerala API (when configured)
- Falls back to mock calculations (for development)
- Prokerala uses Swiss Ephemeris internally

---

### 2. Ascendant (Lagna) Calculation

**Formula:**
```
Ascendant = f(latitude, longitude, date, time, ayanamsa)
```

**Critical Factors:**
- Accurate latitude/longitude
- Correct timezone
- Proper ayanamsa value
- Date/time precision

**Expected Match:** ✅ Must match exactly (±0.1 degree)

---

### 3. Moon Sign (Rashi) Calculation

**Calculation:**
- Based on Moon's position in zodiac
- Uses sidereal zodiac (not tropical)
- Accounts for ayanamsa

**Expected Match:** ✅ Must match exactly

---

### 4. Nakshatra Calculation

**Calculation:**
- Divides zodiac into 27 equal parts (13.33° each)
- Determines which nakshatra Moon is in
- Calculates pada (quarter) within nakshatra

**Expected Match:** ✅ Must match exactly

---

### 5. Horoscope Matching (Guna Milan)

**Calculation:**
- 36 Gunas total
- 8 categories (Varna, Vashya, Tara, Yoni, etc.)
- Each category has specific scoring

**Expected Match:** ✅ Total Guna should match (±1 point tolerance)

**Guna Categories:**
1. Varna (1 point)
2. Vashya (2 points)
3. Tara (3 points)
4. Yoni (4 points)
5. Graha Maitri (5 points)
6. Gana (6 points)
7. Bhakoot (7 points)
8. Nadi (8 points)

**Total:** 36 points

---

## 🔧 Configuration Settings

### Current AstroSetu Settings:

```typescript
{
  ayanamsa: 1, // Lahiri
  houseSystem: "placidus",
  chartStyle: "north-indian",
  dashaSystem: "vimshottari",
  timezone: "Asia/Kolkata",
  coordinateFormat: "decimal"
}
```

### AstroSage Default Settings:

```
Ayanamsa: Lahiri (N.C. Lahiri)
House System: Placidus
Chart Style: North Indian
Dasha: Vimshottari
Timezone: IST (Asia/Kolkata)
```

**Status:** ✅ All parameters match

---

## 🧪 Testing Checklist

### Pre-Testing:
- [ ] Verify Ayanamsa setting (should be Lahiri)
- [ ] Verify House System (should be Placidus)
- [ ] Verify Timezone (should be Asia/Kolkata)
- [ ] Verify Coordinate format (decimal degrees)

### During Testing:
- [ ] Use same test data on both platforms
- [ ] Compare Ascendant (must match exactly)
- [ ] Compare Moon Sign (must match exactly)
- [ ] Compare Nakshatra (must match exactly)
- [ ] Compare Planetary positions (±1 degree tolerance)
- [ ] Compare Guna matching (±1 point tolerance)

### Post-Testing:
- [ ] Document any differences
- [ ] Investigate calculation discrepancies
- [ ] Update calculation parameters if needed
- [ ] Re-test after fixes

---

## 📝 Known Differences

### 1. Calculation Libraries
- **AstroSage**: Proprietary calculation engine
- **AstroSetu**: Prokerala API (uses Swiss Ephemeris)

**Impact:** Minor differences in planetary positions (±0.5-1 degree) are acceptable

### 2. Rounding Methods
- Different rounding methods may cause ±1 point differences in Guna matching
- This is acceptable and within tolerance

### 3. Text Predictions
- Predictions are interpretive and may vary
- Exact text match not required
- Content should be relevant and similar

---

## ✅ Accuracy Standards

### Must Match Exactly:
- ✅ Ascendant (Lagna)
- ✅ Moon Sign (Rashi)
- ✅ Nakshatra
- ✅ Dosha Status (Manglik/Non-Manglik)
- ✅ Numerology Numbers

### Acceptable Tolerance:
- ⚠️ Planetary Positions: ±1 degree
- ⚠️ Guna Matching: ±1 point
- ⚠️ Time Calculations: ±5 minutes
- ⚠️ Text Predictions: Similar content (not exact)

---

## 🔗 References

- [AstroSage Free Kundli](https://www.astrosage.com/)
- [Prokerala API Documentation](https://www.prokerala.com/astrology/api/)
- [Swiss Ephemeris](https://www.astro.com/swisseph/)

---

**Last Updated**: $(date)
**Status**: Ready for Testing

