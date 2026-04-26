/**
 * brief-voice-fit-banned-words.test.cjs — Plan 08-02 Task 1 (Wave 0 RED).
 *
 * Asserts that brief/bin/lib/voice-fit.cjs `checkBannedWords(text, options)`:
 *   - Detects all 16 EN seed banned words with `\b` word-boundary + case-insensitive flag.
 *   - Detects all 8 KO seed banned words ONLY when `options.isKorean === true`.
 *   - Computes density per ~250-words/page approximation.
 *   - Returns shape `{ density, threshold: 2, exceedsThreshold, hits, pages }` (threshold === 2).
 *
 * Wave 0 RED state: voice-fit.cjs does not exist yet — `require()` throws
 * MODULE_NOT_FOUND. Each test wraps the require/assert pair in a try/catch
 * that asserts the predictable RED failure mode. Once Plan 02 Task 2 ships
 * voice-fit.cjs, the catch arm stops firing and the actual assertions inside
 * `try` run.
 *
 * Reference: 08-02-PLAN.md Task 1; 08-RESEARCH.md Pattern 6 lines 739-822;
 * 08-PATTERNS.md lines 247-296 (anti-pattern flag — voice-fit.cjs is a
 * SEPARATE lib, NOT a 5th canonical gate).
 */

const { test } = require('node:test');
const assert = require('node:assert');

function loadVoiceFit() {
  // RED state path: throws MODULE_NOT_FOUND. GREEN state: returns the module.
  return require('../brief/bin/lib/voice-fit.cjs');
}

test('checkBannedWords — EN regex matches 3 banned tokens with word-boundary (case-insensitive)', () => {
  try {
    const { checkBannedWords } = loadVoiceFit();
    const sentence = 'We will leverage synergize transform to deliver outcomes.';
    const result = checkBannedWords(sentence, { isKorean: false, isExternal: true });
    assert.equal(result.hits.length, 3, 'Expected 3 EN banned tokens detected');
    const tokens = result.hits.map((h) => h.token.toLowerCase());
    assert.ok(tokens.includes('leverage'), 'leverage missing');
    assert.ok(tokens.includes('synergize'), 'synergize missing');
    assert.ok(tokens.includes('transform'), 'transform missing');
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkBannedWords — density boundary at 250-words/page (3 hits/250 words → exceedsThreshold)', () => {
  try {
    const { checkBannedWords } = loadVoiceFit();
    // 247 generic words + 3 banned words = 250 words total, density = 3/page > 2
    const fillerWord = 'we ';
    const text = fillerWord.repeat(247).trim() + ' leverage synergize transform';
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    assert.equal(wordCount, 250, 'Test fixture must be exactly 250 words');
    const result = checkBannedWords(text, { isKorean: false, isExternal: true });
    assert.equal(result.density, 3, `Expected density 3, got ${result.density}`);
    assert.equal(result.exceedsThreshold, true, 'density 3 must exceed threshold 2');
    assert.equal(result.pages, 1, '250 words → 1 page');
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkBannedWords — density 1/page does NOT exceed threshold 2', () => {
  try {
    const { checkBannedWords } = loadVoiceFit();
    const text = 'we '.repeat(249).trim() + ' leverage';
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    assert.equal(wordCount, 250, 'Test fixture must be exactly 250 words');
    const result = checkBannedWords(text, { isKorean: false, isExternal: true });
    assert.equal(result.density, 1, `Expected density 1, got ${result.density}`);
    assert.equal(result.exceedsThreshold, false, 'density 1 must NOT exceed threshold 2');
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkBannedWords — KO ban detection only when isKorean: true', () => {
  try {
    const { checkBannedWords } = loadVoiceFit();
    const text = '우리는 혁신적인 솔루션과 시너지를 창출합니다.';
    const koResult = checkBannedWords(text, { isKorean: true, isExternal: true });
    const koTokens = koResult.hits.map((h) => h.token);
    assert.ok(koTokens.includes('혁신적인'), '혁신적인 not detected when isKorean=true');
    assert.ok(koTokens.includes('시너지'), '시너지 not detected when isKorean=true');
    assert.ok(koResult.hits.length >= 2, 'Expected >=2 KO hits when isKorean=true');

    const enOnlyResult = checkBannedWords(text, { isKorean: false, isExternal: true });
    const enOnlyKoHits = enOnlyResult.hits.filter((h) => /[\uac00-\ud7af]/.test(h.token));
    assert.equal(enOnlyKoHits.length, 0, 'KO tokens must NOT be detected when isKorean=false');
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkBannedWords — return shape includes { density, threshold, exceedsThreshold, hits, pages } with threshold === 2', () => {
  try {
    const { checkBannedWords } = loadVoiceFit();
    const result = checkBannedWords('a b c d e', { isKorean: false, isExternal: false });
    assert.equal(typeof result.density, 'number', 'density must be number');
    assert.equal(result.threshold, 2, 'threshold must be 2 (per plan must_haves)');
    assert.equal(typeof result.exceedsThreshold, 'boolean', 'exceedsThreshold must be boolean');
    assert.ok(Array.isArray(result.hits), 'hits must be array');
    assert.equal(typeof result.pages, 'number', 'pages must be number');
    assert.ok(result.pages >= 1, 'pages must be >= 1 (Math.max floor)');
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkBannedWords — all 16 EN seed words are detectable individually', () => {
  try {
    const { checkBannedWords } = loadVoiceFit();
    const seedEn = [
      'leverage', 'synergize', 'transform', 'holistic', 'delve', 'groundbreaking',
      'best-in-class', 'seamless', 'cutting-edge', 'revolutionary', 'game-changing',
      'landscape', 'unlock', 'empower', 'robust', 'innovative',
    ];
    for (const word of seedEn) {
      const sentence = `Our work is ${word} and important.`;
      const result = checkBannedWords(sentence, { isKorean: false, isExternal: false });
      const tokens = result.hits.map((h) => h.token.toLowerCase());
      assert.ok(
        tokens.includes(word),
        `EN seed word '${word}' not detected; got hits: ${JSON.stringify(tokens)}`,
      );
    }
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkBannedWords — all 8 KO seed words are detectable individually when isKorean=true', () => {
  try {
    const { checkBannedWords } = loadVoiceFit();
    const seedKo = ['혁신적인', '차별화된', '게임체인저', '패러다임 시프트', '시너지', '활용', '최적화', '글로벌 스탠더드'];
    for (const word of seedKo) {
      const text = `우리의 작업은 ${word} 합니다.`;
      const result = checkBannedWords(text, { isKorean: true, isExternal: false });
      const tokens = result.hits.map((h) => h.token);
      assert.ok(
        tokens.includes(word),
        `KO seed word '${word}' not detected; got hits: ${JSON.stringify(tokens)}`,
      );
    }
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkBannedWords — exports BANNED_EN, BANNED_KO, HONORIFIC_VIOLATION_KO regex constants', () => {
  try {
    const mod = loadVoiceFit();
    assert.ok(mod.BANNED_EN instanceof RegExp, 'BANNED_EN must be RegExp');
    assert.ok(mod.BANNED_KO instanceof RegExp, 'BANNED_KO must be RegExp');
    assert.ok(mod.HONORIFIC_VIOLATION_KO instanceof RegExp, 'HONORIFIC_VIOLATION_KO must be RegExp');
    assert.ok(mod.BANNED_EN.flags.includes('g'), 'BANNED_EN must use global flag');
    assert.ok(mod.BANNED_EN.flags.includes('i'), 'BANNED_EN must use case-insensitive flag');
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});
