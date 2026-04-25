/**
 * brief-design-gate-order.test.cjs — Plan 07-03 Task 3 (Wave 0).
 *
 * Sequential 3-gate threading enforcement (D-02). brief/workflows/design.md
 * Step 5 MUST invoke ALIGN → AUDIENCE → COMPLIANCE in series, in that
 * positional order. Future edits that swap the order (or run gates in
 * parallel) fail this test immediately.
 *
 * Three invariants asserted:
 *   1. All 3 gate workflow filenames are referenced at least once.
 *   2. The FIRST occurrence of align-gate.md precedes the FIRST occurrence
 *      of audience-guard.md, which precedes the FIRST occurrence of
 *      compliance.md (gate sequencing baked into the markdown).
 *   3. Fail-fast vocabulary on BLOCKING is present (no "skip flag" path).
 *   4. FINDINGS-MATERIAL is routed to Step 6 (proceed) rather than the
 *      3-path interrupt — Phase 7 D-01 deviation from Phase 4/5.
 *
 * Threat mitigations:
 *   - T-07-07 (Tampering — gate ordering): a swap reorders the regex
 *     positions and the test fires.
 *
 * References:
 *   - 07-03-PLAN.md Task 3 (test source)
 *   - 07-CONTEXT.md D-02 (sequential threading)
 *   - 07-CONTEXT.md D-01 (FINDINGS-MATERIAL no-interrupt deviation)
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const WORKFLOW = path.join(ROOT, 'brief/workflows/design.md');
const wf = fs.readFileSync(WORKFLOW, 'utf8');

test('design.md sequential gate threading: ALIGN → AUDIENCE → COMPLIANCE (D-02)', () => {
  const alignIdx = wf.search(/align-gate\.md/);
  const audienceIdx = wf.search(/audience-guard\.md/);
  const complianceIdx = wf.search(/compliance\.md\b/);
  assert.ok(
    alignIdx > -1 && audienceIdx > -1 && complianceIdx > -1,
    `all 3 gate workflows must be referenced (align@${alignIdx}, audience@${audienceIdx}, compliance@${complianceIdx})`,
  );
  assert.ok(
    alignIdx < audienceIdx,
    `ALIGN must precede AUDIENCE in workflow text (got align@${alignIdx}, audience@${audienceIdx})`,
  );
  assert.ok(
    audienceIdx < complianceIdx,
    `AUDIENCE must precede COMPLIANCE in workflow text (got audience@${audienceIdx}, compliance@${complianceIdx})`,
  );
});

test('design.md has fail-fast on BLOCKING (D-02)', () => {
  assert.match(
    wf,
    /fail-fast|exit.*BLOCKING|BLOCKING.*exit/,
    'design.md must contain fail-fast vocabulary on BLOCKING verdicts',
  );
});

test('design.md FINDINGS-MATERIAL proceeds without interrupt (D-01 deviation)', () => {
  // Phase 7 D-01: FINDINGS-MATERIAL on COMPLIANCE proceeds to Step 6, NOT
  // a 3-path interrupt. The legal-counsel disclaimer footer renders on
  // every emitted .compliance.md regardless of severity.
  assert.match(
    wf,
    /FINDINGS-MATERIAL.*proceed|FINDINGS-MATERIAL.*Step 6|MATERIAL.*no.*interrupt/,
    'design.md must route FINDINGS-MATERIAL to Step 6 (proceed) per D-01 deviation',
  );
});
