---
phase: 09-hardening-cross-runtime-smoke-non-developer-pilot
reviewed: 2026-04-27T00:00:00Z
depth: standard
files_reviewed: 27
files_reviewed_list:
  - bin/install.js
  - brief/bin/brief-tools.cjs
  - brief/bin/lib/help.cjs
  - brief/bin/lib/smoke-test.cjs
  - CLAUDE.md
  - commands/brief/help.md
  - commands/brief/init.md
  - commands/brief/pause-work.md
  - commands/brief/progress.md
  - commands/brief/undo.md
  - docs/ARCHITECTURE.md
  - tests/brief-help-categorization.test.cjs
  - tests/brief-help-levenshtein.test.cjs
  - tests/brief-help-partial-match.test.cjs
  - tests/brief-pilot-journal-structure.test.cjs
  - tests/brief-smoke-test-output-format.test.cjs
  - tests/brief-smoke-test-stub.test.cjs
  - tests/brief-smoke-test-text-mode.test.cjs
  - tests/brief-surface-audit-count.test.cjs
  - tests/brief-surface-audit-doc.test.cjs
  - tests/brief-surface-audit-install-cleanup.test.cjs
  - tests/brief-v1-launch-gate.test.cjs
  - tests/bug-2004-pr-branch-milestone.test.cjs
  - tests/bug-2075-worktree-deletion-safeguards.test.cjs
  - tests/command-count-sync.test.cjs
  - tests/execute-phase-wave.test.cjs
  - tests/next-up-clear-order.test.cjs
findings:
  blocker: 3
  warning: 7
  info: 4
  total: 14
status: issues_found
---

# Phase 9: Code Review Report

**Reviewed:** 2026-04-27
**Depth:** standard
**Files Reviewed:** 27
**Status:** issues_found

## Summary

Phase 9 (BRIEF v1 hardening) introduced three landed deliverables: cross-runtime smoke-test scaffolding (`brief/bin/lib/smoke-test.cjs`), a categorized `/brief-help` with inline Levenshtein typo correction (`brief/bin/lib/help.cjs`), and a surface pruning to a locked 12-command lineup (with `new-project.md` renamed to `init.md`). The A1 invariant is verified intact (`package.json.dependencies = {}`); no banned vocabulary was introduced in the new files.

The implementation contains **three BLOCKERs**:

1. The smoke matrix is functionally non-operational. Every one of the 20 cells returns FAIL because `brief-tools.cjs <slug> --smoke --text` does not match any real subcommand surface (no `--smoke` handler exists; `init` requires a sub-subcommand; `define`/`design`/`deliver` require a sub-subcommand). The committed `.planning/SMOKE-TEST.md` ships 20/20 FAIL cells. V1-LAUNCH-GATE.md prong (ii) is therefore validating an empty contract, and the test fixtures pass only because they do not assert PASS. This contradicts the file-header claim that "Pitfall 4 (text_mode plumbing breakage) mitigation: each cell uses `execFileSync` with `timeout: 5000`" — text_mode plumbing is not actually verified.

2. `commands/brief/init.md:32` instructs the user to "Run `/brief-plan-phase 1` to start execution" — but `/brief-plan-phase` was deleted in HRD-02 surface pruning. A new pilot user following the post-init prompt will hit a "command not found" dead end on their first step.

3. `commands/brief/init.md:38` and `commands/brief/undo.md:24` reference `~/.claude/brief/references/ui-brand.md` via `<execution_context>`, but that file does not exist in the repository (`brief/references/ui-brand.md` not present). These are active broken `@`-imports the runtime will silently fail to resolve.

The remaining findings concern user-visible stale slash commands in `bin/install.js` and `CLAUDE.md`, env-isolation gaps in the smoke harness, a documentation-vs-test contradiction in `help.cjs`, an unused module-level cache key, and minor dead code.

## Critical Issues

### CR-01: Smoke matrix is structurally broken — every cell returns FAIL because brief-tools.cjs has no matching subcommands

**File:** `brief/bin/lib/smoke-test.cjs:42-89` (and `.planning/SMOKE-TEST.md` ships 20/20 FAIL cells)
**Issue:** `smokeOneCell` invokes `brief-tools.cjs <cmd> --smoke --text` where `<cmd>` ∈ `['init', 'define', 'discover', 'design', 'deliver']`. None of these are reachable as bare-command leaves on `brief-tools.cjs`:

