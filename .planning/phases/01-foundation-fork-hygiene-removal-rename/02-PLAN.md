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
  - "tests/code-review.test.cjs"
  - "tests/code-review-command.test.cjs"
  - "tests/code-review-summary-parser.test.cjs"
  - "tests/secure-phase.test.cjs"
  - "tests/ai-evals.test.cjs"
  - "tests/forensics.test.cjs"
  - "tests/graphify.test.cjs"
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
    - "No orphaned workflow/template/reference/test files remain for the removed commands (D-03 recursive rule)"
  artifacts:
    - path: "tests/removed-surfaces.smoke.txt"
      provides: "Audit trail of exactly which files were deleted in this plan"
      contains: "list of deleted file paths"
  key_links:
    - from: "commands/gsd/*.md (survivors)"
      to: "agents/gsd-*.md (survivors)"
      via: "subagent_type references in command bodies"
      pattern: "no survivor command references a removed agent"
---

<objective>
Execute commit 2 of 5 (per D-08): the bulk removal of ~38–45 GSD development-specific files. This plan enumerates the exact removal set from D-01 (original 28-file set: code review, test, UI, AI/LLM eval, security-audit, integration-checker), D-02 (borderline additions: debug, forensics, graphify, inbox, pr-branch, ship — spike/sketch were already absent), and D-03 (recursive rule: for every removed command, delete matching agent + workflow + template + reference + test file).

Purpose: Honor FND-02 (no GSD dev-specific commands/agents/hooks remain visible as `/brief-*` autocomplete targets after Phase 1) and the "sales/strategy deliverables" identity (per <specifics> note). After this plan, the codebase no longer visibly resembles a dev-centric framework at the file-level inventory.

Output: Removed files (via `git rm`), one atomic commit, a `tests/removed-surfaces.smoke.txt` audit-trail file that records what was removed so the work is auditable.
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

<!-- D-03 recursive targets (every removed command's workflow/template/reference/test MUST also go): -->
<!-- code-review* → commands/gsd/code-review*.md + get-shit-done/workflows/code-review*.md + tests/code-review*.test.cjs -->
<!-- add-tests → commands/gsd/add-tests.md + get-shit-done/workflows/add-tests.md + tests for add-tests (grep to find) -->
<!-- ui-phase, ui-review → commands + workflows + UI-SPEC.md template + ui-brand.md reference + playwright/ui tests -->
<!-- ai-integration-phase, eval-review → commands + workflows + AI-SPEC.md + ai-evals.md + ai-frameworks.md references + ai-evals tests -->
<!-- secure-phase → command + workflow + SECURITY.md template + tests/secure-phase.test.cjs + tests/security-scan.test.cjs? (keep if still used by surviving code) -->
<!-- debug → command + gsd-debug-session-manager agent + workflow + tests/debug-session-management.test.cjs -->
<!-- forensics → command + workflow + tests/forensics.test.cjs -->
<!-- graphify → command + tests/graphify.test.cjs -->
<!-- inbox → command + workflow -->
<!-- pr-branch → command + workflow + tests/bug-2004-pr-branch-milestone.test.cjs? (keep unless test solely covers removed behavior) -->
<!-- ship → command + workflow -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Pre-removal inventory verification and enumeration</name>
  <files>
    tests/removed-surfaces.smoke.txt
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-01, D-02, D-03, D-04 enumeration rules)
    - The output of the commands below (establishes the actual removal set for THIS repo)
  </read_first>
  <action>
