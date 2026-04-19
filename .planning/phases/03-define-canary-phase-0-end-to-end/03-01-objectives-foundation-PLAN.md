---
phase: 03
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - brief/bin/lib/objectives.cjs
  - tests/brief-objectives-roundtrip.test.cjs
  - tests/brief-objectives-immutable-lock.test.cjs
  - tests/fixtures/korea-b2c-persona.json
autonomous: true
requirements:
  - DEF-03
must_haves:
  truths:
    - "OBJECTIVES.md frontmatter round-trips through existing frontmatter.cjs (D-20) with ZERO drift on compliance_packs array + immutable_items array + scalar fields"
    - "A Mode B writer call that attempts to mutate an immutable-tagged field throws a structured Korean error BEFORE any file write occurs"
    - "A Mode B writer call with {unlockIntent: true} permits the same immutable mutation and succeeds"
    - "objectives.cjs exports 5 named primitives — writeObjectivesMd, readObjectivesMd, validateObjectivesComplete, checkStaleAnchor, enforceImmutableLock — that Phase 5+ consumers can require() without side effects"
    - "validateObjectivesComplete returns structured {valid, missing, present} shape consumable by the Plan 05 block-gate workflow"
  artifacts:
    - path: "brief/bin/lib/objectives.cjs"
      provides: "OBJECTIVES.md read/write/validate/lock/stale-anchor primitives"
      contains: "function writeObjectivesMd"
      exports: ["writeObjectivesMd", "readObjectivesMd", "validateObjectivesComplete", "checkStaleAnchor", "enforceImmutableLock"]
      min_lines: 150
    - path: "tests/brief-objectives-roundtrip.test.cjs"
      provides: "D-20 serializer reuse verification for OBJECTIVES.md shape"
      contains: "assert.deepStrictEqual(parsed, input)"
    - path: "tests/brief-objectives-immutable-lock.test.cjs"
      provides: "Pitfall #3 mitigation writer-layer lock verification"
      contains: "Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다"
    - path: "tests/fixtures/korea-b2c-persona.json"
      provides: "Canonical Korea-first B2C persona fixture (JSON form per VALIDATION.md Wave 0 list); consumed starting Plan 02"
      contains: "persona_name"
  key_links:
    - from: "brief/bin/lib/objectives.cjs"
      to: "brief/bin/lib/frontmatter.cjs"
      via: "require('./frontmatter.cjs') → extractFrontmatter / spliceFrontmatter / reconstructFrontmatter"
      pattern: "require\\('\\./frontmatter\\.cjs'\\)"
    - from: "brief/bin/lib/objectives.cjs"
      to: "brief/bin/lib/core.cjs"
      via: "require('./core.cjs') → atomicWriteFileSync, planningPaths, output, error"
      pattern: "require\\('\\./core\\.cjs'\\)"
    - from: "tests/brief-objectives-roundtrip.test.cjs"
      to: "brief/bin/lib/frontmatter.cjs"
      via: "require('../brief/bin/lib/frontmatter.cjs')"
      pattern: "extractFrontmatter|reconstructFrontmatter"
---

<objective>
Ship the OBJECTIVES.md foundation: `brief/bin/lib/objectives.cjs` as a dedicated lib module that handles read / write / validate / immutable-lock / stale-anchor against the D-20 frontmatter serializer — without extending frontmatter.cjs further. This is Wave 1 foundation: every downstream plan (02, 03, 04, 05, 06) require()s primitives from this file. Ship the canonical Korea-first B2C fixture now so it is available to Plan 02's Mode A smoke test.

Purpose: Pitfall #3 (OBJECTIVES.md anchor drift) is the v1 highest-risk pitfall per research; the writer-layer refuser that enforces immutable-section lock (D-07) MUST land before any Mode A or Mode B flow writes a single byte to OBJECTIVES.md. Ship it first.

