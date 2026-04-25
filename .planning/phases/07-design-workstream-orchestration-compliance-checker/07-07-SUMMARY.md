---
phase: 07-design-workstream-orchestration-compliance-checker
plan: 07
subsystem: design-workstreams
tags: [workstream-loader, status, state, allowlist, surface-cap, anti-pattern-2, b2b-b2c-lock, derive-at-read]

# Dependency graph
requires:
  - phase: 07-design-workstream-orchestration-compliance-checker
    provides: "Plan 07-05 BMC + GTM + BRAND + RISK + ROADMAP workstream bundles; Plan 07-06 OPERATIONS + TECH-ARCH + FINANCIAL bundles. All 9 built-in spec.yaml files declare gates_required + depends_on per Phase 7 D-13."
provides:
  - "workstream-loader.cjs Phase 7 D-13 extension: VALID_GATES = {align, audience, compliance} subset validation; depends_on array-of-strings validation with forward-reference allowance per D-13"
  - "workstream-loader.cjs defaults applied at end of load loop: gates_required → [align, audience, compliance] (D-10); depends_on → []. Phase 2 D-13 5-field validation regression-preserved."
  - "status.cjs computeRecommendedNext(cwd, briefState) — pure derivation function reading PHASE_7_SOFT_ORDER (BMC → GTM → BRAND → OPERATIONS → FINANCIAL → RISK → ROADMAP → TECH-ARCH → COMPLIANCE) + state.brief.workstreams_completed; returns first slug with depends_on satisfied OR sentinel '—'."
  - "status.cjs dashboard new line 'Recommended next <slug>' rendered between Round-trips and the separator (D-07/D-08 derive-at-read, no new state field for recommendation)."
  - "state.cjs schema-documentation block + PHASE_7_BRIEF_FIELDS exported constant. Phase 7 D-21 fields documented in brief.* allowlist: last_design_workstream (slug string), workstreams_completed (slug array), financial_drivers (path string OR inline map per A7)."
  - "6 NEW Wave 0 test files (30 tests total) covering: workstream-loader extension (9), recommended-next derivation (8), surface cap NET +2 (4), anti-pattern #2 hook-purity (2), 9 built-ins loadable (4), B2B/B2C conditional vocabulary lock (3)."
affects: [07-08-canary-e2e, 08-deliver-pipelines, 09-launch-gate-surface-audit]

# Tech tracking
tech-stack:
  added: []  # Zero new runtime deps; preserves BRIEF zero-runtime-deps rule (CLAUDE.md A1)
  patterns:
    - "Additive validation extension — Phase 2 D-13 5-field validator is preserved verbatim; Phase 7 adds 2 new validators after the existing block. Defaults applied AFTER copy-to-spec so explicit values win over defaults."
    - "Derive-at-read for recommendations (D-08): status.cjs computes recommended next from depends_on graph + workstreams_completed at every render. NEVER stored. Avoids stored-counter drift (Phase 6 D-06 inheritance pattern)."
    - "PHASE_7_SOFT_ORDER constant in status.cjs encodes the D-07 ordering as data, not as ad-hoc dispatch. _example always skipped in recommendation logic."
    - "Schema-documentation allowlist: state.cjs has no closed-enum validator; the brief.* map is preserved wholesale (Phase 2 D-21 pattern). New fields are documented in the file header + exported as PHASE_7_BRIEF_FIELDS constant for testability."
    - "Surface-cap structural test family (forbidden list + NET +2 presence + future-drift catch via re-* / *-all regex)."
    - "Anti-pattern #2 grep-walk: tests/brief-design-anti-pattern-2.test.cjs walks hooks/ recursively and matches FORBIDDEN_PATTERNS array — same shape as Phase 4/5/6 hook-purity tests."

