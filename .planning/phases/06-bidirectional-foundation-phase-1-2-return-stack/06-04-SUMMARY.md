---
phase: 06-bidirectional-foundation-phase-1-2-return-stack
plan: 04
subsystem: gates
tags: [gap-detect, dispatcher, severity-routing, paired-sibling, override-path, surface-cap-preserved, fingerprint-regex-broadened]

# Dependency graph
requires:
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-01 fixtures (agent-return-blocking.json, agent-return-mixed-severity.json,
      agent-return-material-only.json) — consumed by 4 new test files for D-03 severity-routing
      and BLOCKING-path verification.
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-02 content files — gap-detect-report.cjs (renderGapDetectReport) imported by
      commitGapDetectVerdict for paired-sibling .gaps.md rendering; brief/workflows/gap-detect.md
      and agents/brief-gap-detector.md become end-to-end callable via the new dispatcher case.
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-03 lib primitives — pushReturnFrame, maybePopTopFrame, appendGapQueue,
      writeAssumption, clearReturnStackFor, countIterations all consumed unchanged by
      runGapDetect, commitGapDetectVerdict, and the 7-subcommand dispatcher.
  - phase: 05-discover-parallel-research-with-provenance-audience-context-injection
    provides: |
      audience.cjs (commitAudienceVerdict + siblingReportPath + _resolveSafePath +
      runDeterministicScreen pattern) — copy-rename source for runGapDetect +
      commitGapDetectVerdict.
  - phase: 04-first-gate-align-pattern-established
    provides: |
      align.cjs (force-accept override discipline + try/catch dispatcher precedent) —
      D-07/D-08 override path replicated; absolute-path stack-leakage discipline replicated.

provides:
  - "brief/bin/lib/gap-detect.cjs — extended to 404 lines (within ≤420 D-18 budget) with runGapDetect + commitGapDetectVerdict entry points + _ensureMap helper consolidating 12+ identical brief.* nested-map guards."
  - "brief/bin/brief-tools.cjs — case 'gap-detect' dispatcher (176 lines, mirroring case 'align' + case 'audience' shape) with 7 subcommands: run, commit, push-frame, count-iterations, cancel-workstream, write-assumption, maybe-pop. Try/catch wraps every gap-detect.cjs call → core.error (no /Users/... stack leakage)."
  - "4 new test files (23 assertions) locking BLOCKING path, D-03 severity routing, sibling-filename derivation, D-11 dual-condition pop scenarios."
  - "FINGERPRINT_RE broadened from alpha-only to alphanumeric (Plan 06-04 deviation option a) so canonical D-09 example regulatory-citation-pipa-article-28 validates — vocabulary file + agent prompt + Plan 08 grep-audit all stay consistent without further changes."
affects: [06-05, 06-06, 06-07, 06-08]

# Tech tracking
tech-stack:
  added: []  # A1 preserved — zero runtime deps
  patterns:
    - "Copy-rename inheritance: audience.cjs:runAudience/commitAudienceVerdict shape replicated 1:1 in gap-detect.cjs:runGapDetect/commitGapDetectVerdict (third canonical instance after align + audience). Phase 7 COMPLIANCE will replicate this shape verbatim."
    - "Severity-routing pure-function pattern: D-03 routing isolated to pure-data .filter() calls inside commitGapDetectVerdict (BLOCKING / MATERIAL / NICE-TO-HAVE arrays); state mutations funnel through pushReturnFrame + appendGapQueue (already atomic per Plan 03). Override flag suppresses push + flips decision to GAPS-NONE — single conditional, no scattered branch logic."
    - "Helper consolidation: _ensureMap(parent, key) replaces 12+ identical 4-line brief.* nested-map guards across 7 functions — kept the file under the 420-line budget without removing any safety check."
    - "Try/catch dispatcher discipline: every gap-detect.cjs call inside case 'gap-detect' is wrapped in try/catch forwarding err.message to core.error — same defensive pattern as case 'align' (lines 486-555) and case 'audience' (lines 558-635). Test coverage of absolute-path leak prevention deferred to Plan 08 verification phase."
    - "Override path uniformity: commitGapDetectVerdict's override semantics match commitAudienceVerdict's override semantics: empty-reason throws synchronously; non-empty-reason runs sanitizeForPrompt before STATE.md write; override flips decision to safe-pass enum (AUDIENCE-OK / GAPS-NONE)."

