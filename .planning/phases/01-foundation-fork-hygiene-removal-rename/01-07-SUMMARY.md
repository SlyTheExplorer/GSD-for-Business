---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 07
subsystem: fork-hygiene / gap-closure
tags: [refactor, FND-03, gap-closure, HALT, path-substring, npm-test-baseline]
requires:
  - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-VERIFICATION.md
provides:
  - bin/install.js (SOURCE-path tuples rewritten to commands/brief)
  - brief/bin/lib/init.cjs (dual-root canonicalRoots — brief primary + gsd legacy)
  - .planning/phases/01-foundation-fork-hygiene-removal-rename/07-GAP-CLOSURE-PARTIAL-AUDIT.md
  - .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt (re-captured via grep -cE '^✖')
affects:
  - bin/install.js (13 SRC + 1 configDir + 2 commandsDir tuples rewritten; 6 Cat-B targetDir tuples preserved; 15 adjacent JSDoc/log messages aligned)
  - brief/bin/lib/init.cjs (new `.claude/commands/brief` canonicalRoots entry; EXACT commands/gsd count = 1)
  - 5 BRIEF-internal files (workflows/profile-user, workflows/update, templates/codebase/structure, references/few-shot-examples/verifier, agents/brief-intel-updater)
  - 6 English docs + CONTRIBUTING.md + README.md (legacy-cleanup sentences clarified)
  - 10 localized docs (ja-JP, ko-KR, zh-CN) — path-only substitution
  - 21 test files (18 Category-A rewritten, 3 Category-B preserved with inline comments)
  - .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt (Task 1 correct-method re-capture)
tech-stack:
  added: []
  patterns:
    - "SOURCE-vs-DESTINATION categorization table for path.join tuples (13 SRC rewrite + 6 Cat-B legacy-cleanup preserve)"
    - "EXACT-count assertion for init.cjs canonicalRoots (prevents accidental over/under-deletion of legacy entry)"
    - "npm-test baseline re-capture via `grep -cE '^✖'` on full output (replaces faulty `tail -80 | grep` method)"
    - "3-loop HALT protocol for delta-cap gate failures: no self-certify, no commit on FAIL, produce partial audit"
key-files:
  created:
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/07-GAP-CLOSURE-PARTIAL-AUDIT.md
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-07-SUMMARY.md
  modified:
    - bin/install.js
    - brief/bin/lib/init.cjs
    - brief/workflows/profile-user.md
    - brief/workflows/update.md
    - brief/templates/codebase/structure.md
    - brief/references/few-shot-examples/verifier.md
    - agents/brief-intel-updater.md
    - README.md
    - CONTRIBUTING.md
    - README.ja-JP.md
    - README.ko-KR.md
    - README.zh-CN.md
    - docs/ARCHITECTURE.md
    - docs/FEATURES.md
    - docs/manual-update.md
    - docs/skills/discovery-contract.md
    - docs/ja-JP/ARCHITECTURE.md
    - docs/ja-JP/FEATURES.md
    - docs/ja-JP/superpowers/specs/2026-03-20-multi-project-workspaces-design.md
    - docs/ko-KR/ARCHITECTURE.md
    - docs/ko-KR/FEATURES.md
    - docs/ko-KR/superpowers/specs/2026-03-20-multi-project-workspaces-design.md
    - docs/zh-CN/README.md
    - 21 test files under tests/
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt
decisions:
  - "Chose single atomic commit for Plan 07 path-substring scope — ships as `refactor(01-gap-closure): close commands/gsd path substring residues + re-baseline npm test (FND-03 partial within Gap-1 scope)` at SHA b1ec9f6"
  - "Preserved 6 `path.join(targetDir, 'commands', 'gsd')` Category-B legacy-cleanup occurrences in bin/install.js intentionally — these detect + remove pre-BRIEF `.claude/commands/gsd/` directories during upgrade from GSD (D-07 no-aliases requires this support path)"
  - "Added `.claude/commands/brief` as primary canonicalRoots entry in init.cjs ABOVE the preserved deprecated `.claude/commands/gsd` legacy entry — skill discovery now finds both (EXACT commands/gsd count = 1 enforced)"
  - "Localized docs (ja-JP, ko-KR, zh-CN) received path-substring substitution only; prose rebranding explicitly deferred to Phase 9 (Hardening) per plan's `<objective>` out-of-scope bullet"
  - "HALTed Task 4 per 3-loop protocol rather than self-certify closure — DELTA=335 vs cap=20 is driven by out-of-scope Phase 1 regressions, not Plan 07 edits (Plan 07 fixed 12 tests, broke 0)"
metrics:
  duration: ~27 minutes (executor runtime; 3-iteration HALT protocol)
  completed: 2026-04-18
  commits: 1 (atomic, SHA b1ec9f6)
  files_touched: 43 (+ 2 planning artifacts)
  residue_before: 45 files with `commands/gsd` substring
  residue_after: 10 files (all in documented allowlist)
  tests_fixed_by_plan_07: 12
  tests_regressed_by_plan_07: 0
  task_4_gate: HALT (POST=345 driven by out-of-scope upstream regressions)