Build the authoritative removal list by checking which files actually exist. This task runs BEFORE any deletion so nothing is lost silently.

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
D03_TESTS=(
  "tests/code-review.test.cjs"
  "tests/code-review-command.test.cjs"
  "tests/code-review-summary-parser.test.cjs"
  "tests/secure-phase.test.cjs"
  "tests/ai-evals.test.cjs"
  "tests/forensics.test.cjs"
  "tests/graphify.test.cjs"
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

2. Confirm: `EXIST_COUNT` should be in the 38–45 range per D-04. If it falls outside this range by >5, pause and re-inspect — something in D-01/D-02 may have unexpected status.

3. Additional D-03 sweep: grep remaining command/agent files for any reference to a to-be-removed agent. If a surviving command references `subagent_type: gsd-code-reviewer` (etc.), that surviving command is an orphan reference that must be repaired in Plan 05 (text-reference update). Record the findings as a `# ORPHAN REFERENCES TO REPAIR IN PLAN 05` section in `tests/removed-surfaces.smoke.txt`:
```bash
echo "" >> tests/removed-surfaces.smoke.txt
echo "# Orphan references (to repair in Plan 05 text-ref update):" >> tests/removed-surfaces.smoke.txt
for removed_agent in gsd-code-reviewer gsd-code-fixer gsd-debugger gsd-ui-researcher gsd-ui-checker gsd-ui-auditor gsd-ai-researcher gsd-eval-planner gsd-eval-auditor gsd-domain-researcher gsd-security-auditor gsd-integration-checker gsd-debug-session-manager; do
  MATCHES=$(grep -l "$removed_agent" agents/gsd-*.md commands/gsd/*.md get-shit-done/workflows/*.md 2>/dev/null | grep -v "/$removed_agent\.md$" | head -20)
  if [ -n "$MATCHES" ]; then
    echo "## Removed agent '$removed_agent' still referenced in:" >> tests/removed-surfaces.smoke.txt
    echo "$MATCHES" >> tests/removed-surfaces.smoke.txt
  fi
done
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# File exists and is non-empty
[ -s tests/removed-surfaces.smoke.txt ] || { echo "FAIL: audit file missing or empty"; exit 1; }
# Count of EXISTS: lines is in range
N=$(grep -c "^EXISTS:" tests/removed-surfaces.smoke.txt)
echo "Files to delete: $N"
if [ "$N" -lt 35 ] || [ "$N" -gt 50 ]; then
  echo "WARN: count $N outside expected 35-50 range"
fi
# Totals line present
grep -q "^# Totals:" tests/removed-surfaces.smoke.txt && echo "OK: totals recorded" || { echo "FAIL: no totals"; exit 1; }
'
    </automated>
  </verify>
  <done>
    - `tests/removed-surfaces.smoke.txt` exists listing EXISTS/MISSING per candidate
    - Count of EXISTS: lines is between 35 and 50 (per D-04 "approximately 38–45" with ±5 tolerance for drift)
    - Orphan-reference section populated (may be empty)
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
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-08 commit message: `chore(remove): drop GSD development surfaces (X files)`)
  </read_first>
  <action>
Delete only files marked `EXISTS:` in the audit trail. `git rm` preserves history (the files remain accessible on `backup/original-gsd` from Plan 01).

1. Read `tests/removed-surfaces.smoke.txt` and extract the list of existing files:
```bash
cd /Users/agent/GSD-for-Business
grep "^EXISTS:" tests/removed-surfaces.smoke.txt | awk '{print $2}' > /tmp/to-remove.txt
wc -l /tmp/to-remove.txt
```

2. Remove each file with `git rm`:
```bash
while read -r f; do
  if [ -f "$f" ]; then
    git rm "$f"
    echo "Removed: $f"
  fi
done < /tmp/to-remove.txt
```

3. Buildability gate (per D-09, each commit MUST leave repo buildable):
```bash
# Lib layer requires
node -e "require('./get-shit-done/bin/lib/core.cjs'); console.log('core: OK');" || { echo "FAIL: core.cjs broken"; exit 2; }
node -e "require('./get-shit-done/bin/lib/state.cjs'); console.log('state: OK');" || { echo "FAIL: state.cjs broken"; exit 2; }
node -e "require('./get-shit-done/bin/lib/init.cjs'); console.log('init: OK');" || { echo "FAIL: init.cjs broken"; exit 2; }
# Tests that remain must still parse (skip execution — many may still fail due to dev-surface refs not yet fixed; Plan 05 handles that)
node -e "require.resolve('./tests/helpers.cjs'); console.log('helpers: OK');" || { echo "FAIL: helpers.cjs broken"; exit 2; }
```
If any lib file fails to load, ABORT — revert with `git restore --staged .` and report the failure. The phase 1 plan-chain assumes all lib/*.cjs files load cleanly; any load failure signals a missed dependency.

4. Stage the audit trail and the deletions:
```bash
git add tests/removed-surfaces.smoke.txt
git status --short | head -60
DELETED=$(git diff --cached --name-status | grep "^D" | wc -l)
echo "Staged deletions: $DELETED"
```
Confirm `DELETED` is in the 35–50 range (same rule as Task 1).

5. Commit:
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
# Lib layer intact
node -e "require(\"./get-shit-done/bin/lib/core.cjs\"); require(\"./get-shit-done/bin/lib/state.cjs\"); require(\"./get-shit-done/bin/lib/init.cjs\"); console.log(\"lib-intact: OK\");" || { echo "FAIL: lib layer broken"; exit 1; }
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
    - All 12 D-01 agents absent from `agents/` (verified by file-exists check)
    - All 8 D-01 commands absent from `commands/gsd/`
    - All 6 D-02 borderline commands absent from `commands/gsd/`
    - D-01 templates (AI-SPEC.md, UI-SPEC.md, SECURITY.md) absent from `get-shit-done/templates/`
    - D-01 references (tdd.md, ai-evals.md, ai-frameworks.md, ui-brand.md) absent from `get-shit-done/references/`
    - All `get-shit-done/bin/lib/*.cjs` still `require()` cleanly
    - Exactly one new commit on `main` with message starting `chore(01-remove): drop GSD development surfaces`
    - `tests/removed-surfaces.smoke.txt` is committed as audit-trail artifact
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
| T-01-04 | T (Tampering) | A test is removed whose coverage was actually needed for a surviving surface | accept | Plan 05 (text-reference update) will re-run `npm test` on survivors and surface any coverage gaps. D-09 "buildable state" covers module-load; execution-level test failures from orphan refs are expected and fixed in Plan 05. |

Phase 1 still adds zero new attack surface — this plan only removes inherited code paths.
</threat_model>

<verification>
1. All 12 D-01 agents absent: `ls agents/gsd-*.md | grep -cE "(code-reviewer|code-fixer|debugger|ui-researcher|ui-checker|ui-auditor|ai-researcher|eval-planner|eval-auditor|domain-researcher|security-auditor|integration-checker)"` returns 0.
2. All 8 D-01 commands absent: `ls commands/gsd/ | grep -cE "^(code-review|code-review-fix|add-tests|ui-phase|ui-review|ai-integration-phase|eval-review|secure-phase)\.md$"` returns 0.
3. All 6 D-02 commands absent: `ls commands/gsd/ | grep -cE "^(debug|forensics|graphify|inbox|pr-branch|ship)\.md$"` returns 0.
4. `get-shit-done/bin/lib/core.cjs` still `require()`s cleanly: `node -e "require('./get-shit-done/bin/lib/core.cjs')"` exits 0.
5. Surviving gsd-* agent count = 18 (31 original - 12 D-01 - 1 D-02).
6. Audit trail committed: `git log -1 --name-only | grep -q tests/removed-surfaces.smoke.txt`.
</verification>

<success_criteria>
- [ ] 12 D-01 agents deleted
- [ ] 8 D-01 commands deleted
- [ ] D-01 workflows, templates, references deleted (per audit trail)
- [ ] 1 D-02 borderline agent deleted (gsd-debug-session-manager)
- [ ] 6 D-02 borderline commands deleted (debug, forensics, graphify, inbox, pr-branch, ship)
- [ ] D-02 borderline workflows deleted (forensics, inbox, pr-branch, ship)
- [ ] D-03 recursive tests deleted (code-review*, secure-phase, ai-evals, forensics, graphify, debug-session-management, playwright-ui-verify, plan-phase-ui-redirect, autonomous-ui-steps)
- [ ] `tests/removed-surfaces.smoke.txt` committed as audit trail
- [ ] Repo remains buildable (`get-shit-done/bin/lib/*.cjs` all load)
- [ ] Exactly one atomic commit for this plan (per D-08 commit 2)
- [ ] Total deletions in the 38–50 range (per D-04)
- [ ] FND-02 success criterion (ROADMAP.md line 33) met
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-02-SUMMARY.md` listing the final deletion count and any D-03 orphan references surfaced (those are Plan 05's responsibility).
</output>
