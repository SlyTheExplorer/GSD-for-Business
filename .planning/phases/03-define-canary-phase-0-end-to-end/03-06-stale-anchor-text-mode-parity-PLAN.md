---
phase: 03
plan: 06
type: execute
wave: 6
depends_on:
  - 03-01
  - 03-02
  - 03-05
files_modified:
  - brief/workflows/define.md
  - brief/workflows/discover.md
  - brief/bin/lib/define.cjs
  - brief/bin/brief-tools.cjs
  - tests/brief-define-stale-anchor.test.cjs
  - tests/brief-define-text-mode-parity.test.cjs
autonomous: true
requirements:
  - DEF-06
must_haves:
  truths:
    - "When OBJECTIVES.md mtime is >48h old AND the user invokes `/brief-discover` (new-activity entry per D-13), a 3-option AskUserQuestion interrupt fires BEFORE any Phase 5 work: `잠시 검토에` / `현재 OBJECTIVES를 보고 맞으면 승인` / `이제 승인, 빠르게 진행`"
    - "The stale-anchor interrupt ALSO fires at the `/brief-define --amend` entry point (second qualifying new-activity entry per D-13)"
    - "The stale-anchor interrupt does NOT fire on `/brief-status` (D-13 negative scope — Pitfall 6 `train users to ignore` guard)"
    - "The stale-anchor interrupt does NOT fire mid-workflow / on every command — only at qualifying new-activity entry points"
    - "text_mode=true produces byte-equivalent OBJECTIVES.md output to AskUserQuestion mode for the canonical Korea-first B2C fixture (after normalizing timestamps)"
    - "W-8: stale-anchor interrupt prompt is rendered BEFORE the Phase 5 placeholder line in combined stdout/stderr (ordering asserted by integer-index comparison on the combined output stream)"
  artifacts:
    - path: "brief/workflows/define.md"
      provides: "Stale-anchor hook added at --amend entry (before Step 2B flow)"
      contains: "48시간"
    - path: "brief/workflows/discover.md"
      provides: "Stale-anchor Step 2 filled in (previously STUB from Plan 05)"
      contains: "48시간"
    - path: "brief/bin/lib/define.cjs"
      provides: "shouldStaleAnchorFire(entryPoint) helper + 3-option interrupt Korean prompt rendering"
      contains: "function shouldStaleAnchorFire"
      exports: ["shouldStaleAnchorFire"]
    - path: "brief/bin/brief-tools.cjs"
      provides: "case 'discover' extended to invoke shouldStaleAnchorFire + renderStaleAnchorPrompt before emitting Phase 5 placeholder (B-5 — this file was edited in Step 4 but was missing from the previous frontmatter files_modified)"
      contains: "shouldStaleAnchorFire"
    - path: "tests/brief-define-stale-anchor.test.cjs"
      provides: "Positive (48h + /brief-discover triggers) + Negative (/brief-status does NOT trigger) smoke + W-8 ordering assertion"
      contains: "utimesSync"
    - path: "tests/brief-define-text-mode-parity.test.cjs"
      provides: "text_mode vs AskUserQuestion differential — same fixture produces byte-equivalent OBJECTIVES.md"
      contains: "text_mode"
  key_links:
    - from: "brief/workflows/discover.md (Step 2)"
      to: "brief/bin/lib/objectives.cjs (cmdStaleCheck)"
      via: "Workflow invokes `brief-tools objectives stale-check`"
      pattern: "brief-tools objectives stale-check"
    - from: "brief/workflows/define.md (Step 0.5 — --amend entry hook)"
      to: "brief/bin/lib/define.cjs (shouldStaleAnchorFire)"
      via: "Helper decides whether to fire; gated on `flags.amend === true`"
      pattern: "shouldStaleAnchorFire"
---

