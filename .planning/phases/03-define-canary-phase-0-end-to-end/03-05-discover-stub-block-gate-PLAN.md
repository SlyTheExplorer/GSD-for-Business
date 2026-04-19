---
phase: 03
plan: 05
type: execute
wave: 5
depends_on:
  - 03-01
  - 03-04
files_modified:
  - commands/brief/discover.md
  - brief/workflows/discover.md
  - brief/bin/brief-tools.cjs
  - brief/bin/lib/objectives.cjs
  - docs/ARCHITECTURE.md
  - tests/brief-discover-gate.test.cjs
autonomous: true
requirements:
  - DEF-05
must_haves:
  truths:
    - "User invokes `/brief-discover` (or runs `brief-tools discover`) and, on an OBJECTIVES.md missing required fields, the process exits NON-ZERO with the Korean recovery-oriented block-gate message per Pitfall 5 template"
    - "The block-gate message lists exact missing field names by name (business_model / compliance_packs / etc.), names the recovery command `/brief-define --amend` verbatim, and reassures content preservation (`지금 쓰신 내용은 그대로 남아있습니다`)"
    - "On a COMPLETE OBJECTIVES.md, `/brief-discover` exits 0 AND prints the Phase 5 placeholder message (`Phase 5 body TBD`) — no scope creep into Phase 5"
    - "The gate uses the Plan 01 `validateObjectivesComplete` primitive verbatim — no parallel validation logic"
    - "docs/ARCHITECTURE.md command + workflow counts are bumped in the same commit (+1 command, +1 workflow for discover.md)"
    - "W-6: stderr output of a failing /brief-discover invocation does NOT contain the English phrase `validation failed` — only the Korean recovery-oriented block-gate message plus a silent non-zero exit"
  artifacts:
    - path: "commands/brief/discover.md"
      provides: "Slash dispatch shim for /brief-discover (stub)"
      contains: "brief/workflows/discover.md"
      min_lines: 18
    - path: "brief/workflows/discover.md"
      provides: "Stub workflow invoking block-gate + Phase 5 placeholder"
      contains: "Phase 5"
      min_lines: 30
    - path: "brief/bin/brief-tools.cjs"
      provides: "Dispatcher case 'discover' routing to lib/define.cjs stub + dispatcher case 'objectives validate'"
      contains: "case 'discover'"
    - path: "brief/bin/lib/objectives.cjs"
      provides: "cmdValidate CLI wrapper — Korean block-gate error rendering; silent non-zero exit on failure (W-6 — no English leak)"
      contains: "cmdValidate"
    - path: "tests/brief-discover-gate.test.cjs"
      provides: "Positive pass + negative block smoke test (DEF-05)"
      contains: "compliance_packs"
  key_links:
    - from: "commands/brief/discover.md"
      to: "brief/workflows/discover.md"
      via: "@~/.claude/brief/workflows/discover.md execution_context"
      pattern: "brief/workflows/discover\\.md"
    - from: "brief/workflows/discover.md"
      to: "brief/bin/brief-tools.cjs (objectives validate + discover)"
      via: "Workflow Step 1 invokes `brief-tools objectives validate`; Step 3 invokes nothing (stub placeholder)"
      pattern: "brief-tools objectives validate"
    - from: "brief/bin/brief-tools.cjs (case 'objectives')"
      to: "brief/bin/lib/objectives.cjs (cmdValidate)"
      via: "require('./lib/objectives.cjs') → objectives.cmdValidate(cwd, raw)"
      pattern: "case 'objectives'"
---

<objective>
Ship the `/brief-discover` STUB command + Korean block-gate for DEF-05. This plan binds the gate primitive (`validateObjectivesComplete` from Plan 01) to a user-facing entry point: a thin command.md + workflow.md + dispatcher case that runs the gate, exits non-zero with a structured Korean recovery-oriented error on missing fields, and emits a "Phase 5 body TBD" placeholder on pass. NO Phase 5 research flow logic is shipped — that is explicitly deferred.

Purpose: DEF-05 is the single most important integration point of Phase 3. Every future Phase 5 invocation will run through this gate. Non-developer planners receive the Pitfall 5 canonical Korean message (not an `ERROR:` stack-trace) so they know exactly what's missing and how to fix it.

