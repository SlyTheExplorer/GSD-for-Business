---
phase: 08-deliver-type-a-type-b-audience-enforcement-marp
plan: 01
subsystem: deliver
tags: [type-a, synthesis, deliver, conditional-prose, korea-canary, b2c, b2b]

# Dependency graph
requires:
  - phase: 01
    provides: atomicWriteFileSync (D-09 atomic-commit primitive) — core.cjs
  - phase: 02
    provides: extractFrontmatter / stripFrontmatter / reconstructFrontmatter / splitInlineArray (D-20 nested-map serializer with array support) — frontmatter.cjs
  - phase: 05
    provides: buildBusinessContext (D-13/D-14 cross-cutting primitive — language/business_model/region/audienceDefaults) — context-inject.cjs
  - phase: 05
    provides: 5-mandatory-frontmatter schema (D-10) — audience.cjs
  - phase: 07
    provides: D-14 conditional prose pattern (`<!--BEGIN business_model: X-->...<!--END business_model: X-->`) — used verbatim by service-policy
provides:
  - "deliver.cjs Type A auto-synthesis lib (synthesizeTypeA + 4-artifact SYNTHESIS_MAP + checkDependencies + extractMarkdownSection + applyConditionalProse)"
  - "TYPE_A_ARTIFACTS frozen registry: ['product-brief', 'service-policy', 'high-level-spec', 'feature-map']"
  - "Korea-first B2C 9-workstream canary fixture (페이앱 fintech) reused by Plans 03 + 04 + 08"
  - "5-mandatory-frontmatter + voice.languages array composition (Phase 5 D-10 + Phase 8 D-21 / D-D03)"
  - "Graceful-degradation pattern (missing source → placeholder body + stderr warning, no throw)"
affects:
  - "08-04 (export.cjs / brief-tools deliver subcommand) — consumes synthesizeTypeA + TYPE_A_ARTIFACTS via /brief-deliver --type-a dispatcher"
  - "08-05 (Type A agent + templates) — replaces template stubs with full markdown templates that retain `<!-- INSERT: ## Section -->` placeholders matching SYNTHESIS_MAP"
  - "08-08 (canary E2E) — exercises deliver.cjs end-to-end against the Korea fixture"

# Tech tracking
tech-stack:
  added: []  # zero new runtime deps; only internal core.cjs / frontmatter.cjs / context-inject.cjs reused
  patterns:
    - "SYNTHESIS_MAP-as-frozen-table: each artifact key maps to declarative {sources, objectivesSections, template, conditionalProse} — no path interpolation from user input (T-08-01-01 mitigation)"
    - "Conditional prose via Phase 7 D-14 byte-identity backreference regex (T-08-01-02 mitigation)"
    - "Graceful degradation on missing source (Pitfall #2): inline placeholder block + stderr warning, no throw"
    - "Template-stub-in-test-setup contract: Plan 08-01 ships minimal stubs; Plan 05 replaces with full templates that preserve `<!-- INSERT: ## Section -->` placeholder shape"

key-files:
  created:
    - "brief/bin/lib/deliver.cjs"
    - "tests/brief-deliver-type-a.test.cjs"
    - "tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/config.json"
    - "tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/OBJECTIVES.md"
    - "tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/canvas.md"
    - "tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/go-to-market.md"
    - "tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/operations.md"
    - "tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/compliance.md"
    - "tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/tech-arch.md"
    - "tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/roadmap.md"
    - "tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/risk.md"
  modified: []

key-decisions:
  - "voice.languages derivation: ko fixture default → ['ko']; --en option flips to ['ko', 'en'] (bilingual). Order in code matters: en branch checked first, then ko branch overrides (verbatim from RESEARCH.md Code Example 1 lines 1253-1254 semantics)."
  - "Template stubs ship in test setup, NOT in repo. Plan 05 owns the real templates; Plan 08-01 only contracts the `<!-- INSERT: ## Section -->` placeholder shape via test fixtures."
  - "checkDependencies + synthesizeTypeA pair: missing source is a soft fail (placeholder + stderr) NOT a hard fail (throw). Aligns with Pitfall #2 graceful-degradation pattern."