Output: 1 new lib file (objectives.cjs), 2 new test files (roundtrip + immutable-lock), 1 new fixture file (korea-b2c-persona.json). No command.md / workflow.md in this plan — those arrive in Plan 02.
</objective>

<execution_context>
@~/.claude/brief/workflows/execute-plan.md
@~/.claude/brief/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md
@.planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md
@.planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md
@.planning/phases/03-define-canary-phase-0-end-to-end/03-VALIDATION.md
@brief/bin/lib/frontmatter.cjs
@brief/bin/lib/status.cjs
@brief/bin/lib/core.cjs
@tests/frontmatter-roundtrip.test.cjs
@tests/state-brief-roundtrip.test.cjs

<interfaces>
<!-- Contracts Plan 02–06 will consume from this plan's output. -->

From brief/bin/lib/objectives.cjs (NEW — this plan):
```javascript
// Primary writer — Mode A + Mode B + stale-anchor all call this
function writeObjectivesMd(cwd, payload, opts);
// payload shape: { frontmatter: Object, body?: { immutable?: Object, mutable?: Object } }
// opts shape: { unlockIntent?: boolean }  — DEFAULTS to false
// Throws Korean structured Error if opts.unlockIntent !== true AND payload.frontmatter
// mutates any field listed in existing frontmatter.immutable_items.

function readObjectivesMd(cwd);
// Returns { frontmatter: Object, body: string, exists: boolean }

function validateObjectivesComplete(cwd);
// Returns { valid: boolean, missing: string[], present: string[] }
// OBJECTIVES_SCHEMA.required = ['business_model', 'region', 'audience_policy',
//                               'compliance_packs', 'status', 'immutable_items']

function checkStaleAnchor(cwd);
// Returns { stale: boolean, age_hours: number, reason?: 'missing' }
// Threshold: 48 * 60 * 60 * 1000 ms

function enforceImmutableLock(existingFm, payload);
// Throws Error with message containing:
//   "Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다"
// if payload.frontmatter mutates any field in existingFm.immutable_items.

module.exports = {
  writeObjectivesMd,
  readObjectivesMd,
  validateObjectivesComplete,
  checkStaleAnchor,
  enforceImmutableLock,
};
```

From brief/bin/lib/frontmatter.cjs (EXISTING — D-20 reuse, no extension):
```javascript
function extractFrontmatter(content);      // returns parsed frontmatter object
function reconstructFrontmatter(obj);       // returns yaml string
function spliceFrontmatter(content, obj);   // returns new full content with frontmatter replaced
```

From brief/bin/lib/core.cjs (EXISTING):
```javascript
function planningPaths(cwd);       // { base, state, roadmap, ... }
function atomicWriteFileSync(path, content);   // temp+rename
function output(obj, raw, rendered);           // stdout primitive
function error(msg);                           // stderr + non-zero exit
```

From tests/fixtures/korea-b2c-persona.json (NEW — this plan):
JSON object mirroring RESEARCH.md §Canonical Fixture (lines 1058-1155) shape:
{
  "persona_name": "한국-첫-B2C-피트니스-앱-기획자",
  "entry_mode": "A",
  "conversation_transcript": { /* opening, push_twice_core_value, language_precision_audience, dream_state.{now,three_month,twelve_month} */ },
  "korea_signals_detected": [ /* 5 strings */ ],
  "expected_configs": {
    "business_model": "b2c", "region": "kr",
    "audience_policy": "internal",
    "compliance_packs": ["PIPA", "ISMS-P", "MyData"]
  },
  "expected_objectives": {
    "frontmatter": { /* mirror of config brief.* + status/mode/immutable_items */ },
    "body_sections_present": [ /* 11 section names */ ]
  }
}

Fixture conversation_transcript MUST contain these two verbatim Korean strings so Plan 02's Mode A smoke test passes:
  - "퇴근 후 혼자 집에서 운동하는 1인 가구 직장인"   (in conversation_transcript.opening)
  - "AI가 봐주면서"                              (in conversation_transcript.push_twice_core_value.push_1_answer)
