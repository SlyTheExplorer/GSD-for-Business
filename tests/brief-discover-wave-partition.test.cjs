/**
 * brief-discover-wave-partition.test.cjs — Phase 5 Plan 02 Task 2.
 *
 * Dedicated wave-partition algorithm test for VALIDATION.md test-id 5-02-01.
 * Per plan, the validation-map row names BOTH this file AND the parallel-smoke
 * file (tests/brief-discover-parallel-smoke.test.cjs). This file focuses
 * narrowly on the ceil(N/4) partition formula and the DSC-03 hard-cap
 * invariant — smoke/spawn-contract coverage lives in the parallel-smoke test.
 *
 * DSC-03 hard cap: every wave holds at most 4 categories. No category dropped,
 * no category duplicated across waves.
 *
 * References:
 *   - 05-02-PLAN.md Task 2
 *   - 05-VALIDATION.md row 5-02-01
 *   - 05-CONTEXT.md D-02 (wave-based queue, cap=4)
 */

const { test } = require('node:test');
const assert = require('node:assert');

// ─── Partition algorithm (D-02 authoritative) ─────────────────────────────
// Mirror of the inline algorithm in tests/brief-discover-parallel-smoke.test.cjs.
// Kept standalone so VALIDATION.md test-id 5-02-01 has a dedicated fixture.
// Plan 07 moves the final implementation to brief/bin/lib when the workflow
// consumer lands.
function partitionWaves(categories, cap = 4) {
  if (!Array.isArray(categories) || categories.length === 0) return [];
  const waves = [];
  for (let i = 0; i < categories.length; i += cap) {
    waves.push(categories.slice(i, i + cap));
  }
  return waves;
}

test('ceil(N/4) formula: N=1..12 gives expected wave counts', () => {
  const expectations = [
    [1, 1], [2, 1], [3, 1], [4, 1],
    [5, 2], [6, 2], [7, 2], [8, 2],
    [9, 3], [10, 3], [11, 3], [12, 3],
  ];
  for (const [n, expectedWaveCount] of expectations) {
    const cats = Array.from({ length: n }, (_, i) => `cat-${i}`);
    const waves = partitionWaves(cats);
    assert.equal(
      waves.length,
      expectedWaveCount,
      `N=${n} → expected ${expectedWaveCount} waves, got ${waves.length}`,
    );
  }
});

test('Every wave has ≤4 categories (DSC-03 hard cap)', () => {
  for (const n of [1, 2, 3, 4, 5, 9, 12, 20]) {
    const cats = Array.from({ length: n }, (_, i) => `cat-${i}`);
    const waves = partitionWaves(cats);
    for (const w of waves) {
      assert.ok(
        w.length <= 4,
        `N=${n} produced a wave with ${w.length} categories (>4 violates DSC-03)`,
      );
    }
  }
});

test('All categories assigned exactly once across waves (no drop, no dupe)', () => {
  const cats = [
    'market-sizing',
    'competitor-landscape',
    'customer-research',
    'regulation',
    'technology',
    'distribution',
    'pricing',
    'case-studies',
    'trends',
  ];
  const waves = partitionWaves(cats);
  const flattened = waves.flat();
  assert.equal(flattened.length, cats.length);
  assert.deepEqual(new Set(flattened), new Set(cats));
});
