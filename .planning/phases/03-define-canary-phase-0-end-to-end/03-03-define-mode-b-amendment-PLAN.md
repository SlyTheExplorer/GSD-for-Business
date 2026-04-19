---
phase: 03
plan: 03
type: execute
wave: 3
depends_on:
  - 03-02
files_modified:
  - brief/workflows/define.md
  - brief/bin/lib/define.cjs
  - tests/brief-define-mode-b.test.cjs
autonomous: true
requirements:
  - DEF-03
must_haves:
  truths:
    - "Mode B amendment presents the user with a section-picker whose options OMIT or visibly 🔒-mark immutable items by default (Pitfall 1 two-layer enforcement UI-side)"
    - "Attempting to mutate an immutable field without `--unlock-intent` throws the Korean structured error (already enforced at objectives.cjs writer layer by Plan 01, verified by new Mode B integration test)"
    - "Supplying `--unlock-intent` flips the lock and allows the mutation AND writes an audit-log entry marking the unlock event"
    - "The workflow-level Mode B branch in brief/workflows/define.md references `--unlock-intent` verbatim so the flag is user-discoverable"
  artifacts:
    - path: "brief/bin/lib/define.cjs"
      provides: "Mode B amendment branch + --unlock-intent flag propagation to objectives.cjs writer + audit-log append helper"
      contains: "function applyModeBAmendment"
      exports: ["applyModeBAmendment"]
    - path: "brief/workflows/define.md"
      provides: "Mode B branch filled in under Step 2B with section-picker + immutable items shown as 🔒 disabled"
      contains: "🔒"
    - path: "tests/brief-define-mode-b.test.cjs"
      provides: "Integration test for immutable-lock refusal + --unlock-intent escape"
      contains: "unlockIntent"
  key_links:
    - from: "brief/workflows/define.md (Step 2B)"
      to: "brief/bin/lib/define.cjs (applyModeBAmendment)"
      via: "Workflow invokes `brief-tools define apply --amend` (+ optional --unlock-intent); dispatcher routes to define.cjs"
      pattern: "--unlock-intent"
    - from: "brief/bin/lib/define.cjs (applyModeBAmendment)"
      to: "brief/bin/lib/objectives.cjs (writeObjectivesMd)"
      via: "writeObjectivesMd(cwd, payload, { unlockIntent: flags.unlockIntent === true })"
      pattern: "unlockIntent"
---

<objective>
Ship Mode B (Amendment) on top of Plan 02's Mode A skeleton. Mode B is short (~3–10 min), operates on an existing OBJECTIVES.md, and is scoped to mutable sections unless the user explicitly escapes the lock via `--unlock-intent`. The writer-layer lock is already enforced by Plan 01's `enforceImmutableLock`; this plan adds the UI-layer enforcement (Pitfall 1 two-layer mandate) AND the audit-log entry that marks every `--unlock-intent` usage.

Purpose: Per 03-CONTEXT.md `<specifics>`: "고도화 흐름 is a real use case. Treating /brief-define as a one-shot greenfield-only tool would punish its own repeat users." Mode B is the design response. D-07 immutable-lock is load-bearing vs Pitfall #3 OBJECTIVES.md anchor drift — the v1 highest-risk pitfall.

Output: Mode B branch completed in workflow markdown + lib controller + integration test. NO new command files. NO ARCHITECTURE.md changes (Plan 02 already bumped counts for `define.md`).
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
@brief/workflows/define.md
@brief/bin/lib/define.cjs
@brief/bin/lib/objectives.cjs
@tests/frontmatter-cli.test.cjs
@tests/brief-objectives-immutable-lock.test.cjs

<interfaces>
<!-- Contracts this plan adds. -->

