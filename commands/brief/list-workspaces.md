---
name: gsd:list-workspaces
description: List active BRIEF workspaces and their status
allowed-tools:
  - Bash
  - Read
---
<objective>
Scan `~/brief-workspaces/` for workspace directories containing `WORKSPACE.md` manifests. Display a summary table with name, path, repo count, strategy, and BRIEF project status.
</objective>

<execution_context>
@~/.claude/brief/workflows/list-workspaces.md
@~/.claude/brief/references/ui-brand.md
</execution_context>

<process>
Execute the list-workspaces workflow from @~/.claude/brief/workflows/list-workspaces.md end-to-end.
</process>
