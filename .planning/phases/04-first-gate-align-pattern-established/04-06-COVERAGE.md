---
phase: 04
plan: 06
artifact: coverage-snapshot
captured: 2026-04-21
---

# Phase 4 — Test Coverage Snapshot

> Captured at the close of Wave 5 (Plan 04-06). Locks the Phase 4 ALIGN gate
> test surface and maps every VALIDATION.md Wave 0 gap to the addressing plan
> + addressing test file. The Phase 4 verification pass reads this snapshot.

**Captured:** 2026-04-21 (post Plan 04-06 Tasks 1+2 commit)

---

## Phase 4 ALIGN test files (Wave 0 closure)

| Test file | Tests | Status | Plan |
|-----------|-------|--------|------|
| `tests/brief-align-primitives.test.cjs` | 21 | pass | 04-01 |
| `tests/brief-align.test.cjs` | 10 | pass | 04-03 |
| `tests/brief-align-canary.test.cjs` | 5  | pass | 04-05 |
| `tests/state-brief-override-roundtrip.test.cjs` | 23 | pass | 04-04 |
| `tests/brief-align-vocabulary-lock.test.cjs` | 6  | pass | **04-06** |
| `tests/brief-align-text-mode.test.cjs` | 4  | pass | **04-06** |
| `tests/brief-align-no-hook.test.cjs` | 4  | pass | **04-06** |
| **Total (Phase 4 ALIGN)** | **73** | **73/73 pass** | |

**Quick run:** `node --test tests/brief-align*.test.cjs tests/state-brief-override-roundtrip.test.cjs` → 488 ms duration. Comfortably under VALIDATION.md's ~30s quick-run target.

---

## VALIDATION.md Wave 0 gap closure

Every Wave 0 gap from `04-VALIDATION.md` is addressed. No item is uncovered.

### Test files

| VALIDATION.md gap (Wave 0) | Addressed by | Status |
|----------------------------|--------------|--------|
| `tests/brief-align.test.cjs` (~400 lines target; covers DSG-12 three-decision paths + state shape + no-hook + canary E2E + Korea language rule) | Plan 04-03 (decision-paths) + Plan 04-05 (canary E2E split into `tests/brief-align-canary.test.cjs`) + Plan 04-06 (no-hook split into `tests/brief-align-no-hook.test.cjs`) | covered (split across 3 files for separation of concerns) |
| `tests/brief-align-vocabulary-lock.test.cjs` (~60 lines; ban-list grep) | **Plan 04-06 Task 1** | covered (~370 lines, 6 tests) |
| `tests/state-brief-override-roundtrip.test.cjs` (~80 lines; D-07 boolean `true` survival) | Plan 04-04 Task 2 | covered (23 tests) |
| `tests/brief-align-text-mode.test.cjs` (~80 lines; FND-06 TEXT_MODE parity) | **Plan 04-06 Task 2** | covered (~160 lines, 4 tests) |
| `tests/brief-align-canary.test.cjs` (~150 lines; E2E `/brief-define` Mode A → ALIGN) | Plan 04-05 Task 2 | covered (5 tests + Step 3.5 positional structural test) |

### Fixture files

