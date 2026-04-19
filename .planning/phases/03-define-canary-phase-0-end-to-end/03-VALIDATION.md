---
phase: 03
slug: define-canary-phase-0-end-to-end
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-19
planner_filled: 2026-04-19
executor_finalized: 2026-04-19
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source: 03-RESEARCH.md §Validation Architecture. Filled during `/brief-plan-phase` 2026-04-19; revised 2026-04-19 after checker feedback (B-4 wave cascade: Plan 04→wave 4, Plan 05→wave 5, Plan 06→wave 6).
> `status: planned` = Per-Task Verification Map rows and Wave 0 list frozen; `wave_0_complete: true` is set by Plan 06 Task 2 after final regression.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (built-in) + `c8` coverage (70% line threshold) |
| **Config file** | None — run via `scripts/run-tests.cjs` |
| **Quick run command** | `node --test tests/brief-define-*.test.cjs tests/brief-objectives-*.test.cjs tests/brief-discover-gate.test.cjs tests/brief-config-brief-namespace.test.cjs` |
| **Full suite command** | `npm test` (invokes `node scripts/run-tests.cjs`) |
| **Estimated runtime** | Quick ~3–8s · Full ~15–30s |

---

## Sampling Rate

- **After every task commit:** Run the quick run command (Phase-3-scoped test files only).
- **After every plan wave:** Run `npm test` (full suite; ensures no Phase 1/2 regression).
- **Before `/brief-verify-work`:** Full suite must be green + c8 line coverage ≥70%.
- **Max feedback latency:** 30 seconds.

---

## Per-Task Verification Map