patterns-established:
  - "Pattern 1: SYNTHESIS_MAP frozen table — declarative artifact-to-source mapping, no user-supplied path interpolation"
  - "Pattern 2: Conditional prose via Phase 7 D-14 byte-identity backreference regex — well-formed open/close enforcement"
  - "Pattern 3: Korea-first fixture base — single fixture serves Plans 01 / 03 / 04 / 08 to keep canary scenarios consistent"

requirements-completed: [DLV-01, DLV-02, DLV-03, DLV-04]

# Metrics
duration: 7min
completed: 2026-04-26
---

# Phase 8 Plan 1: Type A Auto-Synthesis (deliver.cjs) Summary

**deliver.cjs Type A synthesis lib with 4-artifact SYNTHESIS_MAP, B2B/B2C conditional prose for service-policy via Phase 7 D-14 byte-identity, graceful-degradation on missing workstreams, and Korea-first 페이앱 B2C fintech 9-workstream canary fixture reused by Plans 03/04/08.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-04-26T08:40:20Z
- **Completed:** 2026-04-26T08:47:42Z
- **Tasks:** 2 (both atomic, both turned 7/7 RED → GREEN)
- **Files created:** 11 (deliver.cjs + test file + 9 fixture files)
- **Files modified:** 0

## Accomplishments

- Shipped `brief/bin/lib/deliver.cjs` (~328 LOC) implementing the Type A auto-synthesis dispatcher per RESEARCH.md Code Example 1 verbatim, with 4-artifact SYNTHESIS_MAP fully populated
- All 4 PRD-input artifact keys (PRODUCT-BRIEF / SERVICE-POLICY / HIGH-LEVEL-SPEC / FEATURE-MAP) dispatch through one synthesizeTypeA function with declarative source→template→output mapping
- B2B/B2C conditional prose works for SERVICE-POLICY via Phase 7 D-14 byte-identity backreference regex; B2C fixture run keeps Korean refund-policy/customer-support/community-guidelines block, B2B run keeps SLA-tier block
- Graceful degradation: missing source workstream produces `> ⚠️ Placeholder — ... workstream not completed.` body block + stderr warning (no throw)
- Korea-first 페이앱 B2C fintech 9-workstream canary fixture committed under `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/` — reused by Plans 03 / 04 / 08
- A1 zero-runtime-deps invariant preserved (`Object.keys(require('./package.json').dependencies||{}).length === 0`)
- Frontmatter composition adheres to Phase 5 D-10 5-mandatory schema + Phase 8 D-21 voice.languages array (ko default for kr fixture; --en flips to ['ko', 'en'] bilingual)

## Task Commits

Each task was committed atomically with `--no-verify` (parallel-executor mode):

1. **Task 1: Wave 0 RED tests + Korea-first B2C 9-workstream fixture** — `5edce1b` (test)
   - 7 RED tests covering all 4 SYNTHESIS_MAP artifacts + checkDependencies missing-source flow + extractMarkdownSection + applyConditionalProse
   - 9-workstream Korean fixture (페이앱) — config.json + OBJECTIVES.md + 7 workstream artifacts
   - Tests turn RED via `MODULE_NOT_FOUND` on `require('brief/bin/lib/deliver.cjs')` (deliver.cjs does not exist yet at this commit)
   - Per-test tmp cwd via `mkdtempSync`; mirrors `tests/brief-context-inject-roundtrip.test.cjs` pattern
   - Exit code 1; 7/7 RED confirmed

