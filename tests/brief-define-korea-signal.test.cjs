'use strict';

/**
 * Korea-signal detection test (D-11 + Pitfall 2 over-suggest bias).
 *
 * detectKoreaSignals is a pure function — no disk I/O — that returns true
 * whenever ANY Korea signal is present in the supplied transcript string.
 * The over-suggest bias (per RESEARCH.md Pitfall 2) intentionally prefers
 * false positives to false negatives for Korea's 2026 PIPA / ISMS-P / CEO-
 * personal-liability climate; a user can always uncheck compliance packs
 * in the subsequent confirmation step.
 *
 * Keyword set (frozen for v1, may expand in v1.x after pilot feedback):
 *   /[\u3131-\u318E\uAC00-\uD7A3]/                       — any Hangul block
 *   /\b(Korea|Korean|KR|Seoul|won|PIPA|ISMS|MyData)\b/i  — romanized/regulatory
 *   /\b(핀테크|카카오|네이버|토스)\b/                    — common KR companies
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  detectKoreaSignals,
  KOREA_SIGNAL_PATTERNS,
} = require('../brief/bin/lib/define.cjs');

describe('Korea-signal detection (D-11, over-suggest bias, Pitfall 2 coverage)', () => {
  test('Hangul triggers pre-check', () => {
    assert.strictEqual(detectKoreaSignals('퇴근 후 홈트레이닝'), true);
  });

  test('English "Korea" triggers pre-check (Pitfall 2 English-in-Korea-context)', () => {
    assert.strictEqual(detectKoreaSignals('B2C fintech in Korea market'), true);
  });

  test('PIPA keyword triggers pre-check', () => {
    assert.strictEqual(detectKoreaSignals('PIPA compliance required'), true);
  });

  test('MyData / ISMS / won / Seoul trigger pre-check', () => {
    assert.strictEqual(detectKoreaSignals('MyData ecosystem project'), true);
    assert.strictEqual(detectKoreaSignals('ISMS audit'), true);
    // "월 9,900원" — Hangul character triggers the Hangul block regex.
    assert.strictEqual(detectKoreaSignals('월 9,900원'), true);
    assert.strictEqual(detectKoreaSignals('Seoul-based team'), true);
  });

  test('핀테크 / 카카오 / 네이버 / 토스 trigger pre-check', () => {
    assert.strictEqual(detectKoreaSignals('핀테크 스타트업'), true);
    assert.strictEqual(detectKoreaSignals('카카오 API 연동'), true);
    assert.strictEqual(detectKoreaSignals('네이버 검색 연동'), true);
    assert.strictEqual(detectKoreaSignals('토스 페이 결제'), true);
  });

  test('Latin-script "Kakao" alone does NOT trigger (boundary case — pilot-refine in v1.1)', () => {
    // Documented boundary: the Hangul-block regex is the dominant detector for
    // Korean context. "Kakao" in Latin script without any other signal is a
    // false negative acceptable for v1 per Pitfall 2 over-suggest bias being
    // satisfied by the Korea/Korean/KR keyword set.
    assert.strictEqual(detectKoreaSignals('Using Kakao integrations'), false);
  });

  test('Non-Korea English transcript does NOT trigger (false-positive guard)', () => {
    assert.strictEqual(
      detectKoreaSignals('B2B SaaS for US enterprise customers'),
      false,
    );
  });

  test('Empty / non-string inputs return false', () => {
    assert.strictEqual(detectKoreaSignals(''), false);
    assert.strictEqual(detectKoreaSignals(undefined), false);
    assert.strictEqual(detectKoreaSignals(null), false);
    assert.strictEqual(detectKoreaSignals(42), false);
  });

  test('3 patterns exported for future pilot refinement', () => {
    assert.ok(Array.isArray(KOREA_SIGNAL_PATTERNS), 'patterns array exported');
    assert.strictEqual(KOREA_SIGNAL_PATTERNS.length, 3);
  });
});
