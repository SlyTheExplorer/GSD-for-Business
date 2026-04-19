/**
 * frontmatter.cjs — D-20 round-trip regression tests (FND-05 prerequisite).
 *
 * Exercises the D-03 state.brief.* schema shapes that will be written by
 * Phase 4 (ALIGN), Phase 5 (AUDIENCE), Phase 6 (Return Stack), Phase 7
 * (COMPLIANCE). The current reconstructFrontmatter drops nested maps beyond
 * 2 levels, renders objects inside arrays as the string "[object Object]",
 * and extractFrontmatter returns the string "null" for the YAML literal
 * null — all proven empirically in 02-RESEARCH.md §R-1.
 *
 * These tests MUST fail RED against the current serializer and turn GREEN
 * once reconstructFrontmatter + extractFrontmatter are extended per D-20.
 *
 * Asserting shape:
 *   - Every round-trip assertion uses assert.deepStrictEqual (not assert.ok,
 *     not JSON.stringify). JSON.stringify collapses null vs "null" drift;
 *     assert.ok passes on corrupted leaves. Both are forbidden per
 *     02-PATTERNS.md "Anti-patterns to avoid".
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  extractFrontmatter,
  reconstructFrontmatter,
} = require('../brief/bin/lib/frontmatter.cjs');

// Helper: serialize → wrap with frontmatter delimiters → re-parse
function roundTrip(obj) {
  const yaml = reconstructFrontmatter(obj);
  const wrapped = `---\n${yaml}\n---\n\n# body\n`;
  return extractFrontmatter(wrapped);
}

// ─── D-20 nested-object-at-leaf round-trip (last_gate_results.align) ────────

describe('reconstructFrontmatter D-20 nested object leaves (FND-05)', () => {
  test('3-level nested object leaf round-trips with deep-strict-equal fidelity', () => {
    const input = {
      brief: {
        last_gate_results: {
          align: {
            decision: 'ALIGNED',
            severity: 'info',
            findings_count: 0,
            at: '2026-04-18T00:00:00Z',
          },
        },
      },
    };
    const parsed = roundTrip(input);
    // The defect: current serializer emits `align: [object Object]`.
    // After the D-20 fix, align must come back as an object with 4 keys.
    assert.deepStrictEqual(parsed.brief, input.brief);
  });

  test('nested map under last_gate_results with all three gates populated', () => {
    const input = {
      brief: {
        last_gate_results: {
          align: { decision: 'ALIGNED', severity: 'info', findings_count: 0, at: '2026-04-18T00:00:00Z' },
          audience: { decision: 'PASSED', severity: 'info', findings_count: 1, at: '2026-04-18T00:00:01Z' },
          compliance: { decision: 'PASSED', severity: 'warn', findings_count: 2, at: '2026-04-18T00:00:02Z' },
        },
      },
    };
    const parsed = roundTrip(input);
    assert.deepStrictEqual(parsed.brief, input.brief);
  });
});

// ─── D-20 array-of-objects round-trip (return_stack) ────────────────────────

describe('reconstructFrontmatter D-20 array-of-objects (FND-05)', () => {
  test('return_stack array-of-objects round-trips with deep-strict-equal fidelity', () => {
    const input = {
      brief: {
        return_stack: [
          { from_phase: 'DESIGN', to_phase: 'DISCOVER', reason: 'gap', pushed_at: '2026-04-18' },
        ],
      },
    };
    const parsed = roundTrip(input);
    // The defect: current serializer emits `- [object Object]`.
    // After D-20, return_stack[0] must be an object with 4 keys,
    // not the string "[object Object]".
    assert.deepStrictEqual(parsed.brief, input.brief);
    assert.strictEqual(typeof parsed.brief.return_stack[0], 'object');
    assert.notStrictEqual(parsed.brief.return_stack[0], null);
    assert.strictEqual(parsed.brief.return_stack[0].from_phase, 'DESIGN');
  });

  test('multi-item array-of-objects (LIFO-style) round-trips', () => {
    const input = {
      brief: {
        return_stack: [
          { from_phase: 'DESIGN', to_phase: 'DISCOVER', reason: 'gap-1', pushed_at: '2026-04-18' },
          { from_phase: 'DELIVER', to_phase: 'DESIGN', reason: 'gap-2', pushed_at: '2026-04-19' },
        ],
      },
    };
    const parsed = roundTrip(input);
    assert.deepStrictEqual(parsed.brief, input.brief);
  });

  test('gap_queue array-of-objects round-trips', () => {
    const input = {
      brief: {
        gap_queue: [
          { topic: 'pricing-model', criticality: 'high', raised_at: '2026-04-18' },
          { topic: 'compliance-region', criticality: 'medium', raised_at: '2026-04-19' },
        ],
      },
    };
    const parsed = roundTrip(input);
    assert.deepStrictEqual(parsed.brief, input.brief);
  });
});

// ─── D-20 null leaf preservation (extractFrontmatter fix) ───────────────────

describe('extractFrontmatter D-20 null literal preservation (FND-05)', () => {
  test('null leaf preserves JS null (not string "null")', () => {
    const input = {
      brief: {
        current_workstream: null,
        last_gate_results: {
          align: null,
          audience: null,
          compliance: null,
        },
      },
    };
    const parsed = roundTrip(input);
    // The defect: the literal YAML `null` comes back as string "null".
    // After D-20, it must come back as JS null.
    assert.strictEqual(parsed.brief.current_workstream, null);
    assert.notStrictEqual(parsed.brief.current_workstream, 'null');
    assert.strictEqual(parsed.brief.last_gate_results.align, null);
    assert.strictEqual(parsed.brief.last_gate_results.audience, null);
    assert.strictEqual(parsed.brief.last_gate_results.compliance, null);
    assert.deepStrictEqual(parsed.brief, input.brief);
  });

  test('null coexists with non-null siblings in the same nested map', () => {
    const input = {
      brief: {
        current_workstream: null,
        last_gate_results: {
          align: { decision: 'ALIGNED', severity: 'info', findings_count: 0, at: '2026-04-18T00:00:00Z' },
          audience: null,
          compliance: null,
        },
      },
    };
    const parsed = roundTrip(input);
    assert.deepStrictEqual(parsed.brief, input.brief);
  });
});

// ─── D-20 two-cycle integrity (catches normalize-on-write loss) ─────────────

describe('reconstructFrontmatter D-20 two-cycle integrity (FND-05)', () => {
  test('full D-03 fixture round-trips across two write cycles with no drift', () => {
    // Full D-03 sampler: every schema shape declared in Phase 2 CONTEXT.md D-03.
    const input = {
      brief_state_version: '1.0',
      brief: {
        return_stack: [
          { from_phase: 'DESIGN', to_phase: 'DISCOVER', reason: 'gap', pushed_at: '2026-04-18' },
        ],
        gap_queue: [
          { topic: 'pricing-model', criticality: 'high', raised_at: '2026-04-18' },
        ],
        last_gate_results: {
          align: { decision: 'ALIGNED', severity: 'info', findings_count: 0, at: '2026-04-18T00:00:00Z' },
          audience: null,
          compliance: null,
        },
        current_workstream: null,
      },
    };
    const cycle1 = roundTrip(input);
    const cycle2 = roundTrip(cycle1);
    // Key assertion: cycle-1 output equals cycle-2 output.
    // This catches any normalization-on-write drift (R-1 empirical defect).
    assert.deepStrictEqual(cycle2, cycle1);
    // Also: cycle-1 parse equals the original (no silent data loss).
    assert.deepStrictEqual(cycle1, input);
  });

  test('empty arrays survive two write cycles', () => {
    const input = {
      brief: {
        return_stack: [],
        gap_queue: [],
        last_gate_results: {
          align: null,
          audience: null,
          compliance: null,
        },
        current_workstream: null,
      },
    };
    const cycle1 = roundTrip(input);
    const cycle2 = roundTrip(cycle1);
    assert.deepStrictEqual(cycle2, cycle1);
    assert.deepStrictEqual(cycle1.brief.return_stack, []);
    assert.deepStrictEqual(cycle1.brief.gap_queue, []);
  });
});

// ─── Regression guard: pre-existing shapes MUST stay green ──────────────────

describe('reconstructFrontmatter D-20 backward-compat regression guard', () => {
  test('flat scalars, simple string arrays, and 2-level nested maps preserved', () => {
    const input = {
      status: 'executing',
      progress: {
        total_phases: '9',
        completed_phases: '1',
      },
      tags: ['auth', 'db'],
    };
    const parsed = roundTrip(input);
    // NOTE: the inline array threshold produces `tags: [auth, db]` which
    // re-parses to the string array. Scalars come back as strings (consistent
    // with existing tests/frontmatter.test.cjs:207-213 behavior).
    assert.strictEqual(parsed.status, 'executing');
    assert.deepStrictEqual(parsed.tags, ['auth', 'db']);
    assert.deepStrictEqual(parsed.progress, { total_phases: '9', completed_phases: '1' });
  });
});
