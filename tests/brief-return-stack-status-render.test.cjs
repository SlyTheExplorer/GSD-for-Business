/**
 * Phase 6 Plan 05 — Return-Stack /brief-status render tests (DSG-14 SC #3).
 *
 * Locks the contract:
 *   /brief-status renders Gap loop + Round-trips rows BELOW `Last COMPLIANCE`
 *   and ABOVE the `-`.repeat(32) divider, in the Phase 2 D-15 compact dashboard
 *   format. Existing single `Return stack    {N} / 3` line at status.cjs:110 is
 *   PRESERVED unchanged; this plan APPENDS new rows, never replaces.
 *
 * Behaviors covered (from plan task 1):
 *   1. empty state — Return stack 0/3 + Gap loop — + Round-trips —
 *   2. 1 frame — top-frame triggering_topic in Gap loop + workstream count in Round-trips
 *   3. 3 frames across 2 workstreams — both workstreams listed in Round-trips
 *   4. cross-workstream history — derived counts grouped per workstream
 *   5. missing return_stack_history key — graceful — placeholder, no throw
 *   6. malformed history entries — silently filtered, no crash
 *   8. all 7 existing rows preserved (BRIEF Status, ===, Phase, Workstream,
 *      Return stack, Last ALIGN, Last AUDIENCE, Last COMPLIANCE, divider, Next)
 *
 * The grep-audit for behavior 7 (no `round_trip_counter` stored field) lives
 * in tests/brief-return-stack-derived-count.test.cjs.
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProject, cleanup } = require('./helpers.cjs');
const { reconstructFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadFixture(name) {
  const fixturePath = path.join(__dirname, 'fixtures', 'return-stack', name);
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
}

function seedStateFromFixture(tmpDir, fixture, overrides = {}) {
  const statePath = path.join(tmpDir, '.planning', 'STATE.md');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const fm = {
    brief_state_version: '1.0',
    milestone: 'v1.0',
    milestone_name: 'milestone',
    current_phase: '06',
    status: 'executing',
    stopped_at: 'Phase 6 in flight',
    progress: { total_phases: 9, completed_phases: 5 },
    brief: {
      // Match the structure of the fixture verbatim (defensive shallow copy).
      return_stack: fixture.return_stack,
      return_stack_history: fixture.return_stack_history,
      last_gate_results: { align: null, audience: null, compliance: null },
      current_workstream: null,
      ...overrides.brief,
    },
  };
  // Allow tests to delete `return_stack_history` entirely (behavior 5).
  if (overrides.briefOmit) {
    for (const key of overrides.briefOmit) delete fm.brief[key];
  }
  const yaml = reconstructFrontmatter(fm);
  fs.writeFileSync(statePath, `---\n${yaml}\n---\n\n# Project State\n`, 'utf-8');
}

function seedRoadmap(tmpDir) {
  const roadmapPath = path.join(tmpDir, '.planning', 'ROADMAP.md');
  fs.mkdirSync(path.dirname(roadmapPath), { recursive: true });
  fs.writeFileSync(roadmapPath, [
    '# Roadmap',
    '',
    '## Roadmap v1.0',
    '',
    '### Phase 1: Foundation',
    '### Phase 2: Stable Seam',
    '### Phase 3: DEFINE Canary',
    '### Phase 4: ALIGN',
    '### Phase 5: AUDIENCE',
    '### Phase 6: Return Stack',
    '### Phase 7: COMPLIANCE',
    '### Phase 8: DELIVER',
    '### Phase 9: Hardening',
    '',
  ].join('\n'));
}

function callRender(tmpDir) {
  delete require.cache[require.resolve('../brief/bin/lib/status.cjs')];
  const { renderStatus } = require('../brief/bin/lib/status.cjs');
  const origStdoutWrite = process.stdout.write.bind(process.stdout);
  const origFsWriteSync = fs.writeSync;
  const captured = [];
  process.stdout.write = (chunk) => { captured.push(String(chunk)); return true; };
  fs.writeSync = (fd, chunk) => {
    if (fd === 1) { captured.push(String(chunk)); return Buffer.byteLength(String(chunk)); }
    return origFsWriteSync(fd, chunk);
  };
  let ret;
  try {
    ret = renderStatus(tmpDir, true);
  } finally {
    process.stdout.write = origStdoutWrite;
    fs.writeSync = origFsWriteSync;
  }
  return (typeof ret === 'string' && ret.length > 0) ? ret : captured.join('');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 6 Plan 05 — Return-Stack render in /brief-status (DSG-14 SC #3)', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = createTempProject(); });
  afterEach(() => { cleanup(tmpDir); });

  // Behavior 1: empty state ----------------------------------------------------
  test('empty return_stack + empty history renders both rows as —', () => {
    seedStateFromFixture(tmpDir, loadFixture('stack-depth-0.json'));
    seedRoadmap(tmpDir);

    const out = callRender(tmpDir);
    assert.match(out, /Return stack\s+0 \/ 3/, 'existing depth row preserved at 0');
    assert.match(out, /Gap loop\s+—/, 'Gap loop renders — when stack empty');
    assert.match(out, /Round-trips\s+—/, 'Round-trips renders — when history empty');
  });

  // Behavior 2: 1 frame --------------------------------------------------------
  test('single-frame stack renders triggering_topic in Gap loop + workstream count', () => {
    seedStateFromFixture(tmpDir, loadFixture('stack-depth-1.json'));
    seedRoadmap(tmpDir);

    const out = callRender(tmpDir);
    assert.match(out, /Return stack\s+1 \/ 3/, 'depth row updated to 1');
    assert.match(out, /Gap loop\s+Korea fintech TAM/, 'top-frame triggering_topic surfaces in Gap loop');
    assert.match(out, /Round-trips\s+go-to-market: 1/, 'workstream-grouped count rendered');
  });

  // Behavior 3: 3 frames across 2 workstreams ----------------------------------
  test('3-frame stack across 2 workstreams renders both workstreams in Round-trips', () => {
    const fixture = loadFixture('stack-depth-3.json');
    seedStateFromFixture(tmpDir, fixture);
    seedRoadmap(tmpDir);

    const out = callRender(tmpDir);
    assert.match(out, /Return stack\s+3 \/ 3/, 'depth row updated to 3');
    // Top frame in stack-depth-3 is the financial cost-drivers entry.
    const topTopic = fixture.return_stack[fixture.return_stack.length - 1].triggering_topic;
    const topRe = new RegExp('Gap loop\\s+' + topTopic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    assert.match(out, topRe, 'top-frame triggering_topic surfaces in Gap loop');
    // Both workstreams must appear in Round-trips, with their summed counts.
    assert.match(out, /go-to-market: 2/, 'go-to-market count = 2');
    assert.match(out, /financial: 1/, 'financial count = 1');
  });

  // Behavior 4: history-cross-workstream (3 pushes, empty active stack) --------
  test('cross-workstream history with empty active stack derives counts at read time', () => {
    seedStateFromFixture(tmpDir, loadFixture('history-cross-workstream.json'));
    seedRoadmap(tmpDir);

    const out = callRender(tmpDir);
    assert.match(out, /Return stack\s+0 \/ 3/, 'active stack empty');
    assert.match(out, /Gap loop\s+—/, 'no top frame → Gap loop — placeholder');
    assert.match(out, /go-to-market: 2/, 'go-to-market history count = 2');
    assert.match(out, /financial: 1/, 'financial history count = 1');
  });

  // Behavior 5: missing return_stack_history key -------------------------------
  test('missing return_stack_history key does not throw; Round-trips renders —', () => {
    seedStateFromFixture(tmpDir,
      { return_stack: [], return_stack_history: [] },
      { briefOmit: ['return_stack_history'] }
    );
    seedRoadmap(tmpDir);

    let threw = null;
    let out = '';
    try { out = callRender(tmpDir); } catch (e) { threw = e; }
    assert.strictEqual(threw, null, 'renderer must not throw on missing return_stack_history');
    assert.match(out, /Round-trips\s+—/, 'Round-trips falls back to — when key missing');
  });

  // Behavior 6: malformed history entries --------------------------------------
  test('malformed history entries (null + missing fields) are filtered without crash', () => {
    const malformed = {
      return_stack: [],
      return_stack_history: [
        null,
        { paused_workstream: 'go-to-market', topic_fingerprint: 'a-b-c' },
        { /* missing paused_workstream */ topic_fingerprint: 'x-y-z' },
        { paused_workstream: '', topic_fingerprint: 'empty-ws' },
        'not-an-object',
        { paused_workstream: 'financial', topic_fingerprint: 'd-e-f' },
      ],
    };
    seedStateFromFixture(tmpDir, malformed);
    seedRoadmap(tmpDir);

    let threw = null;
    let out = '';
    try { out = callRender(tmpDir); } catch (e) { threw = e; }
    assert.strictEqual(threw, null, 'malformed entries must not crash renderer');
    // Only the 2 valid entries (go-to-market: 1, financial: 1) should render.
    assert.match(out, /go-to-market: 1/, 'valid go-to-market entry counted');
    assert.match(out, /financial: 1/, 'valid financial entry counted');
    // Empty paused_workstream and missing field entries dropped silently.
    assert.doesNotMatch(out, /: 0/, 'no zero-count rows leak through');
  });

  // Behavior 8: existing rows preserved ----------------------------------------
  test('all existing dashboard rows preserved after extension', () => {
    seedStateFromFixture(tmpDir, loadFixture('stack-depth-1.json'));
    seedRoadmap(tmpDir);

    const out = callRender(tmpDir);
    // Existing row contract from status.cjs:105-116.
    assert.match(out, /BRIEF Status/, 'header preserved');
    assert.match(out, /={32}/, '32-char === underline preserved');
    assert.match(out, /Phase\s+0?6 of 9/, 'Phase row preserved');
    assert.match(out, /Workstream\s+— \(none active\)/, 'Workstream row preserved');
    assert.match(out, /Return stack\s+1 \/ 3/, 'Return stack single-line PRESERVED (Phase 2 Plan 04 contract)');
    assert.match(out, /Last ALIGN\s+— \(none yet\)/, 'Last ALIGN row preserved');
    assert.match(out, /Last AUDIENCE\s+— \(none yet\)/, 'Last AUDIENCE row preserved');
    assert.match(out, /Last COMPLIANCE\s+— \(none yet\)/, 'Last COMPLIANCE row preserved');
    assert.match(out, /-{32}/, '32-char --- divider preserved');
    assert.match(out, /Next:/, 'Next hint row preserved');

    // Ordering: Last COMPLIANCE → Gap loop → Round-trips → divider.
    const lastComplianceIdx = out.indexOf('Last COMPLIANCE');
    const gapLoopIdx = out.indexOf('Gap loop');
    const roundTripsIdx = out.indexOf('Round-trips');
    const dividerIdx = out.indexOf('-'.repeat(32));
    assert.ok(lastComplianceIdx > -1, 'Last COMPLIANCE present');
    assert.ok(gapLoopIdx > lastComplianceIdx, 'Gap loop AFTER Last COMPLIANCE');
    assert.ok(roundTripsIdx > gapLoopIdx, 'Round-trips AFTER Gap loop');
    assert.ok(dividerIdx > roundTripsIdx, 'divider AFTER Round-trips');
  });
});
