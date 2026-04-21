---
name: brief:define
description: Conversational intent extractor — Mode A greenfield or Mode B amendment. Writes .planning/OBJECTIVES.md (and config.json brief.* in Plan 04). Mode A wrap-up invokes the ALIGN gate (Phase 4) for OBJECTIVES.md self-coherence.
argument-hint: "[--amend] [--unlock-intent]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
  - Task
---
<objective>
Guide a business planner through BRIEF's DEFINE phase.
Mode A (Greenfield): 20–35 min — Push Twice + Language Precision + Dream State Mapping. Produces a new .planning/OBJECTIVES.md.
Mode B (Amendment): 3–10 min — revisits mutable sections only; Immutable Intent is locked unless --unlock-intent is supplied.
After Mode A commit, the ALIGN gate runs as an orchestrator-visible step (Phase 4 canary, D-08).
</objective>

<execution_context>
@~/.claude/brief/workflows/define.md
@~/.claude/brief/workflows/align-gate.md
</execution_context>

<process>
Execute the define workflow: parse flags, run the mode-select question, branch to Mode A or Mode B, write artifacts, commit atomically. After Mode A atomic commit, invoke brief/workflows/align-gate.md in self-coherence mode (candidate=baseline=.planning/OBJECTIVES.md) per workflow Step 3.5; the ALIGN gate routes ALIGNED to exit, DRIFTED to the 3-path interrupt.
</process>
