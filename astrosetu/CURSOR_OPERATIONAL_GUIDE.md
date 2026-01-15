# Cursor Operational Guide (Report Generation)

This is the workflow Cursor must follow when changing anything related to AI Astrology report generation.

## NON-NEGOTIABLES

- **Minimal diff rule**: fix only the defect; no unrelated refactors.
- **Timer monotonic invariant**: while the generation UI is visible, elapsed time must **never** reset to 0 and must **never** decrease.
- **Idle-only resets**: do not clear `loading`, `loadingStage`, `loadingStartTime`, `loadingStartTimeRef`, or generation locks while an attempt is active/starting.
- **Owner model**: controller vs legacy flow must be mutually exclusive; switching must be explicit.
- **URL contract**: use `session_id` (snake_case) for paid-flow continuity.

Reference contract: `tests/contracts/report-flow.contract.md`.

## Subscription flow (monthly) — NON-NEGOTIABLES

- Client **never** calls Stripe directly. It must call server routes and then `window.location.href = session.url`.
- No “subscription active” state sourced from `sessionStorage` (except a temporary UX banner).
- DB/API (Supabase via `/api/billing/subscription`) is the source of truth.
- Success redirect must verify `session_id` server-side (`/api/billing/subscription/verify-session`) and then redirect to `/ai-astrology/subscription` (clean URL).
- Verification must be idempotent (safe to call twice).

## Standard workflow (do not skip steps)

### 1) Reproduce + isolate
- Identify the exact user journey (fresh load vs transition vs retry).
- Locate the single source of truth for:
  - **UI visibility** (processing screen)
  - **timer** (start time source)
  - **polling** (attempt/cancel guards)

### 2) Add a reproducer test first
- UI/timer defects → add/update a Playwright spec in `tests/e2e/`.
- The test must encode the invariant (ex: “elapsed never decreases”).

### 3) Implement the smallest fix
- Prefer local guards over broad rewrites.
- Never introduce new global state or new “second source of truth”.

### 4) Verify locally (targeted)
- Run the smallest relevant subset:

```bash
cd astrosetu

# Targeted unit tests
npx vitest run tests/unit/lib/lifeSummary-engagement.test.ts tests/unit/lib/freeReportGating.test.ts

# Targeted E2E regression
npx playwright test tests/e2e/year-analysis-first-load-timer-monotonic.spec.ts
```

If you need the full critical gate:

```bash
cd astrosetu
npm run ci:critical
```

### 5) Ship checklist
- Contract still holds (`tests/contracts/report-flow.contract.md`).
- Reproducer test passes.
- No unrelated diffs.


