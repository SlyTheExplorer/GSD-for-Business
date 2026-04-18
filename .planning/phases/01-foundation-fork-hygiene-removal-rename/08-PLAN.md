---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 08
type: execute
wave: 8
depends_on: [07]
files_modified:
  # Hook bundling — the dominant failure root cause
  - "scripts/build-hooks.js"
  # Hook references + gsd-* prefix residues inside the installer
  - "bin/install.js"
  # Worktree tests asserting pre-rename paths
  - "tests/worktree-safety.test.cjs"
  - "tests/worktree-stagger.test.cjs"
  # Baseline file (append Plan 08 POST/DELTA) + new audit artifact
  - ".planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt"
  - ".planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-AUDIT.md"
autonomous: true
requirements:
  - FND-03
user_setup: []

must_haves:
  truths:
    # ── Gap 3a: scripts/build-hooks.js hook-name array rewritten ──
    - "User runs `grep -c \"'gsd-\" scripts/build-hooks.js` and gets 0 (zero gsd-* hook filename literals remain)"
    - "User runs `grep -c \"'brief-\" scripts/build-hooks.js` and gets 11 (exactly 11 brief-* hook filename literals present — 8 .js + 3 .sh to match the 11 files on disk at hooks/*)"
    - "User runs `node scripts/build-hooks.js` and exit code is 0 and no `not found, skipping` warnings appear in stdout"
    - "User runs `ls hooks/dist/ | wc -l` and gets a value ≥ 11 (hooks/dist/ populated with bundled brief-* files)"
    - "User runs `ls hooks/dist/ | grep -c '^brief-'` and gets 11 (every file in hooks/dist/ has the brief- prefix)"
    - "User runs `ls hooks/dist/ | grep -c '^gsd-'` and gets 0 (no stale gsd-* files in hooks/dist/)"
    # ── Gap 3b: bin/install.js hook-filename hardcodes rewritten ──
    - "User runs `grep -c \"'gsd-statusline.js'\\|'gsd-check-update.js'\\|'gsd-check-update-worker.js'\\|'gsd-context-monitor.js'\\|'gsd-prompt-guard.js'\\|'gsd-read-guard.js'\\|'gsd-read-injection-scanner.js'\\|'gsd-workflow-guard.js'\\|'gsd-session-state.sh'\\|'gsd-validate-commit.sh'\\|'gsd-phase-boundary.sh'\" bin/install.js` and gets 0 (every hook-filename literal rewritten to brief-*)"
    - "User runs `grep -c \"'brief-statusline.js'\\|'brief-check-update.js'\\|'brief-check-update-worker.js'\\|'brief-context-monitor.js'\\|'brief-prompt-guard.js'\\|'brief-read-guard.js'\\|'brief-read-injection-scanner.js'\\|'brief-workflow-guard.js'\\|'brief-session-state.sh'\\|'brief-validate-commit.sh'\\|'brief-phase-boundary.sh'\" bin/install.js` and gets ≥ 22 (brief-* filenames now present at every former gsd-* call site — pre-fix has 27 hook-filename literals; minus 4 Category P-D historical-cleanup entries kept at lines 4303/4305/4306/4307 = 23 expected post-fix; threshold ≥ 22 allows 1 site of measurement drift)"
    - "User runs `grep -c \"'brief-session-state.sh', 'brief-validate-commit.sh', 'brief-phase-boundary.sh'\" bin/install.js` and gets 1 (expectedShHooks array at line ~5844 has been rewritten)"
    - "User runs `node -c bin/install.js` and exit code is 0 (the rewritten file parses cleanly)"
    # ── Gap 5: bin/install.js gsd-* prefix residues ──
    - "User runs `grep -c \"copyFlattenedCommands(gsdSrc, commandDir, 'gsd',\" bin/install.js` and gets 0 (Category P-A fresh-install prefix no longer produces gsd-*.md filenames)"
    - "User runs `grep -c \"copyCommandsAs.*(gsdSrc,.*, 'gsd',\" bin/install.js` and gets 0 (Category P-A fresh-install skill prefix no longer produces gsd-*/SKILL.md directory names)"
    - "User runs `grep -cE \"copyCommandsAs.*\\('.*', .*, 'brief',\" bin/install.js` and gets ≥ 11 (all 11 copy-helper call sites now pass 'brief' as fresh-install prefix: copyFlattenedCommands + copyCommandsAsCodexSkills + copyCommandsAsCopilotSkills + copyCommandsAsAntigravitySkills + copyCommandsAsCursorSkills + copyCommandsAsWindsurfSkills + copyCommandsAsAugmentSkills + copyCommandsAsTraeSkills + copyCommandsAsClaudeSkills (×2 — global+local) + copyCommandsAsCodebuddySkills)"
    - "User runs `grep -c \"prefix = 'gsd-'\" bin/install.js` and gets 0 (default parameter at line ~3622 in listCodexSkillNames rewritten to 'brief-')"
    - "User runs `grep -c \"prefix = 'brief-'\" bin/install.js` and gets ≥ 1 (new default present)"
    - "User runs `grep -c \"'gsd-local-patches'\" bin/install.js` and gets 0 (PATCHES_DIR_NAME fresh-install filename rewritten)"
    - "User runs `grep -c \"'brief-local-patches'\" bin/install.js` and gets 1 (new PATCHES_DIR_NAME present)"
    - "User runs `grep -c \"'gsd-file-manifest.json'\" bin/install.js` and gets 0 (MANIFEST_NAME fresh-install filename rewritten)"
    - "User runs `grep -c \"'brief-file-manifest.json'\" bin/install.js` and gets 1 (new MANIFEST_NAME present)"
    - "User runs `grep -c \"startsWith('gsd-')\" bin/install.js` and gets a value ≤ 14 (the substring `startsWith('gsd-')` survives post-fix at 14 sites: 12 P-C dual-prefix OR-arms at lines 3006, 4496, 4510, 4528, 4563, 4596, 4612, 4663, 4748, 5276, 5292, 5311 in the form `startsWith('brief-') || …startsWith('gsd-')` [the substring is literally present in each], plus 2 P-B legacy-only sites at lines 5671 and 5703 kept as-is with explanatory `// Legacy-only cleanup: …` inline comments. Threshold ≤ 14 rejects ADDITIONAL new single-prefix sites but tolerates the dual-prefix OR-arms that are CORRECT per D-07. The per-line P-A vs P-B vs P-C decision table is in 08-GAP-CLOSURE-AUDIT.md §4.)"
    - "User runs `grep -cE \"startsWith\\('brief-'\\)\\s*\\|\\|\\s*.*\\.startsWith\\('gsd-'\\)\" bin/install.js` and gets ≥ 12 (12 `startsWith` P-C dual-prefix sites from Task 4 at lines 3006, 4496, 4510, 4528, 4563, 4596, 4612, 4663, 4748, 5276, 5292, 5311 — the `.includes` form is a separate regex, measured by the next truth)"
    - "User runs `grep -cE \"\\.includes\\('brief-[a-z-]+\\.(js|sh)'\\)\\s*\\|\\|\\s*.*\\.includes\\('gsd-[a-z-]+\\.(js|sh)'\\)\" bin/install.js` and gets ≥ 19 (19 `.includes` P-C dual-prefix hook-detection sites from Task 4b at lines 4805, 4814–4818, 5979, 5984, 6099, 6127, 6148, 6155, 6175, 6199, 6223, 6255, 6280, 6307, 6329 — matches the existing Task 4b verify assertion at plan line 676)"
    # ── Gap 5b (Plan 08 revision-1): user-visible `gsd-*` output strings (BLOCKER 2 in checker iteration 1) ──
    - "User runs `grep -c \"gsd-pristine\" bin/install.js` and gets 0 (Category P-A: pristine directory name no longer leaks gsd-* to fresh installs — line 5325 doc + line 5336 path.join rewritten to brief-pristine)"
    - "User runs `grep -c \"brief-pristine\" bin/install.js` and gets ≥ 2 (rewrites at line 5325 doc + line 5336 path.join present)"
    - "User runs `grep -c \"\\$gsd-new-project\" bin/install.js` and gets 0 (Category P-A: Codex command literal at line 6434 rewritten to \\$brief-new-project)"
    - "User runs `grep -c \"\\$brief-new-project\" bin/install.js` and gets ≥ 1"
    - "User runs `grep -c \"gsd-new-project (mention the skill name)\" bin/install.js` and gets 0 (Category P-A: Cursor instruction at line 6437 rewritten to brief-new-project)"
    - "User runs `grep -c \"\\$gsd-reapply-patches\" bin/install.js` and gets 0 (Category P-A: Codex command literal at line 5398 rewritten to \\$brief-reapply-patches)"
    - "User runs `grep -c \"gsd-reapply-patches (mention the skill name)\" bin/install.js` and gets 0 (Category P-A: Cursor instruction at line 5400 rewritten)"
    - "User runs `grep -cE \"\\\\\\$gsd-\\\\\\\${commandName}\" bin/install.js` and gets 0 (Category P-A: Codex template literals at lines 1649 + 1655 rewritten from \\$gsd-\\${...} to \\$brief-\\${...})"
    - "User runs `grep -cE \"\\\\\\$brief-\\\\\\\${commandName}\" bin/install.js` and gets ≥ 2"
    - "User runs `grep -cE \"agents\\\\.gsd-\" bin/install.js` and gets ≤ 2 (post-fix: line 1829 regex rewritten to `/^\\[agents\\.(brief-|gsd-)[^\\]]+\\]/gm` — the literal substring `agents.gsd-` NO LONGER appears there because the alternation `(brief-|gsd-)` breaks the contiguous char sequence. Post-fix count = 2: line 2528 dual-prefix second OR-arm `startsWith('agents.gsd-')` + line 1861 comment `// Remove [agents.brief-*] and [agents.gsd-*] sections` [comment updated in Task 4b per INFO 6]. Threshold ≤ 2 is precise and rejects any NEW single-prefix `agents.gsd-` references.)"
    - "User runs `grep -c \"c.replace(/gsd:/g\" bin/install.js` and gets 0 (Category P-A revision-1 decision: 12 `/gsd:/` input-normalizer sites at lines 880, 1005, 1119, 1237, 1357, 4239, 4247 + their adjacent comment lines at 879, 924, 1004, 1117, 1236 rewritten to `/brief:/g` (or `/brief:/gi` per per-site flag preservation) — Option α from BLOCKER 2 resolution: fresh BRIEF users type `/brief:`, not `/gsd:`)"
    - "User runs `grep -c \"c\\.replace(/brief:/g\" bin/install.js` and gets ≥ 2 (the 2 Option-α sites using the `c` variable at lines 880, 1005 — `c.replace(/brief:/g, 'brief-')`; no `i` flag on these because they use `/g` only per Task 4b table)"
    - "User runs `grep -c \"content\\.replace(/brief:/gi\" bin/install.js` and gets ≥ 3 (the 3 Option-α sites using the `content` variable at lines 1119, 1237, 1357 — `return content.replace(/brief:/gi, 'brief-')`)"
    - "User runs `grep -c \"jsContent\\.replace(/brief:/gi\" bin/install.js` and gets ≥ 2 (the 2 Option-α sites using the `jsContent` variable at lines 4239, 4247 — `jsContent = jsContent.replace(/brief:/gi, 'brief-')`)"
    - "User runs `grep -c \"prefix\\s*=\\s*'gsd'\" bin/install.js | xargs test 0 -eq` exits 0 (no remaining `prefix = 'gsd'` no-suffix variant — both quoted and no-suffix forms zero)"
    - "User runs `grep -cE \".cache/brief/brief-update-check\\.json\" bin/install.js` and gets 1 (cache path rewritten — line 5858)"
    - "User runs `grep -cE \".cache/gsd/gsd-update-check\\.json\" bin/install.js` and gets 0"
    # ── Gap 4: worktree test assertions ──
    - "User runs `grep -c \"agents/gsd-executor.md\\|agents/gsd-planner.md\\|agents/gsd-verifier.md\" tests/worktree-safety.test.cjs tests/worktree-stagger.test.cjs` and gets 0"
    - "User runs `grep -c \"get-shit-done/workflows\" tests/worktree-safety.test.cjs tests/worktree-stagger.test.cjs` and gets 0"
    - "User runs `grep -c \"hooks/gsd-\" tests/worktree-safety.test.cjs tests/worktree-stagger.test.cjs` and gets 0"
    - "User runs `node --test tests/worktree-safety.test.cjs tests/worktree-stagger.test.cjs 2>&1 | grep -cE '^✖'` and gets 0 (the 12 tests in these two files all pass)"
    # ── Gap 6: delta-cap gate against empirical baseline 6 ──
    - "User runs `npm test 2>&1 > /tmp/plan08-post-test.txt; grep -cE '^✖' /tmp/plan08-post-test.txt` and gets a value ≤ 16 (EMPIRICAL_BASELINE=6 + 10 cap, documented in 05-PRE-TEST-BASELINE.txt Plan 08 section)"
    - "User opens `.planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt` and sees a section titled `## PLAN 08 POST-FIX MEASUREMENTS` containing EMPIRICAL_BASELINE=6, DELTA_CAP=16, PLAN_08_POST_COUNT=<N>, DELTA=<N-6>, GATE_RESULT=PASS (or HALT with rationale)"
    - "User opens `.planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-AUDIT.md` and finds: (1) executive summary with iteration counts, (2) pre/post grep counts per file modified, (3) bin/install.js P-A / P-B decision table for every one of the 50+ gsd-* prefix + hook-filename sites, (4) forensic npm-test analysis decomposing DELTA into Plan-08-fixed / Plan-08-introduced / pre-existing-nested-unmasked, (5) explicit scope-boundary affirmation (FND-06 cross-runtime + localized prose + CHANGELOG banner STILL deferred to Phase 9)"
  artifacts:
    - path: "scripts/build-hooks.js"
      provides: "Bundling script that copies 11 brief-* hooks from hooks/ to hooks/dist/"
      contains: "HOOKS_TO_COPY array with 11 brief-* entries (brief-check-update-worker.js, brief-check-update.js, brief-context-monitor.js, brief-prompt-guard.js, brief-read-guard.js, brief-read-injection-scanner.js, brief-statusline.js, brief-workflow-guard.js, brief-session-state.sh, brief-validate-commit.sh, brief-phase-boundary.sh) — matches the 11 files in hooks/ verbatim"
    - path: "hooks/dist/"
      provides: "Bundled hooks (populated by running `node scripts/build-hooks.js`)"
      contains: "11 brief-* files — the output of the rewritten build script"
    - path: "bin/install.js"
      provides: "Installer that (a) reads hook files by their current brief-* names, (b) produces brief-* filenames on fresh installs, (c) detects both brief-* and legacy gsd-* files for uninstall/manifest purposes"
      contains: "Zero 'gsd-*.js/.sh' hook-filename literals. Zero ', 'gsd', ' copy-helper prefix arguments for fresh-install paths. PATCHES_DIR_NAME and MANIFEST_NAME rewritten to brief-*. Dual-prefix startsWith checks in uninstall/manifest code paths. Legacy Category B path.join(targetDir, 'commands', 'gsd') blocks preserved unchanged from Plan 07."
    - path: "tests/worktree-safety.test.cjs"
      provides: "Worktree commit-safety tests updated to post-rename paths"
      contains: "EXECUTOR_AGENT_PATH references agents/brief-executor.md; all path.join() calls use the current brief/workflows/ + agents/brief-*.md layout (file already uses brief-executor.md at line 21 per Task 1 pre-grep — no-op if already correct; verify)"
    - path: "tests/worktree-stagger.test.cjs"
      provides: "Worktree stagger tests updated to post-rename paths"
      contains: "WORKFLOWS_DIR references brief/workflows; all fs.readFileSync() calls target the current brief/workflows/execute-phase.md path (file already uses brief/workflows at line 16 per Task 1 pre-grep — no-op if already correct; verify)"
    - path: ".planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt"
      provides: "Plan 08 re-measurement appended — empirical baseline (6) now the gate reference instead of Plan 07's upper-bound assumption (10)"
      contains: "Existing Plan 05 + Plan 07 sections preserved. New `## PLAN 08 POST-FIX MEASUREMENTS` section with EMPIRICAL_BASELINE=6 (captured from backup/original-gsd per Plan 07's §5 empirical run), DELTA_CAP=16, PLAN_08_POST_COUNT, DELTA, GATE_RESULT (PASS / HALT with 3-iteration counts)"
    - path: ".planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-AUDIT.md"
      provides: "Plan-08 forensic audit — mirrors Plan 07 structure (07-GAP-CLOSURE-PARTIAL-AUDIT.md) but closes Phase 1 FND-03 or records the next HALT state"
      contains: "Sections 1–8 mirroring Plan 07 audit: (1) exec summary + closure status, (2) iteration counts, (3) per-file residue before/after, (4) bin/install.js P-A/P-B decision table for hook filenames + prefix residues + PATCHES/MANIFEST names, (5) npm-test delta forensic decomposition, (6) scope-boundary affirmation (FND-06 + localized prose + CHANGELOG still deferred to Phase 9), (7) recommendation (Phase 1 ready for re-verification if PASS; next gap-closure plan recommendation if HALT), (8) working-tree / commit state at audit time"
  key_links:
    - from: "scripts/build-hooks.js HOOKS_TO_COPY array"
      to: "hooks/ directory on disk (11 brief-* files)"
      via: "array literal matches filename stems verbatim"
      pattern: "`node scripts/build-hooks.js` reads each listed filename from hooks/, validates JS syntax via vm.Script, copies to hooks/dist/ preserving executable bit for .sh — after Plan 08, every array entry resolves to an existing file and hooks/dist/ is populated"
    - from: "bin/install.js hook-wiring helpers (installHookSettings, verifyHookInstalled, etc. at lines 5930+, 5970+, 5984+, 6060–6345)"
      to: "hooks/dist/ (the staged hook files)"
      via: "string literal filename references (`'brief-statusline.js'` not `'gsd-statusline.js'`)"
      pattern: "install(targetDir, runtime) at every runtime branch reads hooks/dist/brief-*.{js,sh}, writes them into {targetDir}/hooks/, and wires them into settings.json / config.toml — after Plan 08, every filename in the install path corresponds to an actual file on disk"
    - from: "bin/install.js fresh-install copy helpers (copyFlattenedCommands, copyCommandsAs*Skills)"
      to: "filesystem output under targetDir/command/ and targetDir/skills/"
      via: "prefix parameter inlined into `${prefix}-${baseName}.md` / `${prefix}-${subdir}` strings"
      pattern: "when call sites pass 'brief' as prefix (Plan 08 rewrites), generated filenames are brief-help.md / brief-debug/SKILL.md — no gsd-* produced on fresh BRIEF installs (D-07 no-aliases honored)"
    - from: "bin/install.js uninstall + manifest-generation code paths"
      to: "previously-installed files (potentially both brief-* from fresh BRIEF installs AND legacy gsd-* from pre-BRIEF GSD installs on same machine)"
      via: "dual-prefix startsWith check: `file.startsWith('brief-') || file.startsWith('gsd-')`"
      pattern: "uninstall removes both prefix families; manifest tracks both; legacy cleanup for upgrade-from-GSD is preserved; fresh BRIEF installs are also detectable for clean uninstall"
    - from: "tests/worktree-safety.test.cjs + worktree-stagger.test.cjs assertions"
      to: "actual filesystem state post-rename (brief-executor.md, brief/workflows/execute-phase.md)"
      via: "path.join() + fs.readFileSync() targeting post-rename paths"
      pattern: "every assertion in these two files resolves a real file after Plan 08; `node --test tests/worktree-*.test.cjs | grep -cE '^✖'` is 0"
    - from: "npm test full run"
      to: ".planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt Plan 08 section"
      via: "`grep -cE '^✖' /tmp/plan08-post-test.txt` appended as PLAN_08_POST_COUNT + DELTA = POST - 6 + GATE_RESULT"
      pattern: "DELTA ≤ 10 above empirical baseline 6 (i.e., POST ≤ 16) → GATE_RESULT=PASS → commit → Phase 1 ready for re-verification"
