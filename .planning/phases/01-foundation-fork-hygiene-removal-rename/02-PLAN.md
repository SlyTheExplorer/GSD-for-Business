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
  # D-03 recursive: tests for removed commands (NOT graphify.test.cjs — graphify.cjs survives)
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
  # Audit artifact
  - "tests/removed-surfaces.smoke.txt"
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
    - "`tests/removed-surfaces.smoke.txt` contains a populated `# ORPHAN REFERENCES TO REPAIR IN PLAN 05` section listing every file+line location where a removed-agent identifier still appears in surviving code across EXPANDED scope (agents/, commands/gsd/, get-shit-done/, bin/, scripts/, tests/, docs/ including localized mirrors, top-level CHANGELOG.md/CONTRIBUTING.md/SECURITY.md, sdk/)"
    - "No orphaned workflow/template/reference/test files remain for the removed commands (D-03 recursive rule), EXCEPT tests/graphify.test.cjs which survives because graphify.cjs is required by gsd-tools.cjs graphify subcommand"
  artifacts:
    - path: "tests/removed-surfaces.smoke.txt"
      provides: "Audit trail of deleted files + EXPANDED-SCOPE orphan-reference list for Plan 05 surgical edits (covers bin/, scripts/, tests/, docs/, top-level docs, sdk/)"
      contains: "list of deleted file paths + orphan references (file:line:snippet) across expanded scope + disposition classifier (DELETE-LINE / DELETE-FILE / RESIDUAL)"
  key_links:
    - from: "commands/gsd/*.md (survivors)"
      to: "agents/gsd-*.md (survivors)"
      via: "subagent_type references in command bodies"
      pattern: "no survivor command references a removed agent"
    - from: "tests/removed-surfaces.smoke.txt ORPHAN REFERENCES section"
      to: "Plan 05's surgical-edit list (Task 1 step 2)"
      via: "file:line:snippet records that Plan 05 parses"
      pattern: "every removed-agent reference has a concrete deletion/edit target"
---

<objective>
Execute commit 2 of 6 (per D-08 expanded): the bulk removal of ~37–44 GSD development-specific files. This plan enumerates the exact removal set from D-01 (original 28-file set: code review, test, UI, AI/LLM eval, security-audit, integration-checker), D-02 (borderline additions: debug, forensics, graphify, inbox, pr-branch, ship — spike/sketch were already absent), and D-03 (recursive rule: for every removed command, delete matching agent + workflow + template + reference + test file).

**IMPORTANT D-03 exception discovered during revision:** `get-shit-done/bin/lib/graphify.cjs` and `tests/graphify.test.cjs` SURVIVE Plan 02. Although `commands/gsd/graphify.md` is removed (the user-facing slash command), `graphify.cjs` is a workflow primitive imported by `get-shit-done/bin/gsd-tools.cjs` at line 1091 AND called by surviving agents. Removing `graphify.cjs` would break `gsd-tools graphify <subcommand>` which the planner workflow uses. Its test must also remain for coverage.

**Revision iteration 2 (BLOCKER 1 fix):** The pre-revision orphan-audit scope covered only `agents/`, `commands/gsd/`, `get-shit-done/workflows/`, `get-shit-done/references/`, `get-shit-done/templates/`. That scope OMITTED bin/, scripts/, tests/, docs/ (including 4 localized mirror dirs), top-level CHANGELOG.md/CONTRIBUTING.md/SECURITY.md, and sdk/. Checker iteration 1 verified removed-agent orphans exist in all of those omitted locations. This revised Task 1 expands the audit grep to cover the full scope so Plan 05's surgical-edit list gets a comprehensive input.

Purpose: Honor FND-02 (no GSD dev-specific commands/agents/hooks remain visible as `/brief-*` autocomplete targets after Phase 1) and the "sales/strategy deliverables" identity. After this plan, the codebase no longer visibly resembles a dev-centric framework at the file-level inventory.

Output: Removed files (via `git rm`), one atomic commit, a `tests/removed-surfaces.smoke.txt` audit-trail file recording (a) what was removed, and (b) an EXPANDED-SCOPE ORPHAN REFERENCES section — a concrete list of file:line:snippet records with disposition tags (DELETE-LINE / DELETE-FILE / RESIDUAL) that Plan 05 uses for surgical deletion/edit of surviving files that enumerate removed agents.
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

