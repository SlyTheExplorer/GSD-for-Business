---
phase: 07-design-workstream-orchestration-compliance-checker
plan: 06
subsystem: design-workstreams
tags: [financial, operations, tech-arch, drivers, sensitivity, provenance, b2b-fixture, sub-workflow]

# Dependency graph
requires:
  - phase: 07-design-workstream-orchestration-compliance-checker
    provides: "Plan 07-03 /brief-design orchestrator + Step 4.5 stub; Plan 07-05 BMC + GTM + Brand + Risk + Roadmap workstream bundles + workstream-loader 7-field schema"
provides:
  - "OPERATIONS workstream bundle (DSG-04): spec.yaml + design-prompts.md + templates/artifact.md (5 sections: Org & Hiring / Process & SOP / Tool Stack / Cadence / Decision Rights)"
  - "TECH-ARCH workstream bundle (DSG-09 — HIGH-LEVEL boundary): spec.yaml + design-prompts.md + templates/artifact.md (7 sections including boundary callout box + Mermaid component map). Cites Marty Cagan SVPG Experience/Platform topology."
  - "FINANCIAL workstream bundle (DSG-03 — driver-based bottom-up): spec.yaml + design-prompts.md + templates/artifact.md (6 sections) + templates/drivers.md (12-driver schema across 5 categories)"
  - "brief/workflows/design.md Step 4.5 wired (FINANCIAL Q&A branch — only when WORKSTREAM_SLUG === 'financial'); design.md kept at 400 lines (≤400 cap)"
  - "brief/workflows/design-financial-qa.md sub-workflow (233 lines) — full Q1-Q12 wording (Korean + English) + drivers.md persistence + TEXT_MODE batch parser"
  - "B2B canary fixture (tests/fixtures/objectives-b2b-enterprise-saas.md) with compliance_packs:[] for Plan 02 false-positive prevention path"
  - "5 Wave 0 unit tests (40 assertions; T-07-19 / T-07-21 / T-07-22 / T-07-23 STRIDE mitigations green)"
affects: [07-07-state-allowlist, 07-08-canary-e2e, 02-compliance-checker-false-positive]

# Tech tracking
tech-stack:
  added: []  # Zero new runtime deps; preserves BRIEF zero-dep rule
  patterns:
    - "Sub-workflow split (design.md ≤400 lines via @-reference to design-financial-qa.md) — pattern-applicable when a parent workflow's sub-step content would exceed Phase 2 D-18 cap"
    - "Canonical Q&A discipline: enumerated questions with driver names, value types, and provenance tag rules"
    - "Provenance-tag closed set: [VERIFIED:user-supplied] | [ASSUMED:multiplier-X.X] | [FOUNDER-INPUT placeholder] — CC-04 hook BLOCKs anything outside this set"
    - "Cross-workstream awareness blocks in design-prompts.md (e.g., OPERATIONS hiring ↔ FINANCIAL runway; TECH-ARCH integrations ↔ GTM channels)"

key-files:
  created:
    - "brief/workstreams/operations/spec.yaml"
    - "brief/workstreams/operations/design-prompts.md"
    - "brief/workstreams/operations/templates/artifact.md"
    - "brief/workstreams/tech-arch/spec.yaml"
    - "brief/workstreams/tech-arch/design-prompts.md"
    - "brief/workstreams/tech-arch/templates/artifact.md"
    - "brief/workstreams/financial/spec.yaml"
    - "brief/workstreams/financial/design-prompts.md"
    - "brief/workstreams/financial/templates/artifact.md"
    - "brief/workstreams/financial/templates/drivers.md"
    - "brief/workflows/design-financial-qa.md"
    - "tests/brief-workstream-operations.test.cjs"
    - "tests/brief-workstream-tech-arch.test.cjs"
    - "tests/brief-financial-driver-questions.test.cjs"
    - "tests/brief-financial-provenance.test.cjs"
    - "tests/brief-financial-sensitivity.test.cjs"
    - "tests/fixtures/objectives-b2b-enterprise-saas.md"
  modified:
    - "brief/workflows/design.md (Step 4.5 stub → normative inline summary + @-reference to sub-workflow; line count: 399 → 400)"

