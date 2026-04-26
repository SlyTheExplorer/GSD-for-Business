/**
 * brief-deliver-type-a.test.cjs — Phase 8 Plan 08-01 Wave 0 RED tests.
 *
 * Exercises the (Wave 0 NOT YET IMPLEMENTED) lib brief/bin/lib/deliver.cjs.
 *
 *   - synthesizeTypeA(cwd, artifactKey, options) — Type A 자동 합성
 *   - SYNTHESIS_MAP — 4 artifact keys × {sources, objectivesSections, template, conditionalProse}
 *   - checkDependencies(cwd, artifactKey)
 *   - extractMarkdownSection(body, heading)
 *   - applyConditionalProse(body, businessModel) — Phase 7 D-14 byte-identity
 *
 * 7 tests covering DLV-01..04 (PRODUCT-BRIEF / SERVICE-POLICY / HIGH-LEVEL-SPEC / FEATURE-MAP):
 *   1. product-brief: writes file containing OBJECTIVES ## Immutable Intent body +
 *      canvas ## Customer Segments body + go-to-market ## Personas body, with the
 *      5 mandatory frontmatter fields + voice.languages = ['ko'] (Korea fixture).
 *   2. service-policy (B2C): contains B2C conditional prose, NOT B2B prose.
 *      service-policy (B2B): contains B2B prose, NOT B2C prose.
 *   3. high-level-spec: contains tech-arch ## Component Map + roadmap ## Phased
 *      Roadmap + risk ## Critical Risks bodies.
 *   4. feature-map: contains either Mermaid mindmap block OR ASCII tree, references
 *      tech-arch components.
 *   5. checkDependencies missing source: returns {complete:false, missing:[...]};
 *      synthesizeTypeA emits "> ⚠️ Placeholder — ... workstream not completed."
 *      and writes a stderr warning.
 *   6. extractMarkdownSection: heading found returns body; missing heading returns
 *      `<!-- {heading} not found in source -->`.
 *   7. applyConditionalProse: B2B/B2C marker pair returns only the matching block.
 *
 * Wave 0 RED contract: deliver.cjs does not exist yet. Each test catches the
 * MODULE_NOT_FOUND and asserts it. Task 2 (GREEN) implements deliver.cjs which
 * makes the require() succeed and the substantive assertions take over.
 *
 * Zero-dep: node:test + node:assert + node:fs + node:os + node:path only.
 * Per-test tmp cwd via mkdtempSync to isolate fixtures (mirrors Phase 5
 * tests/brief-context-inject-roundtrip.test.cjs pattern).
 *
 * References:
 *   - .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-01-PLAN.md Tasks 1-2 behaviors
 *   - .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-RESEARCH.md Code Example 1 (lines 1156-1297)
 *   - .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-VALIDATION.md Wave 0 enumeration line 53
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const FIXTURE_ROOT = path.join(
  __dirname,
  'fixtures',
  'deliver',
  'korea-b2c-canary-with-9-workstreams'
);

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Lazy-require deliver.cjs so failures (MODULE_NOT_FOUND in Wave 0 RED)
 * are caught per-test instead of at top-level require time.
 * Returns the module, or throws — caller decides what to do with the throw.
 */
function loadDeliver() {
  // Use an absolute path so jest-style path resolution is irrelevant.
  // delete from require cache to ensure each test sees a fresh module
  // (matters once Task 2 lands and we want test isolation).
  const modPath = path.resolve(__dirname, '..', 'brief', 'bin', 'lib', 'deliver.cjs');
  delete require.cache[modPath];
  return require(modPath);
}

/**
 * Write the 4 minimal Type A template stubs into the fixture cwd. Plan 05
 * replaces these stubs with full templates, but Plan 08-01 GREEN only
 * needs `<!-- INSERT: ## Section -->` placeholders that synthesizeTypeA fills.
 */
