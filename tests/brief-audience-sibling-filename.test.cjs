/**
 * brief-audience-sibling-filename.test.cjs — Plan 05-05 Task 3.
 *
 * Locks the D-11 paired-sibling filename scheme for AUDIENCE:
 *   {artifact-dir}/{artifact-basename}.audience.md
 *
 * Exercises:
 *   1. siblingReportPath helper: unit cases (with/without .md extension, deep
 *      paths, cross-suffix for future compliance).
 *   2. commitAudienceVerdict end-to-end: writes paired-sibling file in the
 *      same directory as the source artifact, state.brief.last_gate_results
 *      round-trips correctly, verdict tmp file is unlinked in finally.
 *
 * References:
 *   - 05-05-PLAN.md Task 3 (test-id 5-05-01)
 *   - 05-CONTEXT.md D-11 paired-sibling scheme
 *   - tests/brief-audience-ok.test.cjs (fixture-setup pattern)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const audience = require('../brief/bin/lib/audience.cjs');
const FIXTURES = path.join(__dirname, 'fixtures', 'audience');

test('siblingReportPath: basic case', () => {
  assert.equal(audience.siblingReportPath('/a/b/c.md', 'audience'), '/a/b/c.audience.md');
});

test('siblingReportPath: no .md extension', () => {
  assert.equal(audience.siblingReportPath('/a/b/c', 'audience'), '/a/b/c.audience.md');
});

test('siblingReportPath: different suffix (future compliance)', () => {
  assert.equal(audience.siblingReportPath('/a/b/c.md', 'compliance'), '/a/b/c.compliance.md');
});

test('siblingReportPath: deep paths respected', () => {
  assert.equal(
    audience.siblingReportPath('/abs/p/.planning/discover/market-sizing.md', 'audience'),
    '/abs/p/.planning/discover/market-sizing.audience.md',
  );
});

test('commitAudienceVerdict writes paired-sibling file to same directory as artifact', () => {
  // Setup: tmp dir with .planning/ + a pretend discover/ subdir + artifact + OBJECTIVES.md
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-sibling-'));
  fs.mkdirSync(path.join(tmp, '.planning', 'discover'), { recursive: true });
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
      '  permitted: [internal]',
      'compliance_packs: []',
      'status: ready',
      'immutable_items: []',
      'last_amended: 2026-04-22T00:00:00.000Z',
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
      'brief:',
      '  last_gate_results:',
      '    audience: null',
      '    align: null',
      '    compliance: null',
      '---',
      '',
      '# STATE',
      '',
    ].join('\n'),
  );
  const artifactPath = path.join(tmp, '.planning', 'discover', 'market-sizing.md');
  fs.copyFileSync(path.join(FIXTURES, 'audience-ok-en.md'), artifactPath);

  // Write a valid AUDIENCE-OK verdict to a tmp JSON path
  const verdict = {
    decision: 'AUDIENCE-OK',
    severity: 'nice-to-have',
    findings_count: 0,
    findings: [],
    rationale: 'synthetic test verdict',
  };
  const verdictPath = path.join(tmp, '.planning', '.audience-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify(verdict));

  // Invoke commitAudienceVerdict
  const result = audience.commitAudienceVerdict(tmp, { verdictPath, artifactPath });

  // Paired-sibling file exists at the same directory as the artifact.
  // On macOS, /var is a symlink to /private/var; _resolveSafePath canonicalizes
  // so result.audiencePath carries the /private/var/... prefix. Compare via
  // realpath so the test is symlink-robust.
  const expectedSibling = path.join(tmp, '.planning', 'discover', 'market-sizing.audience.md');
  assert.ok(fs.existsSync(expectedSibling), `expected paired-sibling at ${expectedSibling}`);
  assert.equal(fs.realpathSync(result.audiencePath), fs.realpathSync(expectedSibling));

  // Verdict tmp file unlinked
  assert.ok(!fs.existsSync(verdictPath), 'verdict tmp file should be unlinked in finally block');

  // Sibling content starts with frontmatter (not just empty)
  const siblingContent = fs.readFileSync(expectedSibling, 'utf-8');
  assert.match(siblingContent, /^---\n/);
  assert.match(siblingContent, /decision: AUDIENCE-OK/);
});

test('commitAudienceVerdict writes state.brief.last_gate_results.audience', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-sibling-state-'));
  fs.mkdirSync(path.join(tmp, '.planning', 'discover'), { recursive: true });
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
      '  permitted: [internal]',
      'compliance_packs: []',
      'status: ready',
      'immutable_items: []',
      'last_amended: 2026-04-22T00:00:00.000Z',
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
      'brief:',
      '  last_gate_results:',
      '    audience: null',
      '    align: null',
      '    compliance: null',
      '---',
      '',
      '# STATE',
      '',
    ].join('\n'),
  );
  const artifactPath = path.join(tmp, '.planning', 'discover', 'market-sizing.md');
  fs.copyFileSync(path.join(FIXTURES, 'audience-ok-en.md'), artifactPath);
  const verdict = {
    decision: 'AUDIENCE-OK',
    severity: 'material',
    findings_count: 0,
    findings: [],
    rationale: 'test',
  };
  const verdictPath = path.join(tmp, '.planning', '.audience-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify(verdict));

  audience.commitAudienceVerdict(tmp, { verdictPath, artifactPath });

  // Re-read STATE.md and assert state.brief.last_gate_results.audience is populated
  const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');
  const stateContent = fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8');
  const fm = extractFrontmatter(stateContent);
  assert.ok(fm.brief);
  assert.ok(fm.brief.last_gate_results);
  assert.ok(fm.brief.last_gate_results.audience);
  assert.equal(fm.brief.last_gate_results.audience.decision, 'AUDIENCE-OK');
  assert.equal(fm.brief.last_gate_results.audience.severity, 'material');
  // findings_count may round-trip as string via D-20; coerce before assert.
  assert.equal(Number(fm.brief.last_gate_results.audience.findings_count), 0);
  assert.ok(fm.brief.last_gate_results.audience.at, 'at timestamp should be present');
});
