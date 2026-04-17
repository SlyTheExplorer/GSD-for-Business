---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  # D-01 agents (existence verified)
  - "agents/gsd-code-reviewer.md"
  - "agents/gsd-code-fixer.md"
  - "agents/gsd-debugger.md"
  - "agents/gsd-ui-researcher.md"
  - "agents/gsd-ui-checker.md"
  - "agents/gsd-ui-auditor.md"
  - "agents/gsd-ai-researcher.md"
  - "agents/gsd-eval-planner.md"
  - "agents/gsd-eval-auditor.md"
  - "agents/gsd-domain-researcher.md"
  - "agents/gsd-security-auditor.md"
  - "agents/gsd-integration-checker.md"
  # D-01 commands
  - "commands/gsd/code-review.md"
  - "commands/gsd/code-review-fix.md"
  - "commands/gsd/add-tests.md"
  - "commands/gsd/ui-phase.md"
  - "commands/gsd/ui-review.md"
  - "commands/gsd/ai-integration-phase.md"
  - "commands/gsd/eval-review.md"
  - "commands/gsd/secure-phase.md"
  # D-01 workflows
  - "get-shit-done/workflows/add-tests.md"
  - "get-shit-done/workflows/ai-integration-phase.md"
  - "get-shit-done/workflows/code-review.md"
  - "get-shit-done/workflows/code-review-fix.md"
  - "get-shit-done/workflows/eval-review.md"
  - "get-shit-done/workflows/secure-phase.md"
  - "get-shit-done/workflows/ui-phase.md"
  - "get-shit-done/workflows/ui-review.md"
  # D-01 templates
  - "get-shit-done/templates/AI-SPEC.md"
  - "get-shit-done/templates/UI-SPEC.md"
  - "get-shit-done/templates/SECURITY.md"
  # D-01 references
  - "get-shit-done/references/tdd.md"
  - "get-shit-done/references/ai-evals.md"
  - "get-shit-done/references/ai-frameworks.md"
  - "get-shit-done/references/ui-brand.md"
  # D-02 borderline agents
  - "agents/gsd-debug-session-manager.md"
  # D-02 borderline commands
  - "commands/gsd/debug.md"
  - "commands/gsd/forensics.md"
  - "commands/gsd/graphify.md"
  - "commands/gsd/inbox.md"
  - "commands/gsd/pr-branch.md"
  - "commands/gsd/ship.md"
  # D-02 borderline workflows
  - "get-shit-done/workflows/forensics.md"
  - "get-shit-done/workflows/inbox.md"
  - "get-shit-done/workflows/pr-branch.md"
  - "get-shit-done/workflows/ship.md"
  # D-03 recursive: tests for removed commands
  # NOTE: tests/graphify.test.cjs is NOT removed because graphify.cjs survives
  # as a workflow primitive (see interfaces). Removing the test while keeping
  # the code would leave the survivor untested.
  - "tests/code-review.test.cjs"
  - "tests/code-review-command.test.cjs"
  - "tests/code-review-summary-parser.test.cjs"
  - "tests/secure-phase.test.cjs"
  - "tests/ai-evals.test.cjs"
  - "tests/forensics.test.cjs"
  - "tests/debug-session-management.test.cjs"
  - "tests/playwright-ui-verify.test.cjs"
  - "tests/plan-phase-ui-redirect.test.cjs"
  - "tests/autonomous-ui-steps.test.cjs"
autonomous: true
requirements:
  - FND-02
user_setup: []

must_haves:
  truths:
    - "User runs `ls agents/gsd-code-*.md` and gets no results (removed)"
    - "User runs `ls commands/gsd/code-review.md commands/gsd/ui-phase.md commands/gsd/ai-integration-phase.md commands/gsd/secure-phase.md commands/gsd/add-tests.md` and gets no results"
    - "User runs `ls agents/gsd-ui-*.md agents/gsd-ai-researcher.md agents/gsd-eval-*.md agents/gsd-security-auditor.md agents/gsd-integration-checker.md agents/gsd-domain-researcher.md agents/gsd-debug*.md` and gets no results"
    - "User runs `ls commands/gsd/debug.md commands/gsd/forensics.md commands/gsd/graphify.md commands/gsd/inbox.md commands/gsd/pr-branch.md commands/gsd/ship.md` and gets no results"
    - "Repository remains in a buildable state: `node -e \"require('./get-shit-done/bin/lib/core.cjs')\"` exits 0"
    - "`tests/removed-surfaces.smoke.txt` contains a populated `# ORPHAN REFERENCES TO REPAIR IN PLAN 05` section listing every file+line location where a removed-agent identifier still appears in surviving code (Plan 05 will surgically delete or edit those lines; blanket substitution alone is unsafe per checker WARNINGs #3, #4, #5)"
    - "No orphaned workflow/template/reference/test files remain for the removed commands (D-03 recursive rule), EXCEPT tests/graphify.test.cjs which survives because graphify.cjs is required by gsd-tools.cjs graphify subcommand"
  artifacts:
    - path: "tests/removed-surfaces.smoke.txt"
      provides: "Audit trail of deleted files + orphan-reference list for Plan 05 surgical edits"
      contains: "list of deleted file paths + orphan references (file:line:snippet)"
  key_links:
    - from: "commands/gsd/*.md (survivors)"
      to: "agents/gsd-*.md (survivors)"
      via: "subagent_type references in command bodies"
      pattern: "no survivor command references a removed agent"
    - from: "tests/removed-surfaces.smoke.txt ORPHAN REFERENCES section"
      to: "Plan 05's surgical-edit list (Task 1 step 4-BIS)"
      via: "file:line:snippet records that Plan 05 parses"
      pattern: "every removed-agent reference has a concrete deletion/edit target"
