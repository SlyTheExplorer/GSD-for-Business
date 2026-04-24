# Phase 6: Bidirectional Foundation — Phase 1↔2 Return Stack - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 06-bidirectional-foundation-phase-1-2-return-stack
**Areas discussed:** Detector shape + trigger, Return-stack frame contents, Meta-arbiter UX, Resume flow shape

---

## Area Selection

**Options presented:**

| Option | Description | Selected |
|--------|-------------|----------|
| Detector shape + trigger | Agent vs lib AND where it fires (after ALIGN / every gate / manual / after every write) | ✓ |
| Return-stack frame contents | Minimal fields vs rich frame vs lean + separate gap_queue | ✓ |
| Meta-arbiter UX | 3-choice AU vs free-text vs hybrid with justification; topic fingerprinting | ✓ |
| Resume flow shape | Auto-detect + confirm vs --resume flag vs menu-first | ✓ |

User selected all 4 areas.

---

## Area 1: Detector shape + trigger

### Q1: Gap-detector shape — agent vs lib?

| Option | Description | Selected |
|--------|-------------|----------|
| Agent (Phase 4 canonical) | LLM-powered agent spawned via Task; matches Phase 4/5 shape. Cost: 1 Task spawn per trigger. Quality: detects semantic gaps. | ✓ Recommended |
| Pure lib (keyword/schema rules) | Synchronous, deterministic, free. Risk: misses semantic gaps; false positives. | |
| Hybrid: lib fast-path + agent escalate | Cost-optimal but two code paths to maintain. | |

**User's choice:** Agent (Phase 4 canonical)
**Captured as:** D-01

### Q2: Trigger point?

| Option | Description | Selected |
|--------|-------------|----------|
| After ALIGN verdict only | Reuses ALIGN trigger; zero new hook surfaces. | ✓ Recommended |
| After every gate (ALIGN + AUDIENCE + COMPLIANCE) | 3x Task spawns per artifact. | |
| Manual-only via /brief-gap-check | Risks gaps missed if user forgets. | |
| After every artifact write (universal) | Conflicts with Phase 4 D-04 orchestrator-step-not-hook rule. | |

**User's choice:** After ALIGN verdict only
**Captured as:** D-02

### Q3: Which gap severity triggers return_stack push?

| Option | Description | Selected |
|--------|-------------|----------|
| BLOCKING only | BLOCKING pushes; MATERIAL documented inline; NICE-TO-HAVE deferred to v2. Matches ROADMAP SC #4. | ✓ Recommended |
| BLOCKING + MATERIAL (user-opt-in prompt) | Adds interrupt per MATERIAL; risks interrupt fatigue. | |
| BLOCKING auto + MATERIAL batched in /brief-status queue | Non-interrupting but requires queue UI. | |

**User's choice:** BLOCKING only
**Captured as:** D-03

### Q4: Gap-detector output file (paired-sibling per D-11)?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — {artifact}.gaps.md | Follows D-11 uniformly. Parallel to .align.md and .audience.md. Git-trackable audit trail. | ✓ Recommended |
| No — inline in STATE.md only | Lighter filesystem; loses per-artifact audit parity. | |
| Consolidated {workstream}/.gaps.md | Less fragmented; breaks D-11 uniformity. | |

**User's choice:** Yes — {artifact}.gaps.md
**Captured as:** D-04

---

## Area 2: Return-stack frame contents

### Q1: Frame fields?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal + timestamps (7 fields) | paused_phase, paused_workstream, paused_artifact, gap_text, triggering_topic, topic_fingerprint, pushed_at. Compact JSON; matches ALIGN last_gate_results shape. | ✓ Recommended |
| Rich frame with wave + context snapshot | Adds parent_objective_block, pre_return_align_verdict. Serialization cost. | |
| Lean + separate gap_queue keyed by frame_id | Cross-reference overhead on resume. | |

**User's choice:** Minimal + timestamps
**Captured as:** D-05

### Q2: Convergence telemetry storage?

