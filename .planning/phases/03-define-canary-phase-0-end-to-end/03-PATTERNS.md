# Phase 3: DEFINE Canary — Phase 0 End-to-End — Pattern Map

**Mapped:** 2026-04-19
**Files analyzed:** 20 (2 command.md, 2 workflow.md, 2 lib.cjs, 11 tests, 1 fixture, 1 install.js edit, 1 OBJECTIVES.md runtime artifact, config.json extension)
**Analogs found:** 19 / 20 (exact or role-match); 1 no-analog (OBJECTIVES.md runtime artifact — net-new schema)

---

## File Classification

| New / Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------------|------|-----------|----------------|---------------|
| `commands/brief/define.md` | command.md (slash dispatch shim) | request-response (user → workflow) | `commands/brief/status.md` | exact |
| `commands/brief/discover.md` (STUB) | command.md (slash dispatch shim) | request-response | `commands/brief/status.md` | exact |
| `brief/workflows/define.md` | workflow.md (prompt orchestration + lib dispatch) | request-response multi-turn | `brief/workflows/status.md` (+ any existing multi-step workflow with `AskUserQuestion` + `text_mode`) | exact (split: status.md for shape, any multi-turn workflow for AskUserQuestion+text_mode pairing) |
| `brief/workflows/discover.md` (STUB) | workflow.md (gate-only + placeholder body) | request-response | `brief/workflows/status.md` | exact |
| `brief/bin/lib/define.cjs` | lib.cjs (flow controller: mode dispatch, Korea-signal, config.json write, atomic commit) | CRUD + transform (read fixture/conversation → write 3 artifacts → commit) | `brief/bin/lib/status.cjs` (module shape) + `brief/bin/lib/config.cjs` `setConfigValue` (config.json write) + `brief/bin/lib/workstream-loader.cjs` (multi-step validation pattern) | role-match (composition — no single analog does all three) |
| `brief/bin/lib/objectives.cjs` | lib.cjs (OBJECTIVES.md reader/writer/validator; immutable-lock; stale-anchor; block-gate API) | CRUD + validation | `brief/bin/lib/status.cjs` (read-render shape) + `brief/bin/lib/frontmatter.cjs` `cmdFrontmatterSet` / `cmdFrontmatterValidate` (reader/writer/validator) | role-match |
| `brief/bin/brief-tools.cjs` (MODIFIED — add `define` + `objectives` cases) | router | dispatcher | existing `case 'status':` block at `brief-tools.cjs:779-783` | exact |
| `bin/install.js` | installer (NOT-modified — see adaptation notes) | file-copy | `bin/install.js:5615-5625` (Gemini block) + 5480-5630 region | exact (no modification required — directory-copy pattern auto-picks new files) |
| `.planning/OBJECTIVES.md` | runtime artifact (created by `/brief-define` Mode A at runtime) | write-once | **NO ANALOG** (net-new schema; see Example 4 in RESEARCH.md) | no-analog |
| `.planning/config.json` (EXTENDED) | plain JSON (extended with `brief.*` namespace) | CRUD | existing `.planning/config.json` read via `config.cjs` `setConfigValue` | exact |
| `tests/fixtures/korea-first-b2c.cjs` | test fixture module (CommonJS export) | read-only (consumed by tests) | no direct analog in `tests/`; closest is the inline-fixture `state-brief-roundtrip.test.cjs` seed blocks | role-match (CJS module export shape is idiomatic Node — no special analog needed) |
| `tests/brief-define-mode-a.test.cjs` | integration test (A4-style round-trip: fixture → write → read → atomic-commit assertion) | test | `tests/state-brief-roundtrip.test.cjs` (Cycle 1/2/3/Placeholder structure) | exact |
| `tests/brief-define-mode-b.test.cjs` | integration test (immutable-lock rejection + `--unlock-intent` escape) | test | `tests/frontmatter-cli.test.cjs` (validation-failure + structured error JSON) | role-match |
| `tests/brief-objectives-roundtrip.test.cjs` | unit test (OBJECTIVES.md frontmatter round-trip via D-20 serializer) | test | `tests/frontmatter-roundtrip.test.cjs` (roundTrip helper + deepStrictEqual) | exact |
| `tests/brief-objectives-immutable-lock.test.cjs` | unit test (writer rejects immutable-field mutation) | test | `tests/frontmatter-cli.test.cjs` (validation CLI exit code) | role-match |
| `tests/brief-config-brief-namespace.test.cjs` | unit test (config.json `brief.*` preserves on merge) | test | `tests/state-brief-roundtrip.test.cjs` Cycle 3 (JSON rebuild preservation) + `tests/frontmatter-cli.test.cjs` (JSON-file CRUD) | role-match |
| `tests/brief-define-korea-signal.test.cjs` | unit test (keyword regex detection) | test | `tests/frontmatter-roundtrip.test.cjs` (pure lib-layer unit, no disk I/O) | role-match |
| `tests/brief-define-atomic-commit.test.cjs` | integration test (`git log --name-only -1` assertion over 3 files) | test | Subset of `tests/state-brief-roundtrip.test.cjs` Cycle 3 (runGsdTools + JSON parse) | role-match |
| `tests/brief-define-canary.test.cjs` | architectural/structural test (command→workflow→lib wired; exports present) | test | `tests/architecture-counts.test.cjs` (file existence + content regex on source tree) | exact |
| `tests/brief-discover-gate.test.cjs` | smoke test (exit ≠ 0 + Korean recovery message) | test | `tests/status-renderer.test.cjs` (runGsdTools + output-match regex) + `tests/frontmatter-cli.test.cjs` (exit code + JSON error) | role-match |
| `tests/brief-define-stale-anchor.test.cjs` | smoke test (`fs.utimesSync` backdate + activity-entry gating) | test | `tests/read-guard.test.cjs` (time-based behavior + positive/negative cases) | role-match |
| `tests/brief-define-text-mode-parity.test.cjs` | parity test (AskUserQuestion vs text_mode differential) | test | `tests/ask-user-questions-fallback.test.cjs` (workflows-directory scan + text_mode detection) | role-match (parity is new; the analog only guards workflow-markdown fallback syntax) |

---

## Pattern Assignments — Grouped by Wave-Correspondence

### Wave A — OBJECTIVES Foundation + Frontmatter Serializer Reuse

---

#### `brief/bin/lib/objectives.cjs` (lib.cjs, CRUD + validation)

**Primary analog (module shape):** `brief/bin/lib/status.cjs` (124 lines — same size class as target)
**Secondary analogs:**
- `brief/bin/lib/frontmatter.cjs:366-407` (cmdFrontmatterSet, cmdFrontmatterValidate — writer/validator primitive shape)
- `brief/bin/lib/workstream-loader.cjs:42-107` (glob-load + validate + throw-on-violation pattern)

