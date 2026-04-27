# Phase 9: Hardening — Cross-Runtime Smoke + Non-Developer Pilot - Pattern Map

**Mapped:** 2026-04-27
**Files analyzed:** 9 NEW files + 7 MODIFIED files + 11 NEW Wave 0 test fixtures (27 total)
**Analogs found:** 27 / 27 (100% — Phase 9 is hardening; substrate from Phase 1·8 is fully present, every new file copies a Phase 1·5·7·8 analog)

Phase 9 introduces **zero new architectural primitives**. Every "do X" reduces to "use existing primitive Y from Phase 1/5/7/8" (per RESEARCH.md §"Don't Hand-Roll" line 458). All new code is `.cjs` zero-runtime-deps; all new docs are markdown.

---

## File Classification

### NEW user-facing slash command (NET +0 — `/brief-help` already exists, REWRITTEN; NET command count change is pruning-driven via HRD-02, not addition)

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `commands/brief/help.md` | route (slash command) — REWRITTEN (currently a thin pass-through to `brief/workflows/help.md`) | request-response | `commands/brief/status.md` (small command — invokes `brief-tools.cjs <case>`, no AskUserQuestion, read-only) | exact |

### NEW lib files (CommonJS — `.cjs`, zero runtime deps)

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `brief/bin/lib/help.cjs` | service (catalog + Levenshtein + render) | transform (frontmatter scan → categorized markdown render) | `brief/bin/lib/voice-fit.cjs` (Phase 8 — small zero-dep regex/text utility lib, < 200 LOC, single-file `module.exports = { ... }`) + `brief/bin/lib/leakage-diff.cjs` (Phase 8 — uses `extractFrontmatter` + algorithmic core) | exact-composite |
| `brief/bin/lib/smoke-test.cjs` (or inline in `brief-tools.cjs case 'smoke-test'`) | service (subprocess orchestration + matrix render) | event-driven (4 subprocess fan-out → result aggregation) | `tests/brief-define-atomic-commit.test.cjs:30` `execFileSync` pattern + `brief/bin/lib/voice-fit.cjs` (single-file lib + `module.exports`) | role-match (composition) |

