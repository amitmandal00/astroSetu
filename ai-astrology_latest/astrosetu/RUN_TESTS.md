# How to Run Tests

## Prerequisites

1. **Start the development server:**
   ```bash
   cd astrosetu
   npm run dev
   ```
   Wait for server to start (usually takes 10-30 seconds)
   Server should be running on `http://localhost:3001`

2. **Verify server is running:**
   ```bash
   curl http://localhost:3001/api/astrologers
   ```
   Should return JSON data (not connection error)

---

## Running Tests

### Option 1: Run All Tests Sequentially

```bash
cd astrosetu

# Terminal 1: Start server
npm run dev

# Terminal 2: Run tests (wait for server to be ready)
./test-p0-enhancements.sh
./test-app-thoroughly.sh
```

### Option 2: Run Tests Individually

```bash
# Test P0 enhancements only
./test-p0-enhancements.sh

# Test full application
./test-app-thoroughly.sh
```

### Option 3: Run with Server Check

```bash
# Check if server is running first
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Server is running"
    ./test-p0-enhancements.sh
    ./test-app-thoroughly.sh
else
    echo "❌ Server is not running. Start it with: npm run dev"
    exit 1
fi
```

---

## Test Scripts Overview

### test-p0-enhancements.sh
Tests P0 security enhancements:
- ✅ Input validation
- ✅ Request size validation
- ✅ Error handling
- ✅ Rate limiting
- ✅ Security headers

**Expected Results:**
- Invalid inputs → 400 errors
- Unauthenticated requests → 401 errors
- Valid requests → 200 responses
- Rate limiting → 429 after limit

### test-app-thoroughly.sh
Tests full application:
- ✅ File structure
- ✅ API routes
- ✅ Components
- ✅ Configuration files
- ✅ Build process

**Expected Results:**
- All files exist
- All routes are accessible
- Build succeeds
- No critical errors

---

## Troubleshooting

### Issue: "Connection refused" or "000" status codes
**Solution:** Server is not running. Start it with `npm run dev`

### Issue: Tests fail with network errors
**Solution:** 
1. Check if server is running: `curl http://localhost:3001`
2. Check if port 3001 is available: `lsof -ti:3001`
3. Try different port: `PORT=3002 npm run dev` (update BASE_URL in test scripts)

### Issue: Rate limiting tests don't trigger
**Solution:** This is normal. Rate limiting may not trigger with low traffic. The test script will show a warning but continue.

### Issue: Permission denied
**Solution:** Make scripts executable:
```bash
chmod +x test-p0-enhancements.sh
chmod +x test-app-thoroughly.sh
```

---

## Expected Test Output

### Successful P0 Test Output:
```
🧪 P0 Enhancements Testing
==========================
Base URL: http://localhost:3001

📋 Testing Input Validation
---------------------------
Test 1: Register with invalid email ... ✓
Test 2: Login with invalid email ... ✓
...

📊 Test Summary
===============
Total Tests: 16
Passed: 14
Failed: 2

✅ Most tests passed!
```

### Successful App Test Output:
```
🧪 Comprehensive App Testing
============================

✅ File Structure Tests
✅ API Routes Tests
✅ Components Tests
✅ Configuration Tests

📊 Summary
==========
Total: 50
Passed: 48
Failed: 2
Warnings: 0
```

---

## Manual Testing Alternative

If automated tests don't work, use the manual testing guide:

```bash
# View manual testing guide
cat MANUAL_TESTING_GUIDE.md

# Or open in editor
code MANUAL_TESTING_GUIDE.md
```

---

## Quick Test Commands

```bash
# Quick server check
curl -I http://localhost:3001

# Quick validation test
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Quick security headers check
curl -I http://localhost:3001 | grep -i "content-security\|x-frame\|strict-transport"
```

---

## Next Steps After Testing

1. **Review Test Results**
   - Check which tests passed/failed
   - Fix any issues found
   - Re-run tests

2. **Review Documentation**
   - `P0_COMPLETION_REPORT.md` - Full P0 completion report
   - `SECURITY_AUDIT.md` - Security checklist
   - `NEXT_STEPS.md` - Next steps guide

3. **Prepare for Staging**
   - Deploy to staging environment
   - Run tests in staging
   - Verify all features work

---

**Last Updated:** $(date)

