---
phase: 07-design-workstream-orchestration-compliance-checker
plan: 05
subsystem: workstreams
tags: [bmc, gtm, brand, risk, roadmap, compliance, workstream-content, korea-canary]

# Dependency graph
requires:
  - phase: 02-stable-seam-foundations
    provides: workstream-loader.cjs + 7-field spec.yaml schema (Phase 2 D-13 + Phase 7 D-13)
  - phase: 04-align-checker
    provides: ALIGN gate (first cross-cutting checker; pattern reused in CC-01)
  - phase: 05-discover-orchestration
    provides: B2B/B2C conditional pattern (D-15) + provenance discipline (CC-04) + Korea primers (D-04)
provides:
  - 6 of the 9 built-in workstream content bundles (BMC, GTM, BRAND, RISK, ROADMAP, COMPLIANCE)
  - Canary OBJECTIVES.md fixture for Plan 08 E2E (Korean B2C fintech with PIPA + ISMS-P + MyData)
  - Strategyzer 9-block BMC canonical artifact template
  - Sequoia-derived 9-section GTM artifact template with B2B/B2C variant content
  - Asana-framework BRAND artifact template (Voice / Tone / Messaging / Positioning + Korean variant)
  - 5-category Risk Register template (Technology / Market / Regulatory / Financial / Operational)
  - 4-horizon Business Roadmap template (Now / Near / Mid / Far) — explicitly distinct from BRIEF tool roadmap
  - COMPLIANCE workstream artifact template (DSG-05) — distinct from CC-01 checker; auto-loads Korea primers
affects: [07-06-PLAN, 07-07-PLAN, 07-08-PLAN, plan-08-canary-e2e]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Workstream-as-config: each workstream is 3 markdown files (spec.yaml + design-prompts.md + templates/artifact.md). No .cjs source per workstream (FND-08 inheritance preserved)."
    - "B2B/B2C conditional prose blocks (D-14): every design-prompts.md has explicit `If business_model in [b2b, enterprise]:` AND `If business_model in [b2c, b2b2c]:` sections per Phase 5 D-15 pattern."
    - "Korean variant section convention (region:kr): each artifact template's Korean variant section emits region-specific content (honorifics for BRAND, Korean disclaimer wording for COMPLIANCE, Korean section headers for BMC, etc.)."
    - "Provenance audit footer (Phase 5 CC-04): every artifact template ends with a Sources section listing OBJECTIVES.md / DISCOVER outputs / primer files / web citations with [VERIFIED:source|date] tags."
    - "Cross-workstream cross-reference convention: each artifact's Sources footer cites adjacent workstream artifacts (BMC → GTM → BRAND etc.) so completed prior workstreams flow into downstream ones."

key-files:
  created:
    - brief/workstreams/business-model-canvas/spec.yaml
    - brief/workstreams/business-model-canvas/design-prompts.md
    - brief/workstreams/business-model-canvas/templates/artifact.md
    - brief/workstreams/go-to-market/spec.yaml
    - brief/workstreams/go-to-market/design-prompts.md
    - brief/workstreams/go-to-market/templates/artifact.md
    - brief/workstreams/brand/spec.yaml
    - brief/workstreams/brand/design-prompts.md
    - brief/workstreams/brand/templates/artifact.md
    - brief/workstreams/risk/spec.yaml
    - brief/workstreams/risk/design-prompts.md
    - brief/workstreams/risk/templates/artifact.md
    - brief/workstreams/roadmap/spec.yaml
    - brief/workstreams/roadmap/design-prompts.md
    - brief/workstreams/roadmap/templates/artifact.md
    - brief/workstreams/compliance/spec.yaml
    - brief/workstreams/compliance/design-prompts.md
    - brief/workstreams/compliance/templates/artifact.md
    - tests/brief-workstream-bmc.test.cjs
    - tests/brief-workstream-gtm.test.cjs
    - tests/brief-workstream-brand.test.cjs
    - tests/brief-workstream-risk.test.cjs
    - tests/brief-workstream-roadmap.test.cjs
    - tests/brief-workstream-compliance.test.cjs
    - tests/fixtures/objectives-korea-b2c-fintech.md
  modified: []

