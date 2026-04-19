/**
 * /brief-status renderer contract tests (FND-10 / D-15..D-19)
 *
 * Tests the renderStatus(cwd, raw) pure function from brief/bin/lib/status.cjs
 * plus the dispatcher integration via brief-tools.cjs.
 *
 * Phase 2 Plan 06 — RED test file. All tests expected to FAIL until Task 2
 * ships status.cjs, commands/brief/status.md, brief/workflows/status.md,
 * and the brief-tools.cjs case 'status': dispatcher.
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function seedState(tmpDir, briefBlock, opts = {}) {
  const statePath = path.join(tmpDir, '.planning', 'STATE.md');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const currentPhase = opts.currentPhase || '02';
  const stoppedAt = opts.stoppedAt || 'Phase 2 execution in flight';
  const lines = [
    '---',
    'brief_state_version: 1.0',
    'milestone: v1.0',
    'milestone_name: milestone',
    `current_phase: ${currentPhase}`,
    'status: executing',
    `stopped_at: ${stoppedAt}`,
    'progress:',
    '  total_phases: 9',
    '  completed_phases: 1',
  ];
  if (briefBlock && briefBlock.trim().length > 0) {
    lines.push('brief:');
    for (const line of briefBlock.split('\n')) {
      if (line.length === 0) continue;
      lines.push('  ' + line);
    }
  }
  lines.push('---');
  lines.push('');
  lines.push('# Project State');
  lines.push('');
  lines.push('**Current Phase:** ' + currentPhase);
  lines.push('**Status:** executing');
  lines.push('');
  fs.writeFileSync(statePath, lines.join('\n'));
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
    '**Goal:** Foundation fork hygiene',
    '',
    '### Phase 2: Stable Seam',
    '**Goal:** Stable Seam — Anchor Schema, Caps, Workstream-as-Config',
    '',
    '### Phase 3: DEFINE Canary',
    '**Goal:** DEFINE Canary — Phase 0 End-to-End',
    '',
    '### Phase 4: ALIGN',
    '**Goal:** ALIGN gate',
    '',
    '### Phase 5: AUDIENCE',
    '**Goal:** AUDIENCE gate',
    '',
    '### Phase 6: Return Stack',
    '**Goal:** Bidirectional return stack',
    '',
    '### Phase 7: COMPLIANCE',
    '**Goal:** COMPLIANCE gate',
    '',
    '### Phase 8: DELIVER',
    '**Goal:** DELIVER type B',
    '',
    '### Phase 9: Hardening',
    '**Goal:** Hardening + v1 launch',
    '',
  ].join('\n'));
}

function callRender(tmpDir) {
  delete require.cache[require.resolve('../brief/bin/lib/status.cjs')];
  const { renderStatus } = require('../brief/bin/lib/status.cjs');
  const origStdoutWrite = process.stdout.write.bind(process.stdout);
  const origFsWriteSync = fs.writeSync;
  const captured = [];
  // status.cjs uses core.output → fs.writeSync(1, ...) for stdout.
  // Intercept both paths to capture without polluting test output.
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
  // Prefer string return (if the renderer returns the rendered string);
  // otherwise reconstruct from captured stdout.
  const output = (typeof ret === 'string' && ret.length > 0) ? ret : captured.join('');
  return output;
}

function sha(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('/brief-status renderer (FND-10, D-15..D-19)', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = createTempProject(); });
  afterEach(() => { cleanup(tmpDir); });

  test('renders compact dashboard with placeholders for empty brief: map (D-15/D-16/D-17)', () => {
    seedState(tmpDir,
      'return_stack: []\n' +
      'gap_queue: []\n' +
      'last_gate_results:\n' +
      '  align: null\n' +
      '  audience: null\n' +
      '  compliance: null\n' +
      'current_workstream: null\n'
    );
    seedRoadmap(tmpDir);

    const output = callRender(tmpDir);

    assert.match(output, /BRIEF Status/, 'header line present');
    assert.match(output, /Phase\s+0?2 of 9/, 'phase N of 9 (D-16)');
    assert.match(output, /Workstream\s+— \(none active\)/, 'workstream placeholder (D-16)');
    assert.match(output, /Return stack\s+0 \/ 3/, 'return-stack depth rendered even at 0 (D-16)');
    assert.match(output, /Last ALIGN\s+— \(none yet\)/, 'ALIGN placeholder (D-16)');
    assert.match(output, /Last COMPLIANCE\s+— \(none yet\)/, 'COMPLIANCE placeholder (D-16)');
    assert.match(output, /Next:/, 'Next hint line present (D-16)');
  });

  test('renders populated current_workstream slug (D-16)', () => {
    seedState(tmpDir,
      'return_stack: []\n' +
      'gap_queue: []\n' +
      'last_gate_results:\n' +
      '  align: null\n' +
      '  audience: null\n' +
      '  compliance: null\n' +
      'current_workstream: bmc\n'
    );
    seedRoadmap(tmpDir);

    const output = callRender(tmpDir);
    assert.match(output, /Workstream\s+bmc/, 'current_workstream slug rendered');
    assert.doesNotMatch(output, /Workstream\s+— \(none active\)/, 'placeholder not rendered when populated');
  });

  test('renders populated last_gate_results.align (D-16)', () => {
    seedState(tmpDir,
      'return_stack: []\n' +
      'gap_queue: []\n' +
      'last_gate_results:\n' +
      '  align:\n' +
      '    decision: ALIGNED\n' +
      '    severity: info\n' +
      '    findings_count: 3\n' +
      '    at: 2026-04-18T10:00:00Z\n' +
      '  audience: null\n' +
      '  compliance: null\n' +
      'current_workstream: null\n'
    );
    seedRoadmap(tmpDir);

    const output = callRender(tmpDir);
    assert.match(output, /Last ALIGN\s+ALIGNED \(3 findings\)/, 'ALIGN decision + findings_count rendered');
    assert.match(output, /Last COMPLIANCE\s+— \(none yet\)/, 'COMPLIANCE remains placeholder');
  });

  test('renders return_stack depth > 0 (D-16)', () => {
    seedState(tmpDir,
      'return_stack:\n' +
      '  - from_phase: DESIGN\n' +
      '    to_phase: DISCOVER\n' +
      '    reason: gap\n' +
      '    pushed_at: 2026-04-18\n' +
      '  - from_phase: DISCOVER\n' +
      '    to_phase: DEFINE\n' +
      '    reason: intent_clarify\n' +
      '    pushed_at: 2026-04-18\n' +
      'gap_queue: []\n' +
      'last_gate_results:\n' +
      '  align: null\n' +
      '  audience: null\n' +
      '  compliance: null\n' +
      'current_workstream: bmc\n'
    );
    seedRoadmap(tmpDir);

    const output = callRender(tmpDir);
    assert.match(output, /Return stack\s+2 \/ 3/, 'return stack depth of 2 rendered');
  });

  test('resilience — missing STATE.md emits warning line and does not throw (D-17, Pitfall 4)', () => {
    seedRoadmap(tmpDir);
    // Intentionally no STATE.md seeded.

    let threw = null;
    let output = '';
    try { output = callRender(tmpDir); } catch (e) { threw = e; }
    assert.strictEqual(threw, null, 'renderer must not throw on missing STATE.md');
    assert.match(output, /state\.brief\.\* not initialized/, 'warning line emitted');
    assert.match(output, /BRIEF Status/, 'header still rendered');
  });

  test('resilience — missing ROADMAP.md does not throw and does not emit undefined (D-17, Pitfall 4)', () => {
    seedState(tmpDir,
      'return_stack: []\n' +
      'gap_queue: []\n' +
      'last_gate_results:\n' +
      '  align: null\n' +
      '  audience: null\n' +
      '  compliance: null\n' +
      'current_workstream: null\n'
    );
    // Intentionally no ROADMAP.md seeded.

    let threw = null;
    let output = '';
    try { output = callRender(tmpDir); } catch (e) { threw = e; }
    assert.strictEqual(threw, null, 'renderer must not throw on missing ROADMAP.md');
    assert.doesNotMatch(output, /undefined/, 'no "undefined" in rendered output');
    // Either "Phase N of —" or similar fallback. Accept any string ending in " of —" in the phase slot.
    assert.match(output, /Phase\s+\S+ of —/, 'phase count falls back to — when ROADMAP missing');
  });

  test('dispatcher integration — brief-tools.cjs status prints dashboard to stdout and exits 0', () => {
    seedState(tmpDir,
      'return_stack: []\n' +
      'gap_queue: []\n' +
      'last_gate_results:\n' +
      '  align: null\n' +
      '  audience: null\n' +
      '  compliance: null\n' +
      'current_workstream: null\n'
    );
    seedRoadmap(tmpDir);

    const result = runGsdTools(['status'], tmpDir);
    assert.ok(result.success, `dispatcher failed: ${result.error || ''}`);
    assert.match(result.output, /BRIEF Status/, 'stdout contains dashboard header');
    assert.match(result.output, /Return stack\s+0 \/ 3/, 'stdout contains return stack line');
  });

  test('read-only — STATE.md SHA256 unchanged across render (D-18)', () => {
    seedState(tmpDir,
      'return_stack: []\n' +
      'gap_queue: []\n' +
      'last_gate_results:\n' +
      '  align: null\n' +
      '  audience: null\n' +
      '  compliance: null\n' +
      'current_workstream: null\n'
    );
    seedRoadmap(tmpDir);

    const statePath = path.join(tmpDir, '.planning', 'STATE.md');
    const before = sha(statePath);
    callRender(tmpDir);
    const after = sha(statePath);
    assert.strictEqual(after, before, 'STATE.md hash unchanged — renderer is read-only');
  });
});