function writeTypeATemplates(cwd) {
  const tdir = path.join(cwd, 'brief', 'templates', 'deliver', 'type-a');
  fs.mkdirSync(tdir, { recursive: true });

  fs.writeFileSync(
    path.join(tdir, 'product-brief.md'),
    `# Product Brief

## Immutable Intent

<!-- INSERT: ## Immutable Intent -->

## Customer Segments

<!-- INSERT: ## Customer Segments -->

## Value Proposition

<!-- INSERT: ## Value Proposition -->

## Personas

<!-- INSERT: ## Personas -->
`,
    'utf-8'
  );

  fs.writeFileSync(
    path.join(tdir, 'service-policy.md'),
    `# Service Policy

## Process

<!-- INSERT: ## Process -->

## Tools

<!-- INSERT: ## Tools -->

## Compliance Obligations

<!-- INSERT: ## Documented obligations addressed: -->

## Customer Commitments

<!--BEGIN business_model: b2b-->
SLA Tiers: Enterprise customers receive 99.95% uptime, dedicated CSM, and quarterly business reviews.
<!--END business_model: b2b-->
<!--BEGIN business_model: b2c-->
환불 정책: 결제일 기준 7일 이내 전액 환불 가능. 고객지원: 평일 09-18시 카카오톡 채널. 채널 커버리지: 전국. 커뮤니티 가이드라인: 비방·욕설 금지.
<!--END business_model: b2c-->
`,
    'utf-8'
  );

  fs.writeFileSync(
    path.join(tdir, 'high-level-spec.md'),
    `# High-Level Spec

## Immutable Intent

<!-- INSERT: ## Immutable Intent -->

## Component Map

<!-- INSERT: ## Component Map -->

## Phased Roadmap

<!-- INSERT: ## Phased Roadmap -->

## Critical Risks

<!-- INSERT: ## Critical Risks -->
`,
    'utf-8'
  );

  fs.writeFileSync(
    path.join(tdir, 'feature-map.md'),
    `# Feature Map

## Component Map

<!-- INSERT: ## Component Map -->

## Value Proposition

<!-- INSERT: ## Value Proposition -->

\`\`\`mermaid
mindmap
  root((페이앱))
    Mobile
    API Gateway
    Data Sync Worker
    Category ML
    Postgres
\`\`\`
`,
    'utf-8'
  );
}

/**
 * Build a tmp cwd populated with the Korea B2C 9-workstream fixture.
 * - .planning/config.json + OBJECTIVES.md placed at .planning/ root
 * - workstream artifact files placed at .planning/workstreams/{name}/{file}.md
 *   per Code Example 1 line 1196 (`path.join(cwd, '.planning', src.artifact)`)
 * - 4 Type A template stubs placed at brief/templates/deliver/type-a/
 *
 * Returns the tmp cwd absolute path.
 */
function setupKoreaB2CFixture() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-deliver-'));
  const planning = path.join(tmp, '.planning');
  fs.mkdirSync(planning, { recursive: true });

  // Top-level .planning/ files
  fs.copyFileSync(path.join(FIXTURE_ROOT, 'config.json'), path.join(planning, 'config.json'));
  fs.copyFileSync(
    path.join(FIXTURE_ROOT, 'OBJECTIVES.md'),
    path.join(planning, 'OBJECTIVES.md')
  );

  // Workstream files placed under .planning/workstreams/{ws-name}/{file}
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
    fs.copyFileSync(path.join(FIXTURE_ROOT, fileName), path.join(wsDir, fileName));
  }

  // Type A template stubs
  writeTypeATemplates(tmp);

  return tmp;
}

/**
 * Mutate the fixture's config.json to set business_model = newModel. Used by
 * the service-policy test to switch B2C → B2B and re-run synthesis.
 */
function mutateBusinessModel(cwd, newModel) {
  const cfgPath = path.join(cwd, '.planning', 'config.json');
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
  cfg.brief.business_model = newModel;
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf-8');
}

// ─── Test 1: product-brief synthesis ────────────────────────────────────────

