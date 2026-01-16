# NON‑NEGOTIABLES (Do Not Break)

## Engineering safety
- **No destructive commands**: never run `rm -rf`, `drop database`, `sudo`, disk ops, or similar.
- **No repo-wide refactors** unless explicitly asked.
- **No silent behavior changes**: if a behavior changes, add/adjust tests proving it.
- **Keep diffs tight**: ≤ 5 files per batch, one concern per batch.

## AstroSetu product invariants
- **Future-only timing**: reports must never present timing windows/years in the past (for 20xx years).
- **Generation stability**: loader/timer must not reset to 0 mid-run or get stuck.
- **Subscription UX**: subscribe → checkout → success → dashboard must complete without refresh loops.
- **Free report quality**: free life-summary must be structured, readable, and feel valuable (no “thin” output due to parsing).


