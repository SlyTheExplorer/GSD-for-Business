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
  # bin/install.js (references get-shit-done AND has removed-agent permission-map entries)
  - "bin/install.js"
  # Scripts
  - "scripts/run-tests.cjs"
  - "scripts/build-hooks.js"
  # Tests (surgical edits + bare-prefix fix)
  - "tests/*.test.cjs"
  - "tests/agent-frontmatter.test.cjs"  # BLOCKER 2: bare-prefix + path-constant fix
  # sdk/ (BLOCKER 1 scope expansion — removed-agent model-profile entries)
  - "sdk/src/query/config-query.ts"
  # docs/ English + localized mirrors (BLOCKER 1 scope expansion)
  - "docs/ARCHITECTURE.md"
  - "docs/AGENTS.md"
  - "docs/COMMANDS.md"
  - "docs/CONFIGURATION.md"
  - "docs/FEATURES.md"
  - "docs/USER-GUIDE.md"
  - "docs/CLI-TOOLS.md"
  - "docs/ja-JP/**/*.md"
  - "docs/ko-KR/**/*.md"
  - "docs/zh-CN/**/*.md"
  # Top-level docs (BLOCKER 1 scope expansion — CHANGELOG treated as RESIDUAL with banner)
  - "CHANGELOG.md"
  - "CONTRIBUTING.md"
  - "SECURITY.md"
  # Known surgical-edit targets (pre-BLOCKER-1 scope)
  - "brief/workflows/execute-phase.md"
  - "brief/workflows/quick.md"
  - "brief/references/model-profiles.md"
  - "brief/references/agent-contracts.md"
  - "brief/bin/lib/model-profiles.cjs"
  # Known whole-file deletions (DELETE-FILE disposition from Plan 02 audit)
  - "brief/templates/debug-subagent-prompt.md"
  - "brief/workflows/diagnose-issues.md"
  - "brief/workflows/audit-milestone.md"
  # Baseline capture for W4 delta-cap rigor
  - ".planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt"
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
    - "User runs `grep -c \"'brief-executor'\" brief/bin/lib/model-profiles.cjs` and gets 1 (NOT 6 — confirms W4 duplicate-key fix)"
    - "User runs `grep -c \"'gsd-'\" tests/agent-frontmatter.test.cjs` and gets 0; `grep -c \"'brief-'\" tests/agent-frontmatter.test.cjs` returns ≥1 (BLOCKER 2 bare-prefix fix)"
    - "User runs `node tests/agent-frontmatter.test.cjs` and the test iterates ≥18 agents (not zero — confirms BLOCKER 2 fix prevented vacuous PASS)"
    - "User runs `grep -E 'gsd-(code-reviewer|code-fixer|debugger|ui-researcher|ui-checker|ui-auditor|ai-researcher|eval-planner|eval-auditor|domain-researcher|security-auditor|integration-checker|debug-session-manager)' . -r --exclude-dir=.planning --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=backup 2>/dev/null | grep -v '^CHANGELOG\\.md:' | wc -l` and gets 0 (BLOCKER 1 expanded-scope closure)"
    - "`npm test` failure count post-Plan-05 is ≤ `BASELINE_FAIL_COUNT + 10` (W4 delta-cap gate)"
  artifacts:
    - path: ".planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt"
      provides: "npm test baseline captured BEFORE any Plan 05 edits (for W4 delta-cap)"
      contains: "BASELINE_FAIL_COUNT + raw `npm test` tail output"
    - path: ".planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md"
      provides: "Post-replacement audit with residual counts + baseline-delta + surgical-edit summary (W3/W4/W5 closure)"
      contains: "grep-count report + BASELINE_FAIL_COUNT vs POST_FAIL_COUNT + surgical-edit summary"
  key_links:
    - from: "removed-agent references in surviving docs (EXPANDED-scope orphan list from Plan 02 Task 1)"
      to: "surgical Edit-tool deletions or DELETE-FILE git rms (NOT blanket substitutions)"
      via: "Task 1 step 2 (per-disposition processing of each DELETE-LINE / DELETE-FILE record)"
      pattern: "every orphan record from Plan 02 audit has a matching action in Plan 05"
    - from: "tests/agent-frontmatter.test.cjs bare-prefix string literal"
      to: "'gsd-' → 'brief-' + path-constant updates"
      via: "Task 1 step 2-BLOCKER-2 (BLOCKER 2 closure)"
      pattern: "test iterates surviving brief-* agents, not zero"
    - from: "npm test baseline"
      to: "npm test delta-cap gate"
      via: "Task 1 step 0 + Task 1 step 7 (W4 closure)"
      pattern: "POST_FAIL_COUNT - BASELINE_FAIL_COUNT ≤ 10"
---

<objective>
Execute commit 5 of 6 (per D-08): update every text reference to `gsd-*` / `GSD` / `Get Shit Done` / `get-shit-done/` / `gsd-tools` inside `.md`, `.cjs`, `.js`, `.sh`, `.ts`, and `.json` files to the BRIEF-equivalent terminology. This is a THREE-PHASE pass (baseline → surgical → blanket) across the renamed repo; combined with Plans 03 and 04, it closes out FND-03 fully.

**Revision iteration 2 (BLOCKERs 1 + 2 + W3 + W4 closure):**

- **BLOCKER 1 (orphan-audit scope):** Plan 02 now emits disposition-tagged records (DELETE-LINE / DELETE-FILE / RESIDUAL) across the full scope — bin/, scripts/, tests/, sdk/, docs/ (English + 4 localized mirrors), top-level CHANGELOG/CONTRIBUTING/SECURITY. Plan 05 Task 1 step 2 processes EACH record by its disposition, not via blanket substitution.
- **BLOCKER 2 (bare-prefix test no-op):** `tests/agent-frontmatter.test.cjs` line 21 has the bare string literal `'gsd-'` which the survivor-identifier loop does NOT match (the loop iterates `brief-<survivor-name>` identifiers, not bare prefixes). After Plan 03 renames agents to `brief-*.md`, `readdirSync().filter(f => f.startsWith('gsd-'))` returns an empty array — every downstream assertion passes vacuously. Plan 05 MUST perform a string-literal replacement on line 21 (`'gsd-'` → `'brief-'`) AND update path constants on lines 17–18.
- **W3 (EXCLUDE asymmetry):** Previously excluded LICENSE/CHANGELOG/CONTRIBUTING/SECURITY from `Get Shit Done → BRIEF` but not from `GSD → BRIEF`. Plan 05 now applies a UNIFIED exclusion list to BOTH passes.
- **W4 (npm test delta cap):** Plan 05 captures a pre-edit baseline, runs tests post-edit, and hard-fails if `POST_FAIL_COUNT > BASELINE_FAIL_COUNT + 10`.

Per D-09 (buildable state), this commit must leave the repo fully functional: `require()`s resolve, `brief-tools.cjs` can execute, commands dispatch to renamed agents correctly, and test modules all load. The delta-cap (W4) bounds how many new test-assertion failures can be introduced.