- `init` requires a workflow sub-subcommand (`init plan-phase`, `init execute-phase`, etc.). `brief-tools.cjs init --smoke …` falls into the inner `default:` branch and calls `error('Unknown init workflow: --smoke')`, which calls `process.exit(1)`.
- `define` requires `define apply`. `define --smoke` errors with `Unknown define subcommand. Available: apply` and exits 1.
- `design`, `deliver` likewise reject `--smoke` with `unknown subcommand '--smoke'`.
- `discover` exits 1 with the OBJECTIVES.md-missing message (text-mode rendering of an interactive precondition).

Empirical confirmation (this reviewer ran `node brief/bin/brief-tools.cjs smoke-test run --out /tmp/SMOKE-TEST-test.md`): 20/20 cells return `{status:'FAIL', reason:'Command failed: …'}`. The file-header comment claiming "Pitfall 4 (text_mode plumbing breakage) mitigation" is therefore not realized — text_mode is never exercised because the subprocess exits before any output is produced.

The test fixtures (`brief-smoke-test-stub.test.cjs`, `brief-smoke-test-text-mode.test.cjs`) only assert (a) shape `{status, reason}`, (b) status ∈ `['PASS','FAIL','SKIP']`, and (c) FAIL `reason` does not include the literal string `text_mode`. None assert any PASS cell, so a 20/20-FAIL matrix passes the suite. V1-LAUNCH-GATE.md prong (ii) acknowledges "all cells currently FAIL" and downgrades the criterion to "matrix delivery is the v1 criterion, not cell-by-cell green" — but the smoke-test.cjs source still claims the opposite contract via its module docstring and the `if (out.includes('AskUserQuestion') && text_mode_default === true)` assertion (which is unreachable in practice).

**Fix:** Either (a) wire a real `--smoke` flag into the case dispatchers being tested so the harness verifies text_mode plumbing, or (b) replace the COMMANDS list with brief-tools.cjs surface that does succeed under text-mode (e.g., `['help', 'config-get workflow.text_mode --default false', …]`) and re-anchor the assertion. The current code shape — pretending to verify a property it cannot verify, while shipping all-FAIL output as a "pass with notes" launch gate — is the worst of both worlds.

```js
// Option A — add a no-op --smoke handler to each tested case in brief-tools.cjs
case 'define': {
  if (args.includes('--smoke')) {
    core.output({ smoke: 'ok' }, raw, 'define smoke ok\n');
    break;
  }
  // … existing logic
}
// then smoke-test.cjs's PASS branch becomes meaningful
```

```js
// Option B — anchor smoke against an inert read-only command
const COMMANDS = ['help', 'state-snapshot', 'find-phase', 'current-timestamp', 'frontmatter --validate'];
```

### CR-02: /brief-init points users at a deleted command (/brief-plan-phase) — dead-end on first run

**File:** `commands/brief/init.md:32`
**Issue:** The `<objective>` block tells users:

```
**After this command:** Run `/brief-plan-phase 1` to start execution.
```

`/brief-plan-phase` was deleted in HRD-02 surface pruning (`tests/brief-surface-audit-install-cleanup.test.cjs` DELETED_57 explicitly lists `plan-phase`). A non-developer pilot running `/brief-init` will be told to run a command that does not exist; the pilot Pitfall #9 ("vocabulary friction") becomes a hard friction gate at the very start of the funnel. This is the single most-visible regression for the v1 launch gate's prong (i) audience.

**Fix:** Replace the deferred-step pointer with a LOCKED_12 command — the natural next is `/brief-discover` per the BRIEF 4D flow (DEFINE is wrapped inside `/brief-init` per its own flow; DISCOVER is the next user-visible step). Or, if `init` already does DEFINE end-to-end, point at `/brief-design <workstream>`.

```diff
-**After this command:** Run `/brief-plan-phase 1` to start execution.
+**After this command:** Run `/brief-discover` to start broad domain research, or `/brief-design <workstream>` to jump directly into a single workstream.
```

### CR-03: /brief-init and /brief-undo `<execution_context>` reference non-existent ui-brand.md

**File:** `commands/brief/init.md:38`, `commands/brief/undo.md:24`
**Issue:** Both files declare `@~/.claude/brief/references/ui-brand.md` as an `<execution_context>` import. The file does not exist in the repository:

```
$ ls brief/references/ui-brand.md
ls: brief/references/ui-brand.md: No such file or directory
```