2. **Task 2: GREEN — deliver.cjs Type A synthesis lib** — `fd379f7` (feat)
   - Shipped `brief/bin/lib/deliver.cjs` (~328 LOC) implementing all 6 exports: `synthesizeTypeA`, `TYPE_A_ARTIFACTS`, `SYNTHESIS_MAP`, `checkDependencies`, `extractMarkdownSection`, `applyConditionalProse`
   - 4 SYNTHESIS_MAP entries fully populated per RESEARCH.md Pattern 3 mapping table (lines 470-476)
   - Atomic writes via `core.cjs atomicWriteFileSync` (Phase 1 D-09)
   - Exit code 0; 7/7 GREEN confirmed

**Plan metadata:** No separate metadata commit — orchestrator owns `.planning/STATE.md` and `.planning/ROADMAP.md` updates after the entire wave completes (per parallel_execution contract).

## Files Created/Modified

### Created (11)

- `brief/bin/lib/deliver.cjs` (328 LOC) — Type A auto-synthesis dispatcher; exports `synthesizeTypeA`, `TYPE_A_ARTIFACTS`, `SYNTHESIS_MAP`, `checkDependencies`, `extractMarkdownSection`, `applyConditionalProse`
- `tests/brief-deliver-type-a.test.cjs` (462 LOC) — 7 Wave 0 tests + Korea-fixture setup helper + test-only template stub writer
- `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/config.json` (9 LOC) — `brief.region: kr` + `brief.business_model: b2c` + `brief.compliance_packs: [korea-pipa, korea-isms-p]`
- `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/OBJECTIVES.md` (23 LOC) — 페이앱 fintech vision (Korean): `## Immutable Intent` + `## Mutable Hypotheses`
- `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/canvas.md` (33 LOC) — BMC: `## Customer Segments`, `## Value Proposition`, `## Customer Jobs`, `## Channels`, `## Key Activities`
- `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/go-to-market.md` (30 LOC) — GTM: `## Personas`, `## Channels`, `## Acquisition Strategy`
- `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/operations.md` (32 LOC) — Operations: `## Process`, `## Tools`, `## Team`
- `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/compliance.md` (27 LOC) — Compliance: `## Documented obligations addressed:` (PIPA + ISMS-P + MyData) + `## Obligations needing further work:`
- `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/tech-arch.md` (33 LOC) — Tech-arch: `## Component Map` (5 components), `## Data Flow`, `## Build Sequence`
- `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/roadmap.md` (23 LOC) — Roadmap: `## Phased Roadmap` (4 phases M1-M12)
- `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/risk.md` (23 LOC) — Risk: `## Critical Risks` (R1-R4 with mitigations)

### Modified (0)

None. Plan 08-01 is purely additive.

## SYNTHESIS_MAP Final Schema

| Artifact Key | Sources (artifact → sections) | objectivesSections | conditionalProse |
|---|---|---|---|
| `product-brief` | `workstreams/business-model-canvas/canvas.md` → `## Customer Segments`, `## Value Proposition` <br> `workstreams/go-to-market/go-to-market.md` → `## Personas` | `## Immutable Intent` | false |
| `service-policy` | `workstreams/operations/operations.md` → `## Process`, `## Tools` <br> `workstreams/compliance/compliance.md` → `## Documented obligations addressed:` | `[]` (drives off business_model alone) | **true** (Phase 7 D-14 B2B/B2C variant) |
| `high-level-spec` | `workstreams/tech-arch/tech-arch.md` → `## Component Map` <br> `workstreams/roadmap/roadmap.md` → `## Phased Roadmap` <br> `workstreams/risk/risk.md` → `## Critical Risks` | `## Immutable Intent` | false |
| `feature-map` | `workstreams/tech-arch/tech-arch.md` → `## Component Map` <br> `workstreams/business-model-canvas/canvas.md` → `## Value Proposition` | `[]` | false |

All entries also reference a per-artifact template at `brief/templates/deliver/type-a/{key}.md` (Plan 05 ships full templates; Plan 08-01 contracts the placeholder shape only).

## Korea-First Fixture File Inventory

