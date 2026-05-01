# Roadmap: BRIEF — Business Research, Insight & Execution Framework

## Overview

BRIEF is built as a hard fork of GSD, transformed in-place into a meta-prompting framework for business and product strategy planning. The roadmap follows a strict outside-in dependency order: foundation hygiene before any feature work; the OBJECTIVES.md anchor (Phase 0 DEFINE) before any other runtime phase that reads it; the first cross-cutting gate (ALIGN) proven on a small surface before AUDIENCE/COMPLIANCE replicate the pattern; the bidirectional Phase 1↔2 return-stack built before designers exist so designers are written aware of it from day one; full DELIVER (Type A + Type B + Marp + audience enforcement) only after Phase 2 designers produce real artifacts to render; cross-runtime smoke testing and external pilot last because they require a feature-complete system. Every phase ships code+template+reference artifacts to the existing GSD codebase.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation — Fork Hygiene, Removal, Rename** - Backup branch, dev-surface removal, hard rename, multi-runtime preservation, A1 (zero-deps) verification (10/10 plans executed; HALT-ACCEPTED 2026-04-18 after 4 gap-closure cycles; 288 tests recovered 83.5%; 63 residual source/doc drift deferred to Phase 9 per 01-VERIFICATION.md `deferred[2]` + 10-PARTIAL-AUDIT.md §4)
- [x] **Phase 2: Stable Seam — Anchor Schema, Caps, Workstream-as-Config** - A4 verification (state.brief.* round-trip), workstream-spec.yaml architecture, CLAUDE.md command/skill caps, /brief-status skeleton (completed 2026-04-19)
- [ ] **Phase 3: DEFINE Canary — Phase 0 End-to-End** - Conversational intent extractor, Dream State Mapping, OBJECTIVES.md with mutability layers, business_model/region declaration
- [ ] **Phase 4: First Gate — ALIGN Pattern Established** - Three-output ALIGN gate (ALIGNED / DRIFTED-objective / DRIFTED-output), findings-not-checks vocabulary, gate-as-orchestrator-step (not hook)
- [ ] **Phase 5: DISCOVER — Parallel Research with Provenance + AUDIENCE + Context Injection** - 9 default research categories, parallel cap of 4, provenance tags mandatory, AUDIENCE guard first wired, B2B/B2C context injector live, Korea reference library skeleton, provenance pre-commit enforcer
- [ ] **Phase 6: Bidirectional Foundation — Phase 1↔2 Return Stack** - state.brief.return_stack with 3-deep cap, gap-detector, gap criticality classification, meta-arbiter at iteration 2, return-stack visibility in /brief-status
- [x] **Phase 7: DESIGN — Workstream Orchestration + COMPLIANCE Checker** - 9 built-in workstreams (BMC, GTM, FINANCIAL, OPERATIONS, COMPLIANCE, ROADMAP, BRAND, RISK, TECH-ARCH), /brief-add-workstream, COMPLIANCE checker on every artifact (clause-level findings + legal-counsel disclaimer) — **Complete** (2026-04-26; 8/8 plans across 5 waves; 15/15 must-haves verified; 225/225 Phase 7 tests pass; canonical gate fourth instance with LOAD-BEARING DEVIATION on FINDINGS-MATERIAL; NET +2 commands; Korea PIPA CEO-liability disclaimer byte-identity locked)
- [x] **Phase 8: DELIVER — Type A + Type B + AUDIENCE Enforcement + Marp** - Type A artifacts (PRD inputs), Type B Marp decks via npx, audience encoded in filename + watermark, mandatory /brief-export step, frontmatter pre-commit hook — **Complete** (2026-04-26; DLV-01..09 + CC-03 delivered; 8/8 plans across 4 waves; 15/15 must-haves verified; 118/118 Phase 8 tests pass; 4-layer audience defense (filename + Marp directive footer + literal Cover-slide watermark + CC-03 pre-commit hook) wired end-to-end; Type A 4 artifacts auto-synthesized from 9 workstreams + OBJECTIVES; Type B parameterized agent generates 4 deck/document templates; Marp via npx --yes @marp-team/marp-cli@4.3.1 (zero runtime deps); /brief-deliver + /brief-export NET +2 commands; force-accept routes through Phase 4 D-07 audit trail substrate (first live use); Korean honorific + ko/en branching + banned-words self-check inlined in Type B agent; 7 code-review findings fixed (2 BLOCKER + 5 WARNING) — 8 templates restructured to nested YAML + watermark substitution wired in workflows)
- [ ] **Phase 9: Hardening — Cross-Runtime Smoke + Non-Developer Pilot** - Cross-runtime smoke test (Claude/Codex/Gemini/OpenCode), surface count audit (≤12 commands + ≤8 skills), rich /brief-help, 3-planner non-developer pilot

## Phase Details

### Phase 1: Foundation — Fork Hygiene, Removal, Rename
**Goal**: BRIEF presents itself as a clean fork: GSD-development surfaces are gone, all identifiers are renamed `brief-*`, multi-runtime detection still works, and the zero-runtime-deps property is verified before any new code is written.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-06, FND-07
**Success Criteria** (what must be TRUE):
  1. User runs `git branch` and sees `backup/original-gsd` exists as one-command rollback target (FND-01)
  2. User runs `/brief-` autocomplete and sees no `gsd-code-review`, `gsd-ui-phase`, `gsd-ai-integration-phase`, `gsd-add-tests`, `gsd-secure-phase` (or any of the 28 development-specific files) — they have been removed from `commands/`, `agents/`, `hooks/` (FND-02)
  3. User invokes `/brief-define` (or any `brief-*` command) and it works; invoking the corresponding `gsd-*` form returns "command not found" — confirming hard rename, no aliases (FND-03)
  4. User opens `package.json`, runs the documented inspection step, and confirms `dependencies` field is empty (only `devDependencies` exist) — Assumption A1 verified and recorded in `.planning/ASSUMPTIONS.md` (FND-04)
  5. User runs the same `/brief-status` invocation across Claude Code, OpenAI Codex, Gemini CLI, and OpenCode and gets equivalent output (text_mode fallback active where AskUserQuestion is unavailable) (FND-06)
  6. User opens `CLAUDE.md` and `README.md` and reads business-planning-domain language ("business planner", "OBJECTIVES.md", "workstreams", "audience") with no references to "code review", "TDD", "deployment", or "security audit" (FND-07)
