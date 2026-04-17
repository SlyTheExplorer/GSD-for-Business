---
phase: 01-foundation-fork-hygiene-removal-rename
plan: 03
type: execute
wave: 3
depends_on: [02]
files_modified:
  # Agent files (18 survivors after Plan 02, renamed gsd-* → brief-*)
  - "agents/gsd-advisor-researcher.md"
  - "agents/gsd-assumptions-analyzer.md"
  - "agents/gsd-codebase-mapper.md"
  - "agents/gsd-doc-verifier.md"
  - "agents/gsd-doc-writer.md"
  - "agents/gsd-executor.md"
  - "agents/gsd-framework-selector.md"
  - "agents/gsd-intel-updater.md"
  - "agents/gsd-nyquist-auditor.md"
  - "agents/gsd-pattern-mapper.md"
  - "agents/gsd-phase-researcher.md"
  - "agents/gsd-plan-checker.md"
  - "agents/gsd-planner.md"
  - "agents/gsd-project-researcher.md"
  - "agents/gsd-research-synthesizer.md"
  - "agents/gsd-roadmapper.md"
  - "agents/gsd-user-profiler.md"
  - "agents/gsd-verifier.md"
  # Commands dir renamed commands/gsd → commands/brief, all ~61 survivors renamed inside
  - "commands/gsd/"
  - "commands/brief/"
  # Hooks (all 11)
  - "hooks/gsd-check-update-worker.js"
  - "hooks/gsd-check-update.js"
  - "hooks/gsd-context-monitor.js"
  - "hooks/gsd-phase-boundary.sh"
  - "hooks/gsd-prompt-guard.js"
  - "hooks/gsd-read-guard.js"
  - "hooks/gsd-read-injection-scanner.js"
  - "hooks/gsd-session-state.sh"
  - "hooks/gsd-statusline.js"
  - "hooks/gsd-validate-commit.sh"
  - "hooks/gsd-workflow-guard.js"
  # Test files prefixed gsd-* (small set — most tests are thematic, not prefixed)
  - "tests/gsd-statusline.test.cjs"
  - "tests/gsd-tools-path-refs.test.cjs"
  - "tests/gsd2-import.test.cjs"
autonomous: true
requirements:
  - FND-03
user_setup: []

must_haves:
  truths:
    - "User runs `ls agents/gsd-*.md 2>/dev/null` and gets no results (all renamed)"
    - "User runs `ls agents/brief-*.md | wc -l` and sees 18 files"
    - "User runs `ls commands/gsd/ 2>/dev/null` and gets 'No such file or directory' (directory renamed)"
    - "User runs `ls commands/brief/*.md | wc -l` and sees ~61 files (75 original - 14 removed in Plan 02)"
    - "User runs `ls hooks/gsd-* 2>/dev/null` and gets no results"
    - "User runs `ls hooks/brief-* | wc -l` and sees 11 files"
    - "Git history is preserved for all renamed files: `git log --follow agents/brief-planner.md` shows history back to gsd-planner.md origin"
  artifacts:
    - path: "agents/brief-planner.md"
      provides: "Core workflow orchestrator (was gsd-planner.md)"
      contains: "agent definition (contents unchanged in this plan; text-ref update is Plan 05)"
    - path: "commands/brief/plan-phase.md"
      provides: "Plan-phase slash command entry point (was commands/gsd/plan-phase.md)"
      contains: "command body (contents unchanged; text-ref update is Plan 05)"
    - path: "hooks/brief-prompt-guard.js"
      provides: "PreToolUse prompt-injection scanner (was gsd-prompt-guard.js)"
      contains: "hook implementation (logic unchanged)"
  key_links:
    - from: "all renamed files"
      to: "git history"
      via: "git mv (tracked rename)"
      pattern: "git log --follow preserves full history"
---

<objective>
Execute commit 3 of 6 (per D-08): rename all user-facing `gsd-*` identifiers to `brief-*`. This covers the externally-visible surfaces — agent files, the `commands/gsd/` directory and all its files, hook files, and gsd-* prefixed test files. File content is NOT modified in this plan (string replacements inside files are Plan 05); only filenames and directory names change via `git mv`.

