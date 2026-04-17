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
  # Known files requiring SURGICAL edits (removed-agent references; NOT blanket substitutions):
  - "brief/workflows/execute-phase.md"
  - "brief/workflows/quick.md"
  - "brief/workflows/diagnose-issues.md"
  - "brief/workflows/audit-milestone.md"
  - "brief/references/model-profiles.md"
  - "brief/references/agent-contracts.md"
  - "brief/bin/lib/model-profiles.cjs"
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
    - "User runs `grep -c \"'brief-executor'\" brief/bin/lib/model-profiles.cjs` and gets 1 (NOT 6 — confirms W4 duplicate-key fix)"
    - "User runs `node -e \"const p=require('./brief/bin/lib/model-profiles.cjs'); const keys=Object.keys(p); console.log(keys.length, keys.includes('brief-executor'))\"` and gets a number equal to the count of surviving agent model profiles with brief-executor present exactly once"
    - "User runs `grep -c '^| gsd-\\|^| brief-' brief/references/agent-contracts.md` and gets the count of surviving agents (no rows for removed agents)"
    - "User runs `grep -c '^| gsd-\\|^| brief-' brief/references/model-profiles.md` and gets the count of surviving agents"
    - "User runs `grep -c 'brief-executor.*Diagnoses\\|brief-executor.*UI\\|brief-executor.*Cross-phase integration' brief/workflows/execute-phase.md` and gets 0 (no contradictory capability descriptions)"
    - "`npm test` failures (if any) are all due to pre-existing test expectations about GSD branding text in test fixture assertions, NOT due to unresolvable paths or missing modules"
  artifacts:
    - path: ".planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md"
      provides: "Post-replacement audit showing the counts of gsd-*, GSD, get-shit-done, gsd-tools remaining"
      contains: "grep-count report + surgical-edit summary (W3/W4/W5 closure)"
  key_links:
    - from: "agents/brief-*.md (internal `subagent_type` and file-path references)"
      to: "renamed file locations"
      via: "text replacement"
      pattern: "subagent_type: brief-* and path refs to brief/..."
    - from: "brief/bin/brief-tools.cjs and brief/**/*.cjs"
      to: "correct relative paths"
      via: "text replacement"
      pattern: "no hard-coded `get-shit-done/` or `gsd-tools` string literals"
    - from: "removed-agent references in surviving docs (orphan list from Plan 02 Task 1)"
      to: "surgical Edit-tool deletions (NOT blanket substitutions)"
      via: "Task 1 step 2 (surgical edits, per W3/W4/W5)"
      pattern: "removed-agent lines deleted from surviving files; blanket substitution runs ONLY on survivor identifiers afterward"
---

<objective>
Execute commit 5 of 5 (per D-08): update every text reference to `gsd-*` / `GSD` / `Get Shit Done` / `get-shit-done/` / `gsd-tools` inside `.md`, `.cjs`, `.js`, `.sh`, and `.json` files to the BRIEF-equivalent terminology. This is a TWO-PHASE pass across the renamed repo; combined with Plans 03 and 04, it closes out FND-03 fully.

