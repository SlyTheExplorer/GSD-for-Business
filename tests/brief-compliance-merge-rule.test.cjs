/**
 * brief-compliance-merge-rule.test.cjs — Plan 07-01 Task 2.
 *
 * LOAD-BEARING DEVIATION TEST: Phase 7 D-01 explicitly diverges from Phase 4/5
 * merge-rule semantics. This test enforces the deviation structurally so it
 * cannot regress.
 *
 * Phase 4 ALIGN + Phase 5 AUDIENCE collapse `material + nice-to-have` findings
 * into the OK verdict (decision: ALIGNED / AUDIENCE-OK; workflow proceeds).
 * Phase 7 COMPLIANCE preserves a distinct `FINDINGS-MATERIAL` verdict because:
 *   (a) the user contract — CC-01 — explicitly requires findings (not pass/fail)
 *       to surface even on non-blocking gaps;
 *   (b) the legal-counsel disclaimer is mandatory on every `.compliance.md`,
 *       not only blocking ones, so the "transparency" path needs a verdict
 *       that triggers it.
 *
 * Reference: 07-RESEARCH.md lines 224-235; 07-01-PLAN.md Task 2 LOAD-BEARING
 * DEVIATION acceptance criterion.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const compliance = require('../brief/bin/lib/compliance.cjs');

test('mergeVerdicts material-only findings → FINDINGS-MATERIAL (NOT collapsed to COMPLIANCE-OK)', () => {
  const findings = [
    { severity: 'material', location: 'l', description: 'd' },
  ];
  const result = compliance.mergeVerdicts(findings, null);
  assert.strictEqual(
    result.decision,
    'FINDINGS-MATERIAL',
    'Phase 7 D-01 LOAD-BEARING DEVIATION: material findings MUST yield FINDINGS-MATERIAL, NOT COMPLIANCE-OK (Phase 4/5 collapse rule does NOT apply)',
  );
  assert.strictEqual(result.severity, 'material');
  assert.strictEqual(result.findings_count, 1);
});

test('mergeVerdicts multiple material findings (no blocking) → FINDINGS-MATERIAL', () => {
  const findings = [
    { severity: 'material', location: 'l1', description: 'd1' },
    { severity: 'material', location: 'l2', description: 'd2' },
    { severity: 'material', location: 'l3', description: 'd3' },
  ];
  const result = compliance.mergeVerdicts(findings, null);
  assert.strictEqual(result.decision, 'FINDINGS-MATERIAL');
  assert.strictEqual(result.findings_count, 3);
});

test('mergeVerdicts nice-to-have-only findings → COMPLIANCE-OK', () => {
  const findings = [
    { severity: 'nice-to-have', location: 'l', description: 'd' },
  ];
  const result = compliance.mergeVerdicts(findings, null);
  assert.strictEqual(result.decision, 'COMPLIANCE-OK');
  assert.strictEqual(result.severity, 'nice-to-have');
});

test('mergeVerdicts blocking findings → FINDINGS-BLOCKING', () => {
  const findings = [
    { severity: 'blocking', location: 'l', description: 'd' },
  ];
  const result = compliance.mergeVerdicts(findings, null);
  assert.strictEqual(result.decision, 'FINDINGS-BLOCKING');
  assert.strictEqual(result.severity, 'blocking');
});

test('mergeVerdicts mixed material + blocking → FINDINGS-BLOCKING (max severity wins)', () => {
  const findings = [
    { severity: 'material', location: 'l1', description: 'd1' },
    { severity: 'blocking', location: 'l2', description: 'd2' },
    { severity: 'nice-to-have', location: 'l3', description: 'd3' },
  ];
  const result = compliance.mergeVerdicts(findings, null);
  assert.strictEqual(result.decision, 'FINDINGS-BLOCKING');
  assert.strictEqual(result.severity, 'blocking');
  assert.strictEqual(result.findings_count, 3);
});

test('mergeVerdicts empty findings → COMPLIANCE-OK with nice-to-have severity', () => {
  const result = compliance.mergeVerdicts([], null);
  assert.strictEqual(result.decision, 'COMPLIANCE-OK');
  assert.strictEqual(result.severity, 'nice-to-have');
  assert.strictEqual(result.findings_count, 0);
});

test('mergeVerdicts combines deterministic + LLM findings (concat)', () => {
  const detFindings = [
    { severity: 'material', location: 'det:1', description: 'det' },
  ];
  const llmVerdict = {
    decision: 'FINDINGS-MATERIAL',
    severity: 'material',
    findings: [{ severity: 'material', location: 'llm:1', description: 'llm' }],
    rationale: 'llm pass result',
  };
  const result = compliance.mergeVerdicts(detFindings, llmVerdict);
  assert.strictEqual(result.findings_count, 2);
  assert.strictEqual(result.decision, 'FINDINGS-MATERIAL');
});

test('mergeVerdicts preserves LLM rationale when provided', () => {
  const llmVerdict = {
    decision: 'FINDINGS-MATERIAL',
    severity: 'material',
    findings: [{ severity: 'material', location: 'llm:1', description: 'llm' }],
    rationale: 'specific LLM rationale string',
  };
  const result = compliance.mergeVerdicts([], llmVerdict);
  assert.strictEqual(result.rationale, 'specific LLM rationale string');
});
