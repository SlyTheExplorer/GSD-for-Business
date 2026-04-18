---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 02
subsystem: infra
tags: [fork-hygiene, removal, git-rm, audit-trail, orphan-references, plan-05-input]

# Dependency graph
requires:
  - phase: "01-foundation-fork-hygiene-removal-rename Plan 01"
    provides: "backup/original-gsd branch (rollback safety net for D-08 commit 2)"
provides:
  - "56 GSD development-specific files removed via git rm (12 D-01 agents + 8 D-01 commands + 8 D-01 workflows + 3 D-01 templates + 4 D-01 references + 1 D-02 agent + 6 D-02 commands + 4 D-02 workflows + 10 D-03 recursive tests)"
  - "tests/removed-surfaces.smoke.txt audit trail with 149 DELETE-LINE + 3 DELETE-FILE + 9 RESIDUAL orphan-reference records (EXPANDED-SCOPE per BLOCKER 1 fix)"
  - "BLOCKER 2 special-case note for tests/agent-frontmatter.test.cjs:21 bare-prefix string literal fix (Plan 05 input)"
  - "graphify.cjs + tests/graphify.test.cjs D-03 exception preserved (workflow primitive survives)"
  - "Surviving agent count = 18 (31 original - 12 D-01 - 1 D-02)"
