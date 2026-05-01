'use strict';

/**
 * Next Up /clear Order Tests (#1623)
 *
 * Validates that /clear always appears BEFORE the command in Next Up blocks,
 * not as a <sub> footnote after the command. Users should see /clear first
 * so they run it before copy-pasting the actual command.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const glob = require('path');

const GSD_ROOT = path.join(__dirname, '..', 'brief');
const UI_BRAND = path.join(GSD_ROOT, 'references', 'ui-brand.md');
const CONTINUATION_FORMAT = path.join(GSD_ROOT, 'references', 'continuation-format.md');
const WORKFLOWS_DIR = path.join(GSD_ROOT, 'workflows');

/**
 * Recursively collect all .md files in a directory.
 */
function collectMarkdownFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(full));
    } else if (entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

// HRD-05a closure: ui-brand.md ties to gsd-ui-researcher / gsd-ui-checker agents,
// intentionally absent post-Phase-1 FND-02 (developer surface removal). Not in LOCKED_12.
// Assertions removed per PATTERNS.md ALL-DELETE rubric.
describe.skip('ui-brand.md — Next Up template has /clear before command — HRD-05a closure: ui-brand.md not in LOCKED_12', () => {
  test('removed: ui-brand.md is GSD-only and not in locked-12 lineup (HRD-05a closure)', () => {});
});

describe('continuation-format.md — Next Up examples have /clear before commands', () => {
  const content = fs.readFileSync(CONTINUATION_FORMAT, 'utf-8');

  test('no <sub>/clear patterns remain', () => {
    const subClearPattern = /<sub>[^<]*\/clear[^<]*<\/sub>/gi;
    const matches = content.match(subClearPattern);
    assert.strictEqual(
      matches,
      null,
      'continuation-format.md must not contain <sub>/clear</sub> pattern'
    );
  });
});

describe('workflow files — no <sub>/clear patterns in Next Up blocks', () => {
  const workflowFiles = collectMarkdownFiles(WORKFLOWS_DIR);

  test('found workflow .md files to scan', () => {
    assert.ok(
      workflowFiles.length > 0,
      `Expected workflow .md files in ${WORKFLOWS_DIR}`
    );
  });

  test('no workflow file contains <sub> with /clear', () => {
    const subClearPattern = /<sub>[^<]*\/clear[^<]*<\/sub>/gi;
    const failures = [];

    for (const filePath of workflowFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(subClearPattern);
      if (matches) {
        failures.push({
          file: path.relative(GSD_ROOT, filePath),
          matches: matches.length,
          examples: matches.slice(0, 3),
        });
      }
    }

    assert.strictEqual(
      failures.length,
      0,
      `Found <sub>/clear</sub> pattern in ${failures.length} workflow file(s):\n` +
        failures
          .map(
            (f) =>
              `  ${f.file}: ${f.matches} match(es) — e.g. ${f.examples[0]}`
          )
          .join('\n')
    );
  });
});

describe('reference files — no <sub>/clear patterns', () => {
  const referencesDir = path.join(GSD_ROOT, 'references');
  const refFiles = collectMarkdownFiles(referencesDir);

  test('found reference .md files to scan', () => {
    assert.ok(
      refFiles.length > 0,
      `Expected reference .md files in ${referencesDir}`
    );
  });

  test('no reference file contains <sub> with /clear', () => {
    const subClearPattern = /<sub>[^<]*\/clear[^<]*<\/sub>/gi;
    const failures = [];

    for (const filePath of refFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(subClearPattern);
      if (matches) {
        failures.push({
          file: path.relative(GSD_ROOT, filePath),
          matches: matches.length,
          examples: matches.slice(0, 3),
        });
      }
    }

    assert.strictEqual(
      failures.length,
      0,
      `Found <sub>/clear</sub> pattern in ${failures.length} reference file(s):\n` +
        failures
          .map(
            (f) =>
              `  ${f.file}: ${f.matches} match(es) — e.g. ${f.examples[0]}`
          )
          .join('\n')
    );
  });
});
