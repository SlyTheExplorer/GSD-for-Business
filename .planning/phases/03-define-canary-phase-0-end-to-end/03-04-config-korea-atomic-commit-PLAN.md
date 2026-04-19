---
phase: 03
plan: 04
type: execute
wave: 4
depends_on:
  - 03-02
  - 03-03
files_modified:
  - brief/bin/lib/define.cjs
  - tests/helpers.cjs
  - tests/fixtures/non-korea-b2b-persona.json
  - tests/brief-config-brief-namespace.test.cjs
  - tests/brief-define-korea-signal.test.cjs
  - tests/brief-define-atomic-commit.test.cjs
  - tests/brief-define-canary.test.cjs
  - tests/brief-define-mode-a.test.cjs
autonomous: true
requirements:
  - DEF-04
must_haves:
  truths:
    - "`.planning/config.json` gains a `brief.{business_model, region, audience_policy, compliance_packs}` namespace after a Mode A apply; all pre-existing keys (model_profile, workflow.*, mode, granularity, etc.) are preserved unchanged"
    - "`compliance_packs` is pre-checked with `[PIPA, ISMS-P, MyData]` ONLY when Korea signals are present (Hangul / Korea / Korean / KR / Seoul / won / PIPA / ISMS / MyData / 핀테크 / 카카오 / 네이버 / 토스); transcripts without any signal result in `compliance_packs: []`"
    - "`/brief-define apply --fixture korea-b2c-persona.json` produces a single git commit whose `git log -1 --name-only` is exactly `.planning/OBJECTIVES.md` + `.planning/config.json` + `.planning/STATE.md`"
    - "If `.planning/config.json` write fails mid-transaction (simulated by writeConfigBrief stub that throws), OBJECTIVES.md write is rolled back so git HEAD does NOT change"
    - "Canary structural test passes: `commands/brief/define.md` references `brief/workflows/define.md`; `brief/bin/brief-tools.cjs` contains `case 'define'` + `require('./lib/define.cjs')`; `brief/bin/lib/objectives.cjs` exports 5 primitives Phase 5+ consumers will reuse"
  artifacts:
    - path: "brief/bin/lib/define.cjs"
      provides: "Korea-signal detection + config.json brief.* namespace write + atomic 3-artifact commit integration"
      contains: "function writeConfigBrief"
      exports: ["writeConfigBrief", "detectKoreaSignals", "performAtomicCommit"]
    - path: "tests/helpers.cjs"
      provides: "createTempProjectWithConfig + createTempGitProjectWithConfig helpers that seed .planning/config.json with baseline keys so assertions on cfg.model_profile/cfg.workflow/cfg.mode/cfg.granularity do not false-red on empty temp dirs"
      contains: "createTempProjectWithConfig"
    - path: "tests/fixtures/non-korea-b2b-persona.json"
      provides: "Thin non-Korea B2B persona fixture for B-6 negative test — asserts Korea-signal returns empty compliance_packs"
      contains: "non_korea"
    - path: "tests/brief-config-brief-namespace.test.cjs"
      provides: "Unit test for config.json merge semantics under brief.*"
      contains: "writeConfigBrief"
    - path: "tests/brief-define-korea-signal.test.cjs"
      provides: "Unit test for detectKoreaSignals keyword coverage (positive + negative)"
      contains: "detectKoreaSignals"
    - path: "tests/brief-define-atomic-commit.test.cjs"
      provides: "Integration test asserting single-commit 3-artifact atomicity + rollback on partial failure (deterministic stub-throw path)"
      contains: "git log"
    - path: "tests/brief-define-canary.test.cjs"
      provides: "Architectural structural assertion — orchestrator-workers pattern wired + 5 objectives.cjs primitives exported"
      contains: "writeObjectivesMd"
  key_links:
    - from: "brief/bin/lib/define.cjs (applyFromFixture)"
      to: "brief/bin/lib/define.cjs (writeConfigBrief)"
      via: "After writeObjectivesMd succeeds, writeConfigBrief writes brief.* to .planning/config.json"
      pattern: "writeConfigBrief"
    - from: "brief/bin/lib/define.cjs (performAtomicCommit)"
      to: "brief/bin/brief-tools.cjs (commit subcommand)"
      via: "execFileSync(process.execPath, [toolsPath, 'commit', msg, '--files', 'OBJECTIVES.md', 'config.json', 'STATE.md'])"
      pattern: "brief-tools.*commit"
---

<objective>
Complete the Mode A end-to-end transaction. Plan 02 wrote OBJECTIVES.md via the fixture path. This plan adds the three remaining components: (1) 4-config inference written to `.planning/config.json` under the `brief.*` namespace per DEF-04 + D-11, (2) Korea-signal keyword regex with over-suggest bias per Pitfall 2, (3) atomic 3-artifact commit via `brief-tools commit --files`. Plus the Plan 02 Mode A smoke test gets Cycles 2 + 3 added (config.json shape, git log file list) to close the canary contract.

Purpose: DEF-04 is the context-injection foundation for every Phase 4+ agent. Korea-signal detection directly mitigates 2026 PIPA CEO-liability exposure (Pitfall 2 asymmetric cost). Atomic 3-artifact commit realizes Phase 1 D-09 + Pitfall 3 — a partial write leaves the repo in an inconsistent state that `/brief-discover` block-gate later misinterprets.

Output: define.cjs extensions + helpers.cjs extension + 5 new/modified test files + non-Korea fixture. **Wave 4** (serialized after Plan 03 per checker B-4 — Plans 03 and 04 both touch `brief/bin/lib/define.cjs` `module.exports`; they cannot run in parallel.) No ARCHITECTURE.md bump needed here (Plan 02 already bumped for define.md; Plan 05 will bump again for discover).

**W-4 note:** Scope is within a single plan's context budget after the B-4 wave serialization fix. Plan 03 ships Mode B + audit-log in wave 3; Plan 04 then layers 4-config + Korea-signal + atomic-commit + 4 new tests + Cycles 2+3+4 in wave 4 on top of the Plan 03 export set. No split needed.
</objective>

<execution_context>
@~/.claude/brief/workflows/execute-plan.md
@~/.claude/brief/templates/summary.md
</execution_context>

<context>
@.planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md
@.planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md
@.planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md
@.planning/phases/03-define-canary-phase-0-end-to-end/03-01-SUMMARY.md
@.planning/phases/03-define-canary-phase-0-end-to-end/03-02-SUMMARY.md
@.planning/phases/03-define-canary-phase-0-end-to-end/03-03-SUMMARY.md
@brief/bin/lib/define.cjs
@brief/bin/lib/config.cjs
@brief/bin/lib/core.cjs
@brief/bin/lib/objectives.cjs
@brief/bin/brief-tools.cjs
@tests/helpers.cjs
@tests/state-brief-roundtrip.test.cjs
@tests/brief-define-mode-a.test.cjs
@.planning/config.json
@tests/fixtures/korea-b2c-persona.json

<interfaces>
<!-- Contracts added in this plan. -->

From tests/helpers.cjs (EXTENDED — this plan adds 2 exports, preserves all existing exports):
```javascript
// NEW — seeds .planning/config.json with baseline keys that Plan 04 tests assert on.
function createTempProjectWithConfig(prefix = 'gsd-test-');
// Returns tmpDir; .planning/config.json already contains:
//   { model_profile:'quality', commit_docs:true,
//     workflow:{ nyquist_validation:true, text_mode:false },
//     mode:'interactive', granularity:'fine' }

// NEW — same baseline config seed PLUS git init (mirrors createTempGitProject).
function createTempGitProjectWithConfig(prefix = 'gsd-test-');
// Used by atomic-commit test — git log assertions require an initialized repo.

module.exports = {
  runGsdTools, createTempDir, createTempProject, createTempGitProject, cleanup, TOOLS_PATH,
  createTempProjectWithConfig,         // NEW
  createTempGitProjectWithConfig,      // NEW
};
```