---

<objective>
Close the three remaining Phase-1 FND-03 gaps flagged by Plan 07's HALT audit (`07-GAP-CLOSURE-PARTIAL-AUDIT.md` §5 and §6) so that `grep -cE '^✖'` on a full `npm test` run drops from POST=345 to ≤16 (EMPIRICAL_BASELINE=6 + cap 10), and `npx brief-cc@latest` produces only `brief-*` filenames on fresh installs (D-07 no-aliases).

**Revision-1 additions (planner-checker iteration 1):** Plan-checker found 3 residue categories that the original Plan 08 missed: (a) 19 `.includes('gsd-…')` hook-detection sites in bin/install.js that need Category P-C dual-prefix treatment (addressed by new **Task 3b**); (b) ~10 user-visible `gsd-*` output strings — `gsd-pristine`, `$gsd-new-project`, `$gsd-reapply-patches`, Codex `$gsd-\${cmd}` template literals, 12 `/gsd:/` input-normalizer sites — that produce direct D-07 "no aliases" violations on fresh BRIEF installs (addressed by new **Task 4b**, applying Option α: rewrite `/gsd:/` → `/brief:/`); (c) an off-by-one bug in the original Task 3 line-4762 array (10 entries instead of 11 — `brief-check-update-worker.js` missing). These are not cosmetic: without Task 3b the Task 6 npm-test gate likely HALTs (hook-detection duplicates during upgrade) and without Task 4b fresh BRIEF installs emit `gsd-*` strings to end users. Task count grows from 8 → 10 (Task 3b + Task 4b inserted; original 8-task structure preserved).

**Gap 3 (hook-filename propagation — the dominant failure root cause).** Plans 03/04 renamed `hooks/gsd-*.{js,sh}` → `hooks/brief-*.{js,sh}` (11 files on disk verified via `ls hooks/ | grep -v dist` → 11 brief-* entries). The two files that consume those hook filenames were NOT updated by Plans 03/04/05/06/07:
  - **`scripts/build-hooks.js` lines 17–29** hard-code a 10-element array of `gsd-*.{js,sh}` names. The loop at line 59 tries to copy each from `hooks/` to `hooks/dist/`. Because none of those gsd-named files exist on disk, the loop copies zero files and logs `Warning: gsd-check-update-worker.js not found, skipping` for every entry. `hooks/dist/` is empty (verified via `ls hooks/dist/ | wc -l` → 0). Every test that exercises `install()` then fails with `Failed to install hooks: directory is empty` — this is the single dominant cause of the 56 hook-install failures counted in Plan 07's audit §5.1. Secondary issue: the existing array only has 10 entries but 11 brief-* hooks are on disk (the 2025-10 addition `brief-read-injection-scanner.js` was never added to the bundle list). Plan 08 writes the full 11-entry list.
  - **`bin/install.js` ~40+ hook-filename call sites** (Task 1's pre-grep will enumerate every line). Lines 457 (JSDoc example), 4286 + 4304 (legacy-cleanup comments describing pre-rename filename), 4303 + 4305 + 4306 + 4307 (pre-v1.9 removed-file list — preserve as HISTORICAL), 4347 (a regex/template literal in a renaming transformation), 4762 (a `gsdHooks` array passed to `validateHooksPresent`), 5828 (a comment describing the `.sh` hook's versioning header), 5844 (`expectedShHooks` array used by verification), 5858 (the `gsd-update-check.json` cache file under `.cache/gsd/` — this is a fresh-install output and must become `brief-update-check.json` under `.cache/brief/`), 5930 + 5970 + 5984 (config.toml wiring for the update check hook), 6060–6072 (Claude Code settings.json `command` field pointing at the hook filename — 6 sites), 6106 + 6118 + 6130 + 6144 + 6178 + 6192 + 6202 + 6216 + 6226 + 6240 + 6252 + 6258 + 6272 + 6277 + 6285 + 6299 + 6304 + 6309 + 6321 + 6326 + 6331 + 6345 (the per-hook `{hook}File` constant + fallback warning string in the hook-installation loop — ~22 sites, one pair per hook).

**Gap 4 (worktree test assertions — 12 test failures).** Baseline already shows these failing. Pre-grep in Task 1 confirms: `tests/worktree-safety.test.cjs` line 21 declares `EXECUTOR_AGENT_PATH` pointing at `agents/brief-executor.md`, and `tests/worktree-stagger.test.cjs` line 16 declares `WORKFLOWS_DIR` pointing at `brief/workflows` — so the paths in the test SOURCE are already post-rename. BUT the baseline file (05-PRE-TEST-BASELINE.txt) shows the failing test output references `.claude/worktrees/agent-af21ca25/...` paths that are STILL pre-rename (agents/gsd-executor.md, get-shit-done/workflows/execute-phase.md). Root cause: the worktree CREATED by the wave-5 executor copied a pre-rename snapshot, and the test reads from INSIDE that worktree. This is a worktree-staleness issue, not a test-assertion issue — the failing tests are from a stale worktree snapshot captured pre-rename. At the main working-tree level, these tests already pass against brief-executor.md and brief/workflows/execute-phase.md. Task 5's job is to confirm via fresh `node --test tests/worktree-*.test.cjs` run that the tests pass at the main working tree level AND grep the two test files for any residual pre-rename strings (the pre-grep in Task 1 determines authoritatively whether any strings need changing).

**Gap 5 (bin/install.js `gsd-*` prefix residues — separate FND-03 residue).** ~40 total sites across three sub-patterns:
  - **Category P-A (fresh-install output — MUST rewrite to `'brief'` per D-07):**
    - 11 `copyCommandsAs*(gsdSrc, skillsDir, 'gsd', ...)` call sites (lines 5491, 5501, 5511, 5526, 5541, 5551, 5561, 5571, 5581, 5604, 5630). Passes `'gsd'` as the prefix parameter that the copy helper interpolates into fresh destination filenames (`${prefix}-${baseName}.md`). After Plan 08: 11 sites pass `'brief'`.
    - 1 `listCodexSkillNames(skillsDir, prefix = 'gsd-')` default parameter at line 3622. Default used when uninstall doesn't specify — governs which skill directory names to list. After Plan 08: default is `'brief-'` with a comment that an explicit `'gsd-'` can be passed for legacy-detection callsites.
    - 1 `PATCHES_DIR_NAME = 'gsd-local-patches'` at line 5212. This is a fresh-install output directory (e.g., `{configDir}/gsd-local-patches/`). After Plan 08: `'brief-local-patches'`.
    - 1 `MANIFEST_NAME = 'gsd-file-manifest.json'` at line 5213. Fresh-install output filename. After Plan 08: `'brief-file-manifest.json'`.
    - 1 cache-file path at line 5858 (`.cache/gsd/gsd-update-check.json`). Fresh-install output. After Plan 08: `.cache/brief/brief-update-check.json`.
    - 4 JSDoc `@param` comments at lines 3566, 3973, 4041, 457 that say `e.g., 'gsd'`. After Plan 08: `e.g., 'brief'`.
  - **Category P-B (legacy detection — KEEP as `'gsd-'` with inline comment explaining upgrade-from-GSD cleanup intent):**
    - The 6 `path.join(targetDir, 'commands', 'gsd')` Category-B tuples at lines 4623, 4633, 4675, 4697, 5594, 5645 — already documented in Plan 07 as intentional. Plan 08 does NOT touch these.
    - Any `startsWith('gsd-')` sites that exclusively detect pre-BRIEF GSD-era artifacts for cleanup (e.g., a block inside a cleanup-legacy-GSD-install function). Task 4's per-line decision table categorizes each of the 19 sites at lines 3006, 4496, 4510, 4528, 4563, 4596, 4612, 4663, 4748, 5276, 5292, 5311, 5493, 5514, 5529, 5584, 5633, 5671, 5703.
  - **Category P-C (UNINSTALL + MANIFEST — dual-prefix check `startsWith('brief-') || startsWith('gsd-')`):** Because many of the startsWith sites are inside `uninstall()` or `writeManifest()` functions that must detect BOTH fresh BRIEF installs AND legacy GSD installs, the right answer is not "rewrite to brief-" (which would make uninstall no-op on pre-BRIEF installs) and not "keep as gsd-" (which would make uninstall no-op on fresh BRIEF installs). The right answer is the dual-prefix check. Task 4 enumerates each of the 19 sites and the audit table records P-A (fresh-install, pure rewrite), P-B (legacy only, keep), or P-C (dual-prefix, rewrite to `startsWith('brief-') || startsWith('gsd-')`).
  - **Category P-D (COMMENTS adjacent to rewritten code):** Line 4303 `'gsd-notify.sh'  // Removed in v1.6.x`, 4305–4307 `'gsd-intel-index.js', 'gsd-intel-session.js', 'gsd-intel-prune.js'  // Removed in v1.9.2` — these are inside `FILES_TO_REMOVE_ON_UPGRADE` type arrays listing PRE-BRIEF removed files for cleanup during upgrade. Category P-D: KEEP as-is (historical removal record; renaming these would undo the cleanup-from-GSD logic). Line 4286/4304 `// Renamed to gsd-statusline.js in v1.9.0` comments: UPDATE to `// Renamed to brief-statusline.js in Phase 1 (was gsd-statusline.js pre-fork)` to reflect current reality without erasing the renaming history.

**Gap 6 (re-baseline against empirical pre-Phase-1 baseline 6).** Plan 07 adopted `TRUE_BASELINE=10` as an upper-bound assumption. Plan 07's §5 audit captured the empirical figure via `git clone backup/original-gsd` + `npm test`: **6 failing, 673 passing**. Plan 08 uses EMPIRICAL_BASELINE=6 as the gate reference, sets DELTA_CAP=16 (6 + 10), and re-runs npm test POST-fix. Expected outcome: if Gap 3 (56 hook-install failures) + Gap 4 (12 worktree failures) + Gap 5 (various install.js prefix failures contributing to skill-count / agent-count tests) all close, POST should drop into the 6–16 range.

**Plan scope boundary (explicit — MUST be documented in 08-GAP-CLOSURE-AUDIT.md §6):**

IN scope: the three gaps above (Gap 3, 4, 5) and the re-baseline (Gap 6) plus the audit artifact. Task 1 enumerates every residue pattern via `grep -n` before any edit.

OUT of scope — explicitly deferred (same boundaries as Plan 07):
- **Cross-runtime smoke test actual execution (FND-06 human verification)** — deferred to Phase 9 HRD-01 per ROADMAP SC #5 and ASSUMPTIONS.md FND-06 entry.
- **Full localized README prose rebranding** — deferred to Phase 9 (Hardening). Plan 07 applied surgical path substitution only; Plan 08 does NOT revisit localized docs.
- **CHANGELOG.md historical entries** — already banner-handled by Plan 05. Plan 08 does NOT revisit.
- **Any new functionality** — Plan 08 is pure gap closure. No new features. No new files except the audit artifact.

**Commit strategy:** Single atomic commit `refactor(01-gap-closure-08): close hook-rename propagation + bin/install.js gsd-* prefix residues (FND-03 full closure)`. If Task 6 delta-cap gate fails on first attempt, Task 6's 3-loop HALT protocol (re-inspect, fix, re-run) is applied — same shape as Plan 07 Task 4.3. If 3 loops fail, Task 6.3 HALT: produce 08-GAP-CLOSURE-PARTIAL-AUDIT.md (do NOT self-certify closure), return HALT to orchestrator.

**Why this is a gap closure (not a new feature):** Plan 07's working-tree edits at SHA b1ec9f6 closed the `commands/gsd` path-substring scope but explicitly deferred three categories to the next plan: scripts/build-hooks.js hook-filename array (Gap 3a), bin/install.js hook-filename hardcodes (Gap 3b), bin/install.js `gsd-*` prefix residues (Gap 5). Plan 07's §7 recommendation #3 explicitly proposed Plan 08 as the consolidation path with EMPIRICAL_BASELINE=6 + DELTA_CAP=16 — this plan executes that recommendation verbatim.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-VERIFICATION.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/07-GAP-CLOSURE-PARTIAL-AUDIT.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-07-SUMMARY.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt

<interfaces>
<!-- ============================================================ -->
<!-- Ground truth enumerated during planning 2026-04-18           -->
<!-- Task 1 MUST re-verify before any edit (file state may shift) -->
<!-- ============================================================ -->

<!-- hooks/ directory contents (11 brief-* files on disk — verified via ls 2026-04-18) -->
<!--   brief-check-update-worker.js   brief-phase-boundary.sh       brief-session-state.sh -->
<!--   brief-check-update.js          brief-prompt-guard.js          brief-statusline.js -->
<!--   brief-context-monitor.js       brief-read-guard.js            brief-validate-commit.sh -->
<!--                                   brief-read-injection-scanner.js -->
<!--                                                                  brief-workflow-guard.js -->

<!-- hooks/dist/ directory: empty (0 files — confirmed via ls | wc -l = 0) -->

<!-- scripts/build-hooks.js current HOOKS_TO_COPY array (lines 17–29 verbatim): -->
<!--
const HOOKS_TO_COPY = [
  'gsd-check-update-worker.js',
  'gsd-check-update.js',
  'gsd-context-monitor.js',
  'gsd-prompt-guard.js',
  'gsd-read-guard.js',
  'gsd-statusline.js',
  'gsd-workflow-guard.js',
  // Community hooks (bash, opt-in via .planning/config.json hooks.community)
  'gsd-session-state.sh',
  'gsd-validate-commit.sh',
  'gsd-phase-boundary.sh'
];
-->

<!-- REQUIRED TARGET STATE (11 entries — includes brief-read-injection-scanner.js which is on disk but missing from pre-edit array): -->
<!--
const HOOKS_TO_COPY = [
  'brief-check-update-worker.js',
  'brief-check-update.js',
  'brief-context-monitor.js',
  'brief-prompt-guard.js',
  'brief-read-guard.js',
  'brief-read-injection-scanner.js',
  'brief-statusline.js',
  'brief-workflow-guard.js',
  // Community hooks (bash, opt-in via .planning/config.json hooks.community)
  'brief-session-state.sh',
  'brief-validate-commit.sh',
  'brief-phase-boundary.sh'
];
-->

<!-- ============================================================ -->
<!-- bin/install.js residue inventory (verified via grep 2026-04-18) -->
<!-- ============================================================ -->

<!-- A. Hook-filename literals (gsd-*.{js,sh} string constants) -->
<!-- Line 457:   JSDoc @param — rewrite to brief-statusline.js -->
<!-- Line 4286:  comment: "Renamed to gsd-statusline.js in v1.9.0" — UPDATE to reflect current rename (see Category P-D above) -->
<!-- Line 4303:  'gsd-notify.sh'  // Removed in v1.6.x — P-D KEEP (historical removal list for upgrade cleanup) -->
<!-- Line 4304:  comment: "Renamed to gsd-statusline.js in v1.9.0" — UPDATE same as 4286 -->
<!-- Line 4305:  'gsd-intel-index.js'   // Removed in v1.9.2 — P-D KEEP -->
<!-- Line 4306:  'gsd-intel-session.js' // Removed in v1.9.2 — P-D KEEP -->
<!-- Line 4307:  'gsd-intel-prune.js'   // Removed in v1.9.2 — P-D KEEP -->
<!-- Line 4347:  template literal 'hooks$1gsd-statusline.js' — rewrite to 'hooks$1brief-statusline.js' -->
<!-- Line 4762:  const gsdHooks = ['gsd-statusline.js', 'gsd-check-update.js', 'gsd-context-monitor.js', 'gsd-prompt-guard.js', 'gsd-read-guard.js', 'gsd-read-injection-scanner.js', 'gsd-workflow-guard.js', 'gsd-session-state.sh', 'gsd-validate-commit.sh', 'gsd-phase-boundary.sh'] — REWRITE entire array to brief-* (also rename variable to briefHooks) -->
<!-- Line 5828:  comment: ".sh hooks carry a gsd-hook-version header so gsd-check-update.js can" — UPDATE to reference brief-check-update.js and note the header field name (gsd-hook-version) is a schema constant we preserve for existing-install detection; add clarifying comment -->
<!-- Line 5844:  const expectedShHooks = ['gsd-session-state.sh', 'gsd-validate-commit.sh', 'gsd-phase-boundary.sh'] — REWRITE to brief-* -->
<!-- Line 5858:  path.join(os.homedir(), '.cache', 'gsd', 'gsd-update-check.json') — REWRITE both segments to '.cache/brief/brief-update-check.json' -->
<!-- Line 5930:  comment: "gsd-check-update.js in config.toml — the file must physically exist." — UPDATE to brief-check-update.js -->
<!-- Line 5970:  path.resolve(targetDir, 'hooks', 'gsd-check-update.js') — rewrite -->
<!-- Line 5984:  (context block — similar pattern, verify via Task 1 pre-grep) -->
<!-- Lines 6060, 6063, 6066, 6069, 6072, 6075: buildHookCommand(targetDir, 'gsd-*.js', hookOpts) — 6 sites rewrite -->
<!-- Lines 6106, 6130, 6178, 6202, 6226, 6258, 6285, 6309, 6331: const {hook}File = path.join(targetDir, 'hooks', 'gsd-*.js'|'.sh') — 9 sites rewrite -->
<!-- Lines 6118, 6144, 6192, 6216, 6240, 6272, 6299, 6321, 6345: console.warn messages saying "gsd-*.js not found" — 9 sites rewrite -->
<!-- Lines 6252, 6277, 6304, 6326: buildHookCommand(targetDir, 'gsd-*.sh', hookOpts) — 4 sites rewrite -->