---

<objective>
Execute commit 2 of 6 (per D-08 expanded — see Plan 06 for commit-count reconciliation): the bulk removal of ~37–44 GSD development-specific files. This plan enumerates the exact removal set from D-01 (original 28-file set: code review, test, UI, AI/LLM eval, security-audit, integration-checker), D-02 (borderline additions: debug, forensics, graphify, inbox, pr-branch, ship — spike/sketch were already absent), and D-03 (recursive rule: for every removed command, delete matching agent + workflow + template + reference + test file).

**IMPORTANT D-03 exception discovered during revision:** `get-shit-done/bin/lib/graphify.cjs` and `tests/graphify.test.cjs` SURVIVE Plan 02. Although `commands/gsd/graphify.md` is removed (the user-facing slash command), `graphify.cjs` is a workflow primitive imported by `get-shit-done/bin/gsd-tools.cjs` at line 1091 AND called by surviving agents (`agents/gsd-planner.md` line 871, `agents/gsd-phase-researcher.md` line 562) to drive dependency-graph queries. Removing `graphify.cjs` would break `gsd-tools graphify <subcommand>` which the planner workflow uses. Its test must also remain for coverage.

Purpose: Honor FND-02 (no GSD dev-specific commands/agents/hooks remain visible as `/brief-*` autocomplete targets after Phase 1) and the "sales/strategy deliverables" identity (per <specifics> note). After this plan, the codebase no longer visibly resembles a dev-centric framework at the file-level inventory.

Output: Removed files (via `git rm`), one atomic commit, a `tests/removed-surfaces.smoke.txt` audit-trail file recording (a) what was removed, and (b) an ORPHAN REFERENCES section — a concrete list of file:line:snippet records that Plan 05 will use for surgical deletion/edit of surviving docs that enumerate removed agents.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md

<interfaces>
<!-- Files and directories that MUST survive this removal (for post-removal verification): -->
<!-- Core workflow agents: gsd-planner, gsd-executor, gsd-verifier, gsd-plan-checker -->
<!-- Workflow commands: new-project, new-milestone, discuss-phase, plan-phase, execute-phase, verify-work -->
<!-- Hooks: all 11 gsd-* hooks (no removals in this plan — rename happens in Plan 03) -->
<!-- get-shit-done/bin/: entire bin layer including gsd-tools.cjs (no removals — rename in Plan 04) -->
<!-- get-shit-done/bin/lib/graphify.cjs: SURVIVES — workflow primitive used by gsd-tools.cjs + surviving agents -->
<!-- tests/graphify.test.cjs: SURVIVES — covers surviving graphify.cjs -->