### NEW documentation artifacts (markdown only, no code)

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `.planning/SMOKE-TEST.md` | doc (4×5 PASS/FAIL/SKIP matrix) | static markdown | RESEARCH.md §Smoke Test Stub design (lines 107-114) — NEW format; closest existing doc-with-table is `.planning/phases/01-*/01-VERIFICATION.md` | role-match (table doc) |
| `.planning/SURFACE-AUDIT.md` | doc (12-row commands table + 0-row skills + Removed-in-v1 appendix) | static markdown | RESEARCH.md §SURFACE-AUDIT.md schema (lines 642-681) — NEW; closest existing analog is the `## Removed in v1` appendix shape (no precedent — NEW pattern in Phase 9) | no analog (NEW pattern) |
| `.planning/V1-LAUNCH-GATE.md` | doc (3-prong checklist + status) | static markdown | NEW pattern; conceptually mirrors Phase verifier output; closest existing shape is `.planning/PROJECT.md` "Status" section | no analog (NEW pattern) |
| `.planning/RESIDUAL-FAILS-V1.md` | doc (≤16 deferred fails + v1.1 plan) | static markdown | `.planning/phases/01-foundation-fork-hygiene-removal-rename/01-VERIFICATION.md` HALT-ACCEPTED 63-fail table (referenced in RESEARCH.md §HRD-05 closure inventory) | exact (extends Phase 1 closure-doc pattern) |
| `.planning/pilot/01-{user-id}-friction-journal.md` | doc (frontmatter + Pitfall #9 vocabulary table + appendix) | static markdown | RESEARCH.md §Pitfall 5 friction journal schema (lines 538-549) + `.planning/PITFALLS.md` Pitfall #9 vocabulary | role-match (NEW format anchored on existing vocabulary) |

### NEW Wave 0 test fixtures (11 total — `.test.cjs`, `node:test`)

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `tests/brief-help-categorization.test.cjs` | structural test (4D listing) | filesystem readdir + frontmatter parse | `tests/architecture-counts.test.cjs` (filesystem-driven, no hardcoded counts) | exact |
| `tests/brief-help-partial-match.test.cjs` | unit test (substring/prefix match) | string algorithm | `tests/architecture-counts.test.cjs` (single-file pattern) | role-match |
| `tests/brief-help-levenshtein.test.cjs` | unit test (DP correctness + threshold) | algorithmic | `tests/architecture-counts.test.cjs` (assert.strictEqual) | role-match |
| `tests/brief-smoke-test-stub.test.cjs` | unit test (4×5 matrix builds) | subprocess + assertion | `tests/brief-define-atomic-commit.test.cjs:30` (`execFileSync` cross-process) | exact |
| `tests/brief-smoke-test-text-mode.test.cjs` | unit test (text_mode fallback verify) | subprocess + INSTRUCTION_FILE env | `tests/ask-user-questions-fallback.test.cjs` (TEXT_MODE fallback structural test) | exact |
| `tests/brief-smoke-test-output-format.test.cjs` | structural test (SMOKE-TEST.md schema — 20 cells) | filesystem read + regex assertion | `tests/architecture-counts.test.cjs` | role-match |
| `tests/brief-surface-audit-count.test.cjs` | structural test (12 cmds + 0 skills) | filesystem readdir | `tests/architecture-counts.test.cjs:43-58` `countMdFiles` pattern | exact |
| `tests/brief-surface-audit-install-cleanup.test.cjs` | structural test (no dangling cmd refs in `bin/install.js`) | grep-style content scan | `tests/architecture-counts.test.cjs` (grep + assertion) | role-match |
| `tests/brief-surface-audit-doc.test.cjs` | structural test (SURFACE-AUDIT.md schema) | filesystem read + regex | `tests/architecture-counts.test.cjs` `parseDocCount` regex pattern | exact |
| `tests/brief-pilot-journal-structure.test.cjs` | structural test (frontmatter + Pitfall #9 row) | filesystem read + frontmatter parse | `tests/agent-frontmatter.test.cjs` (frontmatter shape test — assumed pattern; same as architecture-counts.test.cjs `parseDocCount`) | role-match |
| `tests/brief-v1-launch-gate.test.cjs` | structural test (3-prong checklist marked PASS) | filesystem read + regex | `tests/architecture-counts.test.cjs` regex+assert pattern | role-match |

### MODIFIED files (additive extensions or surgical fixes)

| Modified File | Modification Type | Closest Analog Pattern |
|---------------|-------------------|------------------------|
| `bin/install.js` | Cleanup: remove SRC tuples / unlink references / verify-blocks for the 56 deleted commands | Mirror Phase 1 Plan 08 `commands/gsd/` legacy-cleanup pattern (lines 4632, 4696) — bin/install.js already has `// Remove old gsd-*.md files before copying new ones` removal loop at line 3576-3581; the new 56 deletions extend the same pattern |
| `brief/bin/brief-tools.cjs` | Add `case 'help'` and `case 'smoke-test'` dispatchers | Mirror `case 'voice-fit'` pattern (lines 864-907) — try/catch + `core.error(err.message)` + `core.output(result, raw, ...)` byte-identity from `case 'audience'` (Phase 5) |
| `commands/brief/*.md` | DELETE 56 of 68 | No analog — physical `rm` (per A-D02). Backup branch `backup/original-gsd` is the rollback path |
| `tests/architecture-counts.test.cjs` | (none — this test is filesystem-driven; updates auto-track post-pruning) | Existing test is the analog itself |
| `tests/command-count-sync.test.cjs` line 48 | Surgical regex fix `commands\/gsd\/\*\.md` → `commands\/brief\/\*\.md` | Inline regex; one-line fix |
| `docs/ARCHITECTURE.md` | Sync `**Total commands:** 77` (line 116), `**Total workflows:** 74` (line 127), `**Total agents:** 31` (line 137) to disk counts post-pruning | Existing doc shape; numbers replaced |
| `CLAUDE.md` | Update "Surface Caps" section with v1 final count + reference to SURFACE-AUDIT.md | Existing "Surface Caps" section (text edit, no schema change) |
| 19 missing-file tests (HRD-05a per-test triage) | Per-test: create file (3 candidate workflows: `brief/workflows/pr-branch.md`, `brief/workflows/diagnose-issues.md`, `brief/references/ui-brand.md`) OR delete assertion | Per-test rationale — see Pattern Assignments §HRD-05(a) below |

---

## Pattern Assignments

### `commands/brief/help.md` (route, request-response — REWRITE)

**Analog:** `commands/brief/status.md`

**Existing file state** (current `commands/brief/help.md` lines 1-24):

```markdown
---
name: gsd:help                                            # ← DRIFT: must be brief:help post-Phase-9
description: Show available BRIEF commands and usage guide
allowed-tools:
  - Read
---
<objective>
Display the complete BRIEF command reference.
</objective>

<execution_context>
@~/.claude/brief/workflows/help.md
</execution_context>

<process>
Output the complete BRIEF command reference from @~/.claude/brief/workflows/help.md.
</process>
```

**Frontmatter pattern to copy** (from `commands/brief/status.md` lines 1-8 — small command, read-only, dispatcher-shaped):

```markdown
---
name: brief:help                                          # ← FIX gsd: → brief:
description: Categorized BRIEF command reference (4D phase grouping) with Levenshtein typo correction. Run with no argument for full listing; with `<topic>` for partial-keyword match; unmatched input returns top-3 Levenshtein suggestions (distance ≤ 3). Phase 9 HRD-03.
argument-hint: "[<topic>]"
allowed-tools:
  - Read
  - Bash
---
```

**Body pattern** (mirror `status.md` lines 9-22 — `<objective>` + `<execution_context>` + `<process>` triple):

```markdown
<objective>
Render the BRIEF command reference categorized by 4D phase (DEFINE / DISCOVER / DESIGN / DELIVER + HELPERS).
- No arg: full listing.
- `<topic>` matched as substring/prefix on slug + description; on match, render the matching commands plus the body of the matched command's `.md` file.
- No match: top-3 Levenshtein suggestions with distance ≤ 3.
</objective>

<execution_context>
@~/.claude/brief/workflows/help.md   ← Note: workflow file may also need rewrite (Plan task — see Open Question 5)
</execution_context>

<process>
Execute `brief-tools.cjs help [<topic>]` and print stdout verbatim. Read-only — no writes.
</process>
```

---

### `brief/bin/lib/help.cjs` (service, transform — catalog + Levenshtein + render)

**Analog A (lib structure):** `brief/bin/lib/voice-fit.cjs`

**Imports pattern** (voice-fit.cjs lines 1-21 — copy header comment shape, swap purpose; `help.cjs` is also a small single-file lib with `module.exports = {...}` at the end):

```javascript
/**
 * Help — categorized command listing + partial-keyword match + inline
 * Levenshtein typo correction for /brief-help (Phase 9 Plan HRD-03).
 *
 * Distribution: standalone lib invoked from brief-tools.cjs `case 'help'`
 * dispatcher. Reads commands/brief/*.md frontmatter via the shared
 * frontmatter.cjs::extractFrontmatter helper. Builds an in-memory catalog
 * cached at module level (recomputed on next process — survives manual
 * commands/brief/ edits without an install step per RESEARCH.md
 * Discretion-3).
 *
 * Zero runtime deps (A1). No npm packages. Inline ~30-LOC two-row DP
 * Levenshtein per RESEARCH.md Pattern 2 (lines 333-378).
 *
 * Refs: 09-RESEARCH.md §Pattern 3 (lines 380-434), 09-PATTERNS.md help.cjs.
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { extractFrontmatter } = require('./frontmatter.cjs');
```

**Analog B (algorithmic core):** RESEARCH.md §Pattern 2 (lines 340-378) — **inline 30-LOC two-row DP Levenshtein** (verbatim from canonical Wikipedia pseudocode).

**Core algorithm — Levenshtein distance** (RESEARCH.md lines 344-378, copy verbatim into help.cjs):

```javascript
function levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  // Ensure a is the shorter — minimizes inner-loop allocations
  if (a.length > b.length) { const t = a; a = b; b = t; }

  let prev = new Array(a.length + 1);
  let curr = new Array(a.length + 1);
  for (let i = 0; i <= a.length; i++) prev[i] = i;

  for (let j = 1; j <= b.length; j++) {
    curr[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        prev[i] + 1,        // deletion
        curr[i - 1] + 1,    // insertion
        prev[i - 1] + cost  // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[a.length];
}

function suggestTopK(input, candidates, k = 3, maxDistance = 3) {
  return candidates
    .map(c => ({ name: c, distance: levenshtein(input, c) }))
    .filter(r => r.distance <= maxDistance)
    .sort((x, y) => x.distance - y.distance)
    .slice(0, k);
}
```

**Catalog scan pattern** (RESEARCH.md §Pattern 3 lines 386-419 — copy verbatim, observe the module-level `_catalogCache` cache):

```javascript
const PHASE_CATEGORIES = {
  define: 'DEFINE', discover: 'DISCOVER', design: 'DESIGN',
  deliver: 'DELIVER', export: 'DELIVER', 'add-workstream': 'DESIGN',
  status: 'HELPERS', help: 'HELPERS', 'init': 'HELPERS',
  'progress': 'HELPERS', 'undo': 'HELPERS', 'pause-work': 'HELPERS',
};

let _catalogCache = null;

function buildCatalog(commandsDir) {
  if (_catalogCache) return _catalogCache;
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  const entries = files.map(f => {
    const slug = f.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(commandsDir, f), 'utf-8');
    const fm = extractFrontmatter(content) || {};
    return {
      slug,
      name: fm.name || `brief:${slug}`,
      description: fm.description || '',
      category: PHASE_CATEGORIES[slug] || 'HELPERS',
      body: content.replace(/^---[\s\S]*?---\n/, ''),
    };
  });
  _catalogCache = entries;
  return entries;
}
```

**Module export pattern** (mirror voice-fit.cjs lines 141-147):

```javascript
module.exports = {
  buildCatalog,
  renderCategorized,
  renderTopicMatch,
  renderTypoSuggestions,
  levenshtein,
  suggestTopK,
  PHASE_CATEGORIES,
};
```

**Frontmatter helper to import** (verified usable per RESEARCH.md "Don't Hand-Roll" line 451):

```javascript
const { extractFrontmatter } = require('./frontmatter.cjs');
// extractFrontmatter(content) → object with name, description, etc.
// Already used by status.cjs, state.cjs, commands.cjs, align-report.cjs, leakage-diff.cjs
```

---

### `brief/bin/lib/smoke-test.cjs` (service, event-driven — subprocess matrix orchestration)

**Analog A (lib structure):** `brief/bin/lib/voice-fit.cjs` (small zero-dep single-file lib with module.exports)

**Analog B (subprocess pattern):** `tests/brief-define-atomic-commit.test.cjs:30-43`

**Imports** (combine analog A header comment shape + node:child_process from analog B):

```javascript
/**
 * Smoke-Test — cross-runtime stub-driven smoke verification (Phase 9
 * Plan HRD-01). Spawns 4 mock subprocesses (claude/codex/gemini/opencode)
 * with INSTRUCTION_FILE env preset per runtime + text_mode flag flip;
 * captures stdout per (runtime, command) cell; emits 4×5 PASS/FAIL/SKIP
 * matrix to .planning/SMOKE-TEST.md per B-D04 schema.
 *
 * Stub-driven by design (B-D01) — NEVER invokes real Codex/Gemini/OpenCode
 * CLIs (user-environment-dependent + API-cost-bearing). v1.1 may add
 * --live opt-in.
 *
 * Zero runtime deps (A1). Uses built-in node:child_process.spawn / execFileSync.
 *
 * Refs: 09-RESEARCH.md §Pattern 1 (lines 288-331).
 */

'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
```

**Subprocess pattern** (verbatim from `tests/brief-define-atomic-commit.test.cjs:30-43`, adapted per RESEARCH.md §Pattern 1 lines 311-326):

```javascript
const RUNTIMES = [
  { name: 'claude',   env: {                                   text_mode_default: false } },
  { name: 'codex',    env: { INSTRUCTION_FILE: 'AGENTS.md',    text_mode_default: true  } },
  { name: 'gemini',   env: {                                   text_mode_default: true  } },
  { name: 'opencode', env: {                                   text_mode_default: true  } },
];
const COMMANDS = ['init', 'define', 'discover', 'design', 'deliver'];

function smokeOneCell(runtime, cmd, briefRoot) {
  const env = { ...process.env, ...runtime.env, BRIEF_RUNTIME_MOCK: runtime.name };
  try {
    const out = execFileSync(
      process.execPath,
      [path.join(briefRoot, 'brief/bin/brief-tools.cjs'), cmd, '--smoke', '--text'],
      { env, encoding: 'utf-8', timeout: 5000 }   // Pitfall 4 mitigation: 5s cell budget
    );
    if (out.includes('AskUserQuestion') && runtime.env.text_mode_default) {
      return { status: 'FAIL', reason: 'AskUserQuestion present despite text_mode' };
    }
    return { status: 'PASS', reason: '' };
  } catch (err) {
    return { status: 'FAIL', reason: err.message.split('\n')[0] };
  }
}
```

**Pitfall mitigation discipline** (RESEARCH.md §Pitfall 4 lines 525-536):
- Mock subprocess MUST set BOTH `INSTRUCTION_FILE` env AND pass `--text` CLI flag (belt + suspenders).
- `execFileSync` with `timeout: 5000` (5s) — any cell taking > 5s auto-marked FAIL with "timeout 5s" reason.
- Each cell records both stdout AND exit code.

**Module export shape** (mirror voice-fit.cjs):

```javascript
module.exports = {
  RUNTIMES,
  COMMANDS,
  smokeOneCell,
  buildMatrix,           // composes smokeOneCell over RUNTIMES × COMMANDS
  renderMatrixMarkdown,  // produces SMOKE-TEST.md body per B-D04 schema
};
```

---

### `brief/bin/brief-tools.cjs` `case 'help'` dispatcher (HRD-03)

**Analog (byte-identity discipline — Phase 8 lib split pattern):** `case 'voice-fit'` lines 864-907

**Excerpt to copy** (lines 864-907 verbatim, with renames `voice-fit`→`help`, `voiceFit`→`help`, `vf`→`hp`):

```javascript
case 'help': {
  // Plan HRD-03 — HELP dispatcher. Mirrors `case 'voice-fit'`
  // (lines 864-907) byte-identity pattern: try/catch + core.error
  // + core.output. Spawned by commands/brief/help.md.
  //
  // Subcommands (single-arg form):
  //   help                   → renderCategorized(buildCatalog())
  //   help <topic>           → if substring match: renderTopicMatch
  //                            else: renderTypoSuggestions(suggestTopK(<topic>, slugs, 3, 3))
  const help = require('./lib/help.cjs');
  const subarg = args[1];
  const COMMANDS_DIR = path.join(__dirname, '..', '..', 'commands', 'brief');
  try {
    const catalog = help.buildCatalog(COMMANDS_DIR);
    if (!subarg) {
      core.output({ catalog }, raw, help.renderCategorized(catalog));
      break;
    }
    // partial keyword match (C-D02)
    const matches = catalog.filter(e =>
      e.slug.toLowerCase().includes(subarg.toLowerCase()) ||
      e.description.toLowerCase().includes(subarg.toLowerCase())
    );
    if (matches.length > 0) {
      core.output({ matches }, raw, help.renderTopicMatch(matches));
      break;
    }
    // typo correction via Levenshtein (C-D03)
    const slugs = catalog.map(e => e.slug);
    const suggestions = help.suggestTopK(subarg, slugs, 3, 3);
    core.output({ suggestions }, raw, help.renderTypoSuggestions(subarg, suggestions));
  } catch (err) {
    core.error(err.message);
  }
  break;
}
```

**Critical:** lines 320-326 dispatcher byte-identity — `try/catch` + `core.output` (raw → markdown) + `core.error(err.message)`. No absolute-path stack leakage.

---

### `brief/bin/brief-tools.cjs` `case 'smoke-test'` dispatcher (HRD-01)

**Analog:** Same as `case 'help'` above — `case 'voice-fit'` byte-identity (lines 864-907).

**Excerpt to copy:**

```javascript
case 'smoke-test': {
  // Plan HRD-01 — SMOKE-TEST dispatcher. Mirrors `case 'voice-fit'`
  // (lines 864-907) byte-identity pattern. Stub-driven (B-D01) —
  // never invokes real Codex/Gemini/OpenCode CLIs.
  //
  // Subcommands:
  //   smoke-test run [--out <path>]
  //     → buildMatrix() over RUNTIMES × COMMANDS, renders to SMOKE-TEST.md
  const smoke = require('./lib/smoke-test.cjs');
  const stSubcommand = args[1];
  const stOutIdx = args.indexOf('--out');
  const stOutPath = stOutIdx !== -1
    ? args[stOutIdx + 1]
    : path.join(core.planningPaths(cwd).planning, 'SMOKE-TEST.md');
  try {
    if (stSubcommand === 'run') {
      const matrix = smoke.buildMatrix(cwd);
      const md = smoke.renderMatrixMarkdown(matrix);
      core.atomicWriteFileSync(stOutPath, md);
      core.output({ matrix, outPath: stOutPath }, raw, `SMOKE-TEST.md written: ${stOutPath}`);
      break;
    }
    core.error(`smoke-test: unknown subcommand '${stSubcommand}'. Valid: run`);
  } catch (err) {
    core.error(err.message);
  }
  break;
}
```

---

### `tests/brief-help-categorization.test.cjs` (structural test)

**Analog:** `tests/architecture-counts.test.cjs` (filesystem-driven, no hardcoded counts)

**Excerpt to copy** (architecture-counts.test.cjs lines 14-58 verbatim shape):

```javascript
'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMMANDS_DIR = path.join(ROOT, 'commands', 'brief');
const help = require(path.join(ROOT, 'brief', 'bin', 'lib', 'help.cjs'));

describe('/brief-help 4D categorization (HRD-03 / C-D01)', () => {
  test('renderCategorized emits 5 phase headers (DEFINE/DISCOVER/DESIGN/DELIVER/HELPERS)', () => {
    const catalog = help.buildCatalog(COMMANDS_DIR);
    const output = help.renderCategorized(catalog);
    for (const cat of ['DEFINE', 'DISCOVER', 'DESIGN', 'DELIVER', 'HELPERS']) {
      assert.match(output, new RegExp(`^##\\s+${cat}`, 'm'),
        `category header missing: ${cat}`);
    }
  });

  test('every command in commands/brief/*.md appears in renderCategorized output', () => {
    const catalog = help.buildCatalog(COMMANDS_DIR);
    const output = help.renderCategorized(catalog);
    for (const e of catalog) {
      assert.ok(output.includes(`/brief-${e.slug}`),
        `command missing from listing: brief-${e.slug}`);
    }
  });
});
```

---

### `tests/brief-help-levenshtein.test.cjs` (unit test — DP correctness + threshold)

**Analog:** Same architecture-counts.test.cjs shape (filesystem-driven; here, `node:assert/strict` with hardcoded fixture pairs)

**Pattern:**

```javascript
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const help = require('../brief/bin/lib/help.cjs');

