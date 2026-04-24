/**
 * Phase 6 Plan 05 — Derived-count discipline grep-audit (D-06 enforcement).
 *
 * D-06 (Phase 6 CONTEXT.md):
 *   "Convergence telemetry derived from append-only `state.brief.return_stack_history[]`.
 *    Round-trip count per workstream = count of entries matching workstream + topic_fingerprint
 *    in history. No explicit counter to drift out of sync."
 *
 * Anti-pattern (06-RESEARCH.md line 397):
 *   "Explicit round-trip counter: D-06 rejected. Derive from return_stack_history at read time.
 *    Do NOT add state.brief.round_trip_counters[workstream] field."
 *
 * This test is a STRUCTURAL guard: if any future change introduces a stored
 * counter field anywhere in state.cjs or gap-detect.cjs, this test fails and
 * forces the planner back to the derived-count discipline.
 *
 * Behavior 7 from plan task 1.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const STATE_LIB = path.join(REPO_ROOT, 'brief', 'bin', 'lib', 'state.cjs');
const GAP_DETECT_LIB = path.join(REPO_ROOT, 'brief', 'bin', 'lib', 'gap-detect.cjs');
const STATUS_LIB = path.join(REPO_ROOT, 'brief', 'bin', 'lib', 'status.cjs');

function readSource(p) {
  if (!fs.existsSync(p)) return '';
  return fs.readFileSync(p, 'utf-8');
}

function countMatches(source, regex) {
  const matches = source.match(regex);
  return matches ? matches.length : 0;
}

describe('Phase 6 Plan 05 — Derive-at-read-time discipline (D-06 grep-audit)', () => {
  test('state.cjs contains zero occurrences of `round_trip_counter`', () => {
    const src = readSource(STATE_LIB);
    assert.ok(src.length > 0, 'state.cjs must exist for the audit to be meaningful');
    const count = countMatches(src, /round_trip_counter/g);
    assert.strictEqual(count, 0,
      `state.cjs introduced a stored round_trip_counter — D-06 forbids stored counters; ` +
      `derive from state.brief.return_stack_history at read time instead.`);
  });

  test('gap-detect.cjs contains zero occurrences of `round_trip_counter`', () => {
    const src = readSource(GAP_DETECT_LIB);
    assert.ok(src.length > 0, 'gap-detect.cjs must exist (Plan 03 ships it)');
    const count = countMatches(src, /round_trip_counter/g);
    assert.strictEqual(count, 0,
      `gap-detect.cjs introduced a stored round_trip_counter — D-06 forbids stored counters; ` +
      `iteration counting MUST go through countIterations(history, workstream, fingerprint).`);
  });

  test('status.cjs derives counts at read time (no stored counter, no I/O write paths)', () => {
    const src = readSource(STATUS_LIB);
    assert.ok(src.length > 0, 'status.cjs must exist');
    // No stored counter in the renderer either.
    assert.strictEqual(countMatches(src, /round_trip_counter/g), 0,
      'status.cjs must not reference round_trip_counter (D-06 derived discipline applies to readers too)');
    // Renderer derives via grouping — we expect at least one reference to return_stack_history
    // (read-only consumer) plus the derivation primitives.
    assert.ok(/return_stack_history/.test(src),
      'status.cjs must read return_stack_history to derive Round-trips counts');
    assert.ok(/return_stack/.test(src),
      'status.cjs must read return_stack to derive Gap loop active topic');
    // Read-only discipline (D-18): no fs.writeFileSync, no readModifyWriteStateMd.
    assert.strictEqual(countMatches(src, /writeFileSync/g), 0,
      'status.cjs must remain read-only (D-18 discipline) — no writeFileSync allowed');
    assert.strictEqual(countMatches(src, /readModifyWriteStateMd/g), 0,
      'status.cjs must not invoke any write-path API (D-18 discipline)');
  });

  test('status.cjs file size remains within Phase 2 D-18 discipline (≤180 lines)', () => {
    const src = readSource(STATUS_LIB);
    const lineCount = src.split('\n').length;
    assert.ok(lineCount <= 180,
      `status.cjs grew to ${lineCount} lines; Phase 6 Plan 05 must keep it ≤180 ` +
      `(target: 130 → ≤180; budget: ~30 added rows + derivation logic + comments).`);
  });

  test('status.cjs renders the new field labels Gap loop + Round-trips', () => {
    const src = readSource(STATUS_LIB);
    assert.ok(/Gap loop/.test(src),
      'status.cjs must render the Gap loop row label literally');
    assert.ok(/Round-trips/.test(src),
      'status.cjs must render the Round-trips row label literally');
    // The pre-existing Return stack row must remain.
    assert.ok(/Return stack/.test(src),
      'status.cjs must preserve the existing Return stack row label (Phase 2 Plan 04 contract)');
    // The pre-existing Last COMPLIANCE row must remain (Plan 05 inserts BELOW it).
    assert.ok(/Last COMPLIANCE/.test(src),
      'status.cjs must preserve the existing Last COMPLIANCE row label');
  });
});