<!-- EXPANDED ORPHAN-AUDIT SCOPE (BLOCKER 1 fix, iteration 2): -->
<!--   agents/ (non-removed survivor bodies — may embed removed-agent names) -->
<!--   commands/gsd/ (survivor slash commands) -->
<!--   get-shit-done/workflows/ (survivor workflow markdown) -->
<!--   get-shit-done/references/ (survivor reference docs) -->
<!--   get-shit-done/templates/ (survivor templates) -->
<!--   get-shit-done/bin/ (lib/model-profiles.cjs object-literal keys) -->
<!--   bin/ (install.js permission map) -->
<!--   scripts/ (build + support scripts) -->
<!--   tests/ (non-removed survivor test files — many hardcode removed-agent names) -->
<!--   docs/ (English docs) — ARCHITECTURE.md, AGENTS.md, COMMANDS.md, CONFIGURATION.md, FEATURES.md, USER-GUIDE.md, CLI-TOOLS.md -->
<!--   docs/ja-JP/, docs/ko-KR/, docs/zh-CN/, docs/pt-BR/ (localized mirrors) -->
<!--   CHANGELOG.md, CONTRIBUTING.md, SECURITY.md (top-level docs) -->
<!--   sdk/ (TypeScript SDK src — sdk/src/query/config-query.ts has model-profile entries) -->

<!-- Disposition classifier for each orphan record: -->
<!--   DELETE-LINE: single-line surgical delete (Plan 05 Edit tool) -->
<!--   DELETE-FILE: whole-file removal (Plan 05 git rm) — use for files that ONLY document/support a removed agent -->
<!--   RESIDUAL: documented intentional residue (Plan 05 leaves alone; Plan 06 records in ASSUMPTIONS.md or PROJECT.md) -->

<!-- Known planning-time targets for DELETE-FILE: -->
<!--   get-shit-done/templates/debug-subagent-prompt.md — ONLY documents removed gsd-debugger; no other purpose -->
<!--   get-shit-done/workflows/diagnose-issues.md — ONLY dispatches to removed gsd-debugger -->
<!--   get-shit-done/workflows/audit-milestone.md — ONLY dispatches to removed gsd-integration-checker -->
<!--   tests/code-review.test.cjs, tests/ai-evals.test.cjs, tests/secure-phase.test.cjs, etc. — already in -->
<!--     the D-03 recursive test list for this plan; deleted here, not Plan 05 -->

<!-- Known planning-time targets for RESIDUAL: -->
<!--   CHANGELOG.md — preserve original agent names in historical changelog entries; prepend "pre-fork" note -->
<!--   .planning/ — never touched (our own planning artifacts) -->
<!--   .git/, node_modules/, backup/ — never touched -->
-->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Pre-removal inventory + EXPANDED-SCOPE orphan-reference audit (builds Plan 05's surgical-edit list)</name>
  <files>
    tests/removed-surfaces.smoke.txt
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-01, D-02, D-03, D-04 enumeration rules)
    - The output of the commands below (establishes the actual removal set for THIS repo)
  </read_first>
  <action>
Build the authoritative removal list by checking which files actually exist. This task runs BEFORE any deletion so nothing is lost silently. It ALSO produces a concrete orphan-reference list (file:line:snippet + disposition) that Plan 05 uses to surgically delete or edit lines in surviving files.

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

3. **EXPANDED-SCOPE ORPHAN REFERENCE AUDIT — produces Plan 05's surgical-edit list.** Write a `# ORPHAN REFERENCES TO REPAIR IN PLAN 05 (SURGICAL EDITS)` section with exact file:line:snippet records. Each record gets a disposition tag so Plan 05 can route it correctly.