describe('Levenshtein top-3 typo suggestion (HRD-03 / C-D03)', () => {
  test('exact match → distance 0', () => {
    assert.strictEqual(help.levenshtein('define', 'define'), 0);
  });

  test('one-edit → distance 1', () => {
    assert.strictEqual(help.levenshtein('define', 'defin'), 1);
    assert.strictEqual(help.levenshtein('define', 'desine'), 1);
  });

  test('define ↔ design known collision (Pitfall 3)', () => {
    assert.strictEqual(help.levenshtein('define', 'design'), 2);
  });

  test('suggestTopK returns ≤3 results below distance threshold', () => {
    const candidates = ['define', 'discover', 'design', 'deliver', 'export',
      'add-workstream', 'status', 'help', 'init', 'progress', 'undo', 'pause-work'];
    const out = help.suggestTopK('defone', candidates, 3, 3);
    assert.ok(out.length <= 3);
    assert.ok(out[0].name === 'define' || out[0].name === 'design',
      'closest suggestion should be define or design');
  });

  test('input with no candidate within distance ≤3 returns empty', () => {
    const out = help.suggestTopK('xyz123', ['define'], 3, 3);
    assert.deepStrictEqual(out, []);
  });
});
```

---

### `tests/brief-smoke-test-stub.test.cjs` (subprocess test)

**Analog:** `tests/brief-define-atomic-commit.test.cjs:30-43`

**Excerpt to copy** (the `execFileSync('git', ...)` shape — adapt to spawn brief-tools.cjs with mocked env):

```javascript
'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('path');

