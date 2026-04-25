/**
 * brief-compliance-vocabulary-lock.test.cjs — Plan 07-01 Task 1.
 *
 * Mirrors tests/brief-audience-vocabulary-lock.test.cjs (Phase 5). Greps every
 * artifact that COMPLIANCE emits or reads for the Phase 7 EXTENDED ban-list:
 *   EN: compliant | passed | violation | failed | compliance verified |
 *       audit complete | compliance OK (when used as human-prose) | all clear | no issues
 *   KO: 준수 | 통과 | 위반 | 실패 | 감사 완료 | 컴플라이언스 확인 완료
 *   Symbols: ✅ | ✓ | ✗
 *
 * Covered surfaces (audit globs):
 *   1. brief/references/compliance-vocabulary.md — ban tokens permitted
 *      ONLY inside `## Ban-list*` sections.
 *   2. agents/brief-compliance-checker.md — ban tokens permitted ONLY
 *      inside <vocabulary_discipline>...</vocabulary_discipline>.
 *   3. brief/workflows/compliance.md — zero ban-list tokens anywhere
 *      (orchestration prose; Wave 0 scaffold tolerates absence).
 *   4. brief/bin/lib/compliance.cjs — zero ban-list tokens in literal
 *      strings (only in regex constants which the test exempts).
 *   5. brief/bin/lib/compliance-report.cjs — zero ban-list tokens.
 *
 * Reference: 07-01-PLAN.md Task 1.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..');

// Phase 7 extended ban-list (verbatim from brief/references/compliance-vocabulary.md).
const BAN_TOKENS_EN = [
  'compliant',
  'passed',
  'violation',
  'failed',
  'compliance verified',
  'audit complete',
  'compliance OK',
  'all clear',
  'no issues',
];
const BAN_TOKENS_KO = [
  '준수',
  '통과',
  '위반',
  '실패',
  '감사 완료',
  '컴플라이언스 확인 완료',
];
const BAN_SYMBOLS = ['✅', '✓', '✗'];

function assertNoBanListInText(text, contextLabel) {
  for (const tok of BAN_TOKENS_EN) {
    // Multi-word tokens (e.g., "compliance verified") use literal substring match.
    // Single-word tokens use word-boundary regex.
    const isMultiWord = /\s/.test(tok);
    if (isMultiWord) {
      const re = new RegExp(tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = text.match(re);
      if (matches) {
        assert.fail(`[${contextLabel}] EN ban-list token '${tok}' appeared ${matches.length}x. Pitfall #4 vocabulary theater has manifested. See brief/references/compliance-vocabulary.md for preferred vocabulary.`);
      }
    } else {
      const re = new RegExp(`\\b${tok}\\b`, 'gi');
      const matches = text.match(re);
      if (matches) {
        assert.fail(`[${contextLabel}] EN ban-list token '${tok}' appeared ${matches.length}x. Pitfall #4 vocabulary theater has manifested.`);
      }
    }
  }
  for (const tok of BAN_TOKENS_KO) {
    if (text.includes(tok)) {
      assert.fail(`[${contextLabel}] KO ban-list token '${tok}' appeared. Pitfall #4 vocabulary theater has manifested.`);
    }
  }
  for (const sym of BAN_SYMBOLS) {
    if (text.includes(sym)) {
      assert.fail(`[${contextLabel}] Ban-list symbol '${sym}' appeared. Pitfall #4 vocabulary theater has manifested.`);
    }
  }
}

test('static file brief/references/compliance-vocabulary.md — ban-list tokens only in Ban-list sections', () => {
  const content = fs.readFileSync(path.join(REPO_ROOT, 'brief/references/compliance-vocabulary.md'), 'utf-8');
  const sections = content.split(/^## /m);
  for (let i = 1; i < sections.length; i++) {
    const sec = sections[i];
    const headerLine = sec.split('\n', 1)[0];
    if (/^Ban-list/i.test(headerLine)) continue;
    for (const tok of BAN_TOKENS_EN) {
      const isMultiWord = /\s/.test(tok);
      if (isMultiWord) {
        const re = new RegExp(tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        if (re.test(sec)) {
          assert.fail(`compliance-vocabulary.md: EN ban-list token '${tok}' appeared in NON-Ban-list section '${headerLine}'. Move to a Ban-list section or remove.`);
        }
      } else {
        const re = new RegExp(`\\b${tok}\\b`, 'gi');
        if (re.test(sec)) {
          assert.fail(`compliance-vocabulary.md: EN ban-list token '${tok}' appeared in NON-Ban-list section '${headerLine}'. Move to a Ban-list section or remove.`);
        }
      }
    }
    for (const tok of BAN_TOKENS_KO) {
      if (sec.includes(tok)) {
        assert.fail(`compliance-vocabulary.md: KO ban-list token '${tok}' appeared in NON-Ban-list section '${headerLine}'.`);
      }
    }
  }
});

test('static file agents/brief-compliance-checker.md — ban-list tokens only inside vocabulary_discipline block', { skip: !fs.existsSync(path.join(REPO_ROOT, 'agents/brief-compliance-checker.md')) ? 'agent file pending Task 3' : false }, () => {
  const content = fs.readFileSync(path.join(REPO_ROOT, 'agents/brief-compliance-checker.md'), 'utf-8');
  const vdMatch = content.match(/<vocabulary_discipline>([\s\S]*?)<\/vocabulary_discipline>/);
  assert.ok(vdMatch, '<vocabulary_discipline> block must exist in agents/brief-compliance-checker.md');
  const outsideVd = content.replace(vdMatch[0], '');
  for (const tok of BAN_TOKENS_EN) {
    const isMultiWord = /\s/.test(tok);
    if (isMultiWord) {
      const re = new RegExp(tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      if (re.test(outsideVd)) {
        assert.fail(`agents/brief-compliance-checker.md: EN ban-list token '${tok}' appeared OUTSIDE <vocabulary_discipline> block.`);
      }
    } else {
      const re = new RegExp(`\\b${tok}\\b`, 'gi');
      if (re.test(outsideVd)) {
        assert.fail(`agents/brief-compliance-checker.md: EN ban-list token '${tok}' appeared OUTSIDE <vocabulary_discipline> block.`);
      }
    }
  }
  for (const tok of BAN_TOKENS_KO) {
    if (outsideVd.includes(tok)) {
      assert.fail(`agents/brief-compliance-checker.md: KO ban-list token '${tok}' appeared OUTSIDE <vocabulary_discipline> block.`);
    }
  }
});

test('static file brief/workflows/compliance.md — no ban-list tokens anywhere (orchestration prose)', { skip: !fs.existsSync(path.join(REPO_ROOT, 'brief/workflows/compliance.md')) ? 'workflow file pending Task 3' : false }, () => {
  const content = fs.readFileSync(path.join(REPO_ROOT, 'brief/workflows/compliance.md'), 'utf-8');
  assertNoBanListInText(content, 'brief/workflows/compliance.md');
});

test('static file brief/bin/lib/compliance.cjs — no ban-list tokens in literal strings (regex constants exempt)', { skip: !fs.existsSync(path.join(REPO_ROOT, 'brief/bin/lib/compliance.cjs')) ? 'lib file pending Task 2' : false }, () => {
  const content = fs.readFileSync(path.join(REPO_ROOT, 'brief/bin/lib/compliance.cjs'), 'utf-8');
  // Strip BAN_EN/BAN_KO/BAN_SYMBOL regex literals (those are intentional ban-list pattern definitions).
  const stripped = content
    .replace(/const\s+BAN_EN\s*=\s*\/[^\n]+\/[gi]+;/g, '')
    .replace(/const\s+BAN_KO\s*=\s*\/[^\n]+\/[gi]+;/g, '')
    .replace(/const\s+BAN_SYMBOL\s*=\s*\/[^\n]+\/[gi]+;/g, '');
  assertNoBanListInText(stripped, 'brief/bin/lib/compliance.cjs');
});

test('static file brief/bin/lib/compliance-report.cjs — no ban-list tokens', { skip: !fs.existsSync(path.join(REPO_ROOT, 'brief/bin/lib/compliance-report.cjs')) ? 'report file pending Task 2' : false }, () => {
  const content = fs.readFileSync(path.join(REPO_ROOT, 'brief/bin/lib/compliance-report.cjs'), 'utf-8');
  assertNoBanListInText(content, 'brief/bin/lib/compliance-report.cjs');
});
