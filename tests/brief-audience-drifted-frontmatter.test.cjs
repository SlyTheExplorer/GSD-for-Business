/**
 * brief-audience-drifted-frontmatter.test.cjs — Plan 05-04 Task 6.
 *
 * Asserts the deterministic screen fires `blocking` severity + DRIFTED-frontmatter
 * decision when a mandatory D-10 frontmatter field is missing (audience.type
 * or audience.confidentiality). Short-circuits without needing LLM pass.
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

function setupTmp(fxName) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-aud-fm-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: 'us' } }),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'business_model: b2b',
      'region: us',
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

test('drifted-frontmatter-missing-type → short-circuits DRIFTED-frontmatter blocking', () => {
  const { tmp, artPath } = setupTmp('drifted-frontmatter-missing-type.md');
  const result = audience.runDeterministicScreen(tmp, {
    artifact: artPath,
    baseline: path.join(tmp, '.planning', 'OBJECTIVES.md'),
  });
  assert.ok(result.verdict, 'deterministic screen must short-circuit on missing mandatory field');
  assert.equal(result.verdict.decision, 'DRIFTED-frontmatter');
  assert.equal(result.verdict.severity, 'blocking');
  assert.equal(result.verdict.findings_count, 1);
  assert.equal(audience.validateVerdict(result.verdict), null);
  assert.match(result.verdict.findings[0].description, /audience\.type/);
});

test('drifted-frontmatter-missing-confidentiality → short-circuits DRIFTED-frontmatter blocking', () => {
  const { tmp, artPath } = setupTmp('drifted-frontmatter-missing-confidentiality.md');
  const result = audience.runDeterministicScreen(tmp, {
    artifact: artPath,
    baseline: path.join(tmp, '.planning', 'OBJECTIVES.md'),
  });
  assert.ok(result.verdict);
  assert.equal(result.verdict.decision, 'DRIFTED-frontmatter');
  assert.equal(result.verdict.severity, 'blocking');
  assert.match(result.verdict.findings[0].description, /audience\.confidentiality/);
});

test('runAudience on missing-type fixture — llmPass NEVER called (short-circuit)', () => {
  const { tmp, artPath } = setupTmp('drifted-frontmatter-missing-type.md');
  const verdictOutPath = path.join(tmp, '.audience-verdict.tmp.json');
  let called = false;
  const stubLlm = () => {
    called = true;
    return { decision: 'AUDIENCE-OK', severity: 'nice-to-have', findings: [], rationale: 'should not run' };
  };
  const v = audience.runAudience(tmp, {
    artifact: artPath,
    baseline: path.join(tmp, '.planning', 'OBJECTIVES.md'),
    verdictOutPath,
    llmPass: stubLlm,
  });
  assert.equal(called, false, 'short-circuit must skip llmPass');
  assert.equal(v.decision, 'DRIFTED-frontmatter');
  assert.equal(v.severity, 'blocking');
});

test('invalid enum value in audience.type is caught by closed-enum validation', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-aud-enum-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(path.join(tmp, '.planning', 'config.json'), JSON.stringify({ brief: { region: 'us' } }));
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    '---\nbusiness_model: b2b\nregion: us\naudience_policy:\n  default: internal\n  permitted: [internal]\ncompliance_packs: []\nstatus: ready\nimmutable_items: []\nlast_amended: "2026-04-22T00:00:00.000Z"\n---\n\n# OBJ\n',
  );
  const artPath = path.join(tmp, 'artifact.md');
  // audience.type="extornal" (typo) is not in AUDIENCE_TYPE_ENUM → blocking.
  fs.writeFileSync(
    artPath,
    '---\naudience:\n  type: extornal\n  confidentiality: internal\nbusiness_context:\n  model: b2b\n---\n\n# Invalid enum\n',
  );
  const result = audience.runDeterministicScreen(tmp, {
    artifact: artPath,
    baseline: path.join(tmp, '.planning', 'OBJECTIVES.md'),
  });
  assert.ok(result.verdict);
  assert.equal(result.verdict.decision, 'DRIFTED-frontmatter');
  assert.match(result.verdict.findings[0].description, /invalid enum value/);
});