const BRIEF_ROOT = path.join(__dirname, '..');
const smoke = require(path.join(BRIEF_ROOT, 'brief/bin/lib/smoke-test.cjs'));

describe('Cross-runtime smoke matrix (HRD-01 / B-D01..B-D04)', () => {
  test('buildMatrix produces 4 runtimes × 5 commands = 20 cells', () => {
    const matrix = smoke.buildMatrix(BRIEF_ROOT);
    assert.strictEqual(matrix.length, 4, '4 runtime rows');
    for (const row of matrix) {
      assert.strictEqual(row.length, 5, '5 command cells per row');
    }
  });

  test('each cell has shape {status, reason}', () => {
    const matrix = smoke.buildMatrix(BRIEF_ROOT);
    for (const row of matrix) {
      for (const cell of row) {
        assert.ok(['PASS', 'FAIL', 'SKIP'].includes(cell.status),
          'cell.status is enum');
        assert.strictEqual(typeof cell.reason, 'string', 'cell.reason is string');
      }
    }
  });
});
```

---

### `tests/brief-smoke-test-text-mode.test.cjs` (text_mode fallback verify)

**Analog:** `tests/ask-user-questions-fallback.test.cjs` (TEXT_MODE structural test pattern)

**Excerpt to copy** (`hasTextModeFallback` function shape — lines 34-44):

```javascript
'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const smoke = require('../brief/bin/lib/smoke-test.cjs');

