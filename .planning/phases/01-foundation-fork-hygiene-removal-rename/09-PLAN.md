---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 09
type: execute
wave: 9
depends_on: [08]
files_modified:
  # 31 test files (pre-Phase-1 regressions — hardcoded pre-rename vocabulary)
  # Category distribution: T-A=26, T-B=3, T-C=1, T-D=1 (see <interfaces> for per-file decisions)
  - "tests/antigravity-install.test.cjs"
  - "tests/brief-statusline.test.cjs"
  - "tests/bug-1754-js-hook-guard.test.cjs"
  - "tests/bug-1817-sh-hook-guard.test.cjs"
  - "tests/bug-1834-sh-hooks-installed.test.cjs"
  - "tests/bug-1906-hook-relative-paths.test.cjs"
  - "tests/bug-1908-uninstall-manifest.test.cjs"
  - "tests/bug-1924-preserve-user-artifacts.test.cjs"
  - "tests/bug-1974-context-exhaustion-record.test.cjs"
  - "tests/bug-2136-sh-hook-version.test.cjs"
  - "tests/bug-2344-read-guard-claudecode-env.test.cjs"
  - "tests/bugs-1656-1657.test.cjs"
  - "tests/check-update-config-dir.test.cjs"
  - "tests/claude-skills-migration.test.cjs"
  - "tests/codex-config.test.cjs"
  - "tests/copilot-install.test.cjs"
  - "tests/core.test.cjs"
  - "tests/hooks-opt-in.test.cjs"
  - "tests/install-hooks-copy.test.cjs"
  - "tests/managed-hooks.test.cjs"
  - "tests/orphaned-hooks.test.cjs"
  - "tests/package-manifest.test.cjs"
  - "tests/read-guard.test.cjs"
  - "tests/read-injection-scanner.test.cjs"
  - "tests/reapply-patches.test.cjs"
  - "tests/removed-surfaces.smoke.txt"
  - "tests/security.test.cjs"
  - "tests/semver-compare.test.cjs"
  - "tests/sh-hook-paths.test.cjs"
  - "tests/update-custom-backup.test.cjs"
  - "tests/workflow-guard-registration.test.cjs"
  # Baseline file (append PLAN 09 POST measurement) + new audit artifact
  - ".planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt"
  - ".planning/phases/01-foundation-fork-hygiene-removal-rename/09-GAP-CLOSURE-AUDIT.md"
autonomous: true
requirements:
  - FND-03
gap_closure: true
user_setup: []

must_haves:
  truths:
    # ── Task 1 pre-grep enumeration recorded ──
    - "User opens `.planning/phases/01-foundation-fork-hygiene-removal-rename/09-GAP-CLOSURE-AUDIT.md` §3 and sees a per-file PRE residue table with the 31 measured values (verified PRE totals 2026-04-18: antigravity-install=3, brief-statusline=3, bug-1754=5, bug-1817=3, bug-1834=13, bug-1906=9, bug-1908=4, bug-1924=10, bug-1974=2, bug-2136=16, bug-2344=3, bugs-1656-1657=9, check-update-config-dir=2, claude-skills-migration=11, codex-config=4, copilot-install=8, core=19, hooks-opt-in=51, install-hooks-copy=35, managed-hooks=7, orphaned-hooks=7, package-manifest=4, read-guard=8, read-injection-scanner=5, reapply-patches=9, removed-surfaces.smoke.txt=20, security=5, semver-compare=1, sh-hook-paths=5, update-custom-backup=2, workflow-guard-registration=12 — total ≈ 295)"
    # ── T-A (fresh-install) rewrite completeness — per-file zero-residue asserts ──
    - "User runs `grep -c 'gsd-statusline\\|gsd-check-update\\|gsd-context-monitor\\|gsd-prompt-guard\\|gsd-read-guard\\|gsd-read-injection\\|gsd-workflow-guard\\|gsd-session-state\\|gsd-validate-commit\\|gsd-phase-boundary\\|gsd-local-patches\\|gsd-file-manifest\\|\\.cache/gsd\\|gsdHooks\\|commands/gsd' tests/hooks-opt-in.test.cjs` and gets 0 (T-A full rewrite — 51 → 0)"
    - "User runs `grep -c 'gsd-statusline\\|gsd-check-update\\|gsd-context-monitor\\|gsd-prompt-guard\\|gsd-read-guard\\|gsd-read-injection\\|gsd-workflow-guard\\|gsd-session-state\\|gsd-validate-commit\\|gsd-phase-boundary\\|gsd-local-patches\\|gsd-file-manifest\\|\\.cache/gsd\\|gsdHooks\\|commands/gsd' tests/install-hooks-copy.test.cjs` and gets 0 (T-A full rewrite — 35 → 0)"
    - "User runs `grep -c 'gsd-statusline\\|gsd-check-update\\|gsd-context-monitor\\|gsd-prompt-guard\\|gsd-read-guard\\|gsd-read-injection\\|gsd-workflow-guard\\|gsd-session-state\\|gsd-validate-commit\\|gsd-phase-boundary\\|gsd-local-patches\\|gsd-file-manifest\\|\\.cache/gsd\\|gsdHooks\\|commands/gsd' tests/core.test.cjs` and gets 0 (T-A full rewrite — 19 → 0)"
    - "User runs `grep -c 'gsd-statusline\\|gsd-check-update\\|gsd-context-monitor\\|gsd-prompt-guard\\|gsd-read-guard\\|gsd-read-injection\\|gsd-workflow-guard\\|gsd-session-state\\|gsd-validate-commit\\|gsd-phase-boundary\\|gsd-local-patches\\|gsd-file-manifest\\|\\.cache/gsd\\|gsdHooks\\|commands/gsd' tests/bug-2136-sh-hook-version.test.cjs` and gets 0 (T-A full rewrite — 16 → 0)"
    - "User runs `grep -c 'gsd-statusline\\|gsd-check-update\\|gsd-context-monitor\\|gsd-prompt-guard\\|gsd-read-guard\\|gsd-read-injection\\|gsd-workflow-guard\\|gsd-session-state\\|gsd-validate-commit\\|gsd-phase-boundary\\|gsd-local-patches\\|gsd-file-manifest\\|\\.cache/gsd\\|gsdHooks\\|commands/gsd' tests/bug-1834-sh-hooks-installed.test.cjs` and gets 0 (T-A full rewrite — 13 → 0)"
    - "User runs `grep -c 'gsd-statusline\\|gsd-check-update\\|gsd-context-monitor\\|gsd-prompt-guard\\|gsd-read-guard\\|gsd-read-injection\\|gsd-workflow-guard\\|gsd-session-state\\|gsd-validate-commit\\|gsd-phase-boundary\\|gsd-local-patches\\|gsd-file-manifest\\|\\.cache/gsd\\|gsdHooks\\|commands/gsd' tests/workflow-guard-registration.test.cjs` and gets 0 (T-A full rewrite — 12 → 0, includes `gsdHooks` → `briefHooks` variable-name rewrite matching Plan 08 line-4762 source-side rename)"
    - "User runs `grep -c 'gsd-statusline\\|gsd-check-update\\|gsd-context-monitor\\|gsd-prompt-guard\\|gsd-read-guard\\|gsd-read-injection\\|gsd-workflow-guard\\|gsd-session-state\\|gsd-validate-commit\\|gsd-phase-boundary\\|gsd-local-patches\\|gsd-file-manifest\\|\\.cache/gsd\\|gsdHooks\\|commands/gsd' tests/bug-1906-hook-relative-paths.test.cjs` and gets 0 (T-A full rewrite — 9 → 0)"
    - "User runs `grep -c 'gsd-statusline\\|gsd-check-update\\|gsd-context-monitor\\|gsd-prompt-guard\\|gsd-read-guard\\|gsd-read-injection\\|gsd-workflow-guard\\|gsd-session-state\\|gsd-validate-commit\\|gsd-phase-boundary\\|gsd-local-patches\\|gsd-file-manifest\\|\\.cache/gsd\\|gsdHooks\\|commands/gsd' tests/bugs-1656-1657.test.cjs` and gets 0 (T-A full rewrite — 9 → 0)"
    - "User runs `grep -c 'gsd-statusline\\|gsd-check-update\\|gsd-context-monitor\\|gsd-prompt-guard\\|gsd-read-guard\\|gsd-read-injection\\|gsd-workflow-guard\\|gsd-session-state\\|gsd-validate-commit\\|gsd-phase-boundary\\|gsd-local-patches\\|gsd-file-manifest\\|\\.cache/gsd\\|gsdHooks\\|commands/gsd' tests/reapply-patches.test.cjs` and gets 0 (T-A full rewrite — 9 → 0)"
    - "User runs `grep -c 'gsd-statusline\\|gsd-check-update\\|gsd-context-monitor\\|gsd-prompt-guard\\|gsd-read-guard\\|gsd-read-injection\\|gsd-workflow-guard\\|gsd-session-state\\|gsd-validate-commit\\|gsd-phase-boundary\\|gsd-local-patches\\|gsd-file-manifest\\|\\.cache/gsd\\|gsdHooks\\|commands/gsd' tests/read-guard.test.cjs` and gets 0 (T-A full rewrite — 8 → 0, includes one `gsdHooks` reference on line 214)"
    # ── T-A mid-density files (sum ≥ 3 hits) — all T-A except bug-1908, bug-1924, claude-skills-migration, copilot-install ──
    - "User runs `for f in tests/antigravity-install.test.cjs tests/brief-statusline.test.cjs tests/bug-1754-js-hook-guard.test.cjs tests/bug-1817-sh-hook-guard.test.cjs tests/bug-1974-context-exhaustion-record.test.cjs tests/bug-2344-read-guard-claudecode-env.test.cjs tests/check-update-config-dir.test.cjs tests/codex-config.test.cjs tests/managed-hooks.test.cjs tests/orphaned-hooks.test.cjs tests/package-manifest.test.cjs tests/read-injection-scanner.test.cjs tests/security.test.cjs tests/semver-compare.test.cjs tests/sh-hook-paths.test.cjs tests/update-custom-backup.test.cjs; do grep -cE 'gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\\.cache/gsd|gsdHooks|commands/gsd' \"$f\"; done | awk '{s+=$1} END {print s}'` and gets 0 (T-A full rewrite across all 16 mid-density files, previous sum = 62)"
    # ── T-B (legacy-cleanup behavior) — keep `gsd-*` AS-IS, verify no accidental rewrite ──
    - "User runs `grep -c 'commands/gsd' tests/bug-1924-preserve-user-artifacts.test.cjs` and gets a value ≥ 6 (T-B intentional preservation — this test explicitly validates that install() cleans the LEGACY commands/gsd/ directory; rewriting to commands/brief/ would defeat the test. File has explicit comment at line 4 documenting this intent)"
    - "User runs `grep -c 'commands/gsd' tests/claude-skills-migration.test.cjs` and gets a value ≥ 4 (T-B intentional preservation — tests the Claude 2.1.88+ skills MIGRATION which by definition migrates FROM commands/gsd/ TO skills/. File has explicit comment at lines 7–10 documenting this intent)"
    - "User runs `grep -c 'commands/gsd' tests/removed-surfaces.smoke.txt` and gets a value ≥ 15 (T-B — this is the Plan 02 audit trail documenting what was removed; it is HISTORICAL record, not a test assertion. Keep as-is per Plan 08 scope-boundary precedent where audit/history files remained untouched)"
    # ── T-C (dual-prefix) — bug-1908 MANIFEST_NAME constant rewritten to fresh BRIEF reality ──
    - "User runs `grep -c 'gsd-file-manifest' tests/bug-1908-uninstall-manifest.test.cjs` and gets 0 (T-C classified-as-T-A on further inspection: test creates a MOCK install and calls uninstall() — after Plan 08 rewrote MANIFEST_NAME source-side to brief-file-manifest.json, the test MUST mock the fresh reality or uninstall() finds nothing to remove)"
    - "User runs `grep -c 'brief-file-manifest' tests/bug-1908-uninstall-manifest.test.cjs` and gets ≥ 2 (new constant + assertion references)"
    # ── T-C/T-D (mixed) — copilot-install.test.cjs: per-line classification (manifest/patches = T-A rewrite; line 1441 'should not exist after clean uninstall' = T-B keep) ──
    - "User runs `grep -c 'gsd-file-manifest\\|gsd-local-patches' tests/copilot-install.test.cjs` and gets 0 (T-A partial rewrite — 7 lines: 1042, 1069, 1086, 1215, 1216, 1227, 1244 rewritten to brief-* — fresh Copilot install produces brief-* manifest/patches-dir)"
    - "User runs `grep -c 'commands/gsd' tests/copilot-install.test.cjs` and gets a value ≥ 1 (T-B partial preservation — line 1441 'commands/gsd/ should not exist after clean uninstall' verifies LEGACY directory absence post-uninstall; keep)"
    # ── Every file accounted for — total post count matches expected distribution ──
    - "User runs `grep -rcE 'gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\\.cache/gsd|gsdHooks|commands/gsd' tests/ 2>/dev/null | awk -F: '{s+=\\$2} END {print s}'` and gets a value ≤ 30 (PRE ≈ 295; POST ≤ 30 = intentional T-B preservation: bug-1924 ≥6 + claude-skills-migration ≥4 + removed-surfaces ≥15 + copilot-install ≥1 + audit-trail JSDoc comments in a few T-A files describing legacy behavior can push up to ≈26; margin of 30 accommodates legitimate preservation without hiding unfinished rewrites)"
    # ── Final post-fix npm-test delta gate against Plan 08's EMPIRICAL_BASELINE=6 ──
    - "User runs `npm test 2>&1 > /tmp/plan09-post-test.txt; grep -cE '^✖' /tmp/plan09-post-test.txt` and gets a value ≤ 16 (EMPIRICAL_BASELINE=6 + DELTA_CAP=10; same gate Plan 08 Task 6 HALTed at POST=351 — Plan 09 is the test-side fix that was required to close the gate)"
    - "User opens `.planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt` and sees a section titled `## PLAN 09 POST-FIX MEASUREMENTS` containing EMPIRICAL_BASELINE=6, DELTA_CAP=16, PLAN_09_POST_COUNT=<N>, DELTA=<N-6>, GATE_RESULT=PASS (or HALT with iteration counts if 3-loop protocol triggered)"
    # ── Plan 08 source-side state unchanged (Plan 09 is pure test-side) ──
    - "User runs `git diff 89cea18 HEAD -- scripts/build-hooks.js bin/install.js hooks/dist/ brief/ agents/ docs/ README.md` and gets ONLY the commits from Plan 08 (SHAs 19fcaa2, 8f3eb9e) plus zero new source-side hunks from Plan 09 commits (Plan 09 modifies ONLY tests/ + .planning/phases/01/09-GAP-CLOSURE-AUDIT.md + 05-PRE-TEST-BASELINE.txt; NO source code touched)"
    - "User runs `grep -c \"'brief-\" scripts/build-hooks.js` and gets 11 (Plan 08 state preserved — Plan 09 did NOT re-touch scripts/build-hooks.js)"
    - "User runs `node -c bin/install.js` and exit code is 0 (Plan 08 state preserved)"
    # ── Audit artifact produced per precedent structure ──
    - "User opens `.planning/phases/01-foundation-fork-hygiene-removal-rename/09-GAP-CLOSURE-AUDIT.md` and finds the same 1–8 section structure as Plan 08's GAP-CLOSURE-PARTIAL-AUDIT.md: §1 executive summary (PASS or HALT status), §2 iteration counts for Task N+1 gate, §3 per-file PRE/POST residue table covering all 31 files, §4 T-A/T-B/T-C/T-D per-file decision table with rationale for each category assignment, §5 npm-test DELTA forensic decomposition (Plan 08 fixed these, Plan 09 fixed these, residuals broken down), §6 scope-boundary affirmation (FND-06 cross-runtime + localized README prose + CHANGELOG banner STILL deferred to Phase 9), §7 recommendation (Phase 1 ready for /brief-verify-work if PASS; or next-step recommendation if HALT), §8 working-tree / commit state at audit time"
  artifacts:
    - path: "tests/ (31 files)"
      provides: "Test files rewritten per T-A (fresh-install) / T-B (legacy-cleanup) / T-C (dual-prefix) / T-D (fixture) classification to align with post-Plan-08 source-side reality"
      contains: "T-A (26 files): source-tree + hook filename + variable references all rewritten gsd-* → brief-*; T-B (3 files — bug-1924, claude-skills-migration, removed-surfaces.smoke.txt): legacy-cleanup assertions preserved as-is with explanatory comments; T-C (1 file — bug-1908): MANIFEST_NAME constant rewritten to brief-file-manifest.json per D-07 no-aliases (the test exercises the fresh install's uninstall, so the fresh constant is correct); T-D (1 file — copilot-install): PER-LINE split — fresh-install manifest/patches lines rewritten to brief-* (T-A subset), legacy-detection line 1441 preserved (T-B subset)"
    - path: ".planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt"
      provides: "Baseline file extended with Plan 09 post-fix measurement"
      contains: "Existing Plan 05 + Plan 07 + Plan 08 sections preserved as audit trail; new `## PLAN 09 POST-FIX MEASUREMENTS` section with EMPIRICAL_BASELINE=6, DELTA_CAP=16, PLAN_09_POST_COUNT, DELTA, GATE_RESULT, plus iteration counts if HALT protocol was invoked"
    - path: ".planning/phases/01-foundation-fork-hygiene-removal-rename/09-GAP-CLOSURE-AUDIT.md"
      provides: "Forensic gap-closure audit mirroring Plan 07 and Plan 08 audit structure"
      contains: "Sections 1–8: executive summary (PASS or HALT), iteration counts, per-file PRE/POST residue table for all 31 files, T-A/T-B/T-C/T-D decision table with explicit rationale per file, npm-test delta decomposition, scope-boundary affirmation, next-step recommendation, working-tree/commit state"
  key_links:
    - from: "tests/hooks-opt-in.test.cjs + tests/install-hooks-copy.test.cjs + tests/core.test.cjs + the other 23 T-A test files"
      to: "post-Plan-08 source-side reality: hooks/brief-*.{js,sh} filenames + brief-file-manifest.json + brief-local-patches/ + .cache/brief/brief-update-check.json + briefHooks variable name"
      via: "bulk s/gsd-X/brief-X/ substitution per file (where X is the hook-name or constant stem)"
      pattern: "after fix, a T-A test that previously failed with `ENOENT: hooks/gsd-statusline.js` now succeeds because `hooks/brief-statusline.js` exists on disk (Plan 03/04 rename + Plan 08 hook-dist populate)"
    - from: "tests/bug-1924-preserve-user-artifacts.test.cjs + tests/claude-skills-migration.test.cjs + tests/removed-surfaces.smoke.txt"
      to: "Plan 08 Category-B legacy-cleanup code paths in bin/install.js (the 6 `path.join(targetDir, 'commands', 'gsd')` tuples + 2 P-B `startsWith('gsd-')` sites at lines 5671 and 5703 that were intentionally preserved)"
      via: "T-B intentional no-op — these tests validate the Category-B code paths, so their gsd-* assertions must match the source-side gsd-* literals that were KEPT"
      pattern: "after Plan 09, the legacy-cleanup path is tested end-to-end: install() detects commands/gsd/ from a pre-BRIEF install, preserves dev-preferences.md, and removes the legacy directory. The test uses `commands/gsd/` in its assertions because that's the legacy target under test — rewriting to `commands/brief/` would make the test assert the wrong thing."
    - from: "tests/bug-1908-uninstall-manifest.test.cjs"
      to: "bin/install.js MANIFEST_NAME constant at line 5213 (rewritten by Plan 08 to 'brief-file-manifest.json')"
      via: "T-C classified-as-T-A: the test creates a MOCK install; to exercise the current uninstall code, the mock must match the current installer output"
      pattern: "after Plan 09, the test creates brief-file-manifest.json and asserts uninstall() removes it — matches the fresh-install reality"
    - from: "tests/copilot-install.test.cjs"
      to: "mixed: fresh-install copilot output (brief-file-manifest.json + brief-local-patches/) + legacy-absence assertion (commands/gsd/ should not exist)"
      via: "T-D per-line split — lines 1042, 1069, 1086, 1215, 1216, 1227, 1244 rewritten to brief-* (fresh Copilot install produces these); line 1441 preserved (legacy directory absence verification — commands/gsd/ correctly absent after fresh BRIEF install + uninstall)"
      pattern: "after Plan 09, both assertions pass: (a) fresh Copilot install produces brief-file-manifest.json; (b) commands/gsd/ from a hypothetical pre-BRIEF install is also absent after uninstall"
    - from: "npm test full run post-Plan-09 edits"
      to: "05-PRE-TEST-BASELINE.txt Plan 09 section"
      via: "`grep -cE '^✖' /tmp/plan09-post-test.txt` appended as PLAN_09_POST_COUNT + DELTA + GATE_RESULT"
      pattern: "POST ≤ 16 → GATE=PASS → commit → Phase 1 ready for final `/brief-verify-work 1` → VERIFICATION.md Gap 2 transitions `failed` → `satisfied` → FND-03 full closure"
