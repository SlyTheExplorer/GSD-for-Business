/**
 * brief-compliance-verdict.test.cjs — Plan 07-01 Task 2.
 *
 * Asserts that brief/bin/lib/compliance.cjs validateVerdict:
 *   1. Accepts valid Phase 7 verdicts (COMPLIANCE-OK / FINDINGS-MATERIAL /
 *      FINDINGS-BLOCKING).
 *   2. Rejects Phase 5 audience verdicts (AUDIENCE-OK / DRIFTED-frontmatter /
 *      DRIFTED-content) — verdict-enum swap is structural.
 *   3. Accepts CC-01 clause-level extension fields (regulation_clause /
 *      required_evidence / found_in_artifact / gap) when present, while
 *      keeping them optional.
 *
 * Reference: 07-01-PLAN.md Task 2; 07-RESEARCH.md lines 138-148.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const compliance = require('../brief/bin/lib/compliance.cjs');

test('validateVerdict accepts COMPLIANCE-OK verdict', () => {
  const v = {
    decision: 'COMPLIANCE-OK',
    severity: 'nice-to-have',
    findings_count: 0,
    findings: [],
    rationale: 'ok',
  };
  assert.strictEqual(compliance.validateVerdict(v), null);
});

test('validateVerdict accepts FINDINGS-MATERIAL verdict', () => {
  const v = {
    decision: 'FINDINGS-MATERIAL',
    severity: 'material',
    findings_count: 1,
    findings: [{ severity: 'material', location: 'L:1', description: 'gap' }],
    rationale: 'r',
  };
  assert.strictEqual(compliance.validateVerdict(v), null);
});

test('validateVerdict accepts FINDINGS-BLOCKING verdict', () => {
  const v = {
    decision: 'FINDINGS-BLOCKING',
    severity: 'blocking',
    findings_count: 1,
    findings: [{ severity: 'blocking', location: 'L:1', description: 'block' }],
    rationale: 'r',
  };
  assert.strictEqual(compliance.validateVerdict(v), null);
});

test('validateVerdict REJECTS AUDIENCE-OK verdict (Phase 5 enum leak)', () => {
  const v = {
    decision: 'AUDIENCE-OK',
    severity: 'nice-to-have',
    findings_count: 0,
    findings: [],
    rationale: 'ok',
  };
  const err = compliance.validateVerdict(v);
  assert.ok(err && err.includes('bad decision'), `expected rejection of AUDIENCE-OK, got: ${err}`);
});

test('validateVerdict REJECTS DRIFTED-frontmatter verdict (Phase 5 enum leak)', () => {
  const v = {
    decision: 'DRIFTED-frontmatter',
    severity: 'blocking',
    findings_count: 0,
    findings: [],
    rationale: 'ok',
  };
  const err = compliance.validateVerdict(v);
  assert.ok(err && err.includes('bad decision'), `expected rejection of DRIFTED-frontmatter, got: ${err}`);
});

test('validateVerdict REJECTS DRIFTED-content verdict (Phase 5 enum leak)', () => {
  const v = {
    decision: 'DRIFTED-content',
    severity: 'blocking',
    findings_count: 0,
    findings: [],
    rationale: 'ok',
  };
  const err = compliance.validateVerdict(v);
  assert.ok(err && err.includes('bad decision'), `expected rejection of DRIFTED-content, got: ${err}`);
});

test('validateVerdict accepts CC-01 clause-level extension fields when present', () => {
  const v = {
    decision: 'FINDINGS-MATERIAL',
    severity: 'material',
    findings_count: 1,
    findings: [{
      severity: 'material',
      location: 'canvas.md:Section 4',
      description: 'CPO appointment policy not cited',
      regulation_clause: 'PIPA Art. 28-8',
      required_evidence: 'Documented CPO appointment + signed independence policy',
      found_in_artifact: 'BMC Section 4 mentions CPO but no policy reference',
      gap: 'CPO-Art-31-independence policy text not cited',
    }],
    rationale: 'CC-01 clause-level finding',
  };
  assert.strictEqual(compliance.validateVerdict(v), null);
});

test('validateVerdict keeps CC-01 clause-level fields OPTIONAL (no required-fail)', () => {
  // Same as basic FINDINGS-MATERIAL — no clause-level fields. Should still pass.
  const v = {
    decision: 'FINDINGS-MATERIAL',
    severity: 'material',
    findings_count: 1,
    findings: [{ severity: 'material', location: 'L:1', description: 'gap' }],
    rationale: 'no clause-level fields — still valid',
  };
  assert.strictEqual(compliance.validateVerdict(v), null);
});

test('validateVerdict rejects CC-01 extension field with non-string type', () => {
  const v = {
    decision: 'FINDINGS-MATERIAL',
    severity: 'material',
    findings_count: 1,
    findings: [{
      severity: 'material',
      location: 'L:1',
      description: 'gap',
      regulation_clause: 12345, // wrong type
    }],
    rationale: 'r',
  };
  const err = compliance.validateVerdict(v);
  assert.ok(err && err.includes('regulation_clause'), `expected type-rejection of regulation_clause, got: ${err}`);
});

test('VALID_DECISIONS contains exactly the 3 Phase 7 verdicts', () => {
  assert.strictEqual(compliance.VALID_DECISIONS.size, 3);
  assert.ok(compliance.VALID_DECISIONS.has('COMPLIANCE-OK'));
  assert.ok(compliance.VALID_DECISIONS.has('FINDINGS-MATERIAL'));
  assert.ok(compliance.VALID_DECISIONS.has('FINDINGS-BLOCKING'));
});