**Wave 5** (cascaded from B-4 serialization). Depends on Plan 04 because Plan 04 extends `brief/bin/lib/define.cjs` module.exports which this plan's dispatcher does not touch but Plan 04's wave-4 work completes the module's public surface. Logical deps unchanged: Plan 01 (objectives primitives) + Plan 04 (define.cjs public surface).

Output: 1 new command.md + 1 new workflow.md + dispatcher case extensions + 1 new test file + docs/ARCHITECTURE.md count bumps + objectives.cjs cmdValidate CLI wrapper (with W-6 silent non-zero exit).
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
@.planning/phases/03-define-canary-phase-0-end-to-end/03-04-SUMMARY.md
@brief/bin/lib/objectives.cjs
@brief/bin/brief-tools.cjs
@commands/brief/status.md
@brief/workflows/status.md
@brief/bin/lib/status.cjs
@tests/status-renderer.test.cjs
@tests/frontmatter-cli.test.cjs
@docs/ARCHITECTURE.md

<interfaces>
<!-- Contracts this plan adds. -->

From brief/bin/lib/objectives.cjs (EXTENDED):
```javascript
// CLI-facing wrapper — renders Korean block-gate message on validation failure; exit code non-zero.
// Used by both `brief-tools objectives validate` subcommand AND `brief-tools discover` stub.
function cmdValidate(cwd, raw);
// Returns the validation result object if JSON mode; prints human-readable output otherwise.
// On failure: writes ONLY the Korean block-gate message to stderr, then exits non-zero via
// process.exit(1) — no English `validation failed` line is emitted (W-6).
// On success: returns { valid: true, missing: [], present: [...] }.

// CLI-facing wrapper — stale-anchor check (used by Plan 06; shipped here as well so
// Plan 06 only needs to wire the workflow hook).
function cmdStaleCheck(cwd, raw);
// Returns { stale, age_hours, reason? } object.

module.exports = {
  writeObjectivesMd,
  readObjectivesMd,
  validateObjectivesComplete,
  checkStaleAnchor,
  enforceImmutableLock,
  cmdValidate,              // NEW
  cmdStaleCheck,            // NEW
  OBJECTIVES_SCHEMA,
  STALE_ANCHOR_THRESHOLD_MS,
};
```