key-decisions:
  - "All 6 spec.yaml files carry the full 7-field schema (Phase 2 D-13 + Phase 7 D-13 extension): name, description, research_prompts, design_prompts, output_artifact_template, gates_required: [align, audience, compliance], depends_on: [...]."
  - "depends_on values follow D-07 soft-recommended order: BMC ← GTM ← BRAND, BMC ← RISK / ROADMAP / COMPLIANCE. Empty for BMC (canonical first workstream)."
  - "Each design-prompts.md includes explicit `If business_model in [b2b, enterprise]:` AND `If business_model in [b2c, b2b2c]:` conditional blocks (D-14). Tests assert presence of both."
  - "T-07-15 anti-spoofing for ROADMAP: distinction between this workstream's business-roadmap.md and BRIEF tool's .planning/ROADMAP.md is asserted in spec.yaml description, design-prompts.md disclaimer, AND artifact header — defense in depth."
  - "T-07-20 anti-spoofing for COMPLIANCE: 'distinct from CC-01' wording present in spec.yaml description AND design-prompts.md (defense in depth). The DSG-05 workstream produces ONE artifact per /brief-design invocation; the CC-01 checker is a cross-cutting gate that runs on EVERY artifact."
  - "Korean disclaimer for COMPLIANCE artifact is a verbatim string anchored on brief/references/compliance/korea/pipa-2026.md per Phase 7 D-03. Frontmatter declares korean_disclaimer_when_region_is field for downstream tooling."
  - "Canary fixture at tests/fixtures/objectives-korea-b2c-fintech.md exercises a real-world Korean B2C fintech flow: region:kr, business_model:b2c, compliance_packs: [PIPA, ISMS-P, MyData]. Used by Plan 08 E2E."

patterns-established:
  - "6-test-pattern for workstream bundles: each tests/brief-workstream-{slug}.test.cjs follows the same 9-13 test shape (7 fields / gates_required default / depends_on / B2B + B2C blocks / canonical sections / frontmatter / loader)"
  - "Workstream content templates use {{handlebars-style}} placeholders for context-injected variables (business_model, region, voice, project_name) — these are populated by the orchestrator at /brief-design Task spawn time"
  - "Korean variant section is OPTIONAL section in artifact (emitted only when state.brief.region == kr); design-prompts.md instructs the LLM to emit/skip the section conditionally"

requirements-completed: [DSG-01, DSG-02, DSG-05, DSG-06, DSG-07, DSG-08]

# Metrics
duration: 12 min
completed: 2026-04-25
---

# Phase 7 Plan 5: Workstream Content Bundles (BMC + GTM + BRAND + RISK + ROADMAP + COMPLIANCE) Summary

**Six built-in workstream bundles shipped — Strategyzer 9-block BMC, Sequoia-derived 9-section GTM, Asana-framework BRAND with Korean honorific variant, 5-category Risk Register, 4-horizon Business Roadmap (distinct from BRIEF tool roadmap), and Korea-first COMPLIANCE workstream (DSG-05; distinct from CC-01 checker) with auto-loaded PIPA + ISMS-P + MyData primers and verbatim Korean legal-counsel disclaimer — plus canary OBJECTIVES.md fixture for Plan 08 E2E.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-25T13:58:16Z
- **Completed:** 2026-04-25T14:10:18Z
- **Tasks:** 3 atomic commits
- **Files created:** 25 (18 workstream content + 6 tests + 1 fixture)
- **Files modified:** 0

## Accomplishments

