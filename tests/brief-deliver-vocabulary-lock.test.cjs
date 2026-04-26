/**
 * brief-deliver-vocabulary-lock.test.cjs — Phase 8 Plan 08-08 Wave 0 RED.
 *
 * Phase 4·5·7 vocabulary-lock inheritance — assert ZERO occurrences of the
 * canonical AUDIENCE/COMPLIANCE ban-list vocabulary in Phase 8 NEW source
 * files (Pitfall #4 vocabulary theater preservation).
 *
 * Banlist (combined Phase 4 + 5 + 7 + 8 inheritance):
 *   EN: compliant | passed | violation | failed
 *   KO: 준수 | 통과 | 위반 | 실패
 *   Symbols: ✅ | ✓ | ✗
 *
 * Covered Phase 8 NEW source surfaces:
 *   - brief/bin/lib/deliver.cjs                (Plan 01)
 *   - brief/bin/lib/voice-fit.cjs              (Plan 02 — banned vocabulary lists themselves are CONST DECLARATIONS)
 *   - brief/bin/lib/leakage-diff.cjs           (Plan 03)
 *   - brief/bin/lib/export.cjs                 (Plan 04 — symbols ✓ ⚠ permitted in formatConfirmUI Korean variant)
 *   - agents/brief-deliver-type-a.md           (Plan 05)
 *   - agents/brief-deliver-type-b.md           (Plan 06 — banned-vocabulary lists permitted inside <banned_vocabulary> blocks ONLY)
 *   - brief/templates/deliver/type-a/*.md      (4 templates)
 *   - brief/templates/deliver/type-b/*.md      (4 templates)
 *   - hooks/brief-validate-frontmatter.sh      (Plan 07)
 *   - commands/brief/deliver.md                (Plan 08 — created by Task 2)
 *   - commands/brief/export.md                 (Plan 08 — created by Task 2)
 *   - brief/workflows/deliver.md               (Plan 08 — created by Task 2)
 *   - brief/workflows/export.md                (Plan 08 — created by Task 2)
 *
 * Strip discipline:
 *   - Frontmatter (YAML) and code blocks (``` … ```) are stripped before assertion.
 *   - <banned_vocabulary>…</banned_vocabulary> blocks are stripped (declarations
 *     of forbidden words are NOT usage of forbidden words).
 *   - HTML comments (<!-- … -->) are stripped — template INSERT markers may
 *     mention banned tokens descriptively in comments.
 *   - For voice-fit.cjs: BANNED_EN / BANNED_KO regex literals (the lists themselves)
 *     are inside JS source as regex sources — these are declarations, not narrative.
 *     Tested via additional fenced-region strip rule.
 *
 * Wave 0 RED contract:
 *   - Some files do not exist yet (commands/brief/deliver.md, commands/brief/export.md,
 *     brief/workflows/deliver.md, brief/workflows/export.md). Tests treat
 *     ENOENT as RED failure mode (Task 2 will land these files).
 *
 * References:
 *   - tests/brief-audience-vocabulary-lock.test.cjs (Phase 5)
 *   - tests/brief-compliance-vocabulary-lock.test.cjs (Phase 7)
 *   - .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-08-PLAN.md Task 1
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');

const BAN_TOKENS_EN = ['compliant', 'passed', 'violation', 'failed'];
const BAN_TOKENS_KO = ['준수', '통과', '위반', '실패'];
const BAN_SYMBOLS = ['✅', '✓', '✗'];

/**
 * Strip frontmatter, fenced code blocks, HTML comments, inline backtick code,
 * and <banned_vocabulary> blocks from `content`. The remainder is the
 * "narrative content" subject to vocabulary-lock assertions.
 */
