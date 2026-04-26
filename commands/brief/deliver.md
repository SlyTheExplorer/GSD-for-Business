---
name: brief:deliver
description: BRIEF DELIVER phase — Type A path auto-synthesizes 4 PRD-input markdown artifacts (PRODUCT-BRIEF / SERVICE-POLICY / HIGH-LEVEL-SPEC / FEATURE-MAP) from 9 workstream outputs + OBJECTIVES.md immutable intent. Type B path generates a single Marp deck or 1-2 page memo (INTERNAL-DECK / PROPOSAL-DECK / EXEC-SUMMARY / DECISION-MEMO) with voice-fit + AUDIENCE + COMPLIANCE gates. Each artifact passes ALIGN → AUDIENCE → COMPLIANCE inline before commit. Phase 8 DLV-01..04 (Type A) + DLV-05/06 (Type B).
argument-hint: "--type-a | --type-b <name> [--en] [--text]"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
  - Task
  - Write
---
<objective>
Run a single deliver-phase invocation:
  1. Block if OBJECTIVES.md is missing required fields (DEF-05, D-12 — preserved from Phase 3).
  2. Stale-anchor 3-option interrupt if >48h since last amendment (DEF-06, D-13 — preserved from Phase 3).
  3. Parse mode: --type-a (loop over 4 PRD-input artifacts) OR --type-b <name> (single deck/memo synthesis).
  4. Type A path — for each of the 4 TYPE_A_ARTIFACTS, dispatch `brief-tools deliver synthesize --artifact <key>`, thread the produced artifact through ALIGN → AUDIENCE → COMPLIANCE inline (3-gate fail-fast on BLOCKING per Phase 7 D-02), atomic commit (artifact + .audience.md + .compliance.md + STATE.md per Plan 04 commit pattern).
  5. Type B path — build business_context, spawn brief-deliver-type-b agent for the named artifact (internal-deck / proposal-deck / exec-summary / decision-memo); on agent return, run voice-fit banned-words density check (1-shot regenerate signal when exceedsThreshold AND artifact is external); thread through AUDIENCE + COMPLIANCE; atomic commit; instruct user to run `/brief-export <name>` for Marp render.
  6. Update state.brief.deliverable_index per Plan 04 PHASE_8_BRIEF_FIELDS allowlist.
  7. Korean is the default voice when state.brief.region == 'kr'. TEXT_MODE fallback for non-AskUserQuestion runtimes (FND-06).

OBJECTIVES.md insufficiency routes through `/brief-define --amend` directive (D-06 — no return-stack push, mirrors Phase 7 design.md).
</objective>

<execution_context>
@~/.claude/brief/workflows/deliver.md
@~/.claude/brief/workflows/audience-guard.md
@~/.claude/brief/workflows/compliance.md
</execution_context>

<process>
Execute the deliver workflow per `brief/workflows/deliver.md`:

  1. Phase 3 block-gate (DEF-05) via `brief-tools objectives validate`.
  2. Phase 3 stale-anchor (DEF-06) via `brief-tools objectives stale-check` + 3-path interrupt.
  3. Mode parse — Type A vs Type B routing per first positional arg.
  4. Type A path — loop synthesizeTypeA over the 4 frozen artifact keys; each produced
     artifact passes through ALIGN → AUDIENCE → COMPLIANCE inline; atomic commit per artifact.
  5. Type B path — single brief-deliver-type-b Task spawn; voice-fit dispatch on returned
     artifact; AUDIENCE + COMPLIANCE inline; atomic commit; print user-visible /brief-export hint.
  6. Update state.brief.deliverable_index entries.

See brief/workflows/deliver.md for the full step-by-step orchestration detail (Steps 0–4).
</process>
