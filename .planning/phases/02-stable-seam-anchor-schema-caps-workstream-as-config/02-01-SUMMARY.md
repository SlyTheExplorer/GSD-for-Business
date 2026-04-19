---
phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
plan: 01
subsystem: state-schema
tags: [frontmatter, yaml-serializer, FND-05, D-20, nested-maps, array-of-objects, null-roundtrip]
requires:
  - brief/bin/lib/core.cjs (safeReadFile, normalizeMd, output, error, atomicWriteFileSync — unchanged usage)
provides:
  - Recursive nested-map YAML serializer (up to 10 levels, depth-capped per T-02-01-01)
  - Array-of-objects YAML block-mapping-in-sequence round-trip fidelity
  - JS null ↔ YAML literal `null` round-trip preservation
  - Prototype-pollution guard at both top-level and nested object scopes
  - splitInlineArray exported (previously unexported despite being public per plan <interfaces>)
affects:
  - brief/bin/lib/state.cjs (downstream — unchanged in this plan; FND-05 smoke test lands in later plan)
  - brief/bin/lib/frontmatter.cjs (direct modification)
  - Phase 4/5/6/7 writers that will populate state.brief.last_gate_results.* + return_stack (unblocked by this plan)
tech-stack:
  added: []
  patterns:
    - "Recursive value → line-array serializer with indent + depth arguments (functional, no mutation of input)"
    - "Block-mapping-in-sequence parser: `- key: value` on dash line + subsequent keys at dash+2 indent accumulate into the same object item via a dedicated stack frame"
    - "Literal null coercion: yaml `null` / `~` → JS null at both KEY:VALUE and block-list positions"
    - "Prototype-pollution guard: RESERVED_KEYS Set filtered from Object.keys at every object scope"
key-files:
  created:
    - tests/frontmatter-roundtrip.test.cjs
  modified:
    - brief/bin/lib/frontmatter.cjs
decisions:
  - "Implement D-20 in-place (Option A) — honored existing CONTEXT.md D-20 over superseded D-05 sidecar fallback"
  - "Preserve legacy top-level null skip (reconstructFrontmatter filters null/undefined BEFORE calling serializeValue); nested nulls reach serializeValue and emit literal 'null'. Rationale: existing tests/frontmatter.test.cjs:264-270 `skips null and undefined values` test assumes top-level removal; D-20 only requires nested round-trip."
  - "Keep extractFrontmatter scalar-type contract: non-null scalars return as STRINGS (matches documented behavior at tests/frontmatter.test.cjs:207-213). Adjusted my own D-20 fixtures' findings_count fields from `0`/`1`/`2` to `'0'`/`'1'`/`'2'`. Numeric-type-preservation was an unintended over-specification in my Task 1 RED test, not part of the D-20 contract (CONTEXT.md §D-20 rules 1-4)."
  - "Export splitInlineArray. The plan's <interfaces> block (line 104-109) lists it as public-API, and the acceptance-criteria check (AC-6) asserts its presence in module.exports. The existing module had it defined but unexported; Rule 2 correction."
  - "Inline the two single-call helpers (renderScalar, canInlineArray) into serializeValue to stay inside the 420-line length budget. The plan explicitly authorized `factor the array-of-objects branch into its own helper to stay tight`; trimming comment density + inlining was the chosen form."
metrics:
  duration_minutes: 35
  completed: 2026-04-18T16:30:00Z
  tasks_total: 2
  tasks_complete: 2
  files_created: 1
  files_modified: 1
  commits:
    - hash: b9a6e53
      message: "test(02-01): add frontmatter-roundtrip RED test for D-20 nested/array/null"
    - hash: eccd94f
      message: "fix(02-01): reconstructFrontmatter supports nested maps, arrays-of-objects, null round-trip (D-20)"
---

# Phase 2 Plan 01: frontmatter.cjs D-20 Extension Summary

**One-liner:** `reconstructFrontmatter` now round-trips nested maps, arrays-of-objects, and `null` with deep-strict-equal fidelity; `extractFrontmatter` honors YAML literal `null` and block-mapping-in-sequence; public API unchanged, 41 existing frontmatter tests still green, full suite baseline preserved at 63 failures (delta = 0).

## What Changed

### `brief/bin/lib/frontmatter.cjs` (modified — 379 → 420 lines, +41 within budget)

**Replaced** the hand-coded 3-level nesting tower (former lines 135-170) with a recursive `serializeValue(value, indent, depth)` helper that:

1. **Handles null/undefined at any nested depth** — emits literal `null` line (D-20 rule 1). Top-level nulls continue to be skipped by `reconstructFrontmatter` before entering the recursion, preserving the legacy "skips null and undefined values" test semantic.
2. **Handles empty / inline / block arrays** — preserves the legacy `[]` / `[a, b, c]` / `- item` output shapes (existing tests pass unchanged).
3. **Handles array-of-objects** — emits YAML block-mapping-in-sequence: `- key: value` on the dash line, subsequent keys indented to align with the first key. Replaces the former `String(item)` → `[object Object]` defect surfaced empirically in 02-RESEARCH.md §R-1.
4. **Handles nested object maps at any depth (≤10)** — recursion with indent+2 per level. Replaces the former `String(subsubval)` fallback that stringified nested leaves as `[object Object]`.
5. **Depth-capped at 10** (T-02-01-01 DoS mitigation) — throws a descriptive Error on pathological or cyclic input.
6. **Prototype-pollution guard** — `__proto__` / `constructor` / `prototype` keys filtered via `RESERVED_KEYS` Set at both top-level (`reconstructFrontmatter`) and all nested object scopes (`serializeValue`).

