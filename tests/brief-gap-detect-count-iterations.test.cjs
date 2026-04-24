/**
 * brief-gap-detect-count-iterations.test.cjs — Plan 06-03 Task 1.
 *
 * Asserts countIterations is a pure function:
 *   - Returns 0 for non-array/null input
 *   - Matches on (paused_workstream, topic_fingerprint) string-equality pair
 *   - Isolates cross-workstream collisions
 *   - Filters malformed entries without throwing
 *
 * Also covers validateVerdict shape checks for Phase-6-specific extensions
 * (findings_count type + topic_fingerprint required per finding + fingerprint
 * validateFingerprint call at ingest per T-06-03-01 STRIDE mitigation).
 *
 * Reference: 06-03-PLAN.md Task 1 behaviors 1-8.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  countIterations,
  validateVerdict,
} = require('../brief/bin/lib/gap-detect.cjs');

const FIXTURE_HISTORY = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'fixtures/return-stack/history-cross-workstream.json'),
    'utf-8',
  ),
).return_stack_history;

// ─── countIterations — pure function tests ────────────────────────────────

test('countIterations: empty array returns 0', () => {
  assert.equal(countIterations([], 'go-to-market', 'market-sizing-korea-fintech-tam'), 0);
});

test('countIterations: null history returns 0', () => {
  assert.equal(countIterations(null, 'go-to-market', 'market-sizing-korea-fintech-tam'), 0);
});

test('countIterations: non-array history returns 0', () => {
  assert.equal(countIterations({}, 'go-to-market', 'market-sizing-korea-fintech-tam'), 0);
  assert.equal(countIterations('string', 'go-to-market', 'market-sizing-korea-fintech-tam'), 0);
  assert.equal(countIterations(42, 'go-to-market', 'market-sizing-korea-fintech-tam'), 0);
});

test('countIterations: go-to-market + market-sizing-korea-fintech-tam returns 2 (cross-workstream fixture)', () => {
  assert.equal(
    countIterations(FIXTURE_HISTORY, 'go-to-market', 'market-sizing-korea-fintech-tam'),
    2,
  );
});

test('countIterations: financial + financial-cost-drivers-unsourced returns 1 (cross-workstream fixture)', () => {
  assert.equal(
    countIterations(FIXTURE_HISTORY, 'financial', 'financial-cost-drivers-unsourced'),
    1,
  );
});

test('countIterations: go-to-market + financial-cost-drivers-unsourced returns 0 (cross-workstream isolation)', () => {
  // Same fingerprint present in a different workstream — must NOT count.
  assert.equal(
    countIterations(FIXTURE_HISTORY, 'go-to-market', 'financial-cost-drivers-unsourced'),
    0,
  );
});

test('countIterations: filters out null entries', () => {
  const history = [
    null,
    {
      paused_workstream: 'ws-1',
      topic_fingerprint: 'a-b-c',
    },
    undefined,
  ];
  assert.equal(countIterations(history, 'ws-1', 'a-b-c'), 1);
});

test('countIterations: filters out entries missing required fields', () => {
  const history = [
    { topic_fingerprint: 'a-b-c' }, // no paused_workstream
    { paused_workstream: 'ws-1' }, // no topic_fingerprint
    { paused_workstream: 'ws-1', topic_fingerprint: 'a-b-c' }, // valid
    { paused_workstream: 'ws-1', topic_fingerprint: 'a-b-c' }, // valid
  ];
  assert.equal(countIterations(history, 'ws-1', 'a-b-c'), 2);
});

test('countIterations: is pure — does not mutate input history array', () => {
  const history = [
    { paused_workstream: 'w', topic_fingerprint: 'a-b-c' },
    { paused_workstream: 'w', topic_fingerprint: 'x-y-z' },
  ];
  const clone = JSON.parse(JSON.stringify(history));
  countIterations(history, 'w', 'a-b-c');
  assert.deepEqual(history, clone, 'countIterations must not mutate history');
});

// ─── validateVerdict — shape + Phase-6-specific checks ────────────────────

const OK_VERDICT = {
  decision: 'GAPS-BLOCKING',
  severity: 'blocking',
  findings_count: 1,
  findings: [
    {
      severity: 'blocking',
      location: 'market-sizing.md:3',
      description: 'TAM citation missing',
      topic_fingerprint: 'market-sizing-korea-fintech-tam',
    },
  ],
  rationale: 'Missing provenance tag on TAM',
};

test('validateVerdict: valid GAPS-BLOCKING verdict returns null', () => {
  assert.equal(validateVerdict(OK_VERDICT), null);
});

test('validateVerdict: rejects non-object', () => {
  assert.equal(validateVerdict(null), 'verdict not object');
  assert.equal(validateVerdict('string'), 'verdict not object');
});

test('validateVerdict: rejects bad decision', () => {
  const v = { ...OK_VERDICT, decision: 'NOT-A-REAL-DECISION' };
  assert.match(validateVerdict(v), /bad decision/);
});

test('validateVerdict: rejects missing severity', () => {
  const v = { ...OK_VERDICT };
  delete v.severity;
  assert.match(validateVerdict(v), /bad severity/);
});

test('validateVerdict: rejects bad severity enum', () => {
  const v = { ...OK_VERDICT, severity: 'critical' };
  assert.match(validateVerdict(v), /bad severity/);
});

test('validateVerdict: rejects non-integer findings_count', () => {
  const v = { ...OK_VERDICT, findings_count: 1.5 };
  assert.match(validateVerdict(v), /findings_count/);
});

test('validateVerdict: rejects negative findings_count', () => {
  const v = { ...OK_VERDICT, findings_count: -1 };
  assert.match(validateVerdict(v), /findings_count/);
});

test('validateVerdict: rejects non-array findings', () => {
  const v = { ...OK_VERDICT, findings: 'not an array' };
  assert.match(validateVerdict(v), /findings not array/);
});

test('validateVerdict: rejects finding missing topic_fingerprint', () => {
  const v = {
    ...OK_VERDICT,
    findings: [
      {
        severity: 'blocking',
        location: 'x.md:1',
        description: 'missing fp',
        // topic_fingerprint missing — Phase-6-specific
      },
    ],
  };
  assert.match(validateVerdict(v), /topic_fingerprint/);
});

test('validateVerdict: rejects finding with invalid topic_fingerprint (T-06-03-01 mitigation)', () => {
  const v = {
    ...OK_VERDICT,
    findings: [
      {
        severity: 'blocking',
        location: 'x.md:1',
        description: 'bad fp',
        topic_fingerprint: 'Only-Two', // 2 tokens + uppercase — invalid per D-09
      },
    ],
  };
  assert.match(validateVerdict(v), /topic_fingerprint invalid/);
});

test('validateVerdict: accepts GAPS-NONE with empty findings', () => {
  const v = {
    decision: 'GAPS-NONE',
    severity: 'nice-to-have',
    findings_count: 0,
    findings: [],
    rationale: 'no gaps',
  };
  assert.equal(validateVerdict(v), null);
});

test('validateVerdict: accepts GAPS-MATERIAL-ONLY', () => {
  const v = {
    decision: 'GAPS-MATERIAL-ONLY',
    severity: 'material',
    findings_count: 1,
    findings: [
      {
        severity: 'material',
        location: 'x.md:body',
        description: 'obligations needing further work',
        topic_fingerprint: 'pricing-axis-missing-detail',
      },
    ],
    rationale: 'material-only',
  };
  assert.equal(validateVerdict(v), null);
});
