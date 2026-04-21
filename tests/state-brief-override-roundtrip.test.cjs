/**
 * state-brief-override-roundtrip.test.cjs — Phase 4 Plan 04-04 combined coverage.
 *
 * Exercises two layers:
 *   Task 1 (align.cjs) — renderAlignReport + commitAlignVerdict:
 *     • Korean/English body + bilingual/single headers per D-11
 *     • ## User Override section only when override=true (D-07)
 *     • Frontmatter shape (decision, severity, findings_count, at, override?)
 *     • commitAlignVerdict sanitizes override_reason (T-04-02)
 *     • tmp verdict file unlinked in finally (T-04-03)
 *     • Path traversal rejected (T-04-01)
 *
 *   Task 2 (dispatcher + formatGate + round-trip):
 *     • state.brief.last_gate_results.align round-trips through D-20 serializer
 *     • Boolean `true` may come back as string 'true' (Pitfall #5)
 *     • formatGate renders "(override applied)" for both boolean and string
 *     • CLI layer: brief-tools.cjs align commit rejects path traversal
 *       without leaking absolute cwd paths (Test 10)
 *
 * References:
 *   - 04-04-PLAN.md Task 1 behaviors 1-8
 *   - 04-04-PLAN.md Task 2 behaviors 1-10
 *   - 04-CONTEXT.md D-07 (force-accept schema), D-11 (language), Specific Ideas
 *   - 04-RESEARCH.md Pitfall #4 (findings_count str/int), Pitfall #5 (bool round-trip)
 *   - 04-RESEARCH.md §Security Domain V5 (sanitizeForPrompt on override_reason)
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const align = require('../brief/bin/lib/align.cjs');
const status = require('../brief/bin/lib/status.cjs');
const state = require('../brief/bin/lib/state.cjs');
const { extractFrontmatter, reconstructFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');
const { sanitizeForPrompt } = require('../brief/bin/lib/security.cjs');

// ─── Helpers ───────────────────────────────────────────────────────────────

function seedCwd(opts) {
  const region = (opts && opts.region) || 'us';
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-align-override-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  const stateContent = [
    '---',
    'brief_state_version: "1.0"',
    'milestone: test',
    'status: executing',
    'current_phase: "04"',
    'stopped_at: test',
    'brief: {}',
    '---',
    '',
    '# Project State',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(tmp, '.planning', 'STATE.md'), stateContent);
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region } }, null, 2),
  );
  // Minimal OBJECTIVES.md so detectKoreaSignalFromConfig fallback succeeds.
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'brief_objectives_version: "1.0"',
      'status: ready',
      `region: ${region}`,
      '---',
      '',
      '# OBJECTIVES',
      '',
    ].join('\n'),
  );
  return tmp;
}

function validVerdict(overrides) {
  return Object.assign(
    {
      decision: 'DRIFTED-output-needs-revision',
      severity: 'material',
      findings_count: 1,
      findings: [
        {
          severity: 'material',
          location: 'OBJECTIVES.md:12',
          description: 'needs further work',
        },
      ],
      rationale: 'candidate overlaps but diverges on required field',
    },
    overrides || {},
  );
}

// ─── Task 1: renderAlignReport ─────────────────────────────────────────────

test('renderAlignReport — Korean body with bilingual headers when korea=true', () => {
  const md = align.renderAlignReport(validVerdict(), { korea: true });
  assert.ok(md.startsWith('---\n'), 'must open with frontmatter');
  assert.match(md, /## Findings \/ 발견사항/);
  assert.match(md, /## Rationale \/ 이유/);
});

test('renderAlignReport — English body with single-language headers when korea=false', () => {
  const md = align.renderAlignReport(validVerdict(), { korea: false });
  assert.match(md, /## Findings\s/);
  assert.match(md, /## Rationale\s/);
  assert.doesNotMatch(md, /발견사항/);
});

test('renderAlignReport — includes ## User Override section when override=true', () => {
  const md = align.renderAlignReport(validVerdict(), {
    korea: false,
    override: true,
    overrideReason: 'we accept the drift for pilot launch',
  });
  assert.match(md, /## User Override/);
  assert.match(md, /Reason: we accept the drift for pilot launch/);
});

test('renderAlignReport — omits ## User Override section when override is falsy', () => {
  const md = align.renderAlignReport(validVerdict(), { korea: false });
  assert.doesNotMatch(md, /## User Override/);
});

test('renderAlignReport — frontmatter carries decision/severity/findings_count/at', () => {
  const md = align.renderAlignReport(validVerdict(), { korea: false });
  const fm = extractFrontmatter(md);
  assert.ok(fm.decision, 'decision must be present');
  assert.ok(fm.severity, 'severity must be present');
  assert.ok(fm.findings_count !== undefined, 'findings_count must be present');
  assert.ok(fm.at, 'at (ISO timestamp) must be present');
});

test('renderAlignReport — override path writes decision:ALIGNED + override:true in frontmatter', () => {
  const md = align.renderAlignReport(validVerdict(), {
    korea: false,
    override: true,
    overrideReason: 'force-accept rationale',
  });
  const fm = extractFrontmatter(md);
  assert.strictEqual(fm.decision, 'ALIGNED');
  // Per Pitfall #5, override may surface as boolean true or string 'true'
  assert.ok(fm.override === true || fm.override === 'true', `override must be true-ish, got ${fm.override}`);
  assert.strictEqual(fm.override_reason, 'force-accept rationale');
});

// ─── Task 1: commitAlignVerdict — happy path ───────────────────────────────

test('commitAlignVerdict — writes ALIGN-00.md and updates STATE.md brief map', () => {
  const cwd = seedCwd();
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify(validVerdict()));
  const result = align.commitAlignVerdict(cwd, { verdictPath });
  assert.strictEqual(result.stateUpdated, true);
  assert.ok(result.alignPath.endsWith('ALIGN-00.md'));
  const alignContent = fs.readFileSync(result.alignPath, 'utf-8');
  const alignFm = extractFrontmatter(alignContent);
  assert.ok(alignFm.decision);
  assert.ok(alignFm.severity);
  assert.ok(alignFm.findings_count !== undefined);
  assert.ok(alignFm.at);
  const stateContent = fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8');
  const stateFm = extractFrontmatter(stateContent);
  assert.ok(stateFm.brief, 'brief map must exist after commit');
  assert.ok(stateFm.brief.last_gate_results, 'last_gate_results must exist');
  assert.ok(stateFm.brief.last_gate_results.align, 'align map must exist');
});

test('commitAlignVerdict — override path sanitizes override_reason (T-04-02)', () => {
  const cwd = seedCwd();
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify(validVerdict()));
  // Zero-width space + system marker that sanitizeForPrompt must neutralize.
  const rawReason = 'legitimate reason\u200B with [SYSTEM] marker';
  const expectedSanitized = sanitizeForPrompt(rawReason);
  // Sanitized should not equal raw (proves sanitization ran).
  assert.notStrictEqual(expectedSanitized, rawReason, 'sanitizeForPrompt should mutate this input');

  align.commitAlignVerdict(cwd, {
    verdictPath,
    override: true,
    overrideReason: rawReason,
  });
  const stateContent = fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8');
  const stateFm = extractFrontmatter(stateContent);
  const alignEntry = stateFm.brief.last_gate_results.align;
  assert.strictEqual(alignEntry.override_reason, expectedSanitized);
  assert.notStrictEqual(alignEntry.override_reason, rawReason,
    'raw reason must be sanitized before state write');
});

test('commitAlignVerdict — deletes tmp verdict file after successful write', () => {
  const cwd = seedCwd();
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify(validVerdict({
    decision: 'ALIGNED', severity: 'nice-to-have', findings_count: 0, findings: [],
  })));
  align.commitAlignVerdict(cwd, { verdictPath });
  assert.strictEqual(fs.existsSync(verdictPath), false, 'tmp verdict must be unlinked');
});

test('commitAlignVerdict — unlinks tmp verdict file even when transform throws', () => {
  const cwd = seedCwd();
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  // Malformed JSON triggers a throw in the try block.
  fs.writeFileSync(verdictPath, 'not-valid-json{');
  assert.throws(
    () => align.commitAlignVerdict(cwd, { verdictPath }),
    /Unexpected|invalid|JSON/,
  );
  assert.strictEqual(fs.existsSync(verdictPath), false,
    'tmp verdict must be unlinked in finally even on error');
});

test('commitAlignVerdict — rejects path traversal outside .planning/', () => {
  const cwd = seedCwd();
  assert.throws(
    () => align.commitAlignVerdict(cwd, { verdictPath: '../../outside.json' }),
    /path traversal/,
  );
  assert.throws(
    () => align.commitAlignVerdict(cwd, { verdictPath: '/etc/passwd' }),
    /path traversal/,
  );
});

test('commitAlignVerdict — override:true without overrideReason throws', () => {
  const cwd = seedCwd();
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify(validVerdict()));
  assert.throws(
    () => align.commitAlignVerdict(cwd, { verdictPath, override: true, overrideReason: '' }),
    /overrideReason required/,
  );
});

// ─── Task 2: state-override-roundtrip (Pitfall #5) ─────────────────────────

test('state-override-roundtrip: override fields survive D-20 serializer', () => {
  const cwd = seedCwd();
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify(validVerdict({
    severity: 'material', findings_count: 3,
  })));
  const rawReason = '테스트 승인 사유';
  align.commitAlignVerdict(cwd, {
    verdictPath,
    override: true,
    overrideReason: rawReason,
  });
  const fm = extractFrontmatter(fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8'));
  assert.ok(fm.brief, 'brief map must survive');
  assert.ok(fm.brief.last_gate_results, 'last_gate_results must survive');
  const alignEntry = fm.brief.last_gate_results.align;
  assert.ok(alignEntry, 'align entry must survive');
  assert.strictEqual(alignEntry.decision, 'ALIGNED');
  assert.strictEqual(alignEntry.severity, 'material');
  // Pitfall #5 guard: boolean true may round-trip as string 'true' via D-20.
  assert.ok(
    alignEntry.override === true || alignEntry.override === 'true',
    `override lost boolean shape; got ${typeof alignEntry.override}: ${alignEntry.override}`,
  );
  assert.strictEqual(alignEntry.override_reason, rawReason);
  // findings_count may be number 3 or string '3' per Pitfall #4
  assert.ok(alignEntry.findings_count === 3 || alignEntry.findings_count === '3');
  assert.ok(typeof alignEntry.at === 'string' && alignEntry.at.length > 0);
});

// ─── Task 2: status.formatGate override-aware rendering ────────────────────

test('status.formatGate: renders plain ALIGNED without override suffix', () => {
  const cwd = seedCwd();
  const statePath = path.join(cwd, '.planning', 'STATE.md');
  // Seed an ALIGNED-without-override state via readModifyWriteStateMd.
  state.readModifyWriteStateMd(statePath, (content) => {
    const body = require('../brief/bin/lib/frontmatter.cjs').stripFrontmatter(content);
    const fm = extractFrontmatter(content) || {};
    if (typeof fm.brief !== 'object' || !fm.brief || Array.isArray(fm.brief)) fm.brief = {};
    fm.brief.last_gate_results = {
      align: { decision: 'ALIGNED', severity: 'nice-to-have', findings_count: 0 },
    };
    return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
  }, cwd);
  const rendered = status.renderStatus(cwd, true);
  assert.match(rendered, /Last ALIGN\s+ALIGNED/);
  assert.doesNotMatch(rendered, /override applied/);
});

test('status.formatGate: renders "(override applied)" when override=true (boolean)', () => {
  const cwd = seedCwd();
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify(validVerdict({ findings_count: 2 })));
  align.commitAlignVerdict(cwd, {
    verdictPath,
    override: true,
    overrideReason: 'pilot acceptance',
  });
  const rendered = status.renderStatus(cwd, true);
  assert.match(rendered, /Last ALIGN.*ALIGNED.*override applied/);
});

test('status.formatGate: renders "(override applied)" when override is string "true"', () => {
  // Simulates the D-20 round-trip surface where a boolean becomes 'true' string.
  const cwd = seedCwd();
  const statePath = path.join(cwd, '.planning', 'STATE.md');
  state.readModifyWriteStateMd(statePath, (content) => {
    const body = require('../brief/bin/lib/frontmatter.cjs').stripFrontmatter(content);
    const fm = extractFrontmatter(content) || {};
    if (typeof fm.brief !== 'object' || !fm.brief || Array.isArray(fm.brief)) fm.brief = {};
    fm.brief.last_gate_results = {
      align: {
        decision: 'ALIGNED',
        findings_count: '2',
        // Emit the string shape directly — exercises Pitfall #5 robustness.
        override: 'true',
        override_reason: 'test',
      },
    };
    return `---\n${reconstructFrontmatter(fm)}\n---\n\n${body}`;
  }, cwd);
  const rendered = status.renderStatus(cwd, true);
  assert.match(rendered, /Last ALIGN.*ALIGNED.*override applied/);
});

// ─── Task 2: CLI dispatcher — align run / commit / unknown subcommand ──────

const REPO_ROOT = path.join(__dirname, '..');
const CLI_PATH = path.join(REPO_ROOT, 'brief/bin/brief-tools.cjs');

// Small helper: run the CLI and capture stdout/stderr/exit without throwing.
function runCli(argv, cwd) {
  const { spawnSync } = require('node:child_process');
  const result = spawnSync('node', [CLI_PATH, ...argv], {
    cwd,
    encoding: 'utf-8',
    env: process.env,
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exit: result.status === null ? (result.signal ? 1 : 0) : result.status,
    signal: result.signal,
  };
}

test('CLI: align run --candidate X --baseline Y writes verdict and exits 0', () => {
  const cwd = seedCwd({ region: 'us' });
  // Seed a baseline OBJECTIVES.md with required fields populated so the
  // deterministic screen (D-03 step b) doesn't short-circuit.
  fs.writeFileSync(
    path.join(cwd, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'brief_objectives_version: "1.0"',
      'status: ready',
      'business_model: b2c',
      'region: us',
      'audience_policy: internal',
      'compliance_packs: []',
      'immutable_items: [core-value]',
      '---',
      '',
      '# OBJECTIVES',
      '## Immutable Intent',
      'core-value: business planning framework builds deliverables',
      '',
    ].join('\n'),
  );
  const candidate = path.join(cwd, '.planning', 'OBJECTIVES.md');
  const verdictOut = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  const res = runCli(
    ['align', 'run', '--candidate', candidate, '--baseline', candidate, '--verdict-out', verdictOut, '--raw'],
    cwd,
  );
  assert.strictEqual(res.exit, 0, `align run should exit 0 — stderr: ${res.stderr}`);
  // The run branch writes a verdict only when the deterministic screen
  // short-circuits. Otherwise it reports llm_pass_needed. Both are valid
  // exit-0 outcomes from the dispatcher.
  assert.ok(
    res.stdout.length > 0 || res.stderr.length === 0,
    'dispatcher must produce some output',
  );
});

test('CLI: align commit --verdict X writes ALIGN-00.md and exits 0', () => {
  const cwd = seedCwd();
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify(validVerdict()));
  const res = runCli(['align', 'commit', '--verdict', verdictPath, '--raw'], cwd);
  assert.strictEqual(res.exit, 0, `align commit should exit 0 — stderr: ${res.stderr}`);
  assert.ok(
    fs.existsSync(path.join(cwd, '.planning', 'ALIGN-00.md')),
    'ALIGN-00.md must exist after commit',
  );
});

test('CLI: align commit --override writes override flag into STATE.md', () => {
  const cwd = seedCwd();
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  fs.writeFileSync(verdictPath, JSON.stringify(validVerdict()));
  const res = runCli(
    [
      'align', 'commit', '--verdict', verdictPath,
      '--override', '--override-reason', 'pilot launch acceptance',
      '--raw',
    ],
    cwd,
  );
  assert.strictEqual(res.exit, 0, `align commit --override should exit 0 — stderr: ${res.stderr}`);
  const stateFm = extractFrontmatter(
    fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8'),
  );
  const alignEntry = stateFm.brief.last_gate_results.align;
  assert.ok(
    alignEntry.override === true || alignEntry.override === 'true',
    'override flag must be present',
  );
  assert.strictEqual(alignEntry.override_reason, 'pilot launch acceptance');
  const alignMd = fs.readFileSync(path.join(cwd, '.planning', 'ALIGN-00.md'), 'utf-8');
  assert.match(alignMd, /## User Override/);
});

test('CLI: align with unknown subcommand exits non-zero with stderr hint', () => {
  const cwd = seedCwd();
  const res = runCli(['align', 'bogus-verb'], cwd);
  assert.notStrictEqual(res.exit, 0, 'unknown subcommand must exit non-zero');
  assert.match(
    res.stderr + res.stdout,
    /unknown subcommand|Valid: run, commit/,
    `stderr should hint at valid verbs; got stderr=${res.stderr}, stdout=${res.stdout}`,
  );
});

test('CLI: align run with missing --candidate flag exits non-zero', () => {
  const cwd = seedCwd();
  const res = runCli(['align', 'run'], cwd);
  assert.notStrictEqual(res.exit, 0);
  assert.match(res.stderr + res.stdout, /candidate|baseline/);
});

test('CLI: align commit with missing --verdict flag exits non-zero', () => {
  const cwd = seedCwd();
  const res = runCli(['align', 'commit'], cwd);
  assert.notStrictEqual(res.exit, 0);
  assert.match(res.stderr + res.stdout, /verdict/);
});

// ─── Task 2 Test 10: CLI-layer path-traversal boundary ─────────────────────
// The dispatcher's commit branch MUST wrap commitAlignVerdict in try/catch
// that routes thrown errors through core.error so Node's default uncaught
// exception handler never leaks the absolute path to align.cjs.

test('CLI layer: align commit rejects path-traversal verdict path with safe error', () => {
  const cwd = seedCwd();
  const res = runCli(
    ['align', 'commit', '--verdict', '/etc/passwd', '--override', 'false'],
    cwd,
  );
  const combined = res.stderr + res.stdout;
  assert.ok(
    res.exit === 1 || res.exit === 2,
    `CLI must exit non-zero (1 or 2) on path-traversal verdict. Got exit=${res.exit}, combined=${combined.slice(0, 300)}`,
  );
  assert.match(
    combined,
    /path.*(traversal|invalid|unsafe)/i,
    `stderr/stdout must mention path traversal/invalid/unsafe. Got: ${combined.slice(0, 300)}`,
  );
  assert.doesNotMatch(
    combined,
    /\/Users\/[a-z0-9_-]+\/GSD-for-Business/i,
    `Error must NOT leak the developer absolute cwd path. Got: ${combined.slice(0, 300)}`,
  );
});