Both strings are asserted verbatim by tests/brief-define-mode-a.test.cjs Cycle 1 (Plan 02).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Scaffold objectives.cjs with 5 primitive signatures + OBJECTIVES_SCHEMA; write RED roundtrip test + RED immutable-lock test</name>
  <read_first>
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md §decisions D-07 (immutable lock), D-09 (project-level only), D-10 (classification heuristic)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md §Architectural Responsibility Map row "OBJECTIVES.md read/write + immutable-section enforcement" (line 92-93), §Example 4 (OBJECTIVES.md frontmatter + body shape), §Pitfall 1 (Immutable-Lock Soft-Warning Leakage)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md §Wave A (objectives.cjs module exports + read/write core pattern lines 44-106), §Shared Pattern 1 (Lib-layer module shape lines 864-882)
    - brief/bin/lib/status.cjs (exact module shape to mirror — imports lines 20-23 + module.exports line 123)
    - brief/bin/lib/frontmatter.cjs (D-20 serializer; extractFrontmatter/reconstructFrontmatter/spliceFrontmatter signatures; cmdFrontmatterSet pattern at lines 366-380 + cmdFrontmatterValidate at 396-407)
    - tests/frontmatter-roundtrip.test.cjs (roundTrip helper + deepStrictEqual pattern, lines 14-80)
  </read_first>
  <behavior>
    - Test 1 (roundtrip.test.cjs RED): reconstructFrontmatter({ brief_objectives_version:'1.0', status:'ready', business_model:'b2c', region:'kr', audience_policy:'internal', compliance_packs:['PIPA','ISMS-P','MyData'], immutable_items:['creator-identity','core-value','problem-statement'] }) followed by extractFrontmatter of the wrapped result deep-equals the input. Initially RED (objectives.cjs does not yet exist — only exports that test imports).
    - Test 2 (immutable-lock.test.cjs RED, part A): calling enforceImmutableLock({ immutable_items:['core-value'], core-value:'original' }, { frontmatter: { 'core-value':'mutated' } }) throws an Error whose .message matches regex /Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다/. Initially RED.
    - Test 3 (immutable-lock.test.cjs RED, part B): calling writeObjectivesMd(tmpDir, payloadMutatingImmutable, { unlockIntent: false }) throws the same Korean error and NO file is written (fs.existsSync on .planning/OBJECTIVES.md returns false after throw). Initially RED.
    - Test 4 (immutable-lock.test.cjs RED, part C): calling writeObjectivesMd(tmpDir, payloadMutatingImmutable, { unlockIntent: true }) succeeds; OBJECTIVES.md exists and frontmatter shows the mutated value. Initially RED.
  </behavior>
  <action>
Step 1 — Create skeleton `brief/bin/lib/objectives.cjs` (no logic yet, throw-not-implemented stubs) so the test imports resolve:

```javascript
/**
 * Objectives — OBJECTIVES.md reader/writer/validator + immutable-lock enforcement + stale-anchor.
 *
 * D-07 (CONTEXT.md): Immutable section lock is load-bearing vs Pitfall #3 anchor drift.
 *                    Enforcement at WRITER layer (here) — not at commit time.
 * D-09 (CONTEXT.md): Phase 3 ships ONLY project-level .planning/OBJECTIVES.md; per-workstream deferred to Phase 7.
 * D-10 (CONTEXT.md): Immutable default heuristic — creator-identity, core-value, problem-statement.
 * Pitfall #3 mitigation: two-layer enforcement — UI layer (Mode B hides immutable items from select
 *   prompt) + writer layer (this file refuses via enforceImmutableLock).
 */

const fs = require('fs');
const path = require('path');
const { planningPaths, output, error, atomicWriteFileSync } = require('./core.cjs');
const {
  extractFrontmatter,
  spliceFrontmatter,
  reconstructFrontmatter,
} = require('./frontmatter.cjs');

const OBJECTIVES_SCHEMA = {
  required: [
    'business_model',
    'region',
    'audience_policy',
    'compliance_packs',
    'status',
    'immutable_items',
  ],
};

const STALE_ANCHOR_THRESHOLD_MS = 48 * 60 * 60 * 1000;

const IMMUTABLE_LOCK_ERROR_KO =
  'Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다. ' +
  '변경이 꼭 필요하시면 /brief-define --amend --unlock-intent 로 다시 실행해주세요.';

function enforceImmutableLock(existingFm, payload) {
  throw new Error('NOT_IMPLEMENTED');
}

function writeObjectivesMd(cwd, payload, opts) {
  throw new Error('NOT_IMPLEMENTED');
}

function readObjectivesMd(cwd) {
  throw new Error('NOT_IMPLEMENTED');
}

function validateObjectivesComplete(cwd) {
  throw new Error('NOT_IMPLEMENTED');
}

function checkStaleAnchor(cwd) {
  throw new Error('NOT_IMPLEMENTED');
}

module.exports = {
  writeObjectivesMd,
  readObjectivesMd,
  validateObjectivesComplete,
  checkStaleAnchor,
  enforceImmutableLock,
  OBJECTIVES_SCHEMA,          // exported for Plan 05 block-gate reuse
  STALE_ANCHOR_THRESHOLD_MS,  // exported for Plan 06 stale-anchor reuse
};
```

Step 2 — Create `tests/brief-objectives-roundtrip.test.cjs` with the roundTrip helper lifted verbatim from tests/frontmatter-roundtrip.test.cjs:38-80. One describe block, one test asserting the full OBJECTIVES.md frontmatter shape deep-equals input after serialize→parse. Run; MUST be RED (NOT_IMPLEMENTED) — that is the expected baseline before Task 2.

Step 3 — Create `tests/brief-objectives-immutable-lock.test.cjs` with three tests: (A) enforceImmutableLock direct call with mutation payload throws with Korean message regex; (B) writeObjectivesMd({unlockIntent:false}) throws AND leaves .planning/OBJECTIVES.md absent; (C) writeObjectivesMd({unlockIntent:true}) succeeds AND mutated value is present in written frontmatter. Use createTempProject/cleanup from tests/helpers.cjs. Run; all RED.

Step 4 — Create `tests/fixtures/korea-b2c-persona.json` with the JSON shape specified in the `<interfaces>` block above. This fixture is REQUIRED by VALIDATION.md Wave 0 list even though Task 1/2 tests don't read it — Plan 02 consumes it. **The fixture JSON MUST contain these two verbatim Korean strings** (case-sensitive, including the combining marks and spaces exactly as shown):
  - `"퇴근 후 혼자 집에서 운동하는 1인 가구 직장인"` embedded in `conversation_transcript.opening`
  - `"AI가 봐주면서"` embedded in `conversation_transcript.push_twice_core_value.push_1_answer`
