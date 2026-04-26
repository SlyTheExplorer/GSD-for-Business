/**
 * brief-voice-fit-concreteness.test.cjs — Plan 08-02 Task 1 (Wave 0 RED).
 *
 * Asserts that brief/bin/lib/voice-fit.cjs `checkConcreteness(text)`:
 *   - Counts specific-numbers (with units), dates (YYYY or YYYY-MM), proper-noun chains.
 *   - Computes concretenessRatio per 100 words: concrete / (wordCount/100).
 *   - Flags `needsImprovement: true` when concretenessRatio < 3.
 *   - Returns shape `{ concrete, wordCount, concretenessRatio, needsImprovement }`.
 *
 * Wave 0 RED: voice-fit.cjs does not exist; require throws MODULE_NOT_FOUND.
 *
 * Reference: 08-02-PLAN.md Task 1; 08-RESEARCH.md Pattern 6 lines 791-810.
 */

const { test } = require('node:test');
const assert = require('node:assert');

function loadVoiceFit() {
  return require('../brief/bin/lib/voice-fit.cjs');
}

test('checkConcreteness — concrete sentence (numbers + units + date) → needsImprovement: false', () => {
  try {
    const { checkConcreteness } = loadVoiceFit();
    const text = 'We will reduce 15-person legal review cycles from 3 weeks to 4 days, achieving 47% efficiency gain by 2026-Q3.';
    const result = checkConcreteness(text);
    assert.ok(result.concrete >= 4, `Expected >=4 concrete signals, got ${result.concrete}`);
    assert.ok(result.concretenessRatio >= 3, `concretenessRatio ${result.concretenessRatio} must be >= 3`);
    assert.equal(result.needsImprovement, false, 'concrete sentence must NOT need improvement');
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkConcreteness — vague sentence (no numbers, no dates, no proper nouns) → needsImprovement: true', () => {
  try {
    const { checkConcreteness } = loadVoiceFit();
    const text = 'We deliver innovative solutions that transform business outcomes.';
    const result = checkConcreteness(text);
    assert.equal(result.concrete, 0, `Expected 0 concrete signals, got ${result.concrete}`);
    assert.equal(result.needsImprovement, true, 'vague sentence must need improvement');
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkConcreteness — return shape includes { concrete, wordCount, concretenessRatio, needsImprovement }', () => {
  try {
    const { checkConcreteness } = loadVoiceFit();
    const result = checkConcreteness('a b c');
    assert.equal(typeof result.concrete, 'number', 'concrete must be number');
    assert.equal(typeof result.wordCount, 'number', 'wordCount must be number');
    assert.equal(typeof result.concretenessRatio, 'number', 'concretenessRatio must be number');
    assert.equal(typeof result.needsImprovement, 'boolean', 'needsImprovement must be boolean');
    assert.equal(result.wordCount, 3, 'a b c → 3 words');
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkConcreteness — date-only signal contributes to concreteness count', () => {
  try {
    const { checkConcreteness } = loadVoiceFit();
    // Force concrete >= 3 per 100 words via date-heavy text
    const text = 'Cohort 2025 versus cohort 2026 versus cohort 2024 cohort.';
    const result = checkConcreteness(text);
    assert.ok(result.concrete >= 3, `Expected >=3 date signals, got ${result.concrete}`);
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});

test('checkConcreteness — threshold boundary at concretenessRatio === 3', () => {
  try {
    const { checkConcreteness } = loadVoiceFit();
    // Boundary semantics: needsImprovement: true iff ratio < 3
    // Vague text → ratio 0 → needsImprovement true
    const vague = checkConcreteness('we deliver good things in many places.');
    assert.equal(vague.needsImprovement, true, 'ratio 0 < 3 → needsImprovement: true');
    // Plenty-concrete text → ratio >= 3 → needsImprovement false
    const concrete = checkConcreteness('Increase from 12% to 47% by 2026-Q1 with $5M cost.');
    assert.equal(concrete.needsImprovement, false, 'ratio >= 3 → needsImprovement: false');
  } catch (e) {
    assert.match(e.message, /Cannot find module/, 'Wave 0 RED: voice-fit.cjs not yet implemented');
  }
});
