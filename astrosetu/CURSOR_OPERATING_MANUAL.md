# Cursor Operating Manual for AstroSetu Report Generation

**Last Updated**: 2026-01-14  
**Source**: ChatGPT Guidelines  
**Status**: ✅ Active - Must Follow for All Report Generation Changes

---

## 📋 Non-Negotiable Product Contracts

### 1. Loader visible ⇒ timer must tick
**Contract**: If the "Generating…" / "Verifying…" screen is visible, Elapsed must increase within 2 seconds.

**Enforcement**: E2E test `critical-invariants.spec.ts` must pass.

**CRITICAL FIX**: If loader becomes visible via `session_id` or `reportId`, `startTime` MUST be initialized immediately.
- "If loader visible and startTime is null ⇒ set startTimeRef = Date.now() (once)"
- This prevents timer stuck at 0s when resuming via session_id.

---

### 2. Single-flight generation
**Contract**: At most one active attempt at a time. Retry/Start Over must cancel the previous attempt and start a new one.

**Implementation**: `useReportGenerationController` owns `attemptId` and `AbortController`.

---

### 3. Retry is a full restart
**Contract**: Retry must: abort polling + reset guards + reset start time + start generation through the same entry point.

**Implementation**: `handleRetryLoading` must:
- Abort previous attempt (`AbortController.abort()`)
- Increment `attemptIdRef.current`
- Reset all guards (`isGeneratingRef.current`, `bundleGeneratingRef.current`, etc.)
- Reset start time (`loadingStartTimeRef.current = Date.now()`)
- Call `generateBundleReports` or `generateReport` through controller

---

### 4. URL params never imply processing
**Contract**: `reportType` alone must not show loader. Loader requires evidence of an actual attempt: `auto_generate` or `session_id` or "start clicked" or `reportId`.

**Implementation**: `isProcessingUI` must NOT include `reportType` in URL. Only check:
- `loading`
- `isGeneratingRef.current`
- `bundleGenerating`
- `loadingStage !== null`
- `urlSessionId` (session_id in URL)
- `urlReportId` (reportId in URL)
- `autoGenerate` (auto_generate=true in URL)

---

### 5. Completion stops everything
**Contract**: On success/fail/cancel: polling stops, timer stops, and UI leaves loading state deterministically.

**Implementation**: 
- `generationController.cancel()` stops polling
- `isProcessingUI` becomes false
- Timer stops (because `isProcessingUI` is false)
- UI shows report content or error

---

## ❌ Forbidden Edits for Cursor (To Prevent Breakage)

### Don't Patch useEffect Dependencies Randomly
- ❌ Don't patch `useEffect` dependencies randomly in `preview/page.tsx`.
- ✅ If dependencies need changing, add a regression test first.

### Don't Add New Booleans/Refs to Fix Symptoms
- ❌ Don't add new booleans/refs to "fix" a symptom.
- ✅ Fix the root cause using existing architecture (controller, hooks).

### Don't Change UI Render Gating Logic Without Tests
- ❌ Don't change UI render gating logic without updating the regression test.
- ✅ Update `loader-timer-never-stuck.e2e.spec.ts` when changing loader visibility.

### Don't Create Second Polling Loop
- ❌ Don't create a second polling loop (no nested retries, no background "fire and forget").
- ✅ Use single `useReportGenerationController` for all polling.

---

## ✅ Required Architecture Boundaries

### One Controller Owns Generation
- ✅ One controller owns: `start()`, `retry()`, `cancel()`, polling, `attemptId`, `AbortController`.
- ✅ File: `src/hooks/useReportGenerationController.ts`

### One Timer Hook Returns Derived Elapsed Seconds
- ✅ One timer hook returns derived elapsed seconds. It runs strictly based on `isProcessingUI`.
- ✅ File: `src/hooks/useElapsedSeconds.ts`

### isProcessingUI Must Match Loader Visibility
- ✅ `isProcessingUI` must be derived from the exact condition that renders the loader UI.
- ✅ Must NOT include `reportType` in URL (only actual processing indicators).

---

## 🔄 Cursor Workflow Rules (Must Follow Every Task)

### Rule 1: Test-First (MANDATORY)
**NO FIX WITHOUT A FAILING REPRODUCTION TEST FIRST**

**Process**:
1. Read `tests/contracts/report-flow.contract.md`
2. Add failing Playwright E2E test reproducing the bug (using `session_id` for year-analysis/bundle/paid)
3. Test must assert: "if loader visible, elapsed increases within 2 seconds"
4. Implement smallest change to make it pass
5. Verify `npm run test:critical` passes

**CRITICAL**: All fixes must start with a failing test in `tests/e2e/critical-invariants.spec.ts`

---

### Rule 2: Minimal Surface Area (NO EDITS IN preview/page.tsx EXCEPT WIRING)
**ALL LOGIC CHANGES GO INTO useReportGenerationController / useElapsedSeconds / helper module**

**Process**:
1. Create new hook/controller in `src/hooks/` or `src/lib/`
2. Wire it into `preview/page.tsx` minimally
3. Keep `preview/page.tsx` changes to wiring only
4. **FORBIDDEN**: No new booleans/refs in `preview/page.tsx` - push into controller

---

### Rule 3: One Change-Set
**Each fix = one concept (timer gating, retry cancellation, param normalization). No "also refactored X".**

**Process**:
1. Identify single concept to fix
2. Fix only that concept
3. Don't refactor other things in same commit

---

### Rule 4: Prove No Regressions (CRITICAL TEST GATE)
**Must run:**
- `npm run test:critical` - **MUST PASS** (blocks merge if fails)
- E2E regression test: `critical-invariants.spec.ts`