_Filled by planner 2026-04-19. Task IDs match `<task>` elements in the six Phase-3 PLAN.md files (01..06). Every requirement DEF-01..DEF-06 appears at least once. Wave column updated 2026-04-19 per checker B-4 serialization fix: Plans 03 and 04 both modify `brief/bin/lib/define.cjs` module.exports, so Plan 04 is now wave 4 (depends_on: 03-02 + 03-03); Plans 05/06 cascade to waves 5/6._

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | DEF-03 | T-03-02 | objectives.cjs skeleton + RED roundtrip + RED immutable-lock tests + canonical fixture JSON exist + W-3 verbatim Korean strings present in fixture | unit (scaffold) | `node --test tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs` (RED baseline expected) | ❌ W0 | ✅ green |
| 03-01-02 | 01 | 1 | DEF-03 | T-03-01 | 5 primitives implemented; RED tests turn GREEN; writer-layer immutable lock refuses mutation without `--unlock-intent`; `--unlock-intent` permits it | unit | `node --test tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-02-01 | 02 | 2 | DEF-01, DEF-02 | T-03-04 | Mode A smoke (Cycle 1) GREEN via fixture path — OBJECTIVES.md written with Push-Twice core-value + Language-Precision audience + Dream-State × 3 body sections + verbatim Korean fixture text | integration | `node --test tests/brief-define-mode-a.test.cjs` | ❌ W0 → ✅ (Cycle 1) | ✅ green |
| 03-02-02 | 02 | 2 | DEF-01, DEF-02 | T-03-05 | commands/brief/define.md + brief/workflows/define.md authored with TEXT_MODE sentinel + Korean prompts; docs/ARCHITECTURE.md counts bumped; no `[Push Twice]` visible label | structural | `node --test tests/ask-user-questions-fallback.test.cjs tests/architecture-counts.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-03-01 | 03 | 3 | DEF-03 | T-03-06 | Mode B amendment refuses immutable mutation without --unlock-intent; Korean error contains /Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다/; applyModeBAmendment audit-log appended on unlock-triggered mutation | integration | `node --test tests/brief-define-mode-b.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-03-02 | 03 | 3 | DEF-03 | T-03-08 | Mode B UI layer shows immutable items with 🔒 marker + picker-header 🔒 reinforcement (W-5); D-07 lock footer verbatim; `--unlock-intent` referenced 3+ times | structural | `grep "🔒" brief/workflows/define.md` emits ≥4 + `grep "🔒 어느 부분을 다시 보시겠어요"` + `grep "immutable 섹션은 잠겨있습니다"` + regression `node --test tests/brief-define-mode-a.test.cjs tests/brief-define-mode-b.test.cjs tests/ask-user-questions-fallback.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-04-01 | 04 | 4 | DEF-04 | T-03-09 | tests/helpers.cjs extended with createTempProjectWithConfig + createTempGitProjectWithConfig (B-2/B-3 centralized config seed); non-Korea fixture exists (B-6 negative); Korea-signal detection covers Hangul + English keywords (Korea/KR/Seoul/won/PIPA/ISMS/MyData) + Korean company names (핀테크/카카오/네이버/토스); false-positive guard asserts non-Korea English transcript returns false | unit | `node --test tests/brief-define-korea-signal.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-04-02 | 04 | 4 | DEF-04 | T-03-09 | writeConfigBrief merges `brief.*` namespace into config.json preserving model_profile/workflow/mode/granularity (verified against createTempProjectWithConfig seed); second call overwrites compliance_packs but preserves earlier business_model/region/audience_policy; empty seed produces only brief.* key | unit | `node --test tests/brief-config-brief-namespace.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-04-03 | 04 | 4 | DEF-04, DEF-01..DEF-06 | T-03-10 | Atomic 3-artifact commit (OBJECTIVES.md + config.json + STATE.md) verified by direct `execFileSync('git', ['log','-1','--name-only'])` — B-1 fix (no runGsdTools shell dispatcher); rollback primary path (W-2 deterministic stub-throw of writeConfigBrief) leaves OBJECTIVES.md absent from working tree AND no DEFINE commit on HEAD; B-6 Cycle 5 non-Korea fixture yields compliance_packs: [] | integration | `node --test tests/brief-define-atomic-commit.test.cjs tests/brief-define-mode-a.test.cjs` (Cycles 2+3+4+5) | ❌ W0 → ✅ | ✅ green |
| 03-04-04 | 04 | 4 | — (canary) | — | Canary structural: commands/brief/define.md refs brief/workflows/define.md; brief-tools.cjs contains `case 'define'` + `require('./lib/define.cjs')`; objectives.cjs exports 5 primitives; define.cjs exports 6 primitives (cmdDefineApply, applyFromFixture, detectKoreaSignals, writeConfigBrief, performAtomicCommit, applyModeBAmendment) | structural | `node --test tests/brief-define-canary.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-05-01 | 05 | 5 | DEF-05 | T-03-11 | `/brief-discover` on incomplete OBJECTIVES.md exits non-zero with Pitfall 5 Korean block-gate — ⚠ glyph + missing field name (e.g. compliance_packs) + `/brief-define --amend` recovery command + `지금 쓰신 내용은 그대로 남아있습니다` reassurance + NO `ERROR:` dev-terminology + NO Python-list-syntax brackets + **W-6 NO English `validation failed` in stderr (silent process.exit(1))** | integration | `node --test tests/brief-discover-gate.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-05-02 | 05 | 5 | DEF-05 | T-03-12, T-03-15 | Complete OBJECTIVES.md → /brief-discover exits 0 + Phase 5 placeholder message emitted; missing-file path emits distinct `OBJECTIVES.md 파일이 아직 없습니다` Korean message with `/brief-define` start hint; W-6 guard on both paths | integration | `node --test tests/brief-discover-gate.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-05-03 | 05 | 5 | DEF-05 | — | commands/brief/discover.md + brief/workflows/discover.md stubs exist with TEXT_MODE sentinel + block-gate message snippet + Phase 5 placeholder line; docs/ARCHITECTURE.md count bumps (+1 command / +1 workflow) | structural | `node --test tests/architecture-counts.test.cjs tests/ask-user-questions-fallback.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-06-01 | 06 | 6 | DEF-06 | T-03-13 | Stale-anchor positive: OBJECTIVES.md mtime >48h + `/brief-discover` entry → 3-option Korean prompt surfaced (잠시 검토에 / 현재 OBJECTIVES를 보고 맞으면 승인 / 이제 승인, 빠르게 진행) + 48시간 threshold mentioned + **W-8 ordering: prompt idx < Phase 5 placeholder idx in combined output** | integration | `node --test tests/brief-define-stale-anchor.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-06-02 | 06 | 6 | DEF-06 | T-03-13 | Stale-anchor negative: 49h-stale + `/brief-status` invocation does NOT surface `잠시 검토에` (Pitfall 6 guard); fresh OBJECTIVES.md + `/brief-discover` does NOT surface `잠시 검토에`; shouldStaleAnchorFire returns fire:false for entry points status-entry/help-entry/mid-workflow; W-1 scaffolded-but-not-wired comment present for phase-entry/milestone-entry | integration + unit | `node --test tests/brief-define-stale-anchor.test.cjs` + `grep "scaffolded" brief/bin/lib/define.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-06-03 | 06 | 6 | DEF-01..DEF-06 (FND-06 flowdown) | — | text_mode=true (via workflow.text_mode seeded in config.json) produces byte-equivalent OBJECTIVES.md to AskUserQuestion mode for the canonical Korea-first B2C fixture, after ISO-timestamp normalization | parity | `node --test tests/brief-define-text-mode-parity.test.cjs` | ❌ W0 → ✅ | ✅ green |
| 03-06-04 | 06 | 6 | DEF-06 | — | brief/workflows/discover.md Step 2 stale-anchor filled in (no more `→ Plan 06 fills in` stub); brief/workflows/define.md Step 0.5 stale-anchor hook on --amend entry; both files contain 3 D-13 option strings + `48시간`; brief/bin/brief-tools.cjs case 'discover' invokes shouldStaleAnchorFire (B-5 — file now in Plan 06 files_modified) | structural | `grep "잠시 검토에" brief/workflows/discover.md brief/workflows/define.md` returns matches in BOTH files; `grep "→ Plan 06 fills in" brief/workflows/discover.md` returns NOTHING; `grep "shouldStaleAnchorFire" brief/bin/brief-tools.cjs` returns ≥ 1 | ❌ W0 → ✅ | ✅ green |

