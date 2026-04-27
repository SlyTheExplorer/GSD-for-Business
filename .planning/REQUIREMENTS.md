# Requirements: BRIEF

**Defined:** 2026-04-18
**Core Value:** A business planner can transform a fuzzy idea into well-researched, audience-correct, compliance-aware deliverables — without already knowing what they want when they start.

## v1 Requirements

Requirements for the initial release. Each maps to exactly one phase in ROADMAP.md.

### Foundation (FND)

Pre-build infrastructure: fork hygiene, rename, removal of inherited dev surfaces, assumption verification.

- [ ] **FND-01**: User can verify a `backup/original-gsd` branch exists as one-command rollback safety net
- [ ] **FND-02**: User sees no GSD development-specific commands (`/gsd-code-review`, `/gsd-ui-phase`, `/gsd-ai-integration-phase`, `/gsd-add-tests`, `/gsd-secure-phase`) — all 28 development-specific files removed
- [ ] **FND-03**: User invokes commands as `/brief-*` exclusively — `gsd-*` aliases do not exist (hard rename, no shim)
- [ ] **FND-04**: User can confirm Assumption A1 status (GSD bin layer ships with zero runtime `dependencies` in `package.json`) via a documented inspection step
- [x] **FND-05**: User can confirm Assumption A4 status (inherited `state.cjs` round-trips namespaced `state.brief.*` fields without loss) via a smoke test in `tests/`
- [ ] **FND-06**: User runs BRIEF identically across Claude Code, OpenAI Codex, Gemini CLI, OpenCode (multi-runtime detection inherited from GSD preserved)
- [ ] **FND-07**: User opens CLAUDE.md / README.md and reads business-planning-domain language, not software-development language
- [x] **FND-08**: User can declare new built-in workstreams via yaml `workstream-spec.yaml` files (workstream-as-config, NOT bespoke code) — verified by adding one workstream without touching `.cjs` source
- [x] **FND-09**: User sees no more than 12 user-facing slash commands and 8 skills (CLAUDE.md cap enforced)
- [x] **FND-10**: User runs `/brief-status` and sees current phase, active workstream, return-stack depth, last ALIGN finding, last COMPLIANCE finding

### Phase 0 — DEFINE (DEF)

Intent extraction. Two-tier anchor: PROJECT.md is overall, OBJECTIVES.md is per-workstream.

- [ ] **DEF-01**: User runs `/brief-define` and is guided through a Push Twice + Language Precision conversational intent extractor (gstack `office-hours` patterns, BRIEF-adapted to internal-clarification mode, not founder-validation mode)
- [ ] **DEF-02**: User completes Dream State Mapping (current state → 3-month state → 12-month state) as part of `/brief-define`
- [ ] **DEF-03**: User obtains a per-workstream `OBJECTIVES.md` derived from PROJECT.md, with explicit mutability layers (immutable intent block + mutable hypotheses block)
- [ ] **DEF-04**: User declares `business_model` (b2b / b2c / b2b2c / enterprise), `region` (kr / us / eu / ...), `audience policy` defaults, and `compliance_packs` list as Phase 0 output — written to `.planning/config.json` for context injection
- [ ] **DEF-05**: User cannot proceed to Phase 1 with an OBJECTIVES.md missing required fields (block-style validation, not warning)
- [ ] **DEF-06**: User receives a stale-anchor warning if OBJECTIVES.md amendments are >48h old before any new milestone work

### Phase 1 — DISCOVER (DSC)

User-selectable parallel research with provenance and Korea-first regulatory awareness.

- [ ] **DSC-01**: User runs `/brief-discover` and is presented with 9 default research category recommendations to multi-select (Market Sizing, Competitor Landscape, Customer Research, Regulation & Compliance, Technology & Feasibility, Distribution Channels, Pricing Benchmarks, Case Studies, Trends & Forecasts)
- [ ] **DSC-02**: User can also select "Custom" and add freeform research categories beyond the 9 defaults
- [ ] **DSC-03**: User obtains parallel research output (one researcher agent per selected category) with hard cap at 4 concurrent spawns per Anthropic best practice
- [ ] **DSC-04**: User can confirm every quantitative claim in research output carries a Provenance Tag (`[VERIFIED:source|date]`, `[ASSUMED:rationale]`, `[FOUNDER-INPUT]`) — claims without a tag fail the output
- [ ] **DSC-05**: User benefits from B2B/B2C context injection on every researcher agent (the same "GTM" question yields different research for b2b vs b2c)
- [ ] **DSC-06**: User obtains a Korea-first compliance reference library skeleton (PIPA, ISMS-P, MyData) — at minimum a 1-page primer per item, expandable later
- [ ] **DSC-07**: User does not receive any quantitative market-data claim without an accompanying URL + access date

