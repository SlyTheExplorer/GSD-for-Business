---
phase: 06-bidirectional-foundation-phase-1-2-return-stack
plan: 05
subsystem: status-renderer
tags: [status-cjs, return-stack, gap-loop, round-trips, telemetry, derived-at-read-time, d-06, d-15, d-17, d-18, dsg-14]

# Dependency graph
requires:
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-01 fixtures — stack-depth-0/1/3 + history-cross-workstream JSON
      seed `state.brief.return_stack` + `return_stack_history` shapes that
      tests/brief-return-stack-status-render.test.cjs reads verbatim
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-03 gap-detect.cjs — confirms the state schema (return_stack +
      return_stack_history field names + frame field shape) that this plan's
      renderer reads. Grep-audit also covers gap-detect.cjs for D-06 enforcement.
  - phase: 02-stable-seam-anchor-schema-caps-workstream-as-config
    provides: |
      D-15 compact dashboard format + D-17 resilience contract + D-18
      read-only discipline + D-19 stdout output stream. Phase 6 Plan 05 only
      APPENDS rows; never replaces or reformats existing rows.
      Also: D-20 array-of-objects YAML round-trip in frontmatter.cjs that
      the test helper uses to seed STATE.md from JSON fixtures.

provides:
  - "brief/bin/lib/status.cjs renderStatus() — extended with Gap loop + Round-trips rows BELOW Last COMPLIANCE and ABOVE the divider"
  - "Two new dashboard rows: `Gap loop {topic|—}` (top frame triggering_topic) + `Round-trips {ws}: {count}, ...` (derived from history grouping)"
  - "D-06 derive-at-read-time discipline structurally enforced — grep-audit asserts ZERO occurrences of `round_trip_counter` literal in state.cjs, gap-detect.cjs, AND status.cjs"
  - "T-06-05-01 mitigation — defensive null-checks filter malformed history entries (null items, missing/empty paused_workstream, non-objects) without crash"
  - "12 new tests + 49 new assertions across 2 files locking the contract"
affects: [06-06, 06-07, 06-08]

# Tech tracking
tech-stack:
  added: []  # A1 preserved — zero runtime deps; Map + Array.from are built-ins
  patterns:
    - "Append-rows-before-divider extension pattern — preserves Phase 2 D-15 format without breaking 8 existing tests in tests/status-renderer.test.cjs (lines 105-116 of status.cjs reorganized only by inserting two rows + computing two locals)"
    - "Defensive Map-grouping reduction — `for (const f of history)` loop with two-stage shape guard (`!f || typeof f !== 'object'` then `typeof f.paused_workstream !== 'string' || .length === 0`) matches the same defensive style used in countIterations (gap-detect.cjs Plan 03)"
    - "Comment-text-content audit guard — the `round_trip_counter` literal cannot appear ANYWHERE in source (including docstrings/comments) without the grep-audit failing. Forces docstrings to paraphrase the anti-pattern (`stored counter field`) rather than name it literally. Stronger structural guarantee than `.match()` on AST nodes alone."
    - "Render-time telemetry derivation — Round-trips count is recomputed every `/brief-status` invocation; cost is O(N) over history length (N capped at ~9 = 3 frames × 3 workstreams realistic ceiling per Phase 6 design)."

key-files:
  created:
    - tests/brief-return-stack-status-render.test.cjs
    - tests/brief-return-stack-derived-count.test.cjs
  modified:
    - brief/bin/lib/status.cjs

key-decisions:
  - "Used `reconstructFrontmatter` from frontmatter.cjs in the test helper (rather than hand-rolled string concatenation) — keeps the YAML emitted in test STATE.md byte-equal to what gap-detect.cjs would produce, avoiding the false-negative trap noted in Plan 03 SUMMARY decision #2 (`seedAlignResult` regex-replace pitfall)."
  - "Inserted derivation logic INSIDE renderStatus() (not as a separate exported helper) — keeps the file under 180 lines and avoids growing the lib's public surface. Phase 6 has no other reader that needs to derive Round-trips counts; if Plan 06-06+ adds one, factor out then."
  - "Paraphrased `round_trip_counter` as `stored counter field` in docstrings/comments — the grep-audit (intentionally) catches the literal token everywhere, including comments. Naming the anti-pattern verbatim in source would create a self-referential trap. The paraphrase is no less informative for a future reader."

