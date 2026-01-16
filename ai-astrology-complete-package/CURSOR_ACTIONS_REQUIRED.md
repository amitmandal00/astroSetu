# CURSOR_ACTIONS_REQUIRED

This file is for **anything that requires user interaction** (permissions, popups, auth, settings).
Cursor should log the blocker here and continue with other work.

## Template (copy per item)

### ACTION REQUIRED: <short title>
- **Where**: (Cursor screen / tool / file)
- **What you see**: (e.g., “Allow popups safely”, “Approve terminal command”, “Resume”)
- **Why it’s needed**: (what it unlocks)
- **Safest choice**: (exact button/setting to click)
- **Safe workaround**: (how to continue without clicking it, if possible)
- **Risk**: (what could go wrong)
- **After you do it**: (what Cursor should do next)

---

## Current blockers
- (none)

---

## Auth / popup references
- See `CURSOR_AUTH_POPUP_PLAYBOOK.md` for the recommended handling of in-app **“Allow popups safely”** during auth.

---

## Model provider failure playbook (ERROR_OPENAI / “Unable to reach the model provider”)
When you see the “Unable to reach the model provider” banner/popup:
- **(1) Click**: `Try again` once.
- **(2) If it repeats**: click `Resume`.
- **(3) If it still repeats**:
  - switch provider/model in Cursor (or a smaller-context model),
  - disable “include entire repo/auto-add files” (keep context small),
  - retry the last step.
- **(4) If still blocked**: check provider billing/limits, VPN, and network.


