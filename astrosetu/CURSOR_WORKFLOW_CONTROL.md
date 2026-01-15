# Cursor Workflow Control - Complete Guide

**Date**: 2026-01-14  
**Status**: ✅ **ACTIVE** - Must Follow for All Report Generation Changes

---

## 🚨 NON-NEGOTIABLES (Enforced by Workflows)

### 1. No Fix Without Failing Test First
**MANDATORY**: Every fix must start with a failing Playwright E2E test in `tests/e2e/critical-invariants.spec.ts`.

**Enforcement**: 
- Test must reproduce the exact bug using `session_id` (for year-analysis/bundle/paid)
- Test must assert: "if loader visible, elapsed increases within 2 seconds"
- Test must fail before fix is implemented

---

### 2. No Edits in preview/page.tsx Except Wiring
**MANDATORY**: All logic changes go into `useReportGenerationController` / `useElapsedSeconds` / helper modules.

**Enforcement**:
- ❌ **FORBIDDEN**: Adding new booleans/refs in `preview/page.tsx`
- ❌ **FORBIDDEN**: Changing logic in `preview/page.tsx`
- ✅ **ALLOWED**: Only wiring (calling controller methods, passing props)

**If Cursor adds logic to `preview/page.tsx` → REJECT and ask to move to controller/hook.**

---

### 3. Retry Must Be Full Restart
**MANDATORY**: Retry must follow exact sequence:
1. Abort previous attempt (`AbortController.abort()`)
2. Increment `attemptIdRef.current`
3. Reset ALL guards (`isGeneratingRef.current`, `bundleGeneratingRef.current`, etc.)
4. Reset start time (`loadingStartTimeRef.current = Date.now()`)
5. Start via controller entry point (`generationController.start()`)

**Enforcement**: Check `handleRetryLoading` function before accepting changes.

---

### 4. Loader Visible ⇒ Timer Ticks
**MANDATORY**: If loader is visible, elapsed must increase within 2 seconds.

**Enforcement**: 
- E2E test in `critical-invariants.spec.ts` must pass
- `npm run test:critical` must pass before merge

---

### 5. startTime MUST Be Initialized When Loader Visible
**MANDATORY**: If loader becomes visible via `session_id` or `reportId` and `startTime` is null, initialize it immediately.

**Enforcement**: Check `useEffect` that initializes `startTime` when `isProcessingUI` becomes true.

---

### 6. Controller MUST Own ALL Report Types
**MANDATORY**: One controller must own start/retry/cancel/polling for ALL report types.

**Status**:
- ✅ Free reports: Use `generationController.start()`
- ✅ Year-analysis: Use `generationController.start()` (MIGRATED)
- ✅ Paid reports: Use `generationController.start()` (MIGRATED)
- ⚠️ Bundle: Still uses `generateBundleReports()` (TODO: Migrate in future)

**Enforcement**: Check that all report types use `generationController.start()` except bundles.

---

### 7. Critical Test Gate (MUST PASS)
**MANDATORY**: `npm run test:critical` must pass before any merge.

**Tests** (E2E):
1. Loader visible => elapsed ticks (year-analysis with session_id)
2. Loader visible => elapsed ticks (bundle with retry)
3. Loader visible => elapsed ticks (paid transition: verify → generate)
4. Session resume scenario (exact screenshot bug)
5. Retry must be full restart
6. reportType alone must not show loader
7. Billing: Cancel subscription persists after refresh
8. Billing: Resume subscription persists after refresh

**Enforcement**: CI/local must block merge if this suite fails.

---

### 8. Production Reality Gates (COST + RELIABILITY)
**MANDATORY**: Prevent production-only regressions that burn money or break billing.

**Enforcement (CI)**:
- `npm run test:integration:critical` must pass:
  - Idempotency gate (no duplicate report generation for same idempotency key)
  - Stripe webhook signature gate (reject missing/invalid signatures)
- `npm run check:env-required` must pass in CI (fails if critical secrets are missing).

---

## 💳 Billing / Subscription Workflows (Stripe + Supabase)

### Billing NON-NEGOTIABLES
- **No direct Stripe calls from client**: UI calls server routes only.
- **DB is source of truth**: UI renders from `/api/billing/subscription` (DB-backed), not client guesses.
- **Webhook sync required**: Stripe events must update DB.
- **Idempotency required**: Cancel/resume safe to repeat; webhook replays safe.
- **No edits to report generation/timer files in a billing PR**.
- **Must pass**: `npm run type-check`, `npm run build`, `npm run test:critical` (includes billing tests).

### Billing Cursor Workflow
- Add failing Playwright test first (`tests/e2e/billing-subscription.spec.ts`)
- Add/adjust API routes + webhook
- Wire Billing UI + confirm modal
- Run `npm run ci:critical` and `npm run test:critical`

## 🔄 Operational Workflow (How to Drive Cursor)

### Step A: Create/Lock Critical Test Gate
**Before any fix**:
1. Run `npm run test:critical` to see current status
2. Add failing test to `tests/e2e/critical-invariants.spec.ts` if not exists
3. Ensure test reproduces the exact bug

**Enforcement**: 
- `npm run test:critical` script exists in `package.json`
- CI/local must block merge if this suite fails

---

### Step B: One Change-Set Rule
**During fix**:
- Cursor may only change:
  - One controller/hook file + the new test
  - OR just the test
- ❌ **FORBIDDEN**: Drive-by refactors
- ❌ **FORBIDDEN**: Multiple concepts in one change

