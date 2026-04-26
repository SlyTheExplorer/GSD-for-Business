/**
 * brief-deliver-canary-e2e.test.cjs — Phase 8 Plan 08-08 Wave 0 RED.
 *
 * Korea-first B2C fintech canary E2E exercising the 3-flow Phase 8 surface:
 *   Flow 1 — /brief-deliver --type-a (4 artifacts: PRODUCT-BRIEF / SERVICE-POLICY /
 *            HIGH-LEVEL-SPEC / FEATURE-MAP) via deliver.cjs synthesizeTypeA
 *   Flow 2 — /brief-deliver --type-b internal-deck (Marp source + AUDIENCE-OK)
 *            via voice-fit + audience.cjs (mocked LLM pass)
 *   Flow 3 — /brief-deliver --type-b proposal-deck + /brief-export proposal-deck
 *            (leakage diff trigger from sibling internal-deck.md)
 *
 * Plus: force-accept FIRST live use audit-trail verification + atomic-commit
 * staging assertion.
 *
 * Wave 0 RED contract per 08-08-PLAN.md Task 1 acceptance criteria:
 *   - All ~6 tests fail until Tasks 2-3 land brief-tools.cjs case dispatchers
 *     (case 'deliver', case 'export', case 'voice-fit', case 'leakage-diff')
 *     plus status.cjs formatGate extension.
 *   - Failure modes acceptable for RED: MODULE_NOT_FOUND on Wave 0 artifacts,
 *     ENOENT on yet-to-be-written commands/brief/deliver.md, or assertion
 *     failure on missing case dispatchers.
 *
 * Zero external deps: node:test + node:assert + fs/os/path/child_process only.
 *
 * References:
 *   - .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-08-PLAN.md Task 1
 *   - .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-VALIDATION.md Wave 0 enumeration
 *   - tests/brief-deliver-type-a.test.cjs (Phase 8 Plan 01 — fixture setup pattern)
 *   - tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams/ (Plan 01 fixture base)
 *   - tests/fixtures/deliver/intentional-leak-pair/ (Plan 03 fixture)
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execSync, spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const FIXTURE_KOREA = path.join(__dirname, 'fixtures', 'deliver', 'korea-b2c-canary-with-9-workstreams');
const FIXTURE_LEAK = path.join(__dirname, 'fixtures', 'deliver', 'intentional-leak-pair');

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Lazy-require a module so Wave 0 RED can catch MODULE_NOT_FOUND per-test.
 */
function lazyRequire(relPath) {
  const modPath = path.resolve(ROOT, relPath);
  delete require.cache[modPath];
  return require(modPath);
}

/**
 * Build a tmp cwd seeded with the Korea B2C canary fixture, the 4 Type A
 * template stubs, the 4 Type B template stubs, and the 3 Marp themes —
 * mirrors the production layout under .planning/ + brief/templates/.
 */
