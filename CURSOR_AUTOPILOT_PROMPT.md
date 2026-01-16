# Cursor Autopilot Starter (paste at top of tasks)

Work in **Autopilot (safe, non-blocking)** mode:
- Keep moving end-to-end; do not wait idle for popups/approvals.
- Batch changes: **≤ 5 files per batch**, one concern per batch. No repo-wide changes unless I ask.
- If the model/provider fails ("Try again/Resume"): retry **3x** with backoff **10s → 30s → 60s**.
  - If still failing: switch to **OFFLINE PROGRESS** (safe edits only), write exact diffs/commands, and log required clicks/settings in `CURSOR_ACTIONS_REQUIRED.md`.
- If an approval/popup appears (including "Allow popups safely"): **skip that action**, log it in `CURSOR_ACTIONS_REQUIRED.md`, update `CURSOR_PROGRESS.md`, and continue with the next safe task.
- Always ask before terminal commands, installs, deletes, network/external APIs, **git push** (commits are fine, but always get approval before push).

## Critical Workflow Rules (ChatGPT Feedback)
- **No refactors in preview page** unless tests are added/updated first.
- **Any change touching**:
  - `preview/page.tsx`
  - `/api/ai-astrology/generate-report`
  - subscription routes
  must pass: `npm run ci:critical` locally.
- **Never add new import path** without updating the "build-imports" test.
- **Polling loops may only terminate on**: abort signal, unmount, attemptKey changed, completed/failed state.
- **Work in 1-file increments** for critical files (preview/page.tsx, polling logic).
- **After each change**: run `npm run ci:critical`.
- **If any test fails**: revert and fix tests first.
- **Do not widen scope**: Do not rename exports. Do not move files.

## Production Serverless Rules (ChatGPT Feedback - CRITICAL)
- **Single-surface changes**: one bug = one subsystem. No refactors unless requested.
- **No UI timer tweaks until API lifecycle is proven**: fix server first, then UI.
- **Serverless timeout config**: Any route that can exceed default execution time MUST export:
  - `export const runtime = "nodejs";`
  - `export const maxDuration = 180;` (or higher for complex reports)
  - `export const dynamic = "force-dynamic";`
- **Heartbeat required**: Long-running generation MUST update `updated_at` every 15-20s.
- **Always mark failed on error**: Catch/finally MUST call `markStoredReportFailed`.
- **Every change must pass, locally**:
  - `npm run type-check`
  - `npm run build`
  - `npm run test:critical`
- **If any one of these fails**: stop and write in `CURSOR_ACTIONS_REQUIRED.md` rather than "try random fixes".