key-files:
  created:
    - "tests/brief-workstream-loader-extended.test.cjs"
    - "tests/brief-design-recommended-next.test.cjs"
    - "tests/brief-surface-cap-phase-7.test.cjs"
    - "tests/brief-design-anti-pattern-2.test.cjs"
    - "tests/brief-workstreams-9-builtin-loadable.test.cjs"
    - "tests/brief-workstream-spec-conditional-prose.test.cjs"
  modified:
    - "brief/bin/lib/workstream-loader.cjs (additive extension: VALID_GATES + gates_required validator + depends_on validator + D-10 defaults)"
    - "brief/bin/lib/status.cjs (PHASE_7_SOFT_ORDER constant + computeRecommendedNext function + dashboard line + export)"
    - "brief/bin/lib/state.cjs (header schema-documentation block + PHASE_7_BRIEF_FIELDS frozen export)"

key-decisions:
  - "Surface-cap test exclusion for inherited workstreams.md — the broad regex /workstream/ in the plan literal would have failed because commands/brief/workstreams.md is GSD-inherited Phase 1 fork hygiene (parallel-milestone management surface), out of Phase 7 scope. Test filter excludes workstreams.md and adds explicit forbidden-list + future-drift regex catch (re-{compliance,design,workstream,financial} / *-all). Documented as Rule 3 deviation: blocking-issue auto-fix to honor plan must_haves intent (NET +2) over plan literal."
  - "state.cjs allowlist extension follows Phase 2 D-21 pattern (preserve-wholesale + document) rather than introducing a closed-enum validator. The codebase's existing approach uses extractFrontmatter / reconstructFrontmatter to pass the brief.* map through write cycles; a closed allowlist would require structural surgery to syncStateFrontmatter and cmdStateJson. Phase 7 instead exports PHASE_7_BRIEF_FIELDS as a frozen array for tests + adds a documenting comment block."
  - "computeRecommendedNext is exported from status.cjs (not made internal-only) so the recommended-next test can assert behavior directly without spawning brief-tools subprocess. Aligns with the test-direct pattern used by Phase 4/5/6 lib functions (e.g., audience.siblingReportPath)."
  - "_example workstream is skipped in computeRecommendedNext (continue if slug === '_example'). _example is a fixture for Phase 2 D-13 schema testing, not a recommendation candidate."
  - "Phase 2 D-13 regression checked via direct call: tests/brief-workstream-loader-extended.test.cjs Test 1 calls loadWorkstreams(process.cwd()) and asserts _example loads. tests/workstream-loader-validation.test.cjs (existing Phase 2 suite) re-run and confirmed all 9 inherited rejection rules still throw."

patterns-established:
  - "Pattern: additive lib extension preserves prior phase's invariants — Phase 2 D-13 5-field validator block kept verbatim above the Phase 7 D-13 2-field validator block; defaults are applied AFTER the parsed→spec copy to make explicit-value-wins-over-default unambiguous."
  - "Pattern: derive-at-read recommendation — pure function over (cwd, briefState) returning first slug satisfying soft-order + depends_on graph + completed-set; tolerates undefined briefState; sentinel '—' on any throw or empty graph."
  - "Pattern: schema-documentation allowlist for state.brief.* — header comment block lists fields per phase; frozen array exports the new fields; tests assert both presence in source AND export shape."
  - "Pattern: structural test trio per phase — surface cap (NET +N + forbidden list + drift regex), anti-pattern #N grep-walk on hooks/, lib-loadability + required-fields presence (Phase 2 D-13 7-field schema check)."
  - "Pattern: B2B/B2C vocabulary lock — '/If business_model in \\[b2b/i' AND '/If business_model in \\[b2c/i' as required regex on every workstream design-prompts.md (≥2 total occurrences). Same shape as Phase 5 hedging-vocabulary lock."

requirements-completed: [FND-08, FND-09, FND-10, CC-01]

# Metrics
duration: ~20min
completed: 2026-04-25
---

# Phase 7 Plan 7: Phase 7 Integration — workstream-loader extension + status recommendation + state allowlist + 4 structural invariants

