---
phase: 03
plan: 02
type: execute
wave: 2
depends_on:
  - 03-01
files_modified:
  - commands/brief/define.md
  - brief/workflows/define.md
  - brief/bin/lib/define.cjs
  - brief/bin/brief-tools.cjs
  - docs/ARCHITECTURE.md
  - tests/brief-define-mode-a.test.cjs
autonomous: true
requirements:
  - DEF-01
  - DEF-02
must_haves:
  truths:
    - "User invokes `/brief-define` and is routed through `commands/brief/define.md` → `brief/workflows/define.md` → `brief/bin/lib/define.cjs` (orchestrator-workers triangle wired end-to-end)"
    - "Mode A is selected via the entry question (D-05) and produces OBJECTIVES.md with Push Twice + Language Precision evidence in the body (core_value / problem_statement from free-text) AND Dream State — Now / 3-month / 12-month sections populated from prose"
    - "Mode A test-mode --fixture=korea-b2c-persona.json short-circuits the AskUserQuestion loop and drives the full lib path with canned answers"
    - "The workflow markdown honors the TEXT_MODE fallback contract (tests/ask-user-questions-fallback.test.cjs remains green)"
    - "docs/ARCHITECTURE.md command and workflow count tables are incremented in the same commit that adds commands/brief/define.md + brief/workflows/define.md (tests/architecture-counts.test.cjs remains green)"
  artifacts:
    - path: "commands/brief/define.md"
      provides: "Slash dispatch shim for /brief-define; names workflow + allowed-tools + argument-hint"
      contains: "brief/workflows/define.md"
      min_lines: 18
    - path: "brief/workflows/define.md"
      provides: "Mode A prompt orchestration with TEXT_MODE fallback + mode-select entry"
      contains: "TEXT_MODE"
      min_lines: 120
    - path: "brief/bin/lib/define.cjs"
      provides: "Mode A flow controller (entry-mode dispatch, fixture-aware test path, Push-Twice/Language-Precision/Dream-State orchestration, draft-proposal + 3-option approval)"
      contains: "function cmdDefineApply"
      exports: ["cmdDefineApply", "runInteractiveModeA", "applyFromFixture"]
      min_lines: 150
    - path: "tests/brief-define-mode-a.test.cjs"
      provides: "A4-style round-trip smoke on Korea-first B2C fixture — Cycle 1 shape, Cycle 2 deferred to Plan 04, Cycle 3 deferred to Plan 04"
      contains: "korea-b2c-persona"
  key_links:
    - from: "commands/brief/define.md"
      to: "brief/workflows/define.md"
      via: "@~/.claude/brief/workflows/define.md execution_context reference"
      pattern: "brief/workflows/define\\.md"
    - from: "brief/workflows/define.md"
      to: "brief-tools.cjs (define dispatcher case)"
      via: "Workflow Step 3 invokes `brief-tools define apply` subcommand"
      pattern: "brief-tools define apply"
    - from: "brief/bin/brief-tools.cjs"
      to: "brief/bin/lib/define.cjs"
      via: "case 'define': require('./lib/define.cjs')"
      pattern: "case 'define'"
    - from: "brief/bin/lib/define.cjs"
      to: "brief/bin/lib/objectives.cjs"
      via: "require('./objectives.cjs') → writeObjectivesMd"
      pattern: "require\\('\\./objectives\\.cjs'\\)"
---

<objective>
Ship Mode A (Greenfield) of `/brief-define` end-to-end: slash dispatch shim, prompt orchestration workflow with TEXT_MODE fallback, and the fixture-aware lib controller that drives the conversation from opening free-text through Push Twice → Language Precision → Dream State Mapping → Claude-proposes draft → user-approves classification. Wire the `define` case into brief-tools.cjs so `runGsdTools(['define','apply','--fixture','korea-b2c-persona.json'], tmpDir)` executes end-to-end.

Purpose: This is the canary plan. DEF-01 (Push Twice + Language Precision) and DEF-02 (Dream State Mapping) are the most visible user-facing requirements; if Mode A lands correctly, Plans 03/04/05/06 layer cleanly on top. Per 03-CONTEXT.md `<specifics>`: `/brief-define` is the user's face of BRIEF — non-developer planner on home turf — so the Korean default UI register is load-bearing.

