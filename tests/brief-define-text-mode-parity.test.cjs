'use strict';

/**
 * /brief-define text_mode parity — FND-06 flowdown, Plan 03-06.
 *
 * Proves that the Mode A fixture path produces byte-equivalent OBJECTIVES.md
 * whether the project config has `workflow.text_mode: true` (Codex / Gemini /
 * OpenCode runtime fallback) or `false` (AskUserQuestion-capable runtimes).
 *
 * Normalization: ISO-8601 timestamps (`created_at`, `last_amended`) differ
 * by microseconds between runs — replace with `<TS>` before equality.
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  createTempGitProjectWithConfig,
  cleanup,
  runGsdTools,
} = require('./helpers.cjs');

describe('/brief-define text_mode parity (FND-06 flowdown)', () => {
  let tmpA, tmpB;
  beforeEach(() => {
    tmpA = createTempGitProjectWithConfig();
    tmpB = createTempGitProjectWithConfig();
  });
  afterEach(() => { cleanup(tmpA); cleanup(tmpB); });

  test('AskUserQuestion path and text_mode path produce byte-equivalent OBJECTIVES.md for the same canonical fixture', () => {
    // tmpA: default mode. BRIEF_BASELINE_CONFIG already seeds
    // workflow.text_mode: false — leave as-is so this path represents the
    // AskUserQuestion-capable runtime.
    const rA = runGsdTools(
      ['define', 'apply', '--fixture', 'korea-b2c-persona.json'],
      tmpA,
    );
    assert.ok(rA.success, `apply A failed: ${rA.error || rA.output}`);

    // tmpB: flip workflow.text_mode: true. The fixture short-circuits the
    // AskUserQuestion loop in both cases, so text_mode parity reduces to:
    // the dispatcher output is insensitive to the text_mode flag for
    // fixture-driven applies (which is what FND-06 requires at the I/O layer).
    const cfgPathB = path.join(tmpB, '.planning', 'config.json');
    const cfgB = JSON.parse(fs.readFileSync(cfgPathB, 'utf-8'));
    cfgB.workflow = cfgB.workflow || {};
    cfgB.workflow.text_mode = true;
    fs.writeFileSync(cfgPathB, JSON.stringify(cfgB, null, 2) + '\n');

    const rB = runGsdTools(
      ['define', 'apply', '--fixture', 'korea-b2c-persona.json'],
      tmpB,
    );
    assert.ok(rB.success, `apply B failed: ${rB.error || rB.output}`);

    const objA = fs.readFileSync(
      path.join(tmpA, '.planning', 'OBJECTIVES.md'),
      'utf-8',
    );
    const objB = fs.readFileSync(
      path.join(tmpB, '.planning', 'OBJECTIVES.md'),
      'utf-8',
    );

    // Timestamps differ between runs — normalize before byte comparison.
    const normalize = (s) => s.replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, '<TS>');
    assert.strictEqual(
      normalize(objA),
      normalize(objB),
      'text_mode=true produces identical OBJECTIVES.md as AskUserQuestion mode (FND-06)',
    );
  });
});
