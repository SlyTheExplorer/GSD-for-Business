---
phase: 04-first-gate-align-pattern-established
verified: 2026-04-20T00:00:00Z
status: human_needed
score: 4/4 success criteria verified (automated); 1/4 needs human live-run confirmation
overrides_applied: 0
re_verification: null
gaps: []
deferred: []
human_verification:
  - test: "Run `/brief-define` Mode A end-to-end in a real (non-test) Claude Code session with a Korean-first B2C project"
    expected: "ALIGN gate fires automatically after Step 3 atomic commit; AskUserQuestion or TEXT_MODE numbered-list surface appears on DRIFTED; ALIGN-00.md lands with Korean body; STATE.md frontmatter gains brief.last_gate_results.align; second git commit lands; /brief-status shows Last ALIGN line"
    why_human: "SC #1 requires the orchestrator command to produce an artifact and the gate to run automatically as an explicit step. The full flow includes a real Task subagent spawn (agents/brief-align-gate.md) which is environment-coupled and cannot be automated. Canary tests use a stub llmPass; live subagent emission is human-observable only."
  - test: "Invoke the AskUserQuestion 3-path interrupt in Claude Code AND separately in TEXT_MODE (Codex/Gemini/OpenCode)"
    expected: "Both runtimes render the 3 Korean options verbatim (objective 수정하기 / 이 output이 틀렸다, 다시 쓰기 / 현재 상태 승인, 계속 진행) — AskUserQuestion block in Claude Code; numbered-list 1/2/3 in TEXT_MODE"
    why_human: "FND-06 cross-runtime parity is a runtime UX concern. Static markdown assertion (brief-align-text-mode.test.cjs) verifies the prompt strings + fallback note are present in the workflow file, but actual rendering across 4 runtimes requires live invocation."
  - test: "Force-accept flow end-to-end: pick option 3 on DRIFTED, type a non-empty Korean reason, observe resulting ALIGN-00.md + STATE.md + /brief-status suffix"
    expected: "User reason is sanitized (no zero-width chars, no newline injection) before state write; ALIGN-00.md contains ## User Override section with the reason; /brief-status renders `(override applied)` suffix; commit history preserves the audit trail"
    why_human: "D-07 audit trail requires a live user typing the reason at the AskUserQuestion prompt. Sanitization is covered by unit tests (state-brief-override-roundtrip.test.cjs), but the complete UX loop is human-observable."
---

# Phase 4: First Gate — ALIGN Pattern Established — Verification Report

**Phase Goal:** The ALIGN gate is implemented as the canonical evaluator-optimizer gate pattern: three structured outputs (ALIGNED / DRIFTED-objective-needs-update / DRIFTED-output-needs-revision), findings-not-pass/fail vocabulary, invoked by orchestrator commands as an explicit step (NOT via PostToolUse/SubagentStop hooks). Once this pattern is right, Phase 5 (AUDIENCE) and Phase 7 (COMPLIANCE) replicate it.