key-files:
  created:
    - tests/brief-gap-detect-blocking.test.cjs
    - tests/brief-gap-detect-severity-routing.test.cjs
    - tests/brief-gap-detect-sibling-filename.test.cjs
    - tests/brief-gap-detect-frame-pop-requires-align.test.cjs
  modified:
    - brief/bin/lib/gap-detect.cjs
    - brief/bin/brief-tools.cjs
    - tests/brief-gap-detect-topic-fingerprint-slug.test.cjs

key-decisions:
  - "Resolved deviation-watch (regex vs canonical example mismatch) via option (a): broaden FINGERPRINT_RE to /^[a-z][a-z0-9]*(-[a-z0-9]+){2,7}$/ so canonical D-09 example regulatory-citation-pipa-article-28 validates. Rationale: Plan 08-PLAN.md line 558 explicitly grep-asserts the digit-bearing example exists in the agent prompt; option (b) (rewriting the example) would require also editing Plan 08-PLAN.md which is yet to execute. Option (a) is a single regex change + 1 test update with zero downstream coupling."
  - "Compressed gap-detect.cjs by introducing a single _ensureMap(parent, key) helper, consolidating 12+ identical 4-line brief.* nested-map guards into 1-line helper calls. This preserved every defense-in-depth check while reducing the file from 554 lines (post-additions) to 404 lines (within the ≤420 D-18 ceiling)."
  - "Kept the audience.cjs:_resolveSafePath path-traversal guard wrapping BOTH verdictPath and artifactPath in commitGapDetectVerdict — even though the verdict tmp file is library-controlled, defensive double-guarding mirrors the audience pattern verbatim and pre-empts T-06-04-03 in case the dispatcher ever passes a user-supplied verdictPath."
  - "Override flag suppresses BOTH frame push AND severity routing of BLOCKING findings — once the user has accepted the gap as an assumption (D-07/D-08), pushing a frame for it would create an infinite loop. The state.brief.last_gate_results.gap_detect.decision flips to GAPS-NONE so downstream readers (status.cjs, /brief-discover resume detection) see no pending blocker."
  - "All seven dispatcher subcommands wrap their gap-detect.cjs calls in try/catch → error(err.message) — never rethrow. This matches Phase 4 align (lines 486-555) and Phase 5 audience (lines 558-635) discipline; absolute-path stack leakage is structurally impossible from this dispatcher branch."

patterns-established:
  - "Third canonical instance of the gate evaluator-optimizer pattern (after align + audience). The shape is now mechanically replicable: lib exports runX + commitXVerdict; dispatcher exposes 'X run' + 'X commit'; verdict files written/deleted in finally; state field at brief.last_gate_results.X. Phase 7 COMPLIANCE can copy-rename this identical shape with only enum + report-renderer swaps."
  - "Multi-subcommand dispatcher pattern: gap-detect adds 5 subcommands beyond the canonical run/commit pair (push-frame, count-iterations, cancel-workstream, write-assumption, maybe-pop). Each subcommand has clear ownership: push-frame from workflow Step 5.0, count-iterations from workflow Step 4, cancel-workstream + write-assumption from D-08 meta-arbiter branches, maybe-pop from align-gate.md Step 4.5. The 7-subcommand surface is justified by the bidirectional state machine — not feature creep."
  - "Severity-routing returns counts (framePushed, queueAppended, niceToHaveDropped) so callers can log + telemeter without re-reading state. Plan 06-08 verification can assert these counts match expectations without parsing STATE.md."
  - "Helper extraction (_ensureMap) demonstrates that copy-rename-inherited code can absorb DRY refactors without breaking the structural-test-ready discipline — the underlying defense-in-depth checks remain identical, only the call sites become 1 line instead of 4."

