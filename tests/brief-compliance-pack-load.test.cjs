/**
 * brief-compliance-pack-load.test.cjs — Plan 07-02 Task 2.
 *
 * Asserts the compliance.cjs runDeterministicScreen() correctly handles the
 * 3 sub-screens documented in 07-RESEARCH.md lines 193-201:
 *
 *   Screen (a) Pack-applicability — when businessContext.compliance_packs is
 *               empty AND no Korea signal AND no Korean prose, gate runs in
 *               pass-through mode: short-circuits to COMPLIANCE-OK with a
 *               single nice-to-have finding ("no applicable compliance packs").
 *
 *   Screen (b) PIPA hard-required-evidence — when packs include 'PIPA' AND the
 *               artifact body contains personal-data tokens AND lacks
 *               CPO / consent / breach-notification evidence, the gate
 *               short-circuits to FINDINGS-BLOCKING with regulation_clause
 *               'PIPA Art. 28-8'. CRITICAL: Screen (b) MUST NOT fire on
 *               B2B SaaS infrastructure artifacts that lack consumer-data
 *               signals (Risk Notes false-positive prevention; CEO-liability
 *               credibility gradient — overfiring degrades trust).
 *
 *   Screen (c) Ban-list grep — additive material findings (no short-circuit).
 *
 * Reference: 07-02-PLAN.md Task 2; 07-RESEARCH.md lines 193-201; CONTEXT.md
 * Risk Notes B2B/B2C divergence.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const compliance = require('../brief/bin/lib/compliance.cjs');

// Test sandbox lives under tmpdir so we don't pollute the repo with stray
// fixture artifacts. Each test writes a fresh artifact + objectives stub
// before invoking the screen.
function _makeSandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-cc-pack-load-'));
  const artifactPath = path.join(dir, 'artifact.md');
  const baselinePath = path.join(dir, 'objectives.md');
  fs.writeFileSync(baselinePath, '# OBJECTIVES (test stub)\n', 'utf-8');
  return { dir, artifactPath, baselinePath };
}

function _writeArtifact(artifactPath, body) {
  fs.writeFileSync(artifactPath, body, 'utf-8');
}

// Wrapper accepting BOTH legacy 2-arg form and new 1-arg form. The plan spec
// expects single-arg `runDeterministicScreen({...})`; the lib must support it
// to honor the plan contract while remaining backwards-compatible with the
// `(cwd, opts)` form used by Plan 01.
function _screen(opts) {
  // Use single-arg form. If the lib rejects this with a "string required"
  // TypeError (legacy form), the test fails with a clear signal.
  return compliance.runDeterministicScreen(opts);
}

// ─── Test 1 — Screen (a) empty packs ───────────────────────────────────────

test('Screen (a): empty packs + no Korea signal → COMPLIANCE-OK pass-through with nice-to-have finding', () => {
  const { artifactPath, baselinePath } = _makeSandbox();
  _writeArtifact(artifactPath, '# Project\n\nGeneric content not mentioning regulated data.\n');
  const result = _screen({
    artifact: artifactPath,
    baseline: baselinePath,
    businessContext: { compliance_packs: [], region: 'us', business_model: 'b2c' },
  });
  assert.strictEqual(result.short_circuited, true,
    'empty packs + non-Korea region should short-circuit (Screen a)');
  assert.strictEqual(result.verdict.decision, 'COMPLIANCE-OK',
    'Screen (a) pass-through verdict must be COMPLIANCE-OK');
  assert.ok(result.verdict.findings.length >= 1,
    'Screen (a) should emit at least one nice-to-have finding');
  const passThroughDescription = result.verdict.findings[0].description;
  assert.match(passThroughDescription, /no applicable compliance packs/i,
    `Screen (a) pass-through finding must explain no-applicable-packs; got: "${passThroughDescription}"`);
  assert.strictEqual(result.verdict.findings[0].severity, 'nice-to-have',
    'Screen (a) pass-through finding severity must be nice-to-have');
});

// ─── Test 2 — Screen (b) PIPA fires on personal-data + Korea ───────────────

test('Screen (b): PIPA pack + Korean personal-data prose + no CPO/consent → FINDINGS-BLOCKING with PIPA Art. 28-8', () => {
  const { artifactPath, baselinePath } = _makeSandbox();
  _writeArtifact(artifactPath, '# Korean fintech app\n\n## Customer Data\n결제 시 개인정보를 수집하여 처리합니다.\n');
  const result = _screen({
    artifact: artifactPath,
    baseline: baselinePath,
    businessContext: { compliance_packs: ['PIPA'], region: 'kr', business_model: 'b2c' },
  });
  assert.strictEqual(result.short_circuited, true,
    'Screen (b) PIPA hard-required-evidence triggers short-circuit');
  assert.strictEqual(result.verdict.decision, 'FINDINGS-BLOCKING',
    'Screen (b) PIPA evidence-gap must yield FINDINGS-BLOCKING');
  const pipaFinding = result.verdict.findings.find(
    (f) => typeof f.regulation_clause === 'string' && f.regulation_clause.includes('PIPA Art. 28-8'),
  );
  assert.ok(pipaFinding,
    `Screen (b) must emit a finding tagged regulation_clause: "PIPA Art. 28-8"; got findings: ${JSON.stringify(result.verdict.findings)}`);
  assert.strictEqual(pipaFinding.severity, 'blocking',
    'PIPA Art. 28-8 finding must be blocking severity');
});

// ─── Test 3 — Screen (b) B2B SaaS NO false positive (LOAD-BEARING) ─────────

test('Screen (b): PIPA pack + B2B SaaS without consumer-data tokens → does NOT fire blocking finding (Risk Notes false-positive prevention)', () => {
  const { artifactPath, baselinePath } = _makeSandbox();
  _writeArtifact(artifactPath, '# Enterprise SaaS\n\n## API\nProcesses customer API keys and aggregated telemetry. No PII collected.\n');
  const result = _screen({
    artifact: artifactPath,
    baseline: baselinePath,
    businessContext: { compliance_packs: ['PIPA'], region: 'kr', business_model: 'enterprise' },
  });
  // Either the screen does not short-circuit (proceed to LLM pass) OR it
  // short-circuits to COMPLIANCE-OK. EITHER WAY, no PIPA Art. 28-8 blocking
  // finding may appear in either result.verdict.findings or
  // result.findings (deterministic_findings) — that is the credibility gradient.
  if (result.short_circuited) {
    assert.notStrictEqual(result.verdict.decision, 'FINDINGS-BLOCKING',
      'B2B SaaS without consumer-data tokens MUST NOT yield FINDINGS-BLOCKING (Risk Notes false-positive prevention)');
  }
  // Defense-in-depth: scan all findings — verdict (when short-circuited) AND
  // accumulated deterministic_findings (when not short-circuited).
  const allFindings = (result.verdict ? result.verdict.findings : []).concat(result.findings || []);
  const hasBlockingPipaFinding = allFindings.some(
    (f) => f.severity === 'blocking'
        && typeof f.regulation_clause === 'string'
        && f.regulation_clause.includes('PIPA Art. 28-8'),
  );
  assert.strictEqual(hasBlockingPipaFinding, false,
    'B2B SaaS artifact with explicit "No PII collected" denial MUST NOT trigger PIPA Art. 28-8 blocking finding (CONTEXT.md Risk Notes — CEO liability credibility-gradient mitigation)');
});

// ─── Test 4 — Screen (c) ban-list additive ─────────────────────────────────

test('Screen (c): ban-list token in artifact body → emits at least one material finding', () => {
  const { artifactPath, baselinePath } = _makeSandbox();
  // Use an artifact body that does NOT trigger PIPA Screen (b) (no
  // personal-data tokens, no Korean prose) so we isolate Screen (c).
  // "compliant" + "✓" both ban-list tokens (BAN_EN + BAN_SYMBOL).
  _writeArtifact(artifactPath, '# Audit Report\n\nAll items compliant ✓.\n');
  const result = _screen({
    artifact: artifactPath,
    baseline: baselinePath,
    businessContext: { compliance_packs: ['PIPA'], region: 'us', business_model: 'b2c' },
  });
  // Ban-list grep is additive — may or may not short-circuit depending on
  // Screen (a) / (b) interaction. The contract here is the existence of the
  // material finding, not its short-circuit status.
  const allFindings = (result.verdict ? result.verdict.findings : []).concat(result.findings || []);
  const hasBanlistFinding = allFindings.some(
    (f) => f.severity === 'material' && /forbidden|ban|prohibited|금지/i.test(f.description),
  );
  assert.ok(hasBanlistFinding,
    `Screen (c) ban-list grep should emit material finding for "compliant" / "✓"; got findings: ${JSON.stringify(allFindings)}`);
});

// ─── Acceptance test: lib exports compliance_packs handling ────────────────

test('compliance.cjs Screen (a) reads compliance_packs from businessContext (not from cwd state read)', () => {
  // The plan acceptance criterion requires runDeterministicScreen to read
  // compliance_packs from the businessContext arg (Plan-01 contract). Verify
  // by passing a businessContext with packs=[] AND a fresh tmpdir as cwd
  // (where state.brief.compliance_packs would NOT exist) — the screen must
  // NOT crash with "no STATE.md" and must use the businessContext value.
  const { artifactPath, baselinePath } = _makeSandbox();
  _writeArtifact(artifactPath, '# Generic\n\nNo regulated content.\n');
  const result = _screen({
    artifact: artifactPath,
    baseline: baselinePath,
    businessContext: { compliance_packs: [], region: 'us', business_model: 'b2c' },
  });
  // Successful pass-through with empty packs ≡ businessContext was read
  // correctly (Screen a triggers when packs.length === 0).
  assert.strictEqual(result.short_circuited, true);
  assert.strictEqual(result.verdict.decision, 'COMPLIANCE-OK');
});
