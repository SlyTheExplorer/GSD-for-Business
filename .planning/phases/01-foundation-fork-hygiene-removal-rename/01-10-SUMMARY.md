---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 10
subsystem: test-side-gap-closure
tags: [test-rewrite, gsd-to-brief-rename, scope-deviation-closure, halt]
requires:
  - phase: 01
    plan: 09
    sha: b179c42
provides:
  - test-side closure of tuple-form + .startsWith-filter + install-output + conversion-fixture residues (48 test files, 153 tests recovered)
affects:
  - .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt (appended PLAN 10 section)
  - .planning/phases/01-foundation-fork-hygiene-removal-rename/10-APPROACH.md (new)
  - .planning/phases/01-foundation-fork-hygiene-removal-rename/10-PARTIAL-AUDIT.md (new, HALT)
tech-stack:
  added: []
  patterns: [test-runner-driven-enumeration, atomic-cluster-commits, T-A-fixture-spec-alignment]
key-files:
  created:
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/10-APPROACH.md
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/10-PARTIAL-AUDIT.md
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-10-SUMMARY.md
  modified:
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt
    - tests/analyze-dependencies.test.cjs
    - tests/antigravity-install.test.cjs
    - tests/audit-fix-command.test.cjs
    - tests/augment-conversion.test.cjs
    - tests/autonomous-allowed-tools.test.cjs
    - tests/autonomous-interactive.test.cjs
    - tests/autonomous-to-flag.test.cjs
    - tests/brief-tools-path-refs.test.cjs
    - tests/bug-1736-local-install-commands.test.cjs
    - tests/claude-skills-migration.test.cjs
    - tests/codebuddy-install.test.cjs
    - tests/codex-config.test.cjs
    - tests/command-count-sync.test.cjs
    - tests/copilot-install.test.cjs
    - tests/core.test.cjs
    - tests/cursor-conversion.test.cjs
    - tests/cursor-reviewer.test.cjs
    - tests/discuss-all-flag.test.cjs
    - tests/discuss-mode.test.cjs
    - tests/discuss-phase-power.test.cjs
    - tests/execute-phase-active-flags.test.cjs
    - tests/execute-phase-wave.test.cjs
    - tests/explore-command.test.cjs
    - tests/extract-learnings.test.cjs
    - tests/import-command.test.cjs
    - tests/kilo-install.test.cjs
    - tests/managed-hooks.test.cjs
    - tests/milestone-summary.test.cjs
    - tests/next-safety-gates.test.cjs
    - tests/progress-forensic.test.cjs
    - tests/quick-research.test.cjs
    - tests/quick-session-management.test.cjs
    - tests/qwen-install.test.cjs
    - tests/reapply-patches.test.cjs
    - tests/reapply-verify-hunks.test.cjs
    - tests/scan-command.test.cjs
    - tests/thread-session-management.test.cjs
    - tests/trae-install.test.cjs
    - tests/windsurf-conversion.test.cjs
    - tests/agent-required-reading-consistency.test.cjs
decisions:
  - "Adopted Option B (test-runner-driven enumeration) over Option A (substring-grep enumeration) per orchestrator brief — bypasses Plan 09's enumeration defect"
  - "Preserved 3 T-B files (claude-skills-migration, copilot-install lines 1407/1440, removed-surfaces.smoke.txt) with zero edits to legacy-cleanup assertions"
  - "Re-aligned conversion-function test fixtures from gsd:→gsd- spec (pre-Plan-08) to brief:→brief- spec (post-Plan-08) because rewriting tests is cheaper than reverting Plan 08 source changes"
  - "HALT at cycle 6 POST=63 because remaining failures are all source-side drift (missing files, docs, source behavior, source content) that Plan 10's zero-source-change scope forbids"
metrics:
  duration_hours: 1.3
  completed_date: 2026-04-18
  tasks: 7 (approach + 6 atomic clusters)
  files_changed: 48 test files + 3 planning artifacts + STATE/ROADMAP
  tests_recovered: 153
  pre_cycle_count: 216
  post_cycle_count: 63
  recovery_percent: 70.8
  gate_result: HALT
  cycles: 6
  scope_violations: 0
---

# Phase 1 Plan 10: Test-Runner-Driven Residual Closure Summary

**GATE: HALT** — POST=63 vs CAP=16 after 6 atomic-cluster cycles. 153 tests recovered (70.8%).
All 63 remaining failures are source-side drift requiring a follow-up Plan 11 or HALT-ACCEPTED
decision; Plan 10's test-side scope-deviation closure work is complete.

## One-liner

Test-runner-driven closure of Plan 09's scope-deviation gap — rewrote tuple-form path.join,
.startsWith-prefix filters, install-output paths, and conversion-function test fixtures
across 48 test files via 6 atomic cluster commits to align with post-Plan-08 source reality.

## Context

