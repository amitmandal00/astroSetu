# Bundle Timer Stuck Fix

**Issue**: 2-report bundle timer stuck at 26 seconds

---

## Analysis

The timer useEffect has condition `if (loading)` and dependencies `[loading, loadingStage, reportType, bundleGenerating]`.

When bundle reports complete:
1. `setBundleGenerating(false)` is called
2. This triggers useEffect to re-run (because `bundleGenerating` is in dependencies)
3. But `loading` is still `true` (because `setLoading(false)` is called after `setBundleGenerating(false)`)
4. So the timer useEffect should continue...

Wait, let me check the order of state updates. If `setBundleGenerating(false)` is called, and then `setLoading(false)`, the useEffect will re-run twice:
- First: `bundleGenerating` changes from `true` to `false`, but `loading` is still `true`, so timer continues
- Second: `loading` changes from `true` to `false`, so timer cleanup runs

But there might be a race condition or state update batching issue.

Actually, I think the issue might be different. Let me check if the timer interval callback is being called correctly when `bundleGenerating` changes.

---

## Hypothesis

When `bundleGenerating` changes from `true` to `false`, the useEffect re-runs. The timer interval is cleared and recreated. But if there's a timing issue, the interval might not be recreated correctly, or the elapsed time calculation might be wrong.

Actually, wait - the timer useEffect only runs when `loading` is `true`. So if `loading` is still `true` when `bundleGenerating` becomes `false`, the useEffect re-runs, clears the old interval, and creates a new one. This should be fine.

But maybe the issue is that the timer is stuck at 26s because the interval callback isn't being called? Or the state update isn't happening?

---

## Solution

The timer logic should handle `bundleGenerating` state changes correctly. The interval should continue running as long as `loading` is `true`, regardless of `bundleGenerating` state.

However, if `bundleGenerating` is in the dependency array, the interval gets recreated every time it changes, which might cause timing issues.

Let me check if we need to remove `bundleGenerating` from dependencies, or handle it differently.

Actually, `bundleGenerating` is needed in dependencies because the timeout threshold calculation uses it (150s for bundles vs 100s for regular reports).

So the issue might be that when the interval is recreated, there's a gap or the elapsed time calculation is wrong.

---

**Status**: Need to investigate further...