---

# Phase 1 Plan 07: Path-Substring Gap Closure + Baseline Re-Capture (PARTIAL — HALT handoff)

Closes VERIFICATION.md Gap 1 within the path-substring scope and repairs Gap 2's measurement methodology. Task 4 delta-cap gate returned HALT because three previously-hidden Phase 1 regressions (outside VERIFICATION.md's Gap 1 enumeration) dominate the test failure count.

## What Changed

### bin/install.js — SOURCE-vs-DESTINATION categorization

Two patterns reported separately (explicit non-sum note — never combined as "48"):

**Literal-substring (`commands/gsd`) — 28 pre-fix:**
- 15 JSDoc/adjacent comments → 13 rewritten to match rewritten code, 2 clarified in-place
- 13 comments inside Category-B legacy-cleanup blocks → PRESERVED intentionally

**Path.join tuple-form (`'commands', 'gsd'`) — 20 pre-fix:**
- Category A: 13 `path.join(src, 'commands', 'gsd')` SOURCE tuples → rewritten to `'brief'`
- Category B: 6 `path.join(targetDir, 'commands', 'gsd')` legacy-cleanup tuples → PRESERVED (upgrade path)
- Category D: 1 `path.join(configDir, 'commands', 'gsd')` manifest-source → rewritten to `'brief'`

**Category C (`path.join(commandsDir, 'gsd')` — single arg, in literal count):**
- 2 Gemini + Claude-local fresh destinations → rewritten to `'brief'`

**Post-fix verification (all grep counts in audit §4):**
- `path.join(src, 'commands', 'gsd')` = 0
- `path.join(src, 'commands', 'brief')` = 13
- `path.join(commandsDir, 'brief')` = 2
- `path.join(configDir, 'commands', 'brief')` = 1
- `path.join(targetDir, 'commands', 'gsd')` = 6 (Cat-B preserved)

### brief/bin/lib/init.cjs — dual-root canonicalRoots

New `.claude/commands/brief` entry added as primary discovery root (line ~1700). The deprecated `.claude/commands/gsd` entry retained below it for legacy skill discovery. EXACT count `grep -c "commands/gsd" brief/bin/lib/init.cjs` = 1 enforced in must_haves.truths.

### BRIEF-internal + English docs

- `brief/workflows/profile-user.md` lines 356, 415 (user-facing messages)
- `brief/workflows/update.md` lines 354, 363 (wipe/preserve targets)
- `brief/templates/codebase/structure.md` lines 148, 209 (doc template)
- `brief/references/few-shot-examples/verifier.md` line 71 (example narrative)
- `agents/brief-intel-updater.md` line 70 (source-path table)
- `docs/ARCHITECTURE.md`, `docs/manual-update.md` — path-substring corrections
- `docs/FEATURES.md`, `docs/skills/discovery-contract.md`, `README.md`, `CONTRIBUTING.md` — legacy-cleanup sentences clarified (retained where they describe real installer behavior)

### Localized docs (ja-JP, ko-KR, zh-CN) — path-only

10 files received surgical path-substring replacement inside code examples and literal command invocations. Prose content preserved unchanged per Phase 9 Hardening deferral.

### Test files (21)

- 18 Category-A tests rewritten to assert against `commands/brief/` (the current source tree)
- 3 Category-B tests preserved with inline header comments explaining why they test legacy paths:
  - `tests/bug-1924-preserve-user-artifacts.test.cjs` — tests the legacy-cleanup user-file preservation code path
  - `tests/claude-skills-migration.test.cjs` — tests migration from legacy `commands/gsd/` to skills format
  - `tests/copilot-install.test.cjs` — one tautological legacy-dir absence check

### .planning/phases/01-.../05-PRE-TEST-BASELINE.txt — Task 1 re-capture

Plan 05's `tail -80 | grep` method reported 2 failures against a true ~322. Rewritten with `grep -cE '^✖'` on full `npm test` output. Empirical pre-Phase-1 baseline (captured via `git clone backup/original-gsd` + `npm test`) = 6 failures. Plan's upper-bound assumption of `TRUE_BASELINE=10` confirmed conservative and correct.

## Atomic Commit

**SHA:** `b1ec9f6` — `refactor(01-gap-closure): close commands/gsd path substring residues + re-baseline npm test (FND-03 partial within Gap-1 scope)`

44 files changed, 455 insertions, 119 deletions. Single atomic commit per plan's combined-commit strategy.

## Verification Results

### Gap 1 (path-substring scope) — CLOSED

Repo-wide `commands/gsd` residue count: **45 → 10 files** (meets ≤10 allowlist ceiling per must_haves.truths). All 10 surviving files carry documented intentional-residue rationale:

| File | Residues | Rationale |
|------|----------|-----------|
| bin/install.js | 13 literal + 6 tuple | Category-B legacy-cleanup (upgrade-from-GSD support) |
| brief/bin/lib/init.cjs | 1 | Deprecated legacy canonicalRoots entry |
| docs/FEATURES.md, docs/ja-JP/FEATURES.md, docs/ko-KR/FEATURES.md | 2 each | Legacy-cleanup sentences describing installer behavior |
| docs/skills/discovery-contract.md | 2 | Legacy-description sentences |
| README.md | 2 | Clarified legacy-cleanup sentences (lines 89, 707) |
| tests/bug-1924-preserve-user-artifacts.test.cjs | 9 | Category-B legacy-migration test |
| tests/claude-skills-migration.test.cjs | 8 | Category-B legacy-migration test |
| tests/copilot-install.test.cjs | 1 | Tautological legacy-dir absence check |

### Gap 2 (baseline methodology) — FIXED

- 05-PRE-TEST-BASELINE.txt rewritten with `grep -cE '^✖'` method
- TRUE_BASELINE=10 adopted (upper bound; empirical=6)
- DELTA_CAP=20

### Task 4 delta-cap gate — HALT

**POST_COUNT=345 (stable across 3 iterations).** DELTA=335 >> cap=20. Per Task 4.3 protocol, executor HALTed rather than commit with FAIL gate. Root-cause diagnosis (07-GAP-CLOSURE-PARTIAL-AUDIT.md §5):

- Plan 07 edits fixed 12 tests; broke 0.
- 339 of 345 failures are pre-existing Phase 1 regressions NEWLY IDENTIFIED during Plan 07 execution:
  1. `scripts/build-hooks.js` hard-codes `gsd-*.js/.sh` (renamed to `brief-*` in Plan 03/04) → `hooks/dist/` empty → 56 install-hooks tests fail
  2. `bin/install.js` hard-codes `gsd-*.js/.sh` hook filenames at 10+ sites
  3. `tests/worktree-safety.test.cjs`, `tests/worktree-stagger.test.cjs` assert `agents/gsd-executor.md` exists (renamed to `brief-executor.md`)

These were not enumerated in VERIFICATION.md Gap 1 — they were masked by the 322 `commands/gsd` failures until Plan 07's path-substring fixes surfaced the underlying hook-rename regression.

## Deferred to Plan 08

Plan 08 (the next gap-closure plan) must address:

1. **Hook filename rewrite** — `scripts/build-hooks.js` lines 18-29 (`gsd-check-update.js` → `brief-check-update.js`, etc.) + `bin/install.js` ~10 hook-reference sites
2. **Agent filename test assertions** — `tests/worktree-safety.test.cjs`, `tests/worktree-stagger.test.cjs`, and any other test file referencing `agents/gsd-*.md`
3. **bin/install.js `gsd-*` prefix residues** — 19 `startsWith('gsd-')` checks + 12 `'gsd'` prefix arguments + 1 `prefix = 'gsd-'` default at line 3622 (separate FND-03 residue outside Gap 1 path-substring scope)

Re-baseline Plan 08 against empirical pre-Phase-1 figure of 6 failures; set DELTA_CAP=16.

## Self-Check

- [x] All Plan 07 `<read_first>` + `<action>` + `<verify>` blocks followed per task
- [x] Task 2 pre-grep ground truth captured (28 literal + 20 tuple confirmed against plan's claims)
- [x] Task 2 per-category counts verified (src=0+brief=13, targetDir=6-gsd, commandsDir+brief=2, configDir+brief=1)
- [x] Task 2 init.cjs EXACT count = 1 (dual-root assertion)
- [x] Task 3 per-file post-edit verifications passed (10 files × documented allowlist)
- [x] Task 4 Step 4.1 baseline file correctly rewritten
- [x] Task 4 Step 4.3 HALT protocol followed (3 loops, no self-certify, no commit on FAIL — this commit lands ONLY after human review of HALT rationale, which the user authorized with Option A)
- [x] Task 4 Step 4.6 HEREDOC commit message convention applied (multi-line body, Scope paragraph, Closes footer)
- [x] 07-GAP-CLOSURE-PARTIAL-AUDIT.md produced with executive summary + iteration counts + allowlist + forensic analysis + scope boundary affirmation + Plan 08 recommendation
- [ ] Task 4 delta-cap gate PASSED — **NO. HALT handoff, Plan 08 required.**

## Follow-up

- Run `/gsd-plan-phase 1 --gaps` to generate Plan 08 addressing the 3 upstream Phase 1 regressions
- After Plan 08 commits, re-run `/gsd-verify-work 1` — VERIFICATION.md should transition from `gaps_found` → `verified` once hook-rename + agent-filename + install.js-prefix residues resolve

---

*Plan: 07 — gap closure, path-substring scope*
*Completed: 2026-04-18*
*Atomic commit: b1ec9f6*
*HALT: Task 4 delta-cap gate deferred to Plan 08 (out-of-scope upstream regressions)*