Plan 02's Cycle 1 test greps for both strings in the written OBJECTIVES.md body; without them, Plan 02 cannot turn GREEN.
  </action>
  <verify>
    <automated>node --test tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs 2>&amp;1 | grep -E "(# fail|# pass|not ok|ok )" | head -20</automated>
    <automated>test -f brief/bin/lib/objectives.cjs && grep -c "^module.exports" brief/bin/lib/objectives.cjs</automated>
    <automated>test -f tests/fixtures/korea-b2c-persona.json &amp;&amp; node -e "const f=require('./tests/fixtures/korea-b2c-persona.json'); if(!f.persona_name||!f.expected_configs.compliance_packs.includes('PIPA'))process.exit(1);"</automated>
    <automated>node -e "const f=require('./tests/fixtures/korea-b2c-persona.json'); const s=JSON.stringify(f); if(!s.includes('퇴근 후 혼자 집에서 운동하는 1인 가구 직장인'))process.exit(1); if(!s.includes('AI가 봐주면서'))process.exit(1); console.log('verbatim strings OK');"</automated>
  </verify>
  <acceptance_criteria>
    - File `brief/bin/lib/objectives.cjs` exists and contains `module.exports = {` followed by ALL of: `writeObjectivesMd`, `readObjectivesMd`, `validateObjectivesComplete`, `checkStaleAnchor`, `enforceImmutableLock`
    - File `brief/bin/lib/objectives.cjs` contains literal string `'Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다'` (will be thrown in Task 2)
    - File `brief/bin/lib/objectives.cjs` contains `const STALE_ANCHOR_THRESHOLD_MS = 48 * 60 * 60 * 1000;`
    - File `brief/bin/lib/objectives.cjs` contains `OBJECTIVES_SCHEMA.required` array with all 6 names: `business_model`, `region`, `audience_policy`, `compliance_packs`, `status`, `immutable_items`
    - File `tests/brief-objectives-roundtrip.test.cjs` exists and contains `require('../brief/bin/lib/frontmatter.cjs')` AND `assert.deepStrictEqual`
    - File `tests/brief-objectives-immutable-lock.test.cjs` exists and contains regex `/Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다/`
    - File `tests/fixtures/korea-b2c-persona.json` exists, parses as valid JSON, has `persona_name` === "한국-첫-B2C-피트니스-앱-기획자", and `expected_configs.compliance_packs` equals `["PIPA", "ISMS-P", "MyData"]`
    - **W-3 verbatim-string guard:** `tests/fixtures/korea-b2c-persona.json` contains the verbatim Korean string `퇴근 후 혼자 집에서 운동하는 1인 가구 직장인` AND the verbatim string `AI가 봐주면서`. Verify with: `node -e "const f=require('./tests/fixtures/korea-b2c-persona.json'); if(!JSON.stringify(f).includes('퇴근 후 혼자 집에서 운동하는 1인 가구 직장인'))process.exit(1); if(!JSON.stringify(f).includes('AI가 봐주면서'))process.exit(1)"` (exit 0).
    - `node --test tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs` exits with code 1 (RED — expected; NOT_IMPLEMENTED stubs throw). This is the correct baseline for Task 2 to turn GREEN.
  </acceptance_criteria>
  <done>objectives.cjs exports 5 primitives + 2 constants as skeleton stubs (NOT_IMPLEMENTED); two test files exist and RED-fail on the stubs; fixture JSON exists and loads and contains the W-3 verbatim Korean strings.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement enforceImmutableLock + writeObjectivesMd + readObjectivesMd + validateObjectivesComplete + checkStaleAnchor (turn tests GREEN)</name>
  <read_first>
    - brief/bin/lib/objectives.cjs (the skeleton just created in Task 1)
    - brief/bin/lib/frontmatter.cjs `cmdFrontmatterSet` at lines 366-380 (atomic-write pattern) + `cmdFrontmatterValidate` at lines 396-407 (validation shape)
    - brief/bin/lib/core.cjs `atomicWriteFileSync` + `planningPaths`
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md §Wave A read/write core pattern (lines 70-106), Stale-anchor pattern (lines 109-117)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md §Example 4 (lines 746-819 — authoritative OBJECTIVES.md body structure with 🔒 marker HTML comment)
  </read_first>
  <behavior>
    - Test 1 (roundtrip GREEN): identical fixture round-trips through reconstructFrontmatter → extractFrontmatter with zero drift.
    - Test 2A (immutable-lock direct throw GREEN): enforceImmutableLock throws with Korean message when payload mutates a field listed in existingFm.immutable_items.
    - Test 2B (writer refuses GREEN): writeObjectivesMd with unlockIntent:false throws AND does NOT write the file (fs.existsSync false after throw).
    - Test 2C (writer permits with unlock GREEN): writeObjectivesMd with unlockIntent:true writes successfully; mutated value present in written file.
    - BONUS behavior (no test file created for these; covered by Plan 05/06 tests): validateObjectivesComplete returns {valid:true,missing:[]} on complete fixture and {valid:false, missing:[...field names]} on incomplete fixture; checkStaleAnchor returns {stale:true, age_hours:49} when mtime backdated 49h, {stale:false, age_hours:0} when fresh-written.
  </behavior>
  <action>
