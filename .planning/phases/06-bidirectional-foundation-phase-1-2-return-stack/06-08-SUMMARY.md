---
phase: 06-bidirectional-foundation-phase-1-2-return-stack
plan: 08
subsystem: canary-e2e-anti-pattern-and-surface-cap-audit
tags: [canary-e2e, anti-pattern-2, surface-cap, a1-preservation, vocabulary-lock, text-mode-parity, phase-6-closure, phase-7-template]

# Dependency graph
requires:
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-01 fixtures (agent-return-blocking.json, stack-depth-1.json, etc.) —
      referenced in canary E2E test setup + fixture-shape compatibility check;
      Plan 06-02 content files (agents/brief-gap-detector.md, brief/bin/lib/gap-detect-report.cjs,
      brief/references/gap-detect-vocabulary.md, brief/workflows/gap-detect.md) — all 4
      are grep-audit + vocabulary-lock targets;
      Plan 06-03 lib primitives (pushReturnFrame, maybePopTopFrame, countIterations) —
      exercised verbatim in canary E2E steps 1-5;
      Plan 06-04 dispatcher (brief-tools.cjs case 'gap-detect' — 7 subcommands) —
      implicitly covered by cumulative regression;
      Plan 06-05 status.cjs Gap loop + Round-trips rows — canary Step 2 calls
      renderStatus() and asserts all 3 rows render simultaneously (DSG-11 + DSG-14);
      Plan 06-06 align-gate.md Step 4.5 + Step 8 — grep-audit target for
      <no_hooks_assertion> citation + ## Step 8 heading + gap-detect reference;
      Plan 06-07 discover.md Step 0.5 — TEXT_MODE fallback audit target
  - phase: 05-discover-parallel-research-with-provenance-audience-context-injection
    provides: |
      Plan 05-08 canary E2E + no-hook + no-new-command test shape —
      copy-renamed verbatim to Phase 6 with gate-name substitution
      (AUDIENCE → gap-detect; discover → gap-detect; 9-path → 7-path FORBIDDEN enum)
  - phase: 04-first-gate-align-pattern-established
    provides: |
      Phase 4 brief-align-vocabulary-lock.test.cjs precedent — block-strip filter
      pattern (strip <vocabulary_discipline> block + strip BAN_* constant lines
      before asserting clean) resolves the plan's coarse line-level filter
      false-positive trap (Rule 1 refinement)

provides:
  - "tests/brief-gap-detect-canary-e2e.test.cjs — 361 lines, 6 tests, ~76ms: full-cycle canary locking push → status render → countIterations → artifact rewrite → ALIGN ALIGNED seed → maybePopTopFrame"
  - "tests/brief-gap-detect-no-hook.test.cjs — 173 lines, 5 tests, ~147ms: Anti-pattern #2 grep-audit (hooks/ refs, config.json, routing, workflow <no_hooks_assertion>, align-gate.md Step 8 citation)"
  - "tests/brief-gap-detect-no-new-command.test.cjs — 120 lines, 5 tests, ~3ms: 7-path FORBIDDEN enum + A1 sentinel + /brief-discover preservation + hooks/ inventory audit"
  - "tests/brief-gap-detect-vocabulary-lock.test.cjs — 198 lines, 4 tests, ~3ms: Phase 6 authored files clean of ban-list tokens (with Phase 4 block-strip filter); vocab file completeness; topic_fingerprint contract + 3 canonical examples"
  - "tests/brief-gap-detect-text-mode.test.cjs — 111 lines, 4 tests, ~1ms: FND-06 TEXT_MODE parity for meta-arbiter + hard-cap + resume + Korean variants"
  - "Phase 6 COMPLETE: DSG-11 + DSG-14 both covered end-to-end by canary E2E Step 2 (/brief-status renders Return stack + Gap loop + Round-trips simultaneously after a push)"
  - "Phase 7 COMPLIANCE template: all 5 test files copy-rename verbatim once gate name swaps (compliance-checker.md / compliance.cjs / etc.)"
affects: [07-all-plans, 09-hrd-01, 09-hrd-02]