- **6 workstream content bundles shipped** — BMC, GTM, BRAND, RISK, ROADMAP, COMPLIANCE — all carrying the Phase 2 D-13 + Phase 7 D-13 7-field spec.yaml schema, B2B/B2C conditional design-prompts.md (D-14), and AUDIENCE-mandatory frontmatter on templates/artifact.md.
- **Canary OBJECTIVES fixture** at `tests/fixtures/objectives-korea-b2c-fintech.md` modeled after a Korean B2C fintech (페이앱) with realistic Korean prose, PIPA + ISMS-P + MyData compliance packs, monetization hypotheses, GTM motion, and key risks. Plan 08 E2E will exercise the full /brief-design pipeline against this fixture.
- **6 unit test files** (60 individual tests total) — each asserts spec.yaml field presence, gates_required default, depends_on values, B2B + B2C conditional blocks, canonical section names, frontmatter shape, and round-trip loader compatibility.
- **Anti-spoofing mitigations** — T-07-15 (ROADMAP vs BRIEF tool ROADMAP.md) and T-07-20 (COMPLIANCE workstream vs CC-01 checker) implemented as defense-in-depth: distinction language in spec.yaml description AND design-prompts.md AND artifact template, with structural test assertions.
- **All 6 workstreams discoverable via workstream-loader.cjs** without any source change to the loader (FND-08 architectural property preserved).

## Task Commits

Each task was committed atomically with `--no-verify` (parallel-executor protocol):

1. **Task 1: Ship BMC + GTM workstream bundles + canary fixture (DSG-01, DSG-02)** — `c9573a2` (feat)
   - 9 files created: BMC bundle (spec.yaml + design-prompts.md + templates/artifact.md), GTM bundle (3 files), 2 test files, 1 canary fixture.
2. **Task 2: Ship BRAND + RISK + ROADMAP workstream bundles (DSG-06, DSG-07, DSG-08)** — `31c05e2` (feat)
   - 12 files created: BRAND, RISK, ROADMAP bundles (3 files each = 9) + 3 test files.
3. **Task 3: Ship COMPLIANCE workstream bundle (DSG-05; distinct from CC-01)** — `351098d` (feat)
   - 4 files created: COMPLIANCE bundle (3 files) + 1 test file.

**Plan metadata:** to be added in final commit (SUMMARY.md).

## Files Created

### Workstream content (18 files)

- `brief/workstreams/business-model-canvas/spec.yaml` — 7-field spec; gates_required `[align, audience, compliance]`; depends_on `[]`.
- `brief/workstreams/business-model-canvas/design-prompts.md` — Strategyzer 9-block prose with B2B + B2C conditional blocks + Korean variant section + Lean Canvas variant note.
- `brief/workstreams/business-model-canvas/templates/artifact.md` — 9 canonical sections (Customer Segments / Value Propositions / Channels / Customer Relationships / Revenue Streams / Key Resources / Key Activities / Key Partners / Cost Structure) + Sources footer.
- `brief/workstreams/go-to-market/{spec.yaml,design-prompts.md,templates/artifact.md}` — 9 GTM sections (Target Market / Positioning / Pricing / Sales Motion / Channels / Demand Gen / Sales Enablement / Launch / KPIs); B2B/B2C variant content per Sequoia + DealHub references.
- `brief/workstreams/brand/{spec.yaml,design-prompts.md,templates/artifact.md}` — 4 sections (Positioning / Voice / Tone Matrix / Messaging Framework with 3-5 pillars) + Korean variant (honorifics, pitch order, idiom substitution).
- `brief/workstreams/risk/{spec.yaml,design-prompts.md,templates/artifact.md}` — 5-category register (Technology / Market / Regulatory / Financial / Operational) + Top 5 + Quarterly Review Cadence.
- `brief/workstreams/roadmap/{spec.yaml,design-prompts.md,templates/artifact.md}` — 4 horizons (Now / Near / Mid / Far) + Critical Path + Risks + Assumptions; explicit "distinct from BRIEF tool's .planning/ROADMAP.md" disclaimer.
- `brief/workstreams/compliance/{spec.yaml,design-prompts.md,templates/artifact.md}` — 7 sections including CEO Personal Liability Surface (region:kr only) + Mandatory Legal Counsel Disclaimer (Korean verbatim from pipa-2026.md primer); description and design-prompts.md both say "distinct from CC-01".

