---
phase: 03
slug: define-canary-phase-0-end-to-end
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-19
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: 03-RESEARCH.md §Validation Architecture. Fill per-task rows during `/brief-plan-phase`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (built-in) + `c8` coverage (70% line threshold) |
| **Config file** | None — run via `scripts/run-tests.cjs` |
| **Quick run command** | `node --test tests/brief-define-*.test.cjs tests/brief-objectives-*.test.cjs tests/brief-discover-gate.test.cjs` |
| **Full suite command** | `npm test` (invokes `node scripts/run-tests.cjs`) |
| **Estimated runtime** | Quick ~3–6s · Full ~15–30s |

---

## Sampling Rate

- **After every task commit:** Run the quick run command (Phase-3-scoped test files only).
- **After every plan wave:** Run `npm test` (full suite; ensures no Phase 1/2 regression).
- **Before `/brief-verify-work`:** Full suite must be green + c8 line coverage ≥70%.
- **Max feedback latency:** 30 seconds.

---

## Per-Task Verification Map

_Populated by planner. One row per task. Every requirement DEF-01..DEF-06 must appear at least once._

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | DEF-03 | — | OBJECTIVES.md frontmatter round-trips without diff through frontmatter.cjs | unit | `node --test tests/brief-objectives-roundtrip.test.cjs` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | DEF-03 | — | immutable section edits throw at objectives.cjs writer layer (not at commit time) | unit | `node --test tests/brief-objectives-immutable-lock.test.cjs` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | DEF-01, DEF-02 | — | Mode A fixture produces valid OBJECTIVES.md with Push-Twice + Language-Precision + Dream-State prose sections | integration | `node --test tests/brief-define-mode-a.test.cjs` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | DEF-01, DEF-02 | — | Korea-first B2C canonical fixture exercises the full Mode A flow end-to-end | fixture | `node --test tests/brief-define-mode-a.test.cjs` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | DEF-03 | — | Mode B only revisits user-selected mutable sub-sections; immutable items visible with 🔒 marker but reject edit attempts | integration | `node --test tests/brief-define-mode-b.test.cjs` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 3 | DEF-03 | — | `--unlock-intent` escape path flips the lock and allows immutable edit with explicit audit-log entry | integration | `node --test tests/brief-define-mode-b.test.cjs` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 3 | DEF-04 | — | 4 configs (business_model/region/audience_policy/compliance_packs) round-trip through config.json `brief.*` namespace | unit | `node --test tests/brief-config-brief-namespace.test.cjs` | ❌ W0 | ⬜ pending |
| 03-04-02 | 04 | 3 | DEF-04 | — | Korea-signal detection pre-checks PIPA/ISMS-P/MyData ONLY when Korea keywords/language/region present; absent signals → no pre-check | unit | `node --test tests/brief-define-korea-signal.test.cjs` | ❌ W0 | ⬜ pending |
| 03-04-03 | 04 | 3 | DEF-01..DEF-06 | — | Atomic 3-artifact commit writes OBJECTIVES.md + config.json + STATE.md in one transaction; individual file write failure rolls back all | integration | `node --test tests/brief-define-atomic-commit.test.cjs` | ❌ W0 | ⬜ pending |
| 03-04-04 | 04 | 3 | — (canary) | — | Canary structural assertion: command→workflow→lib + exported primitives reusable by Phase 5+ (orchestrator-workers pattern verified) | structural | `node --test tests/brief-define-canary.test.cjs` | ❌ W0 | ⬜ pending |
| 03-05-01 | 05 | 4 | DEF-05 | — | `/brief-discover` entry with incomplete OBJECTIVES.md blocks (non-zero exit) with Korean recovery-oriented error listing exact missing fields + `--amend` recovery command | integration | `node --test tests/brief-discover-gate.test.cjs` | ❌ W0 | ⬜ pending |
| 03-05-02 | 05 | 4 | DEF-05 | — | Gate passes (placeholder Phase 5 body output) when all required fields present | integration | `node --test tests/brief-discover-gate.test.cjs` | ❌ W0 | ⬜ pending |
| 03-06-01 | 06 | 5 | DEF-06 | — | OBJECTIVES.md mtime >48h triggers 3-option stale-anchor interrupt on new phase/milestone entry (`/brief-discover` stub + `/brief-define --amend`) | integration | `node --test tests/brief-define-stale-anchor.test.cjs` | ❌ W0 | ⬜ pending |
| 03-06-02 | 06 | 5 | DEF-06 | — | Negative test: `/brief-status`, `/brief-help`, mid-workflow calls do NOT trigger stale-anchor (confirms scoped injection) | integration | `node --test tests/brief-define-stale-anchor.test.cjs` | ❌ W0 | ⬜ pending |
| 03-06-03 | 06 | 5 | DEF-01..DEF-06 | — | `text_mode=true` (numbered-list fallback) produces byte-equivalent OBJECTIVES.md output to AskUserQuestion path for the canonical fixture | parity | `node --test tests/brief-define-text-mode-parity.test.cjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Test files to scaffold before task execution begins (Wave 0 or at the start of each wave that introduces them):

- [ ] `tests/brief-objectives-roundtrip.test.cjs` — OBJECTIVES.md frontmatter + body round-trip (DEF-03)
- [ ] `tests/brief-objectives-immutable-lock.test.cjs` — immutable section lock enforcement at writer layer (DEF-03)
- [ ] `tests/brief-define-mode-a.test.cjs` — Mode A Greenfield full flow + Korea-first B2C fixture (DEF-01, DEF-02)
- [ ] `tests/brief-define-mode-b.test.cjs` — Mode B Amendment + `--unlock-intent` (DEF-03)
- [ ] `tests/brief-config-brief-namespace.test.cjs` — config.json `brief.*` namespace round-trip (DEF-04)
- [ ] `tests/brief-define-korea-signal.test.cjs` — Korea-signal detection keyword/language coverage (DEF-04)
- [ ] `tests/brief-define-atomic-commit.test.cjs` — atomic 3-artifact write + rollback (integration)
- [ ] `tests/brief-define-canary.test.cjs` — canary structural assertion (orchestrator-workers verified)
- [ ] `tests/brief-discover-gate.test.cjs` — block-gate entry behavior (DEF-05)
- [ ] `tests/brief-define-stale-anchor.test.cjs` — 48h mtime interrupt + negative scope test (DEF-06)
- [ ] `tests/brief-define-text-mode-parity.test.cjs` — `text_mode` vs `AskUserQuestion` output parity (FND-06 inheritance)
- [ ] `tests/fixtures/korea-b2c-persona.json` — canonical fixture: Korea-first B2C non-developer planner dialogue script

No `npm install` step needed — `node:test` is built-in; `c8` is inherited from Phase 1/2.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Korean conversational register feels natural (not robotic) | DEF-01, DEF-02 | Subjective tone judgment cannot be automated. `node:test` asserts presence of Push-Twice/Language-Precision markers but not *naturalness*. | Planner-executor runs `/brief-define` once in Mode A as the Korea-first B2C fixture user. Subjective sign-off in `/brief-verify-work`. Refinement belongs to Phase 9 HRD-04 pilot loop. |
| Block-gate error message is recovery-oriented (not blame-oriented) | DEF-05 | Tone is subjective; grep-checks can only verify required strings are present. | Manual read of one failing invocation's stderr. Sign-off by user during `/brief-verify-work`. |
| Stale-anchor 3-option interrupt UI is clearly navigable in each runtime (Claude Code, Codex, Gemini, OpenCode) | DEF-06, FND-06 | Terminal rendering differs across runtimes; automated parity test verifies logical output, not rendering. | Manual smoke in each runtime during Phase 3 verify. |

---

## Validation Sign-Off

- [ ] All tasks have automated verify commands or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all test file stubs listed above
- [ ] No watch-mode flags (all commands are single-run, non-blocking)
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter after planner-executor sign-off

**Approval:** pending
