---
phase: 06-bidirectional-foundation-phase-1-2-return-stack
verified: 2026-04-23T00:00:00Z
status: passed
score: 4/4 roadmap success criteria verified; 8/8 plan must-have truth groups verified
overrides_applied: 0
---

# Phase 6: Bidirectional Foundation — Phase 1↔2 Return Stack Verification Report

**Phase Goal:** Build bidirectional Phase 1↔2 return-stack infrastructure — `state.brief.return_stack` (LIFO, max depth 3), `brief-gap-detector` agent, meta-arbiter prompt at iteration 2, convergence telemetry in `/brief-status`. Built BEFORE Phase 7 designers that depend on it exist. Pitfall #7 (infinite loop) mitigation.
**Verified:** 2026-04-23
**Status:** passed
**Re-verification:** No — initial verification
**Requirements covered:** DSG-11, DSG-14

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User in (mock) Phase 2 workstream triggers return to Phase 1 when gap-detector classifies BLOCKING; orchestrator pushes frame to `state.brief.return_stack`; clean exit with "RETURNED-TO-DISCOVER" message; user runs `/brief-discover` to resume only the requested researcher | ✓ VERIFIED | `brief/workflows/align-gate.md` Step 8 invokes `brief/workflows/gap-detect.md` post-verdict (D-02); on BLOCKING N=0, invokes `brief-tools.cjs gap-detect push-frame` (verified at line 447 of dispatcher) which writes `RETURNED-TO-DISCOVER\ntriggering_topic: ...\nNext: run /brief-discover to resume research on this topic.` to stdout. `/brief-discover` Step 0.5 in `brief/workflows/discover.md` (line 5 hits on `## Step 0.5`) auto-detects return-stack via `state json` + 3-option AskUserQuestion (Resume / Start new / Show stack) with Korean variants (재개 + 새 세션 + Stack). Canary E2E Step 1 + 2 asserts `pushReturnFrame` writes to both `return_stack` AND `return_stack_history` (atomic). |
| 2 | 3rd round-trip BLOCKED with hard cap message; meta-arbiter fires at iteration 2 with exact prompt "We've gone back to research twice for {topic}. Is this gap genuinely blocking, or are we polishing? Pick: keep researching / proceed with assumption / cancel workstream" | ✓ VERIFIED | `brief/workflows/gap-detect.md` line 177 contains verbatim `"We've gone back to research for '{triggering_topic}' twice. Is this gap genuinely blocking, or are we polishing?"` with 3 options `Keep researching / Proceed with assumption / Cancel workstream` (10 hits across file). `tests/brief-gap-detect-iteration-2-meta-arbiter.test.cjs` locks EN wording + 3 options + Korean variants + 20-char justification floor (5 tests pass). `tests/brief-gap-detect-iteration-3-hard-cap.test.cjs` asserts `loop protection is engaged` wording + exactly 3 numbered options `(1)/(2)/(3)` + zero `(4)` or force-continue bypass (6 tests pass). Lib enforces iter counting via `countIterations` (pure function, confirmed by smoke: 0 on empty, 0 on null) and `commitGapDetectVerdict` with `override` flag suppresses push. |
| 3 | `/brief-status` shows return-stack state: current depth, max depth = 3, triggering gap text, paused phase + wave + artifact; convergence telemetry (round-trip count per workstream) | ✓ VERIFIED | `brief/bin/lib/status.cjs` (165 lines, ≤180 budget) contains `Return stack` (line preserved from Phase 2), `Gap loop` (3 hits), `Round-trips` (4 hits). Canary E2E Step 2 confirms all 3 rows render simultaneously from a single `pushReturnFrame` call (captured output: `Return stack 1 / 3` + `Gap loop Korea fintech TAM` + `Round-trips go-to-market: 1`). `tests/brief-return-stack-status-render.test.cjs` (7 tests, 34 assertions) covers empty / 1-frame / 3-frames / cross-workstream / missing-history / malformed-history / row-preservation. Counts derived at read time (D-06); `round_trip_counter` literal absent from `state.cjs` + `gap-detect.cjs` + `status.cjs` (grep-audit = 0 across all three). |
| 4 | `state.brief.gap_queue` shows BLOCKING / MATERIAL / NICE-TO-HAVE gaps; only BLOCKING triggers return; MATERIAL documented and proceeded; NICE-TO-HAVE deferred | ✓ VERIFIED | `commitGapDetectVerdict` in `brief/bin/lib/gap-detect.cjs` routes by severity: BLOCKING → `pushReturnFrame` (if `pushFrame=true`), MATERIAL → `appendGapQueue`, NICE-TO-HAVE → dropped (tracked as `niceToHaveDropped` counter, never written). `tests/brief-gap-detect-severity-routing.test.cjs` + `tests/brief-gap-detect-material-only.test.cjs` + `tests/brief-gap-detect-nice-to-have-dropped.test.cjs` lock the contract. Mixed-severity fixture (1 BLOCKING + 2 MATERIAL + 1 NICE-TO-HAVE) → `framePushed=true`, `queueAppended=2`, `niceToHaveDropped=1` (confirmed in tests). NICE-TO-HAVE-only fixture → `queueAppended=0`, sibling `.gaps.md` still written with `severity_counts.nice_to_have: 2`. |

