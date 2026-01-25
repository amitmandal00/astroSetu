# Refactor Progress - Timer & Report Generation

## ✅ Phase 1: Write Failing Regression Test (COMPLETE)

- [x] Created `tests/regression/timer-stuck-stress.test.ts`
- [x] Test reproduces real-world bugs
- [x] Test should FAIL with current implementation

---

## ✅ Phase 2: Create Hooks (IN PROGRESS)

### 2.1 useElapsedSeconds Hook (COMPLETE ✅)

**File**: `src/hooks/useElapsedSeconds.ts`

**Status**: ✅ Created

**Features**:
- Computes elapsed time from `startTime` (single source of truth)
- Never stores `elapsedTime` as state
- Updates every 1s when running
- Stops when `isRunning` is false

**API**:
```typescript
const elapsed = useElapsedSeconds(startTime, isRunning);
```

### 2.2 useReportGenerationController Hook (COMPLETE ✅)

**File**: `src/hooks/useReportGenerationController.ts`

**Status**: ✅ Created

**Features**:
- Single-flight guard (only one active attempt)
- AbortController for cancellation
- State machine integration
- Polling with cancellation contract
- Attempt tracking

**API**:
```typescript
const {
  status,
  reportId,
  error,
  startTime,
  progress,
  reportContent,
  start,
  cancel,
  retry,
} = useReportGenerationController();
```

### 2.3 State Machine (COMPLETE ✅)

**File**: `src/lib/reportGenerationStateMachine.ts`

**Status**: ✅ Created

**Features**:
- Explicit states: `idle`, `verifying`, `generating`, `polling`, `completed`, `failed`, `timeout`
- Legal transitions enforced
- Prevents invalid state changes

---

## 🔄 Phase 3: Refactor preview/page.tsx (NEXT)

**Status**: Pending

**Tasks**:
- [ ] Replace `elapsedTime` state with `useElapsedSeconds` hook
- [ ] Replace generation logic with `useReportGenerationController` hook
- [ ] Remove multiple state variables
- [ ] Remove manual polling logic
- [ ] Remove timer useEffect
- [ ] Simplify component

---

## 📋 Phase 4: Update Tests (PENDING)

**Status**: Pending

**Tasks**:
- [ ] Update existing tests to use new hooks
- [ ] Verify regression test passes
- [ ] Add stress tests
- [ ] Verify all tests pass

---

## 🎯 Next Steps

1. **Refactor preview/page.tsx** to use new hooks
2. **Update tests** to use new hooks
3. **Verify regression test** passes
4. **Test in real environment**

---

**Last Updated**: 2026-01-13  
**Status**: Phase 2 Complete, Phase 3 Next

