/**
 * brief-align-primitives.test.cjs — Phase 4 Plan 04-01 primitives coverage.
 *
 * Exercises the 5 exported primitives of brief/bin/lib/align.cjs:
 *   - validateVerdict            (inline zero-dep schema validator)
 *   - grepBanList                (D-05 ban-list scanner — KO + EN + symbols)
 *   - computeTermOverlap         (candidate ↔ baseline keyword overlap)
 *   - detectKoreaSignalFromConfig (D-11 language rule)
 *   - runDeterministicScreen     (D-03 step a/b/c — short-circuits + additives)
 *   - writeVerdict               (Write-to-file verdict transport)
 *
 * Zero-dep: uses only node:test, node:assert, node:fs, node:os, node:path.
 * Per-test tmp cwd via mkdtempSync to isolate OBJECTIVES.md/config.json fixtures.
 *
 * References:
 *   - .planning/phases/04-first-gate-align-pattern-established/04-01-PLAN.md Task 2 behaviors
 *   - .planning/phases/04-first-gate-align-pattern-established/04-CONTEXT.md D-03, D-05, D-11
 *   - .planning/phases/04-first-gate-align-pattern-established/04-RESEARCH.md §Code Examples
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const align = require('../brief/bin/lib/align.cjs');

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeTmpCwd() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-align-prim-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  return tmp;
}

function writeObjectives(cwd, frontmatterYaml, body) {
  const content = `---\n${frontmatterYaml}\n---\n\n${body}`;
  fs.writeFileSync(path.join(cwd, '.planning', 'OBJECTIVES.md'), content);
}

function writeConfig(cwd, json) {
  fs.writeFileSync(path.join(cwd, '.planning', 'config.json'), JSON.stringify(json, null, 2));
}

// Minimal valid OBJECTIVES.md frontmatter (Phase 3 D-11 compliance — empty
// compliance_packs IS valid). Body kept small but keyword-rich for overlap tests.
const BASELINE_FM = [
  'brief_objectives_version: "1.0"',
  'status: ready',
  'business_model: b2c',
  'region: kr',
  'audience_policy: internal',
  'compliance_packs: []',
  'immutable_items: [creator-identity, core-value, problem-statement]',
].join('\n');

const BASELINE_BODY = [
  '# OBJECTIVES',
  '',
  '## Immutable Intent',
  '',
  '### Creator Identity',
  'founder focused on strategy planning framework',
  '',
  '### Core Value',
  'transform fuzzy business idea into research-grounded deliverables',
  '',
  '### Problem Statement',
  'business planners lack structured discover-define-design workflow',
  '',
].join('\n');

// ─── validateVerdict ───────────────────────────────────────────────────────

describe('validateVerdict', () => {
  test('rejects empty object', () => {
    const err = align.validateVerdict({});
    assert.ok(typeof err === 'string' && err.length > 0, 'should return string error');
  });

  test('rejects bad decision', () => {
    const err = align.validateVerdict({
      decision: 'BOGUS',
      severity: 'material',
      findings_count: 0,
      findings: [],
      rationale: '',
    });
    assert.ok(typeof err === 'string' && err.includes('decision'));
  });

  test('accepts minimal ALIGNED verdict', () => {
    const err = align.validateVerdict({
      decision: 'ALIGNED',
      severity: 'nice-to-have',
      findings_count: 0,
      findings: [],
      rationale: 'ok',
    });
    assert.strictEqual(err, null);
  });

  test('accepts all 3 decisions', () => {
    for (const decision of ['ALIGNED', 'DRIFTED-objective-needs-update', 'DRIFTED-output-needs-revision']) {
      const err = align.validateVerdict({
        decision,
        severity: 'material',
        findings_count: 0,
        findings: [],
        rationale: 'r',
      });
      assert.strictEqual(err, null, `decision=${decision} should validate`);
    }
  });

  test('enforces all 3 severities at top-level + per-finding', () => {
    // Top-level bad severity
    const err1 = align.validateVerdict({
      decision: 'ALIGNED',
      severity: 'critical',
      findings_count: 0,
      findings: [],
      rationale: 'r',
    });
    assert.ok(typeof err1 === 'string' && err1.includes('severity'));

    // Top-level blocking OK
    const err2 = align.validateVerdict({
      decision: 'DRIFTED-objective-needs-update',
      severity: 'blocking',
      findings_count: 0,
      findings: [],
      rationale: 'r',
    });
    assert.strictEqual(err2, null);

    // Per-finding bad severity
    const err3 = align.validateVerdict({
      decision: 'ALIGNED',
      severity: 'material',
      findings_count: 1,
      findings: [{ severity: 'bogus', location: 'x', description: 'y' }],
      rationale: 'r',
    });
    assert.ok(typeof err3 === 'string' && err3.includes('findings[0]'));
  });

  test('rejects malformed findings_count', () => {
    const err = align.validateVerdict({
      decision: 'ALIGNED',
      severity: 'material',
      findings_count: '0',
      findings: [],
      rationale: 'r',
    });
    assert.ok(typeof err === 'string' && err.includes('findings_count'));
  });

  test('rejects missing rationale', () => {
    const err = align.validateVerdict({
      decision: 'ALIGNED',
      severity: 'material',
      findings_count: 0,
      findings: [],
    });
    assert.ok(typeof err === 'string' && err.includes('rationale'));
  });
});

// ─── grepBanList ───────────────────────────────────────────────────────────

describe('grepBanList', () => {
  test('hits EN token (compliant)', () => {
    const tmp = makeTmpCwd();
    const p = path.join(tmp, 'candidate.md');
    fs.writeFileSync(p, 'This component is compliant.\n');
    const hits = align.grepBanList(p);
    assert.ok(hits.length >= 1);
    assert.ok(hits.some((h) => h.token.toLowerCase() === 'compliant'), 'should catch compliant');
  });

  test('hits KO tokens (준수 + 통과)', () => {
    const tmp = makeTmpCwd();
    const p = path.join(tmp, 'candidate.md');
    fs.writeFileSync(p, '준수 검토 통과\n');
    const hits = align.grepBanList(p);
    const tokens = hits.map((h) => h.token);
    assert.ok(tokens.includes('준수'), 'should catch 준수');
    assert.ok(tokens.includes('통과'), 'should catch 통과');
  });

  test('hits symbol tokens (✅)', () => {
    const tmp = makeTmpCwd();
    const p = path.join(tmp, 'candidate.md');
    fs.writeFileSync(p, '검토 완료 ✅\n');
    const hits = align.grepBanList(p);
    assert.ok(hits.some((h) => h.token === '✅'), 'should catch ✅');
  });

  test('location format is <basename>:<1-based-line-number>', () => {
    const tmp = makeTmpCwd();
    const p = path.join(tmp, 'artifact.md');
    fs.writeFileSync(p, 'line1\ncompliant on line 2\nline3\n');
    const hits = align.grepBanList(p);
    assert.ok(hits.length >= 1);
    const hit = hits.find((h) => h.token.toLowerCase() === 'compliant');
    assert.strictEqual(hit.location, 'artifact.md:2');
  });

  test('returns empty array on clean content', () => {
    const tmp = makeTmpCwd();
    const p = path.join(tmp, 'clean.md');
    fs.writeFileSync(p, 'Documented obligations addressed.\n문서화된 의도 중 반영된 것.\n');
    const hits = align.grepBanList(p);
    assert.deepStrictEqual(hits, []);
  });
});

// ─── detectKoreaSignalFromConfig ───────────────────────────────────────────

describe('detectKoreaSignalFromConfig', () => {
  test('reads brief.region=kr from config.json', () => {
    const tmp = makeTmpCwd();
    writeConfig(tmp, { brief: { region: 'kr' } });
    assert.strictEqual(align.detectKoreaSignalFromConfig(tmp), true);
  });

  test('returns false when brief.region=us', () => {
    const tmp = makeTmpCwd();
    writeConfig(tmp, { brief: { region: 'us' } });
    assert.strictEqual(align.detectKoreaSignalFromConfig(tmp), false);
  });

  test('falls back to OBJECTIVES.md body Korean detection when config missing', () => {
    const tmp = makeTmpCwd();
    // No config.json written; OBJECTIVES.md has Korean content in body.
    writeObjectives(tmp, BASELINE_FM, '# 목표\n\n한국어 intent body로 시작합니다.\n');
    assert.strictEqual(align.detectKoreaSignalFromConfig(tmp), true);
  });

  test('returns false when neither config nor OBJECTIVES.md has Korea signal', () => {
    const tmp = makeTmpCwd();
    writeObjectives(
      tmp,
      BASELINE_FM.replace('region: kr', 'region: us'),
      '# OBJECTIVES\n\nEnglish-only content here.\n',
    );
    assert.strictEqual(align.detectKoreaSignalFromConfig(tmp), false);
  });
});

// ─── runDeterministicScreen ────────────────────────────────────────────────

describe('runDeterministicScreen', () => {
  test('short-circuits DRIFTED-objective on required-field gap', () => {
    const tmp = makeTmpCwd();
    // OBJECTIVES.md missing region field.
    const incompleteFm = [
      'brief_objectives_version: "1.0"',
      'status: ready',
      'business_model: b2c',
      'audience_policy: internal',
      'compliance_packs: []',
      'immutable_items: []',
    ].join('\n');
    writeObjectives(tmp, incompleteFm, BASELINE_BODY);

    const candPath = path.join(tmp, 'candidate.md');
    fs.writeFileSync(candPath, 'irrelevant content');

    const objectivesPath = path.join(tmp, '.planning', 'OBJECTIVES.md');
    const result = align.runDeterministicScreen(tmp, {
      candidate: candPath,
      baseline: objectivesPath,
    });

    assert.ok(result.verdict, 'should short-circuit with a verdict');
    assert.strictEqual(result.verdict.decision, 'DRIFTED-objective-needs-update');
    assert.strictEqual(result.verdict.severity, 'blocking');
    assert.ok(result.findings.some((f) => f.severity === 'blocking'));
  });

  test('short-circuits DRIFTED-output on zero overlap', () => {
    const tmp = makeTmpCwd();
    writeObjectives(tmp, BASELINE_FM, BASELINE_BODY);
    const candPath = path.join(tmp, 'candidate.md');
    // Zero-overlap content: uses totally unrelated words.
    fs.writeFileSync(candPath, 'zzzqxx 12345 quoxflix rummaging jibblywick\n');

    const objectivesPath = path.join(tmp, '.planning', 'OBJECTIVES.md');
    const result = align.runDeterministicScreen(tmp, {
      candidate: candPath,
      baseline: objectivesPath,
    });

    assert.ok(result.verdict, 'should short-circuit with a verdict');
    assert.strictEqual(result.verdict.decision, 'DRIFTED-output-needs-revision');
    assert.strictEqual(result.verdict.severity, 'material');
  });

  test('does NOT short-circuit on ban-list-only hits (additive findings)', () => {
    const tmp = makeTmpCwd();
    writeObjectives(tmp, BASELINE_FM, BASELINE_BODY);
    const candPath = path.join(tmp, 'candidate.md');
    // Has overlap with baseline (planners, strategy, framework) AND contains
    // a ban-list token. Expected: verdict=null, findings contains ban-list hit.
    fs.writeFileSync(
      candPath,
      'business planners want a strategy planning framework that is compliant.\n',
    );

    const objectivesPath = path.join(tmp, '.planning', 'OBJECTIVES.md');
    const result = align.runDeterministicScreen(tmp, {
      candidate: candPath,
      baseline: objectivesPath,
    });

    assert.strictEqual(result.verdict, null, 'ban-list-only must NOT short-circuit');
    assert.ok(result.findings.length >= 1, 'expected at least one additive finding');
    assert.ok(
      result.findings.some((f) => f.severity === 'material' && f.description.includes('compliant')),
      'should include the compliant ban-list hit as a material finding',
    );
  });
});

// ─── writeVerdict ──────────────────────────────────────────────────────────

describe('writeVerdict', () => {
  test('writes valid verdict as JSON-parseable file', () => {
    const tmp = makeTmpCwd();
    const p = path.join(tmp, 'verdict.json');
    const verdict = {
      decision: 'ALIGNED',
      severity: 'nice-to-have',
      findings_count: 0,
      findings: [],
      rationale: 'ok',
    };
    align.writeVerdict(p, verdict);
    assert.ok(fs.existsSync(p));
    const parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
    assert.deepStrictEqual(parsed, verdict);
  });

  test('throws on invalid verdict with ALIGN verdict invalid message', () => {
    const tmp = makeTmpCwd();
    const p = path.join(tmp, 'verdict.json');
    assert.throws(
      () => align.writeVerdict(p, { decision: 'BOGUS' }),
      /ALIGN verdict invalid/,
    );
  });
});
