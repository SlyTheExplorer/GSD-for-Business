---
phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
plan: 05
subsystem: infrastructure
tags: [yaml, loader, workstream, fnd-08, zero-deps, security]

requires:
  - phase: 01-foundation-fork-hygiene-removal-rename
    provides: "renamed BRIEF package surface, frontmatter.cjs YAML primitives inspiration, tests/helpers.cjs conventions"
provides:
  - "brief/bin/lib/yaml-mini.cjs — zero-dep full-document YAML mini-parser (scalars, lists, nested maps)"
  - "brief/bin/lib/workstream-loader.cjs — glob + D-13 validator for brief/workstreams/*/spec.yaml"
  - "brief/workstreams/_example/ — FND-08 acceptance-demo fixture (spec.yaml + templates/artifact.md)"
  - "Prototype-pollution (T-02-05-01) + directory-traversal (T-02-05-02) + DoS (T-02-05-03) mitigations"
affects:
  - phase: 07
    reason: "Phase 7 populates 9 real workstreams (BMC, GTM, FINANCIAL, OPS, COMPLIANCE, ROADMAP, BRAND, RISK, TECH-ARCH) against this contract"
  - phase: 05
    reason: "DISCOVER reads research_prompts from each workstream spec"

tech-stack:
  added: []  # zero-dep constraint preserved
  patterns:
    - "Sibling-module discipline: new concept → new module rather than extending a differently-scoped adjacent (R-2 workstream.cjs separation)"
    - "Inline YAML mini-parser with state-machine line-by-line approach (indentation stack), adapted from frontmatter.cjs:43-118"
    - "Defensive-object-construction: Object.create(null) + reserved-key rejection at parse time"
    - "Boundary-resolve path validation: path.resolve(workstreamDir, rel) + startsWith(workstreamDir + path.sep) guard"

key-files:
  created:
    - brief/bin/lib/yaml-mini.cjs
    - brief/bin/lib/workstream-loader.cjs
    - brief/workstreams/_example/spec.yaml
    - brief/workstreams/_example/templates/artifact.md
    - tests/workstream-loader-discovery.test.cjs
    - tests/workstream-loader-validation.test.cjs
  modified: []

key-decisions:
  - "Sibling module yaml-mini.cjs chosen over extending frontmatter.cjs — frontmatter.cjs was already 379 lines; any extension would push over the ~400 soft cap and risk regressions in 198 dependent tests. yaml-mini stays narrowly scoped (197 lines, closed grammar)."
  - "Use Object.create(null) for every parser container (root, placeholders, nested maps) — structural guarantee that __proto__ chain attacks cannot reach inherited keys, regardless of grammar bugs."
  - "Explicit throw on reserved keys (__proto__, constructor, prototype) at both regex-match time and explicit-alternate-regex time — belt-and-suspenders coverage when keys don't match the normal identifier charset."
  - "Boundary path check uses path.sep suffix (workstreamDir + path.sep) rather than workstreamDir prefix — avoids the 'brief/workstreams/foo' vs 'brief/workstreams/foobar' aliasing edge case."
  - "Directories without spec.yaml are silently skipped (not errored) — permits WIP workstream directories during Phase 7 development without breaking the loader for other workstreams."
  - "Loader result objects copy fields into a plain {} (not null-prototype) with slug prepended — downstream consumers get predictable JSON-shaped objects while the parser internals retain the hostile-input-safe null-prototype containers."

patterns-established:
  - "Pattern — inline grammar-constrained parser: when a schema is closed (D-13) and external deps are forbidden (A1), a ~200-line state-machine parser is preferable to npm libraries. Reuse splitInlineArray + coerceScalar helpers."
  - "Pattern — per-path validator function: validatePathWithin(workstreamDir, rel, fieldLabel, slug) centralizes the T-02-05-02 guard and produces consistent error messages across output_artifact_template + business_model_variants.* + region_overrides.*"
  - "Pattern — RED-then-GREEN TDD collapsed into two atomic commits: one commit with both failing test files, one commit with impl + fixtures. Easier to review than interleaved test+impl commits; still satisfies TDD gate sequence."

requirements-completed: [FND-08]

duration: 5min
completed: 2026-04-19
---

# Phase 2 Plan 5: workstream-as-YAML loader Summary

