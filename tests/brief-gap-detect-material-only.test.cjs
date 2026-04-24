/**
 * Phase 06 Plan 06 Task 2 — GAPS-MATERIAL-ONLY severity routing test.
 *
 * Locks D-03 severity routing invariants:
 *   - MATERIAL-only verdict → no frame pushed + all MATERIAL findings in gap_queue + 0 dropped
 *   - Mixed-severity verdict (1 BLOCKING + 2 MATERIAL + 1 NICE-TO-HAVE):
 *       · 1 BLOCKING pushes a frame when pushFrame=true
 *       · 2 MATERIAL route to gap_queue
 *       · 1 NICE-TO-HAVE is DROPPED (gap_queue length === 2, not 3)
 *
 * Fixture source: tests/fixtures/gap-detect/agent-return-material-only.json
 *                 tests/fixtures/gap-detect/agent-return-mixed-severity.json
 *
 * Reference: 06-CONTEXT.md D-03 + 06-06-PLAN.md Task 2 behaviors 8-9.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const { commitGapDetectVerdict, writeVerdict } = require('../brief/bin/lib/gap-detect.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

const FIXTURES = path.join(__dirname, 'fixtures', 'gap-detect');

function setupTmp(tag) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `brief-p06-${tag}-`));
  fs.mkdirSync(path.join(tmp, '.planning', 'workstreams', 'go-to-market'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: 'us' } })
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'business_model: b2b',
      'region: us',
      'audience_policy:',
      '  default: internal',
      '  permitted: [internal]',
      'compliance_packs: []',
      'status: ready',
      'immutable_items: []',
      'last_amended: "2026-04-22T00:00:00.000Z"',
      '---',
      '',
      '# OBJECTIVES',
      '',
      '## Immutable Intent',
      '',
    ].join('\n')
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: test',
      'status: executing',
      'current_phase: "06"',
      'stopped_at: "gap-detect material-only test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n')
  );
  const artifactAbsPath = path.join(
    tmp, '.planning', 'workstreams', 'go-to-market', 'market-sizing.md'
  );
  fs.writeFileSync(artifactAbsPath, '# market sizing\n\nStub.\n');
  return { tmp, artifactAbsPath };
}

test('GAPS-MATERIAL-ONLY routes all MATERIAL to gap_queue, zero NICE-TO-HAVE', () => {
  const { tmp, artifactAbsPath } = setupTmp('material-only');
  const verdict = JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'agent-return-material-only.json'), 'utf-8')
  );
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  writeVerdict(verdictPath, verdict);

  const res = commitGapDetectVerdict(tmp, {
    verdictPath,
    artifactPath: artifactAbsPath,
    workstream: 'go-to-market',
    pushFrame: false,
  });

  assert.equal(res.framePushed, false, 'No frame should be pushed on GAPS-MATERIAL-ONLY');
  assert.equal(res.queueAppended, 3, 'All 3 MATERIAL findings should route to gap_queue');
  assert.equal(
    res.niceToHaveDropped,
    0,
    'material-only fixture has 0 NICE-TO-HAVE; dropped count should be 0'
  );

  // Read state back to confirm the commitment landed as expected.
  const stateContent = fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8');
  const fm = extractFrontmatter(stateContent);
  assert.ok(
    fm && fm.brief && Array.isArray(fm.brief.gap_queue) && fm.brief.gap_queue.length === 3,
    `gap_queue expected length 3, got ${JSON.stringify(fm && fm.brief && fm.brief.gap_queue)}`
  );
  const rs = (fm && fm.brief && fm.brief.return_stack) || [];
  const rsh = (fm && fm.brief && fm.brief.return_stack_history) || [];
  assert.equal(rs.length, 0, 'return_stack should remain empty on MATERIAL-only');
  assert.equal(
    rsh.length,
    0,
    'return_stack_history should remain empty on MATERIAL-only (no push)'
  );
});

test('Mixed-severity (1 BLOCKING + 2 MATERIAL + 1 NICE-TO-HAVE) — NICE-TO-HAVE dropped', () => {
  const { tmp, artifactAbsPath } = setupTmp('mixed');
  const verdict = JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'agent-return-mixed-severity.json'), 'utf-8')
  );
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  writeVerdict(verdictPath, verdict);

  const res = commitGapDetectVerdict(tmp, {
    verdictPath,
    artifactPath: artifactAbsPath,
    workstream: 'go-to-market',
    pushFrame: true,
  });

  assert.equal(res.framePushed, true, 'BLOCKING + pushFrame=true → frame pushed');
  assert.equal(
    res.queueAppended,
    2,
    'Exactly 2 MATERIAL should route to gap_queue (not 3; NICE-TO-HAVE excluded)'
  );
  assert.equal(res.niceToHaveDropped, 1, 'Exactly 1 NICE-TO-HAVE dropped');
});
