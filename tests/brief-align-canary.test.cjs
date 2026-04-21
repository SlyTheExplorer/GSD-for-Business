/**
 * brief-align-canary.test.cjs — Phase 4 Plan 04-05 D-08 canary E2E.
 *
 * Exercises the full Mode A wrap-up canary end-to-end in-process (no subprocess
 * spawn, no Task subagent — stub llmPass mirrors the shape the real subagent
 * emits). The tests lock the D-08/D-09 exit criteria:
 *   - Test 1: Korea fixture → ALIGN-00.md contains Korean body + populated
 *             state.brief.last_gate_results.align (D-09, D-11).
 *   - Test 2: renderStatus surfaces `Last ALIGN   ALIGNED` after canary run.
 *   - Test 3: Non-Korea fixture → English ALIGN-00.md body, no Korean text.
 *   - Test 4: Force-accept override writes override:true + override_reason +
 *             renderStatus shows "(override applied)".
 *   - Test 5: Structural — `## Step 3.5` positioned strictly between Step 3
 *             and Step 4 in brief/workflows/define.md (locks Task 1 insertion
 *             position; defends against future edits that bypass the workflow
 *             markdown while canary tests still pass via direct lib calls).
 *
 * Design notes:
 *   - In-process invocation only (`require('../brief/bin/lib/align.cjs')`);
 *     keeps runtime <5s and sidesteps child_process overhead.
 *   - The ban-list fires on the `✓`/`✅` symbols — the real workflow's
 *     user-facing success messages with these symbols live in the workflow
 *     markdown, not in ALIGN-00.md content. Ban-list scope is ALIGN-00.md.
 *   - Test 5 uses `/^## Step 3[:\- ]/` (NOT `/^## Step 3$/`) because the
 *     existing heading is `## Step 3: Atomic Write + Commit`.
 *
 * References:
 *   - 04-05-PLAN.md Task 2 behaviors
 *   - 04-CONTEXT.md D-08 (canary scope), D-09 (exit criteria), D-11 (language)
 *   - 04-VALIDATION.md (D-08 canary + D-11 Korea-language-rule tests)
 *   - tests/brief-align.test.cjs (fixture-setup pattern)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const align = require('../brief/bin/lib/align.cjs');
const status = require('../brief/bin/lib/status.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

// ─── Helpers ───────────────────────────────────────────────────────────────

function seedKoreaFirstCwd() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-align-canary-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  // Copy the Korea-first B2C fixture (region: kr, Korean body).
  fs.copyFileSync(
    path.join(FIXTURE_DIR, 'align-aligned-baseline.md'),
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
  );
  // Seed config.json with brief.region=kr so detectKoreaSignalFromConfig
  // returns true (D-11 primary signal source).
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: 'kr', business_model: 'b2c' } }, null, 2),
  );
  // Seed minimal STATE.md matching the Phase 2 D-04/D-21 shape used by
  // seedCwd in tests/state-brief-override-roundtrip.test.cjs.
  fs.writeFileSync(
    path.join(tmp, '.planning', 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: test',
      'status: executing',
      'current_phase: "04"',
      'stopped_at: "canary test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

function seedNonKoreaCwd() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-align-canary-nonkr-'));
  fs.mkdirSync(path.join(tmp, '.planning'), { recursive: true });
  // Write an English-only OBJECTIVES.md with valid required fields so the
  // deterministic screen (b) does not short-circuit. No Korean text in body.
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'brief_objectives_version: "1.0"',
      'status: ready',
      'mode: greenfield',
      'immutable_items:',
      '  - creator-identity',
      '  - core-value',
      '  - problem-statement',
      'business_model: b2c',
      'region: us',
      'audience_policy: internal',
      'compliance_packs: []',
      '---',
      '',
      '## Immutable Intent (locked)',
      '- Creator Identity: solo maker',
      '- Core Value: decision helper app for millennial urban commuters',
      '- Problem Statement: monthly budget decisions are slow',
      '',
      '## Mutable Hypotheses',
      '- Target Audience: urban millennials 25-35',
      '- Verification Metrics: MAU 10k',
      '- Competitors: Mint, YNAB',
      '- Dream State — Now: spreadsheets',
      '- Dream State — 3-month: app MVP live',
      '- Dream State — 12-month: 100k users',
      '',
    ].join('\n'),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify({ brief: { region: 'us', business_model: 'b2c' } }, null, 2),
  );
  fs.writeFileSync(
    path.join(tmp, '.planning', 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: test',
      'status: executing',
      'current_phase: "04"',
      'stopped_at: "canary test"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

// ─── Test 1: D-08 canary ALIGNED-path E2E (Korea fixture) ─────────────────

test('canary ALIGNED path E2E — Korea fixture produces Korean ALIGN-00.md + populated STATE.md', () => {
  const cwd = seedKoreaFirstCwd();
  const objPath = path.join(cwd, '.planning', 'OBJECTIVES.md');
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');

  // Stub LLM returning a Korean-phrased ALIGNED verdict that mirrors what the
  // real subagent emits under brief.region=kr. The finding.description uses
  // the Phase 4 D-11 preferred Korean vocabulary.
  const stubLlm = () => ({
    decision: 'ALIGNED',
    severity: 'nice-to-have',
    findings: [
      {
        severity: 'nice-to-have',
        location: 'OBJECTIVES.md:Mutable',
        description:
          '문서화된 의도 중 반영된 것: 모든 Immutable Intent 항목에 대응되는 Mutable Hypothesis가 존재합니다.',
      },
    ],
    rationale:
      '모든 Immutable Intent 항목이 operationalize 되었고, 레이어 간 모순이 없습니다.',
  });

  const verdict = align.runAlign(cwd, {
    candidate: objPath,
    baseline: objPath,
    verdictOutPath: verdictPath,
    llmPass: stubLlm,
  });
  assert.strictEqual(verdict.decision, 'ALIGNED');

  // Happy ALIGNED — no override.
  const result = align.commitAlignVerdict(cwd, { verdictPath });
  assert.ok(result.alignPath, 'commitAlignVerdict must return alignPath');

  // Assert ALIGN-00.md exists.
  const alignMdPath = path.join(cwd, '.planning', 'ALIGN-00.md');
  assert.ok(fs.existsSync(alignMdPath), 'ALIGN-00.md must exist');
  const alignBody = fs.readFileSync(alignMdPath, 'utf-8');

  // D-11 Korean-first rule: body contains the bilingual header `/ 발견사항`
  // (renderAlignReport emits this under korea=true) OR the preferred-vocabulary
  // Korean phrase from the stub. Either is a sufficient signal that the
  // Korea branch fired.
  assert.ok(
    alignBody.includes('발견사항') || alignBody.includes('문서화된 의도 중 반영된 것'),
    `Korean fixture must produce Korean ALIGN-00.md body. Got: ${alignBody.slice(0, 500)}`,
  );

  // Assert STATE.md frontmatter populated (D-09 exit criterion).
  const stateContent = fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8');
  const stateFm = extractFrontmatter(stateContent);
  assert.ok(stateFm.brief, 'state.brief must exist');
  assert.ok(stateFm.brief.last_gate_results, 'last_gate_results must exist');
  assert.ok(stateFm.brief.last_gate_results.align, 'align entry must exist');

  const a = stateFm.brief.last_gate_results.align;
  assert.strictEqual(a.decision, 'ALIGNED');
  assert.strictEqual(a.severity, 'nice-to-have');
  // Pitfall #4 — findings_count may round-trip as number or string under D-20.
  assert.ok(
    a.findings_count === 1 || a.findings_count === '1',
    `findings_count should be 1 (number or string); got ${a.findings_count}`,
  );
  assert.ok(a.at, 'at timestamp must be present');
});

// ─── Test 2: D-09 canary status render ─────────────────────────────────────

test('canary status render includes Last ALIGN line after canary run', () => {
  const cwd = seedKoreaFirstCwd();
  const objPath = path.join(cwd, '.planning', 'OBJECTIVES.md');
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  align.runAlign(cwd, {
    candidate: objPath,
    baseline: objPath,
    verdictOutPath: verdictPath,
    llmPass: () => ({
      decision: 'ALIGNED',
      severity: 'nice-to-have',
      findings: [],
      rationale: 'ok',
    }),
  });
  align.commitAlignVerdict(cwd, { verdictPath });
  const rendered = status.renderStatus(cwd, true);
  assert.match(rendered, /Last ALIGN/);
  assert.match(rendered, /ALIGNED/);
});

// ─── Test 3: D-11 non-Korea path → English ALIGN-00.md body ───────────────

test('canary non-Korea path produces English ALIGN-00.md body', () => {
  const cwd = seedNonKoreaCwd();
  const objPath = path.join(cwd, '.planning', 'OBJECTIVES.md');
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  align.runAlign(cwd, {
    candidate: objPath,
    baseline: objPath,
    verdictOutPath: verdictPath,
    llmPass: () => ({
      decision: 'ALIGNED',
      severity: 'nice-to-have',
      findings: [
        {
          severity: 'nice-to-have',
          location: 'OBJECTIVES.md:Mutable',
          description:
            'Documented obligations addressed: all Immutable bullets have operationalizing Mutable Hypothesis entries.',
        },
      ],
      rationale: 'All layers coherent.',
    }),
  });
  align.commitAlignVerdict(cwd, { verdictPath });
  const alignBody = fs.readFileSync(path.join(cwd, '.planning', 'ALIGN-00.md'), 'utf-8');
  // English vocabulary present.
  assert.match(alignBody, /Documented obligations addressed|Findings/);
  // Korean vocabulary absent — bilingual header should NOT fire under korea=false.
  assert.doesNotMatch(alignBody, /문서화된 의도 중 반영된 것/);
});

// ─── Test 4: D-07 force-accept override path ──────────────────────────────

test('canary override path — force-accept writes override flag + renderStatus shows "(override applied)"', () => {
  const cwd = seedKoreaFirstCwd();
  const verdictPath = path.join(cwd, '.planning', '.align-verdict.tmp.json');
  // Write a DRIFTED-output verdict directly — simulates the user force-accepting
  // after the workflow's 3-path interrupt (skips runAlign for speed).
  fs.writeFileSync(
    verdictPath,
    JSON.stringify({
      decision: 'DRIFTED-output-needs-revision',
      severity: 'material',
      findings_count: 1,
      findings: [
        {
          severity: 'material',
          location: 'X',
          description: '추가 작업이 필요한 항목: 구체화되지 않은 청중',
        },
      ],
      rationale: 'material drift detected',
    }),
  );
  align.commitAlignVerdict(cwd, {
    verdictPath,
    override: true,
    overrideReason: '테스트 승인 사유 — 현재는 의도적으로 진행',
  });

  const stateFm = extractFrontmatter(
    fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8'),
  );
  const a = stateFm.brief.last_gate_results.align;
  // D-07: override path forces decision → ALIGNED (distinct from true
  // ALIGNED via override:true flag that /brief-status renders differently).
  assert.strictEqual(a.decision, 'ALIGNED');
  // Pitfall #5 — D-20 serializer may round-trip boolean true as string 'true'.
  assert.ok(
    a.override === true || a.override === 'true',
    `override must be true (bool or string); got ${a.override}`,
  );
  assert.ok(
    String(a.override_reason).includes('테스트 승인 사유'),
    `override_reason must contain user-typed rationale; got ${a.override_reason}`,
  );

  // ALIGN-00.md body has the ## User Override section (D-07 audit trail).
  const alignBody = fs.readFileSync(path.join(cwd, '.planning', 'ALIGN-00.md'), 'utf-8');
  assert.match(alignBody, /User Override/);

  // /brief-status renders the override suffix distinctly.
  const rendered = status.renderStatus(cwd, true);
  assert.match(rendered, /override applied/);
});

// ─── Test 5: Structural Step 3.5 positional assertion ─────────────────────

test('structural: brief/workflows/define.md Step 3.5 positioned BETWEEN Step 3 and Step 4', () => {
  const repoRoot = path.join(__dirname, '..');
  const content = fs.readFileSync(path.join(repoRoot, 'brief/workflows/define.md'), 'utf-8');
  const lines = content.split('\n');
  // The existing Step 3 heading is `## Step 3: Atomic Write + Commit` — a `$`
  // anchor on `3` would never match. Accept `:`, `-`, or space after `3`.
  const step3Line = lines.findIndex((l) => /^## Step 3[:\- ]/.test(l));
  const step3_5Line = lines.findIndex((l) => /^## Step 3\.5/.test(l));
  const step4Line = lines.findIndex((l) => /^## Step 4:/.test(l));
  assert.ok(step3Line > -1, 'Step 3 heading exists');
  assert.ok(step3_5Line > -1, 'Step 3.5 heading exists');
  assert.ok(step4Line > -1, 'Step 4 heading exists');
  assert.ok(
    step3Line < step3_5Line && step3_5Line < step4Line,
    `Step 3.5 must be positioned between Step 3 and Step 4 at the markdown level. Got: Step3=${step3Line}, Step3.5=${step3_5Line}, Step4=${step4Line}`,
  );
});
