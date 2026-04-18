# Phase 2: Stable Seam — Anchor Schema, Caps, Workstream-as-Config - Research

**Researched:** 2026-04-18
**Domain:** BRIEF infrastructure seams — state namespace, workstream-as-YAML loader, surface caps doc, read-only status command
**Confidence:** HIGH (for architectural constraints and file surface); **HIGH-ALARM on A4** (empirical counter-evidence surfaced — see Risk Flags §R-1)

## Summary

Phase 2 is infrastructure-only — no new BRIEF domain features ship. It installs four seams every later phase depends on: `state.brief.*` namespace, workstream-as-YAML loader, `## Surface Caps` documentation, and a read-only `/brief-status` skeleton. CONTEXT.md has locked 19 decisions (D-01..D-19); this research verifies, enriches, and surfaces constraints — it does NOT re-litigate.

**The single highest-risk finding is R-1 below: direct empirical test of `brief/bin/lib/frontmatter.cjs` against the D-03 schema shows the current reconstruct-frontmatter pathway is LOSSY for (a) arrays of objects and (b) object leaf values nested 4+ levels deep.** D-03 specifies both shapes (`brief.return_stack: [frame objects]`, `brief.last_gate_results.align: {...}` — a 3-level map, which IS at the depth limit). This means the A4 smoke test as written in D-01 will FAIL unless `frontmatter.cjs` is extended, OR the test uses only shallow/scalar fixtures, OR the fallback path (D-05 sidecar) is taken. See §Risk Flags R-1 for empirical evidence.

**Primary recommendation:** Plan BOTH lanes per D-05. Lane-A (happy path) MUST include `frontmatter.cjs` extension work to handle arrays-of-objects and 4-level-deep maps — this is NOT zero-deps-breaking but IS scope-creep beyond the bare A4 test. The alternative — restricting the smoke test to only shallow fixtures that round-trip cleanly — technically passes A4 but does not actually verify what Phase 4/5/6/7 need (frame objects, gate result objects). The planner must be told this explicitly so they do not declare A4 verified on a watered-down fixture.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| STATE.md read/write (round-trip) | `brief/bin/lib/state.cjs` + `frontmatter.cjs` | — | Inherited BRIEF core; A4 verification exercises this boundary |
| `state.brief.*` schema | `brief/bin/lib/state.cjs` `buildStateFrontmatter` (line 814) + STATE.md body | — | Same primitive that writes `gsd_state_version`; D-03 schema is a new nested map on the existing object returned by `buildStateFrontmatter` |
| YAML full-doc parsing for workstream-spec | NEW `brief/bin/lib/yaml-mini.cjs` OR extension of `frontmatter.cjs` | — | Per D-12 — inline implementation, zero-deps rule (A1) forbids js-yaml |
| Workstream-spec directory discovery | NEW `brief/bin/lib/workstream-loader.cjs` (sibling of existing `workstream.cjs`) | — | Existing `workstream.cjs` handles PARALLEL MILESTONE workstreams, a completely different concept — see §R-2 |
| `/brief-status` logic | NEW `brief/bin/lib/status.cjs` (per D-18) | `state.cjs` `cmdStateJson`, `roadmap.cjs` `cmdRoadmapAnalyze` | Read-only composition over two existing APIs |
| `/brief-status` command surface | `commands/brief/status.md` + workflow markdown (if multi-runtime) | `bin/install.js` auto-discovery | Install auto-copies `commands/brief/*.md` — no per-command tuple needed (see §R-4) |
| CLAUDE.md Surface Caps policy text | `CLAUDE.md` root | — | Doc-only; no enforcement mechanism in Phase 2 per D-06/D-07 |

## User Constraints (from CONTEXT.md)

### Locked Decisions

**A4 + state.brief.* namespace:**
- **D-01:** A4 verification is `tests/state-brief-roundtrip.test.cjs` (node:test). Flow: read → inject representative payload (one of each shape: array, object, scalar, nested object) → write → re-read → deepEqual → REPEAT twice.
- **D-02:** `brief:` is a single nested YAML map in STATE.md frontmatter, not flat dot-keys.
- **D-03:** Forward-declared schema locked now:
  - `brief.return_stack` — array of frame objects (LIFO, max depth 3)
  - `brief.gap_queue` — array of `{topic, criticality, raised_at}`
  - `brief.last_gate_results.align` — `{decision, severity, findings_count, at}` | null
  - `brief.last_gate_results.audience` — same shape | null
  - `brief.last_gate_results.compliance` — same shape | null
  - `brief.current_workstream` — string slug | null
- **D-04:** `gsd_state_version` → `brief_state_version` rename at `brief/bin/lib/state.cjs:814`; migrate `.planning/STATE.md` atomically; no backwards-compat reader.
- **D-05:** If A4 fails, fall back to sidecar `.planning/state-brief.json` via new helper `brief/bin/lib/state-brief.cjs`. Plan BOTH lanes as separate task lanes; do NOT merge.

**Surface caps (FND-09):**
- **D-06:** New `## Surface Caps` section in CLAUDE.md — ≤12 user-facing commands, ≤8 skills; definition of "user-facing" = what `bin/install.js` registers under `commands/<runtime>/brief/` for end-user invocation.
- **D-07:** NO pre-commit hook. Phase 2 = doc-only. Audit is Phase 9 HRD-02.
- **D-08:** Current count acknowledged: `commands/brief/` = 61 files; `agents/` = 18 files. Both exceed cap. Reduction is Phase 9. Phase 2 +1 = 62 after.
- **D-09:** CLAUDE.md text must include forward-looking pointer about 61 inherited commands and Phase 9 HRD-02 pruning.