**Extended** `extractFrontmatter` with:

1. **Null-literal coercion** in the KEY:VALUE branch (D-20 rule 3) — `key: null` and `key: ~` now parse to JS `null`, not the string `"null"`. Pairs with `serializeValue`'s null emission to close the round-trip.
2. **Null-literal coercion** in the block-list branch — `- null` / `- ~` also coerce to JS `null`.
3. **Block-mapping-in-sequence recognition** — detects `- key: value` on the dash line, starts a new object item in the current array, pushes a new stack frame so subsequent deeper `key: value` lines accumulate into that item. Completes the array-of-objects round-trip on the parser side (Rule 3 deviation: the serializer produced valid YAML but the parser needed matching grammar to consume it).

**Added** `splitInlineArray` to `module.exports` — it was defined but unexported despite being listed as public in the plan's `<interfaces>` block (line 104-109). Rule 2 alignment.

### `tests/frontmatter-roundtrip.test.cjs` (created — 243 lines, 10 test cases)

5 describe blocks covering the full D-03 schema sampler:

1. **Nested object leaves** (2 tests) — `last_gate_results.align: {decision, severity, findings_count, at}` at 3-level depth, and the full `align/audience/compliance` map with all three gates populated.
2. **Array-of-objects** (3 tests) — single-item `return_stack`, multi-item LIFO `return_stack`, `gap_queue: [{topic, criticality, raised_at}]`.
3. **Null literal preservation** (2 tests) — `current_workstream: null` + all-null `last_gate_results.*`; and null coexisting with non-null siblings.
4. **Two-cycle integrity** (2 tests) — full D-03 fixture serialize→parse→serialize→parse cycle-1==cycle-2 deep-equal; empty arrays survive two cycles.
5. **Backward-compat regression guard** (1 test) — flat scalars, short string arrays, 2-level nested maps preserved.

Every round-trip assertion uses `assert.deepStrictEqual` (not `JSON.stringify`, not `assert.ok`) per 02-PATTERNS.md anti-pattern guidance — catches the null-vs-"null" drift and the `[object Object]` stringification that weaker assertions would mask.

## How R-1 Defect Is Closed

Before this plan, writing a `state.brief.*` payload via `reconstructFrontmatter` and reading it back corrupted every D-03 shape in a distinct way:

| D-03 shape | Before (02-RESEARCH.md R-1) | After (this plan) |
|---|---|---|
| `return_stack: [{from_phase, ...}]` | `[object Object]` string at item 0 | Object with 4 keys, deep-strict-equal to input |
| `last_gate_results.align: {decision, ...}` | `[object Object]` at leaf | Object with 4 keys, deep-strict-equal to input |
| `current_workstream: null` (top-level in brief nested map) | KEY DROPPED from frontmatter | `current_workstream: null` (JS null) |
| `last_gate_results.align: null` (nested) | Would have emitted nothing; parser returned `"null"` string on any surviving literal | JS null on both serialize and parse |

Two-cycle integrity test (Task 1 test block 4) confirms cycle-1 output = cycle-2 output, ruling out any normalize-on-write drift that could accumulate silently.

## Line-Count Delta

`brief/bin/lib/frontmatter.cjs`: 379 → 420 lines (+41). Exactly at the plan's documented target (≤ 420). Within the 500-line hard guardrail. The +41 growth is mostly the recursive serializer + block-mapping parser extension + prototype-pollution guard; inlined `renderScalar` / `canInlineArray` helpers into `serializeValue` to stay inside the budget.

## Regression Surface Checked

- **tests/frontmatter.test.cjs** — 41/41 pass (was 41/41 pre-change). No regressions to flat scalars, inline arrays, 2-level maps, parseMustHavesBlock, spliceFrontmatter, or the #2130 body-`---` mis-parse guard.
- **tests/frontmatter-roundtrip.test.cjs** — 10/10 pass. RED-before, GREEN-after evidence preserved in the git history (commit b9a6e53 at RED, eccd94f at GREEN).
- **Full suite (`node scripts/run-tests.cjs`)** — 622 pass / 63 fail (was 622 pass / 63 fail pre-change for the pre-existing Phase 1 residue). **Delta = 0.** Failure-name set compared by `diff /tmp/baseline-names.txt /tmp/post-names.txt` → identical (62 unique names; the raw 63 includes one duplicate `ui-brand.md — Next Up template` test logged twice).
- **Public API surface** — verified via `node -e` import: all six names (`extractFrontmatter`, `reconstructFrontmatter`, `spliceFrontmatter`, `splitInlineArray`, `parseMustHavesBlock`, `FRONTMATTER_SCHEMAS`) present in `module.exports`.
- **R-1 empirical smoking-gun spot-check** — `roundTrip({brief: {return_stack: [{from_phase: 'DESIGN', to_phase: 'DISCOVER'}]}})` returns `from_phase === 'DESIGN'` (was `'[object Object]'` before).

