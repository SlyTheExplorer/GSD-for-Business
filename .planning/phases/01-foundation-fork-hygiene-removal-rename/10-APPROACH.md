---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 10
type: gap-closure (test-runner-driven, Option B)
depends_on: [09]
orchestrator_decision: true
base_commit: b179c42
empirical_baseline: 6
delta_cap: 10
target_post_count_max: 16
scope: tests/ + .planning/phases/01/ (zero source-code changes)
rationale: "09-GAP-CLOSURE-PARTIAL-AUDIT.md §7 Option 1 (tuple-form + name-prefix coverage) executed via test-runner-driven enumeration instead of substring-grep enumeration, to avoid Plan 09's enumeration defect from recurring."
---

# Phase 1 Plan 10: Test-Runner-Driven Residual Closure (Option B)

## Context

Plan 09 hit HALT at POST=216 across 3 stable loops. Root cause: the planner enumerated files
via substring grep `commands/gsd`, which misses the semantically-equivalent tuple form
`path.join(..., 'commands', 'gsd', ...)`. An additional ~40 test files fall outside
Plan 09's 31-file scope.

Plan 10 bypasses the enumeration step entirely and uses **the test runner's own failure
output** as the authoritative source of truth for which files need rewriting. The orchestrator
pre-extracted 50 failing tests/*.test.cjs files from `/tmp/plan09-post-test.txt` into
`/tmp/p10-files.txt`.

## Goal

Drive `grep -cE '^✖' /tmp/plan10-post-test.txt` from 216 → ≤ 16 so VERIFICATION.md Gap 2
transitions `failed` → `satisfied`, closing FND-03 fully.

## Method: Cycle-Driven Loop

1. **Measure:** `npm test 2>&1 > /tmp/plan10-cycle-N.txt; grep -cE '^✖' /tmp/plan10-cycle-N.txt`
2. **Enumerate:** `grep -oE 'tests/[a-zA-Z0-9._-]+\.test\.cjs' /tmp/plan10-cycle-N.txt | sort -u`
3. **Classify per T-A/T-B/T-C/T-D** (framework inherited from 09-PLAN.md §interfaces)
4. **Rewrite atomically** (context-aware Edit tool calls, not blind sed)
5. **Commit cluster** with message `refactor(01-gap-closure-10): <scope>`
6. **Re-measure.** Loop until POST ≤ 16 OR 3 cycles without progress OR 5-cycle cap.

## Starting Enumeration (50 files from /tmp/p10-files.txt)

| Category                    | File count | Residue density |
|-----------------------------|------------|-----------------|
| High-density (≥4 residues)  | 6 files    | 60 residues     |
| Mid-density (2-3 residues)  | 11 files   | 25 residues     |
| Low-density (1 residue)     | 18 files   | 18 residues     |
| Zero-residue (cascade/other)| 15 files   | ~70 failures    |

**Total direct residues observed:** ~103 lines across ~35 files.
**Total ✖ failures:** 216 (one file's failures multiply from one upstream fixture bug.)

## Pre-Execution Triage (per orchestrator brief)

### In-scope fixable (residue-based, expected recovery)

- **Tuple-form `path.join(..., 'commands', 'gsd', ...)`**: ~30 files. Rewrite `'commands', 'gsd'`
  → `'commands', 'brief'`. T-A classification — the directory `commands/gsd/` was deleted by
  Plan 03/04; fresh BRIEF install uses `commands/brief/`.
- **`name: gsd:<cmd>` frontmatter assertions**: ~10 files. **DO NOT rewrite** — verified
  `grep -l "^name: gsd:" commands/brief/*.md | wc -l` returns 61, meaning the source command
  files still carry `name: gsd:<cmd>` frontmatter (Plan 08 did not rewrite these; out of
  its P-A/P-B/P-C/P-D source-side scope). Assertion `frontmatter.includes('name: gsd:audit-fix')`
  is CORRECT and will pass once the `readFileSync` ENOENT (from tuple-form path fix above)
  is gone. These cascade failures are eliminated by fixing the tuple form alone.
- **`.startsWith('gsd-')` filter in agent test**: `agent-required-reading-consistency.test.cjs`
  line 18 filters agents to `gsd-*` prefix; all agents renamed to `brief-*`. T-A rewrite.

### Out-of-scope (not residue-based; document as deferred)

- **`brief/workflows/pr-branch.md` missing** → fails `bug-2004-pr-branch-milestone.test.cjs`
  (12 ✖). File was removed by Plan 02. Source-file deletion, NOT gsd→brief residue.
  Plan 10 scope says zero source changes → deferred.
- **`brief/workflows/diagnose-issues.md` missing** → fails
  `bug-2075-worktree-deletion-safeguards.test.cjs` (2 ✖). Same as above.
- **`docs/ARCHITECTURE.md` count drift** → fails `architecture-counts.test.cjs` (6 ✖) and
  `command-count-sync.test.cjs` (4 ✖). Doc says `Total commands: 75`, reality is 61 after
  Plan 02 deletions. Source-doc drift, NOT residue.
- **Other source-file drifts** uncovered during execution are similarly deferred.

These out-of-scope failures account for ~24+ of the 216 and cannot be closed within Plan 10's
test-only scope. If Plan 10's remaining residue cleanup still leaves POST > 16 after accounting
for these deferred cascades, the plan HALTs and the orchestrator must decide: source-doc fixes
(new plan), or adjusting the delta cap (not recommended — baseline preservation rule).

## Cluster Breakdown (Planned Cycle 1)

Group rewrites by residue pattern (not by file — test-runner-driven):

1. **Cluster A: Tuple-form path.join pattern** — ~30 files, ~35 occurrences.
   Pattern: `'commands',\s*'gsd'` → `'commands', 'brief'`.
   One atomic Edit per file (context-aware), one commit for the whole cluster.
2. **Cluster B: `.startsWith('gsd-')` filter(s)** — 1 file likely
   (agent-required-reading-consistency).
3. **Cluster C: Any residues exposed by Cycle 2 measurement that weren't in Cycle 1.**

## Critical Constraints (from orchestrator brief)

1. Zero source-code changes. Scope guard: `git diff 89cea18 HEAD -- bin/ scripts/ brief/
   hooks/ agents/ commands/ docs/ CLAUDE.md README.md package.json` must show ONLY Plan
   07+08 hunks.
2. T-B preservation: legacy-cleanup assertions keep `gsd-*` literal.
3. Read-before-write: each rewrite uses Edit tool with surrounding context.
4. Atomic cluster commits (5–15 files each; don't bundle).
5. 3-loop HALT protocol (POST non-decreasing) + 5-cycle absolute cap.
6. Baseline numbers immutable: EMPIRICAL_BASELINE=6, DELTA_CAP=10 → POST gate ≤ 16.

## Success Criteria

- `grep -cE '^✖' /tmp/plan10-post-test.txt` ≤ 16
- `05-PRE-TEST-BASELINE.txt` appended with `## PLAN 10 POST-FIX MEASUREMENTS` section
- `10-CLOSURE-AUDIT.md` (PASS) or `10-PARTIAL-AUDIT.md` (HALT) produced
- `01-10-SUMMARY.md` per execute-plan.md template
- STATE.md, ROADMAP.md updated
- Final scope guard: zero new source hunks beyond Plan 07+08

## HALT Conditions

- POST count non-decreasing for 3 consecutive cycles
- New failure class introduced (regression — roll back)
- 5-cycle absolute cap reached

---

*Approach author: brief-executor (orchestrator-spawned Plan 10), 2026-04-18*
*Ref: 09-GAP-CLOSURE-PARTIAL-AUDIT.md §7 Option 1 adapted to runner-enumeration (Option B)*
