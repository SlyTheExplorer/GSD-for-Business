---
phase: 05-discover-parallel-research-with-provenance-audience-context-injection
plan: 03
subsystem: hooks
tags: [provenance, pre-commit, bash, regex, bilingual, korea, opt-in]

# Dependency graph
requires:
  - phase: 04-first-gate-align-pattern-established
    provides: brief-validate-commit.sh shape (opt-in gate, JSON stdin extract, decision:block JSON exit 2)
  - phase: 05
    provides: 05-RESEARCH.md §Pattern 4 regex set + §Example 2 hook skeleton
provides:
  - hooks/brief-validate-provenance.sh (CI-time provenance gate — D-06 / CC-04)
  - 13 fixture files exercising valid + invalid + false-positive + edge shapes
  - 22 tests covering positive, negative, false-positive, hook-integration, opt-in gate paths
  - Manifest + install wiring for the new hook (scripts/build-hooks.js, bin/install.js)
affects:
  - 05-04 (AUDIENCE duplicate-rename will reuse the opt-in gate + allowlist pattern)
  - 05-07 (Phase 5 canary E2E will exercise this hook end-to-end)
  - 09 HRD-04 (false-positive iteration deferred — pilot feedback informs ban-list expansion)

# Tech tracking
tech-stack:
  added: []  # zero new runtime deps — A1 preserved
  patterns:
    - "Portable ERE regex: (^|[^A-Za-z0-9_]) word-boundary surrogate; [$] literal dollar"
    - "grep -nE + sed window scan (replaces awk for BSD-compat)"
    - "Bilingual error messages gated by .planning/config.json brief.region === 'kr'"
    - "Opt-in .sh hook mirrored from brief-validate-commit.sh shape (hooks.community: true)"

key-files:
  created:
    - hooks/brief-validate-provenance.sh
    - tests/brief-provenance-positive.test.cjs
    - tests/brief-provenance-negative.test.cjs
    - tests/brief-provenance-false-positives.test.cjs
    - tests/brief-provenance-hook.test.cjs
    - tests/brief-provenance-opt-in.test.cjs
    - tests/fixtures/provenance/ (13 .md fixtures)
  modified:
    - scripts/build-hooks.js (HOOKS_TO_COPY manifest)
    - bin/install.js (cleanup, cmd guard, expectedShHooks, new PreToolUse:Bash block)

key-decisions:
  - "Rule 1 bugfix: replaced awk-based scan with grep -nE + sed to work on BSD awk (macOS) where \\b word-boundary and \\$ literal-dollar both fail silently. Research spec's raw regex was latently broken across platforms."
  - "Portable word-boundary: (^|[^A-Za-z0-9_]) surrogate for \\b. Portable literal dollar: [$] bracket class instead of \\$."
  - "Fixture design: each fixture tests EXACTLY ONE regex category (currency vs percent vs Korean vs date vs version vs prose etc.). Makes regression debugging trivial when tuning the ban-list later."
  - "Allowlist path regex anchored ^(...) to prevent path-traversal T-5-03-06 mitigation."
  - "edge-malformed-tag.md fixture enforces DSC-07: [VERIFIED:url-no-date] without |YYYY-MM-DD fails the TAG_PATTERN."

patterns-established:
  - "Hook portability: Use grep -nE + sed window; avoid awk word boundaries and dollar literals"
  - "Bilingual hook errors: Korean reason when brief.region=kr, English otherwise; JSON-escape via node -e JSON.stringify"
  - "Hook install pipeline: HOOKS_TO_COPY (build) + briefHooks cleanup + cmd guard + expectedShHooks warning + new settings.hooks[preToolEvent] block"
  - "Fixture-driven hook tests: each fixture is staged in a tmp git repo, hook is invoked with JSON stdin mirroring PreToolUse:Bash payload"

requirements-completed: [DSC-04, DSC-07, CC-04]

# Metrics
duration: 9min
completed: 2026-04-23
---

# Phase 05 Plan 03: Provenance Hook Summary

**Shell pre-commit hook that blocks git commits with untagged quantitative claims; 22 tests across 5 files; zero runtime deps; bilingual Korean/English error messages; opt-in via hooks.community config.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-04-23T10:15:07Z
- **Completed:** 2026-04-23T10:24:24Z
- **Tasks:** 7
- **Files modified:** 21 (18 created + 3 modified: 1 hook + 13 fixtures + 5 test files + 2 wiring edits)

## Accomplishments