**workstream-spec.yaml (FND-08):**
- **D-10:** Directory: `brief/workstreams/<slug>/{spec.yaml, templates/}`
- **D-11:** Discovery via glob `brief/workstreams/*/spec.yaml` — no registry index file.
- **D-12:** YAML parsing via inline mini-parser — extend `frontmatter.cjs` with `parseYamlDocument(string)` OR create sibling `yaml-mini.cjs` (planner choice, keep `frontmatter.cjs` under ~400 lines; it's currently 379). Support scalars, lists, nested maps; NOT YAML 1.2 full (no anchors/tags/multi-doc).
- **D-13:** Workstream-spec schema locked. Required: `name`, `description`, `research_prompts[]`, `design_prompts[]`, `output_artifact_template`. Optional: `business_model_variants`, `region_overrides`, `audience_default`. Validation rules: `name === parent dir name`, all path fields must resolve to existing files.
- **D-14:** Phase 2 ships loader + ONE example workstream `brief/workstreams/_example/`; the 9 real workstreams are Phase 7.

**`/brief-status` (FND-10):**
- **D-15:** USER-LOCKED compact-dashboard output format (see CONTEXT.md lines 175-185 for exact rendering).
- **D-16:** Field rendering rules per field (see CONTEXT.md).
- **D-17:** Resilience — no errors on missing fields; render `— (none yet)`; one-line warning only if whole `brief:` map is missing AND past Phase 2.
- **D-18:** Command file: `commands/brief/status.md`. Logic helper: `brief/bin/lib/status.cjs` (NEW). Reads via existing `state.cjs` + `roadmap.cjs`. Read-only.
- **D-19:** Plain text stdout. NO `--json` flag in Phase 2.

### Claude's Discretion

- Internal organization of `status.cjs` (one function vs helper split)
- Field-name casing if YAML serializer conflicts
- Test file granularity for loader (one big test OR split discovery+validation)
- Whether inline YAML parser becomes `yaml-mini.cjs` OR extends `frontmatter.cjs` (keep under ~400 lines — currently 379)
- Exact CLAUDE.md `## Surface Caps` section wording (faithful to D-06..D-09)
- Commit ordering within Phase 2 (suggested 5-commit sequence in CONTEXT.md, mergeable/splittable)

### Deferred Ideas (OUT OF SCOPE)

- Pre-commit hook for surface cap enforcement → Phase 9 HRD-02
- `/brief-status --json` structured output → Phase 9 HRD-03
- 9 real built-in workstream YAMLs (BMC, GTM, FINANCIAL, OPS, COMPLIANCE, ROADMAP, BRAND, RISK, TECH-ARCH) → Phase 7
- Reduction of 61 inherited commands to ≤12 → Phase 9 HRD-02
- Reduction of 18 inherited agents to ≤8 skills → Phase 9 HRD-02
- `/brief-init` command → Phase 3 implicit via `/brief-define` OR Phase 9
- `gsd_state_version` reader for backwards-compat → rejected permanently per D-07
- Korean-language `/brief-status` toggle → Phase 9 HRD-03 localization
- `ajv` or equivalent schema validation library → rejected per A1 zero-deps rule

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **FND-05** | User can confirm A4 status (inherited state.cjs round-trips `state.brief.*` fields without loss) via smoke test in `tests/` | §Standard Stack, §Code Examples, §Validation Architecture, §Risk Flags R-1 |
| **FND-08** | User declares new built-in workstreams via YAML workstream-spec files, verified by adding one workstream without touching `.cjs` source | §Standard Stack (YAML mini-parser), §Code Examples, §Validation Architecture, §R-2 |
| **FND-09** | User sees ≤12 slash commands, ≤8 skills cap in CLAUDE.md | §Architecture Patterns (doc-only policy), §Validation Architecture |
| **FND-10** | User runs `/brief-status` and sees current phase, active workstream, return-stack depth, last ALIGN, last COMPLIANCE | §Standard Stack, §Code Examples, §Validation Architecture, §R-4 |

## Standard Stack

### Core (inherited, do not change)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | >=22 | Runtime | BRIEF constraint `[VERIFIED: package.json engines]` |
| `node:test` | built-in | Test runner for `tests/state-brief-roundtrip.test.cjs` | BRIEF constraint; `tests/helpers.cjs` provides `runGsdTools`, `createTempProject`, `cleanup` — direct precedents in `tests/state.test.cjs` and `tests/frontmatter.test.cjs` `[VERIFIED: read both files]` |
| `node:assert/strict` | built-in | Test assertions — use `assert.deepStrictEqual` for round-trip comparison | Precedent: `tests/frontmatter.test.cjs` uses this pattern throughout `[VERIFIED: tests/frontmatter.test.cjs:42]` |
| `c8@^11.0.0` | 11 | Coverage — 70% lines threshold | Inherited from Phase 1; `npm run test:coverage` already configured with `--include 'brief/bin/lib/*.cjs'` `[VERIFIED: package.json line 52]` |
| `brief/bin/lib/frontmatter.cjs` | internal | YAML frontmatter extract/reconstruct | The PIVOT POINT for A4 — see R-1 for empirical constraints `[VERIFIED: empirical round-trip test run during this research]` |
| `brief/bin/lib/state.cjs` | internal | STATE.md read/write primitive; exports `writeStateMd`, `cmdStateJson`, `cmdStateSnapshot`, `stateExtractField`, `buildStateFrontmatter` | The A4 target — `writeStateMd` (line 923) is the canonical write path; `cmdStateJson` (line 955) is the read path `[VERIFIED: module.exports at line 1591]` |
| `brief/bin/lib/roadmap.cjs` | internal | `cmdRoadmapAnalyze` returns `phases[]` with `number`, `name`, `phase_count`, `completed_phases` — used by /brief-status "Phase X of Y" line | `[VERIFIED: brief/bin/lib/roadmap.cjs:241-254]` |

### Supporting (NEW in Phase 2)

| Module | Purpose | Location | Rationale |
|--------|---------|----------|-----------|
| `brief/bin/lib/status.cjs` | `/brief-status` compact-dashboard renderer | NEW | D-18 mandates. Composes over `cmdStateJson` + `cmdRoadmapAnalyze`; no new parsing `[CITED: CONTEXT.md D-18]` |
| `brief/bin/lib/workstream-loader.cjs` (NEW — sibling of existing `workstream.cjs`) | Glob `brief/workstreams/*/spec.yaml`, parse each, validate against D-13 schema, return typed results | NEW | Existing `workstream.cjs` has a different concern — see R-2. Keep it separate to avoid namespace collision and because the business-workstream concept has no shared code with the parallel-milestone-workstream concept `[ASSUMED: separate-concern hypothesis; could be merged but naming collision is a real user-confusion risk]` |
| `brief/bin/lib/yaml-mini.cjs` OR extension of `frontmatter.cjs` | `parseYamlDocument(yamlString)` for full-doc YAML | NEW | D-12 mandates inline implementation. Current `frontmatter.cjs` is 379 lines; D-12 note caps at ~400. Extending in-place likely pushes over. Planner's call, but empirical math suggests sibling module `[VERIFIED: `wc -l brief/bin/lib/frontmatter.cjs` = 379]` |
| `brief/bin/lib/state-brief.cjs` (FALLBACK ONLY — Lane B per D-05) | Sidecar `.planning/state-brief.json` read/write | NEW IF A4 fails | Only materializes if A4 round-trip verification fails. Plan must draft the task but gate it on smoke-test outcome `[CITED: CONTEXT.md D-05]` |

### Alternatives Considered

| Instead of | Could Use | Why Rejected |
|------------|-----------|--------------|
| Inline YAML mini-parser | `js-yaml` (npm) | A1 zero-runtime-deps rule; PROJECT.md Key Decisions; package.json `dependencies: {}` verified empty `[VERIFIED: npm registry + Phase 1 ASSUMPTIONS.md]` |
| Inline YAML mini-parser | `gray-matter` (npm) | Same A1 rule; plus gray-matter is frontmatter-only, doesn't solve full-doc parsing `[CITED: CLAUDE.md Tech Stack]` |
| Inline YAML mini-parser | `npx --yes yaml-cli` per-parse | Wrong pattern for a hot path — spec.yaml is read on every `/brief-design` invocation; 2s+ cold-start npm overhead per call is unacceptable `[CITED: CLAUDE.md Marp decision — `npx --yes` reserved for batch operations like deck export]` |
| Sidecar JSON file | Monkey-patch `frontmatter.cjs` to support deeper nesting | Possible but scope creep. If A4 fails, sidecar is cleaner boundary; `frontmatter.cjs` changes touch inherited GSD code and have unknown blast radius across 198 test files. `[CITED: CONTEXT.md D-05 rationale]` |
| NEW `workstream-loader.cjs` | Extend existing `brief/bin/lib/workstream.cjs` | R-2: different concepts (parallel-milestone vs business-artifact). Merging creates name collision and semantic overloading. `[ASSUMED]` |

**Installation:** None — all work is internal, no npm package adds.

**Version verification:** Not applicable — zero new external dependencies.

## Architecture Patterns

### System Architecture Diagram

```
Phase 2 seams wiring (dataflow across a /brief-status invocation):

  User runs /brief-status
         │
         ▼
  commands/brief/status.md  ──── (auto-discovered by bin/install.js)
         │
         │  dispatches via brief-tools.cjs (or directly via workflow md)
         ▼
  brief/bin/lib/status.cjs  (NEW — one public function: renderStatus(cwd))
         │
         ├─► brief/bin/lib/state.cjs :: cmdStateJson(cwd)
         │         │
         │         └─► reads .planning/STATE.md frontmatter
         │              extracts `brief:` nested map
         │              (includes return_stack, gap_queue, last_gate_results,
         │               current_workstream per D-03)
         │
         ├─► brief/bin/lib/roadmap.cjs :: cmdRoadmapAnalyze(cwd)
         │         │
         │         └─► reads .planning/ROADMAP.md
         │              returns { phases[], current_phase, phase_count }
         │
         └─► formats compact dashboard (D-15 format)
                │
                ▼
            stdout (plain text, no --json flag per D-19)


Phase 2 seams wiring (A4 smoke test flow):

  tests/state-brief-roundtrip.test.cjs
         │
         ├─► createTempProject (helpers.cjs)
         ├─► seed .planning/STATE.md with initial frontmatter + body
         │
         ├─► Cycle 1:
         │    - read via extractFrontmatter OR cmdStateJson
         │    - inject `brief.*` payload (D-03 shape sampler)
         │    - write via writeStateMd
         │    - re-read
         │    - assert.deepStrictEqual(read, injected)
         │
         ├─► Cycle 2:
         │    - mutate one field
         │    - write again
         │    - re-read
         │    - assert.deepStrictEqual(read, mutated)
         │
         └─► cleanup


Workstream loader flow (FND-08 acceptance demo):

  brief/workstreams/_example/spec.yaml
         │
         ▼
  brief/bin/lib/workstream-loader.cjs :: loadWorkstreams(cwd)
         │
         ├─► glob('brief/workstreams/*/spec.yaml')
         │
         ├─► for each match:
         │    - read file
         │    - parse via yaml-mini (or frontmatter.cjs extension)
         │    - validate: name === parent dir, paths resolve
         │
         └─► returns [{ slug, description, research_prompts[], ... }]


STATE.md frontmatter shape Phase 2 installs:

  ---
  brief_state_version: 1.0      ← renamed from gsd_state_version (D-04)
  milestone: v1.0
  current_phase: 02
  status: executing
  last_updated: <ISO>
  progress:
    total_phases: 9
    completed_phases: 1
  brief:                          ← NEW (D-02, nested YAML map)
    return_stack: []              ← Phase 6 populates
    gap_queue: []                 ← Phase 6 populates
    last_gate_results:
      align: null                 ← Phase 4 populates
      audience: null              ← Phase 5 populates
      compliance: null            ← Phase 7 populates
    current_workstream: null      ← Phase 7 populates
  ---
```

### Recommended Project Structure

```
brief/
├── bin/
│   ├── brief-tools.cjs                    # dispatcher — extend `case 'status':` OR reuse `cmdStateJson`+`roadmap.cjs`
│   └── lib/
│       ├── state.cjs                      # line 814: rename gsd_state_version → brief_state_version (D-04)
│       ├── frontmatter.cjs                # optional extension site for parseYamlDocument (D-12)
│       ├── roadmap.cjs                    # consumed by status.cjs
│       ├── status.cjs                     # NEW — /brief-status renderer (D-18)
│       ├── workstream.cjs                 # UNCHANGED — parallel-milestone concern (R-2)
│       ├── workstream-loader.cjs          # NEW — business-workstream loader (FND-08)
│       ├── yaml-mini.cjs                  # NEW (if frontmatter.cjs extension exceeds 400 lines)
│       └── state-brief.cjs                # NEW IF A4 FAILS (D-05 Lane B)
├── workstreams/                           # NEW directory
│   └── _example/                          # Phase 2 ships ONE example (D-14)
│       ├── spec.yaml
│       └── templates/
│           └── artifact.md
└── workflows/
    └── status.md                          # OPTIONAL — if /brief-status needs multi-runtime dispatch

commands/
└── brief/
    └── status.md                          # NEW — command surface (D-18)

tests/
├── state-brief-roundtrip.test.cjs         # NEW — A4 smoke (D-01)
├── workstream-loader-discovery.test.cjs   # NEW — FND-08 glob test (planner may split)
├── workstream-loader-validation.test.cjs  # NEW — FND-08 schema validation
└── status-renderer.test.cjs               # NEW — FND-10 render test (against seeded state)

CLAUDE.md                                   # add `## Surface Caps` section (D-06..D-09)
.planning/STATE.md                          # migrate `gsd_state_version:` → `brief_state_version:` + initialize `brief:` map
```

### Pattern 1: Extend existing `brief-tools.cjs` dispatcher (status subcommand)

**What:** The dispatcher at `brief/bin/brief-tools.cjs` has a `switch(command)` block with cases like `'roadmap'`, `'phase'`, `'workstream'`, `'progress'`. Add a new `case 'status':` that invokes `require('./lib/status.cjs').renderStatus(cwd, raw)`.

**When to use:** This is the canonical pattern — ALL existing read-only commands (`progress`, `roadmap analyze`, `workstream progress`) dispatch this way. `/brief-status` mirrors the precedent.

**Example:**
```javascript
// brief/bin/brief-tools.cjs around line 772 (pattern from existing 'progress' case)
case 'status': {
  const status = require('./lib/status.cjs');
  status.renderStatus(cwd, raw);
  break;
}
```
Source: `/Users/agent/GSD-for-Business/brief/bin/brief-tools.cjs:772-776` (existing `progress` case as template) `[VERIFIED]`

### Pattern 2: Frontmatter round-trip via `cmdStateJson` + `writeStateMd`

**What:** `cmdStateJson(cwd, raw)` reads STATE.md, extracts frontmatter, rebuilds from body + disk scan. `writeStateMd(statePath, content, cwd)` writes STATE.md with synchronized frontmatter (via `syncStateFrontmatter` → `buildStateFrontmatter` → `reconstructFrontmatter`). The round trip is extract → build → reconstruct → write → re-extract.

**When to use:** A4 smoke test MUST exercise this exact path (not a bypass via `fs.writeFileSync`), because that's what the Phase 4/5/6/7 orchestrator steps will call.

**Example:**
```javascript
// tests/state-brief-roundtrip.test.cjs (skeleton)
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');
const { writeStateMd } = require('../brief/bin/lib/state.cjs');

test('round-trips brief.* nested map across two write cycles', () => {
  const tmpDir = createTempProject();
  const statePath = path.join(tmpDir, '.planning', 'STATE.md');

  // Cycle 1: seed + write + read
  const initialContent = `---
brief_state_version: 1.0
current_phase: 02
status: executing
brief:
  return_stack: []
  gap_queue: []
  last_gate_results:
    align: null
    audience: null
    compliance: null
  current_workstream: null
---

# Project State

**Current Phase:** 02
**Status:** executing
`;
  fs.writeFileSync(statePath, initialContent);
  writeStateMd(statePath, initialContent, tmpDir);

  const afterWrite1 = fs.readFileSync(statePath, 'utf-8');
  const fm1 = extractFrontmatter(afterWrite1);

  // Verify the brief: map survives the first write
  assert.ok(fm1.brief, 'brief namespace must survive first write');
  assert.deepStrictEqual(fm1.brief.return_stack, [], 'empty array preserved');
  assert.strictEqual(fm1.brief.current_workstream, null, 'null leaf preserved');
  // NOTE: See R-1 below — `null` may come back as string "null"

  // Cycle 2: write again (no change), verify no drift
  writeStateMd(statePath, afterWrite1, tmpDir);
  const afterWrite2 = fs.readFileSync(statePath, 'utf-8');
  const fm2 = extractFrontmatter(afterWrite2);
  assert.deepStrictEqual(fm2.brief, fm1.brief, 'second write-read cycle preserves brief map');
});
```
Source: Patterns from `/Users/agent/GSD-for-Business/tests/state.test.cjs:361-386` (frontmatter read-back test) `[VERIFIED]`

### Pattern 3: Install-side auto-discovery of command files

**What:** `bin/install.js` does NOT maintain per-command tuples. Instead, it copies `commands/brief/*.md` in bulk via `copyFlattenedCommands` (OpenCode/Kilo), `copyCommandsAsCodexSkills` (Codex), `copyCommandsAsCopilotSkills` (Copilot), etc. Adding `commands/brief/status.md` auto-registers it across ALL 14 runtimes.

**When to use:** For `/brief-status`, create `commands/brief/status.md` and it's automatically installed. **NO `bin/install.js` edit required.**

**Example:**
```
# commands/brief/status.md (skeleton — mirror commands/brief/progress.md)
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
</objective>

<execution_context>
@~/.claude/brief/workflows/status.md
</execution_context>

<process>
Execute the status workflow: invoke `brief-tools.cjs status` and print the compact-dashboard stdout verbatim.
</process>
```
Source: `/Users/agent/GSD-for-Business/bin/install.js:5488-5541` bulk copy block `[VERIFIED]`

**Note on frontmatter `name:`** — Current `commands/brief/progress.md` still reads `name: gsd:progress` (see R-3 for the drift); `/brief-status` MUST use `name: brief:status` to avoid joining the residual drift catalog.

### Pattern 4: YAML mini-parser extending `frontmatter.cjs`

**What:** `frontmatter.cjs` already has a state-machine line-by-line parser inside `extractFrontmatter` (lines 43-118). A `parseYamlDocument(yamlString)` function would reuse the same indentation-tracking stack approach, without the `---\n...\n---` framing.

**When to use:** D-12 inline YAML parsing for `workstream-spec.yaml`. Supported shapes per D-13: strings, numbers, booleans, null, lists of strings, nested maps. NO arrays-of-objects needed for workstream-spec (D-13 schema is flat — all list values are strings like `research_prompts: - "prompt one"`).

**Key constraint:** The workstream-spec schema is SHALLOWER than the D-03 state.brief schema. The parser needed for FND-08 is therefore SIMPLER than what A4 requires. This is why the sidecar option (D-05) is a clean separation — workstream-loader can use a simple parser; state.brief can fall back to JSON if YAML proves insufficient.

**Example:**
```javascript
// brief/bin/lib/frontmatter.cjs — NEW function appended
/**
 * Parse a full YAML document (no --- framing). Supports:
 * - scalars: string, number, boolean, null
 * - block lists of strings: key:\n  - item\n  - item
 * - inline lists of strings: key: [a, b, c]
 * - nested maps to 2 levels deep
 * Does NOT support: YAML anchors/tags, multi-doc, arrays of objects.
 */
function parseYamlDocument(yamlString) {
  // Reuse the logic from extractFrontmatter body (lines 50-114) but over a raw string.
  // Extract the inner loop into a shared helper if DRY is required.
  // ...
}
```
Source: inspiration from `/Users/agent/GSD-for-Business/brief/bin/lib/frontmatter.cjs:43-118` `[VERIFIED]`

### Anti-Patterns to Avoid

- **Don't bypass `writeStateMd` in the A4 test.** Writing STATE.md via `fs.writeFileSync` directly would PASS a round-trip test but NOT verify the production path. Phase 4/5/6/7 will always go through `writeStateMd` — that's the code the smoke test must exercise.
- **Don't extend existing `workstream.cjs`.** See R-2 — it's about parallel-milestone directories (`.planning/workstreams/<name>/`), not business-artifact workstreams (`brief/workstreams/<slug>/`). Different concerns, different consumers, different test surfaces.
- **Don't add `npx --yes` to the `/brief-status` hot path.** NPX cold start is 1-2 seconds; `/brief-status` must be interactive-feel (<200ms).
- **Don't pre-decide how to close the 61-command → 12-command gap in Phase 2.** D-09 forward-looking pointer is enough; Phase 9 HRD-02 owns the pruning.
- **Don't write the D-04 rename as a find-and-replace blitz without updating the 4 specific test assertions.** See R-3 — 4 lines in `tests/state.test.cjs` reference `gsd_state_version`; these will fail the moment the source rename lands if not updated in the same commit.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML 1.2 full compliance | A 500-line parser with anchors/tags/multi-doc | A ~100-line mini-parser for the closed D-13 schema | Per D-12 + A1; full YAML is overkill and adds maintenance surface |
| Atomic file locking for STATE.md writes | New lockfile logic | `brief/bin/lib/state.cjs :: acquireStateLock / releaseStateLock` (already used by `writeStateMd`) | Inherited primitive; GSD already solved this `[VERIFIED: state.cjs:874-935]` |
| Temp directory setup for tests | `fs.mkdtempSync` + `mkdirSync(phases, recursive)` | `tests/helpers.cjs :: createTempProject(prefix)` | Established convention; all 198 test files use it `[VERIFIED: helpers.cjs:79-83]` |
| Command registration across 14 runtimes | Per-runtime install tuples | Drop a `.md` file into `commands/brief/`; `bin/install.js` auto-discovers | See Pattern 3 — existing pattern handles Claude/Codex/Copilot/Antigravity/Cursor/Windsurf/Augment/Trae/Qwen/Cline/CodeBuddy/Kilo/OpenCode/Gemini `[VERIFIED]` |
| Roadmap phase + name + total_phases lookup | Re-parse ROADMAP.md | `roadmap.cjs :: cmdRoadmapAnalyze(cwd)` returning `{phases[], current_phase, phase_count, completed_phases}` | `[VERIFIED: roadmap.cjs:241-254]` |
| STATE.md frontmatter CRUD | Direct regex on STATE.md | `frontmatter.cjs :: extractFrontmatter / reconstructFrontmatter / spliceFrontmatter` + `state.cjs :: writeStateMd` | Inherited; atomic lock + sync baked in `[VERIFIED]` |
| JSON schema validation for gate findings | ajv | Inline property-existence checks (closed schema, 4 fields) | A1 zero-deps; Phase 2 writes null placeholders, not real findings |

**Key insight:** The biggest risk in Phase 2 is NOT building the wrong helper — it's inadvertently extending inherited `frontmatter.cjs` / `state.cjs` in a way that breaks any of the 198 tests, or in a way that silently degrades the round-trip guarantee. Minimize edits to inherited files; prefer sibling modules.

## Runtime State Inventory

This is a partial-refactor phase (one rename: `gsd_state_version` → `brief_state_version`). Non-applicable categories are stated explicitly.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | `.planning/STATE.md` frontmatter contains `gsd_state_version: 1.0` on line 2 of the current repo STATE.md `[VERIFIED]` | Data migration: one-shot edit in Phase 2 commit. No backwards-compat reader (D-04/D-07). |
| **Live service config** | None — BRIEF has no external services registered by name `[VERIFIED: no Datadog/Tailscale/Cloudflare/etc. integration exists]` | None |
| **OS-registered state** | None — no Windows Task Scheduler / launchd / systemd / pm2 registrations `[VERIFIED: BRIEF is a pure npm CLI; bin/install.js copies files into user config dirs]` | None |
| **Secrets/env vars** | `gsd_state_version` is a file-frontmatter field, not a secret or env var. No env vars reference this string. `[VERIFIED via: grep -rn gsd_state_version .]` | None |
| **Build artifacts / installed packages** | None — no compiled artifacts; no `egg-info` / `dist/` that caches the old name. `hooks/dist/` holds bundled hooks but is unrelated to `state.cjs` content. | None — the rename is pure source + one STATE.md line. |

**Test assertion residue (NOT runtime state per se, but a critical integration point):** 4 assertions in `tests/state.test.cjs` reference `gsd_state_version` literals — lines 350, 365, 382, 442. These must be updated in the same commit as the `state.cjs:814` rename, or the commit will fail the atomic-buildable-commit rule (D-09 Phase 1 inherited). `[VERIFIED: grep output]`

**The canonical Phase 2 question:** After `state.cjs:814` rewrites `brief_state_version: '1.0'` and `.planning/STATE.md` line 2 changes from `gsd_state_version: 1.0` → `brief_state_version: 1.0`, what else references the old string?
- Answer: ONLY the 4 test assertions + one comment in CONTEXT.md + documentation residue in `.planning/phases/01/10-PARTIAL-AUDIT.md` (audit record, do not edit). No runtime caches, no env vars, no OS state.

## Common Pitfalls

### Pitfall 1: A4 smoke test uses only scalar fixtures and declares victory

**What goes wrong:** Planner writes a smoke test that round-trips `brief.current_workstream: "bmc"` and `brief.return_stack: []` only. These ARE handled cleanly by `frontmatter.cjs`. Test passes. A4 is declared VERIFIED. Phase 4 ships, writes `brief.last_gate_results.align: {decision: 'ALIGNED', ...}`, and THE NESTED OBJECT gets serialized as `[object Object]` (see R-1).

**Why it happens:** The D-03 schema mixes simple and complex shapes. A cursory test that only exercises simple shapes will pass without catching the deep-object drift.

**How to avoid:** Test fixtures MUST include (a) at least one array-of-objects payload (`brief.return_stack: [{from_phase:..., to_phase:..., reason:..., pushed_at:...}]`), (b) at least one nested-object-at-leaf payload (`brief.last_gate_results.align: {decision, severity, findings_count, at}`), AND (c) the empirical round-trip comparison must use `assert.deepStrictEqual`, not `assert.ok` or `JSON.stringify` comparison.

**Warning signs:** Round-trip result type is `"[object Object]"` or `"object Object"` as a string; nested object loses fields; `null` comes back as `"null"` string.

### Pitfall 2: Adding `state-brief.cjs` sidecar WITHOUT wiring it into `/brief-status`

**What goes wrong:** A4 fails. Sidecar lane ships. `state-brief.cjs` is created. But `/brief-status` still reads from STATE.md frontmatter and finds empty values. User sees `— (none yet)` for everything forever.

**Why it happens:** D-05 mentions `/brief-status reads from sidecar instead of frontmatter` but the planner treats sidecar vs. frontmatter as a single-commit decision, not a branching task lane.

**How to avoid:** Write two PLAN.md files — lane-A (happy path) and lane-B (sidecar). In lane-B, `status.cjs` reads from `.planning/state-brief.json` (via `state-brief.cjs`) instead of extracting from frontmatter. The executor runs the A4 test FIRST, then picks the lane based on the outcome. Commits from the other lane are discarded.

**Warning signs:** Both lanes being merged into one plan; a single `status.cjs` draft that tries to handle both paths with conditionals.

### Pitfall 3: Workstream loader glob picks up templates or hidden files

**What goes wrong:** `glob('brief/workstreams/*/spec.yaml')` matches `brief/workstreams/.DS_Store/spec.yaml` or `brief/workstreams/templates/spec.yaml` (if a templates dir is a sibling of workstream dirs).

**Why it happens:** Planner forgets to exclude dotfiles or to document that `templates/` lives INSIDE each workstream, not as a sibling.

**How to avoid:** Glob already naturally excludes dotfiles (most glob libs do) — but verify. Also: D-10 explicitly places `templates/` INSIDE each workstream dir (`brief/workstreams/bmc/templates/`), so there's no sibling `templates/` directory to worry about. Validate by loading the `_example` workstream in the test and asserting the return type.

**Warning signs:** Test discovers more workstreams than exist; CI fails on macOS due to `.DS_Store`.

### Pitfall 4: `/brief-status` renders `"1 of null"` when ROADMAP.md is missing

**What goes wrong:** `cmdRoadmapAnalyze` returns `{ error: 'ROADMAP.md not found', ... }` (see roadmap.cjs:119). If `status.cjs` blindly uses `result.phase_count`, the renderer emits `"Phase 2 of undefined"`.

**Why it happens:** The render path assumes both STATE and ROADMAP are present. D-17 mandates resilience for `state.brief.*` but doesn't explicitly mention roadmap absence.

**How to avoid:** D-17 resilience extends implicitly to missing ROADMAP. If `cmdRoadmapAnalyze` returns an error object, render `Phase — of —` and append the one-line warning.

**Warning signs:** Status renderer crashes on `createTempProject` (which has no ROADMAP.md); test must exercise the missing-roadmap path.

### Pitfall 5: Surface caps section gets pruned by a later CLAUDE.md regeneration

**What goes wrong:** If Phase 3 regenerates CLAUDE.md (e.g., via `/brief-profile-user` or a template rebuild), the hand-authored `## Surface Caps` section is silently dropped.

**Why it happens:** CLAUDE.md was generated in Phase 1 via a delta-pattern (CONTEXT.md D-12). Any future regeneration that doesn't respect the caps section drops it.

**How to avoid:** Mark the caps section with a comment like `<!-- BRIEF PHASE 2 — DO NOT REGENERATE. See REQUIREMENTS.md FND-09. -->` so a future regeneration can skip it. Also: document in the Phase 2 summary that ANY Phase regenerating CLAUDE.md must preserve this section.

**Warning signs:** Phase 3+ discuss-phase mentions "regenerate CLAUDE.md" without "preserve Surface Caps."

## Code Examples

Verified patterns from inherited BRIEF code:

### Read STATE.md + extract `brief.*` via existing API

```javascript
// Using cmdStateJson (production path)
const { cmdStateJson } = require('./brief/bin/lib/state.cjs');

// This rebuilds frontmatter from body + disk scan and merges with existing frontmatter.
// Output is { gsd_state_version, milestone, current_phase, ..., brief: {...}, ... }.
// Note: the `brief:` field will be preserved via the `existingFm` path in cmdStateJson
// ONLY IF it's a field that `buildStateFrontmatter` doesn't overwrite — see state.cjs:971-981.

cmdStateJson(cwd, /*raw=*/true);
```
Source: `/Users/agent/GSD-for-Business/brief/bin/lib/state.cjs:955-984` `[VERIFIED]`

**IMPORTANT nuance:** `cmdStateJson` rebuilds frontmatter from body + disk scan and only preserves a fixed allowlist of frontmatter-only fields (`stopped_at`, `paused_at`, `status` under specific conditions). **The `brief:` field is NOT on that allowlist.** This means adding the `brief:` map to STATE.md will be LOST on the next `state json` call unless `buildStateFrontmatter` is taught about it OR `cmdStateJson` explicitly preserves it.

**Phase 2 planner action required:** Modify `buildStateFrontmatter` (state.cjs:714-836) to accept and preserve `brief.*`, OR modify `cmdStateJson` to extend the preservation allowlist. This is NOT in the current CONTEXT.md decisions but is a hard requirement for the round-trip to work. Planner should add a task for this.

### Write STATE.md via atomic lock + sync

```javascript
const { writeStateMd } = require('./brief/bin/lib/state.cjs');
// writeStateMd:
// 1. Invalidates disk scan cache
// 2. Calls syncStateFrontmatter which: extracts existing fm, strips body,
//    builds derived fm via buildStateFrontmatter, reconstructs YAML, prepends to body
// 3. Acquires lockfile (~/.planning/STATE.md.lock)
// 4. Writes atomically via atomicWriteFileSync
// 5. Releases lock

writeStateMd(statePath, contentWithBriefMap, cwd);
```
Source: `/Users/agent/GSD-for-Business/brief/bin/lib/state.cjs:923-935` `[VERIFIED]`

### Node:test round-trip pattern (mirrors existing frontmatter.test.cjs)

```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');

describe('state.brief.* round-trip (A4 verification, FND-05)', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = createTempProject(); });
  afterEach(() => { cleanup(tmpDir); });

  test('nested brief map with all D-03 shapes survives two write cycles', () => {
    const statePath = path.join(tmpDir, '.planning', 'STATE.md');

    // Shape sampler per D-03 + D-01
    const initialContent = [
      '---',
      'brief_state_version: 1.0',
      'current_phase: 02',
      'status: executing',
      'brief:',
      '  return_stack: []',                       // empty array
      '  gap_queue: []',                           // empty array
      '  last_gate_results:',                      // nested map, null leaves
      '    align: null',
      '    audience: null',
      '    compliance: null',
      '  current_workstream: null',                // scalar null
      '---',
      '',
      '# Project State',
      '**Current Phase:** 02',
      ''
    ].join('\n');

    fs.writeFileSync(statePath, initialContent);

    // Cycle 1 — write then re-read
    const { writeStateMd } = require('../brief/bin/lib/state.cjs');
    const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

    writeStateMd(statePath, initialContent, tmpDir);
    const fm1 = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));
    assert.ok(fm1.brief, 'brief namespace survives cycle 1');
    assert.deepStrictEqual(fm1.brief.return_stack, [], 'empty array preserved');

    // Cycle 2 — write again, verify no drift
    writeStateMd(statePath, fs.readFileSync(statePath, 'utf-8'), tmpDir);
    const fm2 = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));
    assert.deepStrictEqual(fm2.brief, fm1.brief, 'cycle 2 preserves brief map');
  });
});
```
Source: patterns from `tests/state.test.cjs` + `tests/frontmatter.test.cjs` `[VERIFIED]`

### Install.js is not touched — command auto-discovers

```bash
# Just create the file and run install; no install.js edit needed.
touch commands/brief/status.md
npm test                        # existing tests still pass
node bin/install.js --claude    # status.md automatically copied to ~/.claude/commands/brief/status.md
```
Source: `/Users/agent/GSD-for-Business/bin/install.js:5488-5541` — `copyFlattenedCommands` / `copyCommandsAs*Skills` all do bulk directory copy with a `brief` prefix arg `[VERIFIED]`

### Workstream loader skeleton

```javascript
// brief/bin/lib/workstream-loader.cjs (NEW)
const fs = require('fs');
const path = require('path');

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
    const parsed = parseYamlDocument(content); // from yaml-mini.cjs / frontmatter.cjs

    // D-13 validation
    if (parsed.name !== dir) {
      throw new Error(`Workstream ${dir}: name "${parsed.name}" does not match directory name`);
    }
    if (!parsed.output_artifact_template) {
      throw new Error(`Workstream ${dir}: missing required output_artifact_template`);
    }
    const tmplPath = path.join(root, dir, parsed.output_artifact_template);
    if (!fs.existsSync(tmplPath)) {
      throw new Error(`Workstream ${dir}: output_artifact_template "${parsed.output_artifact_template}" does not exist`);
    }

    specs.push({ slug: dir, ...parsed });
  }
  return specs;
}

module.exports = { loadWorkstreams };
```

### `_example` workstream YAML (FND-08 acceptance fixture)

```yaml
# brief/workstreams/_example/spec.yaml
name: _example
description: Example workstream proving the loader picks up a spec.yaml without code changes (FND-08).
research_prompts:
  - "What is the current state of X in the target market?"
  - "Who are the top 3 competitors for X?"
design_prompts:
  - "Draft an artifact describing X per the template."
output_artifact_template: templates/artifact.md
```

```markdown
<!-- brief/workstreams/_example/templates/artifact.md -->
---
audience: internal
confidentiality: internal-only
voice: direct
workstream: _example
---

# Example Artifact

This is a placeholder artifact produced by the _example workstream.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `gsd_state_version: 1.0` frontmatter field | `brief_state_version: 1.0` | Phase 2 D-04 | One-shot migration; no backwards-compat; 4 test assertions updated in same commit; one entry removed from Phase 9 HRD-05 residue catalog |
| Flat state namespace (no `brief:` map) | Nested `brief:` YAML map in STATE.md frontmatter | Phase 2 D-02 | New downstream-shaped schema for Phase 4/5/6/7 writers |
| No workstream loader (workstreams would have been bespoke code) | Workstream-as-YAML via `spec.yaml` + inline parser | Phase 2 FND-08 | Phase 7 adds 9 real workstreams via YAML only, zero .cjs change |
| Implicit surface count ("as many as we inherit") | Documented caps (≤12 commands, ≤8 skills) | Phase 2 FND-09 | Non-binding policy; Phase 9 HRD-02 enforces |

**Deprecated/outdated:**
- `gsd_state_version` (the literal string) — no new code should reference it
- Flat dot-notation frontmatter keys like `brief.return_stack:` — always use nested map per D-02
- Hand-rolling workstream orchestration in `.cjs` — use YAML spec + loader going forward

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A-P2-1 | Existing `workstream.cjs` (parallel-milestone concept) should remain untouched; new business-workstream loader is a sibling module | Architectural Responsibility Map; R-2 | LOW. If merged, naming collision — `cmdWorkstreamSet` (active) vs. `loadWorkstreams` (business) — but no runtime harm. Planner can override. |
| A-P2-2 | `frontmatter.cjs` extension vs `yaml-mini.cjs` sibling module is a size-driven choice (<400 line cap from CONTEXT.md) — current file is 379 lines, so extension likely requires sibling | Standard Stack; Claude's Discretion | LOW. If the extension is tight enough to fit, the planner may choose in-place. |
| A-P2-3 | The A4 round-trip test fixture MUST include nested-object-at-leaf AND array-of-objects shapes — scalar-only fixtures will pass without catching the real defect | Pitfall 1; R-1 | HIGH. If planner's test is too shallow, Phase 4 ships, writes a real gate-result object, and state silently corrupts. |
| A-P2-4 | `cmdStateJson` does NOT currently preserve arbitrary frontmatter fields outside its allowlist; the `brief:` map will need a preservation path | Code Examples (IMPORTANT nuance) | HIGH. Without this, the `brief:` map gets rebuilt-from-body (which doesn't contain it) on every `state json` call → silent data loss. This may not be caught by the direct writeStateMd/extractFrontmatter round-trip but WILL be caught by any test that calls `state json` between writes. |
| A-P2-5 | `createTempProject` from `tests/helpers.cjs` is sufficient fixture for the A4 smoke test; no additional helpers needed | Standard Stack | LOW. If the test needs ROADMAP.md, the planner adds one-line write inside the test. |
| A-P2-6 | `bin/install.js` bulk copy of `commands/brief/*.md` is sufficient registration for the new `status.md` across all 14 runtimes | Pattern 3; R-4 | MEDIUM. If a specific runtime has a per-command allow-list somewhere, it'd need an addition. Plan 07/08 from Phase 1 covered this; the pattern is proven working. |
| A-P2-7 | The D-04 rename is a 2-site change (`state.cjs:814` + `.planning/STATE.md:2`) plus 4 test-assertion updates — nothing else in source references the literal string | Runtime State Inventory | MEDIUM. `grep -rn gsd_state_version` was authoritative in this session; a subsequent agent rewriting state.cjs might introduce new references. Safety: the Phase 2 verification step should re-run the grep. |
| A-P2-8 | The `_example` workstream shipped as FND-08 acceptance demo will not be pruned until Phase 7 (which adds real workstreams) — and Phase 7 explicitly removes or replaces it | Phase boundary | LOW. If Phase 7 forgets, `_example` leaks into production. Planner should add a note in the Phase 2 summary. |

## Open Questions

1. **Should the `brief:` map in STATE.md be writable by the user at Phase 2 time?**
   - What we know: D-03 says fields are placeholders (null/empty) until Phase 4/5/6/7 populate them.
   - What's unclear: Does the Phase 2 commit's STATE.md migration include `brief:` initialization (empty values), or is that a task for Phase 3?
   - Recommendation: Initialize in Phase 2 — otherwise `/brief-status` has nothing to render and the `⚠ state.brief.* not initialized` warning fires perpetually between Phase 2 and Phase 3.

2. **Does `buildStateFrontmatter` need extension to recognize `brief:` as a preserved field?**
   - What we know: Current allowlist preserves `stopped_at`, `paused_at`, `status`; `brief:` will be dropped on any `state json` call.
   - What's unclear: Whether the planner has already accounted for this in D-03 schema adoption.
   - Recommendation: Plan a specific subtask for `buildStateFrontmatter` extension. This is likely the single most load-bearing code edit in Phase 2.

3. **Does the `/brief-status` output render `— (none yet)` OR `(not yet initialized)` for placeholder fields?**
   - What we know: D-15 shows `— (none active)` for workstream and `— (none yet)` for ALIGN/COMPLIANCE.
   - What's unclear: D-17 says "— (none yet)" universally; D-15 uses `none active` / `none yet` inconsistently.
   - Recommendation: Use D-15 exactly — user-locked. Pass through the strings verbatim from a constants table.

4. **Is CLAUDE.md the right location for Surface Caps, or should it live in `.planning/PROJECT.md`?**
   - What we know: D-06 specifies CLAUDE.md explicitly.
   - What's unclear: CLAUDE.md is at the root and is user-visible; PROJECT.md is in `.planning/`. Caps policy readership is the human maintainer, not the tool.
   - Recommendation: Follow D-06 — CLAUDE.md. PROJECT.md is already used for other project-level decisions; CLAUDE.md is what agents read on every run.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All test execution + runtime | Assumed ✓ (BRIEF requires >=22) | 22+ | None — hard requirement |
| `node:test` | `tests/state-brief-roundtrip.test.cjs` and new loader tests | ✓ (built-in, Node 22+) | — | None |
| `c8@11` | `npm run test:coverage` 70% threshold | ✓ (devDependency) | 11.0.0 | None — threshold is advisory, not gating |
| `npm` | Test invocation | ✓ | — | None |
| Git | Atomic commit infrastructure per Phase 1 D-09 | ✓ | — | None |
| `npx` (or external YAML libs) | Not used in Phase 2 | n/a | — | n/a |

**Missing dependencies with no fallback:** None identified.
**Missing dependencies with fallback:** None identified — Phase 2 is purely internal.

## Validation Architecture

Per `.planning/config.json` `workflow.nyquist_validation: true`, this phase REQUIRES per-requirement validation signals.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `node:test` (built-in, Node 22+) + `node:assert/strict` |
| Config file | `scripts/run-tests.cjs` (enumerates `tests/*.test.cjs`, passes to `node --test`) |
| Quick run command | `node --test tests/state-brief-roundtrip.test.cjs tests/workstream-loader-discovery.test.cjs tests/workstream-loader-validation.test.cjs tests/status-renderer.test.cjs` |
| Full suite command | `npm test` (runs `node scripts/run-tests.cjs` — all `tests/*.test.cjs` with `--test-concurrency=4`) |
| Coverage command | `npm run test:coverage` (c8 70% line threshold over `brief/bin/lib/*.cjs`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| **FND-05** | `state.cjs` round-trips `state.brief.*` nested map across 2 write cycles without loss | unit (smoke) | `node --test tests/state-brief-roundtrip.test.cjs` | ❌ Wave 0 |
| **FND-05** | `.planning/ASSUMPTIONS.md` appends A4 entry (VERIFIED or INVALIDATED per test outcome) | doc (grep) | `grep -q "^### A4 —" .planning/ASSUMPTIONS.md` (post-commit) | ❌ Wave 0 — verification script |
| **FND-05** | `brief_state_version: 1.0` present in `.planning/STATE.md`; `gsd_state_version` absent | doc (grep) | `grep -q "^brief_state_version:" .planning/STATE.md && ! grep -q "^gsd_state_version:" .planning/STATE.md` | ❌ Wave 0 — verification script |
| **FND-05** | `tests/state.test.cjs` assertions on `gsd_state_version` updated to `brief_state_version` | unit (regression) | `node --test tests/state.test.cjs` (must pass) | ✅ exists; 4 lines need update in Phase 2 commit |
| **FND-08** | Loader discovers `brief/workstreams/_example/spec.yaml` via glob | unit | `node --test tests/workstream-loader-discovery.test.cjs` | ❌ Wave 0 |
| **FND-08** | Loader rejects spec.yaml where `name !== parent dir name` with structured error | unit | `node --test tests/workstream-loader-validation.test.cjs` | ❌ Wave 0 |
| **FND-08** | Loader rejects spec.yaml with missing `output_artifact_template` | unit | same file | ❌ Wave 0 |
| **FND-08** | Loader rejects spec.yaml where `output_artifact_template` path doesn't resolve | unit | same file | ❌ Wave 0 |
| **FND-08** | Adding a second workstream dir (beyond `_example`) is picked up with zero `.cjs` changes | unit (end-to-end) | same file — fixture has 2 workstream dirs; assert loader returns 2 | ❌ Wave 0 |
| **FND-09** | CLAUDE.md contains `## Surface Caps` section with `≤12`, `≤8`, and forward-pointer to Phase 9 HRD-02 | doc (grep) | `grep -q "## Surface Caps" CLAUDE.md && grep -q "≤12" CLAUDE.md && grep -q "≤8" CLAUDE.md && grep -q "Phase 9 HRD-02" CLAUDE.md` | ❌ Wave 0 — verification script |
| **FND-09** | CLAUDE.md defines "user-facing" = "what bin/install.js registers under commands/<runtime>/brief/" | doc (grep) | `grep -q "user-facing" CLAUDE.md` + manual inspection | ❌ Wave 0 |
| **FND-10** | `/brief-status` renders one-screen compact dashboard against seeded `state.brief.*` | unit | `node --test tests/status-renderer.test.cjs` | ❌ Wave 0 |
| **FND-10** | `/brief-status` renders placeholders `— (none yet)` / `— (none active)` when `brief.*` fields are empty | unit | same file | ❌ Wave 0 |
| **FND-10** | `/brief-status` does not raise on missing STATE.md (prints `⚠ warning` line per D-17) | unit | same file | ❌ Wave 0 |
| **FND-10** | `/brief-status` renders `Phase X of Y (phase_name_short)` pulled from ROADMAP.md + STATE.md | unit | same file — fixture includes ROADMAP.md | ❌ Wave 0 |
| **FND-10** | `commands/brief/status.md` exists with frontmatter `name: brief:status` (NOT `gsd:status`) | doc (grep) | `grep -q "^name: brief:status" commands/brief/status.md` | ❌ Wave 0 |
| **(D-04 residue)** | Phase 1 HRD-05 drift catalog decremented by ≥1 item post-commit (the `gsd_state_version` test assertions) | npm-test regression delta | `npm test` — absolute failure count must decrease by ≥1 vs. Phase 1 closure baseline (63 source-drift failures) | ✅ `npm test` exists |

### Sampling Rate

- **Per task commit:** Run the quick command — four NEW test files plus `node --test tests/state.test.cjs` (to catch D-04 regressions).
- **Per wave merge:** Run `npm test` full suite; delta-cap discipline inherited from Phase 1 (baseline = 63 failures; Phase 2 must not increase the count by more than +1 even if new tests introduce initially-failing assertions, per Phase 1 empirical-baseline+delta-cap policy).
- **Phase gate:** Full suite green (relative to Phase 1 baseline) PLUS all FND-05/08/09/10 validation signals PASS before `/brief-verify-work`.

### Wave 0 Gaps

- [ ] `tests/state-brief-roundtrip.test.cjs` — covers FND-05 (A4 smoke)
- [ ] `tests/workstream-loader-discovery.test.cjs` — covers FND-08 (glob picks up spec.yaml)
- [ ] `tests/workstream-loader-validation.test.cjs` — covers FND-08 (schema errors)
- [ ] `tests/status-renderer.test.cjs` — covers FND-10 (compact dashboard render)
- [ ] `brief/workstreams/_example/spec.yaml` + `templates/artifact.md` — fixture for FND-08 end-to-end
- [ ] Test helpers: none — reuse existing `tests/helpers.cjs :: createTempProject / cleanup / runGsdTools`
- [ ] Framework install: none — `node:test` + `c8` already present

## Project Constraints (from CLAUDE.md)

| Directive | Source in CLAUDE.md | Phase 2 Impact |
|-----------|---------------------|----------------|
| **Zero external runtime dependencies** | "Runtime dependencies: Zero (verified)" | Forbids `js-yaml`, `ajv`, `gray-matter` as deps. Inline parser required for D-12. |
| **CommonJS-only core (`.cjs`)** | "CommonJS-only core" | All new files `.cjs` (NOT `.mjs` or TypeScript) |
| **Node.js 22+** | `engines.node: ">=22"` | `node:test` is built-in; use built-in `assert/strict` |
| **Must preserve atomic-commit + STATE.md file lock** | Architecture constraint | Phase 2 uses `writeStateMd` (which has the lock baked in) — do NOT bypass with `fs.writeFileSync` in production paths |
| **Multi-runtime (Claude/Codex/Gemini/OpenCode)** | "Must keep working across..." | `/brief-status` must render the same on all 4 runtimes; do not use runtime-specific features |
| **Hard rename `gsd-*` → `brief-*`, no aliases** | Phase 1 D-05/D-07 inherited | D-04 enforces — `gsd_state_version` goes away with no reader for the old name |
| **Testing: `node:test`, not Jest or vitest for bin layer** | CLAUDE.md Tech Stack | All new `tests/*.test.cjs` use `node:test` |
| **No emojis unless requested** | "Only use emojis if the user explicitly requests it" | `/brief-status` output uses plain ASCII; the ⚠ warning character in D-17 is acceptable per user-locked D-15 format |
| **BRIEF Workflow Enforcement** | CLAUDE.md directive | Phase 2 edits go through `/brief-plan-phase 2` → `/brief-execute-phase 2` → `/brief-verify-work 2` |

## Risk Flags

### R-1 (HIGH-ALARM) — `frontmatter.cjs` round-trip fails for D-03 shapes

**Evidence:** Direct empirical test run during this research session (2026-04-18):

```
Input YAML:
---
gsd_state_version: 1.0
brief:
  return_stack: []
  gap_queue: []
  last_gate_results:
    align: null
    audience: null
    compliance: null
  current_workstream: null
---

Parsed result:
{
  "gsd_state_version": "1.0",
  "brief": {
    "return_stack": [],
    "gap_queue": [],
    "last_gate_results": {
      "align": "null",         ← STRING "null", not JS null
      "audience": "null",
      "compliance": "null"
    },
    "current_workstream": "null"   ← STRING "null", not JS null
  }
}
```

**With realistic payload (frame objects, gate result objects):**
```
Input payload (JS object):
{
  brief: {
    return_stack: [{ from_phase: 'DESIGN', to_phase: 'DISCOVER', reason: 'gap', pushed_at: '2026-04-18' }],
    last_gate_results: { align: { decision: 'ALIGNED', severity: 'info', findings_count: 0, at: '...' } }
  }
}

reconstructFrontmatter output:
brief:
  return_stack:
    - [object Object]          ← COMPLETE LOSS
  last_gate_results:
    align: [object Object]     ← COMPLETE LOSS
```

**Root cause:** `reconstructFrontmatter` (frontmatter.cjs:120-182) has exactly 3 levels of hand-coded nesting. It calls `String(subsubval)` at the deepest level — any object at or below the 4th level becomes `[object Object]`. Arrays-of-objects hit this immediately via `lines.push('  - ' + typeof item === 'string' ? ... : item)` which falls through to `item.toString()`.

**Impact:** A4 test as-written in D-01 will pass with the NULL-leaf fixture but FAIL the moment Phase 4 writes `{decision, severity, ...}` into `last_gate_results.align`. Phase 6 writes frame objects into `return_stack` — same failure.

**Mitigation options:**
1. **Extend `reconstructFrontmatter` to support arrays-of-objects + arbitrary nesting.** Scope: ~40 lines of recursive serialization logic added to frontmatter.cjs. Risk: breaking existing 198 tests that depend on current serialization format. Unknown blast radius.
2. **Sidecar fallback (D-05 Lane B).** Scope: isolated — new `state-brief.cjs` + `status.cjs` reads from sidecar. Risk: bifurcates state into two files (violates PROJECT.md "single STATE.md primitive" spirit) but isolates risk.
3. **Strict scalar-only schema for `brief.*`.** Store serialized JSON strings in frontmatter (`brief.last_gate_results.align: '{"decision":"ALIGNED",...}'`). Parsing burden shifts to readers. Ugly but works within current frontmatter.cjs.

**Planner MUST decide explicitly** which path (1, 2, or 3) the "happy-path lane" actually is. D-01 as written reads as option 1; D-05 is option 2; option 3 is unmentioned. This research RECOMMENDS surfacing R-1 to the user before execution, because option 2's sidecar materially changes Phase 6's architecture and option 1's extension has unknown-blast-radius risk.

**Null preservation is a separate bug:** Even without objects/arrays-of-objects, `extractFrontmatter` parses the string `"null"` (not JS `null`). This is fixable with 1 line in the KEY:VALUE branch (`if (value === 'null') current.obj[key] = null;`) but needs to be explicitly addressed — every `last_gate_results.{align,audience,compliance}: null` placeholder currently round-trips as string.

### R-2 (MEDIUM) — Existing `workstream.cjs` is a different concern

`brief/bin/lib/workstream.cjs` (495 lines) handles **parallel milestone workstreams** — the `.planning/workstreams/<name>/` directory structure where each workstream is a separate ROADMAP/STATE/phases tree. It's about git-concurrent work on unrelated milestones.

The Phase 2 FND-08 concept is **business-artifact workstreams** — `brief/workstreams/<slug>/spec.yaml` declarative specs for BMC/GTM/FINANCIAL etc., all within the SAME milestone. Different namespace, different directory, different consumers.

**Risk:** Naming collision → user confusion → agent prompts conflating the two → bugs when someone says "activate the BMC workstream" and the code sets `getActiveWorkstream() = 'bmc'` (parallel-milestone semantics) instead of `state.brief.current_workstream = 'bmc'` (business-workstream semantics).

**Recommendation:** Create `workstream-loader.cjs` as a sibling, NOT by extending `workstream.cjs`. In CLAUDE.md, consider documenting the distinction in a "Conventions" note — or better, renaming the existing concept in a later phase (but out of scope for Phase 2).

### R-3 (LOW) — D-04 rename has exactly 4 test-assertion touchpoints

`grep -rn gsd_state_version` shows 6 references in production-relevant paths:
1. `brief/bin/lib/state.cjs:814` — the write site (D-04 target)
2. `.planning/STATE.md:2` — current repo state (migrate atomically)
3. `tests/state.test.cjs:350, 365, 382, 442` — 4 test assertions (must update in same commit per D-09 inherited)

**Recovery delta:** Phase 1 HRD-05 residue catalog (10-PARTIAL-AUDIT.md §4) counts 63 source-drift test failures. §4.3 "Source-code-behavior drift" aggregates `managed-hooks`, `read-guard`, `install-hooks-copy`, `update-custom-backup` — NONE of these reference `gsd_state_version`. §4.4 "Source content/count drift" has 13 failures across agents/workflows — also NONE reference `gsd_state_version`. **Looking at the 10-PARTIAL-AUDIT.md table, none of the 4 categories explicitly count test-assertion drift on `gsd_state_version` as a failing category — which means the 4 state.test.cjs assertions are CURRENTLY PASSING because the source still writes `gsd_state_version: '1.0'`.**

**Implication:** D-04 rename will turn those 4 tests from passing → failing → passing (within one commit) ONLY IF the test assertions are updated in the SAME commit. If split across commits, the 4 tests fail between commits — potentially hitting the delta-cap gate (baseline 63 + 4 = 67 > cap-effective 16 delta → HALT).

**Recovery delta quantification:** The `gsd_state_version` rename does NOT close any of the current 63 source-drift failures (those are in different categories). It's a NET-ZERO to the 63 count IF the 4 test-assertion updates happen in the same commit as the source rename. If NOT same commit → NET +4 → delta cap breach.

**Planner action:** The D-04 commit MUST bundle `state.cjs:814` + `tests/state.test.cjs` lines 350/365/382/442 + `.planning/STATE.md:2` into a single atomic commit to preserve the delta cap.

### R-4 (LOW) — `/brief-status` command auto-registration

`bin/install.js` does bulk directory copy. Adding `commands/brief/status.md` DOES NOT require an install.js edit. Tests should verify this by running `node bin/install.js --claude --local` in a tmpDir and asserting that `.claude/commands/brief/status.md` materializes. Existing tests like `tests/copilot-install.test.cjs` provide the precedent.

**Edge case:** If `commands/brief/status.md` has `name: brief:status` in frontmatter, the `CONV-07` conversion engine in `bin/install.js` needs to recognize `brief:` (not `gsd:`). Per Phase 1 Plan 10 §4.4, CONV-07 was updated to handle `brief:` — but the current `commands/brief/progress.md` STILL has `name: gsd:progress`, which is what keeps the 8 Copilot CONV engine-file tests failing. The `/brief-status` command should use `name: brief:status` to avoid this trap.

### R-5 (MEDIUM) — `buildStateFrontmatter` does not preserve arbitrary fields

See Code Examples "IMPORTANT nuance": `cmdStateJson` rebuilds frontmatter from body + disk scan and preserves only a fixed allowlist (`stopped_at`, `paused_at`, `status`). **The `brief:` map is not on that allowlist and will be silently lost on the next `state json` invocation.**

**Fix required in Phase 2:** Add `brief:` to the preservation path in `cmdStateJson` (state.cjs:955-984) AND in `syncStateFrontmatter` (state.cjs:852-868). This is a ~4-line change but it touches the most load-bearing function in state.cjs. The A4 smoke test's second write cycle would catch this — but only if the test explicitly calls `cmdStateJson` between writes, not just `writeStateMd` + `extractFrontmatter`.

**Stronger A4 test:** Include a cycle that calls `cmdStateJson` between writes to prove the preservation path works.

## Sources

### Primary (HIGH confidence)

- **BRIEF codebase (direct read):**
  - `/Users/agent/GSD-for-Business/brief/bin/lib/state.cjs` (1618 lines) — verified line 814 write site, `writeStateMd` lock semantics, `cmdStateJson` allowlist
  - `/Users/agent/GSD-for-Business/brief/bin/lib/frontmatter.cjs` (379 lines) — verified `extractFrontmatter` / `reconstructFrontmatter` semantics; the 3-level nesting limit
  - `/Users/agent/GSD-for-Business/brief/bin/lib/workstream.cjs` (495 lines) — verified it's about parallel-milestone workstreams, NOT business-workstream concept
  - `/Users/agent/GSD-for-Business/brief/bin/lib/roadmap.cjs` (360 lines) — verified `cmdRoadmapAnalyze` return shape
  - `/Users/agent/GSD-for-Business/brief/bin/brief-tools.cjs` (1255 lines) — verified dispatcher pattern at line 772 (progress case template for status)
  - `/Users/agent/GSD-for-Business/bin/install.js:5480-5541` — verified bulk-copy command registration pattern
  - `/Users/agent/GSD-for-Business/tests/helpers.cjs` — verified `runGsdTools`, `createTempProject`, `cleanup` API
  - `/Users/agent/GSD-for-Business/tests/state.test.cjs` — verified 4 `gsd_state_version` assertions at lines 350, 365, 382, 442
  - `/Users/agent/GSD-for-Business/tests/frontmatter.test.cjs` — verified `node:test` + `assert.deepStrictEqual` canonical pattern

- **Empirical test run (this research session, 2026-04-18):**
  - Direct `node -e "..."` invocation of `extractFrontmatter` + `reconstructFrontmatter` against D-03 schema — produced the R-1 evidence

- **Project planning artifacts:**
  - `.planning/phases/02-stable-seam.../02-CONTEXT.md` — verified 19 locked decisions (D-01..D-19)
  - `.planning/REQUIREMENTS.md` — verified FND-05/08/09/10 mapping
  - `.planning/ASSUMPTIONS.md` — verified A1 VERIFIED status; A4 still OUTSTANDING
  - `.planning/phases/01.../10-PARTIAL-AUDIT.md` — verified 63-failure breakdown by category (§4.1-§4.4)
  - `.planning/config.json` — verified `nyquist_validation: true`
  - `package.json` — verified `engines.node: >=22`, `c8@11`, `node:test` runner via `scripts/run-tests.cjs`

### Secondary (MEDIUM confidence)

- **CONTEXT.md D-05 sidecar design** — clean boundary for the A4-fails lane; rationale matches project's "minimize blast radius" posture

### Tertiary (LOW confidence — flagged for validation)

- None — all findings in this research are verified against code or project artifacts. No WebSearch / external sources consulted (not needed: this is pure internal infrastructure).

## Metadata

**Confidence breakdown:**
- Standard stack (inherited + new): HIGH — all files read directly; test patterns extracted from existing tests
- Architecture patterns: HIGH — dispatcher, auto-registration, test helpers all verified empirically
- A4 risk (R-1): HIGH — direct empirical counter-evidence; the round-trip defect is not theoretical
- D-04 recovery delta (R-3): MEDIUM — quantified via 10-PARTIAL-AUDIT.md categorization; planner should re-verify by running `npm test` before and after the D-04 commit
- Pitfalls: MEDIUM-HIGH — #1 directly derives from R-1; #5 is theoretical but low-probability
- Open questions: HIGH — all framed from direct code inspection, not speculation

**Research date:** 2026-04-18
**Valid until:** 2026-05-18 (30 days — Phase 2 work likely completes well within this window; if not, re-verify `npm view` and re-run the `frontmatter.cjs` empirical test)

---

*Phase: 02-stable-seam-anchor-schema-caps-workstream-as-config*
*Research: 2026-04-18*
