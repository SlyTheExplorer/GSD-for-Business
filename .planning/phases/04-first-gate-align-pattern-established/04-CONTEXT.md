# Phase 4: First Gate — ALIGN Pattern Established - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning
**Mode:** Delegated — user elected "가장 추천하는 방법으로 진행해줘" after seeing 4 gray-area selectors. All 4 areas auto-resolved to Claude's recommended option with rationale. User confirmation recorded before write.

<domain>
## Phase Boundary

Phase 4 ships the **ALIGN gate as the canonical evaluator-optimizer pattern** — the first of three cross-cutting gates. This pattern becomes the **template Phase 5 (AUDIENCE) and Phase 7 (COMPLIANCE) replicate**. Done right here, the downstream gates are copy-rename jobs; done wrong, the architecture ripples.

**What Phase 4 delivers:**

1. **`agents/brief-align-gate.md`** (NEW subagent file) — the evaluator-optimizer worker. Reads `OBJECTIVES.md` + candidate artifact; emits a structured verdict (one of three decisions) with findings.
2. **`brief/workflows/align-gate.md`** (NEW workflow markdown) — the orchestrator-side step that spawns the subagent, reads the verdict, routes DRIFTED paths. Invoked explicitly from orchestrator commands — **never as a hook**.
3. **`brief-tools.cjs align` subcommand** (NEW) — thin lib helper for atomic commit of `OBJECTIVES.md` + `ALIGN-00.md` + `STATE.md` (`state.brief.last_gate_results.align` write).
4. **Canary wiring into `/brief-define` Mode A wrap-up** — after OBJECTIVES.md draft is approved but before `/brief-define` exits, ALIGN runs as an **internal-coherence sanity check** on the drafted OBJECTIVES.md and emits `.planning/ALIGN-00.md`. DSG-12's "orchestrator command produces artifact → gate runs" acceptance is exercised here on real artifact (OBJECTIVES.md) by real orchestrator (`/brief-define`).
5. **Test fixtures** — `tests/brief-align-*.test.cjs` exercise all three decision paths with planted-contradiction fixtures; cover state-round-trip, vocabulary-lock (forbidden-word ban), and DRIFTED branching.

**What Phase 4 does NOT deliver (explicit non-goals):**

- **ALIGN on Phase 5 research artifacts** — Phase 5 is the first real *cross-artifact* caller (DISCOVER outputs vs OBJECTIVES.md). Phase 4 proves the pattern; Phase 5 is the first downstream adopter.
- **AUDIENCE guard / COMPLIANCE checker** — Phase 5 and Phase 7 territory. Phase 4 ships only the *template* they will copy.
- **New user-facing slash commands** — ALIGN is an orchestrator-internal step, not a user-invocable command (Phase 2 D-06 surface cap).
- **PostToolUse / SubagentStop hooks** — explicitly rejected by ROADMAP SC-3 and research Pattern 4 / Anti-pattern #2.
- **Binary pass/fail vocabulary** — explicitly rejected; 3-output or nothing.

**Why "canary" matters here:** Phase 4 is the FIRST gate. If the three-output vocabulary, findings-not-pass/fail discipline, and explicit-orchestrator-step contract hold end-to-end, Phase 5 and Phase 7 can replicate with confidence. If this wobbles, downstream gates must re-architect — HIGH flag if any vocabulary or invocation-pattern test fails in execution.

</domain>

<decisions>
## Implementation Decisions

### Area A1 — Gate Invocation Architecture

- **D-01: ALIGN gate = subagent file (`agents/brief-align-gate.md`) spawned via Task + thin `brief-tools.cjs align` helper for atomic state/file writes.**
  - **Subagent** does the reasoning: reads `.planning/OBJECTIVES.md` + candidate artifact, applies deterministic screen (D-02), emits a structured verdict JSON.
  - **Orchestrator workflow** (`brief/workflows/align-gate.md`) receives the verdict, handles DRIFTED routing per D-03, then calls `brief-tools.cjs align commit` to atomically write `ALIGN-00.md` + update `state.brief.last_gate_results.align` in STATE.md.
  - **Rationale:** Matches research Pattern 2 (evaluator-optimizer separates "produce" from "judge" — evaluator read-only, cannot mutate artifact) and Pattern 4 (gate invocation is visible in orchestrator markdown, not hidden in hooks). Phase 5/7 literally duplicate-and-rename `brief-align-gate.md` → `brief-audience-guard.md` / `brief-compliance-checker.md`.
  - **Non-goal:** A pure `brief-tools.cjs` deterministic subcommand (option considered and rejected) — Pitfall #4 theater risk: static rules alone become checkbox theater on nuanced drift. LLM reasoning is load-bearing for "is this artifact subtly contradicting the immutable intent?"

