# Phase 6: Bidirectional Foundation — Phase 1↔2 Return Stack - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the bidirectional Phase 1↔2 return-stack infrastructure — `state.brief.return_stack` (LIFO, max depth 3), `brief-gap-detector` agent, meta-arbiter prompt at iteration 2, and `/brief-status` convergence telemetry rendering — BEFORE the Phase 7 designers that depend on it exist. This is Pitfall #7 (infinite loop) mitigation implemented structurally.

**In scope:** gap-detector agent, gap-detector lib, paired-sibling `.gaps.md` output, `state.brief.return_stack` + `return_stack_history` write/read, hard-cap enforcement at depth 3, meta-arbiter interrupt at iteration 2, `/brief-status` return-stack section, `/brief-discover` resume-on-invocation auto-detection, frame pop on artifact+ALIGN re-pass.

**Out of scope (deferred):** MATERIAL gap interactive review, NICE-TO-HAVE gap triage (v2), multi-workstream parallel return-stacks (single workstream at a time in v1), return-stack visualization beyond `/brief-status` text rendering.

</domain>

<decisions>
## Implementation Decisions

### Gap Detector Shape + Trigger

- **D-01: Gap-detector is an LLM-powered agent.** New file: `agents/brief-gap-detector.md`. Spawned via Task by the orchestrator. Reads the just-written artifact + OBJECTIVES.md + recent SUMMARY.md (and the `<business_context>` block injected via Phase 5 D-13/D-14 `context-inject.cjs`). Returns structured verdict `{gaps: [{severity, text, topic_fingerprint}]}`. Matches Phase 4/5 canonical agent shape (`brief-align-gate.md` + `align.cjs` / `brief-audience-guard.md` + `audience.cjs`). Lib counterpart `brief/bin/lib/gap-detect.cjs` handles the state write + paired-sibling file + return_stack push, mirroring `align.cjs` / `audience.cjs` split.
  - **Rejected:** Pure lib (rule-based keyword/schema match) — misses semantic gaps that LLM catches (e.g., "competitor table missing price axis"). Rejected hybrid (lib fast-path + agent escalate) — two code paths for gate cost that Phase 4/5 kept unified.

- **D-02: Trigger is after ALIGN verdict only.** Gap-detector fires inside the ALIGN orchestrator flow, directly after ALIGN returns (ALIGNED, DRIFTED-objective, or DRIFTED-output). Zero new hook surfaces (Phase 4 D-04 no-hook discipline preserved). Natural semantic: ALIGN already decided the artifact matches OBJECTIVES; gap-detector asks "but what's MISSING from the artifact that the objectives imply?"
  - **Rejected:** After every gate (ALIGN + AUDIENCE + COMPLIANCE) — 3x Task spawns per artifact is too expensive. Manual-only — fails SC #1 discoverability; user would forget. After every artifact write — conflicts with Phase 4 D-04 orchestrator-step-not-hook rule.