```bash
echo "" >> tests/removed-surfaces.smoke.txt
echo "# ORPHAN REFERENCES TO REPAIR IN PLAN 05 (SURGICAL EDITS)" >> tests/removed-surfaces.smoke.txt
echo "# Format: file:line:snippet — Plan 05 parses this section and DELETES or EDITS" >> tests/removed-surfaces.smoke.txt
echo "# each recorded line. Disposition tags (added per-section):" >> tests/removed-surfaces.smoke.txt
echo "#   DELETE-LINE:   single-line Edit-tool surgical delete" >> tests/removed-surfaces.smoke.txt
echo "#   DELETE-FILE:   whole-file removal via git rm (file solely supports a removed agent)" >> tests/removed-surfaces.smoke.txt
echo "#   RESIDUAL:      documented intentional residue (Plan 05 leaves alone; Plan 06 documents)" >> tests/removed-surfaces.smoke.txt
echo "" >> tests/removed-surfaces.smoke.txt

REMOVED_AGENTS="gsd-code-reviewer gsd-code-fixer gsd-debugger gsd-ui-researcher gsd-ui-checker gsd-ui-auditor gsd-ai-researcher gsd-eval-planner gsd-eval-auditor gsd-domain-researcher gsd-security-auditor gsd-integration-checker gsd-debug-session-manager"

# Helper: is a file itself in the removal list (so its own refs don't count as orphans)?
is_being_removed() {
  local f="$1"
  grep -q "^EXISTS: $f$" tests/removed-surfaces.smoke.txt
}

# 3a. get-shit-done/ markdown (workflows + references + templates) — EXISTING SCOPE
echo "## [get-shit-done markdown] Surviving markdown in get-shit-done/ (DELETE-LINE default; DELETE-FILE for files listed in known-orphan-files below)" >> tests/removed-surfaces.smoke.txt
for removed_agent in $REMOVED_AGENTS; do
  MATCHES=$(grep -rn "$removed_agent" \
    get-shit-done/workflows/ \
    get-shit-done/references/ \
    get-shit-done/templates/ \
    2>/dev/null)
  if [ -n "$MATCHES" ]; then
    echo "$MATCHES" | while IFS= read -r match; do
      filepath=$(echo "$match" | cut -d: -f1)
      if ! is_being_removed "$filepath"; then
        echo "[DELETE-LINE] $match" >> tests/removed-surfaces.smoke.txt
      fi
    done
  fi
done
echo "" >> tests/removed-surfaces.smoke.txt

# 3b. Agents + commands/gsd (survivor bodies)
echo "## [agents + commands/gsd] Surviving agent + command markdown (DELETE-LINE)" >> tests/removed-surfaces.smoke.txt
for removed_agent in $REMOVED_AGENTS; do
  MATCHES=$(grep -rn "$removed_agent" \
    agents/ \
    commands/gsd/ \
    2>/dev/null | \
    grep -v "^agents/$removed_agent\.md:")
  if [ -n "$MATCHES" ]; then
    echo "$MATCHES" | while IFS= read -r match; do
      filepath=$(echo "$match" | cut -d: -f1)
      if ! is_being_removed "$filepath"; then
        echo "[DELETE-LINE] $match" >> tests/removed-surfaces.smoke.txt
      fi
    done
  fi
done
echo "" >> tests/removed-surfaces.smoke.txt

# 3c. get-shit-done/bin/ .cjs source files (model-profiles.cjs, etc.)
echo "## [get-shit-done/bin cjs] Source .cjs in get-shit-done/bin/ (DELETE-LINE — object-literal keys and switch cases must be surgically deleted before any blanket substitution runs)" >> tests/removed-surfaces.smoke.txt
for removed_agent in $REMOVED_AGENTS; do
  MATCHES=$(grep -rn "$removed_agent" \
    get-shit-done/bin/ \
    --include="*.cjs" --include="*.js" \
    2>/dev/null)
  if [ -n "$MATCHES" ]; then
    echo "$MATCHES" | while IFS= read -r match; do
      echo "[DELETE-LINE] $match" >> tests/removed-surfaces.smoke.txt
    done
  fi
done
echo "" >> tests/removed-surfaces.smoke.txt

# 3d. bin/ + scripts/ + hooks/ (NEW — BLOCKER 1 scope expansion)
echo "## [bin + scripts + hooks] Source files outside get-shit-done/bin/ (DELETE-LINE — bin/install.js permission map entries, etc.)" >> tests/removed-surfaces.smoke.txt
for removed_agent in $REMOVED_AGENTS; do
  MATCHES=$(grep -rn "$removed_agent" \
    bin/ \
    scripts/ \
    hooks/ \
    2>/dev/null)
  if [ -n "$MATCHES" ]; then
    echo "$MATCHES" | while IFS= read -r match; do
      filepath=$(echo "$match" | cut -d: -f1)
      if ! is_being_removed "$filepath"; then
        echo "[DELETE-LINE] $match" >> tests/removed-surfaces.smoke.txt
      fi
    done
  fi
done
echo "" >> tests/removed-surfaces.smoke.txt

# 3e. sdk/ TypeScript SDK (NEW — BLOCKER 1 scope expansion)
# sdk/src/query/config-query.ts has model-profile entries that mirror get-shit-done/bin/lib/model-profiles.cjs
echo "## [sdk] TypeScript SDK source (DELETE-LINE — model-profile object-literal keys)" >> tests/removed-surfaces.smoke.txt
for removed_agent in $REMOVED_AGENTS; do
  MATCHES=$(grep -rn "$removed_agent" \
    sdk/ \
    --include="*.ts" --include="*.tsx" --include="*.cjs" --include="*.js" \
    2>/dev/null)
  if [ -n "$MATCHES" ]; then
    echo "$MATCHES" | while IFS= read -r match; do
      filepath=$(echo "$match" | cut -d: -f1)
      if ! is_being_removed "$filepath"; then
        echo "[DELETE-LINE] $match" >> tests/removed-surfaces.smoke.txt
      fi
    done
  fi
done
echo "" >> tests/removed-surfaces.smoke.txt

# 3f. tests/ survivor test files (NEW — BLOCKER 1 scope expansion)
# Many tests hardcode removed-agent names in expectations/assertions — Plan 05 deletes those assertions
echo "## [tests] Surviving test files in tests/ (DELETE-LINE for individual hardcoded refs; see known-orphan-files for DELETE-FILE candidates)" >> tests/removed-surfaces.smoke.txt
for removed_agent in $REMOVED_AGENTS; do
  MATCHES=$(grep -rn "$removed_agent" \
    tests/ \
    --include="*.cjs" --include="*.js" \
    2>/dev/null | \
    grep -v "^tests/removed-surfaces.smoke.txt:")
  if [ -n "$MATCHES" ]; then
    echo "$MATCHES" | while IFS= read -r match; do
      filepath=$(echo "$match" | cut -d: -f1)
      if ! is_being_removed "$filepath"; then
        echo "[DELETE-LINE] $match" >> tests/removed-surfaces.smoke.txt
      fi
    done
  fi
done
echo "" >> tests/removed-surfaces.smoke.txt

# 3g. docs/ English + localized mirrors (NEW — BLOCKER 1 scope expansion)
# Many docs enumerate the full agent roster in tables; Plan 05 surgically deletes those rows
echo "## [docs English] docs/*.md English documentation (DELETE-LINE per row; see known-orphan-files for whole-file DELETE-FILE candidates)" >> tests/removed-surfaces.smoke.txt
for removed_agent in $REMOVED_AGENTS; do
  MATCHES=$(grep -rn "$removed_agent" \
    docs/ \
    --include="*.md" \
    2>/dev/null | \
    grep -v "^docs/ja-JP\|^docs/ko-KR\|^docs/zh-CN\|^docs/pt-BR")
  if [ -n "$MATCHES" ]; then
    echo "$MATCHES" | while IFS= read -r match; do
      filepath=$(echo "$match" | cut -d: -f1)
      if ! is_being_removed "$filepath"; then
        echo "[DELETE-LINE] $match" >> tests/removed-surfaces.smoke.txt
      fi
    done
  fi
done
echo "" >> tests/removed-surfaces.smoke.txt

echo "## [docs localized] docs/ja-JP + docs/ko-KR + docs/zh-CN + docs/pt-BR mirrors (DELETE-LINE; if orphan density is high per-file, Plan 05 may substitute a banner-add approach — see disposition notes below)" >> tests/removed-surfaces.smoke.txt
for removed_agent in $REMOVED_AGENTS; do
  for loc_dir in docs/ja-JP docs/ko-KR docs/zh-CN docs/pt-BR; do
    MATCHES=$(grep -rn "$removed_agent" "$loc_dir/" --include="*.md" 2>/dev/null)
    if [ -n "$MATCHES" ]; then
      echo "$MATCHES" | while IFS= read -r match; do
        filepath=$(echo "$match" | cut -d: -f1)
        if ! is_being_removed "$filepath"; then
          echo "[DELETE-LINE] $match" >> tests/removed-surfaces.smoke.txt
        fi
      done
    fi
  done
done
echo "" >> tests/removed-surfaces.smoke.txt

# 3h. Top-level docs (CHANGELOG.md, CONTRIBUTING.md, SECURITY.md) — NEW — BLOCKER 1 scope expansion
# CHANGELOG.md RESIDUAL policy: historical entries describing past GSD changes legitimately reference
# old agent names. Preserve these as RESIDUAL with a prepended "pre-fork" note handled in Plan 06.
echo "## [top-level docs] CHANGELOG.md + CONTRIBUTING.md + SECURITY.md (disposition varies — see notes)" >> tests/removed-surfaces.smoke.txt
for removed_agent in $REMOVED_AGENTS; do
  for topdoc in CHANGELOG.md CONTRIBUTING.md SECURITY.md; do
    if [ -f "$topdoc" ]; then
      MATCHES=$(grep -n "$removed_agent" "$topdoc" 2>/dev/null | head -30)
      if [ -n "$MATCHES" ]; then
        if [ "$topdoc" = "CHANGELOG.md" ]; then
          # CHANGELOG history: preserve as RESIDUAL
          echo "$MATCHES" | while IFS= read -r match; do
            echo "[RESIDUAL] $topdoc:$match  (CHANGELOG history — pre-fork entries preserved; Plan 06 adds a banner)" >> tests/removed-surfaces.smoke.txt
          done
        else
          # CONTRIBUTING, SECURITY: DELETE-LINE like regular docs
          echo "$MATCHES" | while IFS= read -r match; do
            echo "[DELETE-LINE] $topdoc:$match" >> tests/removed-surfaces.smoke.txt
          done
        fi
      fi
    fi
  done
done
echo "" >> tests/removed-surfaces.smoke.txt

# 3i. Known-orphan-files (DELETE-FILE disposition — these files exist solely to support a removed agent)
echo "## [known orphan files — DELETE-FILE disposition]" >> tests/removed-surfaces.smoke.txt
echo "# Plan 05 git rms these whole files (in addition to surgical line-deletes from sections above)" >> tests/removed-surfaces.smoke.txt
echo "# Rationale recorded per file:" >> tests/removed-surfaces.smoke.txt
for orphan_file in \
    "get-shit-done/templates/debug-subagent-prompt.md" \
    "get-shit-done/workflows/diagnose-issues.md" \
    "get-shit-done/workflows/audit-milestone.md"; do
  if [ -f "$orphan_file" ]; then
    # These weren't in Plan 02's D-01/D-02/D-03 list but they exist solely to support removed agents
    reason=""
    case "$orphan_file" in
      *debug-subagent-prompt.md) reason="Template documents removed gsd-debugger agent only" ;;
      *diagnose-issues.md) reason="Workflow dispatches solely to removed gsd-debugger" ;;
      *audit-milestone.md) reason="Workflow dispatches solely to removed gsd-integration-checker" ;;
    esac
    echo "[DELETE-FILE] $orphan_file  # $reason" >> tests/removed-surfaces.smoke.txt
  fi
done
echo "" >> tests/removed-surfaces.smoke.txt

# 3j. Summary counts
TOTAL_DL=$(grep -c "^\[DELETE-LINE\]" tests/removed-surfaces.smoke.txt 2>/dev/null || echo 0)
TOTAL_DF=$(grep -c "^\[DELETE-FILE\]" tests/removed-surfaces.smoke.txt 2>/dev/null || echo 0)
TOTAL_RES=$(grep -c "^\[RESIDUAL\]" tests/removed-surfaces.smoke.txt 2>/dev/null || echo 0)
echo "# Orphan-reference totals across EXPANDED scope (BLOCKER 1 fix):" >> tests/removed-surfaces.smoke.txt
echo "#   DELETE-LINE: $TOTAL_DL records (surgical line-deletes in Plan 05)" >> tests/removed-surfaces.smoke.txt
echo "#   DELETE-FILE: $TOTAL_DF records (whole-file removals in Plan 05)" >> tests/removed-surfaces.smoke.txt
echo "#   RESIDUAL:    $TOTAL_RES records (documented residues — no edit needed)" >> tests/removed-surfaces.smoke.txt
echo "# Plan 05 MUST address every DELETE-LINE and DELETE-FILE record before the FND-07 residue-grep gate" >> tests/removed-surfaces.smoke.txt
```