`tests/next-up-clear-order.test.cjs` already documents that `ui-brand.md` "ties to gsd-ui-researcher / gsd-ui-checker agents, intentionally absent post-Phase-1 FND-02 (developer surface removal)". The two LOCKED_12 commands that still reference it produce silent broken `@`-imports under runtimes that resolve them (Claude Code, OpenCode). The agent prompt loses the styling cues the reference was supposed to provide; runtimes that hard-fail on unresolvable imports will surface this as an error to the user.

**Fix:** Remove the dangling references. `init.md` line 38 and `undo.md` line 24:

```diff
 <execution_context>
-@~/.claude/brief/workflows/undo.md
-@~/.claude/brief/references/ui-brand.md
-@~/.claude/brief/references/gate-prompts.md
+@~/.claude/brief/workflows/undo.md
+@~/.claude/brief/references/gate-prompts.md
 </execution_context>
```

(Verify each remaining reference exists; `gate-prompts.md` is present, but `init.md` similarly needs a sweep — `templates/project.md`, `templates/requirements.md`, `references/questioning.md`, `workflows/new-project.md` all do exist on disk; only `ui-brand.md` is the broken one in `init.md`.)

## Warnings

### WR-01: bin/install.js prints `/brief-reapply-patches` to users — that command was deleted

**File:** `bin/install.js:5396, 5398, 5401`
**Issue:** `reportLocalPatches()` constructs a "next step" command string:

```js
const reapplyCommand = (runtime === 'opencode' || …)
  ? '/brief-reapply-patches'
  : runtime === 'codex'
    ? '$brief-reapply-patches'
    : runtime === 'cursor'
      ? 'brief-reapply-patches (mention the skill name)'
      : '/brief-reapply-patches';
```

`reapply-patches` is in `DELETED_57` (verified in `tests/brief-surface-audit-install-cleanup.test.cjs`). Users who reinstall after a previous version will be told to run a command that no longer exists. The same is logically true at line 5409: `'  Run ' + cyan + reapplyCommand + reset + ' to merge them into the new version.'`.

`tests/brief-surface-audit-install-cleanup.test.cjs:87` only matches `'<slug>.md'` paths, so it does not catch this bare slash-command string. The test is incomplete relative to the user-visible surface.

**Fix:** Either (a) restore `reapply-patches.md` to the LOCKED_12 (raises the cap to 13) or (b) replace with manual instructions ("Manually merge the files in `<patches dir>` against the newly installed sources"). The latter aligns with the v1 surface lock.

### WR-02: CLAUDE.md "BRIEF Workflow Enforcement" section directs Claude to use four deleted commands

**File:** `CLAUDE.md:253-256`
**Issue:**
```
- `/brief-discuss-phase` for phase-level context capture
- `/brief-plan-phase` for phase planning
- `/brief-execute-phase` for planned phase execution
- `/brief-verify-work` for phase-level verification
```

All four are in `DELETED_57`. CLAUDE.md is the project instructions block injected on every Claude Code session in this repo — directing the assistant at non-existent commands is a recurring source of "command not found" friction during the pilot. The "Note — Phase 1" warning ("BRIEF domain-specific commands (`/brief-define`, `/brief-discover`, `/brief-design`, `/brief-deliver`) are not yet implemented") is also stale post-Phase-7/8.

**Fix:** Replace the bullet list with the LOCKED_12 surface relevant to in-flight work:

```diff
-- `/brief-discuss-phase` for phase-level context capture
-- `/brief-plan-phase` for phase planning
-- `/brief-execute-phase` for planned phase execution
-- `/brief-verify-work` for phase-level verification
+- `/brief-define` for intent capture
+- `/brief-discover` for domain research
+- `/brief-design <workstream>` for workstream planning
+- `/brief-deliver` (Type A) or `/brief-deliver --type-b <name>` for synthesis
+- `/brief-progress`, `/brief-status` for situational awareness
```

Also drop the "Note — Phase 1" line.

### WR-03: smoke harness leaks parent INSTRUCTION_FILE into the Claude cell

**File:** `brief/bin/lib/smoke-test.cjs:60-65`
**Issue:** The Claude entry has `env: { text_mode_default: false }`. After destructuring, `envOverrides = {}`. The child env is built as:

```js
const env = { ...process.env, ...envOverrides, BRIEF_RUNTIME_MOCK: runtime.name };
```

If the parent process has `INSTRUCTION_FILE` set (e.g., the user runs `node brief/bin/brief-tools.cjs smoke-test run` from inside a Codex session, or CI exports it), the Claude cell inherits it from `process.env`. `envOverrides` does not delete it because Claude has no `INSTRUCTION_FILE` key. The matrix then no longer distinguishes Claude from Codex; B-D03 ("INSTRUCTION_FILE env is the canonical non-Claude detector") is silently violated.

