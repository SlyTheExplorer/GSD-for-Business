# Phase 2: Stable Seam — Anchor Schema, Caps, Workstream-as-Config — Pattern Map

**Mapped:** 2026-04-19
**Files analyzed:** 15 (10 NEW + 5 MODIFIED + 2 spot-edit targets)
**Analogs found:** 12 / 15 (3 files have NO precedent and must be authored from scratch — see §No Analog Found)

---

## File Classification

### NEW Files

| File | Role | Data Flow | Closest Analog | Match Quality |
|------|------|-----------|----------------|---------------|
| `tests/frontmatter-roundtrip.test.cjs` | test | CRUD (regression) | `tests/frontmatter.test.cjs` | **exact** (same module under test) |
| `tests/state-brief-roundtrip.test.cjs` | test | CRUD (smoke) | `tests/state.test.cjs` (STATE.md frontmatter sync describe block, lines 416-483) | **exact** |
| `tests/workstream-loader-discovery.test.cjs` | test | file-I/O + glob | `tests/frontmatter.test.cjs` (pure-function + fixture) + `tests/state.test.cjs` (createTempProject pattern) | role-match |
| `tests/workstream-loader-validation.test.cjs` | test | file-I/O + glob | same as above | role-match |
| `tests/status-renderer.test.cjs` | test | read-only render | `tests/frontmatter.test.cjs` (describe/test block) + `tests/workstream.test.cjs` (runGsdTools e2e check) | role-match |
| `brief/bin/lib/workstream-loader.cjs` | lib (loader) | file-I/O + parse + validate | `brief/bin/lib/roadmap.cjs` (`cmdRoadmapAnalyze` — reads ROADMAP.md, scans `phases/` dir, returns structured JSON with per-item errors) | **best role+flow match** (do NOT extend `workstream.cjs` per R-2) |
| `brief/bin/lib/status.cjs` | lib (read-only renderer) | composition over read-only APIs | `brief/bin/lib/commands.cjs` `cmdProgressRender` (lines 543-605 — reads phases dir + roadmap + milestone info, formats one of three output modes) | **exact** (stated template per R-4/D-18) |
| `brief/workstreams/_example/spec.yaml` | fixture/config (declarative) | static | **none exists** (this IS the Phase 2 deliverable — D-14); structurally analogous to a PLAN.md frontmatter block | no analog |
| `brief/workstreams/_example/templates/artifact.md` | template (frontmatter skeleton) | static | `agents/*.md` files use the `name: description: allowed-tools:` frontmatter pattern — but the template needs BRIEF audience-guard fields (`audience/confidentiality/voice`) that don't yet exist in any inherited artifact | no direct analog (see D-13 `audience_default` for schema) |
| `commands/brief/status.md` | command (dispatcher stub) | request-response | `commands/brief/progress.md` (8 lines, `name:`-frontmatter + `<execution_context>` + `<process>` block referencing workflow .md) OR `commands/brief/health.md` | **exact** |

### MODIFIED Files

| File | Role | Edit Type | Analog Example | Match Quality |
|------|------|-----------|----------------|---------------|
| `brief/bin/lib/frontmatter.cjs` | lib (parser/serializer) | EXTEND `reconstructFrontmatter` (D-20) | self-analogous — the existing 3-level hand-coded nesting (lines 120-182) is what's being replaced with recursive logic; `splitInlineArray` (lines 14-41) shows the in-module helper style | self (same file) |
| `brief/bin/lib/state.cjs` | lib (state I/O) | rename literal + extend allowlist (D-04, D-21) | line 814 is self-analogous; line 955-984 (cmdStateJson) has 3 existing preservation branches (stopped_at, paused_at, status) that `brief:` should mirror | self (same file) |
| `tests/state.test.cjs` | test | literal string update on 5 assertion lines (D-04) | self-analogous: lines 350, 365, 382, 442, **1725** all reference `gsd_state_version` | self (same file) |
| `.planning/STATE.md` | state artifact | frontmatter migration line 2 + add nested `brief:` map (D-04, D-21) | self-analogous; the frontmatter block at lines 1-15 follows the `reconstructFrontmatter` output shape | self (same file) |
| `brief/bin/brief-tools.cjs` | dispatcher | add `case 'status':` (~line 772) | line 772 (existing `case 'progress':`) is the stated template per R-4 | **exact** |
| `CLAUDE.md` | doc | add new `## Surface Caps` section | existing CLAUDE.md sections `## Technology Stack`, `## Conventions`, `## Architecture`, `## Project Skills` (all flat `##` sections); `## Developer Profile` uses a `> This section is managed by ... do not edit manually` guard | role-match (doc) |
| `.planning/ASSUMPTIONS.md` | doc | append `### A4 —` entry | self-analogous (existing A1..A-P2 entries in ASSUMPTIONS table) | self |

---

## Pattern Assignments

### `tests/frontmatter-roundtrip.test.cjs` (test, CRUD regression)

**Analog:** `/Users/agent/GSD-for-Business/tests/frontmatter.test.cjs`

**Imports pattern** (lines 11-20):
```javascript
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  extractFrontmatter,
  reconstructFrontmatter,
  spliceFrontmatter,
  parseMustHavesBlock,
  FRONTMATTER_SCHEMAS,
} = require('../brief/bin/lib/frontmatter.cjs');
```

**Core pattern — deepStrictEqual round-trip assertion** (lines 39-43):
```javascript
test('parses nested objects', () => {
  const content = '---\ntechstack:\n  added: prisma\n  patterns: repository\n---\n';
  const result = extractFrontmatter(content);
  assert.deepStrictEqual(result.techstack, { added: 'prisma', patterns: 'repository' });
});
```

**Pure-function (no tmpDir) pattern** — this file uses **no** `createTempProject` / `cleanup` because it tests pure parsing. Copy this approach for D-20 regression: build YAML strings inline, call `extractFrontmatter` + `reconstructFrontmatter`, `assert.deepStrictEqual`.

