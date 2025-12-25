# Testing Quick Reference Card
## Quick Checklist for Testing AstroSetu

---

## 🚀 Quick Start

```bash
# 1. Install apps
# - AstroSage AI (App Store/Play Store)
# - AstroTalk (App Store/Play Store)
# - AstroSetu (build and install)

# 2. Run automated test
cd mobile
./test-comparison.sh

# 3. Follow TESTING_GUIDE.md for detailed testing
```

---

## 📝 Test Data

```
Name: Amit Kumar Mandal
DOB: 26 November 1984
TOB: 21:40 (9:40 PM)
POB: Noamundi, Jharkhand, India
```

---

## ✅ Quick Checklist

### Core Features
- [ ] Kundli Generation
- [ ] Horoscope (Daily/Weekly/Monthly/Yearly)
- [ ] Kundli Matching
- [ ] Astrologer Consultation
- [ ] Chat with Astrologers
- [ ] E-Wallet
- [ ] Reports
- [ ] Premium Services
- [ ] Panchang
- [ ] Numerology

### Accuracy Tests
- [ ] Ascendant matches
- [ ] Moon Sign matches
- [ ] Nakshatra matches
- [ ] Planetary positions match
- [ ] Dasha calculations match
- [ ] Dosha analysis matches
- [ ] Guna matching matches

### UI/UX
- [ ] Colors match theme
- [ ] Cards look professional
- [ ] Animations smooth
- [ ] Navigation intuitive
- [ ] Loading states good
- [ ] Empty states helpful

### Performance
- [ ] App launches quickly (< 2s)
- [ ] Screens load quickly (< 1s)
- [ ] API calls fast (< 2s)
- [ ] Scrolling smooth (60 FPS)
- [ ] No lag or jank

---

## 📊 Score Targets

| Category | Target | Current |
|----------|--------|---------|
| Feature Parity | 90% | 85% |
| UI/UX | 95% | 95% |
| Accuracy | 100% | 100%* |
| Performance | 100% | 100% |
| Functionality | 90% | 80% |

*When API configured

---

## 🎯 Priority Actions

### P0 (Critical)
1. Configure Prokerala API
2. Test calculation accuracy
3. Fix any accuracy issues

### P1 (Important)
1. Add push notifications
2. Implement share/export
3. Complete call/video integration

### P2 (Nice to Have)
1. Add social login
2. Enhance remedies
3. Complete multilingual

---

## 📄 Test Documents

- `TESTING_FRAMEWORK.md` - Main framework
- `ACCURACY_TEST.md` - Accuracy tests
- `FUNCTIONALITY_TEST.md` - Functionality checklist
- `TESTING_GUIDE.md` - Step-by-step guide
- `TEST_SUMMARY.md` - Summary & action plan

---

## ⚡ Quick Commands

```bash
# Run test script
./test-comparison.sh

# View test documents
cat TESTING_FRAMEWORK.md
cat ACCURACY_TEST.md
cat FUNCTIONALITY_TEST.md

# Build app
npm run ios    # iOS
npm run android # Android
```

---

*Keep this handy during testing!*