From brief/bin/lib/define.cjs (EXTENDED — this plan):
```javascript
// NEW — Mode B integration path. Reads existing OBJECTIVES.md, applies user-selected
// mutable-section updates, writes back with objectives.writeObjectivesMd.
// If opts.unlockIntent === true, propagates through the writer to permit immutable edits.
function applyModeBAmendment(cwd, selectedSections, updatesPayload, opts);
// opts shape: { unlockIntent?: boolean, auditLogPath?: string }
// Writes an audit-log line to .planning/OBJECTIVES-UNLOCK-AUDIT.log when unlockIntent===true.

module.exports = {
  cmdDefineApply,
  runInteractiveModeA,
  applyFromFixture,
  applyModeBAmendment,     // NEW
  IMMUTABLE_DEFAULT_ITEMS,
};
```

cmdDefineApply dispatcher extension (brief/bin/lib/define.cjs):
```javascript
async function cmdDefineApply(cwd, flags, raw) {
  if (flags && flags.fixture) return applyFromFixture(cwd, flags.fixture);
  if (flags && flags.amend) {
    // Mode B branch — the workflow markdown builds selectedSections + updatesPayload
    // via the Section Picker and passes them to this lib via brief-tools. For Plan 03
    // the lib exposes the primitive; the workflow will author the interactive glue.
    throw new Error(
      '--amend interactive flow is driven by brief/workflows/define.md Step 2B; ' +
      'use applyModeBAmendment() directly for tests.'
    );
  }
  // ...existing Mode A dispatch...
}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Write Mode B integration test (RED) + implement applyModeBAmendment with --unlock-intent propagation + audit-log</name>
  <read_first>
    - brief/bin/lib/define.cjs (from Plan 02 — the file being extended)
    - brief/bin/lib/objectives.cjs (Plan 01 — writeObjectivesMd, enforceImmutableLock, readObjectivesMd contracts)
    - tests/brief-objectives-immutable-lock.test.cjs (Plan 01 — existing writer-layer lock tests; Mode B test extends coverage to the dispatcher path)
    - tests/frontmatter-cli.test.cjs lines 37-79 (validation-failure + structured-error assertion pattern)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md §decisions D-07 (--unlock-intent explicit; footer message), D-10 (classification heuristic — Mode B must preserve immutable_items list unchanged)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md §Pitfall 1 (Immutable-Lock Soft-Warning Leakage — two-layer enforcement mandate)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md §Wave E (tests/brief-define-mode-b.test.cjs pattern lines 719-736)
  </read_first>
  <behavior>
    - Test A (RED→GREEN): Seed a complete OBJECTIVES.md via writeObjectivesMd. Call applyModeBAmendment(cwd, ['target-audience'], {frontmatter:{'core-value':'mutated'}}, {unlockIntent:false}) — this attempts to mutate an immutable field. MUST throw Error matching `/Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다/` AND no file change is persisted (file mtime/content unchanged).
    - Test B (RED→GREEN): Same seed, applyModeBAmendment with {unlockIntent:true}. MUST succeed; OBJECTIVES.md frontmatter now contains `'core-value': 'mutated'`; audit log file `.planning/OBJECTIVES-UNLOCK-AUDIT.log` exists and contains a single line matching format `<ISO8601Timestamp> UNLOCK core-value` (mutated field name).
    - Test C (RED→GREEN): Call applyModeBAmendment(cwd, ['target-audience'], {frontmatter:{'target-audience':'new audience text'}}, {unlockIntent:false}) — this mutates only a MUTABLE field. MUST succeed; NO audit log line written; OBJECTIVES.md frontmatter preserves existing `immutable_items` list unchanged.
  </behavior>
  <action>
Step 1 — Create `tests/brief-define-mode-b.test.cjs`:

```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProject, cleanup } = require('./helpers.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');
const objectives = require('../brief/bin/lib/objectives.cjs');
const define = require('../brief/bin/lib/define.cjs');

