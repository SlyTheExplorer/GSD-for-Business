---
phase: 05-discover-parallel-research-with-provenance-audience-context-injection
plan: 05
subsystem: audience-paired-sibling-and-align-filename-migration
tags: [paired-sibling, audience-activation, align-filename-migration, d-11, d-12, grep-audit, phase-4-regression, phase-7-template]

# Dependency graph
requires:
  - phase: 05-discover-parallel-research-with-provenance-audience-context-injection
    provides: Plan 05-04 AUDIENCE gate stack (audience.cjs with stub path, dispatcher with --artifact plumbed but inert, audience-report.cjs renderer)
  - phase: 04-first-gate-align-pattern-established
    provides: ALIGN gate code paths referencing ALIGN-00.md (align.cjs / align-report.cjs / brief-tools.cjs / align-gate.md / define.md / brief-align-gate.md / align-vocabulary.md)
provides:
  - brief/bin/lib/audience.cjs `_siblingReportPath` helper + activated commitAudienceVerdict paired-sibling write (D-11)
  - brief/bin/lib/align.cjs commitAlignVerdict writes to OBJECTIVES.align.md (D-12 migrated)
  - Grep-audit invariant: zero `ALIGN-00` references across brief/, agents/, commands/brief/, hooks/
  - tests/brief-audience-sibling-filename.test.cjs — 6 sibling-scheme locks
  - tests/brief-align-filename-migration.test.cjs — 9 D-12 audit tests
  - Paired-sibling filename scheme uniformly applies: Phase 7 COMPLIANCE inherits `{artifact}.compliance.md` without re-migration
affects: [phase-05-plan-07, phase-05-plan-08, phase-07-all-plans]

# Tech tracking
tech-stack:
  added: []  # Zero new runtime dependencies (A1 preserved — 0 deps)
  patterns:
    - "Paired-sibling output scheme: {artifact-dir}/{artifact-basename}.{suffix}.md — uniform across ALIGN (.align.md), AUDIENCE (.audience.md), and future COMPLIANCE (.compliance.md)"
    - "_siblingReportPath helper co-located with the primitive library that consumes it; exported for cross-module and test reuse"
    - "Dispatcher/body decoupling (WARNING-05 pattern): Plan 04 shipped --artifact flag inert; Plan 05 activates it in the body without dispatcher signature change"
    - "Grep-audit-as-test: D-12 migration lock enforced via execSync grep in a node:test that fails on any regression"
    - "Migration atomicity: single plan delivers code-path rename across 7 production files + 4 test suites + tightened _resolveSafePath contract"

key-files:
  created:
    - tests/brief-audience-sibling-filename.test.cjs           # 6 tests, 184 lines
    - tests/brief-align-filename-migration.test.cjs            # 9 tests, 90 lines
  modified:
    # Task 1 (paired-sibling activation)
    - brief/bin/lib/audience.cjs                               # + _siblingReportPath + activated sibling write + artifactPath required
    - brief/bin/lib/audience-report.cjs                        # docstring updated (renderer body unchanged)
    # Task 2 (D-12 ALIGN filename migration — production)
    - brief/bin/lib/align.cjs                                  # commitAlignVerdict writes OBJECTIVES.align.md
    - brief/bin/lib/align-report.cjs                           # docstring updated
    - brief/bin/brief-tools.cjs                                # align commit success message updated
    - brief/references/align-vocabulary.md                     # ban-list section header updated
    - brief/workflows/align-gate.md                            # 14 workflow references swapped
    - brief/workflows/define.md                                # 2 workflow references swapped
    - agents/brief-align-gate.md                               # agent purpose block updated
    # Task 2 (D-12 ALIGN filename migration — tests)
    - tests/brief-align-canary.test.cjs                        # canary assertions reference new path
    - tests/brief-align-vocabulary-lock.test.cjs               # emit-path assertions updated
    - tests/state-brief-override-roundtrip.test.cjs            # CLI-and-lib tests updated
    - tests/brief-audience-state-roundtrip.test.cjs            # artifactPath scoped to .planning/ (tightened _resolveSafePath contract)
    - tests/brief-audience-vocabulary-lock.test.cjs            # same tightening + label updates

