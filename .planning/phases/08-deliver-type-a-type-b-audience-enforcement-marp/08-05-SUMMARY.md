---
phase: 08-deliver-type-a-type-b-audience-enforcement-marp
plan: 05
subsystem: deliver-type-a
tags: [type-a, agent, templates, b2b, b2c, conditional-prose, mermaid, mindmap, synthesis, deliver, brief-deliver-type-a, parameterized-agent]

# Dependency graph
requires:
  - phase: 08-deliver-type-a-type-b-audience-enforcement-marp
    provides: brief/bin/lib/deliver.cjs SYNTHESIS_MAP + applyConditionalProse + extractMarkdownSection (Plan 01 Wave 1)
  - phase: 05-discover-parallel-research-with-provenance-audience-context-injection
    provides: agents/brief-domain-researcher.md (parameterized agent template byte-identity to mirror)
  - phase: 07-design-workstream-orchestration-compliance-checker
    provides: B2B/B2C conditional prose pattern (D-14) + 9 workstream artifact substrate
provides:
  - parameterized Type A synthesis agent (agents/brief-deliver-type-a.md, single file, {{ARTIFACT}} ∈ product-brief / service-policy / high-level-spec / feature-map)
  - 4 production templates under brief/templates/deliver/type-a/ matching SYNTHESIS_MAP byte-identically
  - service-policy.md B2B/B2C conditional prose blocks with 4 keywords each (Phase 7 D-14)
  - feature-map.md Mermaid mindmap + ASCII tree fallback strategy
  - 12 Wave 0 RED→GREEN tests asserting agent + template structural contract
affects:
  - 08-04 (commands/brief/deliver.md dispatcher — invokes agent via Task tool with {{ARTIFACT}} parameterization)
  - 08-08 (workflows/deliver.md orchestrator + canary E2E — consumes agent + templates end-to-end)
  - 08-07 (Marp Type B agent — mirrors the parameterized-agent pattern established here)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "parameterized agent at Task-spawn time via {{ARTIFACT}} ∈ frozen TYPE_A_ARTIFACTS list (Phase 5 D-01 byte-identity)"
    - "templates matching deliver.cjs SYNTHESIS_MAP via literal substring placeholder replace (no regex/fuzzy match)"
    - "B2B/B2C conditional prose via Phase 7 D-14 marker pairs (`<!--BEGIN/END business_model: X-->`)"
    - "Mermaid `mindmap` preferred + ASCII tree fallback (renderer-agnostic visual feature tree)"
    - "5 mandatory frontmatter fields + voice.languages + deliverable + generated_by + generated_at on every Type A artifact"

key-files:
  created:
    - "agents/brief-deliver-type-a.md (314 lines, {{ARTIFACT}} 20×) — parameterized Type A synthesis agent"
    - "brief/templates/deliver/type-a/product-brief.md (67 lines) — Customer Segments + Value Proposition + Personas + Immutable Intent"
    - "brief/templates/deliver/type-a/service-policy.md (101 lines) — Process + Tools + Documented obligations addressed + B2B/B2C tier blocks"
    - "brief/templates/deliver/type-a/high-level-spec.md (84 lines) — Component Map + Phased Roadmap + Critical Risks + Immutable Intent"
    - "brief/templates/deliver/type-a/feature-map.md (54 lines) — Mermaid mindmap + ASCII tree fallback"
    - "tests/brief-deliver-type-a-templates.test.cjs (212 lines, 12 tests) — Wave 0 RED→GREEN structural contract"
  modified: []

key-decisions:
  - "ONE agent file parameterized via {{ARTIFACT}} (Phase 5 D-01 byte-identity) — NOT 4 separate per-artifact agents; preserves surface cap (NET +1 agent for Type A; Plan 06 will add NET +1 for Type B = 2 total NET agents for Phase 8)"
  - "B2B/B2C conditional prose ships in service-policy.md ONLY (per SYNTHESIS_MAP['service-policy'].conditionalProse=true); other 3 templates have no conditional prose — keeps deliver.cjs applyConditionalProse scope minimal"
  - "feature-map.md ships BOTH Mermaid mindmap + ASCII tree fallback in same template; deliver.cjs fills both placeholder forms identically (renderer chooses preferred at view time)"
  - "Agent body inherits brief-domain-researcher.md anti-patterns + provenance discipline + vocabulary discipline VERBATIM with synthesis-specific adaptation; minimizes drift from Phase 5 patterns"
  - "Templates carry voice.languages: {{languages}} placeholder (Phase 8 D-21 array form) — deliver.cjs runtime composes ['ko'] | ['en'] | ['ko', 'en'] per Phase 8 D-D03 from <business_context>"