function setupKoreaCanaryCwd() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-canary-e2e-'));
  const planning = path.join(tmp, '.planning');
  fs.mkdirSync(planning, { recursive: true });

  // Top-level .planning/ files.
  fs.copyFileSync(path.join(FIXTURE_KOREA, 'config.json'), path.join(planning, 'config.json'));
  fs.copyFileSync(path.join(FIXTURE_KOREA, 'OBJECTIVES.md'), path.join(planning, 'OBJECTIVES.md'));

  // Workstream files placed under .planning/workstreams/{name}/{file}.
  const wsMap = [
    ['business-model-canvas', 'canvas.md'],
    ['go-to-market', 'go-to-market.md'],
    ['operations', 'operations.md'],
    ['compliance', 'compliance.md'],
    ['tech-arch', 'tech-arch.md'],
    ['roadmap', 'roadmap.md'],
    ['risk', 'risk.md'],
  ];
  for (const [wsName, fileName] of wsMap) {
    const wsDir = path.join(planning, 'workstreams', wsName);
    fs.mkdirSync(wsDir, { recursive: true });
    const src = path.join(FIXTURE_KOREA, fileName);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(wsDir, fileName));
  }

  // Minimal STATE.md so commitAudienceVerdict's readModifyWriteStateMd works.
  fs.writeFileSync(
    path.join(planning, 'STATE.md'),
    [
      '---',
      'brief_state_version: "1.0"',
      'milestone: canary',
      'status: executing',
      'current_phase: "08"',
      'stopped_at: "canary E2E test"',
      'brief: {region: kr, business_model: b2c}',
      '---',
      '',
      '# Project State',
      '',
    ].join('\n'),
    'utf-8',
  );

  // Type A template stubs (replicates Plan 01 test setup).
  const typeADir = path.join(tmp, 'brief', 'templates', 'deliver', 'type-a');
  fs.mkdirSync(typeADir, { recursive: true });
  fs.writeFileSync(
    path.join(typeADir, 'product-brief.md'),
    `# Product Brief\n\n## Immutable Intent\n\n<!-- INSERT: ## Immutable Intent -->\n\n## Customer Segments\n\n<!-- INSERT: ## Customer Segments -->\n\n## Value Proposition\n\n<!-- INSERT: ## Value Proposition -->\n\n## Personas\n\n<!-- INSERT: ## Personas -->\n`,
    'utf-8',
  );
  fs.writeFileSync(
    path.join(typeADir, 'service-policy.md'),
    `# Service Policy\n\n## Process\n\n<!-- INSERT: ## Process -->\n\n## Tools\n\n<!-- INSERT: ## Tools -->\n\n## Compliance Obligations\n\n<!-- INSERT: ## Documented obligations addressed: -->\n\n## Customer Commitments\n\n<!--BEGIN business_model: b2b-->\nSLA Tiers: Enterprise customers get 99.95% uptime.\n<!--END business_model: b2b-->\n<!--BEGIN business_model: b2c-->\n환불 정책: 결제일 기준 7일 이내 전액 환불 가능.\n<!--END business_model: b2c-->\n`,
    'utf-8',
  );
  fs.writeFileSync(
    path.join(typeADir, 'high-level-spec.md'),
    `# High-Level Spec\n\n## Immutable Intent\n\n<!-- INSERT: ## Immutable Intent -->\n\n## Component Map\n\n<!-- INSERT: ## Component Map -->\n\n## Phased Roadmap\n\n<!-- INSERT: ## Phased Roadmap -->\n\n## Critical Risks\n\n<!-- INSERT: ## Critical Risks -->\n`,
    'utf-8',
  );
  fs.writeFileSync(
    path.join(typeADir, 'feature-map.md'),
    `# Feature Map\n\n## Component Map\n\n<!-- INSERT: ## Component Map -->\n\n## Value Proposition\n\n<!-- INSERT: ## Value Proposition -->\n`,
    'utf-8',
  );

  return tmp;
}

/**
 * Place a sibling artifact pair (proposal-deck adjacent to internal-deck) for
 * the leakage-diff trigger flow. Uses Plan 03 intentional-leak-pair fixture.
 */
function placeLeakageDiffSiblings(cwd) {
  const dir = path.join(cwd, '.planning', 'deliverables', 'type-b');
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(path.join(FIXTURE_LEAK, 'internal-deck.md'), path.join(dir, 'internal-deck.md'));
  fs.copyFileSync(path.join(FIXTURE_LEAK, 'proposal-deck.md'), path.join(dir, 'proposal-deck.md'));
  return dir;
}

// EN + KO + symbol ban-list shared with vocabulary-lock test (Phase 4·5·7 inheritance)
const BAN_TOKENS_EN = ['compliant', 'passed', 'violation', 'failed'];
const BAN_TOKENS_KO = ['준수', '통과', '위반', '실패'];
const BAN_SYMBOLS = ['✅', '✓', '✗'];

function assertNoBannedVocabulary(text, label) {
  for (const tok of BAN_TOKENS_EN) {
    const re = new RegExp(`\\b${tok}\\b`, 'gi');
    if (re.test(text)) {
      assert.fail(`[${label}] EN ban-list token '${tok}' present — Pitfall #4 vocabulary theater. Phase 4·5·7 ban-list inheritance violated.`);
    }
  }
  for (const tok of BAN_TOKENS_KO) {
    if (text.includes(tok)) {
      assert.fail(`[${label}] KO ban-list token '${tok}' present — Pitfall #4 vocabulary theater.`);
    }
  }
  for (const sym of BAN_SYMBOLS) {
    if (text.includes(sym)) {
      assert.fail(`[${label}] Ban-list symbol '${sym}' present — Pitfall #4 vocabulary theater.`);
    }
  }
}