- **D-02: Subagent frontmatter and tool allowlist.**
  - `tools: Read, Grep, Glob, Write` — Write is used ONLY to emit the verdict JSON to a predefined location the workflow reads back. NOT for mutating the candidate artifact (read-only evaluator discipline).
  - Model selection follows existing `gsd-tools.cjs resolve-model` pattern (same as other agents).
  - Agent skills context block: required_reading = `.planning/OBJECTIVES.md`, `.planning/PROJECT.md`, the candidate artifact path, `brief/references/align-vocabulary.md` (NEW reference file, D-07).

### Area A2 — 3-Output Decision Mechanism

- **D-03: Hybrid — deterministic first-pass screen + LLM reasoning on ambiguous cases.**
  - **Deterministic screen** (fast, cheap, runs first):
    - Does the artifact reference any OBJECTIVES.md required field (business_model, region, audience_policy, compliance_packs, or any Immutable Intent bullet) at all? — if zero overlap, `DRIFTED-output` with severity `material`.
    - Does OBJECTIVES.md contain any required-field gaps flagged by `objectives.cjs` validator? — if yes, `DRIFTED-objective` with severity `blocking` (the objective itself is incomplete, so alignment is meaningless).
    - Any forbidden-vocabulary terms in the candidate artifact (e.g., "compliant ✅", unqualified "passed compliance check")? — flag as `material` finding regardless of main verdict.
  - **LLM reasoning pass** (only if deterministic screen yields no verdict):
    - Sub-agent prompt asks: "Does this artifact deliver on each Immutable Intent bullet? Does any Mutable Hypothesis contradict an Immutable Intent? If there is drift, is the artifact correct and the objective stale, or is the objective correct and the artifact off-target?"
    - Returns structured JSON: `{decision, severity, findings: [{severity, location, description}], rationale}`
  - **Verdict merge rule:** If deterministic screen emits any `blocking` finding, overall `severity = blocking`. Otherwise, LLM's severity applies. Decision is whichever of the two stages fires first (deterministic has precedence on the structural gaps; LLM has precedence on semantic alignment).
  - **Rationale:** Pure-deterministic = Pitfall #4 keyword theater. Pure-LLM = inconsistent verdicts + token waste on obvious gaps. Hybrid aligns with Anthropic's evaluator-optimizer guidance ("clear evaluation criteria exist" → deterministic where they do; LLM where they don't).

- **D-04: Severity vocabulary locked: `blocking / material / nice-to-have`.**
  - Matches Phase 6 `brief-gap-detector` vocabulary (forward consistency — Phase 6 can use the same severity parser).
  - `blocking` = must resolve before proceeding (renders DRIFTED path mandatory).
  - `material` = should resolve but does not halt the flow if user acknowledges.
  - `nice-to-have` = informational; never renders DRIFTED.
  - **Decision derivation:** any `blocking` finding → decision is `DRIFTED-*` (which sub-variant per D-03 rules). All findings `material` or lower → decision `ALIGNED` (artifact ships; findings appear in ALIGN-00.md for transparency but do not block).

- **D-05: Findings structure locked.** Each finding carries: `{severity, location, description}` where `location` is either a line reference in OBJECTIVES.md (for objective-side findings) or a line/section reference in the candidate artifact (for output-side findings). `description` uses findings vocabulary — e.g., "문서화된 의도 중 이 artifact에 반영되지 않은 항목: ..." / "Obligations needing further work: ..." — never "compliance violation", "failed", "missed ✗".

### Area A3 — DRIFTED Resolution Flow