### Phase 2 — DESIGN (DSG)

Business plan via 9 built-in workstreams + dynamic addition + bidirectional Phase 1 flow + cross-cutting gates.

**Built-in workstreams (9):**

- [ ] **DSG-01**: User can run the `BMC` workstream and obtain a Business Model Canvas artifact (9 building blocks)
- [ ] **DSG-02**: User can run the `GTM` workstream and obtain a Go-to-Market plan with B2B/B2C variant content paths (different sub-sections by business_model)
- [ ] **DSG-03**: User can run the `FINANCIAL` workstream and obtain a driver-based bottom-up financial model (NOT top-down market-share assumption)
- [ ] **DSG-04**: User can run the `OPERATIONS` workstream and obtain an operations model (team, process, tools)
- [ ] **DSG-05**: User can run the `COMPLIANCE` workstream and obtain region+industry-aware compliance findings (not pass/fail) with mandatory legal-counsel disclaimer
- [ ] **DSG-06**: User can run the `ROADMAP` workstream and obtain a phased business roadmap with milestones (distinct from PROJECT/REQUIREMENTS roadmap which is the BRIEF tool's roadmap)
- [ ] **DSG-07**: User can run the `BRAND` workstream and obtain Brand & Positioning artifacts (Voice, Tone, Messaging Framework, Positioning Statement)
- [ ] **DSG-08**: User can run the `RISK` workstream and obtain a Risk Register (technology / market / regulatory / financial / operational risks + mitigation strategies)
- [ ] **DSG-09**: User can run the `TECH-ARCH` workstream and obtain a high-level Technology Architecture sketch (component map, data flow, build sequence) suitable as PRD input — explicitly NOT detailed design

**Dynamic + bidirectional + gates:**

- [ ] **DSG-10**: User can add a new workstream via `/brief-add-workstream <name>` using the `gsd-new-milestone` flow pattern (interactive goal gathering → research gap analysis → sub-task definition → roadmap)
- [ ] **DSG-11**: User can trigger a return to Phase 1 from inside any Phase 2 workstream when a research gap is detected (bidirectional flow), with hard 3-round-trip cap and meta-arbiter prompt at iteration 2
- [ ] **DSG-12**: User obtains a Continuous ALIGN gate output after every workstream artifact, with three possible outputs: ALIGNED, DRIFTED-objective (output is fine, OBJECTIVES.md needs amendment), DRIFTED-output (OBJECTIVES.md is fine, output needs revision)
- [ ] **DSG-13**: User obtains an Audience Guard pass after every workstream artifact, validating mandatory frontmatter (audience.type, audience.role, audience.confidentiality, business_context.model, voice.tone, voice.perspective)
- [ ] **DSG-14**: User can see the bidirectional return-stack state in `/brief-status` (current depth, max depth = 3, what triggered the return, what's pending on resume)

### Phase 3 — DELIVER (DLV)

Final artifacts in two modes: Type A (PRD inputs) and Type B (communication).

**Type A — Product/Service policy artifacts (PRD inputs):**

- [ ] **DLV-01**: User can run `/brief-deliver --type-a` and obtain a `PRODUCT-BRIEF.md` (product vision + core value + target user summary, suitable as PM's first input to PRD authoring)
- [ ] **DLV-02**: User obtains a `SERVICE-POLICY.md` whose template structure varies by `business_model` — B2B variant (SLA tiers, enterprise support, data processing terms, contract terms) vs B2C variant (refund policy, customer support hours, channel coverage, community guidelines)
- [ ] **DLV-03**: User obtains a `HIGH-LEVEL-SPEC.md` (functional scope + priority + dependency, structured as PRD table-of-contents)
- [ ] **DLV-04**: User obtains a `FEATURE-MAP.md` (feature tree diagram source — Mermaid or ASCII)

**Type B — Communication artifacts:**

- [ ] **DLV-05**: User can run `/brief-deliver --type-b internal-deck` and obtain a Marp-rendered deck file (markdown → PPTX/PDF via `npx --yes @marp-team/marp-cli`) targeted at internal executives
- [ ] **DLV-06**: User can run `/brief-deliver --type-b proposal-deck` and obtain an externally-safe proposal deck with confidentiality `partner` (no internal strategy leakage)
- [ ] **DLV-07**: User obtains an `EXEC-SUMMARY.md` (1-2 page executive summary) and `DECISION-MEMO.md` (1-2 page decision memo) on demand

**Audience enforcement on Type B:**

- [ ] **DLV-08**: User cannot export any Type B artifact without an explicit `/brief-export` confirmation step (mandatory checkpoint before deck rendering)
- [ ] **DLV-09**: User obtains rendered Type B output with audience encoded in filename (e.g., `proposal-deck.partner.pptx`, `internal-deck.confidential.pptx`) and a literal first-slide watermark of confidentiality level

### Cross-Cutting Agents (CC)

Auto-attached safety/quality agents that run beyond the dedicated workstreams.

- [ ] **CC-01**: User benefits from the Compliance Checker running on every artifact in every phase (NOT only on the COMPLIANCE workstream) — emits findings (regulation clause + required evidence + found-in-artifact + gap), never green checkmarks
- [ ] **CC-02**: User benefits from the B2B/B2C Context Injector running on every spawned agent — every agent receives `business_model`, `region`, `audience policy` from `OBJECTIVES.md` automatically
- [ ] **CC-03**: User cannot commit a `.planning/` artifact whose frontmatter violates schema (Pre-Commit Frontmatter Validator git hook installed by BRIEF setup)
- [ ] **CC-04**: User cannot commit any artifact containing a quantitative claim without an accompanying Provenance Tag (Provenance Tag Enforcer git pre-commit check)

### Hardening (HRD)

Pre-launch verification.

- [ ] **HRD-01**: User can run a cross-runtime smoke test (`brief-cli smoke-test`) that verifies BRIEF works in Claude Code, Codex, Gemini, OpenCode (text mode fallback active for runtimes without AskUserQuestion)
- [ ] **HRD-02**: User-facing surface count is audited and documented at v1 launch (≤12 commands + ≤8 skills, with rationale for each)
- [ ] **HRD-03**: User can run `/brief-help` and obtain a categorized command listing with one-line per-command summary (rich help, not raw `--help`)
- [ ] **HRD-04**: BRIEF is piloted with the BRIEF vision-keeper (1 of 3 in v1) and ≥2 additional non-developer business planners (deferred to v1.1 beta program) per CONTEXT D-D01. The vision-keeper counts as a non-developer pilot under D-D01 acceptance — they are non-technical and used BRIEF end-to-end on a real planning project, even though they are also the build-team vision-keeper. Findings logged in `.planning/pilot/` with explicit transparency that pilot 1/3 is the build-team vision-keeper (not a fully external pilot). Remaining 2/3 are explicitly Out of Scope for v1 launch per D-D04 — NOT a launch blocker.
- [ ] **HRD-05**: Phase 1 HALT-ACCEPTED 63 source-drift residuals are closed to ≤ 16 npm test failures (EMPIRICAL_BASELINE 6 + DELTA_CAP 10 inherited from Phase 1) — added mid-flight 2026-04-18 during Phase 1 HALT-ACCEPTED orchestrator decision

## v2 Requirements

Deferred to a future release. Tracked but not in current roadmap.

### Phase 0 (DEF v2)

- **DEF-V2-01**: Pre-Mortem agent ("imagine you ship this and it fails one year later — what went wrong?") — explicitly deferred per Phase 0 selection round

### Phase 3 (DLV v2)

- **DLV-V2-01**: INVESTOR-IR.md (Series A pitch deck variant with stricter financial vetting and quantitative claim restrictions) — explicitly deferred per Type B selection round

### Phase 1 (DSC v2)

- **DSC-V2-01**: Web-search MCP integration for real-time research data (currently relies on agent's training-data + Founder-Input)
- **DSC-V2-02**: Customer interview transcript analyzer (JTBD interview extraction)

### Compliance (CC v2)

- **CC-V2-01**: Deeper clause-level Korean compliance pack content (currently 1-page primers; v2 expands to clause-level checklists)
- **CC-V2-02**: Continuous compliance monitoring integration (Drata/Vanta API style) — anti-feature for v1, exploratory for v2

### Cycle (CYC v2)

- **CYC-V2-01**: `/brief-new-milestone` for full v2 cycle restart (different OBJECTIVES from scratch) — explicitly deferred during initial design

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Code review / test / debug agents | GSD development-specific; not ported. |
| UI/UX research and design contracts (UI-SPEC) | Frontend-specific; not ported. |
| AI integration / eval planning (AI-SPEC) | LLM-app development specific; not ported. |
| TDD enforcement | Software-specific. |
| Security audit (programmatic threat model verification) | Replaced by COMPLIANCE workstream + Compliance Checker. |
| Visual BMC drag-and-drop editor | Strategyzer/Miro own this category. BRIEF outputs Markdown that exports to those tools. |
| Financial calculation engine (live formulas) | Causal/Pry/Foresight own this. BRIEF outputs Markdown that exports to those tools. |
| Slide editor (visual) | Pitch/Gamma own this. BRIEF outputs Marp Markdown that renders to PPTX. |
| Continuous compliance monitoring (running agents) | Drata/Vanta own this. BRIEF outputs static checklists for them to ingest. |
| Backwards-compat aliases for `gsd-*` commands | Hard fork. Aliases would create dual-vocabulary confusion. |
| Plugin form (in addition to fork) | Coupling to GSD release cadence would constrain BRIEF too much. |
| `/brief-new-milestone` (v2 cycle restart) | Single-cycle is enough for v1. Multi-cycle deferred to v2. |
| Codebase mapping of source GSD as project artifact | Already analyzed in design conversation; no value in formal mapping artifact. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 (Foundation — Fork Hygiene, Removal, Rename) | Pending |
| FND-02 | Phase 1 (Foundation — Fork Hygiene, Removal, Rename) | Pending |
| FND-03 | Phase 1 (Foundation — Fork Hygiene, Removal, Rename) | Pending |
| FND-04 | Phase 1 (Foundation — Fork Hygiene, Removal, Rename) | Pending |
| FND-05 | Phase 2 (Stable Seam — Anchor Schema, Caps, Workstream-as-Config) | Complete |
| FND-06 | Phase 1 (Foundation — Fork Hygiene, Removal, Rename) | Pending |
| FND-07 | Phase 1 (Foundation — Fork Hygiene, Removal, Rename) | Pending |
| FND-08 | Phase 2 (Stable Seam — Anchor Schema, Caps, Workstream-as-Config) | Complete |
| FND-09 | Phase 2 (Stable Seam — Anchor Schema, Caps, Workstream-as-Config) | Complete |
| FND-10 | Phase 2 (Stable Seam — Anchor Schema, Caps, Workstream-as-Config) | Complete |
| DEF-01 | Phase 3 (DEFINE Canary — Phase 0 End-to-End) | Pending |
| DEF-02 | Phase 3 (DEFINE Canary — Phase 0 End-to-End) | Pending |
| DEF-03 | Phase 3 (DEFINE Canary — Phase 0 End-to-End) | Pending |
| DEF-04 | Phase 3 (DEFINE Canary — Phase 0 End-to-End) | Pending |
| DEF-05 | Phase 3 (DEFINE Canary — Phase 0 End-to-End) | Pending |
| DEF-06 | Phase 3 (DEFINE Canary — Phase 0 End-to-End) | Pending |
| DSC-01 | Phase 5 (DISCOVER — Parallel Research with Provenance) | Pending |
| DSC-02 | Phase 5 (DISCOVER — Parallel Research with Provenance) | Pending |
| DSC-03 | Phase 5 (DISCOVER — Parallel Research with Provenance) | Pending |
| DSC-04 | Phase 5 (DISCOVER — Parallel Research with Provenance) | Pending |
| DSC-05 | Phase 5 (DISCOVER — Parallel Research with Provenance) | Pending |
| DSC-06 | Phase 5 (DISCOVER — Parallel Research with Provenance) | Pending |
| DSC-07 | Phase 5 (DISCOVER — Parallel Research with Provenance) | Pending |
| DSG-01 | Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) | Pending |
| DSG-02 | Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) | Pending |
| DSG-03 | Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) | Pending |
| DSG-04 | Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) | Pending |
| DSG-05 | Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) | Pending |
| DSG-06 | Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) | Pending |
| DSG-07 | Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) | Pending |
| DSG-08 | Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) | Pending |
| DSG-09 | Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) | Pending |
| DSG-10 | Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) | Pending |
| DSG-11 | Phase 6 (Bidirectional Foundation — Phase 1↔2 Return Stack) | Pending |
| DSG-12 | Phase 4 (First Gate — ALIGN Pattern Established) | Pending |
| DSG-13 | Phase 5 (DISCOVER — Parallel Research with Provenance) | Pending |
| DSG-14 | Phase 6 (Bidirectional Foundation — Phase 1↔2 Return Stack) | Pending |
| DLV-01 | Phase 8 (DELIVER — Type A + Type B + AUDIENCE Enforcement) | Pending |
| DLV-02 | Phase 8 (DELIVER — Type A + Type B + AUDIENCE Enforcement) | Pending |
| DLV-03 | Phase 8 (DELIVER — Type A + Type B + AUDIENCE Enforcement) | Pending |
| DLV-04 | Phase 8 (DELIVER — Type A + Type B + AUDIENCE Enforcement) | Pending |
| DLV-05 | Phase 8 (DELIVER — Type A + Type B + AUDIENCE Enforcement) | Pending |
| DLV-06 | Phase 8 (DELIVER — Type A + Type B + AUDIENCE Enforcement) | Pending |
| DLV-07 | Phase 8 (DELIVER — Type A + Type B + AUDIENCE Enforcement) | Pending |
| DLV-08 | Phase 8 (DELIVER — Type A + Type B + AUDIENCE Enforcement) | Pending |
| DLV-09 | Phase 8 (DELIVER — Type A + Type B + AUDIENCE Enforcement) | Pending |
| CC-01 | Phase 7 (DESIGN — Workstream Orchestration + COMPLIANCE Checker) | Pending |
| CC-02 | Phase 5 (DISCOVER — Parallel Research with Provenance) | Pending |
| CC-03 | Phase 8 (DELIVER — Type A + Type B + AUDIENCE Enforcement) | Pending |
| CC-04 | Phase 5 (DISCOVER — Parallel Research with Provenance) | Pending |
| HRD-01 | Phase 9 (Hardening — Cross-Runtime + Pilot) | Pending |
| HRD-02 | Phase 9 (Hardening — Cross-Runtime + Pilot) | Pending |
| HRD-03 | Phase 9 (Hardening — Cross-Runtime + Pilot) | Pending |
| HRD-04 | Phase 9 (Hardening — Cross-Runtime + Pilot) | Pending |
| HRD-05 | Phase 9 (Hardening — Cross-Runtime + Pilot) | Pending |