| File | Length | Purpose |
|---|---|---|
| `config.json` | 9 LOC | brief.region=kr + business_model=b2c + compliance_packs=[korea-pipa, korea-isms-p] |
| `OBJECTIVES.md` | 23 LOC | 페이앱 (Korean B2C fintech) vision — Korean text under `## Immutable Intent` + 3 hypotheses |
| `canvas.md` | 33 LOC | 5 BMC sections — Customer Segments / Value Proposition / Customer Jobs / Channels / Key Activities |
| `go-to-market.md` | 30 LOC | Personas (혼자살이 28세 김지수 + 신혼 1년차 박서영-이준호 커플) + Channels + Acquisition Strategy |
| `operations.md` | 32 LOC | Process + Tools + Team (5명 startup composition) |
| `compliance.md` | 27 LOC | PIPA 2026 (CEO 개인 책임 + 매출 10%) + ISMS-P 2027 의무화 + MyData 2026 확장 |
| `tech-arch.md` | 33 LOC | 5-component map (Mobile / API Gateway / Data Sync Worker / Category ML / Postgres) + Data Flow + Build Sequence |
| `roadmap.md` | 23 LOC | 4-phase roadmap (Foundation → Core MVP → Public Launch → Monetization & MyData License) |
| `risk.md` | 23 LOC | 4 critical risks (마이데이터 인증 / PIPA CEO책임 / SMS 파싱 / 카카오 채널 의존) |

The fixture deliberately models the canonical Korea-first Phase 8 canary scenario — a fintech B2C planner using Korean throughout, with 2026 PIPA / 2027 ISMS-P / 2026 MyData regulatory landscape baked into compliance.md.

## Wave 0 Test Inventory

| Test | What It Asserts | Pass |
|---|---|---|
| `synthesizeTypeA(product-brief)` | Output file written with Korean Immutable Intent + Customer Segments + Personas content; 5 mandatory FM fields; voice.languages: [ko] | GREEN |
| `synthesizeTypeA(service-policy) B2C/B2B` | B2C run keeps 환불 정책 / 고객지원 / 커뮤니티 가이드라인, drops SLA Tiers; B2B run inverts; markers stripped from output | GREEN |
| `synthesizeTypeA(high-level-spec)` | Output contains tech-arch ## Component Map + roadmap ## Phased Roadmap + risk ## Critical Risks bodies | GREEN |
| `synthesizeTypeA(feature-map)` | Output contains Mermaid mindmap or ASCII tree referencing tech-arch components | GREEN |
| `checkDependencies + missing source` | Returns `{complete:false, missing:['workstreams/business-model-canvas/canvas.md']}`; synthesizeTypeA emits placeholder block + stderr warning, does NOT throw | GREEN |
| `extractMarkdownSection` | Heading found returns body; missing returns `<!-- ## X not found in source -->` | GREEN |
| `applyConditionalProse` | Matching block kept (markers stripped); non-matching block dropped | GREEN |

**Verify command:** `node --test tests/brief-deliver-type-a.test.cjs` — exit code 0, 7/7 GREEN.

## A1 Zero-Runtime-Deps Re-Verification

Command: `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"`

Output: `0`

`brief/bin/lib/deliver.cjs` imports only:
- `node:fs` (built-in)
- `node:path` (built-in)
- `./core.cjs` (internal — atomicWriteFileSync, planningPaths)
- `./frontmatter.cjs` (internal — extractFrontmatter, reconstructFrontmatter, stripFrontmatter)
- `./context-inject.cjs` (internal — buildBusinessContext)

No `gray-matter`, no `ajv`, no `js-yaml`, no `@marp-team` packages. A1 invariant preserved.

## Files Plan 04 / Plan 05 / Plan 08 Will Consume

