# Refactor Next Steps

## ✅ Completed

### Phase 1: Write Failing Regression Test
- ✅ Created `tests/regression/timer-stuck-stress.test.ts`

### Phase 2: Create Hooks
- ✅ Created `useElapsedSeconds` hook
- ✅ Created `useReportGenerationController` hook
- ✅ Created state machine

---

## 🔄 Next Steps

### Phase 3: Integrate Hooks into preview/page.tsx

**Current Status**: Hooks created, need to integrate

**Challenges**:
1. The current `preview/page.tsx` is very large (3800+ lines)
2. It has complex logic for:
   - Payment verification
   - Bundle reports
   - Multiple report types
   - PDF download
   - Upsell logic
   - Session storage
   - URL parameters

**Recommended Approach**:
1. **Start Small**: Replace timer logic first
   - Replace `elapsedTime` state with `useElapsedSeconds`
   - Remove timer `useEffect`
   - Test timer works

2. **Then Replace Generation Logic**:
   - Replace `generateReport` with `useReportGenerationController`
   - Keep payment verification logic separate (for now)
   - Keep bundle logic separate (for now)
   - Test basic report generation

3. **Gradually Refactor**:
   - Move payment logic to separate hook
   - Move bundle logic to separate hook
   - Simplify component

---

## 📋 Integration Plan

### Step 1: Replace Timer (Low Risk)
```typescript
// BEFORE:
const [elapsedTime, setElapsedTime] = useState<number>(0);
// ... complex useEffect with timer logic

// AFTER:
const elapsedTime = useElapsedSeconds(loadingStartTime, loading);
```

### Step 2: Replace Generation (Medium Risk)
```typescript
// BEFORE:
const generateReport = useCallback(async (...) => {
  // ... 500+ lines of logic
}, [...]);

// AFTER:
const {
  status,
  reportId,
  error: generationError,
  startTime,
  reportContent: generatedContent,
  start: startGeneration,
  cancel: cancelGeneration,
} = useReportGenerationController();
```

### Step 3: Update UI (Low Risk)
- Update loading states based on `status`
- Update timer display using `elapsedTime` from hook
- Update error display using `generationError`

---

## ⚠️ Important Considerations

1. **Payment Verification**: Current code has complex payment verification logic that needs to be preserved
2. **Bundle Reports**: Bundle logic is separate and complex - may need its own hook
3. **Session Storage**: Current code uses sessionStorage extensively - need to preserve
4. **URL Parameters**: Current code reads from URL params - need to preserve
5. **Backward Compatibility**: Need to ensure existing functionality still works

---

## 🧪 Testing Strategy

1. **Run Regression Test**: Should still fail (hooks not integrated yet)
2. **Integrate Timer Hook**: Test timer works
3. **Integrate Generation Hook**: Test basic generation works
4. **Run All Tests**: Ensure nothing broke
5. **Run Regression Test**: Should pass after integration

---

## 📝 Files to Modify

1. `src/app/ai-astrology/preview/page.tsx` - Main integration
2. `tests/unit/timer-logic.test.ts` - Update to test hook
3. `tests/integration/timer-behavior.test.ts` - Update to test hook
4. `tests/regression/timer-stuck-stress.test.ts` - Should pass after integration

---

**Status**: Ready for Phase 3 integration  
**Priority**: High