**Adaptation notes:**
- Add fixtures for each D-03 shape: `brief.return_stack: [{from_phase, to_phase, reason, pushed_at}]` (array-of-objects), `brief.last_gate_results.align: {decision, severity, findings_count, at}` (3-level nested leaf object), `brief.current_workstream: null` (null preservation — currently returns string `"null"` per R-1).
- Assert BOTH directions: `extractFrontmatter(yaml)` round-trip AND `reconstructFrontmatter(obj)` output shape.
- Do NOT use `JSON.stringify` for comparison — `deepStrictEqual` catches `null` vs `"null"` drift that `JSON.stringify` flattens (per Pitfall 1).

**Anti-patterns to avoid:**
- Do NOT rely on `assert.ok(fm.brief)` — weak assertion passes even when leaves are corrupted.
- Do NOT skip the 4th-level-nested case; that's where the current `reconstructFrontmatter` fails (R-1 "3 levels of hand-coded nesting" — line 160-165 `String(subsubval)` converts objects to `[object Object]`).

---

### `tests/state-brief-roundtrip.test.cjs` (test, CRUD smoke)

**Analog:** `/Users/agent/GSD-for-Business/tests/state.test.cjs`, describe block `STATE.md frontmatter sync` (lines 416-483)

**Imports pattern** (lines 5-9):
```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');
```