key-decisions:
  - "Split FINANCIAL Q&A body into brief/workflows/design-financial-qa.md sub-workflow (Plan permission to split when ≤400 cap would be exceeded). The parent design.md keeps 5 inline Step 4.5.A-E sub-step pointers + @-reference, while the sub-workflow holds normative Q1-Q12 wording + drivers.md persistence + TEXT_MODE batch parser."
  - "TECH-ARCH boundary protection: design-prompts.md AND templates/artifact.md combined contain 'NOT detailed design' / 'high-level' >= 2 occurrences. design-prompts.md additionally lists explicit forbidden detail-level content (Interface signatures / Protocol details / Database schema columns / Class hierarchies). Test asserts presence of all 4 forbidden phrases."
  - "FINANCIAL bear/base/bull COSTS inversion (×1.3 in bear, ×0.7 in bull) made explicit in design-prompts.md AND drivers.md. Without this inversion, 'bear' becomes a math noop because the burn ratio collapses; the inversion makes the scenario semantically meaningful per D-15."
  - "B2B fixture sets compliance_packs:[] explicitly to exercise the no-Korea + no-consumer-data path through the COMPLIANCE checker (used by Plan 02 false-positive prevention test)."
  - "Test design uses regex-based grep on workstream files rather than running the full agent. Phase 7 D-09 — workstream tests are file-content tests; agent execution is exercised in Plan 08 canary E2E."

patterns-established:
  - "Pattern: workstream bundle = {spec.yaml, design-prompts.md, templates/artifact.md} with optional templates/{driver,extra}.md sub-files (FINANCIAL adds drivers.md). Loader auto-discovers any directory with spec.yaml."
  - "Pattern: B2B/B2C conditional blocks in design-prompts.md use 'If business_model in [b2b, enterprise]:' and 'If business_model in [b2c, b2b2c]:' headers — D-14 lock"
  - "Pattern: Korean Variant section in design-prompts.md keyed on 'state.brief.region == \"kr\"' with Korean section headers + Korean-specific operational notes (e.g., 본인인증, 결재 라인, 부가가치세, 4대 보험)"
  - "Pattern: cross-workstream alignment notes in design-prompts.md make explicit upstream/downstream artifact dependencies (e.g., FINANCIAL drivers.md → OPERATIONS hiring sequencing constraint)"
  - "Pattern: sub-workflow split via @-reference when parent workflow would exceed line cap — design.md Step 4.5 inline summary + design-financial-qa.md normative body"

requirements-completed: [DSG-03, DSG-04, DSG-09]

# Metrics
duration: ~50min
completed: 2026-04-26
---

# Phase 7 Plan 6: OPERATIONS + TECH-ARCH + FINANCIAL Workstream Bundles Summary

**3 workstream bundles shipped (10 new files), FINANCIAL 12-driver Q&A wired into design.md Step 4.5 via sub-workflow split (design.md = 400 lines), 5 Wave 0 tests green covering 40 assertions (DSG-03 + DSG-04 + DSG-09 + T-07-19/21/22/23 STRIDE mitigations)**

## Performance

- **Duration:** ~50 minutes
- **Started:** 2026-04-25
- **Completed:** 2026-04-26
- **Tasks:** 3 (Task 1 atomic + Task 2 TDD RED→GREEN + Task 3 atomic)
- **Files created:** 17 (10 workstream content + 1 sub-workflow + 5 tests + 1 fixture)
- **Files modified:** 1 (brief/workflows/design.md — Step 4.5 stub → normative inline)

## Accomplishments

- **OPERATIONS workstream (DSG-04):** 5-section template with Org & Hiring / Process & SOP / Tool Stack / Cadence / Decision Rights & Escalation. B2B/B2C lens (sales+CS for B2B; product+marketing+community for B2C). Cross-workstream awareness ties hiring sequencing to FINANCIAL runway.
- **TECH-ARCH workstream (DSG-09 boundary):** 7-section HIGH-LEVEL template (Mermaid component map + Component Responsibilities + Data Flow + Build Sequence + External Dependencies + Out of Scope + Open Questions for Engineering PRD). Boundary callout box + design-prompts.md FORBIDS detailed design (Interface signatures / Protocol details / Database schema columns / Class hierarchies) — T-07-19 mitigation.
- **FINANCIAL workstream (DSG-03 — driver-based bottom-up):** 6-section template + 12-driver schema. Provenance discipline: every projection cell tagged [VERIFIED:user-supplied] or [ASSUMED:multiplier-0.7|1.0|1.3]; missing values tagged [FOUNDER-INPUT placeholder]. Bear/base/bull bands with COSTS inversion (bear ×1.3 costs / bull ×0.7 costs) — semantically meaningful sensitivity. Pitfall #6 mitigation: design-prompts.md explicitly says 'DO NOT invent driver values' + 'bottom-up by contract' + rejects top-down market-share math.
- **design.md Step 4.5 wired:** 12-question Q&A (Q1-Q12 covering Revenue 3 / Customer 2 / Cost 3 / Capital 2 / Time 2). design.md inline summary references sub-workflow (sub-workflow split honored Phase 2 D-18 ≤400-line cap). Sub-workflow design-financial-qa.md (233 lines) carries full Korean + English Q1-Q12 wording + drivers.md persistence + TEXT_MODE consolidated-numbered-list batch parser (FND-06 latency mitigation).
- **B2B fixture for Plan 02:** AcmeIQ B2B Enterprise SaaS fixture with compliance_packs:[] — exercises the no-Korea + no-consumer-data path through COMPLIANCE checker for false-positive prevention testing.
- **5 Wave 0 tests, 40 assertions, all green:** brief-workstream-operations + brief-workstream-tech-arch + brief-financial-driver-questions + brief-financial-provenance + brief-financial-sensitivity.

