# 🧪 Run AI Section End-to-End Tests

## Quick Start

### 1. Start Development Server
```bash
cd astrosetu
npm run dev
```
Wait for server to start (usually takes 10-30 seconds). Server should be running on `http://localhost:3001`.

### 2. Run Automated Tests (Terminal 1)
```bash
cd astrosetu
./test-ai-section-e2e.sh http://localhost:3001
```

### 3. Expected Output
```
========================================
  AI Section E2E Test Suite
  Testing: http://localhost:3001
========================================

✅ PASS: Header component renders
✅ PASS: Logo link present
✅ PASS: CTA button present
...
```

---

## 📊 Test Results Interpretation

### ✅ All Tests Pass
If all tests pass, you'll see:
```
Test Results: 50/50 passed
✅ All tests passed!
```

### ❌ Some Tests Fail
If tests fail, you'll see:
```
Test Results: 45/50 passed
Failed: 5

Issues Found:
  ❌ Footer link present
  ❌ Contact API accepts valid payload
  ...
```

**Action**: Fix the failing tests and re-run.

---

## 🔍 Manual Testing

After automated tests pass, complete the manual testing checklist:

1. Open `AI_SECTION_E2E_TEST_GUIDE.md`
2. Go through each section systematically
3. Test in multiple browsers
4. Test on mobile devices
5. Verify email delivery

---

## 🐛 Common Issues & Fixes

### Issue: "Server is not running"
**Fix**: Start the server with `npm run dev`

### Issue: "Connection refused"
**Fix**: Check if port 3001 is available: `lsof -ti:3001`

### Issue: Footer links return 404
**Fix**: Verify all page files exist in `src/app/`

### Issue: Email API returns error
**Fix**: Check Resend API key is configured in environment variables

### Issue: Orange header/flash visible
**Fix**: Verify `data-ai-route` attribute is set correctly in `layout.tsx`

---

## ✅ Pre-Production Checklist

- [ ] All automated tests pass (100%)
- [ ] Manual testing completed
- [ ] All footer links work
- [ ] Email functionality verified
- [ ] No orange header/footer flash
- [ ] Cross-browser testing done
- [ ] Mobile testing done
- [ ] Performance acceptable
- [ ] No console errors

---

## 📝 Test Execution Log

Fill this out after running tests:

```
Date: ___________
Tester: ___________
Environment: [Local/Staging/Production]

Automated Tests:
- Total: _____
- Passed: _____
- Failed: _____

Manual Tests:
- Completed: _____ / _____
- Issues Found: _____

Critical Issues:
1. ___________
2. ___________

Status: [ ] Ready for Production / [ ] Needs Fixes
```

---

## 🚀 Next Steps After Testing

1. ✅ All tests pass → Ready for production
2. ❌ Tests fail → Fix issues and re-test
3. ⚠️ Minor issues → Document and prioritize
4. 📝 Test results → Update deployment checklist

---

## 📚 Related Documentation

- `test-ai-section-e2e.sh` - Automated test script
- `AI_SECTION_E2E_TEST_GUIDE.md` - Comprehensive manual testing guide
- `AI_SECTION_E2E_TEST_SUMMARY.md` - Test coverage and summary

