# 📋 Comprehensive Error Logging Guide

**Purpose**: Track all errors for report generation and payments in production

---

## 🎯 **WHAT IS LOGGED**

### **Report Generation Errors** (`/api/ai-astrology/generate-report`)

1. **Payment Verification Errors**:
   - Missing/invalid payment tokens
   - Session ID verification failures
   - Token regeneration attempts
   - Payment status mismatches

2. **Report Generation Errors**:
   - AI service failures
   - Timeout errors (55-second limit)
   - API configuration errors
   - Prokerala credit exhaustion

3. **Client-Side Errors** (Browser Console):
   - API call failures
   - Token storage issues
   - Network errors

### **Payment Errors** (`/api/ai-astrology/create-checkout`)

1. **Checkout Creation Errors**:
   - Stripe API failures
   - Invalid input data
   - Configuration errors

### **Payment Verification Errors** (`/api/ai-astrology/verify-payment`)

1. **Session Retrieval Errors**:
   - Stripe session not found
   - Stripe API errors
   - Invalid session IDs

---

## 📊 **LOG FORMAT**

### **Server-Side Logs (Vercel)**

All logs use **JSON format** for easy parsing and search:

```json
{
  "requestId": "req-1736166645123-abc123-1",
  "timestamp": "2026-01-06T10:30:45.123Z",
  "reportType": "year-analysis",
  "errorType": "PAYMENT_VERIFICATION_REQUIRED",
  "errorMessage": "Payment verification failed - no valid token or session_id",
  ...
}
```

### **Client-Side Logs (Browser Console)**

Also JSON format:

```json
{
  "timestamp": "2026-01-06T10:30:45.123Z",
  "reportType": "year-analysis",
  "error": "Payment verification required for paid reports.",
  "hasToken": false,
  "hasSessionId": true,
  ...
}
```

---

## 🔍 **WHERE TO FIND LOGS**

### **1. Vercel Logs (Server-Side)**

**Path**: Vercel Dashboard → Your Project → Logs → Production

**Search Queries**:
```
[REPORT GENERATION ERROR]
[PAYMENT VERIFICATION ERROR]
[CHECKOUT CREATION ERROR]
[PAYMENT VERIFICATION ERROR]
[REPORT GENERATION TIMEOUT]
[TOKEN REGENERATION ERROR]
[TOKEN REGENERATION SUCCESS]
[PAYMENT VERIFIED]
[INVALID PAYMENT TOKEN]
```

### **2. Browser Console (Client-Side)**

**Path**: DevTools (F12) → Console Tab

**Search Queries**:
```
[CLIENT REPORT GENERATION ERROR]
[CLIENT REPORT GENERATION EXCEPTION]
```

---

## 📋 **LOG TYPES**

### **`[REPORT GENERATION ERROR]`**

**When**: Report generation fails for any reason

**Includes**:
- Request ID
- Timestamp
- Report type
- Input details (name, DOB year only for privacy)
- Error type and message
- Stack trace

**Example**:
```json
{
  "requestId": "req-1736166645123-abc123-1",
  "timestamp": "2026-01-06T10:30:45.123Z",
  "reportType": "year-analysis",
  "hasInput": true,
  "inputName": "Ankita Surbhi",
  "inputDOB": "1990-XX-XX",
  "isPaidReport": true,
  "errorType": "Error",
  "errorMessage": "AI service unavailable",
  "errorStack": "..."
}
```

---

### **`[PAYMENT VERIFICATION ERROR]`**

**When**: Payment verification fails

**Includes**:
- Request ID
- Report type
- Has token (boolean)
- Token length/prefix (not full token for security)
- Has session ID
- Session ID prefix (not full ID)
- Error reason

**Example**:
```json
{
  "requestId": "req-1736166645123-abc123-1",
  "timestamp": "2026-01-06T10:30:45.123Z",
  "reportType": "year-analysis",
  "hasToken": false,
  "tokenLength": 0,
  "hasSessionId": true,
  "sessionId": "cs_test_a1b2c3d4e5f6...",
  "error": "Payment verification failed - no valid token or session_id"
}
```

---

### **`[TOKEN REGENERATION ERROR]`**

**When**: Attempt to regenerate token from session_id fails

**Includes**:
- Request ID
- Report type
- Session ID prefix
- Error details

---

### **`[TOKEN REGENERATION SUCCESS]`**

**When**: Token successfully regenerated from session_id

**Includes**:
- Request ID
- Report type
- Session ID prefix

---

### **`[REPORT GENERATION TIMEOUT]`**

**When**: Report generation exceeds 55-second timeout

**Includes**:
- Request ID
- Report type
- Timeout duration

---

### **`[CHECKOUT CREATION ERROR]`**

**When**: Stripe checkout session creation fails

**Includes**:
- Request ID
- Report type
- Subscription flag
- Input details
- Error details

---

### **`[PAYMENT VERIFICATION ERROR]` (verify-payment endpoint)**

**When**: Payment verification API call fails

**Includes**:
- Request ID
- Session ID prefix
- Error details

---

### **`[STRIPE SESSION RETRIEVE ERROR]`**

**When**: Stripe API call to retrieve session fails

**Includes**:
- Request ID
- Session ID prefix
- Stripe error code/type
- Error message

---

### **`[SESSION NOT FOUND]`**

**When**: Session ID doesn't exist in Stripe