**3 lib files extended additively (workstream-loader + status + state), 6 NEW Wave 0 test files (30 tests total), Phase 2 D-13 5-field regression preserved, Surface cap NET +2 enforced, Anti-pattern #2 hook-purity green, all 9 built-in workstreams + _example loadable with 7-field schema, D-14 B2B/B2C conditional vocabulary lock asserted on all 9 design-prompts.md.**

## Performance

- **Duration:** ~20 minutes
- **Started:** 2026-04-25T15:14:30Z
- **Tasks completed:** 3 of 3
- **Tests added:** 30 tests across 6 files (all green)
- **Lines added:** 896 (lib: +155 / tests: +741)

## What Shipped

### 1. workstream-loader.cjs additive extension (Task 1, commit `38c775e`)

`VALID_GATES = new Set(['align', 'audience', 'compliance'])` plus 2 validators added between the Phase 2 D-13 5-field block and the existing path-traversal validators:

- **gates_required** — must be array; each entry must be in VALID_GATES; default `[align, audience, compliance]` if absent (D-10).
- **depends_on** — must be array of non-empty strings; forward-references allowed (referenced workstream may not exist at load time per D-13). Default `[]` if absent.

Defaults are applied AFTER the parsed→spec property copy so an explicit YAML value (even an empty array) wins over the default. The change is purely additive — Phase 2 D-13 5-field validation continues to throw on the same violations.

### 2. status.cjs computeRecommendedNext + dashboard line (Task 2 part 1, commit `c642409`)

`computeRecommendedNext(cwd, briefState)` is a pure derivation function:

1. Loads workstreams via `loadWorkstreams(cwd)`.
2. Reads `briefState.workstreams_completed` (or empty array if absent).
3. Walks `PHASE_7_SOFT_ORDER` (BMC → GTM → BRAND → OPERATIONS → FINANCIAL → RISK → ROADMAP → TECH-ARCH → COMPLIANCE) and returns the first slug that is NOT completed AND whose `depends_on` are all completed.
4. Skips `_example` (fixture, not a recommendation).
5. Falls back to `'—'` sentinel on empty stack or any throw (D-17 resilience).

Renamed dashboard adds `Recommended next <slug>` between `Round-trips` and the separator. Verified in `node brief/bin/brief-tools.cjs status` output:

```
  Round-trips     —
  Recommended next business-model-canvas
--------------------------------
```

`computeRecommendedNext` is exported alongside `renderStatus` for direct testability.

### 3. state.cjs schema-documentation allowlist (Task 2 part 2, commit `c642409`)

Header comment block now documents the brief.* allowlist per phase. Phase 7 D-21 entries:

- `last_design_workstream` — scalar slug string set by `/brief-design` on workstream completion.
- `workstreams_completed` — array of slugs appended on completion; consumed by `computeRecommendedNext`.
- `financial_drivers` — path string OR inline map (per A7) set by FINANCIAL Step 4 Q&A.

`PHASE_7_BRIEF_FIELDS = Object.freeze([...])` exported for testability. The brief.* map continues to round-trip wholesale via `syncStateFrontmatter` (Phase 2 D-21 pattern preserved); the new fields require no validator surgery.

### 4. Six structural test files (Tasks 1, 2, 3 — commits `38c775e`, `c642409`, `8b7feda`)

