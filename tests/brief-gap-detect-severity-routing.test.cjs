/**
 * brief-gap-detect-severity-routing.test.cjs — Plan 06-04 Task 1.
 *
 * Asserts D-03 severity routing in commitGapDetectVerdict:
 *   - BLOCKING (1+) + pushFrame=true → push 1 frame to return_stack/history
 *   - MATERIAL (N) → append N entries to gap_queue (any decision path)
 *   - NICE-TO-HAVE → DROPPED (never enters gap_queue)
 *
 * Mixed-severity fixture (1 BLOCKING + 2 MATERIAL + 1 NICE-TO-HAVE) drives
 * the canonical assertion: framePushed=true AND queueAppended=2 AND
 * niceToHaveDropped=1.
 *
 * Reference: 06-04-PLAN.md Task 1 behavior 3.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const gapDetect = require('../brief/bin/lib/gap-detect.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

const FIXTURES = path.join(__dirname, 'fixtures', 'gap-detect');

function setupTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-gap-sev-'));
  fs.mkdirSync(path.join(tmp, '.planning', 'workstreams', 'go-to-market'), { recursive: true });
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
      'stopped_at: "gap-detect severity routing test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  const artifactPath = path.join(tmp, '.planning', 'workstreams', 'go-to-market', 'market-sizing.md');
  fs.writeFileSync(artifactPath, '# market sizing\n');
  return { tmp, artifactPath };
}

test('mixed-severity fixture (1 BLOCKING + 2 MATERIAL + 1 NICE-TO-HAVE) routes correctly', () => {
  const { tmp, artifactPath } = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  const fixtureVerdict = JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'agent-return-mixed-severity.json'), 'utf-8'),
  );
  fs.writeFileSync(verdictPath, JSON.stringify(fixtureVerdict));

  const result = gapDetect.commitGapDetectVerdict(tmp, {
    verdictPath,
    artifactPath,
    workstream: 'go-to-market',
    pausedPhase: '07',
    pushFrame: true,
  });

  // Canonical mixed-severity assertion (Plan 06-04 Task 1 behavior 3 + done criteria)
  assert.equal(result.framePushed, true, 'framePushed must be true on BLOCKING + pushFrame=true');
  assert.equal(result.queueAppended, 2, '2 MATERIAL findings must be appended to gap_queue');
  assert.equal(result.niceToHaveDropped, 1, '1 NICE-TO-HAVE finding must be dropped (not queued)');

  // Verify state
  const stateFm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  // BLOCKING → 1 frame in return_stack and return_stack_history
  assert.equal(stateFm.brief.return_stack.length, 1);
  assert.equal(stateFm.brief.return_stack_history.length, 1);
  assert.equal(stateFm.brief.return_stack[0].topic_fingerprint, 'market-sizing-korea-fintech-tam');
  // MATERIAL → 2 entries in gap_queue (NICE-TO-HAVE not present)
  assert.ok(Array.isArray(stateFm.brief.gap_queue));
  assert.equal(stateFm.brief.gap_queue.length, 2, 'gap_queue must have exactly 2 MATERIAL entries');
  const fingerprints = stateFm.brief.gap_queue.map((e) => e.topic_fingerprint).sort();
  assert.deepEqual(
    fingerprints,
    ['competitor-pricing-axis-missing', 'sam-calculation-method-unexplained'].sort(),
    'gap_queue fingerprints must match the 2 MATERIAL findings (NICE-TO-HAVE dropped)',
  );
});

test('material-only fixture: 0 frames pushed, 3 MATERIAL entries appended to gap_queue', () => {
  const { tmp, artifactPath } = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  const fixtureVerdict = JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'agent-return-material-only.json'), 'utf-8'),
  );
  fs.writeFileSync(verdictPath, JSON.stringify(fixtureVerdict));

  const result = gapDetect.commitGapDetectVerdict(tmp, {
    verdictPath,
    artifactPath,
    workstream: 'go-to-market',
    pausedPhase: '07',
    pushFrame: true,  // even with pushFrame=true, no BLOCKING → no push
  });

  assert.equal(result.framePushed, false, 'no BLOCKING → no push, even with pushFrame=true');
  assert.equal(result.queueAppended, 3, 'all 3 MATERIAL findings must enter gap_queue');
  assert.equal(result.niceToHaveDropped, 0);

  const stateFm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  const stack = Array.isArray(stateFm.brief.return_stack) ? stateFm.brief.return_stack : [];
  assert.equal(stack.length, 0);
  assert.equal(stateFm.brief.gap_queue.length, 3);
});

test('blocking-only fixture: 1 frame pushed, 0 entries in gap_queue', () => {
  const { tmp, artifactPath } = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  const fixtureVerdict = JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'agent-return-blocking.json'), 'utf-8'),
  );
  fs.writeFileSync(verdictPath, JSON.stringify(fixtureVerdict));

  const result = gapDetect.commitGapDetectVerdict(tmp, {
    verdictPath,
    artifactPath,
    workstream: 'go-to-market',
    pausedPhase: '07',
    pushFrame: true,
  });

  assert.equal(result.framePushed, true);
  assert.equal(result.queueAppended, 0, 'no MATERIAL findings → gap_queue unchanged');
  assert.equal(result.niceToHaveDropped, 0);

  const stateFm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  const queue = Array.isArray(stateFm.brief.gap_queue) ? stateFm.brief.gap_queue : [];
  assert.equal(queue.length, 0);
});

test('pushFrame=false on BLOCKING: 0 frames pushed even with BLOCKING findings', () => {
  const { tmp, artifactPath } = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  const fixtureVerdict = JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'agent-return-blocking.json'), 'utf-8'),
  );
  fs.writeFileSync(verdictPath, JSON.stringify(fixtureVerdict));

  const result = gapDetect.commitGapDetectVerdict(tmp, {
    verdictPath,
    artifactPath,
    workstream: 'go-to-market',
    pushFrame: false,
  });

  assert.equal(result.framePushed, false, 'pushFrame=false → no push (caller controls iteration policy)');
  const stateFm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  const stack = Array.isArray(stateFm.brief.return_stack) ? stateFm.brief.return_stack : [];
  assert.equal(stack.length, 0);
});
