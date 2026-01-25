#!/bin/bash
# Fails if Prokerala references appear inside the AI Astrology feature boundary.
# Goal: keep AI Astrology predictions OpenAI-based and avoid vendor lock-in / accidental credit burn.
#
# Checked directories:
# - src/app/ai-astrology/**
# - src/app/api/ai-astrology/**
# - src/lib/ai-astrology/**
#
# Note: This is a *feature-boundary* check, not a full repo ban. Other parts of the app may
# legitimately use Prokerala (e.g., non-AI astrology endpoints).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PATTERN='prokerala|api\.prokerala\.com|PROKERALA_'

echo "🔎 Checking Prokerala usage is NOT present in AI Astrology feature boundary ..."

# Collect matches (if any). Use grep (available in CI/Vercel).
MATCHES="$(
  {
    grep -RInEi "$PATTERN" src/app/ai-astrology 2>/dev/null || true
    grep -RInEi "$PATTERN" src/app/api/ai-astrology 2>/dev/null || true
    grep -RInEi "$PATTERN" src/lib/ai-astrology 2>/dev/null || true
  } | sed '/^$/d' || true
)"

if [ -z "$MATCHES" ]; then
  echo "✅ No Prokerala references found in AI Astrology feature boundary"
  exit 0
fi

echo "❌ Prokerala references found inside AI Astrology feature boundary:"
echo "$MATCHES"
echo ""
echo "Fix by removing Prokerala-specific strings/usages from AI Astrology, or explicitly approve and change this check."
exit 1


