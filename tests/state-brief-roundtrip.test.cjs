/**
 * BRIEF Phase 2 — A4 smoke test (FND-05)
 *
 * Verifies STATE.md round-trips the `state.brief.*` nested map (D-03 schema)
 * without loss across:
 *   - Cycle 1: writeStateMd → extractFrontmatter (in-memory to disk)
 *   - Cycle 2: disk → writeStateMd → extractFrontmatter (no-drift check)
 *   - Cycle 3: runGsdTools(['state', 'json']) — R-5 stronger test
 *              catches the cmdStateJson allowlist-drop defect (D-21)
 *   - Placeholder: all-empty D-03 fixture (Phase 2 initial state shape)
 *
 * Before Task 2 (Phase 2 Plan 02-04 allowlist extension), Cycle 3 MUST fail
 * RED — this is the intentional TDD driver for the D-21 fix.
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');
const { writeStateMd } = require('../brief/bin/lib/state.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

describe('state.brief.* round-trip (A4 verification, FND-05)', () => {
  let tmpDir;
  let statePath;

  beforeEach(() => {
    tmpDir = createTempProject();
    statePath = path.join(tmpDir, '.planning', 'STATE.md');
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('Cycle 1 — writeStateMd round-trips populated D-03 payload (array-of-objects, nested object leaf, null leaf, scalar)', () => {
    // D-03 populated fixture: one of every shape.
    const initialContent = [
      '---',
      'brief_state_version: 1.0',
      'milestone: v1.0',
      'milestone_name: milestone',
      'status: executing',
      'last_updated: "2026-04-19T00:00:00Z"',
      'last_activity: "2026-04-19 -- A4 smoke"',
      'progress:',
      '  total_phases: 9',
      '  completed_phases: 1',
      '  total_plans: 15',
      '  completed_plans: 10',
      '  percent: 67',
      'brief:',
      '  return_stack:',
      '    - from_phase: DESIGN',
      '      to_phase: DISCOVER',
      '      reason: gap_detected',
      '      pushed_at: "2026-04-18T10:00:00Z"',
      '  gap_queue:',
      '    - topic: market_sizing',
      '      criticality: MATERIAL',
      '      raised_at: "2026-04-18T10:00:00Z"',
      '  last_gate_results:',
      '    align:',
      '      decision: ALIGNED',
      '      severity: info',
      '      findings_count: 0',
      '      at: "2026-04-18T10:00:00Z"',
      '    audience: null',
      '    compliance: null',
      '  current_workstream: bmc',
      '---',
      '',
      '# Project State',
      '**Current Phase:** 02',
      '**Status:** executing',
      '',
    ].join('\n');

    writeStateMd(statePath, initialContent, tmpDir);
    const fm1 = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));

    assert.ok(fm1.brief, 'brief namespace survives cycle 1');

    // Array-of-objects
    assert.deepStrictEqual(
      fm1.brief.return_stack,
      [{
        from_phase: 'DESIGN',
        to_phase: 'DISCOVER',
        reason: 'gap_detected',
        pushed_at: '2026-04-18T10:00:00Z',
      }],
      'array-of-objects (return_stack) preserved across writeStateMd',
    );

    assert.deepStrictEqual(
      fm1.brief.gap_queue,
      [{
        topic: 'market_sizing',
        criticality: 'MATERIAL',
        raised_at: '2026-04-18T10:00:00Z',
      }],
      'array-of-objects (gap_queue) preserved',
    );

    // Nested object at leaf.
    // Per D-20 contract (documented in tests/frontmatter-roundtrip.test.cjs:20-27):
    // extractFrontmatter returns every non-array, non-null scalar as a STRING
    // — numeric findings_count round-trips as '0', not 0. D-20 preserves that
    // contract and only fixes nested-object / array-of-objects / null defects.
    assert.deepStrictEqual(
      fm1.brief.last_gate_results.align,
      {
        decision: 'ALIGNED',
        severity: 'info',
        findings_count: '0',
        at: '2026-04-18T10:00:00Z',
      },
      'nested object leaf (last_gate_results.align) preserved with all fields',
    );

    // Null leaves come back as JS null, not string "null"
    assert.strictEqual(
      fm1.brief.last_gate_results.audience,
      null,
      'null leaf (audience) stays JS null, not string "null"',
    );
    assert.strictEqual(
      fm1.brief.last_gate_results.compliance,
      null,
      'null leaf (compliance) stays JS null',
    );

    // Scalar
    assert.strictEqual(
      fm1.brief.current_workstream,
      'bmc',
      'scalar string (current_workstream) preserved',
    );
  });

  test('Cycle 2 — second writeStateMd from disk produces no drift', () => {
    // Seed same populated fixture as Cycle 1.
    const initialContent = [
      '---',
      'brief_state_version: 1.0',
      'milestone: v1.0',
      'milestone_name: milestone',
      'status: executing',
      'last_updated: "2026-04-19T00:00:00Z"',
      'last_activity: "2026-04-19 -- A4 smoke"',
      'progress:',
      '  total_phases: 9',
      '  completed_phases: 1',
      '  total_plans: 15',
      '  completed_plans: 10',
      '  percent: 67',
      'brief:',
      '  return_stack:',
      '    - from_phase: DESIGN',
      '      to_phase: DISCOVER',
      '      reason: gap_detected',
      '      pushed_at: "2026-04-18T10:00:00Z"',
      '  gap_queue:',
      '    - topic: market_sizing',
      '      criticality: MATERIAL',
      '      raised_at: "2026-04-18T10:00:00Z"',
      '  last_gate_results:',
      '    align:',
      '      decision: ALIGNED',
      '      severity: info',
      '      findings_count: 0',
      '      at: "2026-04-18T10:00:00Z"',
      '    audience: null',
      '    compliance: null',
      '  current_workstream: bmc',
      '---',
      '',
      '# Project State',
      '**Current Phase:** 02',
      '**Status:** executing',
      '',
    ].join('\n');

    writeStateMd(statePath, initialContent, tmpDir);
    const fm1 = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));

    // Cycle 2 — read from disk (literal idiom per 02-RESEARCH.md Code Examples
    // lines 568-580), then re-write through writeStateMd and re-read.
    const content1 = fs.readFileSync(statePath, 'utf-8'); writeStateMd(statePath, content1, tmpDir);
    const fm2 = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));

    assert.deepStrictEqual(
      fm2.brief,
      fm1.brief,
      'brief: map unchanged across two write cycles (no drift)',
    );
  });

  test('Cycle 3 — runGsdTools([state, json]) preserves brief: map via cmdStateJson allowlist (R-5 stronger test)', () => {
    // Seed the populated fixture, write through writeStateMd twice to simulate
    // the full read-write-read path Phase 4+ writers will exercise.
    const initialContent = [
      '---',
      'brief_state_version: 1.0',
      'milestone: v1.0',
      'milestone_name: milestone',
      'status: executing',
      'last_updated: "2026-04-19T00:00:00Z"',
      'last_activity: "2026-04-19 -- A4 smoke"',
      'progress:',
      '  total_phases: 9',
      '  completed_phases: 1',
      '  total_plans: 15',
      '  completed_plans: 10',
      '  percent: 67',
      'brief:',
      '  return_stack:',
      '    - from_phase: DESIGN',
      '      to_phase: DISCOVER',
      '      reason: gap_detected',
      '      pushed_at: "2026-04-18T10:00:00Z"',
      '  gap_queue:',
      '    - topic: market_sizing',
      '      criticality: MATERIAL',
      '      raised_at: "2026-04-18T10:00:00Z"',
      '  last_gate_results:',
      '    align:',
      '      decision: ALIGNED',
      '      severity: info',
      '      findings_count: 0',
      '      at: "2026-04-18T10:00:00Z"',
      '    audience: null',
      '    compliance: null',
      '  current_workstream: bmc',
      '---',
      '',
      '# Project State',
      '**Current Phase:** 02',
      '**Status:** executing',
      '',
    ].join('\n');

    writeStateMd(statePath, initialContent, tmpDir);
    const content1 = fs.readFileSync(statePath, 'utf-8'); writeStateMd(statePath, content1, tmpDir);

    // Cycle 3 — invoke the production CLI path. Without D-21 (cmdStateJson
    // allowlist extension), the brief: map is silently dropped on rebuild.
    const result = runGsdTools(['state', 'json'], tmpDir);
    assert.ok(result.success, `state json failed: ${result.error || result.output}`);

    const parsed = JSON.parse(result.output);

    assert.ok(
      parsed.brief,
      'brief namespace survives cmdStateJson rebuild (D-21 allowlist extension live)',
    );
    assert.strictEqual(
      parsed.brief.current_workstream,
      'bmc',
      'scalar preserved through cmdStateJson rebuild',
    );
    assert.ok(
      parsed.brief.last_gate_results && parsed.brief.last_gate_results.align,
      'nested object (last_gate_results.align) present after rebuild',
    );
    assert.strictEqual(
      parsed.brief.last_gate_results.align.decision,
      'ALIGNED',
      'nested object leaf value preserved through cmdStateJson',
    );
    assert.strictEqual(
      parsed.brief.last_gate_results.audience,
      null,
      'null leaf stays JS null through cmdStateJson rebuild',
    );
    assert.deepStrictEqual(
      parsed.brief.return_stack,
      [{
        from_phase: 'DESIGN',
        to_phase: 'DISCOVER',
        reason: 'gap_detected',
        pushed_at: '2026-04-18T10:00:00Z',
      }],
      'array-of-objects preserved through cmdStateJson rebuild',
    );
  });

  test('Placeholder — all-empty D-03 fixture (Phase 2 initial state) round-trips cleanly', () => {
    // Matches the exact placeholder shape Task 2 Edit 3 will seed into
    // .planning/STATE.md: empty arrays, null leaves, null scalar.
    const placeholderContent = [
      '---',
      'brief_state_version: 1.0',
      'milestone: v1.0',
      'milestone_name: milestone',
      'status: executing',
      'last_updated: "2026-04-19T00:00:00Z"',
      'last_activity: "2026-04-19 -- placeholder"',
      'progress:',
      '  total_phases: 9',
      '  completed_phases: 1',
      '  total_plans: 15',
      '  completed_plans: 10',
      '  percent: 67',
      'brief:',
      '  return_stack: []',
      '  gap_queue: []',
      '  last_gate_results:',
      '    align: null',
      '    audience: null',
      '    compliance: null',
      '  current_workstream: null',
      '---',
      '',
      '# Project State',
      '**Current Phase:** 02',
      '**Status:** executing',
      '',
    ].join('\n');

    writeStateMd(statePath, placeholderContent, tmpDir);
    const fm = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));

    assert.ok(fm.brief, 'brief: placeholder map survives writeStateMd');
    assert.deepStrictEqual(fm.brief.return_stack, [], 'empty return_stack stays empty array');
    assert.deepStrictEqual(fm.brief.gap_queue, [], 'empty gap_queue stays empty array');
    assert.strictEqual(fm.brief.last_gate_results.align, null, 'align placeholder stays JS null');
    assert.strictEqual(fm.brief.last_gate_results.audience, null, 'audience placeholder stays JS null');
    assert.strictEqual(fm.brief.last_gate_results.compliance, null, 'compliance placeholder stays JS null');
    assert.strictEqual(fm.brief.current_workstream, null, 'current_workstream placeholder stays JS null');
  });
});