## Task Commits

Each task was committed atomically:

1. **Task 1: OPERATIONS + TECH-ARCH workstream bundles + B2B fixture** — `e5b88b3` (feat)
2. **Task 2 RED: failing tests for FINANCIAL workstream bundle** — `7dab955` (test)
3. **Task 2 GREEN: FINANCIAL workstream bundle implementation** — `580e944` (feat)
4. **Task 3: Wire Step 4.5 FINANCIAL Q&A into design.md + create design-financial-qa.md sub-workflow** — `63a1992` (feat)

_Note: Task 2 followed TDD discipline — RED commit first (tests fail), then GREEN commit (tests pass). No REFACTOR commit needed — implementation was correct on first GREEN pass._

## Files Created/Modified

### Workstream content (10 files created)
- `brief/workstreams/operations/spec.yaml` — 7-field spec; depends_on=[bmc, gtm]
- `brief/workstreams/operations/design-prompts.md` — B2B/B2C conditional + FINANCIAL runway alignment cross-workstream awareness + Korean variant
- `brief/workstreams/operations/templates/artifact.md` — 5 sections + frontmatter (audience: internal, workstream: operations)
- `brief/workstreams/tech-arch/spec.yaml` — 7-field spec; description includes 'NOT detailed design / high-level' boundary
- `brief/workstreams/tech-arch/design-prompts.md` — Boundary message + B2B/B2C conditional (B2B: SAML/SSO/SCIM; B2C: app stores/payments/attribution) + DO NOT include forbidden detail-level list
- `brief/workstreams/tech-arch/templates/artifact.md` — 7 sections + Boundary callout box + Mermaid skeleton
- `brief/workstreams/financial/spec.yaml` — 7-field spec; description references driver-based bottom-up + Pitfall #6
- `brief/workstreams/financial/design-prompts.md` — 5-step arithmetic recipe + provenance closed set + COSTS inversion rule + B2B/B2C conditional + Korean variant + 'DO NOT invent' + bottom-up math + reject top-down
- `brief/workstreams/financial/templates/artifact.md` — 6 sections (Driver Inputs / Unit Economics / 12-Month Projection / Cash Runway / Sensitivity / Provenance Audit) with provenance-tagged template cells
- `brief/workstreams/financial/templates/drivers.md` — 12 named drivers across 5 sections + Sensitivity bands enumeration

### Workflow files (1 created, 1 modified)
- `brief/workflows/design-financial-qa.md` (NEW, 233 lines) — sub-workflow with Step 4.5.A-E, full Q1-Q12 Korean+English wording, drivers.md persistence, TEXT_MODE batch parser
- `brief/workflows/design.md` (MODIFIED, 399→400 lines) — Step 4.5 stub replaced with normative inline summary + @-reference to sub-workflow

### Tests (5 created)
- `tests/brief-workstream-operations.test.cjs` — 10 tests covering DSG-04 acceptance + 7-field schema + B2B fixture existence
- `tests/brief-workstream-tech-arch.test.cjs` — 11 tests covering DSG-09 boundary protection (T-07-19) + 7-field schema + 7 sections
- `tests/brief-financial-driver-questions.test.cjs` — 8 tests covering 12 drivers + 5 categories + reporting_currency
- `tests/brief-financial-provenance.test.cjs` — 7 tests covering [VERIFIED:user-supplied] / [ASSUMED:multiplier-] / [FOUNDER-INPUT] + 'DO NOT invent' + bottom-up
- `tests/brief-financial-sensitivity.test.cjs` — 4 tests covering bear/base/bull keywords + 0.7/1.0/1.3 multipliers + COSTS inversion

### Fixtures (1 created)
- `tests/fixtures/objectives-b2b-enterprise-saas.md` — B2B canary fixture (AcmeIQ Enterprise SaaS, compliance_packs:[], for Plan 02 false-positive prevention)

## Decisions Made

