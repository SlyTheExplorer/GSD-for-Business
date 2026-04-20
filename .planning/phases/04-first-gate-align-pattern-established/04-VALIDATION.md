---
phase: 4
slug: first-gate-align-pattern-established
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from 04-RESEARCH.md §Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (built-in Node 22+) + `c8` 11.x coverage |
| **Config file** | none — invoked via `node scripts/run-tests.cjs` (Phase 1 inheritance) |
| **Quick run command** | `node --test tests/brief-align.test.cjs tests/brief-align-vocabulary-lock.test.cjs tests/state-brief-override-roundtrip.test.cjs` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30s (quick); ~90s (full) |

---

## Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSG-12 | Gate emits ALIGNED for a self-coherent OBJECTIVES.md fixture | unit | `node --test tests/brief-align.test.cjs --test-name-pattern='aligned-fixture'` | ❌ Wave 0 |
| DSG-12 | Gate emits DRIFTED-objective-needs-update when OBJECTIVES.md has missing required fields | unit | `node --test tests/brief-align.test.cjs --test-name-pattern='drifted-objective-missing-required'` | ❌ Wave 0 |
| DSG-12 | Gate emits DRIFTED-objective-needs-update when OBJECTIVES.md has Immutable↔Mutable contradiction | unit | `node --test tests/brief-align.test.cjs --test-name-pattern='drifted-objective-contradiction'` | ❌ Wave 0 |
| DSG-12 | Gate emits DRIFTED-output-needs-revision for a candidate with zero overlap | unit | `node --test tests/brief-align.test.cjs --test-name-pattern='drifted-output-zero-overlap'` | ❌ Wave 0 |
| DSG-12 + D-05 | Vocabulary-lock: no emitted ALIGN-00.md contains `compliant\|passed\|✅\|violation\|failed\|준수\|통과\|위반\|실패` | unit (grep after fixtures) | `node --test tests/brief-align-vocabulary-lock.test.cjs` | ❌ Wave 0 |
| DSG-12 + D-07 | `state.brief.last_gate_results.align` round-trips with override fields (boolean `true` survival) | unit | `node --test tests/state-brief-override-roundtrip.test.cjs` | ❌ Wave 0 |
| ROADMAP SC #3 | `brief/workflows/align-gate.md` invoked as explicit orchestrator step (no hook) | structural assertion | `node --test tests/brief-align.test.cjs --test-name-pattern='no-hook-invocation'` — greps `hooks/` for `align` + asserts empty | ❌ Wave 0 |
| ROADMAP SC #4 | `state.brief.last_gate_results.align` records decision/severity/findings_count/at | unit | `node --test tests/brief-align.test.cjs --test-name-pattern='state-write-shape'` | ❌ Wave 0 |
| D-08 canary | E2E: `/brief-define` Mode A → ALIGN → ALIGN-00.md + STATE.md | e2e / smoke | `node --test tests/brief-align-canary.test.cjs` (uses `korea-b2c-persona.json` fixture) | ❌ Wave 0 |
| D-11 language | Korea-signal fixture emits ALIGN-00.md with Korean body | unit | `node --test tests/brief-align.test.cjs --test-name-pattern='korea-language-rule'` | ❌ Wave 0 |
| FND-06 parity | TEXT_MODE fallback renders the 3-path interrupt as numbered list | integration (spawn simulation) | `TEXT_MODE=true node --test tests/brief-align-text-mode.test.cjs` | ❌ Wave 0 |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/brief-align.test.cjs tests/brief-align-vocabulary-lock.test.cjs tests/state-brief-override-roundtrip.test.cjs` (<30s total) — catches regressions in the three decision paths, vocabulary lock, and state override round-trip.
- **After every wave merge:** Run `npm test` (full suite — ensures no Phase 1–3 regressions introduced by new `state.cjs` consumers or `status.cjs` rendering changes).
- **Phase gate (final verification):** `npm test` green AND `tests/brief-align-canary.test.cjs` smokes against a real `korea-b2c-persona` OBJECTIVES.md fixture with the full `/brief-define` Mode A → ALIGN flow.

---

## Wave 0 Gaps

**Test files to create:**
- [ ] `tests/brief-align.test.cjs` — covers DSG-12 three-decision paths + state shape + no-hook assertion + canary E2E + Korea language rule. ~400 lines.
- [ ] `tests/brief-align-vocabulary-lock.test.cjs` — grep every emitted ALIGN-00.md for ban-list (`compliant|passed|✅|violation|failed|준수|통과|위반|실패` + symbol regex `/[✅✓✗]/g`). ~60 lines.
- [ ] `tests/state-brief-override-roundtrip.test.cjs` — D-07 override field boolean `true` survival through `readModifyWriteStateMd` → frontmatter serializer → reader. ~80 lines.
- [ ] `tests/brief-align-text-mode.test.cjs` — TEXT_MODE 3-path interrupt renders as numbered list (integration, spawn simulation). ~80 lines.
- [ ] `tests/brief-align-canary.test.cjs` — E2E smoke: `/brief-define` Mode A → ALIGN → ALIGN-00.md + STATE.md. ~150 lines.

**Fixture files to create:**
- [ ] `tests/fixtures/align-aligned-baseline.md` — self-coherent OBJECTIVES.md (reuse `korea-b2c-persona.json` where possible).
- [ ] `tests/fixtures/align-drifted-objective-missing-required.md` — OBJECTIVES.md fixture missing `region` and `business_model` frontmatter.
- [ ] `tests/fixtures/align-drifted-objective-contradiction.md` — Immutable Intent "B2B enterprise" + Mutable Hypothesis "App Store consumer acquisition" (must-pass canary per D-08).
- [ ] `tests/fixtures/align-drifted-output-zero-overlap.md` — candidate that shares no terms with OBJECTIVES.md Immutable Intent.

**Other Wave 0 items:**
- [ ] `.gitignore` entry for `.planning/.align-verdict.tmp.json` (prevents transient verdict leaking into commits).
- [ ] `brief/references/align-vocabulary.md` — the preferred phrasings + ban-list source of truth (referenced by the subagent AND the vocabulary-lock test).
- [ ] No framework install needed — `node:test` built-in; `c8` already dev-installed.

---

## Coverage Notes

- **No existing test infrastructure covers Phase 4 directly.** All test files and fixtures are net-new.
- **No coverage regression expected** — the new tests provide coverage for the new `align.cjs` module and the extended `status.cjs` override rendering.
- **Cross-runtime validation:** `tests/brief-align-text-mode.test.cjs` specifically exercises the TEXT_MODE fallback required for Codex/Gemini/OpenCode parity (FND-06 inheritance).
- **Forward consistency check:** Phase 5 AUDIENCE and Phase 7 COMPLIANCE will reuse the same severity vocabulary (`blocking / material / nice-to-have`) and 3-output decision shape — Phase 4 tests lock the contract.