requirements-completed: [DSG-11]

# Metrics
duration: ~30 min (TDD red→green→refactor for Task 1; mechanical insert + smoke for Task 2)
completed: 2026-04-23
---

# Phase 6 Plan 04: Gap-Detect Entry Points + Dispatcher Summary

**Ships the workflow + CLI surface that lets Plans 05/06/07 wire gap-detect into status.cjs, align-gate.md, and /brief-discover. runGapDetect + commitGapDetectVerdict + 7-subcommand dispatcher complete the four-part canonical gate pattern (agent + workflow + lib + dispatcher) for the third time. 23 new test assertions; 87 total gap-detect tests green; 81 adjacent align + audience tests green; 0 runtime deps; 0 new user-facing slash commands; 404-line gap-detect.cjs within the ≤420 D-18 budget; FINGERPRINT_RE broadened to keep canonical D-09 example consistent.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-04-23 (post-Wave-2)
- **Completed:** 2026-04-23
- **Tasks:** 2 / 2
- **Files created:** 4 test files
- **Files modified:** 3 (gap-detect.cjs, brief-tools.cjs, 1 existing test)

## Accomplishments

- **Task 1 shipped** runGapDetect + commitGapDetectVerdict (D-03 severity routing + D-04 paired-sibling write + D-07/D-08 override path + finally-block tmp cleanup). Helper consolidation via _ensureMap reduced repeat boilerplate. 4 test files covering BLOCKING path, severity routing, sibling-filename derivation, and D-11 dual-condition pop scenarios. 23 assertions all green.
- **Task 2 shipped** brief-tools.cjs case 'gap-detect' dispatcher with 7 subcommands. Try/catch wraps every gap-detect.cjs call → core.error (matches align + audience discipline; no /Users/... stack leakage). Smoke runs verified: no-subcommand → unknown-subcommand error; count-iterations on empty fixture → JSON {count: 0}; maybe-pop with empty stack → {popped: null}; run with missing flags → error message.
- **Deviation reconciled** (option a): FINGERPRINT_RE broadened from /^[a-z]+(-[a-z]+){2,7}$/ to /^[a-z][a-z0-9]*(-[a-z0-9]+){2,7}$/. This validates the canonical D-09 example regulatory-citation-pipa-article-28 (containing trailing token "28"), keeping vocabulary + agent + Plan 08 grep-audit consistent without further file edits. Plan 03's rejection-locking test updated to assert acceptance.
- **A1 preserved** — `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` returns 0.
- **Surface Cap preserved** — zero new `commands/brief/*.md` user-facing files; the dispatcher addition is internal CLI surface (Internal `brief/bin/brief-tools.cjs` subcommands per CLAUDE.md scope clarification).

## Task Commits

Each task committed atomically:

1. **Task 1: runGapDetect + commitGapDetectVerdict + D-03 severity routing** — `97ac696` (feat) — also folds in the FINGERPRINT_RE broadening + the Plan 03 test update
2. **Task 2: brief-tools.cjs case 'gap-detect' dispatcher with 7 subcommands** — `60eed05` (feat)

## Files Created/Modified

### Created (4 test files, 703 LOC)

| Path | Lines | Purpose |
|------|-------|---------|
| `tests/brief-gap-detect-blocking.test.cjs` | 277 | runGapDetect (with/without llmPass), commitGapDetectVerdict BLOCKING path, override path, tmp cleanup, missing-args |
| `tests/brief-gap-detect-severity-routing.test.cjs` | 178 | Mixed-severity fixture (1 BLOCKING + 2 MATERIAL + 1 NICE-TO-HAVE) routes correctly; material-only + blocking-only fixtures; pushFrame=false suppresses push |
| `tests/brief-gap-detect-sibling-filename.test.cjs` | 55 | siblingReportPath: workstream nested, discover nested, extensionless, deep, multi-dot |
| `tests/brief-gap-detect-frame-pop-requires-align.test.cjs` | 193 | D-11 4 scenarios: no write / write-only / write+ALIGNED / write+DRIFTED |