key-decisions:
  - "Paired-sibling scheme is uniform across ALIGN (OBJECTIVES.align.md), AUDIENCE ({artifact}.audience.md), and future COMPLIANCE ({artifact}.compliance.md) — Phase 7 inherits the scheme verbatim"
  - "_siblingReportPath lives in audience.cjs (first activator); Phase 4 ALIGN canary uses a fixed filename `OBJECTIVES.align.md` — no helper call needed, same result pattern"
  - "Task 2's migration atomically tightens commitAudienceVerdict's _resolveSafePath contract (artifactPath must be inside .planning/); pre-existing tests that used paths outside .planning/ were updated as part of Task 2's scope (Rule 1 — tightening inherent to activation)"
  - "Grep-audit test (Task 4) is the durable invariant; any future edit that re-introduces ALIGN-00 (code, workflow, doc, comment) triggers test-failure"
  - "macOS /var → /private/var symlink canonicalization in _resolveSafePath required fs.realpathSync in Task 3's end-to-end assertion"

requirements-completed: [DSG-13]

# Metrics
duration: ~7 min (Wave 4, sequential single executor)
completed: 2026-04-24
---

# Phase 05 Plan 05: Paired-Sibling Activation + ALIGN Filename Migration Summary

Activates the D-11 paired-sibling filename scheme for AUDIENCE ({artifact}.audience.md) and completes the D-12 migration of Phase 4's ALIGN canary target from the provisional `.planning/ALIGN-00.md` to the paired-sibling `.planning/OBJECTIVES.align.md`. Single atomic plan preserves the Phase 1 D-09 buildable-discipline; Phase 7 COMPLIANCE inherits `{artifact}.compliance.md` without a third migration.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Paired-sibling activation in audience.cjs (D-11) | `c5728d0` | brief/bin/lib/audience.cjs, brief/bin/lib/audience-report.cjs |
| 2 | D-12 ALIGN filename migration across 7 production files + 5 test files | `e3844d4` | brief/bin/lib/align.cjs, brief/bin/lib/align-report.cjs, brief/bin/brief-tools.cjs, brief/references/align-vocabulary.md, brief/workflows/align-gate.md, brief/workflows/define.md, agents/brief-align-gate.md, tests/brief-align-canary.test.cjs, tests/brief-align-vocabulary-lock.test.cjs, tests/state-brief-override-roundtrip.test.cjs, tests/brief-audience-state-roundtrip.test.cjs, tests/brief-audience-vocabulary-lock.test.cjs |
| 3 | Paired-sibling scheme test (6 tests) | `9b08efd` | tests/brief-audience-sibling-filename.test.cjs |
| 4 | D-12 migration audit test (9 tests) | `7f3df68` | tests/brief-align-filename-migration.test.cjs |

## Verification Evidence

- **Task 1 activation** — `node -e "const a=require('./brief/bin/lib/audience.cjs'); const p=a.siblingReportPath('/tmp/foo/bar.md','audience'); if(p!=='/tmp/foo/bar.audience.md')process.exit(1);"` exits 0. Helper exports and `commitAudienceVerdict` requires `artifactPath` (throws otherwise).
- **Task 2 grep audit** — `grep -rn "ALIGN-00" brief/ agents/ commands/brief/ hooks/ 2>/dev/null | wc -l | tr -d ' '` returns `0`. Zero residual ALIGN-00 references in production code.
- **Phase 4 regression** — all 50 Phase 4 ALIGN tests pass (canary, primitives, vocabulary-lock, no-hook, text-mode, default). Status rendering, state round-trip, override flag, and path-traversal rejection all verified against the new OBJECTIVES.align.md filename.
- **Phase 5 AUDIENCE tests** — all 21 tests pass after test-file tightening (artifactPath now inside .planning/, sibling-read assertions updated to use returned `audiencePath`).
- **New tests** — 6 sibling-scheme tests + 9 D-12 audit tests = 15 new locks.
- **Full test-suite** — 99 tests across `brief-align-*`, `brief-audience-*`, `state-brief-override-roundtrip` all pass. Zero failures.
- **A1 preservation** — `package.json` `dependencies` count = 0.
- **Surface cap** — zero new files under `commands/brief/` (`audience*`, `align*`, `compliance*`, `realign*` all absent).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Test fixtures used paths outside .planning/ under Plan 04 stub-path inertness**

