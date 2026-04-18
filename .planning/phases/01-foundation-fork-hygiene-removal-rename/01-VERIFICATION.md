---
phase: 01-foundation-fork-hygiene-removal-rename
verified: 2026-04-18T12:00:00Z
status: gaps_found
score: 4/6 must-haves verified
overrides_applied: 0
gaps:
  - truth: "User runs `/brief-*` autocomplete and sees no `gsd-*` dev-specific commands (FND-02) AND user invokes `/brief-*` and it works; invoking `/gsd-*` returns 'command not found' (FND-03)"
    status: partial
    reason: "File-level removal and rename complete, but 45 surviving files (including bin/install.js at 13 hard-coded source paths) still reference `commands/gsd/` as an active runtime target. The install script is functionally broken because it reads from `path.join(src, 'commands', 'gsd')` which no longer exists — `commands/brief/` replaced it. This means `npx brief-cc@latest` cannot install commands for Claude Code, OpenCode, Kilo, Codex, Copilot, or Gemini. This is a functional regression introduced by Plan 05's blanket substitution pattern `s|get-shit-done/|brief/|g` which did NOT match `commands/gsd/`. 322 npm test failures confirm the breakage."
    artifacts:
      - path: "bin/install.js"
        issue: "13 occurrences of `path.join(src, 'commands', 'gsd')` hardcode the pre-rename source path. Installer copies from a non-existent directory; all runtime install paths (Claude, OpenCode, Kilo, Codex, Copilot, Gemini) are broken. Lines 5490, 5500, 5510, 5525, 5540, 5550, 5560, 5570, 5580, 5603, 5621–5662 (verify targets)."
      - path: "brief/bin/lib/init.cjs"
        issue: "Line 1701: skill-discovery root path `'.claude/commands/gsd'` hardcoded — runtime will not find BRIEF commands at the renamed `commands/brief/` location."
      - path: "brief/workflows/profile-user.md"
        issue: "Lines 356, 415: user-facing messages point users at `$HOME/.claude/commands/gsd/dev-preferences.md` — stale instruction (should be `commands/brief/`)."
      - path: "brief/workflows/update.md"
        issue: "Lines 354, 363: update workflow advertises `commands/gsd/` as the wipe/preserve target — runtime update will miss the actual `commands/brief/` directory."
      - path: "brief/templates/codebase/structure.md"
        issue: "Lines 148, 209: documentation template still references `commands/gsd/` as the code-location reference for downstream codebase-mapping output."
      - path: "brief/references/few-shot-examples/verifier.md"
        issue: "Line 71: verifier example prose cites `commands/gsd/misc.md` — stale narrative, not runtime-breaking but misleads future verifier agents."
      - path: "agents/brief-intel-updater.md"
        issue: "Line 70: agent doc table still shows `commands/gsd/*.md` as the source → runtime may mis-inventory the command surface."
      - path: "tests/architecture-counts.test.cjs"
        issue: "Line 25: asserts directory `commands/gsd` exists — ENOENT failure, contributes to 322 npm test failures."
      - path: "tests/workspace.test.cjs"
        issue: "Lines 319, 328, 334: three tests read files from `commands/gsd/new-workspace.md|list-workspaces.md|remove-workspace.md` → ENOENT failures (visible in Plan 05 baseline `tail -80`)."
      - path: "tests/copilot-install.test.cjs, tests/extract-learnings.test.cjs, tests/quick-research.test.cjs, tests/scan-command.test.cjs, tests/audit-fix-command.test.cjs, tests/discuss-phase-power.test.cjs, tests/analyze-dependencies.test.cjs, tests/bug-1736-local-install-commands.test.cjs, tests/bug-1924-preserve-user-artifacts.test.cjs, tests/bug-2351-intel-kilo-layout.test.cjs, tests/claude-skills-migration.test.cjs, tests/cursor-reviewer.test.cjs, tests/update-custom-backup.test.cjs, tests/command-count-sync.test.cjs, tests/import-command.test.cjs, tests/explore-command.test.cjs, tests/milestone-summary.test.cjs, tests/execute-phase-active-flags.test.cjs, tests/autonomous-allowed-tools.test.cjs, tests/execute-phase-wave.test.cjs"
        issue: "20+ test files reference `commands/gsd/` or `gsd-*.md` in assertions/fixtures. These contribute to the ~320 new test failures over baseline."
      - path: "docs/ARCHITECTURE.md, docs/FEATURES.md, docs/manual-update.md, docs/skills/discovery-contract.md, docs/ko-KR/*, docs/ja-JP/*, docs/zh-CN/README.md, README.md, README.ko-KR.md, README.ja-JP.md, README.zh-CN.md, CONTRIBUTING.md"
        issue: "User-facing docs tell users to install to or look at `commands/gsd/`. README.md even directs Cline users to `.claude/commands/gsd/`. ROADMAP SC#3 requires `/brief-*` works and the docs guide users to stale paths."
    missing:
      - "Update all 13 `bin/install.js` occurrences of `path.join(src, 'commands', 'gsd')` to `path.join(src, 'commands', 'brief')` (or introduce a source-path constant)."
      - "Decide per occurrence whether each reference is (a) the BRIEF source-directory (must become `commands/brief/`) vs (b) a downstream runtime destination (e.g., Claude Code 2.0.x still installs to `.claude/commands/gsd/` — legacy target). Keep only the legacy-destination strings; update everything that is a source-path."
      - "Update `brief/bin/lib/init.cjs` line 1701 skill-discovery root to the actual source directory."
      - "Update `brief/workflows/profile-user.md` (lines 356, 415) and `brief/workflows/update.md` (lines 354, 363) user-visible messages."
      - "Update `brief/templates/codebase/structure.md` (148, 209), `brief/references/few-shot-examples/verifier.md` (71), and `agents/brief-intel-updater.md` (70) to reflect current directory layout."
      - "Update test files to point at `commands/brief/` fixtures — or decide they test a legacy install path and move them under a `legacy/` guard."
      - "Update English README.md plus at least `docs/ARCHITECTURE.md`, `docs/FEATURES.md`, `docs/manual-update.md`, `docs/skills/discovery-contract.md`, `CONTRIBUTING.md`. Re-confirm whether localized READMEs and `docs/ko-KR/*`, `docs/ja-JP/*`, `docs/zh-CN/*` stay deferred to Phase 9 (Plan 06 says yes — but the Cline install instruction in the English README is a Phase 1 regression)."
      - "Add a repo-wide post-fix verification: `grep -rln 'commands/gsd' . --include='*.md' --include='*.cjs' --include='*.js' --include='*.ts' --include='*.json' | grep -v <excludes> | wc -l` must return 0 (or be explicitly overridden with documented legacy-destination allowlist)."
  - truth: "npm test failure count post-Plan-05 is ≤ BASELINE_FAIL_COUNT + 10 (W4 delta-cap gate from Plan 05 must_haves)"
    status: failed
    reason: "Plan 05 W4 gate reported DELTA=3 and signed off, but that figure was measured by `npm test 2>&1 | tail -80 > baseline` and counting `✖|fail|not ok` in 80 lines of OUTPUT — which is an 80-line tail of test-tree output, not a full test count. Re-running `npm test` with full output capture in this verification shows 322 failing top-level ✖ markers and 510 passing ✔. Even if the baseline truly was 2 pre-Phase-1 failures, DELTA is ~320, not 3. The W4 baseline-capture technique under-counted by ~100x. This is a Plan 05 gate that looked like it passed but actually didn't, because the gate was checking the wrong thing."
    artifacts:
      - path: ".planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt"
        issue: "Recorded BASELINE_FAIL_COUNT=2, POST_FAIL_COUNT=5, DELTA=3. Actual post-edit failing ✖ count is 322. The baseline was captured with `npm test 2>&1 | tail -80 > $BASELINE` which truncates to the last 80 lines, capturing only a fraction of total failures. Plan 05's gate `[ \"$DELTA\" -le 10 ]` passed only because numerator and denominator were both severely truncated."
      - path: "tests/removed-surfaces.smoke.txt (the authoritative orphan audit)"
        issue: "Did not include `commands/gsd` (a path substring, not an identifier) — the orphan audit enumerated removed-agent identifiers but not the pre-rename directory-path substring. This is why Plan 05's surgical edits didn't cover the 45 `commands/gsd` residues."
    missing:
      - "Re-capture the baseline properly: `npm test 2>&1 > /tmp/npm-test-output.txt; grep -cE '^✖' /tmp/npm-test-output.txt` for total failing top-level tests. Document the true baseline in `05-PRE-TEST-BASELINE.txt` before the gap-closure plan runs its fix."
      - "After fixing the 45 `commands/gsd` residues, re-run npm test and confirm POST_FAIL_COUNT returns to pre-Phase-1 levels (typical GSD baseline is 0–5 failures on macOS with full node test runner)."
      - "Add a harness that checks total failing-test count, not just `tail -80` slice, in any future phase's test-delta gate."
