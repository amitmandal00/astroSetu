# AI Astrology — Defect Register (Updated)

This register is intended for fast QA + ChatGPT review. It maps each defect to:
- **Status** (fixed/guarded)
- **Primary fix location**
- **Verification tests** (unit/integration/regression/e2e)

## 1) Year analysis timer resets to 0 / gets stuck on first load
- **Reported**: first site load → year-analysis generation timer resets to 0 and can get stuck.
- **Status**: **Fixed + guarded**
- **Key areas**:
  - `astrosetu/src/app/ai-astrology/preview/page.tsx` (timer monotonic + controller/legacy sync gates)
  - `astrosetu/src/hooks/useElapsedSeconds.ts`
- **Verification**:
  - **E2E**: `astrosetu/tests/e2e/year-analysis-first-load-timer-monotonic.spec.ts`
  - **E2E**: `astrosetu/tests/e2e/loader-timer-never-stuck.spec.ts`
  - **Regression**: `astrosetu/tests/regression/year-analysis-timer-stuck-prod.test.ts`

## 2) Free life summary feels “too thin” (low engagement)
- **Reported**: UI says “X% shown” but content feels too small / low engagement.
- **Status**: **Improved + guarded**
- **Key areas**:
  - `astrosetu/src/lib/ai-astrology/prompts.ts` (minimum sections requirement for life-summary)
  - `astrosetu/src/lib/ai-astrology/reportGenerator.ts` (more robust life-summary heading parsing)
  - `astrosetu/src/app/ai-astrology/preview/page.tsx` (filter empty sections before gating)
- **Verification**:
  - **Unit**: `astrosetu/tests/unit/lib/life-summary-parser-robustness.test.ts`
  - **E2E**: `astrosetu/tests/e2e/free-report.spec.ts`

## 3) Past-dated predictions (bad UX: should be future-only)
- **Reported**: reports sometimes show timing windows in past years/dates.
- **Status**: **Fixed + hardened + guarded**
- **Key areas**:
  - `astrosetu/src/lib/ai-astrology/ensureFutureWindows.ts` (server-side sanitization)
  - `astrosetu/src/app/api/ai-astrology/generate-report/route.ts` (sanitizes before rendering cached/stored reports too)
- **Verification**:
  - **Unit**: `astrosetu/tests/unit/lib/futureWindows.test.ts`
  - **Integration**: `astrosetu/tests/integration/report-output-future-only.test.ts`
  - **E2E**: `astrosetu/tests/e2e/future-only-timing.spec.ts`

## 4) Subscribe redirects/refresh loops; can’t complete monthly subscription journey
- **Reported**: clicking Subscribe can loop back to same page after refresh and block the journey.
- **Status**: **Fixed + guarded**
- **Key areas**:
  - `astrosetu/src/app/ai-astrology/subscription/page.tsx` (persist sessionId + resilient verify flow)
  - `astrosetu/src/app/ai-astrology/subscription/success/page.tsx` (verify-session then redirect)
  - `astrosetu/src/app/api/billing/subscription/verify-session/route.ts` (test-session support sets cookie)
- **Verification**:
  - **E2E**: `astrosetu/tests/e2e/billing-subscribe-flow.spec.ts`
  - **E2E**: `astrosetu/tests/e2e/subscription-journey-monotonic.spec.ts`
  - **E2E**: `astrosetu/tests/e2e/billing-subscription.spec.ts` (cancel/resume persistence behavior)

## Stability gate (recommended)
- Run: `cd astrosetu && npm run stability:full`


