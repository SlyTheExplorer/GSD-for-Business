/**
 * brief-design-canary-e2e.test.cjs — Plan 07-08 Task 1 (Wave 5).
 *
 * Korea-first B2C fintech canary E2E test exercising the full /brief-design BMC
 * pipeline as a fixture-driven structural assertion suite. Per VALIDATION.md
 * Manual-Only Verifications discipline, this test does NOT spawn real LLM
 * Tasks; it asserts the deterministic primitives + workflow markdown structure
 * produced by Plans 07-01..07-07.
 *
 * Acceptance scope (DSG-01..10 + CC-01):
 *   T1. Workflow structure proves 4 paired-sibling files (canvas.md + 3 gates).
 *   T2. Korea fixture has region:kr + business_model:b2c + PIPA pack signal.
 *   T3. runDeterministicScreen on Korea-style artifact + PIPA pack triggers
 *       Screen (b) PIPA hard-evidence finding.
 *   T4. Korean disclaimer renders verbatim (CEO liability + 10% turnover).
 *   T5. Recommended-next handoff: completed=[business-model-canvas] → 'go-to-market'.
 *   T6. BMC bundle has zero ban-list violations (vocabulary discipline).
 *   T7. CEO-liability false-positive prevention: B2B enterprise SaaS without
 *       consumer data does NOT trigger PIPA Art. 28-8 blocking finding.
 *
 * Threat mitigations:
 *   - T-07-27 (Tampering — E2E canary fixture): Korea fixture + PIPA pack +
 *     verbatim disclaimer + soft-order recommendation + ban-list discipline +
 *     B2B false-positive prevention all asserted here.
 *
 * References:
 *   - 07-08-PLAN.md Task 1
 *   - 07-CONTEXT.md D-01 (verdict enum) / D-03 (CEO-liability disclaimer) /
 *     D-04 (Korea-only pack scope) / D-07 (soft-order BMC → GTM)
 *   - 07-RESEARCH.md lines 991-1010 (canary spec)
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync } = require('node:child_process');

const REPO_ROOT = path.join(__dirname, '..');

// ─── T1: Workflow structure proves 4 paired-sibling files ──────────────────
test('T1 design.md workflow Step 5 produces 4 paired-sibling files (canvas.md + 3 gates)', () => {
  const wfPath = path.join(REPO_ROOT, 'brief/workflows/design.md');
  const wf = fs.readFileSync(wfPath, 'utf8');

  // Step 5 invokes 3 gate workflows (each commits its own paired-sibling .md).
  assert.match(wf, /align-gate\.md/, 'design.md must invoke align-gate.md');
  assert.match(wf, /audience-guard\.md/, 'design.md must invoke audience-guard.md');
  assert.match(wf, /compliance\.md\b/, 'design.md must invoke compliance.md gate');

  // Artifact path pattern: .planning/workstreams/{slug}/{name}.md as primary
  // output. Paired-siblings (.align.md, .audience.md, .compliance.md) generated
  // by the respective gate workflows in the same folder per D-12.
  assert.match(
    wf,
    /\.planning\/workstreams|workstreams\/\$\{|workstreams\/\{slug\}|workstreams\/\$\{WORKSTREAM/i,
    'design.md must reference .planning/workstreams/{slug}/ layout (D-12)'
  );
});

// ─── T2: Canary fixture has Korea + PIPA pack signal ───────────────────────
test('T2 canary fixture has region:kr + business_model:b2c + compliance_packs:[PIPA, ISMS-P, MyData]', () => {
  const fixture = fs.readFileSync(
    path.join(REPO_ROOT, 'tests/fixtures/objectives-korea-b2c-fintech.md'),
    'utf8'
  );
  assert.match(fixture, /region:\s*kr|business_context\.region:\s*kr/, 'fixture frontmatter must declare region: kr');
  assert.match(
    fixture,
    /business_model:\s*b2c|business_context\.model:\s*b2c/,
    'fixture frontmatter must declare business_model: b2c'
  );
  assert.match(fixture, /compliance_packs.*PIPA/, 'fixture must include PIPA pack');
  assert.match(fixture, /ISMS-P/, 'fixture must include ISMS-P pack');
  assert.match(fixture, /MyData/, 'fixture must include MyData pack');
});

// ─── T3: PIPA pack triggers Screen (b) on Korean artifact ──────────────────
test('T3 runDeterministicScreen on Korea-fixture-style artifact + PIPA pack triggers Screen (b) finding', () => {
  const tmpdir = os.tmpdir();
  const artifactPath = path.join(tmpdir, 'canary-' + Date.now() + '.md');
  // Korean B2C fintech BMC artifact mentioning 개인정보 (personal info) — Screen
  // (b) requires this positive signal AND lack of CPO/consent evidence.
  fs.writeFileSync(
    artifactPath,
    [
      '# 페이앱 BMC',
      '',
      '## 1. 고객 세그먼트',
      '서울 거주 20-40대 직장인. 모바일 우선 사용자.',
      '',
      '## 5. 수익원',
      '거래 수수료 0.5%. 결제 시 개인정보를 수집하여 처리합니다.',
      '',
    ].join('\n')
  );

  try {
    const { runDeterministicScreen } = require('../brief/bin/lib/compliance.cjs');
    const result = runDeterministicScreen({
      artifact: artifactPath,
      baseline: path.join(REPO_ROOT, 'tests/fixtures/objectives-korea-b2c-fintech.md'),
      businessContext: {
        compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
        region: 'kr',
        business_model: 'b2c',
      },
    });
    // Screen (b) hard-evidence path: Korean B2C fintech artifact references
    // 개인정보 yet has no CPO/consent evidence → short-circuits to
    // FINDINGS-BLOCKING with PIPA Art. 28-8 finding.
    const findings = result.short_circuited
      ? (result.verdict.findings || [])
      : (result.deterministic_findings || result.findings || []);
    const hasPipaFinding = findings.some(
      (f) =>
        (f.regulation_clause && f.regulation_clause.includes('PIPA')) ||
        (f.description && (f.description.includes('PIPA') || f.description.includes('개인정보')))
    );
    assert.ok(
      hasPipaFinding,
      'PIPA pack should produce a finding when artifact mentions 개인정보 without CPO/consent evidence'
    );
  } finally {
    try {
      fs.unlinkSync(artifactPath);
    } catch (_) {
      /* already deleted */
    }
  }
});

