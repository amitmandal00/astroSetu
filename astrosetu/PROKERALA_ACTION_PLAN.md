# Prokerala → AstroSetu Action Plan
## Quick Reference: What to Build & When

**Based on**: Complete Prokerala feature analysis + your blueprint  
**Goal**: 100% feature parity + autonomous, monetizable platform

---

## 🎯 MUST-HAVE Features (Launch Blockers)

These are the **non-negotiable** features for competitive parity:

### 1. Divisional Charts (CRITICAL)
**Status**: ❌ Missing  
**Priority**: P0 - Do immediately

**What to Build:**
- ✅ D1 (Rasi) - Already exists
- ❌ **D9 (Navamsa)** - **BUILD THIS FIRST** (3-4 days)
- ❌ D10 (Dashamsa) - Career analysis (2-3 days)
- ❌ D7 (Saptamsa) - Children (2-3 days)

**UI Design:**
```
[Chart Type Selector]
┌─────────────────┬─────────────────┐
│  D1 (Rasi)      │  D9 (Navamsa)   │
│  [Selected]     │  [Click]        │
└─────────────────┴─────────────────┘
```

**Implementation Steps:**
1. Add Prokerala `/chart/navamsa` endpoint call
2. Create Navamsa chart visualization component
3. Add chart type toggle UI
4. Display Navamsa planetary positions

---

### 2. Complete Dasha Analysis (CRITICAL)
**Status**: ⚠️ Partial (Mahadasha only)  
**Priority**: P0 - Do immediately

**What to Build:**
- ✅ Mahadasha - Exists
- ❌ **Antardasha breakdown** - BUILD THIS (2 days)
- ❌ **Pratyantardasha** - BUILD THIS (2 days)
- ❌ Visual timeline - BUILD THIS (2 days)

**UI Design:**
```
Current Dasha: Saturn (2020-2039)
├─ Current Antardasha: Mercury (2023-2026)
│  ├─ Current Pratyantardasha: Venus (2024-2025)
│  └─ Next: Sun (2025-2026)
└─ Next Antardasha: Ketu (2026-2029)
```

**Implementation:**
- Use existing `/dasha-periods` endpoint
- Enhance `prokeralaEnhanced.ts` → `getDashaPeriods()`
- Create `EnhancedDashaAnalysis.tsx` component (already exists, enhance it)

---

### 3. Enhanced Transits (HIGH PRIORITY)
**Status**: ⚠️ Basic (Gochar Phal page exists)  
**Priority**: P1 - Next sprint

**What to Build:**
- ✅ Basic transit report - Exists
- ❌ **Transit overlay on chart** - BUILD THIS (3 days)
- ❌ **Area-wise effects** - ENHANCE (2 days)
- ❌ Transit calendar view - BUILD THIS (2 days)

**Implementation:**
- Use existing `/transit` endpoint
- Enhance transit display with visual overlay
- Add calendar view component

---

### 4. Professional PDF Reports (MONETIZATION)
**Status**: ⚠️ Basic  
**Priority**: P1 - High (revenue driver)

**What to Build:**
- ✅ Basic PDF - Exists
- ❌ **Professional formatting** - ENHANCE (3-4 days)
- ❌ Print-optimized layouts - ENHANCE (2 days)
- ❌ Branded templates - ENHANCE (2 days)

---

## 🟢 SHOULD-HAVE Features (Competitive Parity)

### 5. Complete Yoga Analysis
**Status**: ⚠️ Partial (function exists, no UI)  
**Priority**: P1 - Next sprint

**What to Build:**
- Use existing `getYogas()` from `prokeralaEnhanced.ts`
- Create yoga display UI component
- Show Raj Yogas, Dhan Yogas, etc.
- Explain effects on life areas

**Effort**: 3-4 days

---

### 6. Enhanced Panchang
**Status**: ✅ Basic exists  
**Priority**: P1 - Daily engagement

**What to Add:**
- Complete Rahu Kalam breakdown
- Amrit Kalam, Durmuhurat
- Detailed inauspicious periods

**Effort**: 2-3 days

---

### 7. Nakshatra Porutham UI
**Status**: ⚠️ Function exists, no UI  
**Priority**: P1 - Matching enhancement

**What to Build:**
- Use existing `getNakshatraPorutham()` function
- Add UI to match page
- Display 27-point compatibility

**Effort**: 2-3 days

---

### 8. Additional Divisional Charts
**Status**: ❌ Missing  
**Priority**: P2 - After D9/D10

**What to Build:**
- D2 (Hora)
- D3 (Drekkana)
- D4 (Chaturthamsa)
- D12 (Dwadashamsa)

**Effort**: 1-2 days each

---

## 🟡 NICE-TO-HAVE Features (Future)

### 9. Additional Dasha Systems
- Yogini Dasha
- Ashtottari Dasha
- **Effort**: 2-3 days each

### 10. Indian Calendars
- Regional calendars (Tamil, Malayalam, etc.)
- Festival calendar
- **Effort**: 5-7 days

### 11. Advanced Features
- Additional divisional charts (D16, D20, D24, etc.)
- Western astrology enhancements
- **Effort**: 1-2 days each

---

## 📅 Recommended Implementation Timeline

### Week 1-2: Critical Features (P0)
**Focus**: Launch blockers