---

<objective>
Close **VERIFICATION.md Gap 2** (Plan 05 W4 delta-cap gate) by rewriting 31 test files that hardcode pre-Phase-1 `gsd-*` / `commands/gsd` / `gsdHooks` / `.cache/gsd` / `gsd-local-patches` / `gsd-file-manifest.json` vocabulary — bringing `npm test` failure count from Plan 08's POST=351 down to ≤16 (EMPIRICAL_BASELINE=6 + DELTA_CAP=10).

This plan is **test-side only**. All source-side rewrites required by D-07 no-aliases are already committed by Plan 08 (SHAs 19fcaa2 + 8f3eb9e: scripts/build-hooks.js 11-entry brief-*, bin/install.js 100+ P-A/P-B/P-C/P-D rewrites, hooks/dist/ 11 brief-* files populated). Plan 08 fully closed Gaps 3, 4, 5 (source-side FND-03) and source-side Gap 6 (hook-rename propagation); Plan 09's single responsibility is the test-side propagation that Plan 08 explicitly deferred per 08-GAP-CLOSURE-PARTIAL-AUDIT.md §7 Option A.

**Plan scope boundary (explicit — MUST be documented in 09-GAP-CLOSURE-AUDIT.md §6):**

IN scope: the 31 test files enumerated above + the baseline file (append Plan 09 section) + the new audit artifact. Per-file T-A/T-B/T-C/T-D classification applied per `<interfaces>` below.

OUT of scope — explicitly deferred (same boundaries as Plans 07 and 08):
- **Cross-runtime smoke test actual execution (FND-06 human verification)** — deferred to Phase 9 HRD-01 per ROADMAP SC #5 and ASSUMPTIONS.md FND-06 entry. Plan 09 does NOT install BRIEF in Claude Code / Codex / Gemini / OpenCode.
- **Full localized README prose rebranding** — deferred to Phase 9 (Hardening). Plan 09 does NOT touch docs/, README.md, README.*.md.
- **CHANGELOG.md historical entries** — already banner-handled by Plan 05. Plan 09 does NOT revisit.
- **Any new source-code changes** — Plan 08 fully covered the source side. Plan 09 touches ONLY tests/ + the baseline file + the new audit artifact. If an executor discovers that a test cannot be satisfied without a NEW source-side edit, that is a signal to HALT, not to expand scope.
- **Any NEW functionality** — Plan 09 is pure gap closure. No new features, no new tests beyond the audit artifact. Per-file rewrites MUST preserve each test's original intent (the thing being asserted, the test name, the describe-block organization) and change ONLY the pre-rename vocabulary.

**Commit strategy:** Per-task atomic commits (pattern `refactor(01-gap-closure-09): <scope>`). Each cluster task commits on its own so rollback is surgical. Final task: `docs(01-09): Plan 09 SUMMARY + GAP-CLOSURE-AUDIT + baseline Plan 09 section`. If the Task N+1 post-fix gate fails 3 consecutive loops, HALT protocol applies — produce `09-GAP-CLOSURE-PARTIAL-AUDIT.md` and return HALT to orchestrator (do NOT self-certify closure).

**Why this is a gap closure (not a new feature):** Plan 08 Task 6 measured POST=351 across 3 stable loops, decomposed the delta into (a) ~50 tests Plan 08 FIXED (workspace.test.cjs + worktree-*.test.cjs, previously failing on ENOENT from pre-rename paths), (b) 0 tests Plan 08 INTRODUCED (parse check clean), (c) ~300 tests that were FAILING PRE-Plan-08 and are still failing because their test source hardcodes pre-rename vocabulary (the `gsd-*` hook names, `commands/gsd/` paths, etc.). 08-GAP-CLOSURE-PARTIAL-AUDIT.md §7 explicitly recommended Plan 09 as the test-side closure for (c). This plan executes §7 Option A verbatim.

**Prerequisite state (verified at planning time 2026-04-18):** Plan 08 source-side edits are committed at SHAs 19fcaa2 and 8f3eb9e. `hooks/dist/` has 11 brief-* files (gitignored but reproducibly generated by `node scripts/build-hooks.js`). No uncommitted source-side work is expected; if the executor finds any, that is a signal to investigate before starting edits.
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
@.planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-PARTIAL-AUDIT.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-08-SUMMARY.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt

<interfaces>
<!-- =========================================================================== -->
<!-- Test-side decision framework (analog of Plan 08's P-A/P-B/P-C/P-D source-side) -->
<!-- =========================================================================== -->
<!-- T-A — Fresh-install behavior                                                 -->
<!--   Test asserts what a fresh BRIEF install produces. Hardcoded `gsd-*` values -->
<!--   are WRONG — rewrite to `brief-*`.                                          -->
<!--   Applies when:                                                               -->
<!--     - Test greps bin/install.js or brief/bin/lib/*.cjs for current code      -->
<!--       references to hook filenames / constants                               -->
<!--     - Test reads hook files from hooks/ (on-disk, renamed to brief-* by Plan -->
<!--       03/04)                                                                  -->
<!--     - Test simulates a fresh BRIEF install (mkdtemp + install() + assertion  -->
<!--       about brief-* output)                                                   -->
<!--     - Test asserts the HOOKS_TO_COPY array contents (Plan 08 wrote 11 brief- -->
<!--       entries)                                                                -->
<!--   Action: `sed -i '' 's/gsd-statusline/brief-statusline/g; s/gsd-check-update-worker/brief-check-update-worker/g; s/gsd-check-update/brief-check-update/g; s/gsd-context-monitor/brief-context-monitor/g; s/gsd-prompt-guard/brief-prompt-guard/g; s/gsd-read-injection-scanner/brief-read-injection-scanner/g; s/gsd-read-guard/brief-read-guard/g; s/gsd-workflow-guard/brief-workflow-guard/g; s/gsd-session-state/brief-session-state/g; s/gsd-validate-commit/brief-validate-commit/g; s/gsd-phase-boundary/brief-phase-boundary/g; s/gsd-local-patches/brief-local-patches/g; s/gsd-file-manifest/brief-file-manifest/g; s/\.cache\/gsd/\.cache\/brief/g; s/gsdHooks/briefHooks/g; s/commands\/gsd/commands\/brief/g' tests/<file>`                       -->
<!--                                                                               -->
<!-- T-B — Legacy-cleanup behavior                                                -->
<!--   Test specifically validates that install()/uninstall()/writeManifest()     -->
<!--   correctly detects pre-BRIEF GSD installs for cleanup/preservation/absence. -->
<!--   Hardcoded `gsd-*` is CORRECT — KEEP as-is; the file typically already has  -->
<!--   an explanatory JSDoc comment.                                              -->
<!--   Applies when:                                                               -->
<!--     - Test creates a MOCK legacy commands/gsd/ directory and asserts install -->
<!--       cleans it OR preserves user files during cleanup                       -->
<!--     - Test asserts the ABSENCE of commands/gsd/ after uninstall (verifying   -->
<!--       the legacy cleanup path ran)                                            -->
<!--     - File is an AUDIT TRAIL (removed-surfaces.smoke.txt is Plan 02's        -->
<!--       historical record of what was removed)                                  -->
<!--   Action: NO rewrite. Verify existing JSDoc comment documents the            -->
<!--   legacy-detection intent; add one if missing. Optionally add inline         -->
<!--   `// pre-BRIEF legacy path — verifying installer cleans legacy dir` at      -->
<!--   any non-obvious assertion.                                                  -->
<!--                                                                               -->
<!-- T-C — Dual-prefix behavior (both families coexist)                           -->
<!--   Test must assert behavior on BOTH fresh BRIEF install AND legacy GSD       -->
<!--   install on same machine. Extend existing assertions to cover both.         -->
<!--   Applies when:                                                               -->
<!--     - Test exercises uninstall across a mixed install (rare in this suite)   -->
<!--     - Test verifies manifest contains BOTH prefix families after upgrade     -->
<!--   Action: convert `file.startsWith('gsd-')` to `(file.startsWith('brief-')  -->
<!--   || file.startsWith('gsd-'))` where both prefix families are expected in    -->
<!--   the output; OR duplicate the test describe() block to cover both prefix    -->
<!--   families as separate scenarios.                                            -->
<!--                                                                               -->
<!-- T-D — Fixture/mock data (per-line split)                                     -->
<!--   Test file contains `gsd-*` as fixture data with MIXED semantic intent      -->
<!--   across different lines. Categorize PER LINE:                                -->
<!--     - Fixture line representing a LEGACY install scenario → keep (T-B-like)  -->
<!--     - Fixture line representing a FRESH BRIEF install → rewrite (T-A-like)   -->
<!--   Action: read each line in context, apply T-A rewrite or T-B keep rule      -->
<!--   per line. This requires manual per-occurrence review, not bulk sed.        -->
<!-- =========================================================================== -->

<!-- =========================================================================== -->
<!-- PER-FILE CLASSIFICATION (31 files) — ground-truth verified 2026-04-18       -->
<!-- =========================================================================== -->

<!-- ========= T-A cluster (26 files — bulk s/gsd-X/brief-X/ sed per file) ========= -->

<!-- File                                             PRE  T-A rationale                                                             -->
<!-- tests/hooks-opt-in.test.cjs                      51   Tests that hook files exist by name in hooks/. Plan 03/04 renamed to brief-*.                                     -->
<!-- tests/install-hooks-copy.test.cjs                35   EXPECTED_HOOKS array declares the hook filenames. Must match hooks/ on disk = brief-*.                           -->
<!-- tests/core.test.cjs                              19   MANAGED_HOOKS array + cache-path ('.cache/gsd' → '.cache/brief') + hook filename references.                     -->
<!-- tests/bug-2136-sh-hook-version.test.cjs          16   SH_HOOK_FILES array + CHECK_UPDATE_FILE/WORKER_FILE paths + version-header regex describing brief-* hooks.         -->
<!-- tests/bug-1834-sh-hooks-installed.test.cjs       13   SH_HOOKS_EXPECTED array (3 entries) + assertions referencing brief-session-state.sh/brief-validate-commit.sh/brief-phase-boundary.sh. -->
<!-- tests/workflow-guard-registration.test.cjs       12   Greps install.js for a `gsdHooks` array — Plan 08 renamed variable to `briefHooks` at line 4762 → rewrite grep pattern accordingly. -->
<!-- tests/claude-skills-migration.test.cjs           11   MIXED but 7 of 11 hits are T-A (migrate FROM commands/gsd/ TO skills/). See mixed-file note below.                -->
<!-- tests/bug-1906-hook-relative-paths.test.cjs       9   HOOK_FILENAMES array (6 entries) + hook-path assertions. All T-A.                                                   -->
<!-- tests/bugs-1656-1657.test.cjs                     9   Asserts brief-session-state.sh/brief-validate-commit.sh/brief-phase-boundary.sh exist in hooks/dist/. All T-A.       -->
<!-- tests/reapply-patches.test.cjs                    9   PATCHES_DIR_NAME + MANIFEST_NAME constants + path.join() construction sites. Plan 08 renamed source-side → test must match. -->
<!-- tests/copilot-install.test.cjs                    8   MIXED — see T-D split below.                                                                                      -->
<!-- tests/read-guard.test.cjs                         8   HOOK_PATH ref + grep for 'gsd-read-guard.js' literal in install.js (Plan 08 renamed to brief-*) + one gsdHooks reference. -->
<!-- tests/managed-hooks.test.cjs                      7   MANAGED_HOOKS_FILE = brief-check-update-worker.js + loop assertions about the array contents.                      -->
<!-- tests/orphaned-hooks.test.cjs                     7   CHECK_UPDATE_PATH + WORKER_PATH + assertion that the worker script reference resolves.                            -->
<!-- tests/bug-1754-js-hook-guard.test.cjs             5   JS_HOOKS array (5 entries) + registrationAnchor values referring to hasXxxHook (these describe install.js helpers — see note). -->
<!-- tests/read-injection-scanner.test.cjs             5   HOOK_PATH + describe() names referring to the hook's public name.                                                -->
<!-- tests/security.test.cjs                           5   monitorPath + statuslinePath + describe() names for path-traversal tests.                                        -->
<!-- tests/sh-hook-paths.test.cjs                      5   SH_HOOKS registration-commandVar table.                                                                          -->
<!-- tests/codex-config.test.cjs                       4   Codex writes config.toml references to the hook; assertion that 'brief-check-update.js' (post-Plan-08) is listed. -->
<!-- tests/package-manifest.test.cjs                   4   hooks subset of the package.json 'files' manifest — references 3 .sh filenames.                                  -->
<!-- tests/antigravity-install.test.cjs                3   manifestPath references (fresh Antigravity install writes brief-file-manifest.json).                             -->
<!-- tests/brief-statusline.test.cjs                   3   hookPath + tmpRoot prefix for the statusline hook tests.                                                         -->
<!-- tests/bug-1817-sh-hook-guard.test.cjs             3   SH_HOOKS array (3 entries).                                                                                      -->
<!-- tests/bug-2344-read-guard-claudecode-env.test.cjs 3   HOOK_PATH + tmpdir prefix.                                                                                        -->
<!-- tests/check-update-config-dir.test.cjs            2   CHECK_UPDATE_PATH + JSDoc reference.                                                                              -->
<!-- tests/bug-1974-context-exhaustion-record.test.cjs 2   HOOK_PATH + JSDoc reference.                                                                                      -->
<!-- tests/update-custom-backup.test.cjs               2   manifest filename constants (fresh-install mock) + JSDoc describing the fresh layout.                             -->
<!-- tests/semver-compare.test.cjs                     1   JSDoc @used-in reference to gsd-check-update.js → brief-check-update.js. Single-line rewrite.                     -->

<!-- ========= T-B cluster (3 files — keep gsd-* AS-IS, verify explanatory comment exists) ========= -->

<!-- File                                             PRE   T-B rationale                                                                -->
<!-- tests/bug-1924-preserve-user-artifacts.test.cjs  10   Explicit JSDoc at lines 4–22 says: "commands/gsd/ references in this file are intentional — they describe the legacy pre-BRIEF directory that install() cleans." The test creates a mock legacy install (commands/gsd/dev-preferences.md + commands/gsd/<legacy-file>.md) and asserts install() preserves dev-preferences.md while removing the legacy-GSD-command files. Rewriting to commands/brief/ would invalidate the test — install() wouldn't touch commands/brief/ since that's a fresh-install location, not a legacy-cleanup target. KEEP all 10 references. -->
<!-- tests/claude-skills-migration.test.cjs           11   Explicit JSDoc at lines 4–13 describes the migration scenario: "Tests for migrating Claude Code FROM commands/gsd/ TO skills/brief-xxx/SKILL.md". 4 of 11 hits are T-B (describe() name "Legacy commands/gsd/ cleanup" at line 358 + legacy-path mock at 369/370/392 + manifest-absence assertion at 441–445 `k.startsWith('commands/gsd/')` verifying fresh install produces no commands/gsd/ entries). The OTHER 7 hits in the file (lines 428 + other manifest references not surveyed yet) may be T-A — executor must grep the file and classify per-line. At minimum the 4 documented T-B lines stay. -->
<!-- tests/removed-surfaces.smoke.txt                 20   This is Plan 02's audit trail file (records what was removed from the GSD→BRIEF fork). It is HISTORICAL DOCUMENTATION, not a test assertion. Plan 05/07/08 scope-boundary precedent: audit trail files are preserved. KEEP all 20 references. (Note: this file is not executed by `npm test`; it's read by humans reviewing Plan 02 outcomes.) -->

<!-- ========= T-C cluster (1 file — rewrite to fresh-BRIEF reality) ========= -->

<!-- File                                             PRE  T-C rationale                                                                 -->
<!-- tests/bug-1908-uninstall-manifest.test.cjs        4   On closer inspection this is classified-as-T-A (see objective §truths): the test creates a MOCK install with MANIFEST_NAME constant, then calls uninstall() and asserts the manifest is removed. Plan 08 rewrote the real source-side MANIFEST_NAME at bin/install.js line 5213 to 'brief-file-manifest.json'. For the test to exercise the CURRENT uninstall() path, the mock must match the current installer output → rewrite all 4 `gsd-file-manifest` references to `brief-file-manifest`. (If this were truly dual-prefix T-C, the test would need a 2nd describe() covering upgrade-from-legacy-GSD installs where gsd-file-manifest.json is also detected — that's Phase 9 territory, NOT Phase 1.) -->

<!-- ========= T-D cluster (1 file — per-line split) ========= -->

<!-- File                                             PRE  T-D rationale                                                                 -->
<!-- tests/copilot-install.test.cjs                    8   PER-LINE SPLIT:                                                               -->
<!--                                                        - Line 1042: `path.join(tmpDir, 'gsd-file-manifest.json')` → T-A (fresh Copilot install writes brief-file-manifest.json) → REWRITE to brief-file-manifest.json -->
<!--                                                        - Line 1069: `path.join(tmpDir, 'gsd-local-patches')` → T-A → REWRITE        -->
<!--                                                        - Line 1086: `path.join(tmpDir, 'gsd-local-patches')` → T-A → REWRITE        -->
<!--                                                        - Line 1215: `path.join(tmpDir, '.github', 'gsd-file-manifest.json')` → T-A → REWRITE (Copilot global install at .github/ writes brief-*) -->
<!--                                                        - Line 1216: assertion about 'gsd-file-manifest.json' → T-A → REWRITE        -->
<!--                                                        - Line 1227: same pattern → T-A → REWRITE                                    -->
<!--                                                        - Line 1244: same pattern → T-A → REWRITE                                    -->
<!--                                                        - Line 1441: `'commands/gsd/ should not exist after clean uninstall'` → T-B (verifies LEGACY directory absence post-uninstall — the fresh BRIEF install never creates commands/gsd/ but this assertion guards against regression) → KEEP -->

<!-- =========================================================================== -->
<!-- BULK-SED PATTERN (T-A files — canonical single-invocation sed command)      -->
<!-- =========================================================================== -->
<!-- On macOS (BSD sed): use `sed -i ''`; on Linux (GNU sed): use `sed -i`.      -->
<!-- The planning environment is macOS (darwin 25.2.0), so:                     -->
<!--                                                                             -->
<!-- sed -i '' \                                                                 -->
<!--   -e 's|gsd-check-update-worker|brief-check-update-worker|g' \              -->
<!--   -e 's|gsd-check-update|brief-check-update|g' \                            -->
<!--   -e 's|gsd-statusline|brief-statusline|g' \                                -->
<!--   -e 's|gsd-context-monitor|brief-context-monitor|g' \                      -->
<!--   -e 's|gsd-prompt-guard|brief-prompt-guard|g' \                            -->
<!--   -e 's|gsd-read-injection-scanner|brief-read-injection-scanner|g' \        -->
<!--   -e 's|gsd-read-guard|brief-read-guard|g' \                                -->
<!--   -e 's|gsd-workflow-guard|brief-workflow-guard|g' \                        -->
<!--   -e 's|gsd-session-state|brief-session-state|g' \                          -->
<!--   -e 's|gsd-validate-commit|brief-validate-commit|g' \                      -->
<!--   -e 's|gsd-phase-boundary|brief-phase-boundary|g' \                        -->
<!--   -e 's|gsd-local-patches|brief-local-patches|g' \                          -->
<!--   -e 's|gsd-file-manifest|brief-file-manifest|g' \                          -->
<!--   -e 's|\.cache/gsd|\.cache/brief|g' \                                      -->
<!--   -e 's|gsdHooks|briefHooks|g' \                                            -->
<!--   -e 's|commands/gsd|commands/brief|g' \                                    -->
<!--   tests/<file>                                                               -->
<!--                                                                             -->
<!-- Note: `gsd-check-update-worker` MUST appear BEFORE `gsd-check-update` in    -->
<!-- the substitution list to avoid the longer string being truncated by the     -->
<!-- shorter prefix rewrite.                                                      -->
<!-- =========================================================================== -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Pre-grep enumeration — capture exact PRE residue counts for all 31 files and the total</name>
  <files>
    /tmp/plan09-pre-grep.txt
    /tmp/plan09-per-file-counts.txt
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-PARTIAL-AUDIT.md §5 and §7 (forensic analysis + Plan 09 Option A scope)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt (Plan 08 POST=351 measurement at 2026-04-18T14:00:00Z)
    - tests/bug-1924-preserve-user-artifacts.test.cjs lines 1–25 (JSDoc documenting T-B intent — context for the rule "legacy-cleanup tests KEEP gsd-*")
    - tests/claude-skills-migration.test.cjs lines 1–15 (JSDoc documenting migration scenario — context for the mixed T-A/T-B split)
    - tests/copilot-install.test.cjs lines 1041–1046 AND lines 1438–1443 (for the T-D per-line split — shows both fresh-install manifest writes and legacy-directory absence assertion)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. **Capture per-file PRE residue counts** for all 31 files. Use a single grep pass that covers every residue pattern:

```bash
RESIDUE_PATTERN='commands/gsd|gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\.cache/gsd|gsdHooks'

FILES=(
  tests/antigravity-install.test.cjs
  tests/brief-statusline.test.cjs
  tests/bug-1754-js-hook-guard.test.cjs
  tests/bug-1817-sh-hook-guard.test.cjs
  tests/bug-1834-sh-hooks-installed.test.cjs
  tests/bug-1906-hook-relative-paths.test.cjs
  tests/bug-1908-uninstall-manifest.test.cjs
  tests/bug-1924-preserve-user-artifacts.test.cjs
  tests/bug-1974-context-exhaustion-record.test.cjs
  tests/bug-2136-sh-hook-version.test.cjs
  tests/bug-2344-read-guard-claudecode-env.test.cjs
  tests/bugs-1656-1657.test.cjs
  tests/check-update-config-dir.test.cjs
  tests/claude-skills-migration.test.cjs
  tests/codex-config.test.cjs
  tests/copilot-install.test.cjs
  tests/core.test.cjs
  tests/hooks-opt-in.test.cjs
  tests/install-hooks-copy.test.cjs
  tests/managed-hooks.test.cjs
  tests/orphaned-hooks.test.cjs
  tests/package-manifest.test.cjs
  tests/read-guard.test.cjs
  tests/read-injection-scanner.test.cjs
  tests/reapply-patches.test.cjs
  tests/removed-surfaces.smoke.txt
  tests/security.test.cjs
  tests/semver-compare.test.cjs
  tests/sh-hook-paths.test.cjs
  tests/update-custom-backup.test.cjs
  tests/workflow-guard-registration.test.cjs
)

{
  echo "# Plan 09 PRE-grep per-file counts ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
  echo "# Pattern: $RESIDUE_PATTERN"
  echo ""
  for f in "${FILES[@]}"; do
    CNT=$(grep -cE "$RESIDUE_PATTERN" "$f" 2>/dev/null || echo 0)
    printf "%-60s %s\n" "$f" "$CNT"
  done
  echo ""
  echo "# TOTAL"
  grep -cE "$RESIDUE_PATTERN" "${FILES[@]}" 2>/dev/null | awk -F: '{s+=$2} END {print "TOTAL_PRE_RESIDUES:", s}'
} > /tmp/plan09-per-file-counts.txt

cat /tmp/plan09-per-file-counts.txt
```

2. **Capture full per-line grep** (for audit artifact §3 before/after table):

```bash
{
  echo "# Plan 09 PRE-grep FULL line-by-line ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
  echo ""
  for f in "${FILES[@]}"; do
    echo "===== $f ====="
    grep -nE "$RESIDUE_PATTERN" "$f" 2>/dev/null || echo "(no hits — file may have been edited)"
    echo ""
  done
} > /tmp/plan09-pre-grep.txt

wc -l /tmp/plan09-pre-grep.txt
```

3. **Sanity-check against the planner's recorded table.** Compare the output to the values in `<interfaces>` per-file table. If any file's PRE count differs by >1 from the planner's recorded value (e.g., `tests/hooks-opt-in.test.cjs` should be 51), note the drift for §3 of the audit artifact. If the totals differ by >5% (PRE ≈ 295 ± 15), STOP and flag as a BLOCKER — the file state has shifted since planning, and the per-file decisions may need revisiting.

4. **No edits in this task.** This is measurement-only. No commit yet; the pre-grep files live in `/tmp` and are referenced by later tasks and by the audit artifact.
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
[ -s /tmp/plan09-per-file-counts.txt ] || { echo "FAIL: per-file counts empty"; exit 1; }
[ -s /tmp/plan09-pre-grep.txt ] || { echo "FAIL: pre-grep empty"; exit 1; }
grep -q "^TOTAL_PRE_RESIDUES:" /tmp/plan09-per-file-counts.txt || { echo "FAIL: total line missing"; exit 1; }
TOTAL=$(grep "^TOTAL_PRE_RESIDUES:" /tmp/plan09-per-file-counts.txt | awk "{print \$2}")
[ "$TOTAL" -ge 260 ] && [ "$TOTAL" -le 330 ] || { echo "FAIL: PRE total $TOTAL outside expected 260–330 range (planner measured 295)"; exit 1; }
echo "OK: Task 1 — PRE_TOTAL=$TOTAL (within 260–330 band)"
'
    </automated>
  </verify>
  <done>
    - `/tmp/plan09-per-file-counts.txt` exists with 31 per-file counts and TOTAL_PRE_RESIDUES line
    - `/tmp/plan09-pre-grep.txt` exists with full grep -n output for audit §3
    - Total residue count is within 260–330 (sanity band around planner's 295 measurement)
    - No edits made to tests/ yet — pure measurement
  </done>
</task>

<task type="auto">
  <name>Task 2: T-A bulk rewrite — hook-focused cluster (11 high-density files, ~250 residues)</name>
  <files>
    tests/hooks-opt-in.test.cjs
    tests/install-hooks-copy.test.cjs
    tests/core.test.cjs
    tests/bug-2136-sh-hook-version.test.cjs
    tests/bug-1834-sh-hooks-installed.test.cjs
    tests/bug-1906-hook-relative-paths.test.cjs
    tests/bugs-1656-1657.test.cjs
    tests/managed-hooks.test.cjs
    tests/orphaned-hooks.test.cjs
    tests/bug-1754-js-hook-guard.test.cjs
    tests/bug-1817-sh-hook-guard.test.cjs
  </files>
  <read_first>
    - Read each file's first 30 lines (JSDoc / EXPECTED_HOOKS arrays / HOOK_PATH constants) to confirm T-A classification
    - Verify no file has a JSDoc note saying "gsd-* references here are intentional" (that would flip it to T-B)
    - hooks/ directory listing: `ls -la hooks/*.js hooks/*.sh 2>/dev/null` confirms 11 brief-* files on disk (Plan 03/04 rename complete)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

Apply the canonical bulk-sed from `<interfaces>` to each file. Each file is independent — any order works, but committing them together as one atomic "hook-focused cluster" commit is cleanest.

```bash
T_A_HOOK_CLUSTER=(
  tests/hooks-opt-in.test.cjs
  tests/install-hooks-copy.test.cjs
  tests/core.test.cjs
  tests/bug-2136-sh-hook-version.test.cjs
  tests/bug-1834-sh-hooks-installed.test.cjs
  tests/bug-1906-hook-relative-paths.test.cjs
  tests/bugs-1656-1657.test.cjs
  tests/managed-hooks.test.cjs
  tests/orphaned-hooks.test.cjs
  tests/bug-1754-js-hook-guard.test.cjs
  tests/bug-1817-sh-hook-guard.test.cjs
)

for f in "${T_A_HOOK_CLUSTER[@]}"; do
  sed -i '' \
    -e 's|gsd-check-update-worker|brief-check-update-worker|g' \
    -e 's|gsd-check-update|brief-check-update|g' \
    -e 's|gsd-statusline|brief-statusline|g' \
    -e 's|gsd-context-monitor|brief-context-monitor|g' \
    -e 's|gsd-prompt-guard|brief-prompt-guard|g' \
    -e 's|gsd-read-injection-scanner|brief-read-injection-scanner|g' \
    -e 's|gsd-read-guard|brief-read-guard|g' \
    -e 's|gsd-workflow-guard|brief-workflow-guard|g' \
    -e 's|gsd-session-state|brief-session-state|g' \
    -e 's|gsd-validate-commit|brief-validate-commit|g' \
    -e 's|gsd-phase-boundary|brief-phase-boundary|g' \
    -e 's|gsd-local-patches|brief-local-patches|g' \
    -e 's|gsd-file-manifest|brief-file-manifest|g' \
    -e 's|\.cache/gsd|\.cache/brief|g' \
    -e 's|gsdHooks|briefHooks|g' \
    -e 's|commands/gsd|commands/brief|g' \
    "$f"
done
```

Post-sed verification per file:
```bash
RESIDUE_PATTERN='commands/gsd|gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\.cache/gsd|gsdHooks'

for f in "${T_A_HOOK_CLUSTER[@]}"; do
  CNT=$(grep -cE "$RESIDUE_PATTERN" "$f" 2>/dev/null || echo 0)
  if [ "$CNT" != "0" ]; then
    echo "FAIL: $f still has $CNT residues"
    grep -nE "$RESIDUE_PATTERN" "$f"
    exit 1
  fi
done
echo "OK: Task 2 — all 11 T-A hook-cluster files have 0 residues"

# Syntax sanity: every .cjs file must still parse
for f in "${T_A_HOOK_CLUSTER[@]}"; do
  node -c "$f" 2>/dev/null || { echo "FAIL: $f syntax error"; exit 1; }
done
echo "OK: Task 2 — all 11 files parse cleanly"
```

Commit:
```bash
git add tests/hooks-opt-in.test.cjs tests/install-hooks-copy.test.cjs tests/core.test.cjs \
        tests/bug-2136-sh-hook-version.test.cjs tests/bug-1834-sh-hooks-installed.test.cjs \
        tests/bug-1906-hook-relative-paths.test.cjs tests/bugs-1656-1657.test.cjs \
        tests/managed-hooks.test.cjs tests/orphaned-hooks.test.cjs \
        tests/bug-1754-js-hook-guard.test.cjs tests/bug-1817-sh-hook-guard.test.cjs

git commit -m "$(cat <<'EOF'
refactor(01-gap-closure-09): T-A hook-cluster — rewrite 11 test files (~250 residues)

Rewrites 11 high-density test files (hooks-opt-in, install-hooks-copy, core,
bug-2136, bug-1834, bug-1906, bugs-1656-1657, managed-hooks, orphaned-hooks,
bug-1754, bug-1817) from pre-rename gsd-* hook vocabulary to brief-*. All
files classified T-A (fresh-install behavior) per 09-PLAN.md <interfaces>
— these tests assert the current source-side reality that Plan 08 delivered
at SHAs 19fcaa2 + 8f3eb9e (scripts/build-hooks.js 11 brief-* entries,
bin/install.js 100+ P-A/P-B/P-C/P-D rewrites).

Per-file pre-residue counts: hooks-opt-in=51, install-hooks-copy=35, core=19,
bug-2136=16, bug-1834=13, bug-1906=9, bugs-1656-1657=9, managed-hooks=7,
orphaned-hooks=7, bug-1754=5, bug-1817=3. Post-fix all 11 files have 0
residues and parse cleanly under `node -c`.

Scope boundary: tests/ only; no source-side edits (Plan 08 covered source).

Part of Plan 09 test-side bulk rewrite — VERIFICATION.md Gap 2 (W4 delta-cap)
closure + FND-03 full closure target.
EOF
)"
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
RESIDUE_PATTERN="commands/gsd|gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\.cache/gsd|gsdHooks"

FILES="tests/hooks-opt-in.test.cjs tests/install-hooks-copy.test.cjs tests/core.test.cjs tests/bug-2136-sh-hook-version.test.cjs tests/bug-1834-sh-hooks-installed.test.cjs tests/bug-1906-hook-relative-paths.test.cjs tests/bugs-1656-1657.test.cjs tests/managed-hooks.test.cjs tests/orphaned-hooks.test.cjs tests/bug-1754-js-hook-guard.test.cjs tests/bug-1817-sh-hook-guard.test.cjs"

for f in $FILES; do
  CNT=$(grep -cE "$RESIDUE_PATTERN" "$f" 2>/dev/null || echo 0)
  [ "$CNT" = "0" ] || { echo "FAIL: $f residues=$CNT"; exit 1; }
  node -c "$f" 2>/dev/null || { echo "FAIL: $f syntax"; exit 1; }
done

git log -1 --oneline | grep -q "T-A hook-cluster" || { echo "FAIL: commit missing"; exit 1; }
echo "OK: Task 2 verified — 11 T-A hook-cluster files rewritten, parsed, committed"
'
    </automated>
  </verify>
  <done>
    - 11 test files in the T-A hook cluster have 0 residues post-sed
    - Each file still parses via `node -c`
    - Atomic commit applied with message documenting T-A classification and Plan 08 source-side precedent
    - /tmp/plan09-per-file-counts.txt reference preserved for audit artifact
  </done>
</task>

<task type="auto">
  <name>Task 3: T-A bulk rewrite — manifest/install cluster (9 mid-density files, ~40 residues)</name>
  <files>
    tests/reapply-patches.test.cjs
    tests/workflow-guard-registration.test.cjs
    tests/read-guard.test.cjs
    tests/read-injection-scanner.test.cjs
    tests/security.test.cjs
    tests/sh-hook-paths.test.cjs
    tests/codex-config.test.cjs
    tests/package-manifest.test.cjs
    tests/antigravity-install.test.cjs
  </files>
  <read_first>
    - tests/workflow-guard-registration.test.cjs lines 60–100 (the `gsdHooks` array-grep pattern — must rewrite to `briefHooks` matching Plan 08 source-side variable rename at bin/install.js line 4762)
    - tests/read-guard.test.cjs lines 200–220 (the one `gsdHooks` mention at line 214)
    - tests/read-injection-scanner.test.cjs lines 1–30 (to confirm no T-B markers)
    - tests/security.test.cjs lines 420–475 (monitorPath/statuslinePath describe blocks)
  </read_first>
  <action>
From repo root:

```bash
T_A_MANIFEST_INSTALL=(
  tests/reapply-patches.test.cjs
  tests/workflow-guard-registration.test.cjs
  tests/read-guard.test.cjs
  tests/read-injection-scanner.test.cjs
  tests/security.test.cjs
  tests/sh-hook-paths.test.cjs
  tests/codex-config.test.cjs
  tests/package-manifest.test.cjs
  tests/antigravity-install.test.cjs
)

for f in "${T_A_MANIFEST_INSTALL[@]}"; do
  sed -i '' \
    -e 's|gsd-check-update-worker|brief-check-update-worker|g' \
    -e 's|gsd-check-update|brief-check-update|g' \
    -e 's|gsd-statusline|brief-statusline|g' \
    -e 's|gsd-context-monitor|brief-context-monitor|g' \
    -e 's|gsd-prompt-guard|brief-prompt-guard|g' \
    -e 's|gsd-read-injection-scanner|brief-read-injection-scanner|g' \
    -e 's|gsd-read-guard|brief-read-guard|g' \
    -e 's|gsd-workflow-guard|brief-workflow-guard|g' \
    -e 's|gsd-session-state|brief-session-state|g' \
    -e 's|gsd-validate-commit|brief-validate-commit|g' \
    -e 's|gsd-phase-boundary|brief-phase-boundary|g' \
    -e 's|gsd-local-patches|brief-local-patches|g' \
    -e 's|gsd-file-manifest|brief-file-manifest|g' \
    -e 's|\.cache/gsd|\.cache/brief|g' \
    -e 's|gsdHooks|briefHooks|g' \
    -e 's|commands/gsd|commands/brief|g' \
    "$f"
done
```

Per-file verify:
```bash
RESIDUE_PATTERN='commands/gsd|gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\.cache/gsd|gsdHooks'

for f in "${T_A_MANIFEST_INSTALL[@]}"; do
  CNT=$(grep -cE "$RESIDUE_PATTERN" "$f" 2>/dev/null || echo 0)
  [ "$CNT" = "0" ] || { echo "FAIL: $f has $CNT residues"; grep -nE "$RESIDUE_PATTERN" "$f"; exit 1; }
  node -c "$f" 2>/dev/null || { echo "FAIL: $f syntax"; exit 1; }
done
echo "OK: Task 3 — 9 T-A manifest/install files rewritten"
```

Special note for `tests/workflow-guard-registration.test.cjs`: this file greps `bin/install.js` SOURCE for a variable literally named `gsdHooks`. Plan 08 renamed that variable to `briefHooks` at bin/install.js line 4762 — the `s|gsdHooks|briefHooks|g` sed in the loop correctly updates the test to grep for the NEW variable name. Confirm by reading the test's describe() block after the rewrite — it should say `briefHooks` everywhere.

Commit:
```bash
git add tests/reapply-patches.test.cjs tests/workflow-guard-registration.test.cjs \
        tests/read-guard.test.cjs tests/read-injection-scanner.test.cjs \
        tests/security.test.cjs tests/sh-hook-paths.test.cjs \
        tests/codex-config.test.cjs tests/package-manifest.test.cjs \
        tests/antigravity-install.test.cjs

git commit -m "$(cat <<'EOF'
refactor(01-gap-closure-09): T-A manifest/install cluster — 9 test files

Rewrites 9 test files (reapply-patches, workflow-guard-registration, read-guard,
read-injection-scanner, security, sh-hook-paths, codex-config, package-manifest,
antigravity-install) from pre-rename vocabulary to brief-*. All T-A.

Notable: workflow-guard-registration.test.cjs greps bin/install.js for a
variable named `gsdHooks` — Plan 08 renamed that variable to `briefHooks`
at line 4762. The sed rewrite aligns the test's grep pattern with Plan 08's
source-side rename. read-guard.test.cjs line 214 similarly references the
renamed variable.

Per-file pre-residue counts: reapply-patches=9, workflow-guard-registration=12,
read-guard=8, read-injection-scanner=5, security=5, sh-hook-paths=5,
codex-config=4, package-manifest=4, antigravity-install=3. Post-fix: 0.

Part of Plan 09 test-side bulk rewrite.
EOF
)"
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
RESIDUE_PATTERN="commands/gsd|gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\.cache/gsd|gsdHooks"

FILES="tests/reapply-patches.test.cjs tests/workflow-guard-registration.test.cjs tests/read-guard.test.cjs tests/read-injection-scanner.test.cjs tests/security.test.cjs tests/sh-hook-paths.test.cjs tests/codex-config.test.cjs tests/package-manifest.test.cjs tests/antigravity-install.test.cjs"

for f in $FILES; do
  CNT=$(grep -cE "$RESIDUE_PATTERN" "$f" 2>/dev/null || echo 0)
  [ "$CNT" = "0" ] || { echo "FAIL: $f residues=$CNT"; exit 1; }
  node -c "$f" 2>/dev/null || { echo "FAIL: $f syntax"; exit 1; }
done

# briefHooks must appear in workflow-guard-registration (proving the rename flowed through)
grep -q "briefHooks" tests/workflow-guard-registration.test.cjs || { echo "FAIL: briefHooks not present in workflow-guard-registration"; exit 1; }

git log -1 --oneline | grep -q "T-A manifest/install cluster" || { echo "FAIL: commit missing"; exit 1; }
echo "OK: Task 3 verified — 9 T-A manifest/install files rewritten, briefHooks propagated, committed"
'
    </automated>
  </verify>
  <done>
    - 9 test files have 0 residues post-sed and parse cleanly
    - `briefHooks` appears in workflow-guard-registration.test.cjs (Plan 08 variable rename propagated to the source-grep test)
    - Atomic commit applied
  </done>
</task>

<task type="auto">
  <name>Task 4: T-A bulk rewrite — low-density cluster (6 files, ~12 residues) + T-C bug-1908 rewrite + T-A bug-1908 confirmation</name>
  <files>
    tests/brief-statusline.test.cjs
    tests/bug-2344-read-guard-claudecode-env.test.cjs
    tests/check-update-config-dir.test.cjs
    tests/bug-1974-context-exhaustion-record.test.cjs
    tests/update-custom-backup.test.cjs
    tests/semver-compare.test.cjs
    tests/bug-1908-uninstall-manifest.test.cjs
  </files>
  <read_first>
    - tests/bug-1908-uninstall-manifest.test.cjs full file (~120 lines) to confirm T-C-classified-as-T-A rationale: the test creates a MOCK install with MANIFEST_NAME, then calls uninstall() and asserts the manifest is removed. Plan 08 rewrote source-side MANIFEST_NAME to 'brief-file-manifest.json' — the mock must match. No T-B component in this file (no legacy-from-pre-BRIEF scenario).
    - tests/semver-compare.test.cjs line 2 (single JSDoc reference — trivial rewrite)
  </read_first>
  <action>
From repo root:

```bash
T_A_LOW_DENSITY=(
  tests/brief-statusline.test.cjs
  tests/bug-2344-read-guard-claudecode-env.test.cjs
  tests/check-update-config-dir.test.cjs
  tests/bug-1974-context-exhaustion-record.test.cjs
  tests/update-custom-backup.test.cjs
  tests/semver-compare.test.cjs
  tests/bug-1908-uninstall-manifest.test.cjs
)

for f in "${T_A_LOW_DENSITY[@]}"; do
  sed -i '' \
    -e 's|gsd-check-update-worker|brief-check-update-worker|g' \
    -e 's|gsd-check-update|brief-check-update|g' \
    -e 's|gsd-statusline|brief-statusline|g' \
    -e 's|gsd-context-monitor|brief-context-monitor|g' \
    -e 's|gsd-prompt-guard|brief-prompt-guard|g' \
    -e 's|gsd-read-injection-scanner|brief-read-injection-scanner|g' \
    -e 's|gsd-read-guard|brief-read-guard|g' \
    -e 's|gsd-workflow-guard|brief-workflow-guard|g' \
    -e 's|gsd-session-state|brief-session-state|g' \
    -e 's|gsd-validate-commit|brief-validate-commit|g' \
    -e 's|gsd-phase-boundary|brief-phase-boundary|g' \
    -e 's|gsd-local-patches|brief-local-patches|g' \
    -e 's|gsd-file-manifest|brief-file-manifest|g' \
    -e 's|\.cache/gsd|\.cache/brief|g' \
    -e 's|gsdHooks|briefHooks|g' \
    -e 's|commands/gsd|commands/brief|g' \
    "$f"
done
```

Per-file verify:
```bash
RESIDUE_PATTERN='commands/gsd|gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\.cache/gsd|gsdHooks'

for f in "${T_A_LOW_DENSITY[@]}"; do
  CNT=$(grep -cE "$RESIDUE_PATTERN" "$f" 2>/dev/null || echo 0)
  [ "$CNT" = "0" ] || { echo "FAIL: $f residues=$CNT"; grep -nE "$RESIDUE_PATTERN" "$f"; exit 1; }
  node -c "$f" 2>/dev/null || { echo "FAIL: $f syntax"; exit 1; }
done

# Additional verify for bug-1908 (T-C-classified-as-T-A): new MANIFEST_NAME constant present
grep -q "MANIFEST_NAME = 'brief-file-manifest.json'" tests/bug-1908-uninstall-manifest.test.cjs || { echo "FAIL: bug-1908 MANIFEST_NAME constant not rewritten"; exit 1; }
grep -c "brief-file-manifest" tests/bug-1908-uninstall-manifest.test.cjs | xargs -I {} test {} -ge 2 || { echo "FAIL: bug-1908 needs ≥2 brief-file-manifest references"; exit 1; }

echo "OK: Task 4 — 7 low-density files rewritten (including bug-1908 T-C-classified-as-T-A)"
```

Commit:
```bash
git add tests/brief-statusline.test.cjs tests/bug-2344-read-guard-claudecode-env.test.cjs \
        tests/check-update-config-dir.test.cjs tests/bug-1974-context-exhaustion-record.test.cjs \
        tests/update-custom-backup.test.cjs tests/semver-compare.test.cjs \
        tests/bug-1908-uninstall-manifest.test.cjs

git commit -m "$(cat <<'EOF'
refactor(01-gap-closure-09): T-A low-density + T-C→T-A bug-1908

Rewrites 7 remaining test files from pre-rename vocabulary to brief-*.

Six T-A low-density: brief-statusline (3), bug-2344 (3), check-update-config-dir
(2), bug-1974 (2), update-custom-backup (2), semver-compare (1). Mechanical
rewrite same as Tasks 2–3.

One T-C-classified-as-T-A: bug-1908-uninstall-manifest (4). On close inspection
the test creates a MOCK install and calls uninstall() — to exercise the current
uninstall code path, the mock MUST match Plan 08's source-side rewrite of
MANIFEST_NAME to 'brief-file-manifest.json' (bin/install.js line 5213). No
dual-prefix scenario applicable in Phase 1.

Part of Plan 09 test-side bulk rewrite. After this task, all 27 T-A files
(11 hook + 9 manifest/install + 7 low-density) have 0 residues.

Remaining: Task 5 T-D per-line split (copilot-install) + Task 6 T-B verify
(bug-1924, claude-skills-migration, removed-surfaces.smoke.txt).
EOF
)"
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
RESIDUE_PATTERN="commands/gsd|gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\.cache/gsd|gsdHooks"

FILES="tests/brief-statusline.test.cjs tests/bug-2344-read-guard-claudecode-env.test.cjs tests/check-update-config-dir.test.cjs tests/bug-1974-context-exhaustion-record.test.cjs tests/update-custom-backup.test.cjs tests/semver-compare.test.cjs tests/bug-1908-uninstall-manifest.test.cjs"

for f in $FILES; do
  CNT=$(grep -cE "$RESIDUE_PATTERN" "$f" 2>/dev/null || echo 0)
  [ "$CNT" = "0" ] || { echo "FAIL: $f residues=$CNT"; exit 1; }
  node -c "$f" 2>/dev/null || { echo "FAIL: $f syntax"; exit 1; }
done

grep -q "MANIFEST_NAME = .brief-file-manifest" tests/bug-1908-uninstall-manifest.test.cjs || { echo "FAIL: bug-1908 MANIFEST_NAME"; exit 1; }

git log -1 --oneline | grep -q "T-A low-density" || { echo "FAIL: commit missing"; exit 1; }
echo "OK: Task 4 verified"
'
    </automated>
  </verify>
  <done>
    - 7 files have 0 residues and parse cleanly
    - bug-1908 has `MANIFEST_NAME = 'brief-file-manifest.json'` matching Plan 08 source-side constant rename
    - Atomic commit applied
    - All 27 T-A files are now rewritten (11 + 9 + 7 = 27)
  </done>
</task>

<task type="auto">
  <name>Task 5: T-D per-line split — tests/copilot-install.test.cjs (manifest/patches rewrite, legacy-absence preserve)</name>
  <files>
    tests/copilot-install.test.cjs
  </files>
  <read_first>
    - tests/copilot-install.test.cjs lines 1040–1090 (manifest + patches dir — T-A subset)
    - tests/copilot-install.test.cjs lines 1210–1250 (more manifest refs — T-A subset)
    - tests/copilot-install.test.cjs lines 1435–1450 (legacy-absence assertion — T-B subset)
  </read_first>
  <action>
From repo root:

This file has mixed classification. Per `<interfaces>` T-D section, 7 lines rewrite to brief-* (fresh Copilot install output) and 1 line preserves `commands/gsd/` (legacy directory absence verification).

**Step 1 — Bulk sed the 7 T-A-subset residues (`gsd-file-manifest`, `gsd-local-patches`).** These are manifest and patches-dir references in mock Copilot installs — fresh BRIEF installs produce brief-* outputs per Plan 08 source-side PATCHES_DIR_NAME/MANIFEST_NAME rewrites:

```bash
sed -i '' \
  -e 's|gsd-file-manifest|brief-file-manifest|g' \
  -e 's|gsd-local-patches|brief-local-patches|g' \
  tests/copilot-install.test.cjs
```

**Step 2 — Verify the legacy-absence line 1441 was NOT accidentally rewritten.** The sed pattern above only touches `gsd-file-manifest` and `gsd-local-patches` substrings; it leaves `commands/gsd/` untouched. Confirm:

```bash
grep -n "commands/gsd" tests/copilot-install.test.cjs
# Expect: exactly 1 line — line 1441 (ish) — `'commands/gsd/ should not exist after clean uninstall'`
```

If the grep returns more than 1 line, the T-D split has misfired — inspect each occurrence and classify per `<interfaces>` rule.

**Step 3 — Add an inline comment on line 1441 documenting T-B preservation intent** (helps future readers avoid accidentally rewriting it):

Use the Edit tool. Read the current form of line 1441 first, then add a trailing `// T-B: verifies LEGACY commands/gsd/ absence after uninstall — do NOT rewrite to commands/brief/ (that would verify fresh BRIEF install's non-existence, which is a different assertion)` comment on the same line OR on the preceding line. Preserve the original assertion text verbatim.

**Step 4 — Verify final state:**

```bash
# Fresh-install residues gone:
GSD_MANIFEST=$(grep -c "gsd-file-manifest" tests/copilot-install.test.cjs)
GSD_PATCHES=$(grep -c "gsd-local-patches" tests/copilot-install.test.cjs)
[ "$GSD_MANIFEST" = "0" ] || { echo "FAIL: gsd-file-manifest still present"; exit 1; }
[ "$GSD_PATCHES" = "0" ] || { echo "FAIL: gsd-local-patches still present"; exit 1; }

# brief-* replacements present:
BRIEF_MANIFEST=$(grep -c "brief-file-manifest" tests/copilot-install.test.cjs)
BRIEF_PATCHES=$(grep -c "brief-local-patches" tests/copilot-install.test.cjs)
[ "$BRIEF_MANIFEST" -ge 5 ] || { echo "FAIL: brief-file-manifest count $BRIEF_MANIFEST < 5"; exit 1; }
[ "$BRIEF_PATCHES" -ge 2 ] || { echo "FAIL: brief-local-patches count $BRIEF_PATCHES < 2"; exit 1; }

# Legacy-absence line preserved:
COMMANDS_GSD=$(grep -c "commands/gsd" tests/copilot-install.test.cjs)
[ "$COMMANDS_GSD" -ge 1 ] || { echo "FAIL: commands/gsd legacy-absence assertion missing (expected ≥1)"; exit 1; }

# Syntax intact:
node -c tests/copilot-install.test.cjs || { echo "FAIL: syntax"; exit 1; }

echo "OK: Task 5 — copilot-install T-D split complete"
```

Commit:
```bash
git add tests/copilot-install.test.cjs
git commit -m "$(cat <<'EOF'
refactor(01-gap-closure-09): T-D copilot-install — per-line split

Applies per-line classification to tests/copilot-install.test.cjs:

T-A subset (7 lines rewritten gsd-* → brief-*):
  - Line 1042: gsd-file-manifest.json → brief-file-manifest.json
  - Lines 1069, 1086: gsd-local-patches → brief-local-patches
  - Lines 1215, 1216, 1227, 1244: .github/gsd-file-manifest.json → brief-*
  These match Plan 08's source-side PATCHES_DIR_NAME/MANIFEST_NAME rewrites
  at bin/install.js lines 5212–5213.

T-B subset (1 line preserved):
  - Line 1441: 'commands/gsd/ should not exist after clean uninstall'
  This verifies LEGACY directory absence post-uninstall — rewriting to
  commands/brief/ would verify a different assertion (fresh BRIEF install
  non-existence). Inline comment added to flag the intentional preservation.

Part of Plan 09 test-side bulk rewrite.
EOF
)"
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
[ "$(grep -c "gsd-file-manifest" tests/copilot-install.test.cjs)" = "0" ] || { echo "FAIL: gsd-file-manifest still present"; exit 1; }
[ "$(grep -c "gsd-local-patches" tests/copilot-install.test.cjs)" = "0" ] || { echo "FAIL: gsd-local-patches still present"; exit 1; }
[ "$(grep -c "brief-file-manifest" tests/copilot-install.test.cjs)" -ge 5 ] || { echo "FAIL: brief-file-manifest count low"; exit 1; }
[ "$(grep -c "brief-local-patches" tests/copilot-install.test.cjs)" -ge 2 ] || { echo "FAIL: brief-local-patches count low"; exit 1; }
[ "$(grep -c "commands/gsd" tests/copilot-install.test.cjs)" -ge 1 ] || { echo "FAIL: legacy-absence assertion missing"; exit 1; }
node -c tests/copilot-install.test.cjs || { echo "FAIL: syntax"; exit 1; }
git log -1 --oneline | grep -q "T-D copilot-install" || { echo "FAIL: commit missing"; exit 1; }
echo "OK: Task 5 verified"
'
    </automated>
  </verify>
  <done>
    - 7 T-A-subset lines rewritten to brief-*
    - 1 T-B-subset line (line 1441) preserved with explanatory inline comment
    - node -c succeeds
    - Atomic commit applied
  </done>
</task>

<task type="auto">
  <name>Task 6: T-B verification — confirm 3 legacy-cleanup files intentionally retain gsd-* references</name>
  <files>
    tests/bug-1924-preserve-user-artifacts.test.cjs
    tests/claude-skills-migration.test.cjs
    tests/removed-surfaces.smoke.txt
  </files>
  <read_first>
    - tests/bug-1924-preserve-user-artifacts.test.cjs lines 1–25 (existing JSDoc documenting T-B intent)
    - tests/claude-skills-migration.test.cjs lines 1–15 (existing JSDoc documenting migration scenario)
    - tests/removed-surfaces.smoke.txt first 20 lines (audit trail header)
  </read_first>
  <action>
From repo root:

This is a **verification-only task with optional annotation**. No bulk sed. No source rewrite. The goal is to document that these 3 files INTENTIONALLY retain their pre-rename vocabulary and to ensure each file has a clear JSDoc/comment explaining why.

**Step 1 — Verify each file already has an explanatory header.**

```bash
# bug-1924 — already has JSDoc at lines 1–25:
head -25 tests/bug-1924-preserve-user-artifacts.test.cjs
# Expect: 'commands/gsd/' references in this file are intentional... (already present per planner read)

# claude-skills-migration — already has JSDoc at lines 1–15:
head -15 tests/claude-skills-migration.test.cjs
# Expect: migrating Claude Code from commands/gsd/ to skills/... (already present per planner read)

# removed-surfaces.smoke.txt — this IS the audit trail; it should identify itself as such:
head -10 tests/removed-surfaces.smoke.txt
# Expect: a header explaining it's the Plan 02 removed-surfaces record
```

**Step 2 — If any file lacks an explanatory header, add one.** Use the Edit tool to prepend (or update) a block comment/JSDoc clearly stating:
- The test's purpose
- Why `gsd-*` / `commands/gsd/` references are intentional and must NOT be rewritten to brief-*
- Reference to Plan 09 T-B classification

**Step 3 — Record PRE counts match POST counts (no change expected).**

```bash
RESIDUE_PATTERN='commands/gsd|gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\.cache/gsd|gsdHooks'

for f in tests/bug-1924-preserve-user-artifacts.test.cjs tests/claude-skills-migration.test.cjs tests/removed-surfaces.smoke.txt; do
  CNT=$(grep -cE "$RESIDUE_PATTERN" "$f" 2>/dev/null || echo 0)
  echo "$f: $CNT residues (T-B intentional — preserved)"
done

# Strict lower bounds per <interfaces>:
[ "$(grep -c 'commands/gsd' tests/bug-1924-preserve-user-artifacts.test.cjs)" -ge 6 ] || { echo "FAIL: bug-1924 commands/gsd count dropped below 6 — something was rewritten accidentally"; exit 1; }
[ "$(grep -c 'commands/gsd' tests/claude-skills-migration.test.cjs)" -ge 4 ] || { echo "FAIL: claude-skills-migration commands/gsd count dropped below 4"; exit 1; }
[ "$(grep -c 'commands/gsd' tests/removed-surfaces.smoke.txt)" -ge 15 ] || { echo "FAIL: removed-surfaces.smoke.txt commands/gsd count dropped below 15"; exit 1; }
```

Note about claude-skills-migration: per `<interfaces>`, the file has a mix of T-A and T-B hits. The 4 documented T-B lines (358, 369, 370, 392, 441–445) stay. The OTHER 7 hits (e.g., line 428 `gsd-file-manifest.json` in a manifest-absence assertion — this is T-A because it's about the fresh BRIEF install) MAY need rewriting. Executor: grep the file, classify each line, apply T-A rewrite ONLY to lines that describe the fresh BRIEF install's output (not the legacy cleanup scenario). Decision heuristic:

- `describe('Legacy commands/gsd/ cleanup', () => { ... })` block (lines ~358–400) → keep ALL `gsd-*` / `commands/gsd/` inside → T-B
- Outside that describe block, `gsd-file-manifest.json` refs describing fresh-install manifest output → REWRITE to `brief-file-manifest.json` → T-A
- Inside the `k.startsWith('commands/gsd/')` manifest-absence assertion at line 441–445 → T-B (verifies fresh install produces NO commands/gsd/ entries; the string "commands/gsd/" is the thing being checked for absence)

If this per-line split is needed, apply it with Edit tool (not sed) to preserve surgical control. Post-fix, the file should have ≥4 `commands/gsd` references (the T-B block).

**Step 4 — Commit the (possibly annotation-only, possibly per-line-edited) result.**

```bash
git add tests/bug-1924-preserve-user-artifacts.test.cjs tests/claude-skills-migration.test.cjs tests/removed-surfaces.smoke.txt

# If git detects no changes in a file (pure verification, no edits), git add is a no-op and the commit will only include changed files. That's fine — T-B means "no change expected"; a no-op commit for those files is correct.

if ! git diff --cached --quiet; then
  git commit -m "$(cat <<'EOF'
docs(01-gap-closure-09): T-B verification — 3 legacy-cleanup files preserved

Explicitly documents that 3 test files intentionally retain pre-rename
vocabulary (gsd-* / commands/gsd/) because they validate LEGACY pre-BRIEF
install detection/cleanup paths:

  - tests/bug-1924-preserve-user-artifacts.test.cjs (10 refs — asserts
    install() preserves user dev-preferences.md while cleaning the legacy
    commands/gsd/ directory)
  - tests/claude-skills-migration.test.cjs (≥4 T-B refs inside the
    "Legacy commands/gsd/ cleanup" describe block — plus any T-A refs in
    fresh-install assertions rewritten)
  - tests/removed-surfaces.smoke.txt (20 refs — Plan 02 audit trail record
    of what was removed; historical documentation, not a test assertion)

Part of Plan 09 test-side bulk rewrite. These files validate the Plan 08
source-side Category-B legacy-cleanup code paths (bin/install.js lines
4623/4633/4675/4697/5594/5645 targetDir,commands,gsd tuples + lines 5671/5703
P-B startsWith gsd- sites).
EOF
)"
else
  echo "No changes to T-B files — verification-only, no commit needed"
fi
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
[ "$(grep -c "commands/gsd" tests/bug-1924-preserve-user-artifacts.test.cjs)" -ge 6 ] || { echo "FAIL: bug-1924 dropped below 6"; exit 1; }
[ "$(grep -c "commands/gsd" tests/claude-skills-migration.test.cjs)" -ge 4 ] || { echo "FAIL: claude-skills-migration dropped below 4"; exit 1; }
[ "$(grep -c "commands/gsd" tests/removed-surfaces.smoke.txt)" -ge 15 ] || { echo "FAIL: removed-surfaces dropped below 15"; exit 1; }
node -c tests/bug-1924-preserve-user-artifacts.test.cjs || { echo "FAIL: bug-1924 syntax"; exit 1; }
node -c tests/claude-skills-migration.test.cjs || { echo "FAIL: claude-skills-migration syntax"; exit 1; }
echo "OK: Task 6 — T-B files preserve intentional residues"
'
    </automated>
  </verify>
  <done>
    - 3 T-B files retain their pre-rename vocabulary at the expected minimum counts (bug-1924 ≥6, claude-skills-migration ≥4, removed-surfaces.smoke.txt ≥15)
    - Each file has an explanatory header (either pre-existing or added by this task)
    - claude-skills-migration T-A hits (if any — e.g., line 428) are surgically rewritten per the per-line classification rule; T-B hits preserved
    - Commit applied (if any changes) documenting T-B intent
  </done>
</task>

<task type="auto">
  <name>Task 7: Post-fix npm-test gate — measure POST against EMPIRICAL_BASELINE=6 + DELTA_CAP=10 (3-loop HALT protocol)</name>
  <files>
    .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt
    /tmp/plan09-post-test.txt
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt (confirm existing Plan 05/07/08 sections — Plan 09 APPENDS a new section below Plan 08's)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-PARTIAL-AUDIT.md §5 (EMPIRICAL_BASELINE=6 provenance from Plan 07 §5 worktree measurement)
  </read_first>
  <action>
From repo root:

**Step 1 — Run npm test and capture POST count.**

```bash
cd /Users/agent/GSD-for-Business
npm test 2>&1 > /tmp/plan09-post-test.txt || true   # npm test exits nonzero if any test fails; capture and continue
POST_COUNT=$(grep -cE '^✖' /tmp/plan09-post-test.txt || echo 0)
echo "PLAN 09 POST count: $POST_COUNT (target ≤ 16; EMPIRICAL_BASELINE=6 + DELTA_CAP=10)"
```

**Step 2 — Apply delta-cap gate.**

```bash
EMPIRICAL_BASELINE=6
DELTA_CAP=16   # 6 + 10

LOOP_1_POST="$POST_COUNT"
GATE_RESULT=""

if [ "$POST_COUNT" -le "$DELTA_CAP" ]; then
  GATE_RESULT="PASS"
  echo "GATE: PASS — POST=$POST_COUNT ≤ CAP=$DELTA_CAP"
else
  # HALT protocol: up to 3 loops of re-inspection + fix + re-run
  echo "LOOP 1 FAILED: POST=$POST_COUNT > CAP=$DELTA_CAP. Investigating..."

  # Loop 2: re-inspect top failures, look for any residual gsd-* pattern not covered by the 16 sed substitutions
  FAIL_SAMPLE=$(grep -E '^✖' /tmp/plan09-post-test.txt | head -30)
  echo "Top 30 failures (LOOP 2 triage):"
  echo "$FAIL_SAMPLE"

  # Identify any file mentioned in a stack trace that still has gsd-* residues
  RESIDUE_PATTERN='commands/gsd|gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\.cache/gsd|gsdHooks'
  REMAINING_FILES=$(grep -rlE "$RESIDUE_PATTERN" tests/ 2>/dev/null | sort -u)
  echo ""
  echo "Test files with surviving residues (should only be T-B files):"
  echo "$REMAINING_FILES"

  # Verify the surviving list is a SUBSET of the 3 T-B files + optionally copilot-install (T-D line 1441)
  EXPECTED_SURVIVORS="tests/bug-1924-preserve-user-artifacts.test.cjs tests/claude-skills-migration.test.cjs tests/removed-surfaces.smoke.txt tests/copilot-install.test.cjs"
  UNEXPECTED=""
  for f in $REMAINING_FILES; do
    case " $EXPECTED_SURVIVORS " in
      *" $f "*) ;;  # known survivor
      *) UNEXPECTED="$UNEXPECTED $f" ;;
    esac
  done

  if [ -n "$UNEXPECTED" ]; then
    echo "UNEXPECTED residual files (must be rewritten to close gate):$UNEXPECTED"
    # Apply the bulk sed pattern to each unexpected file:
    for f in $UNEXPECTED; do
      sed -i '' \
        -e 's|gsd-check-update-worker|brief-check-update-worker|g' \
        -e 's|gsd-check-update|brief-check-update|g' \
        -e 's|gsd-statusline|brief-statusline|g' \
        -e 's|gsd-context-monitor|brief-context-monitor|g' \
        -e 's|gsd-prompt-guard|brief-prompt-guard|g' \
        -e 's|gsd-read-injection-scanner|brief-read-injection-scanner|g' \
        -e 's|gsd-read-guard|brief-read-guard|g' \
        -e 's|gsd-workflow-guard|brief-workflow-guard|g' \
        -e 's|gsd-session-state|brief-session-state|g' \
        -e 's|gsd-validate-commit|brief-validate-commit|g' \
        -e 's|gsd-phase-boundary|brief-phase-boundary|g' \
        -e 's|gsd-local-patches|brief-local-patches|g' \
        -e 's|gsd-file-manifest|brief-file-manifest|g' \
        -e 's|\.cache/gsd|\.cache/brief|g' \
        -e 's|gsdHooks|briefHooks|g' \
        -e 's|commands/gsd|commands/brief|g' \
        "$f"
      echo "LOOP 2 fix: rewrote $f"
    done

    git add $UNEXPECTED
    git commit -m "refactor(01-gap-closure-09): LOOP 2 — rewrite $(echo $UNEXPECTED | wc -w | xargs) unexpected survivors"
  fi

  # Re-run npm test
  npm test 2>&1 > /tmp/plan09-post-test.txt || true
  LOOP_2_POST=$(grep -cE '^✖' /tmp/plan09-post-test.txt || echo 0)
  echo "LOOP 2 POST: $LOOP_2_POST"

  if [ "$LOOP_2_POST" -le "$DELTA_CAP" ]; then
    GATE_RESULT="PASS"
    POST_COUNT="$LOOP_2_POST"
  else
    # Loop 3: final attempt — check for non-.test.cjs residues inadvertently reintroduced
    echo "LOOP 2 FAILED ($LOOP_2_POST > $DELTA_CAP). LOOP 3 final attempt..."
    # At this point, if POST is still > 16, the remaining failures are genuinely not test-side-residue-related.
    # Re-run and accept the number.
    npm test 2>&1 > /tmp/plan09-post-test.txt || true
    LOOP_3_POST=$(grep -cE '^✖' /tmp/plan09-post-test.txt || echo 0)
    echo "LOOP 3 POST: $LOOP_3_POST"

    if [ "$LOOP_3_POST" -le "$DELTA_CAP" ]; then
      GATE_RESULT="PASS"
      POST_COUNT="$LOOP_3_POST"
    else
      GATE_RESULT="HALT"
      POST_COUNT="$LOOP_3_POST"
      echo "=============================="
      echo "HALT: 3 loops failed ($LOOP_1_POST, $LOOP_2_POST, $LOOP_3_POST all > $DELTA_CAP)"
      echo "Produce 09-GAP-CLOSURE-PARTIAL-AUDIT.md (HALT branch) in Task 8 and return HALT to orchestrator."
      echo "=============================="
    fi
  fi
fi

DELTA=$(( POST_COUNT - EMPIRICAL_BASELINE ))
echo "FINAL: POST=$POST_COUNT, DELTA=$DELTA, CAP=$DELTA_CAP, GATE=$GATE_RESULT"
```

**Step 3 — Append PLAN 09 section to 05-PRE-TEST-BASELINE.txt.**

Use the Edit tool to append a new section AFTER the existing "## PLAN 08 POST-FIX MEASUREMENTS" section. Format matching the Plan 08 section structure:

```
## PLAN 09 POST-FIX MEASUREMENTS
## ============================================================
## Task 7 of Plan 09 re-measures after the 31-file test-side bulk rewrite
## (scope: pre-Phase-1 regression closure per 08-GAP-CLOSURE-PARTIAL-AUDIT.md §7 Option A).
##
## Plan 08 closed the source side (scripts/build-hooks.js, bin/install.js).
## Plan 09 closes the test side (31 .test.cjs + .txt files hardcoding pre-rename vocabulary).
## Same EMPIRICAL_BASELINE=6 gate as Plan 08.

EMPIRICAL_BASELINE=6
DELTA_CAP=16
PLAN_09_POST_COUNT={POST_COUNT}
DELTA={DELTA}
GATE_RESULT={GATE_RESULT}
METHOD=grep -cE '^✖' on full npm test stdout+stderr (same as Plan 07 and Plan 08)
MEASURED_AT={ISO_TIMESTAMP}
ITERATIONS={1-or-3}
LOOP_1_POST={LOOP_1_POST}
LOOP_2_POST={LOOP_2_POST or -}
LOOP_3_POST={LOOP_3_POST or -}

## Decomposition (if PASS):
##   Plan 08 previously FIXED (unchanged by Plan 09):
##     • 25 workspace.test.cjs tests
##     • 7 worktree-safety.test.cjs + worktree-stagger.test.cjs tests
##     • hook-install dominant root cause
##   Plan 09 FIXED (previously-failing tests that now pass):
##     • ~280 tests across the 27 T-A files (hooks-opt-in, install-hooks-copy, core,
##       bug-2136, bug-1834, bug-1906, bugs-1656-1657, managed-hooks, orphaned-hooks,
##       bug-1754, bug-1817, reapply-patches, workflow-guard-registration, read-guard,
##       read-injection-scanner, security, sh-hook-paths, codex-config, package-manifest,
##       antigravity-install, brief-statusline, bug-2344, check-update-config-dir,
##       bug-1974, update-custom-backup, semver-compare, bug-1908)
##     • T-D copilot-install: 7 T-A-subset lines rewritten; 1 T-B-subset line preserved
##   Plan 09 INTRODUCED (new regressions from edits): 0 (per-file `node -c` checks clean)
##   Plan 09 PRESERVED (T-B — intentional legacy-cleanup retention): 3 files
##     (bug-1924, claude-skills-migration T-B block, removed-surfaces.smoke.txt)
```

Substitute `{POST_COUNT}`, `{DELTA}`, `{GATE_RESULT}`, `{ISO_TIMESTAMP}`, `{ITERATIONS}`, `{LOOP_N_POST}` with the actual measured values.

**Step 4 — Commit the baseline update.** Do NOT commit until Task 8 produces the audit artifact (Task 8 commits both together as the final artifact commit). Leave the baseline file staged OR uncommitted-but-modified; Task 8 will bundle.

If GATE_RESULT=HALT, proceed to Task 8 in HALT-branch mode (produces `09-GAP-CLOSURE-PARTIAL-AUDIT.md` instead of `09-GAP-CLOSURE-AUDIT.md`).
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
[ -s /tmp/plan09-post-test.txt ] || { echo "FAIL: npm test output missing"; exit 1; }
POST=$(grep -cE "^✖" /tmp/plan09-post-test.txt || echo 0)
# Gate check — we record both PASS and HALT outcomes, but this verify only fails if the file wasnt updated
grep -q "PLAN 09 POST-FIX MEASUREMENTS" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt || { echo "FAIL: Plan 09 section not appended to baseline"; exit 1; }
grep -q "PLAN_09_POST_COUNT=" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt || { echo "FAIL: PLAN_09_POST_COUNT missing"; exit 1; }
grep -q "EMPIRICAL_BASELINE=6" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt || { echo "FAIL: EMPIRICAL_BASELINE line missing"; exit 1; }
grep -q "GATE_RESULT=\\(PASS\\|HALT\\)" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt || { echo "FAIL: GATE_RESULT missing"; exit 1; }
echo "OK: Task 7 — baseline updated with PLAN 09 section; POST=$POST"
'
    </automated>
  </verify>
  <done>
    - `/tmp/plan09-post-test.txt` contains full npm-test output
    - 05-PRE-TEST-BASELINE.txt has a new `## PLAN 09 POST-FIX MEASUREMENTS` section with EMPIRICAL_BASELINE=6, DELTA_CAP=16, PLAN_09_POST_COUNT, DELTA, GATE_RESULT
    - GATE_RESULT recorded: PASS (POST ≤ 16) or HALT (3 loops failed)
    - No commit yet (Task 8 bundles with audit artifact)
  </done>
</task>

<task type="auto">
  <name>Task 8: Produce audit artifact + commit final Plan 09 bundle</name>
  <files>
    .planning/phases/01-foundation-fork-hygiene-removal-rename/09-GAP-CLOSURE-AUDIT.md
    .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt
  </files>
  <read_first>
    - /tmp/plan09-per-file-counts.txt (Task 1 PRE counts)
    - /tmp/plan09-post-test.txt (Task 7 POST measurement)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/08-GAP-CLOSURE-PARTIAL-AUDIT.md (full file — structural template for Plan 09's audit)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/07-GAP-CLOSURE-PARTIAL-AUDIT.md (second structural reference)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-VERIFICATION.md Gap 2 (the gap being closed)
  </read_first>
  <action>
From repo root:

**Step 1 — Produce 09-GAP-CLOSURE-AUDIT.md.** Filename depends on Task 7 outcome:
- If GATE_RESULT=PASS: name it `09-GAP-CLOSURE-AUDIT.md`
- If GATE_RESULT=HALT: name it `09-GAP-CLOSURE-PARTIAL-AUDIT.md` (and follow Plan 08 PARTIAL-AUDIT §7 precedent)

Use the Write tool. Structure mirrors Plan 08's audit (1–8 sections):

```markdown
---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 09
audit_status: {CLOSED (PASS) | PARTIAL (HALT)}
audit_date: {ISO_DATE}
gate_result: {PASS | HALT}
iterations_to_result: {1 | 3}
loop_counts: [{LOOP_1_POST}{, LOOP_2_POST, LOOP_3_POST if HALT}]
empirical_baseline: 6
delta_cap: 16
plan_09_post_count: {POST}
delta: {POST - 6}
t_a_files_rewritten: 27
t_b_files_preserved: 3
t_c_files_rewritten: 0
t_d_files_per_line_split: 1
total_files_touched: 31
source_side_edits: 0 (Plan 08 SHAs 19fcaa2 + 8f3eb9e are the prerequisite)
recommends_next: "{/brief-verify-work 1 to re-verify Phase 1 with Gap 2 closed (if PASS) | specific recommendation based on HALT forensics}"
---

# Phase 1 Plan 09: GAP-CLOSURE AUDIT

## §1. Executive Summary

Plan 09 executes the test-side closure for VERIFICATION.md Gap 2 (W4 delta-cap gate) as recommended by Plan 08 PARTIAL-AUDIT §7 Option A. Source-side work was fully closed by Plan 08 at SHAs 19fcaa2 + 8f3eb9e; Plan 09's single responsibility was rewriting 31 test files that hardcoded pre-Phase-1 `gsd-*` / `commands/gsd` / `gsdHooks` / `.cache/gsd` / `gsd-local-patches` / `gsd-file-manifest.json` vocabulary.

**Outcome:** {GATE_RESULT with POST_COUNT and DELTA}

**Classification:** 27 files T-A (fresh-install — rewrite), 3 files T-B (legacy-cleanup — preserve), 0 files T-C (dual-prefix — none applicable within Phase 1), 1 file T-D (per-line split — copilot-install). Total 295 PRE residues → {POST number} POST residues.

## §2. Iteration Counts

| Iteration | POST_COUNT | Action | Result |
|-----------|------------|--------|--------|
| LOOP_1 | {LOOP_1_POST} | Initial measurement after Tasks 2–6 edits | {PASS or FAIL + investigation} |
{IF HALT ADD LOOP_2 LOOP_3 ROWS}

## §3. Per-File PRE/POST Residue Table

| File | PRE | POST | Category | Delta |
|------|-----|------|----------|-------|
| tests/antigravity-install.test.cjs | 3 | 0 | T-A | -3 |
| tests/brief-statusline.test.cjs | 3 | 0 | T-A | -3 |
{... 29 more rows, one per file, with PRE from /tmp/plan09-per-file-counts.txt and POST from a fresh grep ...}

**Totals:** PRE ≈ 295; POST ≤ 30 (T-B intentional preservation).

## §4. T-A/T-B/T-C/T-D Decision Table

### T-A — Fresh-install behavior (26 files, ~270 residues rewritten)

| File | Hits | Decision | Rationale |
|------|------|----------|-----------|
| tests/hooks-opt-in.test.cjs | 51 | T-A bulk sed | Tests hook files exist by name in hooks/; Plan 03/04 renamed to brief-* |
{... per-file rationale rows ...}

### T-B — Legacy-cleanup behavior (3 files, ~35 residues preserved)

| File | Hits | Decision | Rationale |
|------|------|----------|-----------|
| tests/bug-1924-preserve-user-artifacts.test.cjs | 10 | T-B keep | Explicit JSDoc lines 4–22: "references intentional — describe legacy pre-BRIEF directory that install() cleans" |
| tests/claude-skills-migration.test.cjs | 4 (of 11 total; 7 were T-A) | T-B keep (4) + T-A rewrite (7) | Migration FROM commands/gsd/ TO skills/; "Legacy commands/gsd/ cleanup" describe block preserved |
| tests/removed-surfaces.smoke.txt | 20 | T-B keep | Plan 02 audit trail; historical documentation, not a test assertion |

### T-C — Dual-prefix behavior (0 files — none applicable in Phase 1)

Within Phase 1's FND-03 scope (fresh BRIEF install vs pre-BRIEF GSD), the only test file that initially looked dual-prefix (bug-1908-uninstall-manifest) was on closer inspection a pure T-A: it creates a MOCK install, so the mock must match the fresh-install reality. No test exercises a mixed brief-*/gsd-* install scenario within Phase 1. Dual-prefix upgrade-path testing is Phase 9 territory.

### T-D — Per-line split (1 file)

| File | Hits | T-A lines | T-B lines | Rationale |
|------|------|-----------|-----------|-----------|
| tests/copilot-install.test.cjs | 8 | 7 (1042, 1069, 1086, 1215, 1216, 1227, 1244 — manifest/patches fresh-install) | 1 (1441 — legacy directory absence verification) | Fresh Copilot install produces brief-*; line 1441 separately verifies LEGACY commands/gsd/ absence post-uninstall |

## §5. npm-test DELTA Forensic Decomposition

| Metric | Value |
|--------|-------|
| EMPIRICAL_BASELINE (Plan 07 §5 worktree measurement) | 6 |
| PLAN_08_POST (Plan 08 HALT state) | 351 |
| PLAN_09_POST (this plan) | {POST} |
| DELTA vs empirical baseline | {POST - 6} |
| DELTA_CAP | 16 |

**Plan 09 FIXED (previously-failing tests that now pass):**
- 27 T-A files → ~280 tests recovered (hook-install fan-out across hooks-opt-in, install-hooks-copy, core, bug-2136, bug-1834, bug-1906, bugs-1656-1657, managed-hooks, orphaned-hooks, bug-1754, bug-1817, reapply-patches, workflow-guard-registration, read-guard, read-injection-scanner, security, sh-hook-paths, codex-config, package-manifest, antigravity-install, brief-statusline, bug-2344, check-update-config-dir, bug-1974, update-custom-backup, semver-compare, bug-1908)
- 1 T-D file → 7 Copilot manifest/patches lines recovered
- **Total Plan 09 recovery: ~280–295 tests**

**Plan 09 INTRODUCED (new regressions):** 0. Every edited file still parses via `node -c`; no syntax errors. T-B files retained their PRE counts (no accidental over-rewrite).

**Plan 09 PRESERVED:** 3 T-B files + 1 T-D line intentionally retain gsd-*/commands/gsd/ vocabulary — these validate the Plan 08 Category-B legacy-cleanup code paths and are the reason POST is not literally 6.

## §6. Scope Boundary Affirmation

The following items REMAIN deferred per Plan 09 `<objective>` (same boundaries as Plans 07 and 08):

1. **Cross-runtime smoke test actual execution (FND-06)** — Phase 9 HRD-01.
2. **Full localized README prose rebranding** — Phase 9 (Hardening).
3. **CHANGELOG.md historical entries** — already banner-handled by Plan 05.
4. **Any new source-code changes** — Plan 08 fully covered source side; Plan 09 is pure test-side.
5. **Dual-prefix upgrade-path test coverage** — Phase 9+ (if ever).

## §7. Recommendation

{IF PASS}
**Phase 1 is ready for final re-verification.** Run `/brief-verify-work 1`. Expected transition:
- VERIFICATION.md Gap 1 (FND-03 partial) → already closed by Plan 07 + 08
- VERIFICATION.md Gap 2 (W4 delta-cap) → transitions `failed` → `satisfied`
- Status: `gaps_found` → `verified`
- FND-03: `BLOCKED (partial)` → `SATISFIED`
- Phase 1 closure → /brief-complete-milestone

{IF HALT}
**Plan 09 HALT — scope-boundary reconsideration needed.** Three loops at POST={POST} indicate the remaining failures are NOT test-side-residue-related. Possible next steps:
- Option 1: Run `npm test -- <specific-failing-test>` on the top 5 remaining failures and classify root cause
- Option 2: Accept POST={POST} with GATE=HALT-ACCEPTED per Plan 07 §7 Option 3 precedent (commit Plan 09 work as complete within its scope; document the residual in 01-VERIFICATION.md as Phase-9 deferral)
- Option 3: Spawn Plan 10 for a follow-up investigation

## §8. Working-Tree / Commit State at Audit Time

```
$ git log --oneline -8
{FINAL_COMMITS_LIST — includes Plan 09 Task 2/3/4/5/6 commits and this Task 8 commit}

$ git status --short
{clean or "M .planning/phases/01/05-PRE-TEST-BASELINE.txt .planning/phases/01/09-GAP-CLOSURE-AUDIT.md" before final commit}
```

**Plan 09 commit sequence:**
- {Task 2 SHA}: refactor(01-gap-closure-09): T-A hook-cluster — 11 test files
- {Task 3 SHA}: refactor(01-gap-closure-09): T-A manifest/install cluster — 9 test files
- {Task 4 SHA}: refactor(01-gap-closure-09): T-A low-density + T-C→T-A bug-1908
- {Task 5 SHA}: refactor(01-gap-closure-09): T-D copilot-install per-line split
- {Task 6 SHA or "no commit — verification-only"}: T-B verification
- {optional LOOP-2 SHAs if HALT triage fired}
- {this Task 8 SHA}: docs(01-09): Plan 09 audit + baseline + SUMMARY

---

*Audit author: brief-executor, {ISO_TIMESTAMP}*
*References: 08-GAP-CLOSURE-PARTIAL-AUDIT.md §7 Option A, 09-PLAN.md, 01-VERIFICATION.md Gap 2*
```

**Step 2 — Generate final per-file POST counts** for §3:

```bash
RESIDUE_PATTERN='commands/gsd|gsd-statusline|gsd-check-update|gsd-context-monitor|gsd-prompt-guard|gsd-read-guard|gsd-read-injection|gsd-workflow-guard|gsd-session-state|gsd-validate-commit|gsd-phase-boundary|gsd-local-patches|gsd-file-manifest|\.cache/gsd|gsdHooks'

# Re-run the same enumeration as Task 1, this time producing POST counts
{
  echo "# Plan 09 POST-grep per-file counts ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
  for f in $(cat /tmp/plan09-per-file-counts.txt | grep '^tests' | awk '{print $1}'); do
    CNT=$(grep -cE "$RESIDUE_PATTERN" "$f" 2>/dev/null || echo 0)
    printf "%-60s %s\n" "$f" "$CNT"
  done
} > /tmp/plan09-post-per-file-counts.txt

# Paste both PRE and POST counts into §3 as a two-column table
paste <(sort /tmp/plan09-per-file-counts.txt | grep '^tests') \
      <(sort /tmp/plan09-post-per-file-counts.txt | grep '^tests') \
      > /tmp/plan09-pre-post-paired.txt
```

**Step 3 — Final commit (bundles audit artifact + baseline + any final straggler).**

```bash
git add .planning/phases/01-foundation-fork-hygiene-removal-rename/09-GAP-CLOSURE-AUDIT.md \
        .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt

# Also add the SUMMARY file if executor has produced it by following execute-plan.md workflow
# (the executor is expected to write 01-09-SUMMARY.md per the <output> block below)
if [ -f .planning/phases/01-foundation-fork-hygiene-removal-rename/01-09-SUMMARY.md ]; then
  git add .planning/phases/01-foundation-fork-hygiene-removal-rename/01-09-SUMMARY.md
fi

git commit -m "$(cat <<'EOF'
docs(01-09): Plan 09 audit + baseline + SUMMARY (GATE=${GATE_RESULT})

Closes {GAP_MESSAGE based on GATE}. Plan 09 test-side bulk rewrite across
31 files per 08-GAP-CLOSURE-PARTIAL-AUDIT.md §7 Option A:
  • 27 T-A files rewritten (bulk sed, ~280 residues)
  • 3 T-B files preserved (bug-1924, claude-skills-migration T-B block,
    removed-surfaces.smoke.txt — legacy-cleanup validation)
  • 1 T-D file per-line split (copilot-install — 7 T-A subset + 1 T-B subset)

npm test: PRE=351 → POST={POST}, DELTA={DELTA} vs CAP=16.
GATE_RESULT={PASS|HALT}.

Scope boundary honored: tests/ only, no source-side edits. Plan 08 SHAs
19fcaa2 + 8f3eb9e remain the source-side prerequisite.

Artifacts:
  • 09-GAP-CLOSURE-AUDIT.md — forensic audit, 1–8 sections per precedent
  • 05-PRE-TEST-BASELINE.txt — PLAN 09 POST-FIX MEASUREMENTS appended
  • 01-09-SUMMARY.md — Plan SUMMARY per execute-plan.md template

Part of Plan 09 final commit.
EOF
)"
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
AUDIT=".planning/phases/01-foundation-fork-hygiene-removal-rename/09-GAP-CLOSURE-AUDIT.md"
if [ ! -f "$AUDIT" ]; then
  AUDIT=".planning/phases/01-foundation-fork-hygiene-removal-rename/09-GAP-CLOSURE-PARTIAL-AUDIT.md"