<!-- D-03 recursive targets (every removed command's workflow/template/reference/test MUST also go): -->
<!-- code-review* → commands/gsd/code-review*.md + get-shit-done/workflows/code-review*.md + tests/code-review*.test.cjs -->
<!-- add-tests → commands/gsd/add-tests.md + get-shit-done/workflows/add-tests.md + tests for add-tests (grep to find) -->
<!-- ui-phase, ui-review → commands + workflows + UI-SPEC.md template + ui-brand.md reference + playwright/ui tests -->
<!-- ai-integration-phase, eval-review → commands + workflows + AI-SPEC.md + ai-evals.md + ai-frameworks.md references + ai-evals tests -->
<!-- secure-phase → command + workflow + SECURITY.md template + tests/secure-phase.test.cjs + tests/security-scan.test.cjs? (keep if still used by surviving code) -->
<!-- debug → command + gsd-debug-session-manager agent + workflow + tests/debug-session-management.test.cjs -->
<!-- forensics → command + workflow + tests/forensics.test.cjs -->
<!-- graphify → command ONLY (lib/graphify.cjs and its test SURVIVE — see note above) -->
<!-- inbox → command + workflow -->
<!-- pr-branch → command + workflow + tests/bug-2004-pr-branch-milestone.test.cjs? (keep unless test solely covers removed behavior) -->
<!-- ship → command + workflow -->

<!-- Known surviving docs that enumerate removed agents (Plan 05 MUST surgically edit these — -->
<!-- the Task 1 orphan audit below produces the authoritative list, but these are the ones -->
<!-- the planner already identified during revision): -->
<!--   get-shit-done/workflows/execute-phase.md lines 43, 45, 47, 48, 49 — available_agent_types list -->
<!--   get-shit-done/workflows/quick.md line 26 — available_agent_types list -->
<!--   get-shit-done/workflows/diagnose-issues.md — entire file depends on removed gsd-debugger -->
<!--   get-shit-done/workflows/audit-milestone.md — depends on removed gsd-integration-checker -->
<!--   get-shit-done/references/model-profiles.md lines 15, 19, 64 — table row + override example -->
<!--   get-shit-done/references/agent-contracts.md lines 19, 21, 22, 23, 25, 27 — registry table rows -->
<!--   get-shit-done/bin/lib/model-profiles.cjs lines 16, 20, 23, 24, 25 — object-literal entries -->
<!--   agents/gsd-*.md survivors — any `subagent_type: gsd-<removed>` lines in their bodies -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Pre-removal inventory + orphan-reference audit (builds Plan 05's surgical-edit list)</name>
  <files>
    tests/removed-surfaces.smoke.txt
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-01, D-02, D-03, D-04 enumeration rules)
    - The output of the commands below (establishes the actual removal set for THIS repo)
  </read_first>
  <action>
Build the authoritative removal list by checking which files actually exist. This task runs BEFORE any deletion so nothing is lost silently. It ALSO produces a concrete orphan-reference list (file:line:snippet) that Plan 05 uses to surgically delete or edit lines in surviving docs — addressing checker WARNINGs #3, #4, #5 about blanket substitution creating contradictory content.

1. Run this enumeration block from repo root `/Users/agent/GSD-for-Business`:

```bash
# D-01 ORIGINAL 28 SET
D01_AGENTS=(
  "agents/gsd-code-reviewer.md"
  "agents/gsd-code-fixer.md"
  "agents/gsd-debugger.md"
  "agents/gsd-ui-researcher.md"
  "agents/gsd-ui-checker.md"
  "agents/gsd-ui-auditor.md"
  "agents/gsd-ai-researcher.md"
  "agents/gsd-eval-planner.md"
  "agents/gsd-eval-auditor.md"
  "agents/gsd-domain-researcher.md"
  "agents/gsd-security-auditor.md"
  "agents/gsd-integration-checker.md"
)
D01_COMMANDS=(
  "commands/gsd/code-review.md"
  "commands/gsd/code-review-fix.md"
  "commands/gsd/add-tests.md"
  "commands/gsd/ui-phase.md"
  "commands/gsd/ui-review.md"
  "commands/gsd/ai-integration-phase.md"
  "commands/gsd/eval-review.md"
  "commands/gsd/secure-phase.md"
)
D01_WORKFLOWS=(
  "get-shit-done/workflows/add-tests.md"
  "get-shit-done/workflows/ai-integration-phase.md"
  "get-shit-done/workflows/code-review.md"
  "get-shit-done/workflows/code-review-fix.md"
  "get-shit-done/workflows/eval-review.md"
  "get-shit-done/workflows/secure-phase.md"
  "get-shit-done/workflows/ui-phase.md"
  "get-shit-done/workflows/ui-review.md"
)
D01_TEMPLATES=(
  "get-shit-done/templates/AI-SPEC.md"
  "get-shit-done/templates/UI-SPEC.md"
  "get-shit-done/templates/SECURITY.md"
)
D01_REFERENCES=(
  "get-shit-done/references/tdd.md"
  "get-shit-done/references/ai-evals.md"
  "get-shit-done/references/ai-frameworks.md"
  "get-shit-done/references/ui-brand.md"
)
# D-02 BORDERLINE SET (verified via ls at planning time — gsd-spike* / gsd-sketch* do NOT exist in this repo)
D02_AGENTS=(
  "agents/gsd-debug-session-manager.md"
)
D02_COMMANDS=(
  "commands/gsd/debug.md"
  "commands/gsd/forensics.md"
  "commands/gsd/graphify.md"
  "commands/gsd/inbox.md"
  "commands/gsd/pr-branch.md"
  "commands/gsd/ship.md"
)
D02_WORKFLOWS=(
  "get-shit-done/workflows/forensics.md"
  "get-shit-done/workflows/inbox.md"
  "get-shit-done/workflows/pr-branch.md"
  "get-shit-done/workflows/ship.md"
)
# D-03 RECURSIVE: tests that ONLY test removed surfaces (planning-time grep confirmed these match)
# NOTE: tests/graphify.test.cjs is intentionally NOT in this list — graphify.cjs survives
D03_TESTS=(
  "tests/code-review.test.cjs"
  "tests/code-review-command.test.cjs"
  "tests/code-review-summary-parser.test.cjs"
  "tests/secure-phase.test.cjs"
  "tests/ai-evals.test.cjs"
  "tests/forensics.test.cjs"
  "tests/debug-session-management.test.cjs"
  "tests/playwright-ui-verify.test.cjs"
  "tests/plan-phase-ui-redirect.test.cjs"
  "tests/autonomous-ui-steps.test.cjs"
)

ALL_CANDIDATES=("${D01_AGENTS[@]}" "${D01_COMMANDS[@]}" "${D01_WORKFLOWS[@]}" "${D01_TEMPLATES[@]}" "${D01_REFERENCES[@]}" "${D02_AGENTS[@]}" "${D02_COMMANDS[@]}" "${D02_WORKFLOWS[@]}" "${D03_TESTS[@]}")

echo "# Phase 1 Plan 02: Removal Audit Trail" > tests/removed-surfaces.smoke.txt
echo "# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> tests/removed-surfaces.smoke.txt
echo "" >> tests/removed-surfaces.smoke.txt
EXIST_COUNT=0
MISSING_COUNT=0
for f in "${ALL_CANDIDATES[@]}"; do
  if [ -f "$f" ]; then
    echo "EXISTS: $f" >> tests/removed-surfaces.smoke.txt
    EXIST_COUNT=$((EXIST_COUNT+1))
  else
    echo "MISSING: $f (skipped per D-03 note — not present in this repo)" >> tests/removed-surfaces.smoke.txt
    MISSING_COUNT=$((MISSING_COUNT+1))
  fi
done
echo "" >> tests/removed-surfaces.smoke.txt
echo "# Totals: $EXIST_COUNT to delete, $MISSING_COUNT already absent" >> tests/removed-surfaces.smoke.txt
cat tests/removed-surfaces.smoke.txt | tail -5
```

2. Confirm: `EXIST_COUNT` should be in the 37–44 range per D-04 (one lower than before because graphify.test.cjs now survives). If it falls outside this range by >5, pause and re-inspect — something in D-01/D-02 may have unexpected status.

3. **ORPHAN REFERENCE AUDIT — produces Plan 05's surgical-edit list.** Write a `# ORPHAN REFERENCES TO REPAIR IN PLAN 05 (SURGICAL EDITS)` section with exact file:line:snippet records. Plan 05 parses this section and deletes or edits each recorded line — NOT via blanket substitution.

```bash
echo "" >> tests/removed-surfaces.smoke.txt
echo "# ORPHAN REFERENCES TO REPAIR IN PLAN 05 (SURGICAL EDITS)" >> tests/removed-surfaces.smoke.txt
echo "# Format: file:line:snippet — Plan 05 parses this section and DELETES or EDITS" >> tests/removed-surfaces.smoke.txt
echo "# each recorded line rather than running a blanket substitution (which would" >> tests/removed-surfaces.smoke.txt
echo "# produce duplicate 'brief-executor' entries — see checker WARNINGs #3, #4, #5)." >> tests/removed-surfaces.smoke.txt
echo "" >> tests/removed-surfaces.smoke.txt

REMOVED_AGENTS="gsd-code-reviewer gsd-code-fixer gsd-debugger gsd-ui-researcher gsd-ui-checker gsd-ui-auditor gsd-ai-researcher gsd-eval-planner gsd-eval-auditor gsd-domain-researcher gsd-security-auditor gsd-integration-checker gsd-debug-session-manager"

# 3a. Surviving .md documentation: list files (bulleted list entries, table rows, paragraph mentions)
echo "## Surviving markdown files (surgical delete/edit required)" >> tests/removed-surfaces.smoke.txt
for removed_agent in $REMOVED_AGENTS; do
  # Search agents/, commands/, get-shit-done/workflows/, get-shit-done/references/, get-shit-done/templates/
  # Skip any file that IS being removed (listed as EXISTS: above)
  MATCHES=$(grep -rn "$removed_agent" \
    agents/ \
    commands/gsd/ \
    get-shit-done/workflows/ \
    get-shit-done/references/ \
    get-shit-done/templates/ \
    2>/dev/null | \
    grep -v "^agents/$removed_agent\.md:" | \
    grep -v "removed-surfaces.smoke.txt")
  if [ -n "$MATCHES" ]; then
    # Filter out matches in files that are themselves being removed
    echo "$MATCHES" | while IFS= read -r match; do
      filepath=$(echo "$match" | cut -d: -f1)
      # Is this file in the removal list?
      if ! grep -q "^EXISTS: $filepath$" tests/removed-surfaces.smoke.txt; then
        echo "$match" >> tests/removed-surfaces.smoke.txt
      fi
    done
  fi
done
echo "" >> tests/removed-surfaces.smoke.txt

# 3b. Surviving .cjs / .js source files (model-profiles.cjs, any lib code with agent IDs)
echo "## Surviving .cjs / .js source files (surgical delete required — DELETE object-literal keys and switch cases BEFORE any blanket substitution runs; prevents duplicate-key silent overwrites per checker WARNING #4)" >> tests/removed-surfaces.smoke.txt
for removed_agent in $REMOVED_AGENTS; do
  MATCHES=$(grep -rn "$removed_agent" \
    get-shit-done/bin/ \
    hooks/ \
    scripts/ \
    bin/ \
    --include="*.cjs" --include="*.js" \
    2>/dev/null)
  if [ -n "$MATCHES" ]; then
    echo "$MATCHES" >> tests/removed-surfaces.smoke.txt
  fi
done
echo "" >> tests/removed-surfaces.smoke.txt

# 3c. Summary counts
MD_ORPHANS=$(awk '/## Surviving markdown/,/## Surviving \.cjs/' tests/removed-surfaces.smoke.txt | grep -c ":" || echo 0)
CJS_ORPHANS=$(awk '/## Surviving \.cjs/,/^$/' tests/removed-surfaces.smoke.txt | grep -c ":" || echo 0)
echo "# Orphan-reference totals: $MD_ORPHANS markdown lines, $CJS_ORPHANS source lines" >> tests/removed-surfaces.smoke.txt
echo "# Plan 05 MUST address every orphan line before the commit-5 buildability gate" >> tests/removed-surfaces.smoke.txt
```

4. Sanity-spot-check the audit file. The planner has already confirmed at least these locations must appear (if they do not, something is wrong with the grep):
   - `get-shit-done/workflows/execute-phase.md:43` (gsd-debugger)
   - `get-shit-done/workflows/execute-phase.md:45` (gsd-integration-checker)
   - `get-shit-done/workflows/execute-phase.md:47` (gsd-ui-researcher)
   - `get-shit-done/workflows/execute-phase.md:48` (gsd-ui-checker)
   - `get-shit-done/workflows/execute-phase.md:49` (gsd-ui-auditor)
   - `get-shit-done/references/model-profiles.md:15` (gsd-debugger table row)
   - `get-shit-done/references/model-profiles.md:19` (gsd-integration-checker table row)
   - `get-shit-done/references/model-profiles.md:64` (gsd-debugger override example)
   - `get-shit-done/references/agent-contracts.md:19` (gsd-debugger registry row)
   - `get-shit-done/references/agent-contracts.md:21` (gsd-ui-auditor row)
   - `get-shit-done/references/agent-contracts.md:22` (gsd-ui-checker row)
   - `get-shit-done/references/agent-contracts.md:23` (gsd-ui-researcher row)
   - `get-shit-done/references/agent-contracts.md:25` (gsd-integration-checker row)
   - `get-shit-done/references/agent-contracts.md:27` (gsd-security-auditor row)
   - `get-shit-done/bin/lib/model-profiles.cjs:16` (gsd-debugger object key)
   - `get-shit-done/bin/lib/model-profiles.cjs:20` (gsd-integration-checker object key)
   - `get-shit-done/bin/lib/model-profiles.cjs:23` (gsd-ui-researcher object key)
   - `get-shit-done/bin/lib/model-profiles.cjs:24` (gsd-ui-checker object key)
   - `get-shit-done/bin/lib/model-profiles.cjs:25` (gsd-ui-auditor object key)
   - `get-shit-done/workflows/quick.md:26` (gsd-code-reviewer bullet)
   - `get-shit-done/workflows/diagnose-issues.md:11` (gsd-debugger — entire file depends on this; flag for Plan 05 whether file is orphan)
   - `get-shit-done/workflows/audit-milestone.md:11` (gsd-integration-checker — same as above)

```bash
# Quick confirmation that at least these known locations were captured
for pattern in \
  "get-shit-done/workflows/execute-phase.md:43:" \
  "get-shit-done/references/model-profiles.md:15:" \
  "get-shit-done/references/agent-contracts.md:19:" \
  "get-shit-done/bin/lib/model-profiles.cjs:16:"; do
  if grep -q "^$pattern" tests/removed-surfaces.smoke.txt; then
    echo "OK: captured $pattern"
  else
    echo "MISSING: $pattern (Plan 05 may miss this surgical edit — inspect grep scope)"
  fi
done
```

5. Confirm graphify.cjs survivor decision is recorded. Add a reasoning footer:
```bash
cat >> tests/removed-surfaces.smoke.txt <<'EOF'

# graphify SURVIVOR RATIONALE
# ---
# get-shit-done/bin/lib/graphify.cjs is NOT in the removal list above even though
# commands/gsd/graphify.md IS removed. Reason:
#   - get-shit-done/bin/gsd-tools.cjs line 1091 imports it:
#       const graphify = require('./lib/graphify.cjs');
#     The `graphify` switch case in gsd-tools.cjs (lines 1090-1113) powers the
#     `gsd-tools graphify <query|status|diff|build>` subcommand.
#   - agents/gsd-planner.md line 871 uses `gsd-tools graphify query ...`
#     to drive dependency-graph queries during planning.
#   - agents/gsd-phase-researcher.md line 562 also uses it.
# Therefore:
#   - graphify.cjs STAYS (workflow primitive)
#   - tests/graphify.test.cjs STAYS (covers surviving code)
#   - Only the USER-FACING command commands/gsd/graphify.md is removed.
# This resolves checker WARNING #2 (key_links_planned, graphify.cjs orphan).
EOF
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# File exists and is non-empty
[ -s tests/removed-surfaces.smoke.txt ] || { echo "FAIL: audit file missing or empty"; exit 1; }
# Count of EXISTS: lines is in range (one lower than before since graphify.test.cjs removed from list)
N=$(grep -c "^EXISTS:" tests/removed-surfaces.smoke.txt)
echo "Files to delete: $N"
if [ "$N" -lt 34 ] || [ "$N" -gt 50 ]; then
  echo "WARN: count $N outside expected 34-50 range"
fi
# Totals line present
grep -q "^# Totals:" tests/removed-surfaces.smoke.txt && echo "OK: totals recorded" || { echo "FAIL: no totals"; exit 1; }
# Orphan reference section present
grep -q "^# ORPHAN REFERENCES TO REPAIR IN PLAN 05" tests/removed-surfaces.smoke.txt || { echo "FAIL: orphan section missing"; exit 1; }
# Orphan reference section has at least one entry (known minima)
grep -q "get-shit-done/workflows/execute-phase.md:43:" tests/removed-surfaces.smoke.txt || { echo "FAIL: execute-phase.md line 43 not captured"; exit 1; }
grep -q "get-shit-done/references/model-profiles.md:15:" tests/removed-surfaces.smoke.txt || { echo "FAIL: model-profiles.md line 15 not captured"; exit 1; }
grep -q "get-shit-done/references/agent-contracts.md:19:" tests/removed-surfaces.smoke.txt || { echo "FAIL: agent-contracts.md line 19 not captured"; exit 1; }
grep -q "get-shit-done/bin/lib/model-profiles.cjs:16:" tests/removed-surfaces.smoke.txt || { echo "FAIL: model-profiles.cjs line 16 not captured"; exit 1; }
# graphify survivor rationale present
grep -q "graphify SURVIVOR RATIONALE" tests/removed-surfaces.smoke.txt || { echo "FAIL: graphify rationale missing"; exit 1; }
# graphify.test.cjs NOT in EXISTS list
! grep -q "^EXISTS: tests/graphify.test.cjs$" tests/removed-surfaces.smoke.txt || { echo "FAIL: graphify.test.cjs wrongly marked for removal"; exit 1; }
echo "OK: Task 1 verified"
'
    </automated>
  </verify>
  <done>
    - `tests/removed-surfaces.smoke.txt` exists listing EXISTS/MISSING per candidate
    - Count of EXISTS: lines is between 34 and 50 (per D-04 "approximately 38–45" with tolerance; lower bound relaxed because graphify.test.cjs now survives)
    - `tests/graphify.test.cjs` is NOT in the EXISTS list
    - `# ORPHAN REFERENCES TO REPAIR IN PLAN 05 (SURGICAL EDITS)` section populated with file:line:snippet records
    - At minimum these known orphan locations recorded: `execute-phase.md:43`, `model-profiles.md:15`, `agent-contracts.md:19`, `model-profiles.cjs:16`
    - `# graphify SURVIVOR RATIONALE` section explains why graphify.cjs + test stay
  </done>
</task>

<task type="auto">
  <name>Task 2: Delete enumerated files via `git rm` and commit</name>
  <files>
    (all paths listed in Task 1 that exist)
    tests/removed-surfaces.smoke.txt
  </files>
  <read_first>
    - tests/removed-surfaces.smoke.txt (the authoritative list produced by Task 1)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-08 commit message: `chore(remove): drop GSD development surfaces (X files)`; D-10 Conventional Commits)
  </read_first>
  <action>