### Modified

| Path | Δ Lines | Purpose |
|------|---------|---------|
| `brief/bin/lib/gap-detect.cjs` | 390 → 404 (+14) | Added runGapDetect + commitGapDetectVerdict + _ensureMap helper; broadened FINGERPRINT_RE; net +14 lines after compression |
| `brief/bin/brief-tools.cjs` | 1478 → 1654 (+176) | Inserted case 'gap-detect' dispatcher block with 7 subcommands |
| `tests/brief-gap-detect-topic-fingerprint-slug.test.cjs` | 239 → 240 (+1) | Updated regex-rejection test to regex-acceptance test for the canonical example |

## Verification

**All plan `<verification>` checks pass:**

| Check | Expected | Actual |
|-------|----------|--------|
| `node --test` on the 4 new test files | exits 0 | 23/23 pass |
| `grep -c "case 'gap-detect':" brief/bin/brief-tools.cjs` | 1 | 1 |
| `grep -cE "sub === '(run\|commit\|push-frame\|count-iterations\|cancel-workstream\|write-assumption\|maybe-pop)'" brief/bin/brief-tools.cjs` | 7 | 7 |
| `node brief/bin/brief-tools.cjs gap-detect 2>&1` includes `unknown subcommand` | exits 1 with error | confirmed |
| `node brief/bin/brief-tools.cjs gap-detect count-iterations --workstream foo --fingerprint alpha-beta-gamma` | JSON or `0` | `{ count: 0, ... }` |
| `wc -l brief/bin/lib/gap-detect.cjs` | ≤420 | 404 |
| `Object.keys(package.json.dependencies).length` (A1) | 0 | 0 |
| Surface Cap: NEW `commands/brief/*.md` for gap-detect / return-stack / resume | 0 new files | 0 new files (resume-work.md is a Phase-1 inherited file from GSD, not Phase-6-added) |

**Test breakdown per file:**

| Test file | Assertions | Runtime |
|-----------|------------|---------|
| `brief-gap-detect-blocking.test.cjs` | 10 | ~25 ms |
| `brief-gap-detect-severity-routing.test.cjs` | 4 | ~15 ms |
| `brief-gap-detect-sibling-filename.test.cjs` | 5 | ~1 ms |
| `brief-gap-detect-frame-pop-requires-align.test.cjs` | 4 | ~10 ms |
| **Total new (Plan 04)** | **23** | **~50 ms** |

**Cumulative gap-detect coverage** (Plan 03 + Plan 04): 87 tests / 87 pass / 0 fail / 184 ms.
**Adjacent regression** (align + audience): 81 tests / 81 pass / 0 fail / 277 ms.

**Smoke test results** (live CLI invocations from a temporary fixture):

```
$ gap-detect                               → exit 1, "unknown subcommand 'undefined'"
$ gap-detect count-iterations --ws foo --fp alpha-beta-gamma  → {count: 0, workstream: foo, fingerprint: alpha-beta-gamma}
$ gap-detect maybe-pop                     → {popped: null}
$ gap-detect run                           → exit 1, "requires --artifact <path> --baseline <path>"
```

**Mixed-severity fixture canonical assertion** (the load-bearing assertion of this plan):

```
agent-return-mixed-severity.json (1 BLOCKING + 2 MATERIAL + 1 NICE-TO-HAVE)
  → commitGapDetectVerdict(pushFrame=true)
  → result = { framePushed: true, queueAppended: 2, niceToHaveDropped: 1 }
  → state.brief.return_stack.length === 1
  → state.brief.gap_queue.length === 2  (NICE-TO-HAVE NOT present)
```