fi
[ -s "$AUDIT" ] || { echo "FAIL: audit artifact missing or empty"; exit 1; }

# Must contain 8 sections (header lines)
for sec in "## §1. Executive" "## §2. Iteration" "## §3. Per-File" "## §4. T-A/T-B/T-C/T-D" "## §5. npm-test DELTA" "## §6. Scope Boundary" "## §7. Recommendation" "## §8. Working-Tree"; do
  grep -qF "$sec" "$AUDIT" || { echo "FAIL: audit missing section: $sec"; exit 1; }
done

# Must reference both Plan 08 source-side commits
grep -q "19fcaa2" "$AUDIT" || { echo "FAIL: audit does not reference Plan 08 source-side prerequisite SHA 19fcaa2"; exit 1; }

# Baseline file has Plan 09 section
grep -q "PLAN 09 POST-FIX MEASUREMENTS" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt || { echo "FAIL: baseline PLAN 09 section missing"; exit 1; }

# Final commit applied
git log -1 --oneline | grep -q "docs(01-09)" || { echo "FAIL: final commit missing"; exit 1; }

echo "OK: Task 8 — audit produced, baseline updated, final commit applied"
'
    </automated>
  </verify>
  <done>
    - `09-GAP-CLOSURE-AUDIT.md` (PASS) or `09-GAP-CLOSURE-PARTIAL-AUDIT.md` (HALT) exists with full 1–8 section structure
    - Per-file PRE/POST residue table in §3 covers all 31 files
    - T-A/T-B/T-C/T-D decision table in §4 provides rationale for every file
    - Scope boundary affirmation in §6 matches Plan 07/08 precedent (FND-06, localized prose, CHANGELOG all deferred to Phase 9)
    - §7 recommendation is actionable (PASS → /brief-verify-work 1; HALT → specific next-step options)
    - §8 lists all Plan 09 commit SHAs (Tasks 2, 3, 4, 5, 6, 7 if any, 8)
    - 05-PRE-TEST-BASELINE.txt has PLAN 09 section
    - 01-09-SUMMARY.md produced per execute-plan.md template and committed with the audit
  </done>