| File | Tests | Phenomenon |
|------|-------|------------|
| `tests/brief-workstream-loader-extended.test.cjs` | 9 | Phase 2 D-13 regression + gates_required subset + non-array throw + D-10 default + depends_on string-array + non-string throw + [] default + forward-reference warn-not-throw |
| `tests/brief-design-recommended-next.test.cjs` | 8 | Empty completed → BMC; [BMC] → GTM; all completed → '—'; null/undefined briefState → string sentinel; dashboard line presence; state.cjs documentation; PHASE_7_BRIEF_FIELDS export shape; Phase 7 fields round-trip via writeStateMd |
| `tests/brief-surface-cap-phase-7.test.cjs` | 4 | design.md + add-workstream.md present; 8-entry forbidden list absent; only `add-workstream.md` matches `/workstream/` (excluding inherited `workstreams.md`); future-drift regex `re-(compliance|design|workstream|financial)` and `*-all.md` blocked |
| `tests/brief-design-anti-pattern-2.test.cjs` | 2 | hooks/ recursively grepped for compliance-checker / brief/workflows/{compliance,design,add-workstream} — zero matches; PostToolUse / SubagentStop / PreCompact + compliance composition forbidden |
| `tests/brief-workstreams-9-builtin-loadable.test.cjs` | 4 | All 9 + _example loadable; each built-in has 7 fields (5 Phase 2 D-13 + 2 Phase 7 D-13); gates_required subset of VALID_GATES; depends_on contains valid slug strings |
| `tests/brief-workstream-spec-conditional-prose.test.cjs` | 3 | All 9 design-prompts.md have B2B + B2C conditional blocks (D-14); all 9 templates/artifact.md have audience.* + business_context.model frontmatter; ≥2 occurrences of the lock phrase per file |

**Total: 30 tests, all green.**

## Verification

