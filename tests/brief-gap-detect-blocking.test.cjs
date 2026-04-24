/**
 * brief-gap-detect-blocking.test.cjs — Plan 06-04 Task 1.
 *
 * Asserts BLOCKING verdict path:
 *   - runGapDetect with llmPass returning fixture verdict writes verdict tmp.
 *   - commitGapDetectVerdict writes paired-sibling {artifact}.gaps.md.
 *   - state.brief.last_gate_results.gap_detect.decision === 'GAPS-BLOCKING'.
 *   - When pushFrame=true, the first BLOCKING finding pushes a frame to BOTH
 *     state.brief.return_stack and state.brief.return_stack_history.
 *
 * Reference: 06-04-PLAN.md Task 1 behaviors 1-2.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const gapDetect = require('../brief/bin/lib/gap-detect.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

const FIXTURES = path.join(__dirname, 'fixtures', 'gap-detect');

function setupTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-gap-blk-'));
  fs.mkdirSync(path.join(tmp, '.planning', 'workstreams', 'go-to-market'), { recursive: true });
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
      'last_amended: "2026-04-22T00:00:00.000Z"',
      '---',
      '',
      '# OBJECTIVES',
      '',
      '## Immutable Intent',
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
      'current_phase: "06"',
      'stopped_at: "gap-detect blocking test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  // Provide a dummy artifact + baseline so runGapDetect's existsSync passes.
  const artifactPath = path.join(tmp, '.planning', 'workstreams', 'go-to-market', 'market-sizing.md');
  fs.writeFileSync(artifactPath, '# market sizing\n\nTAM = $18.3B\n');
  return { tmp, artifactPath };
}

test('runGapDetect: with llmPass returning blocking fixture writes verdict tmp', () => {
  const { tmp, artifactPath } = setupTmp();
  const baseline = path.join(tmp, '.planning', 'OBJECTIVES.md');
  const verdictOutPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  const fixtureVerdict = JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'agent-return-blocking.json'), 'utf-8'),
  );
  const verdict = gapDetect.runGapDetect(tmp, {
    artifact: artifactPath,
    baseline,
    verdictOutPath,
    llmPass: () => fixtureVerdict,
  });
  assert.equal(verdict.decision, 'GAPS-BLOCKING');
  assert.equal(verdict.findings_count, 1);
  assert.ok(fs.existsSync(verdictOutPath), 'verdict tmp file must exist');
  const onDisk = JSON.parse(fs.readFileSync(verdictOutPath, 'utf-8'));
  assert.equal(onDisk.decision, 'GAPS-BLOCKING');
});

test('runGapDetect: without llmPass emits GAPS-NONE fallback verdict (non-blocking default)', () => {
  const { tmp, artifactPath } = setupTmp();
  const baseline = path.join(tmp, '.planning', 'OBJECTIVES.md');
  const verdictOutPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  const verdict = gapDetect.runGapDetect(tmp, {
    artifact: artifactPath,
    baseline,
    verdictOutPath,
  });
  assert.equal(verdict.decision, 'GAPS-NONE');
  assert.equal(verdict.findings_count, 0);
  assert.equal(verdict.severity, 'nice-to-have');
});

test('runGapDetect: rejects missing artifact', () => {
  const { tmp } = setupTmp();
  const baseline = path.join(tmp, '.planning', 'OBJECTIVES.md');
  assert.throws(
    () => gapDetect.runGapDetect(tmp, {
      artifact: path.join(tmp, '.planning', 'does-not-exist.md'),
      baseline,
    }),
    /artifact not found/,
  );
});

test('runGapDetect: rejects missing baseline', () => {
  const { tmp, artifactPath } = setupTmp();
  assert.throws(
    () => gapDetect.runGapDetect(tmp, {
      artifact: artifactPath,
      baseline: path.join(tmp, '.planning', 'no-baseline.md'),
    }),
    /baseline not found/,
  );
});

test('commitGapDetectVerdict: writes paired-sibling .gaps.md and state.brief.last_gate_results.gap_detect (BLOCKING fixture)', () => {
  const { tmp, artifactPath } = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  const fixtureVerdict = JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'agent-return-blocking.json'), 'utf-8'),
  );
  fs.writeFileSync(verdictPath, JSON.stringify(fixtureVerdict));

  const result = gapDetect.commitGapDetectVerdict(tmp, {
    verdictPath,
    artifactPath,
    workstream: 'go-to-market',
    pausedPhase: '07',
    pushFrame: false,  // skip frame push for this assertion
  });

  assert.equal(result.stateUpdated, true);
  assert.ok(result.gapsPath, 'gapsPath must be returned');
  // Paired-sibling: .planning/workstreams/go-to-market/market-sizing.gaps.md
  const expectedSibling = path.join(
    tmp, '.planning', 'workstreams', 'go-to-market', 'market-sizing.gaps.md',
  );
  assert.ok(fs.existsSync(expectedSibling), `paired-sibling expected at ${expectedSibling}`);
  assert.equal(fs.realpathSync(result.gapsPath), fs.realpathSync(expectedSibling));

  // State has gap_detect last_gate_results
  const stateFm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  assert.ok(stateFm.brief);
  assert.ok(stateFm.brief.last_gate_results);
  const gd = stateFm.brief.last_gate_results.gap_detect;
  assert.ok(gd, 'state.brief.last_gate_results.gap_detect must be present');
  assert.equal(gd.decision, 'GAPS-BLOCKING');
  assert.equal(gd.severity, 'blocking');
  assert.equal(Number(gd.findings_count), 1);
  assert.ok(gd.at, 'at timestamp must be recorded');
});

test('commitGapDetectVerdict: with pushFrame=true on BLOCKING pushes 1 frame to return_stack + return_stack_history', () => {
  const { tmp, artifactPath } = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  const fixtureVerdict = JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'agent-return-blocking.json'), 'utf-8'),
  );
  fs.writeFileSync(verdictPath, JSON.stringify(fixtureVerdict));

  const result = gapDetect.commitGapDetectVerdict(tmp, {
    verdictPath,
    artifactPath,
    workstream: 'go-to-market',
    pausedPhase: '07',
    pushFrame: true,
  });
  assert.equal(result.framePushed, true);

  const stateFm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  assert.ok(Array.isArray(stateFm.brief.return_stack));
  assert.ok(Array.isArray(stateFm.brief.return_stack_history));
  assert.equal(stateFm.brief.return_stack.length, 1);
  assert.equal(stateFm.brief.return_stack_history.length, 1);

  const top = stateFm.brief.return_stack[0];
  // Compare via realpath because tmp dirs may resolve through /private/var on macOS.
  assert.equal(fs.realpathSync(top.paused_artifact), fs.realpathSync(artifactPath));
  assert.equal(top.paused_workstream, 'go-to-market');
  assert.equal(top.topic_fingerprint, 'market-sizing-korea-fintech-tam');
  assert.equal(top.paused_phase, '07');
  assert.ok(top.pushed_at, 'pushed_at must be set');
});

test('commitGapDetectVerdict: tmp verdict file unlinked in finally (BLOCKING path)', () => {
  const { tmp, artifactPath } = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  const fixtureVerdict = JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'agent-return-blocking.json'), 'utf-8'),
  );
  fs.writeFileSync(verdictPath, JSON.stringify(fixtureVerdict));

  gapDetect.commitGapDetectVerdict(tmp, {
    verdictPath,
    artifactPath,
    workstream: 'go-to-market',
  });
  assert.equal(fs.existsSync(verdictPath), false, 'verdict tmp file must be unlinked');
});

test('commitGapDetectVerdict: rejects missing artifactPath', () => {
  const { tmp } = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify({
    decision: 'GAPS-NONE', severity: 'nice-to-have', findings_count: 0,
    findings: [], rationale: 'n/a',
  }));
  assert.throws(
    () => gapDetect.commitGapDetectVerdict(tmp, { verdictPath }),
    /artifactPath/,
  );
});

test('commitGapDetectVerdict: override path with empty reason throws', () => {
  const { tmp, artifactPath } = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify({
    decision: 'GAPS-BLOCKING', severity: 'blocking', findings_count: 1,
    findings: [{
      severity: 'blocking', location: 'x.md:1', description: 'gap',
      topic_fingerprint: 'alpha-beta-gamma',
    }], rationale: 'block',
  }));
  assert.throws(
    () => gapDetect.commitGapDetectVerdict(tmp, {
      verdictPath, artifactPath, override: true, overrideReason: '',
    }),
    /overrideReason required/,
  );
});

test('commitGapDetectVerdict: override path records sanitized reason and flips decision to GAPS-NONE', () => {
  const { tmp, artifactPath } = setupTmp();
  const verdictPath = path.join(tmp, '.planning', '.gap-detect-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify({
    decision: 'GAPS-BLOCKING', severity: 'blocking', findings_count: 1,
    findings: [{
      severity: 'blocking', location: 'x.md:1', description: 'gap',
      topic_fingerprint: 'alpha-beta-gamma',
    }], rationale: 'block',
  }));

  gapDetect.commitGapDetectVerdict(tmp, {
    verdictPath,
    artifactPath,
    workstream: 'go-to-market',
    override: true,
    overrideReason: 'user-accepted-assumption-via-meta-arbiter-path',
    pushFrame: true,  // override should suppress push
  });

  const stateFm = extractFrontmatter(fs.readFileSync(path.join(tmp, '.planning', 'STATE.md'), 'utf-8'));
  const gd = stateFm.brief.last_gate_results.gap_detect;
  assert.equal(gd.decision, 'GAPS-NONE', 'override flips decision to GAPS-NONE');
  assert.ok(gd.override === true || gd.override === 'true', `override flag, got ${gd.override}`);
  assert.match(String(gd.override_reason), /user-accepted-assumption/);

  // Override suppresses push
  const stack = Array.isArray(stateFm.brief.return_stack) ? stateFm.brief.return_stack : [];
  assert.equal(stack.length, 0, 'override must suppress frame push');
});