**Plans**: 10 plans (6 original + 4 gap-closure: Plan 07 path-substring, Plan 08 hook-rename propagation, Plan 09 test-side bulk rewrite, Plan 10 test-runner-driven residual)
- [ ] 01-PLAN.md — Create backup/original-gsd branch (FND-01)
- [ ] 02-PLAN.md — Drop GSD development surfaces, ~38–45 file removals (FND-02)
- [ ] 03-PLAN.md — Rename brief-* prefix for commands, agents, hooks, tests (FND-03 part 1)
- [ ] 04-PLAN.md — Rename get-shit-done/ → brief/ directory + gsd-tools.cjs → brief-tools.cjs + package.json to brief-cc (FND-03 part 2)
- [ ] 05-PLAN.md — Update internal text references to BRIEF terminology across .md/.cjs/.js (FND-03 part 3)
- [ ] 06-PLAN.md — CLAUDE.md + README.md targeted delta; A1 + FND-06 + FND-07 verified in ASSUMPTIONS.md (FND-04, FND-06, FND-07)
- [x] 07-PLAN.md — GAP CLOSURE (path-substring scope, SHA b1ec9f6): commands/gsd residue 45→10 files (bin/install.js 13 SRC tuples rewritten; init.cjs dual-root; 41 files edited) + npm test baseline re-captured via `grep -cE '^✖'`. Task 4 delta-cap gate HALTed — upstream hook-rename regression (scripts/build-hooks.js + bin/install.js hook refs + worktree test assertions) deferred to Plan 08 (FND-03 partial closure).
- [x] 08-PLAN.md — GAP CLOSURE (hook-rename propagation, SHAs 19fcaa2 + 8f3eb9e): scripts/build-hooks.js HOOKS_TO_COPY 10→11 brief-* entries; bin/install.js 100+ P-A/P-B/P-C/P-D rewrites (copy-helper prefixes, PATCHES_DIR_NAME, MANIFEST_NAME, cache path, user-visible $gsd-*, /gsd:/ normalizers, dual-prefix startsWith/includes for uninstall+manifest); hooks/dist/ populated with 11 brief-* files; worktree 7/7 + workspace 25/25 tests recovered. Task 6 delta-cap gate HALTed (POST=351 vs cap=16) — 100% categorized as out-of-scope pre-Phase-1 test-side regressions, deferred to Plan 09 per 08-GAP-CLOSURE-PARTIAL-AUDIT.md §7 Option A (FND-03 source-side closure).
- [~] 09-PLAN.md — GAP CLOSURE (test-side bulk rewrite, PARTIAL HALT at Task 7): Plan 09's enumerated 31-file scope delivered cleanly — 27 T-A bulk-sed rewritten (commits 492751c/1456e0d/8c14f74), 1 T-D per-line split (c3602ac), 3 T-B preserved (ab9a776). 135 tests recovered (PRE npm-test fail 351 → POST 216). Final audit 1871fd5. HALT reason: planner-enumeration defect — substring grep missed tuple-form `path.join('commands', 'gsd')` (~36 files) + `name: gsd:<cmd>` frontmatter assertions (~16 files). 216 residual failures out-of-scope for Plan 09's 31-file enumeration. Recommends Plan 10 for ~40 additional files (Option 1 per 09-GAP-CLOSURE-PARTIAL-AUDIT.md §7); Phase 1 FND-03 closure NOT yet verified.
- [~] 10-PLAN — GAP CLOSURE (test-runner-driven Option B, PARTIAL HALT at cycle 6): orchestrator-decision single-executor closure bypasses Plan 09's substring-grep enumeration defect. 48 test files touched across 6 atomic cluster commits (ee719c6 tuple-form T-A 31 files; 6190fc4 .startsWith filter T-A 3 files; ab83010 install-output filter T-A 4 files; 0d1ebf4 variable-rename cleanup 2 files; ec055c9 conversion-fixture spec alignment 5 files; 1498af8 skill-manifest prefix 3 files). 153 tests recovered (PRE 216 → POST 63, 70.8% drop). Cycles: 216→117→117→105→101→76→63 (monotonically decreasing after cycle 2, zero regressions). Scope guard PASS (zero source-side hunks; git diff vs 89cea18 shows only Plan 08's 19fcaa2). HALT reason: remaining 63 failures are all source-side drift (19 missing-file: pr-branch.md/diagnose-issues.md/ui-brand.md; 14 doc-drift: docs/ARCHITECTURE.md counts; 30 source-behavior: MANAGED_HOOKS/CONV-07/custom-detection/read-guard; 13 source-content: agents required_reading + commands/brief/*.md frontmatter). Plan 10's zero-source-change constraint forbids touching these. Recommends Plan 11 source-side closure (4-6h, ~55-test recovery expected) OR HALT-ACCEPTED + Phase 9 deferral per 10-PARTIAL-AUDIT.md §7.

**Pitfall coverage**: #2 Cross-runtime fragility (FND-06 verifies LCD surface), #8 Fork drift (FND-01 + FND-03 design the layered seam BEFORE rename — single-purpose rename commit), #1 Skill bloat (FND-02 removal of 28 dev surfaces creates headroom under future caps).

### Phase 2: Stable Seam — Anchor Schema, Caps, Workstream-as-Config
**Goal**: The architectural seams that every later phase depends on are in place: STATE.md round-trips namespaced `brief.*` fields without loss, workstreams are defined as YAML config (not bespoke code), CLAUDE.md enforces hard caps on commands and skills before any feature is added, and `/brief-status` reports basic position information.
**Depends on**: Phase 1
**Requirements**: FND-05, FND-08, FND-09, FND-10
**Success Criteria** (what must be TRUE):
  1. User runs the documented smoke test in `tests/` and sees that `state.cjs` round-trips a `state.brief.return_stack` (or any `state.brief.*` field) without dropping or mangling it — Assumption A4 verified and recorded in `.planning/ASSUMPTIONS.md` with the resolved approach (FND-05)
  2. User declares a new built-in workstream by writing one `workstream-spec.yaml` file (with name, description, research-prompts, design-prompts, output-artifact-template) and the framework picks it up without any `.cjs` source change (FND-08)
  3. User opens CLAUDE.md and reads explicit caps: ≤12 user-facing slash commands, ≤8 skills, with rationale; the cap is enforced before any feature work is added in subsequent phases (FND-09)
  4. User runs `/brief-status` and gets a one-screen summary showing current phase, active workstream (none yet — placeholder OK at this phase), return-stack depth (0), last ALIGN finding (none yet), last COMPLIANCE finding (none yet) — the schema is in place even if values are placeholder (FND-10)
**Plans**: 6 plans
- [x] 02-01-PLAN.md — Extend frontmatter.cjs recursive serializer for D-20 (nested maps, arrays-of-objects, null) + tests/frontmatter-roundtrip.test.cjs (FND-05 prerequisite)
- [x] 02-02-PLAN.md — Add ## Surface Caps section to CLAUDE.md with regeneration guard (FND-09)
- [x] 02-03-PLAN.md — Atomic D-04 rename gsd_state_version → brief_state_version across state.cjs + STATE.md + 5 test-assertion lines (FND-05)
- [x] 02-04-PLAN.md — State.brief.* schema: D-21 allowlist extension + STATE.md brief: map initialization + A4 smoke test + ASSUMPTIONS.md VERIFIED entry (FND-05)
- [x] 02-05-PLAN.md — Workstream-as-YAML loader: yaml-mini.cjs + workstream-loader.cjs + brief/workstreams/_example/ fixture + discovery + validation tests (FND-08)
- [x] 02-06-PLAN.md — /brief-status compact-dashboard renderer + commands/brief/status.md + brief-tools.cjs case 'status' (FND-10)

**Pitfall coverage**: #13 Framework specialization lock-in (FND-08 workstream-as-yaml committed UP-FRONT, before any built-in workstream is written), #1 Skill/command bloat (FND-09 caps in CLAUDE.md before commands proliferate), #8 Fork drift (FND-05 namespaced extension preserves stable seam).

### Phase 3: DEFINE Canary — Phase 0 End-to-End
**Goal**: A business planner runs `/brief-define` from a fuzzy idea, is guided through Push Twice + Language Precision and Dream State Mapping conversational extraction, and obtains a per-workstream OBJECTIVES.md with explicit immutable-intent vs mutable-hypothesis layers — including business_model, region, audience policy, and compliance_packs declarations written to config.json. Phase 0 is the canary that proves the orchestrator-workers pattern + context injection work end-to-end on a small surface.
**Depends on**: Phase 2
**Requirements**: DEF-01, DEF-02, DEF-03, DEF-04, DEF-05, DEF-06
**Success Criteria** (what must be TRUE):
  1. User runs `/brief-define` and is guided through conversational intent extraction that visibly applies Push Twice (real answer surfaces after 2nd or 3rd push) and Language Precision (vague terms forced to be defined) — gstack `office-hours` patterns adapted to internal-clarification (NOT founder-validation) mode (DEF-01)
  2. User completes Dream State Mapping (current state → 3-month state → 12-month state) as a structured part of `/brief-define` and the three states are visibly written to the OBJECTIVES.md output (DEF-02)
  3. User obtains a per-workstream `OBJECTIVES.md` derived from PROJECT.md, containing two clearly-marked sections: `## Immutable Intent` (the dream-state, locked) and `## Mutable Hypotheses` (current best guess at how to achieve it, drift allowed) (DEF-03)
  4. User declares `business_model` (b2b / b2c / b2b2c / enterprise), `region` (kr / us / eu / ...), `audience policy` defaults, and `compliance_packs` list as part of `/brief-define` and these are written to `.planning/config.json` under the `brief.*` namespace, ready for context injection (DEF-04)
  5. User attempts to advance to `/brief-discover` with an OBJECTIVES.md missing required fields and is BLOCKED with a structured error listing the missing fields (block-style, not warning) (DEF-05)
  6. User attempts to start a new milestone and OBJECTIVES.md was last amended >48h ago: a stale-anchor warning is surfaced before any new work begins (DEF-06)
**Plans**: 6 plans
- [x] 03-01-objectives-foundation-PLAN.md — objectives.cjs primitives (write/read/validate/lock/stale-anchor) + D-20 frontmatter round-trip test + immutable-lock test + canonical Korea-first B2C fixture (DEF-03)
- [x] 03-02-define-mode-a-greenfield-PLAN.md — commands/brief/define.md + brief/workflows/define.md (Mode A prompt orchestration with TEXT_MODE fallback) + brief/bin/lib/define.cjs (fixture-aware flow controller) + brief-tools.cjs dispatcher + Mode A smoke Cycle 1 + docs/ARCHITECTURE.md count bumps (DEF-01, DEF-02)
- [x] 03-03-define-mode-b-amendment-PLAN.md — Mode B amendment branch (Section Picker with 🔒 markers, D-07 footer verbatim) + applyModeBAmendment lib + --unlock-intent audit-log + Mode B immutable-lock integration test (DEF-03)
- [x] 03-04-config-korea-atomic-commit-PLAN.md — Korea-signal detection (Hangul + English keywords + company names) + config.json brief.* namespace write + atomic 3-artifact commit (OBJECTIVES.md+config.json+STATE.md) + canary structural test + Mode A smoke Cycles 2+3+4 (DEF-04, parallel to Plan 03)
- [x] 03-05-discover-stub-block-gate-PLAN.md — commands/brief/discover.md + brief/workflows/discover.md stubs + objectives.cmdValidate CLI wrapper with Pitfall 5 Korean block-gate + dispatcher case + block-gate smoke test (positive + negative + missing-file) + docs/ARCHITECTURE.md count bumps (DEF-05)
- [x] 03-06-stale-anchor-text-mode-parity-PLAN.md — shouldStaleAnchorFire entry-point gating + 3-option D-13 interrupt prompt rendering + stale-anchor hook wired in both /brief-discover (replaces Plan 05 STUB) and /brief-define --amend Step 0.5 + stale-anchor smoke (positive discover + negative /brief-status + negative fresh + unit) + text_mode parity smoke on canonical fixture (DEF-06 + FND-06 flowdown)

**Pitfall coverage**: #3 OBJECTIVES.md anchor drift (DEF-03 immutable/mutable layers + DEF-06 stale-anchor warning are designed-in from Phase 0), #9 Non-developer friction (DEF-01 conversational extractor adapts to non-developer planner persona).

### Phase 4: First Gate — ALIGN Pattern Established
**Goal**: The ALIGN gate is implemented as the canonical evaluator-optimizer gate pattern: three structured outputs (ALIGNED / DRIFTED-objective-needs-update / DRIFTED-output-needs-revision), findings-not-pass/fail vocabulary, invoked by orchestrator commands as an explicit step (NOT via PostToolUse/SubagentStop hooks). Once this pattern is right, Phase 5 (AUDIENCE) and Phase 7 (COMPLIANCE) replicate it.
**Depends on**: Phase 3
**Requirements**: DSG-12
**Success Criteria** (what must be TRUE):
  1. User runs an orchestrator command that produces an artifact, the ALIGN gate runs automatically as an explicit orchestrator step, and the gate emits one of three structured outputs: `ALIGNED` (proceed), `DRIFTED-objective` (output is fine; OBJECTIVES.md needs amendment), or `DRIFTED-output` (OBJECTIVES.md is fine; output needs revision) — never a binary pass/fail (DSG-12)
  2. User reads any ALIGN gate output file and sees findings vocabulary ("Documented obligations addressed:", "Obligations needing further work:") — never the words "compliant", "passed", or green checkmarks (foundation for AUDIENCE/COMPLIANCE replication)
  3. User can verify by reading the orchestrator command markdown file that the gate is invoked as a visible, mandatory orchestrator step — there is no PostToolUse or SubagentStop hook that does the invocation invisibly
  4. User can see in STATE.md `state.brief.last_gate_results` that the most recent ALIGN gate result is recorded with severity, findings count, and decision (proceed / amend objectives / revise output)
**Plans**: 6 plans
- [x] 04-01-PLAN.md — Foundational lib primitives: deterministic screen + ban-list grepper + verdict validator + writer + Korea-signal detector + vocabulary reference file + .gitignore entry (Wave 1)
- [x] 04-02-PLAN.md — Subagent markdown (agents/brief-align-gate.md) + orchestrator workflow markdown (brief/workflows/align-gate.md) with templated candidate/baseline/verdict paths and D-06 3-path interrupt Korean prompts (Wave 1, parallel to 04-01)
- [x] 04-03-PLAN.md — 4 decision-path fixtures + combined decision-path test suite with MUST-PASS canary (Pitfall #6 B2B-enterprise + App-Store-consumer contradiction) + runAlign + mergeVerdicts extension (Wave 2)
- [x] 04-04-PLAN.md — commitAlignVerdict + renderAlignReport + brief-tools.cjs align run/commit dispatcher + status.cjs formatGate override extension + state-override round-trip test (Wave 3)
- [x] 04-05-PLAN.md — Canary wiring into /brief-define Mode A wrap-up Step 3.5 + E2E canary test (Korea + non-Korea + override paths) (Wave 4)
- [x] 04-06-PLAN.md — Vocabulary-lock test + TEXT_MODE parity test + structural no-hook test + coverage snapshot (Wave 5)

**Pitfall coverage**: #3 OBJECTIVES.md anchor drift (three-output design forces user to choose, not just acknowledge), #4 Compliance checkbox theater (findings-not-checks vocabulary established here so it propagates to COMPLIANCE later), Anti-pattern #2 (gate-as-orchestrator-step, NOT hook-spawned).

### Phase 5: DISCOVER — Parallel Research with Provenance + AUDIENCE + Context Injection
**Goal**: User selects from 9 default research categories (or adds custom), parallel researcher agents (capped at 4 concurrent per Anthropic best practice) produce research outputs with mandatory `[VERIFIED|ASSUMED|FOUNDER-INPUT]` provenance tags on every quantitative claim. AUDIENCE guard is wired for the first time on research artifacts (default `audience: internal`). B2B/B2C context injector runs on every spawned agent. Korea-first compliance reference library skeleton (PIPA/ISMS-P/MyData 1-page primers) is in place. A pre-commit hook blocks commits with untagged quantitative claims.
**Depends on**: Phase 4
**Requirements**: DSC-01, DSC-02, DSC-03, DSC-04, DSC-05, DSC-06, DSC-07, DSG-13, CC-02, CC-04
**Success Criteria** (what must be TRUE):
  1. User runs `/brief-discover` and is presented with 9 default research category recommendations (Market Sizing, Competitor Landscape, Customer Research, Regulation & Compliance, Technology & Feasibility, Distribution Channels, Pricing Benchmarks, Case Studies, Trends & Forecasts) to multi-select; user can also select "Custom" and add freeform categories beyond the 9 (DSC-01, DSC-02)
  2. User obtains parallel research output (one researcher agent per selected category) and observes that no more than 4 spawn concurrently — additional researchers wait in a wave queue (DSC-03)
  3. User reads any research artifact and sees that every quantitative claim carries a `[VERIFIED:source-url|date]`, `[ASSUMED:rationale]`, or `[FOUNDER-INPUT]` provenance tag — claims without a tag fail the output, and a separate URL+access-date is required for any market-data quantitative claim (DSC-04, DSC-07)
  4. User can verify (e.g., by reading two researcher outputs for the same project where business_model differs) that the same "GTM" question yields different research for B2B vs B2C — context injector is reading `state.brief.business_model` from OBJECTIVES.md and injecting into every spawned agent's prompt (DSC-05, CC-02)
  5. User opens `references/brief/compliance/korea/` and finds at minimum a 1-page primer per item for PIPA, ISMS-P, and MyData — expandable later but skeleton exists (DSC-06)
  6. User reads any research artifact frontmatter and sees mandatory `audience.type`, `audience.role`, `audience.confidentiality`, `business_context.model`, `voice.tone`, `voice.perspective` fields; AUDIENCE guard runs after every research artifact and blocks the workstream advance if frontmatter is missing or malformed (DSG-13)
  7. User attempts to commit an artifact containing a quantitative claim without a provenance tag and the pre-commit hook (Provenance Tag Enforcer) blocks the commit with a structured error (CC-04)
**Plans**: 8 plans
- [x] 05-01-PLAN.md — context-inject.cjs helper + roundtrip tests (CC-02, DSC-05) (Wave 1)
- [x] 05-02-PLAN.md — brief-domain-researcher.md agent + wave partition + 2-task smoke + B2B/B2C differentiated fixtures (DSC-01, DSC-02, DSC-03, DSC-04, DSC-05, DSC-07, CC-02) (Wave 2)
- [x] 05-03-PLAN.md — brief-validate-provenance.sh hook + 13 regex fixtures + opt-in gate + manifest wiring (DSC-04, DSC-07, CC-04) (Wave 1)
- [x] 05-04-PLAN.md — AUDIENCE gate stack (agent + workflow + lib + audience-report + vocabulary) duplicate-renamed from ALIGN (DSG-13) (Wave 3)
- [x] 05-05-PLAN.md — Paired-sibling filename scheme + ALIGN-00.md → OBJECTIVES.align.md atomic migration (DSG-13) (Wave 4)
- [x] 05-06-PLAN.md — Korea compliance primers (PIPA / ISMS-P / MyData) skeleton (DSC-06) (Wave 1)
- [x] 05-07-PLAN.md — /brief-discover body replacement + multi-select + wave spawn + per-artifact AUDIENCE (DSC-01, DSC-02, DSC-03, CC-02, DSG-13) (Wave 4)
- [x] 05-08-PLAN.md — Canary E2E + Anti-pattern #2 structural test + Surface Cap audit (ALL) (Wave 4)

**Pitfall coverage**: #6 Hallucinated market data (DSC-04 + DSC-07 source-mandatory mode for every quantitative claim + CC-04 pre-commit enforcement), #11 Korean cultural gotchas (DSC-06 Korea-first reference library + DSC-05 context injection ensures researchers receive region from day one), #4 Compliance checkbox theater (DSC-06 reference library is the substrate the checker uses in Phase 7), #5 Audience leakage (DSG-13 first wires AUDIENCE guard so subsequent phases inherit working enforcement).

### Phase 6: Bidirectional Foundation — Phase 1↔2 Return Stack
**Goal**: The bidirectional Phase 1↔2 flow is built BEFORE designers exist, so designers in Phase 7 are written aware of it from day one (the highest-architectural-risk feature, per research synthesis). `state.brief.return_stack` (LIFO, max depth 3) is implemented; `brief-gap-detector` agent classifies gaps as BLOCKING / MATERIAL / NICE-TO-HAVE; meta-arbiter prompt fires at iteration 2 ("Is this gap genuinely blocking, or are we polishing?"); return-stack state is visible in `/brief-status`.
**Depends on**: Phase 5
**Requirements**: DSG-11, DSG-14
**Success Criteria** (what must be TRUE):
  1. User in a (mock) Phase 2 workstream context can trigger a return to Phase 1 when the gap-detector classifies a missing piece as BLOCKING; the orchestrator pushes a frame onto `state.brief.return_stack`, exits cleanly with a "RETURNED-TO-DISCOVER" message, and the user runs `/brief-discover` to resume only the requested researcher (DSG-11)
  2. User triggering a 3rd round-trip is BLOCKED with a hard cap message; the meta-arbiter prompt fires at iteration 2 ("We've gone back to research twice for {topic}. Is this gap genuinely blocking, or are we polishing? Pick: keep researching / proceed with assumption / cancel workstream") (DSG-11)
  3. User runs `/brief-status` and sees the bidirectional return-stack state: current depth, max depth = 3, what triggered the return (text from gap-detector), what's pending on resume (paused phase + paused wave + paused artifact); convergence telemetry visible (round-trip count per workstream) (DSG-14)
  4. User reads `state.brief.gap_queue` and sees gaps not yet acted on, each tagged with criticality (BLOCKING / MATERIAL / NICE-TO-HAVE) — only BLOCKING gaps trigger return-to-Phase-1; MATERIAL is documented and proceeded; NICE-TO-HAVE is deferred to v2
**Plans**: 8 plans
- [x] 06-01-PLAN.md — Ship 10 Wave 0 fixtures (6 gap-detect + 4 return-stack) per VALIDATION §Wave 0 (DSG-11, DSG-14)
- [x] 06-02-PLAN.md — Ship gap-detect-vocabulary.md + gap-detect-report.cjs + agents/brief-gap-detector.md + workflows/gap-detect.md content files (DSG-11)
- [x] 06-03-PLAN.md — gap-detect.cjs core primitives: validateVerdict, countIterations, validateFingerprint, pushReturnFrame, popReturnFrame, maybePopTopFrame, clearReturnStackFor, appendGapQueue, writeAssumption (DSG-11)
- [x] 06-04-PLAN.md — runGapDetect + commitGapDetectVerdict + brief-tools.cjs case gap-detect dispatcher (7 subcommands) (DSG-11)
- [x] 06-05-PLAN.md — status.cjs extension with Gap loop + Round-trips rows (D-06 derived-at-read-time) (DSG-14)
- [x] 06-06-PLAN.md — align-gate.md Step 4.5 (maybePopTopFrame post-commit) + Step 8 (gap-detect post-verdict spawn) (DSG-11)
- [x] 06-07-PLAN.md — discover.md Step 0.5 (D-10 resume-on-invocation auto-detect) (DSG-11)
- [x] 06-08-PLAN.md — Canary E2E + no-hook + no-new-command + vocabulary-lock + TEXT_MODE audits (DSG-11, DSG-14)

**Pitfall coverage**: #7 Phase 1↔2 infinite loop (hard 3-round-trip cap + gap criticality classification + meta-arbiter at iteration 2 + convergence telemetry — all designed in BEFORE the designers that will use this exist).

### Phase 7: DESIGN — Workstream Orchestration + COMPLIANCE Checker
**Goal**: User obtains structured business plan artifacts from 9 built-in workstreams (BMC, GTM, FINANCIAL with driver-based bottom-up modeling, OPERATIONS, COMPLIANCE with mandatory legal-counsel disclaimer and clause-level findings, ROADMAP, BRAND, RISK, TECH-ARCH). Dynamic workstream addition via `/brief-add-workstream` reuses the gsd-new-milestone flow pattern. The COMPLIANCE checker (NOT just the COMPLIANCE workstream — runs on EVERY artifact in EVERY phase) emits clause-level findings (regulation clause + required evidence + found-in-artifact + gap), never green checkmarks, with mandatory legal-counsel disclaimer.
**Depends on**: Phase 6
**Requirements**: DSG-01, DSG-02, DSG-03, DSG-04, DSG-05, DSG-06, DSG-07, DSG-08, DSG-09, DSG-10, CC-01
**Success Criteria** (what must be TRUE):
  1. User can run each of the 9 built-in workstreams (BMC, GTM, FINANCIAL, OPERATIONS, COMPLIANCE, ROADMAP, BRAND, RISK, TECH-ARCH) and obtain its canonical artifact — BMC has the 9 building blocks; GTM has B2B/B2C variant content paths; FINANCIAL is driver-based bottom-up (NOT top-down market-share assumption); OPERATIONS has team/process/tools; COMPLIANCE has region+industry-aware findings with mandatory legal-counsel disclaimer; ROADMAP is a phased business roadmap distinct from BRIEF's own ROADMAP.md; BRAND has Voice/Tone/Messaging/Positioning; RISK has Risk Register across 5 categories with mitigations; TECH-ARCH is a high-level component map suitable as PRD input, explicitly NOT detailed design (DSG-01 through DSG-09)
  2. User can run `/brief-add-workstream <name>` and is guided through interactive goal gathering → research gap analysis → sub-task definition → roadmap update — the gsd-new-milestone flow pattern is reused, and the new workstream becomes a first-class participant in subsequent `/brief-design` runs without any `.cjs` source change (DSG-10)
  3. User reads any non-COMPLIANCE-workstream artifact (e.g., a BMC.md or GTM.md) and finds an accompanying `*.checker-finding.md` file emitted by the COMPLIANCE checker that ran automatically on it — the checker output uses findings-not-checks vocabulary, cites regulation clause + required evidence + found-in-artifact + gap, and includes a mandatory disclaimer ("This is not legal advice. Findings are starting points for review with qualified counsel.") (CC-01)
  4. User confirms the COMPLIANCE checker output never contains the word "compliant" or a green checkmark; instead uses "Documented obligations addressed:" / "Obligations needing further work:" / "Obligations BRIEF cannot verify (requires human counsel):" (CC-01)
**Plans**: 8 plans
- [ ] 07-01-PLAN.md — COMPLIANCE checker triad (agent + workflow + lib + report + vocabulary + dispatcher + 6 Wave 0 tests) — CC-01
- [ ] 07-02-PLAN.md — Korea pack auto-load + verbatim PIPA disclaimer byte-identity tests — CC-01 (D-03 + D-04)
- [ ] 07-03-PLAN.md — /brief-design orchestrator (commands/workflows/dispatcher) + sequential 3-gate threading + 4 Wave 0 tests — DSG-10, CC-01
- [ ] 07-04-PLAN.md — /brief-add-workstream + parameterized brief-workstream-designer agent + 3 Wave 0 tests — DSG-10
- [ ] 07-05-PLAN.md — 6 workstream bundles (BMC, GTM, BRAND, RISK, ROADMAP, COMPLIANCE) + canary fixture + 6 Wave 0 tests — DSG-01, DSG-02, DSG-05, DSG-06, DSG-07, DSG-08
- [ ] 07-06-PLAN.md — 3 workstream bundles (OPERATIONS, TECH-ARCH, FINANCIAL) + Step 4.5 FINANCIAL driver Q&A + B2B fixture + 5 Wave 0 tests — DSG-03, DSG-04, DSG-09
- [ ] 07-07-PLAN.md — workstream-loader gates_required+depends_on extension + status.cjs recommended-next + state.cjs allowlist + 6 structural tests — FND-08, FND-09, FND-10, CC-01
- [ ] 07-08-PLAN.md — Korea-first canary E2E + TEXT_MODE multi-runtime parity test — DSG-01..10 + CC-01 + FND-06

**Pitfall coverage**: #4 Compliance checkbox theater (CC-01 findings-not-checks + clause-level evidence + mandatory disclaimer — directly responds to CEO liability under 2026 PIPA), #6 Hallucinated market data (DSG-03 driver-based bottom-up financial modeling), #11 Korean cultural gotchas (DSG-05 region-aware compliance findings using Phase 5 reference library), #13 Framework specialization lock-in (DSG-10 dynamic workstream addition uses workstream-as-yaml from Phase 2, not bespoke code).

### Phase 8: DELIVER — Type A + Type B + AUDIENCE Enforcement + Marp
**Goal**: User obtains both Type A (PRD-input) and Type B (communication) deliverables. Type A: PRODUCT-BRIEF, SERVICE-POLICY (template varies by business_model), HIGH-LEVEL-SPEC, FEATURE-MAP. Type B: INTERNAL-DECK, PROPOSAL-DECK, EXEC-SUMMARY, DECISION-MEMO, all rendered via Marp invoked through `npx --yes`. AUDIENCE enforcement is now truly blocking: filename audience encoding (e.g., `proposal-deck.partner.pptx`), literal first-slide watermark of confidentiality level, mandatory `/brief-export` confirmation step, and a frontmatter pre-commit hook installed by BRIEF setup catches anything that bypassed the orchestrator.
**Depends on**: Phase 7
**Requirements**: DLV-01, DLV-02, DLV-03, DLV-04, DLV-05, DLV-06, DLV-07, DLV-08, DLV-09, CC-03
**Success Criteria** (what must be TRUE):
  1. User runs `/brief-deliver --type-a` and obtains four artifacts: `PRODUCT-BRIEF.md` (vision + core value + target user, suitable as PM's first PRD input), `SERVICE-POLICY.md` whose template structure varies by `business_model` (B2B variant: SLA tiers, enterprise support, data processing terms, contract terms; B2C variant: refund policy, customer support hours, channel coverage, community guidelines), `HIGH-LEVEL-SPEC.md` (functional scope + priority + dependency, structured as PRD table-of-contents), and `FEATURE-MAP.md` (feature tree as Mermaid or ASCII) (DLV-01, DLV-02, DLV-03, DLV-04)
  2. User runs `/brief-deliver --type-b internal-deck` and obtains a Marp-rendered deck file (`.md` source + rendered PPTX/PDF via `npx --yes @marp-team/marp-cli`) targeted at internal executives; user runs `/brief-deliver --type-b proposal-deck` and obtains an externally-safe proposal deck with confidentiality `partner` (no internal strategy leakage); user runs `/brief-deliver` for EXEC-SUMMARY and DECISION-MEMO (1-2 pages each) on demand (DLV-05, DLV-06, DLV-07)
  3. User attempts to render any Type B artifact without running `/brief-export` first and is BLOCKED with a structured error; the `/brief-export` step displays audience and confidentiality and asks for explicit confirmation before deck rendering (DLV-08)
  4. User obtains rendered Type B output with audience encoded in the filename (e.g., `proposal-deck.partner.pptx`, `internal-deck.confidential.pptx`) and a literal first-slide watermark stating the confidentiality level visible in the rendered output (not just markdown comment) (DLV-09)
  5. User attempts to commit a `.planning/` artifact whose frontmatter violates schema (missing `audience.type`, `audience.confidentiality`, `voice.tone`, etc.) and the pre-commit Frontmatter Validator git hook (installed by BRIEF setup) blocks the commit with a structured error (CC-03)
**Plans**: 8 plans
- [ ] 08-01-PLAN.md — deliver.cjs Type A 자동 합성 lib + 4-artifact SYNTHESIS_MAP + Korea B2C 9-workstream fixture (DLV-01, DLV-02, DLV-03, DLV-04)
- [ ] 08-02-PLAN.md — voice-fit.cjs banned-words density + concreteness + Korean honorific-violation lib + voice-fit-vocabulary.md reference with 4 hand-written exemplars (DLV-05, DLV-06, DLV-07)
- [ ] 08-03-PLAN.md — leakage-diff.cjs TF-IDF cross-artifact keyword diff + 2 fixture pairs (intentional-leak + incidental-overlap) (DLV-06)
- [ ] 08-04-PLAN.md — export.cjs 7-step orchestration (leakage diff + AUDIENCE/COMPLIANCE re-run + 1-step confirm + 3-path interrupt + Marp render env-detect + atomic commit) + state.cjs PHASE_8_BRIEF_FIELDS (DLV-08)
- [ ] 08-05-PLAN.md — agents/brief-deliver-type-a.md parameterized agent + 4 Type A templates with B2B/B2C conditional prose (DLV-01..04 narrative)
- [ ] 08-06-PLAN.md — agents/brief-deliver-type-b.md parameterized agent + 4 Type B templates (Marp + non-Marp) + 3 Marp CSS themes + ko/en branching (DLV-05, DLV-06, DLV-07, DLV-09)
- [ ] 08-07-PLAN.md — hooks/brief-validate-frontmatter.sh CC-03 hook (byte-identity copy of brief-validate-provenance.sh) + bin/install.js 4-anchor registration + brief/references/marp-environment.md (CC-03)
- [ ] 08-08-PLAN.md — commands/brief/{deliver,export}.md user commands + brief/workflows/{deliver,export}.md + brief-tools.cjs 4 dispatchers + status.cjs formatGate extension + Korea-first canary E2E + vocabulary-lock + no-hooks anti-pattern (DLV-01..09 + CC-03 integration)
**UI hint**: yes

**Pitfall coverage**: #5 Audience leakage in Type B (DLV-08 mandatory export step + DLV-09 filename audience encoding + literal first-slide watermark + CC-03 pre-commit frontmatter validator — four-layer defense), #4 Compliance checkbox theater (Type B artifacts inherit COMPLIANCE checker from Phase 7), #11 Korean cultural gotchas (Type B agents apply honorific guard + bilingual `.ko.md`/`.en.md` pairs + idiom-substitution table for `region: kr` projects).

### Phase 9: Hardening — Cross-Runtime Smoke + Non-Developer Pilot
**Goal**: BRIEF is verified to work consistently across Claude Code, OpenAI Codex, Gemini CLI, OpenCode (cross-runtime smoke test); user-facing surface count is audited and documented (≤12 commands + ≤8 skills, with rationale for each); `/brief-help` is rich and categorized (not raw `--help`); BRIEF is piloted by the BRIEF vision-keeper for v1 (1 of 3 per CONTEXT D-D01 acceptance — vision-keeper is non-technical and used BRIEF end-to-end on a real planning project), with v1.1 beta planned for the additional 2/3 (Out of Scope per D-D04, NOT a v1 launch blocker).
**Depends on**: Phase 8
**Requirements**: HRD-01, HRD-02, HRD-03, HRD-04, HRD-05
**Success Criteria** (what must be TRUE):
  1. User runs `brief-cli smoke-test` and the cross-runtime smoke test exercises BRIEF in Claude Code, Codex, Gemini, and OpenCode — for runtimes without AskUserQuestion the text_mode fallback activates and produces equivalent output for the 5 critical commands (`init`, `define`, `discover`, `design`, `deliver`) (HRD-01)
  2. User opens the surface-count audit document (committed at v1 launch) and reads ≤12 user-facing commands and ≤8 skills, each with one-line rationale; nothing exceeds the cap set in CLAUDE.md back in Phase 2 (HRD-02)
  3. User runs `/brief-help` and obtains a categorized command listing with one-line per-command summary (NOT a raw `--help` dump); supports `/brief-help <topic>` subset queries; suggests closest 3 commands on a typo via Levenshtein distance (HRD-03)
  4. BRIEF is piloted with the BRIEF vision-keeper (1 of 3 in v1) per CONTEXT D-D01 acceptance — the vision-keeper is non-technical and used BRIEF end-to-end on a real planning project. Findings are logged in `.planning/pilot/` with explicit transparency that pilot 1/3 is the build-team vision-keeper. Remaining 2/3 are explicitly Out of Scope per D-D04 — NOT a v1 launch blocker (HRD-04)
  5. User runs `npm test 2>&1 > /tmp/hardening-test.txt; grep -cE '^✖' /tmp/hardening-test.txt` and gets a value ≤ 16 (EMPIRICAL_BASELINE 6 + DELTA_CAP 10 inherited from Phase 1). Closes the 63 residual failures deferred from Phase 1 per 10-PARTIAL-AUDIT.md §4: (a) restore 19 missing-file tests by creating brief/workflows/pr-branch.md + diagnose-issues.md + brief/references/ui-brand.md — or prune the assertions if the workflows are truly out of scope; (b) reconcile docs/ARCHITECTURE.md component counts (Total commands 75→61, workflows 72→58, agents 31→18) + sync tree comments in tests/architecture-counts.test.cjs + command-count-sync.test.cjs — 14 tests; (c) fix source-behavior drift in hooks/brief-check-update-worker.js MANAGED_HOOKS array + bin/install.js CONV-07 function + hooks/brief-read-guard.js JSON output + custom-file detection — 30 tests; (d) sync source-content drift in agents/*.md required_reading blocks (≥20 agents) + commands/brief/autonomous.md frontmatter + brief/workflows/verify-work.md — 13 tests (HRD-05, added 2026-04-18 during Phase 1 HALT-ACCEPTED orchestrator decision)
**Plans**: 7 plans

Plans:
- [x] 09-00-PLAN.md — Wave 0 scaffold all 11 test fixtures (RED stubs for HRD-01/02/03/04/05 + V1-LAUNCH-GATE)
- [x] 09-01-PLAN.md — HRD-01 cross-runtime smoke test impl (smoke-test.cjs + dispatcher case + SMOKE-TEST.md)
- [x] 09-02-PLAN.md — HRD-03 rich /brief-help impl (help.cjs + dispatcher case + help.md rewrite with Levenshtein)
- [x] 09-03-PLAN.md — HRD-04 partial 1/3 pilot friction journal at .planning/pilot/01-*-friction-journal.md
- [x] 09-04-PLAN.md — HRD-05(b) command-count-sync.test.cjs regex fix (commands/gsd/ -> commands/brief/)
- [x] 09-05-PLAN.md — HRD-02 surface pruning (atomic 56-file delete + new-project->init rename + bin/install.js cleanup + SURFACE-AUDIT.md + CLAUDE.md)
- [ ] 09-06-PLAN.md — HRD-05(a) per-test triage + HRD-05(b) ARCH count sync + V1-LAUNCH-GATE.md + RESIDUAL-FAILS-V1.md

**Pitfall coverage**: #2 Cross-runtime fragility (HRD-01 explicit smoke tests in Codex + Gemini), #1 Skill/command bloat (HRD-02 surface count audit), #12 Slash command memorability failure (HRD-03 rich `/brief-help` with verb-based mappings + suggestion-on-miss), #9 Non-developer friction + #14 Dogfooding trap (HRD-04 external pilot with non-developer planners — Track B of two-track dogfooding), #8 Fork drift residual (HRD-05 closes Phase 1 HALT-ACCEPTED source-drift residue via test-infrastructure modernization — structural closure of the rename-scope boundary).

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation — Fork Hygiene, Removal, Rename | 10/10 | HALT-ACCEPTED 2026-04-18 — 288 tests recovered (83.5%) across 4 gap-closure cycles (Plans 07/08/09/10); 63 residual source/doc drift deferred to Phase 9 HRD-05; functional fork-rename goal fully achieved | 2026-04-18 |
| 2. Stable Seam — Anchor Schema, Caps, Workstream-as-Config | 6/6 | Complete   | 2026-04-19 |
| 3. DEFINE Canary — Phase 0 End-to-End | 0/TBD | Not started | - |
| 4. First Gate — ALIGN Pattern Established | 0/6 | Planned | - |
| 5. DISCOVER — Parallel Research with Provenance | 0/8 | Planned | - |
| 6. Bidirectional Foundation — Phase 1↔2 Return Stack | 0/TBD | Not started | - |
| 7. DESIGN — Workstream Orchestration + COMPLIANCE Checker | 0/TBD | Not started | - |
| 8. DELIVER — Type A + Type B + AUDIENCE Enforcement | 0/TBD | Not started | - |
| 9. Hardening — Cross-Runtime + Pilot | 6/7 | In Progress|  |

---
*Roadmap created: 2026-04-17*
*Total v1 requirements covered: 54/54*
*Granularity: fine (9 phases)*