function captureOutputContains(stdout, needle) {
  const lower = stdout.toLowerCase();
  return lower.includes(needle.toLowerCase());
}

describe('text_mode fallback per runtime (HRD-01 / B-D03)', () => {
  test('non-Claude runtime cell with INSTRUCTION_FILE env emits no AskUserQuestion', () => {
    const codex = smoke.RUNTIMES.find(r => r.name === 'codex');
    const cell = smoke.smokeOneCell(codex, 'init', __dirname + '/..');
    // FAIL is acceptable if reason is not text-mode-related; the load-bearing
    // assertion is that text_mode env reaches brief-tools.cjs.
    if (cell.status === 'FAIL') {
      assert.ok(!cell.reason.includes('text_mode'),
        'FAIL must not be due to text_mode plumbing breakage');
    }
  });

  test('claude runtime cell does NOT auto-set text_mode (default false)', () => {
    const claude = smoke.RUNTIMES.find(r => r.name === 'claude');
    assert.strictEqual(claude.env.text_mode_default, false);
  });
});
```

---

### `tests/brief-surface-audit-count.test.cjs` (structural test — 12 cmds + 0 skills)

**Analog:** `tests/architecture-counts.test.cjs:43-58` `countMdFiles` function (filesystem readdir, < 100ms)

**Excerpt to copy verbatim:**

```javascript
'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMMANDS_DIR = path.join(ROOT, 'commands', 'brief');
const SKILLS_DIR_LOCAL = path.join(ROOT, '.claude', 'skills');

const LOCKED_12 = ['define', 'discover', 'design', 'add-workstream',
  'deliver', 'export', 'status', 'help',
  'init', 'progress', 'undo', 'pause-work'];

function countMdFiles(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).length;
}

describe('Surface cap audit (HRD-02 / A-D01..A-D03)', () => {
  test('commands/brief/*.md count ≤ 12 (cap) AND == 12 (locked)', () => {
    const actual = countMdFiles(COMMANDS_DIR);
    assert.ok(actual <= 12, `cap violated: ${actual} > 12`);
    assert.strictEqual(actual, 12, `locked-12 lineup mismatch: ${actual} files`);
  });

  test('all 12 locked slugs exist as files', () => {
    const present = fs.readdirSync(COMMANDS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace(/\.md$/, ''));
    for (const slug of LOCKED_12) {
      assert.ok(present.includes(slug),
        `locked slug missing: commands/brief/${slug}.md`);
    }
  });

  test('.claude/skills/ is empty (0/8 cap)', () => {
    if (!fs.existsSync(SKILLS_DIR_LOCAL)) return; // 0 by absence is acceptable
    const skills = fs.readdirSync(SKILLS_DIR_LOCAL)
      .filter(d => fs.statSync(path.join(SKILLS_DIR_LOCAL, d)).isDirectory());
    assert.strictEqual(skills.length, 0,
      `skills cap violated: ${skills.length} skills present`);
  });
});
```

**Note:** `LOCKED_12` slug list anchors A-D01 in CI. Open Question 1 (`init` vs `new-project`) MUST be resolved BEFORE this test runs — see HRD-05(a) below.

---

### `tests/brief-surface-audit-install-cleanup.test.cjs` (no dangling refs in `bin/install.js`)

**Analog:** `tests/architecture-counts.test.cjs` (filesystem read + assert pattern); + RESEARCH.md §Pitfall 1 lines 478-489

**Excerpt to copy:**

```javascript
'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INSTALL_JS = path.join(ROOT, 'bin', 'install.js');
const COMMANDS_DIR = path.join(ROOT, 'commands', 'brief');

const DELETED_56 = [
  'add-backlog', 'add-phase', 'add-todo', 'analyze-dependencies', 'audit-fix',
  'audit-milestone', 'audit-uat', 'autonomous', 'check-todos', 'cleanup',
  'complete-milestone', 'discuss-phase', 'do', 'docs-update', 'execute-phase',
  'explore', 'extract_learnings', 'fast', 'from-gsd2', 'health', 'import',
  'insert-phase', 'intel', 'join-discord', 'list-phase-assumptions',
  'list-workspaces', 'manager', 'map-codebase', 'milestone-summary',
  'new-milestone', 'new-workspace', 'next', 'note', 'plan-milestone-gaps',
  'plan-phase', 'plant-seed', 'profile-user', 'quick', 'reapply-patches',
  'remove-phase', 'remove-workspace', 'research-phase', 'resume-work', 'review',
  'review-backlog', 'scan', 'session-report', 'set-profile', 'settings',
  'spec-phase', 'stats', 'thread', 'update', 'validate-phase', 'verify-work',
  'workstreams',
];
// (count verified: 56 — confirm with `ls commands/brief/*.md | wc -l` post-pruning)

describe('bin/install.js cleanliness post-HRD-02 pruning', () => {
  const installContent = fs.readFileSync(INSTALL_JS, 'utf-8');

  for (const slug of DELETED_56) {
    test(`bin/install.js has zero references to deleted command "${slug}"`, () => {
      // Match: 'slug.md', "slug.md", or `/slug.md` (path component)
      const re = new RegExp(`['"\\/]${slug.replace(/-/g, '\\-')}\\.md['"\\)]`);
      const found = re.test(installContent);
      assert.ok(!found, `bin/install.js still references commands/brief/${slug}.md`);
    });
  }
});
```

---

### `.planning/SURFACE-AUDIT.md` (HRD-02 audit doc)

**Analog:** No precedent — NEW format. Use RESEARCH.md §SURFACE-AUDIT.md schema (lines 642-681) verbatim as the template.

**Schema to copy verbatim** (lines 642-681 already gives the markdown template — Plan executor pastes it and fills the 12 rows + 56 deleted commands appendix):

```markdown
# BRIEF Surface Audit — v1 Launch

**Audited:** 2026-04-27
**Cap source:** CLAUDE.md "Surface Caps" section (Phase 2 D-09)
**Status:** PASS — 12 commands ≤ 12 cap; 0 skills ≤ 8 cap

## User-Facing Commands (12 / 12 cap)