**Zero-dep inline YAML parser + glob-based workstream-spec loader with D-13 schema validation and three STRIDE mitigations — ships Phase 2's FND-08 seam so Phase 7 can populate 9 real workstreams by writing spec.yaml files alone.**

## Performance

- **Duration:** ~5 min (RED commit 09:47:14 KST → GREEN commit 09:50:32 KST → SUMMARY shortly after)
- **Started:** 2026-04-19T00:46:XXZ (approx, when TDD scaffolding began)
- **Completed:** 2026-04-19T00:50:48Z
- **Tasks:** 2 (Task 1 = impl + discovery test bundle, Task 2 = validation test)
- **Files created:** 6
- **Files modified:** 0

## Accomplishments

- FND-08 delivered: a new workstream is declared by writing ONE spec.yaml — no `.cjs` source change required. Proven by the `adding a second workstream dir ... is picked up without .cjs change` test case.
- D-13 schema contract fully enforced: name ↔ directory match, required fields (description, research_prompts[], design_prompts[], output_artifact_template), path-existence and path-containment on all 4 path-bearing fields.
- Three STRIDE mitigations verified by tests: T-02-05-01 prototype pollution (2 tests), T-02-05-02 directory traversal (2 tests — template + business_model_variants), T-02-05-03 DoS (depth + input-size caps in code; exercised indirectly by deep nesting test).
- Zero runtime dependencies preserved: `Object.keys(package.json.dependencies).length === 0`.
- Both target file size caps met: yaml-mini.cjs 197/200 lines; workstream-loader.cjs 111/150 lines.
- npm-test baseline preserved at 63 failures (Phase 1 inheritance unchanged).

## Task Commits

TDD gate sequence — two atomic commits (RED → GREEN collapsed per plan_context directive):

1. **Task 1 (RED): workstream loader RED tests — discovery + validation** — `2d8cde5` (test)
   - `tests/workstream-loader-discovery.test.cjs` (9 test cases)
   - `tests/workstream-loader-validation.test.cjs` (8 test cases)
   - Both files fail MODULE_NOT_FOUND on first run — intended RED state.

2. **Task 2 (GREEN): workstream-as-YAML loader + yaml-mini + _example fixture** — `51c47b1` (feat)
   - `brief/bin/lib/yaml-mini.cjs` (NEW, 197 lines)
   - `brief/bin/lib/workstream-loader.cjs` (NEW, 111 lines)
   - `brief/workstreams/_example/spec.yaml` (NEW fixture)
   - `brief/workstreams/_example/templates/artifact.md` (NEW fixture)
   - All 17 tests GREEN on first impl iteration.

## Files Created/Modified

- `brief/bin/lib/yaml-mini.cjs` — Full-document YAML mini-parser with closed grammar (scalars/lists/nested maps). `Object.create(null)` containers, reserved-key rejection, MAX_DEPTH=10 + 64KB input caps.
- `brief/bin/lib/workstream-loader.cjs` — `loadWorkstreams(cwd)` globs `brief/workstreams/*/spec.yaml`, parses via yaml-mini, validates against D-13 with structured thrown Errors. Sibling of `brief/bin/lib/workstream.cjs` (R-2 non-overlap).
- `brief/workstreams/_example/spec.yaml` — FND-08 acceptance-demo fixture with D-13 required fields only (name, description, research_prompts[2], design_prompts[1], output_artifact_template).
- `brief/workstreams/_example/templates/artifact.md` — Placeholder template with BRIEF audience-guard frontmatter (audience: internal, confidentiality: internal-only, voice: direct).
- `tests/workstream-loader-discovery.test.cjs` — 9 tests covering end-to-end _example discovery, FND-08 success criterion (second-workstream-without-code-change), yaml-mini scalar/list/nested coverage, prototype-pollution guard, null-prototype result verification, missing-dir / dotfile / no-spec.yaml edge cases.
- `tests/workstream-loader-validation.test.cjs` — 8 tests covering every D-13 rejection rule + both directory-traversal attack vectors (output_artifact_template and business_model_variants).

## Decisions Made

