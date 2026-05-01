# HRD-05(a) Per-Test Closure Rationale

**Closed:** 2026-04-27
**Phase:** 09 (Hardening — v1 launch gate)
**Plan:** 09-06 (Phase 9 closure — V1 launch gate)
**Phase 1 HALT-ACCEPTED baseline:** ~19 missing-file tests (RESEARCH.md A7 estimate)
**Actual count after grep enumeration:** 10 test assertions across 4 .cjs test files
**Decision rule:** ALL DELETE-assertion (per PATTERNS.md lines 875-891 ALL-DELETE rubric)
**Locked 12-cmd lineup membership check:** None of `pr-branch.md` / `diagnose-issues.md` / `ui-brand.md` ties to a LOCKED_12 slug; all 3 are inherited GSD developer surfaces removed in Phase 1 FND-02 (developer-surface removal).

## Triage Rubric

Per PATTERNS.md (lines 875-886):

| Candidate File | Tied to LOCKED_12? | Action | Rationale |
|----------------|---------------------|--------|-----------|
| `brief/workflows/pr-branch.md` | NO — milestone PR flow inherited from GSD developer surface | DELETE assertion | Not in 12-cmd lineup |
| `brief/workflows/diagnose-issues.md` | NO — `gsd-debugger` agent intentionally absent post-Phase-1 (FND-02 dev-surface removal) | DELETE assertion | Permanently gone in v1 |
| `brief/references/ui-brand.md` | NO — `gsd-ui-researcher` / `gsd-ui-checker` agents intentionally absent post-Phase-1 | DELETE assertion | Permanently gone in v1 |

LOCKED_12 lineup (CLAUDE.md "Surface Caps" section): `/brief-define`, `/brief-discover`, `/brief-design`, `/brief-add-workstream`, `/brief-deliver`, `/brief-export`, `/brief-status`, `/brief-help`, `/brief-init`, `/brief-progress`, `/brief-undo`, `/brief-pause-work`. None of the 3 candidate files supports any LOCKED_12 command — they all support deleted GSD developer surfaces.

## Per-Test Decisions

| Test File | Test Name(s) | Missing File Referenced | Decision | Rationale |
|-----------|--------------|-------------------------|----------|-----------|
| `tests/bug-2004-pr-branch-milestone.test.cjs` | `setup: pr-branch workflow is readable` | `brief/workflows/pr-branch.md` | DELETE assertion | pr-branch.md is GSD milestone PR flow; not in LOCKED_12 |
| `tests/bug-2004-pr-branch-milestone.test.cjs` | `workflow distinguishes structural vs transient planning commits` | `brief/workflows/pr-branch.md` | DELETE assertion | Same — pr-branch.md is GSD-only |
| `tests/bug-2004-pr-branch-milestone.test.cjs` | `workflow lists STATE.md and ROADMAP.md as structural files to preserve` | `brief/workflows/pr-branch.md` | DELETE assertion | Same — pr-branch.md is GSD-only |
| `tests/bug-2004-pr-branch-milestone.test.cjs` | `workflow lists MILESTONES.md or milestones/ as structural files to preserve` | `brief/workflows/pr-branch.md` | DELETE assertion | Same — pr-branch.md is GSD-only |
| `tests/bug-2004-pr-branch-milestone.test.cjs` | `workflow has four commit categories (code, planning-only, mixed, structural)` | `brief/workflows/pr-branch.md` | DELETE assertion | Same — pr-branch.md is GSD-only |
| `tests/bug-2004-pr-branch-milestone.test.cjs` | `create_pr_branch step does not rm -r --cached all of .planning/` | `brief/workflows/pr-branch.md` | DELETE assertion | Same — pr-branch.md is GSD-only |
| `tests/bug-2075-worktree-deletion-safeguards.test.cjs` | `diagnose-issues.md has worktree_branch_check instruction for spawned agents` | `brief/workflows/diagnose-issues.md` | DELETE assertion | diagnose-issues.md ties to `gsd-debugger`; not in LOCKED_12 |
| `tests/next-up-clear-order.test.cjs` | `Next Up block template does not use <sub>/clear pattern` | `brief/references/ui-brand.md` | DELETE assertion | ui-brand.md ties to `gsd-ui-*` agents; not in LOCKED_12 |
| `tests/next-up-clear-order.test.cjs` | `Next Up block template shows /clear then: before {copy-paste command}` | `brief/references/ui-brand.md` | DELETE assertion | Same — ui-brand.md is GSD-only |
| `tests/execute-phase-wave.test.cjs` | `diagnose-issues workflow reads USE_WORKTREES from config` | `brief/workflows/diagnose-issues.md` | DELETE assertion | Same — diagnose-issues.md ties to `gsd-debugger` |

## Edit Mechanics

- **`tests/bug-2004-pr-branch-milestone.test.cjs`** — entire `describe(...)` block replaced with `describe.skip(...)`; all 6 tests collapse to a single skip placeholder. Rationale comment embedded at top of file.
- **`tests/bug-2075-worktree-deletion-safeguards.test.cjs`** — single `test(...)` at line 134 replaced with `test.skip(...)`. The other 7 tests in the file are unchanged (they reference `brief/workflows/execute-phase.md`, `brief/workflows/quick.md`, `agents/brief-executor.md` — files that exist post-Phase-1).
- **`tests/next-up-clear-order.test.cjs`** — `describe('ui-brand.md...')` block (lines 39-50) replaced with `describe.skip(...)`. The other 3 describe blocks (continuation-format / workflow files / reference files) are unchanged.
- **`tests/execute-phase-wave.test.cjs`** — single `test('diagnose-issues workflow reads USE_WORKTREES from config')` replaced with `test.skip(...)`. The other tests in the file are unchanged.
- **`tests/claude-skills-migration.test.cjs`** — UNTOUCHED. Initial grep matched lines 307/319 but inspection shows those references are inline test fixture strings (in-memory `tmpDir` content, not real filesystem reads). The test does NOT depend on a real `ui-brand.md` file existing; it is verifying path-rewrite logic on synthetic content. No edit needed.

## Aggregate

- **10 test assertions** triaged (less than the ~19 RESEARCH.md A7 upper bound; off-by-one is expected per A7's "approximately" caveat)
- **10 DELETE-assertion decisions** (rubric uniformly applied)
- **0 CREATE-file decisions**
- **4 test files modified** (`bug-2004-pr-branch-milestone`, `bug-2075-worktree-deletion-safeguards`, `next-up-clear-order`, `execute-phase-wave`)
- **1 test file inspected and unchanged** (`claude-skills-migration` — in-memory fixture)

Per Pitfall 2 (PATTERNS.md): ALL CREATE-file decisions would re-introduce dual-vocabulary clutter that Phase 1 FND-02 was designed to eliminate. The DELETE-assertion approach is correct because the workflows referenced (`pr-branch` / `diagnose-issues` / `ui-brand`) are intentionally absent in v1 and are not in the locked 12-cmd lineup per A-D01.

## Discrepancy Note (A7)

RESEARCH.md A7 estimated ~19 missing-file tests. Actual grep enumeration found 10 distinct test assertions across 4 files (5 files matched the grep, but `claude-skills-migration.test.cjs` is in-memory-only and required no edit). The discrepancy is consistent with A7's "approximately" framing. The actual measured count is recorded above and reflects the real triage workload, not an estimate. Per Phase 1 closure pattern (single audit doc), this rationale file is the authoritative record.
