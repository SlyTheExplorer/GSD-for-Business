---
phase: "04"
plan: "05"
subsystem: align-gate-canary
tags:
  - align
  - canary
  - define-wrap-up
  - pattern-4-visibility
  - korea-first
requirements:
  - DSG-12
dependency_graph:
  requires:
    - 04-01 (align.cjs primitives)
    - 04-02 (align-gate.md workflow + subagent)
    - 04-03 (runAlign + mergeVerdicts + decision-path fixtures)
    - 04-04 (commitAlignVerdict + align dispatcher + status override)
    - 03-04 (Phase 3 DEFINE Mode A atomic commit — OBJECTIVES.md + config.json + STATE.md)
  provides:
    - Mode A wrap-up wiring of the ALIGN gate (D-08 canary)
    - E2E canary test (`tests/brief-align-canary.test.cjs`) locking D-08/D-09 exit criteria
    - Structural positional test for Step 3.5 in `brief/workflows/define.md`
  affects:
    - Phase 5 `/brief-discover` will reuse `align-gate.md` via Step-3.5-style invocation (cross-artifact)
    - Phase 7 `/brief-design` will reuse `align-gate.md` per workstream
tech_stack:
  added: []
  patterns:
    - Pattern 4 visibility — gate invocation readable in workflow markdown (NOT hooks)
    - Two-commit atomic shape — Phase 3 `/brief-define` 3-file commit, THEN second ALIGN commit
    - Stub-llmPass canary testing — no Task subagent spawn; in-process validation
key_files:
  created:
    - tests/brief-align-canary.test.cjs
  modified:
    - brief/workflows/define.md
    - commands/brief/define.md
decisions:
  - Preserve frontmatter key order and `name: brief:define` colon form verbatim (extractFrontmatter round-trip stable)
  - Insert Step 3.5 between existing Step 3 and Step 4 — do NOT renumber downstream steps
  - Canary tests invoke align.cjs in-process (no child_process) — keeps runtime <5s per VALIDATION.md
  - Step 3.5 positional regex uses `/^## Step 3[:\- ]/` (character class), NOT end-anchor `$` (the existing heading is `## Step 3: Atomic Write + Commit`, so `^## Step 3$` would never match)
metrics:
  duration: 4m
  tasks_completed: 2
  tasks_total: 2
  files_changed: 3
  tests_added: 5
  commits:
    - 2ee9695
    - 045001f
completed: "2026-04-21T01:35:01Z"
---

# Phase 04 Plan 05: Canary — Wire ALIGN into /brief-define Mode A Wrap-up Summary

Wire the ALIGN gate into `/brief-define` Mode A wrap-up via a new Step 3.5
block in `brief/workflows/define.md` that invokes `brief/workflows/align-gate.md`
in self-coherence mode (candidate=baseline=`.planning/OBJECTIVES.md`), surface
the new seam in `commands/brief/define.md` frontmatter (Pattern 4 visibility),
and land an E2E canary test suite (`tests/brief-align-canary.test.cjs`) that
pins the D-08/D-09 exit criteria — Korean ALIGN-00.md body, populated
`state.brief.last_gate_results.align`, `/brief-status` render, override-applied
path, and the Step 3.5 structural positional anchor.

## What Shipped

### Task 1 — Mode A wrap-up wiring (`2ee9695`)

Modified two files, with atomic commit:

| File | Before | After | Delta |
|------|-------:|------:|------:|
| `brief/workflows/define.md` | 380 lines | 428 lines | +48 |
| `commands/brief/define.md`  |  24 lines |  27 lines |  +3 |