**Imports pattern** (lift from `status.cjs:20-23`):
```javascript
const fs = require('fs');
const path = require('path');
const { planningPaths, output, atomicWriteFileSync, error } = require('./core.cjs');
const { extractFrontmatter, spliceFrontmatter, reconstructFrontmatter } = require('./frontmatter.cjs');
```

**Module exports shape** (mirror `status.cjs:123` + Canary Test contract — `tests/brief-define-canary.test.cjs` asserts these five exports):
```javascript
module.exports = {
  writeObjectivesMd,
  readObjectivesMd,
  validateObjectivesComplete,   // block-gate API
  checkStaleAnchor,              // 48h mtime check
  enforceImmutableLock,          // Mode B writer refuser
};
```

**Read/write core pattern** (adapt from `frontmatter.cjs:366-380` `cmdFrontmatterSet`):
```javascript
function writeObjectivesMd(cwd, payload, opts = {}) {
  const fullPath = path.join(planningPaths(cwd).base || path.join(cwd, '.planning'), 'OBJECTIVES.md');
  let content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : '';
  const fm = extractFrontmatter(content);

  // Immutable-lock enforcement (Pitfall 1 — writer-layer refuser, D-07)
  if (!opts.unlockIntent) {
    enforceImmutableLock(fm, payload);   // throws structured Korean error if immutable mutated
  }

  // Merge payload into frontmatter; preserve body sections.
  const merged = { ...fm, ...payload.frontmatter };
  const newContent = spliceFrontmatter(content, merged);
  atomicWriteFileSync(fullPath, newContent);
}
```

**Validation / block-gate pattern** (lift schema approach from `frontmatter.cjs:343-347` `FRONTMATTER_SCHEMAS` + `cmdFrontmatterValidate:396-407`):
```javascript
const OBJECTIVES_SCHEMA = {
  required: ['business_model', 'region', 'audience_policy', 'compliance_packs',
             'status', 'immutable_items'],
};

function validateObjectivesComplete(cwd) {
  const fullPath = path.join(path.join(cwd, '.planning'), 'OBJECTIVES.md');
  if (!fs.existsSync(fullPath)) {
    return { valid: false, missing: ['FILE_NOT_EXIST'], present: [] };
  }
  const fm = extractFrontmatter(fs.readFileSync(fullPath, 'utf-8'));
  const missing = OBJECTIVES_SCHEMA.required.filter(f => fm[f] === undefined || fm[f] === null);
  const present = OBJECTIVES_SCHEMA.required.filter(f => fm[f] !== undefined && fm[f] !== null);
  return { valid: missing.length === 0, missing, present };
}
```

**Stale-anchor pattern** (new — but mtime comparison is 1-line idiom, no analog needed; consistent with `core.cjs` util style):
```javascript
function checkStaleAnchor(cwd) {
  const fullPath = path.join(cwd, '.planning', 'OBJECTIVES.md');
  if (!fs.existsSync(fullPath)) return { stale: false, reason: 'missing' };
  const stat = fs.statSync(fullPath);
  const ageMs = Date.now() - stat.mtimeMs;
  const THRESHOLD_MS = 48 * 60 * 60 * 1000;
  return { stale: ageMs > THRESHOLD_MS, age_hours: Math.floor(ageMs / 3600000) };
}
```

**Adaptation notes:**
- **NO new YAML parser** — D-20 `frontmatter.cjs` serializer already handles the OBJECTIVES.md shapes (nested maps, arrays-of-strings, null). Verified by `tests/frontmatter-roundtrip.test.cjs`.
- **Immutable-lock is load-bearing against Pitfall #3** (CONTEXT D-07). Two-layer enforcement: UI-layer hides immutable items in Mode B + writer-layer refuses via `enforceImmutableLock`. Both layers MUST ship together; shipping only writer-layer creates Pitfall #1 in 03-RESEARCH.md.
- **Keep ≤ ~300 lines** per Phase 2 discipline (frontmatter.cjs is 420 at capacity; don't re-extend).
- **`output()` from core.cjs** is the correct stdout primitive when this module is invoked via brief-tools.cjs dispatcher (NOT `console.log` — that path bypasses raw/JSON handling in `brief-tools.cjs:344-375`).

---

#### `tests/brief-objectives-roundtrip.test.cjs` (unit, D-20 round-trip)

**Primary analog:** `tests/frontmatter-roundtrip.test.cjs:38-80`

**Pattern to lift** (helper + assertion pattern):
```javascript
const { extractFrontmatter, reconstructFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

function roundTrip(obj) {
  const yaml = reconstructFrontmatter(obj);
  const wrapped = `---\n${yaml}\n---\n\n# body\n`;
  return extractFrontmatter(wrapped);
}

describe('OBJECTIVES.md frontmatter round-trip (Phase 3 D-20 reuse)', () => {
  test('compliance_packs array + immutable_items array + scalar fields round-trip', () => {
    const input = {
      brief_objectives_version: '1.0',
      status: 'ready',
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
      immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
    };
    const parsed = roundTrip(input);
    assert.deepStrictEqual(parsed, input);
  });
});
```

**Adaptation notes:**
- **DO NOT write a new round-trip harness** — the helper + `assert.deepStrictEqual` pattern is already blessed.
- **Scalar-type contract:** per `tests/frontmatter-roundtrip.test.cjs:20-28` comment, `extractFrontmatter` returns non-array / non-null scalars as strings. Write fixtures with string scalars (e.g., `brief_objectives_version: '1.0'` NOT `1.0`).
- **Run against the existing D-20 serializer as-is** — if this test fails RED, it means OBJECTIVES.md uses a shape D-20 didn't cover, and the planner must extend frontmatter.cjs FIRST. Research (§Example 4 note) says the shape is covered; verify.

---

### Wave B — Mode A Greenfield Flow (command + workflow + lib controller)

---

#### `commands/brief/define.md` (command.md, slash dispatch shim)

**Primary analog:** `commands/brief/status.md` (verbatim — 22 lines)

**Frontmatter + body pattern** (lift from `commands/brief/status.md:1-21`):
```markdown
---
name: brief:define
description: Conversational intent extractor — Mode A greenfield or Mode B amendment. Writes .planning/OBJECTIVES.md.
argument-hint: "[--amend] [--unlock-intent]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - AskUserQuestion
---
<objective>
Guide a business planner through BRIEF's DEFINE phase.
Mode A: 20–35 min greenfield intent extraction with Push Twice + Language Precision + Dream State Mapping.
Mode B: 3–10 min amendment of mutable sections only; Immutable Intent locked.
</objective>

<execution_context>
@~/.claude/brief/workflows/define.md
</execution_context>