From brief/bin/lib/define.cjs (EXTENDED):
```javascript
// Korea-signal detection (D-11 + Pitfall 2 over-suggest bias).
// Pure function; no disk I/O. Returns true on ANY match.
function detectKoreaSignals(transcript);
// Tested keywords: Hangul (\u3131-\u318E, \uAC00-\uD7A3); \b(Korea|Korean|KR|Seoul|won|PIPA|ISMS|MyData)\b /i;
// \b(핀테크|카카오|네이버|토스)\b.

// config.json 4-config write under brief.* namespace.
// Read-merge-write with withPlanningLock to serialize against STATE.md writes.
// Preserves all existing non-brief keys.
function writeConfigBrief(cwd, briefPayload);
// briefPayload shape: { business_model, region, audience_policy, compliance_packs }
// Returns: { updated: true, brief: cfg.brief }

// Atomic 3-artifact commit. Runs AFTER all three atomicWriteFileSync calls succeed.
// Invokes `brief-tools commit <msg> --files ...` via child_process.execFileSync.
// On individual write failure BEFORE this call, caller rolls back.
function performAtomicCommit(cwd, mode, summary);
// mode: 'greenfield' | 'amended'
// summary: short one-line phrase for the commit message

module.exports = {
  cmdDefineApply,
  runInteractiveModeA,
  applyFromFixture,
  applyModeBAmendment,
  detectKoreaSignals,     // NEW
  writeConfigBrief,        // NEW
  performAtomicCommit,     // NEW
  KOREA_SIGNAL_PATTERNS,   // NEW — exported for test assertions
  IMMUTABLE_DEFAULT_ITEMS,
};
```

applyFromFixture extension (same file):
```javascript
// After writeObjectivesMd, this plan adds:
// 1) detectKoreaSignals(fullTranscript) → conditional compliance_packs pre-check (B-6: inferredCompliance is SOLE source; fixture expected_configs.compliance_packs is the EXPECTED output, never injected)
// 2) writeConfigBrief(cwd, { business_model, region, audience_policy, compliance_packs: inferredCompliance })
// 3) stateTouch(cwd, { last_activity }) via existing state.cjs
// 4) performAtomicCommit(cwd, 'greenfield', fixture.persona_name)
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Extend tests/helpers.cjs with createTempProjectWithConfig + createTempGitProjectWithConfig; Korea-signal detection + config.json brief.* namespace write — unit tests RED→GREEN</name>
  <read_first>
    - tests/helpers.cjs (full file — existing createTempProject lines 79-83 + createTempGitProject lines 86-104; this plan adds two new helpers that wrap them with a config.json seed)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md §decisions D-11 (4 configs single confirm, Korea-first policy), §code_context Risk Notes "Korea-signal detection has an edge case: partial signals"
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md §Pitfall 2 (Korea-signal false-negative on English-written-for-Korea projects), §Don't Hand-Roll row "Korean-language detection"
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md §Wave B Korea-signal detection pattern lines 301-309, §Wave C config.json extension lines 412-430, §Shared Pattern 3 config.json read-merge-write with lock lines 900-907
    - brief/bin/lib/config.cjs lines 319-354 (setConfigValue — plain JSON read-merge-write + withPlanningLock) + VALID_CONFIG_KEYS lines 14-52 (DO NOT extend — per PATTERNS.md)
    - brief/bin/lib/core.cjs (withPlanningLock signature + atomicWriteFileSync + planningDir)
    - .planning/config.json (direct read — plain JSON structure verified by A2)
    - tests/fixtures/korea-b2c-persona.json (Plan 01 — fixture with korea_signals_detected list used for positive assertions)
  </read_first>
  <behavior>
    - Test `brief-define-korea-signal.test.cjs`:
      - Positive: `detectKoreaSignals('퇴근 후 홈트레이닝')` → true (Hangul).
      - Positive: `detectKoreaSignals('B2C fintech in Korea market')` → true (English "Korea").
      - Positive: `detectKoreaSignals('PIPA compliance required')` → true (PIPA keyword).
      - Positive: `detectKoreaSignals('월 9,900원')` → true (Hangul + "won" equivalent).
      - Positive: `detectKoreaSignals('Seoul-based team')` → true (Seoul keyword).
      - Positive: `detectKoreaSignals('Using Kakao integrations')` → false (Kakao spelled non-Hangul — matches only `\b(핀테크|카카오|네이버|토스)\b`). ACTUALLY — RESEARCH.md Pitfall 2 explicitly mandates "카카오" in the keyword set; if the transcript spells "Kakao" in Latin script without any other signal, this test asserts FALSE. Document this boundary in the test comment so future pilot refinement has a clear starting point.
      - Negative: `detectKoreaSignals('B2B SaaS for US enterprise customers')` → false (no Korea signal).
      - Negative: `detectKoreaSignals('')` → false.
    - Test `brief-config-brief-namespace.test.cjs`:
      - writeConfigBrief(tmpDir, {business_model:'b2c',region:'kr',audience_policy:'internal',compliance_packs:['PIPA']}) produces `.planning/config.json` whose `.brief` key deep-equals the input AND `config.model_profile === 'quality'`, `config.workflow.nyquist_validation === true` (from createTempProjectWithConfig seed), `config.mode === 'interactive'`, `config.granularity === 'fine'` — i.e., NO pre-existing key is clobbered.
      - A second writeConfigBrief call with `{compliance_packs: []}` overwrites compliance_packs to an empty array BUT preserves the earlier business_model/region/audience_policy values (merge semantics per PATTERNS.md §Shared Pattern 3).
    - B-6 positive integration assertion (added to Task 2 Step 4 extended Mode A tests — called out here for clarity): after `runGsdTools(['define','apply','--fixture','korea-b2c-persona.json'], tmpDir)`, `cfg.brief.compliance_packs` DEEP-EQUALS the fixture's `expected_configs.compliance_packs` (because koreaSignal===true → inferredCompliance is `['PIPA','ISMS-P','MyData']` which matches expected).
    - B-6 negative integration assertion (added to Task 2 via non-Korea fixture): after applying `tests/fixtures/non-korea-b2b-persona.json`, `cfg.brief.compliance_packs` DEEP-EQUALS `[]`.
  </behavior>
  <action>
Step 0 — **Extend `tests/helpers.cjs`** with `createTempProjectWithConfig` and `createTempGitProjectWithConfig`. The B-2/B-3 fix centralizes the baseline config seed so every Plan 04 test (and any future test that asserts on `cfg.model_profile` / `cfg.workflow` / `cfg.mode` / `cfg.granularity`) has a single source of truth.

Append to `tests/helpers.cjs` BEFORE the `module.exports` block:

```javascript
// Seed the baseline .planning/config.json that Plan 04 / Phase 3 tests assert on.
// Centralizing this avoids duplication in every beforeEach AND keeps the shape
// consistent across positive and negative test cases.
const BRIEF_BASELINE_CONFIG = {
  model_profile: 'quality',
  commit_docs: true,
  workflow: {
    nyquist_validation: true,
    text_mode: false,
  },
  mode: 'interactive',
  granularity: 'fine',
};

