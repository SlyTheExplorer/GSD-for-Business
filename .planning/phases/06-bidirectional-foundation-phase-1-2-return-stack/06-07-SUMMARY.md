---
phase: 06-bidirectional-foundation-phase-1-2-return-stack
plan: 07
subsystem: workflows
tags: [discover, resume, return-stack, bidirectional, auto-detect, askuserquestion, text-mode, korean-variant, surface-cap-preserved, category-mapping]

# Dependency graph
requires:
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-01 return_stack frontmatter schema + stack-depth-1/3 fixtures — consumed
      by Step 0.5 fixture-shape compatibility test.
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-03 gap-detect.cjs commitGapDetectVerdict + pushReturnFrame + appendGapQueue
      + D-03 severity routing — consumed verbatim by the NICE-TO-HAVE drop edge-case test.
  - phase: 06-bidirectional-foundation-phase-1-2-return-stack
    provides: |
      Plan 06-04 brief-tools.cjs `state json` dispatcher subcommand — referenced by Step 0.5.1
      as the return_stack reader.
  - phase: 05-discover-parallel-research-with-provenance-audience-context-injection
    provides: |
      brief/bin/lib/context-inject.cjs buildBusinessContext() — the primitive the resume branch
      invokes to respawn ONLY the researcher for the paused topic (skipping Step 3 multi-select).
  - phase: 03-define-canary-phase-0-end-to-end
    provides: |
      /brief-discover stub command (commands/brief/discover.md) — Step 0.5 is appended to the
      workflow body without introducing any new user-facing command file (Surface Cap preserved).

provides:
  - "brief/workflows/discover.md extended from 303 → 429 lines with Step 0.5 (D-10 resume auto-detect): reads state.brief.return_stack, renders 3-option AskUserQuestion (Resume / Start new session / Show stack) with Korean variant + TEXT_MODE numbered-list fallback."
  - "Step 0.5.3 keyword→slug category mapping (Pitfall 5 mitigation): TOP_FRAME.triggering_topic → one of 9 DISCOVER category slugs via inline case-match; unmatched falls back to the 9-category picker."
  - "Claude's-Discretion D-10 extension: Resume bypasses Step 1 (Block-gate), Step 2 (Stale-anchor), AND Step 3 (Multi-select); Start-new flows through all steps normally. Rationale: paused frame pre-dates any OBJECTIVES.md amendment; re-running gates on a frame pushed <1min ago adds friction without catching a real issue. Regression mitigation via align-gate.md Step 4.5 D-11 dual-condition pop preserves gate discipline at the correct point."
  - "Command surface assertion extended: 5 → 8 FORBIDDEN paths (adds commands/brief/resume.md, commands/brief/gap-detect.md, commands/brief/return-stack.md). Surface Cap preservation audit for Plan 08."
  - "tests/brief-discover-resume-on-invocation.test.cjs — 8 structural assertions locking Step 0.5 position, 3-option UX (EN + Korean + TEXT_MODE), state-json CLI reference, 9-slug category-mapping coverage, Surface Cap absence, fixture-shape compatibility."
  - "tests/brief-gap-detect-nice-to-have-dropped.test.cjs — 1 edge-case assertion: all-NICE-TO-HAVE verdict → queueAppended=0 + niceToHaveDropped=N + sibling .gaps.md still written (audit trail) + state.brief.gap_queue empty + state.brief.return_stack empty."
affects: [06-08]