Delete only files marked `EXISTS:` in the audit trail. `git rm` preserves history (the files remain accessible on `backup/original-gsd` from Plan 01).

1. Read `tests/removed-surfaces.smoke.txt` and extract the list of existing files:
```bash
cd /Users/agent/GSD-for-Business
grep "^EXISTS:" tests/removed-surfaces.smoke.txt | awk '{print $2}' > /tmp/to-remove.txt
wc -l /tmp/to-remove.txt
```

2. Double-check that `get-shit-done/bin/lib/graphify.cjs` and `tests/graphify.test.cjs` are NOT in the removal list:
```bash
! grep -q "get-shit-done/bin/lib/graphify.cjs" /tmp/to-remove.txt || { echo "FAIL: graphify.cjs wrongly listed — abort"; exit 1; }
! grep -q "tests/graphify.test.cjs" /tmp/to-remove.txt || { echo "FAIL: graphify.test.cjs wrongly listed — abort"; exit 1; }
```

3. Remove each file with `git rm`:
```bash
while read -r f; do
  if [ -f "$f" ]; then
    git rm "$f"
    echo "Removed: $f"
  fi
done < /tmp/to-remove.txt
```

4. Buildability gate (per D-09, each commit MUST leave repo buildable):
```bash
# Lib layer requires
node -e "require('./get-shit-done/bin/lib/core.cjs'); console.log('core: OK');" || { echo "FAIL: core.cjs broken"; exit 2; }
node -e "require('./get-shit-done/bin/lib/state.cjs'); console.log('state: OK');" || { echo "FAIL: state.cjs broken"; exit 2; }
node -e "require('./get-shit-done/bin/lib/init.cjs'); console.log('init: OK');" || { echo "FAIL: init.cjs broken"; exit 2; }
# graphify.cjs survives
node -e "require('./get-shit-done/bin/lib/graphify.cjs'); console.log('graphify: OK');" || { echo "FAIL: graphify.cjs broken"; exit 2; }
# Tests that remain must still parse (skip execution — many may still fail due to dev-surface refs not yet fixed; Plan 05 handles that)
node -e "require.resolve('./tests/helpers.cjs'); console.log('helpers: OK');" || { echo "FAIL: helpers.cjs broken"; exit 2; }
```
If any lib file fails to load, ABORT — revert with `git restore --staged .` and report the failure.