patterns-established:
  - "Pattern: parameterized DELIVER agent at Task-spawn time — replicates Phase 5 brief-domain-researcher pattern. Plan 06 brief-deliver-type-b.md will mirror with {{ARTIFACT}} ∈ {internal-deck, proposal-deck, investor-ir, exec-summary, decision-memo}."
  - "Pattern: templates contain `<!-- INSERT: ## {section} -->` placeholders matching deliver.cjs SYNTHESIS_MAP byte-identically — literal substring replace at synthesis time, no regex match."
  - "Pattern: conditional prose blocks (`<!--BEGIN business_model: X-->...<!--END business_model: X-->`) ship in template; applyConditionalProse strips non-matching block at synthesis. Mismatched markers leave both blocks intact (safe failure mode)."
  - "Pattern: anti-pattern triad on every BRIEF agent — NEVER hallucinate / NEVER use pass/fail vocabulary / NOT auto-attached via PostToolUse / SubagentStop hooks."

requirements-completed: [DLV-01, DLV-02, DLV-03, DLV-04]

# Metrics
duration: 22min
completed: 2026-04-26
---

# Phase 8 Plan 5: Type A Agent + 4 Production Templates Summary

**Parameterized brief-deliver-type-a agent (single file, {{ARTIFACT}} substituted at Task-spawn time) + 4 PRD-input templates (product-brief, service-policy with B2B/B2C conditional prose, high-level-spec, feature-map with Mermaid mindmap + ASCII fallback) matching deliver.cjs SYNTHESIS_MAP byte-identically.**

## Performance

- **Duration:** ~22 min
- **Started:** 2026-04-26 (Wave 2)
- **Completed:** 2026-04-26
- **Tasks:** 2 (TDD: RED → GREEN)
- **Files created:** 6 (1 agent + 4 templates + 1 test)

## Accomplishments

- Single parameterized Type A synthesis agent (`agents/brief-deliver-type-a.md`) with `{{ARTIFACT}}` substituted at Task-spawn time — preserves Phase 5 D-01 byte-identity to brief-domain-researcher.md, keeps surface cap at NET +1 agent.
- 4 production templates under `brief/templates/deliver/type-a/` ship with section markers byte-identical to `brief/bin/lib/deliver.cjs` SYNTHESIS_MAP entries (Plan 01 Wave 1 contract).
- service-policy.md ships BOTH B2B and B2C conditional prose blocks with 4 substantive keywords each (SLA tiers / enterprise support / data processing / contract terms; refund policy / customer support hours / channel coverage / community guidelines) — applyConditionalProse keeps only the matching block at synthesis.
- feature-map.md ships Mermaid `mindmap` (preferred) + ASCII tree fallback — renderer-agnostic visual feature tree.
- 12 Wave 0 RED→GREEN tests asserting agent + template structural contract (existence + frontmatter + INSERT placeholders + conditional prose markers + Mermaid block + anti-pattern triad).

## Task Commits

Each task was committed atomically (TDD discipline):

1. **Task 1: Wave 0 RED test** — `80a01ab` (test) — 12 failing tests asserting agent + 4 templates do not exist yet
2. **Task 2: GREEN implementation** — `da94e25` (feat) — agent + 4 templates ship; 12/12 RED→GREEN; Plan 01 7/7 still GREEN

**Plan metadata:** (this SUMMARY commit)

## Files Created/Modified