Step 1 — Implement `enforceImmutableLock(existingFm, payload)`:
```javascript
function enforceImmutableLock(existingFm, payload) {
  const immutableItems = Array.isArray(existingFm && existingFm.immutable_items)
    ? existingFm.immutable_items
    : [];
  if (immutableItems.length === 0) return;  // nothing to lock

  // Detect mutation: any immutable field key present in payload.frontmatter with a value
  // different from existingFm[key], OR any body mutation targeting an immutable anchor.
  const newFm = (payload && payload.frontmatter) || {};
  for (const key of immutableItems) {
    if (Object.prototype.hasOwnProperty.call(newFm, key)
        && JSON.stringify(newFm[key]) !== JSON.stringify(existingFm[key])) {
      const err = new Error(IMMUTABLE_LOCK_ERROR_KO);
      err.code = 'OBJECTIVES_IMMUTABLE_LOCKED';
      err.violatedField = key;
      throw err;
    }
  }
}
```

Step 2 — Implement `writeObjectivesMd(cwd, payload, opts = {})` following PATTERNS.md Wave A pattern (lines 70-86):
```javascript
function writeObjectivesMd(cwd, payload, opts = {}) {
  const base = planningPaths(cwd).base || path.join(cwd, '.planning');
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
  const fullPath = path.join(base, 'OBJECTIVES.md');

  let content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : '';
  const existingFm = content ? extractFrontmatter(content) : {};

  // Enforcement BEFORE any disk write. Pitfall #3 mitigation.
  if (!opts.unlockIntent) {
    enforceImmutableLock(existingFm, payload);
  }

  const mergedFm = { ...existingFm, ...(payload.frontmatter || {}) };

  // Update last_amended timestamp on every write (drives stale-anchor 48h check).
  mergedFm.last_amended = new Date().toISOString();
  if (!mergedFm.created_at) mergedFm.created_at = mergedFm.last_amended;

  // For new files, render body skeleton per RESEARCH.md Example 4.
  // For amendments, preserve existing body and only splice frontmatter.
  let newContent;
  if (content) {
    newContent = spliceFrontmatter(content, mergedFm);
  } else {
    const body = renderBodySkeleton(payload);  // helper below
    const yaml = reconstructFrontmatter(mergedFm);
    newContent = `---\n${yaml}\n---\n\n${body}`;
  }

  atomicWriteFileSync(fullPath, newContent);
  return { path: fullPath, frontmatter: mergedFm };
}

function renderBodySkeleton(payload) {
  // Emit the RESEARCH.md Example 4 body sections. Immutable Intent block carries
  // the 🔒 HTML comment marker verbatim so Mode B UI can detect the lock boundary.
  const body = payload && payload.body;
  const imm = (body && body.immutable) || {};
  const mut = (body && body.mutable) || {};
  return [
    '# OBJECTIVES',
    '',
    '## Immutable Intent',
    '',
    '<!-- 🔒 LOCKED — 이 섹션을 수정하려면 /brief-define --unlock-intent가 필요합니다. -->',
    '',
    '### Creator Identity',
    imm['creator-identity'] || '(to be filled)',
    '',
    '### Core Value',
    imm['core-value'] || '(to be filled)',
    '',
    '### Problem Statement',
    imm['problem-statement'] || '(to be filled)',
    '',
    '## Mutable Hypotheses',
    '',
    '### Target Audience Specifics',
    mut['target-audience'] || '(to be filled)',
    '',
    '### Verification Metrics',
    mut['verification-metrics'] || '(optional)',
    '',
    '### Hypothesized Alternative Tools / Competitors',
    mut['competitors'] || '(optional)',
    '',
    '### Dream State — Now',
    (mut['dream-now'] && mut['dream-now'].prose) || '(prose)',
    '',
    '### Dream State — 3-month',
    (mut['dream-3m'] && mut['dream-3m'].prose) || '(prose)',
    '',
    '### Dream State — 12-month',
    (mut['dream-12m'] && mut['dream-12m'].prose) || '(prose)',
    '',
  ].join('\n');
}
```

