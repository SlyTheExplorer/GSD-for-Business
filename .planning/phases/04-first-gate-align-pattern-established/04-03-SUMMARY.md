---
phase: 04-first-gate-align-pattern-established
plan: 03
subsystem: testing
tags: [align-gate, test-fixtures, node:test, evaluator-optimizer, hybrid-verdict, pitfall-6-canary]

# Dependency graph
requires:
  - phase: 04-first-gate-align-pattern-established
    provides: "Plan 04-01 primitives (validateVerdict, grepBanList, computeTermOverlap, detectKoreaSignalFromConfig, runDeterministicScreen, writeVerdict) + align-vocabulary.md reference"
  - phase: 04-first-gate-align-pattern-established
    provides: "Plan 04-02 subagent prompt contract (agents/brief-align-gate.md) + orchestrator workflow (brief/workflows/align-gate.md) — verdict schema the test doubles simulate"
provides:
  - "runAlign entry point with injectable llmPass parameter (testable hybrid pipeline: deterministic short-circuit → optional LLM pass → merge → writeVerdict)"
  - "mergeVerdicts merge rule implementation (D-03/D-04: severity ordering, decision derivation from blocking-finding location)"
  - "4 decision-path test fixtures — ALIGNED baseline (Korean B2C), DRIFTED-objective-missing-required (screen b), DRIFTED-objective-contradiction (Pitfall #6 MUST-PASS canary), DRIFTED-output-zero-overlap (screen a)"
  - "10 combined-suite tests exercising all 3 decisions × severities, short-circuit behavior, baseline read-only contract (Pitfall #2), JSON round-trip shape (Pitfall #3/#4), and the Pitfall #6 MUST-PASS canary guard"
affects:
  - "Plan 04-04 (commitAlignVerdict + align run/commit dispatcher) — consumes runAlign / mergeVerdicts + the 4 fixtures for its own state-write tests"
  - "Plan 04-05 (canary E2E) — reuses fixtures as real-subagent spawn fodder; swaps the stub llmPass for a live Task invocation"
  - "Phase 5 AUDIENCE gate + Phase 7 COMPLIANCE checker — replicate the decision-path test harness pattern (copy-rename fixtures + substitute vocabulary per domain)"

# Tech tracking
tech-stack:
  added: []   # Zero runtime deps preserved (A1 guard holds)
  patterns:
    - "Injectable LLM-pass test double: llmPass is a function parameter on runAlign so tests substitute fixture-controlled verdict JSON without spawning real Task subagents"
    - "Planted-contradiction canary fixture with assert.fail diagnostic — Test 3 emits a diagnostic citing Pitfall #6 + warning about Phase 5/7 inheritance if ALIGNED fires on B2B+consumer planted contradiction"
    - "Decision-path coverage discipline — one fixture per decision × short-circuit path; merge-rule tests separate from end-to-end tests for precise failure localization"

key-files:
  created:
    - "tests/fixtures/align-aligned-baseline.md"
    - "tests/fixtures/align-drifted-objective-missing-required.md"
    - "tests/fixtures/align-drifted-objective-contradiction.md"
    - "tests/fixtures/align-drifted-output-zero-overlap.md"
    - "tests/brief-align.test.cjs"
  modified:
    - "brief/bin/lib/align.cjs (214 → 310 lines; +mergeVerdicts +runAlign)"

key-decisions:
  - "Test double injection point chosen at runAlign's llmPass parameter rather than monkey-patching a subagent spawn — keeps production code path identical to test code path except for the last function call"
  - "Pitfall #6 canary uses an explicit assert.fail with diagnostic message rather than a plain assertEqual; the diagnostic names the pitfall, names the planted contradiction strings (B2B enterprise + App Store consumer), and warns of Phase 5/7 inheritance"
  - "mergeVerdicts decision derivation uses location-regex (`/OBJECTIVES\\.md/i | /frontmatter/i`) to distinguish DRIFTED-objective from DRIFTED-output — keeps the merge rule self-contained without needing to pass which side the blocking finding came from"
  - "Zero-overlap fixture deliberately rewritten to avoid substring collisions with baseline English tokens (removed 'intentionally' because its 'intent' substring matched baseline's 'Immutable Intent' extraction)"