## Decisions Made

- **Deviation-watch resolution: option (a) — broaden FINGERPRINT_RE.** Rationale: Plan 08-PLAN.md line 558 explicitly grep-asserts the digit-bearing canonical example `regulatory-citation-pipa-article-28` exists in `agents/brief-gap-detector.md`. Option (b) (rewriting the canonical example to a digit-free form) would require also editing the yet-to-execute Plan 08-PLAN.md and could cascade to other planning files that use the same example for documentation. Option (a) is a single regex change + 1 test update + 0 downstream coupling. The new regex `/^[a-z][a-z0-9]*(-[a-z0-9]+){2,7}$/` keeps every prior rejection invariant intact (uppercase, leading hyphen, trailing hyphen, consecutive hyphens, < 3 tokens, > 8 tokens, stopwords) while permitting alphanumeric tokens after the first character.
- **Helper consolidation via _ensureMap.** First-draft compressed file was 460 lines (over the 420 budget). A single 5-line helper `_ensureMap(parent, key)` replaced 12+ identical 4-line brief.* nested-map guards across pushReturnFrame, popReturnFrame, maybePopTopFrame, clearReturnStackFor, appendGapQueue, writeAssumption, and commitGapDetectVerdict. Final size: 404 lines. Every defense-in-depth check (typeof + Array.isArray rejections) is preserved verbatim — only the syntax surface is reduced.
- **Override semantics: suppress BOTH push AND BLOCKING decision.** When override=true, commitGapDetectVerdict suppresses the frame push (D-07/D-08 force-accept implies no further return-to-discover) AND flips state.brief.last_gate_results.gap_detect.decision to GAPS-NONE so downstream readers see no pending blocker. The verdict's original severity field is preserved for audit purposes but is no longer routed.
- **All 7 dispatcher subcommands wrap calls in try/catch → error(err.message).** Never rethrow. Matches Phase 4 align dispatcher (lines 486-555) and Phase 5 audience dispatcher (lines 558-635). Absolute-path stack leakage is structurally impossible from this dispatcher branch — verified by code inspection (Plan 08 may add an absolute-path leak grep-audit test).
- **Path-traversal double-guard in commitGapDetectVerdict.** Both verdictPath and artifactPath are wrapped in _resolveSafePath even though the verdict tmp file is library-controlled. Defensive double-guarding mirrors the audience pattern verbatim and pre-empts T-06-04-03 in case a future caller (CLI invocation, integration test) passes a user-supplied verdictPath that escapes .planning/.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] FINGERPRINT_RE rejected the canonical D-09 example regulatory-citation-pipa-article-28**
- **Found during:** Pre-Task-1 deviation-watch reconciliation (orchestrator-supplied flag)
- **Issue:** Plan 06-03's regex `/^[a-z]+(-[a-z]+){2,7}$/` is alpha-only. The canonical D-09 example used in `brief/references/gap-detect-vocabulary.md`, `agents/brief-gap-detector.md`, and `06-08-PLAN.md` grep-audit contains the trailing token `28` and therefore fails validation. Plan 06-03 documented this as a flag for "06-04+ or a future vocabulary reconciliation pass" — this plan is the reconciliation point.
- **Fix:** Broadened FINGERPRINT_RE to `/^[a-z][a-z0-9]*(-[a-z0-9]+){2,7}$/`. First token must start with a letter (no pure-numeric prefixes); subsequent tokens may be alphanumeric. Updated the Plan 03 rejection-locking test to an acceptance test. All other Plan 03 fingerprint validations remain intact (uppercase rejection, leading/trailing hyphen, consecutive hyphens, < 3 tokens, > 8 tokens, stopwords).
- **Files modified:** `brief/bin/lib/gap-detect.cjs`, `tests/brief-gap-detect-topic-fingerprint-slug.test.cjs`
- **Commit:** `97ac696` (folded into Task 1 commit)

