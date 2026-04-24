---
phase: 06-bidirectional-foundation-phase-1-2-return-stack
plan: 06
subsystem: workflows
tags: [align-gate-integration, gap-detect-spawn, d-02-trigger, d-11-dual-condition, vocabulary-lock, surface-cap-preserved, hook-purity-preserved]

# Dependency graph
requires:
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-02 brief/workflows/gap-detect.md (Steps 0-6) and agents/brief-gap-detector.md —
      Step 8 invokes the workflow inline with ARTIFACT_PATH + OBJECTIVES_BASELINE_PATH +
      BUSINESS_CONTEXT_BLOCK + CURRENT_WORKSTREAM + PAUSED_PHASE parameters.
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-03 maybePopTopFrame primitive (D-11 dual-condition, atomic slice-based pop) —
      invoked from Step 4.5 via `brief-tools.cjs gap-detect maybe-pop`.
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-04 runGapDetect + commitGapDetectVerdict + 7-subcommand dispatcher (run / commit /
      push-frame / count-iterations / cancel-workstream / write-assumption / maybe-pop) —
      Step 8 routes through count-iterations; Step 4.5 routes through maybe-pop.
  - phase: 05-discover-parallel-research-with-provenance-audience-context-injection
    provides: |
      brief/bin/lib/context-inject.cjs:buildBusinessContext() — Step 8.1 invokes via Node one-liner
      (same pattern as brief/workflows/discover.md Step 4) to produce ctx.promptBlock for the
      gap-detector agent's <business_context> injection.
  - phase: 04-first-gate-align-pattern-established
    provides: |
      brief/workflows/align-gate.md (Steps 0-7 + no_hooks_assertion + command_surface_assertion
      blocks) — Phase 6 inserts Step 4.5 + Step 8 WITHOUT reordering existing Steps 0-7.
      brief/references/align-vocabulary.md ban-list — vocabulary discipline preserved verbatim
      (deviation #1 auto-fixed).

provides:
  - "brief/workflows/align-gate.md — extended from 352 to 475 lines with Step 4.5 (D-11 frame-pop attempt) + Step 8 (D-02 gap-detect post-verdict spawn). Step 4.5 runs between Step 4 and Step 5A; Step 8 runs after Step 7. Preserves Steps 0-7 + Pattern 4 visibility + no_hooks_assertion + command_surface_assertion blocks."
  - "3 test files (13 assertions) locking D-07 hard-cap vocabulary, D-08 meta-arbiter vocabulary, D-03 severity routing, and align-gate.md structural step ordering."
  - "Hook-purity preserved (structural test in align-gate.md <no_hooks_assertion> block; grep -rE 'gap-detect|brief-gap-detector|gap_detect' hooks/ returns 0)."
  - "Surface cap preserved (structural test in align-gate.md <command_surface_assertion> block; no new commands/brief/*.md for gap-detect / gap / return-stack / resume; net Phase 6 user-facing command additions = 0)."
affects: [06-07, 06-08]

# Tech tracking
tech-stack:
  added: []  # A1 preserved — zero runtime deps
  patterns:
    - "Gate-composition workflow pattern: align-gate.md Step 8 invokes gap-detect.md inline (not as a hook, not as a standalone command). Phase 7 COMPLIANCE can replicate the same shape (e.g., align-gate.md Step 9 → compliance-check.md) without further architectural change."
    - "Pattern 4 visibility preserved: orchestrator-internal step insertions remain in the workflow markdown (visible to the caller's reading flow), not submerged into a .cjs file. align.cjs is unchanged — Phase 4 contract locked."
    - "Inline context-inject reuse: Step 8.1 re-uses the brief/workflows/discover.md Step 4 buildBusinessContext() Node one-liner verbatim. Same pattern, same parse (ctx.promptBlock + ctx.language), zero new context helper."
    - "Structural test co-location: gap-detect hook-purity grep + surface-cap ls invariants live INSIDE align-gate.md (<no_hooks_assertion> + <command_surface_assertion> blocks). A future Phase 6/7/8 verifier can load align-gate.md and extract the grep/ls command lines directly."
    - "Vocabulary-lock auto-fix discipline: ban-list test (tests/brief-align-vocabulary-lock.test.cjs) caught a regression introduced by Step 4.5 ('passed ALIGN'). Deviation Rule 1 auto-fixed via single-word substitution; vocabulary discipline preserved without scope creep."

key-files:
  created:
    - tests/brief-gap-detect-iteration-2-meta-arbiter.test.cjs
    - tests/brief-gap-detect-iteration-3-hard-cap.test.cjs
    - tests/brief-gap-detect-material-only.test.cjs
  modified:
    - brief/workflows/align-gate.md

key-decisions:
  - "Step 4.5 lives in the workflow markdown, NOT inside align.cjs — preserves Phase 4 contract. align.cjs is untouched by Phase 6. The D-11 dual-condition pop is semantically a Phase-6 concern (return-stack lifecycle), not a Phase-4 concern (ALIGN alignment). Owner: gap-detect.cjs:maybePopTopFrame."
  - "Step 8 fires after Step 7 (the workflow's exit point) but BEFORE the actual orchestrator-visible return. It operates on the same verdict Step 4 committed, branches on the gap-detect workflow's exit JSON, and can override Step 7's exit decision (specifically: GAPS-BLOCKING pushed=true flips exit to RETURNED-TO-DISCOVER)."
  - "Vocabulary fix for ban-list regression committed as a SEPARATE atomic commit (ad8f1ad) rather than folded into Task 1. Rationale: Rule 1 deviation-fix commits document the root cause ('passed ALIGN' leakage) distinctly from Task 1's primary scope (Step 4.5 + Step 8 insertion). Bisect-friendly."
  - "D-07 no-bypass test refined beyond the plan's literal regex (/Force[- ]continue/i) to handle the 'No force-continue' negation prose without false positives. The stricter regex (/\\(\\d+\\)\\s*[^\\n.]*force[- ]continue|\\n\\s*\\d+\\.\\s*.*force[- ]continue/i) only matches an ACTIONABLE option, not a documentation notice. Invariant preserved; test more accurate."

patterns-established:
  - "Workflow-composes-workflow pattern: align-gate.md Step 8 invokes gap-detect.md inline — the orchestrator reads align-gate.md, sees 'invoke brief/workflows/gap-detect.md with {parameters}', and dispatches. No new runtime surface, no dispatcher branch, no hook. Phase 7 COMPLIANCE will use the same pattern: align-gate.md Step 9 invokes compliance-check.md."
  - "Phase-aware step insertion: Phase 6 additions explicitly labeled '(Phase 6 addition)' in section headers. A future Phase 7/8 reader can grep for 'Phase 6 addition' to audit the exact Phase 6 scope within the workflow."
  - "Structural test delegation: rather than hard-coding gap-detect invariants into a separate vocabulary-lock file, the structural tests (hook-purity grep + surface-cap ls) live INSIDE align-gate.md's <no_hooks_assertion> + <command_surface_assertion> blocks as executable command lines. Plan 08 can extract and verify them with a few-line shell script."

requirements-completed: [DSG-11]

# Metrics
duration: ~25 min
completed: 2026-04-24
---

# Phase 6 Plan 06: Align-Gate Integration Summary

**Wires the Phase 6 gap-detect subsystem (Plan 02 workflow + Plan 03 primitives + Plan 04 dispatcher) into the existing Phase 4 ALIGN orchestrator via two surgical insertions — Step 4.5 (D-11 frame-pop attempt after verdict commit) and Step 8 (D-02 gap-detect post-verdict spawn). No new hooks, no new user-facing commands, no Phase 4 align.cjs contract changes. align-gate.md grows from 352 → 475 lines; 3 test files (13 assertions) lock D-07 hard-cap + D-08 meta-arbiter vocabulary + D-03 severity routing against regression. All 191 Phase 4/5/6 tests pass.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-24 (Wave 4 parallel executor)
- **Completed:** 2026-04-24
- **Tasks:** 2 / 2
- **Files created:** 3 test files
- **Files modified:** 1 (brief/workflows/align-gate.md)

## Accomplishments

- **Task 1 shipped** Step 4.5 + Step 8 surgical insertions into `brief/workflows/align-gate.md`. Step 4.5 (D-11 dual-condition frame-pop) runs between existing Step 4 (ALIGNED commit) and Step 5A (DRIFTED interrupt). Step 8 (D-02 gap-detect spawn) runs after existing Step 7 (exit) and before `</process>`. The `<no_hooks_assertion>` block gains a Phase 6 citation (D-02) + gap-detect hook-purity structural test (`grep -rE 'gap-detect|brief-gap-detector|gap_detect' hooks/` returns 0). The `<command_surface_assertion>` block gains a Phase 6 surface-cap structural test (ls of 4 gap-detect command files returns 0). File grows from 352 → 475 lines (within the ≥420-line plan target).
- **Task 2 shipped** 3 TDD-discipline test files (13 assertions). `brief-gap-detect-iteration-2-meta-arbiter.test.cjs` locks D-08 EN prompt wording, 3 options verbatim, 20-char justification floor, Korean i18n variant, and countIterations-with-history-1-push integration. `brief-gap-detect-iteration-3-hard-cap.test.cjs` locks D-07 exact hard-cap wording, exactly 3 numbered options (no (4), no force-continue bypass), countIterations-with-history-2-pushes integration, and align-gate.md structural order (Step 4.5 before Step 5A; Step 8 after Step 7). `brief-gap-detect-material-only.test.cjs` locks D-03 severity routing — material-only fixture routes 3 findings to gap_queue with 0 frame push; mixed-severity fixture routes 1 BLOCKING to return_stack + 2 MATERIAL to gap_queue + drops 1 NICE-TO-HAVE.
- **Deviation auto-fixed** (Rule 1 — ban-list regression): Task 1's Step 4.5 prose initially contained "passed ALIGN". This triggered `tests/brief-align-vocabulary-lock.test.cjs` → 'static file brief/workflows/align-gate.md — no ban-list tokens anywhere' assertion failure. Replaced with "resolved the gap (ALIGNED verdict)". Single-word substitution; Phase 4 vocabulary discipline preserved verbatim. Fix committed as a separate atomic commit (ad8f1ad).
- **A1 preserved** — Object.keys(package.json.dependencies).length === 0. Zero new runtime deps.
- **Surface Cap preserved** — zero new user-facing `commands/brief/*.md` files for gap-detect / gap / return-stack / resume. Net Phase 6 additions = 0.
- **Hook-purity preserved** — `grep -rE 'gap-detect|brief-gap-detector|gap_detect' hooks/` returns 0 lines. Anti-pattern #2 (hook-based gate invocation) intact.

## Task Commits

Three atomic commits:

1. **Task 1: align-gate.md Step 4.5 + Step 8 integration (D-11 pop + D-02 gap-detect spawn)** — `c206193` (feat)
2. **Deviation fix (Rule 1): Step 4.5 ban-list vocabulary cleanup ('passed ALIGN' → 'resolved the gap')** — `ad8f1ad` (fix)
3. **Task 2: iteration-2 meta-arbiter + iteration-3 hard-cap + GAPS-MATERIAL-ONLY vocabulary-lock tests** — `df068cb` (test)

## Files Created/Modified

### Created (3 test files, 318 total LOC)

| Path | Lines | Purpose |
|------|-------|---------|
| `tests/brief-gap-detect-iteration-2-meta-arbiter.test.cjs` | 62 | D-08 meta-arbiter EN + options + 20-char floor + Korean variant + history-1-push fixture (5 assertions) |
| `tests/brief-gap-detect-iteration-3-hard-cap.test.cjs` | 116 | D-07 hard-cap EN + 3-options + no 4th + no bypass + history-2-pushes fixture + align-gate.md structural order (6 assertions) |
| `tests/brief-gap-detect-material-only.test.cjs` | 140 | D-03 severity routing — material-only + mixed-severity fixtures (2 assertions) |

### Modified

| Path | Δ Lines | Purpose |
|------|---------|---------|
| `brief/workflows/align-gate.md` | 352 → 475 (+123) | Step 4.5 + Step 8 insertion + no_hooks_assertion + command_surface_assertion block extensions |

## Verification

**All plan `<verification>` checks pass:**

| Check | Expected | Actual |
|-------|----------|--------|
| `grep -c '## Step 4.5' brief/workflows/align-gate.md` | 1 | 1 |
| `grep -c '## Step 8' brief/workflows/align-gate.md` | ≥1 | 5 (Step 8 + 4 subsections) |
| `grep -c 'maybe-pop' brief/workflows/align-gate.md` | ≥1 | 2 |
| `grep -c 'gap-detect.md' brief/workflows/align-gate.md` | ≥1 | 4 |
| `grep -c 'buildBusinessContext' brief/workflows/align-gate.md` | ≥1 | 1 |
| `node --test tests/brief-gap-detect-iteration-2-meta-arbiter.test.cjs tests/brief-gap-detect-iteration-3-hard-cap.test.cjs tests/brief-gap-detect-material-only.test.cjs` | exits 0, fail 0 | 13 pass / 0 fail / 127ms |
| `grep -rE 'gap-detect\|brief-gap-detector\|gap_detect' hooks/ 2>/dev/null` | 0 lines | 0 lines |
| `ls commands/brief/gap-detect.md commands/brief/gap.md commands/brief/return-stack.md commands/brief/resume.md 2>/dev/null` | 0 files | 0 files |
| `wc -l brief/workflows/align-gate.md` | ≥420 | 475 |
| `Object.keys(package.json.dependencies).length` (A1) | 0 | 0 |

### Test breakdown per file

| Test file | Assertions | Runtime |
|-----------|------------|---------|
| `brief-gap-detect-iteration-2-meta-arbiter.test.cjs` | 5 | ~15 ms |
| `brief-gap-detect-iteration-3-hard-cap.test.cjs` | 6 | ~12 ms |
| `brief-gap-detect-material-only.test.cjs` | 2 | ~15 ms |
| **Total (Plan 06 new)** | **13** | **~42 ms total; suite 127 ms including setup** |

**Cumulative Phase 6 coverage (Plans 03 + 04 + 06):** 100 tests / 100 pass / 0 fail.
**Adjacent Phase 4/5 regression (align + audience):** 91 tests / 91 pass / 0 fail.
**Combined Phase 4+5+6:** 191 tests / 191 pass / 0 fail / 850ms.

### Hook-purity grep result

```
$ grep -rE 'gap-detect|brief-gap-detector|gap_detect' hooks/ 2>/dev/null
(empty output, exit 0 — no hook file references gap-detect)
```

### Surface-cap preservation snapshot

```
$ ls commands/brief/gap-detect.md commands/brief/gap.md commands/brief/return-stack.md commands/brief/resume.md 2>/dev/null
(empty output — no user-facing gap-detect / gap / return-stack / resume command files)
```

Pre-existing `commands/brief/resume-work.md` is a Phase-1-inherited GSD file (NOT a Phase-6-added file). Verified via `git log --diff-filter=A -- commands/brief/resume-work.md` → Phase 1 rename commit (pre-existing before Phase 6).

## Decisions Made

- **Step 4.5 lives in the workflow markdown (NOT align.cjs).** Rationale: Phase 4 contract lock — align.cjs gets no new function from Phase 6. The D-11 dual-condition pop is semantically a Phase-6 concern (return-stack lifecycle), not a Phase-4 concern (ALIGN alignment). Owner: gap-detect.cjs:maybePopTopFrame, invoked via `brief-tools.cjs gap-detect maybe-pop` dispatcher subcommand.
- **Step 8 spawns AFTER Step 7 exit (not before).** Rationale: Step 8 operates on the verdict Step 4 committed and can override Step 7's exit decision (specifically: GAPS-BLOCKING pushed=true flips exit to RETURNED-TO-DISCOVER). Spawning before Step 7 would require Step 7 to re-read gap-detect's exit, duplicating the branch logic.
- **Vocabulary fix committed separately (ad8f1ad), not folded into Task 1.** Rationale: Rule 1 deviation-fix commits document the root cause distinctly from the primary scope. Bisect-friendly. Task 1's c206193 commit represents the clean Step 4.5 + Step 8 insertion intent; ad8f1ad represents the vocabulary discipline preservation.
- **D-07 no-bypass test refined beyond plan's literal regex.** Rationale: the workflow's explicit negation clause "No option 4. No force-continue." would false-positive against a naive `/Force[- ]continue/i` regex. Refined to `/(\d+)\s*[^\n.]*force[- ]continue/` (actionable-option pattern only). Plan intent (no force-continue AS AN OPTION) preserved; false positive on documentation prose eliminated.
- **Test-file assertions count (13) rather than the plan's behavior count (10).** Rationale: the plan's 10 behaviors map 1-to-many into assertions (e.g., behavior 2 "3 options lock" → 3 assertions). 13 assertions == 10 behaviors covered; the count is a more precise runtime fingerprint for CI.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Ban-list token "passed" leaked into Step 4.5 prose during Task 1 insertion**
- **Found during:** Post-Task-1 regression check (`node --test tests/brief-align-vocabulary-lock.test.cjs`)
- **Issue:** Step 4.5 prose initially said "on the happy path where the new research actually passed ALIGN". The token "passed" is on the EN ban-list in `brief/references/align-vocabulary.md` (Pitfall #4 — compliance checkbox theater). `tests/brief-align-vocabulary-lock.test.cjs` caught the regression with: `[brief/workflows/align-gate.md] EN ban-list token 'passed' appeared 1x. Pitfall #4 vocabulary theater has manifested.`
- **Fix:** Single-word substitution — "passed ALIGN" → "resolved the gap (ALIGNED verdict)". No semantic change; ALIGN findings-vocabulary discipline preserved. Verified via re-running the vocabulary-lock test → 6/6 pass.
- **Files modified:** `brief/workflows/align-gate.md`
- **Commit:** `ad8f1ad` (separate atomic fix commit, not folded into Task 1's c206193)

**2. [Rule 1 - Bug] Plan's no-bypass regex (Test 5, iteration-3) false-positives on the negation notice**
- **Found during:** Pre-write analysis of the plan's test behavior 5
- **Issue:** The plan specifies the test should check `!/Force[- ]continue|force[- ]continue/i.test(block)` where `block` is the hard-cap section. But the hard-cap section explicitly contains "No option 4. No force-continue." as a documentation notice. The naive regex would always fire (false positive), inverting the test's intent.
- **Fix:** Refined to an "actionable-option-only" regex: `/\(\d+\)\s*[^\n.]*force[- ]continue|(?:^|\n)\s*\d+\.\s*.*force[- ]continue/i`. This matches `(4) Force continue` or `4. Force continue` (actionable option forms) but NOT "No force-continue" (documentation prose). Same discipline applied to the "bypass" keyword test. Plan intent — locking against D-07 bypass regression — fully preserved.
- **Files modified:** `tests/brief-gap-detect-iteration-3-hard-cap.test.cjs` (written with the refined regex)
- **Commit:** Folded into `df068cb` (Task 2 commit)

Both fixes auto-applied per Rule 1; no architectural changes needed.

## Issues Encountered

- **Worktree base reset required.** The worktree branch HEAD was on a divergent Phase-3 branch (`fb7385f`), not the expected `e99b5c2` (Wave 3 complete). Resolved via `git reset --hard e99b5c2eeb708fca42b37a310ffeab6770cab02b` (destructive operation justified because the base mismatch would otherwise prevent Phase-6 work from being visible to the orchestrator; worktree's prior state preserved via reflog `HEAD@{1}`). After reset, phase 06 dir structure confirmed present; Plans 01-05 SUMMARY files confirmed present.
- **Ban-list regression on first test-file run.** `tests/brief-align-vocabulary-lock.test.cjs` was the ONLY failing test after Task 1 completed. Root cause was the "passed ALIGN" leakage described in Deviation #1. Fix was mechanical; no re-planning needed.
- **No other issues.** Task 2's 13 assertions all green on the first GREEN run after writing the test files; gap-detect.md (Plan 06-02) and gap-detect.cjs (Plans 06-03/04) already contained the expected vocabulary surfaces.

## User Setup Required

None — all test fixtures are repo-internal JSON files (already seeded by Plan 06-01). No external services, no env vars, no credentials.

## Next Phase Readiness

**Plans 07-08 unblocked:**

- **Plan 06-07** (discover.md Step 0.5 resume-auto-detect, D-10) has the align-gate.md integration side complete. The two sides of the bidirectional flow (pop = align-gate.md Step 4.5 + spawn = align-gate.md Step 8; resume = discover.md Step 0.5) can now be exercised end-to-end by a canary test once Plan 07 ships.
- **Plan 06-08** (verification — canary E2E + structural audits) has all the grep-audit sources ready:
  - align-gate.md for `## Step 4.5` + `## Step 8` + `maybe-pop` + `gap-detect.md` + `buildBusinessContext` + `count-iterations` + `GAPS-BLOCKING` + `RETURNED-TO-DISCOVER` + `Phase 6 addition`.
  - align-gate.md `<no_hooks_assertion>` block for the hook-purity grep invariant.
  - align-gate.md `<command_surface_assertion>` block for the surface-cap ls invariant.
  - tests/brief-gap-detect-iteration-*-*.test.cjs + tests/brief-gap-detect-material-only.test.cjs for D-07 + D-08 + D-03 vocabulary lock regressions.

**A1 preservation**: Object.keys(package.json.dependencies).length === 0 verified post-commit.

**Surface Cap preservation**: 0 new user-facing `commands/brief/*.md` files.

**Hook-purity preservation**: 0 hook files reference gap-detect / brief-gap-detector / gap_detect.

## Known Stubs

None. Step 8 is fully wired to invoke the gap-detect.md workflow with the correct parameter set. The workflow-inline-invocation pattern (string template in Step 8.3) is the orchestrator's native mechanism — a runtime agent reads Step 8, sees "Invoke brief/workflows/gap-detect.md with ...", and dispatches. This is NOT a stub; it is the pattern used throughout BRIEF (e.g., align-gate.md Step 2 "spawns subagent via Task" is the same shape).

## Threat Flags

No new surface beyond the plan's `<threat_model>` register. The 5 STRIDE threats (T-06-06-01 through T-06-06-05) are all mitigated:

| Threat | Mitigation present? | Verified by |
|--------|---------------------|-------------|
| T-06-06-01 (Step 8 invocation string silently edited to skip gap-detect) | Yes — Step 8 grep-audit asserts `## Step 8` heading + `gap-detect.md` string + `buildBusinessContext` one-liner + `count-iterations` branch. Any silent edit that removes these fires the Plan 06-08 E2E + structural audits. | `grep -c '## Step 8' + grep -c 'gap-detect.md' + grep -c 'buildBusinessContext' + grep -c 'count-iterations'` all ≥1 |
| T-06-06-02 (gap-detect attached as a PostToolUse hook) | Yes — `<no_hooks_assertion>` block's gap-detect structural test (`! grep -rE 'gap-detect\|brief-gap-detector\|gap_detect' hooks/`) fires on any future hook leak | Inline verification in this summary's Verification section → 0 lines |
| T-06-06-03 (D-07 hard-cap prompt wording silently weakened) | Yes — `tests/brief-gap-detect-iteration-3-hard-cap.test.cjs` asserts exact EN wording + exactly 3 numbered options + zero actionable force-continue/bypass options | Test pass 6/6 on df068cb |
| T-06-06-04 (D-08 meta-arbiter prompt wording silently weakened) | Yes — `tests/brief-gap-detect-iteration-2-meta-arbiter.test.cjs` asserts exact EN wording + 3 options verbatim + justification floor + Korean variant | Test pass 5/5 on df068cb |
| T-06-06-05 (new user-facing command file added during Phase 6 execution) | Yes — `<command_surface_assertion>` block's gap-detect structural test (`[ ! -f commands/brief/{gap-detect,gap,return-stack,resume}.md ]`) fires on any new command file | Inline verification in this summary's Verification section → 0 files |

## Self-Check: PASSED

Verified by direct file existence + git log commit hash check:

**Files (3 created + 1 modified):**
- `tests/brief-gap-detect-iteration-2-meta-arbiter.test.cjs` — FOUND (62 lines, 5 assertions)
- `tests/brief-gap-detect-iteration-3-hard-cap.test.cjs` — FOUND (116 lines, 6 assertions)
- `tests/brief-gap-detect-material-only.test.cjs` — FOUND (140 lines, 2 assertions)
- `brief/workflows/align-gate.md` — MODIFIED (475 lines, +123 vs base)

**Commits (3/3 found):**
- `c206193` (Task 1: Step 4.5 + Step 8 insertion) — FOUND in `git log`
- `ad8f1ad` (Deviation #1 fix: ban-list 'passed' → 'resolved the gap') — FOUND in `git log`
- `df068cb` (Task 2: 3 test files with 13 assertions) — FOUND in `git log`

**Test suite:** 13/13 pass (Plan 06 new); 100/100 pass (Phase 6 cumulative); 191/191 pass (Phase 4+5+6 combined). 0 fail.

---

*Phase: 06-bidirectional-foundation-phase-1-2-return-stack*
*Plan: 06*
*Completed: 2026-04-24*
