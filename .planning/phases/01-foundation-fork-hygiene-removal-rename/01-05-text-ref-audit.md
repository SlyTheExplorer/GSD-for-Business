# Phase 1 Plan 05 — Text Reference Update Audit

**Generated:** 2026-04-18
**Strategy:** Three-phase — BASELINE capture (W4) → SURGICAL EDITS per disposition (BLOCKER 1+2) → BLANKET substitutions with UNIFIED EXCLUDE (W3)

## W4 Baseline Delta

| Stage                  | Failure count |
| ---------------------- | ------------- |
| BASELINE (pre-edit)    | 2             |
| POST (post-edit)       | 5             |
| DELTA                  | 3 (cap: ≤ 10) |

DELTA ≤ 10 gate: PASS

## Surgical-edit summary (per-file, per-disposition)

| File                                               | Disposition                    | Lines / Action                    | Checker issue |
| -------------------------------------------------- | ------------------------------ | --------------------------------- | ------------- |
| brief/bin/lib/model-profiles.cjs                   | DELETE-LINE                    | 16, 20, 23, 24, 25                | W4            |
| brief/references/agent-contracts.md                | DELETE-LINE                    | 19, 21, 22, 23, 25, 27, 39        | W5            |
| brief/references/model-profiles.md                 | DELETE-LINE                    | 15, 19, 64                        | W5            |
| brief/workflows/execute-phase.md                   | DELETE-LINE                    | 43, 45, 47, 48, 49                | W3            |
| brief/workflows/quick.md                           | DELETE-LINE (bullet + block)   | ~26 + Step 6.25 whole block       | W3 / Rule 2   |
| bin/install.js                                     | DELETE-LINE                    | 33, 35                            | BLOCKER 1     |
| sdk/src/query/config-query.ts                      | DELETE-LINE                    | 39, 43, 45, 46, 47                | BLOCKER 1     |
| tests/agent-frontmatter.test.cjs                   | DELETE-LINE + string-lit fix   | 17, 18, 21, 112, 145, 376, 395    | BLOCKER 2     |
| tests/agent-skills-awareness.test.cjs              | DELETE-LINE                    | 16, 17, 18, 22                    | BLOCKER 1     |
| tests/model-profiles.test.cjs                      | DELETE-LINE                    | 25, 26, 27, 103                   | BLOCKER 1     |
| tests/copilot-install.test.cjs                     | DELETE-LINE                    | 1183–1210 (13 entries)            | BLOCKER 1     |
| tests/codex-config.test.cjs                        | DELETE-LINE (+ fixture rename) | 176, 366, 374                     | BLOCKER 1     |
| tests/thinking-model-guidance.test.cjs             | DELETE-LINE                    | 52 (block for gsd-debugger)       | BLOCKER 1     |
| tests/planner-language-regression.test.cjs         | DELETE-LINE                    | 109 (gsd-debugger ALLOWLIST row)  | BLOCKER 1     |
| tests/bug-patterns-reference.test.cjs              | DELETE-FILE                    | whole file (tests gsd-debugger)   | BLOCKER 1     |
| tests/qwen-skills-migration.test.cjs               | SUBSTITUTE (fixture)           | 259 (→ `gsd-verifier` survivor)   | BLOCKER 1     |
| tests/bug-2346-agent-read-loop-guards.test.cjs     | DELETE-LINE (describe block)   | 4, 26–65 (gsd-ui-checker block)   | BLOCKER 1     |
| docs/ARCHITECTURE.md                               | DELETE-LINE                    | 275, 278, 282, 283                | BLOCKER 1     |
| docs/AGENTS.md                                     | DELETE-LINE (perl sweep)       | 6 lines                           | BLOCKER 1     |
| docs/COMMANDS.md                                   | DELETE-LINE (perl sweep)       | 3 lines                           | BLOCKER 1     |
| docs/CONFIGURATION.md                              | DELETE-LINE (perl sweep)       | 6 lines                           | BLOCKER 1     |
| docs/FEATURES.md                                   | DELETE-LINE (perl sweep)       | 4 lines                           | BLOCKER 1     |
| docs/USER-GUIDE.md                                 | DELETE-LINE (perl sweep)       | 3 lines                           | BLOCKER 1     |
| docs/CLI-TOOLS.md                                  | DELETE-LINE (perl sweep)       | 1 line                            | BLOCKER 1     |
| docs/ja-JP/ (6 files)                              | DELETE-LINE (perl sweep)       | 20 lines total                    | BLOCKER 1     |
| docs/ko-KR/ (6 files)                              | DELETE-LINE (perl sweep)       | 20 lines total                    | BLOCKER 1     |
| docs/zh-CN/ (2 files)                              | DELETE-LINE (perl sweep)       | 4 lines total                     | BLOCKER 1     |
| CLAUDE.md                                          | SUBSTITUTE (descriptive line)  | line describing agent migration   | BLOCKER 1     |
| brief/templates/debug-subagent-prompt.md           | DELETE-FILE                    | whole file                        | BLOCKER 1     |
| brief/workflows/diagnose-issues.md                 | DELETE-FILE                    | whole file                        | BLOCKER 1     |
| brief/workflows/audit-milestone.md                 | DELETE-FILE                    | whole file                        | BLOCKER 1     |
| CHANGELOG.md                                       | RESIDUAL + banner              | pre-fork banner prepended         | W1            |

