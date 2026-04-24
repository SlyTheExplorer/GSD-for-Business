/**
 * brief-audience-vocabulary-lock.test.cjs — Plan 05-04 Task 6.
 *
 * Mirrors tests/brief-align-vocabulary-lock.test.cjs (Phase 4). Greps every
 * artifact that AUDIENCE emits or reads for ban-list tokens:
 *   EN: compliant | passed | violation | failed
 *   KO: 준수 | 통과 | 위반 | 실패
 *   Symbols: ✅ | ✓ | ✗
 *
 * Covered surfaces:
 *   1. Emitted .audience-report.tmp.md (AUDIENCE-OK en and ko, plus override).
 *   2. Static: brief/references/audience-vocabulary.md — ban tokens permitted
 *      ONLY inside `## Ban-list*` sections.
 *   3. Static: agents/brief-audience-guard.md — ban tokens permitted ONLY
 *      inside <vocabulary_discipline>...</vocabulary_discipline>.
 *   4. Static: brief/workflows/audience-guard.md — zero ban-list tokens anywhere.
 *
 * Reference: 05-04-PLAN.md Task 6.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const audience = require('../brief/bin/lib/audience.cjs');

const REPO_ROOT = path.join(__dirname, '..');
const FIXTURES = path.join(__dirname, 'fixtures', 'audience');

const BAN_TOKENS_EN = ['compliant', 'passed', 'violation', 'failed'];
const BAN_TOKENS_KO = ['준수', '통과', '위반', '실패'];
const BAN_SYMBOLS = ['✅', '✓', '✗'];

function assertNoBanListInText(text, contextLabel) {
  for (const tok of BAN_TOKENS_EN) {
    const re = new RegExp(`\\b${tok}\\b`, 'gi');
    const matches = text.match(re);
    if (matches) {
      assert.fail(`[${contextLabel}] EN ban-list token '${tok}' appeared ${matches.length}x. Pitfall #4 vocabulary theater has manifested. See brief/references/audience-vocabulary.md for preferred vocabulary.`);
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

function seedTmp(region) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-aud-vocab-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(path.join(tmp, '.planning', 'config.json'), JSON.stringify({ brief: { region: region || 'us', business_model: 'b2b' } }));
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'business_model: b2b',
      'region: ' + (region || 'us'),
      'audience_policy:',
      '  default: internal',
      '  permitted: [internal, external]',
      'compliance_packs: []',
      'status: ready',
      'immutable_items: []',
      'last_amended: "2026-04-22T00:00:00.000Z"',
      '---',
      '',
      '# OBJ',
      '',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: test',
      'status: executing',
      'current_phase: "05"',
      'stopped_at: "vocab test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

test('emitted {artifact}.audience.md Korean AUDIENCE-OK path — no ban-list tokens', () => {
  const tmp = seedTmp('kr');
  const verdictPath = path.join(tmp, '.planning', '.audience-verdict.tmp.json');
  // Seed a KO AUDIENCE-OK verdict with preferred-vocabulary finding description.
  fs.writeFileSync(
    verdictPath,
    JSON.stringify({
      decision: 'AUDIENCE-OK',
      severity: 'nice-to-have',
      findings: [
        { severity: 'nice-to-have', location: 'x.md:Summary', description: '문서화된 의도 중 반영된 것: 내부 기획팀 대상 리서치 메모' },
      ],
      findings_count: 1,
      rationale: '모든 레이어가 일관된 상태입니다.',
    }),
  );
  const result = audience.commitAudienceVerdict(tmp, { verdictPath, artifactPath: path.join(tmp, '.planning', 'x.md') });
  const body = fs.readFileSync(result.audiencePath, 'utf-8');
  assertNoBanListInText(body, 'emitted {artifact}.audience.md (Korean AUDIENCE-OK)');
});

test('emitted {artifact}.audience.md English AUDIENCE-OK path — no ban-list tokens', () => {
  const tmp = seedTmp('us');
  const verdictPath = path.join(tmp, '.planning', '.audience-verdict.tmp.json');
  fs.writeFileSync(
    verdictPath,
    JSON.stringify({
      decision: 'AUDIENCE-OK',
      severity: 'nice-to-have',
      findings: [
        { severity: 'nice-to-have', location: 'x.md:Summary', description: 'Documented obligations addressed: internal research memo for the planning team.' },
      ],
      findings_count: 1,
      rationale: 'All layers coherent.',
    }),
  );
  const result = audience.commitAudienceVerdict(tmp, { verdictPath, artifactPath: path.join(tmp, '.planning', 'x.md') });
  const body = fs.readFileSync(result.audiencePath, 'utf-8');
  assertNoBanListInText(body, 'emitted {artifact}.audience.md (English AUDIENCE-OK)');
});

test('emitted {artifact}.audience.md override path — no ban-list tokens', () => {
  const tmp = seedTmp('kr');
  const verdictPath = path.join(tmp, '.planning', '.audience-verdict.tmp.json');
  fs.writeFileSync(
    verdictPath,
    JSON.stringify({
      decision: 'DRIFTED-content',
      severity: 'material',
      findings_count: 1,
      findings: [
        { severity: 'material', location: 'x.md:body', description: '추가 작업이 필요한 항목: 청중 세부화' },
      ],
      rationale: '청중 구체화 부족',
    }),
  );
  const overrideResult = audience.commitAudienceVerdict(tmp, {
    verdictPath,
    artifactPath: path.join(tmp, '.planning', 'x.md'),
    override: true,
    overrideReason: '사용자가 의도적으로 현재 상태 승인',
  });
  const body = fs.readFileSync(overrideResult.audiencePath, 'utf-8');
  assertNoBanListInText(body, 'emitted {artifact}.audience.md (override path)');
});

test('static file brief/references/audience-vocabulary.md — ban-list tokens only in Ban-list sections', () => {
  const content = fs.readFileSync(path.join(REPO_ROOT, 'brief/references/audience-vocabulary.md'), 'utf-8');
  const sections = content.split(/^## /m);
  for (let i = 1; i < sections.length; i++) {
    const sec = sections[i];
    const headerLine = sec.split('\n', 1)[0];
    if (/^Ban-list/i.test(headerLine)) continue;
    if (/^Hedging/i.test(headerLine)) continue; // hedging section is its own authoritative list
    for (const tok of BAN_TOKENS_EN) {
      const re = new RegExp(`\\b${tok}\\b`, 'gi');
      if (re.test(sec)) {
        assert.fail(`audience-vocabulary.md: EN ban-list token '${tok}' appeared in NON-Ban-list section '${headerLine}'. Move to a Ban-list section or remove.`);
      }
    }
    for (const tok of BAN_TOKENS_KO) {
      if (sec.includes(tok)) {
        assert.fail(`audience-vocabulary.md: KO ban-list token '${tok}' appeared in NON-Ban-list section '${headerLine}'.`);
      }
    }
  }
});

test('static file agents/brief-audience-guard.md — ban-list tokens only inside vocabulary_discipline block', () => {
  const content = fs.readFileSync(path.join(REPO_ROOT, 'agents/brief-audience-guard.md'), 'utf-8');
  const vdMatch = content.match(/<vocabulary_discipline>([\s\S]*?)<\/vocabulary_discipline>/);
  assert.ok(vdMatch, '<vocabulary_discipline> block must exist in agents/brief-audience-guard.md');
  const outsideVd = content.replace(vdMatch[0], '');
  for (const tok of BAN_TOKENS_EN) {
    const re = new RegExp(`\\b${tok}\\b`, 'gi');
    if (re.test(outsideVd)) {
      assert.fail(`agents/brief-audience-guard.md: EN ban-list token '${tok}' appeared OUTSIDE <vocabulary_discipline> block.`);
    }
  }
  for (const tok of BAN_TOKENS_KO) {
    if (outsideVd.includes(tok)) {
      assert.fail(`agents/brief-audience-guard.md: KO ban-list token '${tok}' appeared OUTSIDE <vocabulary_discipline> block.`);
    }
  }
});

test('static file brief/workflows/audience-guard.md — no ban-list tokens anywhere (orchestration prose)', () => {
  const content = fs.readFileSync(path.join(REPO_ROOT, 'brief/workflows/audience-guard.md'), 'utf-8');
  assertNoBanListInText(content, 'brief/workflows/audience-guard.md');
});