Step 3 — Implement `readObjectivesMd(cwd)`:
```javascript
function readObjectivesMd(cwd) {
  const base = planningPaths(cwd).base || path.join(cwd, '.planning');
  const fullPath = path.join(base, 'OBJECTIVES.md');
  if (!fs.existsSync(fullPath)) {
    return { exists: false, frontmatter: {}, body: '' };
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  const fm = extractFrontmatter(content);
  const bodyStart = content.indexOf('\n---\n');
  const body = bodyStart >= 0 ? content.slice(bodyStart + 5) : content;
  return { exists: true, frontmatter: fm, body };
}
```

Step 4 — Implement `validateObjectivesComplete(cwd)` (PATTERNS.md Wave A lines 96-106):
```javascript
function validateObjectivesComplete(cwd) {
  const r = readObjectivesMd(cwd);
  if (!r.exists) {
    return { valid: false, missing: ['FILE_NOT_EXIST'], present: [] };
  }
  const fm = r.frontmatter || {};
  const missing = OBJECTIVES_SCHEMA.required.filter(
    (f) => fm[f] === undefined || fm[f] === null || (Array.isArray(fm[f]) && fm[f].length === 0 && f === 'compliance_packs' ? false : fm[f] === ''),
  );
  // NOTE: empty compliance_packs array IS VALID per D-11 ("empty array is valid for
  // Phase 3 canary — not all projects need compliance packs"). Handled above.
  const present = OBJECTIVES_SCHEMA.required.filter((f) => !missing.includes(f));
  return { valid: missing.length === 0, missing, present };
}
```

Step 5 — Implement `checkStaleAnchor(cwd)` (PATTERNS.md Wave A lines 109-117):
```javascript
function checkStaleAnchor(cwd) {
  const base = planningPaths(cwd).base || path.join(cwd, '.planning');
  const fullPath = path.join(base, 'OBJECTIVES.md');
  if (!fs.existsSync(fullPath)) {
    return { stale: false, age_hours: 0, reason: 'missing' };
  }
  const stat = fs.statSync(fullPath);
  const ageMs = Date.now() - stat.mtimeMs;
  return {
    stale: ageMs > STALE_ANCHOR_THRESHOLD_MS,
    age_hours: Math.floor(ageMs / 3600000),
  };
}
```

