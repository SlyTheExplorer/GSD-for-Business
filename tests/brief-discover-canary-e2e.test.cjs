/**
 * brief-discover-canary-e2e.test.cjs — Plan 05-08 Task 1.
 *
 * Canary E2E test exercising the full Phase 5 DISCOVER flow end-to-end in one
 * pass, using in-process library calls (no live LLM, no Task subagent — the
 * researcher output is stub-injected from the Plan 02 fixtures).
 *
 * 6 tests lock the 05-CONTEXT D-01..D-16 decisions:
 *   Step 1: buildBusinessContext returns KR/B2B/fintech ctx with PIPA+ISMS-P
 *           required_reading (Plan 01 two-consumer parity + D-14 STABLE API).
 *   Step 2: researcher-output stub + runAudience returns AUDIENCE-OK
 *           (D-09 deterministic screen on well-formed researcher artifact).
 *   Step 3: commitAudienceVerdict writes paired-sibling .audience.md +
 *           state.brief.last_gate_results.audience (D-10, D-11 Plan 05-05).
 *   Step 4: Vocabulary-lock on AUDIENCE sibling output (no ban-list tokens —
 *           Plan 04 vocabulary-lock Phase 5 replication).
 *   Step 5: 2-category sequential flow — state last-writer-wins (Phase 5
 *           orchestration body wave-by-wave per 05-07 Step 6).
 *   Step 6: Phase 5 file manifest — all 12 required files exist on disk.
 *
 * Design notes:
 *   - In-process invocation keeps runtime <30s (no child_process overhead).
 *   - Runtime 4-wide wall-clock parallelism verification is deferred to
 *     Phase 9 HRD-01 cross-runtime smoke (CONTEXT §Claude's Discretion).
 *   - commitAudienceVerdict requires artifactPath to resolve inside
 *     .planning/ (T-5-05-01 Plan 05-05 _resolveSafePath tightening). All
 *     test artifacts are placed under {tmp}/.planning/discover/.
 *   - findings_count on the state-roundtrip test may round-trip as number OR
 *     string (Pitfall #4 — D-20 YAML serializer drift); assertions tolerate
 *     both shapes, consistent with tests/brief-align-canary.test.cjs.
 *
 * References:
 *   - 05-08-PLAN.md Task 1
 *   - 05-CONTEXT.md D-01..D-16
 *   - 05-VALIDATION.md test-id 5-08-01 (Canary E2E)
 *   - tests/brief-align-canary.test.cjs (Phase 4 canary shape template)
 *   - tests/brief-audience-ok.test.cjs (Plan 05-04 setup pattern)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const audience = require('../brief/bin/lib/audience.cjs');
const { buildBusinessContext } = require('../brief/bin/lib/context-inject.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');

const ROOT = path.join(__dirname, '..');
const DISCOVER_FIXTURES = path.join(__dirname, 'fixtures', 'discover');

function setupCanaryTmp() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-canary-e2e-'));
  // .planning/ skeleton with discover/ subdir for researcher outputs.
  fs.mkdirSync(path.join(tmp, '.planning', 'discover'), { recursive: true });
  // config.json — KR/B2B/fintech with PIPA + ISMS-P compliance packs.
  fs.writeFileSync(
    path.join(tmp, '.planning', 'config.json'),
    JSON.stringify(
      {
        brief: {
          business_model: 'b2b',
          region: 'kr',
          audience_policy: {
            default: 'internal',
            permitted: ['internal', 'partner', 'external'],
          },
          compliance_packs: ['PIPA', 'ISMS-P'],
        },
        hooks: { community: false },
      },
      null,
      2,
    ),
  );
  // OBJECTIVES.md — minimal valid Korean fintech skeleton.
  fs.writeFileSync(
    path.join(tmp, '.planning', 'OBJECTIVES.md'),
    [
      '---',
      'business_model: b2b',
      'region: kr',
      'audience_policy:',
      '  default: internal',
      '  permitted: [internal, partner, external]',
      'compliance_packs: [PIPA, ISMS-P]',
      'status: ready',
      'immutable_items: [creator-identity, core-value, problem-statement]',
      'last_amended: "2026-04-22T00:00:00.000Z"',
      'created_at: "2026-04-22T00:00:00.000Z"',
      '---',
      '',
      '# OBJECTIVES',
      '',
      '## Immutable Intent',
      '저는 핀테크 스타트업 대표이사입니다.',
      '',
      '## Mutable Hypotheses',
      '중견 금융기관 타겟.',
      '',
    ].join('\n'),
  );
  // STATE.md — initialized brief.* namespace (Phase 2 D-03 shape).
  fs.writeFileSync(
    path.join(tmp, '.planning', 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: test',
      'status: executing',
      'current_phase: "05"',
      'stopped_at: "canary e2e"',
      'brief: {}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
  );
  return tmp;
}

// ─── Step 1: buildBusinessContext parity with Plan 01 STABLE API ─────────

test('Canary E2E Step 1: buildBusinessContext returns KR/B2B/fintech ctx with PIPA+ISMS-P required_reading', () => {
  const cwd = setupCanaryTmp();
  const ctx = buildBusinessContext({ cwd });

  assert.equal(ctx.business_model, 'b2b');
  assert.equal(ctx.region, 'kr');
  assert.equal(ctx.language, 'ko');
  assert.deepEqual(ctx.compliance_packs, ['PIPA', 'ISMS-P']);

  // requiredReading points at Plan 06 Korea compliance primer paths.
  assert.ok(
    ctx.requiredReading.some((f) => f.includes('pipa-2026.md')),
    `pipa-2026.md missing from requiredReading: ${ctx.requiredReading.join(', ')}`,
  );
  assert.ok(
    ctx.requiredReading.some((f) => f.includes('isms-p.md')),
    `isms-p.md missing from requiredReading: ${ctx.requiredReading.join(', ')}`,
  );

  // promptBlock contains the closed-set values (D-13 inline XML format).
  assert.match(ctx.promptBlock, /<business_model>b2b<\/business_model>/);
  assert.match(ctx.promptBlock, /<region>kr<\/region>/);
  assert.match(ctx.promptBlock, /<language>ko<\/language>/);
});

// ─── Step 2: runAudience on researcher-output stub → AUDIENCE-OK ─────────

test('Canary E2E Step 2: researcher-output stub injected + runAudience returns AUDIENCE-OK', () => {
  const cwd = setupCanaryTmp();
  // Inject Plan 02 fixture as "researcher output" at the canonical slug path.
  const artifactPath = path.join(cwd, '.planning', 'discover', 'market-sizing.md');
  fs.copyFileSync(
    path.join(DISCOVER_FIXTURES, 'researcher-sample-b2b-market-sizing.md'),
    artifactPath,
  );

  const verdict = audience.runAudience(cwd, {
    artifact: artifactPath,
    baseline: path.join(cwd, '.planning', 'OBJECTIVES.md'),
    verdictOutPath: path.join(cwd, '.planning', '.audience-verdict.tmp.json'),
  });

  assert.equal(verdict.decision, 'AUDIENCE-OK');
  assert.ok(
    ['nice-to-have', 'material'].includes(verdict.severity),
    `unexpected severity: ${verdict.severity}`,
  );
});

// ─── Step 3: commitAudienceVerdict paired-sibling + STATE.md ─────────────

test('Canary E2E Step 3: commitAudienceVerdict writes paired-sibling .audience.md + STATE.md', () => {
  const cwd = setupCanaryTmp();
  const artifactPath = path.join(cwd, '.planning', 'discover', 'market-sizing.md');
  fs.copyFileSync(
    path.join(DISCOVER_FIXTURES, 'researcher-sample-b2b-market-sizing.md'),
    artifactPath,
  );

  const verdictOutPath = path.join(cwd, '.planning', '.audience-verdict.tmp.json');
  audience.runAudience(cwd, {
    artifact: artifactPath,
    baseline: path.join(cwd, '.planning', 'OBJECTIVES.md'),
    verdictOutPath,
  });
  audience.commitAudienceVerdict(cwd, {
    verdictPath: verdictOutPath,
    artifactPath,
  });

  // D-11 paired-sibling: {artifact-dir}/{artifact-basename}.audience.md.
  const siblingPath = path.join(
    cwd,
    '.planning',
    'discover',
    'market-sizing.audience.md',
  );
  assert.ok(
    fs.existsSync(siblingPath),
    `paired-sibling missing: ${siblingPath}`,
  );

  // D-10 state round-trip: last_gate_results.audience populated.
  const stateContent = fs.readFileSync(
    path.join(cwd, '.planning', 'STATE.md'),
    'utf-8',
  );
  const fm = extractFrontmatter(stateContent);
  assert.ok(fm.brief, 'state.brief must exist');
  assert.ok(
    fm.brief.last_gate_results,
    'state.brief.last_gate_results must exist',
  );
  const a = fm.brief.last_gate_results.audience;
  assert.ok(a, 'state.brief.last_gate_results.audience must exist');
  assert.ok(
    ['AUDIENCE-OK', 'DRIFTED-frontmatter', 'DRIFTED-content'].includes(
      a.decision,
    ),
    `unexpected decision: ${a.decision}`,
  );
  assert.ok(a.at, 'state.brief.last_gate_results.audience.at must exist');
});

// ─── Step 4: Vocabulary-lock on AUDIENCE sibling output ──────────────────

test('Canary E2E Step 4: Vocabulary-lock on AUDIENCE sibling output (no ban-list tokens)', () => {
  const cwd = setupCanaryTmp();
  const artifactPath = path.join(cwd, '.planning', 'discover', 'market-sizing.md');
  fs.copyFileSync(
    path.join(DISCOVER_FIXTURES, 'researcher-sample-b2b-market-sizing.md'),
    artifactPath,
  );

  const verdictOutPath = path.join(cwd, '.planning', '.audience-verdict.tmp.json');
  audience.runAudience(cwd, {
    artifact: artifactPath,
    baseline: path.join(cwd, '.planning', 'OBJECTIVES.md'),
    verdictOutPath,
  });
  audience.commitAudienceVerdict(cwd, {
    verdictPath: verdictOutPath,
    artifactPath,
  });

  const siblingContent = fs.readFileSync(
    path.join(cwd, '.planning', 'discover', 'market-sizing.audience.md'),
    'utf-8',
  );
  const banned = [
    /\bcompliant\b/i,
    /\bpassed\b/i,
    /\bviolation\b/i,
    /\bfailed\b/i,
    /준수/,
    /통과/,
    /위반/,
    /실패/,
    /✅/,
    /✓/,
    /✗/,
  ];
  for (const re of banned) {
    assert.doesNotMatch(
      siblingContent,
      re,
      `AUDIENCE sibling contains ban-list token: ${re}`,
    );
  }
});

// ─── Step 5: 2-category sequential flow — last-writer-wins ───────────────

test('Canary E2E Step 5: 2-category sequential flow — state.brief.last_gate_results.audience last-writer-wins', () => {
  const cwd = setupCanaryTmp();

  // 1st category (B2B market sizing).
  const art1 = path.join(cwd, '.planning', 'discover', 'market-sizing.md');
  fs.copyFileSync(
    path.join(DISCOVER_FIXTURES, 'researcher-sample-b2b-market-sizing.md'),
    art1,
  );
  const verdictOut1 = path.join(
    cwd,
    '.planning',
    '.audience-verdict-1.tmp.json',
  );
  audience.runAudience(cwd, {
    artifact: art1,
    baseline: path.join(cwd, '.planning', 'OBJECTIVES.md'),
    verdictOutPath: verdictOut1,
  });
  audience.commitAudienceVerdict(cwd, {
    verdictPath: verdictOut1,
    artifactPath: art1,
  });
  const firstAt = extractFrontmatter(
    fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8'),
  ).brief.last_gate_results.audience.at;

  // Brief busy-wait so the second ISO-timestamp differs from the first.
  const end = Date.now() + 50;
  while (Date.now() < end) {
    /* noop */
  }

  // 2nd category (B2C market sizing stub injected at a different slug).
  const art2 = path.join(cwd, '.planning', 'discover', 'competitor-landscape.md');
  fs.copyFileSync(
    path.join(DISCOVER_FIXTURES, 'researcher-sample-b2c-market-sizing.md'),
    art2,
  );
  const verdictOut2 = path.join(
    cwd,
    '.planning',
    '.audience-verdict-2.tmp.json',
  );
  audience.runAudience(cwd, {
    artifact: art2,
    baseline: path.join(cwd, '.planning', 'OBJECTIVES.md'),
    verdictOutPath: verdictOut2,
  });
  audience.commitAudienceVerdict(cwd, {
    verdictPath: verdictOut2,
    artifactPath: art2,
  });
  const secondAt = extractFrontmatter(
    fs.readFileSync(path.join(cwd, '.planning', 'STATE.md'), 'utf-8'),
  ).brief.last_gate_results.audience.at;

  // Last-writer-wins: secondAt >= firstAt (ISO-8601 string compare is
  // chronological for same-format strings).
  assert.ok(
    secondAt >= firstAt,
    `last-writer-wins violated: firstAt=${firstAt} secondAt=${secondAt}`,
  );

  // Both siblings exist on disk (Phase 5 Step 7 atomic commit promise).
  assert.ok(
    fs.existsSync(
      path.join(cwd, '.planning', 'discover', 'market-sizing.audience.md'),
    ),
    'market-sizing.audience.md missing',
  );
  assert.ok(
    fs.existsSync(
      path.join(
        cwd,
        '.planning',
        'discover',
        'competitor-landscape.audience.md',
      ),
    ),
    'competitor-landscape.audience.md missing',
  );
});

