# Cursor Operational Guide (AstroCursor)

## Goal
Use Cursor as a **safe autopilot**: keep moving forward, never corrupt the repo, and always leave a clean audit trail when blocked.

## Daily workflow (recommended)
- **Before starting**: read `CURSOR_PROGRESS.md` and `CURSOR_ACTIONS_REQUIRED.md`.
- **While working**:
  - Change **≤ 5 files per batch**.
  - Prefer **tests-first** for regressions (add/extend a test that reproduces the defect).
  - After each batch: update `CURSOR_PROGRESS.md`.
- **When blocked** (approvals/popups/rate limits): log it in `CURSOR_ACTIONS_REQUIRED.md` and continue with the next safe work.

## Testing workflow (stability bar)
- **Fast local**: `npm run test:unit` → `npm run test:integration`
- **Stability**: `npm run test:regression`
- **Build gate**: `npm run verify`
- **Critical pipeline**: `npm run ci:critical`
- **One-command stability**: `npm run stability:full` (from `astrosetu/`)

## Product invariants (must never regress)
- **Timer monotonic**: generation timer must not reset to 0 mid-run; must not get stuck while loader is visible.
- **Future-only predictions**: no past-dated prediction windows/years in report output (20xx < current year).
- **Subscription journey**: “Subscribe” must not loop back to the same page; verify-session must persist and survive refresh.

## Where the guardrails live
- `.cursor/rules`
- `CURSOR_AUTOPILOT_PROMPT.md`
- `NON_NEGOTIABLES.md`


