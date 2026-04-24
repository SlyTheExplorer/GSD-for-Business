/**
 * brief-gap-detect-vocabulary-lock.test.cjs — Phase 6 Plan 08 Task 2 (3 of 4).
 *
 * Pitfall #4 (PITFALLS.md — compliance checkbox theater) mitigation for the
 * Phase 6 gap-detect subsystem. Grep-audits all Phase-6 authored artifacts
 * for ban-list tokens (EN + KO + symbols) and asserts the vocabulary
 * reference documents all required decision/severity/ban-list vocabulary.
 *
 * Filter discipline — follows Phase 4 brief-align-vocabulary-lock precedent:
 *   - Agent file: strip <vocabulary_discipline> block (legitimate home of
 *     the ban-list tokens as "DO NOT use" examples), then assert remainder
 *     is clean.
 *   - Lib file: strip lines containing 'BAN_' (regex definitions are the
 *     legitimate home of the tokens as source-of-truth constants), then
 *     assert remainder is clean.
 *   - Vocabulary reference: strip '## Ban-list*' H2 sections (legitimate
 *     home), then assert remainder is clean.
 *   - Workflow + other files: no ban tokens anywhere (orchestration prose
 *     or pure renderer).
 *
 * 4 structural invariants locked:
 *
 *   1. All Phase 6 authored files — zero ban-list tokens outside the
 *      legitimate ban-list documentation homes.
 *   2. Vocabulary reference — all 3 decision values + all 3 severities +
 *      all 7 ban-list tokens documented.
 *   3. Agent prompt — references vocabulary file in required_reading +
 *      carries topic_fingerprint contract section.
 *   4. Agent prompt — all 3 D-09 canonical topic_fingerprint examples
 *      present.
 *
 * References:
 *   - 06-08-PLAN.md Task 2 (EXACT CONTENT — with filter refinement per
 *     Rule 1 bug-fix to mirror Phase 4 vocabulary-lock pattern)
 *   - 06-CONTEXT.md D-01 (decision enum), D-03 (severity), D-09 (fingerprint)
 *   - brief/references/gap-detect-vocabulary.md (source of truth)
 *   - tests/brief-align-vocabulary-lock.test.cjs (Phase 4 precedent for
 *     the block-stripping filter pattern)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.join(__dirname, '..');

// D-05 ban-list from brief/references/gap-detect-vocabulary.md (inherited
// from align-vocabulary.md + audience-vocabulary.md).
const BAN_TOKENS_EN = ['compliant', 'passed', 'violation', 'failed'];
const BAN_TOKENS_KO = ['준수', '통과', '위반', '실패'];
const BAN_SYMBOLS = ['✅', '✓', '✗'];

function assertNoBanTokens(text, label) {
  for (const tok of BAN_TOKENS_EN) {
    const re = new RegExp(`\\b${tok}\\b`, 'gi');
    const matches = text.match(re);
    if (matches) {
      assert.fail(
        `[${label}] EN ban-list token '${tok}' appeared ${matches.length}x. `
          + 'Pitfall #4 vocabulary theater has manifested.',
      );
    }
  }
  for (const tok of BAN_TOKENS_KO) {
    if (text.includes(tok)) {
      assert.fail(
        `[${label}] KO ban-list token '${tok}' appeared. `
          + 'Pitfall #4 vocabulary theater has manifested.',
      );
    }
  }
  for (const sym of BAN_SYMBOLS) {
    if (text.includes(sym)) {
      assert.fail(
        `[${label}] Ban-list symbol '${sym}' appeared. `
          + 'Pitfall #4 vocabulary theater has manifested.',
      );
    }
  }
}

// ─── Test 1: Phase 6 authored files contain zero ban-list tokens ────────
// (ban-list documentation blocks stripped before audit)

test('Phase 6 authored artifacts contain zero ban-list tokens outside legitimate documentation homes', () => {
  // agents/brief-gap-detector.md — legitimate home: <vocabulary_discipline> block.
  const agentPath = path.join(REPO, 'agents/brief-gap-detector.md');
  assert.ok(fs.existsSync(agentPath), `Phase 6 artifact missing: agents/brief-gap-detector.md`);
  const agentContent = fs.readFileSync(agentPath, 'utf-8');
  const vdMatch = agentContent.match(/<vocabulary_discipline>[\s\S]*?<\/vocabulary_discipline>/);
  assert.ok(
    vdMatch,
    'agents/brief-gap-detector.md must contain a <vocabulary_discipline> block (prompt contract)',
  );
  const agentOutsideVd = agentContent.replace(vdMatch[0], '');
  assertNoBanTokens(agentOutsideVd, 'agents/brief-gap-detector.md (outside <vocabulary_discipline>)');

  // brief/bin/lib/gap-detect.cjs — legitimate home: lines with BAN_ constants.
  const libPath = path.join(REPO, 'brief/bin/lib/gap-detect.cjs');
  assert.ok(fs.existsSync(libPath), 'Phase 6 artifact missing: brief/bin/lib/gap-detect.cjs');
  const libContent = fs.readFileSync(libPath, 'utf-8');
  const libFiltered = libContent
    .split('\n')
    .filter((l) => !/BAN_(EN|KO|SYMBOL)/.test(l))
    .join('\n');
  assertNoBanTokens(libFiltered, 'brief/bin/lib/gap-detect.cjs (outside BAN_* constants)');

  // brief/bin/lib/gap-detect-report.cjs — no legitimate home; assert clean everywhere.
  const reportPath = path.join(REPO, 'brief/bin/lib/gap-detect-report.cjs');
  assert.ok(
    fs.existsSync(reportPath),
    'Phase 6 artifact missing: brief/bin/lib/gap-detect-report.cjs',
  );
  assertNoBanTokens(
    fs.readFileSync(reportPath, 'utf-8'),
    'brief/bin/lib/gap-detect-report.cjs',
  );

  // brief/workflows/gap-detect.md — orchestration prose; assert clean everywhere.
  const wfPath = path.join(REPO, 'brief/workflows/gap-detect.md');
  assert.ok(fs.existsSync(wfPath), 'Phase 6 artifact missing: brief/workflows/gap-detect.md');
  assertNoBanTokens(
    fs.readFileSync(wfPath, 'utf-8'),
    'brief/workflows/gap-detect.md',
  );
});

// ─── Test 2: Vocabulary reference documents decisions + severities + bans ─

test('brief/references/gap-detect-vocabulary.md documents ≥3 decisions + ≥3 severities + ≥7 ban-list tokens', () => {
  const v = fs.readFileSync(
    path.join(REPO, 'brief/references/gap-detect-vocabulary.md'),
    'utf-8',
  );

  // D-01 decisions — all three present.
  for (const decision of ['GAPS-NONE', 'GAPS-MATERIAL-ONLY', 'GAPS-BLOCKING']) {
    assert.ok(v.includes(decision), `Decision enum value missing: ${decision}`);
  }

  // D-03 severities — all three present (case-insensitive containment).
  for (const sev of ['blocking', 'material', 'nice-to-have']) {
    assert.ok(
      v.toLowerCase().includes(sev),
      `Severity enum value missing: ${sev}`,
    );
  }

  // Ban-list — all 7 core tokens (4 EN + 3 KO commonly required) documented
  // as forbidden (case-insensitive containment; ban-list sections are the
  // legitimate home of these tokens).
  for (const ban of ['compliant', 'passed', 'violation', 'failed', '준수', '통과', '위반']) {
    assert.ok(
      v.toLowerCase().includes(ban.toLowerCase()),
      `Ban-list token not documented as forbidden in vocabulary reference: ${ban}`,
    );
  }
});

// ─── Test 3: Agent prompt references vocabulary + fingerprint contract ──

test('agents/brief-gap-detector.md references vocabulary file and carries topic_fingerprint contract', () => {
  const agent = fs.readFileSync(
    path.join(REPO, 'agents/brief-gap-detector.md'),
    'utf-8',
  );
  assert.ok(
    agent.includes('gap-detect-vocabulary'),
    'Agent required_reading section must reference brief/references/gap-detect-vocabulary.md',
  );
  assert.ok(
    agent.includes('<topic_fingerprint_contract>')
      || agent.includes('topic_fingerprint'),
    'Agent must carry D-09 topic_fingerprint contract section',
  );
});

// ─── Test 4: Agent prompt contains all 3 D-09 canonical examples ────────

test('agents/brief-gap-detector.md contains all 3 D-09 canonical topic_fingerprint examples', () => {
  const agent = fs.readFileSync(
    path.join(REPO, 'agents/brief-gap-detector.md'),
    'utf-8',
  );
  assert.ok(
    agent.includes('market-sizing-korea-fintech-tam'),
    'D-09 canonical example 1 missing: market-sizing-korea-fintech-tam',
  );
  assert.ok(
    agent.includes('competitor-pricing-axis-missing'),
    'D-09 canonical example 2 missing: competitor-pricing-axis-missing',
  );
  assert.ok(
    agent.includes('regulatory-citation-pipa-article-28'),
    'D-09 canonical example 3 missing: regulatory-citation-pipa-article-28',
  );
});
