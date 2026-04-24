/**
 * brief-gap-detect-frame-pop-requires-align.test.cjs — Plan 06-04 Task 1.
 *
 * Locks the D-11 dual-condition pop in maybePopTopFrame:
 *   1. Artifact at frame.paused_artifact has mtime > frame.pushed_at
 *   2. state.brief.last_gate_results.align.decision === 'ALIGNED' AND
 *      align.at > frame.pushed_at
 *
 * Three scenarios are exercised here as a regression-safe set in case Plan 03's
 * state-roundtrip test is later refactored:
 *   - no artifact write (cond 1 fails) → no pop
 *   - artifact write only (cond 2 fails) → no pop
 *   - artifact write AND ALIGNED → pops
 *
 * Reference: 06-04-PLAN.md Task 1 behaviors 10-12.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const {
  pushReturnFrame,
  maybePopTopFrame,
} = require('../brief/bin/lib/gap-detect.cjs');
const {
  extractFrontmatter,
  stripFrontmatter,
  reconstructFrontmatter,
} = require('../brief/bin/lib/frontmatter.cjs');

function setupTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-gap-pop-'));
  fs.mkdirSync(path.join(tmp, '.planning', 'workstreams', 'go-to-market'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: 'us' } }),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: test',
      'status: executing',
      'current_phase: "06"',
      'stopped_at: "frame-pop-requires-align test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

function readBrief(tmp) {
  const fm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  return fm.brief || {};
}

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

const VALID_FRAME_TEMPLATE = {
  paused_phase: '07',
  paused_workstream: 'go-to-market',
  paused_artifact: '.planning/workstreams/go-to-market/market-sizing.md',
  gap_text: 'TAM citation missing',
  triggering_topic: 'Korea fintech TAM',
  topic_fingerprint: 'market-sizing-korea-fintech-tam',
  // pushed_at filled per scenario
};

test('D-11 scenario A: no artifact write → maybePopTopFrame returns null and stack unchanged', () => {
  const tmp = setupTmp();
  // Note: do NOT create the artifact file. Condition 1 (artifact mtime) cannot
  // be evaluated → fall through and refuse pop.
  const frame = {
    ...VALID_FRAME_TEMPLATE,
    pushed_at: new Date().toISOString(),
  };
  pushReturnFrame(tmp, frame);

  // Even with ALIGNED seeded, condition 1 must fail because the file does not
  // exist (artifact was never written).
  seedAlignResult(tmp, {
    decision: 'ALIGNED',
    at: new Date(Date.now() + 5000).toISOString(),
  });

  const popped = maybePopTopFrame(tmp);
  assert.equal(popped, null, 'no artifact write → must not pop');
  const brief = readBrief(tmp);
  assert.equal(brief.return_stack.length, 1, 'return_stack must be unchanged');
  assert.equal(brief.return_stack_history.length, 1, 'history must be unchanged');
});

test('D-11 scenario B: artifact write only (no ALIGN) → maybePopTopFrame returns null', () => {
  const tmp = setupTmp();
  const artifactRel = 'workstreams/go-to-market/market-sizing.md';
  const artifactAbs = path.join(tmp, '.planning', artifactRel);
  fs.writeFileSync(artifactAbs, '# market sizing\n');

  const pushedAt = new Date().toISOString();
  const frame = {
    ...VALID_FRAME_TEMPLATE,
    paused_artifact: `.planning/${artifactRel}`,
    pushed_at: pushedAt,
  };
  pushReturnFrame(tmp, frame);

  // Mutate artifact mtime forward (condition 1 passes).
  const futureMs = Date.now() + 5000;
  fs.utimesSync(artifactAbs, futureMs / 1000, futureMs / 1000);

  // last_gate_results.align is undefined → condition 2 fails.
  const popped = maybePopTopFrame(tmp);
  assert.equal(popped, null, 'write-only (no ALIGN) → must not pop');
  const brief = readBrief(tmp);
  assert.equal(brief.return_stack.length, 1, 'return_stack must be unchanged');
});

test('D-11 scenario C: artifact write + ALIGNED → maybePopTopFrame returns popped frame', () => {
  const tmp = setupTmp();
  const artifactRel = 'workstreams/go-to-market/market-sizing.md';
  const artifactAbs = path.join(tmp, '.planning', artifactRel);
  fs.writeFileSync(artifactAbs, '# market sizing initial\n');

  const pushedAt = new Date(Date.now() - 10000).toISOString();  // 10s ago
  const frame = {
    ...VALID_FRAME_TEMPLATE,
    paused_artifact: `.planning/${artifactRel}`,
    pushed_at: pushedAt,
  };
  pushReturnFrame(tmp, frame);

  // Mutate artifact mtime forward (condition 1 passes).
  const futureMs = Date.now() + 5000;
  fs.utimesSync(artifactAbs, futureMs / 1000, futureMs / 1000);

  // Seed ALIGNED with at > pushed_at (condition 2 passes).
  const alignAt = new Date(Date.parse(pushedAt) + 5000).toISOString();
  seedAlignResult(tmp, { decision: 'ALIGNED', at: alignAt });

  const popped = maybePopTopFrame(tmp);
  assert.ok(popped, 'both conditions hold → must pop');
  assert.equal(popped.topic_fingerprint, frame.topic_fingerprint);

  const brief = readBrief(tmp);
  assert.equal(brief.return_stack.length, 0, 'return_stack must be empty after pop');
  assert.equal(brief.return_stack_history.length, 1, 'history is append-only — unchanged');
});

test('D-11 scenario D (negative): artifact write + DRIFTED-output → no pop', () => {
  const tmp = setupTmp();
  const artifactRel = 'workstreams/go-to-market/market-sizing.md';
  const artifactAbs = path.join(tmp, '.planning', artifactRel);
  fs.writeFileSync(artifactAbs, '# market sizing\n');

  const pushedAt = new Date(Date.now() - 10000).toISOString();
  const frame = {
    ...VALID_FRAME_TEMPLATE,
    paused_artifact: `.planning/${artifactRel}`,
    pushed_at: pushedAt,
  };
  pushReturnFrame(tmp, frame);

  const futureMs = Date.now() + 5000;
  fs.utimesSync(artifactAbs, futureMs / 1000, futureMs / 1000);

  // Seed DRIFTED-output (condition 2 fails — decision !== ALIGNED).
  const alignAt = new Date(Date.parse(pushedAt) + 5000).toISOString();
  seedAlignResult(tmp, { decision: 'DRIFTED-output-needs-revision', at: alignAt });

  const popped = maybePopTopFrame(tmp);
  assert.equal(popped, null, 'DRIFTED → must not pop');
  const brief = readBrief(tmp);
  assert.equal(brief.return_stack.length, 1);
});
