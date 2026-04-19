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
const { execFileSync } = require('node:child_process');
const {
  runGsdTools,
  createTempProject,
  createTempGitProjectWithConfig,
  cleanup,
} = require('./helpers.cjs');
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

// ─── Cycles 2+3+4+5 (Plan 03-04) ─────────────────────────────────────────────
//
// Uses createTempGitProjectWithConfig (B-3) because Plan 04's rewritten
// applyFromFixture issues a `brief-tools commit` subprocess — git must be
// initialized AND have a seed HEAD commit for the atomic-commit cycle to
// produce the expected 3-file commit.
describe('/brief-define Mode A Cycles 2+3+4+5 (config + atomic commit + roundtrip + non-Korea)', () => {
  let tmpDir;
  let objectivesPath;
  let configPath;

  beforeEach(() => {
    tmpDir = createTempGitProjectWithConfig();
    objectivesPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    configPath = path.join(tmpDir, '.planning', 'config.json');
  });
  afterEach(() => {
    cleanup(tmpDir);
  });

  test('Cycle 2 — config.json extended with brief.* keys; other keys preserved', () => {
    const r = runGsdTools(
      ['define', 'apply', '--fixture', 'korea-b2c-persona.json'],
      tmpDir,
    );
    assert.ok(r.success, `define apply failed: ${r.error || r.output}`);
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.deepStrictEqual(cfg.brief, {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
    });
    // createTempGitProjectWithConfig seeds baseline keys — they must survive
    // the merge (DEF-04 preserves non-brief keys).
    assert.strictEqual(cfg.model_profile, 'quality', 'model_profile untouched');
    assert.strictEqual(cfg.mode, 'interactive', 'mode untouched');
    assert.strictEqual(cfg.granularity, 'fine', 'granularity untouched');
  });

  test('Cycle 3 — atomic commit contains exactly 3 planning files (B-1 direct execFileSync)', () => {
    const r = runGsdTools(
      ['define', 'apply', '--fixture', 'korea-b2c-persona.json'],
      tmpDir,
    );
    assert.ok(r.success, `define apply failed: ${r.error || r.output}`);
    // B-1: direct execFileSync — brief-tools has no `case 'shell':`
    const out = execFileSync(
      'git',
      ['log', '-1', '--name-only', '--format='],
      { cwd: tmpDir, encoding: 'utf-8' },
    );
    const files = out.trim().split('\n').filter(Boolean).sort();
    assert.deepStrictEqual(
      files,
      [
        '.planning/OBJECTIVES.md',
        '.planning/STATE.md',
        '.planning/config.json',
      ].sort(),
      'exactly 3 planning files in single atomic commit',
    );
  });

  test('Cycle 4 — OBJECTIVES.md round-trips via frontmatter.cjs (D-20) without drift', () => {
    const r = runGsdTools(
      ['define', 'apply', '--fixture', 'korea-b2c-persona.json'],
      tmpDir,
    );
    assert.ok(r.success, `define apply failed: ${r.error || r.output}`);
    const content1 = fs.readFileSync(objectivesPath, 'utf-8');
    const fm1 = extractFrontmatter(content1);
    const fm2 = extractFrontmatter(fs.readFileSync(objectivesPath, 'utf-8'));
    assert.deepStrictEqual(fm2, fm1, 'frontmatter stable across re-read');
  });

  test('Cycle 5 (B-6 negative) — non-Korea fixture produces compliance_packs: []', () => {
    const r = runGsdTools(
      ['define', 'apply', '--fixture', 'non-korea-b2b-persona.json'],
      tmpDir,
    );
    assert.ok(
      r.success,
      `define apply failed on non-Korea fixture: ${r.error || r.output}`,
    );
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.deepStrictEqual(
      cfg.brief.compliance_packs,
      [],
      'non-Korea transcript → inferredCompliance empty → compliance_packs: []',
    );
    // Sanity: business_model / region / audience_policy still fell through
    // from the fixture's expected_configs.
    assert.strictEqual(cfg.brief.business_model, 'b2b');
    assert.strictEqual(cfg.brief.region, 'us');
    assert.strictEqual(cfg.brief.audience_policy, 'partner');
  });
});