# Tech tracking
tech-stack:
  added: []  # Pure test addition — zero runtime deps (A1 preserved at 0)
  patterns:
    - "In-process canary E2E: require() the lib, inject fixtures, assert state/sibling/vocabulary — no child_process, no live LLM; runtime ≤1s"
    - "Block-strip vocabulary-lock filter (Phase 4 precedent): extract + remove <vocabulary_discipline> XML block from agent + strip lines with 'BAN_' constants from lib before asserting clean remainder. Resolves the plan's coarse line-level filter false-positive trap."
    - "3-invariant canary false-green resistance: canary verifies state transitions (return_stack + return_stack_history) + status.cjs render (3 rows) + append-only invariant; false green requires all three to pass despite semantic drift."
    - "FORBIDDEN enum alignment: Plan 08's 7-path list mirrors the <command_surface_assertion> 7-path list baked into brief/workflows/gap-detect.md + brief/workflows/align-gate.md Step 8 surface-cap citation."
    - "A1 preservation sentinel: JSON.parse(package.json).dependencies count === 0 (single-line guard against any runtime-dep addition across Phase 6 or any future phase that touches these test files)."

key-files:
  created:
    - tests/brief-gap-detect-canary-e2e.test.cjs
    - tests/brief-gap-detect-no-hook.test.cjs
    - tests/brief-gap-detect-no-new-command.test.cjs
    - tests/brief-gap-detect-vocabulary-lock.test.cjs
    - tests/brief-gap-detect-text-mode.test.cjs
  modified: []  # Pure test addition — no source code or workflow markdown touched

key-decisions:
  - "Rule 1 refinement on vocabulary-lock filter: the plan's banHitsOutsideBanList line-level filter (matching 'ban-list|BAN_|ban list|금지') would produce false positives when ban-list tokens appear in the agent's <vocabulary_discipline> block (line 82 `English: compliant, passed, violation, failed`) because those lines don't contain the filter keywords. Replaced with Phase 4 brief-align-vocabulary-lock.test.cjs precedent: (1) strip <vocabulary_discipline> XML block from agent before assertion, (2) strip lines containing BAN_EN/BAN_KO/BAN_SYMBOL from lib before assertion, (3) assert clean everywhere in workflow + report-renderer. Plan intent (no ban-list tokens leaking into findings prose) is preserved; false-positive trap resolved."
  - "Canary E2E seedAlignResult helper uses the lib's own frontmatter round-trip (Plan 03 SUMMARY decision #2 lesson): regex-replace on YAML is fragile because the lib's writer expands `brief: {}` into multi-line YAML; using extractFrontmatter + reconstructFrontmatter produces byte-equal YAML and avoids the silent-test-drift trap."
  - "5 test files shipped in 2 atomic commits (Task 1 + Task 2) per plan's per-task commit discipline. Task 1 = canary E2E; Task 2 = 4 structural audits bundled together (no-hook / no-new-command / vocabulary-lock / TEXT_MODE). Matches Phase 5 Plan 08 commit granularity."
  - "TEXT_MODE test uses positional search (String.prototype.search + slice) not regex on whole file — the plan's regex patterns are scoped to the section after the meta-arbiter / hard-cap heading. Preserves the plan's intent of locking the TEXT_MODE fallback TO EACH SECTION rather than anywhere in the file."

patterns-established:
  - "Phase closure pattern confirmed (2nd instance after Phase 5 Plan 08): final-wave plan = integration test (canary E2E) + 2 structural audits (Anti-pattern #2 + Surface Cap) + vocabulary-lock + TEXT_MODE parity. Phase 7/8 closure plans copy this shape verbatim."
  - "Canary E2E fixture reuse: Plan 01's fingerprints (market-sizing-korea-fintech-tam) double as canary stub-injected verdict output, avoiding fixture drift between plan-internal and integration testing."
  - "Block-strip vocabulary-lock filter generalizes: any future test that audits a file containing documented ban-list tokens (vocabulary references, agent prompts with <vocabulary_discipline>) can reuse the Phase 4 block-strip pattern instead of the plan's coarse line-level filter."
  - "Structural-audit-as-test discipline maintained: grep-in-test patterns (execSync grep + JS includes() + Array.filter) treat filesystem state as durable invariants; any regression fires on next suite run."