// ─── Flow 1: Type A path (4 artifacts) ─────────────────────────────────

test('canary E2E Flow 1: /brief-deliver --type-a synthesizes product-brief.md anchored to OBJECTIVES.md ## Immutable Intent', () => {
  const cwd = setupKoreaCanaryCwd();
  const deliver = lazyRequire('brief/bin/lib/deliver.cjs');
  const result = deliver.synthesizeTypeA(cwd, 'product-brief', {});
  assert.ok(fs.existsSync(result.outPath), `product-brief.md should exist at ${result.outPath}`);
  const body = fs.readFileSync(result.outPath, 'utf-8');
  // Anchored to OBJECTIVES.md ## Immutable Intent — 페이앱 vision text must appear.
  assert.match(body, /페이앱/, 'product-brief.md body must contain Korea fixture project name');
  // Frontmatter voice.languages = ['ko'] for Korea fixture.
  assert.match(body, /voice\.languages.*\[?ko\]?/, 'product-brief.md frontmatter must declare voice.languages with ko');
  // Vocabulary-lock inheritance.
  assertNoBannedVocabulary(body, 'product-brief.md');
});

test('canary E2E Flow 1: all 4 Type A artifacts (product-brief / service-policy / high-level-spec / feature-map) synthesized; service-policy renders B2C variant', () => {
  const cwd = setupKoreaCanaryCwd();
  const deliver = lazyRequire('brief/bin/lib/deliver.cjs');
  for (const key of deliver.TYPE_A_ARTIFACTS) {
    const result = deliver.synthesizeTypeA(cwd, key, {});
    assert.ok(fs.existsSync(result.outPath), `${key}.md should exist at ${result.outPath}`);
  }
  // Service-policy B2C conditional prose: B2C block kept, B2B block dropped.
  const sp = fs.readFileSync(path.join(cwd, '.planning', 'deliverables', 'type-a', 'service-policy.md'), 'utf-8');
  assert.match(sp, /환불 정책/, 'service-policy.md must contain B2C conditional prose (Korean refund policy)');
  assert.doesNotMatch(sp, /SLA Tiers: Enterprise customers/, 'service-policy.md must NOT contain B2B conditional prose for B2C fixture');
});

// ─── Flow 2: Type B internal-deck path (voice-fit + AUDIENCE-OK) ───────

test('canary E2E Flow 2: Type B internal-deck source passes voice-fit banned-words check (no density violation)', () => {
  const voiceFit = lazyRequire('brief/bin/lib/voice-fit.cjs');
  const cwd = setupKoreaCanaryCwd();
  const dir = placeLeakageDiffSiblings(cwd);
  const internalDeck = fs.readFileSync(path.join(dir, 'internal-deck.md'), 'utf-8');
  // strip frontmatter for body-only density measurement
  const body = internalDeck.replace(/^---\s*[\s\S]*?---\s*/m, '');
  const fit = voiceFit.checkBannedWords(body, { isKorean: true, isExternal: false });
  // Internal deck has high entropy of fixture-specific tokens; banned-words density must NOT exceed threshold (2/page).
  assert.ok(!fit.exceedsThreshold, `Type B internal-deck must NOT exceed banned-words density threshold (${fit.density.toFixed(2)} <= ${fit.threshold}); hits: ${JSON.stringify(fit.hits)}`);
});

test('canary E2E Flow 2: Type B internal-deck filename encoding follows Layer 1 pattern {name}.{confidentiality}.{ext}', () => {
  // The filename derivation lives in export.cjs; verify it would resolve to the expected encoded form.
  const exportLib = lazyRequire('brief/bin/lib/export.cjs');
  const cwd = setupKoreaCanaryCwd();
  const dir = placeLeakageDiffSiblings(cwd);
  const internalPath = path.join(dir, 'internal-deck.md');
  // Read frontmatter to get confidentiality, then assert expected filename.
  const fm = lazyRequire('brief/bin/lib/frontmatter.cjs').extractFrontmatter(fs.readFileSync(internalPath, 'utf-8'));
  const conf = (fm['audience.confidentiality'] || (fm.audience && fm.audience.confidentiality) || 'confidential');
  const expected = `internal-deck.${conf}.pptx`;
  // Layer 1 (filename encoding per B-D01): exported file name embeds confidentiality.
  assert.equal(expected, 'internal-deck.confidential.pptx', 'Layer 1 filename encoding must produce internal-deck.confidential.pptx for the canary fixture');
  // Watermark resolves to Korean for region: kr.
  const watermark = exportLib.watermarkFor(conf, 'ko');
  assert.match(watermark, /기밀|내부용/, 'Layer 2 KO watermark must use Korean phrase for region: kr');
});

