---
name: brief:define
description: Conversational intent extractor — Mode A greenfield or Mode B amendment. Writes .planning/OBJECTIVES.md (and config.json brief.* in Plan 04).
argument-hint: "[--amend] [--unlock-intent]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
---
<objective>
Guide a business planner through BRIEF's DEFINE phase.
Mode A (Greenfield): 20–35 min — Push Twice + Language Precision + Dream State Mapping. Produces a new .planning/OBJECTIVES.md.
Mode B (Amendment): 3–10 min — revisits mutable sections only; Immutable Intent is locked unless --unlock-intent is supplied.
</objective>

<execution_context>
@~/.claude/brief/workflows/define.md
</execution_context>

<process>
Execute the define workflow: parse flags, run the mode-select question, branch to Mode A or Mode B, write artifacts, commit atomically.
</process>
