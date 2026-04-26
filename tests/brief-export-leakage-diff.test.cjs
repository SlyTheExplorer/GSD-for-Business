/**
 * brief-export-leakage-diff.test.cjs — Plan 08-03 Wave 0 RED→GREEN.
 *
 * Verifies leakage-diff.cjs cross-artifact TF-IDF keyword diff:
 *   1) intentional-leak fixture (5+ multi-word keywords copied from
 *      stricter sibling INTERNAL deck → less-strict PROPOSAL deck) MUST
 *      surface ≥1 finding with severity=material.
 *   2) incidental-overlap fixture (only generic stop-worded terms shared)
 *      MUST produce 0 findings (false-positive control).
 *   3) edge cases: no siblings, missing confidentiality, current artifact
 *      is the strictest, paired-sibling .audience.md / .compliance.md
 *      excluded from sibling enumeration.
 *   4) tokenize() exposes Hangul-aware tokenization matching align.cjs.
 *   5) tfIdf() returns ≤20 tokens with stop-words excluded.
 *
 * Reference: 08-03-PLAN.md tasks 1+2; 08-RESEARCH.md Pattern 5 (lines 584-737);
 * 08-PATTERNS.md leakage-diff analog (lines 299-356).
 *
 * Test pattern: try/require wrap so the test file LOADS even when the lib
 * does not yet exist (Wave 0 RED state predictability — Plan 02 convention).
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

let leakageDiff = null;
let tokenize = null;
let tfIdf = null;
let STRICTNESS = null;
try {
  const mod = require('../brief/bin/lib/leakage-diff.cjs');
  leakageDiff = mod.leakageDiff || null;
  tokenize = mod.tokenize || null;
  tfIdf = mod.tfIdf || null;
  STRICTNESS = mod.STRICTNESS || null;
} catch (err) {
  if (err && err.code !== 'MODULE_NOT_FOUND') throw err;
  // Wave 0 RED state: leakage-diff.cjs not yet implemented.
}

const ROOT = path.join(__dirname, '..');
const INTENTIONAL_DIR = path.join(ROOT, 'tests/fixtures/deliver/intentional-leak-pair');
const INCIDENTAL_DIR = path.join(ROOT, 'tests/fixtures/deliver/incidental-overlap-pair');

// ─── Test 1: intentional-leak detected (≥1 finding, severity=material) ────
test('Test 1 (intentional-leak): leakageDiff surfaces ≥1 material-severity finding for PROPOSAL deck that copies 5+ keywords from stricter INTERNAL sibling', () => {
  assert.ok(leakageDiff, 'leakage-diff.cjs not yet implemented (Wave 0 RED expected)');

  const proposalPath = path.join(INTENTIONAL_DIR, 'proposal-deck.md');
  const result = leakageDiff(proposalPath);

  assert.ok(result && typeof result === 'object', 'leakageDiff must return an object');
  assert.ok(Array.isArray(result.findings), 'result.findings must be an array');
  assert.ok(typeof result.rationale === 'string', 'result.rationale must be a string');
  assert.ok(result.findings.length >= 1, `expected ≥1 finding, got ${result.findings.length}; rationale=${result.rationale}`);

  const f0 = result.findings[0];
  assert.equal(f0.severity, 'material', `expected severity=material, got ${f0.severity}`);
  assert.ok(typeof f0.location === 'string' && f0.location.length > 0, 'finding.location must be non-empty string');
  assert.ok(typeof f0.description === 'string', 'finding.description must be a string');
  assert.ok(/Cross-artifact leakage suspected/.test(f0.description),
    `finding.description must contain "Cross-artifact leakage suspected"; got: ${f0.description}`);
  assert.ok(/internal-deck\.md/.test(f0.description),
    `finding.description must reference 'internal-deck.md' as the stricter sibling; got: ${f0.description}`);
});

// ─── Test 2: incidental-overlap NOT flagged (0 findings) ──────────────────
test('Test 2 (incidental-overlap): leakageDiff returns 0 findings when only generic stop-worded terms shared between PROPOSAL and INTERNAL sibling', () => {
  assert.ok(leakageDiff, 'leakage-diff.cjs not yet implemented (Wave 0 RED expected)');

  const proposalPath = path.join(INCIDENTAL_DIR, 'proposal-deck.md');
  const result = leakageDiff(proposalPath);

  assert.ok(result && typeof result === 'object', 'leakageDiff must return an object');
  assert.ok(Array.isArray(result.findings), 'result.findings must be an array');
  assert.equal(result.findings.length, 0,
    `expected 0 findings (only stop-words shared), got ${result.findings.length}: ${JSON.stringify(result.findings)}`);
});

// ─── Test 3: no siblings → 0 findings + clear rationale ───────────────────
test('Test 3 (no siblings): leakageDiff returns 0 findings + rationale "scanned 0 sibling(s)" when folder contains only the current artifact', () => {
  assert.ok(leakageDiff, 'leakage-diff.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-leakage-nosib-'));
  try {
    const onlyPath = path.join(tmp, 'lonely-deck.md');
    fs.writeFileSync(
      onlyPath,
      [
        '---',
        'audience.confidentiality: partner',
        '---',
        '',
        '# Lonely',
        '내용 본문 일부.',
        '',
      ].join('\n'),
    );
    const result = leakageDiff(onlyPath);
    assert.equal(result.findings.length, 0, 'no siblings → no findings');
    assert.match(result.rationale, /scanned 0 sibling/i, `rationale must say scanned 0; got ${result.rationale}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// ─── Test 4: missing confidentiality → skipped with clear rationale ───────
test('Test 4 (missing confidentiality): leakageDiff returns 0 findings + skip rationale when current artifact frontmatter has no audience.confidentiality', () => {
  assert.ok(leakageDiff, 'leakage-diff.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-leakage-noconf-'));
  try {
    const noConfPath = path.join(tmp, 'no-conf.md');
    fs.writeFileSync(
      noConfPath,
      [
        '---',
        'audience.type: external',
        'voice.tone: formal',
        '---',
        '',
        '# No Conf',
        'content.',
        '',
      ].join('\n'),
    );
    const sibPath = path.join(tmp, 'sib.md');
    fs.writeFileSync(
      sibPath,
      [
        '---',
        'audience.confidentiality: confidential',
        '---',
        '',
        '# Sib',
        'content.',
        '',
      ].join('\n'),
    );
    const result = leakageDiff(noConfPath);
    assert.equal(result.findings.length, 0, 'no confidentiality field → no findings');
    assert.match(result.rationale, /missing confidentiality field/i,
      `rationale must say missing confidentiality field; got ${result.rationale}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// ─── Test 5: strictest current artifact → siblings (less strict) NOT scanned ──
test('Test 5 (strictness ordering): when current artifact is confidential (strictest), siblings with partner / internal / public are NOT scanned and 0 findings emitted', () => {
  assert.ok(leakageDiff, 'leakage-diff.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-leakage-strictest-'));
  try {
    // Current = confidential (the strictest)
    const currentPath = path.join(tmp, 'current.md');
    fs.writeFileSync(
      currentPath,
      [
        '---',
        'audience.confidentiality: confidential',
        '---',
        '',
        '# Current',
        '카카오뱅크 제휴 API 91 day retention cohort 2026 toss pay benchmark',
        '',
      ].join('\n'),
    );
    // Three less-strict siblings — none should be scanned
    for (const conf of ['partner', 'internal', 'public']) {
      fs.writeFileSync(
        path.join(tmp, `sib-${conf}.md`),
        [
          '---',
          `audience.confidentiality: ${conf}`,
          '---',
          '',
          '# Sib',
          '카카오뱅크 제휴 API 91 day retention cohort 2026 toss pay benchmark',
          '',
        ].join('\n'),
      );
    }
    const result = leakageDiff(currentPath);
    assert.equal(result.findings.length, 0,
      `current is strictest → no stricter siblings → 0 findings; got ${result.findings.length}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// ─── Test 6: paired-sibling .audience.md / .compliance.md SKIPPED ─────────
test('Test 6 (paired-sibling skip): {basename}.audience.md and {basename}.compliance.md MUST be excluded from sibling enumeration', () => {
  assert.ok(leakageDiff, 'leakage-diff.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-leakage-paired-'));
  try {
    const proposalPath = path.join(tmp, 'proposal-deck.md');
    fs.writeFileSync(
      proposalPath,
      [
        '---',
        'audience.confidentiality: partner',
        '---',
        '',
        '# Proposal',
        '카카오뱅크 제휴 API content body.',
        '',
      ].join('\n'),
    );
    // Paired siblings (must NOT be scanned) — these would falsely flag if included
    fs.writeFileSync(
      path.join(tmp, 'proposal-deck.audience.md'),
      [
        '---',
        'audience.confidentiality: confidential',
        '---',
        '# AUDIENCE verdict report',
        '카카오뱅크 제휴 API 91 day retention cohort 2026 toss pay benchmark',
      ].join('\n'),
    );
    fs.writeFileSync(
      path.join(tmp, 'proposal-deck.compliance.md'),
      [
        '---',
        'audience.confidentiality: confidential',
        '---',
        '# COMPLIANCE verdict report',
        '카카오뱅크 제휴 API 91 day retention cohort 2026 toss pay benchmark',
      ].join('\n'),
    );
    // ONE legitimate stricter sibling — leakage SHOULD be detected against this one
    fs.writeFileSync(
      path.join(tmp, 'internal-deck.md'),
      [
        '---',
        'audience.confidentiality: confidential',
        '---',
        '',
        '# Internal',
        '카카오뱅크 제휴 API content body.',
        '',
      ].join('\n'),
    );
    const result = leakageDiff(proposalPath);
    // Sibling enumeration should be exactly 1 (internal-deck.md only).
    // Paired .audience.md / .compliance.md MUST be skipped.
    assert.match(result.rationale, /scanned 1 sibling/i,
      `expected scanned 1 sibling (paired-sibling skip), got: ${result.rationale}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// ─── Test 7: tokenize() Hangul-aware (matches align.cjs precedent) ────────
test('Test 7 (tokenize Hangul-aware): tokenize emits ≥3 Hangul tokens of length ≥2 from a Korean sentence', () => {
  assert.ok(tokenize, 'leakage-diff.cjs tokenize() not yet exported (Wave 0 RED expected)');

  const text = '페이앱은 한국 핀테크 플랫폼입니다';
  const tokens = tokenize(text);
  // After tokenize: each Korean word ≥2 hangul chars becomes a token.
  const hangulTokens = tokens.filter((t) => /^[\uac00-\ud7af]+$/.test(t) && t.length >= 2);
  assert.ok(hangulTokens.length >= 3,
    `expected ≥3 Hangul tokens of length ≥2; got ${hangulTokens.length}: ${JSON.stringify(tokens)}`);
});

// ─── Test 8: tfIdf returns ≤20 tokens, stop-words filtered ────────────────
test('Test 8 (tfIdf size + stop-word filter): tfIdf returns at most 20 tokens; stop-words like "about" / "고객" never appear in output even when present in input', () => {
  assert.ok(tfIdf, 'leakage-diff.cjs tfIdf() not yet exported (Wave 0 RED expected)');

  // Construct a document loaded with stop-words + distinctive tokens.
  const text = [
    'about above between business customer market company team value service product',
    '고객 시장 회사 사업 팀 가치 서비스 제품 있습니다 입니다',
    'distinctive tokens such as retention cohort benchmark rollout regional acquisition',
    'and 카카오뱅크 제휴 플랫폼 핀테크 차별화 토스페이 분석 분석가 만족도 만족',
  ].join(' ');
  const corpus = [text]; // single-doc corpus — degenerate idf, falls back to TF-only
  const out = tfIdf(text, corpus);
  assert.ok(Array.isArray(out), 'tfIdf must return an array');
  assert.ok(out.length <= 20, `tfIdf must return ≤20 tokens; got ${out.length}`);
  // Stop-words MUST NOT appear in output.
  for (const sw of ['about', 'between', 'business', 'customer', 'market', 'company', 'team', 'value', 'service', 'product']) {
    assert.ok(!out.includes(sw), `EN stop-word "${sw}" must be filtered out; got: ${JSON.stringify(out)}`);
  }
  for (const sw of ['고객', '시장', '회사', '사업', '팀', '가치', '서비스', '제품', '있습니다', '입니다']) {
    assert.ok(!out.includes(sw), `KO stop-word "${sw}" must be filtered out; got: ${JSON.stringify(out)}`);
  }
});

// ─── Test 9: STRICTNESS exposes the canonical 4-tier ordering ─────────────
test('Test 9 (STRICTNESS enum): exports the Phase 5 D-10 ordering public(0) < partner(1) < internal(2) < confidential(3)', () => {
  assert.ok(STRICTNESS, 'leakage-diff.cjs STRICTNESS not yet exported (Wave 0 RED expected)');

  assert.equal(STRICTNESS.public, 0, 'public = 0');
  assert.equal(STRICTNESS.partner, 1, 'partner = 1');
  assert.equal(STRICTNESS.internal, 2, 'internal = 2');
  assert.equal(STRICTNESS.confidential, 3, 'confidential = 3');
  assert.ok(STRICTNESS.confidential > STRICTNESS.internal, 'confidential strictly greater than internal');
  assert.ok(STRICTNESS.internal > STRICTNESS.partner, 'internal strictly greater than partner');
  assert.ok(STRICTNESS.partner > STRICTNESS.public, 'partner strictly greater than public');
});
