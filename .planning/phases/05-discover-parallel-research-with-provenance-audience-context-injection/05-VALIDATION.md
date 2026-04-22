---
phase: 5
slug: discover-parallel-research-with-provenance-audience-context-injection
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (built-in) + c8 coverage |
| **Config file** | `.planning/config.json` (c8 threshold in package.json scripts) |
| **Quick run command** | `node --test tests/brief-discover-*.test.cjs tests/brief-audience-*.test.cjs tests/brief-provenance-*.test.cjs tests/brief-context-inject-*.test.cjs` |
| **Full suite command** | `node scripts/run-tests.cjs` (or `npm test`) |
| **Estimated runtime** | ~180 seconds (full suite); < 30 seconds (quick) |

---

## Sampling Rate

- **After every task commit:** Run subsystem-specific test files touched by the commit (quick run command)
- **After every plan wave:** Run `node scripts/run-tests.cjs`
- **Before `/gsd-verify-work`:** Full suite must be green; coverage ≥ 70% line threshold (Phase 2 inherited)
- **Max feedback latency:** 30 seconds per commit; 180 seconds per wave

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | CC-02 | — | `buildBusinessContext()` round-trip returns identical values for prompt block + frontmatter fields | unit | `node --test tests/brief-context-inject-roundtrip.test.cjs` | ❌ W0 | ⬜ pending |
| 5-02-01 | 02 | 2 | DSC-03 | — | Wave partition `ceil(N/4)` of ≤4 per wave; 2-task smoke passes BEFORE 4-wide | smoke+integration | `node --test tests/brief-discover-wave-partition.test.cjs tests/brief-discover-parallel-smoke.test.cjs` | ❌ W0 | ⬜ pending |
| 5-02-02 | 02 | 2 | DSC-01, DSC-02 | — | 9 defaults + Custom multi-select; degenerate topic fallback; 0-selection re-prompt | smoke | `node --test tests/brief-discover-multiselect.test.cjs tests/brief-discover-custom-topic.test.cjs` | ❌ W0 | ⬜ pending |
| 5-02-03 | 02 | 2 | DSC-04 | — | Agent-output provenance self-check — every quantitative claim tagged | integration | `node --test tests/brief-researcher-output-provenance.test.cjs` | ❌ W0 | ⬜ pending |
| 5-02-04 | 02 | 2 | DSC-05, CC-02 | — | Two researchers on same GTM question produce differentiated B2B vs B2C output | integration | `node --test tests/brief-researcher-b2b-vs-b2c.test.cjs` | ❌ W0 | ⬜ pending |
| 5-03-01 | 03 | 2 | DSC-04, DSC-07 | — | Provenance regex positive fixtures pass (KO+EN currency, %, multiplier, phrasings) | unit | `node --test tests/brief-provenance-positive.test.cjs` | ❌ W0 | ⬜ pending |
| 5-03-02 | 03 | 2 | DSC-04 | — | Provenance regex negative fixtures block (untagged claims) | unit | `node --test tests/brief-provenance-negative.test.cjs` | ❌ W0 | ⬜ pending |
| 5-03-03 | 03 | 2 | DSC-04 | — | False-positive exclusions (dates, articles, versions, page refs, prose quantifiers, Plan IDs) | unit | `node --test tests/brief-provenance-false-positives.test.cjs` | ❌ W0 | ⬜ pending |
| 5-03-04 | 03 | 2 | CC-04 | — | Pre-commit hook blocks untagged quantitative claim commit with structured Korean+English error | integration | `node --test tests/brief-provenance-hook.test.cjs` | ❌ W0 | ⬜ pending |
| 5-03-05 | 03 | 2 | CC-04 | — | Hook opt-in gated by `hooks.community: true`; silent pass when false/absent | unit | `node --test tests/brief-provenance-opt-in.test.cjs` | ❌ W0 | ⬜ pending |
| 5-04-01 | 04 | 3 | DSG-13 | — | AUDIENCE-OK verdict on well-formed research artifact | integration | `node --test tests/brief-audience-ok.test.cjs` | ❌ W0 | ⬜ pending |
| 5-04-02 | 04 | 3 | DSG-13 | — | DRIFTED-frontmatter verdict on missing-field artifact | integration | `node --test tests/brief-audience-drifted-frontmatter.test.cjs` | ❌ W0 | ⬜ pending |
| 5-04-03 | 04 | 3 | DSG-13 | — | DRIFTED-content verdict on hedging-in-external artifact (EN+KO keyword screen + LLM pass) | integration | `node --test tests/brief-audience-drifted-content.test.cjs` | ❌ W0 | ⬜ pending |
| 5-04-04 | 04 | 3 | DSG-13 | — | `state.brief.last_gate_results.audience` round-trip through `state.cjs` | unit | `node --test tests/brief-audience-state-roundtrip.test.cjs` | ❌ W0 | ⬜ pending |
| 5-04-05 | 04 | 3 | DSG-13 | — | Vocabulary-lock: AUDIENCE outputs contain no ban-list tokens | unit | `node --test tests/brief-audience-vocabulary-lock.test.cjs` | ❌ W0 | ⬜ pending |
| 5-05-01 | 05 | 3 | DSG-13 | — | Paired-sibling filename scheme writes `{artifact}.audience.md` next to source | smoke | `node --test tests/brief-audience-sibling-filename.test.cjs` | ❌ W0 | ⬜ pending |
| 5-05-02 | 05 | 3 | DSG-13 | — | ALIGN-00.md → OBJECTIVES.align.md code-path migration — grep audit returns 0 residual refs | smoke | `node --test tests/brief-align-filename-migration.test.cjs` | ❌ W0 | ⬜ pending |
| 5-06-01 | 06 | 1 | DSC-06 | — | Korea compliance primers (pipa-2026, isms-p, mydata-2026) exist with mandatory YAML frontmatter + disclaimer verbatim | smoke | `node --test tests/brief-korea-compliance-primers.test.cjs` | ❌ W0 | ⬜ pending |
| 5-07-01 | 07 | 3 | DSC-01..07, DSG-13, CC-02 | — | `/brief-discover` preserves Phase 3 block-gate (unchanged behavior) | smoke | `node --test tests/brief-discover-block-gate-preserved.test.cjs` | ❌ W0 | ⬜ pending |
| 5-07-02 | 07 | 3 | DSC-01..07, DSG-13, CC-02 | — | `/brief-discover` preserves Phase 3 stale-anchor (unchanged behavior) | smoke | `node --test tests/brief-discover-stale-anchor-preserved.test.cjs` | ❌ W0 | ⬜ pending |
| 5-07-03 | 07 | 3 | DSC-01, DSC-02, DSG-13 | — | `text_mode` parity — category multi-select + AUDIENCE 3-path interrupt render correctly | smoke | `node --test tests/brief-discover-text-mode.test.cjs` | ❌ W0 | ⬜ pending |
| 5-08-01 | 08 | 4 | ALL | — | Canary E2E — 2-3 categories through full flow (spawn → output → AUDIENCE → provenance → commit) | e2e | `node --test tests/brief-discover-canary-e2e.test.cjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*Task IDs are placeholders — planner reassigns based on final plan numbering.*

---

## Wave 0 Requirements

- [ ] `tests/brief-discover-multiselect.test.cjs` — covers DSC-01 (9 default categories)
- [ ] `tests/brief-discover-custom-topic.test.cjs` — covers DSC-02 (Custom entry + degenerate fallback)
- [ ] `tests/brief-discover-wave-partition.test.cjs` — covers DSC-03 partitioning algorithm
- [ ] `tests/brief-discover-parallel-smoke.test.cjs` — **BLOCKING**: 2-task parallel spawn smoke MUST pass before 4-wide implementation
- [ ] `tests/brief-provenance-positive.test.cjs` — covers DSC-04 positive fixtures
- [ ] `tests/brief-provenance-negative.test.cjs` — covers DSC-04 negative fixtures
- [ ] `tests/brief-provenance-false-positives.test.cjs` — covers prose false-positives
- [ ] `tests/brief-provenance-hook.test.cjs` — covers CC-04 hook integration
- [ ] `tests/brief-provenance-opt-in.test.cjs` — covers `hooks.community: true` gate
- [ ] `tests/brief-researcher-output-provenance.test.cjs` — agent-output self-check (D-07 double-layer)
- [ ] `tests/brief-context-inject-roundtrip.test.cjs` — covers DSC-05 `buildBusinessContext()` round-trip (KO/B2B/fintech + global/B2C)
- [ ] `tests/brief-researcher-b2b-vs-b2c.test.cjs` — covers DSC-05 differentiated output
- [ ] `tests/brief-korea-compliance-primers.test.cjs` — covers DSC-06 primer existence + schema + disclaimer verbatim
- [ ] `tests/brief-audience-ok.test.cjs` — covers DSG-13 AUDIENCE-OK verdict
- [ ] `tests/brief-audience-drifted-frontmatter.test.cjs` — covers DSG-13 DRIFTED-frontmatter verdict
- [ ] `tests/brief-audience-drifted-content.test.cjs` — covers DSG-13 DRIFTED-content verdict (KO+EN keyword hybrid)
- [ ] `tests/brief-audience-sibling-filename.test.cjs` — covers DSG-13 `.audience.md` paired-sibling scheme
- [ ] `tests/brief-audience-state-roundtrip.test.cjs` — covers `state.brief.last_gate_results.audience`
- [ ] `tests/brief-audience-vocabulary-lock.test.cjs` — covers vocabulary ban-list (mirror of align-vocabulary-lock)
- [ ] `tests/brief-align-filename-migration.test.cjs` — covers D-12 migration (grep audit returns 0)
- [ ] `tests/brief-discover-block-gate-preserved.test.cjs` — Phase 3 block-gate regression guard
- [ ] `tests/brief-discover-stale-anchor-preserved.test.cjs` — Phase 3 stale-anchor regression guard
- [ ] `tests/brief-discover-text-mode.test.cjs` — text_mode parity for multi-select + 3-path interrupt
- [ ] `tests/brief-discover-canary-e2e.test.cjs` — full E2E flow (covers all reqs)
- [ ] `tests/fixtures/provenance/*.md` — 13 fixture files (valid-en, valid-ko, valid-mixed-proximity, invalid-untagged-currency, invalid-untagged-percent, invalid-untagged-korean, false-positive-date, false-positive-article, false-positive-version, false-positive-prose-en, false-positive-prose-ko, false-positive-plan-id, edge-malformed-tag)
- [ ] `tests/fixtures/audience/*.md` — AUDIENCE-OK, DRIFTED-frontmatter, DRIFTED-content fixtures (EN + KO variants)
- [ ] `tests/fixtures/discover/*.md` — researcher sample outputs for E2E

*Framework install: none needed — `node:test` is built-in; c8 already installed via devDependencies.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Multi-runtime parity: `/brief-discover` multi-select renders correctly in Claude Code + Codex + Gemini + OpenCode | DSC-01, DSC-02, FND-06 | Each runtime has distinct UI surface; automation-in-CI requires runtime fixtures that don't exist yet | Run `/brief-discover` interactively in each runtime; verify 9 defaults + Custom render; verify numeric shortcut bug mitigation (cite GH #22300) |
| AUDIENCE 3-path user interrupt UX flow | DSG-13 | Interactive prompt path; interruption tested by human decision | Seed a DRIFTED-frontmatter artifact; run `/brief-discover` on it; exercise each of 3 paths (audience 수정하기 / 이 문서 다시 쓰기 / 현재 상태 승인) |
| Korean regulatory content in compliance primers reflects 2026 amendment + 2027 deadline correctly | DSC-06 | Legal-factual accuracy; verification requires domain reading | Review `pipa-2026.md`, `isms-p.md`, `mydata-2026.md` against cited sources (IAPP, Chambers, DGC Briefings); confirm penalty ceiling 10%, CEO liability, effective date 2026-09-11, ISMS-P 2027-07-01 |
| Pre-commit hook integration fires on `git commit` from a plain bash shell (not just Claude Code) | CC-04 | Real git hook activation happens in user's terminal, not in node:test | Seed a staged untagged-claim file; run `git commit -m "test"` in bare terminal; verify hook blocks with structured error |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies declared
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (25 test files + 3 fixture dirs above)
- [ ] No watch-mode flags in commands
- [ ] Feedback latency < 30s per task commit; < 180s per wave
- [ ] `nyquist_compliant: true` set in frontmatter after Wave 0 completes

**Approval:** pending
