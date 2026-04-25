/**
 * brief-compliance-no-hooks.test.cjs — Plan 07-01 Task 1.
 *
 * Anti-pattern #2 structural test: COMPLIANCE is an orchestrator step, NEVER a
 * hook. Mirrors tests/brief-audience-no-hook.test.cjs (Phase 5) and
 * tests/brief-align-no-hook.test.cjs (Phase 4).
 *
 * 2 grep audits enforced:
 *
 *   1. hooks/ directory contains NO file that references compliance-checker,
 *      brief-compliance-checker, compliance_checker, or compliance.cjs.
 *      ROADMAP Phase 7 Success Criterion + 07-RESEARCH.md §Pattern 2 forbid
 *      PostToolUse / SubagentStop / UserPromptSubmit attachment of the gate.
 *
 *   2. hooks/ directory contains NO reference to brief/workflows/compliance.md.
 *
 * If a hook ever attaches COMPLIANCE, the entire Phase 7 cross-cutting-gate
 * pattern breaks (Anti-pattern #2 from .planning/research/ARCHITECTURE.md).
 *
 * References:
 *   - 07-01-PLAN.md Task 1
 *   - .planning/research/ARCHITECTURE.md Anti-pattern #2 (hook-spawned gates)
 *   - tests/brief-audience-no-hook.test.cjs (Phase 5 template)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

test('Anti-pattern #2: hooks/ directory has ZERO references to compliance-checker agent/workflow/lib', () => {
  let matches = '';
  try {
    matches = execSync(
      `grep -rE "compliance-checker|brief-compliance-checker|compliance_checker|compliance\\.cjs" hooks/ 2>/dev/null`,
      { cwd: ROOT, encoding: 'utf-8' },
    );
  } catch (err) {
    // grep exits 1 when no matches — that's the happy path for this test.
    if (err.status === 1) {
      matches = '';
    } else if (err.status === 2) {
      // Status 2 = hooks/ doesn't exist; treat as zero matches (vacuously true).
      matches = '';
    } else {
      throw err;
    }
  }
  assert.equal(
    matches.trim(),
    '',
    `Anti-pattern #2 violation — hook file references COMPLIANCE subsystem:\n${matches}`,
  );
});

test('Anti-pattern #2: hooks/ directory has ZERO references to brief/workflows/compliance.md', () => {
  let matches = '';
  try {
    matches = execSync(
      `grep -rE "brief/workflows/compliance\\b" hooks/ 2>/dev/null`,
      { cwd: ROOT, encoding: 'utf-8' },
    );
  } catch (err) {
    if (err.status === 1 || err.status === 2) {
      matches = '';
    } else {
      throw err;
    }
  }
  assert.equal(
    matches.trim(),
    '',
    `Anti-pattern #2 violation — hook file references brief/workflows/compliance:\n${matches}`,
  );
});