From brief/bin/brief-tools.cjs (EXTENDED):
```javascript
case 'objectives': {
  const subcommand = args[1];
  const objectives = require('./lib/objectives.cjs');
  if (subcommand === 'validate') return objectives.cmdValidate(cwd, raw);
  if (subcommand === 'stale-check') return objectives.cmdStaleCheck(cwd, raw);
  error("Unknown objectives subcommand. Available: validate, stale-check");
  break;
}

case 'discover': {
  // Phase 3 STUB — runs gate via objectives.cmdValidate; exits non-zero on fail; prints placeholder on pass.
  const objectives = require('./lib/objectives.cjs');
  const r = objectives.validateObjectivesComplete(cwd);
  if (!r.valid) return objectives.cmdValidate(cwd, raw);  // emits block-gate + non-zero exit
  // Placeholder for Phase 5 — body comes later.
  const { output } = require('./lib/core.cjs');
  output({ phase: 5, status: 'placeholder' }, raw,
    'Phase 5 DISCOVER body — coming in Phase 5. Block-gate is live.');
  return;
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Write brief-discover-gate.test.cjs (RED) + implement objectives.cmdValidate with Korean block-gate + silent non-zero exit (W-6) + brief-tools.cjs dispatcher cases</name>
  <read_first>
    - brief/bin/lib/objectives.cjs (Plan 01 — validateObjectivesComplete contract + OBJECTIVES_SCHEMA.required list)
    - brief/bin/lib/core.cjs (error() writes to stderr and exits non-zero; output() primitive). **W-6 NOTE:** do NOT call `error('OBJECTIVES.md validation failed')` — that emits the English phrase to stderr. Use `process.exit(1)` directly after writing the Korean block-gate message.
    - brief/bin/brief-tools.cjs (existing `case 'status':` block lines 779-783 to mirror + parseNamedArgs)
    - tests/status-renderer.test.cjs (runGsdTools + output-match pattern for dispatcher tests)
    - tests/frontmatter-cli.test.cjs lines 37-79 (validation-failure + exit-code assertion pattern)
    - tests/helpers.cjs (runGsdTools signature returns {success, output, error} — `!success` means non-zero exit)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md §decisions D-12 (Korean recovery-oriented, hard block, template)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md §Pitfall 5 (Block-Gate Message Leaks Developer Terminology — canonical Korean template lines 635-646)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md §Wave D brief/workflows/discover.md stub body (lines 643-671) + §Wave D brief-discover-gate.test.cjs pattern (lines 684-701) + §Shared Pattern 8 Korean recovery-oriented block-gate message (lines 959-974)
  </read_first>
  <behavior>
    - Test "Missing compliance_packs → exit non-zero + Korean recovery message":
      - Seed OBJECTIVES.md with all required fields EXCEPT compliance_packs.
      - Run `runGsdTools(['discover'], tmpDir)`.
      - `result.success` is false (non-zero exit).
      - Concatenated output+error matches regex `/⚠/` (warning glyph), `/compliance_packs/` (missing field named), `/\/brief-define --amend/` (recovery command), `/그대로 남아있습니다/` (Korean content-preservation reassurance).
      - Concatenated output+error does NOT contain the string `ERROR:` (Pitfall 5 dev-terminology guard).
      - Concatenated output+error does NOT contain square brackets around field list (Pitfall 5 Python-list-syntax guard) — explicitly: the bullet style is `  • business_model`, not `['business_model', ...]`.
      - **W-6 GUARD:** Concatenated output+error does NOT contain the English substring `validation failed` (case-insensitive). The block-gate speaks Korean only; English phrasing would leak developer terminology past the non-developer planner.
    - Test "Complete OBJECTIVES.md → exit 0 + Phase 5 placeholder":
      - Seed OBJECTIVES.md via `objectives.writeObjectivesMd(tmpDir, completePayload, {unlockIntent:false})` (using the primitive from Plan 01; NOT via fixture apply — this test is independent of Plan 02/04).
      - Run `runGsdTools(['discover'], tmpDir)`.
      - `result.success` is true.
      - Output matches `/Phase 5/` AND `/coming in Phase 5/`.
    - Test "Missing OBJECTIVES.md entirely → exit non-zero + distinct message":
      - Empty tmpDir (no OBJECTIVES.md).
      - Run `runGsdTools(['discover'], tmpDir)`.
      - `result.success` is false.
      - Output+error contains the Korean message `OBJECTIVES.md 파일이 아직 없습니다` (dedicated path when validateObjectivesComplete returns `missing: ['FILE_NOT_EXIST']`).
      - **W-6 GUARD:** same absence of English `validation failed` substring.
  </behavior>
  <action>
Step 1 — Create `tests/brief-discover-gate.test.cjs`:

```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProject, cleanup, runGsdTools } = require('./helpers.cjs');
const objectives = require('../brief/bin/lib/objectives.cjs');

