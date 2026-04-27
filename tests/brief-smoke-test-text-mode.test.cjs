'use strict';

/**
 * Wave 0 RED fixture for HRD-01 / B-D03 — text_mode fallback per runtime.
 *
 * Asserts that:
 *   - Claude runtime defaults to text_mode_default=false (AskUserQuestion live).
 *   - Codex / Gemini / OpenCode default to text_mode_default=true (plain-text fallback).
 *   - When smoke.smokeOneCell is invoked for a non-Claude runtime, FAIL must
 *     not be due to text_mode plumbing breakage.
 *
 * RED-state contract: brief/bin/lib/smoke-test.cjs is created in Plan 01.
 * Until then, every test skips with a Plan-01 rationale.
 *
 * Pattern source: tests/ask-user-questions-fallback.test.cjs lines 30-50
 * (TEXT_MODE structural test) + 09-PATTERNS.md lines 555-583.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const BRIEF_ROOT = path.join(__dirname, '..');

// RUNTIMES — byte-identical to 09-00-PLAN.md <interfaces> block (B-D01 + B-D03).
// INSTRUCTION_FILE env is the canonical non-Claude detector for text_mode_default=true.
const RUNTIMES = [
  { name: 'claude',   env: {                                   text_mode_default: false } },
  { name: 'codex',    env: { INSTRUCTION_FILE: 'AGENTS.md',    text_mode_default: true  } },
  { name: 'gemini',   env: {                                   text_mode_default: true  } },
  { name: 'opencode', env: {                                   text_mode_default: true  } },
];

let smokeAvailable = false;
let smoke = null;
try {
  smoke = require(path.join(BRIEF_ROOT, 'brief', 'bin', 'lib', 'smoke-test.cjs'));
  smokeAvailable = true;
} catch (_e) {
  // Plan 01 has not yet created brief/bin/lib/smoke-test.cjs — fixture stays RED.
}

describe('text_mode fallback per runtime (HRD-01 / B-D03)', () => {
  test('non-Claude runtime cell with INSTRUCTION_FILE env emits no AskUserQuestion text_mode breakage', (t) => {
    if (!smokeAvailable) {
      t.skip('blocked: brief/bin/lib/smoke-test.cjs not yet created (Plan 01)');
      return;
    }
    const codex = smoke.RUNTIMES.find((r) => r.name === 'codex');
    assert.ok(codex, 'smoke.RUNTIMES must contain a codex entry');
    const cell = smoke.smokeOneCell(codex, 'init', BRIEF_ROOT);
    // FAIL is acceptable if reason is not text-mode-related; the load-bearing
    // assertion is that text_mode env reaches brief-tools.cjs cleanly.
    if (cell.status === 'FAIL') {
      assert.ok(
        !cell.reason.includes('text_mode'),
        `FAIL must not be due to text_mode plumbing breakage, got reason: ${cell.reason}`,
      );
    }
  });

  test('claude runtime has text_mode_default=false (AskUserQuestion enabled)', (t) => {
    if (!smokeAvailable) {
      t.skip('blocked: brief/bin/lib/smoke-test.cjs not yet created (Plan 01)');
      return;
    }
    const claude = smoke.RUNTIMES.find((r) => r.name === 'claude');
    assert.ok(claude, 'smoke.RUNTIMES must contain a claude entry');
    assert.strictEqual(
      claude.env.text_mode_default,
      false,
      'claude defaults to text_mode_default=false (interactive AskUserQuestion)',
    );
  });

  test('codex / gemini / opencode runtimes have text_mode_default=true (plain-text fallback)', (t) => {
    if (!smokeAvailable) {
      t.skip('blocked: brief/bin/lib/smoke-test.cjs not yet created (Plan 01)');
      return;
    }
    for (const expected of RUNTIMES) {
      if (expected.name === 'claude') continue;
      const rt = smoke.RUNTIMES.find((r) => r.name === expected.name);
      assert.ok(rt, `smoke.RUNTIMES must contain a ${expected.name} entry`);
      assert.strictEqual(
        rt.env.text_mode_default,
        true,
        `${rt.name} must default to text_mode_default=true`,
      );
    }
  });

  test('codex runtime has INSTRUCTION_FILE=AGENTS.md (canonical non-Claude marker)', (t) => {
    if (!smokeAvailable) {
      t.skip('blocked: brief/bin/lib/smoke-test.cjs not yet created (Plan 01)');
      return;
    }
    const codex = smoke.RUNTIMES.find((r) => r.name === 'codex');
    assert.ok(codex, 'smoke.RUNTIMES must contain a codex entry');
    assert.strictEqual(
      codex.env.INSTRUCTION_FILE,
      'AGENTS.md',
      "codex env must set INSTRUCTION_FILE='AGENTS.md' for runtime detection",
    );
  });
});
