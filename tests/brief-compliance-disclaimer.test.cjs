/**
 * brief-compliance-disclaimer.test.cjs — Plan 07-02 Task 1.
 *
 * Asserts the renderComplianceReport() output ALWAYS includes the verbatim
 * CEO-personal-liability disclaimer footer regardless of decision/severity:
 *
 *   - Korean variant when opts.korea === true
 *     (anchor: '2026년 개정 개인정보 보호법' + '총매출의 10%' + '법적 자문이 아닙니다').
 *   - English variant when opts.korea === false
 *     (anchor: '2026 PIPA amendments' + '10% of total turnover' + 'not legal advice').
 *   - Disclaimer renders on COMPLIANCE-OK + FINDINGS-MATERIAL + FINDINGS-BLOCKING
 *     (mandatory regardless of severity per CONTEXT.md D-03).
 *   - Disclaimer renders even when packs=[] (defense-in-depth: every gate output
 *     is canonical).
 *
 * Reference: 07-02-PLAN.md Task 1; 07-CONTEXT.md D-03 verbatim disclaimer lock.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const { renderComplianceReport } = require('../brief/bin/lib/compliance-report.cjs');

const _baseVerdict = (overrides) => ({
  decision: 'COMPLIANCE-OK',
  severity: 'nice-to-have',
  findings_count: 0,
  findings: [],
  rationale: 'r',
  ...overrides,
});

test('renderComplianceReport renders Korean disclaimer when opts.korea=true (COMPLIANCE-OK)', () => {
  const out = renderComplianceReport(_baseVerdict(), { korea: true, packs: ['PIPA'] });
  assert.ok(out.includes('2026년 개정 개인정보 보호법'),
    `missing Korean PIPA reference; got:\n${out.slice(-800)}`);
  assert.ok(out.includes('총매출의 10%'),
    `missing Korean penalty ceiling; got:\n${out.slice(-800)}`);
  assert.ok(out.includes('법적 자문이 아닙니다'),
    `missing Korean legal-counsel disclaimer; got:\n${out.slice(-800)}`);
  assert.ok(out.includes('대표이사'),
    `missing Korean CEO term; got:\n${out.slice(-800)}`);
});

test('renderComplianceReport renders English disclaimer when opts.korea=false (COMPLIANCE-OK)', () => {
  const out = renderComplianceReport(_baseVerdict(), { korea: false, packs: ['PIPA'] });
  assert.ok(out.includes('2026 PIPA amendments'),
    `missing English PIPA reference; got:\n${out.slice(-800)}`);
  assert.ok(out.includes('10% of total turnover'),
    `missing English penalty ceiling; got:\n${out.slice(-800)}`);
  assert.ok(out.includes('not legal advice'),
    `missing English legal-counsel disclaimer; got:\n${out.slice(-800)}`);
  assert.ok(out.includes('CEO'),
    `missing English CEO term; got:\n${out.slice(-800)}`);
});

test('renderComplianceReport renders Korean disclaimer on FINDINGS-BLOCKING verdict (mandatory regardless of severity)', () => {
  const verdict = _baseVerdict({
    decision: 'FINDINGS-BLOCKING',
    severity: 'blocking',
    findings_count: 1,
    findings: [
      {
        severity: 'blocking',
        location: 'art:body',
        description: 'CPO not declared',
        regulation_clause: 'PIPA Art. 28-8',
      },
    ],
    rationale: 'PIPA hard-required-evidence missing',
  });
  const out = renderComplianceReport(verdict, { korea: true, packs: ['PIPA'] });
  assert.ok(out.includes('2026년 개정 개인정보 보호법'),
    'Korean disclaimer must render even on FINDINGS-BLOCKING (D-03 mandatory)');
  assert.ok(out.includes('총매출의 10%'),
    'penalty ceiling must render even on FINDINGS-BLOCKING');
  assert.ok(out.includes('법적 자문이 아닙니다'),
    'legal-counsel disclaimer must render even on FINDINGS-BLOCKING');
});

test('renderComplianceReport renders English disclaimer with empty packs (defense-in-depth)', () => {
  const out = renderComplianceReport(_baseVerdict(), { korea: false, packs: [] });
  // Even when no compliance packs are declared (pass-through mode), the
  // gate-output is canonical: legal-counsel disclaimer must render.
  assert.ok(out.includes('Not legal advice'),
    'English legal-counsel disclaimer must render even with empty packs');
  assert.ok(out.includes('not legal advice'),
    'English not-legal-advice closing sentence must render even with empty packs');
  assert.ok(out.includes('2026 PIPA amendments'),
    'PIPA reference must render even with empty packs (canonical gate output)');
});

test('renderComplianceReport renders Korean disclaimer on FINDINGS-MATERIAL verdict', () => {
  const verdict = _baseVerdict({
    decision: 'FINDINGS-MATERIAL',
    severity: 'material',
    findings_count: 1,
    findings: [
      { severity: 'material', location: 'art:1', description: '금지 표현 감지' },
    ],
    rationale: '여러 material 발견 — workflow 진행 가능 (FINDINGS-MATERIAL ≠ FINDINGS-BLOCKING)',
  });
  const out = renderComplianceReport(verdict, { korea: true, packs: ['PIPA'] });
  assert.ok(out.includes('총매출의 10%'),
    'penalty ceiling renders on FINDINGS-MATERIAL');
  assert.ok(out.includes('법적 자문이 아닙니다'),
    'disclaimer renders on FINDINGS-MATERIAL (CC-01: every artifact gets the legal-counsel disclaimer)');
});

test('renderComplianceReport English variant: penalty ceiling and CEO liability sentence both present', () => {
  const out = renderComplianceReport(_baseVerdict(), { korea: false, packs: ['PIPA'] });
  // Defense-in-depth: both halves of the D-03 verbatim block must appear.
  assert.ok(out.match(/personal liability for the CEO/),
    'English variant must mention "personal liability for the CEO"');
  assert.ok(out.match(/qualified Korean counsel/),
    'English variant must point users to qualified Korean counsel');
  assert.ok(out.match(/effective 2026-09-11/),
    'English variant must include the effective-date marker (so disclaimer ages clearly)');
});

test('renderComplianceReport Korean variant uses formal register (하십시오체) per Pitfall #11', () => {
  const out = renderComplianceReport(_baseVerdict(), { korea: true, packs: ['PIPA'] });
  // The disclaimer's tone uses "아닙니다" + "출발점입니다" — formal
  // honorific endings appropriate for compliance content.
  assert.ok(out.includes('아닙니다'),
    'Korean variant must use 하십시오체 formal register');
  assert.ok(out.match(/출발점입니다|출발점이며/),
    'Korean variant must include "출발점" (starting-points) framing');
});

test('renderComplianceReport disclaimer placed AFTER findings sections (footer position)', () => {
  const verdict = _baseVerdict({
    decision: 'FINDINGS-BLOCKING',
    severity: 'blocking',
    findings_count: 1,
    findings: [{ severity: 'blocking', location: 'a:1', description: 'gap' }],
    rationale: 'r',
  });
  const out = renderComplianceReport(verdict, { korea: false, packs: ['PIPA'] });
  // Disclaimer must come after findings + rationale.
  const disclaimerIdx = out.indexOf('Under 2026 PIPA amendments');
  const rationaleIdx = out.indexOf('## Rationale');
  const findingsIdx = out.indexOf('## Obligations BRIEF cannot verify');
  assert.ok(disclaimerIdx > rationaleIdx,
    'disclaimer must appear AFTER rationale section (footer position)');
  assert.ok(disclaimerIdx > findingsIdx,
    'disclaimer must appear AFTER findings sections (footer position)');
});
