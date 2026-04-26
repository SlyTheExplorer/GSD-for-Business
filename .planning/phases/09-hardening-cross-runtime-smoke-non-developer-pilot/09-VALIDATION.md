---
phase: 9
slug: hardening-cross-runtime-smoke-non-developer-pilot
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-27
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Derived from `09-RESEARCH.md §Validation Architecture`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (built-in) + `c8` 11.0.0 (coverage) |
| **Config file** | none — invoked via `node scripts/run-tests.cjs` |
| **Quick run command** | `node scripts/run-tests.cjs tests/brief-help-*.test.cjs tests/brief-smoke-*.test.cjs tests/brief-surface-*.test.cjs tests/brief-pilot-*.test.cjs tests/brief-v1-launch-*.test.cjs` |
| **Full suite command** | `node scripts/run-tests.cjs` (all 317+ tests + c8 70% line threshold) |
| **Estimated runtime** | quick ~30s; full ~5-7 min |

---

## Sampling Rate

- **After every task commit:** Run quick command (≤30s feedback latency)
- **After every plan wave:** Run full suite (verify ≤16 fail target for HRD-05)
- **Before `/gsd-verify-work`:** Full suite must be green; HRD-05 fail count ≤ 16
- **Max feedback latency:** 30s (quick) / 7min (full)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 9-00-W0 | 00 | 0 | All HRD-* | — | N/A | scaffolding | `node scripts/run-tests.cjs tests/brief-help-*.test.cjs tests/brief-smoke-*.test.cjs tests/brief-surface-*.test.cjs tests/brief-pilot-*.test.cjs tests/brief-v1-launch-*.test.cjs` | ❌ Wave 0 (11 fixtures) | ⬜ pending |
| 9-01-01 | 01 | 1 | HRD-01 | — | N/A | unit | `node --test tests/brief-smoke-test-stub.test.cjs` | ❌ Wave 0 | ⬜ pending |
| 9-01-02 | 01 | 1 | HRD-01 | — | N/A | unit | `node --test tests/brief-smoke-test-text-mode.test.cjs` | ❌ Wave 0 | ⬜ pending |
| 9-01-03 | 01 | 1 | HRD-01 | — | N/A | structural | `node --test tests/brief-smoke-test-output-format.test.cjs` | ❌ Wave 0 | ⬜ pending |
| 9-02-01 | 02 | 1 | HRD-02 | — | N/A | structural | `node --test tests/brief-surface-audit-count.test.cjs` | ❌ Wave 0 | ⬜ pending |
| 9-02-02 | 02 | 2 | HRD-02 | — | Backup branch preserves deleted commands | structural | `node --test tests/brief-surface-audit-install-cleanup.test.cjs` | ❌ Wave 0 | ⬜ pending |
| 9-02-03 | 02 | 1 | HRD-02 | — | N/A | structural | `node --test tests/brief-surface-audit-doc.test.cjs` | ❌ Wave 0 | ⬜ pending |
| 9-03-01 | 03 | 1 | HRD-03 | — | N/A | unit | `node --test tests/brief-help-categorization.test.cjs` | ❌ Wave 0 | ⬜ pending |
| 9-03-02 | 03 | 1 | HRD-03 | — | N/A | unit | `node --test tests/brief-help-partial-match.test.cjs` | ❌ Wave 0 | ⬜ pending |
| 9-03-03 | 03 | 1 | HRD-03 | — | N/A | unit | `node --test tests/brief-help-levenshtein.test.cjs` | ❌ Wave 0 | ⬜ pending |
| 9-03-04 | 03 | 1 | HRD-03 | — | N/A | coverage | `npm run test:coverage` (target: c8 line ≥ 70% for help.cjs) | (existing infra) | ⬜ pending |
| 9-04-01 | 04 | 1 | HRD-04 | — | N/A | structural | `node --test tests/brief-pilot-journal-structure.test.cjs` | ❌ Wave 0 | ⬜ pending |
| 9-05-01 | 05 | 1 | HRD-05(a) | — | N/A | regression | `node scripts/run-tests.cjs tests/bug-2004-* tests/bug-2075-*` (per-test triage) | (existing infra) | ⬜ pending |
| 9-05-02 | 05 | 1 | HRD-05(b) | — | N/A | structural | `node --test tests/architecture-counts.test.cjs tests/command-count-sync.test.cjs` | (existing — fix in plan) | ⬜ pending |
| 9-05-03 | 05 | 2 | HRD-05 | — | N/A | empirical | `node scripts/run-tests.cjs 2>&1 \| grep -cE '^✖'` (target ≤ 16) | (full suite) | ⬜ pending |
| 9-06-01 | 06 | 2 | V1-Launch-Gate | — | N/A | structural | `node --test tests/brief-v1-launch-gate.test.cjs` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

