---
name: brief:discover
description: BRIEF DISCOVER phase — broad parallel domain research across 9 default categories (Market Sizing / Competitor Landscape / Customer Research / Regulation & Compliance / Technology & Feasibility / Distribution Channels / Pricing Benchmarks / Case Studies / Trends & Forecasts) + Custom. Wave-based parallel spawn (cap 4 concurrent). Each artifact passes an AUDIENCE gate before commit. Preserves Phase 3 block-gate (DEF-05) + stale-anchor (DEF-06) pre-flow guards.
argument-hint: "[--text]"
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
  - Task
  - Write
---
<objective>
Guide the user through broad parallel domain research:
  1. Block if OBJECTIVES.md is missing required fields (DEF-05, D-12 — preserved from Phase 3).
  2. Stale-anchor 3-option interrupt if >48h since last amendment (DEF-06, D-13 — preserved from Phase 3).
  3. Multi-select 9 default categories + Custom (DSC-01, DSC-02).
  4. Build <business_context> via context-inject.cjs (CC-02, D-13, D-14); auto-attach Korea compliance primers when compliance_packs includes PIPA/ISMS-P/MyData (DSC-06).
  5. Spawn brief-domain-researcher agents in waves of ≤4 concurrent (DSC-03, D-02, D-15).
  6. AUDIENCE gate per artifact — sibling {artifact}.audience.md + state.brief.last_gate_results.audience (DSG-13, D-09, D-10, D-11).
  7. Atomic commit each artifact + sibling + STATE.md (Phase 4 Plan 04-04 inheritance).

All user-facing prompts default to Korean (Korea-signal inherited from Phase 3 D-11). TEXT_MODE
fallback for non-AskUserQuestion runtimes (FND-06).
</objective>

<execution_context>
@~/.claude/brief/workflows/discover.md
@~/.claude/brief/workflows/audience-guard.md
</execution_context>

<process>
Execute the discover workflow:
  1. Phase 3 block-gate (DEF-05) via `brief-tools objectives validate`.
  2. Phase 3 stale-anchor (DEF-06) via `brief-tools objectives stale-check` + 3-path interrupt.
  3. Category multi-select (DSC-01/DSC-02) via AskUserQuestion OR TEXT_MODE numbered list.
  4. Context-inject via `require('./brief/bin/lib/context-inject.cjs').buildBusinessContext`.
  5. Wave spawn of brief-domain-researcher Tasks (cap 4 concurrent, DSC-03).
  6. Per-artifact AUDIENCE gate via brief/workflows/audience-guard.md.
  7. Atomic commit per artifact.

See brief/workflows/discover.md for the full workflow detail.
</process>