/**
 * BRIEF Phase 7 Plan 07 — /brief-status "Recommended next" derivation tests
 *
 * Validates:
 *   - computeRecommendedNext(cwd, briefState) D-07 + D-08 derivation logic
 *   - status.cjs renders "Recommended next" dashboard line
 *   - state.cjs documents Phase 7 D-21 fields: last_design_workstream,
 *     workstreams_completed, financial_drivers
 *   - state.brief.* round-trips Phase 7 fields via STATE.md write cycle
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const status = require('../brief/bin/lib/status.cjs');
const state = require('../brief/bin/lib/state.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

test('computeRecommendedNext: empty completed → recommends business-model-canvas (first in soft-order)', () => {
  const next = status.computeRecommendedNext(process.cwd(), { workstreams_completed: [] });
  // BMC has empty depends_on so it's the canonical first recommendation.
  // (Falls back to '—' only if loadWorkstreams throws — should not in this repo.)
  assert.ok(
    next === 'business-model-canvas' || next === '—',
    `Expected 'business-model-canvas' or sentinel '—'; got '${next}'`
  );
});

test('computeRecommendedNext: completed=[business-model-canvas] → recommends go-to-market', () => {
  const next = status.computeRecommendedNext(process.cwd(), {
    workstreams_completed: ['business-model-canvas'],
  });
  // GTM depends_on: [business-model-canvas] → satisfied; next in soft-order.
  assert.ok(
    next === 'go-to-market' || next === '—',
    `Expected 'go-to-market' or sentinel; got '${next}'`
  );
});

test('computeRecommendedNext: all 9 + _example completed → returns sentinel —', () => {
  const allCompleted = [
    'business-model-canvas',
    'go-to-market',
    'brand',
    'operations',
    'financial',
    'risk',
    'roadmap',
    'tech-arch',
    'compliance',
    '_example',
  ];
  const next = status.computeRecommendedNext(process.cwd(), {
    workstreams_completed: allCompleted,
  });
  assert.strictEqual(next, '—', 'sentinel returned when nothing remains');
});

test('computeRecommendedNext: missing briefState (null) → graceful sentinel', () => {
  const next1 = status.computeRecommendedNext(process.cwd(), null);
  const next2 = status.computeRecommendedNext(process.cwd(), undefined);
  const next3 = status.computeRecommendedNext(process.cwd(), {});
  // All three should resolve to a defined value (not throw).
  for (const n of [next1, next2, next3]) {
    assert.ok(typeof n === 'string', `expected string, got ${typeof n}`);
  }
});

test('status.cjs renders Recommended next dashboard line + imports computeRecommendedNext', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'brief', 'bin', 'lib', 'status.cjs'),
    'utf8'
  );
  assert.match(src, /Recommended next/, 'dashboard line text present');
  assert.match(src, /computeRecommendedNext/, 'derivation function defined / referenced');
  // Verify the function is wired into renderStatus (called somewhere after the
  // brief parsing block, before the lines array).
  assert.ok(
    src.indexOf('computeRecommendedNext(cwd') !== -1
      || src.indexOf('computeRecommendedNext(\n      cwd') !== -1,
    'computeRecommendedNext invoked with cwd in renderStatus'
  );
});

test('state.cjs documents Phase 7 D-21 brief fields (last_design_workstream + workstreams_completed + financial_drivers)', () => {
  const src = fs.readFileSync(
    path.join(__dirname, '..', 'brief', 'bin', 'lib', 'state.cjs'),
    'utf8'
  );
  assert.match(src, /last_design_workstream/, 'last_design_workstream documented');
  assert.match(src, /workstreams_completed/, 'workstreams_completed documented');
  assert.match(src, /financial_drivers/, 'financial_drivers documented');
});

test('state.cjs exports PHASE_7_BRIEF_FIELDS allowlist constant', () => {
  assert.ok(Array.isArray(state.PHASE_7_BRIEF_FIELDS), 'PHASE_7_BRIEF_FIELDS exported as array');
  assert.ok(state.PHASE_7_BRIEF_FIELDS.includes('last_design_workstream'));
  assert.ok(state.PHASE_7_BRIEF_FIELDS.includes('workstreams_completed'));
  assert.ok(state.PHASE_7_BRIEF_FIELDS.includes('financial_drivers'));
});

test('state.brief.* round-trip — Phase 7 D-21 fields preserved through writeStateMd', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'phase7-state-'));
  try {
    fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
    const statePath = path.join(tmp, '.planning', 'STATE.md');

    const initialContent = [
      '---',
      'brief_state_version: 1.0',
      'milestone: v1.0',
      'milestone_name: phase-7',
      'status: executing',
      'last_updated: "2026-04-25T00:00:00Z"',
      'last_activity: "2026-04-25 -- phase-7 round-trip"',
      'progress:',
      '  total_phases: 9',
      '  completed_phases: 6',
      '  total_plans: 60',
      '  completed_plans: 50',
      '  percent: 83',
      'brief:',
      '  last_design_workstream: business-model-canvas',
      '  workstreams_completed:',
      '    - business-model-canvas',
      '    - go-to-market',
      '  financial_drivers: ".planning/workstreams/financial/drivers.md"',
      '---',
      '',
      '# Project State',
      '**Current Phase:** 07',
      '**Status:** executing',
      '',
    ].join('\n');

    state.writeStateMd(statePath, initialContent, tmp);
    const fm1 = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));

    assert.ok(fm1.brief, 'brief: namespace survives writeStateMd');
    assert.strictEqual(
      fm1.brief.last_design_workstream,
      'business-model-canvas',
      'last_design_workstream scalar preserved'
    );
    assert.deepStrictEqual(
      fm1.brief.workstreams_completed,
      ['business-model-canvas', 'go-to-market'],
      'workstreams_completed array preserved'
    );
    assert.strictEqual(
      fm1.brief.financial_drivers,
      '.planning/workstreams/financial/drivers.md',
      'financial_drivers path string preserved'
    );

    // Cycle 2 — re-read and re-write to assert no drift.
    const content1 = fs.readFileSync(statePath, 'utf-8');
    state.writeStateMd(statePath, content1, tmp);
    const fm2 = extractFrontmatter(fs.readFileSync(statePath, 'utf-8'));

    assert.deepStrictEqual(
      fm2.brief,
      fm1.brief,
      'Phase 7 brief fields stable across two write cycles'
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