<objective>
Wire the stale-anchor 48h interrupt (DEF-06, D-13) into the two qualifying entry points: `/brief-discover` (new-activity via Plan 05's Step 2 STUB) and `/brief-define --amend` (amendment entry in Plan 02/03 workflow). Add the 3-option Korean interrupt prompt. Add a negative-scope test asserting `/brief-status` does NOT trigger. Add the text_mode parity test that asserts byte-equivalent OBJECTIVES.md output across runtime variants for the canonical fixture (FND-06 inheritance).

Purpose: Pitfall 6 — stale-anchor firing on every command trains users to ignore it — is one of Pitfall #3 (anchor drift)'s canonical failure modes. The negative scope test (`/brief-status` does NOT trigger) is load-bearing. text_mode parity is the final guard that Phase 3's multi-runtime contract (FND-06) is preserved — Mode A under Codex / Gemini / OpenCode produces the same OBJECTIVES.md as under Claude Code.

**Wave 6** (cascaded from B-4 serialization). Depends on Plan 05 (wave 5) which ships cmdValidate + workflow discover.md STUB that this plan replaces, and on Plan 02 (Mode A workflow define.md) for the --amend Step 0.5 hook placement.

Output: Hook in 2 workflow files + 1 lib helper + dispatcher-case extension in brief-tools.cjs + 2 new test files. No new commands. No ARCHITECTURE.md changes.
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
@.planning/phases/03-define-canary-phase-0-end-to-end/03-05-SUMMARY.md
@brief/workflows/define.md
@brief/workflows/discover.md
@brief/bin/lib/define.cjs
@brief/bin/lib/objectives.cjs
@brief/bin/brief-tools.cjs
@tests/read-guard.test.cjs
@tests/ask-user-questions-fallback.test.cjs

<interfaces>
<!-- Contracts this plan adds. -->

From brief/bin/lib/define.cjs (EXTENDED):
```javascript
// Activity-entry gate per D-13 — ONLY qualifying entry points may pass a truthy entryPoint.
// Plan 06 wires:
//   - 'discover-entry': /brief-discover first invocation
//   - 'define-amend-entry': /brief-define --amend invocation
// Future phases wire:
//   - 'phase-entry': Phase 4+ new-phase-start (NOT wired in Phase 3 — scaffolded in QUALIFYING_ENTRY_POINTS only)
//   - 'milestone-entry': v2 /brief-new-milestone (NOT wired in Phase 3 — scaffolded only)
// EXPLICITLY REFUSED by D-13:
//   - 'status-entry': /brief-status MUST NOT trigger
//   - 'help-entry': /brief-help MUST NOT trigger
//   - 'mid-workflow': any call inside an active workflow loop MUST NOT trigger
function shouldStaleAnchorFire(cwd, entryPoint);
// Returns { fire: boolean, age_hours: number, reason?: string }

// Optional CLI renderer — prints the 3-option interrupt prompt text (Korean).
// Test mode: callable without AskUserQuestion for deterministic snapshots.
function renderStaleAnchorPrompt(ageHours);
// Returns a multi-line string matching the 3 D-13 options.

module.exports = {
  // ...existing exports...
  shouldStaleAnchorFire,
  renderStaleAnchorPrompt,
};
```

From brief/bin/lib/objectives.cjs (Plan 05 — already shipped):
```javascript
function cmdStaleCheck(cwd, raw);   // returns {stale, age_hours, reason?}
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Write stale-anchor test (RED) — positive /brief-discover trigger + negative /brief-status no-trigger + text_mode parity test (RED) — then implement shouldStaleAnchorFire + renderStaleAnchorPrompt + wire dispatcher</name>
  <read_first>
    - brief/bin/lib/objectives.cjs (Plan 01+05 — checkStaleAnchor + cmdStaleCheck contracts)
    - brief/bin/lib/define.cjs (Plan 02/03/04 exports; budget remaining)
    - brief/bin/brief-tools.cjs (Plan 05 `case 'discover':` block — this plan extends it in Step 4)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md §decisions D-13 (stale-anchor fires ONLY on new-activity entry; 3 explicit options; list of does-NOT-trigger cases)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-RESEARCH.md §Pitfall 6 (Stale-Anchor Check Fires on Every Command) + §Stale-Anchor Smoke Test template (lines 1314-1343)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-PATTERNS.md §Wave F brief-define-stale-anchor.test.cjs pattern (lines 762-789), §Wave F brief-define-text-mode-parity.test.cjs pattern (lines 802-821)
    - tests/read-guard.test.cjs (fs.utimesSync pattern + positive/negative activity tests)
  </read_first>
  <behavior>
    - stale-anchor test positive: seed a complete OBJECTIVES.md, backdate mtime to 49h ago via `fs.utimesSync`. Run `runGsdTools(['discover'], tmpDir)`. Output contains `/48시간/` AND `/잠시 검토에/` AND `/현재 OBJECTIVES를 보고/` AND `/이제 승인, 빠르게 진행/`. Exit code may be 0 (gate passed; interrupt is prompt-only — real AskUserQuestion in runtime, in test we just verify the prompt text is rendered before Phase 5 placeholder). Also assert the Phase 5 placeholder DID print (gate passed on complete OBJECTIVES.md, so the interrupt is the stale-anchor one, not the block-gate).
    - **W-8 ordering assertion:** In the positive test, extract the combined stdout/stderr stream and assert `combined.indexOf('48시간') < combined.indexOf('Phase 5')` — the stale-anchor prompt MUST render BEFORE the Phase 5 placeholder line.
    - stale-anchor test negative 1 (/brief-status): seed complete OBJECTIVES.md, backdate mtime to 49h. Run `runGsdTools(['status'], tmpDir)`. Output does NOT match `/잠시 검토에/`.
    - stale-anchor test negative 2 (fresh OBJECTIVES.md + /brief-discover): fresh mtime, run `runGsdTools(['discover'], tmpDir)`. Output does NOT match `/잠시 검토에/` (not stale, no interrupt).
    - stale-anchor test helper: direct-call `shouldStaleAnchorFire(tmpDir, 'discover-entry')` on 49h-old file → `{fire: true, age_hours: >= 49}`; `shouldStaleAnchorFire(tmpDir, 'status-entry')` → `{fire: false, reason: 'entry-not-qualifying'}`; `shouldStaleAnchorFire(tmpDir, 'mid-workflow')` → `{fire: false, reason: 'entry-not-qualifying'}`.
    - text_mode parity test: `runGsdTools(['define','apply','--fixture','korea-b2c-persona.json'], tmpA)` runs in AskUserQuestion mode (default); `tmpB` has `workflow.text_mode=true` seeded in its config.json before the apply. Both produce `.planning/OBJECTIVES.md` whose normalized content (regex-replacing ISO timestamps with `<TS>`) is byte-equivalent via `assert.strictEqual`.
  </behavior>
  <action>
Step 1 — Create `tests/brief-define-stale-anchor.test.cjs`:

```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProject, cleanup, runGsdTools } = require('./helpers.cjs');
const objectives = require('../brief/bin/lib/objectives.cjs');
const define = require('../brief/bin/lib/define.cjs');

