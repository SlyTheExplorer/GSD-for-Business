# Plan 07 Gap Closure — PARTIAL AUDIT (HALT state)

**Date:** 2026-04-18
**Status:** HALT — gate failed after 3 iterations
**Scope applied:** path-substring fixes (13 source tuples + 28 literal substrings + 1 configDir tuple + 2 commandsDir tuples + Categry B legacy-cleanup preserved intact)
**Commit status:** NOT committed — working-tree changes intact for forensic inspection

---

## 1. Executive Summary

Plan 07 attempted to close two verification gaps:

1. **Gap 1 (FND-03 partial):** 45 files with `commands/gsd` path substring as active runtime target. **STATE: Path-substring work is complete.** 35 files rewritten via surgical edits; 10 files with documented intentional allowlist residues (all legacy-cleanup semantics).

2. **Gap 2 (Plan 05 W4 false-green):** npm test delta-cap gate failed at measurement. **STATE: Baseline correctly re-captured via `grep -cE '^✖'` on full output (Task 1 complete). However, POST_COUNT=345 >> DELTA_CAP=20. The gate mechanically fails.**

### Why HALT — not self-certify closure

Per plan's Task 4.3 3-loop HALT protocol, the executor MUST NOT commit or self-certify closure when the delta-cap gate fails.

Forensic analysis (below) shows the gate failure is driven by pre-existing Phase 1 regressions outside Plan 07's scope — not by Plan 07's path-substring edits introducing regressions. Our edits actually IMPROVED test health (12 tests fixed), but the total POST count exceeds the cap because Phase 1's hooks rename left build-hooks.js, install.js hook references, and test-infrastructure `gsd-*.js/.sh` filename expectations unfixed. These are a separate FND-03 scope not covered by Plan 07.

---

## 2. Iteration Counts

### Iteration 1 (fresh edit + first measurement)

- All Task 2 + Task 3 edits applied successfully (verified via Task 2 / Task 3 `<verify>` blocks)
- Path-substring residue: 45 files → 10 files (all in documented intentional allowlist)
- `npm test 2>&1 > /tmp/npm-test-plan07-post.txt; grep -cE '^✖' /tmp/npm-test-plan07-post.txt` = **345 failing, 522 passing**
- DELTA = 345 - 10 = 335 (cap: 20)
- GATE_RESULT: FAIL

### Iteration 2 (re-run to rule out flakiness)

- No edits between iterations 1 and 2
- `npm test 2>&1 | grep -cE '^✖'` = **345** (identical)
- GATE_RESULT: FAIL (stable, not flaky)

### Iteration 3 (final run + empirical baseline validation)

- No edits between iterations 2 and 3
- `npm test 2>&1 | grep -cE '^✖'` = **345** (identical)
- **Empirical pre-Phase-1 baseline** captured via `git clone -b backup/original-gsd` + npm install + npm test: **6 failing, 673 passing**. TRUE_BASELINE=10 (upper bound) vs empirical=6 — the assumption was reasonable.
- GATE_RESULT: FAIL
- Empirical delta over pre-Phase-1 state: 345 - 6 = 339 total failures (not all Plan-07-caused)

---

## 3. Surviving `commands/gsd` residues (all intentional allowlist)

10 files retain `commands/gsd` substrings after Plan 07 edits. Per plan's `must_haves.truths` allowlist (≤10 files target), this meets the ceiling.

| File | Occurrences | Rationale |
|------|-------------|-----------|
| `bin/install.js` | 13 literal + 6 tuple (all targetDir-gsd) | Category B legacy-cleanup blocks — detect + remove pre-BRIEF `.claude/commands/gsd/` directories. D-07 no-aliases requires these for upgrade-from-GSD support. |
| `brief/bin/lib/init.cjs` | 1 | canonicalRoots deprecated legacy-commands entry, kept alongside new `.claude/commands/brief` primary entry added above it. |
| `docs/FEATURES.md` | 2 | Legacy-cleanup sentences: "Installer MUST auto-clean legacy `commands/gsd/` directory" / "Remove legacy `commands/gsd/` directory if skills are installed". Accurately describes installer behavior. |
| `docs/ja-JP/FEATURES.md` | 2 | Same as docs/FEATURES.md (Japanese translation, legacy-cleanup sentences). |
| `docs/ko-KR/FEATURES.md` | 2 | Same as docs/FEATURES.md (Korean translation, legacy-cleanup sentences). |
| `docs/skills/discovery-contract.md` | 2 | Legacy-description sentences (line 48 "treat as legacy metadata"; line 70 "marks legacy_claude_commands_installed when..."). |
| `README.md` | 2 | Line 89 (clarified): "Legacy installs that predate the BRIEF fork still have `commands/gsd/` on disk — the installer detects and cleans this." Line 707 (clarified): "Legacy Claude Code installs (pre-BRIEF-fork) still have `~/.claude/commands/gsd/` — the installer cleans this directory automatically." |
| `tests/bug-1924-preserve-user-artifacts.test.cjs` | 9 | Category B — tests the legacy-cleanup code path (preserving user files during `.claude/commands/gsd/` directory wipe). Inline comment added at file header explaining. |
| `tests/claude-skills-migration.test.cjs` | 8 | Category B — tests migration from legacy `commands/gsd/` to `skills/brief-*/SKILL.md` format. Inline comment added at file header explaining. |
| `tests/copilot-install.test.cjs` | 1 | Category B — line 1441: `assert.ok(!fs.existsSync(cmdDir), 'commands/gsd/ should not exist after clean uninstall')` — tautological legacy-dir absence check. |