# Tech tracking
tech-stack:
  added: []  # A1 preserved — zero runtime deps
  patterns:
    - "Step-0.5 prepend-but-don't-renumber pattern: inserted between existing Step 0 (TEXT_MODE detection) and Step 1 (Block-gate) using fractional numbering instead of renumbering Steps 1-7. Preserves all downstream cross-references from other phase artifacts (06-01-PLAN test assertions, 06-04-PLAN line references, agent prompts). Third canonical instance after Phase 4 Step 4.5 (post-ALIGN pop check) and Phase 5 Step 6 (audience gate per artifact) — fractional step numbering is now the stable BRIEF convention for inserting cross-cutting pre/post-flow logic without breaking downstream dependencies."
    - "Claude's-Discretion scope-expansion pattern: D-10 literally said 'skip Step 3 category multi-select' on resume, but the plan's must_haves block explicitly broadened the bypass to Steps 1-4. The extension is documented inline in Step 0.5.3 (`Step 1 (Block-gate) and Step 2 (Stale-anchor) are SKIPPED on resume`) so downstream readers do not misinterpret it as a bug. Regression mitigation: the frame-pop condition (D-11) ensures post-resume ALIGN still runs and catches any OBJECTIVES drift, preserving the gate discipline at the correct point in the flow rather than the noisy pre-flow position."
    - "Surface Cap preservation via FORBIDDEN-path enumeration (not allowlist): the <command_surface_assertion> block extends the existing 5-path test to 8 paths rather than maintaining a positive list of permitted commands. Same discipline as Phase 5 Plan 04 FORBIDDEN enumeration. Catches regressions at the workflow-markdown level (inline shell test) AND at the structural-test level (tests/brief-discover-resume-on-invocation.test.cjs)."
    - "Decision-enum reuse on edge-case test: NICE-TO-HAVE-only verdict uses decision: 'GAPS-MATERIAL-ONLY' (not 'GAPS-NONE') per 06-RESEARCH §Open Question 3 — the commitGapDetectVerdict routing filters by severity regardless of decision, so a GAPS-MATERIAL-ONLY verdict with all NICE-TO-HAVE findings correctly results in queueAppended=0 + niceToHaveDropped=N. This documents that the decision field is advisory; the dispositive logic is per-finding severity."

key-files:
  created:
    - tests/brief-discover-resume-on-invocation.test.cjs
    - tests/brief-gap-detect-nice-to-have-dropped.test.cjs
  modified:
    - brief/workflows/discover.md

key-decisions:
  - "Inserted Step 0.5 via fractional numbering (not renumbering Steps 1-7). Preserves cross-references from Plan 06-01 fixtures, Plan 06-04 line citations, and every agent prompt that referenced `Step N` of discover.md. Renumbering would cascade edits across 3-4 other artifacts."
  - "Resume branch bypasses Step 1 (Block-gate) + Step 2 (Stale-anchor) + Step 3 (Multi-select) per the plan's must_haves truth. Claude's-Discretion scope-expansion of D-10 (which literally only mentioned Step 3). Documented inline in Step 0.5.3 with rationale so reviewers do not flag it as a bug."
  - "Category mapping uses 9 explicit keyword→slug rules (not LLM-judged routing). Rationale: v1 simplest per Pitfall 5 recommendation (c); deterministic and auditable; unmatched falls back to the 9-category picker (user-answerable). Can be promoted to LLM routing in v2 if pilot feedback shows mismatches."
  - "No new user-facing slash command. /brief-discover is already a stub from Phase 3; Step 0.5 is a body append. Surface Cap preserved per CLAUDE.md ≤12 target (Phase 9 HRD-02 reduction). 3 FORBIDDEN paths added to the <command_surface_assertion> inline test."
  - "NICE-TO-HAVE edge-case test uses decision: GAPS-MATERIAL-ONLY (not GAPS-NONE). Per 06-RESEARCH §Open Question 3 and the existing Plan 06-04 commitGapDetectVerdict implementation, the routing logic filters by per-finding severity regardless of the top-level decision enum — the test therefore exercises the dropper path with decision=GAPS-MATERIAL-ONLY to force the NICE-TO-HAVE filter."

patterns-established:
  - "Fractional-step prepend convention: Step 0.5 inserted between Step 0 and Step 1 of an existing numbered workflow without renumbering. Enables cross-cutting pre-flow hooks (resume auto-detect here; could apply to future multi-runtime preflight, tenant-selection, or audit-resume needs) without cascading edits. Third instance (Phase 4 Step 4.5 post-ALIGN pop check; Phase 5 Step 6 audience gate per artifact; now Phase 6 Step 0.5 resume auto-detect) — the fractional pattern is now the stable BRIEF convention."
  - "Surface Cap audit layered at 2 locations: (1) <command_surface_assertion> inline shell test in the workflow markdown (reviewed by any planner editing the workflow), (2) tests/brief-discover-resume-on-invocation.test.cjs Surface Cap test (caught at node --test run time). Defense-in-depth — either layer catches a regression."
  - "Plan-verification-text vs Plan-action-text discrepancy tolerance: the plan <verification> block used `grep -c '## Step 0.5'` expecting returns=1, but the plan <action> block explicitly mandates 1 main heading + 4 sub-sections. Task 1 <verify> used `grep -q` (presence check) which matches the action reality. Recording this as a convention: when the action says N headings but the verify says count=1, use the action as the source of truth and use presence (`grep -q`) or distinct-count (`sort -u | wc -l`) as the verification — not raw `-c`."
  - "D-10 Resume scope broadened inline with rationale. Phase 6 plan materials said 'skip category multi-select'. The plan must_haves extended this to skip Steps 1-2 as well. The extension was documented in Step 0.5.3 with rationale (paused frame pre-dates amendments; D-11 pop guards against gate-drift regression). Pattern: when a Claude's-Discretion decision widens a D-ref's literal scope, document the widening inline with the regression-mitigation argument so downstream readers don't revert."

