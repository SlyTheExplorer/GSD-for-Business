---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 05
type: execute
wave: 5
depends_on: [04]
files_modified:
  # Every .md and .cjs inside brief/ (post-rename) that references old identifiers
  - "brief/**/*.md"
  - "brief/**/*.cjs"
  # All agent files (post-rename)
  - "agents/brief-*.md"
  # All command files (post-rename)
  - "commands/brief/*.md"
  # All hook files (post-rename)
  - "hooks/brief-*.js"
  - "hooks/brief-*.sh"
  # bin/install.js (references get-shit-done and gsd-*)
  - "bin/install.js"
  # Scripts
  - "scripts/run-tests.cjs"
  - "scripts/build-hooks.js"
  # Tests
  - "tests/*.test.cjs"
  # Descriptive package.json fields not covered by Plan 04
  - "package.json"
autonomous: true
requirements:
  - FND-03
user_setup: []

must_haves:
  truths:
    - "User runs `grep -r 'get-shit-done/' --include='*.md' --include='*.cjs' --include='*.js' --include='*.json' --include='*.sh' . 2>/dev/null | grep -v '^./\\.planning\\|^./\\.git\\|^./node_modules\\|^./backup' | wc -l` and gets 0 (all path references updated)"
    - "User runs `grep -rh 'gsd-tools' --include='*.md' --include='*.cjs' --include='*.js' . 2>/dev/null | grep -v '^./\\.planning\\|^./\\.git\\|^./node_modules\\|^./backup' | wc -l` and gets 0"
    - "User runs `grep -r 'subagent_type: gsd-' --include='*.md' . 2>/dev/null | grep -v '^./\\.planning\\|^./\\.git\\|^./backup' | wc -l` and gets 0"
    - "User runs `node -e \"require('./brief/bin/lib/core.cjs')\"` and it succeeds"
    - "User runs `node brief/bin/brief-tools.cjs --help 2>&1` and gets a help output (not a require/path error)"
    - "`npm test` failures (if any) are all due to pre-existing test expectations about GSD branding text in test fixture assertions, NOT due to unresolvable paths or missing modules"
  artifacts:
    - path: ".planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md"
      provides: "Post-replacement audit showing the counts of gsd-*, GSD, get-shit-done, gsd-tools remaining"
      contains: "grep-count report"
  key_links:
    - from: "agents/brief-*.md (internal `subagent_type` and file-path references)"
      to: "renamed file locations"
      via: "text replacement"
      pattern: "subagent_type: brief-* and path refs to brief/..."
    - from: "brief/bin/brief-tools.cjs and brief/**/*.cjs"
      to: "correct relative paths"
      via: "text replacement"
      pattern: "no hard-coded `get-shit-done/` or `gsd-tools` string literals"
---

<objective>
Execute commit 5 of 5 (per D-08): update every text reference to `gsd-*` / `GSD` / `Get Shit Done` / `get-shit-done/` / `gsd-tools` inside `.md`, `.cjs`, `.js`, `.sh`, and `.json` files to the BRIEF-equivalent terminology. This is a bulk string-replacement pass across the renamed repo; combined with Plans 03 and 04, it closes out FND-03 fully.

Per D-09 (buildable state), this commit must leave the repo fully functional: `require()`s resolve, `brief-tools.cjs` can execute, commands dispatch to renamed agents correctly, and test modules all load. Test EXECUTION may still surface failures — any test that literally asserts on GSD branding strings in fixtures or help output needs those expected values updated too; deeper test logic repairs that go beyond text substitution are out of scope for this phase (Phase 9 hardening reviews them).

Purpose: Honor FND-03 part 3 (internal text references) and D-05 (aggressive rename including identifiers + namespaces + internal text). After this plan, grepping for "GSD" or "get-shit-done" outside `.planning/` / `.git/` / `backup/` returns zero matches (or, at minimum, a documented residual set that the user explicitly accepts).

