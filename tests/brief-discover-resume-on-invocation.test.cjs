/**
 * brief-discover-resume-on-invocation.test.cjs — Plan 06-07 Task 2.
 *
 * Structural tests asserting Step 0.5 is present in brief/workflows/discover.md,
 * precedes Step 1, renders the 3-option resume AskUserQuestion (EN + Korean +
 * TEXT_MODE fallback), references state json CLI for reading return_stack,
 * covers all 9 DISCOVER category slugs in the keyword-mapping layer (Pitfall 5
 * mitigation), and preserves the Surface Cap (no new user-facing resume /
 * gap-detect / return-stack commands).
 *
 * D-10 resume auto-detection: on `/brief-discover` invocation, if
 * state.brief.return_stack.length > 0, Step 0.5 presents Resume/Start/Show
 * menu. Resume branches DIRECTLY to Step 5 (bypassing Block-gate +
 * Stale-anchor + Multi-select). Start-new keeps the frame on stack. Show-stack
 * re-asks after display.
 *
 * References:
 *   - 06-07-PLAN.md Task 2 behavior (8 assertions)
 *   - 06-CONTEXT.md D-10 resume flow shape (3 options)
 *   - 06-RESEARCH.md Pattern 7 Step 0.5 positioning rationale
 *   - 06-RESEARCH.md Pitfall 5 resume flow misroute + category mapping
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const DISCOVER = fs.readFileSync(
  path.join(ROOT, 'brief/workflows/discover.md'),
  'utf-8',
);

test('Step 0.5 exists before Step 1', () => {
  const s05 = DISCOVER.indexOf('## Step 0.5');
  const s1 = DISCOVER.indexOf('## Step 1:');
  assert.ok(s05 > 0, 'Step 0.5 heading missing');
  assert.ok(s1 > 0, 'Step 1 heading missing');
  assert.ok(s05 < s1, `Step 0.5 (idx ${s05}) must come before Step 1 (idx ${s1})`);
});

test('Step 0.5 contains 3 resume options (EN)', () => {
  const s05 = DISCOVER.indexOf('## Step 0.5');
  const s1 = DISCOVER.indexOf('## Step 1:');
  const block = DISCOVER.slice(s05, s1);
  assert.ok(block.includes('Resume'), 'Resume option missing');
  assert.ok(block.includes('Start new session'), 'Start new session option missing');
  assert.ok(block.includes('Show stack'), 'Show stack option missing');
});

test('Step 0.5 contains Korean variant options', () => {
  const s05 = DISCOVER.indexOf('## Step 0.5');
  const s1 = DISCOVER.indexOf('## Step 1:');
  const block = DISCOVER.slice(s05, s1);
  assert.ok(block.includes('재개'), 'Korean "재개" missing');
  assert.ok(block.includes('새 세션'), 'Korean "새 세션" missing');
});

test('Step 0.5 references state json CLI', () => {
  const s05 = DISCOVER.indexOf('## Step 0.5');
  const s1 = DISCOVER.indexOf('## Step 1:');
  const block = DISCOVER.slice(s05, s1);
  assert.ok(block.includes('state json'), 'state json CLI reference missing');
});

test('Step 0.5 category mapping covers all 9 DISCOVER categories', () => {
  const s05 = DISCOVER.indexOf('## Step 0.5');
  const s1 = DISCOVER.indexOf('## Step 1:');
  const block = DISCOVER.slice(s05, s1);
  const slugs = [
    'market-sizing',
    'competitor-landscape',
    'customer-research',
    'regulation-and-compliance',
    'technology-and-feasibility',
    'distribution-channels',
    'pricing-benchmarks',
    'case-studies',
    'trends-and-forecasts',
  ];
  for (const slug of slugs) {
    assert.ok(
      block.includes(slug),
      `Slug ${slug} missing from Step 0.5 category mapping`,
    );
  }
});

test('Step 0.5 TEXT_MODE fallback has numbered list', () => {
  const s05 = DISCOVER.indexOf('## Step 0.5');
  const s1 = DISCOVER.indexOf('## Step 1:');
  const block = DISCOVER.slice(s05, s1);
  assert.match(block, /\n\s*1\.\s+Resume/, 'TEXT_MODE numbered list option 1 missing');
  assert.match(block, /\n\s*2\.\s+Start/, 'TEXT_MODE numbered list option 2 missing');
  assert.match(block, /\n\s*3\.\s+Show/, 'TEXT_MODE numbered list option 3 missing');
});

test('Surface Cap: no new user-facing resume/gap-detect/return-stack command exists', () => {
  for (const f of [
    'commands/brief/resume.md',
    'commands/brief/gap-detect.md',
    'commands/brief/return-stack.md',
    'commands/brief/gap.md',
  ]) {
    const p = path.join(ROOT, f);
    assert.ok(!fs.existsSync(p), `FORBIDDEN command file present: ${f}`);
  }
});

test('Stack-depth-1 fixture reads cleanly for top frame extraction', () => {
  const fixture = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'fixtures/return-stack/stack-depth-1.json'),
      'utf-8',
    ),
  );
  const stack = fixture.return_stack;
  assert.strictEqual(stack.length, 1, 'fixture should have 1 frame');
  const top = stack[stack.length - 1];
  assert.strictEqual(top.triggering_topic, 'Korea fintech TAM');
  assert.strictEqual(top.topic_fingerprint, 'market-sizing-korea-fintech-tam');
});