describe('/brief-define Mode B amendment (D-07, Pitfall #3 mitigation)', () => {
  let tmpDir;
  let objPath;
  let auditPath;

  beforeEach(() => {
    tmpDir = createTempProject();
    objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    auditPath = path.join(tmpDir, '.planning', 'OBJECTIVES-UNLOCK-AUDIT.log');
    // Seed complete OBJECTIVES.md
    objectives.writeObjectivesMd(tmpDir, {
      frontmatter: {
        brief_objectives_version: '1.0',
        status: 'ready',
        mode: 'greenfield',
        immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
        'creator-identity': 'seed creator',
        'core-value': 'seed core value',
        'problem-statement': 'seed problem',
        business_model: 'b2c',
        region: 'kr',
        audience_policy: 'internal',
        compliance_packs: ['PIPA'],
      },
      body: {
        immutable: { 'creator-identity': 'seed', 'core-value': 'seed', 'problem-statement': 'seed' },
        mutable: {},
      },
    }, { unlockIntent: false });
  });

  afterEach(() => { cleanup(tmpDir); });

  test('A — Mode B refuses immutable mutation WITHOUT --unlock-intent (writer-layer thrown)', () => {
    const contentBefore = fs.readFileSync(objPath, 'utf-8');
    assert.throws(
      () => define.applyModeBAmendment(
        tmpDir,
        ['target-audience'],
        { frontmatter: { 'core-value': 'MUTATED' } },
        { unlockIntent: false },
      ),
      /Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다/,
      'Korean error message raised with --unlock-intent callout',
    );
    const contentAfter = fs.readFileSync(objPath, 'utf-8');
    assert.strictEqual(contentAfter, contentBefore,
      'OBJECTIVES.md content unchanged after rejected write');
    assert.ok(!fs.existsSync(auditPath), 'no audit log created on rejected write');
  });

  test('B — Mode B permits immutable mutation WITH --unlock-intent + writes audit log', () => {
    define.applyModeBAmendment(
      tmpDir,
      ['core-value'],
      { frontmatter: { 'core-value': 'MUTATED' } },
      { unlockIntent: true },
    );
    const fm = extractFrontmatter(fs.readFileSync(objPath, 'utf-8'));
    assert.strictEqual(fm['core-value'], 'MUTATED', 'immutable field updated');
    assert.ok(fs.existsSync(auditPath), 'audit log written');
    const audit = fs.readFileSync(auditPath, 'utf-8').trim();
    assert.match(audit, /\d{4}-\d{2}-\d{2}T[\d:.]+Z\s+UNLOCK\s+core-value/,
      'audit log line format: <ISO8601> UNLOCK <field>');
  });

  test('C — Mode B mutable-only edit without --unlock-intent succeeds; NO audit log', () => {
    define.applyModeBAmendment(
      tmpDir,
      ['target-audience'],
      { frontmatter: { 'target-audience': 'new audience text' } },
      { unlockIntent: false },
    );
    const fm = extractFrontmatter(fs.readFileSync(objPath, 'utf-8'));
    assert.strictEqual(fm['target-audience'], 'new audience text');
    assert.deepStrictEqual(
      fm.immutable_items,
      ['creator-identity', 'core-value', 'problem-statement'],
      'immutable_items list preserved unchanged on mutable-only edit',
    );
    assert.ok(!fs.existsSync(auditPath), 'no audit log on mutable-only edit');
  });
});
```

Initial run is RED — `define.applyModeBAmendment` does not exist yet.

Step 2 — Extend `brief/bin/lib/define.cjs` with `applyModeBAmendment` (append after applyFromFixture):

```javascript
function applyModeBAmendment(cwd, selectedSections, updatesPayload, opts = {}) {
  // selectedSections: string[] of mutable section names user opted to revisit.
  // updatesPayload: { frontmatter?: Object, body?: { immutable?, mutable? } }
  // opts: { unlockIntent?: boolean, auditLogPath?: string }

  const unlockIntent = opts.unlockIntent === true;

  // Writer-layer enforcement happens inside objectives.writeObjectivesMd via
  // enforceImmutableLock when unlockIntent is false. We just pass through.
  //
  // IMPORTANT (Pitfall 1 two-layer mandate):
  //   The UI layer MUST also hide immutable items from the Mode B Section
  //   Picker when --unlock-intent is absent. That work is in the workflow
  //   markdown (Task 2) — THIS lib-layer primitive is the second layer.
  const existing = objectives.readObjectivesMd(cwd);
  const payload = {
    frontmatter: { ...(updatesPayload.frontmatter || {}) },
    body: updatesPayload.body,
  };
  // Always carry mode=amended forward (D-05 distinguishes).
  payload.frontmatter.mode = 'amended';

  // Detect immutable mutations BEFORE write to decide audit-log emission.
  const immItems = Array.isArray(existing.frontmatter.immutable_items)
    ? existing.frontmatter.immutable_items : [];
  const mutatedImmutables = immItems.filter(
    (k) => Object.prototype.hasOwnProperty.call(payload.frontmatter, k)
        && JSON.stringify(payload.frontmatter[k]) !== JSON.stringify(existing.frontmatter[k]),
  );

  // Delegate to writer; throws Korean error if unlockIntent===false and immutable
  // mutation is present (enforceImmutableLock inside writeObjectivesMd).
  objectives.writeObjectivesMd(cwd, payload, { unlockIntent });

  // Audit log ONLY when an immutable mutation actually happened AND unlock was used.
  if (unlockIntent && mutatedImmutables.length > 0) {
    const base = path.join(cwd, '.planning');
    const auditPath = opts.auditLogPath || path.join(base, 'OBJECTIVES-UNLOCK-AUDIT.log');
    const iso = new Date().toISOString();
    const lines = mutatedImmutables.map((f) => `${iso} UNLOCK ${f}\n`).join('');
    fs.appendFileSync(auditPath, lines, 'utf-8');
  }
  return { status: 'amended', mutatedImmutables, unlockIntent };
}