5. Stage the audit trail and the deletions:
```bash
git add tests/removed-surfaces.smoke.txt
git status --short | head -60
DELETED=$(git diff --cached --name-status | grep "^D" | wc -l)
echo "Staged deletions: $DELETED"
```
Confirm `DELETED` is in the 34–50 range (same rule as Task 1).

6. Commit (Conventional Commits per D-10):
```bash
node get-shit-done/bin/gsd-tools.cjs commit "chore(01-remove): drop GSD development surfaces ($DELETED files) (FND-02)" --files $(git diff --cached --name-only | tr '\n' ' ')
```
If `gsd-tools.cjs commit` fails, fall back to plain `git commit -m "..."` with the same message.
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# D-01 agents gone
for a in gsd-code-reviewer gsd-code-fixer gsd-debugger gsd-ui-researcher gsd-ui-checker gsd-ui-auditor gsd-ai-researcher gsd-eval-planner gsd-eval-auditor gsd-domain-researcher gsd-security-auditor gsd-integration-checker; do
  [ ! -f "agents/$a.md" ] || { echo "FAIL: agents/$a.md still exists"; exit 1; }
done
# D-01 commands gone
for c in code-review code-review-fix add-tests ui-phase ui-review ai-integration-phase eval-review secure-phase; do
  [ ! -f "commands/gsd/$c.md" ] || { echo "FAIL: commands/gsd/$c.md still exists"; exit 1; }
