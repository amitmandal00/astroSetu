#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "== AstroSetu stability:full =="
echo "cwd: $(pwd)"
echo

echo "== 1) Build gate (type-check + prod build) =="
npm run verify
echo

echo "== 2) Unit tests =="
npm run test:unit
echo

echo "== 3) Integration tests =="
npm run test:integration
echo

echo "== 4) Regression tests =="
npm run test:regression
echo

echo "== 5) Timing invariants (future-only) =="
npx vitest run tests/unit/lib/futureWindows.test.ts tests/integration/report-output-future-only.test.ts
echo

echo "== 6) E2E regressions for reported defects (MOCK_MODE) =="
npx playwright test --workers=1 \
  tests/e2e/future-only-timing.spec.ts \
  tests/e2e/year-analysis-first-load-timer-monotonic.spec.ts \
  tests/e2e/free-report.spec.ts \
  tests/e2e/billing-subscribe-flow.spec.ts \
  tests/e2e/subscription-journey-monotonic.spec.ts
echo

echo "✅ stability:full passed"