describe('/brief-discover block gate (DEF-05, D-12, Pitfall 5)', () => {
  let tmpDir;

  beforeEach(() => { tmpDir = createTempProject(); });
  afterEach(() => { cleanup(tmpDir); });

  test('Missing compliance_packs → exit non-zero + Korean recovery-oriented message', () => {
    const objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    // Seed OBJECTIVES.md with all required fields EXCEPT compliance_packs.
    fs.writeFileSync(objPath,
      `---
brief_objectives_version: "1.0"
status: ready
mode: greenfield
business_model: b2c
region: kr
audience_policy: internal
immutable_items:
  - creator-identity
  - core-value
  - problem-statement
---

# OBJECTIVES

## Immutable Intent

### Creator Identity
seed

### Core Value
seed

### Problem Statement
seed
`);
    const r = runGsdTools(['discover'], tmpDir);
    assert.ok(!r.success, `expected non-zero exit, got success=${r.success}`);

    const combined = (r.output || '') + (r.error || '');
    assert.match(combined, /⚠/, 'warning glyph present');
    assert.match(combined, /compliance_packs/, 'missing field named');
    assert.match(combined, /\/brief-define --amend/, 'recovery command present');
    assert.match(combined, /그대로 남아있습니다/, 'Korean content-preservation reassurance');

    // Pitfall 5 guards:
    assert.doesNotMatch(combined, /ERROR:/, 'no dev-terminology ERROR: prefix');
    assert.doesNotMatch(combined, /\['compliance_packs'\]/,
      'no Python-list-syntax squares around missing field');

    // W-6 guard: no English `validation failed` leakage.
    assert.doesNotMatch(combined, /validation failed/i,
      'W-6: no English `validation failed` phrase in stderr output');
  });

  test('Complete OBJECTIVES.md → exit 0 + Phase 5 placeholder', () => {
    objectives.writeObjectivesMd(tmpDir, {
      frontmatter: {
        brief_objectives_version: '1.0',
        status: 'ready',
        mode: 'greenfield',
        business_model: 'b2c',
        region: 'kr',
        audience_policy: 'internal',
        compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
        immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
        'creator-identity': 'seed',
        'core-value': 'seed',
        'problem-statement': 'seed',
      },
      body: {
        immutable: { 'creator-identity': 'seed', 'core-value': 'seed', 'problem-statement': 'seed' },
        mutable: {},
      },
    }, { unlockIntent: false });

    const r = runGsdTools(['discover'], tmpDir);
    assert.ok(r.success, `expected success, got output=${r.output} error=${r.error}`);
    assert.match(r.output + (r.error || ''), /Phase 5/);
    assert.match(r.output + (r.error || ''), /coming in Phase 5/i);
  });

  test('Missing OBJECTIVES.md entirely → distinct file-absent message + non-zero exit', () => {
    // No seed — tmpDir has no OBJECTIVES.md
    const r = runGsdTools(['discover'], tmpDir);
    assert.ok(!r.success);
    const combined = (r.output || '') + (r.error || '');
    assert.match(combined, /OBJECTIVES\.md 파일이 아직 없습니다/,
      'file-absent path emits dedicated Korean message');

    // W-6 guard applies to file-absent path too.
    assert.doesNotMatch(combined, /validation failed/i,
      'W-6: no English `validation failed` phrase in file-absent stderr');
  });
});
```

Step 2 — Extend `brief/bin/lib/objectives.cjs` with `cmdValidate` and `cmdStaleCheck`. **W-6 FIX: do NOT call `error('OBJECTIVES.md validation failed')` — that emits English "validation failed" to stderr. Write only the Korean block-gate message, then `process.exit(1)` silently.**

```javascript
// Append these additions to objectives.cjs (before module.exports).

// Human-readable Korean field-name mapping for block-gate rendering.
const FIELD_NAME_KO = {
  business_model: '비즈니스 모델 (business_model)',
  region: '지역 (region)',
  audience_policy: '청중 정책 (audience_policy)',
  compliance_packs: '규제 팩 (compliance_packs)',
  status: '상태 (status)',
  immutable_items: '잠금 항목 (immutable_items)',
};

function renderBlockGateMessage(missing) {
  if (missing.length === 1 && missing[0] === 'FILE_NOT_EXIST') {
    return [
      '⚠ /brief-discover는 아직 실행할 수 없습니다.',
      '',
      'OBJECTIVES.md 파일이 아직 없습니다.',
      '',
      '시작 방법:',
      '  /brief-define',
      '',
      '새 기획은 약 20~35분이 걸립니다.',
      '',
    ].join('\n');
  }
  const lines = [
    '⚠ /brief-discover는 아직 실행할 수 없습니다.',
    '',
    'OBJECTIVES.md에 아직 작성되지 않은 필수 항목이 있습니다:',
  ];
  for (const f of missing) {
    lines.push(`  • ${FIELD_NAME_KO[f] || f}`);
  }
  lines.push(
    '',
    '보완 방법:',
    '  /brief-define --amend',
    '',
    '지금 쓰신 내용은 그대로 남아있습니다.',
    '보완이 끝나면 다시 /brief-discover를 실행해주세요.',
    '',
  );
  return lines.join('\n');
}