```bash
# Phase 7 Plan 07 test suite (6 files)
node --test tests/brief-workstream-loader-extended.test.cjs \
            tests/brief-design-recommended-next.test.cjs \
            tests/brief-surface-cap-phase-7.test.cjs \
            tests/brief-design-anti-pattern-2.test.cjs \
            tests/brief-workstreams-9-builtin-loadable.test.cjs \
            tests/brief-workstream-spec-conditional-prose.test.cjs
# → tests 30 / pass 30 / fail 0

# Phase 2 D-13 5-field regression preserved
node --test tests/workstream-loader-discovery.test.cjs tests/workstream-loader-validation.test.cjs
# → tests 17 / pass 17 / fail 0

# Phase 2 D-21 state.brief round-trip regression preserved
node --test tests/state-brief-roundtrip.test.cjs
# → tests 4 / pass 4 / fail 0

# Live dashboard verification
node brief/bin/brief-tools.cjs status 2>&1 | grep "Recommended next"
# → "  Recommended next business-model-canvas"
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Surface-cap test pattern adjusted to honor plan must_haves intent over plan literal**

- **Found during:** Task 3 (surface cap test draft)
- **Issue:** The plan's literal test code `cmds = fs.readdirSync('commands/brief').filter(f => /workstream/.test(f))` matches `commands/brief/workstreams.md` — an inherited GSD parallel-milestone command from Phase 1 fork hygiene, completely orthogonal to Phase 7. The plan's literal pattern would fail on inherited surface, blocking task completion.
- **Plan must_haves text:** `"Surface cap enforced: NET +2 commands (design + add-workstream); NO /brief-recompliance, ..."` — the intent is to forbid Phase-7-introduced re-gate ceremony commands, NOT to remove inherited fork-hygiene surface.
- **CLAUDE.md context:** "Phases 3-8 MUST NOT add new commands beyond their requirement-mapped set"; "Phase 9 HRD-02 audit prunes inherited surface". Removing `workstreams.md` is out-of-scope for Phase 7.
- **Fix:** test filter explicitly excludes `workstreams.md` from the `/workstream/` scan, then adds a separate forbidden-list assertion + future-drift regex (`re-{compliance,design,workstream,financial}` and `*-all.md`) to catch any Phase-7-introduced ceremony commands.
- **Files modified:** tests/brief-surface-cap-phase-7.test.cjs
- **Commit:** `8b7feda`

**2. [Rule 2 - Critical Functionality] Test fixture path-existence requirement**

- **Found during:** Task 1 (extended workstream-loader test draft)
- **Issue:** The plan's test fixture spec.yaml referenced `output_artifact_template: templates/x.md` but did not create the file. The loader's `validatePathWithin` calls `fs.existsSync` and throws if the path is absent — every test would have thrown before reaching the gates_required / depends_on assertions.
- **Fix:** `makeTmpWorkstream` helper now creates `templates/x.md` alongside spec.yaml so the loader's path-existence guard passes. This is required for the gates_required / depends_on tests to actually exercise their validation path rather than failing earlier.
- **Files modified:** tests/brief-workstream-loader-extended.test.cjs
- **Commit:** `38c775e`

### State.cjs Allowlist Mechanism Note

The plan describes "extending the BRIEF_ALLOWLIST set" in state.cjs. The actual codebase uses a **schema-documentation pattern** (Phase 2 D-21) — there is no closed-enum allowlist; the `brief.*` map is preserved wholesale via `syncStateFrontmatter` / `cmdStateJson`. New fields are documented in comments + exported as a frozen array.

The plan's verbatim suggestion was an inline JS comment "Phase 7 D-21 extension: design state slots" — adapted to fit the existing codebase shape (header documentation block + exported `PHASE_7_BRIEF_FIELDS`). Phase 2 D-21 round-trip regression preserved (`tests/state-brief-roundtrip.test.cjs` 4 tests still green).

## Authentication Gates

None — this plan is purely structural/library extension; no external service calls.

## Known Stubs

None. All extensions wire fully — `computeRecommendedNext` is consumed by the dashboard line; the new state.brief.* fields are consumed by `computeRecommendedNext`.

## Threat Flags

None — no new network endpoints, file-access patterns, or schema changes at trust boundaries beyond the documented `gates_required` enum + `depends_on` slug-array + 3 brief.* allowlist additions, all of which are already in the plan's `<threat_model>` (T-07-24, T-07-25, T-07-26, T-07-13..20).

## Pre-existing Test Failures (NOT caused by this plan)

Running `node scripts/run-tests.cjs` (full suite) surfaces ~20 failing tests in unrelated areas: `bin/install.js` brief-* hook registration completeness, `hooks/` Claude path references, `commands/brief/ui-brand.md`, etc. These pre-date Phase 7 Plan 07 and are inherited from Phase 1 fork hygiene. Out of scope per "SCOPE BOUNDARY: Only auto-fix issues DIRECTLY caused by the current task's changes." Documented in `deferred-items.md` for the phase verifier; resolution lives in Phase 9 HRD-02 surface audit.

## Self-Check: PASSED

- [x] `brief/bin/lib/workstream-loader.cjs` modified (VALID_GATES + 2 validators + 2 defaults)
- [x] `brief/bin/lib/status.cjs` modified (PHASE_7_SOFT_ORDER + computeRecommendedNext + dashboard line + export)
- [x] `brief/bin/lib/state.cjs` modified (header schema doc block + PHASE_7_BRIEF_FIELDS export)
- [x] `tests/brief-workstream-loader-extended.test.cjs` created (9 tests pass)
- [x] `tests/brief-design-recommended-next.test.cjs` created (8 tests pass)
- [x] `tests/brief-surface-cap-phase-7.test.cjs` created (4 tests pass)
- [x] `tests/brief-design-anti-pattern-2.test.cjs` created (2 tests pass)
- [x] `tests/brief-workstreams-9-builtin-loadable.test.cjs` created (4 tests pass)
- [x] `tests/brief-workstream-spec-conditional-prose.test.cjs` created (3 tests pass)
- [x] Commit `38c775e` exists in HEAD
- [x] Commit `c642409` exists in HEAD
- [x] Commit `8b7feda` exists in HEAD
- [x] Phase 2 D-13 5-field validation regression preserved (17 tests green)
- [x] Phase 2 D-21 state.brief round-trip preserved (4 tests green)
- [x] Live dashboard renders "Recommended next business-model-canvas"
- [x] All 30 Plan 07-07 tests green
