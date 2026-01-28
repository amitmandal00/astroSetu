🔒 CURSOR NON-NEGOTIABLE RULES (COST & STABILITY CONTROL)

1. DEFAULT MODE RULE (MANDATORY)
	•	Cursor MUST default to Ask mode for all questions, clarifications, reviews, and decisions.
	•	If no explicit instruction to modify code is present, Agent mode is strictly forbidden.

⸻

2. PLANNING RULE (MANDATORY BEFORE AGENT)
	•	Plan mode is REQUIRED before any Agent execution when:
	•	multiple files may be involved
	•	async logic is touched
	•	report generation, pricing, Stripe, Supabase, or API flows are involved
	•	Agent MUST NOT proceed unless a Plan has been produced and approved.

Violation = STOP execution.

⸻

3. DEBUG FIRST RULE (FAILURES ONLY)
	•	When builds fail, logs show errors, or behavior regresses:
	•	Cursor MUST use Debug mode first
	•	Cursor MUST identify:
	•	exact failure point
	•	minimal fix surface
	•	Agent MUST NOT refactor or optimize during Debug.

⸻

4. AGENT EXECUTION RULE (HIGH RISK MODE)

Agent mode is EXPENSIVE and DANGEROUS. It may be used only if ALL conditions below are met:
	•	Explicit user approval is present (e.g. “Proceed with Agent”)
	•	Scope is narrowly defined (files, functions, lines)
	•	Objective is singular (fix X, not improve everything)
	•	No pricing, UX, or architecture changes unless explicitly requested

If any condition is missing → DO NOT RUN AGENT

⸻

5. SINGLE-RUN AGENT RULE
	•	Agent is allowed ONE execution only
	•	If fix fails:
	•	STOP
	•	Report findings
	•	Request next instruction
	•	Automatic retries are not allowed

⸻

6. NO CREATIVE REFACTORING RULE

Agent MUST NOT:
	•	restructure folders
	•	rename files
	•	refactor working logic
	•	optimize prompts
	•	“clean up” code
	•	introduce abstractions

Unless explicitly instructed.

⸻

7. MVP STABILITY RULE (CRITICAL)

For MindVeda / AstroSetu MVP:
	•	Working report flows must NEVER be altered
	•	Deterministic skeleton delivery must be preserved
	•	Async architecture must not be expanded
	•	Token usage must not increase
	•	Output format must remain backward-compatible

If uncertain → STOP and ASK.

⸻

8. PRICING & BUSINESS LOGIC RULE
	•	Pricing is hardcoded
	•	No configurable pricing
	•	No admin UI
	•	No experiments
	•	Stripe product IDs must remain unchanged

Agent must NEVER touch pricing logic unless explicitly approved.

⸻

9. TOKEN COST AWARENESS RULE

Cursor must:
	•	minimize context ingestion
	•	avoid reading unrelated files
	•	avoid speculative fixes
	•	avoid “future-proofing”

If the task can be solved in Ask or Plan, Agent must not be used.

⸻

AGENT PERMISSION PHRASE (MANDATORY)
Agent may only run if the user explicitly says: “Proceed with Agent — scope locked.”
Any other phrasing (e.g., “ok”, “go ahead”, “proceed”) is not sufficient.

⸻

10. STOP & ASK RULE (FAIL-SAFE)

If at any point:
	•	scope is unclear
	•	risk is high
	•	multiple solutions exist
	•	production stability may be impacted

Cursor MUST STOP and ask for confirmation.

⸻

✅ ENFORCED EXECUTION ORDER (SUMMARY)

Allowed order only:

Ask → Plan → Debug → Agent (once, approved)

Forbidden patterns:

Agent → Agent → Agent
Agent without Plan
Agent without approval
Agent with creativity

⸻

🧠 FINAL NOTE (IMPORTANT)

These rules exist to:
	•	reduce Cursor token cost
	•	protect MVP stability
	•	prevent infinite fix loops
	•	preserve revenue-ready flows

Breaking these rules = wasted money + broken product.