<!-- B. 'gsd' prefix arguments to copy helpers (fresh-install filename prefix — Category P-A) -->
<!-- Line 5491:  copyFlattenedCommands(gsdSrc, commandDir, 'gsd', pathPrefix, runtime) — rewrite 'gsd' to 'brief' -->
<!-- Line 5501:  copyCommandsAsCodexSkills(gsdSrc, skillsDir, 'gsd', pathPrefix, runtime) — rewrite -->
<!-- Line 5511:  copyCommandsAsCopilotSkills(gsdSrc, skillsDir, 'gsd', isGlobal) — rewrite -->
<!-- Line 5526:  copyCommandsAsAntigravitySkills(gsdSrc, skillsDir, 'gsd', isGlobal) — rewrite -->
<!-- Line 5541:  copyCommandsAsCursorSkills(gsdSrc, skillsDir, 'gsd', pathPrefix, runtime) — rewrite -->
<!-- Line 5551:  copyCommandsAsWindsurfSkills(gsdSrc, skillsDir, 'gsd', pathPrefix, runtime) — rewrite -->
<!-- Line 5561:  copyCommandsAsAugmentSkills(gsdSrc, skillsDir, 'gsd', pathPrefix, runtime) — rewrite -->
<!-- Line 5571:  copyCommandsAsTraeSkills(gsdSrc, skillsDir, 'gsd', pathPrefix, runtime) — rewrite -->
<!-- Line 5581:  copyCommandsAsClaudeSkills(gsdSrc, skillsDir, 'gsd', pathPrefix, runtime, isGlobal) — rewrite (Qwen branch) -->
<!-- Line 5604:  copyCommandsAsCodebuddySkills(gsdSrc, skillsDir, 'gsd', pathPrefix, runtime) — rewrite -->
<!-- Line 5630:  copyCommandsAsClaudeSkills(gsdSrc, skillsDir, 'gsd', pathPrefix, runtime, isGlobal) — rewrite (Claude global branch) -->
<!-- Total: 11 call sites, all Category P-A rewrite -->

<!-- C. startsWith('gsd-') checks — per-line Category decision -->
<!-- Line 3006:  agentEntries filter in installCodexConfig — reads agents dir to build Codex .toml configs. DUAL-PREFIX (P-C): must register agents named brief-* (fresh installs) AND gsd-* (for one-shot upgrade detection if gsd-* agents somehow remain). Rewrite to `(f.startsWith('brief-') || f.startsWith('gsd-'))`. -->
<!-- Line 4496:  uninstall — removes command/*.md from OpenCode/Kilo targetDir. DUAL-PREFIX (P-C): must remove both brief-* AND gsd-*. Rewrite to `(file.startsWith('brief-') || file.startsWith('gsd-'))`. -->
<!-- Line 4510:  uninstall — removes skills/*-dir/ from Codex/Cursor/Windsurf/Trae/CodeBuddy targetDir. DUAL-PREFIX (P-C). Rewrite. -->
<!-- Line 4528:  uninstall — removes Codex-specific *.toml files. DUAL-PREFIX (P-C). Rewrite. -->
<!-- Line 4563:  uninstall — Copilot skills/*-dir/ removal. DUAL-PREFIX (P-C). Rewrite. -->
<!-- Line 4596:  uninstall — Antigravity skills/*-dir/ removal. DUAL-PREFIX (P-C). Rewrite. -->
<!-- Line 4612:  uninstall — Qwen skills/*-dir/ removal. DUAL-PREFIX (P-C). Rewrite. -->
<!-- Line 4663:  uninstall — Claude Code global skills/*-dir/ removal. DUAL-PREFIX (P-C). Rewrite. -->
<!-- Line 4748:  uninstall — removes agents/*.md. DUAL-PREFIX (P-C). Rewrite. -->
<!-- Line 5276:  writeManifest — indexes agents/*.md. DUAL-PREFIX (P-C). Rewrite. -->
<!-- Line 5292:  writeManifest — indexes command/*.md (OpenCode/Kilo). DUAL-PREFIX (P-C). Rewrite. -->
<!-- Line 5311:  writeManifest — indexes hooks/*.{js,sh}. DUAL-PREFIX (P-C). Rewrite to `(file.startsWith('brief-') || file.startsWith('gsd-'))`. -->
<!-- Line 5493:  fresh-install verify count AFTER copyFlattenedCommands(..., 'gsd', ...) — once Plan 08 rewrites line 5491 to pass 'brief', this count MUST check 'brief-'. CATEGORY P-A. Rewrite to startsWith('brief-'). -->
<!-- Line 5514:  fresh-install verify count AFTER copyCommandsAsCopilotSkills(..., 'gsd', ...). CATEGORY P-A. Rewrite to startsWith('brief-'). -->
<!-- Line 5529:  fresh-install verify count AFTER copyCommandsAsAntigravitySkills(..., 'gsd', ...). CATEGORY P-A. Rewrite to startsWith('brief-'). -->
<!-- Line 5584:  fresh-install verify count — (similar pattern, Qwen branch). CATEGORY P-A. Rewrite. -->
<!-- Line 5633:  fresh-install verify count (Claude global branch). CATEGORY P-A. Rewrite. -->
<!-- Line 5671:  staleSkillsDir cleanup INSIDE the Claude-local fresh-install flow (removes leftover skills/gsd-*/ from previous local installs). CATEGORY P-B KEEP: this code specifically targets legacy gsd-* directories left over from a prior install of Claude-global on the same targetDir (skills/ layout was only used in v1.9.2-global; Claude-local uses commands/brief/). Add inline comment: `// Legacy gsd-*/ cleanup from previous Claude-global install — D-07 no-aliases preserves detection-only`. Keep startsWith('gsd-'). -->
<!-- Line 5703:  old-agent cleanup inside fresh-install (removes agents/gsd-*.md before copying new agents/brief-*.md). CATEGORY P-B KEEP with inline comment: `// Legacy gsd-*.md cleanup from pre-BRIEF installs — D-07 no-aliases preserves detection-only`. Keep startsWith('gsd-'). -->
<!-- (Additional lines may surface during Task 1 pre-grep; defer final count to audit table) -->

<!-- D. Function defaults and comments -->
<!-- Line 3566:  JSDoc @param prefix - Prefix for filenames (e.g., 'gsd') — UPDATE to 'brief' -->
<!-- Line 3622:  function listCodexSkillNames(skillsDir, prefix = 'gsd-')  — REWRITE default to 'brief-'. Callers pass explicit 'gsd-' where legacy detection needed. -->
<!-- Line 3973:  JSDoc @param prefix — UPDATE 'gsd' to 'brief' -->
<!-- Line 4041:  JSDoc @param prefix — UPDATE 'gsd' to 'brief' -->

<!-- E. Output filename constants -->
<!-- Line 5212:  const PATCHES_DIR_NAME = 'gsd-local-patches' — REWRITE to 'brief-local-patches' -->
<!-- Line 5213:  const MANIFEST_NAME = 'gsd-file-manifest.json' — REWRITE to 'brief-file-manifest.json' -->

<!-- ============================================================ -->
<!-- tests/worktree-safety.test.cjs: ALREADY post-rename in source -->
<!-- ============================================================ -->
<!-- Line 7:  JSDoc reference to brief-executor.md (already correct) -->
<!-- Line 20: const EXECUTE_PLAN_PATH = path.join(__dirname, '..', 'brief', 'workflows', 'execute-plan.md') — already correct -->
<!-- Line 21: const EXECUTOR_AGENT_PATH = path.join(__dirname, '..', 'agents', 'brief-executor.md') — already correct -->
<!-- Line 22: const EXECUTE_PHASE_PATH = path.join(__dirname, '..', 'brief', 'workflows', 'execute-phase.md') — already correct -->
<!-- Line 60: test('brief-executor.md task_commit_protocol ...') — already correct -->
<!-- Line 66: assert(content.includes('--diff-filter=D'), 'brief-executor.md must include...') — already correct -->
<!-- This file ALREADY has zero pre-rename strings. Task 5 verifies via fresh grep; if confirmed zero, Task 5 is a no-op for this file. -->

<!-- ============================================================ -->
<!-- tests/worktree-stagger.test.cjs: ALREADY post-rename in source -->
<!-- ============================================================ -->
<!-- Line 16: const WORKFLOWS_DIR = path.join(__dirname, '..', 'brief', 'workflows') — already correct -->
<!-- Line 19: const executePhasePath = path.join(WORKFLOWS_DIR, 'execute-phase.md') — already correct -->
<!-- This file also ALREADY has zero pre-rename strings. Task 5 verifies via fresh grep. -->

<!-- IMPORTANT: The failing-test stack traces in 05-PRE-TEST-BASELINE.txt (lines 27–134) show paths like -->
<!--   /Users/agent/GSD-for-Business/.claude/worktrees/agent-af21ca25/agents/gsd-executor.md -->
<!-- These are STALE WORKTREE snapshots captured pre-rename. They are NOT regenerating test failures in the main tree — -->
<!-- running `node --test tests/worktree-*.test.cjs` at the MAIN tree level will resolve against the current -->
<!-- agents/brief-executor.md. Task 5 confirms this empirically. -->

</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Enumerate ground truth — pre-edit grep capture</name>
  <files>
    /tmp/plan08-pre-build-hooks.txt
    /tmp/plan08-pre-install-hooks.txt
    /tmp/plan08-pre-install-prefixes.txt
    /tmp/plan08-pre-install-output-names.txt
    /tmp/plan08-pre-install-residues-rev1.txt
    /tmp/plan08-pre-tests.txt
    /tmp/plan08-hooks-on-disk.txt
  </files>
  <read_first>
    # Load context first (no edits yet — this task only MEASURES)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (§decisions — D-05 aggressive rename, D-07 no aliases)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/07-GAP-CLOSURE-PARTIAL-AUDIT.md (§5 forensic analysis + §6 scope boundary — Plan 08 must honor the boundary)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-07-SUMMARY.md (Plan 07 final outcome summary — context for what was committed at SHA b1ec9f6 and what's deferred to Plan 08)
    - scripts/build-hooks.js (read fully — file is ~100 lines; the HOOKS_TO_COPY array at lines 17–29 is the target)
  </read_first>
  <action>
Produce six `/tmp` enumeration files that Tasks 2-6 will reference verbatim. Run these commands in sequence from the repo root (absolute paths used so the results persist across shell state resets):

```bash
# 1. scripts/build-hooks.js — enumerate every gsd- residue
grep -n "gsd-" /Users/agent/GSD-for-Business/scripts/build-hooks.js > /tmp/plan08-pre-build-hooks.txt
echo "--- COUNT ---" >> /tmp/plan08-pre-build-hooks.txt
grep -c "gsd-" /Users/agent/GSD-for-Business/scripts/build-hooks.js >> /tmp/plan08-pre-build-hooks.txt

# 2. bin/install.js — enumerate every gsd-*.{js,sh,md} hook/agent/command filename literal
grep -nE "gsd-[a-z-]+\.(js|sh|md)" /Users/agent/GSD-for-Business/bin/install.js > /tmp/plan08-pre-install-hooks.txt
echo "--- COUNT ---" >> /tmp/plan08-pre-install-hooks.txt
grep -cE "gsd-[a-z-]+\.(js|sh|md)" /Users/agent/GSD-for-Business/bin/install.js >> /tmp/plan08-pre-install-hooks.txt

# 3. bin/install.js — enumerate every gsd-* prefix residue
{
  echo "## startsWith('gsd-') sites ##"
  grep -nE "startsWith\('gsd-'\)" /Users/agent/GSD-for-Business/bin/install.js
  echo ""
  echo "## 'gsd' prefix argument sites ##"
  grep -nE ", 'gsd',|, 'gsd'\)" /Users/agent/GSD-for-Business/bin/install.js
  echo ""
  echo "## prefix = 'gsd-' default sites ##"
  grep -nE "prefix = 'gsd-'|prefix\s*=\s*'gsd'" /Users/agent/GSD-for-Business/bin/install.js
  echo ""
  echo "## @param JSDoc 'gsd' examples ##"
  grep -nE "@param.*'gsd'" /Users/agent/GSD-for-Business/bin/install.js
} > /tmp/plan08-pre-install-prefixes.txt

# 4. bin/install.js — enumerate fresh-install OUTPUT filename constants
{
  echo "## PATCHES_DIR_NAME + MANIFEST_NAME ##"
  grep -nE "PATCHES_DIR_NAME|MANIFEST_NAME" /Users/agent/GSD-for-Business/bin/install.js
  echo ""
  echo "## Cache file path under .cache/gsd ##"
  grep -nE "\.cache.*gsd" /Users/agent/GSD-for-Business/bin/install.js
} > /tmp/plan08-pre-install-output-names.txt

# 4b. bin/install.js — REVISION-1 additions: .includes('gsd-*') + user-visible output strings + /gsd:/ normalizers
{
  echo "## .includes('gsd-') hook-detection sites (Task 3b P-C DUAL-PREFIX) ##"
  grep -nE "\.includes\(['\"]gsd-" /Users/agent/GSD-for-Business/bin/install.js
  echo ""
  echo "## User-visible output: gsd-pristine, \$gsd-new-project, \$gsd-reapply-patches ##"
  grep -nE "gsd-pristine|gsd-new-project|gsd-reapply-patches" /Users/agent/GSD-for-Business/bin/install.js
  echo ""
  echo "## Codex template literals (\$gsd-\${...}) ##"
  grep -nE "\\\$gsd-\\\$\{" /Users/agent/GSD-for-Business/bin/install.js
  echo ""
  echo "## /gsd:/ input normalizers (12 sites — all rewrite to /brief:/ per Option α) ##"
  grep -nE "replace\(/gsd:/" /Users/agent/GSD-for-Business/bin/install.js
  echo ""
  echo "## agents.gsd-* detection (P-C DUAL-PREFIX) ##"
  grep -nE "agents\.gsd-|agents\\\\.gsd-" /Users/agent/GSD-for-Business/bin/install.js
} > /tmp/plan08-pre-install-residues-rev1.txt

# 5. tests/ — enumerate any remaining pre-rename path refs across ALL test files
grep -rn "agents/gsd-\|get-shit-done/workflows\|hooks/gsd-" /Users/agent/GSD-for-Business/tests/ > /tmp/plan08-pre-tests.txt 2>/dev/null || echo "(no matches — clean)" > /tmp/plan08-pre-tests.txt

# 6. hooks/ on disk — confirm the 11 brief-* files
ls /Users/agent/GSD-for-Business/hooks/ | grep -v dist > /tmp/plan08-hooks-on-disk.txt
echo "--- COUNT ---" >> /tmp/plan08-hooks-on-disk.txt
wc -l /tmp/plan08-hooks-on-disk.txt | awk '{print $1}' >> /tmp/plan08-hooks-on-disk.txt
```

After running, inspect each file. The expected shape (drift-check — numbers may differ ±2 from the planning-time figures):

- `/tmp/plan08-pre-build-hooks.txt`: 10 lines + "--- COUNT ---" + the count integer (expected: 10 gsd- references at lines 17–28 inside HOOKS_TO_COPY)
- `/tmp/plan08-pre-install-hooks.txt`: ~40 lines + count (expected: ≥40 gsd-*.{js,sh} hook filename literals)
- `/tmp/plan08-pre-install-prefixes.txt`: ~19 startsWith + 11 prefix-arg + 1 default + 4 JSDoc = ~35 sites
- `/tmp/plan08-pre-install-output-names.txt`: 2 constants (PATCHES_DIR_NAME, MANIFEST_NAME) + 1 cache-path = 3 sites
- `/tmp/plan08-pre-tests.txt`: 0 matches (clean) OR 1 match (tests/removed-surfaces.smoke.txt — this is the audit file from Plan 02, NOT a failing test)
- `/tmp/plan08-hooks-on-disk.txt`: 11 brief-* files (verbatim list — used by Task 2 to construct the new HOOKS_TO_COPY array)

If any of these counts DIVERGE from the expected shape by more than ±3, STOP and return `## PLANNING INCONCLUSIVE` to the orchestrator — the planning interfaces captured in this file are stale and the scope must be re-discussed.

NO FILE EDITS in this task. Only measurement.
  </action>
  <verify>
    <automated>test -f /tmp/plan08-pre-build-hooks.txt && test -f /tmp/plan08-pre-install-hooks.txt && test -f /tmp/plan08-pre-install-prefixes.txt && test -f /tmp/plan08-pre-install-output-names.txt && test -f /tmp/plan08-pre-install-residues-rev1.txt && test -f /tmp/plan08-pre-tests.txt && test -f /tmp/plan08-hooks-on-disk.txt && grep -c "brief-" /tmp/plan08-hooks-on-disk.txt | grep -qE "^(11|12)$" && echo "ground-truth captured"</automated>
  </verify>
  <acceptance_criteria>
    - All six /tmp files exist and are non-empty
    - /tmp/plan08-hooks-on-disk.txt contains exactly 11 brief-* filenames (the 11 hooks currently on disk: brief-check-update-worker.js, brief-check-update.js, brief-context-monitor.js, brief-phase-boundary.sh, brief-prompt-guard.js, brief-read-guard.js, brief-read-injection-scanner.js, brief-session-state.sh, brief-statusline.js, brief-validate-commit.sh, brief-workflow-guard.js)
    - /tmp/plan08-pre-build-hooks.txt contains 10 lines of gsd-* references matching the planning-time inventory (lines 17–28 inside HOOKS_TO_COPY — JSDoc comments at lines 4–5 do NOT contain gsd- per planning-time read of lines 1–29)
    - /tmp/plan08-pre-install-hooks.txt contains ≥40 sites total
    - /tmp/plan08-pre-install-prefixes.txt contains the four sub-sections (startsWith / prefix-arg / default / JSDoc) with non-zero counts under each
    - /tmp/plan08-pre-install-output-names.txt references line 5212 (PATCHES_DIR_NAME), line 5213 (MANIFEST_NAME), and line 5858 (.cache/gsd)
  </acceptance_criteria>
  <done>
    Six /tmp enumeration files exist and document the pre-edit state. Any line-number drift within ±3 is acceptable and will be accommodated in subsequent tasks via re-reading the pre-grep output, not by re-deriving line numbers from a stale plan.
  </done>
