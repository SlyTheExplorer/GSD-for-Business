/**
 * brief-objectives-roundtrip.test.cjs — D-20 serializer reuse verification (Plan 03-01 / DEF-03).
 *
 * Asserts that OBJECTIVES.md-shaped frontmatter (immutable_items array + compliance_packs array
 * + scalar business_model/region/audience_policy/status + brief_objectives_version) round-trips
 * through the Phase 2 D-20 frontmatter serializer with ZERO drift.
 *
 * This file MUST import from frontmatter.cjs (not objectives.cjs) — the assertion is that
 * the EXISTING D-20 serializer handles the shape without extension. Plan 03-01 reuses,
 * does not extend.
 *
 * Shape contract: compliance_packs is the key array shape for this plan. It has 3 items
 * ('PIPA', 'ISMS-P', 'MyData') — the inline-array threshold in reconstructFrontmatter
 * is `length <= 3 && joined.length < 60`, so it emits as `[PIPA, ISMS-P, MyData]` inline.
 * Re-parsing returns ['PIPA', 'ISMS-P', 'MyData'], round-tripping correctly.
 *
 * Scalar-type contract: extractFrontmatter returns all non-array, non-null scalars as STRINGS
 * (see tests/frontmatter.test.cjs:206-213 + tests/frontmatter-roundtrip.test.cjs note).
 * The full-fixture assertion covers this via deepStrictEqual with string-valued scalars.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  extractFrontmatter,
  reconstructFrontmatter,
} = require('../brief/bin/lib/frontmatter.cjs');

// Importing objectives.cjs ensures the module loads without side-effect error. The
// primitives themselves are not exercised here — that is the immutable-lock test file's
// responsibility. This import is the Task-1 RED harness that breaks if objectives.cjs
// stops loading (e.g., a circular require or missing export).
require('../brief/bin/lib/objectives.cjs');

function roundTrip(obj) {
  const yaml = reconstructFrontmatter(obj);
  const wrapped = `---\n${yaml}\n---\n\n# body\n`;
  return extractFrontmatter(wrapped);
}

describe('OBJECTIVES.md frontmatter round-trips through D-20 serializer (FND-05 reuse)', () => {
  test('full OBJECTIVES.md frontmatter shape round-trips with zero drift', () => {
    const input = {
      brief_objectives_version: '1.0',
      status: 'ready',
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
      immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
    };
    const parsed = roundTrip(input);
    // deepStrictEqual is mandatory per 02-PATTERNS.md Anti-patterns; JSON.stringify + assert.ok
    // both forbidden because they mask null/undefined drift and object-vs-string drift.
    assert.deepStrictEqual(parsed, input);
  });

  test('OBJECTIVES.md frontmatter with populated immutable_items preserves array order', () => {
    const input = {
      brief_objectives_version: '1.0',
      status: 'in_progress',
      business_model: 'b2b',
      region: 'us',
      audience_policy: 'external',
      compliance_packs: [],
      immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
    };
    const parsed = roundTrip(input);
    assert.deepStrictEqual(parsed, input);
    // Order is load-bearing for the 🔒 marker logic in Mode B UI: items[0] is the heading key.
    assert.strictEqual(parsed.immutable_items[0], 'creator-identity');
    assert.strictEqual(parsed.immutable_items[1], 'core-value');
    assert.strictEqual(parsed.immutable_items[2], 'problem-statement');
  });

  test('empty compliance_packs survives round-trip (non-Korea fixture case)', () => {
    const input = {
      brief_objectives_version: '1.0',
      status: 'ready',
      business_model: 'b2b',
      region: 'us',
      audience_policy: 'internal',
      compliance_packs: [],
      immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
    };
    const parsed = roundTrip(input);
    assert.deepStrictEqual(parsed.compliance_packs, []);
    assert.deepStrictEqual(parsed, input);
  });
});

describe('OBJECTIVES.md two-cycle integrity (no write-normalization drift)', () => {
  test('Korea-first fixture survives two write cycles with no drift', () => {
    const input = {
      brief_objectives_version: '1.0',
      status: 'ready',
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
      immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
    };
    const cycle1 = roundTrip(input);
    const cycle2 = roundTrip(cycle1);
    assert.deepStrictEqual(cycle1, input);
    assert.deepStrictEqual(cycle2, cycle1);
  });
});
