---
phase: "04"
plan: "06"
subsystem: align-gate-discipline-lock
tags:
  - align
  - vocabulary-discipline
  - text-mode-parity
  - no-hook
  - pattern-4
  - pitfall-4
  - surface-caps
  - phase-5-7-template
requirements:
  - DSG-12
dependency_graph:
  requires:
    - 04-01 (align.cjs BAN_EN/KO/SYMBOL regexes + runAlign + commitAlignVerdict + align-vocabulary.md reference)
    - 04-02 (brief/workflows/align-gate.md workflow + agents/brief-align-gate.md subagent)
    - 04-03 (runAlign + mergeVerdicts + 4 decision-path fixtures — provides ALIGN-00.md emission for Tests 1-3)
    - 04-04 (commitAlignVerdict write path + override rendering)
    - 04-05 (brief/workflows/define.md Step 3.5 canary wiring — provides no-hook Test 3 target)
  provides:
    - "Test-time vocabulary discipline lock (Pitfall #4 mitigation at CI time)"
    - "Static markdown assertion of FND-06 TEXT_MODE parity (no runtime spawn)"
    - "Structural no-hook assertion (ROADMAP Phase 4 SC #3)"
    - "VALIDATION.md Wave 0 coverage snapshot (Phase 4 gap closure evidence)"
  affects:
    - "Phase 5 AUDIENCE replicates these 3 test patterns (copy + parameterize on {gateName})"
    - "Phase 7 COMPLIANCE replicates identically"
    - "Phase 9 HRD-02 surface-cap audit inherits Test 2's zero-command-file assertion as a precedent"
tech_stack:
  added: []
  patterns:
    - "Post-hoc grep discipline — verify evaluator output AND source-of-truth files at CI time (Pitfall #4)"
    - "Widened regex + precondition pattern — /^## Step NN[:\\- ]/ tolerates separator drift; precondition `content.includes(...)` produces clear diagnostics"
    - "Section-aware ban-list scoping — tokens allowed inside <vocabulary_discipline> / `## Ban-list*` sections only; remainder strict"
    - "Template-friendly test design — assertions parameterize cleanly on {gateName} for Phase 5/7 replication"
key_files:
  created:
    - tests/brief-align-vocabulary-lock.test.cjs
    - tests/brief-align-text-mode.test.cjs
    - tests/brief-align-no-hook.test.cjs
    - .planning/phases/04-first-gate-align-pattern-established/04-06-COVERAGE.md
  modified:
    - agents/brief-align-gate.md
    - brief/workflows/align-gate.md
decisions:
  - "Strictest scope for workflow markdown (Test 6): NO ban-list tokens anywhere — matches Plan 04-06 Task 1 spec verbatim. Removed the prior carve-out note that exempted the Step 6 resume-hint `✓`."
  - "Source cleanse vs. test relaxation: fixed 5 prior-wave Pitfall #4 creep sites in agent prompt + workflow markdown rather than widening the test to allow false positives. The 5 sites are ordinary English/Korean prose (passed/failed/violation/실패/✓) substituted with non-ambiguous synonyms (provided/broken/breach/실행 중단/(removed)) — zero semantic loss."
  - "Widened Step-heading regex char class `/^## Step NN[:\\- ]/` — tolerates colon, hyphen, em-dash, and space separators. Precondition `content.includes('## Step NN')` runs BEFORE extraction so malformed files produce clear diagnostics."
  - "No-hook test split across 4 structural assertions: hooks/ recursive grep + Surface Caps no-command + orchestrator visibility (align-gate.md referenced from define.md Step 3.5) + agent frontmatter live-hooks absence. Defense in depth — any single assertion could be bypassed by a clever refactor; all four must hold simultaneously."
  - "COVERAGE.md noted that 2 of 44 remaining npm-test failures (brief-align-gate anti-heredoc + commented hooks) are Plan-04-02-inherited convention gaps, NOT Phase 4 regressions. Flagged for Phase 9 HRD-05 retrofit."
metrics:
  duration: "~1h"
  tasks_completed: 3
  tasks_total: 3
  files_changed: 6
  tests_added: 14
  commits:
    - hash: "2dd7aa8"
      message: "test(04-06): add vocabulary-lock post-hoc grep test (Pitfall #4) + cleanse source"
    - hash: "e5ea087"
      message: "test(04-06): add TEXT_MODE parity + no-hook structural tests"
    - hash: "2d1dbcf"
      message: "docs(04-06): Phase 4 test-coverage snapshot (Wave 5 closure)"
  completed_date: 2026-04-21
---

# Phase 4 Plan 06: ALIGN Gate Discipline Lock + Test Coverage Snapshot Summary