function stripNonNarrative(content) {
  return content
    // YAML frontmatter
    .replace(/^---\s*[\s\S]*?\n---\s*/m, '')
    // HTML / Markdown comments (template INSERT markers)
    .replace(/<!--[\s\S]*?-->/g, '')
    // Fenced code blocks (```lang ... ```)
    .replace(/```[\s\S]*?```/g, '')
    // Inline backticks (single-line)
    .replace(/`[^`\n]+`/g, '')
    // Banned-vocabulary declaration blocks (agent prompts cite forbidden words)
    .replace(/<banned_vocabulary>[\s\S]*?<\/banned_vocabulary>/g, '')
    // Vocabulary discipline blocks (agent prompts may cite forbidden words)
    .replace(/<vocabulary_discipline>[\s\S]*?<\/vocabulary_discipline>/g, '');
}

function assertNoBannedVocabulary(content, label) {
  const stripped = stripNonNarrative(content);
  for (const tok of BAN_TOKENS_EN) {
    const re = new RegExp(`\\b${tok}\\b`, 'gi');
    const matches = stripped.match(re);
    if (matches) {
      assert.fail(`[${label}] EN ban-list token '${tok}' appeared ${matches.length}× in narrative content. Phase 4·5·7 ban-list inheritance violated. (Snippet around first hit: "${stripped.match(new RegExp(`.{0,40}\\b${tok}\\b.{0,40}`, 'i'))?.[0] || '?'}")`);
    }
  }
  for (const tok of BAN_TOKENS_KO) {
    if (stripped.includes(tok)) {
      assert.fail(`[${label}] KO ban-list token '${tok}' appeared in narrative content. Phase 4·5·7 ban-list inheritance violated.`);
    }
  }
}

function assertNoBannedSymbols(content, label) {
  const stripped = stripNonNarrative(content);
  for (const sym of BAN_SYMBOLS) {
    if (stripped.includes(sym)) {
      assert.fail(`[${label}] Ban-list symbol '${sym}' appeared in narrative content. Phase 4·5·7 ban-list inheritance violated.`);
    }
  }
}

function readIfExists(absPath) {
  if (!fs.existsSync(absPath)) return null;
  return fs.readFileSync(absPath, 'utf-8');
}

// ─── Test 1: Phase 8 NEW lib files have no ban-list vocabulary ───────────

test('vocabulary-lock: brief/bin/lib/deliver.cjs has no banned vocabulary in narrative content', () => {
  const content = readIfExists(path.join(REPO_ROOT, 'brief/bin/lib/deliver.cjs'));
  assert.ok(content !== null, 'brief/bin/lib/deliver.cjs must exist (Plan 01)');
  assertNoBannedVocabulary(content, 'brief/bin/lib/deliver.cjs');
});

test('vocabulary-lock: brief/bin/lib/leakage-diff.cjs has no banned vocabulary in narrative content', () => {
  const content = readIfExists(path.join(REPO_ROOT, 'brief/bin/lib/leakage-diff.cjs'));
  assert.ok(content !== null, 'brief/bin/lib/leakage-diff.cjs must exist (Plan 03)');
  assertNoBannedVocabulary(content, 'brief/bin/lib/leakage-diff.cjs');
});

// ─── Test 2: Phase 8 NEW agent files have no ban-list vocabulary in body ─

test('vocabulary-lock: agents/brief-deliver-type-a.md has no banned vocabulary in narrative content', () => {
  const content = readIfExists(path.join(REPO_ROOT, 'agents/brief-deliver-type-a.md'));
  assert.ok(content !== null, 'agents/brief-deliver-type-a.md must exist (Plan 05)');
  assertNoBannedVocabulary(content, 'agents/brief-deliver-type-a.md');
});

test('vocabulary-lock: agents/brief-deliver-type-b.md has no banned vocabulary OUTSIDE <banned_vocabulary> blocks', () => {
  const content = readIfExists(path.join(REPO_ROOT, 'agents/brief-deliver-type-b.md'));
  assert.ok(content !== null, 'agents/brief-deliver-type-b.md must exist (Plan 06)');
  assertNoBannedVocabulary(content, 'agents/brief-deliver-type-b.md');
});

// ─── Test 3: Phase 8 NEW Type A + Type B templates have no ban-list ─────

test('vocabulary-lock: brief/templates/deliver/type-a/*.md (4 templates) have no banned vocabulary', () => {
  const dir = path.join(REPO_ROOT, 'brief/templates/deliver/type-a');
  assert.ok(fs.existsSync(dir), 'brief/templates/deliver/type-a/ must exist (Plan 05)');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  assert.ok(files.length >= 4, `type-a/ must contain ≥4 templates (got ${files.length})`);
  for (const f of files) {
    assertNoBannedVocabulary(fs.readFileSync(path.join(dir, f), 'utf-8'), `templates/type-a/${f}`);
  }
});

test('vocabulary-lock: brief/templates/deliver/type-b/*.md (4 templates) have no banned vocabulary', () => {
  const dir = path.join(REPO_ROOT, 'brief/templates/deliver/type-b');
  assert.ok(fs.existsSync(dir), 'brief/templates/deliver/type-b/ must exist (Plan 06)');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  assert.ok(files.length >= 4, `type-b/ must contain ≥4 templates (got ${files.length})`);
  for (const f of files) {
    assertNoBannedVocabulary(fs.readFileSync(path.join(dir, f), 'utf-8'), `templates/type-b/${f}`);
  }
});

// ─── Test 4: Phase 8 NEW commands + workflows (Task 2) have no ban-list ─

test('vocabulary-lock: commands/brief/deliver.md has no banned vocabulary in narrative content', () => {
  const content = readIfExists(path.join(REPO_ROOT, 'commands/brief/deliver.md'));
  assert.ok(content !== null, 'commands/brief/deliver.md must exist (Plan 08 Task 2)');
  assertNoBannedVocabulary(content, 'commands/brief/deliver.md');
});

test('vocabulary-lock: commands/brief/export.md has no banned vocabulary in narrative content', () => {
  const content = readIfExists(path.join(REPO_ROOT, 'commands/brief/export.md'));
  assert.ok(content !== null, 'commands/brief/export.md must exist (Plan 08 Task 2)');
  assertNoBannedVocabulary(content, 'commands/brief/export.md');
});

test('vocabulary-lock: brief/workflows/deliver.md has no banned vocabulary in narrative content', () => {
  const content = readIfExists(path.join(REPO_ROOT, 'brief/workflows/deliver.md'));
  assert.ok(content !== null, 'brief/workflows/deliver.md must exist (Plan 08 Task 2)');
  assertNoBannedVocabulary(content, 'brief/workflows/deliver.md');
});

test('vocabulary-lock: brief/workflows/export.md has no banned vocabulary in narrative content', () => {
  const content = readIfExists(path.join(REPO_ROOT, 'brief/workflows/export.md'));
  assert.ok(content !== null, 'brief/workflows/export.md must exist (Plan 08 Task 2)');
  assertNoBannedVocabulary(content, 'brief/workflows/export.md');
});

// ─── Test 5: Phase 4·5·7 regression guard — vocab-lock files still pass ─

test('vocabulary-lock regression: existing Phase 4·5·7 ban-list tests still pass (sanity check)', () => {
  // Spot-check brief/workflows/audience-guard.md is still ban-list-clean (Phase 5 invariant).
  const audienceGuardSrc = readIfExists(path.join(REPO_ROOT, 'brief/workflows/audience-guard.md'));
  if (audienceGuardSrc !== null) {
    assertNoBannedVocabulary(audienceGuardSrc, 'brief/workflows/audience-guard.md (Phase 5 regression)');
  }
});