patterns-established:
  - "Comment-content guard via grep-audit — first instance in Phase 6 of a structural test that catches forbidden literals in BOTH code AND comments. Generalizes to any future `do not store X` discipline (e.g., 'do not cache user input', 'do not log secrets')."
  - "Append-only renderer extension — pattern for any future `/brief-status` row addition (Phase 7 COMPLIANCE telemetry, Phase 8 DELIVER export status, Phase 9 surface-cap audit summary): insert template-string row BEFORE divider; preserve existing row order; keep file ≤180 lines."

requirements-completed: [DSG-14]

# Metrics
duration: ~5 min
completed: 2026-04-24
---

# Phase 6 Plan 05: Return-Stack /brief-status Section Summary

**status.cjs gains two Phase-6 telemetry rows (Gap loop + Round-trips) BELOW Last COMPLIANCE and ABOVE the 32-char divider, satisfying DSG-14 SC #3 (current depth + max depth + active topic + per-workstream round-trip counts) without introducing any stored counter field. D-06 derive-at-read-time discipline is structurally enforced by a grep-audit across state.cjs + gap-detect.cjs + status.cjs. File grew 130 → 165 lines (≤180 target). 12 new tests / 49 assertions pass; 8 existing status-renderer tests + 26 brief-statusline tests + 163 adjacent Phase 4/5/6 tests all regression-safe.**

## Performance

- **Duration:** ~5 min (single-task TDD plan)
- **Started:** 2026-04-24T05:17:33Z
- **Completed:** 2026-04-24T (Wave 3 parallel execution)
- **Tasks:** 1 / 1
- **Files created:** 2 (test files)
- **Files modified:** 1 (status.cjs)
- **Net additions:** +37 lines / -2 lines in status.cjs

## Accomplishments

- **Task 1 (TDD)** — RED ships 12 failing tests across 2 files (49 assertions); GREEN extends `renderStatus()` with derivation logic + 2 template-string rows; all 12 tests + 8 baseline status-renderer tests pass.
- **D-06 structural enforcement** — grep-audit catches the `round_trip_counter` literal anywhere in state.cjs, gap-detect.cjs, OR status.cjs (including docstrings/comments). Returns 0 across all three files.
- **D-15 dashboard format preserved** — all 8 existing rows (BRIEF Status header, ===, Phase, Workstream, Return stack, Last ALIGN, Last AUDIENCE, Last COMPLIANCE, divider, Next) render unchanged. New rows slot into the 2-column 32-char-dash structure between Last COMPLIANCE and divider.
- **T-06-05-01 mitigation active** — malformed history entries (null, non-object, missing/empty paused_workstream) silently filtered by two-stage shape guard inside the grouping loop.
- **A1 preserved** — `Object.keys(require('./package.json').dependencies||{}).length === 0`. Map + Array.from are Node built-ins.
- **Surface cap preserved** — no new `commands/brief/*.md` files; no new agents; Phase 6 net additions to user-facing slash commands remains 0.

## Task Commits

