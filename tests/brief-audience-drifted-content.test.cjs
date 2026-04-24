/**
 * brief-audience-drifted-content.test.cjs — Plan 05-04 Task 6.
 *
 * Asserts DRIFTED-content blocking verdict when an external-audience artifact
 * contains 3+ hedging-vocabulary hits (EN or KO). Short-circuits without LLM.
 *
 * Reference: 05-04-PLAN.md Task 6; 05-CONTEXT.md D-09 Screen (a).
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const audience = require('../brief/bin/lib/audience.cjs');

const FIXTURES = path.join(__dirname, 'fixtures', 'audience');

function setupTmp(fxName, region) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-aud-content-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: region || 'us' } }),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'business_model: b2b',
      'region: ' + (region || 'us'),
      'audience_policy:',
      '  default: internal',
      '  permitted: [internal, partner, external]',
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
  const artPath = path.join(tmp, 'artifact.md');
  fs.copyFileSync(path.join(FIXTURES, fxName), artPath);
  return { tmp, artPath };
}

test('drifted-content-hedging-external-en → short-circuits DRIFTED-content blocking (3+ hits)', () => {
  const { tmp, artPath } = setupTmp('drifted-content-hedging-external-en.md');
  const result = audience.runDeterministicScreen(tmp, {
    artifact: artPath,
    baseline: path.join(tmp, '.planning', 'OBJECTIVES.md'),
  });
  assert.ok(result.verdict, 'deterministic screen must short-circuit on 3+ hedging cluster');
  assert.equal(result.verdict.decision, 'DRIFTED-content');
  assert.equal(result.verdict.severity, 'blocking');
  assert.equal(audience.validateVerdict(result.verdict), null);
  assert.match(result.verdict.findings[0].description, /hedging|Content inconsistent/i);
});

test('drifted-content-hedging-external-ko → short-circuits DRIFTED-content blocking (Korean tokens)', () => {
  const { tmp, artPath } = setupTmp('drifted-content-hedging-external-ko.md', 'kr');
  const result = audience.runDeterministicScreen(tmp, {
    artifact: artPath,
    baseline: path.join(tmp, '.planning', 'OBJECTIVES.md'),
  });
  assert.ok(result.verdict);
  assert.equal(result.verdict.decision, 'DRIFTED-content');
  assert.equal(result.verdict.severity, 'blocking');
  assert.match(result.verdict.findings[0].description, /청중|hedging/);
});

test('runAudience on external-hedging fixture → llmPass NEVER called (short-circuit)', () => {
  const { tmp, artPath } = setupTmp('drifted-content-hedging-external-en.md');
  const verdictOutPath = path.join(tmp, '.audience-verdict.tmp.json');
  let called = false;
  const stubLlm = () => {
    called = true;
    return { decision: 'AUDIENCE-OK', severity: 'nice-to-have', findings: [], rationale: 'never' };
  };
  const v = audience.runAudience(tmp, {
    artifact: artPath,
    baseline: path.join(tmp, '.planning', 'OBJECTIVES.md'),
    verdictOutPath,
    llmPass: stubLlm,
  });
  assert.equal(called, false);
  assert.equal(v.decision, 'DRIFTED-content');
  assert.equal(v.severity, 'blocking');
});

test('1-2 hedging hits → material finding (NO short-circuit), DRIFTED only if llm piles on', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-aud-hedging-12-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(path.join(tmp, '.planning', 'config.json'), JSON.stringify({ brief: { region: 'us' } }));
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    '---\nbusiness_model: b2b\nregion: us\naudience_policy:\n  default: internal\n  permitted: [internal, external]\ncompliance_packs: []\nstatus: ready\nimmutable_items: []\nlast_amended: "2026-04-22T00:00:00.000Z"\n---\n\n# OBJ\n',
  );
  const artPath = path.join(tmp, 'artifact.md');
  // 2 hedging tokens only (TBD, we believe) — below the 3-threshold.
  fs.writeFileSync(
    artPath,
    [
      '---',
      'audience:',
      '  type: external',
      '  confidentiality: external',
      'business_context:',
      '  model: b2b',
      '---',
      '',
      '# External Brief',
      '',
      'We believe the market is large.',
      'TBD pricing tier.',
      '',
    ].join('\n'),
  );
  const result = audience.runDeterministicScreen(tmp, {
    artifact: artPath,
    baseline: path.join(tmp, '.planning', 'OBJECTIVES.md'),
  });
  assert.equal(result.verdict, null, '2 hits must not short-circuit');
  const material = result.findings.filter((f) => f.severity === 'material');
  assert.ok(material.length >= 2, `expected at least 2 material findings, got ${material.length}`);
});

test('external-content with 3+ hedging hits — path-traversal guard rejects bogus --artifact', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-aud-path-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(path.join(tmp, '.planning', 'config.json'), JSON.stringify({ brief: { region: 'us' } }));
  fs.writeFileSync(path.join(tmp, '.planning', 'OBJECTIVES.md'), '---\nbusiness_model: b2b\n---\n\n');
  // Verdict tmp file used as --verdict for commit. A bogus traversal attempt
  // on --verdict must be rejected by _resolveSafePath.
  assert.throws(
    () => audience.commitAudienceVerdict(tmp, { verdictPath: '../../etc/passwd', artifactPath: 'whatever.md' }),
    /path traversal refused/,
  );
});
