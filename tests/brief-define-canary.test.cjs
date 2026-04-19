'use strict';

/**
 * Phase 3 canary structural assertion.
 *
 * The canary property (CONTEXT.md <domain>): /brief-define writes OBJECTIVES.md
 * via the same orchestrator-workers triangle (command.md → workflow.md → lib.cjs)
 * that Phase 5+ will replicate. This test asserts the wiring is in place,
 * NOT the runtime behavior (the Mode A / Mode B / atomic-commit tests cover
 * behavior). Structural failure here is a sign Phase 5+ can't reuse the pattern.
 *
 * Checks:
 *  1. commands/brief/define.md points at brief/workflows/define.md
 *  2. brief/bin/brief-tools.cjs routes `case 'define':` → require('./lib/define.cjs')
 *  3. brief/bin/lib/objectives.cjs exports the 5 primitives Phase 5+ consumes
 *  4. brief/bin/lib/define.cjs exports the full Plan 02/03/04 primitive set
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

describe('Phase 3 canary: orchestrator-workers pattern wired end-to-end', () => {
  test('commands/brief/define.md references brief/workflows/define.md', () => {
    const cmdMd = fs.readFileSync(
      path.join(ROOT, 'commands', 'brief', 'define.md'),
      'utf-8',
    );
    assert.match(cmdMd, /brief\/workflows\/define\.md/);
  });

  test("brief-tools.cjs routes `define` command to lib/define.cjs", () => {
    const toolsCjs = fs.readFileSync(
      path.join(ROOT, 'brief', 'bin', 'brief-tools.cjs'),
      'utf-8',
    );
    assert.match(toolsCjs, /case 'define'/);
    assert.match(toolsCjs, /require\(['"]\.\/lib\/define\.cjs['"]\)/);
  });

  test('objectives.cjs exports 5 primitives Phase 5+ reuses', () => {
    const obj = require('../brief/bin/lib/objectives.cjs');
    for (const fn of [
      'writeObjectivesMd',
      'readObjectivesMd',
      'validateObjectivesComplete',
      'checkStaleAnchor',
      'enforceImmutableLock',
    ]) {
      assert.strictEqual(
        typeof obj[fn],
        'function',
        `${fn} exported from objectives.cjs`,
      );
    }
  });

  test('define.cjs exports flow-controller + 4-config + atomic-commit primitives', () => {
    const def = require('../brief/bin/lib/define.cjs');
    for (const fn of [
      'cmdDefineApply',
      'applyFromFixture',
      'applyModeBAmendment',
      'detectKoreaSignals',
      'writeConfigBrief',
      'performAtomicCommit',
    ]) {
      assert.strictEqual(
        typeof def[fn],
        'function',
        `${fn} exported from define.cjs`,
      );
    }
  });
});
