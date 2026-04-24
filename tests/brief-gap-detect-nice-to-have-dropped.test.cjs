/**
 * brief-gap-detect-nice-to-have-dropped.test.cjs — Plan 06-07 Task 2.
 *
 * Edge-case severity-routing assertion: verdict with ONLY NICE-TO-HAVE
 * findings (no BLOCKING, no MATERIAL). Asserts:
 *   - niceToHaveDropped === findings.length
 *   - queueAppended === 0 (NICE-TO-HAVE never enters gap_queue)
 *   - framePushed === false (no BLOCKING in verdict)
 *   - sibling {artifact}.gaps.md STILL written (audit trail preserved)
 *   - state.brief.gap_queue.length === 0 (nothing queued)
 *   - state.brief.return_stack.length === 0 (no push)
 *
 * Decision note (per 06-RESEARCH.md Open Question 3): any non-empty findings
 * array routes to GAPS-MATERIAL-ONLY decision (true GAPS-NONE requires
 * findings_count === 0). An all-NICE-TO-HAVE verdict thus arrives at
 * commitGapDetectVerdict with decision: 'GAPS-MATERIAL-ONLY' — the routing
 * logic then filters by severity and drops NICE-TO-HAVE.
 *
 * D-03 severity routing invariants:
 *   - BLOCKING → push frame (if pushFrame=true)
 *   - MATERIAL → append to gap_queue
 *   - NICE-TO-HAVE → DROPPED (audit in sibling; state.brief.gap_queue unchanged)
 *
 * References:
 *   - 06-07-PLAN.md Task 2 behavior 6 (NICE-TO-HAVE drop fixture)
 *   - 06-CONTEXT.md D-03 three-tier severity routing
 *   - 06-04-PLAN.md commitGapDetectVerdict signature + return shape
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const {
  commitGapDetectVerdict,
  writeVerdict,
} = require('../brief/bin/lib/gap-detect.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

function setupTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-p06-nth-'));
  fs.mkdirSync(path.join(tmp, '.planning', 'workstreams', 'go-to-market'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: 'us' } }),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'workstreams', 'go-to-market', 'market-sizing.md'),
    '# Market Sizing\n',
    'utf-8',
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
    ].join('\n'),
    'utf-8',
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: test',
      'status: executing',
      'current_phase: "06"',
      'stopped_at: "nice-to-have drop test"',
      'brief:',
      '  return_stack: []',
      '  return_stack_history: []',
      '  gap_queue: []',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
    'utf-8',
  );
  return tmp;
}

test('NICE-TO-HAVE only verdict: zero gap_queue entries, sibling still written', () => {
  const tmp = setupTmp();
  // Construct a verdict with ONLY NICE-TO-HAVE findings.
  // Decision must be GAPS-MATERIAL-ONLY (per research §Open Question 3 — any
  // non-empty findings array routes to GAPS-MATERIAL-ONLY; true GAPS-NONE
  // requires findings_count === 0). For this edge-case test, we use
  // GAPS-MATERIAL-ONLY with all NICE-TO-HAVE to exercise the dropper.
  const verdict = {
    decision: 'GAPS-MATERIAL-ONLY',
    severity: 'nice-to-have',
    findings_count: 2,
    findings: [
      {
        severity: 'nice-to-have',
        location: 'market-sizing.md:18',
        description: 'Heading style inconsistent',
        topic_fingerprint: 'heading-style-inconsistent-minor',
      },
      {
        severity: 'nice-to-have',
        location: 'market-sizing.md:22',
        description: 'Table spacing visually off',
        topic_fingerprint: 'table-spacing-visual-minor',
      },
    ],
    rationale: 'Two polish-level NICE-TO-HAVE findings; all should be dropped per D-03.',
  };
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  writeVerdict(verdictPath, verdict);

  const res = commitGapDetectVerdict(tmp, {
    verdictPath,
    artifactPath: '.planning/workstreams/go-to-market/market-sizing.md',
    workstream: 'go-to-market',
    pushFrame: false,
  });

  assert.equal(res.framePushed, false, 'No frame should be pushed');
  assert.equal(res.queueAppended, 0, 'No MATERIAL in fixture → queueAppended=0');
  assert.equal(res.niceToHaveDropped, 2, 'Both NICE-TO-HAVE findings should be dropped');

  // Sibling file should still exist (audit trail).
  assert.ok(fs.existsSync(res.gapsPath), 'sibling .gaps.md should still be written');
  const gapsContent = fs.readFileSync(res.gapsPath, 'utf-8');
  assert.match(
    gapsContent,
    /nice_to_have:\s*2/,
    'frontmatter should record nice_to_have count = 2',
  );

  // State should NOT have any gap_queue or return_stack entries.
  const stateFm = extractFrontmatter(
    fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'),
  );
  const gapQueue = Array.isArray(stateFm.brief.gap_queue) ? stateFm.brief.gap_queue : [];
  assert.equal(gapQueue.length, 0, 'gap_queue must be empty — NICE-TO-HAVE never reaches it');
  const stack = Array.isArray(stateFm.brief.return_stack) ? stateFm.brief.return_stack : [];
  assert.equal(stack.length, 0, 'return_stack must be empty');
});
