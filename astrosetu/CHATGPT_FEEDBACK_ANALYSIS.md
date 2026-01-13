# ChatGPT Feedback Analysis & Action Plan

## 🎯 Key Issues Identified

### 1. **Too Many Sources of Truth for Timer** 🔴 CRITICAL
- **Problem**: `elapsedTime` stored as state + multiple refs + multiple resets
- **Impact**: Timer freezes, jumps backwards, continues after completion
- **Root Cause**: Multiple places resetting/forcing `elapsedTime`

### 2. **Polling Without Cancellation Contract** 🔴 CRITICAL
- **Problem**: Polling started "in background" without cancellation
- **Impact**: Multiple poll loops, stale state updates, overlapping attempts
- **Root Cause**: No `AbortController` or attempt tracking

### 3. **Interval Closure/Dependency Problems** 🟡 HIGH
- **Problem**: Timer `useEffect` reads state from closure
- **Impact**: Wrong timeout thresholds, unexpected interval recreation
- **Root Cause**: `loadingStage` used in closure instead of ref

### 4. **Tests Don't Stress Failure Mode** 🟡 HIGH
- **Problem**: Tests are "logic sanity" tests, not stress tests
- **Impact**: 100% passing but real bugs still occur
- **Root Cause**: No concurrency/race condition tests

---

## ✅ Recommended Solutions

### A. State Machine Approach
- Replace multi-state spaghetti with explicit state machine
- States: `idle`, `verifying`, `generating`, `polling`, `completed`, `failed`, `timeout`
- Enforce legal transitions only

### B. Dedicated Hooks
- `useReportGenerationController()` - Owns generation + polling + cancellation
- `useElapsedSeconds(startTime, running)` - Computed timer (not stored state)

### C. Single-Flight Guard
- Only one active attempt allowed
- `activeAttemptIdRef` to track current attempt
- Abort on new attempt

### D. Better Testing
- Write failing regression test first
- Test real component with stage transitions
- Test concurrency/race conditions

---

## 📋 Action Plan

### Phase 1: Write Failing Regression Test (FIRST)
1. Create test that reproduces real bug
2. Test should fail with current code
3. Document expected behavior

### Phase 2: Refactor into Hooks
1. Create `useReportGenerationController` hook
2. Create `useElapsedSeconds` hook
3. Move timer logic out of component

### Phase 3: Implement State Machine
1. Define state machine states
2. Implement transitions
3. Replace current state management

### Phase 4: Add Cancellation Contract
1. Add `AbortController` to polling
2. Add attempt tracking
3. Abort on stage change/unmount

### Phase 5: Update Tests
1. Update existing tests to use new hooks
2. Add stress tests
3. Verify all tests pass

---

## 🚀 Immediate Next Steps

1. **Create failing regression test** (Priority 1)
2. **Document contract** in markdown (Priority 2)
3. **Refactor into hooks** (Priority 3)
4. **Implement state machine** (Priority 4)

---

**Status**: Ready to implement  
**Priority**: High - Architectural refactor needed