## Deviations from Plan

### Rule 1 auto-fixes (self-corrections to this plan's own work)

**1. [Rule 1 - Bug] Task 1 RED test fixtures over-specified numeric scalar type**

- **Found during:** Task 2 GREEN validation — 3-level nested-object test failed with `findings_count: 0` (number) vs `'0'` (string) after round-trip.
- **Issue:** My Task 1 RED test assumed `extractFrontmatter` preserved numeric types. It doesn't — the documented contract (tests/frontmatter.test.cjs:207-213) is that non-null scalars return as STRINGS (`wave`, `phase`, `plan` all come back as strings).
- **Fix:** Aligned test fixtures to use `findings_count: '0'` / `'1'` / `'2'` as strings, added a scalar-type-contract comment block at the top of the test file explaining the choice. Numeric-type preservation was NOT part of the D-20 contract (CONTEXT.md §D-20 rules 1-4) and implementing it would have risked regressing hundreds of existing tests that expect string returns.
- **Files modified:** tests/frontmatter-roundtrip.test.cjs
- **Commit:** eccd94f (bundled with Task 2)

### Rule 3 auto-fixes (blocking-issue fixes required to complete the task)

**2. [Rule 3 - Blocking] extractFrontmatter block-list branch did not parse `- key: value` array-of-objects**

- **Found during:** Task 2 GREEN run — serializer produced valid YAML `- from_phase: DESIGN` output, but `extractFrontmatter` returned `['from_phase: DESIGN']` (string item).
- **Issue:** The plan's Task 2 §Change 3 only explicitly required null coercion in the `- ` branch. Array-of-objects parsing was implied by the D-20 round-trip contract (CONTEXT.md §D-20 rule 1) but not spelled out in the action text.
- **Fix:** Extended the parser's `- ` branch to detect `- key: value` and push a new stack frame, so subsequent deeper `key: value` lines accumulate into the current object item. Mirrors the structure the existing `parseMustHavesBlock` already uses for artifact / key_links objects.
- **Files modified:** brief/bin/lib/frontmatter.cjs (extractFrontmatter, lines 98-142 post-edit)
- **Commit:** eccd94f

### Rule 2 alignments (missing critical functionality vs. plan contract)

**3. [Rule 2 - Critical] splitInlineArray was documented as public but not exported**

- **Found during:** Task 2 AC-6 check — `['splitInlineArray', ...].every(k => k in m)` returned `false`.
- **Issue:** The plan's `<interfaces>` block (line 104-109) lists `splitInlineArray(str: string) → string[]` as part of the "Public API (must NOT change)" contract. The existing module had it defined but absent from `module.exports`.
- **Fix:** Added `splitInlineArray` to `module.exports`. This is additive — no caller of the module could have relied on its absence.
- **Files modified:** brief/bin/lib/frontmatter.cjs (module.exports list)
- **Commit:** eccd94f

### No Rule 4 (architectural) deviations

No architectural decisions hit. D-20 was already decided in 02-CONTEXT.md (supersedes D-05); implementation stayed in-scope.

## Authentication Gates

None. This plan is a pure-function code extension with no external network, auth, or environment dependencies.

## Known Stubs

None. All code paths exercised by the new test file are fully implemented (not mocked, not placeholder).

## Forward Link

This plan unblocks **FND-05** (the A4 STATE.md round-trip smoke test) and, by transitive dependency, Phase 4 (ALIGN gate writes to `brief.last_gate_results.align`), Phase 5 (AUDIENCE gate writes to `brief.last_gate_results.audience`), Phase 6 (return stack — array-of-frame-objects writes), Phase 7 (COMPLIANCE gate writes + workstream loader if it ever needs to re-emit nested state).

The companion Plan 02-03 (state.cjs integration — `brief` nested map pass-through in `buildStateFrontmatter` per D-21) can now proceed without fighting the serializer defect.

## Self-Check: PASSED

- [x] File exists: tests/frontmatter-roundtrip.test.cjs (243 lines, 10 test cases, 15 `assert.deepStrictEqual` calls)
- [x] File modified: brief/bin/lib/frontmatter.cjs (420 lines — at budget cap)
- [x] Commit b9a6e53 found in `git log --oneline -5` (Task 1 RED)
- [x] Commit eccd94f found in `git log --oneline -5` (Task 2 GREEN)
- [x] All 51 frontmatter tests (41 existing + 10 new) pass
- [x] Full suite baseline preserved (63 failures, 62 unique names, delta = 0)
- [x] Public API unchanged (6/6 expected exports present)
- [x] Empirical R-1 spot-check passes (array-of-objects round-trip preserves object shape)