function seedValidObjectives(cwd) {
  objectives.writeObjectivesMd(cwd, {
    frontmatter: {
      brief_objectives_version: '1.0',
      status: 'ready',
      mode: 'greenfield',
      immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
      'creator-identity': 'seed',
      'core-value': 'seed',
      'problem-statement': 'seed',
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
}

function backdateMtime(cwd, hoursAgo) {
  const objPath = path.join(cwd, '.planning', 'OBJECTIVES.md');
  const pastMs = Date.now() - (hoursAgo * 60 * 60 * 1000);
  fs.utimesSync(objPath, new Date(pastMs), new Date(pastMs));
}

describe('Stale-anchor 48h notice (DEF-06, D-13)', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = createTempProject(); });
  afterEach(() => { cleanup(tmpDir); });

  test('POSITIVE — /brief-discover on 49h-stale OBJECTIVES.md surfaces 3-option prompt (W-8 ordering enforced)', () => {
    seedValidObjectives(tmpDir);
    backdateMtime(tmpDir, 49);
    const r = runGsdTools(['discover'], tmpDir);
    // The gate passes (OBJECTIVES.md complete), so we expect the stale-anchor
    // prompt to be rendered BEFORE the Phase 5 placeholder message.
    const combined = (r.output || '') + (r.error || '');
    assert.match(combined, /48시간/, '48h threshold surfaced');
    assert.match(combined, /잠시 검토에/, 'option 1 present');
    assert.match(combined, /현재 OBJECTIVES를 보고/, 'option 2 present');
    assert.match(combined, /이제 승인, 빠르게 진행/, 'option 3 present');

    // W-8 ordering assertion: stale-anchor prompt MUST render BEFORE the Phase 5 placeholder.
    const idxPrompt = combined.indexOf('48시간');
    const idxPlaceholder = combined.indexOf('Phase 5');
    assert.ok(idxPrompt >= 0 && idxPlaceholder >= 0,
      'both markers present in combined output');
    assert.ok(idxPrompt < idxPlaceholder,
      `W-8: stale-anchor prompt (idx=${idxPrompt}) rendered BEFORE Phase 5 placeholder (idx=${idxPlaceholder})`);
  });

  test('NEGATIVE 1 — /brief-status on stale OBJECTIVES.md does NOT trigger (D-13 scope, Pitfall 6)', () => {
    seedValidObjectives(tmpDir);
    backdateMtime(tmpDir, 49);
    const r = runGsdTools(['status'], tmpDir);
    const combined = (r.output || '') + (r.error || '');
    assert.doesNotMatch(combined, /잠시 검토에/,
      '/brief-status MUST NOT fire stale-anchor interrupt');
  });

  test('NEGATIVE 2 — fresh OBJECTIVES.md + /brief-discover does NOT trigger', () => {
    seedValidObjectives(tmpDir);
    // do NOT backdate — file is seconds old
    const r = runGsdTools(['discover'], tmpDir);
    const combined = (r.output || '') + (r.error || '');
    assert.doesNotMatch(combined, /잠시 검토에/, 'fresh OBJECTIVES.md → no interrupt');
    assert.match(combined, /Phase 5/, 'Phase 5 placeholder still emitted');
  });

  test('shouldStaleAnchorFire direct-call — entry-point gating (Pitfall 6 unit)', () => {
    seedValidObjectives(tmpDir);
    backdateMtime(tmpDir, 49);

    const yes = define.shouldStaleAnchorFire(tmpDir, 'discover-entry');
    assert.strictEqual(yes.fire, true);
    assert.ok(yes.age_hours >= 48);

    const amend = define.shouldStaleAnchorFire(tmpDir, 'define-amend-entry');
    assert.strictEqual(amend.fire, true);

    const no1 = define.shouldStaleAnchorFire(tmpDir, 'status-entry');
    assert.strictEqual(no1.fire, false);
    assert.match(no1.reason || '', /entry-not-qualifying/);

    const no2 = define.shouldStaleAnchorFire(tmpDir, 'mid-workflow');
    assert.strictEqual(no2.fire, false);

    const no3 = define.shouldStaleAnchorFire(tmpDir, 'help-entry');
    assert.strictEqual(no3.fire, false);
  });
});
```

Step 2 — Create `tests/brief-define-text-mode-parity.test.cjs`:

```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProject, cleanup, runGsdTools } = require('./helpers.cjs');