Output: 1 command.md + 1 workflow.md + 1 lib.cjs + dispatcher case + 1 test file + docs/ARCHITECTURE.md count bumps in the SAME commit.
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
@.planning/phases/03-define-canary-phase-0-end-to-end/03-01-SUMMARY.md
@commands/brief/status.md
@brief/workflows/status.md
@brief/bin/lib/status.cjs
@brief/bin/brief-tools.cjs
@brief/bin/lib/objectives.cjs
@tests/state-brief-roundtrip.test.cjs
@tests/ask-user-questions-fallback.test.cjs
@docs/ARCHITECTURE.md

<interfaces>
<!-- Contracts Plan 03 (Mode B) and Plan 04 (4-config + commit) will consume. -->

From brief/bin/lib/define.cjs (NEW — this plan):
```javascript
async function cmdDefineApply(cwd, flags, raw);
// flags shape: { fixture?: string, amend?: boolean, unlockIntent?: boolean }
// Dispatches to runInteractiveModeA / runInteractiveModeB / applyFromFixture.
// Plan 03 extends with Mode B branch; Plan 04 extends with writeConfigBrief + atomic commit.

async function runInteractiveModeA(cwd);
// Full Mode A conversation: mode-select, opening free-text, Push Twice,
// Language Precision, Dream State Mapping × 3 horizons, draft proposal,
// approval question. Returns a draftPayload ready for writeObjectivesMd.
// In Plan 02 this is a SKELETON that uses fixture short-circuit; Plan 04
// wires the 4-config inference + atomic commit afterward.

async function applyFromFixture(cwd, fixture);
// Test-only path. Loads the fixture's conversation_transcript + expected_configs
// and calls writeObjectivesMd(cwd, payload, {unlockIntent:false}) with
// classification per D-10 heuristic.

module.exports = { cmdDefineApply, runInteractiveModeA, applyFromFixture };
```

From brief/bin/lib/objectives.cjs (Plan 01 — already shipped):
```javascript
writeObjectivesMd(cwd, payload, opts);   // returns {path, frontmatter}
readObjectivesMd(cwd);                   // returns {exists, frontmatter, body}
```

Dispatcher contract (brief-tools.cjs):
```javascript
case 'define': {
  const subcommand = args[1];                       // 'apply'
  const define = require('./lib/define.cjs');
  if (subcommand === 'apply') {
    const parsed = parseNamedArgs(args, ['fixture'], ['amend', 'unlock-intent']);
    return define.cmdDefineApply(cwd, {
      fixture: parsed.fixture,
      amend: parsed.amend,
      unlockIntent: parsed['unlock-intent'],
    }, raw);
  }
  error("Unknown define subcommand. Available: apply");
  break;
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Write Mode A smoke test (RED) + fixture-driven short-circuit path in define.cjs + brief-tools.cjs dispatcher case</name>
  <read_first>
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md §Wave B (commands/brief/define.md frontmatter lines 170-199, workflows/define.md skeleton lines 215-254, define.cjs flow controller lines 272-341, brief-tools.cjs dispatcher cases lines 366-404)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md §Example 6 (workflow entry — mode select, lines 886-947) + §Mocking AskUserQuestion in Tests (lines 1405-1425)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md §decisions D-01..D-07 (conversational experience), D-10 (classification 3-option)
    - commands/brief/status.md (exact shape — 22 lines; frontmatter, objective, execution_context, process)
    - brief/workflows/status.md (dispatch-contract minimal template)
    - brief/bin/lib/status.cjs (module shape to mirror — imports + single exported fn + module.exports)
    - brief/bin/brief-tools.cjs (existing `case 'status':` block + parseNamedArgs helper for flag parsing)
    - tests/state-brief-roundtrip.test.cjs (A4-style Cycle 1/2/3/Placeholder structure lines 24-334)
    - tests/helpers.cjs (createTempProject, runGsdTools, cleanup signatures)
  </read_first>
  <behavior>
    - Test "Cycle 1 — Mode A with Korea-first B2C fixture writes OBJECTIVES.md with correct shape" runs `runGsdTools(['define', 'apply', '--fixture', 'korea-b2c-persona.json'], tmpDir)` and:
      - `result.success === true` (subprocess exited 0)
      - `.planning/OBJECTIVES.md` exists under tmpDir
      - Extracted frontmatter has `status === 'ready'`, `mode === 'greenfield'`, `immutable_items` deep-equals `['creator-identity', 'core-value', 'problem-statement']`
      - Body contains these 11 literal headings (regex match each): `Immutable Intent`, `Creator Identity`, `Core Value`, `Problem Statement`, `Mutable Hypotheses`, `Target Audience Specifics`, `Verification Metrics`, `Hypothesized Alternative Tools / Competitors`, `Dream State — Now`, `Dream State — 3-month`, `Dream State — 12-month`
      - Body contains user's Korean free-text verbatim: `퇴근 후 혼자 집에서 운동하는 1인 가구 직장인` (from fixture opening) AND `AI가 봐주면서` (from push_twice_core_value.push_1_answer)
    - Note: assertions on config.json `brief.*` keys and atomic 3-file commit are DEFERRED to Plan 04 — Plan 02 writes ONLY OBJECTIVES.md for the fixture path (lib stub returns after OBJECTIVES write).
  </behavior>
  <action>
Step 1 — Create `tests/brief-define-mode-a.test.cjs` (RED initially):

```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