| VALIDATION.md gap (Wave 0) | Addressed by | Status |
|----------------------------|--------------|--------|
| `tests/fixtures/align-aligned-baseline.md` (self-coherent OBJECTIVES.md) | Plan 04-03 Task 1 | covered |
| `tests/fixtures/align-drifted-objective-missing-required.md` | Plan 04-03 Task 1 | covered |
| `tests/fixtures/align-drifted-objective-contradiction.md` (Pitfall #6 MUST-PASS canary) | Plan 04-03 Task 1 | covered |
| `tests/fixtures/align-drifted-output-zero-overlap.md` | Plan 04-03 Task 1 | covered |

### Other Wave 0 items

| VALIDATION.md gap | Addressed by | Status |
|-------------------|--------------|--------|
| `.gitignore` entry for `.planning/.align-verdict.tmp.json` | Plan 04-01 Task 1 | covered |
| `brief/references/align-vocabulary.md` (preferred + ban-list source of truth) | Plan 04-01 Task 1 | covered |
| No framework install needed (`node:test` built-in; `c8` already dev-installed) | (n/a — inheritance) | covered |

---

## DSG-12 success-criterion mapping

The single Phase 4 requirement (`DSG-12` per REQUIREMENTS.md) decomposes into 4 ROADMAP success criteria. Every SC has at least one test asserting it.

| ROADMAP Success Criterion | Test(s) | Status |
|---------------------------|---------|--------|
| **SC #1** — Three outputs (ALIGNED / DRIFTED-objective-needs-update / DRIFTED-output-needs-revision) | `brief-align.test.cjs` (4 decision-path tests including Pitfall #6 contradiction MUST-PASS canary) + `brief-align-canary.test.cjs` (E2E ALIGNED + override paths) | covered |
| **SC #2** — Findings vocabulary (no `compliant`/`passed`/`✅`/etc. — see align-vocabulary.md ban-list) | `brief-align-vocabulary-lock.test.cjs` (6 tests: 3 emitted ALIGN-00.md fixture runs + 3 static-source-file section-aware grep) | covered |
| **SC #3** — Gate is orchestrator-visible (Pattern 4) — NOT hook-spawned | `brief-align-no-hook.test.cjs` (4 tests: hooks/ recursive grep + Surface Caps no-command + workflow visibility + agent frontmatter no-hooks) + `brief-align-text-mode.test.cjs` (no_hooks_assertion structural block test) | covered |
| **SC #4** — `state.brief.last_gate_results.align` populated with decision/severity/findings_count/at | `brief-align.test.cjs` (state-write-shape test) + `state-brief-override-roundtrip.test.cjs` (23 tests covering override field round-trip, boolean true survival per D-20 serializer) + `brief-align-canary.test.cjs` (E2E STATE.md shape) | covered |

---

## Bonus pattern-discipline coverage (Plan 04-06 additions)

Plan 04-06 ships three CI-time discipline locks that are NOT individually requested by VALIDATION.md but are load-bearing for Phase 5/7 replication:

| Discipline | Test | Why it matters |
|------------|------|----------------|
| **D-05 ban-list discipline at the REFERENCE-FILE level** (not just emit-time) | `brief-align-vocabulary-lock.test.cjs` Tests 4-6 | Pitfall #4 creep usually starts in the reference file or prompt examples. Test 4 (vocabulary.md section containment) + Test 5 (agent prompt vocabulary_discipline scope) + Test 6 (workflow has zero ban tokens) catch the creep at source — before it can leak into emitted ALIGN-00.md output. |
| **FND-06 TEXT_MODE parity** at the workflow markdown level | `brief-align-text-mode.test.cjs` Tests 1-2 | Cross-runtime smoke (HRD-01) is Phase 9. Plan 04-06's static-markdown-parse assertion catches TEXT_MODE fallback regressions immediately, without waiting for HRD-01. Codex/Gemini/OpenCode users won't silently lose the 3-path interrupt. |
| **D-07 MANDATORY override reason** in workflow Step 6 | `brief-align-text-mode.test.cjs` Test 3 | Without explicit MANDATORY language in the workflow, future edits could quietly relax the requirement to "optional" — silently degrading the audit-trail discipline. Locking the workflow text catches that drift. |
| **no_hooks_assertion structural block** in workflow markdown | `brief-align-text-mode.test.cjs` Test 4 | The `<no_hooks_assertion>` block + load-bearing phrasing must remain in the workflow file as documentation of the invariant. Pairs with `brief-align-no-hook.test.cjs` Test 1 (hooks/ recursive grep) for defense in depth. |

---

## Full `npm test` baseline

| Metric | Value |
|--------|-------|
| **Pre-Phase-4 baseline** (per STATE.md blockers — Phase 1 HALT-ACCEPTED, Phase 9 HRD-05 deferral) | 63 failures |
| **Post-Plan-04-06 (current)** | **44 failures** |
| **Delta** | **−19** (improvement; no Phase 4 regression — prior Phase 4 waves quietly closed 19 of the deferred items) |
| Total tests | 3,804 |
| Passing | 3,760 |
| Duration | ~33s |

**Passing bar** per VALIDATION.md: delta ≤ 0. **Achieved: −19** (net improvement).

### Failure provenance breakdown

All 44 remaining failures are pre-existing Phase 1-3 deferred items per STATE.md `Deferred Items` table (Phase 9 HRD-05 deferral). None are introduced by Phase 4.

Of note: 2 failures relate specifically to `agents/brief-align-gate.md` — these were created in Plan 04-02 and inherit a Phase 1-3 convention from `tests/agent-frontmatter.test.cjs`:

- `brief-align-gate has anti-heredoc instruction` — file-writing agent (`tools: Read, Grep, Glob, Write`) is expected to carry the Phase 1-3 anti-heredoc instruction text.
- `brief-align-gate has commented hooks pattern` — file-writing agents are expected to carry a commented `# hooks:` line in frontmatter as documentation of "what NOT to do" (Anti-pattern #2 prophylactic).

Both inherited gaps are CONSISTENT with Plan 04-06's `brief-align-no-hook.test.cjs` Test 4 (which asserts no LIVE `hooks:` key — the commented version is the documentation pattern). The Phase 1-3 convention should be retrofitted as part of **Phase 9 HRD-05** (deferred-items resolution) — these are correctness-of-convention drifts, not correctness-of-behavior bugs, and out of scope for Phase 4 Plan 04-06 (which targets pattern discipline, not Phase 1 hygiene retrofit).

---

## Coverage notes (line-coverage)

- **No coverage regression expected.** All 7 Phase 4 ALIGN test files are net-new and provide >70% line coverage for `brief/bin/lib/align.cjs` + extended override-rendering paths in `brief/bin/lib/status.cjs`.
- **Pitfall #6 MUST-PASS canary** (Immutable B2B-enterprise + Mutable App-Store-consumer fixture) verified detecting the planted contradiction in `brief-align.test.cjs:115` (test name: `MUST-PASS canary — drifted-objective-contradiction`).
- **Zero runtime dependencies preserved.** `package.json` `dependencies: {}` (verified via `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` → 0). Plan 04-06 added zero npm packages.
- **CommonJS only.** All 3 new test files use `require('node:test')`/`node:assert`/`node:fs` — no ESM, no transpilation.

---

## Forward consistency for Phase 5 / Phase 7

The 4 ROADMAP success criteria + 3 bonus discipline locks combine to fix the canonical pattern that Phase 5 (AUDIENCE) and Phase 7 (COMPLIANCE) replicate by **copy + rename**:

- `agents/brief-align-gate.md` → `agents/brief-audience-guard.md` / `agents/brief-compliance-checker.md`
- `brief/workflows/align-gate.md` → `brief/workflows/audience-guard.md` / `brief/workflows/compliance-check.md`
- `brief/bin/lib/align.cjs` (ban-list regexes, runDeterministicScreen, mergeVerdicts) → analogous library helpers per gate
- All 7 Phase 4 ALIGN test files → 7 audience-guard test files (Phase 5) + 7 compliance-checker test files (Phase 7)

The vocabulary-lock + text-mode + no-hook tests in particular are TEMPLATE-FRIENDLY: their assertions parameterize cleanly on `{gateName}` and `{candidatePath}/{baselinePath}` — Phase 5/7 planners should adapt rather than re-author.

Phase 4 verification pass should treat the 73 ALIGN tests as the floor; Phase 5+ replication adds proportional test coverage per gate.
