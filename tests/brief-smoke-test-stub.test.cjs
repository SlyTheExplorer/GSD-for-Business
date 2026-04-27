'use strict';

/**
 * Wave 0 RED fixture for HRD-01 / B-D01..B-D04 — cross-runtime smoke matrix.
 *
 * Asserts that smoke.buildMatrix produces a 4 × 5 matrix (4 RUNTIMES × 5
 * COMMANDS = 20 cells) and that each cell has shape {status, reason}.
 *
 * RED-state contract: brief/bin/lib/smoke-test.cjs is created in Plan 01.
 * Until then, every test skips with a Plan-01 rationale.
 *
 * Pattern source: tests/brief-define-atomic-commit.test.cjs lines 25-50
 * (execFileSync subprocess analog) + 09-PATTERNS.md lines 514-545.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process'); // eslint-disable-line no-unused-vars
const path = require('path');

const BRIEF_ROOT = path.join(__dirname, '..');

// RUNTIMES — byte-identical to 09-00-PLAN.md <interfaces> block (B-D01 + B-D03).
// Plan 01 must export a RUNTIMES array matching this shape.
const RUNTIMES = [
  { name: 'claude',   env: {                                   text_mode_default: false } },
  { name: 'codex',    env: { INSTRUCTION_FILE: 'AGENTS.md',    text_mode_default: true  } },
  { name: 'gemini',   env: {                                   text_mode_default: true  } },
  { name: 'opencode', env: {                                   text_mode_default: true  } },
];

// COMMANDS — byte-identical to 09-00-PLAN.md <interfaces> block (B-D02).
const COMMANDS = ['init', 'define', 'discover', 'design', 'deliver'];

let smokeAvailable = false;
let smoke = null;
try {
  smoke = require(path.join(BRIEF_ROOT, 'brief', 'bin', 'lib', 'smoke-test.cjs'));
  smokeAvailable = true;
} catch (_e) {
  // Plan 01 has not yet created brief/bin/lib/smoke-test.cjs — fixture stays RED.
}

describe('Cross-runtime smoke matrix (HRD-01 / B-D01..B-D04)', () => {
  test('buildMatrix produces 4 runtimes × 5 commands = 20 cells', (t) => {
    if (!smokeAvailable) {
      t.skip('blocked: brief/bin/lib/smoke-test.cjs not yet created (Plan 01)');
      return;
    }
    const matrix = smoke.buildMatrix(BRIEF_ROOT);
    assert.strictEqual(matrix.length, RUNTIMES.length, `${RUNTIMES.length} runtime rows`);
    for (const row of matrix) {
      assert.strictEqual(row.length, COMMANDS.length, `${COMMANDS.length} command cells per row`);
    }
  });

  test('each cell has shape {status, reason}', (t) => {
    if (!smokeAvailable) {
      t.skip('blocked: brief/bin/lib/smoke-test.cjs not yet created (Plan 01)');
      return;
    }
    const matrix = smoke.buildMatrix(BRIEF_ROOT);
    for (const row of matrix) {
      for (const cell of row) {
        assert.ok(
          ['PASS', 'FAIL', 'SKIP'].includes(cell.status),
          `cell.status must be PASS/FAIL/SKIP, got: ${cell.status}`,
        );
        assert.strictEqual(typeof cell.reason, 'string', 'cell.reason is string');
      }
    }
  });

  test('RUNTIMES export contains exactly 4 names: claude, codex, gemini, opencode', (t) => {
    if (!smokeAvailable) {
      t.skip('blocked: brief/bin/lib/smoke-test.cjs not yet created (Plan 01)');
      return;
    }
    assert.ok(Array.isArray(smoke.RUNTIMES), 'smoke.RUNTIMES is an array');
    assert.deepStrictEqual(
      smoke.RUNTIMES.map((r) => r.name).sort(),
      ['claude', 'codex', 'gemini', 'opencode'],
      'exactly the 4 runtime names',
    );
  });

  test('COMMANDS export contains exactly the 5 critical commands: init/define/discover/design/deliver', (t) => {
    if (!smokeAvailable) {
      t.skip('blocked: brief/bin/lib/smoke-test.cjs not yet created (Plan 01)');
      return;
    }
    if (Array.isArray(smoke.COMMANDS)) {
      assert.deepStrictEqual(
        [...smoke.COMMANDS].sort(),
        [...COMMANDS].sort(),
        'COMMANDS export must match the 5 critical commands',
      );
    } else {
      // Plan 01 may inline COMMANDS into buildMatrix rather than exporting it.
      // The matrix-shape test above already pins width=5; this test is a
      // soft confirmation that mirrors the constants block.
      const matrix = smoke.buildMatrix(BRIEF_ROOT);
      assert.strictEqual(matrix[0].length, COMMANDS.length);
    }
  });
});