| # | Command | Category | Phase introduced | One-line rationale |
|---|---------|----------|------------------|---------------------|
| 1 | `/brief-define`         | DEFINE   | Phase 3 | Conversational intent extraction (DEF-01) |
| 2 | `/brief-discover`       | DISCOVER | Phase 5 | Parallel research with provenance (DSC-01) |
| 3 | `/brief-design`         | DESIGN   | Phase 7 | 9-workstream orchestration (DSG-10) |
| 4 | `/brief-add-workstream` | DESIGN   | Phase 7 | Dynamic workstream addition (DSG-10) |
| 5 | `/brief-deliver`        | DELIVER  | Phase 8 | Type A + Type B artifact synthesis |
| 6 | `/brief-export`         | DELIVER  | Phase 8 | Mandatory Type B audience-confirm gate |
| 7 | `/brief-status`         | HELPERS  | Phase 2 | Compact dashboard render |
| 8 | `/brief-help`           | HELPERS  | Phase 9 | 4D listing + Levenshtein |
| 9 | `/brief-init`           | HELPERS  | Phase 1 | Project initialization |
| 10 | `/brief-progress`       | HELPERS  | Phase 1 | Progress reporting |
| 11 | `/brief-undo`           | HELPERS  | Phase 1 | Undo last orchestrator action |
| 12 | `/brief-pause-work`     | HELPERS  | Phase 1 | Pause + restore state |

## Skills (0 / 8 cap)

`.claude/skills/` is empty in v1. The 8-skill cap is reservation, not allocation
(per A-D03). v1.x adds skills as evidence-driven.

## Removed in v1 (56 commands deleted)

> All deleted commands preserved on `backup/original-gsd` branch.
> Recovery: `git checkout backup/original-gsd -- commands/brief/{name}.md`

[Per-command list grouped by phase-introduced — see RESEARCH.md Discretion-4]
```

---

### `.planning/SMOKE-TEST.md` (HRD-01 4×5 matrix)

**Analog:** RESEARCH.md §Smoke Test Stub design lines 107-114 — 4-row × 5-col table.

**Schema to copy:**

```markdown
# BRIEF Cross-Runtime Smoke Test — v1 Launch

**Run:** 2026-04-27
**Approach:** Stub-driven (B-D01). NEVER invokes real Codex/Gemini/OpenCode CLIs.
**Result format:** PASS / FAIL / SKIP per cell + one-line reason.

| Runtime    | init | define | discover | design | deliver |
|------------|------|--------|----------|--------|---------|
| Claude     | PASS | PASS   | PASS     | PASS   | PASS    |
| Codex      | PASS | PASS   | PASS     | PASS   | SKIP*   |
| Gemini     | PASS | PASS   | PASS     | PASS   | SKIP*   |
| OpenCode   | PASS | PASS   | PASS     | PASS   | SKIP*   |

`* SKIP reason: deliver requires Marp env (Chrome/LibreOffice) which is OS-dependent — separate manual verification.`

## FAIL/SKIP Detail

(One row per non-PASS cell with reason; empty if all PASS.)
```

---

### `.planning/V1-LAUNCH-GATE.md` (3-prong checklist — D-D04)

**Analog:** No precedent. Single-page (≤80 lines per RESEARCH.md Discretion-8).

**Schema to copy:**

```markdown
# BRIEF v1 Launch Gate

**Gate evaluated:** 2026-04-27
**Verdict:** PASS / HOLD / FAIL

## Three-Prong Checklist (D-D04)

| Prong | Criterion | Evidence | Status |
|-------|-----------|----------|--------|
| (i)   | 0 blocking pilot findings | `.planning/pilot/01-{user-id}-friction-journal.md` shows 0 severity=blocker rows | PASS / HOLD |
| (ii)  | Smoke test PASS on all 4 runtimes × 5 commands (or documented SKIP) | `.planning/SMOKE-TEST.md` 20-cell matrix | PASS / HOLD |
| (iii) | Surface cap compliance (12 cmds + 0 skills) | `.planning/SURFACE-AUDIT.md` + `tests/brief-surface-audit-count.test.cjs` GREEN | PASS / HOLD |

## Notes

- HRD-04 partial 1/3 is NOT a launch blocker (D-D01 explicit Out of Scope; v1.1 beta program completes 2/3).
- HRD-05 (a)+(b) closure target ≤16 npm test fails (EMPIRICAL_BASELINE 6 + DELTA_CAP 10).
- Upgrading from earlier brief-cc: re-run `npx brief-cc@latest` to refresh installed commands; stale `.claude/commands/brief/{deleted}.md` files in user config dirs may be left behind by automatic cleanup discipline (Pitfall 1 mitigation; documented).
```

---

### `.planning/RESIDUAL-FAILS-V1.md` (HRD-05 deferred ≤16 fails — D-D02)

**Analog:** Phase 1 `01-VERIFICATION.md` HALT-ACCEPTED 63-fail enumeration (referenced in RESEARCH.md §HRD-05 closure inventory)

**Schema:**

```markdown
# Residual Test Failures — v1 Carry-Forward

**Recorded:** 2026-04-27
**Phase 1 HALT-ACCEPTED baseline:** 63 fails
**Phase 9 HRD-05 (a)+(b) closure:** 47 fails closed
**v1 ship count:** ≤16 fails (EMPIRICAL_BASELINE 6 + DELTA_CAP 10)

## (c) 30 source-behavior drift — DEFERRED to v1.1

| # | Test | Drift | Remediation Plan |
|---|------|-------|------------------|
| 1 | hooks/brief-check-update-worker.js MANAGED_HOOKS array | gsd-* names not renamed | v1.1 byte-replace per Phase 1 D-08 pattern |
| ... | ... | ... | ... |

## (d) 13 source-content drift — DEFERRED to v1.1

| # | Test | Drift | Remediation Plan |
|---|------|-------|------------------|
| 1 | agents/brief-*.md required_reading | (per CONTEXT) | v1.1 |
| ... | ... | ... | ... |

## v1.1 Estimated Effort

~4-6h source diff (per CONTEXT D-D02). HRD-05 (c)+(d) is launch-non-blocking.
```

---

### `.planning/pilot/01-{user-id}-friction-journal.md` (HRD-04 partial 1/3 — D-D03)

**Analog:** No precedent in BRIEF; vocabulary anchored on `.planning/PITFALLS.md` Pitfall #9 (per RESEARCH.md §Pitfall 5 lines 538-549).

**Schema to copy from RESEARCH.md lines 124-139:**

```markdown
---
pilot_id: 01
user_role: korean-non-technical-product-owner
logged: 2026-04-27
audience:
  confidentiality: internal       # Per Open Question 3 — minimal frontmatter; no AUDIENCE/COMPLIANCE pass needed
voice:
  languages: ['ko', 'en']
---

# Friction Items — BRIEF dogfooding session (1 of 3 pilots)