*Status: ✅ green · ✅ green · ❌ red · ⚠️ flaky*

**Sampling continuity check:** Each plan has automated verify at minimum every 2 tasks. No 3-task gap without automated verify anywhere in the map. Full-plan regression commands appear on every plan's final task.

---

## Wave 0 Requirements

Test files + fixtures to scaffold before/during task execution. The ❌ → ✅ transition per row in the map above tracks Wave 0 completion for each file. All 14 items (12 originals + 2 added by the post-checker revision: helpers.cjs extension + non-Korea fixture) are scaffolded across Plans 01–06; frontmatter `wave_0_complete: true` is flipped by Plan 06 Task 2 after final regression.

- [x] `tests/fixtures/korea-b2c-persona.json` — canonical fixture (Korea-first B2C non-developer planner dialogue script) — **Plan 01 Task 1**
- [x] `tests/fixtures/non-korea-b2b-persona.json` — thin B-6 negative fixture (non-Korea B2B SaaS persona; compliance_packs expected: []) — **Plan 04 Task 1**
- [x] `tests/helpers.cjs` EXTENSION — add `createTempProjectWithConfig` + `createTempGitProjectWithConfig` helpers that seed baseline config.json (B-2/B-3 centralization) — **Plan 04 Task 1 Step 0**
- [x] `tests/brief-objectives-roundtrip.test.cjs` — OBJECTIVES.md frontmatter + body round-trip (DEF-03) — **Plan 01 Task 1 (RED) → Task 2 (GREEN)**
- [x] `tests/brief-objectives-immutable-lock.test.cjs` — immutable section lock enforcement at writer layer (DEF-03) — **Plan 01 Task 1 (RED) → Task 2 (GREEN)**
- [x] `tests/brief-define-mode-a.test.cjs` — Mode A Greenfield full flow + Korea-first B2C fixture (DEF-01, DEF-02) — **Plan 02 Task 1 (Cycle 1) → Plan 04 Task 2 (Cycles 2+3+4+5, including B-6 negative Cycle 5)**
- [x] `tests/brief-define-mode-b.test.cjs` — Mode B Amendment + `--unlock-intent` (DEF-03) — **Plan 03 Task 1**
- [x] `tests/brief-define-korea-signal.test.cjs` — Korea-signal detection keyword/language coverage (DEF-04) — **Plan 04 Task 1**
- [x] `tests/brief-config-brief-namespace.test.cjs` — config.json `brief.*` namespace round-trip (DEF-04) — **Plan 04 Task 1**
- [x] `tests/brief-define-atomic-commit.test.cjs` — atomic 3-artifact write + W-2 deterministic stub-throw rollback (integration) — **Plan 04 Task 2**
- [x] `tests/brief-define-canary.test.cjs` — canary structural assertion (orchestrator-workers verified) — **Plan 04 Task 2**
- [x] `tests/brief-discover-gate.test.cjs` — block-gate entry behavior (DEF-05) — **Plan 05 Task 1**
- [x] `tests/brief-define-stale-anchor.test.cjs` — 48h mtime interrupt + negative scope test + W-8 ordering assertion (DEF-06) — **Plan 06 Task 1**
- [x] `tests/brief-define-text-mode-parity.test.cjs` — `text_mode` vs `AskUserQuestion` output parity (FND-06 inheritance) — **Plan 06 Task 1**

