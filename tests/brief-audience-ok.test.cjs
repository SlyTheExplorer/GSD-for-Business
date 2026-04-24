/**
 * brief-audience-ok.test.cjs — Plan 05-04 Task 6.
 *
 * Exercises AUDIENCE-OK path on well-formed research artifacts (EN + KO).
 * - Deterministic screen returns no short-circuit verdict (3 mandatory fields
 *   present + well-formed; no hedging in external body since audience.type is
 *   internal; no ban-list hits).
 * - runAudience without an llmPass merges to AUDIENCE-OK nice-to-have.
 *
 * Reference: 05-04-PLAN.md Task 6; 05-CONTEXT.md D-09 + D-10.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const audience = require('../brief/bin/lib/audience.cjs');

const FIXTURES = path.join(__dirname, 'fixtures', 'audience');

function setupTmp(fxName, region) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-aud-ok-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: region || 'us' } }),
  );
  // Minimal OBJECTIVES.md with audience_policy.
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
      '# OBJECTIVES',
      '',
    ].join('\n'),
  );
  const artPath = path.join(tmp, 'artifact.md');
  fs.copyFileSync(path.join(FIXTURES, fxName), artPath);
  return { tmp, artPath };
}

test('audience-ok-en.md → deterministic screen returns no short-circuit verdict (no blocking findings)', () => {
  const { tmp, artPath } = setupTmp('audience-ok-en.md');
  const result = audience.runDeterministicScreen(tmp, {
    artifact: artPath,
    baseline: path.join(tmp, '.planning', 'OBJECTIVES.md'),
  });
  assert.equal(result.verdict, null, 'no short-circuit expected on well-formed artifact');
  const blocking = result.findings.filter((f) => f.severity === 'blocking');
  assert.equal(blocking.length, 0);
});

test('audience-ok-ko.md → deterministic screen returns no short-circuit verdict (Korea region)', () => {
  const { tmp, artPath } = setupTmp('audience-ok-ko.md', 'kr');
  const result = audience.runDeterministicScreen(tmp, {
    artifact: artPath,
    baseline: path.join(tmp, '.planning', 'OBJECTIVES.md'),
  });
  assert.equal(result.verdict, null);
  const blocking = result.findings.filter((f) => f.severity === 'blocking');
  assert.equal(blocking.length, 0);
});

test('runAudience without llmPass on OK fixture writes AUDIENCE-OK verdict', () => {
  const { tmp, artPath } = setupTmp('audience-ok-en.md');
  const verdictOutPath = path.join(tmp, '.audience-verdict.tmp.json');
  const v = audience.runAudience(tmp, {
    artifact: artPath,
    baseline: path.join(tmp, '.planning', 'OBJECTIVES.md'),
    verdictOutPath,
  });
  assert.equal(v.decision, 'AUDIENCE-OK');
  assert.ok(['nice-to-have', 'material'].includes(v.severity), `unexpected severity ${v.severity}`);
  assert.equal(audience.validateVerdict(v), null);
  assert.ok(fs.existsSync(verdictOutPath));
  const onDisk = JSON.parse(fs.readFileSync(verdictOutPath, 'utf-8'));
  assert.equal(onDisk.decision, 'AUDIENCE-OK');
});