Output: Bulk text replacements across files, a post-replacement audit `01-05-text-ref-audit.md`, one atomic commit. `npm test` runs without module-load failures (test assertions about branding may still fail — documented as acceptable residual in Phase 9 scope).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-02-SUMMARY.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-03-SUMMARY.md
@.planning/phases/01-foundation-fork-hygiene-removal-rename/01-04-SUMMARY.md

<interfaces>
<!-- Substitution dictionary (planner-decided per CONTEXT.md D-05 "Claude's Discretion" on pattern -->
<!-- matching strategy): -->
<!-- -->
<!-- Path/identifier replacements (case-sensitive, safe everywhere): -->
<!--   get-shit-done/  →  brief/                           (paths) -->
<!--   gsd-tools       →  brief-tools                      (binary refs) -->
<!--   gsd-tools.cjs   →  brief-tools.cjs                  (file refs, subset of above) -->
<!--   get-shit-done-cc → brief-cc                          (package name refs) -->
<!-- -->
<!-- Subagent / command identifier replacements: -->
<!--   subagent_type: gsd-  →  subagent_type: brief-       (YAML frontmatter identifier) -->
<!--   /gsd-                →  /brief-                      (slash command references) -->
<!--   "gsd-<name>"         →  "brief-<name>"               (quoted identifiers) -->
<!--   `gsd-<name>`         →  `brief-<name>`               (backtick identifiers in .md) -->
<!-- -->
<!-- Brand/verbose text (case-preserving where practical): -->
<!--   Get Shit Done        →  BRIEF                        (headings/body in .md) -->
<!--   get-shit-done        →  brief                        (lowercase references NOT already covered by "get-shit-done/") -->
<!--   GSD                  →  BRIEF                        (uppercase acronym — CAUTION: only when used as a project name) -->
<!-- -->
<!-- CAUTION boundaries (do NOT replace): -->
<!--   Contents inside .planning/ (our own planning artifacts that reference historical GSD decisions — leave as context) -->
<!--   Contents inside .git/ and node_modules/ (never touch) -->
<!--   Contents on the backup/original-gsd branch (never touch — that's the rollback target) -->
<!--   Test fixtures that deliberately test GSD-branding coverage (e.g., `tests/product-name-purity.test.cjs` may be -->
<!--     updated, but if a test is SPECIFICALLY testing that GSD brand isn't stripped from user-facing strings, -->
<!--     the test expectation changes from "GSD" to "BRIEF", not the test is deleted) -->

<!-- Post-Plan-04 state (verified): -->
<!--   brief/ directory exists with bin/ contexts/ references/ templates/ workflows/ -->
<!--   brief/bin/brief-tools.cjs exists -->
<!--   package.json name=brief-cc, bin.brief-cc=bin/install.js, files includes "brief" -->
<!--   All agents, commands, hooks, 3 test files are brief-* prefixed -->
<!--   But their CONTENTS still reference gsd-* / get-shit-done/ / Get Shit Done / etc. -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Execute bulk text replacements across source + docs (excluding .planning, .git, backup, node_modules)</name>
  <files>
    (hundreds of files — scoped by directory/glob, see action)
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-05 full rename spec; Claude's Discretion clause allows planner to choose the pattern-matching strategy)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-02-SUMMARY.md (orphan-reference list from Plan 02)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Establish safety: confirm the backup branch exists so a revert is always possible:
```bash
git branch | grep -q "backup/original-gsd" || { echo "FAIL: backup branch missing"; exit 1; }
echo "Safety net present."
```

2. Define the file scope — every `.md`, `.cjs`, `.js`, `.sh`, `.json` under the repo EXCEPT:
   - `.planning/` (our planning artifacts — keep historical references intact)
   - `.git/`
   - `node_modules/`
   - `backup/` (local backup copies, if any)
   - `tests/removed-surfaces.smoke.txt` (audit trail — should contain historical gsd-* names)
   - `.planning/phases/01-.../*-CONTEXT.md` and the planning SUMMARY files (they document the rename work)

```bash
# Produce the authoritative work list
find . -type f \( -name "*.md" -o -name "*.cjs" -o -name "*.js" -o -name "*.sh" -o -name "*.json" \) \
  -not -path "./.planning/*" \
  -not -path "./.git/*" \
  -not -path "./node_modules/*" \
  -not -path "./backup/*" \
  -not -name "removed-surfaces.smoke.txt" \
  2>/dev/null > /tmp/plan05-work-list.txt
wc -l /tmp/plan05-work-list.txt
```

3. PATH replacements (safest, most mechanical — do these first):
```bash
# get-shit-done/ → brief/ (path refs)
while IFS= read -r f; do
  if grep -q "get-shit-done/" "$f" 2>/dev/null; then
    # Use perl for portable in-place replace; macOS-safe
    perl -i -pe 's|get-shit-done/|brief/|g' "$f"
  fi
done < /tmp/plan05-work-list.txt

# get-shit-done-cc → brief-cc (package-name refs — often in README/docs)
while IFS= read -r f; do
  if grep -q "get-shit-done-cc" "$f" 2>/dev/null; then
    perl -i -pe 's|get-shit-done-cc|brief-cc|g' "$f"
  fi
done < /tmp/plan05-work-list.txt

# gsd-tools.cjs → brief-tools.cjs (file refs — subset caught already by get-shit-done/ rule when preceded by path)
while IFS= read -r f; do
  if grep -q "gsd-tools" "$f" 2>/dev/null; then
    perl -i -pe 's|gsd-tools(\.cjs)?|brief-tools$1|g' "$f"
  fi
done < /tmp/plan05-work-list.txt
```

4. IDENTIFIER replacements (per-subagent):
```bash
# Build list of agent identifiers from the actual renamed agent files
RENAMED_AGENTS=$(ls agents/brief-*.md | sed 's|agents/||; s|\.md||' | sort -u)
echo "$RENAMED_AGENTS" | head
# For each agent, replace old name → new name everywhere (subagent_type, markdown refs, code)
echo "$RENAMED_AGENTS" | while read -r new_name; do
  old_name=$(echo "$new_name" | sed 's|^brief-|gsd-|')
  while IFS= read -r f; do
    if grep -q "$old_name" "$f" 2>/dev/null; then
      # Replace the identifier everywhere it appears as a whole token
      perl -i -pe "s|\b$old_name\b|$new_name|g" "$f"
    fi
  done < /tmp/plan05-work-list.txt
done

# Now also catch anything still mentioning the removed-agents (orphan references from Plan 02)
# These are references that should probably point elsewhere or be deleted.
# Strategy: replace the identifier with a sentinel marker the author can review later, but for Phase 1
# buildability we simply remove the subagent_type line or replace with `brief-executor` (the catch-all).
# Since this is a one-shot rename phase, the safest action is:
#   If `subagent_type: gsd-<removed>` appears, replace with `subagent_type: brief-executor`
#   (brief-executor is the survivor). The author can refine later.
for removed in gsd-code-reviewer gsd-code-fixer gsd-debugger gsd-ui-researcher gsd-ui-checker gsd-ui-auditor gsd-ai-researcher gsd-eval-planner gsd-eval-auditor gsd-domain-researcher gsd-security-auditor gsd-integration-checker gsd-debug-session-manager; do
  while IFS= read -r f; do
    if grep -q "$removed" "$f" 2>/dev/null; then
      # Replace subagent_type: gsd-<removed> specifically
      perl -i -pe "s|subagent_type:\s*$removed|subagent_type: brief-executor|g" "$f"
      # Replace other in-text mentions with a neutral BRIEF-agent reference
      perl -i -pe "s|\b$removed\b|brief-executor|g" "$f"
    fi
  done < /tmp/plan05-work-list.txt
done
```

5. SLASH-COMMAND replacements:
```bash
# /gsd- → /brief- for references inside .md bodies and any docs
while IFS= read -r f; do
  if grep -q "/gsd-" "$f" 2>/dev/null; then
    perl -i -pe 's|/gsd-|/brief-|g' "$f"
  fi
done < /tmp/plan05-work-list.txt
```

6. BRAND/VERBOSE replacements (most risk — last, most conservative):
```bash
# "Get Shit Done" → "BRIEF" (as project name)
# But only outside .planning/ and except in historical context; our work list already excludes .planning/.
# We leave LICENSE, CONTRIBUTING.md, CHANGELOG.md as-is if they contain legal/attributional text.
# Use grep to pre-list where this appears and apply selectively:
grep -l "Get Shit Done" /tmp/plan05-work-list.txt 2>/dev/null > /tmp/gsd-brand-files.txt || true
# Build an exclusion set for license/attribution files
EXCLUDE_BRAND_FILES="./LICENSE ./CHANGELOG.md ./CONTRIBUTING.md ./SECURITY.md"
while IFS= read -r f; do
  if grep -q "Get Shit Done" "$f" 2>/dev/null; then
    skip=false
    for ex in $EXCLUDE_BRAND_FILES; do
      [ "$f" = "$ex" ] && skip=true && break
    done
    if [ "$skip" = "false" ]; then
      perl -i -pe 's|Get Shit Done|BRIEF|g' "$f"
    fi
  fi
done < /tmp/plan05-work-list.txt

# "GSD" as a standalone acronym when used as project name.
# BE CAREFUL: "GSD" can mean other things in comments. We limit to .md files ONLY (docs + agent prompts)
# and only replace when it appears with typical sentinel context like "GSD ", "GSD:", "- GSD ", etc.
# This is an approximation per D-05 Claude's Discretion; residuals can be fixed by user in Phase 9.
while IFS= read -r f; do
  case "$f" in
    *.md)
      # Whole-word GSD as standalone acronym (bounded by spaces/punctuation/line start)
      perl -i -pe 's/\bGSD\b/BRIEF/g' "$f"
      ;;
  esac
done < /tmp/plan05-work-list.txt
```

7. Repair the CLAUDE.md `GSD:*` sentinel comments. The CLAUDE.md generator puts these HTML-style comments around sections (`<!-- GSD:project-start ... -->`). The above step replaced `GSD` with `BRIEF` inside these, which is acceptable: they become `<!-- BRIEF:project-start ... -->`. If CLAUDE.md generation tooling breaks because it expects `GSD:` literal, Plan 06 CLAUDE.md rewrite restores it to the BRIEF-appropriate form.

8. Re-run buildability:
```bash
node -e "require('./brief/bin/lib/core.cjs'); console.log('core: OK');" || { echo "FAIL"; exit 1; }
node -e "require('./brief/bin/lib/state.cjs'); console.log('state: OK');" || { echo "FAIL"; exit 1; }
node -e "require('./brief/bin/lib/init.cjs'); console.log('init: OK');" || { echo "FAIL"; exit 1; }
# Try the entry point
node brief/bin/brief-tools.cjs --help 2>&1 | head -20 || echo "brief-tools.cjs --help returned non-zero (may be normal for help command)"
```

9. Run the test suite and capture failures (NOT a gate — failures about branding strings are acceptable residual):
```bash
npm test 2>&1 | tail -60 > /tmp/plan05-test-output.txt || true
FAIL_COUNT=$(grep -cE "(fail|✗|✘|ERR)" /tmp/plan05-test-output.txt || echo 0)
echo "Test failures after rename: $FAIL_COUNT"
# Module-load failures are gates; test-assertion failures are acceptable
MODULE_ERRORS=$(grep -cE "(Cannot find module|Cannot resolve|TypeError.*require)" /tmp/plan05-test-output.txt || echo 0)
[ "$MODULE_ERRORS" = "0" ] || { echo "FAIL: module-load errors in test run"; cat /tmp/plan05-test-output.txt; exit 1; }
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# get-shit-done/ path references outside .planning/ should be 0
REMAIN_PATH=$(grep -rln "get-shit-done/" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" 2>/dev/null | grep -v "^\./\.planning/\|^\./\.git/\|^\./node_modules/\|^\./backup/\|removed-surfaces.smoke.txt" | wc -l | tr -d " ")
echo "Files still referencing get-shit-done/: $REMAIN_PATH"
[ "$REMAIN_PATH" = "0" ] || { echo "FAIL: $REMAIN_PATH files still have get-shit-done/ paths"; grep -rln "get-shit-done/" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" 2>/dev/null | grep -v "^\./\.planning/\|^\./\.git/\|^\./node_modules/\|^\./backup/\|removed-surfaces.smoke.txt" | head -5; exit 1; }
# gsd-tools references should be 0 outside planning/git
REMAIN_TOOLS=$(grep -rln "gsd-tools" . --include="*.md" --include="*.cjs" --include="*.js" 2>/dev/null | grep -v "^\./\.planning/\|^\./\.git/\|^\./node_modules/\|^\./backup/" | wc -l | tr -d " ")
echo "Files still referencing gsd-tools: $REMAIN_TOOLS"
[ "$REMAIN_TOOLS" = "0" ] || { echo "FAIL"; exit 1; }
# Lib loads
node -e "require(\"./brief/bin/lib/core.cjs\");" || { echo "FAIL: core broken"; exit 1; }
# brief-tools.cjs is an executable entry
node brief/bin/brief-tools.cjs --help >/dev/null 2>&1 || node brief/bin/brief-tools.cjs >/dev/null 2>&1 || echo "brief-tools exits non-zero on --help; inspect manually (acceptable if command usage was printed)"
echo "OK: Task 1 verified"
'
    </automated>
  </verify>
  <done>
    - 0 files outside `.planning/`, `.git/`, `node_modules/`, `backup/` contain `get-shit-done/` path reference
    - 0 files outside same exclusions contain `gsd-tools` or `gsd-tools.cjs` reference
    - 0 files outside same exclusions contain `subagent_type: gsd-` or `/gsd-` slash-command reference
    - Standalone `GSD` replaced with `BRIEF` in `.md` files (residuals in LICENSE/CHANGELOG/CONTRIBUTING/SECURITY intentionally preserved)
    - `get-shit-done-cc` package-name references replaced with `brief-cc`
    - Removed-agent orphan references (e.g., `subagent_type: gsd-code-reviewer`) replaced with `subagent_type: brief-executor`
    - Lib layer still loads
    - `npm test` produces no module-load errors (test-assertion failures about branding are acceptable residuals; logged for Phase 9)
  </done>
</task>

<task type="auto">
  <name>Task 2: Produce audit file and commit (commit 5 of 5)</name>
  <files>
    .planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md
    (all staged changes from Task 1)
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-08 commit 5 message: `refactor(refs): update internal text references to BRIEF terminology`)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Generate the text-ref audit document:
```bash
AUDIT=.planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md
cat > "$AUDIT" <<EOF
# Phase 1 Plan 05 — Text Reference Update Audit

**Generated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Scope:** All .md, .cjs, .js, .sh, .json files outside .planning/, .git/, node_modules/, backup/

## Residual count (should be ~0 outside documented exclusions)

| Pattern | Count | Note |
|---------|-------|------|
| \`get-shit-done/\` | $(grep -rln "get-shit-done/" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./node_modules/\|^./backup/\|removed-surfaces.smoke.txt" | wc -l | tr -d ' ') | Files still referencing old path |
| \`gsd-tools\` | $(grep -rln "gsd-tools" . --include="*.md" --include="*.cjs" --include="*.js" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./node_modules/\|^./backup/" | wc -l | tr -d ' ') | Files still referencing old binary |
| \`subagent_type: gsd-\` | $(grep -rln "subagent_type: gsd-" . --include="*.md" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./backup/" | wc -l | tr -d ' ') | Files with old subagent references |
| \`/gsd-\` | $(grep -rln "/gsd-" . --include="*.md" --include="*.cjs" --include="*.js" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./node_modules/\|^./backup/" | wc -l | tr -d ' ') | Files with old slash-command refs |
| \`get-shit-done-cc\` | $(grep -rln "get-shit-done-cc" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./node_modules/\|^./backup/" | wc -l | tr -d ' ') | Files with old package name |

## Intentional residuals (NOT fixed in Phase 1)

- \`.planning/\` directory: historical planning artifacts reference GSD for context; kept intact
- \`LICENSE\`, \`CHANGELOG.md\`, \`CONTRIBUTING.md\`, \`SECURITY.md\`: legal/attributional content preserved for audit trail — rebranding belongs to a separate licensing decision (not Phase 1 scope)
- \`backup/original-gsd\` branch: never touched
- \`README.{ko-KR,ja-JP,pt-BR,zh-CN}.md\`: localized READMEs mirror README.md; updated by Plan 06's README delta (targeted), NOT by Plan 05 bulk sweep (non-English language nuances)

## Test-suite state

\`\`\`
$(npm test 2>&1 | tail -20)
\`\`\`

If module-load errors are present, the commit must be reverted. Test-assertion failures about branding strings are acceptable residuals — flagged for Phase 9 hardening.

EOF
cat "$AUDIT" | head -30
```

2. Stage + commit:
```bash
git add -A
# Optional: show summary
git status --short | head -20
git diff --cached --stat | tail -5

# Commit
node brief/bin/brief-tools.cjs commit "refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3)" --files $(git diff --cached --name-only | tr '\n' ' ')
# Fallback
# git commit -m "refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3)"
```

3. Final buildability re-check:
```bash
node -e "require('./brief/bin/lib/core.cjs'); console.log('post-commit-5: core OK');"
node -e "require('./brief/bin/lib/state.cjs'); console.log('post-commit-5: state OK');"
# Tools binary
node brief/bin/brief-tools.cjs --help 2>&1 | head -5 || echo "(brief-tools --help non-zero exit is OK for help commands)"
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# Audit file exists and is non-empty
[ -s .planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md ] || { echo "FAIL: audit missing"; exit 1; }
# Commit message matches
git log -1 --format="%s" | grep -qE "refactor\(01-refs\).*update internal text references to BRIEF" || { echo "FAIL: commit message"; exit 1; }
# Residual counts all zero (outside allowed exclusions)
for pattern in "get-shit-done/" "gsd-tools" "subagent_type: gsd-" "/gsd-"; do
  COUNT=$(grep -rln "$pattern" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" 2>/dev/null | grep -v "^\./\.planning/\|^\./\.git/\|^\./node_modules/\|^\./backup/\|removed-surfaces.smoke.txt" | wc -l | tr -d " ")
  [ "$COUNT" = "0" ] || { echo "FAIL: $COUNT files still have pattern: $pattern"; grep -rln "$pattern" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" 2>/dev/null | grep -v "^\./\.planning/\|^\./\.git/\|^\./node_modules/\|^\./backup/\|removed-surfaces.smoke.txt" | head -3; exit 1; }
done
# Module load
node -e "require(\"./brief/bin/lib/core.cjs\"); require(\"./brief/bin/lib/state.cjs\");" || { echo "FAIL: lib broken"; exit 1; }
echo "OK: Task 2 verified — commit 5 passes"
'
    </automated>
  </verify>
  <done>
    - `01-05-text-ref-audit.md` created in the phase dir showing the residual counts
    - Exactly one new commit on `main` with message `refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3)`
    - All residual counts for `get-shit-done/`, `gsd-tools`, `subagent_type: gsd-`, `/gsd-` outside allowed exclusion paths are 0
    - Lib layer still loads
    - `npm test` has no module-load errors (test-assertion failures due to branding strings are documented in audit as Phase 9 scope)
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| String content ↔ semantic meaning | Mass text replacement risks accidentally hitting substrings with different meaning (e.g., "GSD" as a file format in a different context). Exclusion list + file-type scoping + lowercase/uppercase casing awareness mitigates. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-10 | T (Tampering) | A `GSD` substring inside an unrelated technical term or code comment (e.g., a reference to "GSD algorithm" in a domain context, or "gsd" in a variable name meaning something else) gets wrongly replaced | accept | The replacement is scoped to .md/.cjs/.js/.sh/.json files in a forked repo where "GSD" was the project name. Residuals in LICENSE/CHANGELOG are preserved. If a false-positive replace happens, the `backup/original-gsd` branch is the rollback. |
| T-01-11 | I (Information Disclosure) | The backup branch retains the unredacted GSD state, including any GSD-internal history | accept | Documented in Phase 1 Plan 01 threat model. The backup branch is local-only during Phase 1. |
| T-01-12 | D (DoS) | Test suite regressions: after text replacement, assertions comparing to literal "gsd-*" strings fail | accept | Test-suite repair for branding-related assertions is documented as residual-to-be-fixed-in-Phase-9. Plan 05 validates only that tests LOAD (no module errors), not that they PASS. |

Phase 1 still adds zero new attack surface — this is a text refactor.
</threat_model>

<verification>
1. `grep -rln "get-shit-done/" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" | grep -v -e ".planning/" -e ".git/" -e "node_modules/" -e "backup/" -e "removed-surfaces.smoke.txt" | wc -l` returns 0.
2. `grep -rln "gsd-tools" . --include="*.md" --include="*.cjs" --include="*.js" | grep -v -e ".planning/" -e ".git/" -e "node_modules/" -e "backup/" | wc -l` returns 0.
3. `grep -rln "subagent_type: gsd-" . --include="*.md" | grep -v -e ".planning/" -e ".git/" -e "backup/" | wc -l` returns 0.
4. `grep -rln "/gsd-" . --include="*.md" --include="*.cjs" --include="*.js" | grep -v -e ".planning/" -e ".git/" -e "node_modules/" -e "backup/" | wc -l` returns 0.
5. `node -e "require('./brief/bin/lib/core.cjs')"` exits 0.
6. `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md` exists and records residuals.
7. Commit message: `refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3)`.
</verification>

<success_criteria>
- [ ] Path-like references (`get-shit-done/`) replaced repo-wide outside planning/git/backup/node_modules
- [ ] Binary references (`gsd-tools`, `gsd-tools.cjs`) replaced with `brief-tools`, `brief-tools.cjs`
- [ ] All `/gsd-*` slash-command references updated to `/brief-*`
- [ ] All `subagent_type: gsd-*` references updated (survivors → `brief-*`; references to removed agents rerouted to `brief-executor`)
- [ ] All `get-shit-done-cc` package-name references updated to `brief-cc`
- [ ] `GSD` acronym and `Get Shit Done` brand text replaced with `BRIEF` in .md files (excluding LICENSE/CHANGELOG/CONTRIBUTING/SECURITY for auditability)
- [ ] `brief/bin/brief-tools.cjs` still executes without module-load errors
- [ ] `01-05-text-ref-audit.md` committed as audit trail
- [ ] Exactly one atomic commit per D-08 commit 5
- [ ] FND-03 fully satisfied across its three parts (Plans 03, 04, 05)
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-SUMMARY.md` recording the residual-count table, any test-suite failures (with classification: module-load vs assertion-string), and the list of intentional residuals deferred to Phase 9.
</output>