**Setup/teardown pattern** (lines 416-425):
```javascript
describe('STATE.md frontmatter sync', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = createTempProject(); });
  afterEach(() => { cleanup(tmpDir); });

  test('state update adds frontmatter to STATE.md', () => {
    fs.writeFileSync(path.join(tmpDir, '.planning', 'STATE.md'), `# Project State\n\n...`);
    const result = runGsdTools('state update Status "Executing Plan 1"', tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    // ...
  });
});
```

**Round-trip assertion pattern** (lines 440-446, and D-01 skeleton from RESEARCH.md lines 293-334):
```javascript
const content = fs.readFileSync(path.join(tmpDir, '.planning', 'STATE.md'), 'utf-8');
assert.ok(content.startsWith('---\n'), 'should start with frontmatter delimiter');
assert.ok(content.includes('brief_state_version: 1.0'), 'should have version field');
// ...
// For D-01 smoke: use extractFrontmatter directly (NOT runGsdTools) to avoid allowlist loss
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');
const { writeStateMd } = require('../brief/bin/lib/state.cjs');
writeStateMd(statePath, contentWithBriefMap, tmpDir);
const fm = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));
assert.deepStrictEqual(fm.brief.return_stack, []);
assert.strictEqual(fm.brief.current_workstream, null);  // NOT "null" string
```

**Two-cycle iteration (from RESEARCH.md lines 327-334):**
```javascript
// Cycle 1
writeStateMd(statePath, initialContent, tmpDir);
const fm1 = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));
// Cycle 2
writeStateMd(statePath, fs.readFileSync(statePath, 'utf-8'), tmpDir);
const fm2 = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));
assert.deepStrictEqual(fm2.brief, fm1.brief, 'second write-read cycle preserves brief map');
```

**Adaptation notes:**
- Use `writeStateMd` (production path with lock) NOT `fs.writeFileSync` — per §Anti-Patterns in RESEARCH.md.
- Include a D-21 test case: call `runGsdTools('state json', tmpDir)` AFTER injecting the `brief:` map, assert the parsed JSON still contains `brief` (catches the allowlist-drop bug per R-5).
- Fixtures must include ALL D-03 shapes: empty-array (`return_stack: []`), nested-null-leaf (`last_gate_results.align: null`), array-of-objects (populated `return_stack: [{frame}]`), nested-object-at-leaf (`last_gate_results.align: {decision, severity, findings_count, at}`).

**Anti-patterns to avoid:**
- Scalar-only fixtures per Pitfall 1 — they falsely PASS.
- Bypassing `writeStateMd` via `fs.writeFileSync` — produces misleading green in a non-production path.

---

### `tests/workstream-loader-discovery.test.cjs` and `tests/workstream-loader-validation.test.cjs` (test, file-I/O + glob)

**Analog (test shape):** `tests/frontmatter.test.cjs` for pure helper invocations; `tests/state.test.cjs` setup (lines 11-20) for `createTempProject` fixtures.

**Fixture construction pattern** (derived from `tests/workstream.test.cjs` lines 76-85 — creates directories + files):
```javascript
before(() => {
  tmpDir = createTempProject();
  const wsDir = path.join(tmpDir, 'brief', 'workstreams', '_example');
  fs.mkdirSync(path.join(wsDir, 'templates'), { recursive: true });
  fs.writeFileSync(path.join(wsDir, 'spec.yaml'),
    'name: _example\ndescription: demo\n' +
    'research_prompts:\n  - "one"\n  - "two"\n' +
    'design_prompts:\n  - "three"\n' +
    'output_artifact_template: templates/artifact.md\n');
  fs.writeFileSync(path.join(wsDir, 'templates', 'artifact.md'),
    '---\naudience: internal\n---\n\n# Example\n');
});
after(() => cleanup(tmpDir));
```

**Discovery test pattern** (for FND-08 acceptance demo — add second workstream mid-test):
```javascript
test('adding a second workstream dir is picked up without .cjs change', () => {
  const betaDir = path.join(tmpDir, 'brief', 'workstreams', 'beta');
  fs.mkdirSync(path.join(betaDir, 'templates'), { recursive: true });
  fs.writeFileSync(path.join(betaDir, 'spec.yaml'), 'name: beta\n...');
  fs.writeFileSync(path.join(betaDir, 'templates', 'artifact.md'), '...');

  const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');
  const specs = loadWorkstreams(tmpDir);
  assert.strictEqual(specs.length, 2);
  assert.deepStrictEqual(specs.map(s => s.slug).sort(), ['_example', 'beta']);
});
```

**Validation rejection pattern** (structured-error assertion):
```javascript
test('rejects spec.yaml where name !== parent dir', () => {
  const wrongDir = path.join(tmpDir, 'brief', 'workstreams', 'actualname');
  fs.mkdirSync(wrongDir, { recursive: true });
  fs.writeFileSync(path.join(wrongDir, 'spec.yaml'), 'name: differentname\n...');

  assert.throws(
    () => loadWorkstreams(tmpDir),
    /name "differentname" does not match directory name "actualname"/
  );
});
```

**Adaptation notes:**
- Glob must exclude dotfiles to avoid `.DS_Store` false positives on macOS (Pitfall 3).
- Use `fs.readdirSync(... { withFileTypes: true })` + `filter(e => e.isDirectory() && !e.name.startsWith('.'))` — proven pattern from RESEARCH.md line 607 + `commands.cjs:553-554`.
- Keep discovery vs validation in two files for planner discretion (per CONTEXT.md Claude's Discretion).

**Anti-patterns to avoid:**
- Do NOT couple to `tests/workstream.test.cjs` via `GSD_WORKSTREAM` env — those test a DIFFERENT concept (parallel-milestone workstreams per R-2).
- Do NOT use `runGsdTools` unless testing CLI dispatch; `loadWorkstreams` is pure-lib and tests should call it directly.

---

### `tests/status-renderer.test.cjs` (test, read-only render)

**Analog:** `tests/frontmatter.test.cjs` (describe/test block for pure helpers) + `tests/state.test.cjs` lines 361-386 for STATE.md seeding + `tests/workstream.test.cjs` lines 88-93 for runGsdTools e2e.

**Hybrid pattern (seed STATE+ROADMAP, invoke renderer, assert output):**
```javascript
describe('/brief-status renderer (FND-10)', () => {
  let tmpDir;
  beforeEach(() => {
    tmpDir = createTempProject();
    // Seed STATE.md with brief: map (D-03 schema)
    fs.writeFileSync(path.join(tmpDir, '.planning', 'STATE.md'),
      '---\nbrief_state_version: 1.0\ncurrent_phase: 02\n' +
      'brief:\n  return_stack: []\n  current_workstream: null\n' +
      '  last_gate_results:\n    align: null\n    audience: null\n    compliance: null\n---\n\n' +
      '# Project State\n**Current Phase:** 02\n**Status:** executing\n');
    // Seed ROADMAP.md minimally
    fs.writeFileSync(path.join(tmpDir, '.planning', 'ROADMAP.md'),
      '## Roadmap v1.0\n### Phase 2: Stable Seam\n**Goal:** ...\n');
  });
  afterEach(() => cleanup(tmpDir));

  test('renders compact dashboard with placeholders when brief.* empty', () => {
    const { renderStatus } = require('../brief/bin/lib/status.cjs');
    const output = renderStatus(tmpDir);
    assert.match(output, /BRIEF Status/);
    assert.match(output, /Phase\s+2 of 9/);
    assert.match(output, /Workstream\s+— \(none active\)/);
    assert.match(output, /Return stack\s+0 \/ 3/);
    assert.match(output, /Last ALIGN\s+— \(none yet\)/);
  });

  test('does not raise on missing STATE.md — emits warning line', () => {
    fs.rmSync(path.join(tmpDir, '.planning', 'STATE.md'));
    const { renderStatus } = require('../brief/bin/lib/status.cjs');
    const output = renderStatus(tmpDir);
    assert.match(output, /state\.brief\.\* not initialized/);
  });
});
```

**Adaptation notes:**
- Test the pure-function `renderStatus(cwd)` for D-15/D-16/D-17 (preferred).
- One test MUST use `runGsdTools(['status'], tmpDir)` to exercise the dispatcher case added in `brief-tools.cjs` (D-19 stdout test — output goes to stdout, exit 0).
- Fixture must include a missing-ROADMAP case (Pitfall 4 — renderer must not emit `"Phase 2 of undefined"`).

**Anti-patterns to avoid:**
- Do NOT assert on exact whitespace/column alignment — D-15 uses fixed-width but strict-column assertions are brittle; use `assert.match` with regex.
- Do NOT mock ROADMAP.md with full ROADMAP content — keep minimal, just the Phase header plus Phase 2 section.

---

### `brief/bin/lib/workstream-loader.cjs` (lib loader, file-I/O + parse + validate)

**Analog:** `brief/bin/lib/roadmap.cjs` (`cmdRoadmapAnalyze` — file + dir scan, return typed JSON with validation errors per phase)

**Imports pattern** (from roadmap.cjs:5-7, frontmatter.cjs:5-7):
```javascript
const fs = require('fs');
const path = require('path');
const { output, error, safeReadFile } = require('./core.cjs');
// IF extending frontmatter.cjs inline parser:
const { parseYamlDocument } = require('./frontmatter.cjs');
// OR if new yaml-mini.cjs sibling:
const { parseYamlDocument } = require('./yaml-mini.cjs');
```

**Directory walk + per-entry validation pattern** (adapt from `commands.cjs:552-570` `cmdProgressRender` dir walk):
```javascript
function loadWorkstreams(cwd) {
  const root = path.join(cwd, 'brief', 'workstreams');
  if (!fs.existsSync(root)) return [];

  const dirs = fs.readdirSync(root, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => e.name);

  const specs = [];
  for (const dir of dirs) {
    const specPath = path.join(root, dir, 'spec.yaml');
    if (!fs.existsSync(specPath)) continue;

    const content = fs.readFileSync(specPath, 'utf-8');
    const parsed = parseYamlDocument(content);

    // D-13 validation rules — throw structured errors
    if (parsed.name !== dir) {
      throw new Error(
        `Workstream "${dir}": name "${parsed.name}" does not match directory name "${dir}"`
      );
    }
    if (!parsed.output_artifact_template) {
      throw new Error(`Workstream "${dir}": missing required output_artifact_template`);
    }
    const tmplPath = path.join(root, dir, parsed.output_artifact_template);
    if (!fs.existsSync(tmplPath)) {
      throw new Error(
        `Workstream "${dir}": output_artifact_template "${parsed.output_artifact_template}" does not exist`
      );
    }
    // Optional path fields
    for (const [variant, p] of Object.entries(parsed.business_model_variants || {})) {
      if (!fs.existsSync(path.join(root, dir, p))) {
        throw new Error(`Workstream "${dir}": business_model_variants.${variant} path "${p}" does not exist`);
      }
    }
    for (const [region, p] of Object.entries(parsed.region_overrides || {})) {
      if (!fs.existsSync(path.join(root, dir, p))) {
        throw new Error(`Workstream "${dir}": region_overrides.${region} path "${p}" does not exist`);
      }
    }

    specs.push({ slug: dir, ...parsed });
  }
  return specs;
}