**Coverage:**

- v1 requirements: 55 total (note: REQUIREMENTS.md initial metadata stated 47; actual count grew to 54 across the listed FND/DEF/DSC/DSG/DLV/CC/HRD items, then +1 HRD-05 added mid-flight 2026-04-18 during Phase 1 HALT-ACCEPTED → 55)
- Mapped to phases: 55 ✓
- Unmapped: 0 ✓

**Per-phase requirement counts:**

| Phase | Requirements | Count |
|-------|--------------|-------|
| Phase 1 (Foundation) | FND-01, FND-02, FND-03, FND-04, FND-06, FND-07 | 6 |
| Phase 2 (Stable Seam) | FND-05, FND-08, FND-09, FND-10 | 4 |
| Phase 3 (DEFINE Canary) | DEF-01, DEF-02, DEF-03, DEF-04, DEF-05, DEF-06 | 6 |
| Phase 4 (ALIGN First Gate) | DSG-12 | 1 |
| Phase 5 (DISCOVER) | DSC-01, DSC-02, DSC-03, DSC-04, DSC-05, DSC-06, DSC-07, DSG-13, CC-02, CC-04 | 10 |
| Phase 6 (Bidirectional Foundation) | DSG-11, DSG-14 | 2 |
| Phase 7 (DESIGN) | DSG-01, DSG-02, DSG-03, DSG-04, DSG-05, DSG-06, DSG-07, DSG-08, DSG-09, DSG-10, CC-01 | 11 |
| Phase 8 (DELIVER) | DLV-01..09, CC-03 | 10 |
| Phase 9 (Hardening) | HRD-01, HRD-02, HRD-03, HRD-04, HRD-05 | 5 |
| **Total** | | **55** |

---
*Requirements defined: 2026-04-18*
*Last updated: 2026-04-27 — HRD-05 added mid-flight (Phase 1 HALT-ACCEPTED residual closure); 55 requirements mapped to 9 phases*