Step 6 — Run the two test files. They MUST turn GREEN. If immutable-lock Test 2C is RED because `writeObjectivesMd({unlockIntent:true})` still re-checks, audit Step 2 for a misplaced `if` branch (the refuser runs ONLY when `!opts.unlockIntent`).
  </action>
  <verify>
    <automated>node --test tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs 2>&amp;1 | tail -20</automated>
    <automated>node -e "const o=require('./brief/bin/lib/objectives.cjs'); ['writeObjectivesMd','readObjectivesMd','validateObjectivesComplete','checkStaleAnchor','enforceImmutableLock'].forEach(fn=>{if(typeof o[fn]!=='function'){console.error('MISSING:',fn);process.exit(1);}});console.log('ALL 5 EXPORTS PRESENT');"</automated>
    <automated>node -e "const o=require('./brief/bin/lib/objectives.cjs');try{o.enforceImmutableLock({immutable_items:['core-value'],'core-value':'orig'},{frontmatter:{'core-value':'new'}});console.error('SHOULD HAVE THROWN');process.exit(1);}catch(e){if(!/Immutable Intent 항목은/.test(e.message)){console.error('WRONG MSG:',e.message);process.exit(1);}console.log('LOCK-ENFORCE OK');}"</automated>
  </verify>
  <acceptance_criteria>
    - `node --test tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs` exits 0 (GREEN)
    - Inline verify script: all 5 exports are functions
    - Inline verify script: enforceImmutableLock throws Error with message matching `/Immutable Intent 항목은/` on mutation payload
    - `brief/bin/lib/objectives.cjs` is ≤ 300 lines (Phase 2 file-size discipline per CONTEXT D-08 / RESEARCH.md note)
    - `brief/bin/lib/objectives.cjs` does NOT import `gray-matter`, `ajv`, `js-yaml` (A1 zero-deps guard — use grep to assert absence)
    - `brief/bin/lib/objectives.cjs` DOES import from `./core.cjs` AND `./frontmatter.cjs` (no new YAML parser hand-rolled)
    - renderBodySkeleton output contains the literal 🔒 HTML comment line `<!-- 🔒 LOCKED — 이 섹션을 수정하려면 /brief-define --unlock-intent가 필요합니다. -->`
  </acceptance_criteria>
  <done>All 2 test files GREEN; 5 primitives exported and functional; zero-dep guard holds; module under 300 lines.</done>
</task>

</tasks>

<verification>
- `node --test tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs` exits 0
- `node scripts/run-tests.cjs` does NOT regress below the pre-Phase-3 baseline (Phase 1 HRD-05 deferred failures excluded per STATE.md)
- `grep -E "gray-matter|require\\(.ajv.\\)|require\\(.js-yaml.\\)" brief/bin/lib/objectives.cjs` returns nothing (zero-deps verified)
- `wc -l brief/bin/lib/objectives.cjs` reports ≤ 300 lines
</verification>

<success_criteria>
1. objectives.cjs is a COMPOSITION of frontmatter.cjs (D-20) + core.cjs — no new parser, no new dependency.
2. Pitfall #3 mitigation is WRITER-LAYER, not commit-layer: enforceImmutableLock throws BEFORE any atomicWriteFileSync call.
3. Phase 5+ consumers (ALIGN gate, per-workstream OBJECTIVES.md) can require('./objectives.cjs') and get all 5 primitives without side-effects on import.
4. Canonical Korea-first B2C fixture is available to Plan 02's Mode A smoke test AND contains the W-3 verbatim Korean strings.
</success_criteria>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user → writeObjectivesMd(payload, opts) | payload contents are user-typed conversation results; opts.unlockIntent is a flag parsed from CLI args |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-01 | Tampering | writeObjectivesMd immutable-section bypass (user crafts payload that mutates immutable field without --unlock-intent) | mitigate | `enforceImmutableLock` runs BEFORE any disk write; throws Korean Error with `code: 'OBJECTIVES_IMMUTABLE_LOCKED'` and `violatedField` attribution. Test 2B asserts file is NOT written on throw. |
| T-03-02 | Tampering | Frontmatter injection via status value containing newlines + `---` sequence | accept | D-20 `spliceFrontmatter` serializer already quotes strings with `#`/`:` and escapes control chars — VERIFIED via existing `tests/frontmatter-roundtrip.test.cjs`. No new surface introduced by this plan. |
| T-03-03 | Information Disclosure | PII leaking into OBJECTIVES.md via user-typed content (주민등록번호 etc.) | accept | Phase 3 out-of-scope per RESEARCH.md §Security Domain. Phase 5+ PII scanner covers. Flagged for executor awareness. |
</threat_model>

<output>
After completion, create `.planning/phases/03-define-canary-phase-0-end-to-end/03-01-SUMMARY.md`
</output>
</content>
</invoke>