'use strict';

/**
 * Wave 0 RED fixture for V1 launch gate / D-D04 — V1-LAUNCH-GATE.md three-prong checklist.
 *
 * Asserts that .planning/V1-LAUNCH-GATE.md (created by Plan 06) contains:
 *   - Three-prong checklist with (i)/(ii)/(iii) markers covering pilot
 *     finding, smoke test, and surface cap.
 *   - A Verdict line with PASS / HOLD / FAIL.
 *   - Cross-references to SMOKE-TEST.md and SURFACE-AUDIT.md by name.
 *
 * RED-state contract: Plan 06 generates V1-LAUNCH-GATE.md as the launch
 * decision artifact. Until then, the file is absent and tests skip with a
 * Plan-06 rationale.
 *
 * Pattern source: tests/architecture-counts.test.cjs (filesystem read +
 * regex assertion) + 09-PATTERNS.md lines 769-794 (V1-LAUNCH-GATE.md schema).
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const V1_GATE_MD = path.join(ROOT, '.planning', 'V1-LAUNCH-GATE.md');

describe('V1-LAUNCH-GATE.md three-prong checklist (D-D04)', () => {
  test('V1-LAUNCH-GATE.md exists', (t) => {
    if (!fs.existsSync(V1_GATE_MD)) {
      t.skip('blocked: .planning/V1-LAUNCH-GATE.md not yet generated (Plan 06)');
      return;
    }
    assert.ok(true, 'V1-LAUNCH-GATE.md present');
  });

  test('three prongs present in checklist (i)/(ii)/(iii)', (t) => {
    if (!fs.existsSync(V1_GATE_MD)) {
      t.skip('blocked: .planning/V1-LAUNCH-GATE.md not yet generated (Plan 06)');
      return;
    }
    const content = fs.readFileSync(V1_GATE_MD, 'utf-8');
    assert.match(content, /\(i\).*pilot.*finding/i, 'prong (i) must reference pilot finding');
    assert.match(content, /\(ii\).*smoke.*test/i, 'prong (ii) must reference smoke test');
    assert.match(content, /\(iii\).*surface.*cap/i, 'prong (iii) must reference surface cap');
  });

  test('verdict line present (PASS / HOLD / FAIL)', (t) => {
    if (!fs.existsSync(V1_GATE_MD)) {
      t.skip('blocked: .planning/V1-LAUNCH-GATE.md not yet generated (Plan 06)');
      return;
    }
    const content = fs.readFileSync(V1_GATE_MD, 'utf-8');
    assert.match(
      content,
      /Verdict:\s*(PASS|HOLD|FAIL)/i,
      'expected "Verdict: PASS|HOLD|FAIL" line (case-insensitive)',
    );
  });

  test('references SMOKE-TEST.md and SURFACE-AUDIT.md by name', (t) => {
    if (!fs.existsSync(V1_GATE_MD)) {
      t.skip('blocked: .planning/V1-LAUNCH-GATE.md not yet generated (Plan 06)');
      return;
    }
    const content = fs.readFileSync(V1_GATE_MD, 'utf-8');
    assert.match(content, /SMOKE-TEST\.md/, 'V1-LAUNCH-GATE.md must reference SMOKE-TEST.md');
    assert.match(content, /SURFACE-AUDIT\.md/, 'V1-LAUNCH-GATE.md must reference SURFACE-AUDIT.md');
  });
});