- `agents/brief-deliver-type-a.md` (314 lines, NEW) — Parameterized Type A synthesis agent. {{ARTIFACT}} 20×; tools=Read/Grep/Glob/Write; color=green; mirrors brief-domain-researcher.md byte-identity with synthesis adaptation.
- `brief/templates/deliver/type-a/product-brief.md` (67 lines, NEW) — 4 INSERT placeholders: ## Customer Segments / ## Value Proposition / ## Personas / ## Immutable Intent.
- `brief/templates/deliver/type-a/service-policy.md` (101 lines, NEW) — 3 INSERT placeholders + 2 conditional prose blocks (B2B + B2C). Trailing-colon `## Documented obligations addressed:` matches SYNTHESIS_MAP byte-identically.
- `brief/templates/deliver/type-a/high-level-spec.md` (84 lines, NEW) — 4 INSERT placeholders: ## Immutable Intent / ## Component Map / ## Phased Roadmap / ## Critical Risks. Dependencies section is prose-only (inferred from Component Map + Roadmap, not a separate workstream).
- `brief/templates/deliver/type-a/feature-map.md` (54 lines, NEW) — Mermaid mindmap block (preferred) + ASCII tree fallback. Both blocks reference Component Map + Value Proposition; deliver.cjs synthesis fills both forms.
- `tests/brief-deliver-type-a-templates.test.cjs` (212 lines, NEW) — 12 tests covering: existence, frontmatter (5 mandatory + voice.languages + deliverable + generated_by + generated_at), INSERT placeholders byte-identical to SYNTHESIS_MAP, B2B/B2C marker pairs, B2B/B2C keyword content (case-insensitive), Mermaid mindmap block, agent {{ARTIFACT}} count ≥ 5, agent anti-pattern triad.

## Type A Agent — Role + 5-Step Process

**Role:** "What should the {{ARTIFACT}} contain for this project, drawn from existing workstream outputs?" — produces a single markdown file at {{OUT_PATH}} matching the {{ARTIFACT}} schema.

**Process:**
1. Read required-reading: OBJECTIVES.md + PROJECT.md + template at brief/templates/deliver/type-a/{{artifact-key}}.md + source workstream artifacts.
2. Parse `<business_context>` block — extract business_model, region, language, audience_policy, compliance_packs.
3. Extract requested ## sections from each source artifact via heading match (same algorithm as deliver.cjs extractMarkdownSection — exact heading line match → next same-or-higher-level heading → trim).
4. Read OBJECTIVES.md ## Immutable Intent if {{ARTIFACT}} ∈ {product-brief, high-level-spec}.
5. Fill template `<!-- INSERT: ## {section} -->` placeholders with extracted content. For service-policy.md, applyConditionalProse runs AFTER synthesis to drop non-matching B2B/B2C block. Compose 5-mandatory-fields frontmatter + voice.languages + deliverable + generated_by + generated_at. Write atomically to {{OUT_PATH}}.

## 4 Templates Inventory

| Template | Lines | INSERT placeholders | Conditional prose | Special features |
|----------|------:|--------------------:|:------------------|:-----------------|
| product-brief.md   |  67 | 4 (Customer Segments + Value Proposition + Personas + Immutable Intent) | none | OBJECTIVES.md + canvas.md + go-to-market.md sources |
| service-policy.md  | 101 | 3 (Process + Tools + Documented obligations addressed:) | **B2B + B2C blocks** | Trailing-colon section name byte-identical to SYNTHESIS_MAP; applyConditionalProse(business_model) drops non-matching block |
| high-level-spec.md |  84 | 4 (Immutable Intent + Component Map + Phased Roadmap + Critical Risks) | none | Dependencies section is prose-only (inferred from Component Map + Roadmap) |
| feature-map.md     |  54 | 2 INSERT + 2 INSERT-ASCII (Component Map + Value Proposition) | none | **Mermaid `mindmap` preferred + ASCII tree fallback** |

## service-policy.md B2B/B2C Keyword Inventory

**B2B block** (`<!--BEGIN business_model: b2b-->`...`<!--END business_model: b2b-->`):
- SLA tiers (Standard / Premium / Enterprise): 99.9% / 99.95% / 99.99% uptime
- Enterprise support: dedicated CSM + 4-hour P1 response time + 24x7 on-call escalation
- Data processing terms: standard DPA + customer-specific addendums available; PIPA-aligned for kr-region tenants
- Contract terms: Net-30 / Net-60 / Net-90 payment options; multi-year discount on 2y+ commits
- (+ Security review + Onboarding bullets — supplementary, not required by acceptance criteria)

