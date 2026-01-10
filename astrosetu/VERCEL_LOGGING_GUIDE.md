# 📊 Vercel Logging Guide - Debug Report Generation Issues

This guide helps you find and understand logs in Vercel when report generation doesn't work.

## 🔍 How to Access Vercel Logs

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `astroSetu`
3. Click on **"Logs"** tab (or go to **Deployments** → Click latest deployment → **Functions** → Select function)
4. Use the search/filter box to search for specific request IDs or actions

---

## 🏷️ Log Tags (Search for These)

### **Request Lifecycle**
- `[REQUEST START]` - Every request starts here
- `[REQUEST PARSED]` - Request body parsed successfully
- `[RESPONSE SUCCESS]` - Successful response sent
- `[REPORT GENERATION ERROR]` - Any error occurred

### **Validation & Access**
- `[VALIDATION SUCCESS]` - Input validation passed
- `[VALIDATION ERROR]` - Input validation failed
- `[ACCESS CHECK]` - Access restriction check result
- `[ACCESS RESTRICTION]` - Access denied (403)

### **Test Users**
- `[TEST USER]` - Test user detected (Amit/Ankita)
- `[TEST USER MATCH FAILED]` - Test user matching failed (debug why)
- `[TEST USER ACCESS GRANTED]` - Test user allowed access

### **Payment**
- `[PAYMENT VERIFIED]` - Payment verification successful
- `[PAYMENT BYPASS STATUS]` - Demo/test mode payment bypass
- `[PAYMENT CANCELLED]` - Payment cancelled (error scenario)
- `[PAYMENT CANCELLATION FAILED]` - Payment cancellation failed

### **Report Generation**
- `[GENERATION START]` - Report generation started
- `[REPORT GENERATION SUCCESS]` - Report generated successfully
- `[REPORT GENERATION TIMEOUT]` - Generation timed out
- `[REPORT GENERATION ERROR]` - Generation failed

### **Caching**
- `[IDEMPOTENCY CACHE HIT]` - Report served from cache
- `[IDEMPOTENCY ALREADY PROCESSING]` - Duplicate request detected
- `[IDEMPOTENCY CACHED]` - Report cached after generation

### **Rate Limiting**
- `[RATE LIMIT]` - Rate limit hit (429)

---

## 🔑 Search Patterns

### **Find All Logs for a Specific Request**
```
Search: req-1727123456789-abc123-000001
```
Every log includes `requestId`, so you can trace the entire flow.

### **Find All Errors**
```
Search: ERROR
```
Shows: `[VALIDATION ERROR]`, `[REPORT GENERATION ERROR]`, etc.

### **Find Test User Issues**
```
Search: TEST USER
```
Shows test user detection, matching failures, access grants.

### **Find Payment Issues**
```
Search: PAYMENT
```
Shows payment verification, cancellation, bypass status.

### **Find Timeouts**
```
Search: TIMEOUT
```
Shows generation timeouts.

---

## 📋 Log Structure

All logs use **structured JSON format** with these common fields:

```json
{
  "requestId": "req-1727123456789-abc123-000001",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "action": "REPORT_GENERATION_SUCCESS",
  "reportType": "life-summary",
  "elapsedMs": 12345,
  "userName": "Amit Kumar Mandal",
  "userDOB": "1984-XX-XX",
  ...
}
```

### **Key Fields**
- `requestId` - **Use this to trace a single request through all logs**
- `timestamp` - When the log was created
- `action` - What happened (for filtering)
- `elapsedMs` - Time since request start (in milliseconds)
- `reportType` - Type of report being generated
- `userName`, `userDOB` - User info (privacy-safe: DOB shows year only)

---

## 🐛 Common Debugging Scenarios

### **1. Test User Getting "Access Restricted" Error**

**Search for:**
```
[TEST USER MATCH FAILED]
```

**What to check:**
- Does the log show `nameMatch: true` but other fields fail?
- Check `inputDOB`, `inputPlace`, `inputTob` vs expected values
- Look for `reason` field explaining why matching failed

**Example log:**
```json
{
  "action": "TEST USER MATCH FAILED",
  "testUserName": "Amit Kumar Mandal",
  "inputName": "Amit Kumar Mandal",
  "nameMatch": true,
  "dobMatch": false,
  "placeMatch": true,
  "reason": "DOB and Place don't match"
}
```

---

### **2. Report Generation Timing Out**

**Search for:**
```
[REPORT GENERATION TIMEOUT]
```

**What to check:**
- `timeoutMs` - What was the timeout value?
- `reportType` - Which report type timed out?
- Check previous logs for `[GENERATION START]` to see when it started

**Example log:**
```json
{
  "action": "REPORT_GENERATION_TIMEOUT",
  "reportType": "full-life",
  "timeoutMs": 75000,
  "elapsedMs": 75000
}
```

