'use strict';

/**
 * Wave 0 RED fixture for HRD-03 / C-D03 — inline two-row DP Levenshtein
 * + suggestTopK (distance ≤ 3 threshold).
 *
 * Asserts the DP correctness contract (exact match → 0, one-edit → 1) plus
 * the documented define↔design distance-2 collision (Pitfall 3).
 *
 * RED-state contract: brief/bin/lib/help.cjs is created in Plan 02. Until
 * then, every test skips with a Plan-02 rationale. A1 invariant: built-ins
 * only — NO `fast-levenshtein`, NO `js-levenshtein`, NO `commander`.
 *
 * Pattern source: 09-PATTERNS.md lines 471-503 (verbatim shape) +
 * 09-RESEARCH.md lines 333-378 (reference DP impl that Plan 02 must match).
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// LOCKED_12 — byte-identical to 09-00-PLAN.md <interfaces> block (A-D01).
// Used as the candidate set for suggestTopK assertions.
const LOCKED_12 = [
  'define', 'discover', 'design', 'add-workstream',
  'deliver', 'export', 'status', 'help',
  'init', 'progress', 'undo', 'pause-work',
];

let helpAvailable = false;
let help = null;
try {
  help = require(path.join(ROOT, 'brief', 'bin', 'lib', 'help.cjs'));
  helpAvailable = true;
} catch (_e) {
  // Plan 02 has not yet created brief/bin/lib/help.cjs — fixture stays RED.
}

describe('Levenshtein top-3 typo suggestion (HRD-03 / C-D03)', () => {
  test('exact match → distance 0', (t) => {
    if (!helpAvailable) {
      t.skip('blocked: brief/bin/lib/help.cjs not yet created (Plan 02)');
      return;
    }
    assert.strictEqual(help.levenshtein('define', 'define'), 0);
  });

  test('one-edit → distance 1', (t) => {
    if (!helpAvailable) {
      t.skip('blocked: brief/bin/lib/help.cjs not yet created (Plan 02)');
      return;
    }
    assert.strictEqual(help.levenshtein('define', 'defin'), 1, 'deletion at end → 1');
    assert.strictEqual(help.levenshtein('define', 'desine'), 1, 'substitution f→s → 1');
  });

  test('define ↔ design known collision (Pitfall 3 documented)', (t) => {
    if (!helpAvailable) {
      t.skip('blocked: brief/bin/lib/help.cjs not yet created (Plan 02)');
      return;
    }
    // Pitfall 3: define and design differ by 2 characters (f→s, e→g) — DP must
    // return 2, and suggestTopK MUST return BOTH within the k=3 / threshold=3
    // window so the user disambiguates rather than silently picking one.
    assert.strictEqual(help.levenshtein('define', 'design'), 2);
  });

  test('suggestTopK returns ≤3 results below distance threshold (sorted ascending)', (t) => {
    if (!helpAvailable) {
      t.skip('blocked: brief/bin/lib/help.cjs not yet created (Plan 02)');
      return;
    }
    const out = help.suggestTopK('defone', LOCKED_12, 3, 3);
    assert.ok(Array.isArray(out), 'suggestTopK returns an array');
    assert.ok(out.length <= 3, `length cap: expected ≤3, got ${out.length}`);
    for (const r of out) {
      assert.ok(typeof r.distance === 'number', 'each result has numeric distance');
      assert.ok(r.distance <= 3, `each result within threshold ≤3, got ${r.distance}`);
    }
    // Ascending sort invariant.
    for (let i = 1; i < out.length; i += 1) {
      assert.ok(
        out[i - 1].distance <= out[i].distance,
        `suggestTopK output not sorted ascending at index ${i}: ${out[i - 1].distance} > ${out[i].distance}`,
      );
    }
    // The closest suggestion for 'defone' against LOCKED_12 should be define or design.
    if (out.length > 0) {
      const top = out[0].name || out[0].slug || out[0];
      assert.ok(
        top === 'define' || top === 'design',
        `closest suggestion for 'defone' should be define or design, got: ${top}`,
      );
    }
  });

  test('suggestTopK with no candidate within distance ≤3 returns empty', (t) => {
    if (!helpAvailable) {
      t.skip('blocked: brief/bin/lib/help.cjs not yet created (Plan 02)');
      return;
    }
    const out = help.suggestTopK('xyz123', ['define'], 3, 3);
    assert.deepStrictEqual(out, [], 'no in-range candidate → empty array');
  });
});
