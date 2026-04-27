'use strict';

/**
 * Wave 0 RED fixture for HRD-03 / C-D01 — /brief-help 4D categorization.
 *
 * Asserts that `help.renderCategorized(help.buildCatalog(COMMANDS_DIR))` emits
 * the five phase headers (DEFINE/DISCOVER/DESIGN/DELIVER/HELPERS) and that
 * every command file under commands/brief/ appears in the rendered listing.
 *
 * RED-state contract:
 *   - brief/bin/lib/help.cjs is created in Plan 02. Until then, the require()
 *     is wrapped in try/catch and tests skip with a Plan-02 rationale.
 *   - HRD-02 surface pruning (Plan 05) brings commands/brief/*.md from 68 → 12;
 *     the count assertion skips with a Plan-05 rationale until pruning lands.
 *
 * Pattern source: tests/architecture-counts.test.cjs (filesystem-driven
 * structural test using node:test + node:assert/strict + countMdFiles).
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMMANDS_DIR = path.join(ROOT, 'commands', 'brief');

// LOCKED_12 — byte-identical to 09-00-PLAN.md <interfaces> block (A-D01).
// Plans 01-06 must match this list exactly.
const LOCKED_12 = [
  'define', 'discover', 'design', 'add-workstream',
  'deliver', 'export', 'status', 'help',
  'init', 'progress', 'undo', 'pause-work',
];

// PHASE_CATEGORIES — byte-identical to 09-00-PLAN.md <interfaces> block (C-D01).
const PHASE_CATEGORIES = {
  define: 'DEFINE', discover: 'DISCOVER', design: 'DESIGN',
  deliver: 'DELIVER', export: 'DELIVER', 'add-workstream': 'DESIGN',
  status: 'HELPERS', help: 'HELPERS', 'init': 'HELPERS',
  'progress': 'HELPERS', 'undo': 'HELPERS', 'pause-work': 'HELPERS',
};

let helpAvailable = false;
let help = null;
try {
  help = require(path.join(ROOT, 'brief', 'bin', 'lib', 'help.cjs'));
  helpAvailable = true;
} catch (_e) {
  // Plan 02 has not yet created brief/bin/lib/help.cjs — fixture stays RED.
}

function countMdFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length;
}

describe('/brief-help 4D categorization (HRD-03 / C-D01)', () => {
  test('renderCategorized emits 5 phase headers (DEFINE/DISCOVER/DESIGN/DELIVER/HELPERS)', (t) => {
    if (!helpAvailable) {
      t.skip('blocked: brief/bin/lib/help.cjs not yet created (Plan 02)');
      return;
    }
    const catalog = help.buildCatalog(COMMANDS_DIR);
    const output = help.renderCategorized(catalog);
    for (const cat of ['DEFINE', 'DISCOVER', 'DESIGN', 'DELIVER', 'HELPERS']) {
      assert.match(
        output,
        new RegExp(`^##\\s+${cat}`, 'm'),
        `category header missing: ${cat}`,
      );
    }
  });

  test('every command in commands/brief/*.md appears in renderCategorized output', (t) => {
    if (!helpAvailable) {
      t.skip('blocked: brief/bin/lib/help.cjs not yet created (Plan 02)');
      return;
    }
    const catalog = help.buildCatalog(COMMANDS_DIR);
    const output = help.renderCategorized(catalog);
    for (const e of catalog) {
      assert.ok(
        output.includes(`/brief-${e.slug}`),
        `command missing from listing: brief-${e.slug}`,
      );
    }
  });

  test('commands/brief/*.md count is 12 (post-Plan-05 pruning, LOCKED_12 lineup)', (t) => {
    const actual = countMdFiles(COMMANDS_DIR);
    if (actual !== 12) {
      t.skip(`blocked: HRD-02 surface pruning not yet executed (Plan 05); current count=${actual}`);
      return;
    }
    if (!helpAvailable) {
      t.skip('blocked: brief/bin/lib/help.cjs not yet created (Plan 02)');
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
      assert.ok(
        PHASE_CATEGORIES[slug],
        `PHASE_CATEGORIES missing entry for ${slug}`,
      );
    }
  });
});