No `npm install` step needed — `node:test` is built-in; `c8` is inherited from Phase 1/2.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Korean conversational register feels natural (not robotic) | DEF-01, DEF-02 | Subjective tone judgment cannot be automated. `node:test` asserts presence of Push-Twice/Language-Precision markers but not *naturalness*. | Planner-executor runs `/brief-define` once in Mode A as the Korea-first B2C fixture user. Subjective sign-off in `/brief-verify-work`. Refinement belongs to Phase 9 HRD-04 pilot loop. |
| Block-gate error message is recovery-oriented (not blame-oriented) | DEF-05 | Tone is subjective; grep-checks can only verify required strings are present. | Manual read of one failing invocation's stderr. Sign-off by user during `/brief-verify-work`. |
| Stale-anchor 3-option interrupt UI is clearly navigable in each runtime (Claude Code, Codex, Gemini, OpenCode) | DEF-06, FND-06 | Terminal rendering differs across runtimes; automated parity test verifies logical output, not rendering. | Manual smoke in each runtime during Phase 3 verify. |
| Mode B `🔒` marker renders visibly in all 4 runtimes | DEF-03 | Emoji/Unicode rendering varies by runtime. Canary tests assert string presence, not visual rendering. | Manual smoke in each runtime; note in 03-VERIFICATION.md if any runtime strips the marker. |

---

## Validation Sign-Off

- [x] All tasks have automated verify commands or Wave 0 dependencies (every row in the Per-Task Verification Map has an `Automated Command`)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (every plan has automated verify at minimum every other task)
- [x] Wave 0 covers all test file stubs listed above (14 items tracked, each mapped to the plan+task that scaffolds it — incl. helpers.cjs extension + non-Korea fixture added by revision)
- [x] No watch-mode flags (all commands are single-run, non-blocking — no `--watch`, no `--inspect`)
- [x] Feedback latency < 30s (quick-run command ~3–8s)
- [x] `nyquist_compliant: true` set in frontmatter — set by planner, confirmed by Plan 06 Task 2

**Approval:** planner-approved 2026-04-19; revised 2026-04-19 after checker feedback (B-1/B-2/B-3/B-4/B-5/B-6 fixes + W-1/W-2/W-3/W-4/W-5/W-6/W-7/W-8 updates); executor to flip `wave_0_complete` after Plan 06 regression.