deferred:
  - truth: "Cross-runtime smoke (Claude Code, Codex, Gemini, OpenCode) actually produces equivalent output"
    addressed_in: "Phase 9"
    evidence: "ASSUMPTIONS.md FND-06 entry: 'Actual smoke testing BRIEF across Claude Code / Codex / Gemini / OpenCode is deferred to Phase 9 (HRD-01) per the cross-runtime smoke-test milestone. Phase 1 verifies only that the detection CODE survived the rename intact at both sites.' ROADMAP Phase 9 success criterion #1 covers `brief-cli smoke-test`."
  - truth: "Localized README polish (README.ko-KR.md, README.ja-JP.md, README.zh-CN.md, README.pt-BR.md)"
    addressed_in: "Phase 9"
    evidence: "Plan 06 SUMMARY key-decisions: 'Localized READMEs (ko-KR, ja-JP, pt-BR, zh-CN) explicitly flagged as Phase 9 (Hardening) scope; not touched in Plan 06.' README.md line 561: 'Localized READMEs section ... being rebranded as part of Phase 9 (Hardening). They currently reflect pre-fork GSD content.'"
human_verification:
  - test: "`/brief-status` cross-runtime smoke"
    expected: "Running `brief-cli smoke-test` across Claude Code, OpenAI Codex, Gemini CLI, and OpenCode each produces equivalent `/brief-status` output (text_mode fallback active where AskUserQuestion is unavailable)"
    why_human: "ROADMAP Success Criterion #5 (FND-06). Phase 1 only verified the detection CODE exists (INSTRUCTION_FILE in brief/workflows/: 8 refs; text_mode in brief/bin/lib/: 6 refs). Actual cross-runtime execution smoke is deferred to Phase 9 HRD-01 per ASSUMPTIONS.md. Not blocking for Phase 1 goal closure — detection code survived, which is all Phase 1 promised."
