# 🧪 Demo Mode Testing Guide - Step by Step

## Overview
This guide will walk you through testing paid AI Astrology reports (Marriage Timing, Career & Money, Full Life) without making any payments.

---

## ✅ Step 1: Verify Demo Mode is Enabled

### Option A: Automatic (Development Mode)
If you're running `npm run dev`, demo mode is **automatically enabled**. No configuration needed!

### Option B: Explicit Configuration
1. Open `.env.local` in the `astrosetu` directory
2. Add this line:
   ```bash
   AI_ASTROLOGY_DEMO_MODE=true
   ```
3. Save the file
4. Restart your development server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Verify Demo Mode Status
Check your server console when generating a paid report. You should see:
```
[DEMO MODE] Bypassing payment verification for marriage-timing report
```

---

## 📝 Step 2: Navigate to AI Astrology Input Page

1. Open your browser
2. Go to: `http://localhost:3001/ai-astrology/input`
   - Or if deployed: `https://your-domain.com/ai-astrology/input`

---

## 📋 Step 3: Fill in Birth Details

Enter the following test data (or use your own):

### Test Data Example:
- **Name**: `Amit Kumar Mandal`
- **Date of Birth**: `26/11/1984` (or `1984-11-26`)
- **Time of Birth**: `21:40` (9:40 PM)
- **Place**: `Noamundi, Jharkhand, India`
  - ⚠️ **Important**: Select from the autocomplete dropdown (don't just type)
  - This ensures coordinates are properly resolved

### Form Fields:
1. **Name**: Enter full name
2. **Date of Birth**: Use format `DD/MM/YYYY` or `YYYY-MM-DD`
3. **Time of Birth**: Use 24-hour format `HH:MM` (e.g., `21:40`)
4. **Place**: Type and select from dropdown
5. **Gender** (Optional): Select if desired

---

## 🎯 Step 4: Select a Paid Report Type

Choose one of the paid reports from the dropdown:

### Available Paid Reports:
1. **Marriage Timing Report** (AU$42)
   - Ideal marriage windows
   - Compatibility analysis
   - Remedies and timing

2. **Career & Money Report** (AU$42)
   - Career direction
   - Financial phases
   - Professional timing

3. **Full Life Report** (AU$69)
   - Comprehensive analysis
   - All life aspects
   - Complete insights

---

## 🚀 Step 5: Submit and Generate Report

1. **Click "Generate Report" button**
   - The form will validate your inputs
   - You'll be redirected to the preview page

2. **On the Preview Page:**
   - You'll see your birth details
   - Click the **"Generate Report"** button
   - ⚠️ **In demo mode, you won't see payment prompts!**

3. **Wait for Generation:**
   - The report will start generating
   - You'll see a loading indicator
   - This may take 30-60 seconds

---

## 📊 Step 6: View the Generated Report

Once generated, you'll see:

### Report Structure:
- **Title**: Report name (e.g., "Marriage Timing Report")
- **Sections**: Multiple sections with detailed analysis
- **Bullet Points**: Key insights and recommendations
- **Summary**: Overview of findings

### Example Sections (Marriage Timing):
- Ideal Marriage Windows
- Planetary Influences
- Compatibility Factors
- Remedies and Recommendations
- Timing Analysis

---

## 🔄 Step 7: Test All Three Report Types

Repeat Steps 3-6 for each paid report:

1. ✅ **Marriage Timing Report**
2. ✅ **Career & Money Report**
3. ✅ **Full Life Report**

---

## 🐛 Troubleshooting

### Issue: "Payment verification required"
**Solution**: 
- Check that demo mode is enabled
- Verify `AI_ASTROLOGY_DEMO_MODE=true` in `.env.local`
- Restart the dev server
- Check server logs for `[DEMO MODE]` message

### Issue: "Latitude and longitude are required"
**Solution**:
- Make sure you **select** the place from the autocomplete dropdown
- Don't just type the place name manually
- The dropdown resolves coordinates automatically

### Issue: "AI service not configured"
**Solution**:
- Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to `.env.local`
- See `API_KEYS_SETUP_GUIDE.md` for details

### Issue: Report generation fails
**Solution**:
- Check server console for error messages
- Verify AI API keys are configured
- Check network connectivity
- Try with different birth details

### Issue: Demo mode not working
**Solution**:
1. Verify `.env.local` has `AI_ASTROLOGY_DEMO_MODE=true`
2. Check `NODE_ENV` is `development` (or not set)
3. Restart the dev server completely
4. Check server logs for demo mode messages

---

## ✅ Verification Checklist

After testing, verify:

- [ ] Marriage Timing Report generates successfully
- [ ] Career & Money Report generates successfully
- [ ] Full Life Report generates successfully
- [ ] No payment prompts appear
- [ ] Reports contain detailed content
- [ ] All sections are populated
- [ ] PDF download works (if implemented)

---

## 🎯 Quick Test Script

For quick testing, use this test data:

```javascript
{
  name: "Amit Kumar Mandal",
  dob: "1984-11-26",
  tob: "21:40",
  place: "Noamundi, Jharkhand, India",
  gender: "Male"
}
```

Test all three report types with this data to ensure consistency.

---

## 📝 Notes

- **Demo mode is for development only**
- **Production builds automatically disable demo mode**
- **All reports work normally in demo mode**
- **Only payment verification is bypassed**

---

## 🚀 Next Steps

After testing:
1. Verify all report types work correctly
2. Check report content quality
3. Test PDF download (if available)
4. Verify error handling
5. Test with different birth details

---

**Happy Testing! 🎉**

