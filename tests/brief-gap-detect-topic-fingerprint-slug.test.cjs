/**
 * brief-gap-detect-topic-fingerprint-slug.test.cjs — Plan 06-03 Task 1.
 *
 * Asserts validateFingerprint (D-09 pure-function contract):
 *   - regex /^[a-z]+(-[a-z]+){2,7}$/ (kebab-case, 3-8 tokens)
 *   - rejects stopwords per STOPWORDS set
 *   - accepts canonical D-09 examples verbatim
 *
 * Also covers pushReturnFrame atomic dual-array write (Pattern 1 from
 * 06-RESEARCH.md). pushReturnFrame writes BOTH state.brief.return_stack AND
 * state.brief.return_stack_history in ONE transaction.
 *
 * Reference: 06-03-PLAN.md Task 1 behaviors 9-18.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const {
  validateFingerprint,
  pushReturnFrame,
  FINGERPRINT_RE,
  STOPWORDS,
} = require('../brief/bin/lib/gap-detect.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

// ─── validateFingerprint — pure-function tests (D-09) ─────────────────────

test('validateFingerprint: canonical example market-sizing-korea-fintech-tam is valid', () => {
  assert.equal(validateFingerprint('market-sizing-korea-fintech-tam'), null);
});

test('validateFingerprint: canonical example competitor-pricing-axis-missing is valid', () => {
  assert.equal(validateFingerprint('competitor-pricing-axis-missing'), null);
});

test('validateFingerprint: canonical example regulatory-citation-pipa-article-28 is valid (alphanumeric tokens allowed)', () => {
  // Plan 06-04 deviation: Plan 06-03 originally had FINGERPRINT_RE alpha-only
  // (/^[a-z]+(-[a-z]+){2,7}$/) which rejected this canonical D-09 example
  // because of the trailing "28" numeric token. Plan 06-04 broadens the regex
  // to /^[a-z][a-z0-9]*(-[a-z0-9]+){2,7}$/ so the canonical example, the
  // vocabulary file, the agent prompt, and Plan 08's grep-audit all stay
  // consistent. See brief/bin/lib/gap-detect.cjs FINGERPRINT_RE comment.
  assert.equal(validateFingerprint('regulatory-citation-pipa-article-28'), null);
});

test('validateFingerprint: rejects uppercase letters (Market-Sizing-Korea-Fintech-TAM)', () => {
  const err = validateFingerprint('Market-Sizing-Korea-Fintech-TAM');
  assert.ok(err, 'must return error for uppercase');
  assert.match(err, /kebab-case/);
});

test('validateFingerprint: rejects stopword "the" inside slug', () => {
  const err = validateFingerprint('market-sizing-the-korea-fintech');
  assert.ok(err, 'must return error for stopword');
  assert.match(err, /stopword/);
});

test('validateFingerprint: rejects stopwords (a, an, of, in, for, with, and, or)', () => {
  for (const stop of ['a', 'an', 'of', 'in', 'for', 'with', 'and', 'or']) {
    const slug = `alpha-${stop}-beta-gamma`;
    const err = validateFingerprint(slug);
    assert.ok(err, `expected error for slug containing stopword "${stop}": ${slug}`);
    assert.match(err, /stopword/);
  }
});

test('validateFingerprint: rejects 2-token slug (<3 required)', () => {
  const err = validateFingerprint('market-sizing');
  assert.ok(err, 'must return error for <3 tokens');
  assert.match(err, /kebab-case/);
});

test('validateFingerprint: rejects 9-token slug (>8 max)', () => {
  const err = validateFingerprint('a-b-c-d-e-f-g-h-i');
  assert.ok(err, 'must return error for >8 tokens');
  assert.match(err, /kebab-case/);
});

test('validateFingerprint: accepts 3-token minimum slug', () => {
  assert.equal(validateFingerprint('alpha-beta-gamma'), null);
});

test('validateFingerprint: accepts 8-token maximum slug', () => {
  assert.equal(validateFingerprint('alpha-beta-gamma-delta-epsilon-zeta-eta-theta'), null);
});

test('validateFingerprint: rejects empty string', () => {
  const err = validateFingerprint('');
  assert.ok(err, 'must return error for empty string');
  assert.match(err, /empty/);
});

test('validateFingerprint: rejects null', () => {
  const err = validateFingerprint(null);
  assert.ok(err, 'must return error for null');
  assert.match(err, /not a string/);
});

test('validateFingerprint: rejects numeric input', () => {
  const err = validateFingerprint(123);
  assert.ok(err, 'must return error for number');
  assert.match(err, /not a string/);
});

test('validateFingerprint: rejects object input', () => {
  const err = validateFingerprint({ fp: 'a-b-c' });
  assert.ok(err, 'must return error for object');
  assert.match(err, /not a string/);
});

test('validateFingerprint: rejects slug with leading hyphen', () => {
  const err = validateFingerprint('-alpha-beta-gamma');
  assert.ok(err);
  assert.match(err, /kebab-case/);
});

test('validateFingerprint: rejects slug with trailing hyphen', () => {
  const err = validateFingerprint('alpha-beta-gamma-');
  assert.ok(err);
  assert.match(err, /kebab-case/);
});

test('validateFingerprint: rejects slug with consecutive hyphens', () => {
  const err = validateFingerprint('alpha--beta-gamma');
  assert.ok(err);
  assert.match(err, /kebab-case/);
});

test('FINGERPRINT_RE exported matches D-09 contract', () => {
  assert.ok(FINGERPRINT_RE instanceof RegExp);
  // Verify regex behavior is what we expect.
  assert.ok(FINGERPRINT_RE.test('alpha-beta-gamma'));
  assert.ok(!FINGERPRINT_RE.test('alpha-beta'));  // 2 tokens
  assert.ok(!FINGERPRINT_RE.test('a-b-c-d-e-f-g-h-i'));  // 9 tokens
});

test('STOPWORDS set exported with expected members', () => {
  assert.ok(STOPWORDS instanceof Set);
  for (const w of ['the', 'a', 'an', 'of', 'in', 'for', 'with', 'and', 'or']) {
    assert.ok(STOPWORDS.has(w), `STOPWORDS missing: ${w}`);
  }
});

// ─── pushReturnFrame — atomic dual-array write (Pattern 1) ────────────────

function setupTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-gap-push-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: 'us' } }),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: test',
      'status: executing',
      'current_phase: "06"',
      'stopped_at: "gap-detect push test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

const VALID_FRAME = {
  paused_phase: '07',
  paused_workstream: 'go-to-market',
  paused_artifact: '.planning/workstreams/go-to-market/market-sizing.md',
  gap_text: 'TAM citation missing',
  triggering_topic: 'Korea fintech TAM',
  topic_fingerprint: 'market-sizing-korea-fintech-tam',
  pushed_at: '2026-04-22T10:00:00.000Z',
};

test('pushReturnFrame: appends to BOTH return_stack AND return_stack_history (atomic)', () => {
  const tmp = setupTmp();
  pushReturnFrame(tmp, VALID_FRAME);
  const fm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  assert.ok(fm.brief, 'brief namespace should exist');
  assert.ok(Array.isArray(fm.brief.return_stack), 'return_stack must be array');
  assert.ok(Array.isArray(fm.brief.return_stack_history), 'return_stack_history must be array');
  assert.equal(fm.brief.return_stack.length, 1);
  assert.equal(fm.brief.return_stack_history.length, 1);
  // Verify the pushed frame fields round-trip via frontmatter.
  const top = fm.brief.return_stack[0];
  assert.equal(top.paused_phase, VALID_FRAME.paused_phase);
  assert.equal(top.paused_workstream, VALID_FRAME.paused_workstream);
  assert.equal(top.topic_fingerprint, VALID_FRAME.topic_fingerprint);
});

test('pushReturnFrame: two consecutive pushes produce .length === 2 in BOTH arrays (no silent dedupe)', () => {
  const tmp = setupTmp();
  pushReturnFrame(tmp, VALID_FRAME);
  pushReturnFrame(tmp, VALID_FRAME);  // same frame, must NOT dedupe
  const fm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  assert.equal(fm.brief.return_stack.length, 2, 'return_stack must have 2 entries');
  assert.equal(fm.brief.return_stack_history.length, 2, 'return_stack_history must have 2 entries');
});

test('pushReturnFrame: rejects frame missing required field', () => {
  const tmp = setupTmp();
  const bad = { ...VALID_FRAME };
  delete bad.topic_fingerprint;
  assert.throws(() => pushReturnFrame(tmp, bad), /topic_fingerprint missing/);
});

test('pushReturnFrame: rejects frame with empty-string required field', () => {
  const tmp = setupTmp();
  const bad = { ...VALID_FRAME, gap_text: '' };
  assert.throws(() => pushReturnFrame(tmp, bad), /gap_text missing/);
});

test('pushReturnFrame: rejects frame with invalid topic_fingerprint (defensive revalidate)', () => {
  const tmp = setupTmp();
  const bad = { ...VALID_FRAME, topic_fingerprint: 'Only-Two' };
  assert.throws(() => pushReturnFrame(tmp, bad), /topic_fingerprint/);
});

test('pushReturnFrame: defensive copy — post-push frame mutation does not alter state', () => {
  const tmp = setupTmp();
  const frame = { ...VALID_FRAME };
  pushReturnFrame(tmp, frame);
  // Attempt mutation of the caller's frame object.
  frame.gap_text = 'MUTATED';
  const fm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  assert.equal(fm.brief.return_stack[0].gap_text, 'TAM citation missing');
  assert.equal(fm.brief.return_stack_history[0].gap_text, 'TAM citation missing');
});