affects: [01-03, 01-04, 01-05, 01-06, "Plan 05 surgical-edit list", "Plan 06 FND-07 residue grep"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "EXPANDED-SCOPE orphan-reference audit: grep over 10 scope sections (agents+commands, get-shit-done markdown, get-shit-done/bin cjs, bin+scripts+hooks, sdk, tests, docs English, 4 localized mirrors, top-level docs, known orphan files)"
    - "Disposition tagging pattern: DELETE-LINE (149) / DELETE-FILE (3) / RESIDUAL (9) — lets Plan 05 route each record to the correct operation"
    - "Pipeline-subshell-safe filter pattern: cache removal list in /tmp then use grep -Fxq for fast allowlist lookup (avoids export -f pitfall in while-read pipelines)"
    - "D-03 exception pattern: explicitly preserve workflow primitives (graphify.cjs) required by surviving agents/tools even when the user-facing surface is removed"
    - "Buildability gate per commit (D-09): node -e require() of each get-shit-done/bin/lib/*.cjs before the commit lands"

key-files:
  created:
    - "tests/removed-surfaces.smoke.txt"
    - ".planning/phases/01-foundation-fork-hygiene-removal-rename/01-02-SUMMARY.md"
  modified: []
  deleted: 56 # see full list in tests/removed-surfaces.smoke.txt (EXISTS: lines)

key-decisions:
  - "Removal count = 56 (not 37-44 as planner estimated) — the actual repo had more D-01/D-02 surfaces present than the planning-time estimate. Plan's verify block emits WARN (not FAIL) when count > 50, so this is acceptable divergence. Documented as a deviation (Rule 0 — factual count observation)."
  - "graphify.cjs + tests/graphify.test.cjs preserved per D-03 exception (workflow primitive imported by get-shit-done/bin/gsd-tools.cjs:1091 + gsd-planner.md:871 + gsd-phase-researcher.md:562). Only the USER-FACING command commands/gsd/graphify.md was removed."
  - "[agents + commands/gsd] orphan section is empty (0 DELETE-LINE records) — VERIFIED CORRECT: direct grep of surviving agents/ and commands/gsd/ confirms no residual references to removed agents. All removed-agent references in those directories were inside the removed files themselves, so they were deleted in Task 2 git rm."
  - "CHANGELOG.md has 9 RESIDUAL records (historical changelog entries pre-fork). Plan 06 adds a banner note rather than editing history. This keeps the history auditable and consistent with Git's commit-history-is-truth principle."

patterns-established:
  - "Inventory-then-delete pattern: Task 1 writes the authoritative EXISTS: list BEFORE any git rm; Task 2 reads from that file. Prevents silent loss of files not yet on the list."
  - "Cached-removal-list lookup: build /tmp/removal-list.txt once, use grep -Fxq for fast allowlist filtering inside orphan-audit while-read loops."
  - "Disposition-tagged audit format: [DELETE-LINE] / [DELETE-FILE] / [RESIDUAL] lets downstream (Plan 05) parse and route records to the correct action without re-interpreting context."

requirements-completed: [FND-02]

# Metrics
duration: 7min
completed: 2026-04-18
---

# Phase 01 Plan 02: Bulk GSD Dev-Surface Removal + Orphan-Reference Audit Summary

**56 GSD development-specific files removed via git rm, audit trail written to tests/removed-surfaces.smoke.txt with 161 disposition-tagged records (149 DELETE-LINE + 3 DELETE-FILE + 9 RESIDUAL) spanning 10 scope sections across the EXPANDED-SCOPE audit (BLOCKER 1 fix). graphify.cjs + its test preserved per D-03 exception.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-04-18T01:13:23Z
- **Completed:** 2026-04-18 (same session)
- **Tasks:** 2 (inventory+audit, delete+commit)
- **Files modified:** 1 created (`tests/removed-surfaces.smoke.txt`), 56 deleted, 1 SUMMARY created

## Accomplishments

- Task 1: Built `tests/removed-surfaces.smoke.txt` listing 56 files to delete (EXISTS markers) and 0 missing files. Wrote EXPANDED-SCOPE orphan-reference audit covering all 10 required scope sections. Embedded graphify SURVIVOR RATIONALE + BLOCKER 2 SPECIAL-CASE note for tests/agent-frontmatter.test.cjs:21 bare-prefix string-literal fix.
- Task 2: Removed 56 files via `git rm`. All D-01 and D-02 surfaces are gone. Buildability gate passed (core.cjs, state.cjs, init.cjs, graphify.cjs all require() cleanly). Surviving agent count = 18 exactly as expected. `get-shit-done/bin/lib/graphify.cjs` and `tests/graphify.test.cjs` preserved per D-03 exception.
- 15 known-location orphan spot-checks all captured in audit file (0 MISSING).
- 3 DELETE-FILE records present for known whole-file orphans (`debug-subagent-prompt.md`, `diagnose-issues.md`, `audit-milestone.md`).
- Two atomic commits landed on worktree branch per D-08 staged-commit discipline and D-10 Conventional Commits format.

## Removal Breakdown

| Category | Count | Examples |
|----------|-------|----------|
| D-01 agents | 12 | gsd-code-reviewer, gsd-ui-checker, gsd-ai-researcher, gsd-security-auditor, gsd-eval-planner, etc. |
| D-01 commands | 8 | code-review, ui-phase, ai-integration-phase, secure-phase, add-tests, etc. |
| D-01 workflows | 8 | add-tests, ai-integration-phase, code-review, eval-review, secure-phase, ui-phase, etc. |
| D-01 templates | 3 | AI-SPEC.md, UI-SPEC.md, SECURITY.md |
| D-01 references | 4 | tdd.md, ai-evals.md, ai-frameworks.md, ui-brand.md |
| D-02 agent | 1 | gsd-debug-session-manager |
| D-02 commands | 6 | debug, forensics, graphify, inbox, pr-branch, ship |
| D-02 workflows | 4 | forensics, inbox, pr-branch, ship |
| D-03 recursive tests | 10 | code-review.test.cjs, ai-evals.test.cjs, forensics.test.cjs, playwright-ui-verify.test.cjs, etc. |
| **Total deleted** | **56** | |

Per-file list is preserved in `tests/removed-surfaces.smoke.txt` under `EXISTS:` lines.

## graphify Survivor Note (D-03 Exception)

Per the plan's explicit D-03 exception, `get-shit-done/bin/lib/graphify.cjs` and `tests/graphify.test.cjs` were NOT removed even though `commands/gsd/graphify.md` IS removed. Rationale:

- `get-shit-done/bin/gsd-tools.cjs` line 1091 imports it: `const graphify = require('./lib/graphify.cjs');`
- The `graphify` switch case in `gsd-tools.cjs` (lines 1090-1113) powers the `gsd-tools graphify <query|status|diff|build>` subcommand used during the planner workflow.
- `agents/gsd-planner.md` line 871 invokes `gsd-tools graphify query ...` for dependency-graph queries.
- `agents/gsd-phase-researcher.md` line 562 also invokes it.

Therefore:
- `graphify.cjs` STAYS (workflow primitive)
- `tests/graphify.test.cjs` STAYS (covers surviving code)
- Only the USER-FACING command `commands/gsd/graphify.md` was removed.

Verified post-removal: `node -e "require('./get-shit-done/bin/lib/graphify.cjs')"` exits 0.

## EXPANDED-SCOPE Orphan-Reference Summary (BLOCKER 1 fix)

The audit file `tests/removed-surfaces.smoke.txt` contains a `# ORPHAN REFERENCES TO REPAIR IN PLAN 05 (SURGICAL EDITS)` section with disposition-tagged records. Per-section breakdown:

| Scope Section | DELETE-LINE | DELETE-FILE | RESIDUAL | Notes |
|---------------|-------------|-------------|----------|-------|
| `[get-shit-done markdown]` | 27 | — | — | workflows/references/templates that survive |
| `[agents + commands/gsd]` | 0 | — | — | Confirmed empty: all removed-agent refs were inside the removed files themselves |
| `[get-shit-done/bin cjs]` | 5 | — | — | model-profiles.cjs object-literal keys + gsd-tools.cjs referenced lines |
| `[bin + scripts + hooks]` | 2 | — | — | bin/install.js lines 33, 35 (permission map entries) |
| `[sdk]` | 5 | — | — | sdk/src/query/config-query.ts model-profile entries |
| `[tests]` | 39 | — | — | Surviving tests that hardcode removed-agent names in assertions (e.g., agent-skills-awareness.test.cjs, copilot-install.test.cjs, model-profiles.test.cjs) |
| `[docs English]` | 27 | — | — | docs/ARCHITECTURE.md, AGENTS.md, COMMANDS.md, CONFIGURATION.md, etc. |
| `[docs localized]` | 44 | — | — | docs/ja-JP + docs/ko-KR + docs/zh-CN + docs/pt-BR mirrors |
| `[top-level docs]` | 0 | — | 9 | CHANGELOG.md historical entries — RESIDUAL (Plan 06 adds banner, does not edit history) |
| `[known orphan files]` | — | 3 | — | debug-subagent-prompt.md, diagnose-issues.md, audit-milestone.md (whole-file DELETE-FILE disposition for Plan 05) |
| **Totals** | **149** | **3** | **9** | |

15 known-location spot-checks all passed (execute-phase.md:43, model-profiles.md:15, agent-contracts.md:19, model-profiles.cjs:16, bin/install.js:33/35, quick.md:26, agent-frontmatter.test.cjs, model-profiles.test.cjs:25, copilot-install.test.cjs:1183, sdk/src/query/config-query.ts:39, docs/ARCHITECTURE.md:275, docs/COMMANDS.md:1047, docs/CONFIGURATION.md:227, docs/ko-KR/ARCHITECTURE.md:226).

## Handoff Notes for Plan 05 (CRITICAL — SURGICAL EDIT INPUT)

**Plan 05 MUST parse every disposition-tagged record in the ORPHAN REFERENCES section of `tests/removed-surfaces.smoke.txt` and apply the corresponding action before any blanket substitution runs:**

1. `[DELETE-LINE]` records — surgical single-line deletion via Edit tool, operating on the `file:line:snippet` coordinates encoded in each record. 149 total across 7 non-empty scope sections.
2. `[DELETE-FILE]` records — whole-file removal via `git rm`. 3 total: `get-shit-done/templates/debug-subagent-prompt.md`, `get-shit-done/workflows/diagnose-issues.md`, `get-shit-done/workflows/audit-milestone.md`.
3. `[RESIDUAL]` records — Plan 05 LEAVES ALONE. Plan 06 (commit 6 of 6) adds a pre-fork banner to CHANGELOG.md documenting that pre-fork entries preserve original GSD agent names intentionally.

## Handoff Notes for Plan 05 (BLOCKER 2 — BARE-PREFIX STRING-LITERAL FIX)

**`tests/agent-frontmatter.test.cjs` requires SPECIAL-CASE treatment** (recorded in the `# tests/agent-frontmatter.test.cjs SPECIAL-CASE (BLOCKER 2)` footer of `tests/removed-surfaces.smoke.txt`):

- Line 21: `.filter(f => f.startsWith('gsd-') && f.endsWith('.md'))` — this is a **bare prefix string literal**, not an agent identifier. After Plan 03 renames all agents to `brief-*.md`, this filter returns an empty array and every downstream test asserts on zero iterations (vacuous PASS — invisibly broken test).
- Plan 05 MUST replace `'gsd-'` with `'brief-'` on line 21.
- AND Plan 05 MUST update the path constants at lines 17 (`WORKFLOWS_DIR = 'get-shit-done/workflows'`) and 18 (`COMMANDS_DIR = 'commands/gsd'`) to the renamed paths (`brief/workflows`, `commands/brief` per D-05).
- This edit is recorded separately from the removed-agent orphan list because it is a string-literal pattern, not an identifier that appears in the `REMOVED_AGENTS` grep scope.

## Task Commits

Each task was committed atomically on the worktree branch (`worktree-agent-ac444b1d`):

1. **Task 1: Pre-removal inventory + EXPANDED-SCOPE orphan-reference audit** — `6695b4a` (chore)
   - Creates `tests/removed-surfaces.smoke.txt` (285 lines, 1 file added, 0 deleted)
   - Commit message subject: `chore(01-02): build pre-removal audit trail + orphan-reference list (FND-02)`

2. **Task 2: Delete enumerated files via git rm and buildability check** — `b2c758e` (chore)
   - 56 files deleted, 13,010 lines removed
   - Commit message subject: `chore(01-remove): drop GSD development surfaces (56 files) (FND-02)`

_Two atomic commits rather than one combined commit per execution_notes's "Expected commit count is 2 (one per task) + 1 SUMMARY commit = 3 total commits on the worktree branch" guidance. The combined effect — audit trail + 56 deletions — is what D-08 commit 2 of 6 specifies, split for better per-task attribution and easier rollback granularity._

## Files Created/Modified

- `tests/removed-surfaces.smoke.txt` — NEW (285 lines) — inventory + 10-section orphan audit + graphify rationale + BLOCKER 2 note
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-02-SUMMARY.md` — NEW (this file)
- 56 files deleted (per inventory; full list in audit file under `EXISTS:` lines)

## Decisions Made

- **Removal count = 56, not the planner's 37-44 estimate.** Actual repo has more D-01/D-02 surface than the planning-time estimate. All 56 files listed in the plan's `files_modified` frontmatter DO exist in the repo. The plan's Task 1 verify block emits a WARN (not FAIL) when count exceeds 50, so this divergence is within the plan's acceptance band.
- **Two atomic commits instead of one combined commit.** The plan's Task 2 action 6 specified a single commit for the deletions, and Task 1 action 5 implied committing the audit file within that same commit (by staging `tests/removed-surfaces.smoke.txt` alongside the deletions). However, the execution_notes line "Expected commit count is 2 (one per task) + 1 SUMMARY commit = 3 total commits" resolved the ambiguity in favor of per-task commits. This provides better git-history granularity without changing the final repo state.
- **`[agents + commands/gsd]` section empty is CORRECT.** Investigation confirmed via direct grep of surviving agents/ and commands/gsd/ that no surviving file references a removed agent. All references to removed agents in those directories were inside the removed files themselves, so they disappear with Task 2.
- **CHANGELOG.md historical entries as RESIDUAL.** Nine RESIDUAL records capture 9 CHANGELOG entries where `gsd-debugger`, `gsd-debug-session-manager`, `gsd-integration-checker`, `gsd-code-fixer`, etc. appear as historical facts. Plan 06 (commit 6 of 6) adds a banner note rather than rewriting history.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pipeline-subshell variable-visibility issue in orphan-audit grep**
- **Found during:** Task 1 initial execution of section 3a
- **Issue:** The plan's example bash block defined an `is_being_removed()` shell function and used `export -f` to share it with subshells, then called it inside a `while IFS= read -r match; do ... done < <(grep ...)` pipeline. Under zsh (the shell backing the Bash tool here), `export -f` does not reliably propagate function definitions into the pipeline subshell; the function was treated as unset and every match passed through the filter as "not being removed" — but simultaneously, the pipeline subshell's append `echo >> file` was being silently swallowed in my first attempt, producing 0 DELETE-LINE records.
- **Fix:** Replaced the function-based filter with a cached allowlist lookup: built `/tmp/removal-list.txt` once from the `EXISTS:` inventory, then used `grep -Fxq "$filepath" /tmp/removal-list.txt` inside each `while-read` loop. The lookup is pipeline-subshell-safe (grep is external, no function propagation required) and faster (O(n) disk scan over a 56-line file per match).
- **Files modified:** Only `tests/removed-surfaces.smoke.txt` (which was being assembled). No other files touched.
- **Verification:** Re-ran the full orphan audit with the cached-list approach; 15-location spot-check now passes 100% (was 0/15 in the broken initial attempt).
- **Committed in:** Part of Task 1's single final commit `6695b4a`.

**2. [Rule 0 - Factual observation] Removal count = 56, not 37-44**
- **Found during:** Task 1 initial enumeration
- **Issue:** The plan's D-04 decision specified "approximately 38-45 files" and the plan's verify block used a 34-50 band. Actual count after enumerating every file in `D01_AGENTS + D01_COMMANDS + D01_WORKFLOWS + D01_TEMPLATES + D01_REFERENCES + D02_AGENTS + D02_COMMANDS + D02_WORKFLOWS + D03_TESTS` = 56.
- **Assessment:** Not a true deviation — the plan's candidate list is the authoritative removal set per `files_modified` frontmatter, and every file on that list does in fact exist. The 37-44 figure was a planning-time estimate that undercounted. The plan's verify block uses `echo WARN` rather than `exit 1` for counts outside 34-50, which matches this scenario.
- **Fix:** None required. Documented in the commit message ("Total removal count (56) exceeds plan's conservative 34-50 estimate...") and in the SUMMARY's "Decisions Made" section.
- **Committed in:** Part of Task 2 commit `b2c758e`.

---

**Total deviations:** 2 auto-fixed (1 Rule-3 execution issue, 1 Rule-0 factual-count observation)
**Impact on plan:** The plan's intended artifacts (audit file + 56 removals + buildability) are exactly what was produced. Deviation #1 was an execution-environment shell-scope issue that did not change scope. Deviation #2 is just the true-count observation, which falls within the plan's WARN band.

## Threat Flags

None — this plan only removes inherited GSD dev-specific code paths and adds no new network endpoints, auth paths, file access patterns, or schema changes. The `tests/removed-surfaces.smoke.txt` audit file is local-only and contains no secrets (only file paths and code snippets from the removed files).

## Issues Encountered

- **Shell function export in pipeline subshells (recovered).** See Deviation #1 above. For future phases: prefer cached-list lookups over `export -f` function definitions when filtering inside `while-read` pipelines.
- **Counting estimate vs. actual divergence.** Planning-time D-04 estimate of "approximately 38-45 files" was about 25% lower than actual. Not a problem for this plan (WARN only), but worth noting for future removal planning: enumerate the full `files_modified` frontmatter before setting the range.

## User Setup Required

None — all operations are local git + file system. No external service configuration. No secrets. No user intervention needed.

## Next Phase Readiness

- **Plan 03 (wave 3) unblocked.** User-facing `/gsd-*` → `/brief-*` rename (commands + agents + hooks + tests) can now proceed against a surface-trimmed repo.
- **Plan 05 input ready.** `tests/removed-surfaces.smoke.txt` contains the full disposition-tagged orphan-reference list Plan 05 needs to parse for surgical edits. BLOCKER 2 special-case note is embedded for Plan 05's use.
- **Plan 06 backlog updated.** CHANGELOG.md banner-add task noted via the 9 RESIDUAL records. Plan 06 (FND-07 residue grep) now has a clean scope — all intentional residues are pre-documented.
- **Buildability intact.** All `get-shit-done/bin/lib/*.cjs` require() cleanly, including the surviving `graphify.cjs`. The lib layer is undamaged.
- **Shared orchestrator artifacts untouched.** Per `<parallel_execution>` guidance, this worktree did NOT modify `.planning/STATE.md` or `.planning/ROADMAP.md`. The orchestrator will update those after all wave-2 worktree agents complete.

## Self-Check: PASSED

- `tests/removed-surfaces.smoke.txt` exists and is non-empty (285 lines): FOUND
- `tests/removed-surfaces.smoke.txt` contains `# ORPHAN REFERENCES TO REPAIR IN PLAN 05`: FOUND
- `tests/removed-surfaces.smoke.txt` contains `graphify SURVIVOR RATIONALE`: FOUND
- `tests/removed-surfaces.smoke.txt` contains `tests/agent-frontmatter.test.cjs SPECIAL-CASE` (BLOCKER 2): FOUND
- 15 known-location spot-checks all captured: FOUND (0/15 missing)
- 3 DELETE-FILE records for known orphans: FOUND
- `get-shit-done/bin/lib/graphify.cjs` exists post-deletion: FOUND
- `tests/graphify.test.cjs` exists post-deletion: FOUND
- Commit `6695b4a` exists on worktree branch (Task 1): FOUND (`git log --oneline -3` shows it)
- Commit `b2c758e` exists on worktree branch (Task 2): FOUND (`git log --oneline -3` shows it as HEAD)
- 12 D-01 agents absent from `agents/`: FOUND (0 matches)
- 8 D-01 commands + 6 D-02 commands absent from `commands/gsd/`: FOUND (0 matches)
- Surviving agent count = 18 (31 original - 12 D-01 - 1 D-02): CONFIRMED
- `node -e "require('./get-shit-done/bin/lib/{core,state,init,graphify}.cjs')"` exits 0: CONFIRMED
- `.planning/STATE.md` untouched (worktree mode): CONFIRMED (no changes to that file from this agent)
- `.planning/ROADMAP.md` untouched (worktree mode): CONFIRMED (no changes to that file from this agent)

---
*Phase: 01-foundation-fork-hygiene-removal-rename*
*Completed: 2026-04-18*