1. **Navamsa Chart (D9)** - 3-4 days
   - Highest user demand
   - Competitive requirement
   - Build chart visualization component

2. **Complete Dasha Analysis** - 3-4 days
   - Antardasha + Pratyantardasha
   - Visual timeline
   - Enhance existing component

**Deliverable**: Core feature parity (85%)

---

### Week 3-4: High Priority (P1)
**Focus**: Competitive parity

3. **Enhanced Transits** - 4-5 days
   - Transit overlay
   - Area-wise breakdown
   - Calendar view

4. **Professional PDFs** - 5-7 days
   - Formatting
   - Templates
   - Print optimization

5. **Yoga Analysis UI** - 3-4 days
   - Display component
   - Explanations

6. **Nakshatra Porutham UI** - 2-3 days
   - Match page enhancement

**Deliverable**: Competitive parity (92%)

---

### Week 5-6: Medium Priority (P2)
**Focus**: Complete coverage

7. **Additional Divisional Charts** - 3-4 days
   - D10, D7, D2, D3, D4, D12

8. **Enhanced Panchang** - 2-3 days

9. **Complete Numerology** - 2-3 days

10. **Additional Doshas** - 2-3 days

**Deliverable**: Feature completeness (97%)

---

### Week 7-8: Advanced (P2/P3)
**Focus**: Advanced features

11. **Additional Dasha Systems** - 2-3 days each

12. **Indian Calendars** - 5-7 days (optional)

13. **Advanced Charts** - 1-2 days each

**Deliverable**: 100% feature parity

---

## 🚀 Quick Start Guide

### Immediate Actions (This Week)

1. **Start with Navamsa Chart**
   ```typescript
   // Add to prokeralaEnhanced.ts
   export async function getNavamsaChart(input: BirthDetails) {
     const response = await prokeralaRequest("/chart/navamsa", {
       // ... params
     });
     return response;
   }
   ```

2. **Create Chart Type Selector Component**
   ```tsx
   // components/kundli/ChartTypeSelector.tsx
   <div className="flex gap-2">
     <Button onClick={() => setChartType('rasi')}>D1 (Rasi)</Button>
     <Button onClick={() => setChartType('navamsa')}>D9 (Navamsa)</Button>
   </div>
   ```

3. **Enhance Dasha Display**
   - Use existing `EnhancedDashaAnalysis.tsx`
   - Add Antardasha/Pratyantardasha breakdown
   - Add visual timeline

---

## 💰 Monetization Strategy

### Free Tier
- ✅ D1 Chart only
- ✅ Basic Panchang
- ✅ Daily Horoscope
- ✅ Basic Matching (score only)

### Premium Tier (₹99-299/month)
- ✅ All Divisional Charts (D1-D60)
- ✅ Complete Dasha Analysis
- ✅ Enhanced Transits
- ✅ Professional PDFs
- ✅ Advanced Matching

### Pay-Per-Report (₹49-499)
- ✅ Life Report PDF
- ✅ Career Report PDF
- ✅ Marriage Compatibility PDF
- ✅ Detailed Dasha Phal PDF

---

## ✅ Implementation Checklist

### Phase 1 (Week 1-2) - Critical
- [ ] Navamsa Chart (D9) implementation
- [ ] Chart type selector UI
- [ ] Complete Dasha Analysis (Antardasha + Pratyantardasha)
- [ ] Dasha visual timeline
- [ ] Enhanced transit display

### Phase 2 (Week 3-4) - High Priority
- [ ] Transit overlay on chart
- [ ] Professional PDF formatting
- [ ] Yoga Analysis UI
- [ ] Nakshatra Porutham UI
- [ ] Enhanced Panchang

### Phase 3 (Week 5-6) - Medium Priority
- [ ] Additional divisional charts (D10, D7, etc.)
- [ ] Complete numerology
- [ ] Additional doshas
- [ ] Enhanced reports

### Phase 4 (Week 7-8) - Advanced
- [ ] Additional dasha systems
- [ ] Indian calendars (optional)
- [ ] Advanced charts
- [ ] Polish and optimization

---

## 🎯 Success Metrics

### Feature Parity
- **Current**: 70%
- **After Phase 1**: 85%
- **After Phase 2**: 92%
- **After Phase 3**: 97%
- **After Phase 4**: 100%

### User Engagement
- Reports generated per user
- Premium conversion rate
- Average session duration
- Daily active users (DAU)

### Revenue
- Premium subscriptions
- Pay-per-report sales
- Average revenue per user (ARPU)

---

## 📝 Notes

1. **Start with Navamsa (D9)** - Highest impact, most requested
2. **Use Existing Functions** - Many Prokerala functions already exist in `prokeralaEnhanced.ts`, just need UI
3. **Incremental Development** - Build one feature at a time, test, deploy
4. **User Feedback** - Prioritize based on actual user requests
5. **Monetization** - Focus on features that drive revenue (PDFs, reports)

---

**Next Steps:**
1. ✅ Review this plan
2. ✅ Prioritize based on business goals
3. ✅ Start Phase 1 (Navamsa + Dasha)
4. ✅ Track progress weekly
5. ✅ Iterate based on metrics

---

**Document Version**: 1.0  
**Last Updated**: January 2025