Output: Baseline file (05-PRE-TEST-BASELINE.txt), surgical edits applied per EXPANDED-scope orphan list + bulk text replacements, post-replacement audit `01-05-text-ref-audit.md` with baseline-delta, one atomic commit. `npm test` post-edit failure count ≤ baseline + 10.
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
<!-- THREE-PHASE SUBSTITUTION MODEL (revision iteration 2): -->
<!-- -->
<!-- Phase Z (Task 1 step 0): BASELINE CAPTURE (W4) -->
<!--   INPUT:  npm test tail output BEFORE any edits -->
<!--   OUTPUT: .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt -->
<!--   USAGE:  Task 1 step 7 compares post-edit test output against this baseline -->
<!-- -->
<!-- Phase A (Task 1 step 2): DISPOSITION-DRIVEN SURGICAL EDITS — per EXPANDED orphan list -->
<!--   INPUT:  tests/removed-surfaces.smoke.txt `# ORPHAN REFERENCES TO REPAIR IN PLAN 05` section -->
<!--   OUTPUT: Per-record action applied based on disposition tag -->
<!--     DELETE-LINE  →  Edit tool deletes the specific line -->
<!--     DELETE-FILE  →  git rm removes the entire file -->
<!--     RESIDUAL     →  no edit; CHANGELOG gets pre-fork banner prepended -->
<!-- -->
<!-- Phase B (Task 1 step 3): BLANKET SUBSTITUTION — for SURVIVOR identifiers + paths + brand -->
<!--   INPUT:  ls agents/brief-*.md (the actual 18 survivors after Plan 02) -->
<!--   OUTPUT: Blanket replacements applied ONLY for brief-<survivor> identifiers + path refs + brand -->
<!--   GUARANTEE: Removed-agent identifiers are GONE by Phase B start, so no duplicate keys can be produced. -->
<!-- -->
<!-- UNIFIED EXCLUDE LIST (W3 closure — applied to BOTH "Get Shit Done" and "GSD" passes): -->
<!--   ./LICENSE                                             (legal/attribution) -->
<!--   ./CHANGELOG.md                                        (historical entries preserved as RESIDUAL) -->
<!--   ./CONTRIBUTING.md                                     (attribution to upstream GSD project) -->
<!--   ./SECURITY.md                                         (legal/security policy attribution) -->
<!--   ./tests/removed-surfaces.smoke.txt                    (audit trail — preserves historical names) -->
<!--   ./.planning/**                                        (our own planning artifacts) -->
<!--   ./.git/**                                             (git internals) -->
<!--   ./node_modules/**                                     (third-party code) -->
<!--   ./backup/**                                           (rollback-only branch content) -->
-->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Capture baseline (W4), execute SURGICAL edits per disposition (BLOCKER 1 + 2), then BLANKET substitutions with UNIFIED EXCLUDE (W3), finally baseline-delta gate (W4)</name>
  <files>
    (hundreds of files — scoped by directory/glob, see action)
    .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-05 full rename spec)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-02-SUMMARY.md (surgical-edit handoff: MUST read the ORPHAN REFERENCES section)
    - tests/removed-surfaces.smoke.txt — the EXPANDED-SCOPE surgical-edit list produced by Plan 02 Task 1 (BLOCKER 1 fix)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

0. **Safety + baseline capture (W4 closure).** Confirm the backup branch exists AND capture npm test baseline BEFORE any edits:
```bash
git branch | grep -q "backup/original-gsd" || { echo "FAIL: backup branch missing"; exit 1; }
echo "Safety net present."
grep -q "^# ORPHAN REFERENCES TO REPAIR IN PLAN 05" tests/removed-surfaces.smoke.txt || { echo "FAIL: orphan-reference section missing"; exit 1; }
grep -q "^\[DELETE-LINE\]\|^\[DELETE-FILE\]\|^\[RESIDUAL\]" tests/removed-surfaces.smoke.txt || { echo "FAIL: disposition tags missing"; exit 1; }

# W4: Capture npm test baseline BEFORE any Plan 05 edits
BASELINE=".planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt"
mkdir -p "$(dirname "$BASELINE")"
npm test 2>&1 | tail -80 > "$BASELINE" || true
BASELINE_FAIL_COUNT=$(grep -cE "(fail|not ok|✗|✘|ERR)" "$BASELINE" || echo 0)
echo "BASELINE_FAIL_COUNT=$BASELINE_FAIL_COUNT" >> "$BASELINE"
echo "Baseline captured: $BASELINE_FAIL_COUNT test failures pre-edit"
[ -s "$BASELINE" ] || { echo "FAIL: baseline file empty"; exit 1; }
```

1. **SURGICAL PHASE A — DISPOSITION-DRIVEN EDITS (BLOCKER 1 + BLOCKER 2 closure).**

   **1a. DELETE-FILE records.** Remove whole files that exist solely to support a removed agent.
```bash
for orphan in \
  "brief/templates/debug-subagent-prompt.md" \
  "brief/workflows/diagnose-issues.md" \
  "brief/workflows/audit-milestone.md"; do
  if [ -f "$orphan" ]; then
    git rm "$orphan"
    echo "DELETE-FILE: removed $orphan"
  fi
done
```

   **1b. DELETE-LINE records — brief/bin/lib/model-profiles.cjs (5 keys, W4 critical for duplicate-key prevention).**
   Lines 16/20/23/24/25 (stable at planning time). Use Edit tool once per key (old_string = the full line, new_string = empty). After:
```bash
node -e "const p = require('./brief/bin/lib/model-profiles.cjs'); console.log('keys:', Object.keys(p).length);" || { echo "FAIL: model-profiles.cjs broken"; exit 1; }
for removed in gsd-debugger gsd-integration-checker gsd-ui-researcher gsd-ui-checker gsd-ui-auditor; do
  ! grep -q "'$removed'" brief/bin/lib/model-profiles.cjs || { echo "FAIL: $removed still in file"; exit 1; }
done
```

   **1c. DELETE-LINE records — brief/references/agent-contracts.md (6 rows + 1 body sentence).**
   Rows at lines 19/21/22/23/25/27; sentence at line 39. Use Edit tool.

   **1d. DELETE-LINE records — brief/references/model-profiles.md (3 rows at lines 15, 19, 64).**

   **1e. DELETE-LINE records — brief/workflows/execute-phase.md (5 bullets at lines 43, 45, 47, 48, 49).**

   **1f. DELETE-LINE records — brief/workflows/quick.md (1 bullet at line ~26).**

   **1g. DELETE-LINE records — bin/install.js (BLOCKER 1 scope, 2 permission-map entries at lines 33 + 35).**
   ```
   Line 33:  'gsd-debugger': 'workspace-write',
   Line 35:  'gsd-integration-checker': 'read-only',
   ```
   Use Edit tool per line (old_string = the full entry with trailing comma + newline, new_string = empty).

   **1h. DELETE-LINE records — sdk/src/query/config-query.ts (BLOCKER 1 scope, 5 model-profile keys at lines 39, 43, 45, 46, 47).**
   Same pattern as brief/bin/lib/model-profiles.cjs.

   **1i. DELETE-LINE records — test files (BLOCKER 1 scope).** Process each per Plan 02's orphan list:

   - **`tests/agent-frontmatter.test.cjs` (BLOCKER 2 critical case):**
     - **Line 17** (WORKFLOWS_DIR): Edit `path.join(__dirname, '..', 'get-shit-done', 'workflows')` → `path.join(__dirname, '..', 'brief', 'workflows')`
     - **Line 18** (COMMANDS_DIR): Edit `path.join(__dirname, '..', 'commands', 'gsd')` → `path.join(__dirname, '..', 'commands', 'brief')`
     - **Line 21** (bare-prefix BLOCKER 2 fix): Edit `.filter(f => f.startsWith('gsd-') && f.endsWith('.md'))` → `.filter(f => f.startsWith('brief-') && f.endsWith('.md'))`
     - **Line 112** (workaround reference): Edit `'First, read ~/.claude/agents/gsd-'` → `'First, read ~/.claude/agents/brief-'`
     - **Line 145** (removed-agent test block): Delete the entire `test('diagnose-issues uses gsd-debugger (not general-purpose)', ...)` block (lines ~144–152) — the behavior it tests no longer exists.
   - **`tests/agent-skills-awareness.test.cjs` (lines 16, 17, 18, 22):** Delete each removed-agent entry from the array.
   - **`tests/model-profiles.test.cjs` (lines 25, 26, 27, 103):** Delete each removed-agent entry from the agent-name array + the `gsd-debugger` adaptive test.
   - **`tests/copilot-install.test.cjs` (lines 1183–1210):** Delete each removed-agent filename from the hardcoded list.
   - **`tests/codex-config.test.cjs` (lines 176, 366, 374):** Delete each removed-agent entry.
   - **`tests/thinking-model-guidance.test.cjs` (line 52):** Delete `'gsd-debugger': { ... }` entry.
   - **`tests/planner-language-regression.test.cjs` (line 109):** Delete `'gsd-debugger.md': ['time_sizing'],` entry.
   - **`tests/bug-patterns-reference.test.cjs` (lines 19, 84, 91):** If the file's sole purpose is to test `gsd-debugger.md`, git rm the whole file (DELETE-FILE). Otherwise delete only the gsd-debugger-specific lines.
   - **`tests/qwen-skills-migration.test.cjs` (line 259):** Delete the test assertion using `'agent: gsd-code-reviewer'`.
   - **`tests/bug-2346-agent-read-loop-guards.test.cjs` (lines 4, 26, 27, 31, 39):** Delete the entire `describe('gsd-ui-checker', ...)` block. If no other describe blocks survive, DELETE-FILE.

   **1j. DELETE-LINE records — docs/ (BLOCKER 1 scope).** Each removed-agent line gets an Edit-tool deletion. For high-density files, use a banner-add approach:

   - **docs/ARCHITECTURE.md** (lines 275, 278, 282, 283): Delete removed-agent mentions from agent-table rows.
   - **docs/AGENTS.md** (lines 71, 244, 259, 315, 358, 449): Delete entire section (heading + description) for each removed agent.
   - **docs/COMMANDS.md** (lines 1047, 1069, 1189): Delete each "Spawns: `gsd-<removed>`" line.
   - **docs/CONFIGURATION.md** (lines 227, 230, 231, 451, 455, 486): Delete each row.
   - **docs/FEATURES.md** (lines 742, 746, 1452, 1461): Delete model-table rows + security-audit flow mentions.
   - **docs/USER-GUIDE.md** (lines 676, 680, 874): Delete model-table rows + override example.
   - **docs/ja-JP/, docs/ko-KR/, docs/zh-CN/, docs/pt-BR/** localized mirrors — use a blanket Perl sweep:
     ```bash
     REMOVED_AGENT_PATTERN='gsd-(code-reviewer|code-fixer|debugger|ui-researcher|ui-checker|ui-auditor|ai-researcher|eval-planner|eval-auditor|domain-researcher|security-auditor|integration-checker|debug-session-manager)'
     for loc_dir in docs/ja-JP docs/ko-KR docs/zh-CN docs/pt-BR; do
       if [ -d "$loc_dir" ]; then
         find "$loc_dir" -name "*.md" -type f | while IFS= read -r f; do
           if grep -qE "$REMOVED_AGENT_PATTERN" "$f"; then
             perl -i -ne 'print unless /gsd-(code-reviewer|code-fixer|debugger|ui-researcher|ui-checker|ui-auditor|ai-researcher|eval-planner|eval-auditor|domain-researcher|security-auditor|integration-checker|debug-session-manager)/' "$f"
             echo "Surgically scrubbed: $f"
           fi
         done
       fi
     done
     ```

   **1k. RESIDUAL handling — CHANGELOG.md (W1 + BLOCKER 1 closure).**
   Preserve CHANGELOG historical entries; prepend a "pre-fork" banner:
```bash
if [ -f CHANGELOG.md ]; then
  if ! head -20 CHANGELOG.md | grep -q "PRE-FORK NOTICE"; then
    {
      cat <<'BANNER'
<!-- PRE-FORK NOTICE (Phase 1, BRIEF iteration 2 — 2026-04-18)
Historical entries below describe changes to GSD (Get Shit Done) before the BRIEF fork.
Agent names, command names, and paths in these entries reflect the GSD-era vocabulary
and are preserved intentionally as audit history. They are NOT active in BRIEF post-Phase-1.

For the post-fork BRIEF-era changelog, see entries from 2026-04 onward.
-->

BANNER
      cat CHANGELOG.md
    } > CHANGELOG.md.new
    mv CHANGELOG.md.new CHANGELOG.md
    echo "RESIDUAL: prepended pre-fork banner to CHANGELOG.md"
  fi
fi
```

2. **SURGICAL PHASE A verification.** After all surgical actions:
```bash
ORPHAN_PATTERN='gsd-(code-reviewer|code-fixer|debugger|ui-researcher|ui-checker|ui-auditor|ai-researcher|eval-planner|eval-auditor|domain-researcher|security-auditor|integration-checker|debug-session-manager)'
ORPHAN_HITS=$(grep -rE "$ORPHAN_PATTERN" . --exclude-dir=.planning --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=backup 2>/dev/null | grep -v "^CHANGELOG\.md:" | grep -v "^./CHANGELOG\.md:" | grep -v "removed-surfaces.smoke.txt:" | wc -l | tr -d ' ')
echo "Post-surgical orphan count: $ORPHAN_HITS (target: 0)"
[ "$ORPHAN_HITS" -eq 0 ] || { echo "FAIL: $ORPHAN_HITS orphan references remain"; grep -rE "$ORPHAN_PATTERN" . --exclude-dir=.planning --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=backup 2>/dev/null | grep -v "^CHANGELOG\.md:\|^./CHANGELOG\.md:\|removed-surfaces.smoke.txt:" | head -20; exit 1; }
```

3. **PHASE B — BLANKET SUBSTITUTIONS for survivor identifiers + paths + brand.** Applied AFTER surgical edits complete.

   Build work list:
```bash
find . -type f \( -name "*.md" -o -name "*.cjs" -o -name "*.js" -o -name "*.sh" -o -name "*.json" -o -name "*.ts" \) \
  -not -path "./.planning/*" \
  -not -path "./.git/*" \
  -not -path "./node_modules/*" \
  -not -path "./backup/*" \
  -not -name "removed-surfaces.smoke.txt" \
  2>/dev/null > /tmp/plan05-work-list.txt
wc -l /tmp/plan05-work-list.txt
```

   **3a. PATH replacements.**
```bash
while IFS= read -r f; do
  if grep -q "get-shit-done/" "$f" 2>/dev/null; then
    perl -i -pe 's|get-shit-done/|brief/|g' "$f"
  fi
done < /tmp/plan05-work-list.txt

while IFS= read -r f; do
  if grep -q "get-shit-done-cc" "$f" 2>/dev/null; then
    perl -i -pe 's|get-shit-done-cc|brief-cc|g' "$f"
  fi
done < /tmp/plan05-work-list.txt

while IFS= read -r f; do
  if grep -q "gsd-tools" "$f" 2>/dev/null; then
    perl -i -pe 's|gsd-tools(\.cjs)?|brief-tools$1|g' "$f"
  fi
done < /tmp/plan05-work-list.txt
```

   **3b. SURVIVOR-IDENTIFIER replacements (per-agent, NO removed agents).**
```bash
RENAMED_AGENTS=$(ls agents/brief-*.md 2>/dev/null | sed 's|agents/||; s|\.md||' | sort -u)
echo "$RENAMED_AGENTS" | while read -r new_name; do
  old_name=$(echo "$new_name" | sed 's|^brief-|gsd-|')
  while IFS= read -r f; do
    if grep -q "$old_name" "$f" 2>/dev/null; then
      perl -i -pe "s|\b$old_name\b|$new_name|g" "$f"
    fi
  done < /tmp/plan05-work-list.txt
done
```

   **3c. SLASH-COMMAND replacements.**
```bash
while IFS= read -r f; do
  if grep -q "/gsd-" "$f" 2>/dev/null; then
    perl -i -pe 's|/gsd-|/brief-|g' "$f"
  fi
done < /tmp/plan05-work-list.txt
```

   **3d. BRAND/VERBOSE replacements with UNIFIED EXCLUDE LIST (W3 closure).**
```bash
# W3 closure: UNIFIED EXCLUDE applied to BOTH verbose-brand AND acronym passes
EXCLUDE_FILES_BRAND="./LICENSE ./CHANGELOG.md ./CONTRIBUTING.md ./SECURITY.md ./tests/removed-surfaces.smoke.txt"

# Pass 1: "Get Shit Done" → "BRIEF"
while IFS= read -r f; do
  if grep -q "Get Shit Done" "$f" 2>/dev/null; then
    skip=false
    for ex in $EXCLUDE_FILES_BRAND; do
      [ "$f" = "$ex" ] && skip=true && break
    done
    if [ "$skip" = "false" ]; then
      perl -i -pe 's|Get Shit Done|BRIEF|g' "$f"
    fi
  fi
done < /tmp/plan05-work-list.txt

# Pass 2: "GSD" → "BRIEF" in .md files, SAME UNIFIED EXCLUDE applied (W3 closure)
while IFS= read -r f; do
  case "$f" in
    *.md)
      skip=false
      for ex in $EXCLUDE_FILES_BRAND; do
        [ "$f" = "$ex" ] && skip=true && break
      done
      if [ "$skip" = "false" ]; then
        perl -i -pe 's/\bGSD\b/BRIEF/g' "$f"
      fi
      ;;
  esac
done < /tmp/plan05-work-list.txt
```

4. **CLAUDE.md sentinel-comment repair.** Verify sentinels:
```bash
grep -c "BRIEF:.*-start\|BRIEF:.*-end" CLAUDE.md
```

5. **BUILDABILITY GATE (W4 hard-fail guards).**
```bash
node -e "require('./brief/bin/lib/core.cjs'); console.log('core: OK');" || { echo "FAIL"; exit 1; }
node -e "require('./brief/bin/lib/state.cjs'); console.log('state: OK');" || { echo "FAIL"; exit 1; }
node -e "require('./brief/bin/lib/init.cjs'); console.log('init: OK');" || { echo "FAIL"; exit 1; }

# W4: model-profiles.cjs must have EXACTLY ONE brief-executor key
BE_COUNT=$(grep -c "'brief-executor'" brief/bin/lib/model-profiles.cjs)
[ "$BE_COUNT" = "1" ] || { echo "FAIL (W4): $BE_COUNT brief-executor keys"; grep -n "brief-executor" brief/bin/lib/model-profiles.cjs; exit 1; }

# W4 runtime
node -e "const p = require('./brief/bin/lib/model-profiles.cjs'); const keys = Object.keys(p); if (new Set(keys).size !== keys.length) { process.exit(1); } console.log('OK: ' + keys.length + ' unique keys');" || exit 1

# BLOCKER 2: tests/agent-frontmatter.test.cjs no longer has bare-prefix 'gsd-'
! grep -q "'gsd-'" tests/agent-frontmatter.test.cjs || { echo "FAIL: BLOCKER 2 — 'gsd-' literal still present"; exit 1; }
grep -q "'brief-'" tests/agent-frontmatter.test.cjs || { echo "FAIL: BLOCKER 2 — 'brief-' literal missing"; exit 1; }

# BLOCKER 1: Repo-wide orphan check
ORPHAN_HITS=$(grep -rE "$ORPHAN_PATTERN" . --exclude-dir=.planning --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=backup 2>/dev/null | grep -v "^CHANGELOG\.md:\|^./CHANGELOG\.md:\|removed-surfaces.smoke.txt:" | wc -l | tr -d ' ')
[ "$ORPHAN_HITS" -eq 0 ] || { echo "FAIL: BLOCKER 1 — $ORPHAN_HITS orphan references remain"; exit 1; }

node brief/bin/brief-tools.cjs --help 2>&1 | head -5 || echo "(brief-tools --help non-zero is OK)"
```

6. **BLOCKER 2 runtime check — tests/agent-frontmatter.test.cjs iterates ≥18 agents.**
```bash
AGENT_COUNT=$(node -e "
const fs = require('fs');
const path = require('path');
const AGENTS_DIR = path.join(process.cwd(), 'agents');
const all = fs.readdirSync(AGENTS_DIR).filter(f => f.startsWith('brief-') && f.endsWith('.md')).map(f => f.replace('.md', ''));
console.log(all.length);
")
echo "agent-frontmatter iteration count: $AGENT_COUNT"
[ "$AGENT_COUNT" -ge 18 ] || { echo "FAIL: BLOCKER 2 — iterates $AGENT_COUNT agents (expected ≥18)"; exit 1; }
```

7. **W4 DELTA-CAP GATE — post-edit test run compared to baseline.**
```bash
npm test 2>&1 | tail -80 > /tmp/plan05-post-test-output.txt || true
POST_FAIL_COUNT=$(grep -cE "(fail|not ok|✗|✘|ERR)" /tmp/plan05-post-test-output.txt || echo 0)

BASELINE_FAIL_COUNT=$(grep "^BASELINE_FAIL_COUNT=" "$BASELINE" | cut -d= -f2)
DELTA=$((POST_FAIL_COUNT - BASELINE_FAIL_COUNT))
echo "BASELINE_FAIL_COUNT=$BASELINE_FAIL_COUNT"
echo "POST_FAIL_COUNT=$POST_FAIL_COUNT"
echo "DELTA=$DELTA"

MODULE_ERRORS=$(grep -cE "(Cannot find module|Cannot resolve|TypeError.*require)" /tmp/plan05-post-test-output.txt || echo 0)
[ "$MODULE_ERRORS" = "0" ] || { echo "FAIL: module-load errors"; cat /tmp/plan05-post-test-output.txt; exit 1; }

# W4 hard gate
[ "$DELTA" -le 10 ] || { echo "FAIL (W4): delta=$DELTA > 10 (baseline $BASELINE_FAIL_COUNT → post $POST_FAIL_COUNT)"; tail -40 /tmp/plan05-post-test-output.txt; exit 1; }

echo "DELTA=$DELTA" >> "$BASELINE"
echo "POST_FAIL_COUNT=$POST_FAIL_COUNT" >> "$BASELINE"
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# Baseline file captured
[ -s .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt ] || { echo "FAIL: baseline missing"; exit 1; }
grep -q "^BASELINE_FAIL_COUNT=" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt || { echo "FAIL: baseline count missing"; exit 1; }
grep -q "^DELTA=" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt || { echo "FAIL: delta missing"; exit 1; }

# get-shit-done/ residues outside exclusions
REMAIN_PATH=$(grep -rln "get-shit-done/" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" --include="*.ts" 2>/dev/null | grep -v "^\./\.planning/\|^\./\.git/\|^\./node_modules/\|^\./backup/\|removed-surfaces.smoke.txt\|CHANGELOG\.md" | wc -l | tr -d " ")
[ "$REMAIN_PATH" = "0" ] || { echo "FAIL: $REMAIN_PATH files still have get-shit-done/"; exit 1; }

# gsd-tools residues
REMAIN_TOOLS=$(grep -rln "gsd-tools" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.ts" 2>/dev/null | grep -v "^\./\.planning/\|^\./\.git/\|^\./node_modules/\|^\./backup/\|CHANGELOG\.md" | wc -l | tr -d " ")
[ "$REMAIN_TOOLS" = "0" ] || { echo "FAIL: $REMAIN_TOOLS gsd-tools refs"; exit 1; }

# W4: brief-executor count exactly 1
BE_COUNT=$(grep -c "'"'"'brief-executor'"'"'" brief/bin/lib/model-profiles.cjs)
[ "$BE_COUNT" = "1" ] || { echo "FAIL (W4): brief-executor count=$BE_COUNT"; exit 1; }

node -e "const p = require(\"./brief/bin/lib/model-profiles.cjs\"); const keys = Object.keys(p); if (new Set(keys).size !== keys.length) process.exit(1);" || { echo "FAIL (W4 runtime)"; exit 1; }

# W3: execute-phase.md has 0 contradictory brief-executor bullets
BAD=$(grep -cE "^- brief-executor .*(UI|Diagnoses|Cross-phase integration|UI/UX)" brief/workflows/execute-phase.md)
[ "$BAD" = "0" ] || { echo "FAIL (W3): $BAD contradictory lines"; exit 1; }

# W5: single brief-executor row
[ "$(grep -c "^| brief-executor " brief/references/agent-contracts.md)" -le 1 ] || { echo "FAIL (W5 contracts)"; exit 1; }
[ "$(grep -c "^| brief-executor " brief/references/model-profiles.md)" -le 1 ] || { echo "FAIL (W5 profiles)"; exit 1; }

# BLOCKER 1: repo-wide orphan check
ORPHAN_PATTERN="gsd-(code-reviewer|code-fixer|debugger|ui-researcher|ui-checker|ui-auditor|ai-researcher|eval-planner|eval-auditor|domain-researcher|security-auditor|integration-checker|debug-session-manager)"
ORPHAN_HITS=$(grep -rE "$ORPHAN_PATTERN" . --exclude-dir=.planning --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=backup 2>/dev/null | grep -v "^CHANGELOG\.md:\|^./CHANGELOG\.md:\|removed-surfaces.smoke.txt:" | wc -l | tr -d " ")
[ "$ORPHAN_HITS" = "0" ] || { echo "FAIL (BLOCKER 1): $ORPHAN_HITS orphan refs"; exit 1; }

# BLOCKER 2: tests/agent-frontmatter.test.cjs fix held
! grep -q "startsWith('"'"'gsd-'"'"')" tests/agent-frontmatter.test.cjs || { echo "FAIL (BLOCKER 2): gsd- literal still in filter"; exit 1; }
grep -q "startsWith('"'"'brief-'"'"')" tests/agent-frontmatter.test.cjs || { echo "FAIL (BLOCKER 2): brief- literal missing"; exit 1; }
! grep -q "get-shit-done.*workflows" tests/agent-frontmatter.test.cjs || { echo "FAIL (BLOCKER 2): WORKFLOWS_DIR not updated"; exit 1; }
! grep -q "commands.*gsd[^-]" tests/agent-frontmatter.test.cjs || { echo "FAIL (BLOCKER 2): COMMANDS_DIR not updated"; exit 1; }

# BLOCKER 2 agent iteration count
AGENT_COUNT=$(node -e "const fs = require(\"fs\"); const path = require(\"path\"); const dir = path.join(process.cwd(), \"agents\"); console.log(fs.readdirSync(dir).filter(f => f.startsWith(\"brief-\") && f.endsWith(\".md\")).length);")
[ "$AGENT_COUNT" -ge 18 ] || { echo "FAIL (BLOCKER 2): $AGENT_COUNT agents"; exit 1; }

echo "OK: Task 1 verified — BLOCKER 1 + BLOCKER 2 + W3 + W4 closure"
'
    </automated>
  </verify>
  <done>
    - **Baseline captured** (W4): `05-PRE-TEST-BASELINE.txt` has BASELINE_FAIL_COUNT, POST_FAIL_COUNT, DELTA
    - **DELTA ≤ 10** (W4 hard-fail gate)
    - **Surgical edits complete** per EXPANDED-scope orphan list:
      - DELETE-LINE for all listed test files (bare-prefix BLOCKER 2 fix for `tests/agent-frontmatter.test.cjs` lines 17, 18, 21, 112, 145)
      - DELETE-LINE for `bin/install.js` lines 33, 35
      - DELETE-LINE for `sdk/src/query/config-query.ts` lines 39, 43, 45, 46, 47
      - DELETE-LINE for `docs/*.md` (English) removed-agent rows
      - Perl sweep for `docs/ja-JP/ docs/ko-KR/ docs/zh-CN/ docs/pt-BR/` localized mirrors
      - DELETE-LINE for existing-scope files (model-profiles.cjs, references, execute-phase, quick)
      - DELETE-FILE: `brief/templates/debug-subagent-prompt.md`, `brief/workflows/diagnose-issues.md`, `brief/workflows/audit-milestone.md`
      - RESIDUAL: CHANGELOG.md gets pre-fork banner prepended
    - **Blanket substitutions with UNIFIED EXCLUDE LIST** (W3): LICENSE/CHANGELOG.md/CONTRIBUTING.md/SECURITY.md/removed-surfaces.smoke.txt excluded from BOTH passes
    - 0 files outside exclusions contain `get-shit-done/`, `gsd-tools`, `subagent_type: gsd-`, or `/gsd-` references
    - **W4 verified:** `grep -c "'brief-executor'" brief/bin/lib/model-profiles.cjs` = 1; runtime check passes
    - **W3 verified:** 0 contradictory brief-executor bullets
    - **W5 verified:** ≤1 `^| brief-executor ` row in contract tables
    - **BLOCKER 1 verified:** ORPHAN_PATTERN grep repo-wide (excluding CHANGELOG.md RESIDUAL) = 0
    - **BLOCKER 2 verified:** `tests/agent-frontmatter.test.cjs` has `'brief-'` not `'gsd-'`; path constants updated; iteration count ≥18
    - Lib layer still loads
  </done>
</task>

<task type="auto">
  <name>Task 2: Produce audit file and commit (commit 5 of 6)</name>
  <files>
    .planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md
    (all staged changes from Task 1)
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-08 commit 5 of 6 message)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Generate the text-ref audit document:
```bash
AUDIT=.planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md
BASELINE_FAIL_COUNT=$(grep "^BASELINE_FAIL_COUNT=" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt | cut -d= -f2)
POST_FAIL_COUNT=$(grep "^POST_FAIL_COUNT=" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt | cut -d= -f2)
DELTA=$(grep "^DELTA=" .planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt | cut -d= -f2)

cat > "$AUDIT" <<EOF
# Phase 1 Plan 05 — Text Reference Update Audit

**Generated:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Strategy:** Three-phase — BASELINE capture (W4) → SURGICAL EDITS per disposition (BLOCKER 1+2) → BLANKET substitutions with UNIFIED EXCLUDE (W3)

## W4 Baseline Delta

| Stage | Failure count |
|-------|---------------|
| BASELINE (pre-edit) | ${BASELINE_FAIL_COUNT} |
| POST (post-edit) | ${POST_FAIL_COUNT} |
| DELTA | ${DELTA} (cap: ≤ 10) |

DELTA ≤ 10 gate: $([ "$DELTA" -le 10 ] && echo "PASS" || echo "FAIL")

## Surgical-edit summary (per-file, per-disposition)

| File | Disposition | Lines / Action | Checker issue |
|------|-------------|----------------|---------------|
| brief/bin/lib/model-profiles.cjs | DELETE-LINE | 16, 20, 23, 24, 25 | W4 |
| brief/references/agent-contracts.md | DELETE-LINE | 19, 21, 22, 23, 25, 27, 39 | W5 |
| brief/references/model-profiles.md | DELETE-LINE | 15, 19, 64 | W5 |
| brief/workflows/execute-phase.md | DELETE-LINE | 43, 45, 47, 48, 49 | W3 |
| brief/workflows/quick.md | DELETE-LINE | ~26 | W3 |
| bin/install.js | DELETE-LINE | 33, 35 | BLOCKER 1 |
| sdk/src/query/config-query.ts | DELETE-LINE | 39, 43, 45, 46, 47 | BLOCKER 1 |
| tests/agent-frontmatter.test.cjs | DELETE-LINE + string-literal fix | 17, 18, 21, 112, 145 | BLOCKER 2 |
| tests/agent-skills-awareness.test.cjs | DELETE-LINE | 16, 17, 18, 22 | BLOCKER 1 |
| tests/model-profiles.test.cjs | DELETE-LINE | 25, 26, 27, 103 | BLOCKER 1 |
| tests/copilot-install.test.cjs | DELETE-LINE | 1183–1210 | BLOCKER 1 |
| tests/codex-config.test.cjs | DELETE-LINE | 176, 366, 374 | BLOCKER 1 |
| tests/thinking-model-guidance.test.cjs | DELETE-LINE | 52 | BLOCKER 1 |
| tests/planner-language-regression.test.cjs | DELETE-LINE | 109 | BLOCKER 1 |
| tests/bug-patterns-reference.test.cjs | DELETE-LINE or DELETE-FILE | 19, 84, 91 | BLOCKER 1 |
| tests/qwen-skills-migration.test.cjs | DELETE-LINE | 259 | BLOCKER 1 |
| tests/bug-2346-agent-read-loop-guards.test.cjs | DELETE-LINE (describe block) | 4, 26, 27, 31, 39 | BLOCKER 1 |
| docs/ARCHITECTURE.md | DELETE-LINE | 275, 278, 282, 283 | BLOCKER 1 |
| docs/AGENTS.md | DELETE-LINE (section) | 71, 244, 259, 315, 358, 449 | BLOCKER 1 |
| docs/COMMANDS.md | DELETE-LINE | 1047, 1069, 1189 | BLOCKER 1 |
| docs/CONFIGURATION.md | DELETE-LINE | 227, 230, 231, 451, 455, 486 | BLOCKER 1 |
| docs/FEATURES.md | DELETE-LINE | 742, 746, 1452, 1461 | BLOCKER 1 |
| docs/USER-GUIDE.md | DELETE-LINE | 676, 680, 874 | BLOCKER 1 |
| docs/ja-JP/, docs/ko-KR/, docs/zh-CN/, docs/pt-BR/ | DELETE-LINE (Perl sweep) | ~40 lines total | BLOCKER 1 |
| brief/templates/debug-subagent-prompt.md | DELETE-FILE | whole file | BLOCKER 1 |
| brief/workflows/diagnose-issues.md | DELETE-FILE | whole file | BLOCKER 1 |
| brief/workflows/audit-milestone.md | DELETE-FILE | whole file | BLOCKER 1 |
| CHANGELOG.md | RESIDUAL + banner | pre-fork banner prepended | W1 |

## Residual count (should be 0 outside documented exclusions)

| Pattern | Count | Note |
|---------|-------|------|
| \`get-shit-done/\` | $(grep -rln "get-shit-done/" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" --include="*.ts" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./node_modules/\|^./backup/\|removed-surfaces.smoke.txt\|CHANGELOG\.md" | wc -l | tr -d ' ') | Old path refs |
| \`gsd-tools\` | $(grep -rln "gsd-tools" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.ts" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./node_modules/\|^./backup/\|CHANGELOG\.md" | wc -l | tr -d ' ') | Old binary refs |
| \`subagent_type: gsd-\` | $(grep -rln "subagent_type: gsd-" . --include="*.md" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./backup/\|CHANGELOG\.md" | wc -l | tr -d ' ') | Old subagent refs |
| \`/gsd-\` | $(grep -rln "/gsd-" . --include="*.md" --include="*.cjs" --include="*.js" 2>/dev/null | grep -v "^./\.planning/\|^./\.git/\|^./node_modules/\|^./backup/\|CHANGELOG\.md" | wc -l | tr -d ' ') | Old slash-command refs |
| Removed-agent identifiers | $(grep -rE "gsd-(code-reviewer|code-fixer|debugger|ui-researcher|ui-checker|ui-auditor|ai-researcher|eval-planner|eval-auditor|domain-researcher|security-auditor|integration-checker|debug-session-manager)" . --exclude-dir=.planning --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=backup 2>/dev/null | grep -v "^CHANGELOG\.md:\|^./CHANGELOG\.md:\|removed-surfaces.smoke.txt:" | wc -l | tr -d ' ') | BLOCKER 1 — must be 0 |
| \`'brief-executor'\` in model-profiles.cjs | $(grep -c "'brief-executor'" brief/bin/lib/model-profiles.cjs 2>/dev/null || echo 0) | W4 — must be 1 |
| \`'gsd-'\` in agent-frontmatter.test.cjs | $(grep -c "'gsd-'" tests/agent-frontmatter.test.cjs 2>/dev/null || echo 0) | BLOCKER 2 — must be 0 |

## Intentional residuals (NOT fixed in Phase 1)

- \`.planning/\` directory: historical planning artifacts; kept intact
- \`LICENSE\`: legal content preserved
- \`CHANGELOG.md\`: **RESIDUAL** — pre-fork banner prepended; historical agent names preserved; excluded from BOTH verbose-brand AND acronym passes per W3 UNIFIED EXCLUDE
- \`CONTRIBUTING.md\`, \`SECURITY.md\`: attribution content preserved; excluded from both substitution passes per W3
- \`backup/original-gsd\` branch: never touched
- \`tests/removed-surfaces.smoke.txt\`: audit trail preserves historical gsd-* names
- Non-English localized docs: Phase 1 applies mechanical deletions; formatting polish deferred to Phase 9
EOF
cat "$AUDIT" | head -40
```

2. Stage + commit:
```bash
git add -A
git status --short | head -20
git diff --cached --stat | tail -5

node brief/bin/brief-tools.cjs commit "refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3; BLOCKER 1+2 + W3+W4+W5 closure)" --files $(git diff --cached --name-only | tr '\n' ' ')
# Fallback: git commit -m "refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3; BLOCKER 1+2 + W3+W4+W5 closure)"
```

3. Final buildability re-check:
```bash
node -e "require('./brief/bin/lib/core.cjs'); console.log('post-commit-5: core OK');"
BE=$(grep -c "'brief-executor'" brief/bin/lib/model-profiles.cjs)
[ "$BE" = "1" ] || { echo "FAIL: brief-executor count=$BE"; exit 1; }
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
[ -s .planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md ] || { echo "FAIL: audit missing"; exit 1; }
grep -q "^## W4 Baseline Delta" .planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md || { echo "FAIL: W4 section missing"; exit 1; }
grep -q "^## Surgical-edit summary" .planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-text-ref-audit.md || { echo "FAIL: surgical summary missing"; exit 1; }

git log -1 --format="%s" | grep -qE "refactor\(01-refs\).*BLOCKER 1" || { echo "FAIL: commit missing BLOCKER 1 marker"; exit 1; }
git log -1 --format="%s" | grep -q "BLOCKER.*2" || { echo "FAIL: commit missing BLOCKER 2 marker"; exit 1; }

for pattern in "get-shit-done/" "gsd-tools" "subagent_type: gsd-" "/gsd-"; do
  COUNT=$(grep -rln "$pattern" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" --include="*.ts" 2>/dev/null | grep -v "^\./\.planning/\|^\./\.git/\|^\./node_modules/\|^\./backup/\|removed-surfaces.smoke.txt\|CHANGELOG\.md" | wc -l | tr -d " ")
  [ "$COUNT" = "0" ] || { echo "FAIL: $COUNT files still have $pattern"; exit 1; }
done

ORPHAN_PATTERN="gsd-(code-reviewer|code-fixer|debugger|ui-researcher|ui-checker|ui-auditor|ai-researcher|eval-planner|eval-auditor|domain-researcher|security-auditor|integration-checker|debug-session-manager)"
ORPHAN_HITS=$(grep -rE "$ORPHAN_PATTERN" . --exclude-dir=.planning --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=backup 2>/dev/null | grep -v "^CHANGELOG\.md:\|^./CHANGELOG\.md:\|removed-surfaces.smoke.txt:" | wc -l | tr -d " ")
[ "$ORPHAN_HITS" = "0" ] || { echo "FAIL: BLOCKER 1 regressed — $ORPHAN_HITS orphan refs"; exit 1; }

! grep -q "startsWith('"'"'gsd-'"'"')" tests/agent-frontmatter.test.cjs || { echo "FAIL: BLOCKER 2 regressed"; exit 1; }

BE=$(grep -c "'"'"'brief-executor'"'"'" brief/bin/lib/model-profiles.cjs)
[ "$BE" = "1" ] || { echo "FAIL: W4 regressed"; exit 1; }
node -e "const p=require(\"./brief/bin/lib/model-profiles.cjs\"); const keys=Object.keys(p); if (new Set(keys).size !== keys.length) process.exit(1);" || { echo "FAIL: duplicate keys"; exit 1; }

node -e "require(\"./brief/bin/lib/core.cjs\");" || { echo "FAIL: lib broken"; exit 1; }
echo "OK: Task 2 verified — commit 5 passes with BLOCKER 1+2 + W3+W4+W5 closure"
'
    </automated>
  </verify>
  <done>
    - `.planning/phases/01-foundation-fork-hygiene-removal-rename/05-PRE-TEST-BASELINE.txt` committed with BASELINE_FAIL_COUNT + POST_FAIL_COUNT + DELTA
    - `01-05-text-ref-audit.md` includes W4 Baseline Delta + surgical-edit summary table with checker-issue-closed column
    - Exactly one new commit `refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3; BLOCKER 1+2 + W3+W4+W5 closure)`
    - Residual counts for `get-shit-done/`, `gsd-tools`, `subagent_type: gsd-`, `/gsd-` outside UNIFIED EXCLUDE are 0
    - BLOCKER 1: removed-agent orphan count repo-wide (excluding CHANGELOG.md + removed-surfaces.smoke.txt) is 0
    - BLOCKER 2: `tests/agent-frontmatter.test.cjs` uses `'brief-'` + new path constants; iterates ≥18 agents
    - W3: UNIFIED EXCLUDE applied to both passes
    - W4: `brief/bin/lib/model-profiles.cjs` has 1 `'brief-executor'` key; DELTA ≤ 10
    - Lib layer still loads
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| String content ↔ semantic meaning | Mass text replacement risks. UNIFIED EXCLUDE + file-type scoping + disposition-tag routing mitigates. |
| Object-literal keys ↔ JavaScript silent duplicate semantics | Surgical deletion first, blanket sub only on survivors. |
| Audit-list coverage ↔ actual orphan population | BLOCKER 1 expanded scope; Plan 06 FND-07 grep as backstop. |
| Test-assertion integrity ↔ filter-logic bare literals | BLOCKER 2 fix replaces literal + path constants; iteration-count check validates. |
| npm test failure count ↔ test health | W4 delta-cap (≤10). |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation |
|-----------|----------|-----------|-------------|-----------|
| T-01-10 | T | GSD substring wrongly replaced | accept | UNIFIED EXCLUDE + scope limits. Backup branch rollback. |
| T-01-11 | I | Backup branch retains GSD state | accept | Documented in Plan 01. Local-only during Phase 1. |
| T-01-12 | D | Test regressions | mitigate | W4 DELTA-CAP gate: ≤10 OR hard-fail. |
| T-01-23 | T | Blanket sub overwrites via duplicate-key | mitigate | Surgical first. W4 build-time + runtime guards. |
| T-01-24 | R | Contradictory content | mitigate | Surgical edits produce clean state. Audit file records each edit. |
| T-01-26 | T | Orphans survive in unaudited dirs | mitigate | BLOCKER 1: expanded scope. Plan 06 FND-07 backstop. |
| T-01-27 | T | Bare-prefix filter vacuous PASS | mitigate | BLOCKER 2: literal + path-constant fixes. Iteration-count check. |
| T-01-28 | D | Test failures exceed bound | mitigate | W4: baseline + delta-cap ≤10. |
</threat_model>

<verification>
1. `grep -rln "get-shit-done/" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.json" --include="*.sh" --include="*.ts" | grep -v -e ".planning/" -e ".git/" -e "node_modules/" -e "backup/" -e "removed-surfaces.smoke.txt" -e "CHANGELOG.md" | wc -l` returns 0.
2. `grep -rln "gsd-tools" . --include="*.md" --include="*.cjs" --include="*.js" --include="*.ts" | grep -v -e ".planning/" -e ".git/" -e "node_modules/" -e "backup/" -e "CHANGELOG.md" | wc -l` returns 0.
3. `grep -rln "subagent_type: gsd-" . --include="*.md" | grep -v -e ".planning/" -e ".git/" -e "backup/" -e "CHANGELOG.md" | wc -l` returns 0.
4. `grep -rln "/gsd-" . --include="*.md" --include="*.cjs" --include="*.js" | grep -v -e ".planning/" -e ".git/" -e "node_modules/" -e "backup/" -e "CHANGELOG.md" | wc -l` returns 0.
5. `node -e "require('./brief/bin/lib/core.cjs')"` exits 0.
6. `01-05-text-ref-audit.md` has W4 Baseline Delta + surgical-edit summary + checker-issue-closed column.
7. `05-PRE-TEST-BASELINE.txt` has BASELINE_FAIL_COUNT + POST_FAIL_COUNT + DELTA.
8. Commit message: `refactor(01-refs): update internal text references to BRIEF terminology (FND-03 part 3; BLOCKER 1+2 + W3+W4+W5 closure)`.
9. W4: `grep -c "'brief-executor'" brief/bin/lib/model-profiles.cjs` = 1.
10. W4 runtime: `node -e "const p=require('./brief/bin/lib/model-profiles.cjs'); const k=Object.keys(p); process.exit(new Set(k).size !== k.length ? 1 : 0);"` exits 0.
11. W3: Both passes skipped same 5-file list.
12. W5: ≤1 `^| brief-executor ` row in agent-contracts.md and model-profiles.md.
13. BLOCKER 1: ORPHAN_PATTERN repo-wide grep (excluding CHANGELOG.md + removed-surfaces.smoke.txt) = 0.
14. BLOCKER 2: `tests/agent-frontmatter.test.cjs` has `'brief-'` (not `'gsd-'`); path constants reference `brief/workflows` and `commands/brief`; iteration count ≥18.
15. W4 DELTA: POST_FAIL_COUNT − BASELINE_FAIL_COUNT ≤ 10.
</verification>

<success_criteria>
- [ ] Path references (`get-shit-done/`) replaced outside UNIFIED EXCLUDE
- [ ] Binary references (`gsd-tools`) replaced with `brief-tools`
- [ ] Slash commands (`/gsd-*`) replaced with `/brief-*`
- [ ] `subagent_type: gsd-<survivor>` → `subagent_type: brief-<survivor>`
- [ ] `get-shit-done-cc` → `brief-cc`
- [ ] `GSD` acronym + `Get Shit Done` brand → `BRIEF` in .md with UNIFIED EXCLUDE on BOTH passes (W3)
- [ ] **W4:** baseline captured; DELTA ≤ 10; single `'brief-executor'` key; no runtime duplicates
- [ ] **W3:** 0 contradictory brief-executor bullets
- [ ] **W5:** ≤1 `^| brief-executor ` row in contract tables
- [ ] **BLOCKER 1:** Surgical edits applied to bin/install.js, sdk/, tests/, docs/ (English + 4 mirrors). DELETE-FILE for 3 known orphan files. CHANGELOG RESIDUAL + banner. Repo-wide orphan grep = 0.
- [ ] **BLOCKER 2:** `tests/agent-frontmatter.test.cjs` lines 17, 18, 21, 112, 145 fixed; iterates ≥18 agents.
- [ ] `brief-tools.cjs` executes without module-load errors
- [ ] `01-05-text-ref-audit.md` + `05-PRE-TEST-BASELINE.txt` committed
- [ ] Exactly one commit per D-08 commit 5 of 6
- [ ] FND-03 fully satisfied across Plans 03, 04, 05
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-05-SUMMARY.md` recording:
- Residual-count table
- Per-file surgical-edit summary with disposition + lines + checker-issue-closed
- BLOCKER 1 closure count (records processed per expanded-scope section)
- BLOCKER 2 closure confirmation (iteration count, line edits, removed test block)
- W3 closure (UNIFIED EXCLUDE applied to both passes)
- W4 closure (BASELINE_FAIL_COUNT + POST_FAIL_COUNT + DELTA)
- W5 closure (single brief-executor row)
- Intentional residuals deferred to Phase 9
</output>
</content>
