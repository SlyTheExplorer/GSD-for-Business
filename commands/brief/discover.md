---
name: brief:discover
description: BRIEF DISCOVER phase — broad domain research. Phase 3 ships gate-only stub; full parallel-research flow arrives in Phase 5.
argument-hint: ""
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
---
<objective>
Phase 3 (canary) ships only the block-gate + stale-anchor entry point for `/brief-discover`.
Full DISCOVER parallel-research flow arrives in Phase 5.

If OBJECTIVES.md is missing required fields, `/brief-discover` blocks with a Korean
recovery-oriented error (DEF-05, D-12). If OBJECTIVES.md is stale (>48h since last
amendment), the stale-anchor 3-option interrupt fires before any work begins (DEF-06,
D-13 — wired in Plan 06).
</objective>

<execution_context>
@~/.claude/brief/workflows/discover.md
</execution_context>

<process>
Execute the discover workflow stub: run the block-gate via `brief-tools objectives validate`.
If the gate passes, run the stale-anchor check (Plan 06 wires the interactive prompt), then
print the Phase 5 placeholder message.
</process>