describe('/brief-define text_mode parity (FND-06 flowdown)', () => {
  let tmpA, tmpB;
  beforeEach(() => { tmpA = createTempProject(); tmpB = createTempProject(); });
  afterEach(() => { cleanup(tmpA); cleanup(tmpB); });

  test('AskUserQuestion path and text_mode path produce byte-equivalent OBJECTIVES.md for same fixture', () => {
    // tmpA: default mode (AskUserQuestion — but fixture short-circuits the interaction loop).
    const rA = runGsdTools(['define', 'apply', '--fixture', 'korea-b2c-persona.json'], tmpA);
    assert.ok(rA.success, `apply A failed: ${rA.error || rA.output}`);

    // tmpB: set workflow.text_mode=true in config.json before applying.
    const cfgPathB = path.join(tmpB, '.planning', 'config.json');
    const cfgB = JSON.parse(fs.readFileSync(cfgPathB, 'utf-8'));
    cfgB.workflow = cfgB.workflow || {};
    cfgB.workflow.text_mode = true;
    fs.writeFileSync(cfgPathB, JSON.stringify(cfgB, null, 2));

    const rB = runGsdTools(['define', 'apply', '--fixture', 'korea-b2c-persona.json'], tmpB);
    assert.ok(rB.success, `apply B failed: ${rB.error || rB.output}`);

    const objA = fs.readFileSync(path.join(tmpA, '.planning', 'OBJECTIVES.md'), 'utf-8');
    const objB = fs.readFileSync(path.join(tmpB, '.planning', 'OBJECTIVES.md'), 'utf-8');

    // Normalize timestamps (created_at / last_amended differ by microseconds between runs).
    const normalize = (s) => s.replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, '<TS>');
    assert.strictEqual(normalize(objA), normalize(objB),
      'text_mode produces identical OBJECTIVES.md as AskUserQuestion mode (FND-06)');
  });
});
```

Step 3 — Extend `brief/bin/lib/define.cjs` with `shouldStaleAnchorFire` + `renderStaleAnchorPrompt`. **W-1 note: `phase-entry` and `milestone-entry` are scaffolded in the `QUALIFYING_ENTRY_POINTS` Set so future phases can wire them without editing this module — but Plan 06 only wires `discover-entry` and `define-amend-entry` into actual dispatcher call sites. Phase 4+ will add the dispatcher-level wiring for `phase-entry` (and v2 for `milestone-entry`).**

```javascript
// Append before the module.exports block.

const objectivesLib = require('./objectives.cjs');

// W-1: `phase-entry` and `milestone-entry` are scaffolded here but NOT wired to dispatcher
// call sites in Phase 3. Only `discover-entry` (Plan 06 /brief-discover dispatcher) and
// `define-amend-entry` (Plan 06 workflow Step 0.5 on --amend) are live in Phase 3 scope.
// Phase 4+ will add the phase-entry dispatcher hook when that phase ships.
const QUALIFYING_ENTRY_POINTS = new Set([
  'discover-entry',       // /brief-discover first invocation — wired in Phase 3 Plan 06
  'define-amend-entry',   // /brief-define --amend — wired in Phase 3 Plan 06
  'phase-entry',          // Phase 4+ scaffolded only; no dispatcher wire in Phase 3
  'milestone-entry',      // v2 /brief-new-milestone scaffolded only; no dispatcher wire in Phase 3
]);

function shouldStaleAnchorFire(cwd, entryPoint) {
  if (!QUALIFYING_ENTRY_POINTS.has(entryPoint)) {
    return { fire: false, age_hours: 0, reason: 'entry-not-qualifying' };
  }
  const stale = objectivesLib.checkStaleAnchor(cwd);
  if (!stale.stale) {
    return { fire: false, age_hours: stale.age_hours, reason: stale.reason || 'fresh' };
  }
  return { fire: true, age_hours: stale.age_hours };
}

function renderStaleAnchorPrompt(ageHours) {
  return [
    `⚠ OBJECTIVES.md이 ${ageHours}시간 전 마지막으로 수정되었습니다 (48시간 경과).`,
    '',
    '본격적으로 일을 시작하기 전에 한 번 정비하시는 것을 권장합니다.',
    '',
    '어떻게 진행하시겠어요?',
    '  1) 잠시 검토에 — /brief-define --amend 로 수정 흐름 진입',
    '  2) 현재 OBJECTIVES를 보고 맞으면 승인 — 내용 확인 후 mtime 갱신',
    '  3) 이제 승인, 빠르게 진행 — 즉시 mtime 갱신하고 다음 단계로',
    '',
  ].join('\n');
}

