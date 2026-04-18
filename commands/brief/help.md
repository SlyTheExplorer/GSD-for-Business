---
name: gsd:help
description: Show available BRIEF commands and usage guide
allowed-tools:
  - Read
---
<objective>
Display the complete BRIEF command reference.

Output ONLY the reference content below. Do NOT add:
- Project-specific analysis
- Git status or file context
- Next-step suggestions
- Any commentary beyond the reference
</objective>

<execution_context>
@~/.claude/brief/workflows/help.md
</execution_context>

<process>
Output the complete BRIEF command reference from @~/.claude/brief/workflows/help.md.
Display the reference content directly — no additions or modifications.
</process>