// Extend cmdDefineApply to route --amend (throws helpful message directing tests to applyModeBAmendment)
// Actual interactive Mode B glue is in the workflow markdown (Task 2).
async function cmdDefineApply(cwd, flags, raw) {
  if (flags && flags.fixture) return applyFromFixture(cwd, flags.fixture);
  if (flags && flags.amend) {
    // The workflow markdown (Step 2B) orchestrates the interactive select; lib-level
    // entry here is reserved for fixture-driven tests or future automation.
    output({ status: 'mode_b_interactive_required' }, raw,
      '--amend 대화형 흐름은 brief/workflows/define.md Step 2B에서 진행됩니다. ' +
      '자동화 테스트는 applyModeBAmendment() 를 직접 호출합니다.');
    return { status: 'mode_b_interactive_required' };
  }
  output({ status: 'interactive_mode_dispatched' }, raw,
    '대화형 Mode A는 brief/workflows/define.md 에서 진행됩니다.');
  return { status: 'interactive_mode_dispatched' };
}

module.exports = {
  cmdDefineApply,
  runInteractiveModeA,
  applyFromFixture,
  applyModeBAmendment,
  IMMUTABLE_DEFAULT_ITEMS,
};
```

Step 3 — Run `node --test tests/brief-define-mode-b.test.cjs`. All 3 tests must turn GREEN. Regression check: `node --test tests/brief-define-mode-a.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/brief-objectives-roundtrip.test.cjs` remains GREEN.
  </action>
  <verify>
    <automated>node --test tests/brief-define-mode-b.test.cjs 2>&amp;1 | tail -15</automated>
    <automated>node --test tests/brief-define-mode-a.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/brief-objectives-roundtrip.test.cjs 2>&amp;1 | tail -10</automated>
    <automated>node -e "const d=require('./brief/bin/lib/define.cjs'); if(typeof d.applyModeBAmendment!=='function')process.exit(1); console.log('applyModeBAmendment exported');"</automated>
    <automated>grep -n "UNLOCK" brief/bin/lib/define.cjs</automated>
  </verify>
  <acceptance_criteria>
    - `node --test tests/brief-define-mode-b.test.cjs` exits 0 (all 3 tests GREEN)
    - Regression: `node --test tests/brief-define-mode-a.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/brief-objectives-roundtrip.test.cjs` exits 0
    - `brief/bin/lib/define.cjs` exports `applyModeBAmendment`
    - `brief/bin/lib/define.cjs` contains literal string `UNLOCK` (audit-log line format)
    - `brief/bin/lib/define.cjs` contains literal string `'OBJECTIVES-UNLOCK-AUDIT.log'`
    - Audit log append uses `fs.appendFileSync(..., 'utf-8')` (append semantics — multiple unlock events accumulate)
    - Test B assertion regex is `/\d{4}-\d{2}-\d{2}T[\d:.]+Z\s+UNLOCK\s+core-value/` (verifiable by grep in test file)
    - `wc -l brief/bin/lib/define.cjs` ≤ 350 lines (still under budget for Plan 04 extensions)
  </acceptance_criteria>
  <done>Mode B writer-layer lock + --unlock-intent escape + audit-log contract GREEN; lib extension under 350 lines.</done>
</task>

<task type="auto">
  <name>Task 2: Fill in Mode B branch in brief/workflows/define.md — Section Picker with immutable items shown as 🔒</name>
  <read_first>
    - brief/workflows/define.md (Plan 02 — has a Step 2B STUB pointing at Plan 03)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md §decisions D-07 (lock footer message verbatim)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md §Open Questions #4 (Mode B selection UI — 🔒 marker recommended) + §Pitfall 1 (two-layer enforcement — UI layer hides or 🔒-marks)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md §Wave B brief/workflows/define.md Step 2B lines 241-243 + §Shared Pattern 7 TEXT_MODE fallback
  </read_first>
  <action>
Step 1 — Open `brief/workflows/define.md` and replace the Step 2B STUB (`→ Plan 03 fills in this step ...`) with the following full Mode B branch. **Note (W-5):** The picker question prose carries a visible 🔒 glyph in the header line (`🔒 어느 부분을 다시 보시겠어요?`) so the user sees a lock reinforcement even before reading the options; combined with the three 🔒-prefixed immutable items in the read-only display, total 🔒 count reaches ≥4.

```markdown
## Step 2B: Mode B (Amendment)