function cmdValidate(cwd, raw) {
  const r = validateObjectivesComplete(cwd);
  if (r.valid) {
    output(r, raw, 'OBJECTIVES.md: 모든 필수 항목이 작성되어 있습니다.');
    return r;
  }
  // Failure path — render Korean block-gate and exit non-zero SILENTLY (W-6 fix).
  const msg = renderBlockGateMessage(r.missing);
  if (raw) {
    // JSON mode still emits the structured result; human message goes to stderr.
    process.stderr.write(msg + '\n');
    output(r, raw, msg);
  } else {
    process.stderr.write(msg + '\n');
  }
  // W-6: silent non-zero exit. Do NOT call `error('OBJECTIVES.md validation failed')` —
  // that would leak the English phrase `validation failed` to stderr past the
  // non-developer planner, defeating Pitfall 5 tone discipline.
  process.exit(1);
  // Unreachable defensive return (process.exit is synchronous).
  return r;
}

function cmdStaleCheck(cwd, raw) {
  const r = checkStaleAnchor(cwd);
  output(r, raw,
    r.stale
      ? `OBJECTIVES.md이 ${r.age_hours}시간 전에 마지막으로 수정되었습니다 (48시간 경과).`
      : 'OBJECTIVES.md은 최신 상태입니다.');
  return r;
}
```

Update the module.exports block at the bottom of objectives.cjs:

```javascript
module.exports = {
  writeObjectivesMd,
  readObjectivesMd,
  validateObjectivesComplete,
  checkStaleAnchor,
  enforceImmutableLock,
  cmdValidate,
  cmdStaleCheck,
  renderBlockGateMessage,      // exposed for unit-test reuse if needed
  OBJECTIVES_SCHEMA,
  STALE_ANCHOR_THRESHOLD_MS,
};
```

Step 3 — Extend `brief/bin/brief-tools.cjs` with dispatcher cases for `objectives` and `discover` (add immediately after the existing `case 'define':` block from Plan 02):

```javascript
case 'objectives': {
  const subcommand = args[1];
  const objectives = require('./lib/objectives.cjs');
  if (subcommand === 'validate') return objectives.cmdValidate(cwd, raw);
  if (subcommand === 'stale-check') return objectives.cmdStaleCheck(cwd, raw);
  error('Unknown objectives subcommand. Available: validate, stale-check');
  break;
}

