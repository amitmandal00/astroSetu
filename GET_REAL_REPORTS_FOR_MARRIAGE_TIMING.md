# How to Get Real Reports for Marriage Timing (Example)

## ❌ Why You're Seeing Mock Reports

Your current URL:
```
https://www.mindveda.net/ai-astrology/preview?session_id=test_session_marriage-timing_req-1768689670501-e9rimzh-000003&reportType=marriage-timing&auto_generate=true
```

**Problem**: The `session_id=test_session_...` parameter **forces mock mode** regardless of environment settings.

---

## ✅ How to Get Real Reports

### Step 1: Start from the Input Page (Not Preview)

**Don't use the preview URL with `session_id=test_session_...`**

Instead, navigate to the **input page**:

```
https://www.mindveda.net/ai-astrology/input?reportType=marriage-timing
```

### Step 2: Fill in Your Birth Details

1. **Name**: Your full name
2. **Date of Birth**: Your birth date
3. **Time of Birth**: Your birth time (e.g., "09:40 am" or "21:40")
4. **Place**: Your place of birth (e.g., "Mumbai, Maharashtra, India")
5. **Gender**: Select Male or Female

### Step 3: Submit the Form

Click the submit button. The system will:
- Create a **real session** (not `test_session_`)
- Use `input_token` instead of `session_id` (new pattern)
- Redirect you to preview with real generation enabled

### Step 4: Verify Real Reports

**Real Report Indicators:**
- ✅ URL contains `input_token=...` (NOT `session_id=test_session_...`)
- ✅ **No "mock report" text** in the report content
- ✅ **Personalized insights** based on your birth details
- ✅ **Takes 30-120 seconds** to generate (mock is instant < 2s)
- ✅ **AI-generated content** specific to your chart

**Mock Report Indicators (What You're Seeing Now):**
- ❌ URL contains `session_id=test_session_...`
- ❌ Text says "This is a mock report generated for testing purposes"
- ❌ "Enable real mode by setting MOCK_MODE=false" message
- ❌ Generic placeholder content
- ❌ Instant generation (< 2 seconds)

---

## 🔧 Ensure Production Environment is Configured

### Check Environment Variables (Vercel)

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Verify these settings:**

   **For Real Reports:**
   - ✅ `MOCK_MODE` should be **unset** or set to `"false"` (NOT `"true"`)
   - ✅ `OPENAI_API_KEY` should be **set** with your OpenAI API key (starts with `sk-...`)

   **For Private Beta (if enabled):**
   - ✅ `NEXT_PUBLIC_PRIVATE_BETA` should be `"true"` (if you want gating enabled)

3. **If `MOCK_MODE=true` exists:**
   - Either **delete it**, OR
   - Change it to `MOCK_MODE=false`
   - **Redeploy** after changing env vars

4. **If `OPENAI_API_KEY` is missing:**
   - Add it: `OPENAI_API_KEY=sk-your-key-here`
   - **Redeploy** after adding

---

## 🚀 Quick Test Steps (In Incognito Mode)

1. **Open Incognito/Private Browser Window**

2. **Navigate to input page:**
   ```
   https://www.mindveda.net/ai-astrology/input?reportType=marriage-timing
   ```

3. **Fill birth details:**
   - Name: Test User
   - DOB: 1990-01-01
   - Time: 12:00 pm
   - Place: Mumbai, Maharashtra, India
   - Gender: Male (or Female)

4. **Submit the form**

5. **Wait for redirect** (should go to preview with `input_token=...`)

6. **Wait for generation** (30-120 seconds for real reports)

7. **Check the report:**
   - Should NOT say "mock report"
   - Should have personalized content
   - Should take time to generate

---

## 📋 Expected URL Pattern

### ❌ Mock Report URL (What You Have Now):
```
https://www.mindveda.net/ai-astrology/preview?session_id=test_session_marriage-timing_req-1768689670501-e9rimzh-000003&reportType=marriage-timing&auto_generate=true
```

### ✅ Real Report URL (What You Should Get):
```
https://www.mindveda.net/ai-astrology/preview?input_token=7629c241-8425-495a-9624-53119c9dc005&reportType=marriage-timing
```

**Key Differences:**
- ✅ Uses `input_token=` instead of `session_id=test_session_...`
- ✅ `input_token` is a UUID (not `test_session_...`)
- ✅ No `auto_generate` parameter (handled automatically)

---

## 🐛 Troubleshooting

### Still Seeing Mock Reports?

1. **Check the URL** - Make sure it doesn't contain `session_id=test_session_...`

2. **Check Vercel Environment Variables:**
   - `MOCK_MODE` should not be `"true"`
   - `OPENAI_API_KEY` should be set

3. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for `[MOCK_REPORT_GENERATED]` or `MOCK_MODE` logs
   - If you see mock logs, the environment is forcing mock mode

4. **Clear Browser Cache:**
   - Or use Incognito mode
   - Old URLs with `test_session_...` might be cached

5. **Verify OpenAI API Key:**
   - Test if the key is valid:
     ```bash
     curl https://api.openai.com/v1/models \
       -H "Authorization: Bearer $OPENAI_API_KEY"
     ```

---

## 📝 Summary

**To get real reports for Marriage Timing:**

1. ✅ **Don't use URLs with `session_id=test_session_...`**
2. ✅ **Start from input page**: `https://www.mindveda.net/ai-astrology/input?reportType=marriage-timing`
3. ✅ **Fill birth details and submit**
4. ✅ **Ensure `MOCK_MODE` is NOT `"true"` in Vercel**
5. ✅ **Ensure `OPENAI_API_KEY` is configured in Vercel**
6. ✅ **Wait 30-120 seconds** for generation (not instant)

**The system will use mock mode if:**
- ❌ URL contains `session_id=test_session_...`
- ❌ `MOCK_MODE=true` in environment variables
- ❌ `OPENAI_API_KEY` is missing (falls back to mock)

---

**Reference**: See `HOW_TO_TEST_REAL_REPORTS.md` for more details.