**Revision note (addresses checker WARNINGs #3, #4, #5):** The pre-revision plan used a blanket `s|\\b<gsd-identifier>\\b|brief-executor|g` substitution for removed-agent orphan references. That approach:
- **W3:** Left `brief/workflows/execute-phase.md` with 5 contradictory "brief-executor — Diagnoses and fixes issues / Researches UI/UX / Audits UI / Checks cross-phase integration" entries in its `<available_agent_types>` block.
- **W4:** Produced ~5 duplicate object-literal keys named `'brief-executor'` in `brief/bin/lib/model-profiles.cjs` (the file has gsd-debugger, gsd-integration-checker, gsd-ui-researcher, gsd-ui-checker, gsd-ui-auditor entries at planning-verified lines 16, 20, 23, 24, 25). JavaScript silently allows duplicate keys — last wins. The real `brief-executor` profile would be silently overwritten. `require()` still succeeds (buildability gate misses it), runtime semantics quietly break.
- **W5:** Left `brief/references/model-profiles.md` (rows 15, 19, 64) and `brief/references/agent-contracts.md` (rows 19, 21, 22, 23, 25, 27; plus a body reference at line 39) with duplicate/contradictory "brief-executor" table rows and paragraphs.

**Revised approach — two phases with different rules:**

- **Task 1 step 2 — SURGICAL EDITS for removed-agent references.** For each orphan location recorded in Plan 02's `tests/removed-surfaces.smoke.txt` `# ORPHAN REFERENCES TO REPAIR IN PLAN 05` section, DELETE the line (or paragraph) rather than substituting. Applied to:
  - `brief/bin/lib/model-profiles.cjs` — DELETE the 5 removed-agent object-literal keys at their verified line locations (16, 20, 23, 24, 25) before any blanket sub runs. Post-edit grep `grep -c "'brief-executor'" brief/bin/lib/model-profiles.cjs` must return 1, not 6.
  - `brief/references/agent-contracts.md` — DELETE the 6 removed-agent table rows at lines 19, 21, 22, 23, 25, 27 and fix the in-body sentence at line 39 that mentions `gsd-integration-checker` by name.
  - `brief/references/model-profiles.md` — DELETE the 3 removed-agent references (rows 15, 19, 64).
  - `brief/workflows/execute-phase.md` — DELETE the 5 removed-agent capability bullet lines (lines 43–49 range) in the `<available_agent_types>` block.
  - `brief/workflows/quick.md` — DELETE the 1 removed-agent bullet line at line ~26.
  - `brief/workflows/diagnose-issues.md` — This workflow EXISTS SOLELY to dispatch to the removed `gsd-debugger` agent. Check if Plan 02 already removed it; if present, DELETE the entire file now.
  - `brief/workflows/audit-milestone.md` — Depends on removed `gsd-integration-checker`. Check Plan 02; if present and its only purpose is that agent, DELETE the entire file; otherwise DELETE only the orphan references within.

- **Task 1 step 3 — BLANKET SUBSTITUTION for survivor identifiers ONLY.** After surgical edits complete, run blanket substitution on identifiers for SURVIVING agents (brief-planner, brief-executor, brief-verifier, brief-plan-checker, brief-phase-researcher, etc. — 18 survivors per Plan 02 SUMMARY). Removed-agent identifiers are NO LONGER PRESENT at this point, so there's nothing for a blanket sub to catch. This prevents the "5 duplicate brief-executor entries" failure mode.

Per D-09 (buildable state), this commit must leave the repo fully functional: `require()`s resolve, `brief-tools.cjs` can execute, commands dispatch to renamed agents correctly, and test modules all load. Test EXECUTION may still surface failures — any test that literally asserts on GSD branding strings in fixtures or help output needs those expected values updated too; deeper test logic repairs that go beyond text substitution are out of scope for this phase (Phase 9 hardening reviews them).

Purpose: Honor FND-03 part 3 (internal text references) and D-05 (aggressive rename including identifiers + namespaces + internal text) WITHOUT introducing duplicate keys or contradictory content per W3/W4/W5. After this plan, grepping for "GSD" or "get-shit-done" outside `.planning/` / `.git/` / `backup/` returns zero matches (or, at minimum, a documented residual set that the user explicitly accepts).

Output: Surgical edits applied to 7 known files + bulk text replacements across the rest, a post-replacement audit `01-05-text-ref-audit.md`, one atomic commit. `npm test` runs without module-load failures. `model-profiles.cjs` has exactly 1 `brief-executor` key.
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
<!-- TWO-PHASE SUBSTITUTION MODEL (per W3/W4/W5 revision): -->
<!-- -->
<!-- Phase A (Task 1 step 2): SURGICAL EDITS — per orphan-reference list from Plan 02 -->
<!--   INPUT:  tests/removed-surfaces.smoke.txt `# ORPHAN REFERENCES TO REPAIR IN PLAN 05` section -->
<!--   OUTPUT: Removed-agent lines/paragraphs DELETED from surviving files -->
<!--   SCOPE: -->
<!--     brief/bin/lib/model-profiles.cjs lines 16/20/23/24/25 (5 object-literal keys) -->
<!--     brief/references/agent-contracts.md lines 19/21/22/23/25/27 + sentence at 39 -->
<!--     brief/references/model-profiles.md lines 15/19/64 -->
<!--     brief/workflows/execute-phase.md lines 43–49 (5 bullet lines in available_agent_types block) -->
<!--     brief/workflows/quick.md line ~26 (1 bullet line) -->
<!--     brief/workflows/diagnose-issues.md — DELETE FILE if still present and solely depends on removed gsd-debugger -->
<!--     brief/workflows/audit-milestone.md — DELETE FILE if still present and solely depends on removed gsd-integration-checker -->
<!-- -->
<!-- Phase B (Task 1 step 3): BLANKET SUBSTITUTION — for SURVIVOR identifiers ONLY -->
<!--   INPUT:  ls agents/brief-*.md (the actual 18 survivors after Plan 02) -->
<!--   OUTPUT: Blanket replacements applied ONLY for brief-<survivor> identifiers -->
<!--   GUARANTEE: Removed-agent identifiers are GONE by Phase B start, so no duplicate keys can be produced. -->
<!-- -->
<!-- Substitution dictionary (Phase B path-based, always safe): -->
<!--   get-shit-done/  →  brief/                           (paths) -->
<!--   gsd-tools       →  brief-tools                      (binary refs) -->
<!--   gsd-tools.cjs   →  brief-tools.cjs                  (file refs, subset of above) -->
<!--   get-shit-done-cc → brief-cc                          (package name refs) -->
<!-- -->
<!-- Substitution dictionary (Phase B survivor-identifier, per-agent): -->
<!--   For each brief-<survivor> in ls agents/brief-*.md: -->
<!--     \bgsd-<survivor>\b  →  brief-<survivor> -->
<!--   NO entries for removed agents (gsd-code-reviewer, gsd-debugger, gsd-ui-*, gsd-eval-*, etc.) -->
<!--   because surgical edits already removed those references. -->
<!-- -->
<!-- Substitution dictionary (slash commands): -->
<!--   /gsd-                →  /brief-                      (slash command references in docs) -->
<!-- -->
<!-- Substitution dictionary (brand/verbose, case-preserving): -->
<!--   Get Shit Done        →  BRIEF                        (headings/body in .md) -->
<!--   get-shit-done        →  brief                        (lowercase, not already covered) -->
<!--   GSD                  →  BRIEF                        (uppercase acronym — CAUTION scope) -->
<!-- -->
<!-- CAUTION boundaries (do NOT replace): -->
<!--   Contents inside .planning/ (our own planning artifacts reference historical GSD decisions) -->
<!--   Contents inside .git/ and node_modules/ -->
<!--   Contents on the backup/original-gsd branch -->
<!--   Test fixtures that deliberately test GSD-branding coverage -->

<!-- Post-Plan-04 state (verified): -->
<!--   brief/ directory exists with bin/ contexts/ references/ templates/ workflows/ -->
<!--   brief/bin/brief-tools.cjs exists -->
<!--   package.json name=brief-cc, bin.brief-cc=bin/install.js, files includes "brief" -->
<!--   package.json descriptive fields also updated per Plan 04 Task 2 (checker WARNING #6 fix) -->
<!--   All agents, commands, hooks, 3 test files are brief-* prefixed -->
<!--   But their CONTENTS still reference gsd-* / get-shit-done/ / Get Shit Done / etc. -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Execute SURGICAL edits first (removed-agent refs), then BLANKET substitutions (survivor-only)</name>
  <files>
    (hundreds of files — scoped by directory/glob, see action)
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-05 full rename spec; Claude's Discretion clause allows planner to choose the pattern-matching strategy)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-02-SUMMARY.md (surgical-edit handoff: MUST read the ORPHAN REFERENCES section of tests/removed-surfaces.smoke.txt)
    - tests/removed-surfaces.smoke.txt — the authoritative surgical-edit list produced by Plan 02 Task 1
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Establish safety: confirm the backup branch exists so a revert is always possible:
```bash
git branch | grep -q "backup/original-gsd" || { echo "FAIL: backup branch missing"; exit 1; }
echo "Safety net present."
# Confirm Plan 02's orphan-reference section is available
grep -q "^# ORPHAN REFERENCES TO REPAIR IN PLAN 05" tests/removed-surfaces.smoke.txt || { echo "FAIL: Plan 02 orphan-reference section missing — cannot run surgical edits"; exit 1; }
```

2. **SURGICAL EDITS (Phase A — removed-agent references).** Each edit below uses the Edit tool (not sed/perl substitution) so the change is explicit, reviewable, and cannot produce duplicate-key side effects.

   **2a. `brief/bin/lib/model-profiles.cjs` — DELETE 5 removed-agent object-literal keys (W4 critical fix).**

   Planner verified at planning time that the file's `MODEL_PROFILES` object contains these removed-agent keys at these lines (lines are stable because no prior plan edits this file):
   - Line 16: `'gsd-debugger': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet', adaptive: 'opus' },`
   - Line 20: `'gsd-integration-checker': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'haiku' },`
   - Line 23: `'gsd-ui-researcher': { quality: 'opus', balanced: 'sonnet', budget: 'haiku', adaptive: 'sonnet' },`
   - Line 24: `'gsd-ui-checker': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'haiku' },`
   - Line 25: `'gsd-ui-auditor': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'haiku' },`

   Use the Edit tool once per key. Example for the first one:
   - **old_string:**
     ```
       'gsd-debugger': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet', adaptive: 'opus' },
     ```
   - **new_string:** (empty — delete the entire line including trailing newline)
   Repeat with exact old_string for the other 4 removed keys.

   After these 5 edits, verify:
   ```bash
   # model-profiles.cjs should load
   node -e "const p = require('./brief/bin/lib/model-profiles.cjs'); console.log('keys:', Object.keys(p).length);" || { echo "FAIL: model-profiles.cjs broken"; exit 1; }
   # No removed-agent keys remain
   for removed in gsd-debugger gsd-integration-checker gsd-ui-researcher gsd-ui-checker gsd-ui-auditor; do
     ! grep -q "'$removed'" brief/bin/lib/model-profiles.cjs || { echo "FAIL: $removed still in file"; exit 1; }
   done
   # Remaining count: original 18 minus 5 removed = 13 survivors at this point (still gsd-* prefixed — renamed in step 3)
   REMAINING=$(grep -c "^  'gsd-" brief/bin/lib/model-profiles.cjs)
   [ "$REMAINING" = "13" ] || echo "WARN: expected 13 surviving gsd-* keys, got $REMAINING"
   ```

   **2b. `brief/references/agent-contracts.md` — DELETE 6 removed-agent table rows + fix 1 body sentence.**

   Planner verified these rows at planning time (line numbers are stable; line 39 is an in-body reference):
   - Line 19: `| gsd-debugger | Debug investigation | ...`
   - Line 21: `| gsd-ui-auditor | UI review | ...`
   - Line 22: `| gsd-ui-checker | UI validation | ...`
   - Line 23: `| gsd-ui-researcher | UI spec creation | ...`
   - Line 25: `| gsd-integration-checker | Cross-phase integration check | ...`
   - Line 27: `| gsd-security-auditor | Security audit | ...`
   - Line 39 (body): `2. **Title-case markers** (e.g., `## Verification Complete`) exist in gsd-verifier and gsd-integration-checker -- these are intentional as-is, not bugs`

   Use Edit tool once per row (old_string = the full row text including leading `|`, new_string = empty). For the body sentence at line 39, use Edit to replace the removed-agent-bearing portion:
   - **old_string:** `` exist in gsd-verifier and gsd-integration-checker -- these are intentional as-is, not bugs ``
   - **new_string:** `` exist in gsd-verifier -- these are intentional as-is, not bugs ``

   Verify:
   ```bash
   for removed in gsd-debugger gsd-ui-auditor gsd-ui-checker gsd-ui-researcher gsd-integration-checker gsd-security-auditor; do
     ! grep -q "| $removed " brief/references/agent-contracts.md || { echo "FAIL: $removed row still in contracts"; exit 1; }
   done
   ```

   **2c. `brief/references/model-profiles.md` — DELETE 3 removed-agent references.**

   - Line 15: `| gsd-debugger | opus | sonnet | sonnet | opus | inherit |`
   - Line 19: `| gsd-integration-checker | sonnet | sonnet | haiku | haiku | inherit |`
   - Line 64: `    "gsd-debugger": "o3",` (an example override — DELETE the line)

   Use Edit tool per row.

   Verify:
   ```bash
   ! grep -q "| gsd-debugger " brief/references/model-profiles.md || { echo "FAIL"; exit 1; }
   ! grep -q "| gsd-integration-checker " brief/references/model-profiles.md || { echo "FAIL"; exit 1; }
   ! grep -q "\"gsd-debugger\"" brief/references/model-profiles.md || { echo "FAIL"; exit 1; }
   ```

   **2d. `brief/workflows/execute-phase.md` — DELETE 5 removed-agent bullet lines from `<available_agent_types>` block.**

   Planner verified these lines (line numbers are stable):
   - Line 43: `- gsd-debugger — Diagnoses and fixes issues`
   - Line 45: `- gsd-integration-checker — Checks cross-phase integration`
   - Line 47: `- gsd-ui-researcher — Researches UI/UX approaches`
   - Line 48: `- gsd-ui-checker — Reviews UI implementation quality`
   - Line 49: `- gsd-ui-auditor — Audits UI against design requirements`

   Use Edit tool once per line. Verify:
   ```bash
   for removed in gsd-debugger gsd-integration-checker gsd-ui-researcher gsd-ui-checker gsd-ui-auditor; do
     ! grep -q "^- $removed " brief/workflows/execute-phase.md || { echo "FAIL: $removed bullet still in execute-phase"; exit 1; }
   done
   ```

   **2e. `brief/workflows/quick.md` — DELETE 1 removed-agent bullet line.**

   Planner verified line ~26: `- gsd-code-reviewer — Reviews source files for bugs, security issues, and code quality`

   Use Edit tool:
   - **old_string:** `- gsd-code-reviewer — Reviews source files for bugs, security issues, and code quality\n`
   - **new_string:** `` (empty)

   Verify:
   ```bash
   ! grep -q "^- gsd-code-reviewer " brief/workflows/quick.md || { echo "FAIL"; exit 1; }
   ```

   **2f. `brief/workflows/diagnose-issues.md` + `brief/workflows/audit-milestone.md` — FILE-LEVEL orphan check.**

   If Plan 02 did not already delete these (verify with `ls`), inspect whether they depend SOLELY on a removed agent:
   ```bash
   if [ -f brief/workflows/diagnose-issues.md ]; then
     USES=$(grep -c "gsd-debugger\|brief-debugger" brief/workflows/diagnose-issues.md)
     if [ "$USES" -gt 0 ]; then
       OTHER_AGENT=$(grep -c "subagent_type" brief/workflows/diagnose-issues.md)
       if [ "$OTHER_AGENT" -le "$USES" ]; then
         # File's sole purpose is to dispatch to the removed agent — delete entirely
         git rm brief/workflows/diagnose-issues.md
         echo "Deleted orphan workflow: diagnose-issues.md"
       else
         # File uses other agents too — just apply the orphan-reference edits recorded in the audit
         echo "diagnose-issues.md uses multiple agents; handle via orphan list"
       fi
     fi
   fi
   if [ -f brief/workflows/audit-milestone.md ]; then
     USES=$(grep -c "gsd-integration-checker\|brief-integration-checker" brief/workflows/audit-milestone.md)
     if [ "$USES" -gt 0 ]; then
       OTHER_AGENT=$(grep -c "subagent_type" brief/workflows/audit-milestone.md)
       if [ "$OTHER_AGENT" -le "$USES" ]; then
         git rm brief/workflows/audit-milestone.md
         echo "Deleted orphan workflow: audit-milestone.md"
       fi
     fi
   fi
   ```

   **2g. Iterate the remaining orphan list.** Plan 02's `tests/removed-surfaces.smoke.txt # ORPHAN REFERENCES` section may list additional file:line:snippet records beyond the 6 files above. For each additional record, use the Edit tool to delete or edit the specific line. Do NOT skip orphan locations — each must be resolved surgically, not via blanket substitution.

   ```bash
   # Extract orphan-list entries not yet handled
   awk '/## Surviving markdown files/,/## Surviving \.cjs/' tests/removed-surfaces.smoke.txt | grep -v "^#\|^$" | \
     grep -vE "execute-phase.md|quick.md|diagnose-issues.md|audit-milestone.md|agent-contracts.md|model-profiles.md" | \
     head -30
   # For each remaining file:line:snippet record, apply an Edit-tool deletion of that specific line.
   # (Planner expects most records have been covered by 2a–2f. Any additional ones must be handled individually.)
   ```

3. **BLANKET SUBSTITUTIONS (Phase B — survivor identifiers + paths + slash commands + brand).** Applied AFTER all surgical edits complete. Removed-agent identifiers are GONE at this point, so no duplicate keys can be produced.

   Define the file scope — every `.md`, `.cjs`, `.js`, `.sh`, `.json` under the repo EXCEPT:
   - `.planning/` (our planning artifacts — keep historical references intact)
   - `.git/`
   - `node_modules/`
   - `backup/` (local backup copies, if any)
   - `tests/removed-surfaces.smoke.txt` (audit trail — should contain historical gsd-* names)

```bash
find . -type f \( -name "*.md" -o -name "*.cjs" -o -name "*.js" -o -name "*.sh" -o -name "*.json" \) \
  -not -path "./.planning/*" \
  -not -path "./.git/*" \
  -not -path "./node_modules/*" \
  -not -path "./backup/*" \
  -not -name "removed-surfaces.smoke.txt" \
  2>/dev/null > /tmp/plan05-work-list.txt
wc -l /tmp/plan05-work-list.txt
```

   **3a. PATH replacements (safest, most mechanical):**
```bash
# get-shit-done/ → brief/ (path refs)
while IFS= read -r f; do
  if grep -q "get-shit-done/" "$f" 2>/dev/null; then
    perl -i -pe 's|get-shit-done/|brief/|g' "$f"
  fi
done < /tmp/plan05-work-list.txt

# get-shit-done-cc → brief-cc (package-name refs — often in README/docs)
while IFS= read -r f; do
  if grep -q "get-shit-done-cc" "$f" 2>/dev/null; then
    perl -i -pe 's|get-shit-done-cc|brief-cc|g' "$f"
  fi
done < /tmp/plan05-work-list.txt

# gsd-tools → brief-tools (binary refs — subset caught by the first rule when preceded by path)
while IFS= read -r f; do
  if grep -q "gsd-tools" "$f" 2>/dev/null; then
    perl -i -pe 's|gsd-tools(\.cjs)?|brief-tools$1|g' "$f"
  fi
done < /tmp/plan05-work-list.txt
```

   **3b. SURVIVOR-IDENTIFIER replacements (per-agent, NO removed agents):**
```bash
# Build list of SURVIVING agent identifiers from the actual renamed agent files
# (Plan 03 renamed agents/gsd-<survivor>.md → agents/brief-<survivor>.md — so we read the brief-* names directly)
RENAMED_AGENTS=$(ls agents/brief-*.md 2>/dev/null | sed 's|agents/||; s|\.md||' | sort -u)
echo "Survivors to rename identifiers for:"
echo "$RENAMED_AGENTS"

# For each survivor, replace old name → new name everywhere (subagent_type, markdown refs, code)
echo "$RENAMED_AGENTS" | while read -r new_name; do
  old_name=$(echo "$new_name" | sed 's|^brief-|gsd-|')
  while IFS= read -r f; do
    if grep -q "$old_name" "$f" 2>/dev/null; then
      perl -i -pe "s|\b$old_name\b|$new_name|g" "$f"
    fi
  done < /tmp/plan05-work-list.txt
done

# NOTE: No loop here for removed-agent identifiers. They were deleted surgically in step 2
# and there should be no further refs in the work list. If any linger, they will surface in
# Task 2's residual grep (and if so, it indicates a missed surgical edit — NOT a reason to
# re-introduce the blanket brief-executor rewrite).
```

   **3c. SLASH-COMMAND replacements:**
```bash
# /gsd- → /brief- for references inside .md bodies and any docs
while IFS= read -r f; do
  if grep -q "/gsd-" "$f" 2>/dev/null; then
    perl -i -pe 's|/gsd-|/brief-|g' "$f"
  fi
done < /tmp/plan05-work-list.txt
```

   **3d. BRAND/VERBOSE replacements (most risk — last, most conservative):**
```bash
# "Get Shit Done" → "BRIEF" (as project name)
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

# "GSD" as a standalone acronym — .md files ONLY
while IFS= read -r f; do
  case "$f" in
    *.md)
      perl -i -pe 's/\bGSD\b/BRIEF/g' "$f"
      ;;
  esac
done < /tmp/plan05-work-list.txt
```

4. Repair the CLAUDE.md `GSD:*` sentinel comments. The CLAUDE.md generator puts these HTML-style comments around sections (`<!-- GSD:project-start ... -->`). The above step replaced `GSD` with `BRIEF` inside these, which is acceptable: they become `<!-- BRIEF:project-start ... -->`. Plan 06's CLAUDE.md rewrite uses the BRIEF-prefixed sentinels.

5. Re-run buildability (W4 explicit verification added):
```bash
node -e "require('./brief/bin/lib/core.cjs'); console.log('core: OK');" || { echo "FAIL"; exit 1; }
node -e "require('./brief/bin/lib/state.cjs'); console.log('state: OK');" || { echo "FAIL"; exit 1; }
node -e "require('./brief/bin/lib/init.cjs'); console.log('init: OK');" || { echo "FAIL"; exit 1; }

# W4 specific: model-profiles.cjs must have EXACTLY ONE brief-executor key (not 6)
BE_COUNT=$(grep -c "'brief-executor'" brief/bin/lib/model-profiles.cjs)
echo "brief-executor keys in model-profiles.cjs: $BE_COUNT (must be 1)"
[ "$BE_COUNT" = "1" ] || { echo "FAIL: W4 duplicate-key defense failed — $BE_COUNT brief-executor keys instead of 1"; grep -n "brief-executor" brief/bin/lib/model-profiles.cjs; exit 1; }

# W4 runtime check: loading the module and counting unique keys
node -e "const p = require('./brief/bin/lib/model-profiles.cjs'); const keys = Object.keys(p); const unique = new Set(keys); if (unique.size !== keys.length) { console.log('FAIL: duplicate keys detected at runtime — last-wins silently broke profiles'); process.exit(1); } console.log('OK: ' + keys.length + ' unique profile keys');" || exit 1

# Try the entry point
node brief/bin/brief-tools.cjs --help 2>&1 | head -20 || echo "brief-tools.cjs --help returned non-zero (may be normal for help command)"
```

6. Run the test suite and capture failures (NOT a gate — failures about branding strings are acceptable residual):
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
# W4: model-profiles.cjs must have EXACTLY ONE brief-executor key
BE_COUNT=$(grep -c "'"'"'brief-executor'"'"'" brief/bin/lib/model-profiles.cjs)
[ "$BE_COUNT" = "1" ] || { echo "FAIL (W4): brief-executor key count is $BE_COUNT, expected 1"; grep -n "brief-executor" brief/bin/lib/model-profiles.cjs; exit 1; }
# W4 runtime: no duplicate keys
node -e "const p = require(\"./brief/bin/lib/model-profiles.cjs\"); const keys = Object.keys(p); if (new Set(keys).size !== keys.length) { process.exit(1); }" || { echo "FAIL (W4): duplicate keys at runtime"; exit 1; }
# W3: execute-phase.md must have 0 contradictory brief-executor capability bullet lines
BAD=$(grep -cE "^- brief-executor .*(UI|Diagnoses|Cross-phase integration|UI/UX)" brief/workflows/execute-phase.md)
[ "$BAD" = "0" ] || { echo "FAIL (W3): $BAD contradictory brief-executor capability bullet(s) in execute-phase.md"; exit 1; }
# W5: agent-contracts.md — each surviving agent has EXACTLY one table row (no duplicates)
DUP_CONTRACTS=$(grep -c "^| brief-executor " brief/references/agent-contracts.md)
[ "$DUP_CONTRACTS" -le 1 ] || { echo "FAIL (W5): $DUP_CONTRACTS brief-executor rows in agent-contracts.md"; exit 1; }
DUP_PROFILES=$(grep -c "^| brief-executor " brief/references/model-profiles.md)
[ "$DUP_PROFILES" -le 1 ] || { echo "FAIL (W5): $DUP_PROFILES brief-executor rows in model-profiles.md"; exit 1; }
# Lib loads
node -e "require(\"./brief/bin/lib/core.cjs\");" || { echo "FAIL: core broken"; exit 1; }
# brief-tools.cjs is an executable entry
node brief/bin/brief-tools.cjs --help >/dev/null 2>&1 || node brief/bin/brief-tools.cjs >/dev/null 2>&1 || echo "brief-tools exits non-zero on --help; inspect manually (acceptable if command usage was printed)"
echo "OK: Task 1 verified (surgical + blanket with W3/W4/W5 guards)"
'
    </automated>
  </verify>
  <done>
    - **Surgical edits complete** (Task 1 step 2): `brief/bin/lib/model-profiles.cjs` has 5 removed-agent keys deleted; `brief/references/agent-contracts.md` has 6 removed-agent rows + 1 body sentence edited; `brief/references/model-profiles.md` has 3 removed-agent references deleted; `brief/workflows/execute-phase.md` has 5 removed-agent bullets deleted; `brief/workflows/quick.md` has 1 removed-agent bullet deleted; orphan workflow files handled per 2f
    - **Blanket substitutions complete** (Task 1 step 3): path refs, gsd-tools, slash-commands, survivor identifiers, brand text all substituted
    - 0 files outside `.planning/`, `.git/`, `node_modules/`, `backup/` contain `get-shit-done/` path reference
    - 0 files outside same exclusions contain `gsd-tools` or `gsd-tools.cjs` reference
    - 0 files outside same exclusions contain `subagent_type: gsd-` or `/gsd-` slash-command reference
    - **W4 verified:** `grep -c "'brief-executor'" brief/bin/lib/model-profiles.cjs` returns 1 (not 5 or 6); runtime Object.keys check confirms no duplicates
    - **W3 verified:** 0 contradictory "brief-executor — Diagnoses/UI/Cross-phase" bullets in execute-phase.md
    - **W5 verified:** ≤1 `^| brief-executor ` row in both agent-contracts.md and model-profiles.md
    - Standalone `GSD` replaced with `BRIEF` in `.md` files (residuals in LICENSE/CHANGELOG/CONTRIBUTING/SECURITY intentionally preserved)
    - `get-shit-done-cc` package-name references replaced with `brief-cc`
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
**Strategy:** Two-phase — SURGICAL edits for removed-agent refs (W3/W4/W5 fixes) + BLANKET substitutions for survivor identifiers/paths/brand

## Surgical-edit summary (per-file)

| File | Edit type | Lines touched | Checker issue closed |
|------|-----------|---------------|----------------------|
| brief/bin/lib/model-profiles.cjs | Delete 5 object-literal keys | 16, 20, 23, 24, 25 | W4 |
| brief/references/agent-contracts.md | Delete 6 table rows + edit 1 body sentence | 19, 21, 22, 23, 25, 27, 39 | W5 |
| brief/references/model-profiles.md | Delete 3 rows | 15, 19, 64 | W5 |
| brief/workflows/execute-phase.md | Delete 5 bullet lines | 43, 45, 47, 48, 49 | W3 |
| brief/workflows/quick.md | Delete 1 bullet line | ~26 | W3 |
| brief/workflows/diagnose-issues.md | Delete file if orphan | (whole) | W3 |
| brief/workflows/audit-milestone.md | Delete file if orphan | (whole) | W3 |

## Residual count (should be ~0 outside documented exclusions)

| Pattern | Count | Note |
|---------|-------|------|
| \`get-shit-done/\` | $(grep -rln "get-shit-done/" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./node_modules/\|^./backup/\|removed-surfaces.smoke.txt" | wc -l | tr -d ' ') | Files still referencing old path |
| \`gsd-tools\` | $(grep -rln "gsd-tools" . --include="*.md" --include="*.cjs" --include="*.js" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./node_modules/\|^./backup/" | wc -l | tr -d ' ') | Files still referencing old binary |
| \`subagent_type: gsd-\` | $(grep -rln "subagent_type: gsd-" . --include="*.md" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./backup/" | wc -l | tr -d ' ') | Files with old subagent references |
| \`/gsd-\` | $(grep -rln "/gsd-" . --include="*.md" --include="*.cjs" --include="*.js" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./node_modules/\|^./backup/" | wc -l | tr -d ' ') | Files with old slash-command refs |
| \`get-shit-done-cc\` | $(grep -rln "get-shit-done-cc" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./node_modules/\|^./backup/" | wc -l | tr -d ' ') | Files with old package name |
| \`'brief-executor'\` in model-profiles.cjs | $(grep -c "'brief-executor'" brief/bin/lib/model-profiles.cjs 2>/dev/null || echo 0) | W4 check — must be exactly 1 |

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
cat "$AUDIT" | head -40
```

2. Stage + commit:
```bash
git add -A
# Optional: show summary
git status --short | head -20
git diff --cached --stat | tail -5

# Commit
node brief/bin/brief-tools.cjs commit "refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3; W3/W4/W5 surgical closure)" --files $(git diff --cached --name-only | tr '\n' ' ')
# Fallback
# git commit -m "refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3; W3/W4/W5 surgical closure)"
```

3. Final buildability re-check:
```bash
node -e "require('./brief/bin/lib/core.cjs'); console.log('post-commit-5: core OK');"
node -e "require('./brief/bin/lib/state.cjs'); console.log('post-commit-5: state OK');"
# W4 post-commit reverification
BE=$(grep -c "'brief-executor'" brief/bin/lib/model-profiles.cjs)
[ "$BE" = "1" ] || { echo "FAIL post-commit: brief-executor count=$BE"; exit 1; }
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
# Audit contains surgical-edit summary section
grep -q "^## Surgical-edit summary" .planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md || { echo "FAIL: surgical summary missing"; exit 1; }
# Commit message matches
git log -1 --format="%s" | grep -qE "refactor\(01-refs\).*update internal text references to BRIEF" || { echo "FAIL: commit message"; exit 1; }
# Residual counts all zero (outside allowed exclusions)
for pattern in "get-shit-done/" "gsd-tools" "subagent_type: gsd-" "/gsd-"; do
  COUNT=$(grep -rln "$pattern" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" 2>/dev/null | grep -v "^\./\.planning/\|^\./\.git/\|^\./node_modules/\|^\./backup/\|removed-surfaces.smoke.txt" | wc -l | tr -d " ")
  [ "$COUNT" = "0" ] || { echo "FAIL: $COUNT files still have pattern: $pattern"; grep -rln "$pattern" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" 2>/dev/null | grep -v "^\./\.planning/\|^\./\.git/\|^\./node_modules/\|^\./backup/\|removed-surfaces.smoke.txt" | head -3; exit 1; }
done
# W4 post-commit reverification
BE=$(grep -c "'"'"'brief-executor'"'"'" brief/bin/lib/model-profiles.cjs)
[ "$BE" = "1" ] || { echo "FAIL: W4 regressed post-commit; brief-executor count=$BE"; exit 1; }
# Module load
node -e "require(\"./brief/bin/lib/core.cjs\"); require(\"./brief/bin/lib/state.cjs\");" || { echo "FAIL: lib broken"; exit 1; }
node -e "const p=require(\"./brief/bin/lib/model-profiles.cjs\"); const keys=Object.keys(p); if (new Set(keys).size !== keys.length) process.exit(1);" || { echo "FAIL: duplicate keys at runtime"; exit 1; }
echo "OK: Task 2 verified — commit 5 passes with W3/W4/W5 closure"
'
    </automated>
  </verify>
  <done>
    - `01-05-text-ref-audit.md` created in the phase dir showing residual counts + surgical-edit summary
    - Exactly one new commit on `main` with message `refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3; W3/W4/W5 surgical closure)`
    - All residual counts for `get-shit-done/`, `gsd-tools`, `subagent_type: gsd-`, `/gsd-` outside allowed exclusion paths are 0
    - W4: `brief/bin/lib/model-profiles.cjs` has exactly 1 `'brief-executor'` key post-commit; runtime key-set size equals key-array length
    - Lib layer still loads
    - `npm test` has no module-load errors
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| String content ↔ semantic meaning | Mass text replacement risks accidentally hitting substrings with different meaning (e.g., "GSD" as a file format in a different context). Exclusion list + file-type scoping + lowercase/uppercase casing awareness mitigates. |
| Object-literal keys ↔ JavaScript silent duplicate semantics | JS allows duplicate keys and silently drops the earlier value (last-wins). Blanket substitution of removed-agent → brief-executor would have overwritten the real brief-executor entry. Surgical deletion first, blanket sub only on survivors afterward, prevents this. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-10 | T (Tampering) | A `GSD` substring inside an unrelated technical term or code comment gets wrongly replaced | accept | Scoped to .md/.cjs/.js/.sh/.json files in a forked repo. Residuals in LICENSE/CHANGELOG are preserved. Backup branch is rollback. |
| T-01-11 | I (Information Disclosure) | Backup branch retains unredacted GSD state | accept | Documented in Phase 1 Plan 01 threat model. Backup is local-only during Phase 1. |
| T-01-12 | D (DoS) | Test suite regressions: after text replacement, assertions comparing to literal "gsd-*" strings fail | accept | Test-suite repair for branding-related assertions is documented as residual-to-be-fixed-in-Phase-9. Plan 05 validates only that tests LOAD, not that they PASS. |
| T-01-23 | T (Tampering) | Blanket substitution `gsd-<removed>` → `brief-executor` silently overwrites real brief-executor profile/row via JavaScript duplicate-key / markdown-duplicate-row semantics | mitigate | TWO-PHASE substitution: (1) surgical deletion of removed-agent references first, (2) blanket sub over SURVIVOR-ONLY identifiers afterward. Explicit W4 guards at build-time (grep -c "'brief-executor'" returns 1) and runtime (new Set(keys).size === keys.length). |
| T-01-24 | R (Repudiation) | A reviewer opens brief/workflows/execute-phase.md and sees 5 contradictory brief-executor capability bullets; no clear audit trail of what went wrong | mitigate | Surgical edits produce clean state (no duplicate bullets). Audit file `01-05-text-ref-audit.md` lists exactly what was edited where. |

Phase 1 still adds zero new attack surface — this is a text refactor.
</threat_model>

<verification>
1. `grep -rln "get-shit-done/" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" | grep -v -e ".planning/" -e ".git/" -e "node_modules/" -e "backup/" -e "removed-surfaces.smoke.txt" | wc -l` returns 0.
2. `grep -rln "gsd-tools" . --include="*.md" --include="*.cjs" --include="*.js" | grep -v -e ".planning/" -e ".git/" -e "node_modules/" -e "backup/" | wc -l` returns 0.
3. `grep -rln "subagent_type: gsd-" . --include="*.md" | grep -v -e ".planning/" -e ".git/" -e "backup/" | wc -l` returns 0.
4. `grep -rln "/gsd-" . --include="*.md" --include="*.cjs" --include="*.js" | grep -v -e ".planning/" -e ".git/" -e "node_modules/" -e "backup/" | wc -l` returns 0.
5. `node -e "require('./brief/bin/lib/core.cjs')"` exits 0.
6. `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md` exists and records residuals + surgical-edit summary.
7. Commit message: `refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3; W3/W4/W5 surgical closure)`.
8. W4: `grep -c "'brief-executor'" brief/bin/lib/model-profiles.cjs` = 1.
9. W4 runtime: `node -e "const p=require('./brief/bin/lib/model-profiles.cjs'); const k=Object.keys(p); process.exit(new Set(k).size !== k.length ? 1 : 0);"` exits 0.
10. W3: `grep -cE "^- brief-executor .*(UI|Diagnoses|Cross-phase)" brief/workflows/execute-phase.md` = 0.
11. W5: `grep -c "^| brief-executor " brief/references/agent-contracts.md` ≤ 1.
12. W5: `grep -c "^| brief-executor " brief/references/model-profiles.md` ≤ 1.
</verification>

<success_criteria>
- [ ] Path-like references (`get-shit-done/`) replaced repo-wide outside planning/git/backup/node_modules
- [ ] Binary references (`gsd-tools`, `gsd-tools.cjs`) replaced with `brief-tools`, `brief-tools.cjs`
- [ ] All `/gsd-*` slash-command references updated to `/brief-*`
- [ ] All `subagent_type: gsd-<survivor>` references updated to `subagent_type: brief-<survivor>` (removed-agent refs DELETED surgically, not substituted — W3 closure)
- [ ] All `get-shit-done-cc` package-name references updated to `brief-cc`
- [ ] `GSD` acronym and `Get Shit Done` brand text replaced with `BRIEF` in .md files (excluding LICENSE/CHANGELOG/CONTRIBUTING/SECURITY)
- [ ] **W4 closure:** `brief/bin/lib/model-profiles.cjs` has exactly 1 `'brief-executor'` object-literal key (not 5 or 6); runtime duplicate-key check passes
- [ ] **W3 closure:** `brief/workflows/execute-phase.md` has 0 contradictory brief-executor capability bullets (UI, Diagnoses, Cross-phase removed via surgical delete)
- [ ] **W5 closure:** `brief/references/agent-contracts.md` and `brief/references/model-profiles.md` have ≤1 `^| brief-executor ` row each
- [ ] `brief/bin/brief-tools.cjs` still executes without module-load errors
- [ ] `01-05-text-ref-audit.md` committed as audit trail (includes Surgical-edit summary section)
- [ ] Exactly one atomic commit per D-08 commit 5
- [ ] FND-03 fully satisfied across its three parts (Plans 03, 04, 05)
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-SUMMARY.md` recording:
- Residual-count table
- Surgical-edit summary per file (which lines in which file were deleted)
- W3/W4/W5 closure confirmations (grep-count outputs)
- Test-suite failures (with classification: module-load vs assertion-string)
- List of intentional residuals deferred to Phase 9
</output>
</content>