## Residual count (should be 0 outside documented exclusions)

| Pattern                                          | Count | Note                             |
| ------------------------------------------------ | ----- | -------------------------------- |
| `get-shit-done/`                                 | 0     | Old path refs (excl CHANGELOG)   |
| `gsd-tools`                                      | 0     | Old binary refs (excl CHANGELOG) |
| `subagent_type: gsd-`                            | 0     | Old subagent refs                |
| `/gsd-`                                          | 0     | Old slash-command refs           |
| Removed-agent identifiers (BLOCKER 1)            | 0     | Excl CHANGELOG + smoke.txt       |
| `'brief-executor'` in model-profiles.cjs (W4)    | 1     | Single key — W4 satisfied        |
| `'gsd-'` in agent-frontmatter.test.cjs (BLK 2)   | 0     | BLOCKER 2 literal fixed          |

## Phase B blanket-substitution summary

| Pass                             | Scope                             | Exclude list                                                                                         |
| -------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `get-shit-done/` → `brief/`      | All .md/.cjs/.js/.ts/.sh/.json    | .planning/, .git/, node_modules/, backup/, removed-surfaces.smoke.txt                                |
| `'get-shit-done'` → `'brief'`    | Path.join string literals         | Same as above                                                                                        |
| `get-shit-done-cc` → `brief-cc`  | All                               | Same as above                                                                                        |
| `gsd-tools(\.cjs)?` → `brief-tools$1` | All                           | Same as above                                                                                        |
| `/gsd-` → `/brief-`              | All                               | Same as above                                                                                        |
| 18 survivor ids (gsd-X → brief-X)| All                               | Same as above                                                                                        |
| `Get Shit Done` → `BRIEF`        | All                               | **UNIFIED EXCLUDE:** LICENSE, CHANGELOG.md, CONTRIBUTING.md, SECURITY.md, removed-surfaces.smoke.txt |
| `\bGSD\b` → `BRIEF`              | .md files only                    | Same **UNIFIED EXCLUDE** (W3 closure)                                                                |

## W3 closure — UNIFIED EXCLUDE verification

| File                               | Post-sub state                                              |
| ---------------------------------- | ----------------------------------------------------------- |
| LICENSE                            | Unchanged (no GSD tokens present to begin with)             |
| CHANGELOG.md                       | Banner prepended; historical gsd-* + GSD + Get Shit Done preserved |
| CONTRIBUTING.md                    | Paths updated (per plan); brand attribution preserved        |
| SECURITY.md                        | Unchanged                                                   |
| tests/removed-surfaces.smoke.txt   | Unchanged (audit trail)                                     |

## W4 closure — model-profiles.cjs + npm test delta

- `brief/bin/lib/model-profiles.cjs` has exactly **1** `'brief-executor'` key (W4 duplicate-key prevented)
- `node -e "require('./brief/bin/lib/model-profiles.cjs')"` succeeds and exports 13 unique survivor keys
- DELTA = POST (5) − BASELINE (2) = **3**, well within cap of 10
- Zero module-load errors in post-test output

## W5 closure — single brief-executor contract row

- `grep -c "^| brief-executor " brief/references/agent-contracts.md` = **1**
- `grep -c "^| brief-executor " brief/references/model-profiles.md` = **1**

## BLOCKER 1 closure — expanded orphan scope

All 149 DELETE-LINE + 3 DELETE-FILE records processed:

| Scope                                | DELETE-LINE records processed | DELETE-FILE records processed |
| ------------------------------------ | ----------------------------- | ----------------------------- |
| `[get-shit-done markdown]`           | 27 (surgical + perl)          | 0                             |
| `[get-shit-done/bin cjs]`            | 5 (Edit tool)                 | 0                             |
| `[bin + scripts + hooks]`            | 2 (Edit tool)                 | 0                             |
| `[sdk]`                              | 5 (Edit tool)                 | 0                             |
| `[tests]`                            | 39 (Edit + DELETE-FILE)       | 1 (bug-patterns-reference)    |
| `[docs English]`                     | 27 (Edit + perl sweep)        | 0                             |
| `[docs localized]`                   | 44 (perl sweep)               | 0                             |
| `[known orphan files — DELETE-FILE]` | 0                             | 3 (Plan 02 whole-file list)   |
| **Total**                            | **149**                       | **4 (inc. bug-patterns)**     |