done
# D-02 borderline commands gone
for c in debug forensics graphify inbox pr-branch ship; do
  [ ! -f "commands/gsd/$c.md" ] || { echo "FAIL: commands/gsd/$c.md still exists"; exit 1; }
done
# D-02 borderline agent gone
[ ! -f "agents/gsd-debug-session-manager.md" ] || { echo "FAIL: debug-session-manager still exists"; exit 1; }
# graphify.cjs + its test SURVIVE
[ -f "get-shit-done/bin/lib/graphify.cjs" ] || { echo "FAIL: graphify.cjs wrongly removed"; exit 1; }
[ -f "tests/graphify.test.cjs" ] || { echo "FAIL: graphify.test.cjs wrongly removed"; exit 1; }
# Lib layer intact
node -e "require(\"./get-shit-done/bin/lib/core.cjs\"); require(\"./get-shit-done/bin/lib/state.cjs\"); require(\"./get-shit-done/bin/lib/init.cjs\"); require(\"./get-shit-done/bin/lib/graphify.cjs\"); console.log(\"lib-intact: OK\");" || { echo "FAIL: lib layer broken"; exit 1; }
# Survivor count sanity: agents should now be original 31 minus (12 D-01 + 1 D-02) = 18
SURVIVING_AGENTS=$(ls agents/gsd-*.md 2>/dev/null | wc -l)
echo "Surviving gsd-* agents: $SURVIVING_AGENTS (expected 18)"
[ "$SURVIVING_AGENTS" = "18" ] || echo "WARN: agent survivor count off"
# Audit trail committed
git log -1 --name-only | grep -q "removed-surfaces.smoke.txt" && echo "OK: audit committed" || echo "WARN: audit file not in last commit"
'
    </automated>
  </verify>
  <done>
    - All files listed as EXISTS in `tests/removed-surfaces.smoke.txt` are deleted from the working tree and staged+committed via `git rm`
    - `get-shit-done/bin/lib/graphify.cjs` is NOT deleted (survivor)
    - `tests/graphify.test.cjs` is NOT deleted (survivor — covers graphify.cjs)
    - All 12 D-01 agents absent from `agents/` (verified by file-exists check)
    - All 8 D-01 commands absent from `commands/gsd/`
    - All 6 D-02 borderline commands absent from `commands/gsd/`
    - D-01 templates (AI-SPEC.md, UI-SPEC.md, SECURITY.md) absent from `get-shit-done/templates/`
    - D-01 references (tdd.md, ai-evals.md, ai-frameworks.md, ui-brand.md) absent from `get-shit-done/references/`
    - All `get-shit-done/bin/lib/*.cjs` still `require()` cleanly (INCLUDING graphify.cjs)
    - Exactly one new commit on `main` with message starting `chore(01-remove): drop GSD development surfaces`
    - `tests/removed-surfaces.smoke.txt` is committed as audit-trail artifact (including ORPHAN REFERENCES section Plan 05 parses)
    - Repo in buildable state per D-09
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Local working tree ↔ git history | Deletions via `git rm` preserve history; `backup/original-gsd` (Plan 01) keeps pre-removal state accessible. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-03 | D (Denial of Service) | Accidental deletion of a wrong file (e.g., a surviving workflow referenced by gsd-executor.md) breaks the lib layer or core workflow | mitigate | Task 1 produces an explicit audit trail; Task 2 verifies lib layer loads cleanly (node -e require checks) BEFORE committing. Backup branch provides rollback. |
| T-01-04 | T (Tampering) | A test is removed whose coverage was actually needed for a surviving surface | mitigate | Revision identified graphify.test.cjs as covering a survivor (graphify.cjs); it has been REMOVED from the deletion list. Other removed tests exclusively cover deleted surfaces (verified by planning-time grep). If a future coverage gap surfaces, backup branch provides recovery. |
| T-01-20 | I (Information Disclosure) | Orphan-reference audit might miss a location, causing Plan 05 to silently not repair it | mitigate | Task 1 step 4 spot-checks 4 KNOWN locations from the planner's revision analysis. If any KNOWN location isn't captured, the task FAILS loudly. Unknown orphan locations will be caught by Plan 06's FND-07 grep for residual `gsd-<removed>` identifiers. |