| Consumer | Imports From This Plan |
|---|---|
| **Plan 04 (export.cjs + brief-tools deliver subcommand)** | `brief/bin/lib/deliver.cjs` — `synthesizeTypeA`, `TYPE_A_ARTIFACTS`, `checkDependencies` for the `/brief-deliver --type-a` dispatcher |
| **Plan 05 (Type A agent + templates)** | `brief/templates/deliver/type-a/*.md` — must replace test stubs with full templates that preserve `<!-- INSERT: ## Section -->` placeholders matching SYNTHESIS_MAP entries (otherwise synthesizeTypeA placeholders won't fill) |
| **Plan 08 (canary E2E)** | `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/*` — fixture base for end-to-end Korea-first B2C canary |
| **Plan 03 (Type A frontmatter check)** | `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/*` — same fixture exercised against frontmatter validator |

## Decisions Made

- **voice.languages derivation order**: en branch first (`if (opts.en || ctx.language === 'en') fm['voice.languages'] = ['en'];`), then ko branch (`if (ctx.language === 'ko') fm['voice.languages'] = opts.en ? ['ko', 'en'] : ['ko'];`). The ko branch overrides the en branch when both ko language + --en option are present, producing `['ko', 'en']` bilingual. Verbatim from RESEARCH.md Code Example 1 lines 1253-1254 semantics.
- **Template stubs in test setup, NOT in repo**: Plan 05 owns full templates. Plan 08-01 only contracts the placeholder shape via test fixtures. This avoids two plans owning the same files.
- **`Object.freeze` applied as a separate statement** rather than wrapping the inline literal — keeps the assignment line readable for the acceptance grep.
- **Used `body.split(placeholder).join(content)` instead of `body.replace(placeholder, content)`** for the template fill loop. `String.prototype.replace` only replaces the FIRST occurrence; if a placeholder appeared twice in a template, replace would only fill one. split-join replaces all occurrences without regex escaping.
- **TYPE_A_ARTIFACTS frozen via separate `Object.freeze(TYPE_A_ARTIFACTS)` call** — keeps the array literal on the assignment line so the acceptance grep `TYPE_A_ARTIFACTS = \['product-brief'` matches.

## Deviations from Plan

None - plan executed exactly as written.

The only minor adjustment was using `body.split(placeholder).join(content)` instead of `body.replace(placeholder, content)` for the template-fill loop — `String.prototype.replace` would only replace the first occurrence of any duplicate `<!-- INSERT: ## X -->` placeholder. This is a defensive correctness improvement that does not change semantics for templates with single placeholders (all 4 plan-08-01 stubs).

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 08-01 ships a stable foundation for the rest of Phase 8:

- **Plan 08-04 (export.cjs / brief-tools deliver subcommand)** can now wire `synthesizeTypeA` into `/brief-deliver --type-a` via `brief-tools.cjs`.
- **Plan 08-05 (Type A agent + templates)** can now ship full templates at `brief/templates/deliver/type-a/*.md` knowing the placeholder contract is `<!-- INSERT: ## {section-heading} -->`.
- **Plan 08-08 (canary E2E)** can use the Korea-first fixture as-is.

No blockers. A1 zero-deps preserved. Phase 7 D-14 byte-identity preserved (conditional-prose regex is the same regex Phase 7 designers use).

## Self-Check: PASSED

All claimed files exist on disk:
- `brief/bin/lib/deliver.cjs` ✓
- `tests/brief-deliver-type-a.test.cjs` ✓
- `tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/{config.json, OBJECTIVES.md, canvas.md, go-to-market.md, operations.md, compliance.md, tech-arch.md, roadmap.md, risk.md}` ✓ (9/9)
- `.planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-01-SUMMARY.md` ✓ (this file)

All claimed commits exist in branch:
- `5edce1b` (Task 1: test 08-01) ✓
- `fd379f7` (Task 2: feat 08-01) ✓

Final test run: `node --test tests/brief-deliver-type-a.test.cjs` → 7/7 pass, exit 0.

---
*Phase: 08-deliver-type-a-type-b-audience-enforcement-marp*
*Completed: 2026-04-26*