- **D-06: DRIFTED = user interrupt with 3 explicit paths (Phase 3 D-13 stale-anchor pattern replicated).**
  - When verdict is `DRIFTED-objective-needs-update`, the orchestrator workflow displays the ALIGN-00.md findings and offers **3 explicit paths** (no bypass; user must choose):
    1. `objective 수정하기 (/brief-define --amend)` → launches amend workflow with the drifted fields pre-focused.
    2. `이 output이 틀렸다, 다시 쓰기` → reclassifies as `DRIFTED-output`; re-spawns the original worker (or offers manual edit in Phase 4 canary since the "worker" is the user-driven /brief-define flow itself).
    3. `현재 상태 승인, 계속 진행 (force-accept)` → records `decision: ALIGNED-by-override` in state; requires user-typed justification; produces an audit trail entry.
  - When verdict is `DRIFTED-output-needs-revision`:
    1. `output 다시 쓰기 (re-spawn worker)` → Phase 4 canary uses /brief-define re-entry; Phase 5+ re-spawns the relevant researcher/designer.
    2. `output을 수동으로 편집` → user edits file directly; on next /brief-status or next orchestrator step, ALIGN re-runs.
    3. `현재 상태 승인, 계속 진행 (force-accept)` → same as above.
  - **No auto-retry.** Pitfall #7 (infinite loop) mitigation — the cap is enforced by "no auto-retry at all", not by a retry-count. Phase 6 Bidirectional Foundation is where retry-with-meta-arbiter lives (DSG-11 territory); Phase 4's ALIGN is user-interrupt-only.
  - **Rationale:** Phase 3 D-13 users approved this exact 3-path pattern for stale-anchor. Reusing the same UX shape means zero new user-learning cost for a non-technical planner. Auto-retry at the gate layer risks re-generating artifacts the user already rejected (loop) AND hides the user's choice to "accept with caveat" (force-accept).

- **D-07: `force-accept` is load-bearing for UX but must leave an audit trail.**
  - On force-accept: state stores `{decision: "ALIGNED", override: true, override_reason: "<user-typed>", at: <ISO>}`. `ALIGN-00.md` report file includes a `## User Override` section with the reason verbatim.
  - `/brief-status` renders force-accepts distinctly (e.g., `⚠ Last ALIGN: ALIGNED (override applied)`) so downstream commands can surface "you accepted a drift — revisit?" at natural checkpoints.
  - **Rationale:** Without force-accept, users hit legitimate "I know what I'm doing" cases and either rage-quit the workflow or write ad-hoc bypasses. Without an audit trail, force-accepts silently accumulate and the anchor drift is exactly what Pitfall #3 warns about. Explicit, named, audited escape hatch is the balance.

### Area A4 — Canary Scope

- **D-08: Canary = wire ALIGN into `/brief-define` Mode A wrap-up as OBJECTIVES.md internal-coherence sanity check + test fixture suite.**
  - **User-visible canary:** After `/brief-define` Mode A produces the approved OBJECTIVES.md (Phase 3 D-11 wrap-up confirm step), the workflow invokes ALIGN with `candidate = OBJECTIVES.md, baseline = OBJECTIVES.md` (self-coherence mode). The gate checks:
    - Does every Immutable Intent bullet have at least one Mutable Hypothesis, config value, or Dream-State marker that operationalizes it?
    - Does any Mutable Hypothesis contradict an Immutable Intent (e.g., "target B2B enterprise" intent with "customer acquisition via App Store" hypothesis)?
    - Are required-field declarations (business_model, region, audience_policy, compliance_packs) consistent with the narrative intent?
  - Emits `.planning/ALIGN-00.md` per research line 487 precedent.
  - **Test-fixture canary:** `tests/brief-align-*.test.cjs` covers:
    - ALIGNED fixture (coherent OBJECTIVES.md) → verdict `ALIGNED`, zero findings at `blocking` severity.
    - DRIFTED-objective fixture (missing required field or internally contradictory) → verdict `DRIFTED-objective-needs-update`, findings list non-empty.
    - DRIFTED-output fixture (would-be downstream artifact that contradicts intent) → verdict `DRIFTED-output-needs-revision`.
    - Vocabulary-lock fixture: every emitted ALIGN-00.md is grep'd for `compliant|passed|✅|violation|failed` — test FAILS if any forbidden token appears.
    - State-write fixture: after an ALIGN run, `node brief-tools.cjs state json` round-trips `state.brief.last_gate_results.align` with deep-equal preservation (Phase 2 D-20 inheritance).
  - **Rationale:** Using OBJECTIVES.md as both candidate and baseline is a legitimate self-coherence check (not a degenerate tautology — the Immutable/Mutable layers provide the two sides to compare). Aligns with research line 487 "Phase 0 sanity-check". Zero new user-facing commands (Phase 2 D-06 compliance). Real artifact, real orchestrator, real test fixtures for the three decision paths.
  - **Phase 5 dependency:** Phase 5 `/brief-discover` is the FIRST cross-artifact caller — its parallel researchers produce RESEARCH.md files that ALIGN evaluates vs OBJECTIVES.md. Phase 4 ships the gate; Phase 5 is the first downstream adopter. This is explicitly documented so Phase 5's planner does not duplicate ALIGN work.