### 2B.1 — Read existing OBJECTIVES.md

Invoke `brief-tools objectives` internally (via lib import) to read the current OBJECTIVES.md frontmatter + body. If the file does not exist, exit with:
"OBJECTIVES.md가 아직 없습니다. /brief-define 를 --amend 없이 실행해 Mode A로 시작해 주세요."

### 2B.2 — Section Picker (D-07 + Pitfall 1 two-layer enforcement)

Present the user with a multi-choice picker showing ALL section headings from Mutable Hypotheses as selectable options AND Immutable Intent items as visibly-disabled 🔒-marked options. The picker MUST NOT allow clicking an 🔒 option by default. The picker header uses a 🔒 glyph to visually reinforce the lock boundary before the user even reads the options (W-5 reinforcement).

<askuserquestion>
  <question>
🔒 어느 부분을 다시 보시겠어요?

(잠긴 항목은 `/brief-define --amend --unlock-intent` 로 다시 실행해야 편집할 수 있습니다.)

## Mutable Hypotheses
  </question>
  <options>
    <option>Target Audience Specifics</option>
    <option>Verification Metrics</option>
    <option>Hypothesized Alternative Tools / Competitors</option>
    <option>Dream State — Now</option>
    <option>Dream State — 3-month</option>
    <option>Dream State — 12-month</option>
  </options>
</askuserquestion>

Followed by a second read-only display showing Immutable Intent items with the lock marker:

```
## Immutable Intent  (잠김)
  🔒 Creator Identity        — /brief-define --amend --unlock-intent 로만 편집 가능
  🔒 Core Value              — /brief-define --amend --unlock-intent 로만 편집 가능
  🔒 Problem Statement       — /brief-define --amend --unlock-intent 로만 편집 가능
```

In TEXT_MODE (when AskUserQuestion is not available — Codex / Gemini / OpenCode), render as a plain-text numbered list. Immutable items appear at the end with a `(잠김 — --unlock-intent 필요)` suffix and are NOT assigned a number.

Footer on every Mode B question (D-07 verbatim):
```
immutable 섹션은 잠겨있습니다. 수정하려면 /brief-define --unlock-intent
```

### 2B.3 — Conversational refinement on chosen mutable sections

For each user-selected mutable section, ask a focused free-text question in Korean:
- Target Audience Specifics: "타깃 사용자에 대해 업데이트하실 내용이 있으신가요?"
- Verification Metrics: "검증 지표 중 추가하거나 수정하실 항목이 있으신가요?"
- Dream State — Now/3m/12m: "이 시점의 상태를 어떻게 업데이트하시겠어요?"

### 2B.4 — Confirm updated fields + atomic write

Display the proposed diff (old → new) for each updated section. Ask:

<askuserquestion>
  <question>변경 사항을 저장할까요?</question>
  <options>
    <option>예, 저장</option>
    <option>한 항목씩 다시 확인</option>
    <option>취소 (저장하지 않음)</option>
  </options>
</askuserquestion>

On approval, invoke `brief-tools define apply --amend` (with --unlock-intent pass-through if the user originally invoked with that flag). The lib path (applyModeBAmendment) writes the updates via objectives.writeObjectivesMd — if the user tried to mutate an immutable item without --unlock-intent, the writer throws the Korean error and control returns to 2B.2 with a reminder of the --unlock-intent escape.

When --unlock-intent is in effect AND an immutable edit occurs, an audit-log line is appended to `.planning/OBJECTIVES-UNLOCK-AUDIT.log` (format: `<ISO8601Timestamp> UNLOCK <field>`).
```

Step 2 — Verify the 🔒 marker appears in workflow.md AND the lock footer appears verbatim:

```bash
grep -c "🔒" brief/workflows/define.md          # expect >= 4 (picker header + one per immutable item)
grep "immutable 섹션은 잠겨있습니다" brief/workflows/define.md
grep "/brief-define --unlock-intent" brief/workflows/define.md
```

Step 3 — Re-run the TEXT_MODE fallback scanner and confirm the workflow still passes:

```bash
node --test tests/ask-user-questions-fallback.test.cjs
```

Step 4 — Confirm file size discipline:
```bash
wc -l brief/workflows/define.md       # expect <= 400
```
  </action>
  <verify>
    <automated>grep -c "🔒" brief/workflows/define.md</automated>
    <automated>grep "immutable 섹션은 잠겨있습니다" brief/workflows/define.md</automated>
    <automated>grep -c "\-\-unlock-intent" brief/workflows/define.md</automated>
    <automated>grep "🔒 어느 부분을 다시 보시겠어요" brief/workflows/define.md</automated>
    <automated>node --test tests/ask-user-questions-fallback.test.cjs 2>&amp;1 | tail -5</automated>
    <automated>wc -l brief/workflows/define.md</automated>
    <automated>node --test tests/brief-define-mode-a.test.cjs tests/brief-define-mode-b.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/brief-objectives-roundtrip.test.cjs 2>&amp;1 | tail -10</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "🔒" brief/workflows/define.md` reports ≥ 4 (picker question header + one per immutable item in the read-only display)
    - `brief/workflows/define.md` contains the literal picker-header line `🔒 어느 부분을 다시 보시겠어요?` (W-5 lock-glyph reinforcement in the picker prose)
    - `brief/workflows/define.md` contains literal `immutable 섹션은 잠겨있습니다. 수정하려면 /brief-define --unlock-intent` (D-07 verbatim footer)
    - `brief/workflows/define.md` contains literal `--unlock-intent` at least 3 times (UI prominence per D-07 "explicit, named, intentional")
    - `brief/workflows/define.md` contains Korean prompt `어느 부분을 다시 보시겠어요?` (D-05 Mode B entry prompt verbatim, with or without the 🔒 prefix on the same line)
    - `brief/workflows/define.md` still contains both `TEXT_MODE` AND `numbered list`/`plain-text`/`plain text` (regression guard)
    - `node --test tests/ask-user-questions-fallback.test.cjs` exits 0
    - `wc -l brief/workflows/define.md` ≤ 400
    - Full Phase 3 test regression: `node --test tests/brief-define-mode-a.test.cjs tests/brief-define-mode-b.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/brief-objectives-roundtrip.test.cjs` exits 0
  </acceptance_criteria>
  <done>Mode B Section Picker with 🔒 picker header + 🔒-marked immutable items + D-07 footer verbatim + TEXT_MODE parity maintained + all tests green.</done>