case 'discover': {
  // Phase 3 STUB — block-gate + Phase 5 placeholder. Real DISCOVER body is Phase 5.
  const objectives = require('./lib/objectives.cjs');
  const r = objectives.validateObjectivesComplete(cwd);
  if (!r.valid) return objectives.cmdValidate(cwd, raw);  // exits non-zero with Korean message (silent — no English leak)
  const { output } = require('./lib/core.cjs');
  output({ phase: 5, status: 'placeholder' }, raw,
    'Phase 5 DISCOVER body — coming in Phase 5. Block-gate is live.');
  return;
}
```

Step 4 — Run the new smoke tests:
```
node --test tests/brief-discover-gate.test.cjs
```
All 3 tests MUST turn GREEN.
  </action>
  <verify>
    <automated>node --test tests/brief-discover-gate.test.cjs 2>&amp;1 | tail -20</automated>
    <automated>grep -n "case 'discover'" brief/bin/brief-tools.cjs</automated>
    <automated>grep -n "case 'objectives'" brief/bin/brief-tools.cjs</automated>
    <automated>node -e "const o=require('./brief/bin/lib/objectives.cjs'); ['cmdValidate','cmdStaleCheck','renderBlockGateMessage'].forEach(fn=>{if(typeof o[fn]!=='function'){console.error('MISSING:',fn);process.exit(1);}});console.log('OK');"</automated>
    <automated>node -e "const o=require('./brief/bin/lib/objectives.cjs'); const msg=o.renderBlockGateMessage(['compliance_packs','business_model']); if(!/⚠/.test(msg)||!/\/brief-define --amend/.test(msg)||/ERROR:/.test(msg))process.exit(1); console.log('block-gate msg OK');"</automated>
    <automated>grep -c "validation failed" brief/bin/lib/objectives.cjs</automated>
  </verify>
  <acceptance_criteria>
    - `node --test tests/brief-discover-gate.test.cjs` exits 0 (all 3 tests GREEN)
    - `brief/bin/brief-tools.cjs` contains literal `case 'objectives'` AND `case 'discover'`
    - `brief/bin/lib/objectives.cjs` exports `cmdValidate`, `cmdStaleCheck`, `renderBlockGateMessage`
    - `brief/bin/lib/objectives.cjs` contains literal strings: `지금 쓰신 내용은 그대로 남아있습니다`, `/brief-define --amend`, `⚠`
    - `brief/bin/lib/objectives.cjs` does NOT contain the literal prefix `ERROR:` on a line directed at the user (Pitfall 5 guard)
    - **W-6 GUARD:** `grep -c "validation failed" brief/bin/lib/objectives.cjs` EQUALS 0 (no English block-gate leakage). cmdValidate failure path uses `process.exit(1)` directly after writing the Korean message — NOT `error('OBJECTIVES.md validation failed')`.
    - **W-6 GUARD:** captured stderr from a failing `/brief-discover` invocation does NOT contain `validation failed` (case-insensitive). Verified by test Cycle 1 `assert.doesNotMatch(combined, /validation failed/i)` AND Cycle 3 (file-absent path).
    - `brief/bin/lib/objectives.cjs` contains `FIELD_NAME_KO` mapping with at least the 4 DEF-04 keys: business_model, region, audience_policy, compliance_packs
    - `renderBlockGateMessage(['FILE_NOT_EXIST'])` produces output containing `OBJECTIVES.md 파일이 아직 없습니다`
    - `wc -l brief/bin/lib/objectives.cjs` ≤ 300 lines (file-size discipline — Plan 01 budget reserved room)
  </acceptance_criteria>
  <done>Block-gate smoke tests GREEN; Korean Pitfall 5 template enforced; W-6 silent non-zero exit enforced (no English `validation failed` leak); `brief-tools.cjs` routes `discover` and `objectives validate` correctly.</done>
</task>

<task type="auto">
  <name>Task 2: Author commands/brief/discover.md + brief/workflows/discover.md stubs + bump docs/ARCHITECTURE.md counts in SAME commit</name>
  <read_first>
    - commands/brief/status.md (template shape — 22 lines)
    - brief/workflows/status.md (minimal workflow template)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md §Wave D commands/brief/discover.md STUB (lines 613-634), brief/workflows/discover.md STUB (lines 644-671), §install.js notes lines 985-993 (NO SRC-tuple edit needed)
    - docs/ARCHITECTURE.md (the count tables scanned by tests/architecture-counts.test.cjs)
    - tests/ask-user-questions-fallback.test.cjs (discover.md workflow uses AskUserQuestion in stale-anchor Plan 06 — for Plan 05 the block-gate path does NOT use AskUserQuestion, but we include the TEXT_MODE sentinel anyway so Plan 06 can add the AskUserQuestion prompt without needing to re-register)
  </read_first>
  <action>
Step 1 — Create `commands/brief/discover.md`:

```markdown
---
name: brief:discover
description: BRIEF DISCOVER phase — broad domain research. Phase 3 ships gate-only stub; full research flow arrives in Phase 5.
argument-hint: ""
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
---
<objective>
Phase 3 (canary) ships only the block-gate + stale-anchor entry point.
Full DISCOVER parallel-research flow arrives in Phase 5.

If OBJECTIVES.md is missing required fields, `/brief-discover` blocks with a Korean recovery-oriented error.
If OBJECTIVES.md is stale (>48h since amendment), the stale-anchor 3-option interrupt fires before any work begins (wired in Plan 06).
</objective>

<execution_context>
@~/.claude/brief/workflows/discover.md
</execution_context>