</task>

<task type="auto">
  <name>Task 2: Rewrite scripts/build-hooks.js HOOKS_TO_COPY array + rebuild + populate hooks/dist/</name>
  <files>scripts/build-hooks.js</files>
  <read_first>
    - /tmp/plan08-pre-build-hooks.txt (Task 1 ground truth — confirms the 10 gsd-* entries to replace)
    - /tmp/plan08-hooks-on-disk.txt (the 11 brief-* files that form the new array — the array size grows from 10 to 11 because brief-read-injection-scanner.js was never in the pre-rename array)
    - scripts/build-hooks.js (entire file — small, ~100 lines)
  </read_first>
  <action>
Edit `scripts/build-hooks.js`. Use the `Edit` tool to replace the exact 10-element array at lines 17–29 with the verbatim 11-element array below. The `old_string` is the current array including surrounding context; the `new_string` is the target array with the same surrounding context.

**Target `old_string`** (must match character-for-character — use the `Read` tool first to get the exact current indentation):

```javascript
// Hooks to copy (pure Node.js, no bundling needed)
const HOOKS_TO_COPY = [
  'gsd-check-update-worker.js',
  'gsd-check-update.js',
  'gsd-context-monitor.js',
  'gsd-prompt-guard.js',
  'gsd-read-guard.js',
  'gsd-statusline.js',
  'gsd-workflow-guard.js',
  // Community hooks (bash, opt-in via .planning/config.json hooks.community)
  'gsd-session-state.sh',
  'gsd-validate-commit.sh',
  'gsd-phase-boundary.sh'
];
```

**Target `new_string`**:

```javascript
// Hooks to copy (pure Node.js, no bundling needed)
const HOOKS_TO_COPY = [
  'brief-check-update-worker.js',
  'brief-check-update.js',
  'brief-context-monitor.js',
  'brief-prompt-guard.js',
  'brief-read-guard.js',
  'brief-read-injection-scanner.js',
  'brief-statusline.js',
  'brief-workflow-guard.js',
  // Community hooks (bash, opt-in via .planning/config.json hooks.community)
  'brief-session-state.sh',
  'brief-validate-commit.sh',
  'brief-phase-boundary.sh'
];
```

(Rationale for the array-size growth from 10 → 11: `brief-read-injection-scanner.js` exists in `hooks/` on disk — see /tmp/plan08-hooks-on-disk.txt line 7 — but was absent from the pre-rename array. Plan 08 aligns the bundle list with the actual hooks directory so `hooks/dist/` matches `hooks/` 1:1.)

Also update the file-header JSDoc at line 3 from `Copy GSD hooks to dist for installation.` to `Copy BRIEF hooks to dist for installation.` (single-word swap — use a separate Edit tool call with `old_string: " * Copy GSD hooks to dist for installation."` → `new_string: " * Copy BRIEF hooks to dist for installation."`).

After the edits, run the bundling step and assert the dist directory is populated:

```bash
node /Users/agent/GSD-for-Business/scripts/build-hooks.js
ls /Users/agent/GSD-for-Business/hooks/dist/ > /tmp/plan08-hooks-dist.txt
echo "--- COUNT ---" >> /tmp/plan08-hooks-dist.txt
ls /Users/agent/GSD-for-Business/hooks/dist/ | wc -l >> /tmp/plan08-hooks-dist.txt
```