**Fix:** Force-clear the runtime-distinguishing keys before spreading per-runtime overrides:

```js
const env = {
  ...process.env,
  // Force-clear the env vars the matrix uses to distinguish runtimes,
  // so the parent shell never contaminates a runtime cell.
  INSTRUCTION_FILE: undefined,  // or `delete env.INSTRUCTION_FILE` after spread
  ...envOverrides,
  BRIEF_RUNTIME_MOCK: runtime.name,
};
if (env.INSTRUCTION_FILE === undefined) delete env.INSTRUCTION_FILE;
```

(Setting to `undefined` does not actually delete, so the explicit `delete` after the spread is necessary.)

### WR-04: help.cjs Levenshtein doc-comment claim contradicts the test it points to

**File:** `brief/bin/lib/help.cjs:166-168`
**Issue:** The function-level comment states:

```
* Pitfall 3 (RESEARCH.md lines 506-523): `levenshtein('define', 'design') === 2`
* — both slugs differ by `f→s` and `e→g` substitutions. The k=3 / threshold=3
* window in suggestTopK MUST include both …
```

Empirical: `levenshtein('define', 'design') === 3` (verified with this implementation; canonical Wikipedia DP agrees). The fix-up note in `tests/brief-help-levenshtein.test.cjs:64-72` explicitly corrects this miscount: "The original RESEARCH.md narrative miscounted as 2; canonical Wikipedia DP returns 3." The test asserts 3; the help.cjs comment still claims 2 and asserts the disambiguation contract relies on the (wrong) value 2.

The user-facing documentation in `commands/brief/help.md:14` perpetuates the error: "(e.g., `defone` → `define`, `design`)". `levenshtein('defone', 'design') === 4` — above threshold 3 — so `defone` only ever surfaces `define`, never `design`. The example is wrong.

**Fix:** Correct the comment in help.cjs to match the test and the algorithm:

```diff
- * Pitfall 3 (RESEARCH.md lines 506-523): `levenshtein('define', 'design') === 2`
- * — both slugs differ by `f→s` and `e→g` substitutions. The k=3 / threshold=3
- * window in suggestTopK MUST include both so the user disambiguates rather
- * than silently picking one.
+ * Pitfall 3 (RESEARCH.md lines 506-523): `levenshtein('define', 'design') === 3`
+ * — three substitutions at positions 2, 4, 5 (f→s, n→g, e→n). RESEARCH.md
+ * narrative initially miscounted as 2; canonical DP returns 3. The k=3 /
+ * threshold=3 window still surfaces both for inputs within 1-2 edits of
+ * either (e.g., `desin` → design(1), define(2)).
```

And in `commands/brief/help.md:14`, replace the broken example:

```diff
-- No match: top-3 Levenshtein suggestions with distance ≤ 3 (e.g., `defone` → `define`, `design`).
+- No match: top-3 Levenshtein suggestions with distance ≤ 3 (e.g., `desin` → `design` (1), `define` (2)).
```

### WR-05: help.cjs catalog cache is keyed by nothing — wrong dir on second call returns stale entries

**File:** `brief/bin/lib/help.cjs:50, 62-80`
**Issue:** `_catalogCache` is a module-level scalar. `buildCatalog(commandsDir)` returns it as soon as it is non-null, regardless of which `commandsDir` was passed:

```js
let _catalogCache = null;
function buildCatalog(commandsDir) {
  if (_catalogCache) return _catalogCache;     // ignores commandsDir
  …
}
```

In v1 the only call site passes the same path each time, so this is latent — but it is a foot-gun for any future test that wants to fixture a temp commands dir, or any future feature that supports a per-workstream commands subset. The current public signature accepts `commandsDir` as a parameter, implying it is honored, which is misleading.

**Fix:** Either (a) delete the parameter and hard-code the resolved path inside the function, or (b) key the cache by the resolved path:

```js
const _catalogCache = new Map();
function buildCatalog(commandsDir) {
  const key = path.resolve(commandsDir);
  const cached = _catalogCache.get(key);
  if (cached) return cached;
  // … build entries …
  _catalogCache.set(key, entries);
  return entries;
}
```

### WR-06: `commands/brief/help.md` body never references `$ARGUMENTS` — agent must guess how to forward the topic

**File:** `commands/brief/help.md:23-25`
**Issue:** The `<process>` block reads:

```
Execute `brief-tools.cjs help [<topic>] --raw` and print stdout verbatim.
```

Every other LOCKED_12 command that takes arguments either delegates to a `<execution_context>` workflow that handles `$ARGUMENTS` (e.g., `progress.md`, `undo.md`) or includes a `<context>$ARGUMENTS</context>` block. `help.md` has neither. The agent must infer from the `argument-hint` frontmatter that the user-supplied text after `/brief-help` is the topic. Most modern Claude Code agents do this correctly, but there is no test covering the agent-to-CLI argument forwarding, and this is the single command where forwarding is essential to the typo-correction feature.

Compare to `progress.md` which still takes the `--forensic` flag via the workflow — the workflow there reads `$ARGUMENTS`. `help.md` skipped the workflow.

**Fix:** Add an explicit `<context>` block so the agent knows the user input is the topic:

```diff
 <process>
-Execute `brief-tools.cjs help [<topic>] --raw` and print stdout verbatim. Read-only — no writes.
+Execute `brief-tools.cjs help $ARGUMENTS --raw` and print stdout verbatim. If `$ARGUMENTS` is empty, run `brief-tools.cjs help --raw` (no topic). Read-only — no writes.
 </process>
```

### WR-07: `brief/workflows/help.md` (still shipped) references three deleted commands

**File:** `brief/workflows/help.md:7-13` (file shipped via bin/install.js to ~/.claude/brief/workflows/)
**Issue:** Although `commands/brief/help.md` no longer points at this workflow, the workflow file still ships — bin/install.js copies all 70 workflow files. Inside it:

```
1. `/brief-new-project` - Initialize project (includes research, requirements, roadmap)
2. `/brief-plan-phase 1` - Create detailed plan for first phase
3. `/brief-execute-phase 1` - Execute the phase
```

All three slugs are deleted. Anyone who explicitly opens `~/.claude/brief/workflows/help.md` (or a subagent that resolves the file via legacy `@~/.claude/brief/workflows/help.md` syntax in any other shipped command) gets stale advice.

**Fix:** Either delete `brief/workflows/help.md` (it is no longer referenced by any LOCKED_12 command) or rewrite it to mirror the new `help.cjs`-rendered listing.

## Info

### IN-01: Unused `void fs;` keepalive in smoke-test.cjs

**File:** `brief/bin/lib/smoke-test.cjs:158`
**Issue:** The require is held alive through `void fs;` with the comment "Reference fs only inside conditional debug paths if needed; keep import for downstream extensions". Defensive imports for "future use" are dead code; if a future extension needs `fs`, it can re-import then.
**Fix:** Drop both the require at line 26 and the `void fs;` line. Re-add when actually needed.

### IN-02: Unused `glob` alias in next-up-clear-order.test.cjs

**File:** `tests/next-up-clear-order.test.cjs:15`
**Issue:** `const glob = require('path');` — `path` is already required on the previous line, and `glob` is never referenced. Likely a leftover from a refactor that removed glob-based discovery.
**Fix:** Delete the line.

### IN-03: renderMatrixMarkdown column padding is a no-op

**File:** `brief/bin/lib/smoke-test.cjs:130`
**Issue:** `(c && c.status ? c.status : 'SKIP').padEnd(4)` — `'PASS' / 'FAIL' / 'SKIP'` are already 4 characters, so `padEnd(4)` does nothing. The header columns are 4/6/8/6/7 chars, so the column-by-column alignment in the rendered table is uneven anyway. Cosmetic. Either drop the padEnd or compute per-column widths.

### IN-04: smokeOneCell silently absorbs first-line-only error reasons

**File:** `brief/bin/lib/smoke-test.cjs:86-87`
**Issue:** `(err.message || 'unknown error').split('\n')[0]` — when the child writes the meaningful error to stderr (Korean OBJECTIVES.md-missing message, for example), `err.message` shows only "Command failed: …". The actual stderr is on `err.stderr`. As written, the FAIL/SKIP Detail section in SMOKE-TEST.md tells the reader nothing useful — every line is "Command failed: /usr/local/bin/node …". Combine `err.stderr` (or the first line of it) into the reason for diagnosability.

```js
const stderrFirst = err && err.stderr ? String(err.stderr).split('\n')[0] : '';
const messageFirst = err && err.message ? String(err.message).split('\n')[0] : 'unknown error';
return { status: 'FAIL', reason: stderrFirst || messageFirst };
```

---

_Reviewed: 2026-04-27_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