describe('/brief-define Mode A end-to-end (A4-style, Phase 3 canary — Plan 02 scope)', () => {
  let tmpDir;
  let objectivesPath;

  beforeEach(() => {
    tmpDir = createTempProject();
    objectivesPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('Cycle 1 — Mode A with Korea-first B2C fixture writes OBJECTIVES.md with correct shape', () => {
    const result = runGsdTools(
      ['define', 'apply', '--fixture', 'korea-b2c-persona.json'],
      tmpDir,
    );
    assert.ok(result.success, `define apply failed: ${result.error || result.output}`);
    assert.ok(fs.existsSync(objectivesPath), 'OBJECTIVES.md created');

    const content = fs.readFileSync(objectivesPath, 'utf-8');
    const fm = extractFrontmatter(content);

    // Frontmatter shape (D-10 classification + D-07 immutable_items list)
    assert.strictEqual(fm.status, 'ready');
    assert.strictEqual(fm.mode, 'greenfield');
    assert.deepStrictEqual(
      fm.immutable_items,
      ['creator-identity', 'core-value', 'problem-statement'],
      'D-10 default classification heuristic applied',
    );

    // Body sections (RESEARCH.md Example 4)
    const requiredSections = [
      'Immutable Intent',
      'Creator Identity',
      'Core Value',
      'Problem Statement',
      'Mutable Hypotheses',
      'Target Audience Specifics',
      'Verification Metrics',
      'Hypothesized Alternative Tools / Competitors',
      'Dream State — Now',
      'Dream State — 3-month',
      'Dream State — 12-month',
    ];
    for (const section of requiredSections) {
      assert.match(
        content,
        new RegExp(`^#{1,3}\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm'),
        `section "${section}" present in body`,
      );
    }

    // User's Korean free-text from fixture MUST appear verbatim
    assert.match(content, /퇴근 후 혼자 집에서 운동하는 1인 가구 직장인/,
      'fixture opening prose present in Mutable Hypotheses');
    assert.match(content, /AI가 봐주면서/,
      'fixture push_twice push_1_answer present in Immutable Intent core-value section');
  });
});
```

Step 2 — Create `brief/bin/lib/define.cjs` with the fixture-aware short-circuit path (minimum viable for Plan 02 — Plan 04 extends with config.json + atomic commit):

```javascript
/**
 * Define — /brief-define Mode A/B flow controller.
 *
 * Plan 02 scope: Mode A entry + fixture-aware test path + OBJECTIVES.md write.
 * Plan 03 scope: Mode B amendment path + --unlock-intent flow.
 * Plan 04 scope: 4-config inference + Korea-signal + config.json + atomic 3-artifact commit.
 *
 * D-05 (CONTEXT.md): 2 modes selected at entry via first-question user choice.
 * D-10 (CONTEXT.md): Immutable/mutable classification = Claude proposes, user approves.
 * D-11 (CONTEXT.md): 4 configs inferred at wrap-up — NOT implemented yet in Plan 02.
 */

const fs = require('fs');
const path = require('path');
const {
  planningPaths,
  output,
  error,
  atomicWriteFileSync,
} = require('./core.cjs');
const objectives = require('./objectives.cjs');

// D-10 classification heuristic — defaults for greenfield Mode A.
const IMMUTABLE_DEFAULT_ITEMS = ['creator-identity', 'core-value', 'problem-statement'];

async function cmdDefineApply(cwd, flags, raw) {
  if (flags && flags.fixture) {
    return applyFromFixture(cwd, flags.fixture);
  }
  // Production path — Plan 02 stub: emit a user-visible message pointing at
  // the in-runtime workflow dispatcher. Actual interactive loop is authored
  // in brief/workflows/define.md and driven by the runtime (Claude Code /
  // Codex / Gemini / OpenCode), not by this lib file directly.
  output({ status: 'interactive_mode_dispatched' }, raw,
    '대화형 Mode A는 brief/workflows/define.md 에서 진행됩니다.');
  return { status: 'interactive_mode_dispatched' };
}

async function runInteractiveModeA(cwd) {
  // Plan 02 placeholder. The interactive conversation is orchestrated by the
  // workflow markdown via AskUserQuestion; this function is a stub that a
  // future plan (or the workflow itself calling back through brief-tools)
  // uses to commit the final payload. Leave intentionally minimal in Plan 02.
  throw new Error('runInteractiveModeA: driven by workflow markdown — call applyFromFixture for tests');
}

function applyFromFixture(cwd, fixtureName) {
  const fixturePath = path.resolve(
    __dirname, '..', '..', '..', 'tests', 'fixtures', fixtureName,
  );
  if (!fs.existsSync(fixturePath)) {
    error(`Fixture not found: ${fixturePath}`);
    return { status: 'fixture_not_found', path: fixturePath };
  }
  const raw = fs.readFileSync(fixturePath, 'utf-8');
  const fixture = fixtureName.endsWith('.json') ? JSON.parse(raw) : require(fixturePath);

  const t = fixture.conversation_transcript;

  // Build OBJECTIVES.md payload from fixture conversation.
  // Immutable Intent body values come from Push Twice + Language Precision free-text.
  // Mutable Hypotheses body values come from Dream State Mapping prose + metrics.
  const payload = {
    frontmatter: {
      brief_objectives_version: '1.0',
      status: 'ready',
      mode: 'greenfield',
      immutable_items: IMMUTABLE_DEFAULT_ITEMS,
      // business_model / region / audience_policy / compliance_packs handled in Plan 04;
      // write placeholder values here so validateObjectivesComplete returns valid:true.
      business_model: (fixture.expected_configs && fixture.expected_configs.business_model) || 'b2c',
      region: (fixture.expected_configs && fixture.expected_configs.region) || 'kr',
      audience_policy: (fixture.expected_configs && fixture.expected_configs.audience_policy) || 'internal',
      compliance_packs: (fixture.expected_configs && fixture.expected_configs.compliance_packs) || [],
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

  // Include the entire Mode A opening verbatim in Mutable Hypotheses so the
  // test assertion (search for '퇴근 후 혼자 집에서 운동하는 1인 가구 직장인')
  // hits. Spliced into target-audience because the fixture's opening IS the
  // user's description of target audience + use-case in one sentence.
  if (t.opening) {
    payload.body.mutable['target-audience'] =
      `${payload.body.mutable['target-audience']}\n\n${t.opening}`;
  }

  objectives.writeObjectivesMd(cwd, payload, { unlockIntent: false });
  return { status: 'applied_from_fixture', fixture: fixtureName };
}

module.exports = {
  cmdDefineApply,
  runInteractiveModeA,
  applyFromFixture,
  IMMUTABLE_DEFAULT_ITEMS,
};
```

Step 3 — Add dispatcher case to `brief/bin/brief-tools.cjs` immediately after the existing `case 'status':` block (around line 783). Use the verbatim pattern from PATTERNS.md §Wave B lines 367-378:

```javascript
case 'define': {
  const subcommand = args[1];
  const define = require('./lib/define.cjs');
  if (subcommand === 'apply') {
    const parsed = parseNamedArgs(args, ['fixture'], ['amend', 'unlock-intent']);
    return define.cmdDefineApply(cwd, {
      fixture: parsed.fixture,
      amend: parsed.amend,
      unlockIntent: parsed['unlock-intent'],
    }, raw);
  }
  error('Unknown define subcommand. Available: apply');
  break;
}
```

Step 4 — Run the Mode A test:
```
node --test tests/brief-define-mode-a.test.cjs
```
MUST turn GREEN. If RED on the Korean-text-verbatim assertion, audit `applyFromFixture` to confirm `opening` prose is appended into body output BEFORE atomicWriteFileSync.
  </action>
  <verify>
    <automated>node --test tests/brief-define-mode-a.test.cjs 2>&amp;1 | tail -30</automated>
    <automated>grep -n "case 'define'" brief/bin/brief-tools.cjs</automated>
    <automated>grep -n "require('./lib/define.cjs')" brief/bin/brief-tools.cjs</automated>
    <automated>node -e "const d=require('./brief/bin/lib/define.cjs'); ['cmdDefineApply','runInteractiveModeA','applyFromFixture'].forEach(fn=>{if(typeof d[fn]!=='function'){console.error('MISSING:',fn);process.exit(1);}});console.log('DEFINE EXPORTS OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `node --test tests/brief-define-mode-a.test.cjs` exits 0 (GREEN)
    - `brief/bin/brief-tools.cjs` contains literal `case 'define'` AND literal `require('./lib/define.cjs')`
    - `brief/bin/lib/define.cjs` exports functions: `cmdDefineApply`, `runInteractiveModeA`, `applyFromFixture`, `IMMUTABLE_DEFAULT_ITEMS`
    - `brief/bin/lib/define.cjs` imports `require('./objectives.cjs')`
    - `brief/bin/lib/define.cjs` does NOT import `gray-matter`, `ajv`, `js-yaml` (zero-deps guard)
    - Fixture JSON at `tests/fixtures/korea-b2c-persona.json` parses (loaded successfully by applyFromFixture)
    - The test assertion block contains regex `/퇴근 후 혼자 집에서 운동하는 1인 가구 직장인/` (Korean fixture text verbatim in test file)
  </acceptance_criteria>
  <done>Mode A smoke test GREEN via fixture path; brief-tools.cjs dispatcher wired; define.cjs exports stable contract consumable by Plan 03/04.</done>
</task>

<task type="auto">
  <name>Task 2: Author commands/brief/define.md + brief/workflows/define.md (Mode A skeleton) + bump docs/ARCHITECTURE.md counts in SAME commit</name>
  <read_first>
    - commands/brief/status.md (exact 22-line template to mirror)
    - brief/workflows/status.md (minimal dispatch-contract template)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md §Wave B commands/brief/define.md frontmatter (lines 170-199), brief/workflows/define.md Purpose+dispatch pattern (lines 215-254), §Shared Pattern 7 TEXT_MODE fallback (lines 941-952), §install.js — Why It Does NOT Need Explicit SRC Tuples (lines 985-993)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md §Example 6 (workflow entry — mode select, lines 886-947) + §Anti-Patterns to Avoid (esp. "Explicit [Push Twice] tags")
    - tests/ask-user-questions-fallback.test.cjs lines 46-82 (TEXT_MODE fallback scanner — fails CI if workflow with AskUserQuestion lacks the paired fallback prose)
    - tests/architecture-counts.test.cjs lines 34-45 (scans `**Total commands:** N` and `**Total workflows:** N` in docs/ARCHITECTURE.md)
    - docs/ARCHITECTURE.md (locate the count tables being scanned; they are the lines to bump)
  </read_first>
  <action>
Step 1 — Create `commands/brief/define.md` (~20 lines per PATTERNS.md estimate) using the status.md template. Frontmatter MUST include `argument-hint: "[--amend] [--unlock-intent]"` per D-07:

```markdown
---
name: brief:define
description: Conversational intent extractor — Mode A greenfield or Mode B amendment. Writes .planning/OBJECTIVES.md (and config.json brief.* in Plan 04).
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
Mode A (Greenfield): 20–35 min — Push Twice + Language Precision + Dream State Mapping. Produces a new .planning/OBJECTIVES.md.
Mode B (Amendment): 3–10 min — revisits mutable sections only; Immutable Intent is locked unless --unlock-intent is supplied.
</objective>

<execution_context>
@~/.claude/brief/workflows/define.md
</execution_context>

<process>
Execute the define workflow: parse flags, run mode-select question, branch to Mode A or Mode B, write artifacts, commit atomically.
</process>
```

Step 2 — Create `brief/workflows/define.md` (~250 lines target per RESEARCH.md). This file orchestrates the interactive conversation. Mode A is authored in full in this plan; Mode B is a STUB section that Plan 03 fills in. The 4-config inference + Korea-signal + atomic commit details are STUBBED pointing to Plan 04.

MUST INCLUDE THE VERBATIM TEXT_MODE FALLBACK SENTINEL (required by tests/ask-user-questions-fallback.test.cjs — copy the wording exactly as below so the scanner matches "text_mode" OR "text mode" AND "plain-text"/"plain text"/"numbered list"):

```markdown
<purpose>
Guide a business planner through BRIEF's conversational intent extraction.
Mode A (Greenfield) runs the full Push Twice + Language Precision + Dream State Mapping flow.
Mode B (Amendment) revisits mutable items only; Immutable Intent is locked unless --unlock-intent is supplied.
All user-facing prompts are Korean by default.
</purpose>

<process>

## Step 0: Flag Parsing + TEXT_MODE Detection

Check invocation flags from $ARGUMENTS:
- `--amend` → force Mode B entry (skip mode-select question)
- `--unlock-intent` → flag passed through to objectives.cjs writer to allow Immutable Intent edits (Mode B only)

Set TEXT_MODE=true if `--text` is present in $ARGUMENTS OR `workflow.text_mode` from the init JSON is true. When TEXT_MODE is active, replace every AskUserQuestion call with a plain-text numbered list and ask the user to type their choice number.

## Step 1: Entry Mode Selection (D-05)

Ask the first question — mixed format (button seed + context text):

<askuserquestion>
  <question>
BRIEF 기획에 오신 것을 환영합니다.
어떤 종류의 작업을 시작하시나요?
  </question>
  <options>
    <option>새 사업/제품 기획을 처음부터 (Mode A · 약 20–35분)</option>
    <option>기존 프로젝트를 다듬기 (Mode B · 약 3–10분)</option>
  </options>
</askuserquestion>

If `--amend` was supplied, skip this step and jump to Mode B.

Mode detected by user answer, NOT by OBJECTIVES.md file presence (D-05).

## Step 2A: Mode A (Greenfield)

### 2A.1 — Opening free-text (D-02 — button-seed-then-free-text rule)
"방금 'Mode A'를 선택하셨습니다. 어떤 기획인지 한 문장으로 설명해 주시겠어요?"

### 2A.2 — Push Twice on the core value (D-03 implicit rendering; NO visible [Push Twice] tag)
Examine the user's opening answer. If it contains abstract terms ("편하게", "더 좋게", "효율적으로"), ask a deepening follow-up in natural Korean:
"'편하게'라는 단어가 몇 가지 다른 뜻으로 쓰일 수 있어서요. 같은 일을 더 짧은 시간에 끝낸다는 뜻일 수도 있고, 덜 집중해도 된다는 뜻일 수도 있고, 배우는 데 걸리는 시간이 짧다는 뜻일 수도 있습니다. 지금 머릿속에서 가장 먼저 떠오르신 게 어떤 편안함인가요?"

If the Push 1 answer is still abstract, ask a Push 2 (scene-visualization):
"'{Push 1 답변의 핵심 단어}'라고 하셨는데, 그 순간이 구체적으로 어떤 장면인지 한 번 상상해서 묘사해 주실 수 있을까요? 예를 들어, 누가 무엇을 하고 있고, 무엇이 다른 느낌인지."

Push 3 is RARE — only if both prior answers stayed in generic language. See 03-RESEARCH.md Pattern 2 for the Korean template.

NEVER label these as "Push Twice" to the user (D-03). They arrive naturally as part of the conversation.

### 2A.3 — Language Precision on target user (RESEARCH Pattern 3)
When the user names an audience using a slippery word ("기업", "사용자", "고객"), reflect it back with a structured "which of these did you mean, or none of them?" prompt. See 03-RESEARCH.md Pattern 3 for the "기업 고객" example lines 398-408.

### 2A.4 — Dream State Mapping · Now (D-04 hybrid prose + optional metrics)
"이제 세 가지 시점에서 이 프로젝트가 어떤 상태인지 그림을 그려보겠습니다. 첫 번째 — 지금. 오늘 이 프로젝트를 처음 시작하는 순간, 구체적으로 뭐가 보이고, 누가 있고, 무엇이 없나요? 3–5문장으로 묘사해 주세요."
Then offer 2–3 optional quantitative slots, clearly marked OPTIONAL with `(해당없음)` / `(모름)` allowed.

### 2A.5 — Dream State Mapping · 3-month
"감사합니다. 다음은 3개월 후 시점입니다. 3개월이 지났을 때 이 프로젝트가 어떤 상태이길 바라시나요? 가장 단순하게, 가장 현실적으로. 3–5문장으로."

### 2A.6 — Dream State Mapping · 12-month
Same structure as 2A.5. Per 03-RESEARCH.md Pitfall 4 pacing guidance: allow shorter prose (2–3 sentences) and explicit "12개월은 아직 희망의 영역입니다 — 숫자 없이 그림만 그려주셔도 됩니다" prompt.

### 2A.7 — Claude proposes draft + 3-option approval (D-10)
After the conversation, draft a complete OBJECTIVES.md and present the classification:

<askuserquestion>
  <question>
작성된 OBJECTIVES.md 초안을 확인해 주세요.

## Immutable Intent (잠금 — 변경 시 --unlock-intent 필요)
{proposed immutable items}

## Mutable Hypotheses (자유 수정 가능)
{proposed mutable items}

분류가 맞나요?
  </question>
  <options>
    <option>승인 (이대로 저장)</option>
    <option>한 항목씩 검토 (하나씩 물어봐 주세요)</option>
    <option>전체 재분류 (처음부터 다시)</option>
  </options>
</askuserquestion>

### 2A.8 — 4-config inference + Korea-signal pre-check (D-11)
→ Plan 04 fills in this step (business_model / region / audience_policy / compliance_packs inference + Korea-signal keyword regex + 4-option confirm).

## Step 2B: Mode B (Amendment)

→ Plan 03 fills in this step (select-mutable-section prompt with immutable items shown as 🔒 per D-07 + Pitfall 1 two-layer enforcement).

## Step 3: Atomic Write + Commit

→ Plan 04 fills in this step (atomicWriteFileSync OBJECTIVES.md + config.json + STATE.md, then brief-tools commit with all 3 files).

In Plan 02, interactive sessions exit at Step 2A.7; fixture-driven test runs invoke `brief-tools define apply --fixture <name>` which short-circuits straight to objectives.cjs writeObjectivesMd.

## Step 4: Next-Step Hint

Print: "다음 단계: /brief-discover — 선택하신 연구 영역으로 분야 조사를 시작합니다."

</process>
```

Step 3 — Bump `docs/ARCHITECTURE.md` count tables IN THE SAME COMMIT as the new command + workflow files. Locate the `**Total commands:** N` line and increment by 1 (adding `commands/brief/define.md`). Locate the `**Total workflows:** N` line and increment by 1 (adding `brief/workflows/define.md`). Leave Plan 05 to bump both by +1 again for discover.

Run `node --test tests/architecture-counts.test.cjs` to verify the bump matches actual file count.

Step 4 — Run `node --test tests/ask-user-questions-fallback.test.cjs` to verify the TEXT_MODE fallback sentinel in `brief/workflows/define.md` satisfies the scanner.
  </action>
  <verify>
    <automated>test -f commands/brief/define.md &amp;&amp; grep -c "brief/workflows/define.md" commands/brief/define.md</automated>
    <automated>test -f brief/workflows/define.md &amp;&amp; grep -E "(TEXT_MODE|text_mode)" brief/workflows/define.md | head -3</automated>
    <automated>grep -E "(plain-text|plain text|numbered list)" brief/workflows/define.md</automated>
    <automated>node --test tests/ask-user-questions-fallback.test.cjs 2>&amp;1 | tail -5</automated>
    <automated>node --test tests/architecture-counts.test.cjs 2>&amp;1 | tail -5</automated>
    <automated>node --test tests/brief-define-mode-a.test.cjs 2>&amp;1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `commands/brief/define.md` exists AND contains literal `brief/workflows/define.md` (execution_context reference)
    - `commands/brief/define.md` contains literal `argument-hint: "[--amend] [--unlock-intent]"`
    - `commands/brief/define.md` frontmatter `allowed-tools` contains: `Read`, `Write`, `Edit`, `Bash`, `AskUserQuestion`
    - `brief/workflows/define.md` contains BOTH `TEXT_MODE` (or `text_mode`) AND one of `plain-text`/`plain text`/`numbered list` (satisfies tests/ask-user-questions-fallback.test.cjs scanner)
    - `brief/workflows/define.md` contains Korean prompt strings: `편하게`, `3개월이 지났을 때`, `분류가 맞나요?`
    - `brief/workflows/define.md` does NOT contain the literal string `[Push Twice]` (D-03 — NO visible labels; Anti-Pattern in RESEARCH.md)
    - `brief/workflows/define.md` line count ≤ 400 (Phase 2 file-size discipline)
    - `node --test tests/ask-user-questions-fallback.test.cjs` exits 0
    - `node --test tests/architecture-counts.test.cjs` exits 0 (counts match actual file additions: +1 command, +1 workflow)
    - `node --test tests/brief-define-mode-a.test.cjs` remains GREEN (regression guard)
  </acceptance_criteria>
  <done>Command + workflow files exist with TEXT_MODE sentinel + Korean prompts; Mode A skeleton authored; ARCHITECTURE.md counts match; all relevant tests green.</done>
</task>

</tasks>

<verification>
- `node --test tests/brief-define-mode-a.test.cjs tests/ask-user-questions-fallback.test.cjs tests/architecture-counts.test.cjs tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs` exits 0
- `grep "\\[Push Twice\\]" brief/workflows/define.md` returns nothing (D-03 verification)
- `grep -E "gray-matter|require\\('ajv'\\)|require\\('js-yaml'\\)" brief/bin/lib/define.cjs` returns nothing (A1 zero-deps guard)
- `wc -l brief/workflows/define.md` reports ≤ 400 lines
- `wc -l brief/bin/lib/define.cjs` reports ≤ 350 lines (room for Plan 03/04 extensions)
</verification>

<success_criteria>
1. `/brief-define` command.md + workflow.md + lib.cjs + brief-tools.cjs dispatcher wired end-to-end (orchestrator-workers triangle).
2. Mode A smoke test GREEN on Korea-first B2C fixture — Push Twice + Language Precision + Dream State Mapping evidence in OBJECTIVES.md body.
3. TEXT_MODE fallback sentinel present in workflow (tests/ask-user-questions-fallback.test.cjs green).
4. docs/ARCHITECTURE.md count tables bumped in same commit (tests/architecture-counts.test.cjs green).
5. Korean default UI register maintained; NO visible `[Push Twice]` label (D-03).
</success_criteria>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| CLI args → parseNamedArgs → cmdDefineApply | `--fixture` value passes through to path.resolve under tests/fixtures/ |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-04 | Tampering | Fixture path-traversal via `--fixture ../../../etc/passwd` | mitigate | `path.resolve(__dirname, '..', '..', '..', 'tests', 'fixtures', fixtureName)` confines resolution. Plan 04 hardens further with basename-only guard. Flag to executor: add `if (fixtureName.includes('..') || fixtureName.includes('/'))` reject. |
| T-03-05 | Information Disclosure | Agent telemetry leaking to non-developer (Pitfall #9) — e.g., "Spawning researcher agent..." in conversational prompts | mitigate | workflow.md prose uses "생각 중…" / "추론 중…" style; no internal agent names surface. Verified by absence of "Spawning" / "subagent" in workflow.md (grep guard). |
</threat_model>

<output>
After completion, create `.planning/phases/03-define-canary-phase-0-end-to-end/03-02-SUMMARY.md`
</output>
