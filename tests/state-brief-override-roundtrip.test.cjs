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