</task>

</tasks>

<verification>
- `node --test tests/brief-define-mode-b.test.cjs tests/brief-define-mode-a.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/brief-objectives-roundtrip.test.cjs tests/ask-user-questions-fallback.test.cjs tests/architecture-counts.test.cjs` exits 0
- `grep "🔒" brief/workflows/define.md` emits ≥ 4 lines (picker header + three immutable items)
- `grep "\\[Push Twice\\]" brief/workflows/define.md` returns nothing (D-03 regression guard)
- `wc -l brief/bin/lib/define.cjs` reports ≤ 350 lines; `wc -l brief/workflows/define.md` reports ≤ 400 lines
</verification>

<success_criteria>
1. Mode B amendment flow produces short (3–10 min) edit sessions on existing OBJECTIVES.md.
2. Two-layer lock enforcement: UI layer hides/🔒-marks immutable items AND reinforces the lock via a 🔒-prefixed picker header (W-5); writer layer refuses unauthorized mutation (writer already shipped in Plan 01).
3. `--unlock-intent` is an EXPLICIT escape — visible in the workflow markdown at least 3 times; audit-log entry written on every actual unlock event.
4. TEXT_MODE parity maintained; no regression in Plan 02's Mode A smoke test.
</success_criteria>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user flag `--unlock-intent` → applyModeBAmendment(opts.unlockIntent) | flag lowers a guard-rail; its invocation is audited |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-06 | Repudiation | User edits immutable field with --unlock-intent and later claims they didn't | mitigate | Audit log (`.planning/OBJECTIVES-UNLOCK-AUDIT.log`) records ISO8601 timestamp + UNLOCK + field name for every unlock-triggered immutable mutation. Append-only (`fs.appendFileSync`). Test B asserts the line format. |
| T-03-07 | Tampering | User manually edits OBJECTIVES.md in text editor bypassing writer layer | accept | RESEARCH.md §Security Domain: writer-layer lock is the v1 mitigation; Phase 4 ALIGN gate + immutable_items anchor-check will detect manual mutation as a finding. Phase 3 does NOT ship detection of direct-file-edit bypass. |
| T-03-08 | Tampering | UI-layer bypass — user clicks 🔒 option in a runtime that doesn't respect disabled state | mitigate | Writer layer enforces regardless of UI bypass. Pitfall 1 two-layer enforcement: even if the 🔒 marker is ignored by the runtime, `enforceImmutableLock` throws at write time. Tested by `tests/brief-objectives-immutable-lock.test.cjs` (Plan 01) + `tests/brief-define-mode-b.test.cjs` Test A (this plan). |
</threat_model>

<output>
After completion, create `.planning/phases/03-define-canary-phase-0-end-to-end/03-03-SUMMARY.md`
</output>
</content>