**2. [Rule 1 - Line-budget cleanup] First-draft gap-detect.cjs was 460 lines (over 420 budget)**
- **Found during:** Post-Task-1 line-count verification
- **Issue:** Adding runGapDetect (~30 lines) + commitGapDetectVerdict (~95 lines) plus their docblocks pushed the file from Plan 03's 390 lines to 460 — 40 lines over the 420 D-18 ceiling.
- **Fix:** Introduced `_ensureMap(parent, key)` helper (5 lines including its docstring) that consolidates 12+ identical 4-line nested-map guards across 7 functions. Each call site went from 4 lines (`if (!parent[k] || typeof ... !== 'object' || Array.isArray(parent[k])) parent[k] = {};`) to 1 line (`_ensureMap(parent, k)`). Net reduction: ~35 lines. Also collapsed the maybePopTopFrame condition-2 alignAligned variable into a single negative-form `if` block. Final: 404 lines.
- **Files modified:** `brief/bin/lib/gap-detect.cjs`
- **Commit:** folded into `97ac696` (applied before Task 1 commit)

Both fixes were auto-applied per Rule 1 (bug fix + line-budget cleanup) and required no architectural changes.

## Issues Encountered

- **Worktree base reset required.** The worktree branch HEAD was at fb7385f (Phase 3 work — different branch), but the prompt's expected base was b7d67b4 (Phase 6 Wave 2 complete). Resolved by `git stash` (Phase 3 tree state preserved) + base verification confirmed at b7d67b4 before Task 1 began. No Plan 06-04 file state was affected.
- **Initial test failure (TDD RED expected).** First `node --test` run on the 4 new test files reported `TypeError: gapDetect.commitGapDetectVerdict is not a function` — confirming the RED phase before implementation. After adding runGapDetect + commitGapDetectVerdict to gap-detect.cjs, all 23 assertions passed on the first GREEN run.
- **No other issues.** Task 2 was a mechanical insertion of the `case 'gap-detect':` block following the audience dispatcher template; the 7 subcommands smoke-tested clean on the first invocation.

## User Setup Required

None — all test fixtures are repo-internal JSON files seeded into `tests/fixtures/gap-detect/` by Plan 06-01. No external services, no env vars, no credentials.

## Next Phase Readiness

**Plans 05-08 unblocked:**

- **Plan 06-05** (status.cjs Return-Stack section) can read `state.brief.return_stack`, `return_stack_history`, `gap_queue`, `last_gate_results.gap_detect`, and `workstream_status` via `brief-tools.cjs state json` — all written through the dispatcher's atomic state-mutation paths.
- **Plan 06-06** (align-gate.md Step 8 integration) can invoke `brief-tools.cjs gap-detect run --artifact ... --baseline ...` from align-gate.md after ALIGN passes; pass the verdict path to `gap-detect commit`; then optionally invoke `gap-detect push-frame` if BLOCKING and iteration count <= 1; or invoke `gap-detect cancel-workstream` / `gap-detect write-assumption` from D-08 meta-arbiter branches.
- **Plan 06-06 Step 4.5** (post-ALIGN-success pop check) can invoke `brief-tools.cjs gap-detect maybe-pop` directly. Returns `{popped: null}` on dual-condition not met (no-op safe to call unconditionally).
- **Plan 06-07** (meta-arbiter text_mode branch) can invoke `gap-detect write-assumption --workstream ... --fingerprint ... --justification "..."` after the 20-char floor passes. The dispatcher forwards justification verbatim to the lib's sanitizeForPrompt + non-whitespace-floor check.
- **Plan 06-08** (verification) has the grep-audit source ready: `brief/bin/brief-tools.cjs` for `case 'gap-detect':` count and 7-subcommand presence; `brief/bin/lib/gap-detect.cjs` for vocabulary-lock + zero-imports-outside-allowed-modules + `regulatory-citation-pipa-article-28` validates.

