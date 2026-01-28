# AstroSage Accuracy Fix Plan

## Test User
- **Name:** Amit Kumar Mandal
- **DOB:** 26 Nov 1984
- **TOB:** 21:40
- **POB:** Noamundi, Jharkhand, India

---

## Current Issues Identified

### 1. Mock/Pseudo-Calculated Results
- **Problem:** Falls back to mock engine when Prokerala not configured
- **Impact:** Results won't match AstroSage
- **Fix:** Ensure Prokerala credentials are configured

### 2. Missing Latitude/Longitude
- **Problem:** Prokerala requires coordinates, but UI only provides place string
- **Impact:** Kundli generation fails or uses incorrect location
- **Fix:** Implement place → coordinates lookup

### 3. Missing Advanced Settings
- **Problem:** No Ayanamsa, Timezone, or coordinate overrides
- **Impact:** Even with correct engine, results may mismatch
- **Fix:** Add advanced settings UI

### 4. Shallow Comparison
- **Problem:** Only compares basic fields (Ascendant, Rashi, Nakshatra)
- **Impact:** Can't verify prediction accuracy
- **Fix:** Expand comparison to include planetary positions, doshas, dashas

---

## Action Plan

### P0 - Must Fix (Critical)

#### ✅ Task 1: Prokerala Credentials Setup
- [ ] Create setup guide
- [ ] Add environment variable validation
- [ ] Add clear error messages when not configured

#### ✅ Task 2: Place → Coordinates Lookup
- [ ] Enhance AutocompleteInput to return coordinates
- [ ] Store place object with lat/long in state
- [ ] Pass coordinates to Prokerala API
- [ ] Add timezone detection

#### ✅ Task 3: Advanced Settings UI
- [ ] Add Ayanamsa dropdown (Lahiri, KP, etc.)
- [ ] Add Timezone selector (default Asia/Kolkata)
- [ ] Add manual lat/long input (optional)
- [ ] Store settings in form state

### P1 - Accuracy Depth

#### ✅ Task 4: Expand Comparison Screen
- [ ] Add planetary longitude comparison
- [ ] Add house cusps comparison
- [ ] Add Navamsa (D9) comparison
- [ ] Add tolerance checks (±0.2° or ±1°)

#### ✅ Task 5: Derived Results Verification
- [ ] Compare Manglik status
- [ ] Compare Kaal Sarp Dosha
- [ ] Compare Sade Sati periods
- [ ] Compare Vimshottari dasha sequence

### P2 - Quality Improvements

#### ✅ Task 6: Fallback Mode Labeling
- [ ] Add banner when Prokerala not configured
- [ ] Show "Demo Mode" indicator
- [ ] Disable accuracy claims in demo mode

#### ✅ Task 7: Reproducible Test Log
- [ ] Generate JSON test report
- [ ] Include inputs and outputs
- [ ] Include pass/fail status
- [ ] Include diff calculations

#### ✅ Task 8: Regression Tests
- [ ] Create snapshot tests
- [ ] Add tolerance tests for degrees
- [ ] Lock correct outputs for seed users

---

## Implementation Status

### P0 Tasks
- [ ] Task 1: Prokerala Setup Guide
- [ ] Task 2: Place → Coordinates
- [ ] Task 3: Advanced Settings

### P1 Tasks
- [ ] Task 4: Expanded Comparison
- [ ] Task 5: Derived Results

### P2 Tasks
- [ ] Task 6: Fallback Labeling
- [ ] Task 7: Test Log
- [ ] Task 8: Regression Tests

---

## Expected Outcomes

After P0 fixes:
- ✅ Real astronomical calculations (not mock)
- ✅ Accurate place coordinates
- ✅ Configurable Ayanamsa and Timezone
- ✅ Results comparable to AstroSage

After P1 fixes:
- ✅ Detailed numerical verification
- ✅ Dosha and Dasha comparison
- ✅ Comprehensive accuracy testing

After P2 fixes:
- ✅ Clear demo mode indication
- ✅ Reproducible test reports
- ✅ Automated regression testing

---

**Last Updated:** $(date)