4. Sanity-spot-check the audit file. The planner has already confirmed at least these locations must appear (if they do not, something is wrong with the grep):

```bash
# Known orphan minima (from planning-time verification of the actual repo)
for pattern in \
  "get-shit-done/workflows/execute-phase.md:43:" \
  "get-shit-done/references/model-profiles.md:15:" \
  "get-shit-done/references/agent-contracts.md:19:" \
  "get-shit-done/bin/lib/model-profiles.cjs:16:" \
  "bin/install.js:33:" \
  "bin/install.js:35:" \
  "get-shit-done/workflows/quick.md:26:" \
  "tests/agent-frontmatter.test.cjs:" \
  "tests/model-profiles.test.cjs:25:" \
  "tests/copilot-install.test.cjs:1183:" \
  "sdk/src/query/config-query.ts:39:" \
  "docs/ARCHITECTURE.md:275:" \
  "docs/COMMANDS.md:1047:" \
  "docs/CONFIGURATION.md:227:" \
  "docs/ko-KR/ARCHITECTURE.md:226:"; do
  if grep -q "$pattern" tests/removed-surfaces.smoke.txt; then
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

# tests/agent-frontmatter.test.cjs SPECIAL-CASE (BLOCKER 2)
# ---
# Line 21 of this file: `.filter(f => f.startsWith('gsd-') && f.endsWith('.md'))`
# This is a BARE PREFIX STRING LITERAL, not an agent identifier. After Plan 03 renames
# all agents to `brief-*.md`, this filter returns an empty array and every downstream
# test asserts on zero iterations (vacuous PASS — invisibly broken test). Plan 05
# MUST replace `'gsd-'` with `'brief-'` on line 21 AND update the path constants
# at lines 17 (WORKFLOWS_DIR = 'get-shit-done/workflows') and 18 (COMMANDS_DIR =
# 'commands/gsd') to the renamed paths. This is recorded separately from the
# removed-agent orphan list because it's a string-literal pattern, not an identifier.
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
# Orphan reference section present with new disposition tags
grep -q "^# ORPHAN REFERENCES TO REPAIR IN PLAN 05" tests/removed-surfaces.smoke.txt || { echo "FAIL: orphan section missing"; exit 1; }
grep -q "^\[DELETE-LINE\]" tests/removed-surfaces.smoke.txt || { echo "FAIL: no DELETE-LINE records captured"; exit 1; }
# Expanded-scope minima (BLOCKER 1 verification) — each required location must be recorded
grep -q "get-shit-done/workflows/execute-phase.md:43:" tests/removed-surfaces.smoke.txt || { echo "FAIL: execute-phase.md line 43 not captured (OLD scope)"; exit 1; }
grep -q "get-shit-done/references/model-profiles.md:15:" tests/removed-surfaces.smoke.txt || { echo "FAIL: model-profiles.md line 15 not captured (OLD scope)"; exit 1; }
grep -q "bin/install.js:33:" tests/removed-surfaces.smoke.txt || { echo "FAIL: bin/install.js line 33 not captured (NEW scope BLOCKER 1)"; exit 1; }
grep -q "bin/install.js:35:" tests/removed-surfaces.smoke.txt || { echo "FAIL: bin/install.js line 35 not captured (NEW scope BLOCKER 1)"; exit 1; }
grep -q "sdk/src/query/config-query.ts:" tests/removed-surfaces.smoke.txt || { echo "FAIL: sdk/ config-query.ts not captured (NEW scope BLOCKER 1)"; exit 1; }
grep -q "tests/agent-skills-awareness.test.cjs:" tests/removed-surfaces.smoke.txt || { echo "FAIL: tests/ agent-skills-awareness not captured (NEW scope BLOCKER 1)"; exit 1; }
grep -q "docs/ARCHITECTURE.md:" tests/removed-surfaces.smoke.txt || { echo "FAIL: docs/ARCHITECTURE.md not captured (NEW scope BLOCKER 1)"; exit 1; }
grep -q "docs/ko-KR/" tests/removed-surfaces.smoke.txt || { echo "FAIL: docs/ko-KR/ mirror not captured (NEW scope BLOCKER 1)"; exit 1; }
# RESIDUAL records for CHANGELOG.md
grep -q "^\[RESIDUAL\] CHANGELOG.md:" tests/removed-surfaces.smoke.txt || echo "INFO: no CHANGELOG RESIDUAL records (CHANGELOG may simply lack agent refs in this repo)"
# DELETE-FILE records for the three known orphan-files
grep -q "^\[DELETE-FILE\] get-shit-done/templates/debug-subagent-prompt.md" tests/removed-surfaces.smoke.txt || { echo "FAIL: debug-subagent-prompt DELETE-FILE record missing"; exit 1; }
grep -q "^\[DELETE-FILE\] get-shit-done/workflows/diagnose-issues.md" tests/removed-surfaces.smoke.txt || { echo "FAIL: diagnose-issues DELETE-FILE record missing"; exit 1; }
grep -q "^\[DELETE-FILE\] get-shit-done/workflows/audit-milestone.md" tests/removed-surfaces.smoke.txt || { echo "FAIL: audit-milestone DELETE-FILE record missing"; exit 1; }
# graphify survivor rationale present
grep -q "graphify SURVIVOR RATIONALE" tests/removed-surfaces.smoke.txt || { echo "FAIL: graphify rationale missing"; exit 1; }
# BLOCKER 2 special-case note present
grep -q "tests/agent-frontmatter.test.cjs SPECIAL-CASE" tests/removed-surfaces.smoke.txt || { echo "FAIL: BLOCKER 2 special-case note missing"; exit 1; }
# graphify.test.cjs NOT in EXISTS list
! grep -q "^EXISTS: tests/graphify.test.cjs$" tests/removed-surfaces.smoke.txt || { echo "FAIL: graphify.test.cjs wrongly marked for removal"; exit 1; }
echo "OK: Task 1 verified (expanded-scope audit with BLOCKER 1 + BLOCKER 2 coverage)"
'
    </automated>
  </verify>
  <done>
    - `tests/removed-surfaces.smoke.txt` exists listing EXISTS/MISSING per candidate
    - Count of EXISTS: lines is between 34 and 50 (per D-04 "approximately 38–45" with tolerance; lower bound relaxed because graphify.test.cjs now survives)
    - `tests/graphify.test.cjs` is NOT in the EXISTS list
    - `# ORPHAN REFERENCES TO REPAIR IN PLAN 05 (SURGICAL EDITS)` section populated with disposition-tagged records (DELETE-LINE / DELETE-FILE / RESIDUAL)
    - EXPANDED-SCOPE sections present: [get-shit-done markdown], [agents + commands/gsd], [get-shit-done/bin cjs], [bin + scripts + hooks], [sdk], [tests], [docs English], [docs localized], [top-level docs], [known orphan files — DELETE-FILE disposition]
    - At minimum these known orphan locations recorded across expanded scope:
      - `get-shit-done/workflows/execute-phase.md:43`, `get-shit-done/references/model-profiles.md:15`, `get-shit-done/references/agent-contracts.md:19`, `get-shit-done/bin/lib/model-profiles.cjs:16`
      - `bin/install.js:33`, `bin/install.js:35` (BLOCKER 1)
      - `sdk/src/query/config-query.ts:39` and related (BLOCKER 1)
      - `tests/agent-skills-awareness.test.cjs`, `tests/model-profiles.test.cjs`, `tests/copilot-install.test.cjs` (BLOCKER 1)
      - `docs/ARCHITECTURE.md`, `docs/COMMANDS.md`, `docs/CONFIGURATION.md` (BLOCKER 1)
      - `docs/ko-KR/`, `docs/ja-JP/`, `docs/zh-CN/` mirrors (BLOCKER 1)
    - DELETE-FILE records for the 3 known whole-file orphans: `debug-subagent-prompt.md`, `diagnose-issues.md`, `audit-milestone.md`
    - `# graphify SURVIVOR RATIONALE` section explains why graphify.cjs + test stay
    - `# tests/agent-frontmatter.test.cjs SPECIAL-CASE (BLOCKER 2)` note describes the bare-prefix string-literal fix (for Plan 05)
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
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-08 commit message; D-10 Conventional Commits)
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
    - `tests/removed-surfaces.smoke.txt` is committed as audit-trail artifact (including EXPANDED-SCOPE ORPHAN REFERENCES section with disposition tags Plan 05 parses)
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
| T-01-20 | I (Information Disclosure) | Orphan-reference audit might miss a location, causing Plan 05 to silently not repair it | mitigate | Task 1 step 4 spot-checks 15 KNOWN locations across expanded scope (old-scope 4 + BLOCKER-1-introduced 11). If any KNOWN location isn't captured, the task FAILS loudly. Unknown orphan locations will be caught by Plan 06's FND-07 broad-scope grep. |
| T-01-25 | T (Tampering) | Audit scope omits a directory containing orphan references, Plan 05 silently skips them, orphans survive Phase 1 | mitigate | Revision iteration 2 (BLOCKER 1): scope expanded to cover bin/, scripts/, tests/, docs/ (English + 4 localized mirrors), top-level CHANGELOG/CONTRIBUTING/SECURITY, sdk/. Each section emits disposition-tagged records. Plan 06 FND-07 grep performs a final repo-wide sweep as a backstop. |

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
9. Orphan reference section populated across EXPANDED scope: at least one record in each of the 10 scope sections (get-shit-done markdown, agents+commands, get-shit-done/bin cjs, bin+scripts+hooks, sdk, tests, docs English, docs localized, top-level docs, known orphan files).
10. Known minima captured: 15 spot-check locations verified by Task 1 verify block.
11. DELETE-FILE records present for the 3 whole-file orphans (debug-subagent-prompt, diagnose-issues, audit-milestone).
12. BLOCKER 2 special-case note recorded for tests/agent-frontmatter.test.cjs bare-prefix fix.
</verification>