<process>
Execute the define workflow: parse flags, run mode-select, branch to Mode A or Mode B, write artifacts, commit atomically.
</process>
```

**Adaptation notes:**
- `argument-hint` MUST list both `--amend` and `--unlock-intent` — these are user-discoverable flags per CONTEXT D-07.
- `allowed-tools` extends `status.md`'s read-only set with `Write`, `Edit`, and `AskUserQuestion` — Mode A writes three artifacts, Mode B edits OBJECTIVES.md, and both use `AskUserQuestion` as the button-seed-then-free-text primitive (RESEARCH.md Pattern 1).
- `@~/.claude/brief/workflows/define.md` is the canonical install-time path (verified at `commands/brief/status.md:15`).

---

#### `brief/workflows/define.md` (workflow.md, prompt orchestration)

**Primary analog (structure):** `brief/workflows/status.md` — 8 lines but defines the dispatch contract
**Secondary analog (AskUserQuestion + text_mode mandate):** Every file scanned by `tests/ask-user-questions-fallback.test.cjs:46-82` — if the workflow uses `AskUserQuestion`, it MUST include both `text_mode` (or `text mode`) AND (`plain-text` OR `plain text` OR `numbered list`) near the argument-parsing section.

**Purpose + dispatch pattern** (from `status.md:1-8`):
```markdown
<purpose>
Guide a business planner through BRIEF's conversational intent extraction.
Mode A (Greenfield) runs the full Push Twice + Language Precision + Dream State Mapping flow.
Mode B (Amendment) revisits mutable items only; Immutable Intent is locked.
</purpose>

<process>

## Step 0: Flag Parsing
Check invocation flags:
- `--amend` → force Mode B entry (skip mode-select question)
- `--unlock-intent` → flag set for Mode B writer to allow Immutable Intent edits

Set TEXT_MODE=true if --text is present in $ARGUMENTS OR `workflow.text_mode` from
init JSON is true. When TEXT_MODE is active, replace every AskUserQuestion call
with a plain-text numbered list and ask the user to type their choice number.

## Step 1: Entry Mode Selection (D-05)
[... AskUserQuestion with 2 options (Mode A / Mode B) + immediate free-text follow-up ...]

## Step 2A: Mode A (Greenfield)
[... 2A.1 opening free-text, 2A.2–2A.3 Push Twice + Language Precision,
 2A.4–2A.6 Dream State Mapping, 2A.7 Claude-proposes draft,
 2A.8 4-config inference + Korea-signal pre-check ...]

## Step 2B: Mode B (Amendment)
[... 2B.1 read existing OBJECTIVES.md, 2B.2 mutable-section selection
 with immutable items shown with 🔒 marker per Pitfall 1 two-layer enforcement ...]

## Step 3: Atomic Write + Commit
Invoke `brief-tools define apply` which:
  1. atomicWriteFileSync to .planning/OBJECTIVES.md
  2. Read → merge → atomicWriteFileSync to .planning/config.json
  3. STATE.md last_activity touch via existing state.cjs
  4. brief-tools commit "feat(03): DEFINE <mode> — <one-line-summary>" --files .planning/OBJECTIVES.md .planning/config.json .planning/STATE.md