test('synthesizeTypeA(product-brief): writes file with Immutable Intent + Customer Segments + Personas + 5 mandatory FM + voice.languages=[ko]', () => {
  const cwd = setupKoreaB2CFixture();
  const deliver = loadDeliver();

  const result = deliver.synthesizeTypeA(cwd, 'product-brief', {});

  assert.equal(result.complete, true, 'all 2 sources present');
  assert.deepEqual(result.missing, [], 'no missing sources');

  const outPath = path.join(cwd, '.planning', 'deliverables', 'type-a', 'product-brief.md');
  assert.equal(result.outPath, outPath);
  assert.ok(fs.existsSync(outPath), `output file should exist at ${outPath}`);

  const content = fs.readFileSync(outPath, 'utf-8');

  // Body content from each source section is inlined
  assert.match(
    content,
    /페이앱은 한국 20-30대 1인 가구를 위한/,
    'OBJECTIVES.md ## Immutable Intent body inlined'
  );
  assert.match(
    content,
    /페이앱의 1차 세그먼트는 한국 거주 만 22-34세 1인 가구이며/,
    'canvas.md ## Customer Segments body inlined'
  );
  assert.match(
    content,
    /혼자살이 28세 김지수/,
    'go-to-market.md ## Personas body inlined'
  );

  // 5 mandatory frontmatter fields + voice.languages — NESTED form per BR-02
  // fix (08-REVIEW.md): deliver.cjs now emits nested YAML (audience.{type,
  // confidentiality}, voice.{tone,perspective,languages}, business_context.
  // {model,region}) so frontmatter.cjs (key regex `[a-zA-Z0-9_-]+:` excludes
  // `.`) can parse every field and audience.runAudience finds all 3 mandatory
  // fields → AUDIENCE-OK, not BLOCKING DRIFTED-frontmatter.
  assert.match(content, /^---/, 'has frontmatter open fence');
  assert.match(content, /audience:\s*\n\s+type:\s*internal/, 'nested audience.type');
  assert.match(content, /\n\s+confidentiality:\s*internal/, 'nested audience.confidentiality');
  assert.match(content, /voice:\s*\n\s+tone:\s*direct/, 'b2c → nested voice.tone direct (Phase 5 D-10)');
  assert.match(
    content,
    /\n\s+perspective:\s*first-person-plural/,
    'b2c → nested voice.perspective first-person-plural'
  );
  assert.match(content, /business_context:\s*\n\s+model:\s*b2c/, 'nested business_context.model b2c from fixture');
  // voice.languages: ['ko'] (Korea fixture, no --en) — nested under voice
  assert.match(content, /\n\s+languages:\s*\[ko\]/, 'nested voice.languages = [ko] for kr fixture');
});

// ─── Test 2: service-policy B2C/B2B conditional prose ──────────────────────

test('synthesizeTypeA(service-policy): B2C contains B2C prose only; switching to B2B contains B2B prose only', () => {
  const cwd = setupKoreaB2CFixture();
  const deliver = loadDeliver();

  // First run: B2C (fixture default)
  const r1 = deliver.synthesizeTypeA(cwd, 'service-policy', {});
  const c1 = fs.readFileSync(r1.outPath, 'utf-8');

  assert.match(c1, /환불 정책/, 'B2C: contains 환불 정책 (refund policy)');
  assert.match(c1, /고객지원: 평일 09-18시/, 'B2C: contains customer support hours');
  assert.match(c1, /채널 커버리지/, 'B2C: contains channel coverage');
  assert.match(c1, /커뮤니티 가이드라인/, 'B2C: contains community guidelines');
  assert.doesNotMatch(c1, /SLA Tiers:/, 'B2C: must NOT contain B2B SLA Tiers block');
  // Conditional markers themselves should be removed from output
  assert.doesNotMatch(c1, /<!--\s*BEGIN business_model/, 'B2C: BEGIN markers stripped');
  assert.doesNotMatch(c1, /<!--\s*END business_model/, 'B2C: END markers stripped');

  // Second run: mutate to B2B
  mutateBusinessModel(cwd, 'b2b');
  const r2 = deliver.synthesizeTypeA(cwd, 'service-policy', {});
  const c2 = fs.readFileSync(r2.outPath, 'utf-8');

  assert.match(c2, /SLA Tiers:/, 'B2B: contains SLA Tiers');
  assert.match(c2, /99\.95% uptime/, 'B2B: contains uptime SLA');
  assert.doesNotMatch(c2, /환불 정책/, 'B2B: must NOT contain B2C 환불 정책');
  assert.doesNotMatch(c2, /커뮤니티 가이드라인/, 'B2B: must NOT contain B2C 커뮤니티 가이드라인');
  // Frontmatter business_context.model now b2b — nested form per BR-02 fix
  assert.match(c2, /business_context:\s*\n\s+model:\s*b2b/);
});

// ─── Test 3: high-level-spec synthesis ──────────────────────────────────────

test('synthesizeTypeA(high-level-spec): inlines tech-arch ## Component Map + roadmap ## Phased Roadmap + risk ## Critical Risks', () => {
  const cwd = setupKoreaB2CFixture();
  const deliver = loadDeliver();

  const result = deliver.synthesizeTypeA(cwd, 'high-level-spec', {});
  const content = fs.readFileSync(result.outPath, 'utf-8');

  // Component Map signal — first bullet is Mobile Apps
  assert.match(
    content,
    /Mobile Apps \(iOS\/Android\)/,
    'tech-arch ## Component Map body inlined'
  );
  // Phased Roadmap signal — Phase 2 Core MVP
  assert.match(
    content,
    /Phase 2 — Core MVP/,
    'roadmap ## Phased Roadmap body inlined'
  );
  // Critical Risks signal — R1 마이데이터
  assert.match(
    content,
    /R1 — 마이데이터 사업자 인증 미획득 위험/,
    'risk ## Critical Risks body inlined'
  );
  // OBJECTIVES Immutable Intent also inlined per SYNTHESIS_MAP
  assert.match(content, /페이앱은 한국 20-30대 1인 가구를 위한/);
});