---

# Phase 1: Foundation — Fork Hygiene, Removal, Rename — Verification Report

**Phase Goal:** BRIEF presents itself as a clean fork: GSD-development surfaces are gone, all identifiers are renamed `brief-*`, multi-runtime detection still works, and the zero-runtime-deps property is verified before any new code is written.
**Verified:** 2026-04-18T12:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria #1–6)

| # | Truth (ROADMAP.md SC) | Status | Evidence |
|---|----------------------|--------|----------|
| 1 | `git branch` shows `backup/original-gsd` (FND-01) | VERIFIED | `backup/original-gsd` at SHA `73e95132b5eedaf187e7e367ed358e8e8d769b76` (pre-Phase-1 main HEAD). Checkout round-trip works. |
| 2 | No dev-specific commands present (FND-02) | VERIFIED | 0 `agents/gsd-*.md`; 0 `commands/brief/code-review.md`/`ui-phase.md`/`ai-integration-phase.md`/`add-tests.md`/`secure-phase.md`; 0 removed-agent identifiers in repo-wide grep (excl CHANGELOG + audit file). 56 files deleted by Plan 02. |
| 3 | `/brief-*` works; `/gsd-*` returns "command not found" (FND-03) | **FAILED (partial)** | File-level rename is done (0 `agents/gsd-*`, 0 `hooks/gsd-*`, 0 `commands/gsd/` dir, `brief/bin/brief-tools.cjs` exists, `get-shit-done/` absent). **But 45 files still reference `commands/gsd/` as an ACTIVE runtime path**, including `bin/install.js` which hardcodes the pre-rename source path 13 times — `npx brief-cc@latest` will fail because the installer reads from a directory that no longer exists. See Gap #1. |
| 4 | `package.json` dependencies empty (FND-04) | VERIFIED | `node -e "console.log(Object.keys(require('./package.json').dependencies || {}).length)"` → `0`. devDependencies = 3 (c8, esbuild, vitest). ASSUMPTIONS.md A1 records VERIFIED at 2026-04-18T02:04:23Z. |
| 5 | Multi-runtime detection identical output across Claude Code / Codex / Gemini / OpenCode (FND-06) | UNCERTAIN (code present, actual smoke deferred) | `INSTRUCTION_FILE` appears 8 times in `brief/workflows/`; `text_mode` appears 6 times in `brief/bin/lib/`; 0 `get-shit-done` residues in `brief/bin/lib/`. Detection code survived the rename. Actual cross-runtime invocation is Phase 9 HRD-01 per ASSUMPTIONS.md FND-06 — deferred, not blocking. |
| 6 | CLAUDE.md + README.md use business-planning language (FND-07) | VERIFIED | Business vocab: CLAUDE=25, README=14 (both >> plan minima). Dev vocab: CLAUDE=2 (intentional anti-example residues per ASSUMPTIONS.md), README=0. package.json GSD residue: 0. |