| Task | Type | Hash | Description |
|------|------|------|-------------|
| 1 (RED) | test | `7cdde63` | add failing tests for status.cjs Gap loop + Round-trips rows (DSG-14 SC #3) |
| 1 (GREEN) | feat | `4cb50d0` | status.cjs Gap loop + Round-trips rows (DSG-14 SC #3) |

_Plan metadata commit pending — orchestrator owns STATE.md / ROADMAP.md writes._

## Files Created/Modified

### Created (2 files, 335 total LOC)

| Path | Lines | Purpose |
|------|-------|---------|
| `tests/brief-return-stack-status-render.test.cjs` | 236 | 7 tests / 34 assertions covering empty / 1-frame / 3-frames / cross-workstream / missing-history / malformed-history / row-preservation+ordering |
| `tests/brief-return-stack-derived-count.test.cjs` | 99 | 5 tests / 15 assertions covering grep-audit (state.cjs + gap-detect.cjs + status.cjs) + ≤180-line discipline + label preservation + read-only discipline |

### Modified (1 file)

| Path | Before | After | Δ | Purpose |
|------|-------:|------:|---:|---------|
| `brief/bin/lib/status.cjs` | 130 | 165 | +35 | renderStatus() extension: Map-grouping derivation logic + 2 template-string rows + ~7 docstring lines + ~5 inline comment lines |

## Verification

**All plan `<verification>` checks pass:**

| Check | Expected | Actual |
|-------|----------|--------|
| `node --test tests/brief-return-stack-status-render.test.cjs tests/brief-return-stack-derived-count.test.cjs` exit 0 | exit 0 | exit 0 |
| `grep -c 'Gap loop' brief/bin/lib/status.cjs` | ≥1 | 3 (docstring + label + variable name region) |
| `grep -c 'Round-trips' brief/bin/lib/status.cjs` | ≥1 | 4 (docstring + label + 2 variable contexts) |
| `grep -cE 'round_trip_counter' brief/bin/lib/state.cjs brief/bin/lib/gap-detect.cjs` (across files) | 0 | 0 (state.cjs:0, gap-detect.cjs:0) |
| `wc -l brief/bin/lib/status.cjs` | ≤180 | 165 |
| Existing `tests/status-renderer.test.cjs` regression | 8/8 pass | 8/8 pass |
| Existing `tests/brief-statusline.test.cjs` regression | 26/26 pass | 26/26 pass |
| Adjacent regression (align + audience + gap-detect + status-renderer) | 163/163 pass | 163/163 pass |

### Test breakdown per file

| Test file | Tests | Assertions | Runtime |
|-----------|-------|-----------:|---------|
| `brief-return-stack-status-render.test.cjs` | 7 | 34 | ~10 ms |
| `brief-return-stack-derived-count.test.cjs` | 5 | 15 | ~3 ms |
| **Total** | **12** | **49** | **~13 ms** |

### Sample rendered output per fixture

**stack-depth-0.json** (empty stack + empty history):
```
BRIEF Status
================================
  Phase           06 of 9 (Return Stack)
  Workstream      — (none active)
  Return stack    0 / 3
  Last ALIGN      — (none yet)
  Last AUDIENCE   — (none yet)
  Last COMPLIANCE — (none yet)
  Gap loop        —
  Round-trips     —
--------------------------------
  Next: Phase 6 in flight
```

**stack-depth-1.json** (single frame, go-to-market):
```
BRIEF Status
================================
  Phase           06 of 9 (Return Stack)
  Workstream      — (none active)
  Return stack    1 / 3
  Last ALIGN      — (none yet)
  Last AUDIENCE   — (none yet)
  Last COMPLIANCE — (none yet)
  Gap loop        Korea fintech TAM
  Round-trips     go-to-market: 1
--------------------------------
  Next: Phase 6 in flight
```

**stack-depth-3.json** (3 frames across 2 workstreams):
```
BRIEF Status
================================
  Phase           06 of 9 (Return Stack)
  Workstream      — (none active)
  Return stack    3 / 3
  Last ALIGN      — (none yet)
  Last AUDIENCE   — (none yet)
  Last COMPLIANCE — (none yet)
  Gap loop        Cost drivers
  Round-trips     go-to-market: 2, financial: 1
--------------------------------
  Next: Phase 6 in flight
```

**history-cross-workstream.json** (3 history pushes across 2 workstreams, active stack empty):
```
BRIEF Status
================================
  Phase           06 of 9 (Return Stack)
  Workstream      — (none active)
  Return stack    0 / 3
  Last ALIGN      — (none yet)
  Last AUDIENCE   — (none yet)
  Last COMPLIANCE — (none yet)
  Gap loop        —
  Round-trips     go-to-market: 2, financial: 1
--------------------------------
  Next: Phase 6 in flight
```

### Grep-audit result for `round_trip_counter`

| File | Occurrences | Disposition |
|------|------------:|-------------|
| `brief/bin/lib/state.cjs` | 0 | D-06 derived discipline upheld |
| `brief/bin/lib/gap-detect.cjs` | 0 | D-06 derived discipline upheld |
| `brief/bin/lib/status.cjs` | 0 | D-06 derived discipline upheld (renderer too) |

The test catches the literal token in code AND comments. Plan 05 docstrings/comments paraphrase the anti-pattern as "stored counter field" instead of naming it verbatim, preventing the audit from self-referentially failing while preserving documentation value.

### Pre-existing `tests/brief-status*.test.cjs` regression

```
$ node --test tests/brief-statusline.test.cjs
ℹ tests 26
ℹ pass 26
ℹ fail 0
```

`tests/status-renderer.test.cjs` (the FND-10 / D-15..D-19 contract tests):

```
$ node --test tests/status-renderer.test.cjs
ℹ tests 8
ℹ pass 8
ℹ fail 0
```

No baseline test broke. Phase 2 D-15 dashboard contract intact.

## Decisions Made

- **Inserted derivation logic INSIDE `renderStatus()` rather than extracting a helper.** Three reasons: (1) Phase 6 has no other reader that needs Round-trips counts; (2) keeping it inline holds status.cjs at 165 lines vs. ~190 if a separate `deriveRoundTrips()` helper plus its docstring were factored out; (3) Phase 9 surface-cap audit prefers fewer exported symbols. If Plan 06-06+ adds a second consumer, factor out then.
- **Used `reconstructFrontmatter` (not raw string YAML) in the test helper.** Plan 03 SUMMARY decision #2 documented the regex-replace pitfall (`seedAlignResult`) where a hand-rolled string-concatenation YAML approach silently failed because the lib's actual writer expanded `brief: {}` differently. Using `reconstructFrontmatter` directly produces byte-equal YAML to what gap-detect.cjs writes, avoiding any test-vs-runtime schema drift.
- **Paraphrased `round_trip_counter` as `stored counter field` in docstrings.** First-draft docstrings named the anti-pattern verbatim and triggered the grep-audit failure (count = 2). Rather than weaken the audit (e.g., scope it to non-comment lines), I tightened the docstring vocabulary. This makes the grep-audit a stronger structural guarantee — even comments cannot accidentally introduce or normalize the anti-pattern's name.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Initial docstring contained `round_trip_counter` literal that the grep-audit explicitly forbids**

- **Found during:** Task 1 GREEN test run (1 of 12 tests failed: `status.cjs derives counts at read time` reported 2 occurrences)
- **Issue:** First-draft docstring documented the anti-pattern by naming it: `"NEVER stored as state.brief.round_trip_counter (anti-pattern, drift risk)"`. The grep-audit (per the plan's task 1 behavior #7) intentionally catches the literal token EVERYWHERE in source — including docstrings — to prevent any normalization or accidental introduction. The test correctly red-flagged 2 self-referential occurrences (header docstring + inline comment).
- **Fix:** Rewrote both occurrences to paraphrase the discipline: `"NEVER stored in any explicit counter field on state.brief.* (anti-pattern, drift risk)"` (header) + `"NEVER read a stored counter field"` (inline comment). Information content preserved; literal token avoided.
- **Files modified:** `brief/bin/lib/status.cjs` (folded into the GREEN commit `4cb50d0`)
- **Rationale:** This is exactly the structural enforcement the test was designed to provide. Weakening the audit (e.g., excluding comment lines) would defeat the purpose. Tightening the documentation vocabulary is the correct mitigation.

No other deviations. The plan's prescribed shape (insert 2 rows BELOW Last COMPLIANCE, derivation logic INSIDE renderStatus, target ≤180 lines) was followed verbatim.

## Issues Encountered

- **One failing test on first GREEN run** — the docstring-literal grep-audit collision documented as Deviation #1 above. Fixed in 2 minutes; did not require re-running RED.
- **Worktree base-commit mismatch on startup** — actual HEAD was `fb7385f` (main branch); expected base was `b7d67b4` (Phase 6 Wave 2 completion). Resolved with `git reset --hard b7d67b4` to bring in the parallel Phase 5/6 work that this plan depends on. No code changes were lost (worktree had no in-progress edits before reset).
- **No other issues.** Plan structure was clear; reading 06-RESEARCH.md Pattern 9 + Example 5 produced the implementation pattern directly.

## User Setup Required

None — all test fixtures are repo-internal JSON files already shipped by Plan 06-01. No external services, no env vars, no credentials.

## Next Phase Readiness

**Plan 06-06 unblocked** — `align-gate.md` Step 8 + meta-arbiter integration can rely on the renderer to display return-stack telemetry to the user when the meta-arbiter prompt fires.

**Plan 06-07 unblocked** — text_mode meta-arbiter branch can reference `/brief-status` output as part of the user-visible context (the round-trip count user sees in the prompt is the same count rendered here).

**Plan 06-08 verification** has the grep-audit as one of its structural assertions: `round_trip_counter` count = 0 across all four lib files (now including status.cjs).

**A1 preservation**: Object.keys(require('./package.json').dependencies||{}).length === 0 verified post-commit.

**Surface cap preservation**: no new `commands/brief/*.md` files; no changes to `bin/install.js`. Phase 6 net additions to user-facing slash commands remains 0.

## Known Stubs

None. The `Gap loop` row uses `triggering_topic` from the top frame which is already populated by Plan 03's `pushReturnFrame` (D-09 fingerprint contract). The `Round-trips` row derives entirely from `return_stack_history` which Plan 03's atomic dual-array write maintains. No placeholder values flow to UI; the `—` rendering is the correct empty-state semantic, not a stub.

## Threat Flags

No new surface beyond the plan's `<threat_model>` register. The 3 STRIDE threats (T-06-05-01 through T-06-05-03) are dispositioned as:

| Threat | Disposition | Mitigation present? | Verified by |
|--------|-------------|---------------------|-------------|
| T-06-05-01 (hand-edited STATE.md with malformed history entries) | mitigate | Yes — two-stage shape guard in derivation loop | `brief-return-stack-status-render.test.cjs` test "malformed history entries (null + missing fields) are filtered without crash" |
| T-06-05-02 (10k-entry history DoS) | accept | n/a — Phase 6 design caps realistic growth at 3 frames per (workstream, fingerprint) | Phase 9 HRD-01 pilot concern; not enforced structurally here |
| T-06-05-03 (triggering_topic leaks confidential context in /brief-status) | accept | n/a — local CLI render; user controls terminal output | Out-of-scope per disposition |

No new trust boundaries introduced. The render path is read-only (D-18) — no new write surface; no new external input channel beyond what STATE.md already exposes.

## Self-Check: PASSED

Verified by direct file existence + git log commit hash check.

**Files (3/3 found):**
- `brief/bin/lib/status.cjs` — FOUND (165 lines)
- `tests/brief-return-stack-status-render.test.cjs` — FOUND (236 lines)
- `tests/brief-return-stack-derived-count.test.cjs` — FOUND (99 lines)

**Commits (2/2 found in `git log`):**
- `7cdde63` (Task 1 RED — test files) — FOUND
- `4cb50d0` (Task 1 GREEN — status.cjs extension) — FOUND

**Test suite:** 12/12 new pass + 0 fail; 8/8 status-renderer regression pass; 26/26 brief-statusline regression pass; 163/163 adjacent (align + audience + gap-detect + status-renderer) regression pass.

---

*Phase: 06-bidirectional-foundation-phase-1-2-return-stack*
*Plan: 05*
*Completed: 2026-04-24*