**`brief/workflows/define.md`** — inserted `## Step 3.5: ALIGN gate on
OBJECTIVES.md self-coherence (Phase 4 D-08 canary)` between the existing
`## Step 3: Atomic Write + Commit` and `## Step 4: Next-Step Hint` headings.
Step 4 and all downstream content unchanged. The new Step 3.5 body documents:
- Skip condition (Mode B `--amend` active → skip; Open Question #4 deferred to Phase 5).
- Invocation parameters: `CANDIDATE_PATH = BASELINE_PATH = .planning/OBJECTIVES.md`,
  `VERDICT_OUT_PATH = .planning/.align-verdict.tmp.json` (default).
- Routing (ALIGNED → proceed; DRIFTED-objective / DRIFTED-output → 3-path interrupt
  per align-gate.md Steps 5A/5B; force-accept → Step 6 audit trail).
- Resume hints per user selection (objective 수정하기 / output 다시 쓰기 / force-accept).
- Post-step invariants (`ALIGN-00.md` exists with Korean or English body per
  D-11; `state.brief.last_gate_results.align` populated; second atomic commit
  with message starting `feat(04): ALIGN gate — <decision>`; `/brief-status`
  renders Last ALIGN line).
- Pattern 4 visibility reminder — no hook that silently runs ALIGN.

**`commands/brief/define.md`** — preserved frontmatter key order and
`name: brief:define` verbatim (colon form, NOT hyphen). Deltas applied:
- `description:` appended `. Mode A wrap-up invokes the ALIGN gate (Phase 4) for OBJECTIVES.md self-coherence.`
- `allowed-tools:` added `- Task` (align-gate.md Step 2 spawns the evaluator subagent via Task).
- `<execution_context>` added `@~/.claude/brief/workflows/align-gate.md` after the existing `define.md` reference.
- `<objective>` block appended one sentence: "After Mode A commit, the ALIGN gate runs as an orchestrator-visible step (Phase 4 canary, D-08)."
- `<process>` block replaced with wording that names the align-gate workflow
  invocation and the ALIGNED/DRIFTED routing.

`extractFrontmatter` round-trip verified: parsed `name === "brief:define"`
and `allowed-tools` count = 6 (Read, Write, Edit, Bash, AskUserQuestion, Task).

### Task 2 — E2E canary test suite (`045001f`)

Created `tests/brief-align-canary.test.cjs` (340 lines, 5 tests). All tests
invoke `align.runAlign` + `align.commitAlignVerdict` in-process (no
`child_process` spawn, no Task subagent — stub `llmPass` mirrors the shape
the real subagent emits). Full suite runtime: **76 ms**.

| # | Test | Covers |
|---|------|--------|
| 1 | canary ALIGNED path E2E — Korea fixture → Korean ALIGN-00.md + populated STATE.md | D-08 canary, D-09 exit criteria (ALIGN-00.md + state.brief.last_gate_results.align), D-11 Korea-signal language rule |
| 2 | canary status render — `Last ALIGN` + `ALIGNED` surface after commit | D-09 exit criterion: `/brief-status` renders it |
| 3 | canary non-Korea path → English ALIGN-00.md body; no Korean leakage | D-11 default branch |
| 4 | canary override path — force-accept writes override:true + override_reason + renderStatus `(override applied)` | D-07 audit trail + Pitfall #5 (boolean round-trip) |
| 5 | structural — Step 3.5 positioned strictly BETWEEN Step 3 and Step 4 at the markdown line level in `brief/workflows/define.md` | Locks Task 1 insertion position; defends against future edits that bypass the workflow markdown while canary tests still pass via direct lib calls |

Test 5 uses the regex `/^## Step 3[:\- ]/` (character class `[:\- ]`), NOT the
end-anchor form `/^## Step 3$/`, because the existing heading is `## Step 3:
Atomic Write + Commit` — an end-anchor would never match. This precision is
documented both in the plan's `<done>` block and inline in the test itself.

Stub-llm note: Test 1's ALIGNED stub returns 1 Korean finding; the deterministic
screen returns 0 additive findings (baseline has no ban-list tokens and
candidate=baseline so overlap is non-zero); `mergeVerdicts([], stub)` combines to
`findings_count = 1`. Pitfall #4 guard: assertion accepts `findings_count === 1 || === '1'` because the D-20 frontmatter serializer may round-trip the number as a string.

## Surface Caps Check

| Check | Before | After | Delta |
|-------|-------:|------:|------:|
| `ls commands/brief/*.md \| wc -l` | 64 | 64 | **0** |
| `commands/brief/align.md` exists | no | no | — |
| `commands/brief/align-gate.md` exists | no | no | — |
| `commands/brief/realign.md` exists | no | no | — |

**Net additions to user-facing command surface = 0.** CLAUDE.md Surface Caps
(≤12 user-facing commands, Phase 9 HRD-02 target) preserved.

## Hook Absence Check

`grep -rq 'align' hooks/` → no matches. No PostToolUse, no SubagentStop, no
UserPromptSubmit, no Stop hook references ALIGN. Pattern 4 visibility preserved
at the filesystem level. (Per 04-RESEARCH.md Anti-pattern #2 and ROADMAP
Phase 4 SC-3.)

## Zero-Runtime-Deps Check

`grep -E '"(ajv|gray-matter|js-yaml|zod)":' package.json` → no hits. No new
runtime dependencies added. Inherited zero-deps property (A1 VERIFIED)
preserved.

## Test Regression

Full Phase 4 regression (all 4 test files) after Plan 04-05 changes:

```
node --test tests/brief-align.test.cjs tests/brief-align-primitives.test.cjs \
  tests/state-brief-override-roundtrip.test.cjs tests/brief-align-canary.test.cjs
```

**59 tests pass, 0 fail, 0 cancelled, 0 skipped.** Duration 474 ms.

Per-file breakdown:
- `tests/brief-align-primitives.test.cjs` — 20 tests (Plan 04-01)
- `tests/brief-align.test.cjs` — 10 tests (Plan 04-03)
- `tests/state-brief-override-roundtrip.test.cjs` — 24 tests (Plan 04-04)
- `tests/brief-align-canary.test.cjs` — 5 tests (Plan 04-05, new)

## Deviations from Plan

**None — plan executed exactly as written.**

Three noteworthy nuances that the plan itself called out and the execution
honored:

1. **Frontmatter `name: brief:define` colon-form** preserved verbatim (plan
   Task 1 `<done>` block + iter-3 guard + parent-agent guardrail). Grep
   assertion (`grep -q '^name: brief:define$'`) and
   `extractFrontmatter().name === 'brief:define'` both confirmed.
2. **Step 3.5 insertion without renumbering** — plan Task 1 action explicitly
   forbids renumbering Step 4+; the Edit used the existing Step 4 heading as
   the anchor, inserting Step 3.5 before it. Line counts preserved downstream.
3. **Step 3.5 positional regex** — plan and `<done>` block specified
   `/^## Step 3[:\- ]/` (character class). Task 2's Test 5 uses exactly this
   regex; a comment in the test explains why the `$` end-anchor form would
   never match the live heading text.

## Authentication Gates

None. No auth required for this plan.

## Known Stubs

None introduced by Plan 04-05. The canary tests use stub `llmPass` functions
that mirror the shape of the real subagent output — this is by design (the
test scope is the deterministic-screen + merge + commit plumbing; the real
Task subagent spawn is exercised during manual /brief-define end-to-end
verification, not in this automated canary).

## Threat Flags

None. Plan 04-05 modifies only the orchestrator-internal workflow and the
user-facing command frontmatter; no new network endpoints, auth paths, file
access patterns, or schema changes at trust boundaries. The existing threat
register items (T-04-14 hook-reattach guard, T-04-15 fixture leak, T-04-16
malformed-stub DoS) are all accounted for by the pre-existing Wave 1-3
mitigations plus the automated hook-absence grep check.

## Carried Forward to Plan 04-06

- **Vocabulary-lock test (Plan 04-06 scope)**: will grep ALL emitted
  ALIGN-00.md files produced by this canary suite for ban-list tokens. The
  canary writes ALIGN-00.md to a tmp cwd (mkdtempSync) that the OS cleans up;
  Plan 04-06 vocabulary-lock test should run the ban-list grep on the
  `renderAlignReport` output directly (in-process), not on ephemeral tmp
  files.
- **TEXT_MODE parity test (Plan 04-06 scope)**: the Step 3.5 workflow block
  delegates all interrupt rendering to `align-gate.md` Steps 5A/5B/6, which
  already implement the numbered-list TEXT_MODE fallback. Plan 04-06's parity
  test should assert TEXT_MODE branches in `align-gate.md` + `define.md`
  (this plan did NOT modify those branches).

## Self-Check: PASSED

### Created files exist
- [x] `tests/brief-align-canary.test.cjs` — FOUND
- [x] `.planning/phases/04-first-gate-align-pattern-established/04-05-SUMMARY.md` — FOUND (this file)

### Modified files exist and contain expected content
- [x] `brief/workflows/define.md` — FOUND (428 lines; Step 3.5 at line 372, between Step 3 @352 and Step 4 @420)
- [x] `commands/brief/define.md` — FOUND (27 lines; `name: brief:define` preserved; `Task` added to allowed-tools; `align-gate.md` added to execution_context)

### Commits exist
- [x] `2ee9695` — feat(04-05): wire ALIGN gate into /brief-define Mode A wrap-up (D-08 canary)
- [x] `045001f` — test(04-05): ALIGN canary E2E — Korea fixture + override path + Step 3.5 positional

### Plan-level success criteria
- [x] `node --test tests/brief-align.test.cjs tests/brief-align-primitives.test.cjs tests/state-brief-override-roundtrip.test.cjs tests/brief-align-canary.test.cjs` — 59/59 pass (476ms)
- [x] No new file under `commands/brief/` (net cap delta = 0; 64 files before and after)
- [x] No hook referencing align (`grep -rq 'align' hooks/` → no matches)
- [x] Zero runtime deps (no ajv/gray-matter/js-yaml/zod in package.json)
- [x] `name: brief:define` frontmatter preserved verbatim

Duration: 4 minutes (249 seconds). Wall-clock includes context load + Edit/Write + two atomic commits + regression runs.