**B2C block** (`<!--BEGIN business_model: b2c-->`...`<!--END business_model: b2c-->`):
- Refund policy: 30-day no-questions refund + auto-renewal cancellation any time from account settings
- Customer support hours: 09:00-18:00 KST (kr) / 24x7 chat support (other regions); email response within 24 hours
- Channel coverage: app stores (iOS + Android) + web + community Discord; one entitlement across all channels
- Community guidelines: see /community/guidelines (zero-tolerance harassment policy + safety-team escalation path)
- (+ Data deletion + Pricing transparency bullets — supplementary, not required by acceptance criteria)

Acceptance grep is case-insensitive (`grep -ciE`) per Plan 05 acceptance criteria fix from Plan 01 affe315 (templates use natural capitalization like "SLA tiers", "Enterprise support", "Refund policy").

## feature-map.md Mermaid + ASCII Strategy

**Mermaid mindmap (preferred):**
```
```mermaid
mindmap
  root(({{project_title}}))
    Components
      <!-- INSERT: ## Component Map -->
    Value
      <!-- INSERT: ## Value Proposition -->
```
```

**ASCII tree (fallback):**
```
{{project_title}}
├── Components/
│   <!-- INSERT-ASCII: ## Component Map -->
└── Value/
    <!-- INSERT-ASCII: ## Value Proposition -->
```

deliver.cjs's body.replace fills the `<!-- INSERT: ## {section} -->` placeholder with extracted section content; the `<!-- INSERT-ASCII: ## {section} -->` placeholder is also filled identically (v1: same content; agent narrative-polish path may convert the Mermaid form to a hand-formatted ASCII variant if the renderer cues an ASCII preference).

## Test Results

**Verify command:**
```bash
node --test tests/brief-deliver-type-a-templates.test.cjs tests/brief-deliver-type-a.test.cjs
```

**Pass count:** 12/12 Plan 05 Wave 0 + 7/7 Plan 01 deliver.cjs (no regression). Combined with brief-audience-vocabulary-lock.test.cjs: 25/25 (no ban-list leakage in agent or templates).

| Suite | Tests | Pass | Fail |
|-------|------:|-----:|-----:|
| Plan 05 (this plan) — brief-deliver-type-a-templates.test.cjs | 12 | 12 | 0 |
| Plan 01 — brief-deliver-type-a.test.cjs (regression check) | 7 | 7 | 0 |
| brief-audience-vocabulary-lock.test.cjs (ban-list scan) | 6 | 6 | 0 |
| **Total** | **25** | **25** | **0** |

## Decisions Made

- **Single parameterized agent** (NOT 4 per-artifact agents) — preserves surface cap (NET +1 agent for Type A; Plan 06 will add NET +1 for Type B = 2 total NET agents for Phase 8). Per Phase 5 D-01 byte-identity to brief-domain-researcher.md.
- **B2B/B2C conditional prose ONLY in service-policy.md** — per SYNTHESIS_MAP['service-policy'].conditionalProse=true (Plan 01 Wave 1 contract). The other 3 templates have conditionalProse=false.
- **Mermaid mindmap is the preferred rendering for feature-map.md** with ASCII tree fallback below — renderer-agnostic strategy. Both blocks ship in template; v1 fills both with identical content.
- **All 4 templates carry the voice.languages: {{languages}} placeholder** (Phase 8 D-21 array form). deliver.cjs runtime composes ['ko'] | ['en'] | ['ko', 'en'] per Phase 8 D-D03 from <business_context>.
- **Agent inherits brief-domain-researcher.md anti-patterns + provenance discipline + vocabulary discipline verbatim** with synthesis-specific adaptation. Minimizes drift from Phase 5 patterns; future audits can compare diff.

## Deviations from Plan

None — plan executed exactly as written.