**Verified:** 2026-04-20
**Status:** human_needed — all automated must-haves VERIFIED; live `/brief-define` Mode A end-to-end requires human
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria for DSG-12)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Orchestrator command produces artifact → ALIGN runs automatically as explicit step → gate emits one of 3 structured outputs, never binary pass/fail | VERIFIED (code path) + human_needed (live UX) | `brief/workflows/define.md:372` Step 3.5 invokes align-gate.md with CANDIDATE_PATH=BASELINE_PATH=.planning/OBJECTIVES.md; `brief/workflows/align-gate.md:182-184,226-228` renders 3 decisions; `brief/bin/lib/align.cjs:26-30` VALID_DECISIONS locks exactly 3; `tests/brief-align.test.cjs` 10/10 tests cover all 3 decisions + MUST-PASS canary (Pitfall #6 contradiction) at `tests/brief-align.test.cjs:115-160` with explicit assert.fail citing 04-RESEARCH.md Pitfall #6; `tests/brief-align-canary.test.cjs` 5/5 E2E canary tests pass |
| 2 | Any ALIGN gate output file uses findings vocabulary ("Documented obligations addressed:", "Obligations needing further work:"); never "compliant", "passed", or green checkmarks | VERIFIED | `brief/references/align-vocabulary.md:14,24` contains preferred KO + EN vocabulary; ban-list regexes at `brief/bin/lib/align.cjs:37-39` (BAN_EN, BAN_KO, BAN_SYMBOL); `tests/brief-align-vocabulary-lock.test.cjs` 6/6 tests verify emitted ALIGN-00.md (Korean ALIGNED + English ALIGNED + override) + static-file scope (align-vocabulary.md section-containment + agent vocabulary_discipline scope + workflow strictest zero-tokens) — all pass |
| 3 | Gate is visible, mandatory orchestrator step in command markdown; no PostToolUse/SubagentStop hook auto-attaches | VERIFIED | `brief/workflows/align-gate.md:315-336` `<no_hooks_assertion>` block present; `commands/brief/define.md:22` references align-gate.md in execution_context; `commands/brief/define.md:26` process narrative explicitly names the Step 3.5 invocation; `hooks/` contains zero `align` references (grep verified); `agents/brief-align-gate.md` frontmatter (lines 1-6) has no `hooks:` key; `tests/brief-align-no-hook.test.cjs` 4/4 tests pass (hooks/ recursive grep + Surface Caps no-command + workflow visibility + agent frontmatter live-hooks absence); `tests/brief-align-text-mode.test.cjs:42-52` asserts no_hooks_assertion block + load-bearing phrasing |
| 4 | STATE.md `state.brief.last_gate_results.align` records severity, findings count, and decision | VERIFIED (write-path) + human_needed (populated on first live run) | `brief/bin/lib/align.cjs:347-364` `commitAlignVerdict` writes via `readModifyWriteStateMd` atomically with `{decision, severity, findings_count, at, override?, override_reason?}`; `brief/bin/lib/status.cjs:33-36` `formatGate` renders Last ALIGN line with `(override applied)` suffix when override=true OR string 'true' (Pitfall #5 guard); `tests/state-brief-override-roundtrip.test.cjs` 23/23 tests cover D-20 boolean round-trip + override sanitization + override_reason survival + CLI path-traversal boundary; `tests/brief-align-canary.test.cjs:41-70` asserts full E2E STATE.md shape post-commit |

**Score:** 4/4 truths VERIFIED at code/test level. 1 of 4 additionally has live-UX component needing human confirmation (SC #1 — real Task subagent spawn).

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `brief/bin/lib/align.cjs` | ≤400 lines, ≥6 primitives | VERIFIED | 390 lines (wc -l); exports 10+ symbols: VALID_DECISIONS, VALID_SEVERITIES, BAN_EN/KO/SYMBOL, validateVerdict, grepBanList, computeTermOverlap, detectKoreaSignalFromConfig, runDeterministicScreen, writeVerdict, mergeVerdicts, runAlign, renderAlignReport, commitAlignVerdict, _resolveSafePath (private, line 316-323) |
| `brief/bin/lib/align-report.cjs` | Sibling file per Plan 04-04 escape hatch | VERIFIED | 63 lines; exports renderAlignReport; imported by align.cjs:23 |
| `brief/references/align-vocabulary.md` | Ban-list + preferred phrasings in KO + EN | VERIFIED | 57 lines; sections: Preferred KO (line 11-19), Preferred EN (line 21-29), Ban-list EN (line 31-37), Ban-list KO (line 39-43), Ban-list symbols (line 45-48) |
| `agents/brief-align-gate.md` | Tool allowlist `Read, Grep, Glob, Write`; `<candidate>` delimiter; no hooks | VERIFIED | Line 2 `name: brief-align-gate`; line 4 `tools: Read, Grep, Glob, Write`; line 5 `color: orange`; no `hooks:` key; 18 occurrences of templated placeholders (CANDIDATE_PATH, BASELINE_PATH, VERDICT_OUT_PATH, KOREA_LANGUAGE, DETERMINISTIC_FINDINGS); `<candidate>` / `<baseline>` delimiter discipline present (T-04-07) |
| `brief/workflows/align-gate.md` | 6 verbatim Korean 3-path strings; templated placeholders; no_hooks_assertion | VERIFIED | 6 Korean strings verified at lines 182-184 (Step 5A: objective 수정하기 / 이 output이 틀렸다, 다시 쓰기 / 현재 상태 승인, 계속 진행) and 226-228 (Step 5B: output 다시 쓰기 / output을 수동으로 편집 / 현재 상태 승인, 계속 진행); 17 occurrences of `{{CANDIDATE_PATH/BASELINE_PATH/VERDICT_OUT_PATH}}`; `<no_hooks_assertion>` block at line 315-336 |
| `brief/workflows/define.md` Step 3.5 | Positioned between Step 3 and Step 4 | VERIFIED | Step 3 at line 352, Step 3.5 at line 372, Step 4 at line 420; `tests/brief-align-canary.test.cjs` Test 5 asserts Step3 < Step3.5 < Step4 positional |
| `commands/brief/define.md` | `name: brief:define` (colon form preserved); align-gate referenced | VERIFIED | Line 2 `name: brief:define`; lines 22 + 26 reference align-gate workflow; allowed-tools now includes Task per Plan 04-05 |
| `brief/bin/brief-tools.cjs` `case 'align':` | Try/catch in both `run` and `commit` branches | VERIFIED | Dispatcher block at lines 486-556; try/catch at lines 510-530 (run branch) and 541-550 (commit branch); both forward err.message through `error()` to prevent Node stack-trace path leakage (Test 10 mitigation) |
| `brief/bin/lib/status.cjs` `formatGate` override | Renders `(override applied)` suffix | VERIFIED | Line 33-36: `const override = gate.override === true \|\| gate.override === 'true'; const suffix = override ? ' (override applied)' : '';` (Pitfall #5 guard for D-20 boolean round-trip) |
| 7 test files | `brief-align.test.cjs`, `brief-align-primitives.test.cjs`, `brief-align-canary.test.cjs`, `state-brief-override-roundtrip.test.cjs`, `brief-align-vocabulary-lock.test.cjs`, `brief-align-text-mode.test.cjs`, `brief-align-no-hook.test.cjs` | VERIFIED | All 7 present; 73/73 tests pass in 490ms |
| 4 fixture files | `align-aligned-baseline.md`, `align-drifted-objective-missing-required.md`, `align-drifted-objective-contradiction.md`, `align-drifted-output-zero-overlap.md` | VERIFIED | All 4 present under tests/fixtures/; contradiction fixture contains both "직원 1,000명 이상" and "Apple App Store" (MUST-PASS Pitfall #6 anchor) |
| `.gitignore` entry | `.planning/.align-verdict.tmp.json` | VERIFIED | Line 71: `.planning/.align-verdict.tmp.json` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `brief/workflows/define.md` Step 3.5 | `brief/workflows/align-gate.md` | Explicit invocation block with CANDIDATE/BASELINE/VERDICT_OUT paths | WIRED | Line 383-386 names all 3 parameters verbatim |
| `brief/workflows/align-gate.md` | `brief/bin/lib/align.cjs` | `brief-tools.cjs align run`/`commit` CLI | WIRED | brief-tools.cjs:486-556 dispatcher; workflow Step 1 + Step 4 reference the CLI commands |
| `brief/workflows/align-gate.md` | `agents/brief-align-gate.md` | Task tool spawn with templated placeholders | WIRED | Step 2 spawn block references agents/brief-align-gate.md by name + interpolates all 5 placeholders |
| `agents/brief-align-gate.md` | `brief/references/align-vocabulary.md` | `required_reading` block | WIRED | Agent `<required_reading>` section includes `brief/references/align-vocabulary.md` |
| `brief/bin/lib/align.cjs` commitAlignVerdict | `brief/bin/lib/state.cjs` readModifyWriteStateMd | Atomic state write (file-lock) | WIRED | align.cjs:349 calls readModifyWriteStateMd with transform fn |
| `brief/bin/lib/align.cjs` commitAlignVerdict | `brief/bin/lib/security.cjs` sanitizeForPrompt | override_reason sanitization before state write | WIRED | align.cjs:16 imports sanitizeForPrompt; align.cjs:335 calls before state write |
| `brief/bin/lib/align.cjs` | `brief/bin/lib/align-report.cjs` | renderAlignReport import | WIRED | align.cjs:23 requires sibling; called at line 343 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| ALIGN-00.md (rendered by commitAlignVerdict) | verdict | Read from verdictPath (.planning/.align-verdict.tmp.json) written by runAlign → written by runDeterministicScreen + LLM pass | YES (deterministic: objectives.cjs validateObjectivesComplete + computeTermOverlap + grepBanList; LLM: Task-spawn into real agent in production, stub llmPass in tests) | FLOWING |
| STATE.md brief.last_gate_results.align | verdict frontmatter fields | commitAlignVerdict transforms FM via readModifyWriteStateMd | YES (real verdict object with decision/severity/findings_count/at populated) | FLOWING |
| /brief-status Last ALIGN line | gate.{decision, findings_count, override} | status.cjs formatGate reads state.brief.last_gate_results.align | YES (direct frontmatter read; verified by state-brief-override-roundtrip.test.cjs:24-tests) | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 73 Phase 4 ALIGN tests pass | `node --test tests/brief-align*.test.cjs tests/state-brief-override-roundtrip.test.cjs` | 73 pass / 0 fail / 490ms | PASS |
| Zero runtime deps | `node -e "console.log(Object.keys(require('./package.json').dependencies\|\|{}).length)"` | 0 | PASS |
| align.cjs under 400-line cap | `wc -l brief/bin/lib/align.cjs` | 390 | PASS |
| No align references in hooks/ | `Grep align hooks/` | No matches found | PASS |
| Surface Caps preserved | `ls commands/brief/*.md \| wc -l` | 64 (unchanged from Phase 3 post-state) | PASS |
| No user-facing align commands | `ls commands/brief/align*.md` | No matches (glob fails) | PASS |
| Agent loads without error | `node -e "require('./brief/bin/lib/align.cjs')"` | Exits 0 | PASS |
| Full npm test baseline delta | `npm test` | 3804 tests / 3760 pass / 44 fail (vs 63 baseline = **−19 improvement**) | PASS (no regression, net improvement) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DSG-12 | All 6 Phase 4 plans | User obtains a Continuous ALIGN gate output after every workstream artifact, with three possible outputs: ALIGNED, DRIFTED-objective, DRIFTED-output | SATISFIED | 4 ROADMAP Success Criteria all verified (see Observable Truths table); 04-06-COVERAGE.md maps each SC to locking test(s); 73 tests cover every decision path + state shape + vocabulary discipline + no-hook structural invariant |

No orphaned requirements. DSG-12 is the only Phase 4 requirement per REQUIREMENTS.md line 232 ("Phase 4 (ALIGN First Gate) | DSG-12 | 1").

### Anti-Patterns Found

None. All anti-pattern scans clean:
- No TODO/FIXME/placeholder markers added by Phase 4 in new files.
- No empty implementations (all exported functions have real bodies).
- No hardcoded empty returns; deterministic screen returns live findings arrays; LLM pass stubs only in tests.
- No `✅/✓/✗` symbols in production code or rendered output (the ban-list test `brief-align-vocabulary-lock.test.cjs` Test 6 enforces zero tokens anywhere in workflow markdown; source cleanse in Plan 04-06 removed creep sites at `agents/brief-align-gate.md:40,177` and `brief/workflows/align-gate.md:39,289,325`).
- 2 pre-existing `tests/agent-frontmatter.test.cjs` failures on `brief-align-gate` (missing anti-heredoc instruction, missing commented `# hooks:` pattern) are **NOT Phase 4 regressions** — these are inherited Phase 1-3 convention patterns flagged in Plan 04-06 SUMMARY + 04-06-COVERAGE.md for Phase 9 HRD-05 retrofit. The full npm test baseline went from 63 → 44 failures across Phase 4 (−19 improvement), confirming no new regressions.

### Human Verification Required

3 items need live session confirmation (full canary flow with real Task subagent, cross-runtime UX, force-accept audit trail):

#### 1. Live `/brief-define` Mode A end-to-end

**Test:** In a real (non-test) Claude Code session, run `/brief-define` Mode A on a Korean-first B2C project from scratch. Complete the Mode A approval steps through Step 3 atomic commit. Observe what happens next.
**Expected:** Step 3.5 fires automatically; orchestrator spawns `agents/brief-align-gate.md` via Task with templated params; subagent reads OBJECTIVES.md + align-vocabulary.md; writes JSON verdict to `.planning/.align-verdict.tmp.json`; workflow reads verdict back; on ALIGNED: `brief-tools align commit` writes `.planning/ALIGN-00.md` in Korean body; STATE.md frontmatter gains `brief.last_gate_results.align.{decision, severity, findings_count, at}`; second git commit lands with message starting `feat(04): ALIGN gate — <decision>`; `/brief-status` displays `Last ALIGN  ALIGNED (0 findings)`.
**Why human:** Task subagent spawn is environment-coupled. Canary test (`tests/brief-align-canary.test.cjs`) uses a stub `llmPass`; live emission of verdict JSON by the real subagent and the surrounding atomic-commit + state-write pipeline is human-observable only.

#### 2. TEXT_MODE parity across runtimes

**Test:** Invoke Step 5A/5B 3-path interrupt flow separately in Claude Code (AskUserQuestion native) and in Codex / Gemini / OpenCode (TEXT_MODE fallback). Verify the 6 Korean strings render correctly.
**Expected:** Claude Code renders `<askuserquestion>` block with 3 `<option>` children. Other 3 runtimes render a numbered list (1/2/3) with the same 3 Korean strings and prompt for typed choice number.
**Why human:** FND-06 cross-runtime parity is a runtime-rendering concern. Static markdown assertion in `tests/brief-align-text-mode.test.cjs` Tests 1-2 verifies the prompt strings + TEXT_MODE fallback note are present in the file; actual rendering fidelity across 4 runtimes requires live invocation.

#### 3. Force-accept audit trail full loop

**Test:** On a DRIFTED verdict, pick option 3 (현재 상태 승인, 계속 진행). Type a Korean reason that includes a zero-width space + newline payload (adversarial prompt-injection simulation). Observe the resulting ALIGN-00.md + STATE.md + /brief-status.
**Expected:** sanitizeForPrompt strips zero-width + newline-injection markers; STATE.md `brief.last_gate_results.align.override_reason` contains only the sanitized text; ALIGN-00.md `## User Override` section renders the sanitized text; `/brief-status` shows `ALIGNED (N findings) (override applied)` suffix.
**Why human:** D-07 audit trail requires a live user typing at AskUserQuestion / TEXT_MODE prompt. Sanitization covered by unit tests (`state-brief-override-roundtrip.test.cjs` 23 tests); full UX loop (Step 6 capture → re-prompt on empty → sanitize → state write → ALIGN-00.md render → git commit → status render) is human-observable.

### Gaps Summary

No automated gaps. All 4 ROADMAP Success Criteria are verifiable in code + tests at the automated level:

- **SC #1** (3 outputs, never binary pass/fail): `brief/bin/lib/align.cjs:26-30` VALID_DECISIONS locks exactly 3; `brief-align.test.cjs` 10 tests cover all 3; Pitfall #6 MUST-PASS canary with explicit `assert.fail` citing 04-RESEARCH.md at `tests/brief-align.test.cjs:150-156` verifies the hybrid evaluator detects Immutable B2B + Mutable consumer contradiction.
- **SC #2** (findings vocabulary, no compliant/passed/✅): `brief/references/align-vocabulary.md` + regex enforcement at `align.cjs:37-39`; `brief-align-vocabulary-lock.test.cjs` 6 tests (3 emit + 3 static-source) all pass.
- **SC #3** (orchestrator-visible, no hook): `<no_hooks_assertion>` block + 4 structural tests (`brief-align-no-hook.test.cjs` 4 tests) + text-mode Test 4. Zero `align` references in `hooks/`.
- **SC #4** (STATE.md state.brief.last_gate_results.align populated): write path via `commitAlignVerdict` + `readModifyWriteStateMd` + D-20 boolean round-trip with Pitfall #5 guard; 23 round-trip tests.

All 11 locked decisions (D-01..D-11) honored. All 4 Wave 0 VALIDATION.md test-file gaps closed. All 4 fixture files present with exact required content. .gitignore entry present. Zero runtime deps preserved. align.cjs at 390/400 lines (sibling-file escape hatch used for renderAlignReport). Surface Caps preserved at 64 commands/brief/*.md (unchanged from Phase 3 exit).

The 3 human_verification items above are required because SC #1 explicitly reads "orchestrator command produces artifact → gate runs automatically" — the live orchestrator flow involves real Task subagent emission that cannot be simulated in `node:test`. Canary tests (`brief-align-canary.test.cjs`) cover the full in-process pipeline (runAlign + commitAlignVerdict + state write + status render) using a stub llmPass; the only component not automatically verified is the actual Task tool spawn emitting verdict JSON in a live runtime.

---

_Verified: 2026-04-20_
_Verifier: Claude (gsd-verifier)_