// Extend module.exports:
module.exports = {
  cmdDefineApply,
  runInteractiveModeA,
  applyFromFixture,
  applyModeBAmendment,
  detectKoreaSignals,
  writeConfigBrief,
  performAtomicCommit,
  shouldStaleAnchorFire,
  renderStaleAnchorPrompt,
  KOREA_SIGNAL_PATTERNS,
  IMMUTABLE_DEFAULT_ITEMS,
};
```

Step 4 — Wire the stale-anchor prompt into `brief/bin/brief-tools.cjs` `case 'discover'` (extend the existing Plan 05 stub). **B-5: this file is now included in frontmatter `files_modified`.**

```javascript
case 'discover': {
  const objectives = require('./lib/objectives.cjs');
  const r = objectives.validateObjectivesComplete(cwd);
  if (!r.valid) return objectives.cmdValidate(cwd, raw);  // block-gate; exits non-zero

  // Stale-anchor check — qualifying entry point: 'discover-entry' (Plan 06).
  const define = require('./lib/define.cjs');
  const stale = define.shouldStaleAnchorFire(cwd, 'discover-entry');
  if (stale.fire) {
    process.stdout.write(define.renderStaleAnchorPrompt(stale.age_hours));
  }

  const { output } = require('./lib/core.cjs');
  output({ phase: 5, status: 'placeholder' }, raw,
    'Phase 5 DISCOVER body — coming in Phase 5. Block-gate is live.');
  return;
}
```

Step 5 — Run both new tests:
```
node --test tests/brief-define-stale-anchor.test.cjs tests/brief-define-text-mode-parity.test.cjs
```
MUST turn GREEN.
  </action>
  <verify>
    <automated>node --test tests/brief-define-stale-anchor.test.cjs 2>&amp;1 | tail -20</automated>
    <automated>node --test tests/brief-define-text-mode-parity.test.cjs 2>&amp;1 | tail -15</automated>
    <automated>node -e "const d=require('./brief/bin/lib/define.cjs'); ['shouldStaleAnchorFire','renderStaleAnchorPrompt'].forEach(fn=>{if(typeof d[fn]!=='function'){console.error('MISSING:',fn);process.exit(1);}});console.log('OK');"</automated>
    <automated>node -e "const d=require('./brief/bin/lib/define.cjs'); const p=d.renderStaleAnchorPrompt(49); ['48시간','잠시 검토에','현재 OBJECTIVES를 보고','이제 승인, 빠르게 진행'].forEach(s=>{if(!p.includes(s)){console.error('MISSING STR:',s);process.exit(1);}});console.log('prompt contains all 3 options');"</automated>
    <automated>grep -c "shouldStaleAnchorFire" brief/bin/brief-tools.cjs</automated>
    <automated>grep "Phase 5 DISCOVER body" brief/bin/brief-tools.cjs</automated>
  </verify>
  <acceptance_criteria>
    - `node --test tests/brief-define-stale-anchor.test.cjs` exits 0 (all 4 tests GREEN — positive + 2 negatives + direct-call unit)
    - **W-8 GUARD:** `tests/brief-define-stale-anchor.test.cjs` contains literal assertion `idxPrompt < idxPlaceholder` (or equivalent `assert.ok(idxPrompt < idxPlaceholder)` line) — verified by grep presence
    - `node --test tests/brief-define-text-mode-parity.test.cjs` exits 0 (parity assertion after timestamp normalization passes)
    - `brief/bin/lib/define.cjs` exports `shouldStaleAnchorFire` AND `renderStaleAnchorPrompt`
    - `brief/bin/lib/define.cjs` contains the `QUALIFYING_ENTRY_POINTS` Set and it lists ALL four entries: `discover-entry`, `define-amend-entry`, `phase-entry`, `milestone-entry` (W-1 scaffolding). The Set explicitly does NOT include `status-entry`, `help-entry`, or `mid-workflow`.
    - **W-1 GUARD:** `brief/bin/lib/define.cjs` contains an inline comment near the QUALIFYING_ENTRY_POINTS Set noting that `phase-entry` and `milestone-entry` are scaffolded for Phase 4+ / v2 wiring but have NO live dispatcher call site in Phase 3. Verifiable via grep for the substring `scaffolded` in the same file.
    - `renderStaleAnchorPrompt(49)` output contains ALL 3 D-13 options: `잠시 검토에`, `현재 OBJECTIVES를 보고`, `이제 승인, 빠르게 진행`
    - `brief/bin/brief-tools.cjs` `case 'discover'` now invokes `define.shouldStaleAnchorFire(cwd, 'discover-entry')` AND `define.renderStaleAnchorPrompt` on stale fire (grep `shouldStaleAnchorFire` in brief-tools.cjs emits ≥ 1 match)
    - `wc -l brief/bin/lib/define.cjs` ≤ 400 lines (budget guard — Plan 02 targeted 250-350; Plan 06 additions push near the line but should stay under 400)
  </acceptance_criteria>
  <done>Stale-anchor helper, prompt renderer, and discover-case wiring are GREEN; text_mode parity confirmed on canonical fixture; W-1 scaffolding note present; W-8 ordering assertion live.</done>
</task>

<task type="auto">
  <name>Task 2: Wire stale-anchor Step 2 in workflows/discover.md (replace Plan 05 STUB) + Step 0.5 in workflows/define.md (--amend entry hook) + finalize VALIDATION.md</name>
  <read_first>
    - brief/workflows/discover.md (Plan 05 — Step 2 is a STUB pointing at Plan 06)
    - brief/workflows/define.md (Plan 02/03 — Step 0 is the flag-parser; Step 2B is Mode B start)
    - brief/bin/lib/define.cjs (from Task 1 — shouldStaleAnchorFire + renderStaleAnchorPrompt contracts)
    - brief/bin/lib/objectives.cjs (Plan 01+05 — cmdStaleCheck + checkStaleAnchor + OBJECTIVES-UNLOCK-AUDIT pattern for mtime bump)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-CONTEXT.md §decisions D-13 (3-option paths verbatim)
    - .planning/phases/03-define-canary-phase-0-end-to-end/03-VALIDATION.md (full file — rows to finalize, Wave 0 gaps, sign-off checklist)
  </read_first>
  <action>
Step 1 — Replace Plan 05's STUB `Step 2: Stale-anchor check (DEF-06, D-13) — WIRED IN PLAN 06` in `brief/workflows/discover.md` with the full workflow:

```markdown
## Step 2: Stale-anchor check (DEF-06, D-13)