### Tests (6 files, 60 tests total)

- `tests/brief-workstream-bmc.test.cjs` — 9 tests; asserts 9 Strategyzer canonical sections + canary fixture existence.
- `tests/brief-workstream-gtm.test.cjs` — 9 tests; asserts 9 canonical GTM sections + depends_on includes business-model-canvas.
- `tests/brief-workstream-brand.test.cjs` — 9 tests; asserts 4 canonical sections + Korean variant + depends_on includes BMC and GTM.
- `tests/brief-workstream-risk.test.cjs` — 10 tests; asserts all 5 categories + Top 5 + Quarterly Review Cadence + depends_on BMC.
- `tests/brief-workstream-roadmap.test.cjs` — 10 tests; asserts 4 horizons + Critical Path + Risks + Assumptions + T-07-15 anti-spoofing.
- `tests/brief-workstream-compliance.test.cjs` — 14 tests; asserts 7 canonical sections + Korean disclaimer condition + Korea primers referenced + ban-list discipline + T-07-20 anti-spoofing in spec.yaml description AND design-prompts.md.

### Canary fixture (1 file)

- `tests/fixtures/objectives-korea-b2c-fintech.md` — OBJECTIVES.md for "페이앱" (Korean B2C fintech). Frontmatter declares `region: kr`, `business_model: b2c`, `compliance_packs: [PIPA, ISMS-P, MyData]`. Body is realistic Korean prose with English glosses for non-Korean reviewers; covers Immutable Intent, target_audience, monetization, gtm_motion, compliance_packs, key_competitors, key_risks. Used by Plan 08 canary E2E test.

## Decisions Made

- **Workstream content sources cited per Phase 5 CC-04 provenance discipline:**
  - BMC ← Strategyzer 9-block canonical reference (`[CITED:strategyzer.com/library/the-business-model-canvas|2026-04-25]`)
  - GTM ← Sequoia 10-slide structure + DealHub ICP-vs-buyer-persona + Vendedigital B2B GTM playbook
  - BRAND ← Asana brand messaging framework + Kedraco messaging-pillars best practice + LinkedIn Korean investor pitch convention
  - RISK ← MetricStream 5-category risk taxonomy
  - COMPLIANCE ← Phase 5 D-04 inherited Korea primers (PIPA / ISMS-P / MyData)
- **B2B/B2C conditional pattern uses Phase 5 D-15 prose convention:** explicit `If business_model in [b2b, enterprise]:` and `If business_model in [b2c, b2b2c]:` blocks. Tests assert literal token presence.
- **Korean variant approach:** rather than separate locale files, each design-prompts.md and templates/artifact.md has a `## Korean Variant (region: kr only)` section that the LLM emits/skips conditionally based on `state.brief.region`. Keeps workstream content single-file per concept; orchestrator does the locale dispatch.
- **Lean Canvas variant deferred to v2:** BMC design-prompts.md notes the `business_model_canvas_variant: lean` toggle but v1 ships only the Strategyzer 9-block default. Forward-compatibility documented; no v1 implementation cost.

## Deviations from Plan

None - plan executed exactly as written.

The plan's task structure, file lists, and acceptance criteria were followed verbatim. All test assertions were structured around the plan's specified canonical sections and conditional-block tokens. No Rule 1/2/3 deviations were necessary; no Rule 4 architectural changes arose.

## Issues Encountered

None.

## Authentication Gates

None — this plan is pure markdown-content authoring + node:test additions; no CLI tooling, no external services, no auth gates.

## Threat Flags

Reviewed all created files for new security-relevant surface NOT in the plan's `<threat_model>`. None found:

- No new network endpoints, file-access patterns, or schema changes at trust boundaries.
- All YAML files parse via the existing `brief/bin/lib/yaml-mini.cjs` (T-02-05-01 prototype-pollution guard + T-02-05-03 input-size cap inherited).
- All workstream paths resolve within the workstream directory (T-02-05-02 directory-traversal guard inherited via workstream-loader.cjs).
- COMPLIANCE design-prompts.md references the compliance-vocabulary.md ban-list as a forthcoming reference (Plan 07-01 / 07-02 territory); the ban-list itself is NOT created by this plan, so no new vocabulary surface is introduced here.

## Next Phase Readiness

Plan 07-05 ships 6 of the 9 built-in workstreams. Remaining work in Phase 7:

- **Plan 07-06** (Wave 1): FINANCIAL (driver-based bottom-up Q&A; DSG-03), OPERATIONS (DSG-04), TECH-ARCH (DSG-09).
- **Plan 07-01 / 07-02** (Wave 1, parallel): COMPLIANCE checker triad (CC-01) — the cross-cutting gate that runs on every artifact, distinct from the COMPLIANCE workstream shipped here.
- **Plan 07-07** (Wave 2): /brief-add-workstream dynamic addition.
- **Plan 07-03 / 07-04**: /brief-design orchestrator + 3-gate sequence (ALIGN → AUDIENCE → COMPLIANCE checker).
- **Plan 07-08** (Wave 4): canary E2E test using the fixture this plan shipped.

The 6 workstreams shipped here are immediately consumable by Plan 07-03 (/brief-design orchestrator) for Task spawn at runtime. The canary fixture is immediately consumable by Plan 07-08 for E2E pipeline validation.

## Self-Check: PASSED

All claimed files exist on disk:
- `brief/workstreams/business-model-canvas/{spec.yaml,design-prompts.md,templates/artifact.md}` — FOUND
- `brief/workstreams/go-to-market/{spec.yaml,design-prompts.md,templates/artifact.md}` — FOUND
- `brief/workstreams/brand/{spec.yaml,design-prompts.md,templates/artifact.md}` — FOUND
- `brief/workstreams/risk/{spec.yaml,design-prompts.md,templates/artifact.md}` — FOUND
- `brief/workstreams/roadmap/{spec.yaml,design-prompts.md,templates/artifact.md}` — FOUND
- `brief/workstreams/compliance/{spec.yaml,design-prompts.md,templates/artifact.md}` — FOUND
- `tests/brief-workstream-{bmc,gtm,brand,risk,roadmap,compliance}.test.cjs` — FOUND
- `tests/fixtures/objectives-korea-b2c-fintech.md` — FOUND

All 3 commits exist in git log:
- `c9573a2` (Task 1: BMC + GTM + canary) — FOUND
- `31c05e2` (Task 2: BRAND + RISK + ROADMAP) — FOUND
- `351098d` (Task 3: COMPLIANCE) — FOUND

All acceptance criteria re-verified:
- 6 workstream folders × 3 files each = 18 NEW workstream content files — VERIFIED
- 1 canary fixture — VERIFIED
- 6 unit test files; 60/60 tests green — VERIFIED via `node --test tests/brief-workstream-*.test.cjs`
- All 6 new workstreams loadable via workstream-loader (`loadWorkstreams(process.cwd()).filter(w => ['business-model-canvas','go-to-market','brand','risk','roadmap','compliance'].includes(w.slug)).length === 6`) — VERIFIED
- ROADMAP has explicit distinction from BRIEF tool's .planning/ROADMAP.md (T-07-15) — VERIFIED in spec.yaml + design-prompts.md + artifact template
- COMPLIANCE has explicit "distinct from CC-01" wording (T-07-20) — VERIFIED in spec.yaml description + design-prompts.md
- Existing workstream-loader tests still pass (no regression) — VERIFIED via `node --test tests/workstream-loader-*.test.cjs` (17/17 green)

---
*Phase: 07-design-workstream-orchestration-compliance-checker*
*Completed: 2026-04-25*
