/**
 * brief-export-audience-rerun.test.cjs — Plan 08-04 Wave 0 RED→GREEN.
 *
 * Verifies Phase 5 substrate AUDIENCE re-run with separate run-id:
 *   1) runAudience is called with verdictOutPath in the form
 *      `.planning/.export-{ts}-{pid}.audience-verdict.tmp.json` — separate
 *      from any Phase 5 in-flight verdict.
 *   2) AUDIENCE-OK verdict triggers commitAudienceVerdict(cwd, { override:false })
 *      (no override).
 *   3) After commit, the `.{exportRunId}.audience-verdict.tmp.json` is cleaned
 *      up (does not persist).
 *
 * Reference: 08-04-PLAN.md Task 1; 08-RESEARCH.md Pattern 1 lines 397-444;
 * brief/bin/lib/audience.cjs lines 295-414 (runAudience + commitAudienceVerdict).
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

let exportArtifact = null;
let runExportGates = null;
try {
  const mod = require('../brief/bin/lib/export.cjs');
  exportArtifact = mod.exportArtifact || null;
  runExportGates = mod.runExportGates || null;
} catch (err) {
  if (err && err.code !== 'MODULE_NOT_FOUND') throw err;
}

function setupTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-export-audrerun-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: 'us', business_model: 'b2c', compliance_packs: [] } }),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'business_model: b2c',
      'region: us',
      'audience_policy:',
      '  default: internal',
      '  permitted: [internal, partner, external]',
      'compliance_packs: []',
      'status: ready',
      'immutable_items: []',
      'last_amended: "2026-04-26T00:00:00.000Z"',
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
      'current_phase: "08"',
      'stopped_at: "audience-rerun-test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

function writeArtifact(tmp, content, basename) {
  const folder = path.join(tmp, '.planning', 'deliverables');
  fs.mkdirSync(folder, { recursive: true });
  const p = path.join(folder, basename || 'proposal-deck.md');
  fs.writeFileSync(p, content);
  return p;
}

const HAPPY_BODY = [
  '---',
  'audience:',
  '  type: external',
  '  confidentiality: partner',
  'voice:',
  '  tone: formal',
  '  perspective: first-person-plural',
  'business_context:',
  '  model: b2c',
  '  region: us',
  '---',
  '',
  '# Partner Proposal',
  '',
  'In Q3 2026 we will pilot the partner-rollout program with 12 stores in Seoul.',
  'Our 47% retention metric on the Q2 2026 cohort exceeds market benchmark.',
  '',
].join('\n');

function mockAsk(responses) {
  let i = 0;
  const calls = [];
  const fn = (q) => {
    calls.push(q);
    if (i >= responses.length) {
      throw new Error(`mockAsk exhausted: question=${JSON.stringify(q)}`);
    }
    return responses[i++];
  };
  fn.calls = calls;
  return fn;
}

function mockSpawn(outputPath) {
  return (cmd, args, _opts) => {
    let out = outputPath;
    for (let k = 0; k < args.length - 1; k++) {
      if (args[k] === '-o') { out = args[k + 1]; break; }
    }
    if (out) fs.writeFileSync(out, 'STUB-PPTX');
    return { status: 0, stdout: '', stderr: '', signal: null };
  };
}

function mockChromeAvailable() {
  return { browser: 'Google Chrome', path: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' };
}

// ─── Test 1: runAudience verdictOutPath uses .export-{ts}-{pid}. prefix ───
test('audience-rerun test 1: runAudience invoked with verdictOutPath matching .export-{ts}-{pid}.audience-verdict.tmp.json', () => {
  assert.ok(exportArtifact, 'export.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = setupTmp();
  const artifact = writeArtifact(tmp, HAPPY_BODY);
  const relArtifact = path.relative(tmp, artifact);
  const expectedOut = path.join(path.dirname(artifact), 'proposal-deck.partner.pptx');

  // Capture verdictOutPath via injected runAudience spy.
  const audienceCalls = [];
  const audience = require('../brief/bin/lib/audience.cjs');
  const realRun = audience.runAudience;
  audience.runAudience = function (cwd, opts) {
    audienceCalls.push({ cwd, opts: { ...opts } });
    return realRun.call(this, cwd, opts);
  };

  const askUser = mockAsk([0]); // confirm: Yes
  try {
    exportArtifact(tmp, relArtifact, {
      format: 'pptx',
      askUser,
      _spawnSync: mockSpawn(expectedOut),
      _detectBrowser: mockChromeAvailable,
    });
  } finally {
    audience.runAudience = realRun;
  }

  assert.ok(audienceCalls.length >= 1, 'expected runAudience to be invoked at least once');
  const opts = audienceCalls[0].opts;
  assert.ok(typeof opts.verdictOutPath === 'string', 'verdictOutPath must be a string');
  // Must be a unique export-run-id path, NOT the default .audience-verdict.tmp.json.
  assert.match(
    opts.verdictOutPath,
    /\.export-\d+-\d+\.audience-verdict\.tmp\.json$/,
    `expected export-{ts}-{pid} run-id pattern; got ${opts.verdictOutPath}`,
  );
  assert.ok(opts.verdictOutPath.includes(path.join('.planning')),
    `verdictOutPath must live under .planning/; got ${opts.verdictOutPath}`);
});

// ─── Test 2: AUDIENCE-OK → commitAudienceVerdict called with override:false ─
test('audience-rerun test 2: AUDIENCE-OK triggers commitAudienceVerdict with override:false (no override)', () => {
  assert.ok(exportArtifact, 'export.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = setupTmp();
  const artifact = writeArtifact(tmp, HAPPY_BODY);
  const relArtifact = path.relative(tmp, artifact);
  const expectedOut = path.join(path.dirname(artifact), 'proposal-deck.partner.pptx');

  // Spy on commitAudienceVerdict.
  const commitCalls = [];
  const audience = require('../brief/bin/lib/audience.cjs');
  const realCommit = audience.commitAudienceVerdict;
  audience.commitAudienceVerdict = function (cwd, opts) {
    commitCalls.push({ cwd, opts: { ...opts } });
    return realCommit.call(this, cwd, opts);
  };

  const askUser = mockAsk([0]);
  try {
    const result = exportArtifact(tmp, relArtifact, {
      format: 'pptx',
      askUser,
      _spawnSync: mockSpawn(expectedOut),
      _detectBrowser: mockChromeAvailable,
    });
    assert.equal(result.ok, true, `expected ok:true; got ${JSON.stringify(result)}`);
  } finally {
    audience.commitAudienceVerdict = realCommit;
  }

  assert.ok(commitCalls.length >= 1, 'expected commitAudienceVerdict invocation');
  const callOpts = commitCalls[0].opts;
  // override may be undefined or false — both indicate "no override".
  assert.notEqual(callOpts.override, true,
    `expected override !== true on AUDIENCE-OK path; got ${JSON.stringify(callOpts)}`);
});

// ─── Test 4: COMPLIANCE re-run uses separate export-run-id verdictOutPath ─
test('audience-rerun test 4: runCompliance also invoked with .export-{ts}-{pid}.compliance-verdict.tmp.json', () => {
  assert.ok(exportArtifact, 'export.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = setupTmp();
  const artifact = writeArtifact(tmp, HAPPY_BODY);
  const relArtifact = path.relative(tmp, artifact);
  const expectedOut = path.join(path.dirname(artifact), 'proposal-deck.partner.pptx');

  // Spy on runCompliance.
  const complianceCalls = [];
  const compliance = require('../brief/bin/lib/compliance.cjs');
  const realRun = compliance.runCompliance;
  compliance.runCompliance = function (cwd, opts) {
    complianceCalls.push({ cwd, opts: { ...opts } });
    return realRun.call(this, cwd, opts);
  };

  const askUser = mockAsk([0]);
  try {
    exportArtifact(tmp, relArtifact, {
      format: 'pptx',
      askUser,
      _spawnSync: mockSpawn(expectedOut),
      _detectBrowser: mockChromeAvailable,
    });
  } finally {
    compliance.runCompliance = realRun;
  }

  assert.ok(complianceCalls.length >= 1, 'expected runCompliance to be invoked at least once');
  const opts = complianceCalls[0].opts;
  assert.ok(typeof opts.verdictOutPath === 'string', 'verdictOutPath must be a string');
  assert.match(
    opts.verdictOutPath,
    /\.export-\d+-\d+\.compliance-verdict\.tmp\.json$/,
    `expected export-{ts}-{pid} run-id pattern; got ${opts.verdictOutPath}`,
  );
});

// ─── Test 3: tmp verdict file cleaned up after commit ─────────────────────
test('audience-rerun test 3: after commit, .export-{ts}-{pid}.audience-verdict.tmp.json is unlinked', () => {
  assert.ok(exportArtifact, 'export.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = setupTmp();
  const artifact = writeArtifact(tmp, HAPPY_BODY);
  const relArtifact = path.relative(tmp, artifact);
  const expectedOut = path.join(path.dirname(artifact), 'proposal-deck.partner.pptx');

  const askUser = mockAsk([0]);
  const result = exportArtifact(tmp, relArtifact, {
    format: 'pptx',
    askUser,
    _spawnSync: mockSpawn(expectedOut),
    _detectBrowser: mockChromeAvailable,
  });
  assert.equal(result.ok, true, `expected ok:true; got ${JSON.stringify(result)}`);

  // Scan .planning/ for any leftover .audience-verdict.tmp.json files.
  const leftovers = fs.readdirSync(path.join(tmp, '.planning'))
    .filter((f) => /\.audience-verdict\.tmp\.json$/.test(f));
  assert.equal(leftovers.length, 0,
    `expected no leftover .audience-verdict.tmp.json files; found: ${leftovers.join(', ')}`);
});