Invoke `brief-tools objectives stale-check` to get `{ stale, age_hours }`.

D-13 gating: this check runs ONLY because `/brief-discover` is a qualifying new-activity entry point. It does NOT run on `/brief-status`, `/brief-help`, or mid-workflow invocations (that logic lives in `shouldStaleAnchorFire` in define.cjs).

If `stale === true`:

<askuserquestion>
  <question>
⚠ OBJECTIVES.md이 {age_hours}시간 전 마지막으로 수정되었습니다 (48시간 경과).

본격적으로 일을 시작하기 전에 한 번 정비하시는 것을 권장합니다.

어떻게 진행하시겠어요?
  </question>
  <options>
    <option>잠시 검토에 — /brief-define --amend 로 수정 흐름 진입</option>
    <option>현재 OBJECTIVES를 보고 맞으면 승인 — 내용 확인 후 mtime 갱신</option>
    <option>이제 승인, 빠르게 진행 — 즉시 mtime 갱신하고 다음 단계로</option>
  </options>
</askuserquestion>

In TEXT_MODE, render as a plain-text numbered list (1/2/3) and prompt the user to type their choice number. NO bypass — the user MUST pick one of the three options to proceed.

Action per selection:
- **1. 잠시 검토에** — Dispatch to `/brief-define --amend`; discover flow exits until amend completes.
- **2. 현재 OBJECTIVES를 보고 맞으면 승인** — Display the current OBJECTIVES.md content using `brief-tools objectives` (or direct file read); ask "내용 확인하셨나요? 맞으면 승인해 주세요." ; on approval, touch OBJECTIVES.md mtime (e.g., `fs.utimesSync` or re-save via writeObjectivesMd with identical frontmatter).
- **3. 이제 승인, 빠르게 진행** — Immediately touch OBJECTIVES.md mtime without content review; continue to Step 3 placeholder.
```

Step 2 — Add stale-anchor hook to `brief/workflows/define.md` at a new `Step 0.5` placed between the existing flag parser (Step 0) and the Mode A entry selection (Step 1). This runs ONLY when `--amend` is in effect (Mode B entry):

```markdown
## Step 0.5: Stale-anchor check on --amend entry (DEF-06, D-13)

If `--amend` is set, this is a qualifying new-activity entry per D-13. Invoke `brief-tools objectives stale-check`. If `stale === true`:

<askuserquestion>
  <question>
⚠ OBJECTIVES.md이 {age_hours}시간 전 마지막으로 수정되었습니다 (48시간 경과).

본격적으로 일을 시작하기 전에 한 번 정비하시는 것을 권장합니다.

어떻게 진행하시겠어요?
  </question>
  <options>
    <option>잠시 검토에 — 지금 이 /brief-define --amend 흐름에서 검토</option>
    <option>현재 OBJECTIVES를 보고 맞으면 승인 — 내용 확인 후 mtime 갱신</option>
    <option>이제 승인, 빠르게 진행 — 즉시 mtime 갱신하고 Mode B 진행</option>
  </options>
