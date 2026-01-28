# Cursor Operational Guide (AstroCursor)

## Goal
Use Cursor as a **safe autopilot**: keep moving forward, never corrupt the repo, and always leave a clean audit trail when blocked.

## MVP Goals Alignment (2026-01-25)
- **Follow `MVP_GOALS_FINAL_LOCKED.md`**: MVP goals are LOCKED and take precedence
- **MVP Definition**: "A user authorizes payment once and always gets either a fully delivered report (or bundle) or no charge — with zero stuck states and zero money leakage."
- **Core Intent**: Stability > cleverness, Predictability > speed, One correct path > many flexible ones
- **No cron-for-correctness**: System must be correct without cron jobs
- **No automatic retries**: Failures are terminal and visible
- **Worker is the only execution path**: Frontend never generates reports

## Daily workflow (recommended)
- **Before starting**: read `CURSOR_PROGRESS.md` and `CURSOR_ACTIONS_REQUIRED.md`.
- **🚨 COST CHECK (2026-01-25)**: Check Cursor Usage dashboard for On-Demand charges. Alert if > $10/day or > 80% of $50/month limit.
- **While working**:
  - **ALWAYS use scoped requests**: Focus on specific files/directories, use @filename mentions
  - **NEVER analyze entire codebase**: Break into smaller, focused requests (< 500K tokens)
  - **Model policy**: Default to **Agent 2 (GPT-5.1 Codex Mini)** for code/autopilot work and always ask before switching to another model/agent.
  - Change **≤ 5 files per batch** (prefer 1-3 files to reduce token usage).
  - Prefer **tests-first** for regressions (add/extend a test that reproduces the defect).
  - **Always add or extend automated tests** whenever you change behavior or fix a bug; document what the new test covers in `CURSOR_PROGRESS.md`.
  - After each batch: update `CURSOR_PROGRESS.md`.
- **When blocked** (approvals/popups/rate limits): log it in `CURSOR_ACTIONS_REQUIRED.md` and continue with the next safe work.
- **Cost monitoring**: Review On-Demand charges daily, document large requests (> 500K tokens) in `COST_SPIKE_ANALYSIS.md`

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
- `MVP_GOALS_FINAL_LOCKED.md` - **LOCKED MVP goals (takes precedence)**
- `.cursorrules` - **Cursor rules (includes cost optimization)**
- `CURSOR_AUTOPILOT_PROMPT.md` - **Autopilot workflow (includes cost alerts)**
- `NON_NEGOTIABLES.md` - **Non-negotiable rules (includes cost optimization)**
- `COST_SPIKE_ANALYSIS.md` - **Cost analysis and optimization guide**
- `COST_ALERT_SYSTEM.md` - **Cost alert thresholds and prevention rules**