- **D-09: Canary exit criteria (what "the pattern is proven" means for Phase 4 acceptance).**
  - User runs `/brief-define` Mode A end-to-end; ALIGN runs automatically at wrap-up; ALIGN-00.md exists with a legitimate verdict; STATE.md shows `state.brief.last_gate_results.align` populated; `/brief-status` renders it.
  - All 5 test fixtures pass.
  - `agents/brief-align-gate.md` + `brief/workflows/align-gate.md` + `brief/bin/lib/align.cjs` (or extension of an existing lib) are each < ~400 lines (Phase 2 discipline).
  - No new top-level user-facing slash command added (surface cap check).

### Meta-Discipline

- **D-10: "적정선" lock inherited from Phase 3 D-08.** The 4 areas above were resolved at user-confirmed recommended options without re-opening follow-up gray areas. Planner, executor, verifier should resolve implementation-level unknowns (prompt wording, report section ordering, exact fixture payload content) themselves; return to CONTEXT discussion only if a gap surfaces that changes one of D-01..D-09.

### Claude's Discretion

The planner has flexibility on:

- **Exact prompt body of `agents/brief-align-gate.md`** — D-02/D-03 lock the inputs, outputs, and decision mechanism; the prose is planner's domain. Must be in English (as agent prompts are shared across locales); user-facing findings in ALIGN-00.md follow D-11 language rule (Korea-signal → Korean body, English headers may co-appear).
- **Internal structure of `brief/bin/lib/align.cjs`** (or extension of existing lib) — follow Phase 2 D-18 (workflow markdown + lib.cjs split) and Phase 2 discipline (< ~400 lines per file).
- **`brief-tools.cjs align` subcommand verb set** — planner picks: e.g., `align run <artifact>`, `align commit`, `align verdict`. At minimum one verb that atomically writes ALIGN-00.md + STATE.md. Coordinate with Phase 2 D-21 if a state allowlist extension is needed (the `last_gate_results` field is already in D-03 schema; should not require new allowlist entry).
- **Vocabulary ban-list exact token set** — D-05 names `compliant, passed, ✅, violation, failed` as starters. Planner can extend (e.g., `green check`, `compliance OK`) based on observed LLM output during agent prompt testing. Ship the list as a reference file or inline constant.
- **`ALIGN-00.md` layout within the `.planning/` directory** — current decision is `.planning/ALIGN-00.md` (research precedent). If Phase 5+ ALIGN runs conflict on the same filename, revise to `.planning/align/{orchestrator_run_id}-ALIGN.md` in Phase 5 — not a Phase 4 concern.
- **Whether `brief/workflows/align-gate.md` is called as an inline step or via `brief-tools.cjs` SDK shim** — either is acceptable as long as the orchestrator markdown (`commands/brief/define.md`) shows the invocation step explicitly (Pattern 4 visibility).
- **Test granularity** — 5 fixtures in one file (`tests/brief-align.test.cjs`) vs split (`tests/brief-align-aligned.test.cjs`, `tests/brief-align-drifted-objective.test.cjs`, etc.). Planner call; keep coverage at or above Phase 2's 70% threshold.
- **Exact 3-path Korean button wording** — D-06 locks semantics; the actual prompt strings follow Phase 3 D-12 tone (recovery-oriented, concrete, never blame). Planner can iterate with user during execution if wording feels off.

- **D-11: Language rule for ALIGN-00.md output.**
  - If Korea signals detected on config.json (`brief.region: kr` OR Korean present in OBJECTIVES.md body) → ALIGN-00.md body in Korean; section headers may be bilingual (e.g., `## Findings / 발견사항`).
  - Otherwise → English body.
  - Findings vocabulary discipline applies in both languages — planner writes both Korean and English ban-list variants.
  - Mirrors Phase 3 D-11 Korea-signal defaults policy.

### Folded Todos