**Includes**:
- Request ID
- Session ID prefix

---

### **`[PAYMENT SESSION RETRIEVED]`**

**When**: Successfully retrieved session from Stripe (INFO log)

**Includes**:
- Request ID
- Session ID prefix
- Payment status
- Mode (payment/subscription)
- Report type
- Amount and currency

---

### **`[CLIENT REPORT GENERATION ERROR]`**

**When**: Client-side API call fails (browser console)

**Includes**:
- Timestamp
- Report type
- Error message
- Has token/session ID flags
- API URL

---

### **`[CLIENT REPORT GENERATION EXCEPTION]`**

**When**: Exception thrown during report generation (browser console)

**Includes**:
- Timestamp
- Report type
- Error type
- Error message
- Stack trace

---

## 🔍 **HOW TO SEARCH LOGS**

### **Vercel Logs Search**

**Find all payment errors**:
```
[PAYMENT VERIFICATION ERROR] OR [TOKEN REGENERATION ERROR] OR [INVALID PAYMENT TOKEN]
```

**Find all report generation errors**:
```
[REPORT GENERATION ERROR] OR [REPORT GENERATION TIMEOUT]
```

**Find errors for specific report type**:
```
reportType:"year-analysis"
```

**Find errors for specific user** (by request ID):
```
requestId:"req-1736166645123-abc123-1"
```

**Find errors in time range**:
```
timestamp:">2026-01-06T10:00:00Z" AND timestamp:"<2026-01-06T11:00:00Z"
```

---

## 🎯 **ERROR PRIORITY LEVELS**

### **🔴 CRITICAL** (Immediate Action Required)
- `[PAYMENT VERIFICATION ERROR]` - User paid but can't access report
- `[REPORT GENERATION ERROR]` - Reports failing consistently
- `[STRIPE SESSION RETRIEVE ERROR]` - Payment verification broken

### **🟡 HIGH** (Investigate Soon)
- `[REPORT GENERATION TIMEOUT]` - Performance issue
- `[TOKEN REGENERATION ERROR]` - Recovery mechanism failing
- `[CHECKOUT CREATION ERROR]` - Users can't pay

### **🟢 INFO** (Monitor)
- `[TOKEN REGENERATION SUCCESS]` - Recovery working
- `[PAYMENT SESSION RETRIEVED]` - Normal operation

---

## 📊 **ERROR ANALYTICS**

### **Common Error Patterns**

1. **Payment Token Loss**:
   - Look for: `hasToken: false` with `hasSessionId: true`
   - Indicates: Session storage cleared (common on mobile)

2. **Stripe API Failures**:
   - Look for: `[STRIPE SESSION RETRIEVE ERROR]` with error code
   - Check: Stripe dashboard for API status

3. **Report Timeouts**:
   - Look for: `[REPORT GENERATION TIMEOUT]`
   - Check: AI service response times

4. **Token Regeneration Success**:
   - Look for: `[TOKEN REGENERATION SUCCESS]`
   - Indicates: Recovery mechanism working

---

## 🔒 **SECURITY NOTES**

### **What is NOT Logged**:
- ❌ Full payment tokens (only prefix shown)
- ❌ Full session IDs (only prefix shown)
- ❌ Full credit card numbers
- ❌ Complete DOB (only year shown)
- ❌ Full user addresses

### **What IS Logged**:
- ✅ User name (for debugging)
- ✅ DOB year only
- ✅ Report type
- ✅ Error messages
- ✅ Request IDs
- ✅ Timestamps

---

## 📝 **EXAMPLE: DEBUGGING ANKITA SURBHI CASE**

### **Step 1: Search Vercel Logs**

```
Search: [PAYMENT VERIFICATION ERROR]
Filter: timestamp around payment time
```

### **Step 2: Look for Key Fields**

```json
{
  "reportType": "year-analysis",
  "hasToken": false,
  "hasSessionId": false,  // ← This is the problem!
  "error": "Payment verification failed - no valid token or session_id"
}
```

### **Step 3: Check Client Logs**

```
Browser Console: [CLIENT REPORT GENERATION ERROR]
```

### **Step 4: Verify Recovery**

```
Search: [TOKEN REGENERATION SUCCESS]
Should see: Token regenerated from session_id
```

---

## 🚀 **QUICK REFERENCE**

| Error Type | Log Tag | Location | Priority |
|------------|---------|----------|----------|
| Payment verification failed | `[PAYMENT VERIFICATION ERROR]` | Vercel | 🔴 CRITICAL |
| Report generation failed | `[REPORT GENERATION ERROR]` | Vercel | 🔴 CRITICAL |
| Report timeout | `[REPORT GENERATION TIMEOUT]` | Vercel | 🟡 HIGH |
| Token regeneration failed | `[TOKEN REGENERATION ERROR]` | Vercel | 🟡 HIGH |
| Token regeneration success | `[TOKEN REGENERATION SUCCESS]` | Vercel | 🟢 INFO |
| Checkout creation failed | `[CHECKOUT CREATION ERROR]` | Vercel | 🟡 HIGH |
| Stripe API error | `[STRIPE SESSION RETRIEVE ERROR]` | Vercel | 🔴 CRITICAL |
| Client API error | `[CLIENT REPORT GENERATION ERROR]` | Browser | 🟡 HIGH |

---

**Last Updated**: January 6, 2026  
**Status**: ✅ Comprehensive logging implemented