---

### **3. Payment Verification Failing**

**Search for:**
```
[PAYMENT VERIFIED]
[PAYMENT CANCELLED]
```

**What to check:**
- Look for `[PAYMENT VERIFIED]` - should appear before generation starts
- If missing, check for `[PAYMENT CANCELLATION ERROR]` or `[INVALID PAYMENT TOKEN]`
- Check `hasToken` and `tokenRegenerated` fields

---

### **4. Report Generation Failing with Error**

**Search for:**
```
[REPORT GENERATION ERROR]
```

**What to check:**
- `errorType` - Type of error (Error, TimeoutError, etc.)
- `errorMessage` - Actual error message
- `errorStack` - Stack trace (first 1000 chars)
- `totalTimeMs` - How long it took before failing

**Example log:**
```json
{
  "action": "REPORT_GENERATION_ERROR",
  "reportType": "life-summary",
  "errorType": "Error",
  "errorMessage": "OpenAI API error: Rate limit exceeded",
  "totalTimeMs": 45000,
  "isTestUser": true
}
```

---

### **5. Slow Generation (Not Timing Out)**

**Search for:**
```
[REPORT GENERATION SUCCESS]
```

**What to check:**
- `generationTimeMs` - How long did it actually take?
- Compare with `elapsedMs` - Should be similar
- If `generationTimeMs > 60000` for regular reports, it's slow

**Example log:**
```json
{
  "action": "REPORT_GENERATION_SUCCESS",
  "reportType": "life-summary",
  "generationTimeMs": 45000,
  "elapsedMs": 45000
}
```

---

## 🔍 Tracing a Complete Request Flow

### **Step 1: Find the Request ID**
Look for `[REQUEST START]` with the timestamp when the user clicked "Generate"

### **Step 2: Search for All Logs with That Request ID**
```
Search: req-1727123456789-abc123-000001
```

### **Step 3: Expected Flow (Success Case)**
1. `[REQUEST START]` - Request received
2. `[REQUEST PARSED]` - Body parsed
3. `[VALIDATION SUCCESS]` - Input validated
4. `[ACCESS CHECK]` - Access granted
5. `[GENERATION START]` - Started generating
6. `[REPORT GENERATION SUCCESS]` - Completed
7. `[RESPONSE SUCCESS]` - Response sent

### **Step 4: If It Fails**
- Look for the first `[ERROR]` or failure log
- Check `elapsedMs` to see how far it got
- Check previous logs for clues (validation, access, payment, etc.)

---

## 💡 Tips

1. **Always search by `requestId` first** - This gives you the complete picture
2. **Look at `elapsedMs`** - Shows timing at each step (helps find bottlenecks)
3. **Check `action` field** - Use it to filter/search logs
4. **Check `isTestUser` and `isDemoMode`** - Important for understanding payment bypass
5. **Compare `generationTimeMs` with timeouts** - If close to timeout, consider optimizing

---

## 📊 Example: Complete Request Log Flow

```
[REQUEST START] { requestId: "req-123", timestamp: "10:30:00", ... }
[REQUEST PARSED] { requestId: "req-123", elapsedMs: 50, reportType: "life-summary", ... }
[VALIDATION SUCCESS] { requestId: "req-123", elapsedMs: 100, ... }
[ACCESS CHECK] { requestId: "req-123", action: "ACCESS_GRANTED_TEST_USER", ... }
[TEST USER] { requestId: "req-123", ... }
[GENERATION START] { requestId: "req-123", elapsedMs: 200, ... }
[OpenAI] Successfully generated content for reportType=life-summary
[REPORT GENERATION SUCCESS] { requestId: "req-123", generationTimeMs: 25000, ... }
[IDEMPOTENCY CACHED] { requestId: "req-123", elapsedMs: 25300, ... }
[RESPONSE SUCCESS] { requestId: "req-123", totalTimeMs: 25400, ... }
```

---

## 🚨 Critical Errors to Watch For

- `[CRITICAL - MANUAL INTERVENTION REQUIRED]` - Payment cancellation failed, manual refund needed
- `[REPORT GENERATION ERROR]` with `errorType: "TIMEOUT"` - Generation timed out
- `[ACCESS RESTRICTION]` for test users - Access restriction logic broken
- `[PAYMENT CANCELLATION FAILED]` after 3 attempts - User may be incorrectly charged

---

## 📝 Adding New Logs

When adding new logs, always include:
1. `requestId` - For tracing
2. `timestamp` - When it happened
3. `action` - What happened (in `[UPPER_SNAKE_CASE]`)
4. `elapsedMs` - Time since request start
5. Relevant context (reportType, userName, etc.)

Use structured JSON logging for easy filtering in Vercel.