// ─── Test 4: feature-map synthesis ──────────────────────────────────────────

test('synthesizeTypeA(feature-map): output contains Mermaid mindmap or ASCII tree, references tech-arch components', () => {
  const cwd = setupKoreaB2CFixture();
  const deliver = loadDeliver();

  const result = deliver.synthesizeTypeA(cwd, 'feature-map', {});
  const content = fs.readFileSync(result.outPath, 'utf-8');

  // Either a Mermaid mindmap fence OR an ASCII tree must be present.
  const hasMermaid = /```mermaid\s*\n\s*mindmap/.test(content) || /mindmap\s*\n\s*root/.test(content);
  const hasAsciiTree = /[├└]──/.test(content) || /\|--/.test(content);
  assert.ok(hasMermaid || hasAsciiTree, 'must contain Mermaid mindmap OR ASCII tree');

  // References tech-arch components (e.g., API Gateway / Mobile / Postgres)
  assert.ok(
    /API Gateway|Mobile|Postgres|페이앱/.test(content),
    'references tech-arch components'
  );
});

// ─── Test 5: missing source workstream → placeholder + stderr warning ─────

test('checkDependencies + synthesizeTypeA: missing source emits placeholder + stderr warning, does NOT throw', () => {
  const cwd = setupKoreaB2CFixture();
  const deliver = loadDeliver();

  // Remove canvas.md to simulate missing workstream
  const canvasPath = path.join(
    cwd,
    '.planning',
    'workstreams',
    'business-model-canvas',
    'canvas.md'
  );
  fs.unlinkSync(canvasPath);

  // checkDependencies must report it missing
  const dep = deliver.checkDependencies(cwd, 'product-brief');
  assert.equal(dep.complete, false, 'complete=false when canvas.md missing');
  assert.ok(
    dep.missing.includes('workstreams/business-model-canvas/canvas.md'),
    'missing list contains the canvas relative path'
  );

  // synthesizeTypeA must NOT throw; output must contain placeholder body
  let stderrText = '';
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk, ...rest) => {
    stderrText += String(chunk);
    return origStderrWrite(chunk, ...rest);
  };
  let result;
  try {
    result = deliver.synthesizeTypeA(cwd, 'product-brief', {});
  } finally {
    process.stderr.write = origStderrWrite;
  }

  assert.equal(result.complete, false);
  const content = fs.readFileSync(result.outPath, 'utf-8');
  assert.match(
    content,
    /> ⚠️ Placeholder — workstreams\/business-model-canvas\/canvas\.md workstream not completed\./,
    'placeholder block written into output body'
  );
  assert.match(stderrText, /missing source|missing|placeholder/i, 'stderr warning emitted');
});

// ─── Test 6: extractMarkdownSection helper ─────────────────────────────────

test('extractMarkdownSection: heading found returns body; missing heading returns placeholder marker', () => {
  const deliver = loadDeliver();

  const body = '## A\nbody A\n## B\nbody B\n';
  assert.equal(deliver.extractMarkdownSection(body, '## A'), 'body A');
  assert.equal(deliver.extractMarkdownSection(body, '## B'), 'body B');
  assert.equal(
    deliver.extractMarkdownSection(body, '## X'),
    '<!-- ## X not found in source -->'
  );
});

// ─── Test 7: applyConditionalProse helper ──────────────────────────────────

test('applyConditionalProse: matching block kept (markers stripped), non-matching block dropped', () => {
  const deliver = loadDeliver();

  const input =
    '<!--BEGIN business_model: b2b-->BBB<!--END business_model: b2b-->' +
    '<!--BEGIN business_model: b2c-->CCC<!--END business_model: b2c-->';

  const b2cOut = deliver.applyConditionalProse(input, 'b2c');
  assert.equal(
    b2cOut.includes('CCC'),
    true,
    'b2c run must keep the CCC body'
  );
  assert.equal(b2cOut.includes('BBB'), false, 'b2c run must drop the BBB body');
  assert.equal(
    /<!--\s*BEGIN business_model/.test(b2cOut),
    false,
    'b2c run strips BEGIN markers from kept block'
  );
  assert.equal(
    /<!--\s*END business_model/.test(b2cOut),
    false,
    'b2c run strips END markers from kept block'
  );

  const b2bOut = deliver.applyConditionalProse(input, 'b2b');
  assert.equal(b2bOut.includes('BBB'), true);
  assert.equal(b2bOut.includes('CCC'), false);
});
