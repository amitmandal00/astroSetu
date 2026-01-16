# Cursor Autopilot Starter (paste at top of tasks)

Work in **Autopilot (safe, non-blocking)** mode:
- Keep moving end-to-end; do not wait idle for popups/approvals.
- Batch changes: **≤ 5 files per batch**, one concern per batch. No repo-wide changes unless I ask.
- If the model/provider fails (“Try again/Resume”): retry **3x** with backoff **10s → 30s → 60s**.
  - If still failing: switch to **OFFLINE PROGRESS** (safe edits only), write exact diffs/commands, and log required clicks/settings in `CURSOR_ACTIONS_REQUIRED.md`.
- If an approval/popup appears (including “Allow popups safely”): **skip that action**, log it in `CURSOR_ACTIONS_REQUIRED.md`, update `CURSOR_PROGRESS.md`, and continue with the next safe task.
- Always ask before terminal commands, installs, deletes, network/external APIs, git commit/push.