Plan 09 HALTed at POST=216 across 3 stable loops. Root cause: the planner enumerated files
via substring grep for `commands/gsd`, which missed the semantically-equivalent tuple form
`path.join(..., 'commands', 'gsd', ...)` present in ~40 additional tests/ files. Plan 10
bypassed the enumeration step entirely by using the test runner's own failure output
(`/tmp/plan09-post-test.txt` → 50 unique failing files extracted to `/tmp/p10-files.txt`)
as the authoritative source of truth.

## Approach

6-cycle loop:
1. Measure via `npm test 2>&1 > /tmp/plan10-cycle-N.txt; grep -cE '^✖'`
2. Enumerate failing files from runner output
3. Classify residues per Plan 09's T-A/T-B/T-C/T-D framework
4. Rewrite atomically via context-aware Edit calls (not blind sed)
5. Commit cluster
6. Re-measure and loop

Cycle progression: **216 → 117 → 117 → 105 → 101 → 76 → 63** (monotonically decreasing
after cycle 2 with zero regressions introduced).

## What Was Built

### Cluster A — T-A tuple-form path.join rewrites (31 test files, commit ee719c6)

Pattern: `path.join(..., 'commands', 'gsd', ...)` → `path.join(..., 'commands', 'brief', ...)`.
Closes Plan 09's specific scope-deviation gap. 99 tests recovered.

### Cluster B — T-A .startsWith('gsd-') filter rewrites (3 files, commit 6190fc4)

Filters on `agents/` and `hooks/` directory listings that now contain only `brief-*` files
(Plan 03/04 rename). Exposed hidden source-side failures; net POST change 0 but eliminated
module-load cascade errors.

### Cluster C — T-A install-output skill-directory filters (4 files, commit ab83010)

`install.js` passes `'brief'` as prefix to `copyCommandsAs*Skills()`, producing `brief-*`
skill directories. Tests that filtered for `gsd-*` post-install found 0 and failed. 12 tests
recovered.

### Cluster D — T-A cleanup (2 files, commit 0d1ebf4)

- `gsdAgents → briefAgents` variable-rename miss in copilot-install.test.cjs:1201
- qwen install-output path `skills/gsd-help` → `skills/brief-help`

### Cluster E — T-A conversion-fixture spec alignment (5 files, commit ec055c9)

`install.js` CONV-07 function converts `brief:` → `brief-` (not `gsd:` → `gsd-`). Tests
that passed `gsd:` as input and expected `gsd-` output were testing pre-Plan-08 behavior.
Rewrote test INPUT fixtures to use `brief:` to match post-rename contract. 25 tests recovered.

### Cluster F — T-A conversion fixture + skill-manifest prefix alignment (3 files, commit 1498af8)

`listCodexSkillNames()` defaults `prefix='brief-'` so writeManifest test fixtures that
created `skills/gsd-next/` etc. were invisible to the manifest walker. Renamed fixture
skill-dirs to `brief-<name>`. 13 tests recovered.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 2 — Missing critical functionality] copilot-install.test.cjs line 1201 ReferenceError**

- **Found during:** Cluster C measurement
- **Issue:** Cluster C edit renamed `gsdAgents` → `briefAgents` at lines 1153, 1161, 1172,
  1180 but missed line 1201 (`assert.deepStrictEqual(gsdAgents, expected)`). Exposed as
  ReferenceError at test runtime.
- **Fix:** Added Cluster D to rename the remaining reference.
- **Files modified:** tests/copilot-install.test.cjs
- **Commit:** 0d1ebf4

**2. [Rule 2] Multiple files exposed hidden source-side failures after fixing their
module-load errors (Cluster B effect)**

- **Found during:** Cycle 2 measurement (POST stayed at 117 after Cluster B)
- **Issue:** copilot-install.test.cjs previously failed at module-load with 1 symbolic ✖;
  after fixing its `readdirSync('commands/gsd')` ENOENT at line 1111, 32 individual test
  failures surfaced (previously hidden by the load error).
- **Fix:** No regression — the hidden failures were pre-existing; their exposure made them
  visible to proper triage. Documented in 10-PARTIAL-AUDIT.md §4 as out-of-scope source-side
  drift.

### Out-of-scope discoveries (logged, NOT fixed)

**1. Missing source files (3 files, 19 failures)**

- `brief/workflows/pr-branch.md` — 12 failures (bug-2004 suite)
- `brief/workflows/diagnose-issues.md` — 4 failures (bug-2075, execute-phase-wave)
- `brief/references/ui-brand.md` — 3 failures (next-up-clear-order)

**2. Source-doc drift (14 failures)**

- `docs/ARCHITECTURE.md` claims Total commands/workflows/agents = 75/72/31; actual after
  Plan 02 deletions = 61/58/18.

**3. Source-code-behavior drift (30 failures)**

- `hooks/brief-check-update-worker.js` MANAGED_HOOKS array stale (missing 2, obsolete 1)
- `bin/install.js` cache-path + custom-file-detection + briefHooks table mismatches
- `hooks/brief-read-guard.js` output/JSON handling broken (4 guidance tests fail)

**4. Source content drift (13 failures)**