- **Sibling module over extension** (R-2 applied): kept `brief/bin/lib/workstream.cjs` untouched; created `brief/bin/lib/workstream-loader.cjs` as a sibling. Zero shared code, zero import edges between them. Prevents the parallel-milestone concept from being conflated with the business-artifact concept.
- **yaml-mini.cjs as separate file** (D-12 planner discretion): frontmatter.cjs was at 379 lines pre-Phase-2 and CONTEXT.md soft-caps it at ~400. Adding ~150-200 lines of new parser logic in-place would cross the cap and risk collateral damage to the 198 test files that depend on `extractFrontmatter`/`reconstructFrontmatter`. A sibling module keeps the new parser's blast radius zero.
- **Null-prototype containers + throw on reserved keys**: both mitigations are present — Object.create(null) guarantees that even a parser bug cannot pollute `Object.prototype`, and the explicit throw emits a loud descriptive error instead of silently dropping the hostile input. Two tests assert both behaviors.
- **RED+GREEN collapsed into 2 commits**: plan_context specified `test(02-05): ... RED tests — discovery + validation` followed by `feat(02-05): ...`. Both test files shipped in the RED commit (to enforce "tests must fail before impl exists") so the GREEN commit could land impl + fixtures + 17 passing tests in one atomic unit.
- **Comment wording avoided grep-collision**: acceptance criterion `! grep -q "require.*workstream\.cjs"` was tripped by a docstring that said "MUST NOT require or extend workstream.cjs". Reworded the docstring to satisfy the literal grep test while preserving the R-2 intent.

## Deviations from Plan

None. Plan executed exactly as written:
- 6 files shipped (matches `files_modified` list).
- All 11 acceptance criteria from Task 1 + all 9 from Task 2 verified.
- Zero runtime deps preserved.
- npm-test baseline stayed at 63 (no regressions).
- File size caps met.
- TDD RED-then-GREEN gate sequence executed with visible failing intermediate state.

## Threat Flags

No new security-relevant surface introduced beyond the planned threat register (T-02-05-01, T-02-05-02, T-02-05-03). All fall within the `<threat_model>` block of the PLAN.

## Issues Encountered

- **Grep-collision on R-2 acceptance check**: the literal-grep acceptance criterion `! grep -q "require.*workstream\.cjs"` matched a documentation comment that said "this loader MUST NOT require or extend workstream.cjs". The comment was not actually importing the module — it was declaring the non-import policy. Reworded the comment to say "MUST NOT import or extend that adjacent module" to satisfy the literal grep text. No semantic change; verification re-run confirmed all 17 tests still GREEN and the literal acceptance check now passes.

## Next Phase Readiness

- Phase 7 (`/brief-add-workstream` flow) can now populate 9 real workstreams (BMC, GTM, FINANCIAL, OPS, COMPLIANCE, ROADMAP, BRAND, RISK, TECH-ARCH) by writing `spec.yaml` files into `brief/workstreams/<slug>/`. Each spec will be discovered and validated against D-13 with zero `.cjs` source changes.
- Phase 5 (DISCOVER) can read `research_prompts[]` from each loaded spec to parameterize domain research agents.
- Phase 7 (DESIGN) can read `design_prompts[]` + `output_artifact_template` to emit business-planning artifacts through the audience guard.
- The `_example` workstream is marked with an underscore prefix per D-14 so Phase 7 may remove or replace it when real workstreams land.
- No blockers; Phase 2 waves 2-4 (plans 02-02, 02-03, 02-04, 02-06) are independent of this plan's outputs per the wave-1 schedule.

## Self-Check: PASSED

Claimed files verified on disk:
- FOUND: brief/bin/lib/yaml-mini.cjs
- FOUND: brief/bin/lib/workstream-loader.cjs
- FOUND: brief/workstreams/_example/spec.yaml
- FOUND: brief/workstreams/_example/templates/artifact.md
- FOUND: tests/workstream-loader-discovery.test.cjs
- FOUND: tests/workstream-loader-validation.test.cjs

Claimed commits verified in git log:
- FOUND: 2d8cde5 (test(02-05): add workstream loader RED tests)
- FOUND: 51c47b1 (feat(02-05): workstream-as-YAML loader + yaml-mini + _example fixture)

Acceptance verification re-run:
- All 17 tests GREEN
- Zero runtime deps (`dependencies` key is empty)
- npm-test baseline: 63 failures (unchanged from Phase 1 inheritance)
- File size caps: yaml-mini.cjs 197/200, workstream-loader.cjs 111/150
- Security guards present: proto-pollution, traversal, dotfile
- R-2 literal-text acceptance: no "require.*workstream\.cjs" substring in loader

---
*Phase: 02-stable-seam-anchor-schema-caps-workstream-as-config*
*Plan: 05*
*Completed: 2026-04-19*
