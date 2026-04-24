/**
 * brief-gap-detect-history-immutable.test.cjs — Plan 06-03 Task 2.
 *
 * Structural guard: grep-audits brief/bin/lib/gap-detect.cjs source for any
 * occurrence of `.pop()` / `.shift()` / `.splice()` called on
 * return_stack_history. MUST return 0 matches.
 *
 * Also verifies that behaviorally:
 *   - popReturnFrame + maybePopTopFrame + clearReturnStackFor never cause
 *     return_stack_history.length to decrease
 *   - return_stack_history is append-only across a push/pop cycle
 *
 * Reference: 06-03-PLAN.md Task 2 behavior 10 + T-06-03-04 STRIDE mitigation
 * + RESEARCH Pitfall 3.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const {
  pushReturnFrame,
  popReturnFrame,
  clearReturnStackFor,
} = require('../brief/bin/lib/gap-detect.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

const GAP_DETECT_CJS = path.resolve(__dirname, '../brief/bin/lib/gap-detect.cjs');

// ─── Grep-audit: structural guard (T-06-03-04 mitigation) ─────────────────

test('gap-detect.cjs source contains ZERO occurrences of return_stack_history.pop/shift/splice', () => {
  const src = fs.readFileSync(GAP_DETECT_CJS, 'utf-8');
  const mutateRe = /return_stack_history\.(pop|shift|splice)/g;
  const matches = src.match(mutateRe) || [];
  assert.equal(matches.length, 0, `return_stack_history must be append-only; found: ${matches.join(', ')}`);
});

test('gap-detect.cjs source does NOT directly mutate return_stack_history array', () => {
  const src = fs.readFileSync(GAP_DETECT_CJS, 'utf-8');
  // No assignment to a specific index (e.g., return_stack_history[0] = ...).
  const indexedAssign = /return_stack_history\s*\[\s*\d+\s*\]\s*=/g;
  const matches = src.match(indexedAssign) || [];
  assert.equal(matches.length, 0, 'return_stack_history must not be indexed-assigned');
});

// ─── Behavioral guard: history length never decreases ─────────────────────

function setupTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-gap-hist-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
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
      'stopped_at: "history immutable test"',
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

const FRAME_A = {
  paused_phase: '07',
  paused_workstream: 'go-to-market',
  paused_artifact: '.planning/workstreams/go-to-market/market-sizing.md',
  gap_text: 'TAM citation missing',
  triggering_topic: 'Korea fintech TAM',
  topic_fingerprint: 'market-sizing-korea-fintech-tam',
  pushed_at: '2026-04-22T10:00:00.000Z',
};
const FRAME_B = {
  paused_phase: '07',
  paused_workstream: 'financial',
  paused_artifact: '.planning/workstreams/financial/driver-model.md',
  gap_text: 'Cost driver unsourced',
  triggering_topic: 'Cost drivers',
  topic_fingerprint: 'financial-cost-drivers-unsourced',
  pushed_at: '2026-04-23T12:00:00.000Z',
};

test('popReturnFrame behaviorally: history stays at 2 after push,push,pop', () => {
  const tmp = setupTmp();
  pushReturnFrame(tmp, FRAME_A);
  pushReturnFrame(tmp, FRAME_B);
  const beforePop = readBrief(tmp);
  assert.equal(beforePop.return_stack_history.length, 2);

  popReturnFrame(tmp);

  const afterPop = readBrief(tmp);
  assert.equal(afterPop.return_stack.length, 1, 'return_stack decremented');
  assert.equal(afterPop.return_stack_history.length, 2, 'return_stack_history UNCHANGED');
});

test('clearReturnStackFor behaviorally: history stays at 2 after push,push,clear', () => {
  const tmp = setupTmp();
  pushReturnFrame(tmp, FRAME_A);
  pushReturnFrame(tmp, FRAME_B);
  const beforeClear = readBrief(tmp);
  assert.equal(beforeClear.return_stack_history.length, 2);

  clearReturnStackFor(tmp, 'go-to-market');

  const afterClear = readBrief(tmp);
  assert.equal(afterClear.return_stack.length, 1, 'go-to-market cleared');
  assert.equal(afterClear.return_stack_history.length, 2, 'history UNCHANGED');
});

test('full pattern: N pushes + M pops leave history.length === N (append-only invariant)', () => {
  const tmp = setupTmp();
  pushReturnFrame(tmp, FRAME_A);
  pushReturnFrame(tmp, FRAME_B);
  pushReturnFrame(tmp, {
    ...FRAME_A,
    topic_fingerprint: 'competitor-pricing-axis-missing',
    triggering_topic: 'Competitor pricing',
    pushed_at: '2026-04-24T13:00:00.000Z',
  });
  // 3 pushes.

  popReturnFrame(tmp);
  popReturnFrame(tmp);
  popReturnFrame(tmp);
  // 3 pops — stack empty.

  const brief = readBrief(tmp);
  assert.equal(brief.return_stack.length, 0);
  assert.equal(brief.return_stack_history.length, 3, 'append-only: 3 pushes = 3 history entries');
});