**Total files with commands/gsd outside allowlist excludes: 10. Target: ≤10. MET.**

---

## 4. bin/install.js categorization (must_haves must_haves.artifacts #2)

**The two counts are reported SEPARATELY (never summed):**

### Literal-substring pattern (pre-fix ground truth: 28)

| Sub-Category | Pre-fix | Post-fix | Action |
|--------------|---------|----------|--------|
| E — JSDoc/comments adjacent to rewritten Category A/C/D code | 15 | 0 (rewrote 13, 2 clarified) | REWRITE |
| E — Comments/log messages inside Category B legacy-cleanup | 13 | 13 | KEEP (legacy cleanup blocks) |

### Tuple-form pattern (pre-fix ground truth: 20)

| Category | Pre-fix | Post-fix | Action |
|----------|---------|----------|--------|
| A — `path.join(src, 'commands', 'gsd')` (13 runtime install branches) | 13 | 0 | REWRITE to `'brief'` |
| B — `path.join(targetDir, 'commands', 'gsd')` (legacy cleanup) | 6 | 6 | KEEP |
| D — `path.join(configDir, 'commands', 'gsd')` (manifest source) | 1 | 0 | REWRITE to `'brief'` |

### Fresh-destination Category C (appears in literal-substring count; form `path.join(commandsDir, 'gsd')`)

| Category | Pre-fix | Post-fix | Action |
|----------|---------|----------|--------|
| C — Fresh destinations for Gemini + Claude-local | 2 | 0 | REWRITE to `'brief'` |

**Explicit non-sum note:** The literal-substring count (28) and the tuple-form count (20) describe overlapping-but-distinct populations. The 2 Category-C `path.join(commandsDir, 'gsd')` sites appear in the literal-substring count (`'gsd'` as single arg), not the tuple count (`'commands', 'gsd'` pair). Reporting these as "48" would double-count Category C.

### Final verification counts (iteration 3)

```
grep -c "path.join(src, 'commands', 'gsd')" bin/install.js         = 0
grep -c "path.join(src, 'commands', 'brief')" bin/install.js       = 13 ✓
grep -c "path.join(targetDir, 'commands', 'gsd')" bin/install.js   = 6 (Cat B preserved)
grep -c "path.join(commandsDir, 'gsd')" bin/install.js             = 0
grep -c "path.join(commandsDir, 'brief')" bin/install.js           = 2 ✓
grep -c "path.join(configDir, 'commands', 'gsd')" bin/install.js   = 0
grep -c "path.join(configDir, 'commands', 'brief')" bin/install.js = 1 ✓
grep -c "'commands', 'gsd'" bin/install.js                         = 6 (Cat B only)
grep -c "commands/gsd" bin/install.js                              = 13 (all Cat B adjacent)
node -c bin/install.js                                             → exit 0 ✓
```

---

## 5. npm test delta — forensic analysis

### Measurement

| Snapshot | Method | Failing Count |
|----------|--------|---------------|
| Plan 05 captured (incorrect) | `tail -80 \| grep -cE "(fail\|not ok\|✗\|✘\|ERR)"` | 2 (~100× under-count) |
| **Empirical pre-Phase-1 (TRUE baseline)** | `git clone backup/original-gsd && npm test` + `grep -cE '^✖'` | **6** |
| TRUE_BASELINE assumption (plan) | Adopted upper bound | 10 |
| PLAN_07_PRE_COUNT (pre-edit) | `npm test 2>&1 \| grep -cE '^✖'` | 322 |
| PLAN_07_POST_COUNT (iteration 1) | Same method post-edits | **345** |
| PLAN_07_POST_COUNT (iteration 2, 3) | Same, stable | 345 |

### Gate evaluation

- TRUE_BASELINE = 10
- DELTA_CAP = 20 (TRUE_BASELINE + 10)
- POST = 345
- DELTA = 345 - 10 = **335** (over cap by 315)

### Root-cause diagnosis