// ─── T4: Korean disclaimer renders verbatim ────────────────────────────────
test('T4 renderComplianceReport on Korean fixture produces verbatim Korean disclaimer (CEO liability + 10% turnover)', () => {
  const { renderComplianceReport } = require('../brief/bin/lib/compliance-report.cjs');
  const verdict = {
    decision: 'FINDINGS-MATERIAL',
    severity: 'material',
    findings_count: 1,
    findings: [
      {
        severity: 'material',
        location: 'canvas.md:L5',
        description: 'PIPA Art. 28-8 evidence missing',
        regulation_clause: 'PIPA Art. 28-8',
      },
    ],
    rationale: 'Material finding on personal-data clause coverage',
  };
  const out = renderComplianceReport(verdict, { korea: true, packs: ['PIPA', 'ISMS-P', 'MyData'] });
  // Verbatim Korean CEO-liability disclaimer fragments per D-03 lock.
  assert.match(out, /2026년 개정 개인정보 보호법/, 'Korean disclaimer must reference 2026 PIPA amendment');
  assert.match(out, /총매출의 10%/, 'Korean disclaimer must reference 10% of total turnover');
  assert.match(out, /대표이사 개인 책임/, 'Korean disclaimer must reference CEO personal liability');
  assert.match(
    out,
    /법적 자문이 아닙니다|법률 자문가/,
    'Korean disclaimer must include "not legal advice" / "legal counsel" caveat'
  );
});

// ─── T5: Recommended-next handoff (D-07 soft-order BMC → GTM) ──────────────
test('T5 Handoff: completed=[business-model-canvas] → recommended next = go-to-market (D-07 soft-order)', () => {
  const dispatcherPath = path.join(REPO_ROOT, 'brief/bin/brief-tools.cjs');
  const out = execSync(
    `node "${dispatcherPath}" design recommended-next --completed business-model-canvas`,
    { encoding: 'utf8' }
  );
  const r = JSON.parse(out);
  assert.strictEqual(
    r.recommended_next,
    'go-to-market',
    `D-07 soft-order: BMC completed → GTM next. Got: ${r.recommended_next}. ` +
      `Dispatcher must respect PHASE_7_SOFT_ORDER from status.cjs computeRecommendedNext.`
  );
});

