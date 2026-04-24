'use strict';

/**
 * Phase 3 regression guard: the Phase 5 body replacement in
 * brief/workflows/discover.md MUST preserve Step 2 stale-anchor behavior
 * (DEF-06 / D-13). Asserts the workflow markdown still invokes
 * `brief-tools objectives stale-check` AND preserves the 3-option Korean
 * AskUserQuestion + the 48h threshold + the D-13 gating semantics.
 *
 * Task 4 of Plan 05-07. Paired with brief-discover-block-gate-preserved
 * for the DEF-05 / D-12 check.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const WORKFLOW = path.join(__dirname, '..', 'brief/workflows/discover.md');
const body = fs.readFileSync(WORKFLOW, 'utf-8');

test('Step 2 stale-anchor check preserved (DEF-06) — calls brief-tools objectives stale-check', () => {
  assert.match(body, /brief-tools objectives stale-check|objectives stale-check|cmdStaleCheck/);
});

test('3-option stale-anchor interrupt preserved', () => {
  // All 3 options must survive
  assert.match(body, /잠시 검토에|\/brief-define --amend/);
  assert.match(body, /맞으면 승인|mtime 갱신|승인 후 mtime/);
  assert.match(body, /이제 승인|빠르게 진행|mtime 갱신하고 다음 단계/);
});

test('48시간 / >48h threshold mentioned', () => {
  assert.match(body, /48시간|48 hours|48h/i);
});

test('shouldStaleAnchorFire gating preserved (QUALIFYING_ENTRY_POINTS)', () => {
  // Either the workflow references shouldStaleAnchorFire explicitly OR documents the D-13 gating
  assert.match(body, /D-13|shouldStaleAnchorFire|QUALIFYING_ENTRY_POINTS|discover-entry|qualifying/i);
});