<process>
Execute the discover workflow stub: run the block-gate via `brief-tools objectives validate`. If the gate passes, run the stale-anchor check (Plan 06), then print the Phase 5 placeholder message.
</process>
```

Step 2 — Create `brief/workflows/discover.md`:

```markdown
<purpose>
DISCOVER phase entry — Phase 3 ships the gate only.
- Block if OBJECTIVES.md is missing required fields (DEF-05, D-12).
- Prompt on stale-anchor if >48h since last amendment (DEF-06, D-13 — wired in Plan 06).
- Phase 5 replaces the placeholder body with the full domain-research flow.
All user-facing prompts are Korean by default.
</purpose>

<process>

## Step 0: TEXT_MODE Detection

Set TEXT_MODE=true if `--text` is present in $ARGUMENTS OR `workflow.text_mode` from init JSON is true. When TEXT_MODE is active, replace every AskUserQuestion call (used in Plan 06 stale-anchor step) with a plain-text numbered list and ask the user to type their choice number.

## Step 1: Block-gate (DEF-05, D-12)

Invoke `brief-tools objectives validate` as a child process or via direct lib import.

If the validation result is `{ valid: false, missing: [...] }`, the CLI emits the Pitfall 5 Korean recovery-oriented block-gate message to stderr AND exits non-zero SILENTLY (no English `validation failed` line per W-6). The workflow MUST propagate the non-zero exit back to the caller. No pass-through. No `--force` flag exists.

The canonical block-gate message format (verbatim, from research/PITFALLS.md Pitfall 5 template):

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

## Step 2: Stale-anchor check (DEF-06, D-13) — WIRED IN PLAN 06

→ Plan 06 fills in this step. Placeholder: invoke `brief-tools objectives stale-check`; if `stale === true` AND this is a new-activity entry, present a 3-option AskUserQuestion (잠시 검토에 / 현재 OBJECTIVES를 보고 맞으면 승인 / 이제 승인, 빠르게 진행). NO bypass without a choice.

## Step 3: Phase 5 Placeholder

Print:
"Phase 5 DISCOVER body — coming in Phase 5. Block-gate is live."

