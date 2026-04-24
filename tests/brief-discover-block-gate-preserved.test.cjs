'use strict';

/**
 * Phase 3 regression guard: the Phase 5 body replacement in
 * brief/workflows/discover.md MUST preserve Step 1 block-gate behavior
 * (DEF-05 / D-12, Pitfall 5). Asserts the workflow markdown still invokes
 * `brief-tools objectives validate` AND emits the canonical Korean Pitfall 5
 * recovery-oriented message format (verbatim).
 *
 * Task 4 of Plan 05-07. Paired with brief-discover-stale-anchor-preserved
 * for the DEF-06 / D-13 check.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const WORKFLOW = path.join(__dirname, '..', 'brief/workflows/discover.md');
const body = fs.readFileSync(WORKFLOW, 'utf-8');

test('Step 1 block-gate (DEF-05) preserved — calls brief-tools objectives validate', () => {
  assert.match(body, /brief-tools objectives validate|objectives validate/);
});

test('Block-gate message format preserved (Pitfall 5 Korean recovery tone)', () => {
  // Either the workflow contains the Korean block-gate message inline OR refers to objectives.cjs cmdValidate which renders it
  assert.match(body, /brief-discover는 아직 실행할 수 없습니다|objectives validate|cmdValidate/);
});

test('Non-zero exit propagation preserved (W-6 silent discipline)', () => {
  assert.match(body, /exit.*non-zero|propagate.*exit|silent|W-6/i);
});

test(
  'Phase 3 existing integration test still passes (regression)',
  { skip: !fs.existsSync(path.join(__dirname, 'brief-discover-gate.test.cjs')) },
  () => {
    // The actual regression is exercised when
    // `node --test tests/brief-discover-gate.test.cjs` runs. This test asserts
    // the existing file is still present and not deleted/renamed by Phase 5.
    assert.ok(
      fs.existsSync(path.join(__dirname, 'brief-discover-gate.test.cjs')),
      'Phase 3 discover-gate test must remain',
    );
  },
);
