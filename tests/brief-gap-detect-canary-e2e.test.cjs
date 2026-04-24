/**
 * Phase 6 Plan 08 Task 1 — Canary E2E for gap-detect bidirectional flow.
 *
 * Exercises the full cycle in one in-process test file:
 *   push → /brief-status render → countIterations (history read) →
 *   artifact rewrite → ALIGN ALIGNED re-verdict seed → maybePopTopFrame.
 *
 * State transitions asserted end-to-end:
 *   return_stack:         []       → [frame]   → []
 *   return_stack_history: []       → [entry]   → [entry]   (append-only invariant — D-06)
 *
 * Phase 5 Plan 08 precedent: tests/brief-discover-canary-e2e.test.cjs
 * (6-test shape, in-process, no child_process, no live LLM). Phase 7
 * COMPLIANCE will copy-rename this file once the gate name swaps.
 *
 * Runtime target: <500ms (6 tests). No child_process; zero live-LLM.
 *
 * References:
 *   - 06-08-PLAN.md Task 1 (EXACT CONTENT)
 *   - 06-CONTEXT.md D-05/D-06/D-09/D-11
 *   - 06-RESEARCH.md §Pattern 10 Canary E2E + §Validation Architecture SC-3
 *   - brief/bin/lib/gap-detect.cjs (lib under test)
 *   - brief/bin/lib/status.cjs (renderStatus target for DSG-14 SC #3)
 *   - tests/brief-discover-canary-e2e.test.cjs (Phase 5 canary precedent)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const {
  pushReturnFrame,
  maybePopTopFrame,
  countIterations,
} = require('../brief/bin/lib/gap-detect.cjs');
const { renderStatus } = require('../brief/bin/lib/status.cjs');
const {
  extractFrontmatter,
  stripFrontmatter,
  reconstructFrontmatter,
} = require('../brief/bin/lib/frontmatter.cjs');

function setupCanaryTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-p06-canary-'));
  fs.mkdirSync(path.join(tmp, '.planning/workstreams/go-to-market'), { recursive: true });
  const artifactPath = path.join(
    tmp,
    '.planning/workstreams/go-to-market/market-sizing.md',
  );
  fs.writeFileSync(
    artifactPath,
    [
      '---',
      'audience:',
      '  type: internal',
      '  confidentiality: internal',
      'business_context:',
      '  model: b2b',
      'voice:',
      '  tone: formal',
      '  perspective: first-person-plural',
      '  role: planner',
      '---',
      '',
      '# Market Sizing — Korea Fintech',
      '',
      'The TAM for Korea fintech is estimated at $18.3B.',
      '',
    ].join('\n'),
    'utf-8',
  );
  fs.writeFileSync(
    path.join(tmp, '.planning/OBJECTIVES.md'),
    ['---', 'audience:', '  type: internal', '---', '', '# OBJECTIVES', ''].join('\n'),
    'utf-8',
  );
  fs.writeFileSync(
    path.join(tmp, '.planning/STATE.md'),
    [
      '---',
      'current_phase: "06"',
      'status: executing',
      'brief:',
      '  return_stack: []',
      '  return_stack_history: []',
      '  gap_queue: []',
      '---',
      '',
      '# STATE',
      '',
    ].join('\n'),
    'utf-8',
  );
  return { tmp, artifactPath };
}

function seedAlignResult(tmp, { decision, at }) {
  // Use the lib's own frontmatter round-trip (Plan 03 SUMMARY decision #2
  // pattern: regex-replace on YAML is fragile; parse + merge + write back).
  const statePath = path.join(tmp, '.planning/STATE.md');
  const content = fs.readFileSync(statePath, 'utf-8');
  const fm = extractFrontmatter(content) || {};
  if (!fm.brief || typeof fm.brief !== 'object' || Array.isArray(fm.brief)) fm.brief = {};
  if (!fm.brief.last_gate_results || typeof fm.brief.last_gate_results !== 'object') {
    fm.brief.last_gate_results = {};
  }
  fm.brief.last_gate_results.align = {
    decision,
    severity: 'nice-to-have',
    findings_count: 0,
    at,
  };
  const body = stripFrontmatter(content);
  fs.writeFileSync(
    statePath,
    `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`,
    'utf-8',
  );
}

// ─── Canary Step 1: push frame transitions state [] → [frame] ──────────

test('Canary Step 1: push frame transitions state [] → [frame] and history [] → [entry]', () => {
  const { tmp } = setupCanaryTmp();
  const pushedAt = new Date().toISOString();
  pushReturnFrame(tmp, {
    paused_phase: '07',
    paused_workstream: 'go-to-market',
    paused_artifact: '.planning/workstreams/go-to-market/market-sizing.md',
    gap_text: 'TAM citation missing',
    triggering_topic: 'Korea fintech TAM',
    topic_fingerprint: 'market-sizing-korea-fintech-tam',
    pushed_at: pushedAt,
  });
  const fm = extractFrontmatter(
    fs.readFileSync(path.join(tmp, '.planning/STATE.md'), 'utf-8'),
  );
  assert.strictEqual(
    fm.brief.return_stack.length,
    1,
    'return_stack should gain 1 entry',
  );
  assert.strictEqual(
    fm.brief.return_stack_history.length,
    1,
    'return_stack_history should gain 1 entry',
  );
  assert.strictEqual(
    fm.brief.return_stack[0].topic_fingerprint,
    'market-sizing-korea-fintech-tam',
  );
  assert.strictEqual(
    fm.brief.return_stack_history[0].topic_fingerprint,
    'market-sizing-korea-fintech-tam',
  );
});

// ─── Canary Step 2: /brief-status renders 3 new rows simultaneously ────

test('Canary Step 2: /brief-status after push renders Return stack + Gap loop + Round-trips simultaneously (DSG-11 + DSG-14 contract)', () => {
  const { tmp } = setupCanaryTmp();
  pushReturnFrame(tmp, {
    paused_phase: '07',
    paused_workstream: 'go-to-market',
    paused_artifact: '.planning/workstreams/go-to-market/market-sizing.md',
    gap_text: 'TAM citation missing',
    triggering_topic: 'Korea fintech TAM',
    topic_fingerprint: 'market-sizing-korea-fintech-tam',
    pushed_at: new Date().toISOString(),
  });
  const rendered = renderStatus(tmp, true);
  assert.match(
    rendered,
    /Return stack\s+1 \/ 3/,
    'Return stack depth row should show 1 / 3 after single push',
  );
  assert.match(
    rendered,
    /Gap loop\s+Korea fintech TAM/,
    'Gap loop row should show top-frame triggering_topic',
  );
  assert.match(
    rendered,
    /Round-trips\s+go-to-market: 1/,
    'Round-trips row should show derived count for go-to-market',
  );
});

// ─── Canary Step 3: countIterations reads history correctly ────────────

test('Canary Step 3: countIterations reads history correctly after push (iteration-2 trigger readiness)', () => {
  const { tmp } = setupCanaryTmp();
  pushReturnFrame(tmp, {
    paused_phase: '07',
    paused_workstream: 'go-to-market',
    paused_artifact: '.planning/workstreams/go-to-market/market-sizing.md',
    gap_text: 'TAM citation missing',
    triggering_topic: 'Korea fintech TAM',
    topic_fingerprint: 'market-sizing-korea-fintech-tam',
    pushed_at: new Date().toISOString(),
  });
  const fm = extractFrontmatter(
    fs.readFileSync(path.join(tmp, '.planning/STATE.md'), 'utf-8'),
  );
  const n = countIterations(
    fm.brief.return_stack_history,
    'go-to-market',
    'market-sizing-korea-fintech-tam',
  );
  assert.strictEqual(
    n,
    1,
    'After 1 push, countIterations should return 1 → next push would trigger D-08 meta-arbiter',
  );
});

// ─── Canary Step 4: artifact rewrite + ALIGN ALIGNED → maybePopTopFrame pops ─

test('Canary Step 4: artifact rewrite + ALIGN ALIGNED → maybePopTopFrame pops (D-11 dual condition)', () => {
  const { tmp, artifactPath } = setupCanaryTmp();
  const pushedAt = new Date(Date.now() - 60000).toISOString(); // 60s ago — ensures mtime > pushed_at
  pushReturnFrame(tmp, {
    paused_phase: '07',
    paused_workstream: 'go-to-market',
    paused_artifact: '.planning/workstreams/go-to-market/market-sizing.md',
    gap_text: 'TAM citation missing',
    triggering_topic: 'Korea fintech TAM',
    topic_fingerprint: 'market-sizing-korea-fintech-tam',
    pushed_at: pushedAt,
  });

  // Rewrite the artifact — mtime advances past pushedAt.
  fs.writeFileSync(
    artifactPath,
    fs.readFileSync(artifactPath, 'utf-8')
      + '\n\nTAM source: [VERIFIED:https://example.kr/fintech-tam|2026-04-24].\n',
    'utf-8',
  );
  fs.utimesSync(artifactPath, new Date(), new Date());

  // Seed state.brief.last_gate_results.align = ALIGNED at iso > pushedAt.
  const nowIso = new Date().toISOString();
  seedAlignResult(tmp, { decision: 'ALIGNED', at: nowIso });

  // Invoke maybePopTopFrame — both D-11 conditions hold.
  const popped = maybePopTopFrame(tmp);
  assert.ok(popped, 'maybePopTopFrame should return the popped frame');
  assert.strictEqual(
    popped.topic_fingerprint,
    'market-sizing-korea-fintech-tam',
    'Popped frame should match pushed fingerprint',
  );

  const fm2 = extractFrontmatter(
    fs.readFileSync(path.join(tmp, '.planning/STATE.md'), 'utf-8'),
  );
  assert.strictEqual(
    fm2.brief.return_stack.length,
    0,
    'return_stack should be emptied after pop',
  );
  assert.strictEqual(
    fm2.brief.return_stack_history.length,
    1,
    'return_stack_history MUST remain length 1 (append-only invariant — D-06)',
  );
});

// ─── Canary Step 5: full cycle state transitions end-to-end ────────────

test('Canary Step 5: full cycle state transitions — [] → [frame] → []; history [] → [entry] → [entry] (append-only D-06)', () => {
  const { tmp, artifactPath } = setupCanaryTmp();

  // Baseline.
  let fm = extractFrontmatter(
    fs.readFileSync(path.join(tmp, '.planning/STATE.md'), 'utf-8'),
  );
  assert.strictEqual(fm.brief.return_stack.length, 0, 'Baseline: return_stack empty');
  assert.strictEqual(
    fm.brief.return_stack_history.length,
    0,
    'Baseline: return_stack_history empty',
  );

  // Push.
  const pushedAt = new Date(Date.now() - 60000).toISOString();
  pushReturnFrame(tmp, {
    paused_phase: '07',
    paused_workstream: 'go-to-market',
    paused_artifact: '.planning/workstreams/go-to-market/market-sizing.md',
    gap_text: 'TAM citation missing',
    triggering_topic: 'Korea fintech TAM',
    topic_fingerprint: 'market-sizing-korea-fintech-tam',
    pushed_at: pushedAt,
  });
  fm = extractFrontmatter(
    fs.readFileSync(path.join(tmp, '.planning/STATE.md'), 'utf-8'),
  );
  assert.strictEqual(fm.brief.return_stack.length, 1, 'After push: return_stack depth 1');
  assert.strictEqual(
    fm.brief.return_stack_history.length,
    1,
    'After push: return_stack_history depth 1',
  );

  // Simulate researcher rewrite + ALIGN re-pass.
  fs.writeFileSync(
    artifactPath,
    fs.readFileSync(artifactPath, 'utf-8')
      + '\n\n[VERIFIED:https://example.kr/tam|2026-04-24]\n',
    'utf-8',
  );
  fs.utimesSync(artifactPath, new Date(), new Date());
  const nowIso = new Date().toISOString();
  seedAlignResult(tmp, { decision: 'ALIGNED', at: nowIso });

  // Pop.
  const popped = maybePopTopFrame(tmp);
  assert.ok(popped, 'maybePopTopFrame should succeed when both D-11 conditions hold');

  // Final state.
  fm = extractFrontmatter(
    fs.readFileSync(path.join(tmp, '.planning/STATE.md'), 'utf-8'),
  );
  assert.strictEqual(
    fm.brief.return_stack.length,
    0,
    'Final: return_stack empty',
  );
  assert.strictEqual(
    fm.brief.return_stack_history.length,
    1,
    'Final: return_stack_history preserves the audit entry (append-only)',
  );
  assert.strictEqual(
    fm.brief.return_stack_history[0].topic_fingerprint,
    'market-sizing-korea-fintech-tam',
    'History entry preserved verbatim across pop cycle',
  );
});

// ─── Canary Step 6: Phase 6 file manifest ──────────────────────────────

test('Canary Step 6: Phase 6 file manifest — all key artifacts present on disk', () => {
  const required = [
    'agents/brief-gap-detector.md',
    'brief/bin/lib/gap-detect.cjs',
    'brief/bin/lib/gap-detect-report.cjs',
    'brief/references/gap-detect-vocabulary.md',
    'brief/workflows/gap-detect.md',
  ];
  for (const rel of required) {
    const abs = path.join(__dirname, '..', rel);
    assert.ok(
      fs.existsSync(abs),
      `Phase 6 required artifact missing: ${rel}`,
    );
  }
});