// ─── T6: BMC bundle has zero ban-list violations ───────────────────────────
//
// Exemption note: design-prompts.md's `## Discipline` / `DO NOT:` section
// quotes ban-list tokens by design — they are forbidden patterns the agent is
// told NOT to emit. Mirrors the existing brief-compliance-vocabulary-lock.test
// "Ban-list section" exemption pattern. We strip the Discipline DO-NOT block
// before scanning so the test catches actual ban-list usage in artifact /
// agent-output context, not anti-pattern documentation.
test('T6 BMC bundle has zero ban-list violations in artifact-emitted content (vocabulary discipline)', () => {
  const BAN_TOKENS = [
    /\bcompliant\b/i,
    /\bpassed\b/i,
    /compliance verified/i,
    /audit complete/i,
    /\u2705/, // ✅
    /\b준수\b/,
    /\b통과\b/,
    /감사 완료/,
  ];

  // spec.yaml: structured config; never emits artifact prose.
  const specPath = path.join(REPO_ROOT, 'brief/workstreams/business-model-canvas/spec.yaml');
  const specContent = fs.readFileSync(specPath, 'utf8');
  for (const re of BAN_TOKENS) {
    assert.ok(!re.test(specContent), `Ban-list violation in BMC spec.yaml: matched ${re}`);
  }

  // design-prompts.md: prompt-template prose; the ## Discipline DO-NOT section
  // quotes ban-list tokens by design (forbidden-pattern documentation). Strip
  // that section before scanning to catch ACTUAL emitted vocabulary issues.
  const promptsPath = path.join(REPO_ROOT, 'brief/workstreams/business-model-canvas/design-prompts.md');
  const promptsRaw = fs.readFileSync(promptsPath, 'utf8');
  // Strip everything from `## Discipline` onwards (anti-pattern doc section).
  const promptsContent = promptsRaw.split(/^## Discipline/m)[0];
  for (const re of BAN_TOKENS) {
    assert.ok(
      !re.test(promptsContent),
      `Ban-list violation in BMC design-prompts.md (outside Discipline section): matched ${re}`
    );
  }

  // templates/artifact.md: the literal output skeleton.
  const tmplPath = path.join(REPO_ROOT, 'brief/workstreams/business-model-canvas/templates/artifact.md');
  const tmplContent = fs.readFileSync(tmplPath, 'utf8');
  for (const re of BAN_TOKENS) {
    assert.ok(!re.test(tmplContent), `Ban-list violation in BMC templates/artifact.md: matched ${re}`);
  }
});

// ─── T7: B2B SaaS false-positive prevention ────────────────────────────────
//
// CRITICAL credibility test per Risk Notes: a B2B enterprise SaaS BMC that
// uses the "PII" keyword to declare ABSENCE of personal data must NOT trigger
// the PIPA Art. 28-8 hard-blocking finding. Compliance theater via false
// positive degrades the gate's credibility (Pitfall #4 regression).
test('T7 B2B enterprise SaaS without consumer data does NOT trigger PIPA Art. 28-8 blocking finding', () => {
  const tmpdir = os.tmpdir();
  const artifactPath = path.join(tmpdir, 'b2b-' + Date.now() + '.md');
  // B2B enterprise SaaS BMC: API gateway + telemetry; explicit "No PII processed"
  // declaration. Screen (b) FALSE-POSITIVE GUARD must suppress.
  fs.writeFileSync(
    artifactPath,
    [
      '# AcmeIQ BMC',
      '',
      '## 1. Customer Segments',
      'Engineering leaders at companies with 200-2000 engineers.',
      '',
      '## 5. Revenue Streams',
      'Annual contract value $50K-$500K. Per-developer pricing tiers.',
      '',
      '## 6. Key Resources',
      'API gateway with API keys + aggregated telemetry. No PII processed.',
      '',
    ].join('\n')
  );

  try {
    const { runDeterministicScreen } = require('../brief/bin/lib/compliance.cjs');
    const result = runDeterministicScreen({
      artifact: artifactPath,
      baseline: path.join(REPO_ROOT, 'tests/fixtures/objectives-b2b-enterprise-saas.md'),
      businessContext: {
        compliance_packs: ['PIPA'], // PIPA in packs but NO consumer data
        region: 'kr',
        business_model: 'enterprise',
      },
    });
    const findings = result.short_circuited
      ? (result.verdict.findings || [])
      : (result.deterministic_findings || result.findings || []);
    const hasArt28BlockingFinding = findings.some(
      (f) =>
        f.severity === 'blocking' &&
        f.regulation_clause &&
        f.regulation_clause.includes('PIPA Art. 28-8')
    );
    assert.strictEqual(
      hasArt28BlockingFinding,
      false,
      'B2B SaaS without consumer-data tokens MUST NOT trigger PIPA Art. 28-8 blocking finding ' +
        '(Risk Notes credibility-gradient mitigation; Screen b denial-pattern guard)'
    );
  } finally {
    try {
      fs.unlinkSync(artifactPath);
    } catch (_) {
      /* already deleted */
    }
  }
});
