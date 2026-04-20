# Phase 4: First Gate — ALIGN Pattern Established - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-20
**Phase:** 04-first-gate-align-pattern-established
**Areas discussed:** A1 Gate Invocation Architecture, A2 3-Output Decision Mechanism, A3 DRIFTED Resolution Flow, A4 Canary Scope

**Mode:** Delegated — user elected "가장 추천하는 방법으로 진행해줘" after seeing the 4 gray-area selector and a recommendation table. No per-area deep-dive; each area auto-resolved to the recommended option with rationale surfaced before the lock.

---

## A1 Gate Invocation Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Subagent file (`agents/brief-align-gate.md`) spawned via Task + thin `brief-tools.cjs align` lib helper | Pattern 2 evaluator-optimizer; Pattern 4 visible orchestrator invocation; Phase 5/7 duplicate-and-rename template | ✓ |
| Pure `brief-tools.cjs align` deterministic subcommand | File-IO driven; testable; but Pitfall #4 theater risk (static rules become checkbox theater on nuanced drift) | |
| Inline workflow markdown read by orchestrator | Simplest but highest coupling — gate logic duplicated across orchestrators | |

**User's choice:** Recommended (Subagent file + lib helper).
**Rationale captured in CONTEXT.md D-01.** Key reasoning: matches research Pattern 2 + Pattern 4 exactly; Phase 5/7 replication cost = one file-copy-and-rename; LLM reasoning is load-bearing for subtle-drift detection that pure deterministic would miss.

---

## A2 3-Output Decision Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Deterministic rules only (checklist + heuristics) | Fast, cheap, consistent, BUT Pitfall #4 theater risk — keyword matching alone ships as "compliance checker" | |
| LLM reasoning only | Handles subtle drift; but inconsistent run-to-run + token waste on obvious structural gaps | |
| Hybrid — deterministic first-pass screen, LLM on ambiguous cases | Deterministic catches clear gaps cheaply; LLM reasons on nuance; aligns with Anthropic evaluator-optimizer guidance | ✓ |

**User's choice:** Recommended (Hybrid).
**Rationale captured in CONTEXT.md D-03.** Key reasoning: pure-deterministic is Pitfall #4 itself; pure-LLM burns tokens on structural gaps the validator can catch for free; hybrid is the only design that addresses both the reliability and theater-risk concerns.

---

## A3 DRIFTED Resolution Flow

| Option | Description | Selected |
|--------|-------------|----------|
| User interrupt + 3 explicit paths (Phase 3 D-13 stale-anchor pattern) | Zero new UX learning; mirrors pattern user already approved; no infinite-loop risk | ✓ |
| Bounded auto-retry (e.g., 2 retries then escalate) | Reduces user friction when LLM could fix drift in one more pass; BUT Pitfall #7 infinite-loop hazard; hides user's "accept with caveat" choice | |
| Hybrid (1 auto-retry + then interrupt) | Over-engineered for canary; Phase 4 is first gate — keep semantics crisp | |

**User's choice:** Recommended (User interrupt + 3 paths).
**Rationale captured in CONTEXT.md D-06/D-07.** Key reasoning: Phase 3 D-13 users ALREADY approved this exact 3-path UX for stale-anchor; reusing shape = zero user-learning cost. Auto-retry at gate layer creates loop risk AND silences the user's legitimate "force-accept with audit trail" case. Phase 6 Bidirectional Foundation is the right phase for retry-with-meta-arbiter, not Phase 4.

**Follow-up clarifications (not asked; resolved by Claude per "적정선" D-10):**
- `force-accept` is one of the 3 paths AND leaves an audit trail (justification required; recorded in state + ALIGN-00.md).
- DRIFTED-objective → `/brief-define --amend` (uses Phase 3's amend flow).
- DRIFTED-output → re-spawn worker (in Phase 4 canary, the "worker" IS /brief-define itself).

---

## A4 Canary Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Wire ALIGN into `/brief-define` Mode A wrap-up (OBJECTIVES.md self-coherence sanity check) + test fixtures | Real artifact + real orchestrator; follows research line 487 precedent; zero new user-facing commands | ✓ |
| Toy fixture orchestrator (planted-contradiction test only) | Proves mechanism but not real-world fit; feels synthetic | |
| Wait for Phase 5 /brief-discover real output | Phase 3 left /brief-discover as a block-gate STUB with no content — no real output to evaluate in Phase 4 | |

**User's choice:** Recommended (/brief-define Mode A wrap-up canary + test fixtures).
**Rationale captured in CONTEXT.md D-08.** Key reasoning: using OBJECTIVES.md as both candidate and baseline is legitimate self-coherence (Immutable vs Mutable layers provide two sides to compare). Research line 487 explicitly names `ALIGN-00.md` as the Phase 0 sanity-check. Zero new commands = Phase 2 D-06 surface cap honored. Test-fixture suite exercises all 3 decision paths + vocabulary-lock + state round-trip.

**Follow-up clarifications (resolved by Claude per "적정선" D-10):**
- Phase 5 `/brief-discover` is the first cross-artifact caller (documented explicitly so Phase 5 planner does not duplicate Phase 4 work).
- Severity vocabulary locked: `blocking / material / nice-to-have` (matches Phase 6 `brief-gap-detector` for cross-consistency).
- Findings structure: `{severity, location, description}` where `location` is a line/section reference.

---

## Claude's Discretion

Areas where the planner has flexibility (full list in CONTEXT.md `Claude's Discretion` section):

- Exact prompt body of `agents/brief-align-gate.md` (English agent prompt; Korean/English findings output per D-11 Korea-signal rule).
- Internal structure of `brief/bin/lib/align.cjs` (< ~400 lines per Phase 2 discipline).
- `brief-tools.cjs align` verb set (one or more verbs; planner picks).
- Vocabulary ban-list exact token set (starters in D-05; extend during execution based on observed LLM outputs).
- `ALIGN-00.md` layout (planner picks; must include verdict, severity, findings, override section if applicable).
- Whether `brief/workflows/align-gate.md` is called inline or via `brief-tools.cjs` SDK shim (either OK if orchestrator markdown shows the invocation).
- Test file granularity (single file vs split suite).
- Exact 3-path Korean button wording (semantics locked in D-06; prose is planner's domain, follow Phase 3 D-12 tone).

## Deferred Ideas

Full list in CONTEXT.md `<deferred>` section. Highlights:

- `/brief-realign` user-facing command — rejected for Phase 4 surface cap; revisit in Phase 9 HRD-02 pilot audit.
- Cross-artifact ALIGN on multiple Phase 5 research outputs — Phase 5 territory.
- Multi-run `ALIGN-*.md` filename scheme — Phase 5 territory.
- Phase 6 auto-retry layered on top of Phase 4 user-interrupt — Phase 6 territory.
- Vocabulary ban-list expansion from pilot data — Phase 9 HRD-04.
- ALIGN prompt localization beyond Korean/English — v1.x.
- Structured-output JSON schema versioning — v1.1.

---

*Discussion session: 2026-04-20. User invoked delegated mode (`가장 추천하는 방법으로 진행`); 4 gray areas presented with recommendations + rationale; user confirmed; CONTEXT.md and DISCUSSION-LOG.md written atomically with STATE.md update.*
