---
name: brief:help
description: Categorized BRIEF command reference (4D phase grouping — DEFINE / DISCOVER / DESIGN / DELIVER / HELPERS) with partial-keyword topic match and Levenshtein typo correction (top-3, distance ≤ 3). Run with no argument for full listing; with `<topic>` for partial-keyword match; unmatched input returns top-3 Levenshtein suggestions. Phase 9 HRD-03 / C-D01..C-D04.
argument-hint: "[<topic>]"
allowed-tools:
  - Read
  - Bash
---
<objective>
Render the BRIEF command reference categorized by 4D phase (DEFINE / DISCOVER / DESIGN / DELIVER + HELPERS).

- No argument: full categorized listing of every command in `commands/brief/*.md`.
- `<topic>` (e.g., `def`, `discover`, `audit`): case-insensitive substring/prefix match on slug + description; on match, render the matching commands plus the body of the first matched command's `.md` file.
- No match: top-3 Levenshtein suggestions with distance ≤ 3 (e.g., `desin` → `design` (1), `define` (2)).

Output ONLY the help content. Do NOT add:
- Project-specific analysis
- Git status or file context
- Next-step suggestions
- Any commentary beyond the help reference.
</objective>

<context>
$ARGUMENTS
</context>

<process>
Execute `brief-tools.cjs help $ARGUMENTS --raw` and print stdout verbatim. If `$ARGUMENTS` is empty, run `brief-tools.cjs help --raw` (no topic). Read-only — no writes.
</process>