**Enforcement**: Review git diff - should be minimal and focused.

---

### Step C: Hard Boundary Checklist (Before Accepting Cursor Output)

**Before accepting any Cursor changes, verify:**

- [ ] Did it add/modify the E2E invariant test in `critical-invariants.spec.ts`?
- [ ] Did it touch loader gating? If yes, did it update the test to match?
- [ ] Did it add any new booleans/refs in `preview/page.tsx`? **REJECT** - Push into controller.
- [ ] Did it change logic in `preview/page.tsx`? **REJECT** - Should be in controller/hook.
- [ ] Does `npm run test:critical` pass?
- [ ] Is retry a full restart (abort + attemptId++ + guards reset + startTime init + start())?
- [ ] Does controller own the report type (not legacy `generateReport`)?

**If any checkbox fails → REJECT the changes and ask Cursor to fix.**

---

## 📝 Mandatory Prompt Template (Copy/Paste)

**USE THIS EVERY TIME YOU ASK CURSOR TO FIX ANYTHING:**

```
MANDATORY: Add a failing Playwright test reproducing the bug using session_id (year-analysis). 
The test must assert: if the loader is visible, elapsed increases within 2 seconds, and after 
mocked completion the report renders and loader disappears.

Then implement the smallest fix only inside the controller/hook layer. Do not change UI text. 
Do not add new state flags to preview/page.tsx. Ensure retry is a full restart 
(abort + attemptId++ + guard reset + startTime init). All test:critical must pass.
```

**This prompt enforces:**
- Test-first approach
- Controller/hook boundary (no preview/page.tsx logic changes)
- Full restart on retry
- Critical test gate

---

## 🎯 Workflow Steps for Every Fix

### 1. Identify the Bug
- Reproduce in production
- Take screenshots
- Note exact conditions (session_id, reportType, etc.)

### 2. Create Failing Test
- Add test to `tests/e2e/critical-invariants.spec.ts`
- Test must reproduce exact bug
- Test must fail before fix

### 3. Run Critical Tests
```bash
npm run test:critical
```
- Verify new test fails
- Note which other tests fail (if any)

### 4. Implement Fix
- Use mandatory prompt template
- Fix must be in controller/hook layer only
- No logic changes in `preview/page.tsx`

### 5. Verify Fix
```bash
npm run test:critical
```
- All tests must pass
- No regressions

### 6. Hard Boundary Check
- Run through checklist above
- Verify all non-negotiables met

### 7. Build Safety Check (MANDATORY)
- Run `npm run ci:critical` (type-check + build + build-imports + critical integration + boundary + env)
- All must pass before commit
- This prevents Vercel build failures

### 8. Commit & Get Approval
- Commit with clear message
- **MANDATORY: Get user approval before git push**
- Show summary of changes
- Wait for explicit approval before pushing

---

## 🔒 Prevention Mechanisms

### 1. Critical Test Gate
- `npm run test:critical` must pass
- CI blocks merge if fails
- Local development blocks commit if fails

### 2. Hard Boundary Checklist
- Review every Cursor change
- Reject if violates non-negotiables
- Ask Cursor to fix before accepting

### 3. Mandatory Prompt Template
- Always use the template
- Enforces test-first
- Enforces controller boundary

### 4. Operating Manual
- `CURSOR_OPERATING_MANUAL.md` documents all rules
- Reference before every fix
- Update when new patterns emerge

---

## 📋 Files to Monitor

### Critical Files (Do Not Break)
1. `src/app/ai-astrology/preview/page.tsx` - Only wiring allowed
2. `src/hooks/useReportGenerationController.ts` - Core logic
3. `src/hooks/useElapsedSeconds.ts` - Timer logic
4. `tests/e2e/critical-invariants.spec.ts` - Critical tests

### Files to Update When Fixing
1. `tests/e2e/critical-invariants.spec.ts` - Add failing test first
2. `src/hooks/useReportGenerationController.ts` - Fix logic here
3. `src/hooks/useElapsedSeconds.ts` - Fix timer logic here
4. `CURSOR_OPERATING_MANUAL.md` - Update if new pattern emerges

---

## ✅ Success Criteria

### Before Merging Any Fix
- [ ] `npm run test:critical` passes
- [ ] All non-negotiables met
- [ ] Hard boundary checklist passed
- [ ] No logic in `preview/page.tsx` (only wiring)
- [ ] Controller owns the report type
- [ ] Retry is full restart
- [ ] startTime initialized when loader visible

---

## 🚫 What NOT to Do

### ❌ Don't Patch useEffect Dependencies Randomly
- If dependencies need changing, add regression test first

### ❌ Don't Add New Booleans/Refs to Fix Symptoms
- Fix root cause using existing architecture (controller, hooks)

### ❌ Don't Change UI Render Gating Logic Without Tests
- Update `critical-invariants.spec.ts` when changing loader visibility

### ❌ Don't Create Second Polling Loop
- Use single `useReportGenerationController` for all polling

### ❌ Don't Add Logic to preview/page.tsx
- All logic goes into controller/hook layer

### ❌ Don't Skip the Failing Test
- Every fix must start with a failing test

---

## 📚 Related Documents

- `CURSOR_OPERATING_MANUAL.md` - Complete operating manual
- `tests/contracts/report-flow.contract.md` - State machine contract
- `DEFECT_REGISTER.md` - All defects and fixes

---

**Last Updated**: 2026-01-14  
**Maintained By**: Development Team  
**Review Frequency**: Before every report generation change