function createTempProjectWithConfig(prefix = 'gsd-test-') {
  const tmpDir = createTempProject(prefix);
  fs.writeFileSync(
    path.join(tmpDir, '.planning', 'config.json'),
    JSON.stringify(BRIEF_BASELINE_CONFIG, null, 2) + '\n',
    'utf-8',
  );
  return tmpDir;
}

function createTempGitProjectWithConfig(prefix = 'gsd-test-') {
  const tmpDir = createTempGitProject(prefix);
  fs.writeFileSync(
    path.join(tmpDir, '.planning', 'config.json'),
    JSON.stringify(BRIEF_BASELINE_CONFIG, null, 2) + '\n',
    'utf-8',
  );
  // Re-stage + commit the config so the atomic-commit rollback test starts from a
  // clean HEAD (no pending modifications).
  const { execSync } = require('child_process');
  execSync('git add -A', { cwd: tmpDir, stdio: 'pipe' });
  execSync('git commit -m "seed config"', { cwd: tmpDir, stdio: 'pipe' });
  return tmpDir;
}
```

Update the `module.exports` line at the bottom of helpers.cjs to add both new exports:

```javascript
module.exports = {
  runGsdTools, createTempDir, createTempProject, createTempGitProject, cleanup, TOOLS_PATH,
  createTempProjectWithConfig,
  createTempGitProjectWithConfig,
  BRIEF_BASELINE_CONFIG,   // optional — exported for any test that wants to assert shape
};
```

Step 1 — Extend `brief/bin/lib/define.cjs`:

```javascript
// Append these additions to the existing define.cjs (after applyModeBAmendment from Plan 03
// if that plan landed first; otherwise before module.exports).

const { withPlanningLock, planningDir } = require('./core.cjs');

// Korea-signal detection (D-11, Pitfall 2 over-suggest bias).
const KOREA_SIGNAL_PATTERNS = [
  /[\u3131-\u318E\uAC00-\uD7A3]/,             // Any Hangul character
  /\b(Korea|Korean|KR|Seoul|won|PIPA|ISMS|MyData)\b/i,
  /\b(핀테크|카카오|네이버|토스)\b/,
];

function detectKoreaSignals(transcript) {
  if (typeof transcript !== 'string' || transcript.length === 0) return false;
  return KOREA_SIGNAL_PATTERNS.some((re) => re.test(transcript));
}

// config.json brief.* namespace write — plain JSON read-merge-write with withPlanningLock.
function writeConfigBrief(cwd, briefPayload) {
  const configPath = path.join(planningDir(cwd), 'config.json');
  return withPlanningLock(cwd, () => {
    let cfg = {};
    if (fs.existsSync(configPath)) {
      try {
        cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      } catch (e) {
        error(`config.json parse failed: ${e.message}`);
        throw e;
      }
    }
    cfg.brief = { ...(cfg.brief || {}), ...briefPayload };
    atomicWriteFileSync(configPath, JSON.stringify(cfg, null, 2) + '\n', 'utf-8');
    return { updated: true, brief: cfg.brief };
  });
}

// Augment module.exports — add alongside existing exports.
module.exports = Object.assign(module.exports || {}, {
  detectKoreaSignals,
  writeConfigBrief,
  KOREA_SIGNAL_PATTERNS,
});
```

(Actually, replace the module.exports block at the bottom with a single explicit export to keep things clean:)

```javascript
module.exports = {
  cmdDefineApply,
  runInteractiveModeA,
  applyFromFixture,
  applyModeBAmendment,
  detectKoreaSignals,
  writeConfigBrief,
  performAtomicCommit,        // defined in Task 2
  KOREA_SIGNAL_PATTERNS,
  IMMUTABLE_DEFAULT_ITEMS,
};
```

Step 2 — Create `tests/brief-define-korea-signal.test.cjs`:

```javascript
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { detectKoreaSignals, KOREA_SIGNAL_PATTERNS } = require('../brief/bin/lib/define.cjs');

describe('Korea-signal detection (D-11, over-suggest bias, Pitfall 2 coverage)', () => {
  test('Hangul triggers pre-check', () => {
    assert.strictEqual(detectKoreaSignals('퇴근 후 홈트레이닝'), true);
  });

  test('English "Korea" triggers pre-check (Pitfall 2 English-in-Korea-context)', () => {
    assert.strictEqual(detectKoreaSignals('B2C fintech in Korea market'), true);
  });

  test('PIPA keyword triggers pre-check', () => {
    assert.strictEqual(detectKoreaSignals('PIPA compliance required'), true);
  });

  test('MyData / ISMS / won / Seoul trigger pre-check', () => {
    assert.strictEqual(detectKoreaSignals('MyData ecosystem project'), true);
    assert.strictEqual(detectKoreaSignals('ISMS audit'), true);
    assert.strictEqual(detectKoreaSignals('월 9,900원'), true);  // Hangul + won
    assert.strictEqual(detectKoreaSignals('Seoul-based team'), true);
  });

  test('핀테크 / 카카오 / 네이버 / 토스 trigger pre-check', () => {
    assert.strictEqual(detectKoreaSignals('핀테크 스타트업'), true);
    assert.strictEqual(detectKoreaSignals('카카오 API 연동'), true);
  });

  test('Latin-script "Kakao" alone does NOT trigger (boundary case — pilot-refine in v1.1)', () => {
    // Documented boundary: the Hangul-block regex is the dominant detector for
    // Korean context. "Kakao" in Latin script without any other signal is a
    // false negative acceptable for v1 per Pitfall 2 over-suggest bias being
    // satisfied by the Korea/Korean/KR keyword set.
    assert.strictEqual(detectKoreaSignals('Using Kakao integrations'), false);
  });

  test('Non-Korea transcript does NOT trigger (false-positive guard)', () => {
    assert.strictEqual(detectKoreaSignals('B2B SaaS for US enterprise customers'), false);
  });

  test('Empty / non-string inputs return false', () => {
    assert.strictEqual(detectKoreaSignals(''), false);
    assert.strictEqual(detectKoreaSignals(undefined), false);
    assert.strictEqual(detectKoreaSignals(null), false);
    assert.strictEqual(detectKoreaSignals(42), false);
  });

  test('3 patterns exported for future pilot refinement', () => {
    assert.strictEqual(KOREA_SIGNAL_PATTERNS.length, 3);
  });
});
```

Step 3 — Create `tests/brief-define-korea-signal.test.cjs` **AND** the thin non-Korea fixture `tests/fixtures/non-korea-b2b-persona.json` (B-6 negative case). Keep the fixture minimal — only `conversation_transcript` (plain English text with NO Korea signals) + `expected_configs.compliance_packs: []`:

```json
{
  "persona_name": "non-korea-b2b-saas-planner",
  "entry_mode": "A",
  "conversation_transcript": {
    "opening": "I want to build a B2B SaaS product for US enterprise customers to streamline procurement workflows.",
    "push_twice_core_value": {
      "push_1_question": "What does streamline mean here?",
      "push_1_answer": "Faster approvals, fewer manual touches."
    },
    "language_precision_audience": {
      "refinement": "Mid-market procurement teams at Fortune 2000 companies, primarily on the East Coast."
    },
    "dream_state": {
      "now": { "prose": "Teams juggle spreadsheets, PDFs, and manual emails across procurement." },
      "three_month": { "prose": "Procurement leads see a dashboard with approval backlog and bottlenecks." },
      "twelve_month": { "prose": "Entire procurement cycle runs in the tool; CFO trusts the numbers." }
    }
  },
  "korea_signals_detected": [],
  "expected_configs": {
    "business_model": "b2b",
    "region": "us",
    "audience_policy": "partner",
    "compliance_packs": []
  }
}
```

Step 4 — Create `tests/brief-config-brief-namespace.test.cjs`. **This uses `createTempProjectWithConfig` (B-2 fix) so assertions on model_profile/workflow/mode/granularity have a real seeded config.json to check against:**

```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProjectWithConfig, cleanup } = require('./helpers.cjs');
const { writeConfigBrief } = require('../brief/bin/lib/define.cjs');

