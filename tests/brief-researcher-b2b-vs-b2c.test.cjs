/**
 * brief-researcher-b2b-vs-b2c.test.cjs — Phase 5 Plan 02 Task 5.
 *
 * Golden-fixture comparison asserting that a B2B and a B2C researcher
 * output on the same category (Market Sizing) differ substantively per
 * D-15 B2B/B2C lens matrix (05-RESEARCH.md Q5) and both satisfy the
 * D-07 provenance discipline and D-10 AUDIENCE frontmatter schema.
 *
 * Covers VALIDATION.md test-id 5-02-04 (DSC-05 differentiated output
 * + CC-02 context-injector effect).
 *
 * Fixtures:
 *   - tests/fixtures/discover/researcher-sample-b2b-market-sizing.md
 *     (Korean, b2b, enterprise / procurement / license-seat emphasis)
 *   - tests/fixtures/discover/researcher-sample-b2c-market-sizing.md
 *     (English, b2c, viral / retention / persona / ARPU emphasis)
 *
 * References:
 *   - 05-02-PLAN.md Task 5
 *   - 05-VALIDATION.md row 5-02-04
 *   - 05-RESEARCH.md Q5 9×2 B2B/B2C lens matrix
 *   - 05-CONTEXT.md D-15 (B2B/B2C divergence in researcher prompt),
 *     CC-02 (B2B/B2C injector)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const B2B_PATH = path.join(__dirname, 'fixtures', 'discover', 'researcher-sample-b2b-market-sizing.md');
const B2C_PATH = path.join(__dirname, 'fixtures', 'discover', 'researcher-sample-b2c-market-sizing.md');

const b2b = fs.readFileSync(B2B_PATH, 'utf-8');
const b2c = fs.readFileSync(B2C_PATH, 'utf-8');

test('B2B fixture has business_context.model: b2b and Korean language', () => {
  assert.match(b2b, /model:\s*b2b/);
  assert.match(b2b, /language:\s*ko/);
});

test('B2C fixture has business_context.model: b2c and English language', () => {
  assert.match(b2c, /model:\s*b2c/);
  assert.match(b2c, /language:\s*en/);
});

test('B2B fixture emphasizes enterprise/procurement terms (per Q5 matrix)', () => {
  // D-15 B2B lens: procurement cycles, pilot → rollout, contract terms, enterprise buyer journey.
  const terms = /조달\s*주기|procurement|라이선스|pilot|contract terms|중견 기업|enterprise|SAM/i;
  assert.match(b2b, terms);
});

test('B2C fixture emphasizes consumer/viral/cohort terms (per Q5 matrix)', () => {
  const terms = /viral|retention|cohort|persona|JTBD|ARPU|penetration|app-store/i;
  assert.match(b2c, terms);
});

test('Both fixtures have provenance tags + Provenance Audit section', () => {
  for (const [name, content] of [['B2B', b2b], ['B2C', b2c]]) {
    assert.match(content, /\[VERIFIED:/, `${name}: expected at least one VERIFIED tag`);
    assert.match(content, /\[ASSUMED:/, `${name}: expected at least one ASSUMED tag`);
    assert.match(content, /## Provenance Audit/, `${name}: expected Provenance Audit section`);
  }
});

test('B2B and B2C outputs differ substantively (DSC-05 differentiation)', () => {
  // Strip to lowercase; assert distinct enterprise-vs-consumer vocabulary.
  const b2bLower = b2b.toLowerCase();
  const b2cLower = b2c.toLowerCase();
  // B2B has enterprise-flavored terms; B2C does not (or has much less emphasis).
  const b2bEnterprise = /procurement|조달|중견 기업|라이선스|pilot/.test(b2bLower);
  const b2cEnterprise = /procurement|조달|중견 기업|라이선스|pilot/.test(b2cLower);
  assert.ok(b2bEnterprise, 'B2B fixture should contain enterprise-flavored terms');
  assert.ok(!b2cEnterprise, 'B2C fixture should NOT contain enterprise-flavored terms (D-15 differentiation)');

  const b2cConsumer = /viral|retention|cohort|persona|arpu|penetration/.test(b2cLower);
  assert.ok(b2cConsumer, 'B2C fixture should contain consumer-flavored terms');
});

test('Both fixtures use the 3 mandatory audience frontmatter fields (D-10)', () => {
  for (const [name, content] of [['B2B', b2b], ['B2C', b2c]]) {
    assert.match(content, /audience:[\s\S]*?type:\s*\w+/, `${name}: audience.type required`);
    assert.match(content, /audience:[\s\S]*?confidentiality:\s*\w+/, `${name}: audience.confidentiality required`);
    assert.match(content, /business_context:[\s\S]*?model:\s*\w+/, `${name}: business_context.model required`);
  }
});