- agents/ required_reading blocks: 15/20, expected ≥20
- brief/workflows/workstreams.md missing gsd-sdk/brief-tools docs
- commands/brief/autonomous.md + brief/workflows/health.md + brief/bin/lib/verify.cjs carry
  `gsd:<cmd>` frontmatter/refs that Plan 08 didn't rewrite (beyond Plan 08 scope);
  post-Plan-08 CONV-07 leaves them unchanged
- brief/workflows/verify-work.md missing /brief-secure-phase suggestion

All documented in detail in `10-PARTIAL-AUDIT.md` §4. Plan 10's zero-source-change
constraint explicitly forbids touching these; Plan 11 (if spawned) would address them.

## Scope-Boundary Affirmation

`git diff 89cea18 HEAD -- bin/ scripts/ brief/ hooks/ agents/ commands/ docs/ CLAUDE.md
README.md package.json` shows ONLY Plan 08's `19fcaa2` (pre-existing). **Zero Plan 10
source-side hunks.** Scope guard PASS.

## Authentication Gates Encountered

None.

## Known Stubs

None introduced by Plan 10. Source-side drift items documented in §4 are pre-existing
(some from Plan 02 deletions, some from Plan 08 scope boundaries).

## Deferred Issues

63 remaining test failures traced to source-side drift (see 10-PARTIAL-AUDIT.md §4). These
require either:

1. **Plan 11 (recommended):** 4-6 hour source-side closure touching 7-10 source files
   (missing workflow files, ARCHITECTURE.md, hook worker, bin/install.js behaviors).
2. **HALT-ACCEPTED:** Formally defer 63 failures to Phase 2+ / Phase 9; close Phase 1
   at current state with VERIFICATION.md Gap 2 marked `deferred_phase_9`.

## Metrics

- Cycles: 6
- Clusters committed: 6 (+ 1 approach doc + 1 final metadata)
- Test files touched: 48
- Tests recovered: 153 (216 → 63)
- Recovery: 70.8%
- Duration: ~1.3h
- Scope violations: 0
- Source-side hunks: 0

## Commits (this plan)

| Cluster | SHA       | Message                                                                  |
|---------|-----------|--------------------------------------------------------------------------|
| approach| `89809e4` | docs(01-10): create Plan 10 approach doc — test-runner-driven (Option B) |
| A       | `ee719c6` | refactor(01-gap-closure-10): T-A tuple-form path.join rewrites — 31 test files |
| B       | `6190fc4` | refactor(01-gap-closure-10): T-A .startsWith('gsd-') filter rewrites — 3 test files |
| C       | `ab83010` | refactor(01-gap-closure-10): T-A install-output skill-directory filters — 4 test files |
| D       | `0d1ebf4` | refactor(01-gap-closure-10): T-A cleanup — gsdAgents→briefAgents rename + qwen install-output paths |
| E       | `ec055c9` | refactor(01-gap-closure-10): T-A conversion-fixture spec alignment — 5 test files |
| F       | `1498af8` | refactor(01-gap-closure-10): T-A conversion fixture + skill-manifest prefix alignment — 3 test files |

## Key Decisions

1. **Test-runner-driven over substring-grep enumeration (Option B)** — Plan 09 HALTed due
   to enumeration defect; using the runner's own failure output as the authoritative
   source guarantees no file with failing tests is missed.
2. **Conversion-fixture spec alignment** — When CONV-07 source function was rewritten by
   Plan 08 (`gsd:` → `brief:` scope), tests that used `gsd:` input + `gsd-` output
   expectation became misaligned. Rewriting test input to `brief:` is cleaner than
   reverting Plan 08's source edits or creating a parallel `gsd:` conversion path.
3. **HALT at cycle 6 over continuing into source edits** — orchestrator brief constraint #1
   is absolute: zero source-code changes. Cycle 6 POST=63 is the achievable floor without
   violating scope. Further reduction requires Plan 11.
4. **T-B preservation expanded via variable-renames only** — claude-skills-migration line
   371, copilot-install lines 1407/1440 kept their `commands/gsd/` literals untouched;
   only cosmetic variable renames (Cluster D) affected these files.

## Self-Check: PASSED

All created files exist:
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/10-APPROACH.md` ✓
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/10-PARTIAL-AUDIT.md` ✓
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-10-SUMMARY.md` ✓ (this file)

All commits exist in history (verified 89809e4, ee719c6, 6190fc4, ab83010, 0d1ebf4,
ec055c9, 1498af8 via `git log --oneline -10`).

Scope guard: `git diff 89cea18 HEAD -- bin/ scripts/ brief/ hooks/ agents/ commands/ docs/
CLAUDE.md README.md package.json` returns ONLY `bin/install.js scripts/build-hooks.js`
corresponding to Plan 08's pre-existing `19fcaa2` — no Plan 10 source-side hunks.

---

*Summary author: brief-executor (orchestrator-spawned Plan 10), 2026-04-18T09:40:00Z*
*References: 10-APPROACH.md, 10-PARTIAL-AUDIT.md, 09-GAP-CLOSURE-PARTIAL-AUDIT.md §7*