## Step 4: Next-Step Hint
Print: "다음 단계: /brief-discover — 선택하신 연구 영역으로 분야 조사를 시작합니다."
</process>
```

**Adaptation notes:**
- **TEXT_MODE fallback block is NON-OPTIONAL** — `tests/ask-user-questions-fallback.test.cjs` scans every workflow and fails CI if the pair is missing. Copy the canonical text verbatim from the test file's error message (lines 70-76).
- **Keep under ~400 lines** (RESEARCH.md A6 assumption). Mode A + Mode B share config-inference/confirm prompts; reuse subsections rather than duplicate.
- **Korean-default prompts** per CONTEXT `<specifics>` — English templates are a Nice-to-Have per RESEARCH.md §Risk-Adjusted Scoping #8.
- **Push Twice is IMPLICIT** (D-03) — NO visible `[Push Twice]` label in the prose (Pitfall 3 in RESEARCH.md Pattern 2).

---

#### `brief/bin/lib/define.cjs` (lib.cjs, flow controller)

**Primary analog (module shape):** `brief/bin/lib/status.cjs`
**Secondary analogs:**
- `brief/bin/lib/config.cjs:319-354` `setConfigValue` (plain JSON read-merge-write via `withPlanningLock`)
- `brief/bin/lib/workstream-loader.cjs` (multi-step validation + structured Error throws)

**Imports pattern** (hybrid of `status.cjs:20-23` + `config.cjs:7`):
```javascript
const fs = require('fs');
const path = require('path');
const {
  planningPaths, planningDir, output, error, atomicWriteFileSync, withPlanningLock,
} = require('./core.cjs');
const objectives = require('./objectives.cjs');
```

**Config.json 4-field write pattern** (lift from `config.cjs:319-354` `setConfigValue`):
```javascript
function writeConfigBrief(cwd, briefPayload) {
  const configPath = path.join(planningDir(cwd), 'config.json');
  return withPlanningLock(cwd, () => {
    let cfg = {};
    if (fs.existsSync(configPath)) {
      cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    // Merge under `brief` namespace — preserve other config keys (config.cjs merge discipline)
    cfg.brief = { ...(cfg.brief || {}), ...briefPayload };
    atomicWriteFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf-8');
    return { updated: true, brief: cfg.brief };
  });
}
```

**Korea-signal detection pattern** (D-11 + RESEARCH.md Pitfall 2 — keyword regex with over-suggest bias):
```javascript
// Any-match triggers pre-check; over-suggest bias per D-11
const KOREA_SIGNAL_PATTERNS = [
  /[\u3131-\u318E\uAC00-\uD7A3]/,      // Any Hangul character
  /\b(Korea|Korean|KR|Seoul|won|PIPA|ISMS|MyData)\b/i,
  /\b(핀테크|카카오|네이버|토스)\b/,
];
function detectKoreaSignals(transcript) {
  return KOREA_SIGNAL_PATTERNS.some(re => re.test(transcript));
}
```

**Atomic 3-artifact commit pattern** (lift from the `status.cjs` dispatch style; invoke via `brief-tools commit` per Phase 1 D-09 + Phase 2 Plan 02-04 precedent). Pseudocode reference — actual call is via `brief-tools.cjs commit` subcommand:
```javascript
async function performAtomicCommit(cwd, mode, summary) {
  // NOTE: all three writes must land to disk BEFORE commit is invoked.
  // Pitfall 3 protection: catch failures from each atomicWriteFileSync and
  // roll back via git-reset-on-any-failure BEFORE calling brief-tools commit.
  const { execFileSync } = require('child_process');
  const toolsPath = path.join(__dirname, '..', 'brief-tools.cjs');
  const msg = `feat(03): DEFINE ${mode} — ${summary}`;
  execFileSync(process.execPath, [
    toolsPath, 'commit', msg,
    '--files',
    '.planning/OBJECTIVES.md',
    '.planning/config.json',
    '.planning/STATE.md',
  ], { cwd, stdio: 'pipe' });
}
```

**Fixture-aware test path** (RESEARCH.md §Mocking AskUserQuestion in Tests — required for every Mode-A test):
```javascript
async function cmdDefineApply(cwd, flags) {
  if (flags.fixture) {
    const fixturePath = path.resolve(__dirname, '..', '..', '..',
      'tests', 'fixtures', flags.fixture);
    const fixture = require(fixturePath);
    return applyFromFixture(cwd, fixture);
  }
  return runInteractiveModeA(cwd);
}
```

**Adaptation notes:**
- **Use `withPlanningLock`** for config.json writes (`core.cjs:617-625` — provides STATE.md-file-lock semantics across the 3-artifact transaction; matches Phase 1 D-09 atomicity discipline).
- **`atomicWriteFileSync`** (not `fs.writeFileSync`) — temp-then-rename survives mid-write process crashes (Pitfall 3 mitigation).
- **No `config-set` dispatcher** — `config.cjs:370-372` rejects unknown keys; `brief.business_model` etc. would need `VALID_CONFIG_KEYS` extension OR direct merge. **Direct merge is cleaner** (RESEARCH.md confirms plain JSON, no allowlist needed); do NOT extend `VALID_CONFIG_KEYS` just to shoehorn through `cmdConfigSet`.
- **No silent fallthrough** — if any of the three writes errors, abort BEFORE invoking `brief-tools commit` and print a recoverable error with the full path of the failing file (Pitfall 3, Pitfall 5 in RESEARCH.md).

---

#### `brief/bin/brief-tools.cjs` (MODIFIED — dispatcher cases)

**Primary analog:** the existing `case 'status':` block at `brief-tools.cjs:779-783`.

**Pattern to lift (verbatim):**
```javascript
case 'status': {
  const status = require('./lib/status.cjs');
  status.renderStatus(cwd, raw);
  break;
}
```

**Phase 3 new cases (add immediately after `case 'status':`):**
```javascript
case 'define': {
  const subcommand = args[1];
  const define = require('./lib/define.cjs');
  if (subcommand === 'apply') {
    const { fixture, amend, 'unlock-intent': unlockIntent } =
      parseNamedArgs(args, ['fixture'], ['amend', 'unlock-intent']);
    return define.cmdDefineApply(cwd, { fixture, amend, unlockIntent }, raw);
  } else {
    error('Unknown define subcommand. Available: apply');
  }
  break;
}

case 'objectives': {
  const subcommand = args[1];
  const objectives = require('./lib/objectives.cjs');
  if (subcommand === 'validate') {
    return objectives.cmdValidate(cwd, raw);      // block-gate entry
  } else if (subcommand === 'stale-check') {
    return objectives.cmdStaleCheck(cwd, raw);
  } else {
    error('Unknown objectives subcommand. Available: validate, stale-check');
  }
  break;
}

case 'discover': {
  // Phase 3 STUB — invoke gate, emit Phase 5 placeholder on pass.
  const discover = require('./lib/define.cjs');   // stub lives here OR inline
  return discover.cmdDiscoverStub(cwd, raw);
  break;
}
```

**Adaptation notes:**
- **Lazy-require** (`const define = require(...)` inside `case`) matches `brief-tools.cjs:780` idiom — avoids eager-load cost for commands not invoked.
- **`parseNamedArgs`** is the helper at `brief-tools.cjs:197-209` — use it for `--fixture`/`--amend`/`--unlock-intent`; do NOT hand-roll argv scanning.
- The **Canary structural test** (`tests/brief-define-canary.test.cjs`) asserts these three case-blocks are present by string match (`case 'define'`, `require(./lib/define.cjs)`, `case 'objectives'`) — keep identifier spelling stable.

---

### Wave C — config.json Extension + Korea-Signal + Atomic Commit

---

#### `.planning/config.json` (EXTENDED — `brief.*` namespace)

**Analog:** existing `.planning/config.json` (plain JSON; verified in RESEARCH.md §Example 5 + A2)

**Shape to add (RESEARCH.md Example 5 verbatim):**
```json
"brief": {
  "business_model": "b2c",
  "region": "kr",
  "audience_policy": "internal",
  "compliance_packs": ["PIPA", "ISMS-P", "MyData"]
}
```

**Adaptation notes:**
- **No D-21-style allowlist extension needed** — config.json is plain JSON without the frontmatter-serializer allowlist (contrast with STATE.md). Verified via direct inspection (RESEARCH.md A2).
- **DO NOT add `brief.*` to `config.cjs:14-52` `VALID_CONFIG_KEYS`** — those are the keys `cmdConfigSet` exposes to end users. Phase 3 writes `brief.*` via **internal** `writeConfigBrief` in `define.cjs`, not via `cmdConfigSet`. This keeps the dynamic 4-config namespace out of the user-facing `config-set` surface per CLAUDE.md Surface Caps discipline.
- **Preserve all existing keys** on merge — Cycle 2 of `tests/brief-define-mode-a.test.cjs` asserts `config.model_profile`, `config.workflow.nyquist_validation` untouched (RESEARCH.md Cycle 2 assertion).

---

#### `tests/fixtures/korea-first-b2c.cjs` (CJS fixture module)

**Analog:** no direct fixture module exists; the inline seed blocks in `tests/state-brief-roundtrip.test.cjs:37-78` demonstrate the fixture-shape convention.

**Pattern (RESEARCH.md §Canonical Fixture — Korea-First B2C Persona, lines 1058-1155):**
```javascript
module.exports = {
  persona_name: '한국-첫-B2C-피트니스-앱-기획자',
  entry_mode: 'A',
  conversation_transcript: { /* opening, push_twice_*, language_precision_*, dream_state {now,3m,12m} */ },
  korea_signals_detected: [/* list for assertion */],
  expected_configs: {
    business_model: 'b2c',
    region: 'kr',
    audience_policy: 'internal',
    compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
  },
  expected_objectives: {
    frontmatter: { /* ... */ },
    body_sections_present: [/* ... */],
  },
};
```

**Adaptation notes:**
- **One fixture, not many** — RESEARCH.md §Risk-Adjusted Scoping flag-to-planner: "A multi-fixture test harness → STOP. One Korea-first B2C fixture is enough for Phase 3 canary."
- **Fixture is REQUIREd via `require()`**, not JSON-parsed — CJS export allows inline comments + computed fields.
- **Path from `define.cjs`:** `path.resolve(__dirname, '..', '..', '..', 'tests', 'fixtures', flags.fixture)` per RESEARCH.md §Mocking pattern.

---

#### `tests/brief-define-mode-a.test.cjs` (integration, A4-style)

**Primary analog:** `tests/state-brief-roundtrip.test.cjs` (entire file — Cycle 1/2/3/Placeholder structure)

**Imports pattern** (lift from `state-brief-roundtrip.test.cjs:16-22`):
```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');
const fixture = require('./fixtures/korea-first-b2c.cjs');
```

**Test lifecycle shape** (lift from `state-brief-roundtrip.test.cjs:24-36`):
```javascript
describe('/brief-define Mode A end-to-end (A4-style, Phase 3 canary)', () => {
  let tmpDir;
  let objectivesPath, configPath, statePath;

  beforeEach(() => {
    tmpDir = createTempProject();   // creates .planning/phases/ scaffold
    objectivesPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    configPath = path.join(tmpDir, '.planning', 'config.json');
    statePath = path.join(tmpDir, '.planning', 'STATE.md');
  });

  afterEach(() => { cleanup(tmpDir); });

  test('Cycle 1 — Mode A with Korea-first B2C fixture writes OBJECTIVES.md with correct shape', () => {
    const result = runGsdTools(
      ['define', 'apply', '--fixture', 'korea-first-b2c.cjs'],
      tmpDir,
    );
    assert.ok(result.success, `define apply failed: ${result.error || result.output}`);
    assert.ok(fs.existsSync(objectivesPath), 'OBJECTIVES.md created');
    const fm = extractFrontmatter(fs.readFileSync(objectivesPath, 'utf-8'));
    assert.deepStrictEqual(
      { business_model: fm.business_model, region: fm.region, /* ... */ },
      { business_model: 'b2c', region: 'kr', /* ... */ },
    );
  });

  test('Cycle 2 — config.json extended with brief.* keys; other keys preserved', () => {
    runGsdTools(['define', 'apply', '--fixture', 'korea-first-b2c.cjs'], tmpDir);
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.deepStrictEqual(config.brief, { /* 4 keys */ });
    assert.strictEqual(config.model_profile, 'quality', 'model_profile untouched');
  });

  test('Cycle 3 — atomic commit contains exactly 3 planning files (canary gate)', () => {
    runGsdTools(['define', 'apply', '--fixture', 'korea-first-b2c.cjs'], tmpDir);
    const gitLog = runGsdTools(['shell', 'git', 'log', '-1', '--name-only', '--format='], tmpDir);
    const files = gitLog.output.trim().split('\n').sort();
    assert.deepStrictEqual(files, [
      '.planning/OBJECTIVES.md',
      '.planning/STATE.md',
      '.planning/config.json',
    ]);
  });
});
```

**Adaptation notes:**
- **`createTempProject` / `runGsdTools` / `cleanup`** from `tests/helpers.cjs` are the canonical harness — do NOT write parallel temp-dir helpers.
- **`deepStrictEqual`** (not `ok`, not `JSON.stringify`) per `tests/frontmatter-roundtrip.test.cjs:14-18` — strict-equal catches null-vs-"null" drift and corrupted leaves.
- **`runGsdTools` array form** (not shell-string) when args contain special chars — see `helpers.cjs:41-47`. Prefer arrays for test determinism.
- **Canary gate = Cycle 3 git-log assertion.** If it passes, Phase 3 success criterion #4 (canary property) holds. Plan this test explicitly.

---

#### `tests/brief-define-atomic-commit.test.cjs` (subset of Cycle 3 — extract as separate file)

**Analog:** `state-brief-roundtrip.test.cjs:245-288` Cycle 3 (runGsdTools + JSON parse + deepStrictEqual)

Subsumes Cycle 3 from `brief-define-mode-a.test.cjs`. Planner decides whether to keep it inline in the Mode A test (fewer files, easier run) or split out (separate failure signal). Either works — mirror the Phase 2 pattern, which kept Cycle 3 inside `state-brief-roundtrip.test.cjs`.

---

#### `tests/brief-config-brief-namespace.test.cjs` (unit, JSON merge preservation)

**Analog:** `tests/frontmatter-cli.test.cjs:37-79` (file CRUD via brief-tools CLI)

**Pattern to lift** (plus `state-brief-roundtrip.test.cjs` Cycle 3 — JSON-rebuild preservation):
```javascript
test('writeConfigBrief preserves existing config keys on merge', () => {
  const tmpDir = createTempProject();
  const configPath = path.join(tmpDir, '.planning', 'config.json');

  fs.writeFileSync(configPath, JSON.stringify({
    model_profile: 'quality',
    workflow: { nyquist_validation: true },
    mode: 'interactive',
  }, null, 2));

  const { writeConfigBrief } = require('../brief/bin/lib/define.cjs');
  writeConfigBrief(tmpDir, {
    business_model: 'b2c',
    region: 'kr',
    audience_policy: 'internal',
    compliance_packs: ['PIPA'],
  });

  const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  assert.deepStrictEqual(parsed.brief, { /* 4 keys */ });
  assert.strictEqual(parsed.model_profile, 'quality', 'preserved');
  assert.strictEqual(parsed.workflow.nyquist_validation, true, 'nested preserved');
});
```

---

#### `tests/brief-define-korea-signal.test.cjs` (unit, heuristic)

**Analog:** `tests/frontmatter-roundtrip.test.cjs` (pure lib-layer unit — import from lib directly, no disk I/O, no subprocess).

**Pattern:**
```javascript
const { detectKoreaSignals } = require('../brief/bin/lib/define.cjs');

describe('Korea-signal detection (D-11, over-suggest bias)', () => {
  test('Hangul triggers pre-check', () => {
    assert.strictEqual(detectKoreaSignals('퇴근 후 홈트레이닝'), true);
  });
  test('English "Korea" triggers pre-check (Pitfall 2: English-in-Korea-context)', () => {
    assert.strictEqual(detectKoreaSignals('B2C fintech in Korea market'), true);
  });
  test('Seoul / won / PIPA / MyData trigger pre-check', () => {
    assert.strictEqual(detectKoreaSignals('PIPA compliance required'), true);
    assert.strictEqual(detectKoreaSignals('월 9,900원'), true);
  });
  test('Non-Korea transcript does NOT trigger pre-check (false-positive guard)', () => {
    assert.strictEqual(detectKoreaSignals('B2B SaaS for US enterprise customers'), false);
  });
});
```

---

### Wave D — Block-Gate Stub (/brief-discover)

---

#### `commands/brief/discover.md` (STUB)

**Analog:** `commands/brief/status.md` (verbatim shape; 30 lines vs. 22 — RESEARCH.md estimate).

**Pattern (stub body):**
```markdown
---
name: brief:discover
description: BRIEF DISCOVER phase — broad domain research (Phase 5 body TBD; Phase 3 ships gate-only stub).
argument-hint: ""
allowed-tools:
  - Read
  - Bash
---
<objective>
Phase 3 (canary) ships only the block-gate + stale-anchor entry.
Full DISCOVER research flow arrives in Phase 5.
</objective>

<execution_context>
@~/.claude/brief/workflows/discover.md
</execution_context>

<process>
Execute the discover workflow stub: run block-gate, run stale-anchor check on new-activity entry, print Phase 5 placeholder on pass.
</process>
```

---

#### `brief/workflows/discover.md` (STUB)

**Analog:** `brief/workflows/status.md` (8 lines → ~40 lines per RESEARCH.md).

**Pattern (stub body):**
```markdown
<purpose>
DISCOVER phase entry — Phase 3 ships the gate only.
Block if OBJECTIVES.md is missing required fields (DEF-05).
Prompt on stale-anchor if >48h since last amendment (DEF-06).
Phase 5 replaces the placeholder body with full domain-research flow.
</purpose>

<process>

## Step 1: Block-gate (DEF-05, D-12)
Invoke `brief-tools objectives validate`.
If result.valid == false:
  Print the canonical Korean block message (see Pitfall 5 template in RESEARCH.md).
  Exit with non-zero code.

## Step 2: Stale-anchor check (DEF-06, D-13)
Invoke `brief-tools objectives stale-check`.
If result.stale == true AND this is a new-activity entry:
  AskUserQuestion with 3 options (see D-13):
    - 잠시 검토에 → launch /brief-define --amend
    - 현재 OBJECTIVES를 보고 맞으면 승인 → mtime bump after read
    - 이제 승인, 빠르게 진행 → immediate mtime bump
  NO bypass without a choice.

## Step 3: Phase 5 placeholder
Print: "Phase 5 DISCOVER body — coming in Phase 5. Block-gate and stale-anchor are live."
</process>
```

**Adaptation notes:**
- **TEXT_MODE fallback language required** per `tests/ask-user-questions-fallback.test.cjs` (because the stale-anchor step uses `AskUserQuestion`).
- **Exit code MUST be non-zero on gate fail** — `tests/brief-discover-gate.test.cjs` asserts `result.exitCode !== 0`. Use `process.exit(1)` or throw from `objectives.cjs` → `error()` call path.

---

#### `tests/brief-discover-gate.test.cjs` (smoke, DEF-05 + D-12)

**Analog:** `tests/status-renderer.test.cjs` (runGsdTools + output-match regex — no state mutation) + `tests/frontmatter-cli.test.cjs:56-64` (error-JSON exit-code assertion).

**Pattern (lifted from RESEARCH.md §Block-Gate Smoke Test):**
```javascript
describe('/brief-discover block gate (DEF-05, D-12)', () => {
  test('Missing compliance_packs → exit non-zero + Korean recovery message', () => {
    const tmpDir = createTempProject();
    // Seed OBJECTIVES.md missing compliance_packs
    fs.writeFileSync(
      path.join(tmpDir, '.planning', 'OBJECTIVES.md'),
      `---\nbrief_objectives_version: 1.0\nstatus: ready\nbusiness_model: b2c\nregion: kr\naudience_policy: internal\n---\n\n# OBJECTIVES\n`,
    );
    const result = runGsdTools(['discover'], tmpDir);
    assert.ok(!result.success, 'non-zero exit code');
    assert.match(result.output + (result.error || ''), /⚠/,            'warning glyph');
    assert.match(result.output + (result.error || ''), /compliance_packs/, 'missing field named');
    assert.match(result.output + (result.error || ''), /\/brief-define --amend/, 'recovery cmd');
    assert.match(result.output + (result.error || ''), /그대로 남아있습니다/, 'Korean content-preservation reassurance');
  });
});
```

**Adaptation notes:**
- `runGsdTools` returns `{success, output, error}` — check `!result.success` for non-zero exit (`helpers.cjs:62-69`).
- Concatenate `output + error` for regex match — `brief-tools.cjs error()` writes to stderr via `core.cjs:224`.

---

### Wave E — Mode B Immutable Lock + `--unlock-intent`

---

#### `tests/brief-define-mode-b.test.cjs` (integration, D-07)

**Analog:** `tests/frontmatter-cli.test.cjs:56-71` (validation-failure + JSON error shape) + `tests/state-brief-roundtrip.test.cjs` lifecycle.

**Pattern:**
```javascript
describe('/brief-define Mode B immutable lock (D-07, Pitfall #3 mitigation)', () => {
  test('Write attempt to immutable field without --unlock-intent returns structured Korean error', () => {
    const tmpDir = createTempProject();
    // Seed existing OBJECTIVES.md with immutable block populated
    const { writeObjectivesMd } = require('../brief/bin/lib/objectives.cjs');
    assert.throws(
      () => writeObjectivesMd(tmpDir, {
        frontmatter: { /* tries to mutate an immutable-tagged field */ },
      }, { unlockIntent: false }),
      /Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다/,
      'Korean error message + mention of --unlock-intent flag',
    );
  });

  test('Write with --unlock-intent permits immutable edit', () => {
    /* same fixture, {unlockIntent: true} path, assert write succeeds */
  });
});
```

**Adaptation notes:**
- `assert.throws` with a regex is the idiomatic node:test pattern for error-message assertions (see `tests/frontmatter-roundtrip.test.cjs` style).
- Korean error text is from RESEARCH.md Pitfall 1 — planner must keep it stable because this test matches it.

---

#### `tests/brief-objectives-immutable-lock.test.cjs` (unit, writer-layer refuser)

**Analog:** `tests/frontmatter-cli.test.cjs:37-79` (CLI-level structured error pattern).

Same shape as above but at the lib-direct-import level (no runGsdTools subprocess). Keeps the writer-layer contract independently testable from the Mode B dispatcher.

---

### Wave F — Stale-Anchor + text_mode Parity + Canary Structural Assertion

---

#### `tests/brief-define-stale-anchor.test.cjs` (smoke, DEF-06 + D-13)

**Analog:** `tests/read-guard.test.cjs` (time-based behavior + positive AND negative cases + `createTempDir`/`cleanup` usage).

**Pattern (from RESEARCH.md §Stale-Anchor Smoke Test):**
```javascript
const fs = require('fs');
describe('Stale-anchor 48h notice (DEF-06, D-13)', () => {
  test('OBJECTIVES.md mtime > 48h + /brief-discover entry → 3-option prompt', () => {
    const tmpDir = createTempProject();
    const objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    seedValidObjectives(objPath);
    const pastMs = Date.now() - (49 * 60 * 60 * 1000);
    fs.utimesSync(objPath, new Date(pastMs), new Date(pastMs));
    const result = runGsdTools(['discover'], tmpDir);
    assert.match(result.output, /48시간/, '48h threshold surfaced');
    assert.match(result.output, /잠시 검토에/, 'option 1');
    assert.match(result.output, /현재 OBJECTIVES를 보고/, 'option 2');
    assert.match(result.output, /이제 승인, 빠르게 진행/, 'option 3');
  });

  test('NEGATIVE — /brief-status on stale OBJECTIVES.md does NOT trigger stale-anchor', () => {
    // D-13 scope: only new-activity entry points trigger. /brief-status must NOT.
    const tmpDir = createTempProject();
    const objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    seedValidObjectives(objPath);
    const pastMs = Date.now() - (49 * 60 * 60 * 1000);
    fs.utimesSync(objPath, new Date(pastMs), new Date(pastMs));
    const result = runGsdTools(['status'], tmpDir);
    assert.doesNotMatch(result.output, /잠시 검토에/, 'no stale prompt on /brief-status');
  });
});
```

**Adaptation notes:**
- **Positive AND negative cases** are load-bearing — Pitfall 6 in RESEARCH.md (fires-on-every-command regression). Test both.
- **`fs.utimesSync(path, atime, mtime)`** is Node stdlib; no helper needed.

---

#### `tests/brief-define-text-mode-parity.test.cjs` (parity)

**Analog:** `tests/ask-user-questions-fallback.test.cjs` (workflows-directory scan + text_mode grep) — workflow-fallback-text guard. **Parity test is new**, but the fixture-pair differential style is direct-descended from the Phase 2 pattern.

**Pattern (from RESEARCH.md §text_mode Parity Test):**
```javascript
test('AskUserQuestion and text_mode produce same OBJECTIVES.md for same fixture', () => {
  const tmpA = createTempProject();
  const tmpB = createTempProject();
  runGsdTools(['define', 'apply', '--fixture', 'korea-first-b2c.cjs'], tmpA);

  // Run B: text_mode forced via config
  const cfgB = JSON.parse(fs.readFileSync(path.join(tmpB, '.planning', 'config.json'), 'utf-8'));
  cfgB.workflow = cfgB.workflow || {};
  cfgB.workflow.text_mode = true;
  fs.writeFileSync(path.join(tmpB, '.planning', 'config.json'), JSON.stringify(cfgB, null, 2));
  runGsdTools(['define', 'apply', '--fixture', 'korea-first-b2c.cjs'], tmpB);

  const objA = fs.readFileSync(path.join(tmpA, '.planning', 'OBJECTIVES.md'), 'utf-8');
  const objB = fs.readFileSync(path.join(tmpB, '.planning', 'OBJECTIVES.md'), 'utf-8');
  const normalize = s => s.replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, '<TS>');
  assert.strictEqual(normalize(objA), normalize(objB),
    'text_mode produces identical OBJECTIVES.md (FND-06 flowdown)');
});
```

**Adaptation notes:**
- Fixture short-circuits `AskUserQuestion` entirely (RESEARCH.md §Mocking) — so parity test effectively asserts that the non-interactive codepath ignores `workflow.text_mode`. A planner may tighten this by forcing `text_mode` deeper (e.g., in a Mode-A prompt dispatcher that decides between native and plain-text renderings), but that's Nice-to-Have per §Risk-Adjusted Scoping.

---

#### `tests/brief-define-canary.test.cjs` (architectural structural)

**Primary analog:** `tests/architecture-counts.test.cjs` — file-existence + content-regex assertions on source tree. Same spirit, different invariants.

**Pattern (lifted from RESEARCH.md §Canary Structural Assertion):**
```javascript
const ROOT = path.join(__dirname, '..');
describe('Phase 3 canary: orchestrator-workers pattern wired end-to-end', () => {
  test('commands/brief/define.md references brief/workflows/define.md', () => {
    const cmdMd = fs.readFileSync(path.join(ROOT, 'commands', 'brief', 'define.md'), 'utf-8');
    assert.match(cmdMd, /brief\/workflows\/define\.md/);
  });

  test('brief-tools.cjs routes `define` command to lib/define.cjs', () => {
    const toolsCjs = fs.readFileSync(path.join(ROOT, 'brief', 'bin', 'brief-tools.cjs'), 'utf-8');
    assert.match(toolsCjs, /case 'define'/);
    assert.match(toolsCjs, /require\(.\/lib\/define\.cjs/);
  });

  test('objectives.cjs exports the 5 primitives Phase 5+ reuses', () => {
    const obj = require('../brief/bin/lib/objectives.cjs');
    for (const fn of ['writeObjectivesMd', 'readObjectivesMd', 'validateObjectivesComplete',
                       'checkStaleAnchor', 'enforceImmutableLock']) {
      assert.strictEqual(typeof obj[fn], 'function', `${fn} exported`);
    }
  });
});
```

**Adaptation notes:**
- **Canary semantic** (CONTEXT `<domain>`): if this file is GREEN, Phase 4+ can replicate the pattern confidently. Keep the export list stable — any Phase 5 consumer binds to these names.

---

## Shared Patterns (cross-cutting — apply to multiple files)

### Shared Pattern 1: Lib-layer module shape

**Source:** `brief/bin/lib/status.cjs` (entire file — 124 lines)
**Apply to:** `brief/bin/lib/define.cjs` + `brief/bin/lib/objectives.cjs`

```javascript
const fs = require('fs');
const path = require('path');
const { planningPaths, output, error, atomicWriteFileSync } = require('./core.cjs');
const { extractFrontmatter } = require('./frontmatter.cjs');

function primaryFunction(cwd, raw) {
  // ... read, compute, emit ...
  output({ result }, raw, rendered);
  return result;
}

module.exports = { primaryFunction };
```

### Shared Pattern 2: Atomic file write

**Source:** `brief/bin/lib/frontmatter.cjs:377-378` (lift into every writer)
**Apply to:** `define.cjs.writeConfigBrief`, `objectives.cjs.writeObjectivesMd`

```javascript
const newContent = spliceFrontmatter(existingContent, updatedFrontmatter);
atomicWriteFileSync(fullPath, normalizeMd(newContent));
```

### Shared Pattern 3: Config.json read-merge-write with lock

**Source:** `brief/bin/lib/config.cjs:319-354` `setConfigValue`
**Apply to:** `define.cjs.writeConfigBrief`

```javascript
return withPlanningLock(cwd, () => {
  let cfg = {};
  if (fs.existsSync(configPath)) cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  cfg.brief = { ...(cfg.brief || {}), ...briefPayload };    // namespace merge
  atomicWriteFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf-8');
  return { updated: true, brief: cfg.brief };
});
```

### Shared Pattern 4: Dispatcher case block in brief-tools.cjs

**Source:** `brief-tools.cjs:779-783` (status case)
**Apply to:** `case 'define'`, `case 'objectives'`, `case 'discover'`

```javascript
case 'define': {
  const define = require('./lib/define.cjs');
  return define.cmdDefineApply(cwd, parseNamedArgs(args, ['fixture'], ['amend', 'unlock-intent']), raw);
  break;
}
```

### Shared Pattern 5: test harness (createTempProject + runGsdTools + cleanup)

**Source:** `tests/helpers.cjs:37-110` + every Phase 2 test
**Apply to:** every `tests/brief-define-*.test.cjs` and `tests/brief-objectives-*.test.cjs`

```javascript
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');
let tmpDir;
beforeEach(() => { tmpDir = createTempProject(); });
afterEach(() => { cleanup(tmpDir); });
```

### Shared Pattern 6: `deepStrictEqual` (NOT `ok`, NOT `JSON.stringify`)

**Source:** `tests/frontmatter-roundtrip.test.cjs:14-18` comment block + all its assertions
**Apply to:** every round-trip and shape assertion across Phase 3 tests.

Rationale (verbatim from analog): *"Every round-trip assertion uses assert.deepStrictEqual (not assert.ok, not JSON.stringify). JSON.stringify collapses null vs 'null' drift; assert.ok passes on corrupted leaves."*

### Shared Pattern 7: TEXT_MODE fallback in workflow.md

**Source:** error message in `tests/ask-user-questions-fallback.test.cjs:70-76`
**Apply to:** `brief/workflows/define.md` + `brief/workflows/discover.md` (both use AskUserQuestion)

Verbatim text (copy-paste into workflow):
```
Set TEXT_MODE=true if --text is present in $ARGUMENTS OR text_mode from
init JSON is true. When TEXT_MODE is active, replace every AskUserQuestion
call with a plain-text numbered list and ask the user to type their choice
number.
```

### Shared Pattern 8: Korean recovery-oriented block-gate message

**Source:** RESEARCH.md Pitfall 5 canonical template (lines 633-646)
**Apply to:** `objectives.cjs.validateObjectivesComplete` error rendering + `tests/brief-discover-gate.test.cjs` assertions

```
⚠ /brief-discover는 아직 실행할 수 없습니다.

OBJECTIVES.md에 아직 작성되지 않은 필수 항목이 있습니다:
  • 비즈니스 모델 (business_model)
  • 규제 팩 (compliance_packs)

보완 방법:
  /brief-define --amend

지금 쓰신 내용은 그대로 남아있습니다.
보완이 끝나면 다시 /brief-discover를 실행해주세요.
```

No `ERROR:` vocabulary. No square brackets. No backticks except around the recovery command.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `.planning/OBJECTIVES.md` (runtime artifact, frontmatter + 2-section body) | runtime artifact | write-once | Net-new schema — no existing markdown-with-mutability-layer-body file in the codebase. Use RESEARCH.md §Example 4 (lines 746-819) as the authoritative template. The *serializer* that round-trips it (`frontmatter.cjs` D-20) IS battle-tested; the *shape* is new. |

---

## install.js — Why It Does NOT Need Explicit SRC Tuples

**Conclusion:** `bin/install.js` does NOT require per-command SRC-tuple additions for `commands/brief/define.md` or `commands/brief/discover.md`.

**Evidence:** at `bin/install.js:5490-5630`, all command installation functions (`copyFlattenedCommands`, `copyWithPathReplacement`, `copyCommandsAsCodexSkills`, etc.) take the *directory* `path.join(src, 'commands', 'brief')` as input. The directory listing IS the registry — new `*.md` files in `commands/brief/` are auto-picked-up by every runtime target.

**What DOES need updating:** `docs/ARCHITECTURE.md` — `tests/architecture-counts.test.cjs:34-45` parses `**Total commands:** N` and `**Total workflows:** N` and fails if the docs count doesn't match actual file count. Phase 3 adds 2 commands (`define.md` + `discover.md`) and 2 workflows (`define.md` + `discover.md`) — increment both totals in ARCHITECTURE.md in the SAME commit that adds the files.

**Adaptation note for planner:** Treat `docs/ARCHITECTURE.md` count-line updates as a mandatory step in the same plan that introduces the new command/workflow files. If split across two plans, the architecture-counts test goes RED between them.

---

## Ordering Hint for Planner

Suggested plan-ordering matching the wave table above:

1. **Wave A** — `objectives.cjs` + `brief-objectives-roundtrip.test.cjs` (foundation; proves D-20 serializer handles OBJECTIVES.md shape BEFORE anything else writes into it).
2. **Wave B** — `commands/brief/define.md` + `brief/workflows/define.md` + `brief/bin/lib/define.cjs` + `brief-tools.cjs` dispatcher + `brief-define-mode-a.test.cjs` + `brief-define-canary.test.cjs` (the canary gate). `docs/ARCHITECTURE.md` count bump in this commit.
3. **Wave C** — `tests/fixtures/korea-first-b2c.cjs` + `brief-define-korea-signal.test.cjs` + `brief-config-brief-namespace.test.cjs` + `brief-define-atomic-commit.test.cjs` (fills out the 4-config + commit story).
4. **Wave D** — `commands/brief/discover.md` + `brief/workflows/discover.md` + `brief-discover-gate.test.cjs` (block-gate wiring; second `docs/ARCHITECTURE.md` count bump in the same commit).
5. **Wave E** — Mode B immutable-lock enforcement + `brief-define-mode-b.test.cjs` + `brief-objectives-immutable-lock.test.cjs` (Pitfall #3 mitigation).
6. **Wave F** — `brief-define-stale-anchor.test.cjs` + `brief-define-text-mode-parity.test.cjs` (polish + guard rails).

This matches RESEARCH.md §Risk-Adjusted Scoping Minimum-Viable ordering.

---

## Metadata

**Analog search scope:**
- `commands/brief/` (command.md analogs)
- `brief/workflows/` (workflow.md analogs)
- `brief/bin/lib/` (every .cjs helper)
- `brief/bin/brief-tools.cjs` (dispatcher)
- `tests/` (test analogs + helpers.cjs)
- `bin/install.js` (installer)
- `.planning/config.json` (schema shape verification)

**Files scanned (direct reads):** `commands/brief/status.md`, `brief/workflows/status.md`, `brief/bin/lib/status.cjs`, `brief/bin/lib/frontmatter.cjs`, `brief/bin/lib/config.cjs`, `brief/bin/lib/workstream-loader.cjs`, `brief/bin/lib/core.cjs` (symbol inventory), `brief/bin/brief-tools.cjs`, `bin/install.js` (install-pattern region), `tests/state-brief-roundtrip.test.cjs`, `tests/helpers.cjs`, `tests/status-renderer.test.cjs`, `tests/architecture-counts.test.cjs`, `tests/ask-user-questions-fallback.test.cjs`, `tests/frontmatter-roundtrip.test.cjs`, `tests/frontmatter-cli.test.cjs`, `tests/read-guard.test.cjs`.

**Pattern extraction date:** 2026-04-19