## Pitfall #9 — Non-developer barriers

| Friction Item | Severity | Frequency | Phase Citation | Mitigation |
|---------------|----------|-----------|----------------|------------|
| smart_discuss table clutter | medium | 4/4 phases | Phase 5 / 7 / 8 | batch-table-with-recommended-defaults (working) |
| agent quota fatigue | high | once | Phase 8 Plan 06 | single-worktree-isolated-agent (proposed) |
| cwd bug exposure | high | 3 agents | Phase 8 Wave 1 | critical_cwd_warning block (active) |
| AskUserQuestion fallback gaps | medium | (TBD) | (TBD) | text_mode flag verified in Phase 9 HRD-01 |
| ... | ... | ... | ... | ... |

## Appendix (free-form)

(Optional narrative observations — Pitfall 5 mitigation: structured table is load-bearing,
free-form goes here so journal stays auditable.)
```

**Pitfall 5 discipline (RESEARCH.md lines 538-549):**
- Each row MUST cite a phase where friction occurred (forces concrete provenance).
- severity=high MUST be triaged (fixed in Phase 9 OR explicit v1.1 with rationale).
- 0 severity=high items = SUSPICIOUS — pilot 8 months in always finds at least one.

---

### HRD-05(a) per-test triage rubric (19 missing-file tests → 3 candidate workflows)

**Analog:** RESEARCH.md §Pitfall 2 lines 491-505 — per-file rubric

**Triage rubric** (Plan executor applies per test):

| Candidate File | Tied to locked-12 cmd? | Action | Rationale |
|----------------|------------------------|--------|-----------|
| `brief/workflows/pr-branch.md` | NO — milestone PR flow inherited from GSD developer surface | DELETE assertion | Not in locked 12-cmd lineup |
| `brief/workflows/diagnose-issues.md` | NO — `gsd-debugger` agent intentionally absent post-Phase-1 (FND-02 dev-surface removal) | DELETE assertion | Permanently gone in v1 |
| `brief/references/ui-brand.md` | NO — `gsd-ui-researcher`/`gsd-ui-checker` agents intentionally absent post-Phase-1 | DELETE assertion | Permanently gone in v1 |

**Per-test logging discipline** (RESEARCH.md Open Question 2 recommendation):
- Single audit doc at `.planning/HRD-05-CLOSURE-RATIONALE.md` (mirrors Phase 1 closure-doc patterns).
- Commit messages stay terse; rationale lives in the audit doc.

**Recommended action: ALL 3 candidate files → DELETE assertions** because none tie to the locked 12-cmd lineup. The "create file with placeholder content" branch should NOT be taken without an explicit rationale (Pitfall 2 trap).

---

### `tests/command-count-sync.test.cjs` line 48 fix (HRD-05b)

**Analog:** Inline regex; one-line fix.

**Current line 48** (verified):

```javascript
const m = content.match(/commands\/gsd\/\*\.md[^\n]*#\s*(\d+)\s+slash commands/);
```

**Replace with:**

```javascript
const m = content.match(/commands\/brief\/\*\.md[^\n]*#\s*(\d+)\s+slash commands/);
```

---

### `docs/ARCHITECTURE.md` lines 116/127/137 (HRD-05b)

**Analog:** Existing structure — 3 lines hardcoding totals; replace with disk counts post-pruning.

**Current state (verified):**
- Line 116: `**Total commands:** 77`
- Line 127: `**Total workflows:** 74`
- Line 137: `**Total agents:** 31`

**Action:** After HRD-02 deletion lands, run:

```bash
echo "commands: $(ls commands/brief/*.md | wc -l)"
echo "workflows: $(ls brief/workflows/*.md | wc -l)"
echo "agents: $(ls agents/*.md | wc -l)"
```

Paste 3 numbers into ARCHITECTURE.md (single-commit atomic update). Verify by `node --test tests/architecture-counts.test.cjs` GREEN.

---

## Shared Patterns

### A1 zero-runtime-deps invariant (applies to ALL Phase 9 lib code)

**Source:** CLAUDE.md "Tech stack" section + Phase 8 voice-fit.cjs/leakage-diff.cjs/deliver.cjs/export.cjs precedent.

**Apply to:** `brief/bin/lib/help.cjs`, `brief/bin/lib/smoke-test.cjs`.

**Discipline:**
- NO `npm install fast-levenshtein`, `js-levenshtein`, `cross-spawn`, `execa`, `commander`.
- ALL imports must be `node:fs`, `node:path`, `node:child_process`, OR existing `brief/bin/lib/*.cjs`.
- Verify post-merge: `node -e "console.log(Object.keys(require('./package.json').dependencies||{}).length)"` MUST return 0.

```javascript
// Permitted imports (Phase 9):
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync, spawn } = require('node:child_process');
const { extractFrontmatter } = require('./frontmatter.cjs');     // existing
const core = require('./core.cjs');                              // existing (atomicWriteFileSync, planningPaths, output, error)
```

### Dispatcher byte-identity (applies to all `brief-tools.cjs case` additions)

**Source:** `case 'audience'` (lines 558-635) → `case 'voice-fit'` (lines 864-907) — Phase 8 byte-identity discipline.

**Apply to:** `case 'help'`, `case 'smoke-test'`.

**Discipline:**
- `try/catch` wrapping ALL lib calls; `core.error(err.message)` (NOT `console.error`) — no absolute-path stack leakage.
- `core.output(result, raw, fallbackText)` for all stdout — supports `--raw` JSON mode + human-readable fallback.
- Subcommand validation: terminate with `core.error('<case>: unknown subcommand "<sub>". Valid: ...')` for unknown subargs.
- Index-based arg parsing: `args.indexOf('--<flag>')` → `args[idx + 1]` (NOT a CLI parser library).

### Atomic write primitive (applies to all artifact-emitting code)

**Source:** `brief/bin/lib/core.cjs:1554` `atomicWriteFileSync`.

**Apply to:** SMOKE-TEST.md write in smoke-test.cjs; SURFACE-AUDIT.md write (if scripted); RESIDUAL-FAILS-V1.md write (if scripted).

**Discipline:** NEVER `fs.writeFileSync` for `.planning/*.md` artifacts. Use `core.atomicWriteFileSync` to preserve Phase 1 D-09 atomic-commit invariant.

```javascript
const { atomicWriteFileSync } = require('./core.cjs');
atomicWriteFileSync(outPath, markdownString);
```

### Filesystem-driven structural tests (applies to all Wave 0 fixtures)

**Source:** `tests/architecture-counts.test.cjs:14-58` — `COMPONENTS = [{label, dir}, ...]` + `countMdFiles` + `parseDocCount`.

**Apply to:** brief-help-categorization.test.cjs, brief-surface-audit-count.test.cjs, brief-surface-audit-doc.test.cjs, brief-pilot-journal-structure.test.cjs, brief-v1-launch-gate.test.cjs, brief-smoke-test-output-format.test.cjs.

**Discipline:**
- Both sides computed at runtime (filesystem readdir + doc regex extract).
- NO hardcoded counts in test (drift-proof).
- Use `node:test` `describe` + `test` + `node:assert/strict` `assert.strictEqual` / `assert.match`.

### TEXT_MODE fallback discipline (applies to HRD-01 verification)

**Source:** `tests/ask-user-questions-fallback.test.cjs:34-44` `hasTextModeFallback` function.

**Apply to:** brief-smoke-test-text-mode.test.cjs; smoke-test.cjs `smokeOneCell` reason-string assertions.

**Vocabulary check:** content includes "text_mode" or "text mode" AND "plain-text" or "plain text" or "numbered list".

**Why:** AskUserQuestion is Claude-only; non-Claude runtimes render it as a markdown code block and stall. The text_mode flag is the FND-06 invariant — verifying it survives Phase 9 is HRD-01's primary load-bearing assertion.

### Backup-branch preservation (applies to HRD-02 deletions)

**Source:** PROJECT.md Key Decisions — hard fork, `backup/original-gsd` branch.

**Apply to:** all 56 file deletions in `commands/brief/`.

**Discipline:**
- BEFORE deleting, verify `git rev-parse backup/original-gsd` resolves (branch exists).
- Test recovery: `git checkout backup/original-gsd -- commands/brief/<sample>.md` recovers a file (proves backup intact).
- Document in V1-LAUNCH-GATE.md "Upgrading" section that users with stale `.claude/commands/brief/<deleted>.md` files in their config dirs should re-run `npx brief-cc@latest`.

### Vocabulary lock preservation (applies to HRD-04 friction journal)

**Source:** Phase 4 D-09 / Phase 5 D-09 / Phase 7 D-01 — banned vocabulary in artifacts: NO `compliant`, NO `passed`, NO green checkmarks.

**Apply to:** `.planning/pilot/01-{user-id}-friction-journal.md`.

**Discipline:** `voice-fit.cjs::checkBannedWords` regex still applies; if friction journal is committed via the CC-03 hook, words like "robust" or "innovative" trigger the banned-words density check. Use plain factual vocabulary.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `.planning/SURFACE-AUDIT.md` | doc | static | NEW format in Phase 9; closest analog is RESEARCH.md §SURFACE-AUDIT.md schema (lines 642-681) which provides the verbatim template |
| `.planning/V1-LAUNCH-GATE.md` | doc | static | NEW format in Phase 9; conceptually mirrors phase verifier output but is the FIRST cross-phase milestone gate |

Both are markdown-only with simple table schemas. Planner can use the schemas in this PATTERNS.md (referenced from RESEARCH.md) verbatim — no code/test analog needed.

---

## Open Questions Surfaced (referenced from RESEARCH.md)

These are pattern-relevant decisions the planner must resolve:

1. **`/brief-init` file naming** — rename `commands/brief/new-project.md` → `init.md` (Plan 02 atomic decision). Affects `LOCKED_12` slug list in `tests/brief-surface-audit-count.test.cjs` AND `bin/install.js` SRC tuples. **Recommendation: rename file.**

2. **HRD-05(a) per-test rationale location** — single audit doc `.planning/HRD-05-CLOSURE-RATIONALE.md` (mirrors Phase 1 closure-doc pattern) vs inline commit messages. **Recommendation: single audit doc.**

3. **HRD-04 friction journal frontmatter** — minimal (`pilot_id`, `user_role`, `logged`) vs full audience+voice schema. CC-03 hook may flag missing fields. **Recommendation: minimal + `audience.confidentiality: internal` to satisfy hook; full voice/audience schema is overkill for internal pre-launch material.**

4. **smoke-test.cjs vs inline in brief-tools.cjs** — file split (mirrors voice-fit.cjs / leakage-diff.cjs) vs inline in `case 'smoke-test'`. **Recommendation: file split.** Lib boundary makes test fixtures cleaner (`require('../brief/bin/lib/smoke-test.cjs')`).

5. **commands/brief/help.md `<execution_context>`** — does it need a corresponding `brief/workflows/help.md` rewrite, or is the workflow file orphaned post-rewrite? **Recommendation: rewrite the workflow file too OR remove the `@~/.claude/brief/workflows/help.md` reference from help.md and let `<process>` block point directly at the brief-tools dispatcher.** Plan executor decides.

---

## Metadata

**Analog search scope:**
- `commands/brief/` (current 68 files, target 12 post-pruning)
- `brief/bin/lib/` (existing 38 lib modules — voice-fit.cjs / leakage-diff.cjs / deliver.cjs / export.cjs as primary analogs)
- `brief/bin/brief-tools.cjs` (dispatcher cases — `case 'voice-fit'` lines 864-907 as byte-identity reference)
- `tests/` (existing 317+ test files — `architecture-counts.test.cjs`, `ask-user-questions-fallback.test.cjs`, `brief-define-atomic-commit.test.cjs`, `command-count-sync.test.cjs` as primary analogs)
- `.planning/phases/01-*/01-VERIFICATION.md` (HALT-ACCEPTED 63-fail breakdown — referenced)
- `.planning/PITFALLS.md` (Pitfall #9 vocabulary — referenced)
- `docs/ARCHITECTURE.md` (lines 116/127/137 count drift — verified)

**Files scanned:** ~80 source/test/doc files inspected directly; pattern hits verified per RESEARCH.md citations.

**Pattern extraction date:** 2026-04-27.

**Confidence:**
- HIGH — every NEW lib (`help.cjs`, `smoke-test.cjs`) has a Phase 8 byte-identity analog (`voice-fit.cjs` / `leakage-diff.cjs`).
- HIGH — every NEW test fixture has a `tests/architecture-counts.test.cjs` or `tests/ask-user-questions-fallback.test.cjs` shape analog.
- HIGH — `case 'help'` and `case 'smoke-test'` dispatchers copy `case 'voice-fit'` byte-identity (Plan 08-08 Task 3 pattern).
- MEDIUM — `.planning/SURFACE-AUDIT.md` and `.planning/V1-LAUNCH-GATE.md` are NEW formats; schema borrowed from RESEARCH.md but no code/test analog exists.
- LOW — HRD-05(a) per-test triage decisions are judgment calls; rubric in this PATTERNS.md is the planner's primary mitigation.