**One-liner:** Closes Phase 4 with three CI-time discipline tests (vocabulary-lock post-hoc grep + FND-06 TEXT_MODE parity + structural no-hook assertion) that lock the canonical ALIGN pattern for Phase 5 (AUDIENCE) and Phase 7 (COMPLIANCE) copy-rename replication; COVERAGE.md maps every VALIDATION.md Wave 0 item to its addressing test.

## Task Completion

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Create `tests/brief-align-vocabulary-lock.test.cjs` + cleanse source | completed | `2dd7aa8` |
| 2 | Create `tests/brief-align-text-mode.test.cjs` + `tests/brief-align-no-hook.test.cjs` | completed | `e5ea087` |
| 3 | Run full Phase 4 + npm test; create `04-06-COVERAGE.md` | completed | `2d1dbcf` |

All 3 tasks executed atomically. Each commit is self-contained, builds green, and tests pass in isolation.

## Files Created + Modified

### Created (4)

| File | Lines | Purpose |
|------|-------|---------|
| `tests/brief-align-vocabulary-lock.test.cjs` | 370 | 6 tests: 3 emitted ALIGN-00.md (Korean ALIGNED / English ALIGNED / override) + 3 static-source-file section-aware grep (align-vocabulary.md / agents/brief-align-gate.md / brief/workflows/align-gate.md) |
| `tests/brief-align-text-mode.test.cjs` | 160 | 4 tests: Step 5A D-06 Korean + TEXT_MODE fallback / Step 5B / Step 6 MANDATORY override / no_hooks_assertion block presence |
| `tests/brief-align-no-hook.test.cjs` | 130 | 4 tests: hooks/ recursive grep + Surface Caps no-command + orchestrator visibility + agent frontmatter live-hooks absence |
| `.planning/phases/04-first-gate-align-pattern-established/04-06-COVERAGE.md` | 140 | Wave 0 gap-closure table + DSG-12 SC mapping + npm-test baseline delta |

### Modified (2)

| File | Change | Reason |
|------|--------|--------|
| `agents/brief-align-gate.md` | 3 text substitutions (L40: "violation"→"breach"; L177: "passed in"→"provided in"; also impacted during vocabulary test iteration) | Prior-wave Pitfall #4 creep: English prose used verdict-vocabulary verbs outside the `<vocabulary_discipline>` block |
| `brief/workflows/align-gate.md` | 3 text substitutions (L39: "실행 실패"→"실행 중단"; L289: "✓" removed from resume hint; L325: "a failed Phase 4"→"a broken Phase 4") + rewrote the Step 6 resume-hint note block to reinforce ban-list-everywhere discipline | Prior-wave Pitfall #4 creep: Korean error message, success-hint symbol, and narrative English used verdict vocabulary |

## Test Results

### Full Phase 4 ALIGN test suite

```
node --test tests/brief-align-primitives.test.cjs \
            tests/brief-align.test.cjs \
            tests/brief-align-canary.test.cjs \
            tests/state-brief-override-roundtrip.test.cjs \
            tests/brief-align-vocabulary-lock.test.cjs \
            tests/brief-align-text-mode.test.cjs \
            tests/brief-align-no-hook.test.cjs

ℹ tests 73
ℹ pass 73
ℹ fail 0
ℹ duration_ms 488
```

7 test files, 73 tests, all green in ~0.5s. Under VALIDATION.md's ~30s quick-run target by a factor of ~60.

### Full `npm test` baseline

```
ℹ tests 3804
ℹ pass 3760
ℹ fail 44
ℹ duration_ms 31847
```

**Delta vs. Phase 1 HALT-ACCEPTED baseline (63 failures): -19 (improvement).** Phase 4 Plan 04-06 introduces **zero** regressions; prior Phase 4 waves quietly closed 19 of the deferred Phase 1 failures.

### Pitfall #4 vocabulary-lock status

Any ban-list hits in emitted ALIGN-00.md? **None.** All 3 post-hoc grep runs (Korean ALIGNED, English ALIGNED, override) pass. All 3 static-source-file scans pass. The discipline is load-bearing:

- Test 1 (Korean ALIGNED emit): clean
- Test 2 (English ALIGNED emit): clean
- Test 3 (override emit): clean
- Test 4 (align-vocabulary.md section containment): clean
- Test 5 (agents/brief-align-gate.md vocabulary_discipline scope): clean
- Test 6 (brief/workflows/align-gate.md zero tokens anywhere): clean after source cleanse

### Hook-surface check

Confirmed **zero references** to `align-gate` / `brief-align-gate` / `align.cjs` in `hooks/` directory (recursive walk including `hooks/dist/` if present). ROADMAP Phase 4 Success Criterion #3 held.