- Shipped `hooks/brief-validate-provenance.sh` (119 lines) — PreToolUse bash hook blocking untagged quantitative claims on `git commit`.
- Delivered 22 tests (3 positive + 4 negative + 7 false-positive/allowlist + 4 hook-integration + 4 opt-in-gate) covering every regex category and all four opt-in gate states.
- Bilingual error: Korean `커밋이 차단되었습니다` when `brief.region=kr`, English `Commit blocked` otherwise.
- Allowlist exempts `brief/references/compliance/`, `*-vocabulary.md`, `.planning/research/`, and `tests/fixtures/` — so compliance primers and test fixtures never trip the hook.
- Escape hatch via `<!-- brief-provenance: allow -->` inline HTML comment for intentional false-positive cases.
- Zero runtime deps (A1 preserved); zero new user-facing slash commands (Surface Cap preserved).

## Task Commits

Each task committed atomically (all with `--no-verify` per parallel-worktree protocol):

1. **Task 1: 13 provenance fixtures** — `c71ba30` (test)
2. **Task 2: brief-validate-provenance.sh hook** — `3af874b` (feat)
3. **Task 3: Positive-fixture tests** — `892e569` (test)
4. **Task 4: Negative-fixture tests** — `61686c2` (test)
5. **Task 5: False-positive + allowlist tests** — `63294fa` (test)
6. **Task 6: Hook-integration + opt-in gate tests** — `384920f` (test)
7. **Task 7: Build + install wiring** — `8d200d2` (chore)

_Plan metadata commit will follow this SUMMARY._

## Files Created/Modified

### Created
- `hooks/brief-validate-provenance.sh` — pre-commit hook (119 lines, opt-in, bilingual)
- `tests/fixtures/provenance/valid-en.md` — 3 tagged claims (EN)
- `tests/fixtures/provenance/valid-ko.md` — 3 tagged claims (KO)
- `tests/fixtures/provenance/valid-mixed-proximity.md` — tags ±1 line away
- `tests/fixtures/provenance/invalid-untagged-currency.md` — `$5B` / `₩4 trillion` untagged
- `tests/fixtures/provenance/invalid-untagged-percent.md` — `23%` / `12%` untagged
- `tests/fixtures/provenance/invalid-untagged-korean.md` — `₩4조` / `23%` untagged (Korean)
- `tests/fixtures/provenance/edge-malformed-tag.md` — DSC-07 `[VERIFIED:url-no-date]` fails
- `tests/fixtures/provenance/false-positive-date.md` — bare years
- `tests/fixtures/provenance/false-positive-article.md` — Article 28-8 / 제15조
- `tests/fixtures/provenance/false-positive-version.md` — Node v22.1.0
- `tests/fixtures/provenance/false-positive-prose-en.md` — "three principles"
- `tests/fixtures/provenance/false-positive-prose-ko.md` — "세 가지 원칙"
- `tests/fixtures/provenance/false-positive-plan-id.md` — Plan 04 / D-15 / T-5
- `tests/brief-provenance-positive.test.cjs` — 3 tests
- `tests/brief-provenance-negative.test.cjs` — 4 tests (incl. DSC-07 edge)
- `tests/brief-provenance-false-positives.test.cjs` — 7 tests (6 FP + 1 allowlist)
- `tests/brief-provenance-hook.test.cjs` — 4 integration tests
- `tests/brief-provenance-opt-in.test.cjs` — 4 opt-in gate tests

### Modified
- `scripts/build-hooks.js` — add `brief-validate-provenance.sh` to HOOKS_TO_COPY
- `bin/install.js` — 4 edits: `briefHooks` cleanup list, `cmd.includes` guard, `expectedShHooks` warning, new `settings.hooks[preToolEvent]` registration block (parallel to validate-commit).

## Decisions Made

