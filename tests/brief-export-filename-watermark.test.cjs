/**
 * brief-export-filename-watermark.test.cjs — Plan 08-04 Wave 0 RED→GREEN.
 *
 * Verifies Layer 1 (filename encoding) + Layer 2 (watermark text mapping)
 * + path-traversal guard:
 *   1) Filename encoding `{name}.{confidentiality}.{ext}` per B-D01:
 *      basename 'proposal-deck' + confidentiality 'partner' + ext 'pptx' →
 *      `proposal-deck.partner.pptx`.
 *   2) Watermark text mapping per B-D02 (4 enum × 2 lang = 8 entries):
 *      public → 'Public' / '공개'
 *      partner → 'Partner-only — Do not redistribute' / '파트너 전용 — 재배포 금지'
 *      internal → 'Internal — Do not distribute outside {organization}' / '내부용 — {조직명} 외 배포 금지'
 *      confidential → 'CONFIDENTIAL — Internal use only — Do not share' / '기밀 — 내부 사용만 — 공유 금지'
 *   3) Path-traversal guard rejects `../../../etc/passwd.md` artifactPath
 *      with thrown error containing 'path traversal refused'.
 *
 * Reference: 08-04-PLAN.md Task 1; 08-CONTEXT.md B-D01/B-D02; audience.cjs
 * lines 336-351 (path-traversal guard byte-identity).
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

let exportArtifact = null;
let watermarkFor = null;
let WATERMARKS_EN = null;
let WATERMARKS_KO = null;
try {
  const mod = require('../brief/bin/lib/export.cjs');
  exportArtifact = mod.exportArtifact || null;
  watermarkFor = mod.watermarkFor || null;
  WATERMARKS_EN = mod.WATERMARKS_EN || null;
  WATERMARKS_KO = mod.WATERMARKS_KO || null;
} catch (err) {
  if (err && err.code !== 'MODULE_NOT_FOUND') throw err;
}

function setupTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-export-fname-'));
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
      'stopped_at: "fname-test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

function writeArtifactWithConfidentiality(tmp, conf, basename) {
  const folder = path.join(tmp, '.planning', 'deliverables');
  fs.mkdirSync(folder, { recursive: true });
  const body = [
    '---',
    'audience:',
    '  type: external',
    `  confidentiality: ${conf}`,
    'voice:',
    '  tone: formal',
    '  perspective: first-person-plural',
    'business_context:',
    '  model: b2c',
    '  region: us',
    '---',
    '',
    `# Partner Proposal (${conf})`,
    '',
    'In Q3 2026 we will pilot the partner-rollout program with 12 stores in Seoul.',
    'Our 47% retention metric on the Q2 2026 cohort exceeds market benchmark.',
    '',
  ].join('\n');
  const p = path.join(folder, basename || 'proposal-deck.md');
  fs.writeFileSync(p, body);
  return p;
}

function mockAsk(responses) {
  let i = 0;
  const fn = () => {
    if (i >= responses.length) throw new Error('mockAsk exhausted');
    return responses[i++];
  };
  return fn;
}

function mockSpawn() {
  return (cmd, args) => {
    let out = null;
    for (let k = 0; k < args.length - 1; k++) {
      if (args[k] === '-o') { out = args[k + 1]; break; }
    }
    if (out) fs.writeFileSync(out, 'STUB');
    return { status: 0, stdout: '', stderr: '', signal: null };
  };
}

function mockChromeAvailable() {
  return { browser: 'Google Chrome', path: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' };
}

// ─── Test 1: filename encoding `{name}.{confidentiality}.{ext}` ──────────
test('filename-watermark test 1: confidentiality:partner + basename:proposal-deck + ext:pptx → proposal-deck.partner.pptx', () => {
  assert.ok(exportArtifact, 'export.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = setupTmp();
  const artifact = writeArtifactWithConfidentiality(tmp, 'partner', 'proposal-deck.md');
  const relArtifact = path.relative(tmp, artifact);
  const expectedOut = path.join(path.dirname(artifact), 'proposal-deck.partner.pptx');

  const result = exportArtifact(tmp, relArtifact, {
    format: 'pptx',
    askUser: mockAsk([0]),
    _spawnSync: mockSpawn(),
    _detectBrowser: mockChromeAvailable,
  });

  assert.equal(result.ok, true, `expected ok:true; got ${JSON.stringify(result)}`);
  assert.ok(fs.existsSync(expectedOut),
    `expected output at ${expectedOut}; result.output=${result.output}`);
  // result.output should match (or end with) the expected filename.
  assert.match(String(result.output || ''), /proposal-deck\.partner\.pptx$/,
    `expected result.output to end with proposal-deck.partner.pptx; got ${result.output}`);
});

// ─── Test 2: watermark mapping (4 conf × 2 lang = 8 entries) ─────────────
test('filename-watermark test 2: watermarkFor returns the canonical text per (confidentiality, language)', () => {
  assert.ok(watermarkFor, 'watermarkFor not yet implemented (Wave 0 RED expected)');

  // English variants
  assert.equal(watermarkFor('public', 'en'), 'Public',
    'public/en');
  assert.equal(watermarkFor('partner', 'en'), 'Partner-only — Do not redistribute',
    'partner/en');
  assert.equal(watermarkFor('internal', 'en'), 'Internal — Do not distribute outside {organization}',
    'internal/en');
  assert.equal(watermarkFor('confidential', 'en'), 'CONFIDENTIAL — Internal use only — Do not share',
    'confidential/en');

  // Korean variants
  assert.equal(watermarkFor('public', 'ko'), '공개', 'public/ko');
  assert.equal(watermarkFor('partner', 'ko'), '파트너 전용 — 재배포 금지', 'partner/ko');
  assert.equal(watermarkFor('internal', 'ko'), '내부용 — {조직명} 외 배포 금지', 'internal/ko');
  assert.equal(watermarkFor('confidential', 'ko'), '기밀 — 내부 사용만 — 공유 금지', 'confidential/ko');

  // Sanity check on the maps themselves (8 entries total).
  assert.ok(WATERMARKS_EN && Object.keys(WATERMARKS_EN).length === 4,
    `WATERMARKS_EN must have 4 entries; got ${WATERMARKS_EN ? Object.keys(WATERMARKS_EN).length : 'null'}`);
  assert.ok(WATERMARKS_KO && Object.keys(WATERMARKS_KO).length === 4,
    `WATERMARKS_KO must have 4 entries; got ${WATERMARKS_KO ? Object.keys(WATERMARKS_KO).length : 'null'}`);
});

// ─── Test 3: path-traversal guard rejects ../../../etc/passwd.md ─────────
test('filename-watermark test 3: path-traversal artifactPath throws "path traversal refused"', () => {
  assert.ok(exportArtifact, 'export.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = setupTmp();

  let thrown = null;
  try {
    exportArtifact(tmp, '../../../etc/passwd.md', {
      format: 'pptx',
      askUser: mockAsk([0]),
      _spawnSync: mockSpawn(),
      _detectBrowser: mockChromeAvailable,
    });
  } catch (err) {
    thrown = err;
  }
  assert.ok(thrown, 'expected exportArtifact to throw on path-traversal artifactPath');
  assert.match(String(thrown.message || ''), /path traversal refused/i,
    `expected error message containing 'path traversal refused'; got ${thrown.message}`);
});
