---
name: brief:status
description: Show current BRIEF workflow position — phase, workstream, return-stack depth, last ALIGN/COMPLIANCE results.
argument-hint: ""
allowed-tools:
  - Read
  - Bash
---
<objective>
Render a one-screen compact dashboard of BRIEF workflow state.
Provides situational awareness for business planners navigating DEFINE → DISCOVER → DESIGN → DELIVER phases.
</objective>

<execution_context>
@~/.claude/brief/workflows/status.md
</execution_context>

<process>
Execute the status workflow: invoke `brief-tools.cjs status` and print the compact-dashboard stdout verbatim.
Read-only — no writes to STATE.md, no side effects.
</process>