</askuserquestion>

Selection actions are identical to the `/brief-discover` stale-anchor flow above, except option 1 continues the current `--amend` flow (there's no need to dispatch — the user already invoked `--amend`).

If `--amend` is NOT set (Mode A greenfield), skip this step — Mode A is the INITIAL anchor creation, not an amendment, so stale-anchor does not apply.
```

Step 3 — Finalize `.planning/phases/03-define-canary-phase-0-end-to-end/03-VALIDATION.md`:
  - Change frontmatter `status: draft` → `status: ready` and `wave_0_complete: false` → `wave_0_complete: true`
  - Change frontmatter `nyquist_compliant: false` → `nyquist_compliant: true`
  - In the `## Validation Sign-Off` section at the bottom, mark each checklist item `[x]` (all satisfied after Plan 06 completes).
  - Ensure the Per-Task Verification Map rows match the task IDs actually used in Plans 01–06 (verify by grep — the current draft uses `03-01-01`..`03-06-03` which matches the plan filenames). **Note (B-4 cascade + W-4): update the Wave column for Plans 04/05/06 to reflect the new wave numbers (Plan 04 → wave 4; Plan 05 → wave 5; Plan 06 → wave 6).** No row removals needed; rows may be augmented with `✅ green` status by the execute step.
  - DO NOT edit the Wave 0 Requirements list — it already enumerates all 12 test file + fixture scaffolds, which is correct. However, the Wave-0 list DOES need to add the two new test/helper artifacts this plan set introduced: `tests/helpers.cjs` extension (Plan 04 Task 0/1) and `tests/fixtures/non-korea-b2b-persona.json` (Plan 04 B-6 negative fixture). Update the Wave 0 Requirements block accordingly.

Step 4 — Run the full Phase 3 suite as a final regression:
```
node --test tests/brief-define-mode-a.test.cjs tests/brief-define-mode-b.test.cjs tests/brief-define-atomic-commit.test.cjs tests/brief-define-canary.test.cjs tests/brief-define-korea-signal.test.cjs tests/brief-define-stale-anchor.test.cjs tests/brief-define-text-mode-parity.test.cjs tests/brief-config-brief-namespace.test.cjs tests/brief-discover-gate.test.cjs tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/ask-user-questions-fallback.test.cjs tests/architecture-counts.test.cjs
```
All Phase-3-scoped tests MUST be GREEN.

Step 5 — Optional deferred-items note: add a single line at the end of Plan 06's summary document (or the end of this PLAN.md if no SUMMARY exists at write time) noting: "Deferred to Phase 4+/v2: `phase-entry` and `milestone-entry` stale-anchor dispatcher wiring — scaffolded in QUALIFYING_ENTRY_POINTS but no live call site in Phase 3." This is the W-1 deferred-items pointer for the executor's record.
  </action>
  <verify>
    <automated>grep "48시간" brief/workflows/discover.md</automated>
    <automated>grep "48시간" brief/workflows/define.md</automated>
    <automated>grep -c "잠시 검토에" brief/workflows/discover.md</automated>
    <automated>grep -c "잠시 검토에" brief/workflows/define.md</automated>
    <automated>grep "Step 0.5" brief/workflows/define.md</automated>
    <automated>node --test tests/brief-define-stale-anchor.test.cjs tests/brief-define-text-mode-parity.test.cjs tests/ask-user-questions-fallback.test.cjs 2>&amp;1 | tail -10</automated>
    <automated>grep -E "nyquist_compliant:|wave_0_complete:|status:" .planning/phases/03-define-canary-phase-0-end-to-end/03-VALIDATION.md | head -5</automated>
    <automated>node --test tests/brief-define-mode-a.test.cjs tests/brief-define-mode-b.test.cjs tests/brief-define-atomic-commit.test.cjs tests/brief-define-canary.test.cjs tests/brief-define-korea-signal.test.cjs tests/brief-define-stale-anchor.test.cjs tests/brief-define-text-mode-parity.test.cjs tests/brief-config-brief-namespace.test.cjs tests/brief-discover-gate.test.cjs tests/brief-objectives-roundtrip.test.cjs tests/brief-objectives-immutable-lock.test.cjs tests/architecture-counts.test.cjs 2>&amp;1 | tail -15</automated>
  </verify>
  <acceptance_criteria>
    - `brief/workflows/discover.md` contains literal `48시간` AND all 3 D-13 option strings: `잠시 검토에`, `현재 OBJECTIVES를 보고`, `이제 승인, 빠르게 진행`
    - `brief/workflows/define.md` contains literal `Step 0.5` (stale-anchor on --amend entry)
    - `brief/workflows/define.md` contains literal `48시간` AND the same 3 option strings
    - `brief/workflows/discover.md` does NOT contain `→ Plan 06 fills in` (Plan 05 STUB replaced)
    - Both workflow files still contain `TEXT_MODE`/`text_mode` AND `numbered list`/`plain-text`/`plain text` (regression guard)
    - `.planning/phases/03-define-canary-phase-0-end-to-end/03-VALIDATION.md` frontmatter has `status: ready`, `wave_0_complete: true`, `nyquist_compliant: true`
    - `.planning/phases/03-define-canary-phase-0-end-to-end/03-VALIDATION.md` Per-Task Verification Map Wave column shows Plan 04 rows at wave 4, Plan 05 rows at wave 5, Plan 06 rows at wave 6 (post-B-4 cascade)
    - Full Phase 3 suite regression: `node --test tests/brief-define-*.test.cjs tests/brief-objectives-*.test.cjs tests/brief-discover-gate.test.cjs tests/ask-user-questions-fallback.test.cjs tests/architecture-counts.test.cjs tests/brief-config-brief-namespace.test.cjs` exits 0
    - `wc -l brief/workflows/define.md` ≤ 400; `wc -l brief/workflows/discover.md` ≤ 120
  </acceptance_criteria>
  <done>Stale-anchor interrupts live in both /brief-discover and /brief-define --amend entry paths; text_mode parity verified; VALIDATION.md finalized (B-4 wave cascade applied); full Phase 3 suite GREEN; W-1 deferred-items note recorded.</done>
</task>

</tasks>

<verification>
- Full Phase 3 test set GREEN: brief-define-mode-a, brief-define-mode-b, brief-define-atomic-commit, brief-define-canary, brief-define-korea-signal, brief-define-stale-anchor, brief-define-text-mode-parity, brief-config-brief-namespace, brief-discover-gate, brief-objectives-roundtrip, brief-objectives-immutable-lock, ask-user-questions-fallback, architecture-counts
- `grep "잠시 검토에" brief/workflows/discover.md brief/workflows/define.md` emits matches in BOTH files
- `grep "→ Plan 06 fills in" brief/workflows/discover.md` returns NOTHING (STUB replaced)
- `.planning/phases/03-define-canary-phase-0-end-to-end/03-VALIDATION.md` has `nyquist_compliant: true`
- `wc -l brief/bin/lib/define.cjs` ≤ 400 lines
- `grep "scaffolded" brief/bin/lib/define.cjs` emits ≥ 1 line (W-1 comment pointer on phase-entry/milestone-entry)
</verification>

<success_criteria>
1. DEF-06: Stale-anchor 48h interrupt fires on `/brief-discover` (new-activity) AND `/brief-define --amend`; presents the 3 D-13 options in Korean; no bypass without a choice.
2. Pitfall 6 mitigation verified: `/brief-status` on stale OBJECTIVES.md does NOT trigger (negative test GREEN).
3. FND-06 text_mode parity proven on the canonical Korea-first B2C fixture — same OBJECTIVES.md across runtime variants.
4. Phase 3 VALIDATION.md marked ready + nyquist-compliant; wave column reflects B-4 serialization cascade (Plan 04→wave 4, Plan 05→wave 5, Plan 06→wave 6).
5. W-1: `phase-entry` and `milestone-entry` are scaffolded for Phase 4+/v2 wiring — documented with inline comment + deferred-items note; not wired to dispatcher call sites in Phase 3.
6. W-8: stale-anchor prompt renders BEFORE the Phase 5 placeholder line — asserted by index-ordering comparison in the positive test.
</success_criteria>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| entryPoint string from workflow → shouldStaleAnchorFire | Closed enum; unknown values return fire:false |
| filesystem mtime (Date.now() - stat.mtimeMs) → threshold check | Clock drift / tz irrelevant — comparison is in ms relative to process start |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-13 | Denial of Service | Stale-anchor firing on every command teaches user to click through, fails Pitfall #3 mitigation | mitigate | QUALIFYING_ENTRY_POINTS Set explicitly closed — only 4 entries permitted (with `phase-entry`/`milestone-entry` scaffolded but not wired per W-1); test NEGATIVE 1 asserts /brief-status does NOT trigger; test unit-call asserts `status-entry`, `help-entry`, `mid-workflow` all return `fire:false`. |
| T-03-14 | Tampering | User sets system clock back to bypass 48h check | accept | Low-value target; Phase 3 does not ship clock-integrity controls. RESEARCH.md §Security Domain confirms out-of-scope. Phase 4+ ALIGN gate would catch resulting content-staleness by semantic diff regardless of mtime. |
</threat_model>

<output>
After completion, create `.planning/phases/03-define-canary-phase-0-end-to-end/03-06-SUMMARY.md`. **W-1 end-of-plan deferred-items note:** The SUMMARY must include the line `Deferred to Phase 4+/v2: phase-entry and milestone-entry stale-anchor dispatcher wiring — scaffolded in QUALIFYING_ENTRY_POINTS but no live call site in Phase 3.`
</output>
</content>