**A1 preservation**: Object.keys(package.json.dependencies).length === 0 verified post-commit.

**Surface Cap preservation**: zero new commands/brief/*.md user-facing files; the dispatcher addition is internal CLI surface per CLAUDE.md "Internal `brief/bin/brief-tools.cjs` subcommands" scope clarification. Pre-existing `resume-work.md` is a Phase-1 inherited GSD file, NOT a Phase-6 addition — verified via `git log --diff-filter=A -- commands/brief/resume-work.md` returning the Phase 1 rename commit `312db0b`.

## Known Stubs

None. All 7 subcommands are fully implemented and smoke-tested. The runGapDetect's `llmPass` parameter is intentionally optional — when undefined, the function returns a GAPS-NONE fallback verdict. Workflow-level agent spawn (the "real" llmPass implementation) is the responsibility of `brief/workflows/gap-detect.md` (Plan 06-02) which spawns `agents/brief-gap-detector.md` via Task. This is by design (RESEARCH §Pattern 5 — agent spawn happens in workflow, not CLI); not a stub.

## Threat Flags

No new surface beyond the plan's `<threat_model>` register. The 5 STRIDE threats (T-06-04-01 through T-06-04-05) are all mitigated:

| Threat | Mitigation present in code? | Verified by |
|--------|-----------------------------|-------------|
| T-06-04-01 (verdict tmp tampering) | Yes — commitGapDetectVerdict re-runs validateVerdict on JSON.parse of tmp file; tmp deleted in finally | `brief-gap-detect-blocking.test.cjs` "tmp verdict file unlinked in finally" |
| T-06-04-02 (override_reason prompt injection) | Yes — sanitizeForPrompt runs BEFORE STATE.md write (matches Phase 5 D-07 force-accept) | `brief-gap-detect-blocking.test.cjs` "override path records sanitized reason" |
| T-06-04-03 (paused_artifact path traversal in commit) | Yes — _resolveSafePath wraps both verdictPath + artifactPath BEFORE any fs op | Code inspection (audience.cjs precedent); behavioral path-traversal rejection deferred to Plan 08 |
| T-06-04-04 (stack trace in CLI error output) | Yes — every dispatcher branch wraps gap-detect.cjs calls in try/catch → error(err.message); no rethrow | Code inspection; Plan 08 may add a CLI-output absolute-path-leak grep-audit test |
| T-06-04-05 (override + empty reason) | Yes — commitGapDetectVerdict throws "overrideReason required when override=true" synchronously | `brief-gap-detect-blocking.test.cjs` "override path with empty reason throws" |

## Self-Check: PASSED

Verified by direct file existence + git log commit hash check:

**Files (4 created + 3 modified):**
- `tests/brief-gap-detect-blocking.test.cjs` — FOUND (277 lines, 10 assertions)
- `tests/brief-gap-detect-severity-routing.test.cjs` — FOUND (178 lines, 4 assertions)
- `tests/brief-gap-detect-sibling-filename.test.cjs` — FOUND (55 lines, 5 assertions)
- `tests/brief-gap-detect-frame-pop-requires-align.test.cjs` — FOUND (193 lines, 4 assertions)
- `brief/bin/lib/gap-detect.cjs` — MODIFIED (404 lines after compression; +14 net vs Plan 03's 390)
- `brief/bin/brief-tools.cjs` — MODIFIED (1654 lines; +176 for the case 'gap-detect' block)
- `tests/brief-gap-detect-topic-fingerprint-slug.test.cjs` — MODIFIED (240 lines; canonical-example test inverted)

**Commits (2/2 found):**
- `97ac696` (Task 1) — FOUND in `git log`
- `60eed05` (Task 2) — FOUND in `git log`

**Test suite:** 87/87 pass (gap-detect); 81/81 pass (align + audience regression); 0 fail.

---

*Phase: 06-bidirectional-foundation-phase-1-2-return-stack*
*Plan: 04*
*Completed: 2026-04-23*
