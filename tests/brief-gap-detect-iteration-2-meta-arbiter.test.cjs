/**
 * Phase 06 Plan 06 Task 2 — Iteration-2 meta-arbiter vocabulary-lock tests.
 *
 * Locks D-08 meta-arbiter prompt against regression:
 *   - exact EN wording ("We've gone back to research for")
 *   - 3 options verbatim (Keep researching / Proceed with assumption / Cancel workstream)
 *   - 20-char justification floor documented
 *   - Korean variant present (계속 연구)
 *   - countIterations integrates correctly with the history-1-push fixture
 *
 * Vocabulary source of truth: brief/workflows/gap-detect.md Step 5.1 + D-08
 * (06-CONTEXT.md lines 67-75). If gap-detect.md drifts, this test fires.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const GAP_WORKFLOW = fs.readFileSync(
  path.join(__dirname, '..', 'brief/workflows/gap-detect.md'),
  'utf-8'
);

test("D-08 meta-arbiter prompt contains exact EN wording (We've gone back to research for)", () => {
  assert.ok(
    GAP_WORKFLOW.includes("We've gone back to research for"),
    'D-08 EN prompt wording missing — regression on 06-CONTEXT.md D-08 locked phrasing'
  );
});

test('D-08 meta-arbiter 3 options present verbatim (Keep researching / Proceed with assumption / Cancel workstream)', () => {
  assert.ok(GAP_WORKFLOW.includes('Keep researching'), 'Option 1 "Keep researching" missing');
  assert.ok(GAP_WORKFLOW.includes('Proceed with assumption'), 'Option 2 "Proceed with assumption" missing');
  assert.ok(GAP_WORKFLOW.includes('Cancel workstream'), 'Option 3 "Cancel workstream" missing');
});

test('D-08 justification ≥20 chars floor documented', () => {
  assert.match(
    GAP_WORKFLOW,
    /(20.*char|20-char|≥20|>= ?20|min.*20)/i,
    '20-char justification floor not documented — D-08 lock broken'
  );
});

test('D-08 Korean variant present when region=kr (계속 연구)', () => {
  assert.ok(
    GAP_WORKFLOW.includes('계속 연구하기') || GAP_WORKFLOW.includes('계속 연구'),
    'Korean "Keep researching" variant missing — Claude\'s Discretion D-08 i18n lock broken'
  );
});

test('countIterations integration with history-1-push fixture returns 1', () => {
  const { countIterations } = require('../brief/bin/lib/gap-detect.cjs');
  const history = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'fixtures/gap-detect/history-1-push.json'),
      'utf-8'
    )
  );
  const n = countIterations(history, 'go-to-market', 'market-sizing-korea-fintech-tam');
  assert.strictEqual(n, 1, 'history-1-push fixture should yield count 1');
});
