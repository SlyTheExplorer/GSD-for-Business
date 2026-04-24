/**
 * Phase 06 Plan 06 Task 2 — Iteration-3 hard-cap vocabulary-lock tests.
 *
 * Locks D-07 hard-cap prompt against regression:
 *   - exact EN wording ("loop protection is engaged")
 *   - exactly 3 numbered options (1) (2) (3) in the hard-cap block
 *   - NO (4) or any 4th option
 *   - NO actionable "Force continue" choice (the hard-cap is locked no-bypass)
 *   - countIterations integrates correctly with the history-2-pushes fixture (returns 2)
 *
 * Also structurally locks align-gate.md Phase 6 integration:
 *   - Step 4.5 appears BEFORE Step 5A in file order
 *   - Step 8 appears AFTER Step 7 in file order
 *
 * Vocabulary source of truth: brief/workflows/gap-detect.md Step 5.2 + D-07
 * (06-CONTEXT.md lines 59-63; 06-RESEARCH.md lines 337-344).
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const GAP_WORKFLOW = fs.readFileSync(
  path.join(__dirname, '..', 'brief/workflows/gap-detect.md'),
  'utf-8'
);

// Extract the Step 5.2 hard-cap block: everything from the first HARD CAP / hard-cap
// occurrence up to the next '## ' heading. This isolates the prompt + options + note
// lines from the rest of the workflow so regex counts don't leak across sections.
function extractHardCapBlock(markdown) {
  const idx = markdown.search(/HARD CAP|hard-cap/i);
  if (idx <= 0) return '';
  const tail = markdown.slice(idx);
  const nextHeading = tail.search(/\n## /);
  return nextHeading > 0 ? tail.slice(0, nextHeading) : tail;
}

test('D-07 hard-cap prompt contains exact "loop protection is engaged" wording', () => {
  assert.ok(
    GAP_WORKFLOW.includes('loop protection is engaged'),
    'D-07 EN hard-cap wording missing — regression on 06-RESEARCH.md Pattern 6 locked phrasing'
  );
});

test('D-07 hard-cap has exactly 3 numbered options (no 4th option)', () => {
  const block = extractHardCapBlock(GAP_WORKFLOW);
  assert.ok(block.length > 0, 'hard-cap section not found');

  const opt1 = (block.match(/\(1\)/g) || []).length;
  const opt2 = (block.match(/\(2\)/g) || []).length;
  const opt3 = (block.match(/\(3\)/g) || []).length;
  const opt4 = (block.match(/\(4\)/g) || []).length;

  assert.ok(opt1 >= 1, 'Option (1) missing');
  assert.ok(opt2 >= 1, 'Option (2) missing');
  assert.ok(opt3 >= 1, 'Option (3) missing');
  assert.strictEqual(opt4, 0, 'Option (4) MUST NOT exist — D-07 no-bypass locked');
});

test('D-07 hard-cap has no actionable Force-continue / bypass option', () => {
  const block = extractHardCapBlock(GAP_WORKFLOW);
  // The workflow explicitly states "No option 4. No force-continue." as a
  // negation notice. We want to ensure force-continue appears ONLY in a
  // negation context (preceded by "No " or "no ") and never as a
  // selectable numbered option like "(N) Force continue" or
  // "N. Force continue".
  const actionableForcePattern = /\(\d+\)\s*[^\n.]*force[- ]continue|(?:^|\n)\s*\d+\.\s*.*force[- ]continue/i;
  assert.ok(
    !actionableForcePattern.test(block),
    'Force-continue appears as an actionable option — D-07 locked no-bypass; invariant broken'
  );

  // Same check for "bypass" as an actionable option.
  const actionableBypassPattern = /\(\d+\)\s*[^\n.]*bypass|(?:^|\n)\s*\d+\.\s*.*bypass/i;
  assert.ok(
    !actionableBypassPattern.test(block),
    'Bypass appears as an actionable option — D-07 locked no-bypass; invariant broken'
  );
});

test('countIterations with history-2-pushes fixture returns 2', () => {
  const { countIterations } = require('../brief/bin/lib/gap-detect.cjs');
  const history = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'fixtures/gap-detect/history-2-pushes.json'),
      'utf-8'
    )
  );
  const n = countIterations(history, 'go-to-market', 'market-sizing-korea-fintech-tam');
  assert.strictEqual(n, 2, 'history-2-pushes fixture should yield count 2');
});

test('align-gate.md structural: Step 4.5 appears BEFORE Step 5A', () => {
  const align = fs.readFileSync(
    path.join(__dirname, '..', 'brief/workflows/align-gate.md'),
    'utf-8'
  );
  const s45 = align.indexOf('## Step 4.5');
  const s5a = align.indexOf('## Step 5A');
  assert.ok(s45 > 0, 'Step 4.5 heading missing from align-gate.md');
  assert.ok(s5a > 0, 'Step 5A heading missing from align-gate.md');
  assert.ok(s45 < s5a, 'Step 4.5 must appear BEFORE Step 5A in align-gate.md');
});

test('align-gate.md structural: Step 8 appears AFTER Step 7', () => {
  const align = fs.readFileSync(
    path.join(__dirname, '..', 'brief/workflows/align-gate.md'),
    'utf-8'
  );
  const s7 = align.indexOf('## Step 7');
  const s8 = align.indexOf('## Step 8');
  assert.ok(s7 > 0, 'Step 7 heading missing from align-gate.md');
  assert.ok(s8 > 0, 'Step 8 heading missing from align-gate.md');
  assert.ok(s8 > s7, 'Step 8 must appear AFTER Step 7 in align-gate.md');
});