- **Found during:** Task 2 (running Phase 5 AUDIENCE regression after Task 1 activation)
- **Issue:** Plan 04's `commitAudienceVerdict` ignored `opts.artifactPath` (stub path hard-coded), so two pre-existing tests (`brief-audience-vocabulary-lock.test.cjs`, `brief-audience-state-roundtrip.test.cjs`) passed paths outside `.planning/` for the artifactPath arg. Task 1's activation routes artifactPath through `_resolveSafePath`, which (correctly per T-5-05-01) rejects paths outside `.planning/`. Post-activation, these tests failed with `path traversal refused`.
- **Fix:** Updated 4 invocation sites to use `path.join(tmp, '.planning', 'x.md')` / `path.join(tmp, '.planning', 'some-artifact.md')` / `'.planning/x.md'` (relative form). Also updated test labels from `emitted .audience-report.tmp.md ...` to `emitted {artifact}.audience.md ...` and the one lingering hard-coded read path to use the commit result's `audiencePath`.
- **Files modified:** tests/brief-audience-vocabulary-lock.test.cjs, tests/brief-audience-state-roundtrip.test.cjs
- **Commit:** e3844d4 (bundled with Task 2's migration to keep the atomic commit scope intact)
- **Rationale:** This is the tightening of an existing security contract made active by this plan — not a bug in the new code. Documented here per deviation rule 1 because the tests were inconsistent with the activated contract, not because the activated contract was wrong.

**2. [Rule 1 - Bug] Test 5 path equality failed on macOS due to /private/var symlink**

- **Found during:** Task 3 (running the new sibling-filename tests)
- **Issue:** `result.audiencePath` from `commitAudienceVerdict` goes through `_resolveSafePath`, which canonicalizes the path via `fs.realpathSync`. On macOS, `/var` is a symlink to `/private/var`, so the returned path is `/private/var/.../market-sizing.audience.md` while the assertion built `path.join(tmp, ...)` which remains `/var/.../market-sizing.audience.md`. Strict equality failed.
- **Fix:** Test asserts `fs.realpathSync(result.audiencePath) === fs.realpathSync(expectedSibling)` so the comparison is symlink-robust on Mac, Linux, and Windows.
- **Files modified:** tests/brief-audience-sibling-filename.test.cjs
- **Commit:** 9b08efd
- **Rationale:** Phase 4's existing `_resolveSafePath` in align.cjs encountered the same issue; the solution pattern is inherited verbatim.

**3. [Rule 1 - Bug] Added `migrated from ALIGN-00.md` phrase to migration comment in align.cjs inadvertently re-introduced a residual ALIGN-00 reference**

- **Found during:** Task 2 (first grep audit after initial edits)
- **Issue:** I authored an explanatory comment in align.cjs's `commitAlignVerdict` block stating "D-12 migrated from ALIGN-00.md in Plan 05-05)" for historical context. The grep audit in the verify step caught the residual.
- **Fix:** Removed the historical phrase; comment now reads "per D-12 Plan 05-05 migration".
- **Files modified:** brief/bin/lib/align.cjs
- **Commit:** e3844d4 (same Task 2 commit)
- **Rationale:** The grep-audit test in Task 4 is load-bearing — it catches any future regression, including inadvertent re-introduction in comments. Explanatory context belongs in this SUMMARY.md, not in source code where it would perpetually fail the audit.

## Auto-fix Attempts

- Task 1: 0 fixes needed
- Task 2: 3 deviation fixes (test-suite tightening + comment-residual scrub) — well under the 3-fix limit
- Task 3: 1 fix (realpath test assertion)
- Task 4: 0 fixes needed

## Known Stubs

None. The Plan 04 stub path (`.planning/.audience-report.tmp.md`) is fully replaced by this plan's paired-sibling activation. No future plan owes a follow-up.

## Threat Flags

No new threat surface beyond the 6 items in `<threat_model>` of 05-05-PLAN. Mitigations hold:

- T-5-05-01 Elevation of Privilege (siblingReportPath escapes via `../`) → `commitAudienceVerdict` passes artifactPath through `_resolveSafePath` (exercised indirectly in tests/brief-audience-drifted-content.test.cjs:132 path-traversal test).
- T-5-05-02 Tampering (partial migration) → grep-audit test (Task 4) verifies completeness; all 50 Phase 4 ALIGN tests green after migration.
- T-5-05-03 Tampering (Phase 4 test regression) → Task 2 discovered and fixed 3 test files containing ALIGN-00 assertions; full Phase 4 ALIGN regression green.
- T-5-05-04 Information Disclosure (sibling write) → `accept` disposition retained; same directory as source is intentional per D-11.
- T-5-05-05 DoS (parallel-write race) → `atomicWriteFileSync` handles last-writer-wins.
- T-5-05-06 Spoofing (lingering ALIGN-00.md on disk) → 05-RESEARCH.md §A3 VERIFIED: file does not exist on disk at Phase 5 entry; no data migration required and none performed.

## Notes for Phase 7 COMPLIANCE Planner

When Phase 7 introduces the COMPLIANCE gate:

1. **Paired-sibling scheme inherited:** Use `audience.siblingReportPath(artifactPath, 'compliance')` — the same helper; the third suffix just plugs in. Verification: Task 3 test already exercises `'compliance'` suffix (`siblingReportPath('/a/b/c.md', 'compliance') === '/a/b/c.compliance.md'`).
2. **No migration needed:** Phase 7 can introduce `commitComplianceVerdict` with sibling-write from day one; no provisional filename like ALIGN-00.md.
3. **Grep audit for template:** When duplicate-renaming audience.cjs → compliance.cjs, run the Task 4-style audit locally: `grep -rn "AUDIENCE-OK\|DRIFTED-frontmatter\|DRIFTED-content" brief/bin/lib/compliance.cjs` should return zero — confirming the mechanical rename swapped all verdict strings correctly.
4. **artifactPath contract:** commitComplianceVerdict MUST require `opts.artifactPath` (copy the require-or-throw block from audience.cjs line 357-359 verbatim).

## Surface Cap

Zero new user-facing commands added. Phase 2 D-07 surface cap (≤12 user-facing slash commands) preserved. This plan is pure primitive-activation + path-migration, invisible to end users.

## Self-Check: PASSED

**Files verified on disk:**
- FOUND: tests/brief-audience-sibling-filename.test.cjs
- FOUND: tests/brief-align-filename-migration.test.cjs
- FOUND (modified): brief/bin/lib/audience.cjs
- FOUND (modified): brief/bin/lib/audience-report.cjs
- FOUND (modified): brief/bin/lib/align.cjs
- FOUND (modified): brief/bin/lib/align-report.cjs
- FOUND (modified): brief/bin/brief-tools.cjs
- FOUND (modified): brief/references/align-vocabulary.md
- FOUND (modified): brief/workflows/align-gate.md
- FOUND (modified): brief/workflows/define.md
- FOUND (modified): agents/brief-align-gate.md
- FOUND (modified): tests/brief-align-canary.test.cjs
- FOUND (modified): tests/brief-align-vocabulary-lock.test.cjs
- FOUND (modified): tests/state-brief-override-roundtrip.test.cjs
- FOUND (modified): tests/brief-audience-state-roundtrip.test.cjs
- FOUND (modified): tests/brief-audience-vocabulary-lock.test.cjs

**Commits verified (via `git log --oneline`):**
- FOUND: c5728d0 (Task 1 — audience paired-sibling activation)
- FOUND: e3844d4 (Task 2 — D-12 ALIGN filename migration + test-suite sync)
- FOUND: 9b08efd (Task 3 — sibling-filename test)
- FOUND: 7f3df68 (Task 4 — D-12 migration audit test)
