---
phase: 06-bidirectional-foundation-phase-1-2-return-stack
plan: 02
subsystem: gates
tags: [gap-detect, return-stack, vocabulary-lock, topic-fingerprint, paired-sibling, agent-template, no-hooks]

# Dependency graph
requires:
  - phase: 04-first-gate-align-pattern-established
    provides: evaluator-optimizer gate pattern (agents/brief-align-gate.md + brief/workflows/align-gate.md + brief/references/align-vocabulary.md + brief/bin/lib/align-report.cjs — the canonical shape replicated mechanically in this plan)
  - phase: 05-discover-parallel-research-with-provenance-audience-context-injection
    provides: second canonical gate instance (agents/brief-audience-guard.md + brief/bin/lib/audience-report.cjs — copy-rename source for gap-detect agent markdown and report renderer); D-11 paired-sibling filename scheme; D-13/D-14 context-inject.cjs buildBusinessContext() primitive
provides:
  - brief/references/gap-detect-vocabulary.md (D-01 decision enum + D-03 severity enum + D-09 fingerprint contract + EN/KO/symbol ban-lists — grepped by Plan 08 vocabulary-lock test)
  - brief/bin/lib/gap-detect-report.cjs (renderGapDetectReport D-04 paired-sibling renderer — zero external runtime deps; only imports ./frontmatter.cjs)
  - agents/brief-gap-detector.md (8-section canonical agent shape + D-09 <topic_fingerprint_contract> — third instance of the Phase 4/5 gate-agent pattern; copy-rename source for Phase 7+ gates)
  - brief/workflows/gap-detect.md (orchestrator workflow invoked FROM brief/workflows/align-gate.md Step 8 per D-02; Step 5.0/5.1/5.2 iteration-aware branching with D-07 hard-cap + D-08 meta-arbiter verbatim)
