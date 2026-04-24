/**
 * brief-audience-state-roundtrip.test.cjs — Plan 05-04 Task 6.
 *
 * Asserts state.brief.last_gate_results.audience round-trips through
 * commitAudienceVerdict → STATE.md → frontmatter parser. The Phase 2 D-03
 * forward-declared allowlist supports this field without further changes.
 *
 * Reference: 05-04-PLAN.md Task 6; Phase 2 D-03 + D-20 + D-21.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const audience = require('../brief/bin/lib/audience.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

function setupTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-aud-state-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(path.join(tmp, '.planning', 'config.json'), JSON.stringify({ brief: { region: 'us' } }));
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'business_model: b2b',
      'region: us',
      'audience_policy:',
      '  default: internal',
      '  permitted: [internal, external]',
      'compliance_packs: []',
      'status: ready',
      'immutable_items: []',
      'last_amended: "2026-04-22T00:00:00.000Z"',
      '---',
      '',
      '# OBJECTIVES',
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
      'stopped_at: "state roundtrip"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

test('commitAudienceVerdict writes state.brief.last_gate_results.audience (happy path, AUDIENCE-OK)', () => {
  const tmp = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.audience-verdict.tmp.json');
  // Seed a valid AUDIENCE-OK verdict directly; the commit path is what we test.
  fs.writeFileSync(
    verdictPath,
    JSON.stringify({
      decision: 'AUDIENCE-OK',
      severity: 'nice-to-have',
      findings_count: 0,
      findings: [],
      rationale: 'All layers aligned.',
    }),
  );
  const result = audience.commitAudienceVerdict(tmp, {
    verdictPath,
    artifactPath: path.join(tmp, '.planning', 'some-artifact.md'),
  });
  assert.equal(result.stateUpdated, true);
  assert.ok(result.audiencePath);
  assert.ok(fs.existsSync(result.audiencePath));

  const stateFm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  assert.ok(stateFm.brief, 'brief namespace must be populated');
  assert.ok(stateFm.brief.last_gate_results, 'last_gate_results must be populated');
  const aud = stateFm.brief.last_gate_results.audience;
  assert.ok(aud, 'state.brief.last_gate_results.audience must be present');
  assert.equal(aud.decision, 'AUDIENCE-OK');
  assert.equal(aud.severity, 'nice-to-have');
  // findings_count may round-trip as string "0" via YAML; coerce before assert.
  assert.equal(Number(aud.findings_count), 0);
  assert.ok(aud.at, 'at timestamp must be recorded');
});

test('commitAudienceVerdict override path records override flag + sanitized reason', () => {
  const tmp = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.audience-verdict.tmp.json');
  // Seed a DRIFTED verdict; override should flip decision to AUDIENCE-OK.
  fs.writeFileSync(
    verdictPath,
    JSON.stringify({
      decision: 'DRIFTED-content',
      severity: 'material',
      findings_count: 1,
      findings: [
        { severity: 'material', location: 'x.md:body', description: '추가 작업이 필요한 항목: 청중 세부화' },
      ],
      rationale: 'material-only content drift',
    }),
  );
  const result = audience.commitAudienceVerdict(tmp, {
    verdictPath,
    artifactPath: path.join(tmp, '.planning', 'some-artifact.md'),
    override: true,
    overrideReason: '사용자가 의도적으로 현재 상태 승인',
  });
  assert.equal(result.stateUpdated, true);
  const stateFm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  const aud = stateFm.brief.last_gate_results.audience;
  assert.equal(aud.decision, 'AUDIENCE-OK');
  assert.equal(aud.severity, 'material');
  // override may round-trip as string 'true' (Pitfall #5); accept either.
  assert.ok(aud.override === true || aud.override === 'true', `expected override flag, got ${aud.override}`);
  assert.match(String(aud.override_reason), /사용자가 의도적으로/);
});

test('commitAudienceVerdict unlinks the verdict tmp file in finally', () => {
  const tmp = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.audience-verdict.tmp.json');
  fs.writeFileSync(
    verdictPath,
    JSON.stringify({
      decision: 'AUDIENCE-OK',
      severity: 'nice-to-have',
      findings_count: 0,
      findings: [],
      rationale: 'n/a',
    }),
  );
  audience.commitAudienceVerdict(tmp, { verdictPath, artifactPath: '.planning/x.md' });
  assert.equal(fs.existsSync(verdictPath), false, 'verdict tmp file must be unlinked');
});