Structural defense-in-depth:

1. `tests/brief-align-no-hook.test.cjs` Test 1: recursive grep
2. `tests/brief-align-text-mode.test.cjs` Test 4: `<no_hooks_assertion>` block presence
3. `tests/brief-align-no-hook.test.cjs` Test 4: agent frontmatter no live `hooks:` key

### Surface Caps check

- `commands/brief/align.md` — does not exist ✓
- `commands/brief/align-gate.md` — does not exist ✓
- `commands/brief/realign.md` — does not exist ✓

Phase 4 net user-facing command additions: **0**. CLAUDE.md Surface Caps ≤12 commands invariant preserved.

## DSG-12 Traceability Matrix

| ROADMAP Success Criterion | Locking Test(s) |
|---------------------------|-----------------|
| SC #1 — three outputs (ALIGNED / DRIFTED-objective / DRIFTED-output) | `brief-align.test.cjs` aligned-fixture + drifted-objective-missing-required + MUST-PASS canary + drifted-output-zero-overlap; `brief-align-canary.test.cjs` Tests 1, 3, 4 |
| SC #2 — findings vocabulary, no compliant/passed/✅ | `brief-align-vocabulary-lock.test.cjs` all 6 tests (emit-time + source-file scope) |
| SC #3 — gate is orchestrator-visible, no hook | `brief-align-no-hook.test.cjs` all 4 tests + `brief-align-text-mode.test.cjs` Test 4 (no_hooks_assertion block) |
| SC #4 — `state.brief.last_gate_results.align` with decision/severity/findings_count/at | `brief-align.test.cjs` state-write-shape + `state-brief-override-roundtrip.test.cjs` 23 tests + `brief-align-canary.test.cjs` Test 1 STATE.md shape |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Pitfall #4 vocabulary theater creep caught at first test run**

- **Found during:** Task 1 (first `node --test tests/brief-align-vocabulary-lock.test.cjs` run)
- **Issue:** 5 prior-wave source sites contained ban-list tokens in English/Korean prose contexts (not evaluator verdicts):
  - `agents/brief-align-gate.md:177` — "JSON array **passed** in the prompt" (past participle verb)
  - `agents/brief-align-gate.md:40` — "protocol **violation**" (noun)
  - `brief/workflows/align-gate.md:39` — "ALIGN 실행 **실패**" (execution failure noun)
  - `brief/workflows/align-gate.md:325` — "a **failed** Phase 4" (adjective)
  - `brief/workflows/align-gate.md:289` — "**✓** 승인 사유가 기록되었습니다" (success symbol in resume hint)
- **Fix:** Substituted non-ambiguous synonyms — passed→provided, violation→breach, 실패→중단, failed→broken, and removed the `✓` entirely. Zero semantic loss.
- **Why auto-fix (not ask):** The plan's Task 1 `<behavior>` spec for Test 6 explicitly says "Assert no ban-list tokens appear at all (the workflow is pure orchestration prose; should not contain evaluator vocabulary)." The test design is correct per spec; the source files had pre-existing creep from Plan 04-02 and 04-05. Per deviation Rule 1: a bug. Per Rule 2: missing critical discipline (Pitfall #4 protection is a correctness requirement, not a feature).
- **Files modified:** `agents/brief-align-gate.md`, `brief/workflows/align-gate.md`
- **Commit:** `2dd7aa8`

**2. [Rule 3 - Blocking Issue] Carve-out note in workflow Step 6 contradicted the strictness spec**

- **Found during:** Task 1, after fixing (1) the remaining `✓` in workflow
- **Issue:** `brief/workflows/align-gate.md` Step 6 contained a note block explicitly stating "the `✓` symbol here is in a USER-FACING success message, NOT in ALIGN-00.md content. The ban-list test applies to ALIGN-00.md, not to this resume hint. This is a deliberate scope boundary" — but the plan's Task 1 `<behavior>` locks Test 6 as strictest (no tokens anywhere in the workflow file).
- **Fix:** Rewrote the note block to reinforce the ban-list-everywhere discipline: "If a symbol or verdict token feels natural here, substitute a non-banned synonym — the discipline is load-bearing, not decorative."
- **Why auto-fix:** The plan's test spec is authoritative; the note block was a misalignment that would have tempted future editors to add back similar exceptions.
- **Files modified:** `brief/workflows/align-gate.md`
- **Commit:** `2dd7aa8`

### Authentication Gates

None — Phase 4 Plan 04-06 is purely CI-time file-level discipline. No external services, no auth.

### Out-of-scope discoveries

Two pre-existing `tests/agent-frontmatter.test.cjs` failures reference `agents/brief-align-gate.md` specifically:

- `brief-align-gate has anti-heredoc instruction` — Plan 04-02 agent file is missing the Phase 1-3 convention instruction text.
- `brief-align-gate has commented hooks pattern` — Plan 04-02 agent file is missing the `# hooks:` commented-out documentation line.

**Decision:** OUT OF SCOPE for Plan 04-06 (scope boundary: the task is pattern-discipline tests + COVERAGE.md, not Phase 1-3 convention retrofit). These 2 failures predate any Plan 04-06 edit — they arrived with `47bede2` (Plan 04-02). Logged in `04-06-COVERAGE.md` under "Failure provenance breakdown" for Phase 9 HRD-05 (convention retrofit scope) awareness.

## Threat Model Dispositions

All 3 threats in the plan's `<threat_model>` disposition=`accept`:

- **T-04-17** (future PR adds alias-based hook): Plan's no-hook Test 1 catches direct-string case. Alias path is Phase 9 HRD-02 audit.
- **T-04-18** (Unicode homoglyph bypass of ban-list): D-05 ban-list is an initial set; Phase 9 HRD-04 pilot surfaces real-world avoidance.
- **T-04-19** (diagnostic message exposes fixture content): Test output is CI-local; fixtures are synthetic.

No new threat flags introduced by Plan 04-06.

## Open Items for Phase 5 Planner Awareness

1. **Cross-artifact ALIGN extension (Phase 5 first downstream caller):** Plan 04-06 assertions target self-coherence (candidate == baseline == OBJECTIVES.md). Phase 5 `/brief-discover` will be the first cross-artifact caller (research outputs vs. OBJECTIVES.md). The 3 Plan 04-06 tests parameterize cleanly on `{candidatePath, baselinePath}` — adapt, don't re-author.

2. **Vocabulary ban-list iteration during Phase 5 real-LLM exposure:** Plan 04-06 ships the initial ban-list (D-05 starters + creative-avoidance additions from `align-vocabulary.md`). Real LLM creative-avoidance forms surface only during Phase 5 execution with a real subagent spawn. The planner should add a "ban-list refresh" step to Phase 5's execution plan.

3. **Phase 5 test-file replication pattern:** Copy `tests/brief-align-vocabulary-lock.test.cjs` → `tests/brief-audience-vocabulary-lock.test.cjs`; copy `tests/brief-align-no-hook.test.cjs` → `tests/brief-audience-no-hook.test.cjs`; copy `tests/brief-align-text-mode.test.cjs` → `tests/brief-audience-text-mode.test.cjs`. Parameterize the fixture seeders on audience-frontmatter shape + adapt the extractStepBody regex to the AUDIENCE workflow step numbering.

4. **Multi-orchestrator filename disambiguation:** `.planning/ALIGN-00.md` is single-caller. Phase 5 has multiple callers per project — switch to `.planning/align/{caller}-{run-id}-ALIGN.md` per Plan 04-06 COVERAGE.md noted forward consistency.

5. **Phase 9 HRD-05 convention retrofit:** 2 pre-existing brief-align-gate agent-frontmatter failures (anti-heredoc text + commented `# hooks:` pattern) should be retrofitted as part of HRD-05 alongside the rest of the 44 deferred failures.

## Metrics

- **Duration:** ~1h (plan started 2026-04-21 ~00:46 UTC → completed ~01:53 UTC)
- **Files changed:** 6 (4 created + 2 modified)
- **Tests added:** 14 (6 vocabulary-lock + 4 text-mode + 4 no-hook)
- **Lines of test code:** ~660 (370 + 160 + 130)
- **Total Phase 4 tests (all 7 files):** 73
- **Commits:** 3 (all atomic, all `--no-verify` per parallel-execution contract)

## Self-Check: PASSED

Verified before writing this SUMMARY.md:

- [x] `tests/brief-align-vocabulary-lock.test.cjs` exists and passes all 6 tests
- [x] `tests/brief-align-text-mode.test.cjs` exists and passes all 4 tests
- [x] `tests/brief-align-no-hook.test.cjs` exists and passes all 4 tests
- [x] `.planning/phases/04-first-gate-align-pattern-established/04-06-COVERAGE.md` exists
- [x] Full Phase 4 ALIGN suite: 73/73 pass in ~488ms
- [x] `npm test` baseline delta: -19 (improvement; zero new regressions)
- [x] Zero runtime dependencies (count: 0)
- [x] `hooks/` contains no `align` references
- [x] No `ajv`/`gray-matter`/`js-yaml`/`zod` in `package.json` dependencies
- [x] 3 commits recorded: `2dd7aa8`, `e5ea087`, `2d1dbcf` — all present in `git log`