requirements-completed: [DSG-11]

# Metrics
duration: ~7 min (both tasks green on first run; no TDD red phase was needed because Task 1 inserted the Step-0.5 content Task 2's structural assertions check for — validated as plan-intended)
completed: 2026-04-24
---

# Phase 6 Plan 07: /brief-discover Resume Auto-Detection Summary

**Ships Step 0.5 into brief/workflows/discover.md — the USER-FACING entry point for the bidirectional return-stack flow. When state.brief.return_stack is non-empty, `/brief-discover` auto-detects the paused frame and offers Resume / Start-new / Show-stack with Korean variant + TEXT_MODE fallback. Resume bypasses Block-gate + Stale-anchor + Multi-select (Claude's-Discretion D-10 extension); D-11 dual-condition pop preserves gate discipline at align-gate Step 4.5. 9-assertion test suite + 303 → 429-line workflow expansion; zero new user-facing commands; A1 deps=0 preserved.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-04-24T05:35:12Z
- **Completed:** 2026-04-24T05:42:53Z (approx)
- **Tasks:** 2 / 2
- **Files created:** 2 test files
- **Files modified:** 1 (brief/workflows/discover.md)

## Accomplishments

- **Task 1 shipped** Step 0.5 into brief/workflows/discover.md: 126 new lines inserted between Step 0 (TEXT_MODE detection) and Step 1 (Block-gate). 5 subsections cover return_stack read (Step 0.5.1), 3-option AskUserQuestion rendering with Korean variant + TEXT_MODE numbered list (Step 0.5.2), action-per-selection with 9-slug keyword mapping (Step 0.5.3), and no-op telemetry note (Step 0.5.4). <command_surface_assertion> block extended from 5 → 8 FORBIDDEN paths.
- **Task 2 shipped** 2 new test files locking the structural invariants: brief-discover-resume-on-invocation.test.cjs (8 assertions) + brief-gap-detect-nice-to-have-dropped.test.cjs (1 assertion). 9/9 pass on first run. 224/224 plan-relevant tests green (55 discover + 88 gap-detect + 81 align + audience).
- **A1 preserved** — `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` returns 0.
- **Surface Cap preserved** — zero new `commands/brief/*.md` user-facing files. Per CLAUDE.md Surface Caps scope clarification, Step 0.5 appends to the existing /brief-discover body (no new command file). 3 FORBIDDEN paths (resume.md / gap-detect.md / return-stack.md) added to both the inline shell test AND the node-test Surface Cap audit.
- **DSG-11 SC #1 satisfied literally:** "user runs /brief-discover to resume only the requested researcher". Step 0.5 makes the bidirectional flow auto-discoverable — users no longer need to remember the stack exists.

## Task Commits

Each task committed atomically:

1. **Task 1: Insert Step 0.5 into brief/workflows/discover.md (D-10 resume-on-invocation)** — `efb0ac3` (feat)
2. **Task 2: Ship tests/brief-discover-resume-on-invocation.test.cjs + tests/brief-gap-detect-nice-to-have-dropped.test.cjs** — `f89753f` (test)

## Files Created/Modified

### Created (2 test files, 272 LOC)

| Path | Lines | Purpose |
|------|-------|---------|
| `tests/brief-discover-resume-on-invocation.test.cjs` | 123 | 8 structural assertions: Step 0.5 position (before Step 1), 3 EN resume options, Korean variants, state json CLI reference, all 9 DISCOVER slugs in category-mapping, TEXT_MODE numbered-list fallback, Surface Cap (3 forbidden cmd files absent), stack-depth-1 fixture compatibility |
| `tests/brief-gap-detect-nice-to-have-dropped.test.cjs` | 149 | 1 edge-case assertion: all-NICE-TO-HAVE verdict → queueAppended=0 + niceToHaveDropped=2 + sibling .gaps.md written with severity_counts.nice_to_have=2 + state.brief.gap_queue.length=0 + state.brief.return_stack.length=0 |

### Modified

| Path | Δ Lines | Purpose |
|------|---------|---------|
| `brief/workflows/discover.md` | 303 → 429 (+126 net; +127 insertions, -1 deletion in <command_surface_assertion>) | Step 0.5 (D-10 resume auto-detect) inserted between Step 0 and Step 1; <command_surface_assertion> extended with 3 FORBIDDEN paths |

## Verification

**All plan `<verification>` checks pass:**

| Check | Expected | Actual |
|-------|----------|--------|
| `grep -c '## Step 0.5' brief/workflows/discover.md` (actual intent: Step 0.5 present) | ≥1 | 5 (1 main heading + 4 sub-sections; plan-verification text said 1 but plan-action mandates the sub-sections; used `grep -q` for Task-1 verify which matches) |
| `grep -cE '<9-slug-regex>' brief/workflows/discover.md` distinct | ≥9 | 9 distinct slugs |
| `node --test tests/brief-discover-resume-on-invocation.test.cjs tests/brief-gap-detect-nice-to-have-dropped.test.cjs` | exit 0 | 9/9 pass; 70 ms |
| `ls commands/brief/resume.md commands/brief/gap-detect.md commands/brief/return-stack.md 2>/dev/null \| wc -l` | 0 | 0 (Surface Cap preserved) |
| `wc -l brief/workflows/discover.md` | ≥360 | 429 |

**Regression posture:** 224/224 plan-relevant tests green.

| Test suite | Tests | Pass | Fail |
|------------|-------|------|------|
| tests/brief-discover-*.test.cjs | 55 | 55 | 0 |
| tests/brief-gap-detect-*.test.cjs | 88 | 88 | 0 |
| tests/brief-align-*.test.cjs + tests/brief-audience-*.test.cjs | 81 | 81 | 0 |
| **Total plan-relevant** | **224** | **224** | **0** |

(Full-suite `node scripts/run-tests.cjs` reports 50 pre-existing failures unrelated to Plan 07 — they pre-date Wave 4 and are tracked elsewhere.)

## Decisions Made

- **Fractional-step numbering for Step 0.5.** Preserves cross-references from Plan 06-01 fixture-tests, Plan 06-04 line citations in commitGapDetectVerdict comments, and agent prompts that referenced `Step N` of discover.md. Renumbering Steps 1-7 would cascade edits into 3-4 other artifacts; fractional 0.5 is zero-cost. Third canonical instance after Phase 4 Step 4.5 and Phase 5 Step 6 — the fractional-prepend pattern is now the stable BRIEF convention for cross-cutting pre/post-flow hooks.
- **Resume bypasses Steps 1-2-3 (Claude's-Discretion scope-expansion of D-10).** D-10 literally said "spawn ONLY the researcher for `top_frame.triggering_topic` (using Phase 5 `context-inject.cjs buildBusinessContext()`); skip category multi-select." The plan's must_haves truths extended this to skip Step 1 (Block-gate) and Step 2 (Stale-anchor) as well, because the paused frame was defined at push time and re-running gates on a <1min-old frame adds friction without catching a real issue. Regression mitigation: align-gate.md Step 4.5 D-11 dual-condition pop preserves gate discipline at the correct point (after new research is ALIGNED). Documented inline in Step 0.5.3 with rationale so reviewers do not flag it as a bug.
- **9-keyword→slug category mapping (not LLM-judged routing).** Per Pitfall 5 recommendation (c) "v1 simplest". Deterministic, auditable, no extra LLM call at resume time. Unmatched triggering_topic falls back to the 9-category picker (user-answerable). Can be promoted to LLM routing in v2 if pilot feedback shows mismatches.
- **No new user-facing command.** /brief-discover is already a stub from Phase 3 Plan 05. Step 0.5 is a body append; zero new commands/brief/*.md files. Surface Cap preserved per CLAUDE.md ≤12 target (reduction scheduled for Phase 9 HRD-02). 3 FORBIDDEN paths added to both the <command_surface_assertion> inline shell test AND the Surface Cap structural test for defense-in-depth.
- **NICE-TO-HAVE edge-case test uses decision: GAPS-MATERIAL-ONLY.** Per 06-RESEARCH §Open Question 3 and Plan 06-04's commitGapDetectVerdict implementation, the routing filters by per-finding severity regardless of the top-level decision enum. A verdict with decision=GAPS-MATERIAL-ONLY and all findings NICE-TO-HAVE correctly results in queueAppended=0 + niceToHaveDropped=N. This documents that the decision field is advisory; per-finding severity is dispositive — a Plan-08-verification-phase invariant worth locking.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree base did not match expected commit**
- **Found during:** Pre-Task-1 base verification
- **Issue:** Expected base `e99b5c2eeb708fca42b37a310ffeab6770cab02b` (Phase 6 Wave 3 complete) but HEAD was at `fb7385f` (Phase 3 work). The worktree appears to have been initialized from a different branch.
- **Fix:** `git reset --hard e99b5c2eeb708fca42b37a310ffeab6770cab02b` to align HEAD with the expected base. Phase 3/4/5/6 files were restored from e99b5c2. No Plan 06-07 file state was affected.
- **Files modified:** All files in the working tree (reverted to e99b5c2 state)
- **Verification:** `git rev-parse HEAD` → `e99b5c2` before Task 1 began
- **Committed in:** N/A (pre-task reset; not a code change)

**2. [Rule 3 - Blocking] Stash-pop conflict from earlier hard reset**
- **Found during:** Mid-plan regression sweep (after both Task 1 and Task 2 commits were complete)
- **Issue:** An exploratory `git stash` during regression testing captured the pre-reset Phase 3 working tree as a massive diff (143 deletions + modifications). A subsequent `git stash pop` attempted to reapply those pre-reset changes on top of my new Task-1 + Task-2 work, creating merge conflicts in 5 files.
- **Fix:** `git reset --hard f89753f` (Task 2 commit) to restore the clean post-Task-2 state; `git stash drop` to discard the pre-reset snapshot. Task 1 + Task 2 commits preserved verbatim; zero Plan 06-07 work lost.
- **Files modified:** None (reset to last known-good commit)
- **Verification:** `git log --oneline | head -3` → shows `f89753f`, `efb0ac3`, `e99b5c2` in expected order; plan-relevant test suite 224/224 green post-reset
- **Committed in:** N/A (hygiene reset; not a code change)

Both issues are worktree-infrastructure concerns, not plan-content deviations. Plan 06-07's actual implementation executed exactly as written — no Rule 1 (bug fix), Rule 2 (missing critical), or Rule 4 (architectural) deviations applied.

## Issues Encountered

- **Worktree base mismatch and stash-pop conflict** — see Deviations Rule-3 entries above. Both resolved via clean `git reset --hard` without affecting plan-content work.
- **Plan <verification> text imprecision** — the plan stated `grep -c '## Step 0.5' brief/workflows/discover.md` should return `1`, but the plan's <action> block mandates 1 main heading (`## Step 0.5:`) + 4 sub-sections (`### Step 0.5.1/2/3/4`). The actual count is 5. The Task 1 `<verify>` block correctly used `grep -q` (presence check) which matches the action reality. Recorded this discrepancy tolerance as a pattern for future planners: use presence-checks or distinct-counts in <verification>, not raw `grep -c`, when the action mandates multiple matching lines.
- **No other issues.** Both tasks executed first-try: Task 1's Step 0.5 insertion produced the file that Task 2's structural tests were designed to verify, so Task 2 went directly to GREEN without a separate RED phase (plan-intended behavior — the tests lock the shape Task 1 creates).

## User Setup Required

None — all Plan 06-07 changes are file-only (markdown workflow + CJS test files). No external services, no env vars, no credentials. Step 0.5's `node brief/bin/brief-tools.cjs state json` invocation uses existing Phase 2 infrastructure.

## Next Phase Readiness

**Plan 06-08 (canary E2E) unblocked:**

- **End-to-end ALIGN → push → resume → pop cycle** can be exercised structurally via the documented workflow path: (1) Plan 06-06's align-gate.md Step 8 pushes a frame on BLOCKING gap-detect; (2) user runs /brief-discover — Step 0.5 reads the frame via `state json`, presents 3-option menu; (3) user picks Resume — Step 0.5.3 maps triggering_topic to category slug, bypasses Steps 1-2-3, proceeds to Step 4 (context injection) + Step 5 (researcher respawn); (4) researcher writes paused_artifact + ALIGN re-runs + Step 4.5 `maybePopTopFrame` pops per D-11 dual condition. All invariants structurally testable.
- **Plan 06-08 can assert all 3 SC paths:** SC #1 (user runs /brief-discover to resume only the requested researcher) — Step 0.5 present + resume branch wired; SC #2 (hard 3-round-trip cap) — already asserted by Plan 06-04 tests; SC #3 (RETURNED-TO-DISCOVER exit message from align-gate Step 8) — Plan 06-06 territory, wired.
- **Pilot feedback hooks:** category-mapping keyword rules can be monitored by `/brief-status` round-trip counts. If a workstream accumulates 3+ near-identical fingerprints, the mapping may have misrouted — flag to pilot feedback per 06-RESEARCH Pitfall 1.

**A1 preservation**: `Object.keys(package.json.dependencies).length === 0` verified post-commit.

**Surface Cap preservation**: zero new `commands/brief/*.md` user-facing files. Structural test + inline shell test both locked at 8 FORBIDDEN paths. Pre-existing 64-command inventory unchanged by Plan 07; Phase 9 HRD-02 audit remains scheduled for the reduction to ≤12.

## Known Stubs

None. Step 0.5 is fully implemented:
- State reader: `node brief/bin/brief-tools.cjs state json` — existing Phase 2 infrastructure.
- AskUserQuestion + TEXT_MODE numbered-list: existing Phase 1 FND-06 multi-runtime parity infrastructure (consumed verbatim by Phase 4 + Phase 5 + now Phase 6).
- Category mapping: 9 explicit keyword→slug rules with 9-category-picker fallback. Fully deterministic, no LLM call. Can be extended without API break (additive keyword rules).
- Frame-pop: D-11 dual-condition, Plan 06-06 territory. NOT stubbed — Step 0.5 intentionally does NOT mutate state on resume selection per D-11 "frame stays on stack until align-gate.md Step 4.5 maybePopTopFrame call".

Step 0.5.4 (telemetry) is documented as "optional" / "no state mutation on resume selection" — this is by design (D-11 preserves frame until post-ALIGN pop), not a stub.

## Threat Flags

No new surface beyond the plan's `<threat_model>` register. The 4 STRIDE threats (T-06-07-01 through T-06-07-04) are all mitigated:

| Threat | Mitigation present in workflow? | Verified by |
|--------|--------------------------------|-------------|
| T-06-07-01 (tampering — frame-injected paths/text) | Yes — Step 0.5 only reads triggering_topic (for display) + topic_fingerprint (for category routing). paused_artifact is NOT accessed for fs ops in Step 0.5 (deferred to align-gate Step 4.5 which wraps in _resolveSafePath). Display strings pass through AskUserQuestion's rendering (no shell interpolation). | Plan content — Step 0.5.1 "Required fields … but we do not open paused_artifact here" implicit via code-flow (no fs.readFile/open call in Step 0.5.2-3); Plan 06-06 covers align-gate.md Step 4.5 path-traversal mitigation. |
| T-06-07-02 (tampering — triggering_topic → category misroute, Pitfall 5) | Yes — 9-keyword closed-set match + 9-category-picker fallback on miss. Test locks all 9 slugs present in the mapping block. | `brief-discover-resume-on-invocation.test.cjs` "Step 0.5 category mapping covers all 9 DISCOVER categories" — 9/9 slugs asserted |
| T-06-07-03 (DoS — user recursively picks Show stack to infinite-loop) | Accepted — human-in-the-loop; Ctrl-C available. Workflow markdown explicitly describes the recursion ("re-render the Step 0.5.2 AskUserQuestion (recursive — user can read the stack and still pick Resume or Start new)") — documented behavior, not a bug. | Plan content review |
| T-06-07-04 (information disclosure — Show stack dumps frame fields) | Accepted — /brief-discover is a local CLI rendering; paths are under .planning/ (not secrets). No external leakage path. | Plan content review |

## Self-Check: PASSED

Verified by direct file existence + git log commit hash check:

**Files (2 created + 1 modified):**
- `tests/brief-discover-resume-on-invocation.test.cjs` — FOUND (123 lines, 8 assertions; 9 distinct test() blocks but 1 is the fixture-shape assertion)
- `tests/brief-gap-detect-nice-to-have-dropped.test.cjs` — FOUND (149 lines, 1 edge-case assertion encompassing 8 sub-asserts)
- `brief/workflows/discover.md` — MODIFIED (429 lines; +126 net vs Plan 06-04's 303)

**Commits (2/2 found):**
- `efb0ac3` (Task 1) — FOUND in `git log`
- `f89753f` (Task 2) — FOUND in `git log`

**Test suite:** 9/9 pass (Plan 07 new tests); 224/224 pass (discover + gap-detect + align + audience regression); 0 fail within plan-relevant scope.

---

*Phase: 06-bidirectional-foundation-phase-1-2-return-stack*
*Plan: 07*
*Completed: 2026-04-24*