<success_criteria>
- [ ] 12 D-01 agents deleted
- [ ] 8 D-01 commands deleted
- [ ] D-01 workflows, templates, references deleted (per audit trail)
- [ ] 1 D-02 borderline agent deleted (gsd-debug-session-manager)
- [ ] 6 D-02 borderline commands deleted (debug, forensics, graphify, inbox, pr-branch, ship)
- [ ] D-02 borderline workflows deleted (forensics, inbox, pr-branch, ship)
- [ ] D-03 recursive tests deleted EXCEPT tests/graphify.test.cjs (explicit survivor)
- [ ] `get-shit-done/bin/lib/graphify.cjs` remains (required by gsd-tools.cjs and surviving agents)
- [ ] `tests/removed-surfaces.smoke.txt` committed with EXPANDED-SCOPE `# ORPHAN REFERENCES TO REPAIR IN PLAN 05` section (BLOCKER 1 fix) and BLOCKER 2 special-case note
- [ ] Orphan-audit scope covers: agents/, commands/gsd/, get-shit-done/, bin/, scripts/, hooks/, sdk/, tests/, docs/ (English + ja-JP/ko-KR/zh-CN/pt-BR mirrors), CHANGELOG.md, CONTRIBUTING.md, SECURITY.md
- [ ] Disposition tags applied: DELETE-LINE (bulk), DELETE-FILE (for known orphan files), RESIDUAL (for CHANGELOG.md historical entries)
- [ ] DELETE-FILE records present for: get-shit-done/templates/debug-subagent-prompt.md, get-shit-done/workflows/diagnose-issues.md, get-shit-done/workflows/audit-milestone.md
- [ ] Repo remains buildable (`get-shit-done/bin/lib/*.cjs` all load including graphify.cjs)
- [ ] Exactly one atomic commit for this plan (per D-08 commit 2 of 6; D-10 Conventional Commits)
- [ ] Total deletions in the 34–50 range (per D-04)
- [ ] FND-02 success criterion (ROADMAP.md line 33) met
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-02-SUMMARY.md` listing:
- Final deletion count
- graphify.cjs survivor note (D-03 exception with rationale from gsd-tools.cjs:1091)
- EXPANDED-SCOPE orphan-reference summary counts per section: DELETE-LINE / DELETE-FILE / RESIDUAL totals
- Explicit handoff note: "Plan 05 MUST parse every disposition-tagged record in the ORPHAN REFERENCES section of tests/removed-surfaces.smoke.txt and apply the corresponding action (surgical delete, file delete, or residual-leave-alone) before any blanket substitution runs."
- BLOCKER 2 handoff note: "tests/agent-frontmatter.test.cjs line 21 bare-prefix fix is recorded as a SPECIAL-CASE in the audit; Plan 05 applies the `'gsd-'` → `'brief-'` string-literal edit plus path-constant updates at lines 17 and 18."
</output>
</content>