// ─── Step 6: Phase 5 file manifest ───────────────────────────────────────

test('Canary E2E Step 6: Phase 5 file manifest — all created files exist', () => {
  const REQUIRED = [
    // Plan 01 — context-inject primitive.
    'brief/bin/lib/context-inject.cjs',
    // Plan 04 — AUDIENCE gate primitives + vocabulary + agent + workflow.
    'brief/bin/lib/audience.cjs',
    'brief/bin/lib/audience-report.cjs',
    'brief/references/audience-vocabulary.md',
    'agents/brief-audience-guard.md',
    'brief/workflows/audience-guard.md',
    // Plan 06 — Korea compliance primers.
    'brief/references/compliance/korea/pipa-2026.md',
    'brief/references/compliance/korea/isms-p.md',
    'brief/references/compliance/korea/mydata-2026.md',
    // Plan 02 — parameterized brief-domain-researcher agent.
    'agents/brief-domain-researcher.md',
    // Plan 07 — DISCOVER workflow body.
    'brief/workflows/discover.md',
    // Plan 03 — provenance pre-commit hook.
    'hooks/brief-validate-provenance.sh',
  ];
  for (const rel of REQUIRED) {
    const full = path.join(ROOT, rel);
    assert.ok(
      fs.existsSync(full),
      `Phase 5 required file missing: ${rel}`,
    );
  }
});