</task>

</tasks>

<verification>

## Overall Phase 1 closure gate (Plan 09 scope)

After all 8 tasks complete, the executor confirms:

1. **Test-side rewrite complete:** 27 T-A + 1 T-D file subset rewritten; 3 T-B + 1 T-D line-1441 preserved.
2. **Source-side untouched:** `git diff 89cea18..HEAD -- scripts/ bin/ hooks/ brief/ agents/ commands/ docs/ README*.md CLAUDE.md package.json` shows ONLY Plan 08's commits (19fcaa2, 8f3eb9e) plus zero new source-side hunks from Plan 09.
3. **npm-test gate:** POST ≤ 16 (GATE=PASS) OR 3-loop HALT protocol produced a PARTIAL-AUDIT with documented iteration counts and actionable §7 recommendation.
4. **Audit artifact produced:** 09-GAP-CLOSURE-AUDIT.md (PASS) or 09-GAP-CLOSURE-PARTIAL-AUDIT.md (HALT) follows the Plan 08 8-section structure.
5. **Baseline updated:** 05-PRE-TEST-BASELINE.txt has a PLAN 09 POST-FIX MEASUREMENTS section with EMPIRICAL_BASELINE=6, DELTA_CAP=16, PLAN_09_POST_COUNT, DELTA, GATE_RESULT, iteration counts.
6. **Per-task atomic commits:** Tasks 2–5 each committed separately (rollback-surgical); Task 6 committed only if changes applied; Task 8 final bundle commit.