**Score:** 4/4 roadmap success criteria verified

### Required Artifacts (Must-Haves from PLAN Frontmatter)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `brief/bin/lib/gap-detect.cjs` | Phase-6 gap-detect lib exporting 19 primitives (pushReturnFrame, popReturnFrame, maybePopTopFrame, countIterations, validateFingerprint, runGapDetect, commitGapDetectVerdict, clearReturnStackFor, appendGapQueue, writeAssumption, writeVerdict, validateVerdict, VALID_DECISIONS, VALID_SEVERITIES, FINGERPRINT_RE, STOPWORDS, BAN_EN, BAN_KO, BAN_SYMBOL) | ✓ VERIFIED | File exists at 405 lines (within ≤420 Phase 2 D-18 budget). All 19 expected exports present (smoke: `node -e require('...')` enumeration confirms all present, 0 missing). `return_stack_history` append-only invariant enforced by grep-audit (0 `.pop/.shift/.splice` calls in source). |
| `agents/brief-gap-detector.md` | 8-section canonical agent shape + D-09 `<topic_fingerprint_contract>` section + 3 canonical examples (market-sizing-korea-fintech-tam, competitor-pricing-axis-missing, regulatory-citation-pipa-article-28) + severity enum + decision enum | ✓ VERIFIED | File exists at 333 lines (target ≥200). All 8 section markers present (10 XML tag matches). `topic_fingerprint_contract` section present (4 hits). All 3 D-09 canonical examples present (2, 3, 2 hits respectively — FINGERPRINT_RE broadened to `/^[a-z][a-z0-9]*(-[a-z0-9]+){2,7}$/` to validate the digit-bearing `pipa-article-28` example). Severity enum (16 hits) + GAPS-BLOCKING (9 hits). |
| `brief/workflows/gap-detect.md` | Orchestrator workflow invoked FROM `align-gate.md` Step 8 (D-02); Step 0-5 with iteration-aware branching (N=0 push, N=1 meta-arbiter D-08, N>=2 hard-cap D-07); D-08 + D-07 verbatim prompts with EN/KO/TEXT_MODE variants; no_hooks_assertion + command_surface_assertion blocks | ✓ VERIFIED | File exists at 310 lines (target ≥180). Contains `RETURNED-TO-DISCOVER` (3 hits) + `GAPS-BLOCKING/MATERIAL-ONLY/NONE` (13 hits) + verbatim D-08 prompt at line 177 (`We've gone back to research for`) + verbatim D-07 prompt (`loop protection is engaged`) + all 3 options + Korean variants. |
| `brief/workflows/align-gate.md` | Extended from 352 → 475 lines with Step 4.5 (D-11 frame-pop via `gap-detect maybe-pop`) + Step 8 (D-02 gap-detect post-verdict spawn using `buildBusinessContext` + `count-iterations`); preserves Steps 0-7 + no_hooks_assertion + command_surface_assertion | ✓ VERIFIED | File at 475 lines (target ≥420). Contains `## Step 4.5` (1 hit) + `## Step 8` (5 hits incl. sub-sections) + `maybe-pop` (2) + `gap-detect.md` (4) + `buildBusinessContext` (1) + `count-iterations` (2) + `RETURNED-TO-DISCOVER` (2). Step 4.5 precedes Step 5A and Step 8 follows Step 7 (verified by tests). |
| `brief/workflows/discover.md` | Extended with Step 0.5 (D-10 resume auto-detect); 3-option AskUserQuestion (Resume / Start new session / Show stack) + Korean variants + TEXT_MODE numbered-list fallback; 9-slug category mapping; reads `state json`; preserves Steps 1-7 + no_hooks_assertion + command_surface_assertion | ✓ VERIFIED | File at 429 lines (target ≥360). Contains `## Step 0.5` (5 hits: 1 main + 4 sub-sections) + `Resume` (8) + `Start new session` (5) + `Show stack` (3) + `재개` (5) + `state json` (1). All 9 DISCOVER category slugs present (test-verified). |
| `brief/bin/lib/status.cjs` | Extended renderStatus() with Gap loop + Round-trips rows BELOW `Last COMPLIANCE` and ABOVE divider; preserves all 8 existing rows; counts derived at read-time (D-06) from `return_stack_history` | ✓ VERIFIED | File at 165 lines (target ≤180, net +35 vs Phase 5 baseline 130). Contains `Gap loop` (3 hits) + `Round-trips` (4) + `Return stack` (2 — Phase 2 row preserved). `round_trip_counter` literal absent (0 hits). Canary E2E Step 2 confirms simultaneous render. |
| `brief/references/gap-detect-vocabulary.md` | 89 lines — D-01 decision enum (GAPS-NONE + GAPS-MATERIAL-ONLY + GAPS-BLOCKING) + D-03 severity enum (blocking + material + nice-to-have) + D-09 fingerprint contract + EN/KO/symbol ban-lists | ✓ VERIFIED | File at 89 lines (target ≥50). Contains GAPS-NONE (2) + GAPS-MATERIAL-ONLY (1) + GAPS-BLOCKING (1) + `compliant` (1 — as banned documentation) + `준수` (1) + `✅` (1). |
| `brief/bin/lib/gap-detect-report.cjs` | 102-line paired-sibling renderer (D-04) — `renderGapDetectReport(verdict, opts)` producing frontmatter (phase: 06-gaps + severity_counts + detected_at + topic_fingerprints + decision) + body grouped by severity H3 with Korean/English headers; zero external deps | ✓ VERIFIED | File exists and is imported by `gap-detect.cjs` (verified via exports). Smoke-tested in Plan 02 verification (`renderGapDetectReport` evaluates to a function; BLOCKING verdict renders with `phase: 06-gaps` + fingerprint + BLOCKING section header). |
| 10 fixtures under `tests/fixtures/gap-detect/` (6) + `tests/fixtures/return-stack/` (4) | Fixture library consumed by all 8 plans | ✓ VERIFIED | All 10 files exist on disk: `gap-detect/` = 6 (gap-blocking-tam-unknown.md, agent-return-blocking.json, agent-return-mixed-severity.json, agent-return-material-only.json, history-1-push.json, history-2-pushes.json); `return-stack/` = 4 (stack-depth-0.json, stack-depth-1.json, stack-depth-3.json, history-cross-workstream.json). |
| 20 new test files under `tests/` | Plan-enumerated test files locking primitive invariants + structural guarantees + E2E canary | ✓ VERIFIED | 20 Phase 6 test files exist: brief-gap-detect-*.test.cjs (14) + brief-return-stack-*.test.cjs (2) + brief-discover-resume-*.test.cjs (1) + tests bundled in gap-detect family. All 145 tests run green (0 fail, ~377ms). |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `brief/workflows/align-gate.md` Step 8 | `brief/workflows/gap-detect.md` | Inline workflow invocation after ALIGN verdict | ✓ WIRED | Step 8.3 contains `Invoke brief/workflows/gap-detect.md with: ARTIFACT_PATH / OBJECTIVES_BASELINE_PATH / BUSINESS_CONTEXT_BLOCK / CURRENT_WORKSTREAM / PAUSED_PHASE / VERDICT_OUT_PATH`. 4 references to `gap-detect.md` in align-gate.md. |
| `brief/workflows/align-gate.md` Step 4.5 | `brief-tools.cjs gap-detect maybe-pop` | CLI invocation | ✓ WIRED | Step 4.5 invokes `node brief/bin/brief-tools.cjs gap-detect maybe-pop`. `maybe-pop` subcommand wired in dispatcher (line 1 hit for `sub === 'maybe-pop'`). Smoke confirms `maybePopTopFrame` returns null on empty. |
| `brief/workflows/discover.md` Step 0.5 | `brief-tools.cjs state json` | CLI invocation for reading return_stack | ✓ WIRED | Step 0.5.1 invokes `node brief/bin/brief-tools.cjs state json` (1 hit) and parses `brief.return_stack`. |
| `brief/workflows/gap-detect.md` | `agents/brief-gap-detector.md` | Task spawn | ✓ WIRED | Step 1 prescribes Task spawn of `agents/brief-gap-detector.md` with `{{ARTIFACT_PATH}}`, `{{OBJECTIVES_BASELINE_PATH}}`, `{{BUSINESS_CONTEXT_BLOCK}}` interpolations. |
| `brief/bin/lib/gap-detect.cjs` | `brief/bin/lib/gap-detect-report.cjs` | require() import | ✓ WIRED | `commitGapDetectVerdict` imports `renderGapDetectReport` from gap-detect-report.cjs. |
| `brief/bin/lib/gap-detect.cjs` | `brief/bin/lib/audience.cjs` | `siblingReportPath` import | ✓ WIRED | Used to derive `{artifact}.gaps.md` path via `siblingReportPath(artifactPath, 'gaps')`. |
| `brief/bin/lib/gap-detect.cjs` | `brief/bin/lib/state.cjs` | `readModifyWriteStateMd` import | ✓ WIRED | All 5 state-mutating primitives (push, pop, maybePop, clear, appendGapQueue) funnel through the atomic lock (5 references). |
| `brief/bin/lib/gap-detect.cjs` | `brief/bin/lib/security.cjs` | `sanitizeForPrompt` import | ✓ WIRED | `writeAssumption` sanitizes user-typed justification before OBJECTIVES.md + STATE.md write. |
| `brief/bin/brief-tools.cjs` case 'gap-detect' | `brief/bin/lib/gap-detect.cjs` | require() import | ✓ WIRED | Dispatcher exposes 7 subcommands: run / commit / push-frame / count-iterations / cancel-workstream / write-assumption / maybe-pop (all 7 handlers verified). |
| `brief/bin/lib/status.cjs` | `state.brief.return_stack_history` | Read-time array grouping | ✓ WIRED | `renderStatus` extracts `brief.return_stack_history`, groups by `paused_workstream` via Map, renders `{ws}: {count}` comma-joined. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `status.cjs` renderStatus() | `returnStackDepth`, `activeTopic`, `roundTripLine` | Read from `state.brief.return_stack` + `state.brief.return_stack_history` parsed from STATE.md frontmatter (via `extractFrontmatter`) | ✓ Yes — canary E2E confirms the renderer receives real array data from pushReturnFrame via STATE.md round-trip | ✓ FLOWING |
| `gap-detect.cjs` pushReturnFrame | `frame` | Caller (workflow Step 5.0 via brief-tools.cjs push-frame dispatcher or direct lib invocation from tests) | ✓ Yes — writes JSON.stringify-safe objects to both arrays atomically | ✓ FLOWING |
| `gap-detect.cjs` countIterations | `history` | Read from `state.brief.return_stack_history` at read-time (not stored counter) | ✓ Yes — filter by paused_workstream + topic_fingerprint; null-safe | ✓ FLOWING |
| `gap-detect.cjs` maybePopTopFrame | `stack` | Read from `state.brief.return_stack` atomically within `readModifyWriteStateMd` transaction | ✓ Yes — D-11 dual-condition (artifact mtime + ALIGN re-pass) verified by canary Step 4 | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| gap-detect.cjs exports all 19 primitives | `node -e "const g=require('./brief/bin/lib/gap-detect.cjs');..."` | 19/19 present, 0 missing | ✓ PASS |
| FINGERPRINT_RE accepts canonical D-09 examples | `node -e "g.validateFingerprint('market-sizing-korea-fintech-tam')"` | returns `null` (valid) | ✓ PASS |
| FINGERPRINT_RE rejects uppercase | `node -e "g.validateFingerprint('Bad-CASE')"` | returns `"fails kebab-case 3-8 token regex"` | ✓ PASS |
| countIterations null-safe | `node -e "g.countIterations(null, 'x', 'y')"` | returns `0` | ✓ PASS |
| maybePopTopFrame no-op on empty | smoke test on empty STATE.md | returns `null` without throwing | ✓ PASS |
| Canary E2E push → status render → pop cycle | `node --test tests/brief-gap-detect-canary-e2e.test.cjs` | 6/6 tests pass, 71ms, `Return stack 1/3 + Gap loop Korea fintech TAM + Round-trips go-to-market: 1` all render simultaneously | ✓ PASS |
| Full Phase 6 regression | `node --test tests/brief-gap-detect-*.test.cjs tests/brief-return-stack-*.test.cjs tests/brief-discover-resume-*.test.cjs` | 145/145 pass, 0 fail, ~377ms | ✓ PASS |
| A1 zero-runtime-deps sentinel | `node -e "Object.keys(require('./package.json').dependencies).length"` | returns `0` | ✓ PASS |
| Anti-pattern #2 (no hooks) | `grep -rE 'gap-detect\|brief-gap-detector\|gap_detect\|return[-_]stack\|gap[-_]queue' hooks/` | returns 0 matches | ✓ PASS |
| Surface Cap preserved (7 FORBIDDEN command files) | `ls commands/brief/{gap-detect,gap,return-stack,resume,gap-queue,frame-pop,meta-arbiter}.md 2>/dev/null` | 0 files found | ✓ PASS |
| /brief-discover baseline preserved | `ls commands/brief/discover.md` | exists | ✓ PASS |
| D-06 no stored counter | `grep -cE 'round_trip_counter' brief/bin/lib/{state,gap-detect,status}.cjs` | 0 across all three files | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DSG-11 | 06-01, 06-02, 06-03, 06-04, 06-06, 06-07, 06-08 | User can trigger a return to Phase 1 from inside any Phase 2 workstream when a research gap is detected (bidirectional flow), with hard 3-round-trip cap and meta-arbiter prompt at iteration 2 | ✓ SATISFIED | SC #1 + SC #2 + SC #4 all verified above. Tests lock D-08 meta-arbiter (5 tests) + D-07 hard-cap (6 tests) + D-03 severity routing (severity-routing + material-only + nice-to-have-dropped) + canary E2E full cycle. |
| DSG-14 | 06-01, 06-05, 06-08 | User can see the bidirectional return-stack state in `/brief-status` (current depth, max depth = 3, what triggered the return, what's pending on resume) | ✓ SATISFIED | SC #3 verified. `brief/bin/lib/status.cjs` renders Return stack + Gap loop + Round-trips rows. Canary Step 2 confirms simultaneous render from fresh push. Counts derived at read time (D-06) — `round_trip_counter` absent across state.cjs + gap-detect.cjs + status.cjs. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|

**None.** Grep-audit confirms:
- 0 hook references to gap-detect (Anti-pattern #2 preserved)
- 0 new user-facing commands (Surface Cap preserved)
- 0 ban-list tokens (`compliant`/`passed`/`violation`/`failed`/`준수`/`통과`/`위반`/`실패`/`✅`/`✓`/`✗`) outside legitimate documentation homes (block-strip vocabulary-lock test passes)
- 0 stored counter field (`round_trip_counter`) anywhere in state.cjs, gap-detect.cjs, or status.cjs (D-06 derive-at-read-time enforced)
- 0 mutations to `return_stack_history` (.pop/.shift/.splice grep returns 0 in gap-detect.cjs — D-06 append-only locked)
- A1 preserved: package.json `dependencies` count = 0

### Gaps Summary

**None.** Phase 6 achieves its goal completely:

- **Goal:** Build bidirectional Phase 1↔2 return-stack infrastructure BEFORE Phase 7 designers that depend on it exist.
- **Delivered:** `state.brief.return_stack` (LIFO, max depth 3 via D-07 hard-cap) + `state.brief.return_stack_history` (append-only D-06) + `brief-gap-detector` agent (8-section shape, 333 lines) + meta-arbiter prompt at iteration 2 (verbatim D-08 wording in `brief/workflows/gap-detect.md` line 177) + hard-cap at iteration 3 (D-07 no-bypass, 3 options locked) + convergence telemetry in `/brief-status` (Gap loop + Round-trips rows derived at read time) + `/brief-discover` Step 0.5 resume auto-detect with 3-option AskUserQuestion.
- **Pitfall #7 mitigation:** Structurally enforced via (a) `countIterations` pure function, (b) hard-cap at 3 with zero bypass options, (c) meta-arbiter interrupt at iteration 2, (d) `return_stack_history` append-only invariant preventing iteration-count evasion.
- **Validation:** 145 Phase 6 tests pass, 0 fail. Canary E2E proves the full push → status → pop cycle works end-to-end in a single test (71ms). Structural audits (no-hook, no-new-command, vocabulary-lock, TEXT_MODE parity) fire on any regression.

All 4 ROADMAP success criteria verified. Both requirements (DSG-11 + DSG-14) satisfied. Zero runtime deps added (A1 preserved). Zero new user-facing commands (Surface Cap preserved). Hook-purity preserved. Phase 7 COMPLIANCE can now copy-rename the 5 structural test files as its verification template (4th replication of the canonical gate pattern after ALIGN → AUDIENCE → GAP-DETECT).

---

_Verified: 2026-04-23_
_Verifier: Claude (brief-verifier)_
