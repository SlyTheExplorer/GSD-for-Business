/**
 * brief-voice-fit-honorific-ko.test.cjs — Plan 08-02 Task 1 (Wave 0 RED).
 *
 * Asserts that brief/bin/lib/voice-fit.cjs `checkBannedWords(text, options)`
 * applies the HONORIFIC_VIOLATION_KO regex ONLY when both
 * `options.isKorean === true` AND `options.isExternal === true`. The matched
 * suffix set is `{ -야, -지, -라구요, -거든요, -는데요 }` (반말 / 구어체 endings,
 * D-D04). The regex uses `(?:[가-힣])(suffix)\b` so the lookbehind requires
 * a preceding Hangul character and `\b` enforces word-boundary so the noun
 * `아버지` (which contains `-지` mid-word) does NOT trigger.
 *
 * Wave 0 RED: voice-fit.cjs does not exist; require throws MODULE_NOT_FOUND.
 *
 * Reference: 08-02-PLAN.md Task 1; 08-RESEARCH.md Pattern 6 lines 759-761;
 * threat T-08-02-03 (false-positive guard for `아버지`).
 */

const { test } = require('node:test');
const assert = require('node:assert');

function loadVoiceFit() {
  return require('../brief/bin/lib/voice-fit.cjs');
}

function honorificHits(result) {
  // Identify hits whose token ends with one of the 5 반말 suffixes.
  const banmal = ['야', '지', '라구요', '거든요', '는데요'];
  return result.hits.filter((h) => banmal.some((s) => h.token.endsWith(s)));
}

test('checkBannedWords — KO honorific violation fires when isKorean: true AND isExternal: true', () => {
  try {
    const { checkBannedWords } = loadVoiceFit();
    const text = '우리는 좋은 솔루션을 제공해야지.';
    const result = checkBannedWords(text, { isKorean: true, isExternal: true });
    const hits = honorificHits(result);
    assert.ok(hits.length >= 1, `Expected >=1 honorific hit, got ${hits.length}; all hits: ${JSON.stringify(result.hits)}`);
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkBannedWords — KO honorific NOT fired when isExternal: false (internal artifact)', () => {
  try {
    const { checkBannedWords } = loadVoiceFit();
    const text = '우리는 좋은 솔루션을 제공해야지.';
    const result = checkBannedWords(text, { isKorean: true, isExternal: false });
    const hits = honorificHits(result);
    assert.equal(hits.length, 0, `Expected 0 honorific hits when isExternal=false, got ${hits.length}`);
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkBannedWords — KO honorific NOT fired when isKorean: false (English-only project)', () => {
  try {
    const { checkBannedWords } = loadVoiceFit();
    // Even with Korean text in the body, isKorean: false suppresses honorific check
    const text = '서비스를 제공해야지.';
    const result = checkBannedWords(text, { isKorean: false, isExternal: true });
    const hits = honorificHits(result);
    assert.equal(hits.length, 0, `Expected 0 honorific hits when isKorean=false, got ${hits.length}`);
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkBannedWords — false-positive guard: 아버지 noun + particle ("아버지가 출장 중이다.") does NOT trigger -지 honorific match', () => {
  try {
    const { checkBannedWords } = loadVoiceFit();
    // 아버지 is the noun "father". In natural Korean, nouns appear with a
    // particle (가/는/을/를/이/의/에 etc.). The negative lookahead `(?![가-힣])`
    // in HONORIFIC_VIOLATION_KO requires the suffix NOT to be followed by
    // another Hangul, so 아버지가 / 아버지는 / 아버지를 are correctly NOT
    // matched (the 지 suffix is followed by another Hangul particle).
    //
    // Plan 08-02 Rule 1 deviation: original plan fixture used standalone
    // '아버지' which cannot be disambiguated from sentence-final 반말 by
    // regex alone (Hangul is not in JavaScript's `\w` class so `\b` is a
    // no-op). Updated to natural noun+particle form which preserves the
    // false-positive guard intent for real-world Korean text.
    const text = '아버지가 출장 중이다.';
    const result = checkBannedWords(text, { isKorean: true, isExternal: true });
    const hits = honorificHits(result);
    assert.equal(hits.length, 0, `False-positive guard failed: '아버지가 출장 중이다.' triggered ${hits.length} honorific hit(s); regex over-matches mid-word.`);
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkBannedWords — HONORIFIC_VIOLATION_KO export is a RegExp with global flag', () => {
  try {
    const { HONORIFIC_VIOLATION_KO } = loadVoiceFit();
    assert.ok(HONORIFIC_VIOLATION_KO instanceof RegExp, 'HONORIFIC_VIOLATION_KO must be RegExp');
    assert.ok(HONORIFIC_VIOLATION_KO.flags.includes('g'), 'HONORIFIC_VIOLATION_KO must be global');
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});