module.exports = { loadWorkstreams };
```

**Adaptation notes:**
- Mirror `cmdRoadmapAnalyze` shape: pure function, returns array/object, callers decide output formatting.
- Reuse `fs.readdirSync({ withFileTypes: true })` pattern — exactly matches `commands.cjs:553`.
- The YAML parser goes in **either** `frontmatter.cjs` (in-place extension) OR `yaml-mini.cjs` (sibling). Per RESEARCH.md A-P2-2, current `frontmatter.cjs` is 379 lines; a ~100-line parser extension likely crosses the ~400-line soft cap. Prefer sibling `yaml-mini.cjs` unless the extension stays tight.
- **Sibling-module rationale (R-2):** Do NOT extend `workstream.cjs` — it owns the `.planning/workstreams/<name>/` parallel-milestone concept, not the `brief/workstreams/<slug>/` business-artifact concept. Collision risk is high.

**Anti-patterns to avoid:**
- Do NOT call `npx --yes yaml-cli` — rejected per A1 zero-deps rule, and would add 1-2s cold-start per call (RESEARCH Alternatives Considered).
- Do NOT import from `workstream.cjs` — crossed-concerns violation.
- Do NOT return structured error objects instead of throwing — D-13 says "rejects with structured error"; thrown Error with descriptive message is the BRIEF convention (`error.cjs`, `core.cjs :: error(...)` all use thrown exceptions).

---

### `brief/bin/lib/status.cjs` (lib, read-only render)

**Analog:** `brief/bin/lib/commands.cjs` `cmdProgressRender` (lines 543-605) — **explicit R-4 / D-18 template**

**Imports pattern** (from commands.cjs:4-9):
```javascript
const fs = require('fs');
const path = require('path');
const { planningPaths, getMilestoneInfo, output } = require('./core.cjs');
const { cmdStateJson } = require('./state.cjs');              // read path
const { cmdRoadmapAnalyze } = require('./roadmap.cjs');        // phase_count / current_phase lookup
const { extractFrontmatter } = require('./frontmatter.cjs');
```

**Composition-over-two-APIs pattern** (derived from D-18 + research §Code Examples):
```javascript
function renderStatus(cwd, raw) {
  // Read STATE via existing API — do NOT re-parse STATE.md independently
  const statePath = planningPaths(cwd).state;
  let stateFm = {};
  let briefMissing = false;
  if (fs.existsSync(statePath)) {
    stateFm = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));
    briefMissing = !stateFm.brief;
  } else {
    briefMissing = true;
  }
  const brief = stateFm.brief || {};

  // Read ROADMAP via existing API
  let phaseCount = '—';
  let phaseNameShort = '';
  let currentPhase = stateFm.current_phase || '—';
  try {
    // cmdRoadmapAnalyze prints JSON via output(); instead use its internals
    // OR require a non-output variant — planner must decide wrapper vs direct extraction
    // See Pitfall 4: handle missing ROADMAP.md gracefully
    // ...
  } catch { /* graceful degrade per D-17 */ }

  // Format per D-15 user-locked template (fixed-width two-column)
  const lines = [
    'BRIEF Status',
    '='.repeat(32),
    `  Phase           ${currentPhase} of ${phaseCount}${phaseNameShort ? ' (' + phaseNameShort + ')' : ''}`,
    `  Workstream      ${brief.current_workstream || '— (none active)'}`,
    `  Return stack    ${(brief.return_stack || []).length} / 3`,
    `  Last ALIGN      ${formatGate(brief.last_gate_results?.align)}`,
    `  Last COMPLIANCE ${formatGate(brief.last_gate_results?.compliance)}`,
    '-'.repeat(32),
    `  Next: ${stateFm.stopped_at || '(unknown)'}`,
  ];
  if (briefMissing && /* past phase 2 */ false) {
    lines.push('');
    lines.push('⚠ state.brief.* not initialized — run /brief-init or check STATE.md');
  }
  output({ rendered: lines.join('\n') }, raw, lines.join('\n'));
}

function formatGate(gate) {
  if (!gate) return '— (none yet)';
  return `${gate.decision} (${gate.findings_count} findings)`;
}

module.exports = { renderStatus };
```

**Adaptation notes:**
- Matches `cmdProgressRender`'s shape: accept `(cwd, raw)`, pull data via existing APIs, emit via `output()` helper (supports `--raw` mode per D-19 stdout contract).
- D-15 output is USER-LOCKED — copy the exact strings (`BRIEF Status`, `— (none active)`, `— (none yet)`, column widths). Do NOT re-litigate.
- D-17 resilience: every field read must be optional-chained (`brief.last_gate_results?.align`) with an `||` fallback — NO exceptions on missing fields.
- Pitfall 4: treat missing ROADMAP.md as missing-phase-count, render `—` not `undefined`.

**Anti-patterns to avoid:**
- Do NOT fetch data via `fs.readFileSync` + regex on STATE.md or ROADMAP.md — use `extractFrontmatter` / `cmdStateJson` / `cmdRoadmapAnalyze` (R-2 consistency, §Don't Hand-Roll).
- Do NOT mutate STATE.md — read-only command per D-18. Do NOT call `writeStateMd` from this file.
- Do NOT add a `--json` flag or alternative output mode — D-19 defers to Phase 9 HRD-03.

---

### `commands/brief/status.md` (command dispatcher stub)

**Analog:** `commands/brief/progress.md` (verbatim structure, 26 lines)

**Full file pattern** (copy exactly, substitute `progress` → `status`, `gsd:` → `brief:` per R-4):
```markdown
---
name: brief:status
description: Show current BRIEF workflow position — phase, workstream, return-stack depth, last ALIGN/COMPLIANCE results.
argument-hint: ""
allowed-tools:
  - Read
  - Bash
---
<objective>
Render a one-screen compact dashboard of BRIEF workflow state.
Provides situational awareness for business planners navigating DEFINE → DISCOVER → DESIGN → DELIVER phases.
</objective>

<execution_context>
@~/.claude/brief/workflows/status.md
</execution_context>