affects:
  - 06-03 (gap-detect.cjs lib — imports renderGapDetectReport FROM this plan's gap-detect-report.cjs)
  - 06-06 (align-gate.md integration — adds Step 8 invoking this plan's gap-detect.md workflow)
  - 06-08 (verification — Plan 08 vocabulary-lock test + no-hooks assertion + surface-cap assertion all grep-audit files delivered by this plan)
  - 07 (DESIGN phase — gap-detector fires on every DESIGN artifact via align-gate.md Step 8)

# Tech tracking
tech-stack:
  added: []  # zero new runtime deps — preserves A1 "zero external runtime dependencies" rule
  patterns:
    - "Paired-sibling renderer shape (65-line audience-report.cjs → 102-line gap-detect-report.cjs): frontmatter + body grouped by severity H3, Korean/English headers via opts.korea, only ./frontmatter.cjs imported"
    - "8-section canonical agent shape extended: frontmatter + <role> + <required_reading> + <discipline_anchors> + <vocabulary_discipline> + <decision_mechanism> + <output_contract> + <topic_fingerprint_contract> (Phase-6 new section) + <process> + <examples>"
    - "Orchestrator workflow shape with no_hooks_assertion + command_surface_assertion blocks (inheriting Phase 4/5 structural-test-ready discipline)"
    - "Vocabulary-lock source-of-truth pattern (brief/references/*-vocabulary.md) extended to gap-detect with D-01/D-03/D-09 enums + ban-list inheritance from align + audience vocab files"

key-files:
  created:
    - brief/references/gap-detect-vocabulary.md
    - brief/bin/lib/gap-detect-report.cjs
    - agents/brief-gap-detector.md
    - brief/workflows/gap-detect.md
  modified: []

key-decisions:
  - "Four content files shipped in isolation from Plan 06-03 (gap-detect.cjs lib) — file-ownership split lets Wave 1 parallelize the two plans; Plan 03's lib imports renderGapDetectReport at its own execution time, not this plan's"
  - "Agent color set to 'red' (distinguishing from align=orange, audience=purple) — visual differentiation for the third gate agent"
  - "Gap-detect workflow has NO deterministic-first screen (unlike align-gate and audience-guard) — 'what is MISSING from the artifact' is inherently semantic, so the LLM pass always fires"
  - "Fallback verdict on subagent timeout is GAPS-MATERIAL-ONLY (not GAPS-BLOCKING) — inheriting Phase 4 D-06 'no auto-retry at gate layer' and avoiding a false return_stack push on infrastructure failure"
  - "Surface-cap discipline preserved: zero new commands/brief/*.md files (Phase 6 net = 0 user-facing commands per CLAUDE.md ≤12 cap); resume is auto-detected inside /brief-discover (D-10) rather than a new slash command"

patterns-established:
  - "Third instance of the Phase 4/5 gate canonical shape — two instances (ALIGN + AUDIENCE) become a pattern, three instances (ALIGN + AUDIENCE + GAP-DETECT) confirm the pattern is mechanical + replicable for Phase 7 COMPLIANCE"
  - "D-09 topic_fingerprint slug discipline: kebab-case 3-8 tokens, stopword ban, 3 canonical examples verbatim in agent prompt (market-sizing-korea-fintech-tam, competitor-pricing-axis-missing, regulatory-citation-pipa-article-28)"
  - "D-07 hard-cap prompt verbatim (EN + KO + TEXT_MODE) — 3 options, no option 4, no force-continue; ships inside the workflow markdown to survive agent-prompt drift"
  - "D-08 meta-arbiter prompt verbatim (EN + KO + TEXT_MODE) — 'We've gone back to research for X twice' wording ships in the workflow markdown, bypass-free"
  - "Structural-test-ready workflow: no_hooks_assertion block and command_surface_assertion block are literal text that Plan 08 greps — the assertions survive even if the prose around them is edited later"

requirements-completed: [DSG-11]

# Metrics
duration: 5m54s
completed: 2026-04-24
---

# Phase 6 Plan 02: Gap-Detector Content Files — Vocabulary, Report Renderer, Agent, Workflow Summary

**Four content files shipping the Phase 6 gap-detector surface — D-01 decision enum + D-03 severity enum + D-09 topic_fingerprint slug contract locked in a single vocabulary reference, a zero-dep paired-sibling renderer, the third canonical gate-agent markdown, and an orchestrator workflow invoked FROM align-gate.md Step 8 per D-02.**

## Performance

- **Duration:** 5m54s (354s total)
- **Started:** 2026-04-24T04:50:05Z
- **Completed:** 2026-04-24T04:55:59Z
- **Tasks:** 4 / 4
- **Files created:** 4
- **Files modified:** 0

## Accomplishments

- **D-01 + D-03 + D-09 vocabulary locked** in `brief/references/gap-detect-vocabulary.md` (89 lines) as the grep-audit source-of-truth for Plan 08's vocabulary-lock test. Decision enum (GAPS-NONE / GAPS-MATERIAL-ONLY / GAPS-BLOCKING), severity enum (blocking / material / nice-to-have) inherited from Phase 4, topic_fingerprint regex contract with 3 canonical examples, and EN/KO/symbol ban-lists inherited from align + audience vocab.
- **D-04 paired-sibling renderer shipped** as `brief/bin/lib/gap-detect-report.cjs` (102 lines, zero external runtime deps — only imports `./frontmatter.cjs`). Exports `renderGapDetectReport(verdict, opts)` producing the full markdown document with D-04 frontmatter (`phase: 06-gaps` + severity_counts + detected_at + topic_fingerprints + decision) and body grouped by severity H3 with Korean/English headers.
- **Third canonical gate agent landed** as `agents/brief-gap-detector.md` (333 lines — extending the 263-line Phase 4 ALIGN and 286-line Phase 5 AUDIENCE shape). Adds a Phase-6-new `<topic_fingerprint_contract>` section with D-09 regex + canonical examples + sanity-check rubric. Agent color `red` distinguishes from align (orange) + audience (purple). Three worked examples covering GAPS-NONE / GAPS-MATERIAL-ONLY / GAPS-BLOCKING (the last in Korean for D-11 language inheritance).
- **Orchestrator workflow wired** as `brief/workflows/gap-detect.md` (310 lines) with Step 0-6 flow: parameter parsing + TEXT_MODE detection, LLM pass (no deterministic-first screen since "what is MISSING" is inherently semantic), verdict routing by decision, iteration-aware branching at Step 5 (N=0 push, N=1 meta-arbiter D-08, N>=2 hard-cap D-07). Both D-07 and D-08 prompts ship verbatim with EN + KO + TEXT_MODE variants. `<no_hooks_assertion>` and `<command_surface_assertion>` blocks preserved as structural-test targets for Plan 08.

## Task Commits

Each task was committed atomically:

1. **Task 1: Ship brief/references/gap-detect-vocabulary.md** — `79212ee` (feat)
2. **Task 2: Ship brief/bin/lib/gap-detect-report.cjs** — `dfdce1f` (feat)
3. **Task 3: Ship agents/brief-gap-detector.md** — `cb53ce0` (feat)
4. **Task 4: Ship brief/workflows/gap-detect.md** — `028ac35` (feat)

_Plan metadata commit pending — orchestrator owns STATE.md / ROADMAP.md writes after all worktree agents complete._

## Files Created/Modified

- `brief/references/gap-detect-vocabulary.md` (89 lines) — D-01 decision enum, D-03 severity enum, D-09 fingerprint contract, EN/KO/symbol ban-lists, preferred vocabulary phrasings for findings descriptions
- `brief/bin/lib/gap-detect-report.cjs` (102 lines) — `renderGapDetectReport(verdict, opts)` D-04 paired-sibling markdown renderer (zero external deps; only requires `./frontmatter.cjs`; mirrors audience-report.cjs shape)
- `agents/brief-gap-detector.md` (333 lines) — LLM evaluator agent prompt; 8-section canonical shape extended with Phase-6-new `<topic_fingerprint_contract>` section; three worked examples (GAPS-NONE, GAPS-MATERIAL-ONLY, GAPS-BLOCKING Korean)
- `brief/workflows/gap-detect.md` (310 lines) — orchestrator workflow invoked FROM brief/workflows/align-gate.md Step 8 per D-02; Step 0 through Step 6 with iteration-aware Step 5 branching (D-07 + D-08 prompts verbatim)

## Verification

**All plan `<verification>` checks pass:**

| Check | Result |
|-------|--------|
| `test -f brief/references/gap-detect-vocabulary.md` | PASS |
| `test -f brief/bin/lib/gap-detect-report.cjs` | PASS |
| `test -f agents/brief-gap-detector.md` | PASS |
| `test -f brief/workflows/gap-detect.md` | PASS |
| `require('./brief/bin/lib/gap-detect-report.cjs').renderGapDetectReport` is a function | PASS |
| `grep -cE 'GAPS-(NONE|MATERIAL-ONLY|BLOCKING)' brief/workflows/gap-detect.md >= 3` | PASS (13 hits) |
| `grep -cE 'GAPS-(NONE|MATERIAL-ONLY|BLOCKING)' agents/brief-gap-detector.md >= 3` | PASS (20 hits) |
| `grep -cE 'GAPS-(NONE|MATERIAL-ONLY|BLOCKING)' brief/references/gap-detect-vocabulary.md >= 3` | PASS (4 hits) |
| `grep -c 'RETURNED-TO-DISCOVER' brief/workflows/gap-detect.md >= 1` | PASS (3 hits) |
| `grep -c 'topic_fingerprint' agents/brief-gap-detector.md >= 3` | PASS (10 hits) |
| Surface Cap: no new `commands/brief/*.md` files (gap-detect / gap / return-stack / resume) | PASS (0 matches) |

**Smoke test (Task 2 verify):** `node -e "const { renderGapDetectReport } = require('./brief/bin/lib/gap-detect-report.cjs'); ..."` renders a BLOCKING verdict with output containing `phase: 06-gaps`, the topic fingerprint, the BLOCKING section header, and the artifact path — without throwing.

**Acceptance grep counts (D-09 canonical fingerprint examples):**

| Fingerprint | Agent | Vocabulary |
|-------------|-------|------------|
| `market-sizing-korea-fintech-tam` | 2 | 1 |
| `competitor-pricing-axis-missing` | 3 | 1 |
| `regulatory-citation-pipa-article-28` | 2 | 1 |

All 3 canonical examples appear in both the agent prompt body (examples + `<topic_fingerprint_contract>` section) and the vocabulary reference (D-09 lock source).

**Ban-list discipline:** the ban-list tokens (`compliant` / `passed` / `violation` / `failed`) appear ONLY in the backticked banned-items declaration inside `<vocabulary_discipline>` in agents/brief-gap-detector.md (line 82) — this matches the exact Phase 4 brief-align-gate.md line 64 and Phase 5 brief-audience-guard.md line 76 pattern. No ban-list tokens are used as verdict language anywhere in the shipped files.

## Decisions Made

- **Agent color = `red`** (distinguishing from align=orange, audience=purple) — visual differentiation for the third gate agent. Phase 7 COMPLIANCE will pick its own color at copy-rename time.
- **No deterministic-first screen in the gap-detect workflow** — unlike align-gate.md Step 1 and audience-guard.md Step 1 which short-circuit when a deterministic rule fires, gap-detect ALWAYS spawns the LLM subagent. Rationale: "what content is MISSING from the artifact that OBJECTIVES.md implies should be there" is inherently semantic; there is no deterministic rule that beats the LLM for discovery.
- **Fallback verdict on subagent timeout = GAPS-MATERIAL-ONLY** (not GAPS-BLOCKING). Rationale: a timeout is an infrastructure failure, not evidence of a blocking gap. Emitting GAPS-BLOCKING on timeout would push a false frame onto the return_stack and trigger a spurious RETURNED-TO-DISCOVER exit. MATERIAL-ONLY is the correct conservative default — the workflow proceeds with a caveat instead of derailing.
- **Four content files SHIPPED in isolation from Plan 06-03 (gap-detect.cjs lib)** — file-ownership split lets Wave 1 parallelize the two plans. Plan 03's lib imports `renderGapDetectReport` at its own execution time (not at this plan's execution time), so zero import-time circularity and zero wave-ordering constraint. Verified by `grep require\\(` on gap-detect-report.cjs showing the only import is `./frontmatter.cjs`.

## Deviations from Plan

None — plan executed exactly as written.

Task 3's automated `<verify>` grep was known-imprecise (documented in the plan's `done` criteria: "OK to mention them AS banned items"). The agent markdown matches the Phase 4 ALIGN and Phase 5 AUDIENCE canonical shape verbatim at the line-82 banned-items declaration, so the single `grep -nE '\\bcompliant\\b...'` hit is the expected-and-accepted pattern. This is noted for reference, not a deviation.