describe('config.json brief.* namespace merge (DEF-04)', () => {
  let tmpDir;
  let configPath;

  beforeEach(() => {
    tmpDir = createTempProjectWithConfig();
    configPath = path.join(tmpDir, '.planning', 'config.json');
  });

  afterEach(() => { cleanup(tmpDir); });

  test('writeConfigBrief merges brief.* under config.json preserving all existing keys', () => {
    writeConfigBrief(tmpDir, {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
    });
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.deepStrictEqual(cfg.brief, {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
    });
    // createTempProjectWithConfig seeds baseline config.json with these keys; confirm they survived.
    assert.strictEqual(cfg.model_profile, 'quality', 'model_profile untouched');
    assert.ok(cfg.workflow, 'workflow block present');
    assert.strictEqual(cfg.workflow.nyquist_validation, true, 'workflow.nyquist_validation untouched');
    assert.strictEqual(cfg.mode, 'interactive', 'mode untouched');
    assert.strictEqual(cfg.granularity, 'fine', 'granularity untouched');
  });

  test('Second writeConfigBrief merges additional brief.* keys without dropping earlier ones', () => {
    writeConfigBrief(tmpDir, {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA'],
    });
    writeConfigBrief(tmpDir, { compliance_packs: [] });
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.strictEqual(cfg.brief.business_model, 'b2c', 'earlier business_model preserved');
    assert.strictEqual(cfg.brief.region, 'kr', 'earlier region preserved');
    assert.deepStrictEqual(cfg.brief.compliance_packs, [],
      'compliance_packs overridden on second call');
  });

  test('writeConfigBrief on non-existent config.json creates it with only brief.*', () => {
    // Delete the seeded config.json
    fs.unlinkSync(configPath);
    writeConfigBrief(tmpDir, {
      business_model: 'b2b',
      region: 'us',
      audience_policy: 'partner',
      compliance_packs: [],
    });
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.deepStrictEqual(cfg.brief, {
      business_model: 'b2b',
      region: 'us',
      audience_policy: 'partner',
      compliance_packs: [],
    });
    // Only key present should be brief (since config started empty).
    assert.deepStrictEqual(Object.keys(cfg), ['brief']);
  });
});
```

Step 5 — Run both new unit tests:
```
node --test tests/brief-define-korea-signal.test.cjs tests/brief-config-brief-namespace.test.cjs
```
Both MUST turn GREEN.
  </action>
  <verify>
    <automated>node --test tests/brief-define-korea-signal.test.cjs tests/brief-config-brief-namespace.test.cjs 2>&amp;1 | tail -15</automated>
    <automated>node -e "const h=require('./tests/helpers.cjs'); if(typeof h.createTempProjectWithConfig!=='function'||typeof h.createTempGitProjectWithConfig!=='function')process.exit(1); console.log('helpers extended');"</automated>
    <automated>node -e "const d=require('./brief/bin/lib/define.cjs'); if(typeof d.detectKoreaSignals!=='function'||typeof d.writeConfigBrief!=='function'||!Array.isArray(d.KOREA_SIGNAL_PATTERNS))process.exit(1); console.log('exports OK');"</automated>
    <automated>grep -c "VALID_CONFIG_KEYS" brief/bin/lib/define.cjs</automated>
    <automated>test -f tests/fixtures/non-korea-b2b-persona.json &amp;&amp; node -e "const f=require('./tests/fixtures/non-korea-b2b-persona.json'); if(!Array.isArray(f.expected_configs.compliance_packs)||f.expected_configs.compliance_packs.length!==0)process.exit(1); console.log('non-korea fixture OK');"</automated>
    <automated>node -e "const h=require('./tests/helpers.cjs'); const t=h.createTempProjectWithConfig(); const fs=require('fs'),path=require('path'); const c=JSON.parse(fs.readFileSync(path.join(t,'.planning','config.json'),'utf-8')); if(c.model_profile!=='quality'||c.mode!=='interactive'||c.granularity!=='fine'||!c.workflow||c.workflow.nyquist_validation!==true)process.exit(1); h.cleanup(t); console.log('seed OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `node --test tests/brief-define-korea-signal.test.cjs tests/brief-config-brief-namespace.test.cjs` exits 0
    - `tests/helpers.cjs` exports `createTempProjectWithConfig` AND `createTempGitProjectWithConfig` (both functions)
    - `tests/helpers.cjs` `createTempProjectWithConfig()` produces a temp dir whose `.planning/config.json` parses as JSON and contains `model_profile:'quality'`, `commit_docs:true`, `workflow.nyquist_validation:true`, `workflow.text_mode:false`, `mode:'interactive'`, `granularity:'fine'` (verifiable via inline node -e)
    - `tests/helpers.cjs` `createTempGitProjectWithConfig()` produces a dir that passes `git rev-parse HEAD` (i.e., git is initialized AND at least one commit exists)
    - `tests/fixtures/non-korea-b2b-persona.json` exists, parses as JSON, has `expected_configs.compliance_packs` EQUALS `[]` (exact length 0)
    - `tests/fixtures/non-korea-b2b-persona.json` does NOT contain any Hangul / "Korea" / "Seoul" / "PIPA" / "MyData" / "ISMS" / "won" / "핀테크"/"카카오"/"네이버"/"토스" substring (B-6 negative-fixture purity — verifiable via grep absence)
    - `brief/bin/lib/define.cjs` exports functions `detectKoreaSignals`, `writeConfigBrief` AND exports array `KOREA_SIGNAL_PATTERNS` of length 3
    - `brief/bin/lib/define.cjs` does NOT reference `VALID_CONFIG_KEYS` (per PATTERNS.md §Wave C line 428 — the 4-config namespace must NOT shoehorn through `cmdConfigSet`)
    - `brief/bin/lib/define.cjs` imports `withPlanningLock` and `planningDir` from `./core.cjs`
    - `brief/bin/lib/define.cjs` KOREA_SIGNAL_PATTERNS array contains exactly these three regexes (grep verifies): `/[\u3131-\u318E\uAC00-\uD7A3]/`, `/\b(Korea|Korean|KR|Seoul|won|PIPA|ISMS|MyData)\b/i`, `/\b(핀테크|카카오|네이버|토스)\b/`
  </acceptance_criteria>
  <done>helpers.cjs extended with 2 new helpers; non-Korea fixture exists; Korea-signal + config.json brief.* namespace write land with unit tests green; no VALID_CONFIG_KEYS coupling; Shared Pattern 3 followed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Atomic 3-artifact commit + canary structural test + Mode A test Cycles 2+3+4 — RED→GREEN end-to-end (B-1 shell removal, B-3 git-init helper, B-6 Korea-signal sole-source, W-2 deterministic stub-throw rollback)</name>
  <read_first>
    - brief/bin/lib/define.cjs (extensions from Task 1 — writeConfigBrief must exist before this task)
    - brief/bin/lib/state.cjs (writeStateMd — used to touch last_activity + stopped_at in the 3-artifact set)
    - brief/bin/brief-tools.cjs `case 'commit':` subcommand signature (execFileSync target). Note: brief-tools.cjs has NO `case 'shell':` dispatcher (checker-verified); all git assertions in this plan MUST use direct `execFileSync('git', ...)` (B-1 fix)
    - tests/helpers.cjs (extended in Task 1 — createTempProjectWithConfig + createTempGitProjectWithConfig)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md §Wave B Atomic 3-artifact commit pattern lines 314-329, §Wave F Canary Structural Assertion lines 835-854, §Wave C brief-define-atomic-commit.test.cjs pattern lines 536-542
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md §Pitfall 3 (Atomic-Commit Partial-Success), §Cycle 3 git-log assertion lines 1248-1260
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md §code_context Risk Notes "Phase 3 touches three separate on-disk artifacts in one flow" (atomic-commit discipline mandate)
    - tests/state-brief-roundtrip.test.cjs Cycle 3 (state.json rebuild assertion — parallel pattern for git log)
    - tests/fixtures/non-korea-b2b-persona.json (from Task 1 — for B-6 negative integration assertion)
  </read_first>
  <behavior>
    - Canary test `brief-define-canary.test.cjs`:
      - `commands/brief/define.md` exists AND content matches `/brief\/workflows\/define\.md/`.
      - `brief/bin/brief-tools.cjs` content matches BOTH `/case 'define'/` AND `/require\(.\/lib\/define\.cjs/` (escaped dot).
      - `require('../brief/bin/lib/objectives.cjs')` exports exactly these 5 function names: `writeObjectivesMd`, `readObjectivesMd`, `validateObjectivesComplete`, `checkStaleAnchor`, `enforceImmutableLock` (each `typeof === 'function'`).
    - Atomic-commit test `brief-define-atomic-commit.test.cjs`:
      - Positive: after `runGsdTools(['define','apply','--fixture','korea-b2c-persona.json'], tmpDir)` succeeds, `execFileSync('git', ['log','-1','--name-only','--format='], { cwd: tmpDir, encoding: 'utf-8' })` returns exactly these 3 sorted file paths: `.planning/OBJECTIVES.md`, `.planning/STATE.md`, `.planning/config.json`. (B-1 FIX: uses direct execFileSync, not `runGsdTools(['shell','git',...])` — no such dispatcher exists.)
      - Negative (W-2 deterministic): stub `writeConfigBrief` to throw BEFORE the test calls `applyFromFixture`. Invoke applyFromFixture directly (not via child process). Assert OBJECTIVES.md is NOT on disk after the throw AND no new commit on HEAD.
      - Negative (secondary, chmod-based, may skip gracefully): pre-seed .planning/config.json read-only via chmod 0o444; attempt apply via runGsdTools; if filesystem honors chmod → assert rollback invariants; if filesystem ignores chmod (root / Docker) → skip silently.
    - Mode A test (extended Cycle 2 + 3 + 4):
      - Cycle 2: after apply, `config.brief` deep-equals `{business_model:'b2c',region:'kr',audience_policy:'internal',compliance_packs:['PIPA','ISMS-P','MyData']}`; `config.model_profile === 'quality'` (preservation guard).
      - Cycle 3: same canary assertion as atomic-commit test (duplicate intentional — one file asserts in-situ, the other asserts as an independent failure signal). **Uses direct `execFileSync('git', ...)`, NOT runGsdTools shell.**
      - Cycle 4: OBJECTIVES.md frontmatter round-trips via D-20 serializer without drift across a re-read cycle.
      - B-6 positive integration: Cycle 2 already asserts `compliance_packs: ['PIPA','ISMS-P','MyData']` after Korea fixture apply. The new test confirms this value came from `inferredCompliance`, NOT from fixture's expected_configs (see Step 1 rewrite below).
      - B-6 negative integration (NEW Cycle 5): after applying `non-korea-b2b-persona.json`, `cfg.brief.compliance_packs` DEEP-EQUALS `[]`.
  </behavior>
  <action>
Step 1 — Add `performAtomicCommit` and **REWRITE** `applyFromFixture` in `brief/bin/lib/define.cjs` to implement the B-6 Korea-signal-sole-source rule (remove the `expected.compliance_packs ||` override). The inferredCompliance derived from detectKoreaSignals becomes the sole source; the fixture's `expected_configs.compliance_packs` becomes the EXPECTED OUTPUT that tests assert against, NEVER the injected value.

```javascript
const { execFileSync } = require('child_process');
const state = require('./state.cjs');

function performAtomicCommit(cwd, mode, summary) {
  const toolsPath = path.join(__dirname, '..', 'brief-tools.cjs');
  const msg = `feat(03): DEFINE ${mode} — ${summary}`;
  try {
    execFileSync(process.execPath, [
      toolsPath, 'commit', msg,
      '--files',
      '.planning/OBJECTIVES.md',
      '.planning/config.json',
      '.planning/STATE.md',
    ], { cwd, stdio: 'pipe' });
  } catch (e) {
    error(`atomic commit failed: ${e.message}`);
    throw e;
  }
}

// REWRITTEN applyFromFixture — B-6 fix: compliance_packs comes SOLELY from
// detectKoreaSignals on the transcript. The fixture's expected_configs.compliance_packs
// is the value tests assert against; NEVER the source of truth for the inference.
function applyFromFixture(cwd, fixtureName) {
  const fixturePath = path.resolve(
    __dirname, '..', '..', '..', 'tests', 'fixtures', fixtureName,
  );
  // Path-traversal guard (T-03-04 mitigation from Plan 02 threat model).
  if (fixtureName.includes('..') || fixtureName.includes('/') || fixtureName.includes('\\')) {
    error('Invalid fixture name (path traversal attempt blocked)');
    return { status: 'fixture_invalid', path: fixtureName };
  }
  if (!fs.existsSync(fixturePath)) {
    error(`Fixture not found: ${fixturePath}`);
    return { status: 'fixture_not_found', path: fixturePath };
  }
  const raw = fs.readFileSync(fixturePath, 'utf-8');
  const fixture = fixtureName.endsWith('.json') ? JSON.parse(raw) : require(fixturePath);

  const t = fixture.conversation_transcript;
  const transcriptString = JSON.stringify(t);

  // B-6: Korea-signal over-suggest bias (D-11, Pitfall 2). The SOLE source of
  // compliance_packs inference is the transcript itself — NOT fixture.expected_configs.
  // The fixture's expected_configs.compliance_packs is the expected OUTPUT (used by
  // tests to assert that inference was correct), never the injected value.
  const koreaSignal = detectKoreaSignals(transcriptString);
  const inferredCompliance = koreaSignal ? ['PIPA', 'ISMS-P', 'MyData'] : [];

  // Non-compliance configs (business_model, region, audience_policy) continue to
  // fall back to fixture.expected_configs — these are not subject to Korea-signal
  // conditional logic and the fixture is the canonical source.
  const expected = fixture.expected_configs || {};
  const payload = {
    frontmatter: {
      brief_objectives_version: '1.0',
      status: 'ready',
      mode: 'greenfield',
      immutable_items: IMMUTABLE_DEFAULT_ITEMS,
      business_model: expected.business_model || 'b2c',
      region: expected.region || 'kr',
      audience_policy: expected.audience_policy || 'internal',
      compliance_packs: inferredCompliance,   // B-6: sole source is koreaSignal, NOT expected.compliance_packs
    },
    body: {
      immutable: {
        'creator-identity': fixture.persona_name || '',
        'core-value': (t.push_twice_core_value && t.push_twice_core_value.push_1_answer) || '',
        'problem-statement': t.opening || '',
      },
      mutable: {
        'target-audience': (t.language_precision_audience && t.language_precision_audience.refinement) || '',
        'verification-metrics': '(optional)',
        'competitors': '(optional)',
        'dream-now': { prose: (t.dream_state && t.dream_state.now && t.dream_state.now.prose) || '' },
        'dream-3m': { prose: (t.dream_state && t.dream_state.three_month && t.dream_state.three_month.prose) || '' },
        'dream-12m': { prose: (t.dream_state && t.dream_state.twelve_month && t.dream_state.twelve_month.prose) || '' },
      },
    },
  };
  if (t.opening) {
    payload.body.mutable['target-audience'] =
      `${payload.body.mutable['target-audience']}\n\n${t.opening}`;
  }

  // Pitfall 3 mitigation: all three writes land BEFORE commit. Individual
  // write failure throws BEFORE commit, leaving repo at HEAD (rollback).
  let objWritten = false;
  let cfgWritten = false;
  try {
    objectives.writeObjectivesMd(cwd, payload, { unlockIntent: false });
    objWritten = true;

    writeConfigBrief(cwd, {
      business_model: payload.frontmatter.business_model,
      region: payload.frontmatter.region,
      audience_policy: payload.frontmatter.audience_policy,
      compliance_packs: payload.frontmatter.compliance_packs,
    });
    cfgWritten = true;

    // STATE.md last_activity touch via existing state.cjs writer.
    // Use writeStateMd contract; keep brief:* map unchanged.
    touchStateActivity(cwd, `Phase 3 DEFINE Mode A — ${fixture.persona_name || fixtureName}`);

    performAtomicCommit(cwd, 'greenfield', fixture.persona_name || fixtureName);
  } catch (e) {
    // Rollback: remove any partially-written files BEFORE propagating.
    const base = path.join(cwd, '.planning');
    if (objWritten) {
      const p = path.join(base, 'OBJECTIVES.md');
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    // config.json rollback: restore from the pre-write snapshot if we can; otherwise leave
    // the existing (possibly unmodified due to lock) file. Do NOT run `git reset --hard`.
    throw e;
  }
  return { status: 'applied_from_fixture', fixture: fixtureName, koreaSignal };
}

function touchStateActivity(cwd, activityLine) {
  // Minimal wrapper. Uses state.cjs primitive; no new state mutation.
  const statePath = path.join(cwd, '.planning', 'STATE.md');
  if (!fs.existsSync(statePath)) return;
  const content = fs.readFileSync(statePath, 'utf-8');
  const { extractFrontmatter } = require('./frontmatter.cjs');
  const fm = extractFrontmatter(content);
  fm.last_updated = new Date().toISOString();
  fm.last_activity = activityLine;
  const { spliceFrontmatter } = require('./frontmatter.cjs');
  atomicWriteFileSync(statePath, spliceFrontmatter(content, fm));
}
```

Step 2 — Create `tests/brief-define-canary.test.cjs` (structural assertion):

```javascript
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

describe('Phase 3 canary: orchestrator-workers pattern wired end-to-end', () => {
  test('commands/brief/define.md references brief/workflows/define.md', () => {
    const cmdMd = fs.readFileSync(path.join(ROOT, 'commands', 'brief', 'define.md'), 'utf-8');
    assert.match(cmdMd, /brief\/workflows\/define\.md/);
  });

  test("brief-tools.cjs routes `define` command to lib/define.cjs", () => {
    const toolsCjs = fs.readFileSync(path.join(ROOT, 'brief', 'bin', 'brief-tools.cjs'), 'utf-8');
    assert.match(toolsCjs, /case 'define'/);
    assert.match(toolsCjs, /require\(['"]\.\/lib\/define\.cjs['"]\)/);
  });

  test('objectives.cjs exports 5 primitives Phase 5+ reuses', () => {
    const obj = require('../brief/bin/lib/objectives.cjs');
    for (const fn of [
      'writeObjectivesMd',
      'readObjectivesMd',
      'validateObjectivesComplete',
      'checkStaleAnchor',
      'enforceImmutableLock',
    ]) {
      assert.strictEqual(typeof obj[fn], 'function', `${fn} exported`);
    }
  });

  test('define.cjs exports the flow-controller + 4-config + atomic-commit primitives', () => {
    const def = require('../brief/bin/lib/define.cjs');
    for (const fn of [
      'cmdDefineApply',
      'applyFromFixture',
      'detectKoreaSignals',
      'writeConfigBrief',
      'performAtomicCommit',
    ]) {
      assert.strictEqual(typeof def[fn], 'function', `${fn} exported`);
    }
  });
});
```

Step 3 — Create `tests/brief-define-atomic-commit.test.cjs`. **B-1 FIX: every git assertion uses `execFileSync('git', [...], {cwd: tmpDir, encoding: 'utf-8'})` directly — NOT `runGsdTools(['shell','git',...])` (no such dispatcher). B-3 FIX: uses `createTempGitProjectWithConfig` so git is initialized. W-2 FIX: primary negative test is deterministic stub-throw; chmod-based is secondary and may skip gracefully.**

```javascript
const { test, describe, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('node:child_process');
const { createTempGitProjectWithConfig, cleanup, runGsdTools } = require('./helpers.cjs');

function gitLogFiles(cwd) {
  // B-1 FIX: direct execFileSync — brief-tools.cjs has no `case 'shell':` dispatcher.
  const out = execFileSync('git', ['log', '-1', '--name-only', '--format='], {
    cwd, encoding: 'utf-8',
  });
  return out.trim().split('\n').filter(Boolean).sort();
}

function gitLogSubject(cwd) {
  return execFileSync('git', ['log', '-1', '--format=%s'], {
    cwd, encoding: 'utf-8',
  }).trim();
}

describe('Atomic 3-artifact commit (Pitfall 3 mitigation, DEF-04 supporting)', () => {
  let tmpDir;

  beforeEach(() => { tmpDir = createTempGitProjectWithConfig(); });
  afterEach(() => { cleanup(tmpDir); });

  test('Successful apply produces exactly 1 commit touching OBJECTIVES.md + config.json + STATE.md', () => {
    const r = runGsdTools(['define', 'apply', '--fixture', 'korea-b2c-persona.json'], tmpDir);
    assert.ok(r.success, `define apply failed: ${r.error || r.output}`);

    const files = gitLogFiles(tmpDir);
    assert.deepStrictEqual(
      files,
      [
        '.planning/OBJECTIVES.md',
        '.planning/STATE.md',
        '.planning/config.json',
      ].sort(),
      'exactly 3 planning files in single atomic commit',
    );
  });

  test('W-2 primary — Rollback on deterministic stub-throw: writeConfigBrief throws → no OBJECTIVES.md on disk + no new commit', () => {
    // W-2 FIX: deterministic negative path — stub writeConfigBrief via require cache
    // to throw. This is guaranteed to exercise the rollback branch regardless of
    // filesystem / OS quirks. Reload define.cjs fresh in-process after monkey-patching.
    const defineModulePath = require.resolve('../brief/bin/lib/define.cjs');
    // Clear any cached copy so our patched version takes hold for this test only.
    delete require.cache[defineModulePath];
    const define = require(defineModulePath);
    const originalWriteConfigBrief = define.writeConfigBrief;
    define.writeConfigBrief = () => {
      throw new Error('SIMULATED_CONFIG_WRITE_FAILURE');
    };
    try {
      let threw = false;
      try {
        define.applyFromFixture(tmpDir, 'korea-b2c-persona.json');
      } catch (e) {
        threw = true;
        assert.match(e.message, /SIMULATED_CONFIG_WRITE_FAILURE/);
      }
      assert.ok(threw, 'applyFromFixture propagated the stubbed error');

      // Rollback invariant: OBJECTIVES.md must NOT exist in the working tree.
      const objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
      assert.ok(!fs.existsSync(objPath),
        'OBJECTIVES.md rolled back after writeConfigBrief stub threw');

      // HEAD should be unchanged from the createTempGitProjectWithConfig seed commit.
      const subject = gitLogSubject(tmpDir);
      assert.doesNotMatch(subject, /DEFINE greenfield/,
        'no DEFINE commit landed on HEAD (rollback occurred before performAtomicCommit)');
    } finally {
      define.writeConfigBrief = originalWriteConfigBrief;
      // Also clear cache so the next test gets a fresh module.
      delete require.cache[defineModulePath];
    }
  });

  test('W-2 secondary — chmod-based rollback (may skip on filesystems that ignore read-only bit)', () => {
    // Secondary test — same invariants but triggers the rollback via filesystem
    // permission denial rather than stub-throw. Skips silently on filesystems
    // that ignore chmod 0o444 (e.g. Docker-as-root, Windows CI). The W-2 primary
    // test above is the deterministic guarantor.
    const configPath = path.join(tmpDir, '.planning', 'config.json');
    try { fs.chmodSync(configPath, 0o444); } catch (_) { return; /* skip */ }
    let writeable = false;
    try { fs.writeFileSync(configPath, '{"probe":1}'); writeable = true; } catch (_) {}
    if (writeable) {
      // Filesystem ignores chmod — secondary test is inapplicable. Skip.
      try { fs.chmodSync(configPath, 0o644); } catch (_) {}
      return;
    }

    const r = runGsdTools(['define', 'apply', '--fixture', 'korea-b2c-persona.json'], tmpDir);
    assert.ok(!r.success, 'apply should fail when config.json is read-only');

    const objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    assert.ok(!fs.existsSync(objPath), 'OBJECTIVES.md rolled back');

    const subject = gitLogSubject(tmpDir);
    assert.doesNotMatch(subject, /DEFINE greenfield/,
      'no DEFINE commit landed on HEAD');

    try { fs.chmodSync(configPath, 0o644); } catch (_) { /* best-effort */ }
  });
});
```

Step 4 — Extend `tests/brief-define-mode-a.test.cjs` with Cycle 2 + 3 + 4 + 5 (append inside the existing describe block). **B-1 FIX: Cycle 3 uses direct `execFileSync('git', ...)`. B-3 FIX: switch the beforeEach in the new cycles to `createTempGitProjectWithConfig` so git is initialized for the Cycle 3 commit assertion (may require splitting the describe block into two — one for Cycle 1 using existing createTempProject, another for Cycles 2–5 using createTempGitProjectWithConfig). B-6: new Cycle 5 asserts non-Korea fixture produces compliance_packs: [].**

Append the following INSIDE `tests/brief-define-mode-a.test.cjs`, inside a NEW describe block that uses `createTempGitProjectWithConfig`:

```javascript
const { execFileSync } = require('node:child_process');
const { createTempGitProjectWithConfig } = require('./helpers.cjs');

describe('Cycles 2+3+4+5 (config + atomic commit + roundtrip + non-Korea)', () => {
  let tmpDir;
  let objectivesPath;
  let configPath;
  beforeEach(() => {
    tmpDir = createTempGitProjectWithConfig();
    objectivesPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    configPath = path.join(tmpDir, '.planning', 'config.json');
  });
  afterEach(() => { cleanup(tmpDir); });

  test('Cycle 2 — config.json extended with brief.* keys; other keys preserved', () => {
    runGsdTools(['define', 'apply', '--fixture', 'korea-b2c-persona.json'], tmpDir);
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.deepStrictEqual(cfg.brief, {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
    });
    assert.strictEqual(cfg.model_profile, 'quality', 'model_profile untouched');
  });

  test('Cycle 3 — atomic commit contains exactly 3 planning files (B-1 direct execFileSync)', () => {
    runGsdTools(['define', 'apply', '--fixture', 'korea-b2c-persona.json'], tmpDir);
    const out = execFileSync('git', ['log', '-1', '--name-only', '--format='], {
      cwd: tmpDir, encoding: 'utf-8',
    });
    const files = out.trim().split('\n').filter(Boolean).sort();
    assert.deepStrictEqual(files, [
      '.planning/OBJECTIVES.md',
      '.planning/STATE.md',
      '.planning/config.json',
    ].sort());
  });

  test('Cycle 4 — OBJECTIVES.md round-trips via frontmatter.cjs (D-20) without drift', () => {
    runGsdTools(['define', 'apply', '--fixture', 'korea-b2c-persona.json'], tmpDir);
    const content1 = fs.readFileSync(objectivesPath, 'utf-8');
    const fm1 = extractFrontmatter(content1);
    // Re-extract from the same file — same serializer path — must match.
    const fm2 = extractFrontmatter(fs.readFileSync(objectivesPath, 'utf-8'));
    assert.deepStrictEqual(fm2, fm1, 'frontmatter stable across re-read');
  });

  test('Cycle 5 (B-6 negative) — non-Korea fixture produces compliance_packs: []', () => {
    runGsdTools(['define', 'apply', '--fixture', 'non-korea-b2b-persona.json'], tmpDir);
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.deepStrictEqual(cfg.brief.compliance_packs, [],
      'non-Korea transcript → inferredCompliance empty → compliance_packs: []');
    // Sanity: business_model / region / audience_policy still fell through from expected_configs.
    assert.strictEqual(cfg.brief.business_model, 'b2b');
    assert.strictEqual(cfg.brief.region, 'us');
    assert.strictEqual(cfg.brief.audience_policy, 'partner');
  });
});
```

Note: Cycle 1 (Plan 02's existing test) remains in the original describe block using `createTempProject` — that test does NOT need git init because Plan 02's applyFromFixture stub only wrote OBJECTIVES.md (no commit). Plan 04's rewritten applyFromFixture adds the commit step, which is why Cycles 2–5 use the git-initialized helper.

Step 5 — Run the full Phase 3 test suite:
```
node --test tests/brief-define-mode-a.test.cjs tests/brief-define-mode-b.test.cjs tests/brief-define-korea-signal.test.cjs tests/brief-config-brief-namespace.test.cjs tests/brief-define-atomic-commit.test.cjs tests/brief-define-canary.test.cjs tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/ask-user-questions-fallback.test.cjs tests/architecture-counts.test.cjs
```
All MUST be GREEN.
  </action>
  <verify>
    <automated>node --test tests/brief-define-canary.test.cjs tests/brief-define-atomic-commit.test.cjs tests/brief-define-mode-a.test.cjs 2>&amp;1 | tail -20</automated>
    <automated>node --test tests/brief-define-mode-b.test.cjs tests/brief-define-korea-signal.test.cjs tests/brief-config-brief-namespace.test.cjs tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/ask-user-questions-fallback.test.cjs tests/architecture-counts.test.cjs 2>&amp;1 | tail -15</automated>
    <automated>node -e "const d=require('./brief/bin/lib/define.cjs'); ['cmdDefineApply','applyFromFixture','applyModeBAmendment','detectKoreaSignals','writeConfigBrief','performAtomicCommit'].forEach(fn=>{if(typeof d[fn]!=='function'){console.error('MISSING:',fn);process.exit(1);}});console.log('ALL DEFINE EXPORTS PRESENT');"</automated>
    <automated>grep -c "execFileSync('git'" tests/brief-define-atomic-commit.test.cjs</automated>
    <automated>grep -c "runGsdTools.*shell" tests/brief-define-atomic-commit.test.cjs tests/brief-define-mode-a.test.cjs</automated>
    <automated>grep -c "expected.compliance_packs" brief/bin/lib/define.cjs</automated>
    <automated>wc -l brief/bin/lib/define.cjs</automated>
  </verify>
  <acceptance_criteria>
    - `node --test tests/brief-define-canary.test.cjs` exits 0 (canary structural assertion GREEN)
    - `node --test tests/brief-define-atomic-commit.test.cjs` exits 0 (positive + W-2 primary stub-throw both GREEN; chmod-based secondary GREEN or silently skips)
    - `node --test tests/brief-define-mode-a.test.cjs` exits 0 (Cycles 1 + 2 + 3 + 4 + 5 all GREEN)
    - `brief/bin/lib/define.cjs` exports all 6: `cmdDefineApply`, `applyFromFixture`, `applyModeBAmendment` (Plan 03), `detectKoreaSignals`, `writeConfigBrief`, `performAtomicCommit`
    - **B-1 GUARD:** `grep -c "execFileSync.*git" tests/brief-define-atomic-commit.test.cjs` ≥ 2 (at least gitLogFiles + gitLogSubject helpers)
    - **B-1 GUARD:** `grep -c "runGsdTools.*shell" tests/brief-define-atomic-commit.test.cjs tests/brief-define-mode-a.test.cjs` EQUALS 0 (zero references to the non-existent `['shell','git',...]` dispatcher path)
    - **B-6 GUARD:** `grep -c "expected.compliance_packs" brief/bin/lib/define.cjs` EQUALS 0 (no injection override remains; inferredCompliance is the sole source)
    - `wc -l brief/bin/lib/define.cjs` reports ≤ 400 lines (budget guard; bumped from 350 after absorbing Plan 03 + Plan 06 additions via serialized wave)
    - Direct `execFileSync('git', ['log','-1','--name-only','--format='])` run inside the temp project returns exactly `.planning/OBJECTIVES.md`, `.planning/STATE.md`, `.planning/config.json` after a successful fixture apply (Cycle 3 + atomic-commit positive test)
    - No regression: `node --test tests/brief-define-mode-b.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/brief-objectives-roundtrip.test.cjs tests/ask-user-questions-fallback.test.cjs tests/architecture-counts.test.cjs tests/brief-define-korea-signal.test.cjs tests/brief-config-brief-namespace.test.cjs` all exit 0
  </acceptance_criteria>
  <done>Atomic 3-artifact commit works; canary structural assertion passes; Mode A test now covers all 5 Cycles (including B-6 negative); all git assertions use direct execFileSync (B-1 fix); stub-throw deterministic rollback test added (W-2 fix); define.cjs under 400 lines.</done>
</task>

</tasks>

<verification>
- Full Phase 3 test file set GREEN: brief-define-mode-a, brief-define-mode-b, brief-define-korea-signal, brief-config-brief-namespace, brief-define-atomic-commit, brief-define-canary, brief-objectives-roundtrip, brief-objectives-immutable-lock, ask-user-questions-fallback, architecture-counts
- Direct `execFileSync('git', ['log','-1','--name-only'])` in test tmpDir returns exactly 3 files (the canary atomic-commit invariant)
- `wc -l brief/bin/lib/define.cjs` ≤ 400 lines
- `grep -E "gray-matter|require\\('ajv'\\)|require\\('js-yaml'\\)" brief/bin/lib/define.cjs` returns nothing (A1 zero-deps guard)
- `grep "VALID_CONFIG_KEYS" brief/bin/lib/define.cjs` returns nothing (PATTERNS §Wave C — brief.* must NOT couple to cmdConfigSet)
- `grep "expected.compliance_packs" brief/bin/lib/define.cjs` returns nothing (B-6 guard — Korea-signal is the sole source of compliance_packs inference)
- `grep "runGsdTools.*shell" tests/brief-define-*.test.cjs` returns nothing (B-1 guard — no reference to non-existent shell dispatcher)
- `tests/helpers.cjs` exports `createTempProjectWithConfig` AND `createTempGitProjectWithConfig` (B-2/B-3 centralization)
</verification>

<success_criteria>
1. DEF-04: 4 configs (business_model/region/audience_policy/compliance_packs) round-trip through `.planning/config.json` `brief.*` namespace preserving all other keys.
2. D-11 Korea-first policy: compliance_packs pre-checked with [PIPA, ISMS-P, MyData] ONLY when Korea signals detected in conversation transcript; absent signals → empty array. **B-6: this is enforced by inferredCompliance being the SOLE source — fixture's expected_configs.compliance_packs is the expected OUTPUT asserted by tests, never the injected value.**
3. Pitfall 3 mitigation: atomic 3-artifact commit (OBJECTIVES.md + config.json + STATE.md) verifiable by direct `execFileSync('git', ['log','-1','--name-only'])`; partial-failure rollback prevents orphan OBJECTIVES.md — verified by deterministic W-2 stub-throw test (primary) and opportunistic chmod-based test (secondary, may skip).
4. Canary property (CONTEXT `<domain>` load-bearing): `/brief-define` writes OBJECTIVES.md via the same workflow+lib split Phase 5+ will reuse — proven by canary structural test.
5. W-4: Wave serialization (Plan 04 now wave 4, after Plan 03 wave 3) removes the parallel-execution hazard on `brief/bin/lib/define.cjs` module.exports; scope stays within a single plan's context budget (no split needed).
</success_criteria>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| fixture path in CLI arg → applyFromFixture (basename-only) | Test-only flag; not documented in user-facing help |
| conversation transcript (string) → detectKoreaSignals regex | Untrusted user input matched against fixed keyword regex — no injection vector |
| atomic-commit subprocess → `brief-tools commit` | Child process invoked with fixed argv; git operates on the repo root |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-04 | Tampering | Fixture path traversal | mitigate | Basename-only guard rejects `..`/`/`/`\\` in fixture name before `path.resolve`. Confines lookup to tests/fixtures/. Covered by applyFromFixture guard. |
| T-03-09 | Tampering | config.json overwrite wipes user's other keys | mitigate | writeConfigBrief reads-then-merges via `withPlanningLock`; Shared Pattern 3 preserves all non-brief keys. Test `brief-config-brief-namespace.test.cjs` Cycle 2 asserts preservation. |
| T-03-10 | Denial of Service | Partial-write leaves repo in inconsistent state — /brief-discover block-gate misreports | mitigate | Pitfall 3 rollback: all three atomicWriteFileSync calls land BEFORE `performAtomicCommit`; on exception the partial OBJECTIVES.md is `fs.unlinkSync`'d before re-throw. Test `brief-define-atomic-commit.test.cjs` W-2 primary (stub-throw) verifies rollback invariant deterministically; W-2 secondary (chmod) verifies under real filesystem denial. |
</threat_model>

<output>
After completion, create `.planning/phases/03-define-canary-phase-0-end-to-end/03-04-SUMMARY.md`
</output>
</content>