- **D-03: BLOCKING only triggers return_stack push.** Gap severities:
  - **BLOCKING** → push frame onto `state.brief.return_stack` + exit with "RETURNED-TO-DISCOVER" message (matches SC #1, SC #4 verbatim).
  - **MATERIAL** → documented inline in `{artifact}.gaps.md` + written to `state.brief.gap_queue[]`; workflow proceeds with caveat note in next artifact's AUDIENCE frontmatter.
  - **NICE-TO-HAVE** → deferred to v2 backlog (not even written to gap_queue to keep it clean).
  - **Rejected:** BLOCKING + MATERIAL opt-in prompt (interrupt fatigue) and BLOCKING auto + MATERIAL batched in /brief-status queue (extra UI surface the user doesn't need for v1).

- **D-04: Gap-detector writes paired-sibling `{artifact}.gaps.md` (Phase 5 D-11 inheritance).** Example: `.planning/workstreams/go-to-market/business-model.md` → `.planning/workstreams/go-to-market/business-model.gaps.md`. Git-trackable audit trail; readable standalone; parallel to ALIGN (`OBJECTIVES.align.md`) and AUDIENCE (`{artifact}.audience.md`). Frontmatter: `{phase: 06-gaps, artifact: <path>, severity_counts: {blocking: N, material: M, nice_to_have: K}, detected_at: <iso>, topic_fingerprints: [...]}`.
  - **Rejected:** Inline-in-STATE-only (loses per-artifact audit diff). Consolidated `{workstream}/.gaps.md` (less fragmented but harder to diff per-artifact; breaks D-11 uniformity).

### Return-Stack Frame Contents + Telemetry

- **D-05: Frame fields — minimal + timestamps (7 fields).** Each frame:
  ```
  {
    paused_phase: "07" | string,          // which phase was running when gap triggered
    paused_workstream: string,             // e.g., "go-to-market"
    paused_artifact: string,               // full path to artifact that triggered
    gap_text: string,                      // verbatim BLOCKING gap text from detector
    triggering_topic: string,              // human-readable topic label (e.g., "Korea fintech TAM")
    topic_fingerprint: string,             // normalized slug for iteration counting (see D-09)
    pushed_at: string                      // ISO-8601 timestamp
  }
  ```
  Enough for resume fidelity + /brief-status rendering + iteration counting. Compact JSON — matches ALIGN's `last_gate_results` shape, preserves Phase 2 D-03 schema intent.
  - **Rejected:** Rich frame with full context snapshot (parent_objective_block, pre_return_align_verdict) — serialization cost bloats state.brief.*, bypassable by reading the actual files on resume. Lean + separate gap_queue keyed by frame_id (cross-reference overhead on resume).

- **D-06: Convergence telemetry derived from append-only `state.brief.return_stack_history[]`.** Every push also appends to a never-popped history log. Round-trip count per workstream = count of entries matching `workstream + topic_fingerprint` in history. No explicit counter to drift out of sync. `/brief-status` computes the count at read time (derived state, single source of truth). Two fields total in `state.brief.*`:
  - `return_stack: []` — LIFO active frames (popped on gap resolution per D-11)
  - `return_stack_history: []` — append-only log of every push (never popped)
  - **Rejected:** Explicit counter per workstream (`state.brief.round_trip_counters[workstream]`) — requires explicit reset-on-workstream-complete; drift risk if reset forgotten. Session-only telemetry — fails DSG-14 (must survive /clear).

- **D-07: Meta-arbiter at iteration 2, hard-cap at iteration 3 (no bypass).**
  - **Push 1** (first detection of a topic): push frame, exit with RETURNED-TO-DISCOVER, no prompt.
  - **Push 2** (second detection of SAME `topic_fingerprint`): before push, fire meta-arbiter interrupt (D-08). Based on user choice: push + exit (keep researching), write assumption note to OBJECTIVES.md + proceed without push (proceed with assumption), or clear return_stack + mark workstream cancelled (cancel workstream).
  - **Push 3** (third detection of SAME `topic_fingerprint`): HARD BLOCK. Display: `"We've researched {topic} 3 times. The loop protection is engaged. Pick: (1) Proceed with explicit written assumption [required]. (2) Cancel workstream. (3) Escalate to human (exit with checkpoint for manual review)."` No bypass; no force-continue option. Matches ROADMAP SC #2 literally + upholds Pitfall #7 mitigation.
  - **Rejected:** Force-continue bypass at iter 3 (erodes the loop-protection discipline — the entire phase exists to prevent exactly this).

### Meta-Arbiter UX

- **D-08: 3-choice AskUserQuestion with text_mode fallback.** At iteration 2:
  - Header: `"Gap loop"` (12 char cap)
  - Question: `"We've gone back to research for '{topic}' twice. Is this gap genuinely blocking, or are we polishing?"`
  - Options:
    - `Keep researching` — push frame, exit with RETURNED-TO-DISCOVER
    - `Proceed with assumption` — require `Other` free-text justification (min 20 chars); write assumption to `OBJECTIVES.md#Assumptions` + MATERIAL note to `{artifact}.gaps.md`
    - `Cancel workstream` — clear return_stack for this workstream + mark `state.brief.workstream_status[{workstream}] = "cancelled-after-loop"` + exit
  - **Text_mode fallback (Phase 1 FND-06 inheritance):** numbered list rendering; user types 1/2/3 + optional justification for option 2. Cross-runtime parity with Claude Code / Codex / Gemini / OpenCode.
  - **Rejected:** Free-text prompt with LLM intent parse (non-determinism, parse failures). Hybrid with mandatory justification on all 3 paths (friction mismatch — "Keep researching" is the no-cost default).

- **D-09: Topic fingerprinting — gap-detector emits `topic_fingerprint` slug.** The agent prompt enforces a discipline: each returned gap MUST include a normalized topic_fingerprint — lowercase-kebab-case, 3-8 tokens, stable under minor text edits. Examples: `market-sizing-korea-fintech-tam`, `competitor-pricing-axis-missing`, `regulatory-citation-pipa-article-28`. Orchestrator matches fingerprint string-equality against `return_stack_history` entries for iteration counting.
  - **Rejected:** Hash of (artifact + gap_text[:100]) — fragile under minor gap text rewording; user could bypass iteration counting by rewording. LLM-compared on demand — every push would require an extra LLM call; non-determinism in iteration counting.

### Resume Flow Shape

- **D-10: Auto-detect top frame on `/brief-discover` invocation, AskUserQuestion to confirm.** When user runs `/brief-discover` (from any state), the command checks `state.brief.return_stack.length`. If > 0:
  - AskUserQuestion:
    - Header: `"Resume"`
    - Question: `"Return-stack has {N} pending gap(s). Resume research on '{top_frame.triggering_topic}', start a new discover session, or show full stack?"`
    - Options: `Resume {topic}` / `Start new session` / `Show stack`
  - **Resume** → spawn ONLY the researcher for `top_frame.triggering_topic` (using Phase 5 `context-inject.cjs buildBusinessContext()`); skip category multi-select.
  - **Start new** → normal /brief-discover flow; frame stays on stack.
  - **Show stack** → text dump of all frames; then re-ask Resume/Start.
  - **Rejected:** Explicit `--resume` flag required (user forgets the stack exists). Always-menu-first (friction when user explicitly wants a new session).

- **D-11: Frame pop requires BOTH artifact write AND ALIGN re-pass.** Two conditions gate the pop:
  1. Researcher writes the `paused_artifact` (file modification timestamp post-dates frame `pushed_at`).
  2. ALIGN re-runs on the new artifact and returns ALIGNED (not DRIFTED-objective, not DRIFTED-output).
  Only when both are true, the top frame is popped from `state.brief.return_stack`. The `return_stack_history` entry is NEVER popped (D-06 telemetry preservation). Prevents premature pop if the new research didn't actually address the gap.
  - **Rejected:** Pop on artifact write alone — allows a frame to pop without verifying the gap was closed. Pop only on explicit user confirmation (`/brief-status pop`) — adds required user action; user may forget.

### Claude's Discretion

- **Exact agent prompt structure** for `brief-gap-detector.md` — follow Phase 4 `brief-align-gate.md` + Phase 5 `brief-audience-guard.md` structural shape (frontmatter + `<role>` + `<required_reading>` + `<business_context_contract>` + `<verdict_enum>` + `<output_structure>` + `<anti_patterns>` + `<process>` + `<examples>`). Exact prompt tuning belongs to plan-phase research/planning.
- **`{artifact}.gaps.md` body schema beyond frontmatter** — grouped by severity; each finding: `### severity/topic_fingerprint` H3 + `**text**` + `**location**` (artifact path + line hint) + `**evidence**` (excerpt or reasoning). Exact schema is planner territory.
- **`/brief-status` return-stack rendering layout** — one new section below existing gate results; show `depth N/3` + top-frame `triggering_topic` + round-trip count per active workstream. Exact formatting is planner territory; must slot into Phase 2 D-15 compact dashboard format.
- **Korean i18n of meta-arbiter prompt** — if `brief.region == "kr"`, render prompt in Korean; otherwise English. Exact translation text is planner territory.
- **`state.brief.gap_queue` schema details** — holds MATERIAL gaps per D-03; exact fields beyond `{workstream, artifact, gap_text, topic_fingerprint, detected_at}` are planner territory.
- **Test fixture patterns** — follow Phase 5 fixture discipline (golden BLOCKING/MATERIAL/NICE-TO-HAVE gap-detector outputs + iteration-2 fingerprint-match fixture + hard-cap-at-3 fixture + frame-pop-requires-align fixture). Parallel to `tests/brief-align-*.test.cjs`.

### Folded Todos

None — `todo match-phase 6` returned 0 matches.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### ROADMAP + Requirements
- `.planning/ROADMAP.md` §Phase 6 — phase goal, 4 SC items, DSG-11 + DSG-14 requirements, Pitfall #7 coverage statement
- `.planning/REQUIREMENTS.md` — DSG-11 (bidirectional flow + 3-round-trip cap + meta-arbiter), DSG-14 (return-stack visibility in /brief-status)

### Prior Phase Decisions (locked — do not revisit)
- `.planning/phases/02-stable-seam-anchor-schema-caps-workstream-as-config/02-CONTEXT.md` — D-03 (state.brief.* schema forward-declaration including `return_stack: []` empty-array), D-15/D-16 (/brief-status compact dashboard format), D-18 (`commands/brief/*.md` + `brief/bin/lib/*.cjs` + `brief/workflows/*.md` split pattern), D-20/D-21 (frontmatter.cjs round-trip extension pattern — if Phase 6 needs to add `return_stack_history` to allowlist, use this)
- `.planning/phases/04-first-gate-align-pattern-established/04-CONTEXT.md` — D-04 (gate is orchestrator step, NOT hook — inherited verbatim for gap-detector), D-07 (force-accept justification pattern — referenced by D-08 meta-arbiter "Proceed with assumption" justification), severity vocabulary (BLOCKING/MATERIAL/NICE-TO-HAVE alignment with gap-detector output)
- `.planning/phases/05-discover-parallel-research-with-provenance-audience-context-injection/05-CONTEXT.md` — D-11 (paired-sibling filename scheme — inherited for `{artifact}.gaps.md`), D-13/D-14 (context-inject.cjs `buildBusinessContext()` — called by Phase 6 when respawning researcher on resume), provenance-tag discipline (inherited for gap-detector quantitative claims)

### Canonical code patterns to replicate (from Phase 4/5 outputs)
- `brief/bin/lib/align.cjs` + `brief/bin/lib/align-report.cjs` — canonical gate lib + report split (Phase 6 `gap-detect.cjs` + `gap-detect-report.cjs` copy-rename this shape)
- `brief/bin/lib/audience.cjs` + `brief/bin/lib/audience-report.cjs` — second canonical instance of the gate pattern; paired-sibling filename logic lives in `_siblingReportPath` helper (gap-detect reuses or inherits)
- `brief/bin/lib/context-inject.cjs` — `buildBusinessContext()` primitive + `COMPLIANCE_PACK_TO_REFERENCE` frozen map; Phase 6 resume flow calls this when respawning researcher
- `brief/bin/lib/status.cjs` — 130-line render target for `/brief-status`; Phase 6 adds a new "Return Stack" section slotting into the existing compact dashboard format
- `brief/workflows/align-gate.md` — orchestrator workflow pattern for gate-as-step (Phase 6 `brief/workflows/gap-detect.md` copy-renames)
- `agents/brief-align-gate.md` + `agents/brief-audience-guard.md` — agent template shape (frontmatter + `<role>` + `<required_reading>` + `<business_context_contract>` + `<verdict_enum>` + `<output_structure>` + `<anti_patterns>` + `<process>` + `<examples>`)

### Research + Architecture
- `.planning/research/ARCHITECTURE.md` — bidirectional flow and return-stack as the highest-architectural-risk feature per research synthesis (drives Phase 6 positioning BEFORE Phase 7 designers)
- `.planning/research/PITFALLS.md` §#7 — Phase 1↔2 infinite loop pitfall; Phase 6 is the structural mitigation (hard 3-round-trip cap + criticality classification + meta-arbiter + convergence telemetry)
- `.planning/ASSUMPTIONS.md` — A1 (zero runtime deps), A4 (state.cjs round-trip) — both MUST be preserved; adding `return_stack_history` as allowlisted state.brief.* field uses existing Phase 2 D-20/D-21 frontmatter.cjs pattern with zero new runtime deps

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`brief/bin/lib/align.cjs`** (from Phase 4) — evaluator-optimizer gate pattern. Phase 6 `gap-detect.cjs` copies this shape: commit API, paired-sibling path resolver (`_siblingReportPath`), verdict state-write, vocabulary-lock helpers.
- **`brief/bin/lib/audience.cjs`** (from Phase 5) — second canonical instance. Shows two-instance pattern stabilized; gap-detect is instance 3 of the same shape.
- **`brief/bin/lib/context-inject.cjs`** (from Phase 5 D-13/D-14) — `buildBusinessContext()` is the primitive the resume flow calls when respawning a researcher for the paused topic. Frozen `COMPLIANCE_PACK_TO_REFERENCE` is the pattern Phase 6 may mirror for a `SEVERITY_TO_REPORT_PATH` frozen map if needed.
- **`brief/bin/lib/status.cjs`** (130 lines, extended in Phase 5 Plan 04 with `Last AUDIENCE` row) — Phase 6 adds a new "Return Stack" section rendering (`depth N/3`, top-frame triggering_topic, round-trip count derived from `return_stack_history`).
- **`brief/workflows/align-gate.md`** — workflow orchestrator pattern that wraps the lib + agent spawn + verdict routing. Phase 6 `brief/workflows/gap-detect.md` copies this shape; difference is D-02 triggers gap-detect INSIDE align-gate.md post-verdict, not as a standalone workflow.
- **AskUserQuestion + text_mode fallback** (Phase 1 FND-06 infrastructure; Phase 4 + Phase 5 consumers) — D-08 meta-arbiter reuses the same pattern; no new infrastructure needed.

### Established Patterns
- **Paired-sibling filename scheme (Phase 5 D-11)** — `{artifact}.align.md` / `{artifact}.audience.md` / `{artifact}.gaps.md` share `_siblingReportPath` helper logic.
- **Severity vocabulary lock (Phase 4 D-09)** — `BLOCKING / MATERIAL / NICE-TO-HAVE` string-equality vocabulary-lock tests (grep-audit discipline). Phase 6 extends the same vocab, same lock test pattern: `tests/brief-gap-detect-vocabulary-lock.test.cjs`.
- **Verdict enum discipline (Phase 4 D-09 / Phase 5 D-09)** — 3-output enum for gap-detector follows Phase 4/5 tradition: `GAPS-NONE / GAPS-MATERIAL-ONLY / GAPS-BLOCKING`. Maps 1:1 to the downstream orchestrator action (proceed / proceed-with-caveat / push-frame).
- **State write via `brief-tools.cjs state` CLI** (Phase 2 infrastructure) — gap-detect commits state.brief.return_stack + state.brief.return_stack_history atomically; no direct filesystem writes bypass the CLI.
- **Command-surface cap** — Phase 6 adds 0 new user-facing slash commands. Frame-resume is auto-detected INSIDE `/brief-discover` (D-10). `/brief-status` is extended, not replaced. Surface Cap audit test (Phase 5 Plan 08 inheritance) catches any regression.

### Integration Points
- **Inside `brief/workflows/align-gate.md` post-verdict step** — that's where gap-detect spawns (D-02). Requires one new orchestrator step in the workflow markdown; no new dispatcher surface.
- **Inside `brief/workflows/discover.md` Step 0 (on-entry)** — return-stack check before category selection (D-10). One new preamble step; existing workflow shape preserved.
- **`brief/bin/lib/status.cjs` render** — one new section appended to existing dashboard format (D-06 derives count from history on read).
- **`brief/bin/brief-tools.cjs` dispatcher** — new `case 'gap-detect'` dispatcher for the state write + paired-sibling write (parallel to `case 'align'` / `case 'audience'`). Zero new top-level CLI commands.

</code_context>

<specifics>
## Specific Ideas

- **D-07 hard-cap language must match ROADMAP SC #2 verbatim:** `"We've gone back to research twice for {topic}. Is this gap genuinely blocking, or are we polishing? Pick: keep researching / proceed with assumption / cancel workstream"` — the meta-arbiter string is user-facing and the SC expects this exact tone.
- **`RETURNED-TO-DISCOVER` exit message** is a literal string pattern referenced by SC #1. Planner must use this exact string in the orchestrator exit path; E2E test asserts grep-match.
- **Phase 4 `force-accept with user-typed justification + audit trail` pattern** is echoed by D-08 "Proceed with assumption" — same 20-char min justification + same audit-trail logging discipline.
- **No E2E with live researcher respawn in Phase 6 v1** — D-10 resume auto-detect is tested structurally (state-mock fixture asserts AskUserQuestion call with expected options) rather than wall-clock respawn. Live researcher respawn verification is deferred to Phase 9 HRD-01 cross-runtime smoke.
- **Provenance-tag discipline inherited** — gap-detector quantitative claims (if any) use the same `[VERIFIED|ASSUMED|FOUNDER-INPUT]` tag format from Phase 5 CC-04; the pre-commit hook `brief-validate-provenance.sh` applies unchanged.

</specifics>

<deferred>
## Deferred Ideas

- **MATERIAL gap interactive review** — D-03 ships MATERIAL as documentation-only. A follow-up v2 phase (CC-V2-02?) could add a `/brief-review-gaps` command that surfaces accumulated MATERIAL gaps for batch triage. Deferred: not in ROADMAP SC, adds command surface, solves a v2 problem.
- **NICE-TO-HAVE gap triage** — Deferred to v2 per D-03; gap-detector still classifies them but they are dropped (not even written to gap_queue) to keep v1 queue clean.
- **Multi-workstream parallel return-stacks** — v1 assumes single-workstream active at a time. v2 could support concurrent workstreams with per-workstream return-stacks keyed by `state.brief.active_workstreams[]`. Deferred: Phase 7 designer orchestration decides whether concurrent workstreams are in scope.
- **Return-stack visualization beyond /brief-status text** — no Mermaid diagram, no tree render. If Phase 9 HRD-03 adds a richer status dashboard, return-stack viz slots in.
- **Gap-detector cost control (sampling, cache)** — if Phase 7 designer workstreams produce artifacts faster than gap-detector can cost-effectively evaluate, add sampling or cache. Not a v1 concern.
- **Korean clause-level compliance gap detection** — gap-detector in v1 is general-purpose; Korean compliance-specific gap detection (PIPA Article-28 citations missing, ISMS-P control mapping missing) is a Phase 7 COMPLIANCE-checker concern, not Phase 6's.
- **Return-stack snapshot for session recovery** — if `/brief-resume-work` needs to render return-stack state at resume time, it already can via `state.brief.return_stack` (no extra work). Just noting the integration is free.

### Reviewed Todos (not folded)

None — no todos matched Phase 6 scope.

</deferred>

---

*Phase: 06-bidirectional-foundation-phase-1-2-return-stack*
*Context gathered: 2026-04-24*
