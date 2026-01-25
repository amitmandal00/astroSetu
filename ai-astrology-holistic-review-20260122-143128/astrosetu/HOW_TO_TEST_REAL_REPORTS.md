# 🧪 How to Test Like a Real Production User

## ❌ Why You're Seeing Mock Reports

Your URL contains `session_id=test_session_...` which forces mock mode:
```
mindveda.net/ai-astrology/preview?session_id=test_session_decision-support_req-1768664082917-cgis5ha-00...
```

**Code Logic:**
```typescript
const isTestSession = !!sessionIdFromQuery && sessionIdFromQuery.startsWith("test_session_");
const mockMode = isTestSession || process.env.MOCK_MODE === "true";
```

If `isTestSession` is `true`, the system **always** returns mock reports, even in production.

---

## ✅ How to Test with Real AI Reports

### Option 1: Remove `session_id` from URL (Easiest)

1. **Navigate to the input page directly:**
   ```
   https://www.mindveda.net/ai-astrology/input?reportType=life-summary
   ```

2. **Fill in your birth details and submit**

3. **The system will generate a real session ID** (not `test_session_`)

4. **You'll get real AI-generated reports** (if OpenAI is configured)

---

### Option 2: Check Environment Variables

Ensure `MOCK_MODE` is **NOT** set to `"true"`:

**In Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Check if `MOCK_MODE` exists
4. If it's set to `"true"`, either:
   - Delete it, OR
   - Set it to `"false"` or remove it entirely

**In Local Development:**
```bash
# Check .env.local
cat .env.local | grep MOCK_MODE

# If MOCK_MODE=true exists, remove it or set to false
# MOCK_MODE=false  # or just delete the line
```

---

### Option 3: Ensure OpenAI API Key is Configured

Real reports require OpenAI API key. Check if it's configured:

**In Vercel:**
1. Go to project settings → Environment Variables
2. Look for `OPENAI_API_KEY`
3. If missing, add it:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (starts with `sk-...`)

**In Local Development:**
```bash
# Check .env.local
cat .env.local | grep OPENAI_API_KEY

# If missing, add it:
echo "OPENAI_API_KEY=sk-your-key-here" >> .env.local
```

---

## 🔍 How to Verify You're Getting Real Reports

### Real Report Indicators:
- ✅ **No "mock" text** in the report content
- ✅ **Personalized insights** based on your birth details
- ✅ **No "This is a mock report" messages**
- ✅ **Report takes 30-120 seconds** to generate (mock is instant)

### Mock Report Indicators:
- ❌ **"This is a mock report"** text visible
- ❌ **"Enable real mode by setting MOCK_MODE=false"** message
- ❌ **Generic placeholder content**
- ❌ **Instant generation** (< 2 seconds)

---

## 🚀 Quick Test Steps

1. **Clear browser cache/cookies** (or use Incognito)

2. **Navigate directly to input page:**
   ```
   https://www.mindveda.net/ai-astrology/input?reportType=life-summary
   ```

3. **Fill in birth details:**
   - Name: Your name
   - DOB: Your date of birth
   - Time: Your time of birth
   - Place: Your place of birth

4. **Submit and wait for generation**

5. **Check the URL** - it should NOT contain `session_id=test_session_`

6. **Check the report** - it should be personalized, not mock

---

## 🐛 Troubleshooting

### Still seeing mock reports?

1. **Check browser console** for errors:
   - Open DevTools (F12)
   - Check Console tab
   - Look for `[MOCK_REPORT_GENERATED]` logs

2. **Check Vercel logs:**
   - Go to Vercel dashboard → Your project → Logs
   - Look for `MOCK_MODE` or `isTestSession` logs

3. **Verify OpenAI API key:**
   ```bash
   # Test if OpenAI is configured
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

4. **Check if session_id is being set:**
   - Look at the preview URL after submitting
   - If it contains `session_id=test_session_`, something is generating test sessions

---

## 📝 Summary

**To get real reports:**
1. ✅ Remove `session_id=test_session_...` from URL
2. ✅ Ensure `MOCK_MODE` is NOT `"true"` in environment variables
3. ✅ Ensure `OPENAI_API_KEY` is configured
4. ✅ Start from input page (don't use URLs with test_session_)

**The system will use mock mode if:**
- ❌ `session_id` starts with `test_session_`
- ❌ `MOCK_MODE=true` in environment variables
- ❌ OpenAI API key is missing (falls back to mock)

