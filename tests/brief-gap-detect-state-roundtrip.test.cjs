/**
 * brief-gap-detect-state-roundtrip.test.cjs — Plan 06-03 Task 2.
 *
 * Asserts state.brief.return_stack + state.brief.return_stack_history survive
 * round-trip through state.cjs (readModifyWriteStateMd + extractFrontmatter +
 * reconstructFrontmatter). Leverages Phase 2 D-20 array-of-objects
 * serialization + Phase 2 D-21 brief-map preservation. No new allowlist
 * entries required per RESEARCH A3.
 *
 * Also covers:
 *   - popReturnFrame removes top of return_stack without touching history
 *   - maybePopTopFrame dual-condition logic (D-11)
 *   - clearReturnStackFor / appendGapQueue / writeAssumption primitives
 *   - `brief-tools.cjs state json` preserves return_stack_history on rebuild
 *
 * Reference: 06-03-PLAN.md Task 2 behaviors 1-9, 11-12.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync } = require('node:child_process');

const {
  pushReturnFrame,
  popReturnFrame,
  maybePopTopFrame,
  clearReturnStackFor,
  appendGapQueue,
  writeAssumption,
} = require('../brief/bin/lib/gap-detect.cjs');
const {
  extractFrontmatter,
  stripFrontmatter,
  reconstructFrontmatter,
} = require('../brief/bin/lib/frontmatter.cjs');

// Merge `align` result into state.brief.last_gate_results without touching
// return_stack/history. Uses the lib's own frontmatter round-trip to stay
// consistent with what maybePopTopFrame reads back.
function seedAlignResult(tmp, { decision, at }) {
  const statePath = path.join(tmp, '.planning', 'STATE.md');
  const content = fs.readFileSync(statePath, 'utf-8');
  const fm = extractFrontmatter(content) || {};
  const body = stripFrontmatter(content);
  if (!fm.brief || typeof fm.brief !== 'object' || Array.isArray(fm.brief)) fm.brief = {};
  if (!fm.brief.last_gate_results || typeof fm.brief.last_gate_results !== 'object') {
    fm.brief.last_gate_results = {};
  }
  fm.brief.last_gate_results.align = { decision, at };
  fs.writeFileSync(statePath, `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`);
}

const REPO_ROOT = path.resolve(__dirname, '..');
const BRIEF_TOOLS_CJS = path.join(REPO_ROOT, 'brief/bin/brief-tools.cjs');

// ─── Setup helpers ────────────────────────────────────────────────────────

function setupTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-gap-state-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: 'us' } }),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'business_model: b2b',
      'region: us',
      'status: ready',
      '---',
      '',
      '# OBJECTIVES',
      '',
      '## Immutable Intent',
      '',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: test',
      'status: executing',
      'current_phase: "06"',
      'stopped_at: "gap-detect state roundtrip test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

const VALID_FRAME = {
  paused_phase: '07',
  paused_workstream: 'go-to-market',
  paused_artifact: '.planning/workstreams/go-to-market/market-sizing.md',
  gap_text: 'TAM citation missing',
  triggering_topic: 'Korea fintech TAM',
  topic_fingerprint: 'market-sizing-korea-fintech-tam',
  pushed_at: '2026-04-22T10:00:00.000Z',
};

const SECOND_FRAME = {
  paused_phase: '07',
  paused_workstream: 'financial',
  paused_artifact: '.planning/workstreams/financial/driver-model.md',
  gap_text: 'Cost driver unsourced',
  triggering_topic: 'Cost drivers',
  topic_fingerprint: 'financial-cost-drivers-unsourced',
  pushed_at: '2026-04-23T12:00:00.000Z',
};

function readBrief(tmp) {
  const fm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  return fm.brief || {};
}

// ─── popReturnFrame tests ─────────────────────────────────────────────────

test('popReturnFrame: decrements return_stack by 1 without touching return_stack_history', () => {
  const tmp = setupTmp();
  pushReturnFrame(tmp, VALID_FRAME);
  pushReturnFrame(tmp, SECOND_FRAME);
  // return_stack.length === 2; return_stack_history.length === 2

  const popped = popReturnFrame(tmp);
  assert.ok(popped, 'popReturnFrame must return the popped frame');
  assert.equal(popped.topic_fingerprint, SECOND_FRAME.topic_fingerprint);

  const brief = readBrief(tmp);
  assert.equal(brief.return_stack.length, 1, 'return_stack must be 1');
  assert.equal(brief.return_stack_history.length, 2, 'return_stack_history must be UNCHANGED at 2');
});

test('popReturnFrame: no-op on empty return_stack (does not throw, does not mutate)', () => {
  const tmp = setupTmp();
  const popped = popReturnFrame(tmp);
  assert.equal(popped, null, 'empty stack pop must return null');
  const brief = readBrief(tmp);
  // brief namespace may not even exist yet — this is fine.
  const stackLen = Array.isArray(brief.return_stack) ? brief.return_stack.length : 0;
  assert.equal(stackLen, 0);
});

// ─── maybePopTopFrame tests (D-11 dual condition) ─────────────────────────

test('maybePopTopFrame: returns null if artifact mtime older than pushed_at (condition 1 fails)', () => {
  const tmp = setupTmp();
  // Create the paused_artifact file inside tmp/.planning/
  const artifactRel = 'workstreams/go-to-market/market-sizing.md';
  const artifactAbs = path.join(tmp, '.planning', artifactRel);
  fs.mkdirSync(path.dirname(artifactAbs), { recursive: true });
  fs.writeFileSync(artifactAbs, '# market sizing\n');
  // Artifact mtime = now; pushed_at = now+2 hours (future) — artifact is older.
  const frame = {
    ...VALID_FRAME,
    paused_artifact: `.planning/${artifactRel}`,
    pushed_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  };
  pushReturnFrame(tmp, frame);

  const popped = maybePopTopFrame(tmp);
  assert.equal(popped, null, 'must not pop when artifact mtime older than pushed_at');
  const brief = readBrief(tmp);
  assert.equal(brief.return_stack.length, 1);
});

test('maybePopTopFrame: returns null if align missing (condition 2 fails — no ALIGN result)', () => {
  const tmp = setupTmp();
  const artifactRel = 'workstreams/go-to-market/market-sizing.md';
  const artifactAbs = path.join(tmp, '.planning', artifactRel);
  fs.mkdirSync(path.dirname(artifactAbs), { recursive: true });
  fs.writeFileSync(artifactAbs, '# initial\n');
  // Push frame BEFORE updating artifact.
  const pushedAt = new Date().toISOString();
  const frame = {
    ...VALID_FRAME,
    paused_artifact: `.planning/${artifactRel}`,
    pushed_at: pushedAt,
  };
  pushReturnFrame(tmp, frame);

  // Now update the artifact mtime (condition 1 will pass).
  const futureMs = Date.now() + 5000;
  fs.utimesSync(artifactAbs, futureMs / 1000, futureMs / 1000);

  // state.brief.last_gate_results.align missing → condition 2 fails.
  const popped = maybePopTopFrame(tmp);
  assert.equal(popped, null, 'must not pop when ALIGN missing');
  const brief = readBrief(tmp);
  assert.equal(brief.return_stack.length, 1);
});

test('maybePopTopFrame: returns null if align.decision !== ALIGNED (condition 2 fails)', () => {
  const tmp = setupTmp();
  const artifactRel = 'workstreams/go-to-market/market-sizing.md';
  const artifactAbs = path.join(tmp, '.planning', artifactRel);
  fs.mkdirSync(path.dirname(artifactAbs), { recursive: true });
  fs.writeFileSync(artifactAbs, '# content\n');
  const pushedAt = new Date().toISOString();
  const frame = { ...VALID_FRAME, paused_artifact: `.planning/${artifactRel}`, pushed_at: pushedAt };
  pushReturnFrame(tmp, frame);

  // Mutate artifact mtime forward (condition 1 passes).
  const futureMs = Date.now() + 5000;
  fs.utimesSync(artifactAbs, futureMs / 1000, futureMs / 1000);

  // Seed DRIFTED-output-needs-revision — condition 2 fails.
  const alignAt = new Date(Date.parse(pushedAt) + 10000).toISOString();
  seedAlignResult(tmp, { decision: 'DRIFTED-output-needs-revision', at: alignAt });

  const popped = maybePopTopFrame(tmp);
  assert.equal(popped, null, 'must not pop when ALIGN decision is not ALIGNED');
});

test('maybePopTopFrame: pops when BOTH conditions hold (D-11 full dual-condition)', () => {
  const tmp = setupTmp();
  const artifactRel = 'workstreams/go-to-market/market-sizing.md';
  const artifactAbs = path.join(tmp, '.planning', artifactRel);
  fs.mkdirSync(path.dirname(artifactAbs), { recursive: true });
  fs.writeFileSync(artifactAbs, '# content\n');
  const pushedAt = new Date(Date.now() - 10000).toISOString();  // 10s ago
  const frame = { ...VALID_FRAME, paused_artifact: `.planning/${artifactRel}`, pushed_at: pushedAt };
  pushReturnFrame(tmp, frame);

  // Mutate artifact mtime forward (condition 1 passes).
  const futureMs = Date.now() + 5000;
  fs.utimesSync(artifactAbs, futureMs / 1000, futureMs / 1000);

  // Seed ALIGNED with at > pushed_at (condition 2 passes).
  const alignAt = new Date(Date.parse(pushedAt) + 5000).toISOString();
  seedAlignResult(tmp, { decision: 'ALIGNED', at: alignAt });

  const popped = maybePopTopFrame(tmp);
  assert.ok(popped, 'must pop when both D-11 conditions hold');
  assert.equal(popped.topic_fingerprint, VALID_FRAME.topic_fingerprint);

  const brief = readBrief(tmp);
  assert.equal(brief.return_stack.length, 0, 'return_stack must be empty after pop');
  assert.equal(brief.return_stack_history.length, 1, 'return_stack_history must be UNCHANGED');
});

// ─── clearReturnStackFor tests (D-08 meta-arbiter Cancel) ─────────────────

test('clearReturnStackFor: removes ALL frames with matching workstream; preserves others', () => {
  const tmp = setupTmp();
  pushReturnFrame(tmp, VALID_FRAME);         // go-to-market
  pushReturnFrame(tmp, SECOND_FRAME);        // financial
  pushReturnFrame(tmp, {
    ...VALID_FRAME,
    topic_fingerprint: 'competitor-pricing-axis-missing',
    triggering_topic: 'Competitor pricing',
  });                                        // go-to-market #2

  clearReturnStackFor(tmp, 'go-to-market');

  const brief = readBrief(tmp);
  assert.equal(brief.return_stack.length, 1, 'only financial frame should remain');
  assert.equal(brief.return_stack[0].paused_workstream, 'financial');
  assert.equal(brief.return_stack_history.length, 3, 'return_stack_history is append-only — UNCHANGED');
  assert.equal(brief.workstream_status['go-to-market'], 'cancelled-after-loop');
});

// ─── appendGapQueue tests (D-03 MATERIAL routing) ─────────────────────────

test('appendGapQueue: appends entry with auto-filled detected_at ISO timestamp', () => {
  const tmp = setupTmp();
  appendGapQueue(tmp, {
    workstream: 'go-to-market',
    artifact: '.planning/workstreams/go-to-market/business-model.md',
    gap_text: 'obligations needing further work: axis detail',
    topic_fingerprint: 'pricing-axis-missing-detail',
  });
  const brief = readBrief(tmp);
  assert.ok(Array.isArray(brief.gap_queue));
  assert.equal(brief.gap_queue.length, 1);
  const entry = brief.gap_queue[0];
  assert.equal(entry.workstream, 'go-to-market');
  assert.equal(entry.topic_fingerprint, 'pricing-axis-missing-detail');
  assert.ok(entry.detected_at);
  assert.ok(!Number.isNaN(Date.parse(entry.detected_at)), 'detected_at must be a valid ISO string');
});

test('appendGapQueue: rejects missing required fields', () => {
  const tmp = setupTmp();
  assert.throws(
    () => appendGapQueue(tmp, { workstream: 'ws', artifact: 'x', gap_text: 'g' }),  // no topic_fingerprint
    /topic_fingerprint missing/,
  );
});

// ─── writeAssumption tests (D-08 meta-arbiter "Proceed with assumption") ──

test('writeAssumption: sanitizes justification and appends to OBJECTIVES.md#Assumptions + state log', () => {
  const tmp = setupTmp();
  const result = writeAssumption(tmp, {
    justification: 'Confirmed with pilot customer that TAM bracketing is acceptable for v1 launch decision.',
    topic_fingerprint: 'market-sizing-korea-fintech-tam',
    workstream: 'go-to-market',
  });
  assert.ok(result.at, 'at timestamp must be returned');

  // OBJECTIVES.md contains ## Assumptions + the bullet
  const obj = fs.readFileSync(path.join(tmp, '.planning', 'OBJECTIVES.md'), 'utf-8');
  assert.match(obj, /## Assumptions/);
  assert.match(obj, /market-sizing-korea-fintech-tam/);
  assert.match(obj, /Confirmed with pilot customer/);

  // State log has the entry
  const brief = readBrief(tmp);
  const log = brief.last_gate_results
    && brief.last_gate_results.gap_detect
    && brief.last_gate_results.gap_detect.assumption_log;
  assert.ok(Array.isArray(log), 'assumption_log must be an array');
  assert.equal(log.length, 1);
  assert.equal(log[0].workstream, 'go-to-market');
  assert.equal(log[0].topic_fingerprint, 'market-sizing-korea-fintech-tam');
});

test('writeAssumption: rejects justification < 20 non-whitespace chars (D-08 validator floor)', () => {
  const tmp = setupTmp();
  assert.throws(
    () => writeAssumption(tmp, {
      justification: 'yeah',  // 4 chars
      topic_fingerprint: 'a-b-c',
      workstream: 'ws',
    }),
    />=20 non-whitespace/,
  );
});

test('writeAssumption: rejects justification padded with whitespace to meet 20 char length', () => {
  const tmp = setupTmp();
  const paddedShort = 'yeah' + ' '.repeat(50);  // 4 non-ws chars + tons of whitespace
  assert.throws(
    () => writeAssumption(tmp, {
      justification: paddedShort,
      topic_fingerprint: 'a-b-c',
      workstream: 'ws',
    }),
    />=20 non-whitespace/,
  );
});

// ─── State round-trip via brief-tools.cjs state json (Phase 2 D-21) ───────

test('state.brief.return_stack + return_stack_history round-trip via `brief-tools.cjs state json`', () => {
  const tmp = setupTmp();
  pushReturnFrame(tmp, VALID_FRAME);
  pushReturnFrame(tmp, SECOND_FRAME);

  // Invoke the CLI and parse the JSON output.
  const raw = execSync(`node "${BRIEF_TOOLS_CJS}" state json`, {
    cwd: tmp,
    encoding: 'utf-8',
  });
  const parsed = JSON.parse(raw);
  assert.ok(parsed.brief, 'brief namespace must survive state json rebuild');
  assert.ok(Array.isArray(parsed.brief.return_stack), 'return_stack must survive rebuild');
  assert.ok(Array.isArray(parsed.brief.return_stack_history), 'return_stack_history must survive rebuild');
  assert.equal(parsed.brief.return_stack.length, 2);
  assert.equal(parsed.brief.return_stack_history.length, 2);
  // Spot-check frame fields round-trip.
  assert.equal(parsed.brief.return_stack_history[0].topic_fingerprint, VALID_FRAME.topic_fingerprint);
  assert.equal(parsed.brief.return_stack_history[1].topic_fingerprint, SECOND_FRAME.topic_fingerprint);
});