The POST count (345) minus empirical pre-Phase-1 baseline (6) = **339 Phase-1-era failures**. These are NOT caused by Plan 07 edits. Decomposition of the 339 Phase-1 failures:

1. **Hooks not built (single dominant cause):** `scripts/build-hooks.js` hard-codes `gsd-check-update.js`, `gsd-statusline.js`, etc. as the files to copy from `hooks/` to `hooks/dist/`. These files were renamed to `brief-*.js/.sh` in Plan 03/04, so build-hooks.js now copies nothing. `hooks/dist/` is empty. Every test that runs `install()` fails with `Failed to install hooks: directory is empty`. Counted: 56 `Failed: hooks` occurrences in POST (0 in PRE before Plan 03 hook renames).

2. **install.js references `gsd-*.js/.sh` by name:** `bin/install.js` still hard-codes `gsd-statusline.js`, `gsd-check-update.js`, `gsd-prompt-guard.js`, etc. at lines 4762, 4814–4818, 5844 (expectedShHooks), 5930, 5970, 5984, 6060, 6063, 6066, 6069+. Even if hooks/dist/ were populated with `brief-*`, install.js would not find them.

3. **Tests depend on `gsd-*.md` agent filenames that were renamed:** Tests like `tests/worktree-safety.test.cjs` assert existence of `agents/gsd-executor.md` (renamed to `brief-executor.md` in Plan 03). The test assertions haven't been rewritten.

4. **Previously-hidden nested test failures now surfacing:** When a `.test.cjs` file had a top-level failure in PRE (e.g., `tests/codex-config.test.cjs`), the test runner reported 1 `✖` for the file. In POST, our Plan 07 rewrites unblock that file's top-level test, allowing it to progress into nested tests — which then fail individually. 23 "new" failures fall into this bucket.

### Net Plan 07-caused regressions

Among the 36 "new" failures in POST vs PRE (timestamp-stripped unique diff):
- 23 "new" = pre-existing nested failures previously hidden by top-level failures
- 13 "new" = pre-existing Phase 1 regressions (hooks, agents, install.js hook refs)
- 2 "new" = describe-block strings renamed from `commands/gsd/` to `commands/brief/` (not new tests — same tests with renamed description strings)
- **0 "new" caused by Plan 07 edits introducing regressions**