**Score:** 4 / 6 truths verified, 1 failed (SC #3), 1 deferred to Phase 9 (SC #5)

### Deferred Items

Items not yet met but explicitly addressed in later milestone phases.

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Cross-runtime smoke test actually runs under Claude/Codex/Gemini/OpenCode and produces equivalent output | Phase 9 | ROADMAP Phase 9 SC #1: "User runs `brief-cli smoke-test` and the cross-runtime smoke test exercises BRIEF in Claude Code, Codex, Gemini, and OpenCode". ASSUMPTIONS.md FND-06 explicitly defers. |
| 2 | Localized READMEs (ko-KR/ja-JP/pt-BR/zh-CN) rebranded to BRIEF | Phase 9 (Hardening) | Plan 06 SUMMARY + README.md line 561. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.git/refs/heads/backup/original-gsd` | Rollback safety net at pre-BRIEF main SHA | VERIFIED | Points at `73e95132b5eedaf187e7e367ed358e8e8d769b76`. |
| `agents/brief-*.md` (18 files) | Renamed survivor agents | VERIFIED | 18 files, 0 gsd-prefixed survivors. |
| `commands/brief/` directory (~61 files) | Renamed command directory | VERIFIED | 61 files in place. |
| `hooks/brief-*` (11 files) | Renamed hooks | VERIFIED | 11 hooks, 0 gsd-prefixed. |
| `brief/bin/brief-tools.cjs` | Renamed binary entry point | VERIFIED | Loads without error. |
| `brief/bin/lib/core.cjs` + state.cjs + init.cjs + graphify.cjs | Lib layer intact | VERIFIED | All 4 modules `require()` cleanly. |
| `package.json` (BRIEF identity) | name=brief-cc, bin=brief-cc, files includes brief, BRIEF description+keywords+urls, zero dependencies | VERIFIED | All structural + descriptive fields correct; `spec-driven` / `get-shit-done-cc` / `gsd-build` residue = 0. |
| `bin/install.js` (source-path refs) | Reads commands source from `commands/brief/` | **FAILED (STUB — unwired)** | 13 hardcoded `path.join(src, 'commands', 'gsd')`. Every runtime install branch (Claude/OpenCode/Kilo/Codex/Copilot/Gemini) is broken. |
| `.planning/ASSUMPTIONS.md` | A1 + FND-06 + A-REPO + FND-07 verified | VERIFIED | 110 lines; all four entries present with status + command + timestamp. |
| `tests/removed-surfaces.smoke.txt` | Plan 02 audit trail with 149 DELETE-LINE + 3 DELETE-FILE + 9 RESIDUAL records | VERIFIED | Audit scope covered removed-agent identifiers but did NOT enumerate the `commands/gsd` path-substring pattern → Plan 05 never got a surgical-edit target for those 45 files. |
| `.planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt` | W4 delta-cap baseline | PARTIAL | File exists and has BASELINE/POST/DELTA; but baseline capture truncated to `tail -80` so the delta-cap gate was evaluated on a ~3% slice of actual test output. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `bin/install.js` | `commands/brief/` source directory | `path.join(src, 'commands', 'gsd')` → `path.join(src, 'commands', 'brief')` | **NOT_WIRED** | 13 occurrences still read from non-existent path. Install fails for all runtimes. |
| `brief/bin/lib/init.cjs` (skill-discovery) | `commands/brief/` | Line 1701 root config | **NOT_WIRED** | Root still `'.claude/commands/gsd'`. |
| `brief/workflows/profile-user.md` | runtime user-facing messages | display strings | **NOT_WIRED** | Lines 356, 415 tell users to look at `commands/gsd/dev-preferences.md`. |
| `brief/workflows/update.md` | update wipe target | wipe + preserve paths | **NOT_WIRED** | Lines 354, 363 target stale path. |
| `test suite` | repo state | tests/\*.test.cjs assertions | **BROKEN** | 322 failing tests (510 passing), baseline was 2 — delta ~320, not the reported 3. |

### Data-Flow Trace (Level 4)

Skipped for phases that produce only removal/rename artifacts (no dynamic-data rendering components). Binary execution checked via `node brief/bin/brief-tools.cjs` (prints version banner without error, exit 0).

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `brief-tools.cjs` executes | `node brief/bin/brief-tools.cjs --help` | Prints "brief-tools does not accept help or version flags" (exit 0) — module loads and dispatches | PASS |
| Zero runtime dependencies | `node -e "console.log(Object.keys(require('./package.json').dependencies || {}).length)"` | `0` | PASS |
| Lib layer require-able | `node -e "require('./brief/bin/lib/{core,state,init,graphify}.cjs')"` (4 modules) | all OK | PASS |
| Backup branch rollback works | `git rev-parse backup/original-gsd` | `73e95132b5eedaf187e7e367ed358e8e8d769b76` | PASS |
| package.json BRIEF identity | `node -e "const p=require('./package.json'); console.log(p.name, Object.keys(p.bin).join(','), p.files.join(','))"` | `brief-cc brief-cc bin,commands,brief,agents,hooks,scripts` | PASS |
| `npm test` overall health | `npm test 2>&1 > /tmp/out.txt; grep -cE '^✖' /tmp/out.txt` | `322` failing (510 passing) — dominant root cause is 45 files still holding `commands/gsd` substring refs that now dereference a non-existent directory | **FAIL** |
| `commands/gsd` text residues | `grep -rln "commands/gsd" . --include='*.md' --include='*.cjs' --include='*.js' --include='*.ts' --include='*.json' --include='*.sh' \| grep -v <excludes> \| wc -l` | `45` | **FAIL** |
| Other path/binary residues | `grep -rln 'get-shit-done\|gsd-tools\|/gsd-\|subagent_type: gsd-' . (excl) \| wc -l` | `0` each | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| FND-01 | 01-PLAN.md | backup/original-gsd exists as rollback net | SATISFIED | Branch present, round-trip works. |
| FND-02 | 02-PLAN.md | 28 dev-specific files removed from commands/, agents/, hooks/ | SATISFIED | 56 files removed (more than the 28 cap because D-02 expanded scope to dev-adjacent commands). 0 removed-agent identifiers post-rename (BLOCKER 1 closure). |
| FND-03 | 03-PLAN.md + 04-PLAN.md + 05-PLAN.md | Hard rename gsd-* → brief-* across directory, filenames, identifiers, text refs | **BLOCKED (partial)** | File-level + identifier rename complete. Text-reference rename MISSED the `commands/gsd/` path substring in 45 files (including 13 occurrences in bin/install.js). This is a Plan 05 scope gap — the substitution pattern `s\|get-shit-done/\|brief/\|g` didn't match `commands/gsd/`. |
| FND-04 | 06-PLAN.md | package.json dependencies empty (A1 verified) | SATISFIED | ASSUMPTIONS.md A1 entry at 2026-04-18T02:04:23Z; deps count = 0. |
| FND-06 | 06-PLAN.md | Multi-runtime detection (INSTRUCTION_FILE + text_mode) survives rename | SATISFIED (code-survival) + NEEDS HUMAN (actual cross-runtime smoke deferred to Phase 9) | Code present at both sites (8 + 6 refs). ASSUMPTIONS.md FND-06 entry explicitly defers actual smoke to Phase 9 HRD-01. |
| FND-07 | 06-PLAN.md | CLAUDE.md + README.md + package.json use business-planning language | SATISFIED | 25 + 14 biz-vocab hits; 2 + 0 dev-vocab (both intentional anti-examples in Stack tables); 0 package.json GSD residue. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| bin/install.js | 13 locations (5490, 5500, 5510, 5525, 5540, 5550, 5560, 5570, 5580, 5603, 5621, 5661, ...) | `path.join(src, 'commands', 'gsd')` hardcoded source path | **Blocker** | Installer cannot find BRIEF commands on disk; every runtime install path is broken. |
| brief/bin/lib/init.cjs | 1701 | `root: '.claude/commands/gsd'` skill-discovery config | **Blocker** | Runtime skill-discovery won't find BRIEF skills where they actually live. |
| brief/workflows/profile-user.md | 356, 415 | `$HOME/.claude/commands/gsd/dev-preferences.md` stale user-facing message | Warning | Users see misleading instructions from inside `/brief-profile-user` output. |
| brief/workflows/update.md | 354, 363 | `commands/gsd/` as wipe/preserve target | Warning | `/brief-update` may mis-target update wipe. |
| brief/templates/codebase/structure.md | 148, 209 | `commands/gsd/` as the documented code location | Warning | Downstream codebase-mapping output will point future planning at wrong directory. |
| brief/references/few-shot-examples/verifier.md | 71 | narrative cite to `commands/gsd/misc.md` | Info | Agent example prose, not runtime-breaking. |
| agents/brief-intel-updater.md | 70 | `\| Command files \| commands/gsd/*.md \|` table row | Warning | Intel updater agent has stale source-path in its own frontmatter/table. |
| 20+ test files (tests/copilot-install.test.cjs, architecture-counts.test.cjs, workspace.test.cjs, etc.) | various | Hardcoded paths to `commands/gsd/` | **Blocker** | 322 npm test failures; baseline 2. |
| docs/ARCHITECTURE.md, docs/FEATURES.md, docs/manual-update.md, docs/skills/discovery-contract.md, docs/ko-KR/*, docs/ja-JP/*, docs/zh-CN/README.md | various | Stale `commands/gsd/` path references | Warning (English docs) + Info (localized — deferred) | User-facing documentation misdirects new BRIEF users. Cline install instruction in English README.md line 89: "Older Claude Code versions use `commands/gsd/`" also needs review. |
| CONTRIBUTING.md | (body) | `commands/gsd/` reference | Info | CONTRIBUTING is in the W3 UNIFIED EXCLUDE for brand passes, but `commands/gsd/` is a path not a brand token — should be inspected case by case. |
| .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt | metadata | `BASELINE_FAIL_COUNT=2` captured from `tail -80` of `npm test` output | **Blocker (W4 gate false-green)** | The W4 delta-cap gate passed because it compared two numbers both computed from truncated output. Actual baseline (top-level ✖ markers) is ~2–5 under normal GSD test run; actual POST count is 322; true delta is ~320. |

### Human Verification Required

1. **Cross-runtime `/brief-status` smoke test (FND-06, ROADMAP SC #5)**

   **Test:** Install BRIEF into Claude Code, OpenAI Codex, Gemini CLI, and OpenCode. In each runtime, invoke `/brief-status` (or the runtime-specific equivalent — e.g., `$brief-status` in Codex). Confirm the text_mode fallback activates automatically in runtimes that don't support AskUserQuestion, and that the output is functionally equivalent.

   **Expected:** Identical `/brief-status` payload across all four runtimes. Text-mode fallback is transparent; no runtime-specific errors.

   **Why human:** Phase 1 only verified the detection CODE (grep counts at the two known sites). Actually running BRIEF in four runtime sandboxes requires external runtime installations. ASSUMPTIONS.md FND-06 explicitly defers this to Phase 9 HRD-01 per the cross-runtime smoke-test milestone. Listing here per the verifier's mandate to surface human-verification needs even for deferred items, so the user has visibility into what Phase 1 claimed vs what Phase 9 will actually validate.

   **Impact on Phase 1 status:** Non-blocking. Phase 1's promise was "detection code survives the rename", which is verified. But the ROADMAP success criterion as written requires the user to actually run `/brief-status` across runtimes — a stricter bar than what Phase 1 delivered. Accept the deferral or schedule the smoke test sooner.

### Gaps Summary

Two gaps block Phase 1 goal achievement:

**Gap 1: 45 files still reference `commands/gsd/` as an active runtime path — FND-03 partial**

Plan 05's blanket substitution pattern was `s|get-shit-done/|brief/|g`. This covered every instance of `get-shit-done/` but did NOT match `commands/gsd/` (different left-hand side). The orphan-audit in `tests/removed-surfaces.smoke.txt` only enumerated removed-agent identifiers, not pre-rename path substrings, so Plan 05 had no surgical-edit target for these 45 files.

Runtime impact: `npx brief-cc@latest` invokes `bin/install.js`, which in 13 places reads from `path.join(src, 'commands', 'gsd')`. That path no longer exists on disk (it's now `commands/brief/`). Every runtime install path (Claude Code global/local, OpenCode, Kilo, Codex, Copilot, Gemini) will fail.

Test impact: 322 npm test failures vs baseline ~2. The 05-PRE-TEST-BASELINE.txt captured only 80 lines of tail output and under-counted failures by ~100x — the W4 delta-cap gate passed falsely.

**Gap 2: Plan 05 W4 delta-cap gate was evaluated on truncated output — a silent quality-gate bypass**

The W4 capture was `npm test 2>&1 | tail -80 > $BASELINE`, meaning baseline is whatever appears in the last 80 lines of output (error stacks from the last few failing tests). Counting `✖|fail|not ok` in 80 lines is not the same as counting failing tests. The gate's purpose — flag any Plan-05 regression in test health — was defeated because both numerator and denominator came from the same 80-line slice.

This Gap is orthogonal to Gap 1 in mechanism but co-located in cause: if W4 had captured the full baseline, the ~320-test regression would have been caught before the commit, Plan 05 would have looped, and Gap 1 would have surfaced earlier.

**Recommended grouping for gsd-plan-phase --gaps:** A single gap-closure plan can address both. Root cause is identical (Plan 05 scope missed `commands/gsd` path substring). Fix is:
1. Enumerate every `commands/gsd` reference outside documented exclusions.
2. Classify each as either (a) BRIEF-source-path (must rewrite to `commands/brief`) or (b) downstream runtime-target (e.g., legacy Claude Code 2.0.x still installs to `.claude/commands/gsd/`; preserve only these as intentional).
3. Apply surgical edits.
4. Re-capture baseline with full `npm test` output (`grep -cE '^✖'`), run fixed tests, confirm DELTA ≤ 10 against the TRUE baseline.
5. Update `05-PRE-TEST-BASELINE.txt` with the correct numbers.

---

*Verified: 2026-04-18T12:00:00Z*
*Verifier: Claude (brief-verifier, legacy gsd-verifier agent prompt)*