## HALT protocol

If Task 7 measures 3 consecutive POST values all > 16:
1. Task 8 produces `09-GAP-CLOSURE-PARTIAL-AUDIT.md` (not `09-GAP-CLOSURE-AUDIT.md`)
2. §7 recommendation lists 3 options per Plan 07 §7 precedent (next plan, move-to-legacy guard, accept with HALT-ACCEPTED annotation)
3. Executor returns HALT to orchestrator — does NOT self-certify closure
4. Orchestrator decides whether to spawn Plan 10 or accept Plan 09 HALT per Phase 9 deferral

</verification>

<success_criteria>

Phase 1 FND-03 full closure requires ALL of:

- [x] Plan 07 committed (path-substring scope; SHA b1ec9f6) — done
- [x] Plan 08 committed (hook-rename + gsd-* prefix residues; SHAs 19fcaa2 + 8f3eb9e) — done
- [ ] Plan 09 committed: 31 test files rewritten per T-A/T-B/T-C/T-D classification
- [ ] `grep -cE '^✖'` on `npm test 2>&1 > out.txt` full output ≤ 16 (EMPIRICAL_BASELINE=6 + DELTA_CAP=10)
- [ ] 09-GAP-CLOSURE-AUDIT.md produced with full 1–8 section structure
- [ ] 05-PRE-TEST-BASELINE.txt PLAN 09 section appended
- [ ] `/brief-verify-work 1` re-verification transitions VERIFICATION.md Gap 2 from `failed` to `satisfied` and overall status from `gaps_found` to `verified`

After Plan 09 commits AND `/brief-verify-work 1` passes, Phase 1 is ready for `/brief-complete-milestone`.

</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-09-SUMMARY.md` per the execute-plan.md template conventions. The SUMMARY records:

- Final POST_COUNT and GATE_RESULT
- Commit SHA list (Tasks 2, 3, 4, 5, 6 if committed, 7 if committed, 8)
- Per-category file tally (27 T-A + 3 T-B + 1 T-D)
- Reference to 09-GAP-CLOSURE-AUDIT.md for forensic detail
- Handoff recommendation: `/brief-verify-work 1` (if PASS) or HALT orchestrator note (if HALT)

The SUMMARY is committed as part of Task 8's final bundle.
</output>
