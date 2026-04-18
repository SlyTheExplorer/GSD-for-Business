---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 09
subsystem: fork-hygiene
tags: [fork-rename, fnd-03, gap-closure, halt, test-side-rewrite, enumeration-defect, scope-deviation]
status: HALT (PARTIAL — in-scope work complete, out-of-scope residual documented)
completed: 2026-04-18
gate_result: HALT
plan_09_post_count: 216
empirical_baseline: 6
delta_cap: 16
delta_over_cap: 200
iterations_to_halt: 3 (stable at 216 across LOOP 1/2/3)
commit_shas:
  - "492751c — Task 2 T-A hook-cluster (11 files, ~184 residues)"
  - "1456e0d — Task 3 T-A manifest/install cluster (9 files)"
  - "8c14f74 — Task 4 T-A low-density + T-C→T-A bug-1908 (7 files)"
  - "c3602ac — Task 5 T-D copilot-install per-line split"
  - "ab9a776 — Task 6 T-B verification + surgical T-A on claude-skills line 428"
  - "TBD (Task 8 final)"
requires:
  - 08-GAP-CLOSURE-PARTIAL-AUDIT.md §7 Option A (Plan 09's design basis)
  - 01-VERIFICATION.md Gap #2 (W4 delta-cap — the gap being closed)
  - Plan 08 SHAs 19fcaa2 + 8f3eb9e (source-side prerequisite — verified preserved)
provides:
  - "Test-side rewrite of Plan 09's enumerated 31-file scope: 27 T-A files + 3 T-B preserved + 1 T-D per-line split. PRE 295 residues → POST 42 (all 42 are legitimate T-B preservation)."
  - "Per-file PRE/POST audit trail for all 31 enumerated files (09-GAP-CLOSURE-PARTIAL-AUDIT.md §3)."
  - "135 previously-failing tests recovered (PRE npm-test fail = 351 [Plan 08 HALT] → POST = 216)."
  - "Scope-deviation discovery documented: Plan 09's planner-side enumeration via substring grep missed tuple-form `path.join('commands', 'gsd')` + `name: gsd:<cmd>` frontmatter patterns across ~40 additional tests/ files (116 out-of-scope residues)."
affects:
  - "tests/ (29 test files touched; 27 T-A bulk rewrite, 1 T-D per-line split, 1 T-B surgical T-A on line 428)"
  - ".planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt (PLAN 09 POST-FIX MEASUREMENTS section appended)"
  - ".planning/phases/01-foundation-fork-hygiene-removal-rename/09-GAP-CLOSURE-PARTIAL-AUDIT.md (HALT branch audit artifact produced)"
tech-stack:
  added: []
  patterns:
    - "T-A/T-B/T-C/T-D test-side decision framework (analog of Plan 08's P-A/P-B/P-C/P-D source-side)"
    - "Bulk-sed cluster commits by density (hook-cluster, manifest/install, low-density) — atomic per cluster for surgical rollback"
    - "Per-line T-D split for mixed-intent test files — distinguishes fresh-install assertions from legacy-cleanup absence verification"
    - "3-loop HALT protocol on enumeration defect — documents stable POST + categorizes out-of-scope vs in-scope per plan spec"
key-files:
  created:
    - ".planning/phases/01-foundation-fork-hygiene-removal-rename/09-GAP-CLOSURE-PARTIAL-AUDIT.md"
    - ".planning/phases/01-foundation-fork-hygiene-removal-rename/01-09-SUMMARY.md (this file)"
  modified:
    - "tests/antigravity-install.test.cjs"
    - "tests/brief-statusline.test.cjs"
    - "tests/bug-1754-js-hook-guard.test.cjs"
    - "tests/bug-1817-sh-hook-guard.test.cjs"
    - "tests/bug-1834-sh-hooks-installed.test.cjs"
    - "tests/bug-1906-hook-relative-paths.test.cjs"
    - "tests/bug-1908-uninstall-manifest.test.cjs"
    - "tests/bug-1974-context-exhaustion-record.test.cjs"
    - "tests/bug-2136-sh-hook-version.test.cjs"
    - "tests/bug-2344-read-guard-claudecode-env.test.cjs"
    - "tests/bugs-1656-1657.test.cjs"
    - "tests/check-update-config-dir.test.cjs"
    - "tests/claude-skills-migration.test.cjs (surgical T-A on line 428 + T-B preservation elsewhere)"
    - "tests/codex-config.test.cjs"
    - "tests/copilot-install.test.cjs (T-D per-line split)"
    - "tests/core.test.cjs"
    - "tests/hooks-opt-in.test.cjs"
    - "tests/install-hooks-copy.test.cjs"
    - "tests/managed-hooks.test.cjs"
    - "tests/orphaned-hooks.test.cjs"
    - "tests/package-manifest.test.cjs"
    - "tests/read-guard.test.cjs"
    - "tests/read-injection-scanner.test.cjs"
    - "tests/reapply-patches.test.cjs"
    - "tests/security.test.cjs"
    - "tests/semver-compare.test.cjs"
    - "tests/sh-hook-paths.test.cjs"
    - "tests/update-custom-backup.test.cjs"
    - "tests/workflow-guard-registration.test.cjs"
    - ".planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt"
  preserved:
    - "tests/bug-1924-preserve-user-artifacts.test.cjs (T-B — 10 `commands/gsd/` refs preserved per explicit JSDoc intent)"
    - "tests/removed-surfaces.smoke.txt (T-B — 20 refs; Plan 02 audit trail, historical)"
decisions:
  - "Plan 09's enumerated 31-file scope fully executed: 27 T-A + 3 T-B + 1 T-D. Zero source-side edits. Zero syntax regressions (all `node -c` clean)."
  - "GATE=HALT at POST=216 vs cap=16 across 3 stable loops. 3-loop protocol confirms the 216 is deterministic (no test-ordering / nondeterminism)."
  - "Root cause of HALT: planner-enumeration defect. Substring grep for `commands/gsd` matched literal-path form but missed tuple-form `path.join(..., 'commands', 'gsd', ...)`. ~40 additional test files carry 116 residues in this out-of-scope form."
  - "Scope-deviation rule applied: per Plan 09 `<objective>` 'If a test cannot be satisfied without a NEW source-side edit, that is a signal to HALT, not to expand scope' — test-side analog: if gap closure requires MORE files than plan enumerated, HALT + escalate rather than silently expand scope."
  - "Recommended next step: Option 1 — spawn Plan 10 to cover tuple-form + name-prefix patterns across the ~40 additional tests/ files. Expected recovery: ~135 additional tests → final POST ≈ 80 or less. Budget: 2–4 hours."
metrics:
  duration: "~1.5 hours"
  task_count: 8
  commits_created: 5 (Tasks 2, 3, 4, 5, 6) + 1 final (Task 8)
  files_modified: 29 test files + 1 baseline + 1 audit artifact
  files_created: 2 (PARTIAL-AUDIT + this SUMMARY)
  tasks_passed: 7 (Task 1 measurement; Tasks 2/3/4/5/6 bulk-sed + commit; Task 8 audit)
  tasks_halted: 1 (Task 7 — delta-cap gate)
  tests_recovered: 135 (vs Plan 08 HALT state POST=351; Plan 09 POST=216)
  residues_cleared: 253 (PRE 295 → POST 42 within Plan 09's enumerated 31-file scope)
  scope_deviation: true
  scope_deviation_magnitude: "40 additional out-of-scope files, 116 out-of-scope residues not in Plan 09's enumeration"
---

# Phase 1 Plan 09: Foundation — Fork Hygiene (Test-Side Gap Closure) Summary

**PARTIAL HALT at Task 7 delta-cap gate. All 31 enumerated files rewritten and committed atomically. Out-of-scope residual documented for Plan 10.**

## 한줄 요약

Plan 09은 열거된 31개 테스트 파일에 대한 테스트 측 재작성을 완료했지만 (T-A 27 + T-B 3 + T-D 1, 295 잔차 중 253 제거, 135개 테스트 복구), Plan 09의 계획자 substring grep 열거가 튜플 형식 `path.join('commands', 'gsd')` + `name: gsd:<cmd>` 프론트매터 패턴 ~40개의 추가 파일을 놓쳐서 216개 npm-test 실패가 남아있습니다. 범위 경계 준수 (테스트 측만, 소스 측 변경 0).

## One-liner

Plan 09 delivered its enumerated 31-file test-side scope cleanly (27 T-A bulk-sed + 3 T-B preserve + 1 T-D per-line split; 135 tests recovered), but HALTed the W4 delta-cap gate at POST=216 due to a planner-enumeration defect: substring grep missed ~40 additional tests/ files using tuple-form `path.join('commands', 'gsd')` + `name: gsd:<cmd>` frontmatter. Scope-boundary honored (tests/ only; zero source hunks). Recommends Plan 10 for the out-of-scope pattern coverage.

## What Changed

### T-A cluster — fresh-install behavior (27 files, 253 residues rewritten)

Canonical 16-pattern bulk sed applied per file across 3 cluster commits:

- **Task 2 commit `492751c` (11 high-density files):** hooks-opt-in (51), install-hooks-copy (35), core (19), bug-2136 (16), bug-1834 (13), bug-1906 (9), bugs-1656-1657 (9), managed-hooks (7), orphaned-hooks (7), bug-1754 (5), bug-1817 (3). PRE total 174, POST 0.
- **Task 3 commit `1456e0d` (9 manifest/install files):** reapply-patches (9), workflow-guard-registration (12 — including `gsdHooks` → `briefHooks` matching Plan 08 bin/install.js line 4762 variable rename), read-guard (8), read-injection-scanner (5), security (5), sh-hook-paths (5), codex-config (4), package-manifest (4), antigravity-install (3). PRE total 55, POST 0.
- **Task 4 commit `8c14f74` (6 low-density + 1 T-C→T-A):** brief-statusline (3), bug-2344 (3), check-update-config-dir (2), bug-1974 (2), update-custom-backup (2), semver-compare (1), bug-1908 (4 — T-C-classified-as-T-A: MOCK install must match Plan 08's `MANIFEST_NAME = 'brief-file-manifest.json'`). PRE total 17, POST 0.

Every edited file parses under `node -c`. No syntax regressions. Test recovery: ~135 tests across the 27 T-A files now pass (previously failed with ENOENT on `hooks/gsd-*.js` / `gsd-file-manifest.json` / `.cache/gsd/` / `commands/gsd/` paths that Plan 03/04/08 renamed to `brief-*`).

### T-D per-line split — copilot-install.test.cjs (Task 5, commit `c3602ac`)

- 7 T-A-subset lines rewritten: 1042 (`gsd-file-manifest.json`), 1069 + 1086 (`gsd-local-patches`), 1215 + 1216 + 1227 + 1244 (`.github/gsd-file-manifest.json`). Fresh Copilot install produces `brief-*` per Plan 08 source-side PATCHES_DIR_NAME/MANIFEST_NAME rewrites.
- 1 T-B-subset line preserved: line 1441 `'commands/gsd/ should not exist after clean uninstall'` — verifies LEGACY directory absence post-uninstall. Rewriting to `commands/brief/` would verify a different (fresh-install-non-existence) assertion. Inline preservation comment added at line 1438.
- POST: gsd-file-manifest=0, gsd-local-patches=0, brief-file-manifest=5, brief-local-patches=2, commands/gsd=2 (the 1441 assertion + the preservation comment).

### T-B verification — 3 legacy-cleanup files preserved (Task 6, commit `ab9a776`)

- **tests/bug-1924-preserve-user-artifacts.test.cjs (10 `commands/gsd/` refs preserved):** Explicit JSDoc lines 4–8 already documents T-B intent. These refs describe the LEGACY pre-BRIEF install location that `install()` cleans while preserving user `dev-preferences.md`. Rewriting to `commands/brief/` would defeat the test's purpose.
- **tests/claude-skills-migration.test.cjs (10 T-B refs preserved + 1 surgical T-A on line 428):** JSDoc lines 7–11 documents T-B intent. The `describe('Legacy commands/gsd/ cleanup', ...)` block (lines 358–398) + manifest-absence assertion (lines 441–445 `k.startsWith('commands/gsd/')` verifying fresh install produces no legacy keys) preserved. Line 428 surgically rewrote `gsd-file-manifest.json` → `brief-file-manifest.json` for the fresh Claude install scenario (Plan 08 renamed source-side MANIFEST_NAME).
- **tests/removed-surfaces.smoke.txt (20 refs preserved):** Plan 02 audit trail file ("# Phase 1 Plan 02: Removal Audit Trail"). Historical documentation, not a test assertion. Audit trail files preserved per Plan 05/07/08 scope-boundary precedent.

Post-Plan-09 T-B preservation counts (strict lower bounds satisfied):
- bug-1924: 10 (threshold ≥6) ✓
- claude-skills-migration: 10 (threshold ≥4) ✓
- removed-surfaces: 20 (threshold ≥15) ✓
- copilot-install line 1441: 2 (threshold ≥1) ✓

## Deviations from Plan

### Scope deviation (Rule 3 — blocking issue discovered, HALT escalation)

**Discovery during Task 7 LOOP 2 triage:** Plan 09's 16-pattern sed is satisfied (UNEXPECTED residual-files list matches the 4 expected T-B survivors exactly), but npm-test POST remained 216 across 3 stable loops. Forensic decomposition revealed ~40 ADDITIONAL tests/ files carry residues in patterns **not enumerated** by Plan 09's planner:

- **Tuple-form `path.join(..., 'commands', 'gsd', ...)`:** 36 files, ~54 occurrences. Example: `tests/audit-fix-command.test.cjs:21 const COMMANDS_DIR = path.join(REPO_ROOT, 'commands', 'gsd');`. Semantically equivalent to `commands/gsd/` path substring but invisible to substring grep.
- **`name: gsd:<cmd>` frontmatter assertions:** 16 files, ~62 occurrences. Example: `tests/audit-fix-command.test.cjs:40 frontmatter.includes('name: gsd:audit-fix')`. Plan 08 source-side rewrote `brief:` → `brief-` (install.js lines 880, 1005, 1119, 1237, 1357); tests still assert legacy `gsd:` prefix on install.js outputs that now produce `brief-*`.

**Deviation handling:** Per Plan 09 `<objective>` "If an executor discovers that a test cannot be satisfied without a NEW source-side edit, that is a signal to HALT, not to expand scope" — applied the test-side analog: do NOT silently expand scope to 40 additional files. HALT + escalate per plan's 3-loop protocol. Plan 09's **delivered scope (31 files) is complete and atomic**; the out-of-scope residual is documented in 09-GAP-CLOSURE-PARTIAL-AUDIT.md §5 and §7 for the orchestrator to decide Plan 10 vs revise vs Phase-9 deferral.

### Auto-fixes (none)

No Rule 1/2/3 auto-fixes triggered beyond the scope-deviation above. All edits were mechanical per plan spec:
- 27 T-A files: canonical 16-pattern bulk sed, same pattern per file
- 1 T-D file: per-line split per plan's explicit line enumeration
- 3 T-B files: verification-only + 1 surgical T-A on claude-skills line 428 per plan's per-line classification heuristic

## Authentication Gates

None (test-side rewrite; no auth required).

## Deferred Issues

**216 remaining npm-test failures** (distributed across 50 test files, top 15 listed in 09-GAP-CLOSURE-PARTIAL-AUDIT.md §5):
- Out-of-scope for Plan 09's enumerated 31-file scope.
- Attributable to planner-enumeration defect (tuple-form + name-prefix patterns not in Plan 09's substring grep).
- Recommended: Plan 10 to cover the ~40 additional files. Expected recovery: ~135 more tests → final POST ≈ 80 or less.
- Alternative: accept HALT-ACCEPTED + document as Phase-9 deferral in 01-VERIFICATION.md Gap 2 (same pattern as FND-06 + localized-README deferrals).

**11 in-scope T-A files with residual out-of-scope failures:** Files like `antigravity-install`, `reapply-patches`, `codex-config`, `read-guard`, `update-custom-backup` had Plan 09 literal-path residues rewritten successfully (POST=0) BUT still fail npm-test because they ALSO contain tuple-form residues that Plan 09's scope doesn't cover. These are the "double-hit" files that need Plan 10 completion.

## Self-Check

### Files claimed created

- `.planning/phases/01-foundation-fork-hygiene-removal-rename/09-GAP-CLOSURE-PARTIAL-AUDIT.md` — CREATED
- `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-09-SUMMARY.md` — CREATED (this file)

### Commits claimed

- `492751c` Task 2 T-A hook-cluster — FOUND in `git log`
- `1456e0d` Task 3 T-A manifest/install cluster — FOUND
- `8c14f74` Task 4 T-A low-density + T-C→T-A bug-1908 — FOUND
- `c3602ac` Task 5 T-D copilot-install per-line split — FOUND
- `ab9a776` Task 6 T-B verification + surgical T-A — FOUND

### Scope guard

`git diff 017ac5a..HEAD -- scripts/ bin/ hooks/ brief/ agents/ commands/ docs/ CLAUDE.md README.md package.json` returns **empty**. Zero source-side hunks introduced by Plan 09. Plan 08 state preserved: `grep -c "'brief-" scripts/build-hooks.js` = 11; `node -c bin/install.js` exits 0.

## Self-Check: PASSED

## Next Step Recommendation (for orchestrator)

**Option 1 (recommended):** Spawn Plan 10 to cover the tuple-form + name-prefix gap. Expected recovery: ~135 additional tests → POST ≈ 80 or less. Budget: 2–4 hours executor + 1 hour plan-checker/verifier cycles.

See 09-GAP-CLOSURE-PARTIAL-AUDIT.md §7 for the full 3-option analysis.

---

*Summary author: brief-executor, 2026-04-18T08:45:00Z*
*Related artifacts: 09-GAP-CLOSURE-PARTIAL-AUDIT.md (forensic audit), 05-PRE-TEST-BASELINE.txt (PLAN 09 POST-FIX MEASUREMENTS section)*