patterns-established:
  - "Plan-level TDD with RED commit → GREEN commit sequencing: test file landing first (10 failing tests) followed by implementation landing that turns all 10 green"
  - "Injected-LLM-double pattern that Phase 5 AUDIENCE + Phase 7 COMPLIANCE will replicate verbatim — the only swap is the fixture vocabulary (audience terms vs alignment terms vs compliance terms)"

requirements-completed:
  - DSG-12

# Metrics
duration: 6min
completed: 2026-04-21
---

# Phase 04 Plan 03: ALIGN Decision-Path Fixtures + runAlign/mergeVerdicts Summary

**Hybrid ALIGN pipeline end-to-end tested via 4 fixtures + 10-test decision-path suite, with Pitfall #6 MUST-PASS canary (Immutable B2B-enterprise + Mutable App-Store-consumer contradiction) locked against regression.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-21T01:03:14Z
- **Completed:** 2026-04-21T01:09:28Z
- **Tasks:** 2 (Task 1 fixtures, Task 2 TDD RED + GREEN)
- **Files modified:** 6 (4 new fixtures, 1 new test file, 1 modified lib file)
- **Commits:** 3 (fixture commit + TDD RED + TDD GREEN)

## Accomplishments

- **Pitfall #6 MUST-PASS canary locked in executable form.** Test 3 in `tests/brief-align.test.cjs` asserts that the hybrid evaluator returns `DRIFTED-objective-needs-update` on a fixture whose Immutable Intent declares "B2B 소프트웨어 회사 / 직원 1,000명 이상 대기업 / 엔터프라이즈급 SLA + 연간 계약" while its Mutable Hypotheses push "Apple App Store / B2C 획득 / 소비자" — two mutually exclusive go-to-market motions. The test's `assert.fail` path cites 04-RESEARCH.md Pitfall #6 verbatim and warns that Phase 5 AUDIENCE and Phase 7 COMPLIANCE inherit a broken gate if this canary ever returns ALIGNED.
- **runAlign + mergeVerdicts shipped in `brief/bin/lib/align.cjs`.** The `runAlign(cwd, opts)` entry point drives the deterministic short-circuit → optional LLM pass → merge pipeline in a single testable call. `mergeVerdicts` implements D-03/D-04 severity+decision merge: severity = max across det+llm findings, decision = blocking at OBJECTIVES.md location → DRIFTED-objective, blocking elsewhere → DRIFTED-output, no blocking → ALIGNED. Location-regex (`/OBJECTIVES\\.md/i | /frontmatter/i`) keeps the merge rule self-contained.
- **Decision-path test harness ready for Phase 5/7 replication.** 10 tests cover all 3 decisions × the 3 severities, short-circuit behavior (Tests 2, 4 verify llmPass is NEVER called when deterministic fires), baseline read-only contract (Test 6 — Pitfall #2), JSON round-trip shape (Test 5 — Pitfall #3/#4), and merge-rule edge cases (Tests 7–10, including null-llmVerdict tolerance).
- **Zero runtime deps preserved.** A1 guard intact: `package.json` dependencies unchanged; no `ajv / gray-matter / js-yaml / zod` added. The test double pattern costs 0 runtime bytes.
- **Line budget discipline preserved.** `brief/bin/lib/align.cjs` landed at exactly 310 lines (the ≤310 target from success criteria; ≤400 hard cap from Phase 2 D-18). Headroom for Plan 04-04 (~100 lines for `commitAlignVerdict` + dispatcher) remains within the 400-cap.

## Task Commits

1. **Task 1: 4 decision-path fixtures under `tests/fixtures/`** — `af648ca` (test)
2. **Task 2 RED: failing ALIGN decision-path tests** — `663366b` (test; all 10 fail with `TypeError: runAlign/mergeVerdicts is not a function`)
3. **Task 2 GREEN: runAlign + mergeVerdicts in align.cjs** — `05b6bcf` (feat; all 10 pass + all 21 primitives pass)

_TDD cycle complete (RED → GREEN). No REFACTOR commit needed — the implementation is already focused; additional cleanup would only remove explanatory comments without improving the code's shape._

## Files Created/Modified

- **`tests/fixtures/align-aligned-baseline.md`** (30 lines) — self-coherent Korean-first B2C OBJECTIVES.md. `business_model: b2c`, `region: kr`, `compliance_packs: [PIPA, ISMS-P, MyData]`, Immutable Intent + Mutable Hypotheses + Dream State in Korean. Reused as the ALIGNED baseline across Tests 1, 4, 5, 6 and as the baseline in the zero-overlap Test 4 (candidate is the garden fixture).
- **`tests/fixtures/align-drifted-objective-missing-required.md`** (23 lines) — OBJECTIVES.md with `region` and `business_model` absent from frontmatter (intentional screen-b defect). Triggers `objectives.validateObjectivesComplete → {valid: false, missing: ['business_model', 'region']}` and `runDeterministicScreen` short-circuits with a blocking verdict.
- **`tests/fixtures/align-drifted-objective-contradiction.md`** (28 lines) — **Pitfall #6 MUST-PASS canary.** Immutable Intent: "법인 B2B 소프트웨어 회사 공동창업자 / 직원 1,000명 이상 대기업 / 엔터프라이즈급 SLA + 연간 계약 / 전담 CS". Mutable Hypotheses: "개인 사용자를 위한 iOS/Android 앱 런치 / Apple App Store 상위 노출 / B2C 획득 / 소비자 / App Store 다운로드 10만 / 별점 4.5". This planted contradiction is the canonical test for the hybrid evaluator's self-contradiction detection.
- **`tests/fixtures/align-drifted-output-zero-overlap.md`** (8 lines) — hobby-garden content deliberately rewritten to avoid substring collisions with baseline English tokens (see Deviations §1). Preserves the `garden irrigation` marker required by Task 1's verify command.
- **`tests/brief-align.test.cjs`** (310 lines) — 10-test decision-path suite. Test 3 is the Pitfall #6 canary with `assert.fail` diagnostic.
- **`brief/bin/lib/align.cjs`** (214 → 310 lines) — added `mergeVerdicts` (D-03/D-04 merge rule) and `runAlign` (entry point with injectable `llmPass`). Added `SEVERITY_ORDER` constant. Exports updated to include both new functions.

## Decisions Made

- **Test double at `runAlign`'s `llmPass` parameter, not at a module-spawn boundary.** This keeps the production code path and the test code path identical except for the final function dispatch. Phase 5/7 replication inherits this injection point; the test harness doesn't need to be redesigned per phase.
- **`mergeVerdicts` location-regex for decision derivation.** Pattern `/OBJECTIVES\.md/i | /frontmatter/i` inside finding locations is the signal that a blocking finding is about the objective side. Keeps the merge rule self-contained — no need to pass a `which_side` flag through the pipeline.
- **`assert.fail` with verbose diagnostic for the Pitfall #6 canary.** Rather than a terse `strictEqual` that prints `ALIGNED !== DRIFTED-objective-needs-update`, the canary guard names the pitfall, names the planted contradiction strings, and warns about downstream inheritance. This makes a regression self-documenting to whoever sees the CI failure months from now.
- **Zero-overlap fixture rewritten to avoid substring matching with baseline.** `computeTermOverlap` uses `.includes()` substring matching (Plan 04-01 design — stable). The plan's literal fixture text ("intentionally") collided with baseline's `intent` (from `## Immutable Intent` header). Fix was in the fixture (not in the primitive) because the primitive is shared with Plan 04-01 tests that already pass on it. See Deviations §1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Zero-overlap fixture had substring collision with baseline tokens**

- **Found during:** Task 2 GREEN (running the new tests after implementing runAlign/mergeVerdicts)
- **Issue:** Test 4 (`drifted-output-zero-overlap`) failed because `computeTermOverlap` returned `score: 1` instead of 0. Root cause: the plan's literal fixture text contained "intentionally" — the word's `intent` substring matched the baseline's extracted token `intent` (from the header `## Immutable Intent`). `computeTermOverlap` performs substring matching via `.includes()` per Plan 04-01's primitive design; this is stable and shared with `tests/brief-align-primitives.test.cjs`.
- **Fix:** Rewrote `tests/fixtures/align-drifted-output-zero-overlap.md` to use vocabulary that has no substring overlap with any of the baseline's extracted English tokens (audience, brief, business, compliance, core, creator, dream, greenfield, hypotheses, identity, immutable, intent, internal, isms, items, mode, model, mutable, mydata, objectives, packs, pipa, policy, problem, ready, region, state, statement, status, unlock, value, version). Replaced "intentionally selected unrelated domain vocabulary" with "deliberately chosen unrelated hobby words". Preserved "garden irrigation" so Task 1's verify command still passes.
- **Files modified:** `tests/fixtures/align-drifted-output-zero-overlap.md`
- **Verification:** `node -e '...computeTermOverlap(candidate, baseline)...'` → `overlap.score: 0, sharedTerms: []`. Test 4 passes.
- **Committed in:** `05b6bcf` (Task 2 GREEN commit — the fixture tweak shipped alongside the GREEN implementation because both were needed for the test suite to pass)

---

**Total deviations:** 1 auto-fixed (Rule 3 blocking issue)
**Impact on plan:** Fixture-only change; no semantic drift from the plan's intent (the fixture still exercises the zero-overlap screen-a short-circuit path). The rewrite preserves the Task 1 verify command's grep check for "garden irrigation".

## Issues Encountered

- **Worktree rebase at startup.** The worktree's initial HEAD (`fb7385f8`) was at Phase 3 completion, while the expected base for Wave 2 is `76fb5c1f` (post-Wave-1 merge commit). `git reset --hard 76fb5c1f` brought the worktree to the correct base with all Wave 1 artifacts (`brief/bin/lib/align.cjs` from Plan 04-01, `agents/brief-align-gate.md` from Plan 04-02, Phase 4 planning files, etc.) in place. This is the expected orchestrator-assigned base; not a defect.
- **Align.cjs line-count trimming.** Initial implementation landed at 342 lines (above the ≤310 success criteria). Two comment-trim passes brought it to exactly 310. Functional code is unchanged; only comment density was reduced.

## Self-Check: PASSED

- `tests/fixtures/align-aligned-baseline.md` — FOUND
- `tests/fixtures/align-drifted-objective-missing-required.md` — FOUND
- `tests/fixtures/align-drifted-objective-contradiction.md` — FOUND
- `tests/fixtures/align-drifted-output-zero-overlap.md` — FOUND
- `tests/brief-align.test.cjs` — FOUND (310 lines)
- `brief/bin/lib/align.cjs` — FOUND (310 lines)
- Commit `af648ca` — FOUND (Task 1 fixtures)
- Commit `663366b` — FOUND (Task 2 RED)
- Commit `05b6bcf` — FOUND (Task 2 GREEN)
- `node --test tests/brief-align.test.cjs tests/brief-align-primitives.test.cjs` → 31 pass / 0 fail / exit 0
- `node --check brief/bin/lib/align.cjs` → exit 0
- `package.json dependencies` → does not contain `ajv / gray-matter / js-yaml / zod`

## Next Phase Readiness

**For Plan 04-04 (wave 3):**
- `runAlign` and `mergeVerdicts` are exported and consumable — Plan 04-04's `commitAlignVerdict` can call `runAlign` directly, feed the verdict into the ALIGN-00.md renderer, and commit atomically.
- The 4 fixtures are reusable for Plan 04-04's state-write tests (feed a verdict from `runAlign` into `commitAlignVerdict`; assert STATE.md + ALIGN-00.md shape).
- `align.cjs` has ~90 lines of headroom under the 400-cap (310 → 400 available for Plan 04-04 additions).

**For Plan 04-05 (wave 4 canary E2E):**
- The 4 fixtures become real-subagent spawn fodder — swap the stub `llmPass` for a live Task invocation pointing at `agents/brief-align-gate.md`. The canary exercises that the real subagent produces the same verdict shape the tests already cover.
- The Pitfall #6 canary's diagnostic message is pre-written — if the real subagent ever returns ALIGNED on the contradiction fixture, the failing test speaks for itself.

**For Phase 5 AUDIENCE + Phase 7 COMPLIANCE:**
- The decision-path test harness (fixture-per-path + `setupCwd` helper + injected stub) is copy-rename-ready. Phase 5 swaps the fixture vocabulary (audience/confidentiality terms for alignment terms); Phase 7 swaps compliance-pack vocabulary.

**Open items for Phase 9 HRD-04 pilot:**
- The Pitfall #6 canary's stub heuristic (`/1,?000명 이상/.test AND /App Store/i.test`) is correct for the planted fixture but will not generalize to all real-world contradictions — the real-subagent prompt in Plan 04-02 is what actually has to detect novel contradictions at pilot time. Flag for HRD-04 ban-list + prompt refinement cycle if pilots surface false-ALIGNED outputs on unplanted contradictions.

---
*Phase: 04-first-gate-align-pattern-established*
*Plan: 03*
*Completed: 2026-04-21*
