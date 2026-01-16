#!/bin/bash
#
# CI-only guardrail to prevent production-only failures due to missing secrets.
# This is intentionally strict in CI environments (Vercel/GitHub Actions).
#
set -euo pipefail

CI_FLAG="${CI:-}"
if [[ "$CI_FLAG" != "true" && "$CI_FLAG" != "1" ]]; then
  echo "ℹ️  check-env-required: skipping (not running in CI)"
  exit 0
fi

REQUIRED_VARS=(
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
)

missing=()
for v in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    missing+=("$v")
  fi
done

if [[ "${#missing[@]}" -gt 0 ]]; then
  echo "❌ Missing required environment variables in CI:"
  for v in "${missing[@]}"; do
    echo "  - $v"
  done
  echo ""
  echo "Fix: set these as Vercel/GitHub CI environment variables (Production)."
  exit 1
fi

echo "✅ Required CI environment variables are present"