- **Portable regex over research spec verbatim** (Rule 1 auto-fix): The 05-RESEARCH.md §Example 2 regex used `\b` word-boundary and `\$` literal-dollar. Both fail silently on BSD awk (macOS default), which would cause the hook to (a) miss `$5B` untagged claims and (b) fail to exclude `Plan 04`/`2026` false positives. Replaced with `grep -nE` + `(^|[^A-Za-z0-9_])` surrogates + `[$]` bracket class. Verified across all 13 fixtures + all 22 tests pass on BSD awk (macOS).
- **Delegate pattern-match to grep instead of awk**: awk-based per-line regex within the shell hook is fragile across BSD/GNU. `grep -nE` with a line-number filter is universally portable. `sed -n '${START},${END}p'` for the ±2 line proximity window is equally portable.
- **Each fixture tests ONE regex category**: Makes it easy to regress-test a single false-positive or missed-include class when the ban-list expands (Phase 9 HRD-04 pilot feedback).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Rewrote hook scan loop with portable regex**
- **Found during:** Task 2 (smoke-test against invalid-untagged-currency.md fixture after first write)
- **Issue:** The 05-RESEARCH.md §Example 2 regex skeleton uses `\$` (literal dollar) and `\b` (word boundary) within a BSD-awk pattern. Both are silently non-functional on macOS awk (version 20200816). Result: `$5B` untagged claims were NOT being detected (include regex didn't match), and `Plan 04` / `2026` false positives were NOT being excluded (exclude regex didn't match). The hook would have shipped as a no-op gate on BSD systems.
- **Fix:** Replaced awk-driven scan with `grep -nE` + `sed` window. Substituted `\b` → `(^|[^A-Za-z0-9_])` ... `([^A-Za-z0-9_]|$)` portable word-boundary surrogates. Substituted `\$` → `[$]` bracket-class literal. Documented the substitution in hook preamble comments for future maintenance.
- **Files modified:** hooks/brief-validate-provenance.sh
- **Verification:** All 13 fixtures exit with expected codes; all 22 tests pass; syntax check `bash -n` passes.
- **Committed in:** `3af874b` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Critical correctness fix. Without this, the hook would be a dry-run no-op on macOS developers' machines (BRIEF's primary user geography is Korea where Mac usage is high). No scope creep — fix stays within the hook file.

## Issues Encountered

- Research spec's regex was latently broken on BSD awk. Caught by smoke-testing against the invalid-untagged-currency.md fixture immediately after first hook write (Task 2). Fix applied inline before committing. No downstream task disruption.

## Known Limitations

- **VERIFIED tag date-validity is syntactic-only:** The hook checks for `|YYYY-MM-DD` format, not that the date is plausible, ≤ today, or actually reached by the cited URL. Plan 08 canary spot-checks this boundary; semantic date validation deferred.
- **Creative-avoidance iteration deferred:** The include/exclude regex pair is initial-calibration. Phase 9 HRD-04 pilot feedback will inform ban-list expansion (new exclude patterns for phrasings that trip the gate). T-5-03-07 spoofing (fake `[VERIFIED:any|1999-01-01]`) is `accept` disposition — tag presence is the signal; semantics enforced by reviewer.
- **False-positive rate observed during canary:** Unknown until Phase 5 canary E2E (Plan 08) runs against real research output. All 7 false-positive fixtures pass; real-world observation will inform HRD-04.
- **No full-fixture end-to-end hook wiring test:** Tests exercise the hook directly via `bash $HOOK`. Integration with Claude Code's PreToolUse event loop is not directly tested; relies on parallel-structure to the proven `brief-validate-commit.sh` hook which has been in production through Phase 4.

## User Setup Required

None — the hook is opt-in by design. To enable after install:
1. Add to `.planning/config.json`: `"hooks": { "community": true }`
2. (Korea region, optional) Add: `"brief": { "region": "kr" }` to get Korean error messages
3. Trigger a commit; hook fires on `git commit -*` paths only.

## Next Phase Readiness

- Ready for Plan 05-04 (AUDIENCE duplicate-rename) — shares the opt-in gate pattern and builds on the same `.planning/config.json` surface.
- Ready for Plan 05-07 (Phase 5 canary E2E) — hook will be exercised against real researcher agent output to observe false-positive rate and populate HRD-04 feedback.
- Ready for Phase 9 HRD-02 (Surface Cap audit) — no new user-facing commands added by this plan.

## Self-Check: PASSED

Verified after SUMMARY.md draft:

- `hooks/brief-validate-provenance.sh` FOUND
- `tests/fixtures/provenance/` FOUND (13 files)
- `tests/brief-provenance-positive.test.cjs` FOUND
- `tests/brief-provenance-negative.test.cjs` FOUND
- `tests/brief-provenance-false-positives.test.cjs` FOUND
- `tests/brief-provenance-hook.test.cjs` FOUND
- `tests/brief-provenance-opt-in.test.cjs` FOUND
- `scripts/build-hooks.js` modified (brief-validate-provenance in HOOKS_TO_COPY)
- `bin/install.js` modified (4 parallel entries)
- Commit `c71ba30` FOUND
- Commit `3af874b` FOUND
- Commit `892e569` FOUND
- Commit `61686c2` FOUND
- Commit `63294fa` FOUND
- Commit `384920f` FOUND
- Commit `8d200d2` FOUND

---
*Phase: 05-discover-parallel-research-with-provenance-audience-context-injection*
*Plan: 03*
*Completed: 2026-04-23*