## Issues Encountered

- **Worktree initialization required soft-reset + checkout to align with expected base.** The worktree branch's HEAD had advanced past the expected base commit `816f979` (the pre-execution configuration assumes all worktree agents start from the same base). `git reset --soft` moved HEAD back but the working tree still carried files from the advanced commit; `git checkout HEAD -- .planning/ agents/ brief/ commands/ hooks/ scripts/ tests/ bin/install.js .gitignore` synced the disk back to the expected base. No Plan 06-02 file state was affected — this was pre-task housekeeping before Task 1 started.

## User Setup Required

None — no external service configuration required. The four shipped files are pure content (markdown) and pure Node.js (CommonJS, zero external runtime deps).

## Next Phase Readiness

- **Plan 06-03 unblocked** — gap-detect.cjs lib can now `require('./gap-detect-report.cjs').renderGapDetectReport` at its own execution time. The gap-detect-report.cjs module exports the single `renderGapDetectReport` function that Plan 03's `commitGapDetectVerdict` calls to write the paired-sibling `{artifact}.gaps.md` atomically.
- **Plan 06-06 unblocked** — align-gate.md Step 8 integration can reference `brief/workflows/gap-detect.md` as the post-verdict invocation target and `agents/brief-gap-detector.md` as the subagent spawned from inside that workflow.
- **Plan 06-08 unblocked** — Plan 08's vocabulary-lock test can grep `brief/references/gap-detect-vocabulary.md` for the EN/KO/symbol ban-list entries; Plan 08's no_hooks_assertion test can grep `hooks/` for `gap-detect|brief-gap-detector`; Plan 08's command-surface-assertion test can confirm zero new `commands/brief/*.md` files.
- **Zero runtime deps preserved** (A1) — `gap-detect-report.cjs` imports only `./frontmatter.cjs`; no external dependency added to `package.json`.
- **Surface Cap preserved** (CLAUDE.md ≤12 user-facing commands) — Phase 6 net adds = 0 user-facing slash commands. Resume flow is inside `/brief-discover` (D-10).

## Self-Check: PASSED

Verified by direct file existence check + git log commit hash check:

- **Files:** all four listed in `provides:` frontmatter exist on disk (confirmed by `test -f`).
- **Commits:** all four commit hashes (`79212ee`, `dfdce1f`, `cb53ce0`, `028ac35`) appear in `git log --oneline --all`.
- **Smoke:** `node -e "require('./brief/bin/lib/gap-detect-report.cjs').renderGapDetectReport"` evaluates to a function + the BLOCKING smoke-test output contains `phase: 06-gaps` + the fingerprint.

---

*Phase: 06-bidirectional-foundation-phase-1-2-return-stack*
*Plan: 02*
*Completed: 2026-04-24*
