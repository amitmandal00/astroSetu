# MVP GOALS — FINAL TARGET STATE (REVISED & LOCKED)

**Date**: 2026-01-25  
**Status**: 🔒 **LOCKED** - Do not change without explicit approval

---

## 🧠 ONE-LINE MVP DEFINITION (DO NOT CHANGE)

**"A user authorizes payment once and always gets either a fully delivered report (or bundle) or no charge — with zero stuck states and zero money leakage."**

---

## 🎯 CORE INTENT

I WANT a simplified, robust, predictable system, not an over-engineered one.
- **Stability > cleverness**
- **Predictability > speed**
- **One correct path > many flexible ones**
- **No cron job required for correctness**
- **No automatic retries**

---

## 🚫 NON-NEGOTIABLE SYSTEM RULES

1. **Frontend never generates reports**
2. **Worker is the only execution path**
3. **Payment is captured only after success**
4. **Failures are terminal and visible**
5. **Refreshing the page must not change backend state**
6. **No build is pushed unless build + tests are green**
7. **No new abstractions without explicit approval**
8. **Same input must always produce same outcome**

**Any change violating these is reverted immediately.**

---

## 1️⃣ REPORT TYPES — SCOPE DECISION (UPDATED)

### In MVP (Allowed)
- **Single reports**
- **Bulk / bundle reports**
  *(ONLY because they already worked in last stable build)*

### Conditions for Bulk Reports

Bulk is allowed **only if all below are true**:
- Bundle behaves as one logical unit
- Payment capture happens only after entire bundle succeeds
- No partial delivery to user
- One retry applies to the whole bundle
- UI sees one bundle status, not per-item complexity

**If any condition is broken → bulk is frozen.**

---

## 2️⃣ PAYMENT PROTECTION (USER + YOU)

### What success looks like
- User is never charged unless report/bundle is fully delivered
- You never pay OpenAI / Prokerala if generation fails
- No double charges, no partial captures, no refunds in normal flow

### How MVP achieves this
- API-first Order + Stripe PaymentIntent (manual capture)
- Stripe flow:
  - `requires_payment_method`
  - `requires_confirmation`
  - `requires_capture`
- Capture happens only after:
  - single report → completed
  - bundle → all items completed
- On failure:
  - PaymentIntent is cancelled immediately
  - No cron required for correctness

### MVP acceptance check
- Stripe dashboard:
  - zero succeeded payments without delivery
  - One order → one payment decision → one outcome

---

## 3️⃣ ROBUST REPORT GENERATION (NO BROKEN UX)

### What success looks like
- No spinner resets
- No redirect loops
- No "start over" on refresh
- User can close browser and return later

### How MVP achieves this
- All heavy work runs async via worker
- Frontend only:
  - create order
  - redirect to preview
  - poll status
  - render result
- Single source of truth:
  - report / bundle status ∈ `queued | processing | completed | failed`
- Preview page is idempotent:
  - reload resumes polling
  - never re-enqueues jobs automatically

### MVP acceptance check
- Refresh 10+ times → generation continues
- Network drop → resume works
- No 504s from generation endpoints

---

## 4️⃣ COST CONTROL & RETRIES (TIGHTENED)

### What success looks like
- No blind API retries
- No infinite worker loops
- No cost leakage on failures

### How MVP achieves this
- Worker guardrails:
  - `max_attempts = 1`
  - strict locking / idempotency
- OpenAI / Prokerala calls:
  - only after payment authorization
  - only once per attempt
- Failure is terminal:
  - `status = failed`
  - payment cancelled
  - no background retry

### MVP acceptance check
- API billing roughly equals delivered reports
- Logs show zero calls after hard failure

---

## 5️⃣ FAST PERCEIVED PERFORMANCE (SAFE VERSION)

### What success looks like
- User sees progress immediately
- No "nothing happening" feeling
- Heavy reports don't block UI

### How MVP achieves this
- Immediate redirect to `/preview?orderId=…`
- Simple progress states:
  - `queued → processing → completed / failed`
- No token streaming
- No partial section rendering (for MVP)

### MVP acceptance check
- First visual feedback < 2 seconds
- No blank screen > 3 seconds

---

## 6️⃣ STABLE BUILDS USERS CAN TRUST

### What success looks like
- No random failures
- Predictable behavior under load
- No "fix one thing, break another" loops

### How MVP achieves this
- Strict status vocabulary (no aliasing)
- One job = one report/bundle = one payment
- CI + pre-push gate:
  - build
  - tests
  - lint / typecheck

### MVP acceptance check
- 48 hours:
  - zero stuck processing
  - zero orphan payments
  - zero manual DB fixes

---

## 7️⃣ QUALITY GUARANTEES (WITHOUT OVER-ENGINEERING)

### What success looks like
- Paid reports are never empty or thin
- Graceful degradation when APIs misbehave

### How MVP achieves this
- Minimum section validation per report type
- Auto-inject fallback sections
- Quality flags logged only (non-blocking)

### Special Rule — Yearly Analysis
- **Known flakiness acknowledged**
- Yearly report must have:
  - strict timeouts
  - validation
  - fallback "lite yearly" mode if needed
- **Never break the entire order if safe degradation is possible**

---

## 8️⃣ USER RETRY / REATTEMPT (CONTROLLED)

### Rules
- Retry allowed only if:
  - `status = failed`
  - `retry_count = 0`
  - within 24h
- Retry behavior:
  - reuse same order
  - reuse same PaymentIntent (if valid)
  - one manual retry max

### After retry:
- Order becomes terminal

### MVP acceptance check
- Retry does not re-charge
- Stripe shows no duplicate intents

---

## 9️⃣ BUILD & TEST DISCIPLINE (MANDATORY)
- Tests must be run regularly
- No git push unless:
  - build passes
  - tests pass
- Cursor must:
  - keep retrying fixes until green
  - stop and ask before risky refactors
  - flag similar potential failures proactively

---

## 🔒 WHAT IS INTENTIONALLY NOT IN MVP
- Subscriptions
- Credits system
- Multi-language reports
- Streaming tokens UI
- Human support workflows
- Perfect astrology depth
- New report types beyond known stable ones

---

## 🚦 MVP IS "DONE" ONLY IF
- User always gets report or no charge
- System survives refresh, retry, redeploy
- No cron required to save correctness
- You feel confident sending paid traffic
- You stop firefighting core flow daily

---

## 📋 CONTEXT & DECISIONS

### Rollback Strategy
- **Rollback to last stable build** where:
  - Bulk reports worked (with conditions)
  - Yearly analysis had known flakiness (acknowledged)
  - Priority = stability > scope purity

### Development Model
- **Solo dev, Cursor-driven**
- **No cron-for-correctness**
- **No automatic retries**

### Next Steps (when ready)
When you share the last stable build ZIP, ChatGPT will:
1. Validate whether bulk implementation is safe to keep
2. Identify exactly what caused yearly flakiness
3. Produce a "do not touch / safe to refactor" map
4. Suggest minimal surgical fixes, not rewrites

**You're doing the right thing by rolling back first.**
**Lock this doc in Cursor, then move forward one controlled change at a time.**

---

**Status**: 🔒 **LOCKED**  
**Last Updated**: 2026-01-25  
**Do Not Change Without Explicit Approval**