Phase 1 still adds zero new attack surface — this plan only removes inherited code paths.
</threat_model>

<verification>
1. All 12 D-01 agents absent: `ls agents/gsd-*.md | grep -cE "(code-reviewer|code-fixer|debugger|ui-researcher|ui-checker|ui-auditor|ai-researcher|eval-planner|eval-auditor|domain-researcher|security-auditor|integration-checker)"` returns 0.
2. All 8 D-01 commands absent: `ls commands/gsd/ | grep -cE "^(code-review|code-review-fix|add-tests|ui-phase|ui-review|ai-integration-phase|eval-review|secure-phase)\.md$"` returns 0.
3. All 6 D-02 commands absent: `ls commands/gsd/ | grep -cE "^(debug|forensics|graphify|inbox|pr-branch|ship)\.md$"` returns 0.
4. `get-shit-done/bin/lib/core.cjs` still `require()`s cleanly: `node -e "require('./get-shit-done/bin/lib/core.cjs')"` exits 0.
5. `get-shit-done/bin/lib/graphify.cjs` SURVIVES: `[ -f get-shit-done/bin/lib/graphify.cjs ]`.
6. `tests/graphify.test.cjs` SURVIVES: `[ -f tests/graphify.test.cjs ]`.
7. Surviving gsd-* agent count = 18 (31 original - 12 D-01 - 1 D-02).
8. Audit trail committed: `git log -1 --name-only | grep -q tests/removed-surfaces.smoke.txt`.
9. Orphan reference section populated: `grep -q "^# ORPHAN REFERENCES" tests/removed-surfaces.smoke.txt`.
10. Known minima captured: 4 spot-check locations verified by Task 1 verify block.
</verification>

