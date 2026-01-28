# ⚠️ Important: Testing Against AstroSage

## Current Status

### ⚠️ Mock Data Mode
**Current Implementation:** AstroSetu is currently using **mock/hash-based calculations** for development purposes. These will **NOT match** AstroSage.com results.

### ✅ Real Calculations Mode
**When Prokerala API is configured:** AstroSetu will use real astronomical calculations that should closely match AstroSage.com.

---

## 🔧 How to Enable Real Calculations

### Step 1: Get Prokerala API Key
1. Sign up at [Prokerala.com](https://www.prokerala.com/)
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```
   PROKERALA_API_KEY=your_api_key_here
   ```

### Step 2: Restart Server
```bash
npm run dev
```

### Step 3: Test
- Real calculations will now be used
- Results should match AstroSage.com (±1 degree tolerance)

---

## 📊 Expected Results Comparison

### With Mock Data (Current):
- ❌ Results will NOT match AstroSage
- ✅ Good for UI/UX testing
- ✅ Good for development

### With Prokerala API (Production):
- ✅ Results SHOULD match AstroSage
- ✅ Real astronomical calculations
- ✅ Industry-standard accuracy

---

## 🧪 Testing Process

### Option 1: Visual Comparison Tool
1. Open: `http://localhost:3001/test-comparison`
2. Enter test data
3. Generate Kundli
4. Compare with AstroSage results side-by-side

### Option 2: Manual Testing
1. Use `ASTROSAGE_COMPARISON_TEST.md` guide
2. Test each calculation type
3. Document results
4. Compare systematically

### Option 3: Automated Script
```bash
./test-astrosage-comparison.sh
```

---

## ✅ What Should Match (With Real API)

### Must Match Exactly:
- ✅ Ascendant (Lagna)
- ✅ Moon Sign (Rashi)
- ✅ Nakshatra
- ✅ Dosha Status

### Acceptable Tolerance:
- ⚠️ Planetary Positions: ±1 degree
- ⚠️ Guna Matching: ±1 point
- ⚠️ Time Calculations: ±5 minutes

---

## 📝 Current Test Data

**Primary Test User:**
- Name: Amit Kumar Mandal
- Date: 26/11/1984
- Time: 21:40:00
- Place: Noamundi, Jharkhand, India

**Expected AstroSage Results:**
- [To be filled after testing]

**Current AstroSetu Results (Mock):**
- [Will vary - not accurate]

---

## 🚀 Next Steps

1. **For Development:** Continue using mock data for UI testing
2. **For Production:** Configure Prokerala API for real calculations
3. **For Testing:** Use comparison tools once API is configured
4. **For Accuracy:** Verify calculations match AstroSage after API setup

---

**Note:** The testing framework is ready. Once Prokerala API is configured, you can use it to verify accuracy against AstroSage.com.