- **Sub-workflow split** for the FINANCIAL Step 4.5 body: Plan 06 Task 3 explicitly permits the split when ≤400 line cap is exceeded; the inline body would have pushed design.md to ~430 lines. Splitting honors Phase 2 D-18 cap while keeping the orchestrator readable. Pattern is now established for future workflow files that need to grow: a parent workflow holds an inline summary + @-reference, and the sub-workflow holds normative content. Acceptance criteria are split-aware (12 questions can live in the sub-workflow because design.md references it by file pointer).
- **TECH-ARCH boundary protection** uses both linguistic and structural defenses: design-prompts.md has a "Boundary (CRITICAL — DSG-09 contract)" header at the top + a DO NOT list with explicit forbidden phrases (Interface signatures / Protocol details / Database schema columns / Class hierarchies); templates/artifact.md has a Boundary callout box at the top of the artifact body. T-07-19 test asserts both files contain >= 2 boundary phrases combined and that design-prompts.md has all 4 forbidden phrases enumerated.
- **FINANCIAL COSTS inversion** is documented in 4 places: design-prompts.md Step 3 instruction, design-prompts.md DO NOT discipline section, drivers.md Sensitivity bands section, and templates/artifact.md month-row example provenance tags. Without the inversion, the bear/bull scenarios become math noops (because revenue and costs scale the same direction); making it explicit in 4 places is the structural defense.
- **B2B fixture compliance_packs:[]** is the load-bearing field — Plan 02 false-positive test uses this fixture to verify CEO-personal-liability does NOT fire when there's no Korea + no consumer data. The fixture also has region:us, model:enterprise, industry:saas to round out the no-Korea-no-consumer profile.
- **Provenance closed-set design:** the closed set [VERIFIED:user-supplied] | [ASSUMED:multiplier-0.7|1.0|1.3] | [FOUNDER-INPUT placeholder] enables the Phase 5 CC-04 pre-commit hook to BLOCK any cell whose provenance tag falls outside this set. The hook is defense-in-depth — by construction, the design-prompts.md instructions should prevent any out-of-set tag, but the hook catches violations at commit time.

## Deviations from Plan

None — plan executed exactly as written.

The Plan 06 acceptance criteria allowed for the sub-workflow split (Task 3 explicitly stated: "If [the inline body] pushes past 400 lines, split out the FINANCIAL Step 4.5 body into `brief/workflows/design-financial-qa.md` (sub-workflow file, included via @-reference). Document the split in CLAUDE.md if needed."). The split was exercised because the inline 12-question body exceeded the 400-line cap. CLAUDE.md update is NOT needed — the split is internal workflow architecture, not a project-level convention shift.

## Issues Encountered

- **400-line cap precision:** the design.md modification required several iterations of compression to hit exactly 400 lines while preserving the acceptance-criteria grep counts (Step 4.5 ≥ 4, TEXT_MODE batch ≥ 1, drivers.md ≥ 2). Resolved by careful prose wrapping that puts each Step 4.5.X sub-step pointer on its own line (giving 5 line-matches against `Step 4.5`) while keeping the total inline section to 6 lines (heading + blank + 4 prose lines + final pointer line). Final design.md = 400 lines exactly; verification command `wc -l brief/workflows/design.md | awk '{exit ($1 > 400) ? 1 : 0}'` passes.
- **B2C/B2B conditional regex:** initial plan check expected `/If business_model in \[b2b/i` etc; my templates used the exact phrasing matching the existing BMC/GTM workstreams (already passes). No deviation needed.

## Next Plan Readiness

- Plan 07-07 (state allowlist extension) needs to add `brief.financial_drivers` and `brief.workstream_paused` to the allowlist — design.md and design-financial-qa.md reference these fields.
- Plan 07-08 (canary E2E) will exercise:
  - The full /brief-design financial flow: Step 4.5 sub-workflow → drivers.md write → Step 5 Task spawn with <financial_drivers> injection → 3-gate threading.
  - The B2B fixture (objectives-b2b-enterprise-saas.md) for false-positive prevention in COMPLIANCE checker.
- All 9 built-in workstreams now loadable via workstream-loader.cjs (BMC + GTM + Brand + Risk + Roadmap from Plan 05; OPERATIONS + TECH-ARCH + FINANCIAL from this plan; COMPLIANCE was already in tree before Phase 7).
- DSG-03, DSG-04, DSG-09 acceptance prep complete pending Plan 08 canary verification.

## Self-Check: PASSED

- 17 created files all exist and Read-confirmed during execution.
- 1 modified file (design.md) verified at 400 lines (≤400 cap).
- 4 commits in git log:
  - `e5b88b3` — Task 1 (OPERATIONS + TECH-ARCH + B2B fixture)
  - `7dab955` — Task 2 RED (failing tests)
  - `580e944` — Task 2 GREEN (FINANCIAL bundle)
  - `63a1992` — Task 3 (design.md Step 4.5 + design-financial-qa.md)
- 40 Plan 06 test assertions pass (5 test files run via node --test).
- 27 design-orchestration regression tests pass.

---
*Phase: 07-design-workstream-orchestration-compliance-checker*
*Plan: 06*
*Completed: 2026-04-26*
