# 2-Report Bundle Timer Stuck at 26s Issue

**Date:** 2025-01-XX  
**Issue:** 2-report bundle report timer stuck at 26 seconds

---

## Problem Description

The 2-report bundle timer gets stuck at 26 seconds. The timer shows "Elapsed: 26s" and doesn't increment further, even though report generation should continue.

**Symptoms:**
- Timer shows "Elapsed: 26s"
- Timer doesn't increment past 26 seconds
- Report generation appears stuck

---

## Root Cause Analysis

The timer useEffect has dependencies `[loading, loadingStage, reportType, bundleGenerating]`. When bundle generation completes, `setBundleGenerating(false)` is called, which triggers the useEffect to re-run. However, the timer interval might not be handling the bundle completion correctly.

Let me check the bundle completion logic and timer interaction.

---

## Investigation Steps

1. Check bundle report polling/completion logic
2. Check if `setBundleGenerating(false)` is called correctly
3. Check if timer interval continues after bundle completion
4. Verify timer useEffect handles bundleGenerating state change correctly

---

**Status**: Investigating...