<success_criteria>
- [ ] 12 D-01 agents deleted
- [ ] 8 D-01 commands deleted
- [ ] D-01 workflows, templates, references deleted (per audit trail)
- [ ] 1 D-02 borderline agent deleted (gsd-debug-session-manager)
- [ ] 6 D-02 borderline commands deleted (debug, forensics, graphify, inbox, pr-branch, ship)
- [ ] D-02 borderline workflows deleted (forensics, inbox, pr-branch, ship)
- [ ] D-03 recursive tests deleted EXCEPT tests/graphify.test.cjs (explicit survivor — see graphify SURVIVOR RATIONALE section)
- [ ] `get-shit-done/bin/lib/graphify.cjs` remains (required by gsd-tools.cjs and surviving agents)
- [ ] `tests/removed-surfaces.smoke.txt` committed with `# ORPHAN REFERENCES TO REPAIR IN PLAN 05` section populated
- [ ] Repo remains buildable (`get-shit-done/bin/lib/*.cjs` all load including graphify.cjs)
- [ ] Exactly one atomic commit for this plan (per D-08 commit 2; D-10 Conventional Commits)
- [ ] Total deletions in the 34–50 range (per D-04; lower than pre-revision because graphify.test.cjs survives)
- [ ] FND-02 success criterion (ROADMAP.md line 33) met
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-02-SUMMARY.md` listing:
- Final deletion count
- graphify.cjs survivor note (D-03 exception with rationale from gsd-tools.cjs:1091)
- Orphan-reference summary counts (# of .md lines flagged, # of .cjs lines flagged)
- Explicit handoff note: "Plan 05 MUST parse the ORPHAN REFERENCES section of tests/removed-surfaces.smoke.txt and surgically delete/edit each recorded line before any blanket substitution runs."
</output>
</content>
</invoke>