11 test fixtures must exist before Wave 1 starts (created in Plan 00 Wave 0):

- [ ] `tests/brief-smoke-test-stub.test.cjs` — HRD-01 4×5 matrix per B-D01
- [ ] `tests/brief-smoke-test-text-mode.test.cjs` — HRD-01 text_mode fallback verify per B-D03
- [ ] `tests/brief-smoke-test-output-format.test.cjs` — HRD-01 SMOKE-TEST.md schema per B-D04
- [ ] `tests/brief-surface-audit-count.test.cjs` — HRD-02 12-command count + 0-skill count
- [ ] `tests/brief-surface-audit-install-cleanup.test.cjs` — HRD-02 bin/install.js cleanliness
- [ ] `tests/brief-surface-audit-doc.test.cjs` — HRD-02 SURFACE-AUDIT.md schema
- [ ] `tests/brief-help-categorization.test.cjs` — HRD-03 4D listing
- [ ] `tests/brief-help-partial-match.test.cjs` — HRD-03 partial keyword match
- [ ] `tests/brief-help-levenshtein.test.cjs` — HRD-03 inline Levenshtein top-3 (distance ≤ 3)
- [ ] `tests/brief-pilot-journal-structure.test.cjs` — HRD-04 friction journal frontmatter + Pitfall #9 row
- [ ] `tests/brief-v1-launch-gate.test.cjs` — V1-LAUNCH-GATE.md 3-prong checklist

Existing test infra covers HRD-05(b) without new files (regex fix in `tests/command-count-sync.test.cjs` line 48).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/brief-help` UX clarity for non-developers | HRD-03 | Whether 4D categorization + Levenshtein suggestion feels intuitive (Pitfall #9) requires human eyes | Korean non-technical product owner runs `/brief-help`, `/brief-help def`, `/brief-help xyz123` → reports back whether output is read-understandable in ≤ 5 seconds |
| Pilot friction journal completeness | HRD-04 | Whether journal honestly captures friction vs. rationalizes around it (Pitfall #14 dogfooding trap) requires meta-reflection | A second reader reviews the journal and flags rationalizations or missing severity=high items |
| HRD-05(a) per-test triage correctness | HRD-05 | The "create file vs delete assertion" decision requires reading test intent and judging A-D01 lineup membership — not automatable | Reviewer reads each per-test commit message, confirms rationale matches locked-12 lineup |
| Backup branch preservation | HRD-02 / A-D02 | `backup/original-gsd` branch holds deleted commands; verify it still has them after Phase 9 deletions on main | `git checkout backup/original-gsd -- commands/brief/{deleted-cmd}.md` recovers a deleted file (proves backup intact) |

---

## Validation Sign-Off

- [ ] All 11 Wave 0 test fixtures exist before Wave 1 starts
- [ ] Sampling continuity: no 3 consecutive task commits without automated verify
- [ ] Wave 0 covers all MISSING references (HRD-01/02/03/04 + V1-Launch-Gate)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s for quick / 7min for full
- [ ] c8 line coverage ≥ 70% for `help.cjs`
- [ ] Vocabulary lock preserved (Phase 4 D-09 / Phase 5 D-09 / Phase 7 D-01 — no `compliant`, no `passed`, no green checkmarks introduced by HRD-04 friction journal)
- [ ] HRD-05 fail count ≤ 16 (EMPIRICAL_BASELINE 6 + DELTA_CAP 10)
- [ ] V1-LAUNCH-GATE.md 3-prong PASS — (i) 0 blocking pilot findings (ii) smoke PASS (iii) cap compliance
- [ ] `nyquist_compliant: true` set in frontmatter at completion

**Approval:** pending