| Option | Description | Selected |
|--------|-------------|----------|
| Derived from return_stack_history[] append-only log | Round-trip count = filter by workstream + topic. No separate counter to drift. | ✓ Recommended |
| Explicit counter per workstream | Drift risk if reset forgotten on workstream complete. | |
| Session-only (no persistent telemetry) | Fails DSG-14 — must survive /clear. | |

**User's choice:** Derived from return_stack_history[]
**Captured as:** D-06

### Q3: Cap behavior at depth 3?

| Option | Description | Selected |
|--------|-------------|----------|
| Meta-arbiter at iter 2, hard-cap at iter 3 (no bypass) | Matches ROADMAP SC #2 verbatim. Upholds Pitfall #7 discipline. | ✓ Recommended |
| Hard-cap bypass if user explicitly overrides | Adds escape hatch; erodes the loop-protection discipline. | |

**User's choice:** Meta-arbiter at iter 2, hard-cap at iter 3 (no bypass)
**Captured as:** D-07

---

## Area 3: Meta-arbiter UX

### Q1: Meta-arbiter prompt UX at iteration 2?

| Option | Description | Selected |
|--------|-------------|----------|
| 3-choice AskUserQuestion | Keep researching / Proceed with assumption / Cancel workstream. Text_mode fallback for cross-runtime. | ✓ Recommended |
| Free-text prompt with structured parse | Parse-failure risk; non-determinism. | |
| Hybrid: AU + mandatory justification on all 3 | Friction mismatch; "Keep researching" is no-cost default. | |

**User's choice:** 3-choice AskUserQuestion
**Captured as:** D-08 (justification required only on "Proceed with assumption" path per Phase 4 D-07 pattern)

### Q2: Topic fingerprinting for iteration counting?

| Option | Description | Selected |
|--------|-------------|----------|
| Gap-detector emits topic_fingerprint slug | Normalized kebab-case slug, 3-8 tokens. Discipline in agent prompt. | ✓ Recommended |
| Hash of (artifact + gap_text[:100]) | Fragile under gap text rewording; user could bypass iteration count. | |
| LLM-compared on demand at push time | Extra LLM call per push; non-determinism in iteration count. | |

**User's choice:** Gap-detector emits topic_fingerprint
**Captured as:** D-09

---

## Area 4: Resume flow shape

### Q1: Resume UX on /brief-discover after RETURNED-TO-DISCOVER exit?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-detect top frame + AskUserQuestion confirm | Discoverable without new flag; user stays in control. | ✓ Recommended |
| Explicit --resume flag required | User may forget stack exists; adds hidden surface. | |
| Always show stack on invocation (menu-first) | Friction when user wants fresh session. | |

**User's choice:** Auto-detect top frame + confirm
**Captured as:** D-10

### Q2: Frame pop condition?

| Option | Description | Selected |
|--------|-------------|----------|
| Popped after artifact write + ALIGN re-passes | Both conditions gate pop; prevents premature pop if gap not actually closed. | ✓ Recommended |
| Popped when researcher writes artifact | Allows pop without verifying the gap closed. | |
| Popped only on explicit user confirmation | Conservative; adds required user action. | |

**User's choice:** Popped after artifact write + ALIGN re-passes
**Captured as:** D-11

---

## Claude's Discretion

User deferred to planner on:
- Exact agent prompt structure for `brief-gap-detector.md`
- `{artifact}.gaps.md` body schema beyond frontmatter
- `/brief-status` return-stack section layout
- Korean i18n of meta-arbiter prompt
- `state.brief.gap_queue` schema details beyond core fields
- Test fixture patterns (follow Phase 5 discipline)

## Deferred Ideas

- MATERIAL gap interactive review (v2 candidate)
- NICE-TO-HAVE gap triage (v2 — dropped in v1 gap_queue)
- Multi-workstream parallel return-stacks (v2)
- Return-stack visualization beyond /brief-status text
- Gap-detector cost control (sampling, cache)
- Korean clause-level compliance gap detection (Phase 7 COMPLIANCE-checker's concern)
- Return-stack snapshot for `/brief-resume-work` (free integration — no work needed)