<process>
Execute the status workflow: invoke `brief-tools.cjs status` and print the compact-dashboard stdout verbatim.
</process>
```

**Adaptation notes:**
- **Frontmatter `name:` MUST be `brief:status` NOT `gsd:status`** per R-4 (the existing `commands/brief/progress.md` still reads `name: gsd:progress` — that's a Phase 1 residue; do NOT copy-paste that bug).
- The `<execution_context>` path `@~/.claude/brief/workflows/status.md` follows the inherited convention — requires a corresponding workflow file (`brief/workflows/status.md`) OR the `<process>` block can invoke `brief-tools.cjs status` directly without a separate workflow (progress uses both; status can be simpler given its narrow scope).
- `allowed-tools` needs Read + Bash at minimum; `health.md` adds `Write + AskUserQuestion` but `/brief-status` is READ-ONLY per D-18, so matches `progress.md` minimal set.

**Anti-patterns to avoid:**
- Do NOT include `Write` in `allowed-tools` — D-18 says read-only.
- Do NOT add an installation tuple in `bin/install.js` — per R-4 / RESEARCH Pattern 3, `bin/install.js` bulk-copies `commands/brief/*.md`; adding the file alone auto-registers across 14 runtimes.
- Do NOT omit `<execution_context>` — even if trivial, the section is required by the inherited command shape (all 3 analogous files use it).

---

### `brief/workstreams/_example/spec.yaml` (fixture, declarative config)

**Analog:** None exists in the codebase (this IS the Phase 2 deliverable that establishes the schema per D-14).

**Schema reference:** D-13 is the authoritative contract (CONTEXT.md lines 146-175). RESEARCH.md lines 641-651 shows a drafted example.

**Concrete shape to ship:**
```yaml
name: _example
description: Example workstream proving the loader picks up a spec.yaml without code changes (FND-08).
research_prompts:
  - "What is the current state of X in the target market?"
  - "Who are the top 3 competitors for X?"
design_prompts:
  - "Draft an artifact describing X per the template."
output_artifact_template: templates/artifact.md
```

**Adaptation notes:**
- `name: _example` MUST match the directory name `brief/workstreams/_example/` (D-13 validation rule).
- Underscore prefix `_example` is intentional — per D-14 "visible to humans but easy for Phase 7 to remove or replace".
- Only required fields per D-13; optional fields (`business_model_variants`, `region_overrides`, `audience_default`) are INTENTIONALLY omitted to keep the fixture minimal (their coverage is in `workstream-loader-validation.test.cjs` with purpose-built negative fixtures).
- Templates MUST exist at the referenced path for the loader to pass validation.

**Anti-patterns to avoid:**
- Do NOT include Korean-specific or `region_overrides` content — those are Phase 7 per CONTEXT.md Deferred Ideas.
- Do NOT put rich business content (BMC/GTM templates) in `_example/templates/artifact.md` — Phase 7 owns the real templates.

---

### `brief/workstreams/_example/templates/artifact.md` (template skeleton)

**Analog:** None exists — BRIEF's audience-guard frontmatter fields (`audience`, `confidentiality`, `voice`) per CLAUDE.md Tech Stack are a NEW BRIEF layer. Inherited `agents/*.md` frontmatter uses `name: description: allowed-tools:` only. D-13 `audience_default` is the schema contract.

**Concrete shape:**
```markdown
---
audience: internal
confidentiality: internal-only
voice: direct
workstream: _example
---

# Example Artifact

This is a placeholder artifact produced by the _example workstream (FND-08 acceptance demo).
Phase 7 replaces this with real business-planning templates (BMC, GTM, FINANCIAL, etc.).
```

**Adaptation notes:**
- Frontmatter fields (`audience`, `confidentiality`, `voice`) match CLAUDE.md Tech Stack "Audience guard" language. These are the closed-enum values expected by a future Phase 4/5 audience-guard hook.
- `workstream: _example` is a convenience back-reference (not required by D-13 but useful for artifact-to-workstream tracing).
- Body content is intentionally trivial — this is a FIXTURE, not a user-facing template.

**Anti-patterns to avoid:**
- Do NOT add business-domain content — Phase 7 territory per D-14.
- Do NOT omit frontmatter — the existence of frontmatter (even minimal) is the pattern future audience-guard logic will depend on.

---

### MODIFIED: `brief/bin/lib/frontmatter.cjs` (EXTEND reconstructFrontmatter per D-20)

**Analog:** The file itself — `reconstructFrontmatter` lines 120-182 is what's being fixed.

**Current broken serializer** (lines 150-170):
```javascript
} else if (typeof subval === 'object') {
  lines.push(`  ${subkey}:`);
  for (const [subsubkey, subsubval] of Object.entries(subval)) {
    if (subsubval === null || subsubval === undefined) continue;   // ← DROPS null leaves
    if (Array.isArray(subsubval)) {
      if (subsubval.length === 0) {
        lines.push(`    ${subsubkey}: []`);
      } else {
        lines.push(`    ${subsubkey}:`);
        for (const item of subsubval) {
          lines.push(`      - ${item}`);                             // ← `[object Object]` for objects
        }
      }
    } else {
      lines.push(`    ${subsubkey}: ${subsubval}`);                  // ← stringifies objects
    }
  }
}
```

**Target extension pattern** (recursive serializer preserving D-03 shapes):
- Replace the 3-level hand-coded tower (lines 135-170) with a recursive `serializeValue(value, indent)` helper.
- Emit JS `null` as YAML `null` string (NOT `"null"` quoted, NOT skipped) — fixes the `extractFrontmatter` side's string-"null" output too (see §R-1 closing paragraph: add `if (value === 'null') current.obj[key] = null;` in the KEY:VALUE parse branch around line 90).
- For arrays-of-objects: emit `- ` followed by indented object map:
  ```yaml
  return_stack:
    - from_phase: DESIGN
      to_phase: DISCOVER
      reason: gap
      pushed_at: 2026-04-18
  ```
- Preserve existing behavior for flat scalars, string arrays `[a, b, c]`, and 2-level nested maps (per D-20 rule 2 "no regressions").

**Regression-proof test strategy:** The D-20 extension MUST pass `tests/frontmatter.test.cjs` AND the new `tests/frontmatter-roundtrip.test.cjs`. Running `node --test tests/frontmatter.test.cjs` before and after the edit is the baseline — all 50+ existing tests must stay green.

**Adaptation notes:**
- The `splitInlineArray` helper (lines 14-41) shows the in-file helper-function style — follow that for the new recursive serializer.
- The `parseMustHavesBlock` helper (lines 193-299) demonstrates extensive one-off parsing logic inside this module — the D-20 extension is small by comparison.
- Keep `frontmatter.cjs` under ~400 lines if possible (currently 379). If the D-20 extension + D-12 `parseYamlDocument` together push over, split `parseYamlDocument` into `brief/bin/lib/yaml-mini.cjs` sibling (RESEARCH A-P2-2).

**Anti-patterns to avoid:**
- Do NOT introduce `js-yaml` or any npm YAML library — A1 zero-deps rule.
- Do NOT change the `extractFrontmatter` / `reconstructFrontmatter` function signatures — 198 test files depend on them.
- Do NOT ship D-20 without running `node --test tests/frontmatter.test.cjs` first — that suite is the canary for existing-behavior preservation.

---

### MODIFIED: `brief/bin/lib/state.cjs` (D-04 rename + D-21 allowlist extension)

**Three load-bearing edits in this file:**

**1. Line 814 — the D-04 rename target:**
```javascript
// BEFORE:
const fm = { gsd_state_version: '1.0' };
// AFTER:
const fm = { brief_state_version: '1.0' };
```

**2. Lines 955-984 (`cmdStateJson`) — D-21 allowlist extension:**

Current preservation pattern (lines 971-981):
```javascript
// Preserve frontmatter-only fields that cannot be recovered from the body.
if (existingFm && existingFm.stopped_at && !built.stopped_at) {
  built.stopped_at = existingFm.stopped_at;
}
if (existingFm && existingFm.paused_at && !built.paused_at) {
  built.paused_at = existingFm.paused_at;
}
if (built.status === 'unknown' && existingFm && existingFm.status && existingFm.status !== 'unknown') {
  built.status = existingFm.status;
}
```

**D-21 extension — add a 4th preservation branch:**
```javascript
// Preserve the brief:* namespaced map (cannot be recovered from body).
if (existingFm && existingFm.brief) {
  built.brief = existingFm.brief;
}
```

**3. Lines 852-868 (`syncStateFrontmatter`) — same preservation on write path:**

Current shape preserves status on 'unknown' derivation:
```javascript
if (derivedFm.status === 'unknown' && existingFm.status && existingFm.status !== 'unknown') {
  derivedFm.status = existingFm.status;
}
```

**D-21 mirror:**
```javascript
// Preserve brief:* namespaced map across write cycles (buildStateFrontmatter doesn't regenerate it).
if (existingFm && existingFm.brief) {
  derivedFm.brief = existingFm.brief;
}
```

**Adaptation notes:**
- The D-04 rename MUST land in the SAME atomic commit as the 5 test-assertion updates (`tests/state.test.cjs` lines 350, 365, 382, 442, **1725**) AND `.planning/STATE.md` line 2 migration AND `brief:` map initialization. Splitting breaks delta-cap per R-3.
- D-21 is load-bearing for FND-05 — without it, the A4 smoke test's 2nd cycle through `cmdStateJson` silently drops the `brief:` map (R-5, assumption A-P2-4).
- After the D-21 edit, `writeStateMd` (line 923) does NOT need changes — it delegates through `syncStateFrontmatter` which inherits the new preservation.

**Anti-patterns to avoid:**
- Do NOT add a backwards-compat reader that accepts `gsd_state_version` — D-07 explicitly rejects aliases.
- Do NOT widen the allowlist to `for (const k of Object.keys(existingFm)) { ... }` — that would change semantics for other fields and risk leaking stale frontmatter (Phase 1 already audited this boundary).
- Do NOT forget the test assertion at line 1725 — RESEARCH.md said "4 lines" but actual grep finds **5 references** (350, 365, 382, 442, **1725**). Planner MUST update all 5.

---

### MODIFIED: `tests/state.test.cjs` (D-04 literal rename on 5 lines)

**Analog:** self (same file, same assertion pattern).

**Current pattern at line 442:**
```javascript
assert.ok(content.includes('gsd_state_version: 1.0'), 'should have version field');
```
**Target:**
```javascript
assert.ok(content.includes('brief_state_version: 1.0'), 'should have version field');
```

**Five lines requiring edit** (per `grep -n "gsd_state_version" tests/state.test.cjs`):
- Line 350: `assert.strictEqual(output.gsd_state_version, '1.0', 'should have version 1.0');`
- Line 365: `gsd_state_version: 1.0` (inside a template literal — the fixture YAML)
- Line 382: `assert.strictEqual(output.gsd_state_version, '1.0', 'version from frontmatter');`
- Line 442: `assert.ok(content.includes('gsd_state_version: 1.0'), ...)`
- Line 1725: `gsd_state_version: '1.0'` (inside a template literal — fixture YAML)

**Adaptation notes:**
- Must land in the SAME commit as the `state.cjs:814` rename. Atomic-buildable-commit rule (Phase 1 D-09 inherited).
- **RESEARCH.md R-3 undercounted** — it says "4 test assertions" but the actual count is 5. Planner must verify before committing.

**Anti-patterns to avoid:**
- Do NOT keep any `gsd_state_version` literal in test files — tests must not retain the old name (per D-07 no-aliases).
- Do NOT split the D-04 rename across multiple commits — each intermediate state is broken (tests fail or source writes unknown name).

---

### MODIFIED: `.planning/STATE.md` (frontmatter migration + brief: initialization)

**Analog:** self (current line 2 is the exact write target).

**Current frontmatter (lines 1-15):**
```yaml
---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: "..."
stopped_at: "..."
last_updated: "..."
last_activity: "..."
progress:
  total_phases: 9
  completed_phases: 1
  ...
---
```

**Target frontmatter after Phase 2:**
```yaml
---
brief_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: "..."
stopped_at: "..."
last_updated: "..."
last_activity: "..."
progress:
  total_phases: 9
  completed_phases: 1
  ...
brief:
  return_stack: []
  gap_queue: []
  last_gate_results:
    align: null
    audience: null
    compliance: null
  current_workstream: null
---
```

**Adaptation notes:**
- Line 2 is a one-character-block rename (`gsd_state_version` → `brief_state_version`).
- The `brief:` map SHOULD be initialized in Phase 2 (not deferred to Phase 3) per D-21.2 — otherwise `/brief-status` renders warnings until Phase 3 first write.
- Body (`# Project State`, `## Project Reference`, etc.) is UNCHANGED.
- This migration is NOT done via `fs.writeFileSync`; it must go through `writeStateMd` to preserve atomic-lock semantics. Planner can manually edit the file BUT then MUST run `runGsdTools('state json', cwd)` to confirm the `brief:` map survives (catches D-21 regression).

**Anti-patterns to avoid:**
- Do NOT include `brief_state_version` AND `gsd_state_version` simultaneously — D-07 no-aliases.
- Do NOT add `brief:` keys beyond the D-03 schema (`return_stack`, `gap_queue`, `last_gate_results.{align,audience,compliance}`, `current_workstream`) — Phase 4/5/6/7 own their population, Phase 2 declares shape only.

---

### MODIFIED: `brief/bin/brief-tools.cjs` (add `case 'status':` dispatch)

**Analog:** `brief/bin/brief-tools.cjs:772-776` — the existing `case 'progress':` block

**Current pattern at line 772:**
```javascript
case 'progress': {
  const subcommand = args[1] || 'json';
  commands.cmdProgressRender(cwd, subcommand, raw);
  break;
}
```

**Target addition (near line 772, alphabetic/grouping flexibility):**
```javascript
case 'status': {
  const status = require('./lib/status.cjs');
  status.renderStatus(cwd, raw);
  break;
}
```

**Adaptation notes:**
- The header doc block (lines 11-100) listing commands should also gain a `status` entry in the `Atomic Commands:` section for discoverability.
- Follow the lazy-require pattern (`require('./lib/status.cjs')` inside the case) — several existing cases use both top-level requires (commands, verify) and in-case requires (uat, milestone). Lazy-require keeps the tool's cold-start fast.

**Anti-patterns to avoid:**
- Do NOT add the case in a way that shadows existing subcommands (there's no existing `status` subcommand per search; confirm by grepping `brief-tools.cjs` for `'status'` before inserting).

---

### MODIFIED: `CLAUDE.md` (add `## Surface Caps` section)

**Analog (structural):** CLAUDE.md already contains flat `## Technology Stack`, `## Conventions`, `## Architecture`, `## Project Skills`, `## BRIEF Workflow Enforcement`, `## Developer Profile` — the new `## Surface Caps` section follows the same top-level flat structure.

**Regeneration-guard pattern (from CLAUDE.md line 232):**
```markdown
## Developer Profile

> Profile not yet configured. Run `/brief-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
```

**Adapted guard for Surface Caps (per Pitfall 5):**
```markdown
<!-- BRIEF PHASE 2 / FND-09 — DO NOT REGENERATE. Preserve across CLAUDE.md template rebuilds. -->

## Surface Caps

BRIEF enforces a minimal command/skill surface for memorability and to prevent skill bloat (Pitfalls #1 and #12 from the inherited GSD Pitfall catalog):

- **≤12 user-facing slash commands**
- **≤8 skills**

**Definition of "user-facing":** what `bin/install.js` registers under `commands/<runtime>/brief/` for end-user invocation. Internal helpers, sub-commands routed through a parent command, and template files do NOT count against the cap.

**Enforcement:** Documentation-only in Phase 2. No pre-commit hook, no automated gate. The audit + pruning runs in Phase 9 HRD-02 (v1 launch gate).

**Current state:** As of v1 design, BRIEF inherits 61 renamed `brief-*` commands and 18 renamed agents from GSD. The cap (≤12 user-facing) is enforced at v1 launch via Phase 9 HRD-02. Subsequent Phases (3-8) MUST NOT add new commands beyond their requirement-mapped set.
```

**Adaptation notes:**
- Place the new section between `## Architecture` (line 199) and `## Project Skills` (line 205) — keeps the project-policy block together.
- The HTML comment `<!-- ... -->` guard is the proposed convention (Pitfall 5); the existing `## Developer Profile` uses `> ... managed by ... do not edit manually` blockquote style. Either works; comment is preferred because it's invisible in rendered Markdown while still load-bearing for future regenerators.
- Exact wording must include D-06/D-07/D-08/D-09 phrasing verbatim where possible (`≤12`, `≤8`, `Phase 9 HRD-02`, `user-facing`).
- VALIDATION.md has 4 grep-based acceptance assertions on this section — keywords `## Surface Caps`, `≤12`, `≤8`, `Phase 9 HRD-02`, `user-facing` must all appear.

**Anti-patterns to avoid:**
- Do NOT enumerate which 49 inherited commands to prune — D-09 explicitly defers this to Phase 9.
- Do NOT introduce enforcement mechanisms (pre-commit hook, CI check) — D-07 rejects these for Phase 2.
- Do NOT use emojis — CLAUDE.md "Only use emojis if the user explicitly requests it" (per project constraints).

---

### MODIFIED: `.planning/ASSUMPTIONS.md` (append `### A4 —` entry)

**Analog:** self (existing A1..A-P2 entries follow the same format).

**Target append shape** (gated on A4 smoke-test outcome):
```markdown
### A4 — STATE.md round-trips `state.brief.*` without loss — VERIFIED 2026-04-XX

State: VERIFIED
Source: `tests/state-brief-roundtrip.test.cjs` — all D-03 schema shapes (array-of-objects, nested object leaves, null scalars) round-trip deep-strict-equal across 2 write cycles + 1 `state json` cycle.
Risk if invalidated: Phase 4/5/6/7 writers silently corrupt STATE.md. Mitigation landed in Phase 2 D-20 (reconstructFrontmatter extension) + D-21 (cmdStateJson allowlist).
```

**Adaptation notes:**
- The append MUST happen only AFTER the smoke test passes (not before). If the test fails, the entry's outcome is INVALIDATED not VERIFIED (per D-05 original fallback plan — now superseded by D-20's in-place fix).
- VALIDATION.md line 47 gates this with a `grep -q "^### A4 —" .planning/ASSUMPTIONS.md` check.

---

## Shared Patterns

### File paths and core utilities

**Source:** `brief/bin/lib/core.cjs` — `planningPaths(cwd)`, `planningRoot(cwd)`, `output(obj, raw, plain?)`, `error(msg)`
**Apply to:** All new lib files (`workstream-loader.cjs`, `status.cjs`), every modification to `state.cjs`/`frontmatter.cjs`.

```javascript
const { output, error, planningPaths } = require('./core.cjs');
// planningPaths(cwd) returns { state, roadmap, project, phases, ... }
// output({ key: val }, raw) emits JSON if raw, plain text otherwise
// error(msg) throws/exits with code 1
```

### Test helpers

**Source:** `tests/helpers.cjs` — `runGsdTools(args, cwd, env?)`, `createTempProject(prefix?)`, `cleanup(tmpDir)`
**Apply to:** All 5 new test files.

```javascript
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');

let tmpDir;
beforeEach(() => { tmpDir = createTempProject(); });
afterEach(() => { cleanup(tmpDir); });
```

### Frontmatter I/O

**Source:** `brief/bin/lib/frontmatter.cjs` — `extractFrontmatter`, `reconstructFrontmatter`, `spliceFrontmatter`
**Apply to:** `status.cjs` (read STATE.md frontmatter), A4 smoke test (verify round-trip).

**Rule:** Never regex-match frontmatter manually; always go through these helpers. The D-20 extension keeps this rule intact — downstream code doesn't change API, just gains fidelity for nested shapes.

### STATE.md write discipline

**Source:** `brief/bin/lib/state.cjs` — `writeStateMd(statePath, content, cwd)`, `readModifyWriteStateMd(statePath, fn, cwd)`
**Apply to:** Any code path that writes STATE.md (A4 smoke test; future Phase 4/5/6/7 writers).

**Rule (from RESEARCH §Anti-Patterns):** NEVER bypass `writeStateMd` via `fs.writeFileSync` in production or tests-of-production-path. Only acceptable bypass: initial fixture seeding (where lock-contention doesn't exist).

### Error semantics

**Source:** `brief/bin/lib/core.cjs :: error(msg)` — throws, CLI exits with code 1
**Apply to:** `workstream-loader.cjs` validation failures (D-13).

**Rule:** Use thrown `Error` with descriptive message including the workstream slug and the specific violation. Do NOT return error objects — BRIEF convention is throw-on-validation-failure.

### Command auto-registration (NO install.js edits)

**Source:** `bin/install.js:5488-5541` — `copyFlattenedCommands`, `copyCommandsAs*Skills` bulk-copy
**Apply to:** `commands/brief/status.md` creation.

**Rule (per R-4):** Dropping a .md file into `commands/brief/` auto-registers across all 14 runtimes. NO tuples, NO per-runtime edits. This is Phase 1 Plan 07/08 proven territory.

---

## No Analog Found

Files with no close match in the codebase (planner uses RESEARCH.md patterns or authors from scratch):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `brief/workstreams/_example/spec.yaml` | fixture/config | static declarative | This IS the Phase 2 deliverable that establishes the schema (D-14). D-13 is the authoritative contract. RESEARCH.md lines 641-651 contain a drafted example to copy. |
| `brief/workstreams/_example/templates/artifact.md` | template skeleton | static | BRIEF's audience-guard frontmatter (`audience`, `confidentiality`, `voice`) is a NEW layer per CLAUDE.md Tech Stack — no inherited file uses it. RESEARCH.md lines 654-665 contain a drafted example. |
| `brief/bin/lib/yaml-mini.cjs` (CONDITIONAL — only if `frontmatter.cjs` extension exceeds 400 lines) | lib (parser) | string parsing | No existing full-doc YAML parser in the codebase. The state-machine logic inside `extractFrontmatter` (frontmatter.cjs:43-118) is the INSPIRATION, not the analog — a sibling module would adapt the same indentation-tracking + stack approach to full-doc YAML without the `---` framing. D-12 is the schema constraint (scalars, lists, nested maps; NOT YAML 1.2 full). |

---

## Metadata

**Analog search scope:**
- `brief/bin/lib/` (23 modules — read `frontmatter.cjs`, `state.cjs`, `roadmap.cjs`, `commands.cjs`, `workstream.cjs`)
- `brief/bin/brief-tools.cjs` dispatcher (1255 lines, verified `case 'progress':` at line 772)
- `commands/brief/` (61 files — verified `progress.md`, `check-todos.md`, `health.md` as closest command-stub analogs)
- `tests/` (198 files — verified `frontmatter.test.cjs`, `state.test.cjs`, `workstream.test.cjs`, `helpers.cjs` as canonical `node:test` patterns)
- `CLAUDE.md` (232 lines — verified section structure; no existing `Surface Caps`, `do not edit manually` guard precedent at line 232)
- `bin/install.js:5488-5541` (auto-discovery block confirming R-4 no-tuple pattern)

**Files scanned:** ~40 (read or grepped)

**Pattern extraction date:** 2026-04-19

**Key extractions verified against live files:**
- `state.cjs:814` — current write site confirmed (`const fm = { gsd_state_version: '1.0' };`)
- `state.cjs:955-984` — `cmdStateJson` allowlist confirmed (3 existing branches)
- `state.cjs:852-868` — `syncStateFrontmatter` confirmed
- `tests/state.test.cjs` — grep found **5** `gsd_state_version` lines (350, 365, 382, 442, 1725), not 4 as RESEARCH.md claimed. **Planner must update all 5.**
- `brief-tools.cjs:772` — `case 'progress':` confirmed as template
- `commands/brief/progress.md` — 26 lines, frontmatter `name: gsd:progress` (the residue that `status.md` MUST NOT copy-paste)
- `.planning/STATE.md:2` — current `gsd_state_version: 1.0` confirmed as migration target

---

*Phase: 02-stable-seam-anchor-schema-caps-workstream-as-config*
*Pattern map: 2026-04-19*
*Ready for planner consumption: YES*