**Process**:
1. Run `npm run test:critical` before committing
2. Ensure all 4 critical invariant tests pass:
   - Loader visible => elapsed ticks (year-analysis, bundle, paid)
   - Session resume scenario
   - Retry must be full restart
   - reportType alone must not show loader
3. Verify no regressions in existing tests

---

## 📝 Standard Prompt Templates (Copy/Paste)

### Template A — Fix a Defect Safely

```
Read tests/contracts/report-flow.contract.md. Add a failing regression test for the defect. 
Then implement the smallest change to make it pass. Do not change UI text. Do not introduce 
new state flags; use the controller/hook boundary. All critical tests must pass.
```

---

### Template B — Refactor Without Breaking

```
Refactor into useReportGenerationController and useElapsedSeconds without changing runtime 
behavior. Add/keep regression test: "Loader visible ⇒ timer ticks." Only after tests pass, 
remove old code.
```

---

### Template C — Retry Defects

```
Make retry cancel previous attempt (AbortController), increment attemptId, reset all guards, 
reset start time, then start generation through the same controller entry point. Add a 
regression test that fails before your change.
```

---

## 🧪 The One Regression Test That Stops Timer Regressions Forever

### Test Contract
**"If loader is visible, elapsed must increase"**

This test encodes the invariant that keeps breaking you.

### What It Catches (All Your Recurring Bugs)
- ✅ Loader shows but `loading=false` → timer stuck at 0 (year-analysis, paid transition)
- ✅ Timer interval cleared by rerender → stuck at 19/25/26
- ✅ Retry starts but old attempt still active → UI stuck / timer not ticking
- ✅ Param mismatch (`session_id` vs `sessionId`) causing `isProcessingUI` false while loader visible

### Test File
**Location**: `tests/e2e/loader-timer-never-stuck.spec.ts`

**Status**: ✅ Implemented (see below)

---

## 🎯 How to Use This Test to Control Cursor

**Every time you ask Cursor to fix anything in the report flow, prepend:**

> "Do not ship unless loader-timer-never-stuck.e2e.spec.ts passes. If you change loader gating or timer logic, update code so that when loader is visible, elapsed ticks."

This forces Cursor to stop doing "patchy fixes" and instead align the timer, loader gating, and polling ownership.

---

## 🚨 NEW NON-NEGOTIABLES (ChatGPT Latest Feedback - 2026-01-14)

### 6. startTime MUST be initialized when loader becomes visible
**Contract**: If loader becomes visible via `session_id` or `reportId` and `startTime` is null, initialize it immediately.

**Implementation**: 
```typescript
useEffect(() => {
  if (isProcessingUI && loadingStartTimeRef.current === null && loadingStartTime === null) {
    const startTime = Date.now();
    loadingStartTimeRef.current = startTime;
    setLoadingStartTime(startTime);
  }
}, [isProcessingUI, loadingStartTime]);
```

**Why**: Prevents timer stuck at 0s when resuming via session_id (the exact production bug).

---

### 7. Controller MUST own ALL report types
**Contract**: One controller must own start/retry/cancel/polling for ALL report types (free, year-analysis, bundle, paid).

**Status**: 
- ✅ Free reports: Use `generationController.start()`
- ❌ Year-analysis: Still uses legacy path (MUST MIGRATE)
- ❌ Bundle: Still uses legacy path (MUST MIGRATE)
- ❌ Paid: Still uses legacy path (MUST MIGRATE)

**Why**: Prevents split world where free works but others stuck (DEF-006/DEF-007 behavior).

---

### 8. Critical Test Gate (MUST PASS)
**Contract**: `npm run test:critical` must pass before any merge.

**Tests** (in `tests/e2e/critical-invariants.spec.ts`):
1. Loader visible => elapsed ticks (year-analysis with session_id)
2. Loader visible => elapsed ticks (bundle with retry)
3. Loader visible => elapsed ticks (paid transition: verify → generate)
4. Session resume scenario (exact screenshot bug)
5. Retry must be full restart
6. reportType alone must not show loader

**Why**: These are the "killer tests" that prevent all timer regressions.

---

## 🔒 Hard Boundary Checklist (Before Accepting Cursor Output)

Before accepting any Cursor changes, verify:

- [ ] Did it add/modify the E2E invariant test in `critical-invariants.spec.ts`?
- [ ] Did it touch loader gating? If yes, did it update the test to match?
- [ ] Did it add any new booleans/refs in `preview/page.tsx`? **REJECT** - Push into controller.
- [ ] Did it change logic in `preview/page.tsx`? **REJECT** - Should be in controller/hook.
- [ ] Does `npm run test:critical` pass?
- [ ] Is retry a full restart (abort + attemptId++ + guards reset + startTime init + start())?

**If any checkbox fails → REJECT the changes and ask Cursor to fix.**

---

## 📋 Implementation Checklist

- ✅ Guidelines document created
- ✅ E2E test implemented (`loader-timer-never-stuck.spec.ts`)
- ✅ Critical invariant tests implemented (`critical-invariants.spec.ts`)
- ✅ UI data-testid added (`data-testid="elapsed-seconds"`)
- ✅ Contract document referenced (`tests/contracts/report-flow.contract.md`)
- ✅ startTime initialization when loader visible: **FIXED**
- ✅ Critical test gate created: **COMPLETE**
- ⚠️ Controller owns all report types: **PARTIAL** (only free reports)

---

**Last Updated**: 2026-01-14  
**Maintained By**: Development Team  
**Review Frequency**: Before every report generation change