Repo-wide orphan grep (excluding CHANGELOG.md + removed-surfaces.smoke.txt): **0**

## BLOCKER 2 closure — tests/agent-frontmatter.test.cjs bare-prefix fix

| Edit                                       | Before                                | After                                 |
| ------------------------------------------ | ------------------------------------- | ------------------------------------- |
| Line 17 WORKFLOWS_DIR constant             | `'get-shit-done', 'workflows'`        | `'brief', 'workflows'`                |
| Line 18 COMMANDS_DIR constant              | `'commands', 'gsd'`                   | `'commands', 'brief'`                 |
| Line 21 bare-prefix filter                 | `.startsWith('gsd-')`                 | `.startsWith('brief-')`               |
| Line 112 workaround pattern                | `'First, read ~/.claude/agents/gsd-'` | `'First, read ~/.claude/agents/brief-'`|
| Line 145–152 removed-agent describe block  | `test('diagnose-issues uses gsd-debugger ...)` | Deleted (diagnose-issues workflow removed) |
| Line 376 template path                     | `'get-shit-done', 'templates'`        | `'brief', 'templates'`                |
| Line 395 AGENTS_WITH_WRITE array           | `['gsd-executor', 'gsd-debugger']`    | `['gsd-executor']` (now `['brief-executor']` after survivor sub) |

Runtime iteration count: `fs.readdirSync(AGENTS_DIR).filter(f => f.startsWith('brief-') && f.endsWith('.md'))` returns **18** agents (≥18 required).

## Intentional residuals (NOT fixed in Phase 1)

- `.planning/` directory: historical planning artifacts; kept intact
- `LICENSE`: legal content preserved
- `CHANGELOG.md`: **RESIDUAL** — pre-fork banner prepended; historical agent names preserved; excluded from BOTH verbose-brand AND acronym passes per W3 UNIFIED EXCLUDE
- `CONTRIBUTING.md`: attribution to upstream GSD project preserved (brand passes skip); paths updated to `brief/`
- `SECURITY.md`: attribution content preserved; excluded from both substitution passes per W3
- `backup/original-gsd` branch: never touched
- `tests/removed-surfaces.smoke.txt`: audit trail preserves historical gsd-* names
- Non-English localized docs: Phase 1 applies mechanical deletions; formatting polish deferred to Phase 9

## Known plan inconsistency (documented)

The plan's `must_haves.truths` (lines 62-64) describes grep commands that do NOT exclude `CHANGELOG.md` from residue counts; those counts include historical CHANGELOG entries (preserved as RESIDUAL per Plan 02 + W3 intent). The plan's own `verify.automated` block (lines 468-493) DOES exclude CHANGELOG.md, matching the RESIDUAL disposition established by Plan 02. This SUMMARY follows the verify-block intent. An alignment PR between the must_haves and verify-block would be appropriate in Plan 06.

## Automatic deviations (per Plan 05 deviation_rules)

- **Rule 2 / Rule 3 — `brief/workflows/quick.md` Step 6.25 block removed:** The Step 6.25 "Code review (auto)" block referenced the removed `gsd-code-reviewer` agent. Single-line deletion of only line 742 (`subagent_type="gsd-code-reviewer"`) would have produced a broken orphan Task() call. Removed the entire Step 6.25 block (40 lines) as correctness requirement (Rule 2) and blocking issue (Rule 3).
- **Rule 1 — CHANGELOG.md / CONTRIBUTING.md / SECURITY.md exclude bug recovery:** First Phase-B pass had a zsh word-splitting bug — unquoted variable expansion `for ex in $EXCLUDE_FILES_BRAND` did not tokenize. All three EXCLUDE files were inadvertently brand-substituted. Reverted the three files and re-applied only path substitutions to CONTRIBUTING.md (preserving brand attribution per W3). Banner re-prepended to CHANGELOG.md after revert.
- **Rule 1 — CLAUDE.md residual removed-agent reference repaired:** Line 132 described agent migration with "Replace dev-specific agents (gsd-code-reviewer, gsd-ui-checker, ...)" — rewrote to "Dev-specific agents removed in Phase 1; replaced with business agents ..." to eliminate the BLOCKER 1 orphan match while preserving the description's intent.