requirements-completed: [DSG-11, DSG-14]

# Metrics
duration: 7m22s
completed: 2026-04-24
---

# Phase 06 Plan 08: Canary E2E + Anti-pattern #2 + Surface Cap + Vocabulary-Lock + TEXT_MODE Summary

**Final-wave Phase 6 closure plan. Ships 5 test files (24 tests total, 963 lines) that exercise the full ALIGN → gap-detect → push → resume → pop cycle end-to-end + lock five structural guarantees: (1) canary state transitions [] → [frame] → []; history [] → [entry] → [entry] (append-only D-06); (2) /brief-status renders Return stack + Gap loop + Round-trips rows simultaneously after a push (DSG-11 + DSG-14 contract); (3) gap-detect is an orchestrator step, never a hook (Anti-pattern #2); (4) Phase 6 adds zero user-facing commands + A1 zero-runtime-deps preserved; (5) Phase 6 authored artifacts are ban-list-clean outside legitimate documentation homes + meta-arbiter + hard-cap + resume prompts carry TEXT_MODE numbered-list fallbacks. Phase 6 COMPLETE — both phase requirements verified end-to-end.**

## Performance

- **Duration:** ~7m22s (442s total)
- **Started:** 2026-04-24T05:47:17Z
- **Completed:** 2026-04-24T05:54:39Z
- **Tasks:** 2 / 2
- **Files created:** 5 test files (963 LOC)
- **Files modified:** 0 (pure test addition)

## Accomplishments

- **Task 1 shipped** `tests/brief-gap-detect-canary-e2e.test.cjs` — 6 in-process tests exercising the full bidirectional cycle: push → /brief-status render (Return stack + Gap loop + Round-trips rows simultaneously) → countIterations read → artifact rewrite → ALIGN ALIGNED seed → maybePopTopFrame. State transitions verified end-to-end: `return_stack: [] → [frame] → []`; `return_stack_history: [] → [entry] → [entry]` (append-only D-06 invariant). File manifest check confirms 5 Phase 6 key artifacts on disk.
- **Task 2 shipped** 4 structural audit test files (18 tests) locking durable invariants:
  - **no-hook (5 tests):** hooks/ grep returns 0; config.json clean; cross-repo gap-detect routing audit; brief/workflows/gap-detect.md + brief/workflows/align-gate.md Step 8 carry `<no_hooks_assertion>` or equivalent.
  - **no-new-command (5 tests):** 7-path FORBIDDEN enum absent from commands/brief/; `/brief-discover` preserved; intersection check; hooks/ inventory unchanged; A1 preservation sentinel (`package.json.dependencies.length === 0`).
  - **vocabulary-lock (4 tests):** Phase 6 authored files clean of ban-list tokens (Phase 4 block-strip filter — agent's `<vocabulary_discipline>` block + lib's `BAN_*` constant lines stripped before audit); vocab reference documents ≥3 decisions + ≥3 severities + ≥7 ban-list tokens; all 3 D-09 canonical topic_fingerprint examples present in agent.
  - **TEXT_MODE (4 tests):** gap-detect.md Step 5.1 (meta-arbiter) + Step 5.2 (hard-cap) + discover.md Step 0.5 (resume) all carry numbered-list fallbacks; Korean variants (`계속 연구`, `가정`) present alongside English options (FND-06 multi-runtime parity).
- **Rule 1 deviation auto-fixed** (vocabulary-lock filter): the plan's coarse line-level filter (matching `ban-list|BAN_|ban list|금지`) would produce false positives. Replaced with the Phase 4 brief-align-vocabulary-lock.test.cjs block-strip precedent. Plan intent preserved; false-positive trap resolved.
- **A1 preserved** — `Object.keys(require('./package.json').dependencies || {}).length === 0`.
- **Surface Cap preserved** — zero new `commands/brief/*.md` user-facing files.
- **Hook-purity preserved** — `grep -rE 'gap-detect|brief-gap-detector|gap_detect' hooks/` returns 0 lines.

## Task Commits

Each task committed atomically:

1. **Task 1: Canary E2E for gap-detect bidirectional cycle** — `21e4527` (test)
2. **Task 2: 4 structural audits bundled (no-hook + no-new-command + vocabulary-lock + TEXT_MODE)** — `3095b68` (test)

_Plan metadata commit pending — orchestrator owns STATE.md / ROADMAP.md writes._

## Files Created/Modified

### Created (5 test files, 963 LOC)

| Path | Lines | Tests | Purpose |
|------|-------|-------|---------|
| `tests/brief-gap-detect-canary-e2e.test.cjs` | 361 | 6 | In-process full-cycle canary: push → status render → countIterations → artifact rewrite → ALIGN seed → maybePopTopFrame. State transitions verified. |
| `tests/brief-gap-detect-no-hook.test.cjs` | 173 | 5 | Anti-pattern #2 grep-audit: hooks/ refs, config.json, cross-repo routing, gap-detect.md + align-gate.md Step 8 no-hook citations. |
| `tests/brief-gap-detect-no-new-command.test.cjs` | 120 | 5 | 7-path FORBIDDEN enum + A1 sentinel + /brief-discover preservation + hooks/ inventory audit. |
| `tests/brief-gap-detect-vocabulary-lock.test.cjs` | 198 | 4 | Phase 6 authored files ban-list-clean (block-strip filter); vocab file completeness; topic_fingerprint contract + 3 canonical examples. |
| `tests/brief-gap-detect-text-mode.test.cjs` | 111 | 4 | FND-06 parity: meta-arbiter + hard-cap + resume TEXT_MODE fallbacks + Korean variants. |
| **Total** | **963** | **24** | — |

### Modified

None — pure test addition.

## Verification

**All plan `<verification>` checks pass:**

| Check | Expected | Actual |
|-------|----------|--------|
| `node --test` on all 5 test files exits 0 | exit 0, fail 0 | 24/24 pass, 0 fail, ~279ms |
| Total test count across 5 files | ≥22 | 24 (6 canary + 5 no-hook + 5 no-new-command + 4 vocab + 4 text-mode) |
| `ls commands/brief/*.md \| grep -cE 'gap-detect\|gap\.\|return-stack\|resume\.\|gap-queue\|frame-pop\|meta-arbiter'` | 0 | 0 |
| `grep -rE 'gap-detect\|brief-gap-detector\|gap_detect' hooks/ \| wc -l` | 0 | 0 |
| `node -e "console.log(Object.keys(require('./package.json').dependencies\|\|{}).length)"` (A1) | 0 | 0 |
| Full Phase 6 regression (all brief-gap-detect + brief-return-stack + brief-discover-resume tests) | exit 0 | 145/145 pass, 0 fail, 313ms |
| Phase 4+5 regression (align + audience tests) | exit 0 | 81/81 pass, 0 fail, 407ms |

### Test breakdown per file

| Test file | Tests | Assertions | Runtime |
|-----------|-------|-----------:|---------|
| `brief-gap-detect-canary-e2e.test.cjs` | 6 | 20 | ~76 ms |
| `brief-gap-detect-no-hook.test.cjs` | 5 | 8 | ~147 ms |
| `brief-gap-detect-no-new-command.test.cjs` | 5 | 12 | ~3 ms |
| `brief-gap-detect-vocabulary-lock.test.cjs` | 4 | 29 | ~3 ms |
| `brief-gap-detect-text-mode.test.cjs` | 4 | 7 | ~1 ms |
| **Total** | **24** | **~76** | **~230 ms** |

### Full Phase 6 regression summary

| Test family | Tests | Pass | Fail |
|-------------|-------|------|------|
| brief-gap-detect-*.test.cjs (14 files) | 126 | 126 | 0 |
| brief-return-stack-*.test.cjs (2 files) | 12 | 12 | 0 |
| brief-discover-resume-*.test.cjs (1 file) | 8 | 8 | 0 (subset of brief-discover-* suite) |
| **Total Phase 6** | **145** | **145** | **0** |

Full Phase 6 regression runtime: 313ms — well under the <180s sampling-rate budget.

### Grep-audit acceptance snapshot

| Check | Result |
|-------|--------|
| `grep -rE 'gap-detect\|brief-gap-detector\|gap_detect' hooks/` | 0 matches — Anti-pattern #2 preserved |
| `ls commands/brief/{gap-detect,gap,return-stack,resume,gap-queue,frame-pop,meta-arbiter}.md 2>/dev/null` | 0 files — Surface Cap preserved (`resume-work.md` is Phase-1 inherited, not Phase-6-added) |
| `package.json dependencies count` | 0 — A1 preserved |
| Ban-list hits in Phase 6 authored files (outside legitimate doc homes) | 0 — vocabulary discipline preserved |
| Phase 6 new commands/brief/*.md files | 0 |
| Phase 6 new hooks/ files | 0 |

### State-transition canary snapshot (Step 5 of canary-e2e)

From the canary test output (Step 2 renderStatus invocation, printed to stdout):

```
BRIEF Status
================================
  Phase           — of —
  Workstream      — (none active)
  Return stack    1 / 3
  Last ALIGN      — (none yet)
  Last AUDIENCE   — (none yet)
  Last COMPLIANCE — (none yet)
  Gap loop        Korea fintech TAM
  Round-trips     go-to-market: 1
--------------------------------
  Next: (unknown)
```

The "Return stack 1 / 3" + "Gap loop Korea fintech TAM" + "Round-trips go-to-market: 1" trio appearing simultaneously after a single `pushReturnFrame` call is the literal DSG-11 + DSG-14 contract, verified end-to-end in one test.

## Decisions Made

- **Block-strip vocabulary-lock filter (Phase 4 precedent) instead of plan's coarse line-level filter.** The plan's `banHitsOutsideBanList` excludes lines containing `ban-list|BAN_|ban list|금지`. But the agent's `<vocabulary_discipline>` block (line 82 "English: `compliant`, `passed`, `violation`, `failed`") contains NONE of those keywords — the filter would miss the legitimate documentation home and falsely flag the tokens. Replaced with Phase 4 precedent: (1) strip `<vocabulary_discipline>` XML block from agent before assertion; (2) strip lines containing `BAN_EN`/`BAN_KO`/`BAN_SYMBOL` from lib before assertion; (3) assert clean everywhere in workflow + report-renderer. Plan intent preserved; false-positive trap resolved. Rule 1 deviation.
- **5 test files shipped as 2 atomic commits** per plan's per-task commit discipline. Task 1 (canary E2E) committed separately from Task 2 (4 structural audits bundled). Matches Phase 5 Plan 08 commit granularity.
- **seedAlignResult test helper uses lib's frontmatter round-trip, not regex-replace.** Plan 03 SUMMARY decision #2 documented the regex-replace pitfall (`seedAlignResult` from tests/brief-gap-detect-state-roundtrip.test.cjs). The canary's test helper follows the same discipline: read existing frontmatter via `extractFrontmatter`, mutate `fm.brief.last_gate_results.align`, write back via `reconstructFrontmatter`. Byte-equal YAML to what `maybePopTopFrame` reads; zero silent-test-drift risk.
- **TEXT_MODE test uses positional search (String.prototype.search + slice) not regex on whole file.** The plan's regex is scoped to the section after the section-starting heading. Preserves the plan's intent of locking the TEXT_MODE fallback TO EACH SECTION rather than anywhere in the file. A future edit that accidentally moves the TEXT_MODE block to a different section would still fire the test.
- **24-test count vs plan's ≥22 target.** Plan's 6 canary + 5 no-hook + 5 no-new-command + 4 vocab + 4 text-mode = 24 tests, exactly matching the plan's math. Assertions vary per test (some tests have multiple asserts; canary has 3-5 asserts per step). The total assertion count (~76) is a more precise runtime fingerprint but not directly asserted by the plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan's vocabulary-lock filter would false-positive on agent's `<vocabulary_discipline>` block**
- **Found during:** Pre-Task-2 file scan (`grep -nE '\\b(compliant|passed|violation|failed)\\b' agents/brief-gap-detector.md` returned line 82 hit)
- **Issue:** The plan's `banHitsOutsideBanList` helper filters lines containing `ban[- ]?list|BAN_|금지`. But line 82 of `agents/brief-gap-detector.md` reads:
  `English: \`compliant\`, \`passed\`, \`violation\`, \`failed\``
  — this line is INSIDE the `<vocabulary_discipline>` XML block (the legitimate documentation home of the ban-list tokens), but it does NOT contain any of the filter keywords. The plan's filter would therefore incorrectly flag all 4 EN ban tokens, all 4 KO ban tokens, and 3 symbols on lines 82/86/87 as "vocabulary theater" when they are in fact the prompt's authoritative documentation of what to avoid.
- **Fix:** Replaced the plan's coarse line-level filter with the Phase 4 brief-align-vocabulary-lock.test.cjs block-strip pattern:
  - Agent file: regex-match `<vocabulary_discipline>[\s\S]*?</vocabulary_discipline>`, strip the entire block, assert clean on the remainder.
  - Lib file: line-filter `!/BAN_(EN|KO|SYMBOL)/.test(l)` (stricter than the plan's regex-free match on `BAN_`), assert clean on the remainder.
  - Vocabulary reference: no filter — the vocab file has dedicated `## Ban-list*` H2 sections where tokens ARE allowed; the plan's Test 2 already checks token presence (not absence) there, so no stripping needed for the Test 2 semantics.
  - Workflow + report-renderer: no filter — pure orchestration prose / pure renderer; assert clean everywhere.
- **Files modified:** `tests/brief-gap-detect-vocabulary-lock.test.cjs` (this plan's new file; no existing files touched)
- **Commit:** `3095b68` (Task 2 commit — the bundled 4-audit commit already carries the refined filter; not a separate fix commit because Task 2's file was authored with the refined filter from the start)

No other deviations. The plan's other 4 test files executed exactly as the plan's EXACT CONTENT prescribed, with minor refinements documented in §Decisions Made that do not alter any assertion shape:
- Canary E2E: added `seedAlignResult` helper using the lib's own frontmatter round-trip (Plan 03 SUMMARY decision #2 pattern) instead of inline regex-replace.
- TEXT_MODE: used `String.prototype.search + slice` (matches the plan's code verbatim) rather than whole-file regex to preserve per-section scoping intent.

## Issues Encountered

- **Worktree base-commit drift on startup.** Actual HEAD was `fb7385f`; expected base `0a64141` (Phase 6 Wave 4 complete). Resolved via `git reset --soft 0a64141ca5d3ec69874b4ac717729b8e58dd0a32` — this is the worktree-infrastructure concern recurring across every Phase 6 executor agent's Issues Encountered sections (Plans 03, 04, 05, 06, 07 all had equivalent reports). Worktree agents start from a fresh branch tip; soft-reset brings HEAD to the expected base without affecting the working tree. No Plan 06-08 content was affected.
- **No test failures on first run.** All 5 files executed green on the first GREEN invocation:
  - Task 1 canary-e2e: 6/6 pass, 76ms (no RED phase needed — the test file asserts primitives already shipped by Plans 03+04).
  - Task 2 structural audits: 18/18 pass, 212ms on first run (no RED phase needed — the audits assert invariants already satisfied by Plans 02+03+04+05+06+07).
- **No other issues.** The plan's EXACT CONTENT structure was clear; the canary's seedAlignResult helper was the only meaningful construction decision (reused Plan 03 precedent verbatim).

## User Setup Required

None — all 5 test files are repo-internal test code. No external services, no env vars, no credentials. No new runtime dependencies.

## Next Phase Readiness

**Phase 7 COMPLIANCE unblocked:**

All 5 test files are canonical Phase 7 templates:
1. `tests/brief-gap-detect-canary-e2e.test.cjs` → `tests/brief-design-canary-e2e.test.cjs` — copy structure, swap fixture injection point + gap-detect → COMPLIANCE + artifact path.
2. `tests/brief-gap-detect-no-hook.test.cjs` → `tests/brief-compliance-no-hook.test.cjs` — mechanical rename of grep needles + assertion descriptions; align-gate.md Step 9 check instead of Step 8.
3. `tests/brief-gap-detect-no-new-command.test.cjs` → `tests/brief-compliance-no-new-command.test.cjs` — extend FORBIDDEN list with Phase 7 names (compliance.md / compliance-check.md / etc.); hook inventory adjusts to whatever Phase 7 ships.
4. `tests/brief-gap-detect-vocabulary-lock.test.cjs` → `tests/brief-compliance-vocabulary-lock.test.cjs` — swap gap-detect-vocabulary → compliance-vocabulary + agent ref + block-strip filter pattern reuses verbatim.
5. `tests/brief-gap-detect-text-mode.test.cjs` → `tests/brief-compliance-text-mode.test.cjs` — swap workflow file refs; FND-06 discipline reused.

**Phase 9 HRD-01 cross-runtime smoke** has the canary as a pre-flight check: the E2E transitions verified here in-process will run under Claude Code / Codex / Gemini / OpenCode live runtimes with identical assertion shape; any per-runtime drift will surface immediately against this canary baseline.

**Phase 9 HRD-02 surface-cap audit** has the 7-path FORBIDDEN enum + hooks/ inventory test as the Phase 6 contribution to the overall audit. The total user-facing command count at Phase 6 exit is unchanged from Phase 5 — reduction remains scheduled for HRD-02.

**A1 preservation**: `Object.keys(require('./package.json').dependencies||{}).length === 0` verified post-commit.

**Surface Cap preservation**: zero new `commands/brief/*.md` user-facing files. Net Phase 6 additions = 0.

**Hook-purity preservation**: zero hook files reference gap-detect / brief-gap-detector / gap_detect.

## Known Stubs

None. All 5 test files are fully implemented and run on first invocation. No placeholder assertions; no TODO/FIXME markers; no skipped tests.

The canary's Step 4 + Step 5 depend on the Plan 03's `maybePopTopFrame` lib primitive (fully implemented with D-11 dual-condition gating). The no-hook test's Test 5 depends on Plan 06-06's align-gate.md Step 8 (fully wired). The TEXT_MODE test's Test 3 depends on Plan 06-07's discover.md Step 0.5 (fully shipped with TEXT_MODE fallback + Korean variants). Every downstream surface is in place; no stubs.

## Threat Flags

No new surface beyond the plan's `<threat_model>` register. The 6 STRIDE threats (T-06-08-01 through T-06-08-06) are all mitigated:

| Threat | Disposition | Mitigation present? | Verified by |
|--------|-------------|---------------------|-------------|
| T-06-08-01 (Future PR adds `commands/brief/gap-detect.md`) | mitigate | Yes — Test 1 + Test 3 enumerate + intersect against FORBIDDEN | `brief-gap-detect-no-new-command.test.cjs` Test 1 + Test 3 |
| T-06-08-02 (Future PR attaches gap-detect as PostToolUse hook) | mitigate | Yes — 3-layer defense (grep hooks/ + config scan + cross-repo routing audit + 2 assertion blocks) | `brief-gap-detect-no-hook.test.cjs` Tests 1-5 |
| T-06-08-03 (Future PR adds runtime dep to package.json) | mitigate | Yes — A1 sentinel | `brief-gap-detect-no-new-command.test.cjs` Test 5 |
| T-06-08-04 (Future PR removes D-07 hard-cap no-bypass wording) | mitigate | Yes — TEXT_MODE test asserts `(1)` numbered-options form + Phase 6 Plan 06 iteration-3-hard-cap test asserts zero "Force continue" / "bypass" tokens | `brief-gap-detect-text-mode.test.cjs` Test 2 + `brief-gap-detect-iteration-3-hard-cap.test.cjs` (Plan 06) |
| T-06-08-05 (Canary false green from fixture determinism) | mitigate | Yes — canary verifies 3 orthogonal invariants (state transitions + status.cjs render + history append-only); false green requires ALL THREE to pass despite semantic drift | `brief-gap-detect-canary-e2e.test.cjs` Steps 1-5 |
| T-06-08-06 (E2E runtime exceeds 500ms budget per test) | accept | n/a — in-process only; 6-test canary runtime 76ms total; 4 structural audits 154ms total | Runtime measured in §Verification |

No new threat surface, no new trust boundaries, no new external input channels.

## Phase 6 COMPLETE

All Phase 6 requirements are now covered end-to-end:

| Requirement | Plan(s) | Covering tests |
|-------------|---------|----------------|
| DSG-11 (User can trigger a return to Phase 1 from inside any Phase 2 workstream when a research gap is detected; hard 3-round-trip cap; meta-arbiter at iteration 2) | 06-02, 06-03, 06-04, 06-06, 06-07, 06-08 | `brief-gap-detect-iteration-2-meta-arbiter.test.cjs` + `brief-gap-detect-iteration-3-hard-cap.test.cjs` + `brief-gap-detect-canary-e2e.test.cjs` + `brief-discover-resume-on-invocation.test.cjs` |
| DSG-14 (User can see the bidirectional return-stack state in /brief-status: current depth, max depth = 3, what triggered the return, what's pending on resume) | 06-05, 06-08 | `brief-return-stack-status-render.test.cjs` + `brief-return-stack-derived-count.test.cjs` + `brief-gap-detect-canary-e2e.test.cjs` Step 2 |

Structural guarantees enforced by Plan 08's 5 files:
- **Canary E2E** proves the 7 subsystems (gap-detect.cjs lib primitives + gap-detect-report.cjs renderer + brief-gap-detector agent + gap-detect.md workflow + align-gate.md Step 4.5/8 integration + discover.md Step 0.5 resume + status.cjs Gap loop/Round-trips rendering) compose correctly in a single push→status→pop cycle.
- **Anti-pattern #2 grep-audit** guarantees gap-detect never silently migrates from orchestrator step to hook.
- **Surface Cap FORBIDDEN enum + A1 sentinel** guarantee zero scope creep at the filesystem and dependency layers.
- **Vocabulary-lock (block-strip filter)** prevents Pitfall #4 compliance-checkbox theater from creeping into Phase 6 authored artifacts.
- **TEXT_MODE parity** preserves FND-06 multi-runtime promise — the D-07 hard-cap + D-08 meta-arbiter + D-10 resume prompts work across Claude Code / Codex / Gemini / OpenCode.

Ready for Phase 7 (COMPLIANCE checker) — the gate pattern established by Phase 4 ALIGN and replicated twice (Phase 5 AUDIENCE + Phase 6 GAP-DETECT) is now mechanically confirmed across three instances; Phase 7 is the fourth replication, with these 5 test files as the ready-to-copy-rename template.

## Self-Check: PASSED

**Files verified on disk:**
- FOUND: `tests/brief-gap-detect-canary-e2e.test.cjs` (361 lines)
- FOUND: `tests/brief-gap-detect-no-hook.test.cjs` (173 lines)
- FOUND: `tests/brief-gap-detect-no-new-command.test.cjs` (120 lines)
- FOUND: `tests/brief-gap-detect-vocabulary-lock.test.cjs` (198 lines)
- FOUND: `tests/brief-gap-detect-text-mode.test.cjs` (111 lines)

**Commits verified (via `git log --oneline`):**
- FOUND: `21e4527` (Task 1 — canary E2E)
- FOUND: `3095b68` (Task 2 — 4 structural audits bundled)

**Verified via test runner:**
- `node --test tests/brief-gap-detect-canary-e2e.test.cjs` exits 0 (6 pass, 0 fail, ~76ms)
- `node --test tests/brief-gap-detect-no-hook.test.cjs tests/brief-gap-detect-no-new-command.test.cjs tests/brief-gap-detect-vocabulary-lock.test.cjs tests/brief-gap-detect-text-mode.test.cjs` exits 0 (18 pass, 0 fail, ~212ms)
- Full Plan 08 (5 files combined): 24 pass, 0 fail, ~279ms
- Full Phase 6 regression (gap-detect + return-stack + discover-resume): 145 pass, 0 fail, 313ms
- Phase 4+5 regression (align + audience): 81 pass, 0 fail, 407ms
- A1 preserved: `package.json dependencies` count = 0
- Surface cap preserved: 0 new `commands/brief/*.md` files matching 7-path FORBIDDEN enum
- Hook purity: `grep -rE 'gap-detect|brief-gap-detector|gap_detect' hooks/` returns 0 matches

---

*Phase: 06-bidirectional-foundation-phase-1-2-return-stack*
*Plan: 08 (final wave)*
*Completed: 2026-04-24*
