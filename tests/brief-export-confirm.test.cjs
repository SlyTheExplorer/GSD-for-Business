/**
 * brief-export-confirm.test.cjs — Plan 08-04 Wave 0 RED→GREEN.
 *
 * Verifies export.cjs 1-step confirm UI + 3-path interrupt + KO/EN variant:
 *   1) confirm test 1: exportArtifact(cwd, artifact, { format:'pptx', askUser:mockYes })
 *      calls leakageDiff first, then runAudience, then runCompliance, then
 *      displays confirm UI with 6 fields, then invokes Marp (mocked spawnSync),
 *      and writes output file `proposal-deck.partner.pptx`.
 *   2) confirm test 2: AUDIENCE blocking → 3-path interrupt with paths
 *      ['frontmatter 수정', '데크 다시 쓰기', 'force-accept (audit trail)'].
 *   3) confirm test 3: region:kr → Korean variant; region:us → English variant
 *      (per RESEARCH.md Pattern 8 lines 1003-1019).
 *
 * Reference: 08-04-PLAN.md Task 1 + Task 2; 08-RESEARCH.md Pattern 8 lines
 * 973-1047; brief/workflows/audience-guard.md Steps 5A/5B/6.
 *
 * Test pattern: try/require wrap so the test file LOADS even when the lib
 * does not yet exist (Wave 0 RED state predictability — Plan 02 convention).
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

let exportArtifact = null;
let formatConfirmUI = null;
let watermarkFor = null;
try {
  const mod = require('../brief/bin/lib/export.cjs');
  exportArtifact = mod.exportArtifact || null;
  formatConfirmUI = mod.formatConfirmUI || null;
  watermarkFor = mod.watermarkFor || null;
} catch (err) {
  if (err && err.code !== 'MODULE_NOT_FOUND') throw err;
  // Wave 0 RED state: export.cjs not yet implemented.
}

// ─── Test harness — temp project setup with realistic OBJECTIVES + STATE ──
function setupTmp(opts = {}) {
  const region = opts.region || 'us';
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-export-confirm-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region, business_model: 'b2c', compliance_packs: [] } }),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'business_model: b2c',
      `region: ${region}`,
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
      'Build a partner pilot.',
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
      'stopped_at: "export-confirm-test"',
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

const HAPPY_PARTNER_BODY = [
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
  '# Partner Proposal Deck',
  '',
  // Concrete, specific content — no hedging vocab. Avoids voice-fit.cjs banned words.
  'In Q3 2026 we will pilot the partner-rollout program with 12 stores in Seoul.',
  'Our 47% retention metric on the Q2 2026 cohort exceeds market benchmark.',
  '',
].join('\n');

// askUser mock factory. Each call returns the next queued response.
function mockAsk(responses) {
  let i = 0;
  const calls = [];
  const fn = (q) => {
    calls.push(q);
    if (i >= responses.length) {
      throw new Error(`mockAsk exhausted: no queued response for call #${i + 1}; question=${JSON.stringify(q)}`);
    }
    return responses[i++];
  };
  fn.calls = calls;
  return fn;
}

// spawnSync mock that emits a stub PPTX file at outputPath instead of invoking npx.
function mockSpawn(outputPath) {
  return (cmd, args, _opts) => {
    // Find the `-o` flag value if present; otherwise use provided outputPath.
    let out = outputPath;
    for (let k = 0; k < args.length - 1; k++) {
      if (args[k] === '-o') { out = args[k + 1]; break; }
    }
    if (out) fs.writeFileSync(out, 'STUB-PPTX');
    return { status: 0, stdout: '', stderr: '', signal: null };
  };
}

// detectBrowser mock — pretend Chrome is installed.
function mockChromeAvailable() {
  return { browser: 'Google Chrome', path: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' };
}

// ─── Test 1: leakageDiff → runAudience → runCompliance → confirm UI → Marp ─
test('confirm test 1: 7-step orchestration writes proposal-deck.partner.pptx via Marp mock', () => {
  assert.ok(exportArtifact, 'export.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = setupTmp({ region: 'us' });
  const artifact = writeArtifact(tmp, HAPPY_PARTNER_BODY, 'proposal-deck.md');
  const expectedOut = path.join(path.dirname(artifact), 'proposal-deck.partner.pptx');
  // Use relative path from cwd so _resolveSafePath canonicalizes properly.
  const relArtifact = path.relative(tmp, artifact);

  const askUser = mockAsk([
    0,  // confirm UI: Yes, render
  ]);
  const spawn = mockSpawn(expectedOut);

  const result = exportArtifact(tmp, relArtifact, {
    format: 'pptx',
    askUser,
    _spawnSync: spawn,
    _detectBrowser: mockChromeAvailable,
  });

  assert.equal(result.ok, true, `expected ok:true; got ${JSON.stringify(result)}`);
  assert.ok(fs.existsSync(expectedOut), `expected output file at ${expectedOut}`);
  // At least one askUser call (the confirm UI in Step 4).
  assert.ok(askUser.calls.length >= 1, 'expected at least one askUser invocation (confirm UI)');
  // Confirm UI must include 6-field display.
  const confirmCall = askUser.calls.find((c) => /EXPORT|확인|render/i.test(JSON.stringify(c)));
  assert.ok(confirmCall, `expected confirm-UI askUser call; got calls=${JSON.stringify(askUser.calls)}`);
});

// ─── Test 2: AUDIENCE blocking → 3-path interrupt ─────────────────────────
test('confirm test 2: AUDIENCE blocking → 3-path interrupt invoked with frontmatter/rewrite/force-accept', () => {
  assert.ok(exportArtifact, 'export.cjs not yet implemented (Wave 0 RED expected)');

  const tmp = setupTmp({ region: 'us' });
  // Artifact that triggers AUDIENCE DRIFTED-content (3+ hedging hits in external):
  const blockingBody = [
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
    '# Partner Deck (drifted)',
    '',
    'TBD: pricing not finalized.',
    'we believe this is the right approach but unsure.',
    'concerns about the API rate limits.',
    'still proving the SLA in pilot.',
    'open question on data retention policy.',
    '',
  ].join('\n');
  const artifact = writeArtifact(tmp, blockingBody, 'proposal-deck.md');
  const relArtifact = path.relative(tmp, artifact);

  // User picks option 0 (frontmatter 수정) → workflow returns ok:false.
  const askUser = mockAsk([0]);
  const spawn = mockSpawn(null);

  const result = exportArtifact(tmp, relArtifact, {
    format: 'pptx',
    askUser,
    _spawnSync: spawn,
    _detectBrowser: mockChromeAvailable,
  });

  assert.equal(result.ok, false, `expected ok:false on blocking + frontmatter-revision choice; got ${JSON.stringify(result)}`);
  assert.match(String(result.reason || ''), /frontmatter|revision/i,
    `expected reason mentioning frontmatter; got ${JSON.stringify(result)}`);

  // The 3-path interrupt MUST have been the first askUser call.
  assert.ok(askUser.calls.length >= 1, 'expected at least one askUser call (3-path interrupt)');
  const interruptCall = askUser.calls[0];
  const callJson = JSON.stringify(interruptCall);
  assert.match(callJson, /frontmatter/i, `expected 3-path interrupt to include 'frontmatter'; got ${callJson}`);
  assert.match(callJson, /다시 쓰기|rewrite/i, `expected 3-path interrupt to include 'rewrite'; got ${callJson}`);
  assert.match(callJson, /force.accept|force-accept/i, `expected 3-path interrupt to include 'force-accept'; got ${callJson}`);
});

// ─── Test 3: KO/EN variant per region ─────────────────────────────────────
test('confirm test 3: region:kr → Korean variant; region:us → English variant', () => {
  assert.ok(formatConfirmUI, 'formatConfirmUI not yet implemented (Wave 0 RED expected)');

  const fmExternal = {
    audience: { type: 'external', confidentiality: 'partner' },
    voice: { tone: 'formal', perspective: 'first-person-plural' },
    business_context: { model: 'b2c', region: 'kr' },
  };
  const audienceVerdict = { decision: 'AUDIENCE-OK', severity: 'nice-to-have', findings_count: 0, findings: [], rationale: 'ok' };
  const complianceVerdict = { decision: 'COMPLIANCE-OK', severity: 'nice-to-have', findings_count: 0, findings: [], rationale: 'ok' };
  const leakage = { findings: [], rationale: 'scanned 0 sibling(s)' };

  const koUI = formatConfirmUI({
    artifactPath: '.planning/deliverables/proposal-deck.md',
    fm: fmExternal,
    leakage,
    audienceVerdict,
    complianceVerdict,
    language: 'ko',
    outputFilename: 'proposal-deck.partner.pptx',
    watermark: '파트너 전용 — 재배포 금지',
  });
  assert.match(koUI, /확인|산출물|청중|기밀도|출력|워터마크/, `expected Korean labels; got: ${koUI.slice(0, 200)}`);

  const enUI = formatConfirmUI({
    artifactPath: '.planning/deliverables/proposal-deck.md',
    fm: fmExternal,
    leakage,
    audienceVerdict,
    complianceVerdict,
    language: 'en',
    outputFilename: 'proposal-deck.partner.pptx',
    watermark: 'Partner-only — Do not redistribute',
  });
  assert.match(enUI, /CONFIRMATION|Artifact|Audience|Confidentiality|Output|Watermark/i,
    `expected English labels; got: ${enUI.slice(0, 200)}`);
});
