'use strict';

/**
 * A4-style round-trip smoke for /brief-define Mode A (Greenfield).
 *
 * Phase 3 canary — Plan 02 scope:
 *   Cycle 1: fixture-aware test path short-circuits AskUserQuestion loop and
 *            drives the full lib path with canned Korean-language answers from
 *            tests/fixtures/korea-b2c-persona.json.
 *   Cycle 2 (config.json brief.* keys + atomic 3-file commit): DEFERRED to Plan 04.
 *   Cycle 3 (Mode B amend delta): DEFERRED to Plan 03.
 *
 * Contract under test (Plan 02 lib surface):
 *   runGsdTools(['define','apply','--fixture','korea-b2c-persona.json'], tmpDir)
 *   → writes tmpDir/.planning/OBJECTIVES.md with:
 *       - frontmatter: status=ready, mode=greenfield,
 *         immutable_items deep-equals ['creator-identity','core-value','problem-statement']
 *       - body: 11 canonical section headings from RESEARCH.md §Example 4
 *       - user's Korean free-text verbatim:
 *           '퇴근 후 혼자 집에서 운동하는 1인 가구 직장인' (fixture opening)
 *           'AI가 봐주면서'                               (fixture push_1_answer)
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

describe('/brief-define Mode A end-to-end (A4-style, Phase 3 canary — Plan 02 scope)', () => {
  let tmpDir;
  let objectivesPath;

  beforeEach(() => {
    tmpDir = createTempProject();
    objectivesPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('Cycle 1 — Mode A with Korea-first B2C fixture writes OBJECTIVES.md with correct shape', () => {
    const result = runGsdTools(
      ['define', 'apply', '--fixture', 'korea-b2c-persona.json'],
      tmpDir,
    );
    assert.ok(
      result.success,
      `define apply failed: ${result.error || result.output}`,
    );
    assert.ok(fs.existsSync(objectivesPath), 'OBJECTIVES.md created');

    const content = fs.readFileSync(objectivesPath, 'utf-8');
    const fm = extractFrontmatter(content);

    // Frontmatter shape (D-10 classification + D-07 immutable_items list)
    assert.strictEqual(fm.status, 'ready');
    assert.strictEqual(fm.mode, 'greenfield');
    assert.deepStrictEqual(
      fm.immutable_items,
      ['creator-identity', 'core-value', 'problem-statement'],
      'D-10 default classification heuristic applied',
    );

    // Body sections (RESEARCH.md Example 4) — must all appear as headings
    const requiredSections = [
      'Immutable Intent',
      'Creator Identity',
      'Core Value',
      'Problem Statement',
      'Mutable Hypotheses',
      'Target Audience Specifics',
      'Verification Metrics',
      'Hypothesized Alternative Tools / Competitors',
      'Dream State — Now',
      'Dream State — 3-month',
      'Dream State — 12-month',
    ];
    for (const section of requiredSections) {
      const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      assert.match(
        content,
        new RegExp(`^#{1,3}\\s+${escaped}`, 'm'),
        `section "${section}" present as heading in body`,
      );
    }

    // User's Korean free-text from fixture MUST appear verbatim in the body.
    assert.match(
      content,
      /퇴근 후 혼자 집에서 운동하는 1인 가구 직장인/,
      'fixture opening prose present in Mutable Hypotheses (target-audience)',
    );
    assert.match(
      content,
      /AI가 봐주면서/,
      'fixture push_twice push_1_answer present in Immutable Intent core-value section',
    );
  });
});