Exit 0.
</process>
```

Step 3 — Bump docs/ARCHITECTURE.md counts in the same commit. Locate `**Total commands:** N` and increment by +1 (for discover.md); locate `**Total workflows:** N` and increment by +1 (for workflows/discover.md). These are separate from the Plan 02 bump for define.md.

Run `node --test tests/architecture-counts.test.cjs` to verify.

Step 4 — Run the full Phase 3 test set (so far) to confirm no regression:
```
node --test tests/brief-discover-gate.test.cjs tests/brief-define-mode-a.test.cjs tests/brief-define-mode-b.test.cjs tests/brief-define-atomic-commit.test.cjs tests/brief-define-canary.test.cjs tests/brief-define-korea-signal.test.cjs tests/brief-config-brief-namespace.test.cjs tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/ask-user-questions-fallback.test.cjs tests/architecture-counts.test.cjs
```
  </action>
  <verify>
    <automated>test -f commands/brief/discover.md &amp;&amp; grep -c "brief/workflows/discover.md" commands/brief/discover.md</automated>
    <automated>test -f brief/workflows/discover.md &amp;&amp; grep -E "(TEXT_MODE|text_mode)" brief/workflows/discover.md</automated>
    <automated>grep -E "(plain-text|plain text|numbered list)" brief/workflows/discover.md</automated>
    <automated>grep "지금 쓰신 내용은 그대로 남아있습니다" brief/workflows/discover.md</automated>
    <automated>node --test tests/architecture-counts.test.cjs 2>&amp;1 | tail -5</automated>
    <automated>node --test tests/ask-user-questions-fallback.test.cjs 2>&amp;1 | tail -5</automated>
    <automated>node --test tests/brief-discover-gate.test.cjs 2>&amp;1 | tail -10</automated>
  </verify>
  <acceptance_criteria>
    - `commands/brief/discover.md` exists AND contains literal `brief/workflows/discover.md`
    - `commands/brief/discover.md` frontmatter `allowed-tools` includes `AskUserQuestion` (for Plan 06 stale-anchor step)
    - `brief/workflows/discover.md` contains BOTH `TEXT_MODE`/`text_mode` AND one of `plain-text`/`plain text`/`numbered list`
    - `brief/workflows/discover.md` contains the literal Pitfall 5 block-gate message snippet `지금 쓰신 내용은 그대로 남아있습니다`
    - `brief/workflows/discover.md` contains literal `Phase 5 DISCOVER body — coming in Phase 5`
    - `brief/workflows/discover.md` does NOT contain `ERROR:` (block-gate tone regression guard)
    - `node --test tests/architecture-counts.test.cjs` exits 0 (count tables match: +1 command, +1 workflow from this plan)
    - `node --test tests/ask-user-questions-fallback.test.cjs` exits 0 (TEXT_MODE sentinel present in discover.md)
    - `node --test tests/brief-discover-gate.test.cjs` exits 0 (regression — Task 1 tests still GREEN)
    - `wc -l brief/workflows/discover.md` reports ≤ 80 lines (PATTERNS.md estimates ~40; allow headroom for Plan 06 stale-anchor section fill)
  </acceptance_criteria>
  <done>Discover stub command + workflow exist; ARCHITECTURE.md counts match; TEXT_MODE sentinel present for Plan 06's stale-anchor AskUserQuestion step; block-gate Korean message present in workflow text.</done>
</task>

</tasks>

<verification>
- `node --test tests/brief-discover-gate.test.cjs tests/brief-define-mode-a.test.cjs tests/brief-define-mode-b.test.cjs tests/brief-define-atomic-commit.test.cjs tests/brief-define-canary.test.cjs tests/brief-define-korea-signal.test.cjs tests/brief-config-brief-namespace.test.cjs tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/ask-user-questions-fallback.test.cjs tests/architecture-counts.test.cjs` exits 0
- `grep "ERROR:" brief/bin/lib/objectives.cjs` returns nothing (block-gate tone guard)
- `grep "validation failed" brief/bin/lib/objectives.cjs` returns nothing (W-6 guard)
- `grep -c "⚠" brief/bin/lib/objectives.cjs` ≥ 2 (present in both full-fields and file-not-exist templates)
- `wc -l brief/bin/lib/objectives.cjs` ≤ 300 lines
</verification>

<success_criteria>
1. DEF-05: `/brief-discover` blocks hard (exit non-zero) with Pitfall 5 Korean recovery-oriented message listing exact missing field names + `/brief-define --amend` recovery command.
2. On complete OBJECTIVES.md, `/brief-discover` emits the Phase 5 placeholder and exits 0 — no scope creep.
3. objectives.cjs cmdValidate is the single gate primitive; Phase 5 body work will layer onto this without touching the validation logic.
4. docs/ARCHITECTURE.md counts increment atomically with the new files (no mid-phase count drift between Plans 05 and 06).
5. **W-6: cmdValidate failure path uses silent `process.exit(1)` — no English `validation failed` phrase leaks to stderr.**
</success_criteria>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| incomplete OBJECTIVES.md → cmdValidate → stderr + non-zero exit | Block is the security-equivalent of access control: downstream agents (Phase 5+) cannot operate on incomplete intent |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-11 | Spoofing | User adds a fake `--force` flag attempting to bypass the gate | mitigate | No `--force` flag is parsed. brief-tools.cjs case 'discover' invokes cmdValidate unconditionally. Test asserts non-zero exit under missing-fields condition. |
| T-03-12 | Elevation of Privilege | Gate always returns valid=true by accident (logic bug) | mitigate | Missing-field test `Missing compliance_packs → exit non-zero` is in Task 1; runs on every CI invocation. validateObjectivesComplete is a Plan 01 primitive with its own test coverage. |
| T-03-15 | Information Disclosure | English developer terminology (`ERROR:`, `validation failed`) leaks to non-developer planner | mitigate | W-6 silent-exit fix: cmdValidate writes ONLY Korean block-gate message to stderr, then `process.exit(1)` — no English phrase emitted. Test `brief-discover-gate.test.cjs` asserts `doesNotMatch(combined, /validation failed/i)` on both incomplete and file-absent paths. |
</threat_model>

<output>
After completion, create `.planning/phases/03-define-canary-phase-0-end-to-end/03-05-SUMMARY.md`
</output>
</content>