(No todos matched Phase 4 scope — `brief-tools.cjs todo match-phase 4` returned 0 results.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level decisions and requirements
- `.planning/PROJECT.md` — "Continuous ALIGN at every milestone" key decision; "non-technical planner UX" constraint; Korea-first scope.
- `.planning/REQUIREMENTS.md` §Phase 2 (DESIGN) — **DSG-12** (the single Phase 4 requirement): ALIGN gate emits three outputs (ALIGNED, DRIFTED-objective, DRIFTED-output). Phase 4 acceptance traces directly to this.
- `.planning/ROADMAP.md` lines 95–107 — Phase 4 goal + 4 success criteria + Pitfall coverage (#3 anchor drift, #4 compliance theater, Anti-pattern #2 gate-as-orchestrator-step).
- `.planning/ASSUMPTIONS.md` — A1 VERIFIED (zero runtime deps — ALIGN must NOT add `ajv` / `gray-matter` / `js-yaml`); A4 VERIFIED (state round-trip works — safe to write `state.brief.last_gate_results.align`).

### Prior-phase context (locked decisions Phase 4 inherits)
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md` — Phase 1 D-05 (aggressive rename discipline — no `gsd-align-*` residues), D-07 (no aliases), D-09 (atomic buildable commits).
- `.planning/phases/02-stable-seam-anchor-schema-caps-workstream-as-config/02-CONTEXT.md` — Phase 2 **D-03** (forward-declared `state.brief.last_gate_results.align` schema — Phase 4 is first writer), **D-06–D-09** (Surface Caps — Phase 4 must not add user-facing commands), **D-18** (workflow markdown + lib.cjs split pattern; < ~400 lines discipline), **D-20/D-21** (frontmatter.cjs serializer + state allowlist extensions — Phase 4 writes rely on these).
- `.planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md` — Phase 3 **D-08** ("적정선" lock discipline; carries into Phase 4 D-10), **D-11** (Korea-signal detection for compliance_packs; carries into Phase 4 D-11 language rule), **D-12** (block-style error tone — recovery-oriented, Korean, concrete — Phase 4 D-06 inherits this tone), **D-13** (stale-anchor 3-path interrupt pattern — Phase 4 D-06 replicates exact UX shape).

### Research synthesis (Phase 4-specific)
- `.planning/research/ARCHITECTURE.md` §Pattern 2 (Evaluator-Optimizer) — **canonical pattern Phase 4 implements**. Line 283–306.
- `.planning/research/ARCHITECTURE.md` §Pattern 4 (Cross-Cutting Gate Auto-Attach via Orchestrator, NOT Hooks) — **load-bearing architectural decision**. Line 333–359. Phase 4 MUST follow this: no PostToolUse / SubagentStop hook.
- `.planning/research/ARCHITECTURE.md` line 487 — Phase 0 sanity-check precedent for `ALIGN-00.md` emission. **D-08 canary design follows this line exactly.**
- `.planning/research/PITFALLS.md` §Pitfall #3 (OBJECTIVES.md Anchor Drift) — mandates three-output decision (not pass/fail); D-04/D-05 findings vocabulary + three-output mechanism are direct responses.
- `.planning/research/PITFALLS.md` §Pitfall #4 (Compliance Checkbox Theater) — mandates findings-not-checks vocabulary even at v0.x; the forbidden-vocabulary ban in D-05 + the vocabulary-lock test fixture in D-08 are direct responses.
- `.planning/research/PITFALLS.md` §Anti-pattern #2 (Hook-spawned gates) — reinforces ROADMAP SC-3. Phase 4 MUST implement as orchestrator-visible step.

### External inspiration (patterns, not dependencies)
- **Anthropic Building Effective Agents** — evaluator-optimizer pattern definition; cited in ARCHITECTURE.md line 287. Phase 4 subagent design (separation of "produce" from "judge", read-only evaluator) follows this directly.
  - NOT a runtime dependency — absorbed as pattern.

### Files Phase 4 will create or modify
- `agents/brief-align-gate.md` — **NEW** subagent file (D-01, D-02). Tool allowlist: `Read, Grep, Glob, Write`. Prompt: read OBJECTIVES.md + candidate artifact, apply deterministic screen per D-03, emit structured verdict JSON.
- `brief/workflows/align-gate.md` — **NEW** orchestrator-side workflow markdown. Spawns the subagent, reads verdict, handles DRIFTED routing per D-06. Called explicitly from orchestrator commands (Pattern 4 visibility).
- `brief/bin/lib/align.cjs` (or extension of existing lib) — **NEW** logic helper for atomic state/file write. `brief-tools.cjs align <verb>` dispatcher lines up here.
- `brief/references/align-vocabulary.md` — **NEW** reference file with:
  - Korean findings vocabulary (e.g., "문서화된 의도 중 반영된 것 / 추가 작업이 필요한 것").
  - English findings vocabulary (e.g., "Documented obligations addressed / Obligations needing further work").
  - Forbidden vocabulary ban-list (`compliant`, `passed`, `✅`, `violation`, `failed` and Korean equivalents).
- `commands/brief/define.md` — **MODIFIED**: add explicit ALIGN invocation step at Mode A wrap-up (after OBJECTIVES.md approval, before `/brief-define` exits).
- `brief/workflows/define.md` — **MODIFIED**: matching Mode A wrap-up step that invokes the ALIGN workflow.
- `brief/bin/brief-tools.cjs` — **MODIFIED**: register `align` subcommand (dispatches to align.cjs).
- `bin/install.js` — **NO CHANGE** (no new user-facing command registered; ALIGN is orchestrator-internal).
- `.planning/STATE.md` — **WRITTEN BY ALIGN RUNS**: `state.brief.last_gate_results.align = {decision, severity, findings_count, at, override?, override_reason?}`.
- `.planning/ALIGN-00.md` — **CREATED BY ALIGN CANARY RUN** (per /brief-define Mode A wrap-up).
- `tests/brief-align.test.cjs` (or split suite) — **NEW** 5 fixtures per D-08.

### Inherited primitives Phase 4 must NOT break
- STATE.md file lock (atomic commits) — ALIGN commit writes OBJECTIVES.md + ALIGN-00.md + STATE.md atomically in one `brief-tools.cjs commit` call.
- Multi-runtime detection — `/brief-define` Mode A wrap-up ALIGN step MUST work in Claude Code, Codex, Gemini, OpenCode. The 3-path interrupt (D-06) maps to AskUserQuestion (Claude Code) or numbered-list text mode (other runtimes) — Phase 1 FND-06 + Phase 3 code_context pattern.
- `node:test` + c8 70% line threshold.
- Zero runtime dependencies rule (A1).
- CLAUDE.md Surface Caps — Phase 4 net command additions MUST be 0.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`brief/bin/lib/state.cjs`** (Phase 2 D-20/D-21) — `buildStateFrontmatter` preserves `brief:` map; `state.brief.last_gate_results.align` writes via existing `state json` round-trip. No state-schema change needed.
- **`brief/bin/lib/frontmatter.cjs`** (Phase 2 D-20) — round-trips nested maps and null fields. ALIGN-00.md frontmatter (metadata headers: verdict, severity, findings_count, at) plugs into the existing serializer without extension.
- **`brief/bin/lib/status.cjs:95`** (Phase 2 D-18) — already reads `brief.last_gate_results.align` and formats via `formatGate(...)`. ALIGN writes will surface in `/brief-status` without code changes. Verify during execution that `formatGate` handles the new `override` flag (D-07) — if not, extend `formatGate`, not `status.cjs`'s main flow.
- **`brief/bin/lib/objectives.cjs`** (Phase 3) — reader for OBJECTIVES.md. ALIGN's deterministic screen (D-03) uses `objectives.cjs` validator to check required-field completeness before LLM pass.
- **`brief/bin/brief-tools.cjs`** — SDK shim pattern. Register `align` as a new top-level subcommand (dispatching to `brief/bin/lib/align.cjs`).
- **Task agent spawn pattern** — existing agents in `agents/` (e.g., `brief-phase-researcher`, `brief-planner`) show the subagent-file-with-Task-spawn invocation pattern. `brief-align-gate.md` follows the exact same frontmatter shape + SKILL-style prompt structure.

### Established Patterns
- **Workflow markdown + lib.cjs split** (Phase 2 D-18) — `brief/workflows/align-gate.md` + `brief/bin/lib/align.cjs`. Each < ~400 lines.
- **Agent file + workflow file + lib file triad** (existing pattern across agents/) — `agents/brief-align-gate.md` (Task-spawned worker) + `brief/workflows/align-gate.md` (orchestrator step) + `brief/bin/lib/align.cjs` (state/file lib helper). Three separate concerns, three files.
- **Init-JSON consumption** (Phase 2/3) — ALIGN workflow can use `brief-tools.cjs init align-op` or reuse `init phase-op` for context. Planner decides; new op only if context shape is materially different.
- **Atomic commit per logical step** (Phase 1 D-09) — Phase 4 commits roughly: (1) subagent markdown + workflow + lib skeleton with test, (2) deterministic-screen logic + fixtures, (3) LLM-reasoning prompt + fixtures, (4) DRIFTED routing + 3-path UX, (5) /brief-define Mode A wiring, (6) vocabulary-lock test + reference file.
- **Fixture-based tests with Korean-first persona** (Phase 3 D-08 precedent) — Phase 4 tests should use a Korean-first B2C fixture as the baseline OBJECTIVES.md, plus a Korean-first fintech variant to exercise the Korea-signal → Korean ALIGN-00.md branch (D-11).
- **`text_mode` fallback** (Phase 1 FND-06) — 3-path interrupt renders as AskUserQuestion in Claude Code, numbered-list in text_mode. ALIGN workflow's prompt strings must be equivalent across both.

### Integration Points
- **`commands/brief/define.md`** — add explicit ALIGN step at Mode A wrap-up, per Pattern 4 visibility (gate invocation readable in command markdown).
- **`brief/workflows/define.md`** — matching wrap-up step.
- **`brief-tools.cjs align`** — new subcommand; registers via the existing dispatch table.
- **`brief/references/align-vocabulary.md`** — new reference file; loaded as required_reading by `brief-align-gate.md` subagent.

### Risk Notes
- **LLM-reasoning pass is the biggest variance source.** The hybrid design (D-03) keeps the deterministic screen as ground truth when it fires, but the LLM pass on ambiguous cases can produce inconsistent verdicts run-to-run. Mitigation: pin verdict format via structured-output schema (JSON), include a "rationale" field that surfaces the LLM's reasoning for user review, and test-fixture assertions should cover the rationale structure, not the verbatim prose. If inconsistency bites during execution, escalate as a Phase 4 amendment (not a full planning reopen).
- **`force-accept` override pattern (D-07) is load-bearing for non-developer UX but dangerous if used casually.** Planner must ensure the user-typed justification is REQUIRED (not optional) and the `/brief-status` surface renders the override flag distinctly. If a user force-accepts twice on the same artifact without resolving, Phase 5+ should surface a "recurring override" warning — NOT a Phase 4 concern but flag it in SUMMARY.md for Phase 5 planner awareness.
- **`ALIGN-00.md` filename assumes single-caller-per-project.** In Phase 4 canary, there's only one ALIGN run (the /brief-define wrap-up). When Phase 5 adds multiple callers, revisit to `.planning/align/{run_id}-ALIGN.md` — flag in Phase 5 planner's inputs.
- **Vocabulary ban-list is a moving target.** LLMs have creative ways to say "passed" without the word "passed" (e.g., "aligned properly", "meets expectations ✓", "all clear"). Planner should spend test-fixture time grepping ACTUAL LLM outputs during execution and extend the ban-list iteratively. The test fixture should assert ban-list compliance, but planner should treat ban-list maintenance as an execution-time activity, not a one-shot configure.
- **No new user-facing command is a HARD CONSTRAINT.** If the planner finds themselves wanting to add `/brief-align-run` or `/brief-realign`, that's a sign the design is drifting. ALIGN must remain orchestrator-internal in Phase 4. A user-visible `/brief-realign` command is explicitly deferred below.

</code_context>

<specifics>
## Specific Ideas

- **User elected "가장 추천하는 방법으로 진행" mode.** This is equivalent to Phase 3 D-08 "적정선" lock — user trusts the analysis and asks for recommendation-driven decisions without per-area deep-dive. The 4 decisions above are all Claude's recommendations with rationale documented. **The planner MUST NOT treat these as provisional** — the user saw the recommendation table and explicitly confirmed. They are locked decisions, not tentative defaults.
- **Phase 4 is the architectural template for two subsequent phases.** Phase 5 AUDIENCE guard and Phase 7 COMPLIANCE checker replicate this pattern by duplicate-and-rename of `brief-align-gate.md` → `brief-audience-guard.md` / `brief-compliance-checker.md`. If Phase 4 planner makes an "odd" choice (e.g., hardcoded OBJECTIVES.md path, ALIGN-specific state field), Phase 5/7 will either inherit the oddity or have to re-architect. **Favor generic, template-friendly patterns over Phase-4-specific optimizations.**
- **The three-output vocabulary is a contract with the user, not just an implementation detail.** When the ALIGN-00.md report says `DRIFTED-objective-needs-update`, the user should see the 3-path interrupt. When it says `ALIGNED`, they should see `/brief-define` exit cleanly. If the implementation ever collapses to 2 outputs (e.g., by treating `ALIGNED-by-override` as `ALIGNED`), the Pitfall #3 anchor drift mitigation breaks. **Keep `ALIGNED-by-override` visibly distinct from `ALIGNED`** in the state field, the ALIGN-00.md report, and the /brief-status render.
- **The vocabulary-lock test (D-05/D-08) is not decoration — it is load-bearing.** Pitfall #4's central risk is that compliance/alignment outputs look like green checkmarks and users learn to ignore them. If a single test run emits "compliant ✅" in ALIGN-00.md, the pitfall has already manifested. The test fixture MUST fail the build if any forbidden token surfaces. Planner should include a "vocabulary audit" step in the Phase 4 execution plan that runs the forbidden-word grep on all ALIGN-related files (prompt, references, test outputs).
- **/brief-define Mode A is the FACE of the canary.** The user's first encounter with ALIGN is when they finish /brief-define and the workflow says "점검 중... ALIGN 결과: [verdict]". If that moment feels foreign or interrogative, Phase 5/7 replication produces the same foreign/interrogative moment. **Planner should mirror the Phase 3 D-01/D-02 conversational tone** — explanatory, not accusatory, recovery-oriented. The 3-path interrupt (D-06) uses the exact Phase 3 D-13 button wording shape the user already approved.
- **`.planning/ALIGN-00.md` is a first-class artifact, not a log file.** It is read by the user when DRIFTED happens; it is linked from /brief-status; it may be referenced in Phase 5 DISCOVER for provenance. Treat it as product, not debug output.

</specifics>

<deferred>
## Deferred Ideas

(Items that came up during this discussion but belong in other Phases — captured here so they're not lost.)

- **`/brief-realign` user-facing command** — came up as an intuitive "re-run ALIGN on demand" affordance but explicitly rejected for Phase 4 (surface cap + "ALIGN is orchestrator-internal" design). Revisit in Phase 9 HRD-02 audit: if pilot reveals users wanting on-demand re-alignment, add as a v1.x feature.
- **Cross-artifact ALIGN on Phase 5 research outputs** — Phase 5 is the first downstream caller; Phase 4 does NOT test cross-artifact ALIGN. Phase 5 planner is the one to design how multiple research artifacts get ALIGN'd together (batch-mode? per-artifact? digest?).
- **Multi-orchestrator run-id disambiguation for `ALIGN-*.md` filenames** — Phase 4 uses `.planning/ALIGN-00.md` (single canary run). Phase 5+ will have multiple callers per project; revisit filename scheme then (suggested: `.planning/align/{orchestrator}-{run_id}-ALIGN.md`).
- **Phase 6 Bidirectional Foundation auto-retry integration** — Phase 6's `brief-gap-detector` + meta-arbiter flow handles retry semantics. Phase 4's "no auto-retry at gate layer" (D-06) is intentionally narrow so Phase 6 can layer retry on top without fighting Phase 4's user-interrupt design.
- **Vocabulary ban-list expansion based on pilot data** — Phase 4 ships an initial ban-list; Phase 9 HRD-04 pilot will surface real-world LLM creative-avoidance tokens. Add "vocabulary ban-list refresh" to Phase 9 HRD audit.
- **ALIGN prompt localization beyond Korean/English** — Phase 4 D-11 ships Korean + English. Non-KR non-EN locales deferred to v1.x if pilot surfaces non-bilingual planners.
- **Structured-output schema (JSON) versioning** — D-03 LLM pass emits structured JSON. If schema evolves (e.g., add `confidence` field in v1.x), need a versioning strategy. Defer to v1.1; Phase 4 ships v1.
- **ALIGN → STATE.md commit race-condition audit** — if ALIGN runs concurrently with another workflow (theoretically impossible per STATE.md file lock, but worth auditing during Phase 4 execution). Flag to verifier.
- **Reviewed Todos (not folded)** — no Phase 4-matching todos were surfaced (0 matches from `todo match-phase 4`).

</deferred>

---

*Phase: 04-first-gate-align-pattern-established*
*Context gathered: 2026-04-20*
*Discussion mode: Delegated — 4 gray areas presented; user elected "가장 추천하는 방법으로 진행" after seeing table of recommendations. 11 decisions (D-01..D-11) + 1 meta-discipline carry-forward (D-10). No gray area re-opened.*