Purpose: Honor FND-03 (hard rename, no aliases per D-07) part 1. After this plan, `/brief-*` autocomplete will surface the renamed commands, and the filesystem visibly reflects BRIEF's identity at the externally-visible layer. Internal paths (`get-shit-done/`, `gsd-tools.cjs`) are still gsd-named — those rename in Plan 04.

Output: All user-facing filenames carry the `brief-*` prefix. Git history preserved via `git mv`. Hook-registration paths (if any `.claude/settings.json` references exist in this repo — verified at planning time: none) remain consistent.
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

<interfaces>
<!-- IMPORTANT: file CONTENTS are NOT modified in Plan 03. Only filenames and directory names change. -->
<!-- Text replacements (gsd-* → brief-* inside file bodies) happen in Plan 05. -->
<!-- This prevents commit 3 from touching 200+ files and keeps D-09 (buildable state) easy to verify: -->
<!-- as long as every surviving internal reference is a filename-based path, commit 3 moves the -->
<!-- files AND the references break simultaneously (to be repaired in Plan 05). -->

<!-- This ordering is intentional per D-05 ("user-facing AND internal" rename is "one-shot" at the -->
<!-- D-08 commit level, but staged across commits 3/4/5 for reviewability). -->

<!-- Survivors expected from Plan 02 (verified via Plan 02's audit trail): -->
<!-- agents/gsd-*.md = 18 survivors (after 12+1 deletions) -->
<!-- commands/gsd/*.md = 61 survivors (after 8+6 deletions) -->
<!-- hooks/gsd-* = 11 (none removed in Plan 02) -->
<!-- tests/gsd-*.test.cjs = 3 (gsd-statusline, gsd-tools-path-refs, gsd2-import — verified at planning time) -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rename surviving agents (gsd-*.md → brief-*.md) via git mv</name>
  <files>
    agents/gsd-*.md (18 files — read from repo state after Plan 02)
    agents/brief-*.md (new — 18 files)
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-02-SUMMARY.md (confirms Plan 02 completed and which agents survived)
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-05 rename spec)
    - Output of `ls agents/gsd-*.md` (authoritative list of survivors)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Enumerate surviving agents (should be exactly 18):
```bash
AGENT_COUNT=$(ls agents/gsd-*.md 2>/dev/null | wc -l | tr -d ' ')
echo "Surviving gsd-* agents: $AGENT_COUNT"
[ "$AGENT_COUNT" = "18" ] || { echo "UNEXPECTED COUNT — expected 18. Abort and inspect."; exit 1; }
```

2. Rename each with `git mv` to preserve history:
```bash
for f in agents/gsd-*.md; do
  new="${f/gsd-/brief-}"
  git mv "$f" "$new"
  echo "Renamed: $f → $new"
done
```

3. Buildability gate — Node `require()` of lib is unaffected (no agents imported from lib):
```bash
node -e "require('./get-shit-done/bin/lib/core.cjs'); console.log('core still loads');"
# Count checks
RENAMED=$(ls agents/brief-*.md 2>/dev/null | wc -l | tr -d ' ')
OLD=$(ls agents/gsd-*.md 2>/dev/null | wc -l | tr -d ' ')
echo "brief-* agents: $RENAMED; remaining gsd-*: $OLD"
[ "$RENAMED" = "18" ] || { echo "FAIL: rename incomplete"; exit 1; }
[ "$OLD" = "0" ] || { echo "FAIL: leftover gsd-* agents"; exit 1; }
```

4. Stage for the combined commit (commit happens at end of Plan 03, after Tasks 2 and 3 complete):
```bash
git status --short | head -40
```
Do NOT commit here — wait for Task 3.
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
[ $(ls agents/gsd-*.md 2>/dev/null | wc -l | tr -d " ") -eq 0 ] || { echo "FAIL: gsd-* agents remain"; exit 1; }
[ $(ls agents/brief-*.md 2>/dev/null | wc -l | tr -d " ") -eq 18 ] || { echo "FAIL: brief-* agent count wrong"; exit 1; }
# Verify git history preserved for a representative file
git log --follow agents/brief-planner.md | head -5 | grep -qi "commit" && echo "OK: history preserved" || { echo "FAIL: no git history"; exit 1; }
'
    </automated>
  </verify>
  <done>
    - 18 `agents/brief-*.md` files exist (renamed from `agents/gsd-*.md`)
    - 0 `agents/gsd-*.md` files remain
    - `git log --follow agents/brief-planner.md` shows commits predating the rename (history preserved)
    - Changes are staged (added) but not yet committed
  </done>
</task>

<task type="auto">
  <name>Task 2: Rename commands/gsd/ directory → commands/brief/ and rename hooks + tests</name>
  <files>
    commands/gsd/ (directory)
    commands/brief/ (directory, new)
    hooks/gsd-check-update-worker.js
    hooks/gsd-check-update.js
    hooks/gsd-context-monitor.js
    hooks/gsd-phase-boundary.sh
    hooks/gsd-prompt-guard.js
    hooks/gsd-read-guard.js
    hooks/gsd-read-injection-scanner.js
    hooks/gsd-session-state.sh
    hooks/gsd-statusline.js
    hooks/gsd-validate-commit.sh
    hooks/gsd-workflow-guard.js
    tests/gsd-statusline.test.cjs
    tests/gsd-tools-path-refs.test.cjs
    tests/gsd2-import.test.cjs
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-05 specifies `commands/gsd/ → commands/brief/` and hook prefix rename)
    - Output of `ls hooks/gsd-* tests/gsd-*.test.cjs` (authoritative list)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Rename the `commands/gsd/` DIRECTORY to `commands/brief/`:
```bash
# Directory-level git mv: moves every file inside in one atomic action
git mv commands/gsd commands/brief
# Sanity
CMD_COUNT=$(ls commands/brief/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "commands in commands/brief/: $CMD_COUNT (expected ~61)"
[ "$CMD_COUNT" -ge 55 ] && [ "$CMD_COUNT" -le 75 ] || { echo "UNEXPECTED COUNT; abort"; exit 1; }
[ ! -d commands/gsd ] || { echo "FAIL: commands/gsd still exists"; exit 1; }
```
Command filenames inside commands/brief/ are NOT prefixed `brief-*` — they remain e.g. `plan-phase.md`, `new-project.md`. The runtime-visible slash command is `/brief-plan-phase` because the runtime concatenates directory name (`brief`) with filename (`plan-phase`). This matches GSD's existing pattern where `commands/gsd/plan-phase.md` = `/gsd-plan-phase`.

2. Rename all 11 hook files (gsd-* prefix → brief-*):
```bash
HOOK_COUNT=$(ls hooks/gsd-* 2>/dev/null | wc -l | tr -d ' ')
echo "Surviving gsd-* hooks: $HOOK_COUNT (expected 11)"
[ "$HOOK_COUNT" = "11" ] || { echo "UNEXPECTED COUNT; abort"; exit 1; }

for f in hooks/gsd-*; do
  new="${f/gsd-/brief-}"
  git mv "$f" "$new"
  echo "Renamed: $f → $new"
done

# Verify
[ $(ls hooks/gsd-* 2>/dev/null | wc -l | tr -d ' ') -eq 0 ] || { echo "FAIL: gsd-* hooks remain"; exit 1; }
[ $(ls hooks/brief-* 2>/dev/null | wc -l | tr -d ' ') -eq 11 ] || { echo "FAIL: brief-* hook count wrong"; exit 1; }
```

3. Rename the 3 `gsd-*`-prefixed test files:
```bash
for f in tests/gsd-*.test.cjs tests/gsd2-*.test.cjs; do
  if [ -f "$f" ]; then
    new=$(echo "$f" | sed 's|tests/gsd-|tests/brief-|; s|tests/gsd2-|tests/brief2-|')
    git mv "$f" "$new"
    echo "Renamed: $f → $new"
  fi
done
# Verify
[ $(ls tests/gsd-*.test.cjs 2>/dev/null | wc -l | tr -d ' ') -eq 0 ] || { echo "FAIL: gsd-* tests remain"; exit 1; }
```

4. Buildability gate: lib layer still loads (lib/ wasn't touched):
```bash
node -e "require('./get-shit-done/bin/lib/core.cjs'); console.log('OK');"
```

5. Stage the changes (commit happens in Task 3):
```bash
git status --short | head -40
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# Directory renamed
[ -d commands/brief ] || { echo "FAIL: commands/brief missing"; exit 1; }
[ ! -d commands/gsd ] || { echo "FAIL: commands/gsd still exists"; exit 1; }
# Hook rename
[ $(ls hooks/gsd-* 2>/dev/null | wc -l | tr -d " ") -eq 0 ] || { echo "FAIL: gsd-* hooks remain"; exit 1; }
[ $(ls hooks/brief-* 2>/dev/null | wc -l | tr -d " ") -eq 11 ] || { echo "FAIL: brief-* hooks wrong count"; exit 1; }
# Test rename
[ $(ls tests/gsd-*.test.cjs 2>/dev/null | wc -l | tr -d " ") -eq 0 ] || { echo "FAIL: gsd-* tests remain"; exit 1; }
# Lib intact
node -e "require(\"./get-shit-done/bin/lib/core.cjs\"); require(\"./get-shit-done/bin/lib/state.cjs\"); console.log(\"lib-intact: OK\");" || { echo "FAIL: lib broken"; exit 1; }
# A representative command file is at the new location
[ -f commands/brief/plan-phase.md ] || { echo "FAIL: plan-phase.md not at new location"; exit 1; }
echo "OK: Task 2 verification passed"
'
    </automated>
  </verify>
  <done>
    - `commands/brief/` directory exists with all ~61 surviving command .md files
    - `commands/gsd/` directory no longer exists
    - 11 `hooks/brief-*` files; 0 `hooks/gsd-*` files
    - 3 gsd-*-prefixed test files renamed to brief-*
    - Lib layer still loads
    - All changes staged via `git mv` (history preserved)
  </done>
</task>

<task type="auto">
  <name>Task 3: Commit the user-facing rename set (commit 3 of 6)</name>
  <files>
    (staged changes from Tasks 1 and 2)
  </files>
  <read_first>
    - .planning/phases/01-foundation-fork-hygiene-removal-rename/01-CONTEXT.md (D-08 commit 3 message: `refactor(rename): brief-* prefix for commands, agents, hooks, tests`)
  </read_first>
  <action>
From repo root `/Users/agent/GSD-for-Business`:

1. Inspect the staged changes to confirm scope:
```bash
git status --short
STAGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
echo "Staged file changes: $STAGED"
# Expected: 18 (agents) + 61 (commands renamed via dir move, shown as individual renames) + 11 (hooks) + 3 (tests) = ~93
# Git's rename detection may also show these as delete+add pairs — that's OK as long as `git log --follow` works
```

2. Commit:
```bash
node get-shit-done/bin/gsd-tools.cjs commit "refactor(01-rename): brief-* prefix for commands, agents, hooks, tests (FND-03 part 1)" --files $(git diff --cached --name-only | tr '\n' ' ')
```
Fallback if gsd-tools.cjs fails: plain `git commit -m "refactor(01-rename): brief-* prefix for commands, agents, hooks, tests (FND-03 part 1)"`

3. Post-commit verification:
```bash
git log -1 --oneline
# Expect a commit like: <hash> refactor(01-rename): brief-* prefix for commands, agents, hooks, tests (FND-03 part 1)
```

4. Buildability re-check after commit:
```bash
node -e "require('./get-shit-done/bin/lib/core.cjs'); console.log('OK post-commit');"
```
  </action>
  <verify>
    <automated>
bash -c '
cd /Users/agent/GSD-for-Business
# Latest commit has the expected message
git log -1 --format="%s" | grep -qE "^refactor\(01-rename\):.*brief-\* prefix" || { echo "FAIL: commit message wrong"; exit 1; }
# Lib still loads
node -e "require(\"./get-shit-done/bin/lib/core.cjs\"); console.log(\"OK\");" || { echo "FAIL: lib broken"; exit 1; }
# Agents fully renamed
[ $(ls agents/gsd-*.md 2>/dev/null | wc -l | tr -d " ") -eq 0 ] && [ $(ls agents/brief-*.md 2>/dev/null | wc -l | tr -d " ") -eq 18 ] || { echo "FAIL: agent rename incomplete"; exit 1; }
# Commands dir renamed
[ -d commands/brief ] && [ ! -d commands/gsd ] || { echo "FAIL: commands dir not renamed"; exit 1; }
# Hooks renamed
[ $(ls hooks/gsd-* 2>/dev/null | wc -l | tr -d " ") -eq 0 ] && [ $(ls hooks/brief-* 2>/dev/null | wc -l | tr -d " ") -eq 11 ] || { echo "FAIL: hooks not fully renamed"; exit 1; }
echo "OK: commit 3 complete"
'
    </automated>
  </verify>
  <done>
    - Exactly one new commit on `main` with message `refactor(01-rename): brief-* prefix for commands, agents, hooks, tests (FND-03 part 1)`
    - All 18 agents, ~61 commands (via dir rename), 11 hooks, 3 tests renamed
    - Lib layer still loads post-commit
    - Repo in buildable state per D-09 (file content references still gsd-named — that's Plan 05's scope)
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Filesystem ↔ git history | `git mv` preserves rename-tracking; history remains reachable via `git log --follow`. |
| File names ↔ internal references | This plan INTENTIONALLY creates broken internal references (e.g., `gsd-planner` mentioned in an `.md` body but the agent is now `brief-planner.md`). Plan 05 repairs these. D-09 buildable-state is preserved at the module-load level (lib/*.cjs doesn't import agents). |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-05 | D (Denial of Service) | Runtime commands fail to dispatch because internal references still say `subagent_type: gsd-*` | accept | This is an EXPECTED intermediate state per D-09 ("buildable" = lib modules load, not "runtime fully working"). Plan 05 repairs all text references. The backup/original-gsd branch provides rollback if Plan 05 cannot complete. |
| T-01-06 | T (Tampering) | `git mv` detection flakes for files with substantial changes | accept | Plan 03 touches only names, not contents. Git rename detection will succeed. If a file was coincidentally edited pre-plan, use `git mv -f` or verify via `git log --follow`. |

Phase 1 still adds zero new attack surface.
</threat_model>

<verification>
1. `ls agents/gsd-*.md` returns empty; `ls agents/brief-*.md | wc -l` returns 18.
2. `ls -d commands/gsd 2>/dev/null` returns empty; `ls -d commands/brief` returns it.
3. `ls hooks/gsd-*` returns empty; `ls hooks/brief-* | wc -l` returns 11.
4. `ls tests/gsd-*.test.cjs` returns empty.
5. `git log --follow agents/brief-planner.md` shows commits from before the rename.
6. `node -e "require('./get-shit-done/bin/lib/core.cjs')"` exits 0.
7. Commit message: `refactor(01-rename): brief-* prefix for commands, agents, hooks, tests (FND-03 part 1)`.
</verification>

<success_criteria>
- [ ] 18 agents renamed gsd-* → brief-*
- [ ] `commands/gsd/` directory renamed to `commands/brief/` (carrying ~61 command files)
- [ ] 11 hooks renamed gsd-* → brief-*
- [ ] 3 test files renamed gsd-* → brief-*
- [ ] Git history preserved via `git mv` (verified on a representative file)
- [ ] Exactly one atomic commit per D-08 commit 3
- [ ] Lib layer still loads (buildable state per D-09; runtime command dispatch is expected to be temporarily broken until Plan 05 — documented in Plan 05's scope)
- [ ] FND-03 part 1 advanced (remaining parts in Plans 04 and 05)
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-03-SUMMARY.md` recording the exact rename counts (agents / commands / hooks / tests) and confirming git rename detection worked.
</output>