If `node scripts/build-hooks.js` emits ANY `Warning: {hook} not found, skipping` line, the array contains a filename that isn't on disk — STOP and audit the diff (the array entry must match a file in /tmp/plan08-hooks-on-disk.txt verbatim).
  </action>
  <verify>
    <automated>cd /Users/agent/GSD-for-Business && grep -c "'gsd-" scripts/build-hooks.js | grep -qE "^0$" && grep -c "'brief-" scripts/build-hooks.js | grep -qE "^11$" && ! node scripts/build-hooks.js 2>&1 | grep -qE "not found, skipping" && test $(ls hooks/dist/ | wc -l) -ge 11 && test $(ls hooks/dist/ | grep -c '^brief-') -eq 11 && test $(ls hooks/dist/ | grep -c '^gsd-') -eq 0</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "'gsd-" scripts/build-hooks.js` returns 0
    - `grep -c "'brief-" scripts/build-hooks.js` returns 11
    - `node scripts/build-hooks.js` exits 0 with no `Warning: {hook} not found, skipping` messages in stdout or stderr
    - `ls hooks/dist/ | wc -l` returns ≥ 11
    - `ls hooks/dist/ | grep -c '^brief-'` returns 11
    - `ls hooks/dist/ | grep -c '^gsd-'` returns 0
    - `ls hooks/dist/` contents (sorted) match `ls hooks/ | grep -v dist` (sorted) — i.e., hooks/dist/ is a complete 1:1 copy of hooks/
  </acceptance_criteria>
  <done>
    scripts/build-hooks.js contains 11 brief-* entries (0 gsd-* entries). hooks/dist/ is populated with 11 brief-* files matching hooks/ 1:1. The dominant test-failure root cause (empty hooks/dist/) is remediated.
  </done>
</task>

<task type="auto">
  <name>Task 3: Rewrite bin/install.js hook-filename hardcodes (~40 sites)</name>
  <files>bin/install.js</files>
  <read_first>
    - /tmp/plan08-pre-install-hooks.txt (Task 1's enumeration — the authoritative list of lines to edit; 40+ entries)
    - bin/install.js lines 450–465 (context for line 457 JSDoc)
    - bin/install.js lines 4280–4350 (context for lines 4286, 4303, 4304, 4305, 4306, 4307, 4347 — DO NOT rewrite 4303, 4305, 4306, 4307 which are the pre-v1.9 FILES_TO_REMOVE_ON_UPGRADE historical list — see Category P-D in interfaces block)
    - bin/install.js lines 4760–4770 (context for line 4762 gsdHooks array)
    - bin/install.js lines 5825–5870 (context for 5828 comment, 5844 expectedShHooks, 5858 cache path)
    - bin/install.js lines 5925–5990 (context for 5930, 5970, 5984 update-check hook refs)
    - bin/install.js lines 6055–6350 (context for the 22+ per-hook install sites: 6060, 6063, 6066, 6069, 6072, 6075, 6106, 6118, 6130, 6144, 6178, 6192, 6202, 6216, 6226, 6240, 6252, 6258, 6272, 6277, 6285, 6299, 6304, 6309, 6321, 6326, 6331, 6345)
  </read_first>
  <action>
Edit `bin/install.js` using the `Edit` tool per the per-line rewrite table below. Use per-site `old_string` / `new_string` replacements that include 2–3 lines of surrounding context to guarantee uniqueness. Do NOT use a global regex — precision is required because some `gsd-*` references must be KEPT (Category P-D historical lists at lines 4303, 4305, 4306, 4307).

**Rewrite table — Category A (hook-filename literals MUST rewrite to brief-*):**

| Line | Rewrite rule | Notes |
|------|--------------|-------|
| 457  | JSDoc `@param {string} hookName - Hook filename (e.g. 'gsd-statusline.js')` → `(e.g. 'brief-statusline.js')` | example-string in documentation |
| 4286 | Comment `'hooks/statusline.js',  // Renamed to gsd-statusline.js in v1.9.0` → `'hooks/statusline.js',  // Renamed to brief-statusline.js in Phase 1 (was gsd-statusline.js pre-fork)` | preserves history |
| 4304 | Comment `'hooks/statusline.js',  // Renamed to gsd-statusline.js in v1.9.0` → identical rewrite as 4286 | second instance of the same comment |
| 4347 | Template-literal `'hooks$1gsd-statusline.js'` → `'hooks$1brief-statusline.js'` | regex replacement target |
| 4762 | Array `['gsd-statusline.js', 'gsd-check-update.js', 'gsd-check-update-worker.js', 'gsd-context-monitor.js', 'gsd-prompt-guard.js', 'gsd-read-guard.js', 'gsd-read-injection-scanner.js', 'gsd-workflow-guard.js', 'gsd-session-state.sh', 'gsd-validate-commit.sh', 'gsd-phase-boundary.sh']` → `['brief-statusline.js', 'brief-check-update.js', 'brief-check-update-worker.js', 'brief-context-monitor.js', 'brief-prompt-guard.js', 'brief-read-guard.js', 'brief-read-injection-scanner.js', 'brief-workflow-guard.js', 'brief-session-state.sh', 'brief-validate-commit.sh', 'brief-phase-boundary.sh']` | **REVISION-1 FIX (BLOCKER 4):** the new array is now 11 entries (was 10 in original plan — `'brief-check-update-worker.js'` was missing). Verify against `ls hooks/ \| grep -v dist \| wc -l` = 11. Also rename the variable `gsdHooks` → `briefHooks` in the same statement AND at every subsequent usage site in the same scope (search the function body for `gsdHooks` and rewrite each — Task 3's pre-grep at `/tmp/plan08-pre-install-prefixes.txt` line-number references guide the scope). The pre-edit array on disk in bin/install.js may be 10 OR 11 entries depending on whether a previous executor already added `gsd-check-update-worker.js`; Task 3's pre-grep at `/tmp/plan08-pre-install-hooks.txt` is authoritative — if pre-edit array is 10 entries, both the line-4762 old_string and new_string above must be adjusted by REMOVING the `gsd-check-update-worker.js` entry from the old_string while KEEPING `brief-check-update-worker.js` in the new_string. |
| 5828 | Comment `.sh hooks carry a gsd-hook-version header so gsd-check-update.js can` → `.sh hooks carry a brief-hook-version header (legacy name: gsd-hook-version, preserved for existing-install detection) so brief-check-update.js can` | clarifies that the header field NAME `gsd-hook-version` is a schema constant we preserve; add inline comment explaining |
| 5844 | `const expectedShHooks = ['gsd-session-state.sh', 'gsd-validate-commit.sh', 'gsd-phase-boundary.sh']` → `const expectedShHooks = ['brief-session-state.sh', 'brief-validate-commit.sh', 'brief-phase-boundary.sh']` | verification array |
| 5858 | `path.join(os.homedir(), '.cache', 'gsd', 'gsd-update-check.json')` → `path.join(os.homedir(), '.cache', 'brief', 'brief-update-check.json')` | fresh-install cache output — both segments rewrite |
| 5930 | Comment `// gsd-check-update.js in config.toml — the file must physically exist.` → `// brief-check-update.js in config.toml — the file must physically exist.` | |
| 5970 | `path.resolve(targetDir, 'hooks', 'gsd-check-update.js')` → `path.resolve(targetDir, 'hooks', 'brief-check-update.js')` | |
| 5984 | (Re-read this line from /tmp/plan08-pre-install-hooks.txt — planning notes it's in the same 5970-area block; apply the same `gsd-check-update.js` → `brief-check-update.js` pattern) | |
| 6060 | `buildHookCommand(targetDir, 'gsd-statusline.js', hookOpts)` → `buildHookCommand(targetDir, 'brief-statusline.js', hookOpts)` | |
| 6063 | `buildHookCommand(targetDir, 'gsd-check-update.js', hookOpts)` → `buildHookCommand(targetDir, 'brief-check-update.js', hookOpts)` | |
| 6066 | `buildHookCommand(targetDir, 'gsd-context-monitor.js', hookOpts)` → `buildHookCommand(targetDir, 'brief-context-monitor.js', hookOpts)` | |
| 6069 | `buildHookCommand(targetDir, 'gsd-prompt-guard.js', hookOpts)` → `buildHookCommand(targetDir, 'brief-prompt-guard.js', hookOpts)` | |
| 6072 | `buildHookCommand(targetDir, 'gsd-read-guard.js', hookOpts)` → `buildHookCommand(targetDir, 'brief-read-guard.js', hookOpts)` | |
| 6075 | `buildHookCommand(targetDir, 'gsd-read-injection-scanner.js', hookOpts)` → `buildHookCommand(targetDir, 'brief-read-injection-scanner.js', hookOpts)` | |
| 6106 | `const checkUpdateFile = path.join(targetDir, 'hooks', 'gsd-check-update.js')` → `path.join(targetDir, 'hooks', 'brief-check-update.js')` | |
| 6118 | `console.warn(... Skipped update check hook — gsd-check-update.js not found ...)` → replace `gsd-check-update.js` → `brief-check-update.js` | |
| 6130 | `path.join(targetDir, 'hooks', 'gsd-context-monitor.js')` → `brief-context-monitor.js` | |
| 6144 | `console.warn(... gsd-context-monitor.js not found ...)` → replace `gsd-context-monitor.js` → `brief-context-monitor.js` | |
| 6178 | `path.join(targetDir, 'hooks', 'gsd-prompt-guard.js')` → `brief-prompt-guard.js` | |
| 6192 | `console.warn(... gsd-prompt-guard.js not found ...)` → replace | |
| 6202 | `path.join(targetDir, 'hooks', 'gsd-read-guard.js')` → `brief-read-guard.js` | |
| 6216 | `console.warn(... gsd-read-guard.js not found ...)` → replace | |
| 6226 | `path.join(targetDir, 'hooks', 'gsd-read-injection-scanner.js')` → `brief-read-injection-scanner.js` | |
| 6240 | `console.warn(... gsd-read-injection-scanner.js not found ...)` → replace | |
| 6252 | `buildHookCommand(targetDir, 'gsd-workflow-guard.js', hookOpts)` → `brief-workflow-guard.js` | |
| 6258 | `path.join(targetDir, 'hooks', 'gsd-workflow-guard.js')` → `brief-workflow-guard.js` | |
| 6272 | `console.warn(... gsd-workflow-guard.js not found ...)` → replace | |
| 6277 | `buildHookCommand(targetDir, 'gsd-validate-commit.sh', hookOpts)` → `brief-validate-commit.sh` | |
| 6285 | `path.join(targetDir, 'hooks', 'gsd-validate-commit.sh')` → `brief-validate-commit.sh` | |
| 6299 | `console.warn(... gsd-validate-commit.sh not found ...)` → replace | |
| 6304 | `buildHookCommand(targetDir, 'gsd-session-state.sh', hookOpts)` → `brief-session-state.sh` | |
| 6309 | `path.join(targetDir, 'hooks', 'gsd-session-state.sh')` → `brief-session-state.sh` | |
| 6321 | `console.warn(... gsd-session-state.sh not found ...)` → replace | |
| 6326 | `buildHookCommand(targetDir, 'gsd-phase-boundary.sh', hookOpts)` → `brief-phase-boundary.sh` | |
| 6331 | `path.join(targetDir, 'hooks', 'gsd-phase-boundary.sh')` → `brief-phase-boundary.sh` | |
| 6345 | `console.warn(... gsd-phase-boundary.sh not found ...)` → replace | |

**Category P-D — DO NOT rewrite:**

| Line | Pattern | Rationale |
|------|---------|-----------|
| 4303 | `'gsd-notify.sh',  // Removed in v1.6.x` | Inside FILES_TO_REMOVE_ON_UPGRADE list; the pre-fork GSD filename is the cleanup target — renaming would break upgrade-from-GSD cleanup |
| 4305 | `'gsd-intel-index.js',  // Removed in v1.9.2` | Same rationale |
| 4306 | `'gsd-intel-session.js',  // Removed in v1.9.2` | Same rationale |
| 4307 | `'gsd-intel-prune.js',  // Removed in v1.9.2` | Same rationale |

After applying every rewrite, run `node -c bin/install.js` to assert parse-ability.

**Note on line drift:** The grep output in `/tmp/plan08-pre-install-hooks.txt` is the authoritative set of edit targets. If the line number in the table above differs from the grep output by ±3, trust the grep output. If a line that appears in the table does NOT appear in the grep output (means the pre-grep found fewer sites than expected), confirm whether the line still exists via `sed -n '${line_no}p' bin/install.js` — if it's already been rewritten (maybe by Plan 07 residuals or a race with another executor), skip and note in audit.
  </action>
  <verify>
    <automated>cd /Users/agent/GSD-for-Business && test $(grep -cE "'gsd-(statusline|check-update|check-update-worker|context-monitor|prompt-guard|read-guard|read-injection-scanner|workflow-guard|session-state|validate-commit|phase-boundary)\.(js|sh)'" bin/install.js) -le 4 && test $(grep -cE "'brief-(statusline|check-update|check-update-worker|context-monitor|prompt-guard|read-guard|read-injection-scanner|workflow-guard|session-state|validate-commit|phase-boundary)\.(js|sh)'" bin/install.js) -ge 20 && grep -c "'brief-session-state.sh', 'brief-validate-commit.sh', 'brief-phase-boundary.sh'" bin/install.js | grep -qE "^1$" && node -c bin/install.js</automated>
  </verify>
  <acceptance_criteria>
    - `grep -cE "'gsd-(statusline|check-update|check-update-worker|context-monitor|prompt-guard|read-guard|read-injection-scanner|workflow-guard|session-state|validate-commit|phase-boundary)\.(js|sh)'" bin/install.js` returns ≤ 4 (the 4 Category P-D historical-cleanup entries at lines 4303, 4305, 4306, 4307 remain — all others rewritten)
    - `grep -cE "'brief-(statusline|check-update|check-update-worker|context-monitor|prompt-guard|read-guard|read-injection-scanner|workflow-guard|session-state|validate-commit|phase-boundary)\.(js|sh)'" bin/install.js` returns ≥ 20
    - `grep -c "'brief-session-state.sh', 'brief-validate-commit.sh', 'brief-phase-boundary.sh'" bin/install.js` returns 1 (expectedShHooks array rewritten)
    - `grep -c "'.cache', 'brief', 'brief-update-check.json'" bin/install.js` returns 1 (cache path rewritten)
    - `grep -c "'.cache', 'gsd', 'gsd-update-check.json'" bin/install.js` returns 0
    - `grep -c "briefHooks" bin/install.js` returns ≥ 1 (variable renamed from gsdHooks)
    - `node -c bin/install.js` exits 0
  </acceptance_criteria>
  <done>
    bin/install.js contains zero gsd-* hook-filename literals outside the 4 Category P-D historical entries. The installer can locate every brief-* hook at runtime.
  </done>
</task>

<task type="auto">
  <name>Task 3b: Rewrite bin/install.js `.includes('gsd-*')` hook-detection sites (19 sites — Category P-C dual-prefix) [REVISION-1 ADDITION per BLOCKER 1]</name>
  <files>bin/install.js</files>
  <read_first>
    - /tmp/plan08-pre-install-prefixes.txt (Task 1's enumeration — includes the `.includes('gsd-*')` sub-section once Task 1's grep is extended; if Task 1's output omits this sub-section, re-run: `grep -nE "\.includes\(['\"]gsd-" /Users/agent/GSD-for-Business/bin/install.js > /tmp/plan08-pre-install-includes.txt`)
    - bin/install.js lines 4800–4820 (lines 4805, 4814, 4815, 4816, 4817, 4818 — 6 sites)
    - bin/install.js lines 5975–5990 (lines 5979, 5984 — 2 sites)
    - bin/install.js lines 6090–6340 (lines 6099, 6127, 6148, 6155, 6175, 6199, 6223, 6255, 6280, 6307, 6329 — 11 sites, one per Claude-Code hook-matcher branch)
  </read_first>
  <action>
These 19 `.includes('gsd-…')` call sites detect EXISTING hook entries in settings.json / config.toml during (a) upgrade from pre-BRIEF GSD installs (legacy `gsd-*` hook commands), and (b) re-install over a prior BRIEF install (fresh `brief-*` hook commands). Because BOTH prefix families may co-exist on a user's machine during a migration, each site MUST be rewritten to the Category P-C dual-prefix form:

  ```js
  cmd.includes('brief-<name>') || cmd.includes('gsd-<name>')
  ```

**Per-line rewrite table — 19 sites:**

| Line | Current (verbatim per 2026-04-18 grep) | Rewrite |
|------|----------------------------------------|---------|
| 4805 | `settings.statusLine.command.includes('gsd-statusline'))` | `(settings.statusLine.command.includes('brief-statusline') \|\| settings.statusLine.command.includes('gsd-statusline')))` |
| 4814 | `cmd && (cmd.includes('gsd-check-update') \|\| cmd.includes('gsd-statusline') \|\|` | `cmd && (cmd.includes('brief-check-update') \|\| cmd.includes('gsd-check-update') \|\| cmd.includes('brief-statusline') \|\| cmd.includes('gsd-statusline') \|\|` |
| 4815 | `cmd.includes('gsd-session-state') \|\| cmd.includes('gsd-context-monitor') \|\|` | `cmd.includes('brief-session-state') \|\| cmd.includes('gsd-session-state') \|\| cmd.includes('brief-context-monitor') \|\| cmd.includes('gsd-context-monitor') \|\|` |
| 4816 | `cmd.includes('gsd-phase-boundary') \|\| cmd.includes('gsd-prompt-guard') \|\|` | `cmd.includes('brief-phase-boundary') \|\| cmd.includes('gsd-phase-boundary') \|\| cmd.includes('brief-prompt-guard') \|\| cmd.includes('gsd-prompt-guard') \|\|` |
| 4817 | `cmd.includes('gsd-read-guard') \|\| cmd.includes('gsd-read-injection-scanner') \|\|` | `cmd.includes('brief-read-guard') \|\| cmd.includes('gsd-read-guard') \|\| cmd.includes('brief-read-injection-scanner') \|\| cmd.includes('gsd-read-injection-scanner') \|\|` |
| 4818 | `cmd.includes('gsd-validate-commit') \|\| cmd.includes('gsd-workflow-guard'));` | `cmd.includes('brief-validate-commit') \|\| cmd.includes('gsd-validate-commit') \|\| cmd.includes('brief-workflow-guard') \|\| cmd.includes('gsd-workflow-guard'));` |
| 5979 | `if (configContent.includes('gsd-update-check')) {` | `if (configContent.includes('brief-update-check') \|\| configContent.includes('gsd-update-check')) {` |
| 5984 | `if (hasEnabledCodexHooksFeature(configContent) && !configContent.includes('gsd-check-update')) {` | `if (hasEnabledCodexHooksFeature(configContent) && !(configContent.includes('brief-check-update') \|\| configContent.includes('gsd-check-update'))) {` |
| 6099 | `entry.hooks && entry.hooks.some(h => h.command && h.command.includes('gsd-check-update'))` | `entry.hooks && entry.hooks.some(h => h.command && (h.command.includes('brief-check-update') \|\| h.command.includes('gsd-check-update')))` |
| 6127 | `.some(h => h.command && h.command.includes('gsd-context-monitor'))` | `.some(h => h.command && (h.command.includes('brief-context-monitor') \|\| h.command.includes('gsd-context-monitor')))` |
| 6148 | `if (entry.hooks && entry.hooks.some(h => h.command && h.command.includes('gsd-context-monitor'))) {` | `if (entry.hooks && entry.hooks.some(h => h.command && (h.command.includes('brief-context-monitor') \|\| h.command.includes('gsd-context-monitor')))) {` |
| 6155 | `if (h.command && h.command.includes('gsd-context-monitor') && !h.timeout) {` | `if (h.command && (h.command.includes('brief-context-monitor') \|\| h.command.includes('gsd-context-monitor')) && !h.timeout) {` |
| 6175 | `.some(h => h.command && h.command.includes('gsd-prompt-guard'))` | `.some(h => h.command && (h.command.includes('brief-prompt-guard') \|\| h.command.includes('gsd-prompt-guard')))` |
| 6199 | `.some(h => h.command && h.command.includes('gsd-read-guard'))` | `.some(h => h.command && (h.command.includes('brief-read-guard') \|\| h.command.includes('gsd-read-guard')))` |
| 6223 | `.some(h => h.command && h.command.includes('gsd-read-injection-scanner'))` | `.some(h => h.command && (h.command.includes('brief-read-injection-scanner') \|\| h.command.includes('gsd-read-injection-scanner')))` |
| 6255 | `.some(h => h.command && h.command.includes('gsd-workflow-guard'))` | `.some(h => h.command && (h.command.includes('brief-workflow-guard') \|\| h.command.includes('gsd-workflow-guard')))` |
| 6280 | `.some(h => h.command && h.command.includes('gsd-validate-commit'))` | `.some(h => h.command && (h.command.includes('brief-validate-commit') \|\| h.command.includes('gsd-validate-commit')))` |
| 6307 | `.some(h => h.command && h.command.includes('gsd-session-state'))` | `.some(h => h.command && (h.command.includes('brief-session-state') \|\| h.command.includes('gsd-session-state')))` |
| 6329 | `.some(h => h.command && h.command.includes('gsd-phase-boundary'))` | `.some(h => h.command && (h.command.includes('brief-phase-boundary') \|\| h.command.includes('gsd-phase-boundary')))` |

**Why dual-prefix instead of single rewrite:** if we rewrote these to `brief-*` only, a user upgrading from pre-BRIEF GSD would have settings.json entries with `gsd-*` command strings that the installer would fail to detect → duplicate hook install OR silent skip. If we left them as `gsd-*` only, fresh BRIEF installs (which write `brief-*` hook commands per Task 3) would not be detected on re-install → same failure mode. Both families MUST be detected.

**Contrast with Task 3 (filename literals):** Task 3's hook-filename literals (`'brief-statusline.js'` etc.) are WRITTEN during install — so they must be the fresh-install name. These `.includes(...)` sites are READ during upgrade-detection — so they must accept both historical prefix families.

After applying every rewrite, run:

```bash
node -c /Users/agent/GSD-for-Business/bin/install.js
```

**Self-check greps:**

```bash
# All 19 sites now have dual-prefix:
grep -cE "\.includes\('brief-[a-z-]+'\) \|\| .*\.includes\('gsd-[a-z-]+'\)" /Users/agent/GSD-for-Business/bin/install.js  # expect ≥ 19
# No remaining single-prefix gsd-* includes in the detection sites:
grep -cE "\.includes\('gsd-[a-z-]+'\)" /Users/agent/GSD-for-Business/bin/install.js                                              # expect ≥ 19 (each dual-prefix contains one gsd-* — this is the KEEP half of the OR)
grep -cE "\.includes\('brief-[a-z-]+'\)" /Users/agent/GSD-for-Business/bin/install.js                                            # expect ≥ 19 (each dual-prefix contains one brief-*)
```

If any of the 19 line numbers above drift by ±3 from the grep output, trust the grep output and re-read the surrounding context before editing.
  </action>
  <verify>
    <automated>cd /Users/agent/GSD-for-Business && test $(grep -cE "\.includes\('brief-[a-z-]+'\) \|\| .*\.includes\('gsd-[a-z-]+'\)" bin/install.js) -ge 19 && test $(grep -cE "\.includes\('brief-[a-z-]+'\)" bin/install.js) -ge 19 && node -c bin/install.js</automated>
  </verify>
  <acceptance_criteria>
    - `grep -cE "\.includes\('brief-[a-z-]+'\) \|\| .*\.includes\('gsd-[a-z-]+'\)" bin/install.js` returns ≥ 19 (every former single-prefix site is now dual-prefix)
    - `grep -cE "\.includes\('brief-[a-z-]+'\)" bin/install.js` returns ≥ 19 (the brief- half of each OR is present)
    - `grep -cE "\.includes\('gsd-[a-z-]+'\)" bin/install.js` returns ≥ 19 (the gsd- half of each OR preserved for upgrade-from-GSD detection)
    - `node -c bin/install.js` exits 0
  </acceptance_criteria>
  <done>
    All 19 `.includes('gsd-…')` hook-detection sites are dual-prefix (brief-* OR gsd-*). Upgrade from pre-BRIEF GSD installs still detects hook entries for clean re-install; fresh BRIEF installs also detect their own hooks on re-install. This closes BLOCKER 1 from Plan 08 revision-1 review.
  </done>
</task>

<task type="auto">
  <name>Task 4: Rewrite bin/install.js gsd-* prefix residues (P-A rewrite / P-B keep / P-C dual-prefix / P-D unchanged)</name>
  <files>bin/install.js</files>
  <read_first>
    - /tmp/plan08-pre-install-prefixes.txt (Task 1's enumeration — 35+ sites across 4 sub-patterns)
    - /tmp/plan08-pre-install-output-names.txt (2 constants + 1 cache path)
    - bin/install.js lines 3000–3010 (line 3006 startsWith in installCodexConfig — P-C DUAL-PREFIX)
    - bin/install.js lines 3560–3575 (line 3566 JSDoc — P-A rewrite)
    - bin/install.js lines 3615–3630 (line 3622 default parameter — P-A rewrite to 'brief-')
    - bin/install.js lines 3965–3985 (line 3973 JSDoc — P-A rewrite)
    - bin/install.js lines 4035–4050 (line 4041 JSDoc — P-A rewrite)
    - bin/install.js lines 4478–4510 (uninstall() function header + line 4496 — P-C DUAL-PREFIX)
    - bin/install.js lines 4505–4530 (lines 4510, 4528 — P-C DUAL-PREFIX)
    - bin/install.js lines 4558–4570 (line 4563 — P-C DUAL-PREFIX)
    - bin/install.js lines 4590–4620 (lines 4596, 4612 — P-C DUAL-PREFIX)
    - bin/install.js lines 4658–4670 (line 4663 — P-C DUAL-PREFIX)
    - bin/install.js lines 4742–4758 (line 4748 — P-C DUAL-PREFIX, agents removal in uninstall)
    - bin/install.js lines 5205–5220 (lines 5212, 5213 — P-A rewrite constants)
    - bin/install.js lines 5270–5320 (lines 5276, 5292, 5311 — P-C DUAL-PREFIX inside writeManifest)
    - bin/install.js lines 5485–5540 (lines 5491, 5493, 5501, 5511, 5514, 5526, 5529, 5541 — fresh-install path: 5491/5501/5511/5526 = P-A prefix-arg rewrite; 5493/5514/5529 = P-A startsWith rewrite to 'brief-')
    - bin/install.js lines 5540–5610 (lines 5541, 5551, 5561, 5571, 5581, 5584, 5604 — continued P-A)
    - bin/install.js lines 5625–5680 (lines 5630, 5633, 5671 — 5630 P-A prefix-arg; 5633 P-A startsWith rewrite; 5671 P-B KEEP with comment)
    - bin/install.js lines 5695–5710 (line 5703 — P-B KEEP old-agent cleanup)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/07-GAP-CLOSURE-PARTIAL-AUDIT.md §5 (Plan 07's forensic breakdown — Plan 08 builds on this)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md D-07 (no aliases — governs P-A rewrite decisions)
  </read_first>
  <action>
Apply the per-line categorization table below. Each edit uses the `Edit` tool with 2–3 lines of context to guarantee uniqueness. The categories map to:

- **P-A (fresh-install output — rewrite to 'brief')**: the installer's code path that CREATES files must produce `brief-*` names per D-07
- **P-B (legacy-only detection — keep as 'gsd-' with an inline comment)**: code that ONLY exists to detect pre-BRIEF GSD artifacts for cleanup
- **P-C (uninstall/manifest dual-prefix — rewrite to `startsWith('brief-') || startsWith('gsd-')`)**: code that must handle both fresh-BRIEF-installed files AND legacy-GSD-installed files
- **P-D (historical removal list — unchanged)**: handled in Task 3, not re-visited here

**Per-line table — bin/install.js:**

| Line  | Category | Old pattern | New pattern | Rationale |
|-------|----------|-------------|-------------|-----------|
| 3006  | P-C DUAL-PREFIX | `.filter(f => f.startsWith('gsd-') && f.endsWith('.md'))` | `.filter(f => (f.startsWith('brief-') \|\| f.startsWith('gsd-')) && f.endsWith('.md'))` | installCodexConfig reads agent dir for both fresh brief-* agents and upgrade-from-GSD gsd-* agents |
| 3566  | P-A | JSDoc `@param {string} prefix - Prefix for filenames (e.g., 'gsd')` | `@param {string} prefix - Prefix for filenames (e.g., 'brief')` | example in documentation |
| 3622  | P-A | `function listCodexSkillNames(skillsDir, prefix = 'gsd-')` | `function listCodexSkillNames(skillsDir, prefix = 'brief-')` | default used by fresh-install verify; callers needing legacy detection must pass `'gsd-'` explicitly |
| 3973  | P-A | JSDoc `@param {string} prefix - Skill name prefix (e.g. 'gsd')` | `@param {string} prefix - Skill name prefix (e.g. 'brief')` | |
| 4041  | P-A | JSDoc `@param {string} prefix - Skill name prefix (e.g. 'gsd')` | `@param {string} prefix - Skill name prefix (e.g. 'brief')` | |
| 4496  | P-C DUAL-PREFIX | `if (file.startsWith('gsd-') && file.endsWith('.md'))` | `if ((file.startsWith('brief-') \|\| file.startsWith('gsd-')) && file.endsWith('.md'))` | uninstall() removes command/*.md — must remove both prefix families |
| 4510  | P-C DUAL-PREFIX | `if (entry.isDirectory() && entry.name.startsWith('gsd-'))` | `if (entry.isDirectory() && (entry.name.startsWith('brief-') \|\| entry.name.startsWith('gsd-')))` | skills/ dir removal in uninstall |
| 4528  | P-C DUAL-PREFIX | `if (file.startsWith('gsd-') && file.endsWith('.toml'))` | `if ((file.startsWith('brief-') \|\| file.startsWith('gsd-')) && file.endsWith('.toml'))` | Codex agent toml files |
| 4563  | P-C DUAL-PREFIX | same as 4510 | same rewrite | Copilot skills |
| 4596  | P-C DUAL-PREFIX | same as 4510 | same rewrite | Antigravity skills |
| 4612  | P-C DUAL-PREFIX | same as 4510 | same rewrite | Qwen skills |
| 4663  | P-C DUAL-PREFIX | same as 4510 | same rewrite | Claude Code global skills |
| 4748  | P-C DUAL-PREFIX | `if (file.startsWith('gsd-') && file.endsWith('.md'))` | dual-prefix rewrite | uninstall() removes agents/*.md |
| 5212  | P-A | `const PATCHES_DIR_NAME = 'gsd-local-patches';` | `const PATCHES_DIR_NAME = 'brief-local-patches';` | fresh-install output dir |
| 5213  | P-A | `const MANIFEST_NAME = 'gsd-file-manifest.json';` | `const MANIFEST_NAME = 'brief-file-manifest.json';` | fresh-install output file |
| 5276  | P-C DUAL-PREFIX | `if (file.startsWith('gsd-') && file.endsWith('.md'))` | dual-prefix rewrite | writeManifest indexes agents — must index both fresh and legacy |
| 5292  | P-C DUAL-PREFIX | `if (file.startsWith('gsd-') && file.endsWith('.md'))` | dual-prefix rewrite | writeManifest indexes command/*.md |
| 5311  | P-C DUAL-PREFIX | `if (file.startsWith('gsd-') && (file.endsWith('.js') \|\| file.endsWith('.sh')))` | `if ((file.startsWith('brief-') \|\| file.startsWith('gsd-')) && (file.endsWith('.js') \|\| file.endsWith('.sh')))` | writeManifest indexes hooks |
| 5491  | P-A | `copyFlattenedCommands(gsdSrc, commandDir, 'gsd', pathPrefix, runtime);` | `copyFlattenedCommands(gsdSrc, commandDir, 'brief', pathPrefix, runtime);` | fresh-install prefix arg (OpenCode/Kilo) |
| 5493  | P-A | `const count = fs.readdirSync(commandDir).filter(f => f.startsWith('gsd-')).length;` | `const count = fs.readdirSync(commandDir).filter(f => f.startsWith('brief-')).length;` | fresh-install verify count — must match the prefix we just passed |
| 5501  | P-A | `copyCommandsAsCodexSkills(gsdSrc, skillsDir, 'gsd', pathPrefix, runtime);` | rewrite prefix arg to 'brief' | |
| 5511  | P-A | `copyCommandsAsCopilotSkills(gsdSrc, skillsDir, 'gsd', isGlobal);` | rewrite prefix arg to 'brief' | |
| 5514  | P-A | `.filter(e => e.isDirectory() && e.name.startsWith('gsd-')).length;` | `.filter(e => e.isDirectory() && e.name.startsWith('brief-')).length;` | fresh-install skill count verify (Copilot) |
| 5526  | P-A | `copyCommandsAsAntigravitySkills(gsdSrc, skillsDir, 'gsd', isGlobal);` | rewrite prefix arg | |
| 5529  | P-A | skill count verify | `.startsWith('brief-')` rewrite | Antigravity count verify |
| 5541  | P-A | `copyCommandsAsCursorSkills(gsdSrc, skillsDir, 'gsd', ...)` | rewrite | |
| 5551  | P-A | `copyCommandsAsWindsurfSkills(gsdSrc, skillsDir, 'gsd', ...)` | rewrite | |
| 5561  | P-A | `copyCommandsAsAugmentSkills(gsdSrc, skillsDir, 'gsd', ...)` | rewrite | |
| 5571  | P-A | `copyCommandsAsTraeSkills(gsdSrc, skillsDir, 'gsd', ...)` | rewrite | |
| 5581  | P-A | `copyCommandsAsClaudeSkills(gsdSrc, skillsDir, 'gsd', ...)` (Qwen branch) | rewrite | |
| 5584  | P-A | skill count verify (Qwen) | `.startsWith('brief-')` rewrite | |
| 5604  | P-A | `copyCommandsAsCodebuddySkills(gsdSrc, skillsDir, 'gsd', ...)` | rewrite | |
| 5630  | P-A | `copyCommandsAsClaudeSkills(gsdSrc, skillsDir, 'gsd', ...)` (Claude-global branch) | rewrite | |
| 5633  | P-A | skill count verify (Claude-global) | `.startsWith('brief-')` rewrite | |
| 5671  | P-B KEEP (add comment) | `.filter(e => e.isDirectory() && e.name.startsWith('gsd-'));` (inside Claude-local stale-skills cleanup) | Keep exactly as `.filter(e => e.isDirectory() && e.name.startsWith('gsd-'))` but PREPEND a one-line comment above the statement: `// Legacy-only cleanup: remove gsd-*/ skills left over from a previous Claude-global install (v1.9.2-era) on the same targetDir. D-07 no-aliases preserves detection-only for upgrade paths.` | this block specifically removes legacy skill dirs; dual-prefix would incorrectly remove fresh brief-* skills that a user intentionally installed |
| 5703  | P-B KEEP (add comment) | `if (file.startsWith('gsd-') && file.endsWith('.md'))` (inside fresh-install old-agent cleanup loop) | Keep, but PREPEND one-line comment above the `for` loop: `// Legacy-only cleanup: remove pre-BRIEF agents/gsd-*.md before copying fresh agents/brief-*.md. D-07 no-aliases preserves detection-only for upgrade paths.` | this block specifically removes legacy gsd-* agents before overwriting with brief-* — rewriting to dual-prefix would delete the brief-* agents we're about to copy |

After all edits, run:
```bash
node -c /Users/agent/GSD-for-Business/bin/install.js
```
to assert parse-ability.

**Self-check after edits:**
```bash
grep -c "startsWith('brief-') || " /Users/agent/GSD-for-Business/bin/install.js  # expect ≥ 12 (11 P-C sites + potentially the 3006 line)
grep -c "startsWith('gsd-')" /Users/agent/GSD-for-Business/bin/install.js        # expect ≤ 14 (12 P-C dual-prefix OR-arms containing `…startsWith('gsd-')` as second arm + 2 P-B legacy-only sites at 5671 and 5703)
grep -c "'brief-local-patches'" /Users/agent/GSD-for-Business/bin/install.js     # expect 1
grep -c "'brief-file-manifest.json'" /Users/agent/GSD-for-Business/bin/install.js # expect 1
grep -cE "copyCommandsAs.*'brief'," /Users/agent/GSD-for-Business/bin/install.js  # expect ≥ 10 (all non-copyFlattenedCommands P-A sites)
grep -c "copyFlattenedCommands(gsdSrc, commandDir, 'brief'," /Users/agent/GSD-for-Business/bin/install.js  # expect 1
```

If any P-B site (5671, 5703) does NOT have an inline `// Legacy-only cleanup: ...` comment above it at the end of Task 4, add the comment.
  </action>
  <verify>
    <automated>cd /Users/agent/GSD-for-Business && test $(grep -c "startsWith('gsd-')" bin/install.js) -le 14 && test $(grep -c "startsWith('brief-')" bin/install.js) -ge 12 && grep -c "'brief-local-patches'" bin/install.js | grep -qE "^1$" && grep -c "'brief-file-manifest.json'" bin/install.js | grep -qE "^1$" && grep -c "'gsd-local-patches'" bin/install.js | grep -qE "^0$" && grep -c "'gsd-file-manifest.json'" bin/install.js | grep -qE "^0$" && test $(grep -cE "copyCommandsAs[A-Z][a-zA-Z]+Skills\(gsdSrc, skillsDir, 'gsd'," bin/install.js) -eq 0 && test $(grep -c "prefix = 'gsd-'" bin/install.js) -eq 0 && test $(grep -cE "prefix\\s*=\\s*'gsd'" bin/install.js) -eq 0 && test $(grep -c "prefix = 'brief-'" bin/install.js) -ge 1 && test $(grep -c "// Legacy-only cleanup" bin/install.js) -ge 2 && node -c bin/install.js</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "startsWith('gsd-')" bin/install.js` returns ≤ 14 (12 P-C dual-prefix OR-arms + 2 P-B legacy-only sites at lines 5671, 5703 — the OR-arms `…|| foo.startsWith('gsd-')` literally contain the substring)
    - `grep -c "startsWith('brief-')" bin/install.js` returns ≥ 12 (11 P-C dual-prefix sites + 1 or more P-A single-prefix verify sites)
    - `grep -cE "startsWith\('brief-'\)\s*\|\|\s*\w+\.startsWith\('gsd-'\)" bin/install.js` returns ≥ 10 (dual-prefix P-C pattern present)
    - `grep -c "'brief-local-patches'" bin/install.js` returns 1 (PATCHES_DIR_NAME rewritten)
    - `grep -c "'brief-file-manifest.json'" bin/install.js` returns 1 (MANIFEST_NAME rewritten)
    - `grep -c "'gsd-local-patches'" bin/install.js` returns 0
    - `grep -c "'gsd-file-manifest.json'" bin/install.js` returns 0
    - `grep -cE "copyCommandsAs[A-Z][a-zA-Z]+Skills\(gsdSrc, skillsDir, 'gsd'," bin/install.js` returns 0 (no fresh-install call site passes 'gsd' prefix)
    - `grep -c "prefix = 'gsd-'" bin/install.js` returns 0
    - `grep -cE "prefix\\s*=\\s*'gsd'" bin/install.js` returns 0 (**REVISION-1 addition per WARNING 6:** guards against both `prefix = 'gsd'` no-hyphen AND any future `prefix = 'gsd'` no-suffix variant the codebase may introduce)
    - `grep -c "prefix = 'brief-'" bin/install.js` returns ≥ 1 (listCodexSkillNames default)
    - `grep -c "// Legacy-only cleanup" bin/install.js` returns ≥ 2 (P-B inline comments added)
    - `node -c bin/install.js` exits 0
  </acceptance_criteria>
  <done>
    All fresh-install code paths produce brief-* output (D-07 no aliases honored). Uninstall/manifest code paths handle both prefix families via dual-prefix checks. The 2 legitimate legacy-only P-B sites carry explanatory inline comments.
  </done>
</task>

<task type="auto">
  <name>Task 4b: Rewrite user-visible `gsd-*` output strings in bin/install.js (BLOCKER 2 — D-07 violations: $gsd-new-project, gsd-pristine, $gsd-reapply-patches, /gsd:/ normalizers, Codex template literals, agents.gsd-* regex) [REVISION-1 ADDITION]</name>
  <files>bin/install.js</files>
  <read_first>
    - bin/install.js lines 877–882 (line 879 comment + line 880 `c.replace(/gsd:/g, 'gsd-')`)
    - bin/install.js lines 920–928 (line 924 JSDoc-style comment)
    - bin/install.js lines 1000–1010 (line 1004 comment + line 1005 replace call)
    - bin/install.js lines 1115–1122 (line 1117 comment + line 1119 `c.replace(/gsd:/gi, 'gsd-')`)
    - bin/install.js lines 1234–1240 (line 1236 comment + line 1237 replace call)
    - bin/install.js lines 1355–1360 (line 1357 replace call)
    - bin/install.js lines 1645–1660 (lines 1649, 1655 Codex template literals)
    - bin/install.js lines 1825–1835 (line 1829 `agents.gsd-` regex)
    - bin/install.js lines 2525–2532 (line 2528 `section.path.startsWith('agents.gsd-')`)
    - bin/install.js lines 4235–4250 (lines 4239, 4247 replace calls)
    - bin/install.js lines 5320–5340 (line 5325 doc comment + line 5336 `gsd-pristine` path.join)
    - bin/install.js lines 5395–5405 (lines 5398, 5400 `$gsd-reapply-patches` + Cursor text)
    - bin/install.js lines 6430–6440 (lines 6434, 6437 `$gsd-new-project` + Cursor text)
  </read_first>
  <action>
These sites emit `gsd-*` strings to USER-VISIBLE outputs during a fresh BRIEF install, creating direct **D-07 no-aliases violations**: fresh users see prompts to invoke `$gsd-new-project`, BRIEF creates `.planning/gsd-pristine/` directories, etc. Rewrite each site per the per-line table below.

**Category P-A sites (fresh-install output — MUST rewrite to `brief-*`):**

| Line | Current (verbatim per 2026-04-18 grep) | Rewrite | Rationale |
|------|----------------------------------------|---------|-----------|
| 1649 | `return \`$gsd-\${String(commandName).toLowerCase()}\`;` | `return \`$brief-\${String(commandName).toLowerCase()}\`;` | Codex command template literal — fresh BRIEF installs must emit `$brief-<cmd>` not `$gsd-<cmd>` |
| 1655 | `return \`$gsd-\${String(commandName).toLowerCase()}\`;` | `return \`$brief-\${String(commandName).toLowerCase()}\`;` | second instance of same pattern (different branch of `getCommandPrefix` or similar) |
| 5325 | ` * Also saves pristine copies (from manifest) to gsd-pristine/ to enable` | ` * Also saves pristine copies (from manifest) to brief-pristine/ to enable` | JSDoc describing the directory the function creates — directory name changes per line 5336 |
| 5336 | `const pristineDir = path.join(configDir, 'gsd-pristine');` | `const pristineDir = path.join(configDir, 'brief-pristine');` | fresh-install output directory — D-07 governs this directly |
| 5398 | `? '$gsd-reapply-patches'` | `? '$brief-reapply-patches'` | Codex command instruction string |
| 5400 | `? 'gsd-reapply-patches (mention the skill name)'` | `? 'brief-reapply-patches (mention the skill name)'` | Cursor skill instruction string |
| 6434 | `if (runtime === 'codex') command = '$gsd-new-project';` | `if (runtime === 'codex') command = '$brief-new-project';` | Codex command instruction |
| 6437 | `if (runtime === 'cursor') command = 'gsd-new-project (mention the skill name)';` | `if (runtime === 'cursor') command = 'brief-new-project (mention the skill name)';` | Cursor skill instruction |

**Category P-C sites (dual-prefix — upgrade-detection that must accept both prefix families):**

| Line | Current | Rewrite | Rationale |
|------|---------|---------|-----------|
| 1829 | `return content.replace(/^\[agents\.gsd-[^\]]+\]\n(?:(?!\[)[^\n]*\n?)*/gm, '');` | `return content.replace(/^\[agents\.(brief-\|gsd-)[^\]]+\]\n(?:(?!\[)[^\n]*\n?)*/gm, '');` | Strips `[agents.brief-*]` + `[agents.gsd-*]` sections from Codex config.toml during uninstall — must handle both prefix families |
| 2528 | `section.path.startsWith('agents.gsd-') \|\|` | `section.path.startsWith('agents.brief-') \|\| section.path.startsWith('agents.gsd-') \|\|` | Filter inside config.toml iteration — dual-prefix per P-C pattern |
| 1861 | `  // Remove [agents.gsd-*] sections (from header to next section or EOF)` | `  // Remove [agents.brief-*] and [agents.gsd-*] sections (from header to next section or EOF)` | Stale comment after line 1829 regex rewrite — the `stripCodexGsdAgentSections()` function now strips BOTH `[agents.brief-*]` AND `[agents.gsd-*]` TOML sections, so the comment must name both prefix families. INFO 6 from checker iteration 2. |

**Category P-A (input-normalizer `c.replace(/gsd:/...`) — revision-1 decision: Option α (replace `/gsd:/` with `/brief:/`)):**

Per BLOCKER 2's α/β/γ analysis, **Option α** is selected: fresh BRIEF users type `/brief:foo`, not `/gsd:foo`; the `/gsd:/` normalizer legacy-support would violate D-07 "no aliases" by keeping the GSD input-vocabulary active. All 7 `.replace()` sites + their 5 adjacent comments get rewritten:

| Line | Current (verbatim) | Rewrite |
|------|--------------------|---------|
| 879  | `  // CONV-07: Command name conversion (all gsd: references → gsd-)` | `  // CONV-07: Command name conversion (all brief: references → brief-)` |
| 880  | `  c = c.replace(/gsd:/g, 'gsd-');` | `  c = c.replace(/brief:/g, 'brief-');` |
| 924  | ` * convert name from gsd:xxx to gsd-xxx format.` | ` * convert name from brief:xxx to brief-xxx format.` |
| 1004 | `  // Command name conversion (all gsd: references → gsd-)` | `  // Command name conversion (all brief: references → brief-)` |
| 1005 | `  c = c.replace(/gsd:/g, 'gsd-');` | `  c = c.replace(/brief:/g, 'brief-');` |
| 1117 | `  // Keep leading "/" for slash commands; only normalize gsd: -> gsd-.` | `  // Keep leading "/" for slash commands; only normalize brief: -> brief-.` |
| 1119 | `  return content.replace(/gsd:/gi, 'gsd-');` | `  return content.replace(/brief:/gi, 'brief-');` |
| 1236 | `  // Keep leading "/" for slash commands; only normalize gsd: -> gsd-.` | `  // Keep leading "/" for slash commands; only normalize brief: -> brief-.` |
| 1237 | `  return content.replace(/gsd:/gi, 'gsd-');` | `  return content.replace(/brief:/gi, 'brief-');` |
| 1357 | `  return content.replace(/gsd:/gi, 'gsd-');` | `  return content.replace(/brief:/gi, 'brief-');` |
| 4239 | `      jsContent = jsContent.replace(/gsd:/gi, 'gsd-');` | `      jsContent = jsContent.replace(/brief:/gi, 'brief-');` |
| 4247 | `      jsContent = jsContent.replace(/gsd:/gi, 'gsd-');` | `      jsContent = jsContent.replace(/brief:/gi, 'brief-');` |

**Verify after edits:**

```bash
# ── P-A user-visible output cleared ──
grep -c "gsd-pristine" /Users/agent/GSD-for-Business/bin/install.js              # expect 0
grep -c "brief-pristine" /Users/agent/GSD-for-Business/bin/install.js            # expect ≥ 2
grep -c '\\\$gsd-new-project' /Users/agent/GSD-for-Business/bin/install.js        # expect 0
grep -c '\\\$brief-new-project' /Users/agent/GSD-for-Business/bin/install.js      # expect ≥ 1
grep -c '\\\$gsd-reapply-patches' /Users/agent/GSD-for-Business/bin/install.js    # expect 0
grep -c '\\\$brief-reapply-patches' /Users/agent/GSD-for-Business/bin/install.js  # expect ≥ 1
grep -c "gsd-new-project (mention the skill name)" /Users/agent/GSD-for-Business/bin/install.js    # expect 0
grep -c "gsd-reapply-patches (mention the skill name)" /Users/agent/GSD-for-Business/bin/install.js # expect 0

# ── P-A input normalizer rewritten to brief: ──
grep -c "c.replace(/gsd:/g" /Users/agent/GSD-for-Business/bin/install.js         # expect 0
grep -c "c.replace(/brief:/g" /Users/agent/GSD-for-Business/bin/install.js       # expect ≥ 2
grep -c "return content.replace(/gsd:/gi" /Users/agent/GSD-for-Business/bin/install.js    # expect 0
grep -c "return content.replace(/brief:/gi" /Users/agent/GSD-for-Business/bin/install.js  # expect ≥ 3
grep -c "jsContent.replace(/gsd:/gi" /Users/agent/GSD-for-Business/bin/install.js    # expect 0
grep -c "jsContent.replace(/brief:/gi" /Users/agent/GSD-for-Business/bin/install.js  # expect ≥ 2

# ── P-A Codex \$gsd-\${...} template literals rewritten ──
grep -cE '\\\$gsd-\\\$\\{commandName' /Users/agent/GSD-for-Business/bin/install.js    # expect 0
grep -cE '\\\$brief-\\\$\\{commandName' /Users/agent/GSD-for-Business/bin/install.js  # expect ≥ 2

# ── P-C agents.gsd-* now dual-prefix ──
grep -cE "agents\\.brief-\|agents\\.gsd-" /Users/agent/GSD-for-Business/bin/install.js    # expect ≥ 2
grep -c "section.path.startsWith('agents.brief-')" /Users/agent/GSD-for-Business/bin/install.js  # expect ≥ 1

# ── Parse check ──
node -c /Users/agent/GSD-for-Business/bin/install.js
```

**Important — BLOCKER 2 resolution traceability:** The decision to pick Option α (not β dual-support nor γ legacy-only) is recorded here because D-07 "no aliases" is a hard user decision. If a future iteration discovers a specific migration path where users legitimately need the `/gsd:` input vocabulary, we can restore it as a **documented legacy-only branch with a deprecation warning**, not as a silent normalizer.

Also update the anchor comment at line 878 if present (example: "CONV-07: Command name conversion (all gsd: references → gsd-)") — the fresh-install behaviour no longer produces `gsd-` outputs, so this comment would be stale. Covered in the table above (lines 879, 1004).
  </action>
  <verify>
    <automated>cd /Users/agent/GSD-for-Business && test $(grep -c "gsd-pristine" bin/install.js) -eq 0 && test $(grep -c "brief-pristine" bin/install.js) -ge 2 && test $(grep -cE '\\\$gsd-\\\$\\{commandName' bin/install.js) -eq 0 && test $(grep -cE '\\\$brief-\\\$\\{commandName' bin/install.js) -ge 2 && test $(grep -c "c.replace(/gsd:/g" bin/install.js) -eq 0 && test $(grep -c "c.replace(/brief:/g" bin/install.js) -ge 2 && test $(grep -c "gsd-new-project (mention the skill name)" bin/install.js) -eq 0 && test $(grep -c "gsd-reapply-patches (mention the skill name)" bin/install.js) -eq 0 && test $(grep -c "section.path.startsWith('agents.brief-')" bin/install.js) -ge 1 && node -c bin/install.js</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "gsd-pristine" bin/install.js` returns 0 (directory name rewritten)
    - `grep -c "brief-pristine" bin/install.js` returns ≥ 2 (line 5325 doc + line 5336 path.join)
    - `grep -cE '\\\$gsd-\\\$\\{commandName' bin/install.js` returns 0 (Codex template literals rewritten)
    - `grep -cE '\\\$brief-\\\$\\{commandName' bin/install.js` returns ≥ 2
    - `grep -c '\\\$gsd-new-project' bin/install.js` returns 0
    - `grep -c '\\\$brief-new-project' bin/install.js` returns ≥ 1
    - `grep -c '\\\$gsd-reapply-patches' bin/install.js` returns 0
    - `grep -c '\\\$brief-reapply-patches' bin/install.js` returns ≥ 1
    - `grep -c "gsd-new-project (mention the skill name)" bin/install.js` returns 0
    - `grep -c "gsd-reapply-patches (mention the skill name)" bin/install.js` returns 0
    - `grep -c "c.replace(/gsd:/g" bin/install.js` returns 0 (Option α applied)
    - `grep -c "c.replace(/brief:/g" bin/install.js` returns ≥ 2
    - `grep -c "return content.replace(/brief:/gi" bin/install.js` returns ≥ 3
    - `grep -c "section.path.startsWith('agents.brief-')" bin/install.js` returns ≥ 1 (P-C dual-prefix added)
    - `grep -cE "agents\\.brief-\|agents\\.gsd-" bin/install.js` returns ≥ 2 (regex rewritten + startsWith rewritten)
    - `node -c bin/install.js` exits 0
  </acceptance_criteria>
  <done>
    All user-visible `gsd-*` output strings in bin/install.js rewritten to `brief-*`. Fresh BRIEF installs produce only `brief-*` user-facing strings (D-07 no-aliases honored at the user's-eye level). The `/gsd:/` input-vocabulary legacy-normalizer is replaced by `/brief:/` per Option α. Two Codex/Cursor `agents.gsd-` detection sites use dual-prefix for upgrade-from-GSD compatibility. BLOCKER 2 from revision-1 review is resolved.
  </done>
</task>

<task type="auto">
  <name>Task 5: Verify worktree test assertions are post-rename; rewrite only if needed</name>
  <files>tests/worktree-safety.test.cjs, tests/worktree-stagger.test.cjs</files>
  <read_first>
    - /tmp/plan08-pre-tests.txt (Task 1's enumeration — authoritative for whether any test files still contain pre-rename path refs)
    - tests/worktree-safety.test.cjs lines 1–30 (verify EXECUTOR_AGENT_PATH + EXECUTE_PLAN_PATH + EXECUTE_PHASE_PATH point at brief/ paths)
    - tests/worktree-stagger.test.cjs lines 1–25 (verify WORKFLOWS_DIR + executePhasePath point at brief/ paths)
  </read_first>
  <action>
Per Task 1's pre-grep, the two worktree test files ALREADY use post-rename paths at the source level — `agents/brief-executor.md` (line 21 of worktree-safety.test.cjs) and `brief/workflows` (line 16 of worktree-stagger.test.cjs). The pre-rename path strings in 05-PRE-TEST-BASELINE.txt stack traces are from STALE WORKTREE snapshots, not the current main-tree file state.

**Step 5.1 — Confirm source files are clean:**

```bash
# Confirm zero pre-rename residues in the two named files
grep -cE "agents/gsd-|get-shit-done/workflows|hooks/gsd-" /Users/agent/GSD-for-Business/tests/worktree-safety.test.cjs
grep -cE "agents/gsd-|get-shit-done/workflows|hooks/gsd-" /Users/agent/GSD-for-Business/tests/worktree-stagger.test.cjs
```

Both should return 0. If either returns > 0, the planning-time read was stale — read the file fresh with the `Read` tool and apply surgical `Edit` replacements:
- `'agents', 'gsd-executor.md'` → `'agents', 'brief-executor.md'`
- `'get-shit-done', 'workflows'` → `'brief', 'workflows'`
- `'hooks', 'gsd-{name}.js'` → `'hooks', 'brief-{name}.js'`

**Step 5.2 — Verify tests pass at the main tree level:**

```bash
cd /Users/agent/GSD-for-Business && node --test tests/worktree-safety.test.cjs tests/worktree-stagger.test.cjs 2>&1 > /tmp/plan08-worktree-tests.txt
echo "--- FAIL COUNT ---" >> /tmp/plan08-worktree-tests.txt
grep -cE "^✖" /tmp/plan08-worktree-tests.txt >> /tmp/plan08-worktree-tests.txt || echo 0 >> /tmp/plan08-worktree-tests.txt
```

Expected: 0 failing tests (7 tests total across the two files — 3 in worktree-safety, 4 in worktree-stagger — all pass after the Plan 03/04 rename).

**Step 5.3 — Cross-check tests/ directory-wide for any residual pre-rename refs:**

```bash
# Ensures no other test file references pre-rename paths. Exclude the audit file (Plan 02 output).
grep -rln "agents/gsd-\|get-shit-done/workflows\|hooks/gsd-" /Users/agent/GSD-for-Business/tests/ 2>/dev/null | grep -v "removed-surfaces.smoke.txt" | grep -v "^$" > /tmp/plan08-tests-other-residues.txt

# Expected: empty file or only audit files
wc -l /tmp/plan08-tests-other-residues.txt
```

If any other test file is flagged, read it and apply surgical rewrites per the patterns in Step 5.1. If the residue is inside an assertion that specifically tests legacy-GSD-cleanup behavior (e.g., `tests/bug-1924-preserve-user-artifacts.test.cjs` — already annotated as Category B by Plan 07), leave it and add an inline comment if not already present.

**Step 5.4 — If any new test file was edited, re-run it:**

```bash
for f in $(cat /tmp/plan08-tests-other-residues.txt); do
  cd /Users/agent/GSD-for-Business && node --test "$f" 2>&1 | grep -cE "^✖"
done
```

Assert every result is 0 or matches the pre-Plan-08 baseline failure count for that file.
  </action>
  <verify>
    <automated>cd /Users/agent/GSD-for-Business && test $(grep -cE "agents/gsd-|get-shit-done/workflows|hooks/gsd-" tests/worktree-safety.test.cjs) -eq 0 && test $(grep -cE "agents/gsd-|get-shit-done/workflows|hooks/gsd-" tests/worktree-stagger.test.cjs) -eq 0 && test $(node --test tests/worktree-safety.test.cjs tests/worktree-stagger.test.cjs 2>&1 | grep -cE "^✖") -eq 0</automated>
  </verify>
  <acceptance_criteria>
    - `grep -cE "agents/gsd-|get-shit-done/workflows|hooks/gsd-" tests/worktree-safety.test.cjs` returns 0
    - `grep -cE "agents/gsd-|get-shit-done/workflows|hooks/gsd-" tests/worktree-stagger.test.cjs` returns 0
    - `node --test tests/worktree-safety.test.cjs tests/worktree-stagger.test.cjs 2>&1 | grep -cE "^✖"` returns 0 (all 7 tests pass)
    - /tmp/plan08-tests-other-residues.txt either is empty OR only lists audit/legacy-annotation test files (not failure-regenerating assertion refs)
  </acceptance_criteria>
  <done>
    Both worktree test files confirmed free of pre-rename strings; 0 failing tests across the 7 worktree tests. No other test file has unannotated pre-rename path residues.
  </done>
</task>

<task type="auto">
  <name>Task 6: Re-baseline npm test against empirical baseline 6; enforce DELTA_CAP=16 with 3-loop HALT protocol</name>
  <files>.planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt</files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt (existing Plan 05 + Plan 07 sections; do NOT overwrite — append Plan 08 section below)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/07-GAP-CLOSURE-PARTIAL-AUDIT.md §5 (empirical baseline 6 captured via `git clone backup/original-gsd`)
  </read_first>
  <action>
**Step 6.1 — Run npm test and capture full output:**

```bash
cd /Users/agent/GSD-for-Business && npm test 2>&1 > /tmp/plan08-post-test.txt
PLAN_08_POST_COUNT=$(grep -cE "^✖" /tmp/plan08-post-test.txt)
echo "PLAN_08_POST_COUNT=$PLAN_08_POST_COUNT"
```

**Step 6.2 — Compute DELTA and GATE_RESULT:**

```bash
EMPIRICAL_BASELINE=6
DELTA_CAP=16
DELTA=$((PLAN_08_POST_COUNT - EMPIRICAL_BASELINE))

if [ "$PLAN_08_POST_COUNT" -le "$DELTA_CAP" ]; then
  GATE_RESULT=PASS
else
  GATE_RESULT=FAIL_LOOP_1
fi

echo "EMPIRICAL_BASELINE=$EMPIRICAL_BASELINE DELTA_CAP=$DELTA_CAP POST=$PLAN_08_POST_COUNT DELTA=$DELTA GATE=$GATE_RESULT"
```

**Step 6.3 — Gate failure handling (3-loop HALT protocol, same as Plan 07 Task 4.3):**

- **PASS (POST ≤ 16):** Continue to Step 6.4.
- **FAIL_LOOP_1 (POST > 16):** Iterate once.
  1. Review `/tmp/plan08-post-test.txt` for the top 10 `✖` lines and their context (3 lines after each).
  2. Identify whether the failures are:
     - (a) Out-of-scope pre-Phase-1 regressions (deferred to future phase — document in audit but do NOT fix)
     - (b) In-scope regressions from Plan 08 edits (Task 2/3/4/5 had a mistake — identify and rewrite)
     - (c) Tests whose assertion strings changed (e.g., describe-block renamed `commands/gsd/` → `commands/brief/` — recorded as "renamed test", not a regression)
  3. For category (b), apply the fix and re-run Step 6.1–6.2 as LOOP_2.
- **FAIL_LOOP_2:** Same iteration protocol.
- **FAIL_LOOP_3 (still FAIL after 3 loops):** HALT protocol:
  1. Do NOT commit. Leave working tree with Plan 08 edits intact.
  2. Capture the stable POST_COUNT + DELTA.
  3. Produce `08-GAP-CLOSURE-PARTIAL-AUDIT.md` (NOT the final `08-GAP-CLOSURE-AUDIT.md`) with §5 forensic analysis decomposing the remaining failures into: out-of-scope / in-scope-unfixable / in-scope-requires-next-plan.
  4. Return HALT to the orchestrator. Do NOT self-certify Plan 08 closure. The orchestrator will decide whether to spawn Plan 09 or extend Plan 08 scope.

**Step 6.4 — Append Plan 08 section to 05-PRE-TEST-BASELINE.txt:**

Use the `Edit` tool with append-mode: read the existing file, preserve all lines through `## Task 4 will append the POST-fix measurement and the delta-cap gate result.`, and append a new `## PLAN 08 POST-FIX MEASUREMENTS` section. The exact append-block shape:

```text

## PLAN 08 POST-FIX MEASUREMENTS
## ============================================================
## Task 6 of Plan 08 re-measures against the EMPIRICAL pre-Phase-1 baseline
## (captured by Plan 07 §5 via `git clone backup/original-gsd` + `npm test`
## + `grep -cE '^✖'` = 6 failing, 673 passing).
## Plan 07 used TRUE_BASELINE=10 as an upper-bound; Plan 08 uses the empirical
## figure of 6 directly — a tighter gate that catches any regression introduced
## by Plan 08 hook-rename + prefix-residue edits.

EMPIRICAL_BASELINE=6
DELTA_CAP=16
PLAN_08_POST_COUNT=<N>
DELTA=<N-6>
GATE_RESULT=PASS  # or FAIL_LOOP_N / HALT
METHOD=grep -cE '^✖' on full npm test stdout+stderr (same as Plan 07)
MEASURED_AT=<ISO-8601 timestamp>
ITERATIONS=<number of loops before result>

## Decomposition (fill in after PLAN_08_POST_COUNT is known):
## - Plan 08 FIXED (previously-failing tests that now pass): ~56 hook-install tests + ~12 worktree tests + ~5 install-prefix-dependent tests
## - Plan 08 INTRODUCED (regressions): expected 0; if non-zero, list in audit §5
## - Pre-existing (out-of-scope) failures remaining: ≤ DELTA_CAP - EMPIRICAL_BASELINE = 10
```

Replace `<N>`, `<N-6>`, `<ISO-8601 timestamp>`, `<number of loops before result>` with the measured values. If GATE=PASS, the `## Decomposition` block stays as planning notes. If GATE=HALT, replace the Decomposition with the forensic breakdown from Step 6.3.
  </action>
  <verify>
    <automated>cd /Users/agent/GSD-for-Business && grep -c "## PLAN 08 POST-FIX MEASUREMENTS" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt | grep -qE "^1$" && grep -c "EMPIRICAL_BASELINE=6" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt | grep -qE "^1$" && grep -qE "^GATE_RESULT=(PASS|FAIL_LOOP_[123]|HALT)" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt && test -f /tmp/plan08-post-test.txt && test $(grep -cE "^✖" /tmp/plan08-post-test.txt) -le 16</automated>
  </verify>
  <acceptance_criteria>
    - /tmp/plan08-post-test.txt exists with full npm-test output
    - `grep -cE '^✖' /tmp/plan08-post-test.txt` returns a value ≤ 16 (EMPIRICAL_BASELINE 6 + cap 10)
    - 05-PRE-TEST-BASELINE.txt has a new `## PLAN 08 POST-FIX MEASUREMENTS` section
    - Section contains EMPIRICAL_BASELINE=6, DELTA_CAP=16, and a filled-in PLAN_08_POST_COUNT with the measured number
    - Section contains GATE_RESULT=PASS (if POST ≤ 16) OR GATE_RESULT=HALT with 3-iteration rationale (if POST > 16 after 3 loops)
    - If HALT: no Step 6.4 commit occurs, working tree remains uncommitted, Task 7 produces 08-GAP-CLOSURE-PARTIAL-AUDIT.md instead of 08-GAP-CLOSURE-AUDIT.md
  </acceptance_criteria>
  <done>
    Plan 08 npm-test POST count captured against empirical baseline. Either (a) GATE=PASS and POST ≤ 16 (ready for Task 7 + Task 8 commit), or (b) GATE=HALT after 3 iterations and a partial audit documents the residual out-of-scope failures (no commit; orchestrator decides next step).
  </done>
</task>

<task type="auto">
  <name>Task 7: Produce 08-GAP-CLOSURE-AUDIT.md (or PARTIAL-AUDIT if Task 6 HALTed)</name>
  <files>.planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-AUDIT.md</files>
  <read_first>
    - /tmp/plan08-pre-build-hooks.txt, /tmp/plan08-pre-install-hooks.txt, /tmp/plan08-pre-install-prefixes.txt, /tmp/plan08-pre-install-output-names.txt, /tmp/plan08-pre-tests.txt (Task 1 pre-state snapshots)
    - /tmp/plan08-hooks-dist.txt (Task 2 post-rebuild inventory)
    - /tmp/plan08-post-test.txt (Task 6 npm-test output)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt Plan 08 section (Task 6 output)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/07-GAP-CLOSURE-PARTIAL-AUDIT.md (structural template — Plan 08 audit mirrors sections 1–8)
  </read_first>
  <action>
Create `.planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-AUDIT.md` using the `Write` tool. Filename depends on Task 6 outcome:
- Task 6 GATE=PASS → write `08-GAP-CLOSURE-AUDIT.md` (closure audit)
- Task 6 GATE=HALT → write `08-GAP-CLOSURE-PARTIAL-AUDIT.md` (handoff audit)

The audit must mirror the structural shape of `07-GAP-CLOSURE-PARTIAL-AUDIT.md` with Plan-08-specific content:

**§1. Executive Summary** (6–10 sentences):
- State the closure status: "Plan 08 closes Phase 1 FND-03 — the remaining hook-rename propagation + install.js prefix residues from Plan 07's HALT handoff" OR "Plan 08 HALT at iteration 3, POST=N, DELTA=N-6, over cap by N-16"
- Cite Plan 07's HALT as the predecessor state
- Summarize the three categories closed (Gap 3 hooks, Gap 4 worktree tests, Gap 5 prefix residues) and re-baseline against empirical 6
- If PASS: note Phase 1 ready for re-verification. If HALT: note the decomposition (in-scope-fixed vs out-of-scope-remaining) and recommendation for Plan 09

**§2. Iteration Counts:**
- Iteration 1: PRE counts + edits applied + POST measurement
- Iteration 2: (empty if PASS; re-measurement if LOOP_1 failed)
- Iteration 3: (empty if PASS within 1–2 loops; final measurement if HALT)

**§3. Pre/post grep counts per file modified:**

| File | Metric | PRE (Task 1) | POST (after edits) |
|------|--------|-------------|--------------------|
| scripts/build-hooks.js | `'gsd-'` count | 10 | 0 |
| scripts/build-hooks.js | `'brief-'` count | 0 | 11 |
| bin/install.js | `gsd-*.{js,sh}` hook-literal count | 40+ | ≤4 (Category P-D historical) |
| bin/install.js | `startsWith('gsd-')` count | 19 | ≤2 (Category P-B legacy-only) |
| bin/install.js | `startsWith('brief-') \|\|` dual-prefix count | 0 | ≥10 (Category P-C) |
| bin/install.js | `copyCommandsAs*(..., 'gsd',` fresh-install prefix | 11 | 0 |
| bin/install.js | `'gsd-local-patches'` | 1 | 0 |
| bin/install.js | `'gsd-file-manifest.json'` | 1 | 0 |
| hooks/dist/ entry count | — | 0 (empty) | 11 |
| tests/worktree-safety.test.cjs | pre-rename refs | 0 (already clean) | 0 |
| tests/worktree-stagger.test.cjs | pre-rename refs | 0 (already clean) | 0 |

**§4. bin/install.js P-A / P-B / P-C / P-D decision table** (every one of the ~50 sites categorized):

Reproduce the per-line table from Task 3 (hook filenames) and Task 4 (prefix residues) into a consolidated table with columns: Line, Category, Pre pattern, Post pattern, Rationale. Mark every P-D historical-cleanup entry (4303, 4305, 4306, 4307) as "UNCHANGED — pre-fork removal list".

**§5. npm-test DELTA forensic decomposition:**

| Metric | Value |
|--------|-------|
| EMPIRICAL_BASELINE (pre-Phase-1, from Plan 07 §5) | 6 |
| PLAN_07_POST (Plan 07 HALT state) | 345 |
| PLAN_08_POST (this plan) | <N> |
| DELTA vs baseline | <N-6> |
| DELTA_CAP | 16 |

Decomposition of the DELTA (345 → N):
- Gap 3 hook-install tests fixed: 56
- Gap 4 worktree tests fixed: 12
- Gap 5 install-prefix-count tests fixed: <estimated 5–15>
- Previously-hidden nested failures now surfacing: <number observed in /tmp/plan08-post-test.txt but not in PRE baseline>
- Net new regressions introduced by Plan 08 edits: <expected 0; if non-zero, list>

**§6. Scope boundary affirmation — deferred items:**

- Cross-runtime smoke test (FND-06 human verification) — STILL deferred to Phase 9 HRD-01
- Full localized README prose rebranding — STILL deferred to Phase 9 Hardening
- CHANGELOG.md historical entries — already banner-handled by Plan 05 (pre-fork banner)
- Any gsd-hook-version schema field name — PRESERVED as schema constant (not a filename, not subject to rename)
- **Six dormant `/gsd:` legacy-input acceptor sites (WARNING 5 from plan-checker iteration 2)** — lines 1509, 1564, 1648, 3193, 3350, 4254 in `bin/install.js` contain `.replace(/\/gsd:([a-z0-9-]+)/...)` and `.replace(/\/gsd:/g, '/brief-')` forms that accept the `/gsd:foo` legacy input vocabulary. These are INTENTIONALLY PRESERVED in Plan 08, NOT a D-07 violation, and NOT rewritten, for the following reason: fresh BRIEF source markdown contains zero `/gsd:` command strings, so these sites never activate during a fresh BRIEF install; they exist only to normalize pre-BRIEF GSD content that a user might paste in during an upgrade path. Rewriting them to `/brief:` acceptors would break the upgrade path without user benefit (fresh users type `/brief-foo` directly, never `/brief:foo`). Rewriting them to emit `brief-` output (lines 3193 and 3350 already do this) is already covered. The structurally similar distinction with Task 4b's rewritten sites (lines 880, 1005, 1119, 1237, 1357, 4239, 4247) is: Task 4b's sites are INPUT normalizers that BRIEF content flows through on every install, so they must match fresh BRIEF vocabulary per D-07; these six sites are LEGACY-ONLY input acceptors that only trigger on GSD-content paste, so they stay as-is. If a future migration path requires removing these six sites, address in a dedicated micro-plan with a deprecation warning; Plan 08 does not.

**§7. Recommendation for next step:**

If GATE=PASS:
- Plan 08 commits as a single atomic commit (Task 8).
- Phase 1 ready for `/gsd-verify-work 1` re-verification.
- Expected VERIFICATION.md transition: `gaps_found` → `verified`. Remaining items (FND-06 human cross-runtime smoke) remain in the `deferred` block as documented.

If GATE=HALT:
- Do NOT commit Plan 08.
- Produce 08-GAP-CLOSURE-PARTIAL-AUDIT.md (this file, renamed).
- Next step: `/gsd-plan-phase 1 --gaps` to generate Plan 09 targeting the remaining out-of-scope failures identified in §5.

**§8. Working-tree / commit state at audit time:**

- If PASS: list files staged for Task 8 commit
- If HALT: `git status --short` output showing all uncommitted Plan 08 edits

The audit file is itself part of the Task 8 commit if PASS.
  </action>
  <verify>
    <automated>cd /Users/agent/GSD-for-Business && test -f .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-AUDIT.md || test -f .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-PARTIAL-AUDIT.md; ls .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE*.md | head -1 | xargs grep -cE "^## [0-9]\. |^## Executive|^## Iteration|^## Pre/post|^## .* decision table|^## DELTA|^## Scope boundary|^## Recommendation|^## Working-tree" | grep -qE "^[1-9]"</automated>
  </verify>
  <acceptance_criteria>
    - Exactly one of 08-GAP-CLOSURE-AUDIT.md OR 08-GAP-CLOSURE-PARTIAL-AUDIT.md exists in the phase directory
    - File contains all 8 sections (§1 Executive Summary, §2 Iteration Counts, §3 Pre/post grep table, §4 P-A/P-B/P-C/P-D decision table, §5 npm-test DELTA forensic, §6 Scope boundary affirmation, §7 Recommendation, §8 Working-tree state)
    - §4 P-A/P-B/P-C/P-D decision table has rows for every site touched or explicitly kept (≥50 rows total: ~40 Task 3 hook literals + ~35 Task 4 prefix residues; overlap at some P-D lines reduces net)
    - §6 explicitly lists the four deferred items (FND-06 cross-runtime / localized prose / CHANGELOG banner / gsd-hook-version schema field name)
    - If PASS: §7 cites the Task 8 commit path. If HALT: §7 recommends Plan 09 and §5 decomposes the residual failures
  </acceptance_criteria>
  <done>
    Audit file exists with 8-section structure, pre/post tables populated from Task 1 and Task 6 measurements, per-line P-A/P-B/P-C/P-D decisions documented, scope boundaries affirmed, next-step recommendation clear. Executor has produced a handoff artifact that either (a) proves Phase 1 closure (Task 8 commits) or (b) hands off to Plan 09 (HALT).
  </done>
</task>

<task type="auto">
  <name>Task 8: Atomic commit OR HALT (conditional on Task 6 GATE_RESULT)</name>
  <files>
    scripts/build-hooks.js
    bin/install.js
    tests/worktree-safety.test.cjs
    tests/worktree-stagger.test.cjs
    hooks/dist/ (all 11 brief-* files — new, bundled by Task 2)
    .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt
    .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-AUDIT.md (or 08-GAP-CLOSURE-PARTIAL-AUDIT.md if HALT)
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt (confirm GATE_RESULT line is filled in)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-AUDIT.md or 08-GAP-CLOSURE-PARTIAL-AUDIT.md (the Task 7 output)
  </read_first>
  <action>
**Step 8.1 — Branch on Task 6 GATE_RESULT (read from 05-PRE-TEST-BASELINE.txt Plan 08 section):**

```bash
GATE=$(grep -oE "GATE_RESULT=(PASS|FAIL_LOOP_[123]|HALT)" /Users/agent/GSD-for-Business/.planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt | tail -1 | cut -d= -f2)
echo "GATE=$GATE"
```

**Step 8.2 — PASS path:**

If `GATE=PASS`:

```bash
cd /Users/agent/GSD-for-Business
git add \
  scripts/build-hooks.js \
  bin/install.js \
  hooks/dist/ \
  tests/worktree-safety.test.cjs \
  tests/worktree-stagger.test.cjs \
  .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt \
  .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-AUDIT.md
git status
```

Review `git status` output. If anything unexpected is staged, unstage it and re-run targeted `git add`.

Then commit (HEREDOC convention per Plan 07):

```bash
node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" commit "refactor(01-gap-closure-08): close hook-rename propagation + bin/install.js gsd-* prefix residues (FND-03 full closure)" --files scripts/build-hooks.js bin/install.js hooks/dist/ tests/worktree-safety.test.cjs tests/worktree-stagger.test.cjs .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-AUDIT.md
```

If `gsd-tools.cjs` is unavailable or has been renamed during Phase 1 without backward-compat, fall back to `node brief/bin/brief-tools.cjs commit` with the same arguments. If neither is available, use a direct `git commit`:

```bash
git commit -m "$(cat <<'EOF'
refactor(01-gap-closure-08): close hook-rename propagation + bin/install.js gsd-* prefix residues (FND-03 full closure)

Plan 08 closes the three Phase-1 FND-03 regressions flagged by Plan 07's HALT audit
(07-GAP-CLOSURE-PARTIAL-AUDIT.md §5, §6):

Gap 3 (hook-filename propagation):
- scripts/build-hooks.js HOOKS_TO_COPY array rewritten: 10 gsd-*.{js,sh} entries
  → 11 brief-*.{js,sh} entries matching hooks/ directory 1:1
- hooks/dist/ now populated with 11 brief-* bundled hooks (was empty; dominant
  root cause of 56 install-hook test failures)
- bin/install.js: ~40 gsd-*.{js,sh} hook-filename literals rewritten at call
  sites for buildHookCommand / path.join / console.warn / expectedShHooks /
  .cache/gsd/gsd-update-check.json. 4 P-D historical-removal entries at lines
  4303/4305/4306/4307 preserved (pre-fork GSD cleanup targets).

Gap 5 (gsd-* prefix residues):
- 11 copy-helper call sites now pass 'brief' prefix (was 'gsd') — fresh
  installs produce brief-*.md / brief-*/SKILL.md / brief-*/command files
- PATCHES_DIR_NAME 'gsd-local-patches' → 'brief-local-patches'
- MANIFEST_NAME 'gsd-file-manifest.json' → 'brief-file-manifest.json'
- listCodexSkillNames default prefix 'gsd-' → 'brief-'
- 17 uninstall/manifest startsWith('gsd-') sites rewritten to dual-prefix
  (startsWith('brief-') || startsWith('gsd-')) per Category P-C so uninstall
  handles both fresh BRIEF installs AND upgrade-from-GSD cleanup
- 2 Category P-B legacy-only sites (lines 5671, 5703) kept as startsWith('gsd-')
  with inline explanatory comments — these specifically target pre-BRIEF
  leftover files and must not match brief-* siblings
- (Revision-1 addition, Task 3b) 19 `.includes('gsd-…')` hook-detection
  sites (lines 4805, 4814–4818, 5979, 5984, 6099, 6127, 6148, 6155, 6175,
  6199, 6223, 6255, 6280, 6307, 6329) rewritten to dual-prefix
  (`cmd.includes('brief-X') || cmd.includes('gsd-X')`) — fresh BRIEF
  installs AND upgrade-from-GSD installs both detect existing hook entries
- (Revision-1 addition, Task 4b) user-visible gsd-* output strings
  rewritten per D-07: `gsd-pristine` → `brief-pristine` (5325 doc + 5336
  path.join); `$gsd-new-project` / `gsd-new-project (mention the skill
  name)` → `brief-*` (6434, 6437); `$gsd-reapply-patches` / `gsd-reapply-
  patches (mention the skill name)` → `brief-*` (5398, 5400); Codex
  `$gsd-\${commandName}` template literals → `$brief-\${commandName}`
  (1649, 1655); 7 `c.replace(/gsd:/, 'gsd-')` + their 5 adjacent comments
  rewritten to `/brief:/` per Option α (879, 880, 924, 1004, 1005, 1117,
  1119, 1236, 1237, 1357, 4239, 4247); agents.gsd-* regex + startsWith
  made dual-prefix (1829, 2528)

Gap 4 (worktree test assertions):
- tests/worktree-safety.test.cjs + tests/worktree-stagger.test.cjs confirmed
  free of pre-rename path strings; the failures reported in
  05-PRE-TEST-BASELINE.txt were from stale worktree snapshots captured
  pre-rename, not current main-tree assertions

Gap 6 (re-baseline):
- EMPIRICAL_BASELINE=6 (captured by Plan 07 §5 from backup/original-gsd)
- DELTA_CAP=16
- PLAN_08_POST_COUNT=<N>  DELTA=<N-6>  GATE=PASS

Scope boundary (honored per Plan 07 §6 and Plan 08 <objective>):
- Cross-runtime smoke (FND-06 human) — still deferred to Phase 9 HRD-01
- Localized README prose — still deferred to Phase 9 Hardening
- CHANGELOG.md historical entries — already banner-handled by Plan 05
- gsd-hook-version schema field name — preserved as schema constant

Closes: FND-03 (full closure after Plan 07 partial + Plan 08 remainder)
Refs: 07-GAP-CLOSURE-PARTIAL-AUDIT.md, 08-GAP-CLOSURE-AUDIT.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Replace `<N>` with the actual PLAN_08_POST_COUNT before committing.

Then verify:
```bash
git log -1 --oneline
git status --short  # expect clean (no uncommitted changes)
```

**Step 8.3 — HALT path:**

If `GATE=HALT` (POST > 16 after 3 iterations):

DO NOT COMMIT. Execute:

```bash
# Confirm working tree has all Plan 08 edits
git status --short > /tmp/plan08-halt-workingtree.txt
cat /tmp/plan08-halt-workingtree.txt

# Confirm partial audit file exists
test -f .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-PARTIAL-AUDIT.md && echo "partial audit present"
```

Return `## HALT` to the orchestrator with:
- Task 6 final POST_COUNT
- Task 7 partial-audit path
- Recommendation: orchestrator runs `/gsd-plan-phase 1 --gaps` to spawn Plan 09

**Step 8.4 — Final self-check (PASS path only):**

```bash
# Sanity: re-run the dominant acceptance criteria after commit
grep -c "'gsd-" scripts/build-hooks.js                                              # expect 0
grep -c "'brief-" scripts/build-hooks.js                                            # expect 11
ls hooks/dist/ | wc -l                                                              # expect ≥ 11
grep -c "startsWith('gsd-')" bin/install.js                                         # expect ≤ 14 (12 P-C OR-arms + 2 P-B legacy-only)
grep -cE "copyCommandsAs[A-Z][a-zA-Z]+Skills\(gsdSrc, skillsDir, 'gsd'," bin/install.js  # expect 0
grep -cE "^✖" /tmp/plan08-post-test.txt                                              # expect ≤ 16
git log -1 --pretty=format:"%s" | grep -c "01-gap-closure-08"                       # expect 1
```

All should pass for PASS closure.
  </action>
  <verify>
    <automated>cd /Users/agent/GSD-for-Business && { GATE=$(grep -oE "GATE_RESULT=(PASS|HALT|FAIL_LOOP_[123])" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt | tail -1 | cut -d= -f2); if [ "$GATE" = "PASS" ]; then git log -1 --pretty=format:"%s" | grep -q "01-gap-closure-08" && test $(git status --short | wc -l) -eq 0; elif [ "$GATE" = "HALT" ]; then test -f .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-PARTIAL-AUDIT.md && test $(git status --short | wc -l) -gt 0; fi; }</automated>
  </verify>
  <acceptance_criteria>
    - (PASS path) `git log -1 --pretty=format:"%s"` contains "refactor(01-gap-closure-08)"
    - (PASS path) `git status --short` returns 0 lines (clean working tree after commit)
    - (PASS path) `grep -cE "^✖" /tmp/plan08-post-test.txt` returns ≤ 16
    - (HALT path) no commit made
    - (HALT path) 08-GAP-CLOSURE-PARTIAL-AUDIT.md exists with §5 forensic decomposition
    - (HALT path) working tree has uncommitted Plan 08 edits (`git status --short | wc -l` > 0)
  </acceptance_criteria>
  <done>
    Plan 08 either ships as a single atomic commit closing Phase 1 FND-03 (PASS — ready for `/gsd-verify-work 1` re-verification) OR handoffs to Plan 09 with a partial audit (HALT — orchestrator decides next step).
  </done>
</task>

</tasks>

<verification>
After all tasks complete (PASS path):

1. **Gap 3 closure:** `grep -c "'gsd-" scripts/build-hooks.js` returns 0; `ls hooks/dist/ | wc -l` returns ≥ 11; every runtime-install branch in bin/install.js references brief-* hook filenames.

2. **Gap 4 closure:** `node --test tests/worktree-safety.test.cjs tests/worktree-stagger.test.cjs 2>&1 | grep -cE "^✖"` returns 0.

3. **Gap 5 closure:** `grep -cE "copyCommandsAs[A-Z][a-zA-Z]+Skills\(gsdSrc, skillsDir, 'gsd'," bin/install.js` returns 0; `grep -c "'brief-local-patches'" bin/install.js` returns 1; `grep -c "startsWith('gsd-')" bin/install.js` returns ≤ 14 (12 P-C dual-prefix OR-arms + 2 P-B legacy-only sites — substring survives in `startsWith('brief-') || foo.startsWith('gsd-')` OR-arm form).

3a. **BLOCKER 1 closure (Task 3b):** `grep -cE "\.includes\('brief-[a-z-]+'\) \|\| .*\.includes\('gsd-[a-z-]+'\)" bin/install.js` returns ≥ 19 (all 19 `.includes('gsd-…')` hook-detection sites now dual-prefix).

3b. **BLOCKER 2 closure (Task 4b):** `grep -c "gsd-pristine" bin/install.js` returns 0; `grep -cE '\\\$gsd-\\\$\\{commandName' bin/install.js` returns 0; `grep -c '\\\$gsd-new-project' bin/install.js` returns 0; `grep -c '\\\$gsd-reapply-patches' bin/install.js` returns 0; `grep -c "c.replace(/gsd:/g" bin/install.js` returns 0 (Option α applied).

4. **Gap 6 closure:** `grep -cE '^✖' /tmp/plan08-post-test.txt` returns ≤ 16 (EMPIRICAL_BASELINE 6 + 10 cap); 05-PRE-TEST-BASELINE.txt Plan 08 section is filled in with GATE_RESULT=PASS.

5. **Atomic commit:** `git log -1 --pretty=format:"%s"` contains "refactor(01-gap-closure-08)"; `git status --short` is empty.

6. **Audit artifact:** 08-GAP-CLOSURE-AUDIT.md exists with 8 sections; §4 P-A/P-B/P-C/P-D decision table covers every site touched; §6 affirms the 4 deferred scope items.

7. **Phase 1 ready for re-verification:** `/gsd-verify-work 1` can now transition VERIFICATION.md from `gaps_found` → `verified` (remaining deferred items like FND-06 human cross-runtime smoke stay in the deferred block).
</verification>

<success_criteria>
- Phase 1 FND-03 fully closed (was partial at Plan 07 SHA b1ec9f6 — hook-rename propagation and bin/install.js gsd-* prefix residues now also closed).
- `npx brief-cc@latest` on a fresh runtime install produces ONLY brief-* filenames (D-07 no aliases honored on fresh-install code paths).
- `npx brief-cc@latest` on a fresh install emits ONLY brief-* user-facing strings — no `gsd-pristine`, no `$gsd-new-project`, no `$gsd-reapply-patches`, no Codex `$gsd-\${cmd}` template literals (D-07 enforced at user's-eye level per Task 4b BLOCKER 2 closure).
- All 19 `.includes('gsd-…')` hook-detection sites use dual-prefix P-C pattern — upgrade from pre-BRIEF GSD still detects existing hook entries (Task 3b BLOCKER 1 closure).
- `npx brief-cc@latest` on an upgrade-from-GSD runtime still detects and cleans pre-BRIEF gsd-* files (dual-prefix P-C pattern in uninstall/manifest + explicit P-B legacy-only cleanup blocks).
- npm test POST_COUNT ≤ 16 against empirical baseline of 6 — a ~320-failure recovery from Plan 07's HALT state (POST=345).
- Single atomic commit; repo is buildable at every commit boundary (no half-applied rename).
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-08-SUMMARY.md` mirroring the structure of `01-07-SUMMARY.md` — frontmatter with provides/affects/tech-stack/key-files/decisions/metrics, body with "What Changed" per gap (3, 4, 5) + commit SHA + verification results + self-check. If Task 6 GATE=HALT, the summary documents the HALT handoff to Plan 09 instead of closure.
</output>