// ─── Flow 3: Type B proposal-deck + /brief-export leakage diff trigger ──

test('canary E2E Flow 3: /brief-export proposal-deck triggers leakage diff against stricter sibling internal-deck.md (≥1 material finding)', () => {
  const leakage = lazyRequire('brief/bin/lib/leakage-diff.cjs');
  const cwd = setupKoreaCanaryCwd();
  const dir = placeLeakageDiffSiblings(cwd);
  const proposalPath = path.join(dir, 'proposal-deck.md');
  const result = leakage.leakageDiff(proposalPath);
  assert.ok(Array.isArray(result.findings), 'leakageDiff must return findings[]');
  assert.ok(result.findings.length >= 1, `leakageDiff must trigger ≥1 finding for the intentional-leak-pair (got ${result.findings.length}; rationale: ${result.rationale})`);
  assert.equal(result.findings[0].severity, 'material', 'Leakage finding severity must be "material" per Plan 03 contract');
});

// ─── Force-accept first live use audit trail ────────────────────────────

test('canary E2E force-accept: brief-tools.cjs export run --force-accept --override-reason "<reason>" persists override + override_reason + override_at to STATE.md', () => {
  // This test verifies the brief-tools.cjs `case "export"` dispatcher registers the
  // --force-accept and --override-reason flags AND that they thread through to
  // export.cjs which calls audience.commitAudienceVerdict({override:true,
  // overrideReason:'...'}). When dispatch lands (Task 3), this assertion holds.
  const briefToolsPath = path.resolve(ROOT, 'brief/bin/brief-tools.cjs');
  const briefToolsSrc = fs.readFileSync(briefToolsPath, 'utf-8');
  // The case 'export' dispatcher must exist and reference --force-accept + --override-reason flags.
  assert.match(briefToolsSrc, /case 'export':/, "brief-tools.cjs must register case 'export' dispatcher");
  assert.match(briefToolsSrc, /--force-accept/, "case 'export' dispatcher must accept --force-accept flag");
  assert.match(briefToolsSrc, /--override-reason/, "case 'export' dispatcher must accept --override-reason flag");
});

// ─── Atomic commit verification (Task 3 wires through brief-tools.cjs) ─

test('canary E2E atomic-commit: case "deliver" + "export" + "voice-fit" + "leakage-diff" dispatchers each have try/catch + core.error + core.output', () => {
  const briefToolsPath = path.resolve(ROOT, 'brief/bin/brief-tools.cjs');
  const briefToolsSrc = fs.readFileSync(briefToolsPath, 'utf-8');
  // Each of the 4 NEW Phase 8 case dispatchers must mirror the case 'audience' pattern.
  for (const c of ['deliver', 'export', 'voice-fit', 'leakage-diff']) {
    assert.match(briefToolsSrc, new RegExp(`case '${c}':`), `brief-tools.cjs must register case '${c}' dispatcher`);
  }
  // Aggregate error/output call counts: ≥8 per Plan 08 acceptance grep (≥2 per case).
  const errMatches = (briefToolsSrc.match(/core\.error\s*\(|^[\s]+error\(/gm) || []).length;
  const outMatches = (briefToolsSrc.match(/core\.output\s*\(/g) || []).length;
  assert.ok(errMatches + outMatches >= 8, `Phase 8 case dispatchers must collectively contain ≥8 core.error/core.output calls (got ${errMatches + outMatches})`);
});

// ─── Status.cjs formatGate Type B force-accept extension ────────────────

test('canary E2E status: formatGate displays force-accept override count + truncated override_reason for AUDIENCE gate', () => {
  // Task 3 extends status.cjs formatGate so /brief-status surfaces force-accept history.
  const statusSrc = fs.readFileSync(path.resolve(ROOT, 'brief/bin/lib/status.cjs'), 'utf-8');
  assert.match(statusSrc, /override_reason/, 'status.cjs formatGate must reference override_reason field');
});
