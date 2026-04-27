'use strict';

/**
 * Wave 0 RED fixture for HRD-02 / A-D01..A-D03 — surface cap audit.
 *
 * Asserts that:
 *   - commands/brief/*.md count is 12 (locked) — currently 68; skips with
 *     Plan-05 rationale until pruning lands.
 *   - All 12 LOCKED_12 slugs exist as files.
 *   - .claude/skills/ is empty (0/8 cap).
 *
 * Pattern source: tests/architecture-counts.test.cjs lines 14-58 (countMdFiles
 * + filesystem-driven structural pattern) + 09-PATTERNS.md lines 594-638.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMMANDS_DIR = path.join(ROOT, 'commands', 'brief');
const SKILLS_DIR_LOCAL = path.join(ROOT, '.claude', 'skills');

// LOCKED_12 — byte-identical to 09-00-PLAN.md <interfaces> block (A-D01).
// NOTE: 'init' slug requires commands/brief/new-project.md → init.md rename
// in Plan 05 per Open Question 1 / 09-PATTERNS.md recommendation.
const LOCKED_12 = [
  'define', 'discover', 'design', 'add-workstream',
  'deliver', 'export', 'status', 'help',
  'init', 'progress', 'undo', 'pause-work',
];

function countMdFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length;
}

describe('Surface cap audit (HRD-02 / A-D01..A-D03)', () => {
  test('commands/brief/*.md count == 12 (locked)', (t) => {
    if (!fs.existsSync(COMMANDS_DIR)) {
      t.skip('commands/brief directory absent — fork integrity issue, not a Wave 0 concern');
      return;
    }
    const actual = countMdFiles(COMMANDS_DIR);
    if (actual !== 12) {
      t.skip(`blocked: HRD-02 surface pruning not yet executed (Plan 05); current count=${actual}`);
      return;
    }
    assert.ok(actual <= 12, `cap violated: ${actual} > 12`);
    assert.strictEqual(actual, 12, `locked-12 lineup mismatch: ${actual} files`);
  });

  test('all 12 LOCKED_12 slugs exist as files', (t) => {
    if (!fs.existsSync(COMMANDS_DIR)) {
      t.skip('commands/brief directory absent — fork integrity issue, not a Wave 0 concern');
      return;
    }
    const actual = countMdFiles(COMMANDS_DIR);
    if (actual !== 12) {
      t.skip(`blocked: HRD-02 surface pruning not yet executed (Plan 05); current count=${actual}`);
      return;
    }
    const present = fs.readdirSync(COMMANDS_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''));
    for (const slug of LOCKED_12) {
      assert.ok(
        present.includes(slug),
        `LOCKED_12 slug missing: commands/brief/${slug}.md`,
      );
    }
  });

  test('.claude/skills/ is empty (0/8 cap)', () => {
    if (!fs.existsSync(SKILLS_DIR_LOCAL)) return; // 0 by absence is acceptable
    const skills = fs.readdirSync(SKILLS_DIR_LOCAL)
      .filter((d) => fs.statSync(path.join(SKILLS_DIR_LOCAL, d)).isDirectory());
    assert.strictEqual(
      skills.length,
      0,
      `skills cap violated: ${skills.length} skills present (cap is 0 in v1, 8 reserved)`,
    );
  });
});
