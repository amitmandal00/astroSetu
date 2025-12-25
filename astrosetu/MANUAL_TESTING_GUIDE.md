# Manual Testing Guide for P0 Enhancements

Since automated tests require network access, use this manual testing guide to verify all P0 enhancements.

## Prerequisites

1. **Start the development server:**
   ```bash
   cd astrosetu
   npm run dev
   ```
   Server should be running on `http://localhost:3001`

2. **Open browser DevTools:**
   - Press F12 or Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
   - Go to Network tab
   - Go to Console tab

---

## Testing Checklist

### 1. Input Validation Testing

#### Test Invalid Email Registration
1. Open `http://localhost:3001/register` or use API directly
2. Try to register with invalid email: `{"email":"invalid","name":"Test"}`
3. **Expected:** Should return 400 error with validation message
4. **Check:** Network tab shows 400 status, error message mentions email validation

#### Test Invalid Login
1. Try to login with invalid email: `{"email":"notanemail"}`
2. **Expected:** Should return 400 error
3. **Check:** Error message about email format

#### Test Numerology with Empty Name
1. Go to `/numerology` page
2. Submit form with empty name
3. **Expected:** Should show validation error, form should not submit
4. **Check:** Client-side validation prevents submission

#### Test Payment with Invalid Amount
1. Try to create payment with negative amount: `{"amount":-100}`
2. **Expected:** Should return 400 error
3. **Check:** Error message about invalid amount

#### Test Payment with Excessive Amount
1. Try to create payment with very large amount: `{"amount":10000000}`
2. **Expected:** Should return 400 error (amount exceeds max limit)
3. **Check:** Error message mentions maximum limit

---

### 2. Request Size Validation Testing

#### Test Oversized Request
1. Use browser console or Postman
2. Send a very large JSON payload (e.g., 100KB+)
3. **Expected:** Should return 400 error
4. **Check:** Error message about request size limit

**Example using curl:**
```bash
# Create a large payload
python3 -c "import json; print(json.dumps({'email': 'test@test.com', 'data': 'x' * 100000}))" > large_payload.json

# Try to send it
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d @large_payload.json

# Should return 400 error
```

---

### 3. Error Handling Testing

#### Test Unauthenticated Access
1. Open browser in incognito/private mode
2. Try to access `/wallet` page
3. **Expected:** Should redirect to login or show 401 error
4. **Check:** Network tab shows 401 status for API calls

#### Test Invalid API Endpoints
1. Try to access non-existent endpoint: `http://localhost:3001/api/nonexistent`
2. **Expected:** Should return 404 error
3. **Check:** Proper error response

#### Test Error Boundary
1. Trigger a JavaScript error (if possible)
2. **Expected:** Error boundary should catch it and show user-friendly message
3. **Check:** Error message displayed instead of blank page

---

### 4. Rate Limiting Testing

#### Test Auth Endpoint Rate Limiting
1. Use a tool like Postman or curl to make rapid requests
2. Send 15+ requests quickly to `/api/auth/login`:
   ```bash
   for i in {1..15}; do
     curl -X POST http://localhost:3001/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"test@test.com"}' &
   done
   wait
   ```
3. **Expected:** After 10 requests, should get 429 (Too Many Requests)
4. **Check:** Response headers include `X-RateLimit-Limit`, `X-RateLimit-Remaining`

#### Test Payment Endpoint Rate Limiting
1. Make 25+ rapid requests to `/api/payments/create-order`
2. **Expected:** Should get 429 after limit exceeded
3. **Check:** Rate limit headers in response

---

### 5. Security Headers Testing

#### Check Security Headers
1. Open browser DevTools → Network tab
2. Load any page (e.g., `http://localhost:3001`)
3. Click on any request → Headers tab
4. **Check for these headers:**
   - `Content-Security-Policy` - Should be present
   - `Strict-Transport-Security` - Should be present
   - `X-Frame-Options` - Should be `SAMEORIGIN`
   - `X-Content-Type-Options` - Should be `nosniff`
   - `X-XSS-Protection` - Should be `1; mode=block`
   - `Referrer-Policy` - Should be present

**Using curl:**
```bash
curl -I http://localhost:3001 | grep -i "content-security\|strict-transport\|x-frame\|x-content\|x-xss\|referrer"
```

---

### 6. Valid Endpoints Testing

#### Test Public Endpoints
1. **Get Astrologers:**
   ```bash
   curl http://localhost:3001/api/astrologers
   ```
   **Expected:** Should return 200 with astrologer list

2. **Get Payment Config:**
   ```bash
   curl http://localhost:3001/api/payments/config
   ```
   **Expected:** Should return 200 with config

3. **Get Panchang:**
   ```bash
   curl "http://localhost:3001/api/astrology/panchang?date=2025-01-15&place=Delhi"
   ```
   **Expected:** Should return 200 with panchang data

---

### 7. Input Sanitization Testing

#### Test Email Sanitization
1. Try to register with email: `"  TEST@EXAMPLE.COM  "`
2. **Expected:** Should be sanitized to `test@example.com`
3. **Check:** Stored email is lowercase and trimmed

#### Test Phone Sanitization
1. Try to register with phone: `"+91 12345 67890"`
2. **Expected:** Should be sanitized to `+911234567890`
3. **Check:** Phone stored without spaces

---

### 8. Error Messages Testing

#### Test Validation Error Messages
1. Submit invalid data to any endpoint
2. **Expected:** Should get clear, user-friendly error message
3. **Check:** Error message explains what's wrong

**Example:**
- Invalid email → "Invalid email format"
- Missing required field → "Field is required"
- Amount too large → "Amount exceeds maximum limit"

---

## Testing Tools

### Browser DevTools
- **Network Tab:** Check request/response status codes and headers
- **Console Tab:** Check for JavaScript errors
- **Application Tab:** Check localStorage, cookies

### curl (Command Line)
```bash
# Test GET request
curl http://localhost:3001/api/astrologers

# Test POST request
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'

# Check headers
curl -I http://localhost:3001
```

### Postman
1. Import API collection
2. Test each endpoint
3. Check response status codes
4. Verify error messages

---

## Expected Results Summary

| Test Type | Expected Status | What to Check |
|-----------|----------------|---------------|
| Invalid Input | 400 | Validation error message |
| Oversized Request | 400 | Request size error |
| Unauthenticated | 401 | Authentication error |
| Rate Limited | 429 | Rate limit headers |
| Valid Request | 200 | Successful response |
| Security Headers | Present | All headers in response |

---

## Quick Test Script

Save this as `quick-test.sh`:

```bash
#!/bin/bash
BASE_URL="http://localhost:3001"

echo "Testing P0 Enhancements..."
echo ""

# Test 1: Invalid email
echo "Test 1: Invalid email registration"
curl -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid"}' \
  -w "\nStatus: %{http_code}\n" -s | tail -1
echo ""

# Test 2: Valid endpoint
echo "Test 2: Get astrologers"
curl "$BASE_URL/api/astrologers" \
  -w "\nStatus: %{http_code}\n" -s | tail -1
echo ""

# Test 3: Check headers
echo "Test 3: Security headers"
curl -I "$BASE_URL" 2>/dev/null | grep -i "content-security\|x-frame"
echo ""

echo "Tests complete!"
```

Run with: `chmod +x quick-test.sh && ./quick-test.sh`

---

## Notes

- All tests should be run with the development server running
- Some tests may require authentication (use login first)
- Rate limiting tests need rapid requests (use scripts or tools)
- Security headers can be checked in browser DevTools or with curl

---

**Last Updated:** $(date)

