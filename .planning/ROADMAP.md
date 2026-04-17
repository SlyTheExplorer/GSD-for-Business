# Roadmap: BRIEF — Business Research, Insight & Execution Framework

## Overview

BRIEF is built as a hard fork of GSD, transformed in-place into a meta-prompting framework for business and product strategy planning. The roadmap follows a strict outside-in dependency order: foundation hygiene before any feature work; the OBJECTIVES.md anchor (Phase 0 DEFINE) before any other runtime phase that reads it; the first cross-cutting gate (ALIGN) proven on a small surface before AUDIENCE/COMPLIANCE replicate the pattern; the bidirectional Phase 1↔2 return-stack built before designers exist so designers are written aware of it from day one; full DELIVER (Type A + Type B + Marp + audience enforcement) only after Phase 2 designers produce real artifacts to render; cross-runtime smoke testing and external pilot last because they require a feature-complete system. Every phase ships code+template+reference artifacts to the existing GSD codebase.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation — Fork Hygiene, Removal, Rename** - Backup branch, dev-surface removal, hard rename, multi-runtime preservation, A1 (zero-deps) verification
- [ ] **Phase 2: Stable Seam — Anchor Schema, Caps, Workstream-as-Config** - A4 verification (state.brief.* round-trip), workstream-spec.yaml architecture, CLAUDE.md command/skill caps, /brief-status skeleton
- [ ] **Phase 3: DEFINE Canary — Phase 0 End-to-End** - Conversational intent extractor, Dream State Mapping, OBJECTIVES.md with mutability layers, business_model/region declaration
- [ ] **Phase 4: First Gate — ALIGN Pattern Established** - Three-output ALIGN gate (ALIGNED / DRIFTED-objective / DRIFTED-output), findings-not-checks vocabulary, gate-as-orchestrator-step (not hook)
- [ ] **Phase 5: DISCOVER — Parallel Research with Provenance + AUDIENCE + Context Injection** - 9 default research categories, parallel cap of 4, provenance tags mandatory, AUDIENCE guard first wired, B2B/B2C context injector live, Korea reference library skeleton, provenance pre-commit enforcer
- [ ] **Phase 6: Bidirectional Foundation — Phase 1↔2 Return Stack** - state.brief.return_stack with 3-deep cap, gap-detector, gap criticality classification, meta-arbiter at iteration 2, return-stack visibility in /brief-status
- [ ] **Phase 7: DESIGN — Workstream Orchestration + COMPLIANCE Checker** - 9 built-in workstreams (BMC, GTM, FINANCIAL, OPERATIONS, COMPLIANCE, ROADMAP, BRAND, RISK, TECH-ARCH), /brief-add-workstream, COMPLIANCE checker on every artifact (clause-level findings + legal-counsel disclaimer)
- [ ] **Phase 8: DELIVER — Type A + Type B + AUDIENCE Enforcement + Marp** - Type A artifacts (PRD inputs), Type B Marp decks via npx, audience encoded in filename + watermark, mandatory /brief-export step, frontmatter pre-commit hook
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
**Plans**: TBD

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
**Plans**: TBD

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
**Plans**: TBD

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
**Plans**: TBD

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
**Plans**: TBD

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
**Plans**: TBD

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
**Plans**: TBD

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
**Plans**: TBD
**UI hint**: yes

**Pitfall coverage**: #5 Audience leakage in Type B (DLV-08 mandatory export step + DLV-09 filename audience encoding + literal first-slide watermark + CC-03 pre-commit frontmatter validator — four-layer defense), #4 Compliance checkbox theater (Type B artifacts inherit COMPLIANCE checker from Phase 7), #11 Korean cultural gotchas (Type B agents apply honorific guard + bilingual `.ko.md`/`.en.md` pairs + idiom-substitution table for `region: kr` projects).

### Phase 9: Hardening — Cross-Runtime Smoke + Non-Developer Pilot
**Goal**: BRIEF is verified to work consistently across Claude Code, OpenAI Codex, Gemini CLI, OpenCode (cross-runtime smoke test); user-facing surface count is audited and documented (≤12 commands + ≤8 skills, with rationale for each); `/brief-help` is rich and categorized (not raw `--help`); BRIEF is piloted with at least 3 non-developer business planners observed before public release.
**Depends on**: Phase 8
**Requirements**: HRD-01, HRD-02, HRD-03, HRD-04
**Success Criteria** (what must be TRUE):
  1. User runs `brief-cli smoke-test` and the cross-runtime smoke test exercises BRIEF in Claude Code, Codex, Gemini, and OpenCode — for runtimes without AskUserQuestion the text_mode fallback activates and produces equivalent output for the 5 critical commands (`init`, `define`, `discover`, `design`, `deliver`) (HRD-01)
  2. User opens the surface-count audit document (committed at v1 launch) and reads ≤12 user-facing commands and ≤8 skills, each with one-line rationale; nothing exceeds the cap set in CLAUDE.md back in Phase 2 (HRD-02)
  3. User runs `/brief-help` and obtains a categorized command listing with one-line per-command summary (NOT a raw `--help` dump); supports `/brief-help <topic>` subset queries; suggests closest 3 commands on a typo via Levenshtein distance (HRD-03)
  4. At least 3 non-developer business planners (NOT on the build team) have used BRIEF for a real planning project end-to-end, observed; their findings are logged in `.planning/pilot/` with friction journal entries; any blocking findings are resolved before public release (HRD-04)
**Plans**: TBD

**Pitfall coverage**: #2 Cross-runtime fragility (HRD-01 explicit smoke tests in Codex + Gemini), #1 Skill/command bloat (HRD-02 surface count audit), #12 Slash command memorability failure (HRD-03 rich `/brief-help` with verb-based mappings + suggestion-on-miss), #9 Non-developer friction + #14 Dogfooding trap (HRD-04 external pilot with non-developer planners — Track B of two-track dogfooding).

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation — Fork Hygiene, Removal, Rename | 0/TBD | Not started | - |
| 2. Stable Seam — Anchor Schema, Caps, Workstream-as-Config | 0/TBD | Not started | - |
| 3. DEFINE Canary — Phase 0 End-to-End | 0/TBD | Not started | - |
| 4. First Gate — ALIGN Pattern Established | 0/TBD | Not started | - |
| 5. DISCOVER — Parallel Research with Provenance | 0/TBD | Not started | - |
| 6. Bidirectional Foundation — Phase 1↔2 Return Stack | 0/TBD | Not started | - |
| 7. DESIGN — Workstream Orchestration + COMPLIANCE Checker | 0/TBD | Not started | - |
| 8. DELIVER — Type A + Type B + AUDIENCE Enforcement | 0/TBD | Not started | - |
| 9. Hardening — Cross-Runtime + Pilot | 0/TBD | Not started | - |

---
*Roadmap created: 2026-04-17*
*Total v1 requirements covered: 54/54*
*Granularity: fine (9 phases)*
