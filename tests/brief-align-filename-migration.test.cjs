/**
 * brief-align-filename-migration.test.cjs — Plan 05-05 Task 4.
 *
 * D-12 audit: locks the migration from `.planning/ALIGN-00.md` to
 * `.planning/OBJECTIVES.align.md`. Any future edit that re-introduces the
 * ALIGN-00 filename (in code, workflow, agent, or reference text) will be
 * caught by this grep-audit test.
 *
 * References:
 *   - 05-05-PLAN.md Task 4 (test-id 5-05-02)
 *   - 05-RESEARCH.md §Runtime State Inventory D-12 grep recipe
 *   - 05-CONTEXT.md D-12 (paired-sibling scheme lock)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

test('D-12 audit: grep ALIGN-00 across brief/ agents/ commands/brief/ hooks/ returns zero', () => {
  let matches = '';
  try {
    matches = execSync('grep -rn "ALIGN-00" brief/ agents/ commands/brief/ hooks/ 2>/dev/null', {
      cwd: ROOT,
      encoding: 'utf-8',
    });
  } catch (err) {
    // grep returns 1 when no match — this is the expected-success case
    if (err.status === 1) {
      matches = '';
    } else {
      throw err;
    }
  }
  assert.equal(matches.trim(), '', `D-12 migration incomplete — residual ALIGN-00 refs:\n${matches}`);
});

test('D-12: align.cjs commitAlignVerdict writes to OBJECTIVES.align.md', () => {
  const content = fs.readFileSync(path.join(ROOT, 'brief/bin/lib/align.cjs'), 'utf-8');
  // Must contain the new path
  assert.match(content, /'OBJECTIVES\.align\.md'/);
  // Must NOT contain the old path
  assert.doesNotMatch(content, /ALIGN-00/);
});

test('D-12: align-report.cjs docstring updated', () => {
  const content = fs.readFileSync(path.join(ROOT, 'brief/bin/lib/align-report.cjs'), 'utf-8');
  assert.match(content, /OBJECTIVES\.align\.md/);
  assert.doesNotMatch(content, /ALIGN-00/);
});

test('D-12: brief-tools.cjs success output references new path', () => {
  const content = fs.readFileSync(path.join(ROOT, 'brief/bin/brief-tools.cjs'), 'utf-8');
  assert.match(content, /OBJECTIVES\.align\.md/);
});

test('D-12: align-gate workflow has zero ALIGN-00 residuals', () => {
  const content = fs.readFileSync(path.join(ROOT, 'brief/workflows/align-gate.md'), 'utf-8');
  assert.doesNotMatch(content, /ALIGN-00/);
  assert.match(content, /OBJECTIVES\.align\.md/);
});

test('D-12: define workflow has zero ALIGN-00 residuals', () => {
  const content = fs.readFileSync(path.join(ROOT, 'brief/workflows/define.md'), 'utf-8');
  assert.doesNotMatch(content, /ALIGN-00/);
});

test('D-12: brief-align-gate agent has zero ALIGN-00 residuals', () => {
  const content = fs.readFileSync(path.join(ROOT, 'agents/brief-align-gate.md'), 'utf-8');
  assert.doesNotMatch(content, /ALIGN-00/);
});

test('D-12: align-vocabulary reference has zero ALIGN-00 residuals', () => {
  const content = fs.readFileSync(path.join(ROOT, 'brief/references/align-vocabulary.md'), 'utf-8');
  assert.doesNotMatch(content, /ALIGN-00/);
});

test('D-12 paired-sibling scheme consistent: OBJECTIVES.align.md is the sibling of OBJECTIVES.md', () => {
  // Verify the sibling helper gives the right answer for the Phase 4 canary path too.
  // Phase 4's canary runs on OBJECTIVES.md as both candidate AND baseline, so
  // the sibling `.align.md` filename `OBJECTIVES.align.md` is exactly the D-12 target.
  const audience = require('../brief/bin/lib/audience.cjs');
  assert.equal(
    audience.siblingReportPath('/abs/.planning/OBJECTIVES.md', 'align'),
    '/abs/.planning/OBJECTIVES.align.md',
  );
});