The acceptance criterion grep for service-policy.md keywords uses `-ciE` (case-insensitive) per Plan 05 specification (the case-insensitivity fix in commit `affe315` referenced in the executor prompt). Templates use natural English capitalization (e.g., "SLA tiers", "Enterprise support", "Refund policy") which matches the case-insensitive grep correctly.

Both tasks completed in TDD order with explicit RED → GREEN gate compliance:
- RED commit (Task 1, `80a01ab`): 12 tests, 12 failed (ENOENT — files do not exist).
- GREEN commit (Task 2, `da94e25`): 12 tests, 12 passed; Plan 01 7/7 still passed (no regression).

## Issues Encountered

None.

## Files Plan 08 (commands/brief/deliver.md + workflows/deliver.md) Will Consume

Plan 04 (commands/brief/deliver.md dispatcher) and Plan 08 (workflows/deliver.md orchestrator + canary E2E) consume the following from this plan:

- **Agent name to spawn:** `brief-deliver-type-a` (single agent, parameterized by {{ARTIFACT}}).
- **Agent tools surface:** Read, Grep, Glob, Write (Write restricted to {{OUT_PATH}} per anti-pattern).
- **Agent {{ARTIFACT}} parameter:** ∈ TYPE_A_ARTIFACTS frozen list = {product-brief, service-policy, high-level-spec, feature-map}.
- **Template paths to pass to agent (one per {{ARTIFACT}}):**
  - `brief/templates/deliver/type-a/product-brief.md`
  - `brief/templates/deliver/type-a/service-policy.md`
  - `brief/templates/deliver/type-a/high-level-spec.md`
  - `brief/templates/deliver/type-a/feature-map.md`
- **Output path constant ({{OUT_PATH}}) per {{ARTIFACT}}:** `.planning/deliverables/type-a/{{artifact-key}}.md` — set by orchestrator (deliver.cjs already writes to this path; agent narrative-polish overlays atomically).
- **business_context block:** orchestrator must inject `<business_context>` block via brief/bin/lib/context-inject.cjs buildBusinessContext() before spawning agent (Phase 5 D-13/D-14 byte-identity).
- **Source workstream paths to required-reading:** orchestrator extracts SYNTHESIS_MAP[{{ARTIFACT}}].sources entries and passes them in {{REQUIRED_READING_LIST}}.

## A1 Zero-Runtime-Deps Preservation

Verified after both commits: `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` returns `0`. No new npm dependencies added; the agent + templates use only inline markdown (no external libraries). Mermaid is rendered by the markdown viewer at view time, not at synthesis time.

## Next Phase Readiness

- Plan 04 (commands/brief/deliver.md dispatcher) can now wire the `--type-a` flag to spawn brief-deliver-type-a per {{ARTIFACT}} key.
- Plan 06 (brief-deliver-type-b.md) can mirror this parameterized agent pattern for Type B Marp decks (5 deliverables: internal-deck, proposal-deck, investor-ir, exec-summary, decision-memo).
- Plan 08 (canary E2E) can invoke /brief-deliver --type-a end-to-end against the Korea-B2C fixture and assert: synthesized artifacts contain extracted workstream sections + correct conditional prose block + zero ban-list vocabulary.
- No blockers.

---
*Phase: 08-deliver-type-a-type-b-audience-enforcement-marp*
*Plan: 05*
*Completed: 2026-04-26*

## Self-Check: PASSED

Verified after SUMMARY.md creation:
- All 6 created files exist (agent + 4 templates + 1 test).
- Both per-task commits exist on the worktree branch (`80a01ab` test, `da94e25` feat).
- Final test run: 19/19 pass (12 Plan 05 Wave 0 + 7 Plan 01 deliver.cjs regression check).
- A1 zero-runtime-deps preserved (package.json deps count = 0).
- service-policy.md has both `<!--BEGIN business_model: b2b-->` and `<!--BEGIN business_model: b2c-->` markers (Phase 7 D-14 byte-identity).
- All INSERT placeholders byte-identical to deliver.cjs SYNTHESIS_MAP entries.
- Agent file `{{ARTIFACT}}` count = 20 (≥ 5 required); 4 NEVER-hallucinate / NEVER pass/fail / NOT auto-attached anti-pattern markers present.
