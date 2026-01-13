# Refactor Plan: Timer & Report Generation

## 🎯 Goal
Refactor timer and report generation logic to eliminate race conditions and "stuck" bugs.

---

## 📋 Phase 1: Write Failing Regression Test (DONE ✅)

**File**: `tests/regression/timer-stuck-stress.test.ts`

**What it tests:**
- Rapid stage transitions
- Multiple poll loops
- Timer freezing/jumping
- Timer continuing after completion

**Status**: Test created - should FAIL with current implementation

---

## 📋 Phase 2: Create Hooks

### 2.1 Create `useElapsedSeconds` Hook

**File**: `src/hooks/useElapsedSeconds.ts`

**Purpose**: Compute elapsed time from startTime (single source of truth)

**API**:
```typescript
const elapsed = useElapsedSeconds(startTime, isRunning);
```

**Implementation**:
- Don't store elapsedTime as state
- Compute: `elapsed = floor((now - startTime) / 1000)`
- Update every 1s when running
- Return 0 when not running

### 2.2 Create `useReportGenerationController` Hook

**File**: `src/hooks/useReportGenerationController.ts`

**Purpose**: Owns generation + polling + cancellation

**API**:
```typescript
const {
  status,
  progress,
  startTime,
  reportId,
  error,
  start,
  cancel,
} = useReportGenerationController();
```

**Implementation**:
- Single-flight guard (only one active attempt)
- AbortController for polling
- State machine (idle, verifying, generating, polling, completed, failed, timeout)
- Attempt tracking

---

## 📋 Phase 3: Implement State Machine

### 3.1 Define State Machine

**File**: `src/lib/reportGenerationStateMachine.ts`

**States**:
- `idle`
- `verifying`
- `generating`
- `polling`
- `completed`
- `failed`
- `timeout`

**Transitions**:
- Enforce legal transitions only
- Prevent invalid state changes

### 3.2 Replace Current State Management

**File**: `src/app/ai-astrology/preview/page.tsx`

**Changes**:
- Remove multiple state variables
- Use state machine instead
- Single source of truth

---

## 📋 Phase 4: Add Cancellation Contract

### 4.1 Add AbortController to Polling

**Changes**:
- Every polling loop uses AbortController
- Abort on new attempt
- Abort on unmount
- Abort on stage change

### 4.2 Add Attempt Tracking

**Changes**:
- Store `activeAttemptIdRef`
- Check attemptId before updating state
- Ignore stale attempts

---

## 📋 Phase 5: Update Tests

### 5.1 Update Existing Tests

**Changes**:
- Update tests to use new hooks
- Remove tests that test implementation details
- Keep tests that test behavior

### 5.2 Add Stress Tests

**Changes**:
- Add concurrency tests
- Add race condition tests
- Add cancellation tests

---

## 🚀 Implementation Order

1. ✅ **Phase 1**: Write failing regression test (DONE)
2. **Phase 2**: Create hooks (NEXT)
3. **Phase 3**: Implement state machine
4. **Phase 4**: Add cancellation contract
5. **Phase 5**: Update tests

---

## 📝 Files to Create

1. `src/hooks/useElapsedSeconds.ts`
2. `src/hooks/useReportGenerationController.ts`
3. `src/lib/reportGenerationStateMachine.ts`
4. `tests/contracts/report-flow.contract.md` (DONE ✅)
5. `tests/regression/timer-stuck-stress.test.ts` (DONE ✅)

---

## 📝 Files to Modify

1. `src/app/ai-astrology/preview/page.tsx` - Refactor to use hooks
2. `tests/unit/timer-logic.test.ts` - Update to test hooks
3. `tests/integration/timer-behavior.test.ts` - Update to test hooks

---

## ✅ Success Criteria

- [ ] Regression test passes
- [ ] Timer computed, not stored
- [ ] Only one poll loop at a time
- [ ] Single-flight guard implemented
- [ ] State machine enforces legal transitions
- [ ] All existing tests pass
- [ ] No race conditions
- [ ] No "stuck" bugs

---

**Status**: Ready to implement  
**Priority**: High