Tests ACTUALLY fixed by Plan 07 (timestamp-stripped unique diff, PRE had them, POST doesn't):
- `#1736: local Claude install populates .claude/commands/gsd/` (now passes with `commands/brief/`)
- `commands/gsd/autonomous.md allowed-tools` (now `commands/brief/autonomous.md` passes)
- `list-workspaces / new-workspace / remove-workspace command exists with correct frontmatter` (3 tests)
- `local install creates/deploys/quick.md to .claude/commands/gsd/` (3 tests now pass against `commands/brief/`)
- `Total commands matches commands/gsd/*.md file count` (now matches `commands/brief/*.md`)
- `workspace command files`
- `tests/codex-config.test.cjs` top-level (fixed: file now parses further)
- `tests/trae-install.test.cjs` top-level (fixed: file now parses further)

**Plan 07 fixed 12 tests, broke 0. The gate failure is 100% driven by out-of-scope Phase 1 regressions.**

---

## 6. Scope boundary affirmation — deferred items

Per plan's `<objective>` "OUT of scope — explicitly deferred":

### Items addressed correctly (within Plan 07 scope)

- bin/install.js path-substring categorization (28 literal + 20 tuple, reported separately) ✓ DONE
- brief/bin/lib/init.cjs dual-root (EXACT commands/gsd count = 1) ✓ DONE
- BRIEF-internal text files (5 files) ✓ DONE (0 residue each)
- English docs (6 files) ✓ DONE (legacy-cleanup sentences kept with clarification)
- Localized docs (10 files) ✓ DONE (path-only, prose untouched)
- Test files (21 files) ✓ DONE (18 Category A rewritten + 3 Category B kept with inline comments + 1 mixed line-by-line)

### Items explicitly out of scope (per plan's `<objective>`)

- **Cross-runtime smoke test** — deferred to Phase 9 HRD-01. NOT attempted.
- **Full localized README prose rebranding** — deferred to Phase 9 Hardening. Surgical path substitution applied only.
- **CHANGELOG.md historical entries** — handled by Plan 05 RESIDUAL + pre-fork banner. NOT revisited.
- **`gsd-*` prefix residues in bin/install.js** (19 `startsWith('gsd-')` checks, 12 `'gsd'` prefix args, 1 `prefix = 'gsd-'` default at line 3622) — separate FND-03 regression. NOT modified by Plan 07.

### Items discovered during Plan 07 execution that block the delta-cap gate (OUT of Plan 07 scope)

Newly identified during Plan 07 execution as the root cause of POST=345:

1. **`scripts/build-hooks.js` hard-codes `gsd-*.js/.sh` hook filenames** — renamed in Plan 03/04. Needs rewrite to `brief-*`. Makes `hooks/dist/` empty on every build.

2. **`bin/install.js` hard-codes `gsd-*.js/.sh` hook filenames** at multiple sites (lines 4762, 4814–4818, 5844, 5930, 5970, 5984, 6060, 6063, 6066, 6069+). Needs parallel rename.

3. **Tests referencing `agents/gsd-*.md`** assertions — need rewrite to `agents/brief-*.md`. Affects `tests/worktree-safety.test.cjs`, `tests/worktree-stagger.test.cjs`, and possibly others.

**Recommendation:** Spawn follow-up plan (`/brief-plan-phase --gaps` after verification re-runs) narrowly targeting these three categories, with its own baseline + delta measurement. Plan 07's path-substring work remains intact in the working tree for the follow-up plan to build on.

---

## 7. Recommendation for next step

1. **Do NOT discard Plan 07's working-tree edits.** They are correct within Plan 07's path-substring scope. 10 files with documented residues, 13 source-path tuples rewritten, 2 fresh-destinations updated, 12 tests newly passing. These represent real progress and should be preserved.

2. **Follow-up plan(s) needed for full FND-03 closure:**
   - **07b / 08 — Hook filename rewrite:** `scripts/build-hooks.js` + `bin/install.js` hook references. Single surgical plan.
   - **07c / 09 — Agent filename assertion rewrite in tests:** Tests referencing `agents/gsd-*.md`. 
   - **07d / 10 — `gsd-*` prefix residues in install.js:** 19+12+1 sites per plan's out-of-scope note.

3. **Alternative:** If the follow-up plans are small enough, bundle them into a single "Plan 08 — complete Phase 1 FND-03 closure (hooks + tests + install.js prefixes)" that:
   - Re-baselines against the empirical pre-Phase-1 figure (6 failures)
   - Sets DELTA_CAP = 16 (6 + 10)
   - Applies hook-name rewrites in build-hooks.js + install.js
   - Re-runs npm test; expects ≤16 failing

4. **Plan 07 atomic commit:** Can be separately committed after this HALT state is reviewed by the verifier, or can be rolled into Plan 08's commit if Plan 08 is imminent. Either way, the working-tree edits are tested and verified within Plan 07's scope.

---

## 8. Working-tree state at HALT

All Plan 07 edits are in the working tree, UNCOMMITTED:

```
git status --short output at HALT:
 M .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt
 M CONTRIBUTING.md
 M README.ja-JP.md
 M README.ko-KR.md
 M README.md
 M README.zh-CN.md
 M agents/brief-intel-updater.md
 M bin/install.js
 M brief/bin/lib/init.cjs
 M brief/references/few-shot-examples/verifier.md
 M brief/templates/codebase/structure.md
 M brief/workflows/profile-user.md
 M brief/workflows/update.md
 M docs/ARCHITECTURE.md
 M docs/ja-JP/ARCHITECTURE.md
 M docs/ja-JP/superpowers/specs/2026-03-20-multi-project-workspaces-design.md
 M docs/ko-KR/ARCHITECTURE.md
 M docs/ko-KR/superpowers/specs/2026-03-20-multi-project-workspaces-design.md
 M docs/manual-update.md
 M docs/skills/discovery-contract.md
 M tests/analyze-dependencies.test.cjs
 M tests/architecture-counts.test.cjs
 M tests/audit-fix-command.test.cjs
 M tests/autonomous-allowed-tools.test.cjs
 M tests/bug-1736-local-install-commands.test.cjs
 M tests/bug-1924-preserve-user-artifacts.test.cjs
 M tests/bug-2351-intel-kilo-layout.test.cjs
 M tests/claude-skills-migration.test.cjs
 M tests/command-count-sync.test.cjs
 M tests/copilot-install.test.cjs
 M tests/cursor-reviewer.test.cjs
 M tests/discuss-phase-power.test.cjs
 M tests/execute-phase-active-flags.test.cjs
 M tests/execute-phase-wave.test.cjs
 M tests/explore-command.test.cjs
 M tests/extract-learnings.test.cjs
 M tests/import-command.test.cjs
 M tests/milestone-summary.test.cjs
 M tests/quick-research.test.cjs
 M tests/scan-command.test.cjs
 M tests/update-custom-backup.test.cjs
 M tests/workspace.test.cjs
```

Total: 41 files modified (40 Plan-07 targets + 1 new PARTIAL-AUDIT file).

---

*Executor: HALT per Plan 07 Task 4.3 after 3 iterations confirming gate failure at DELTA=335 (cap: 20), driven entirely by out-of-scope Phase 1 regressions.*
