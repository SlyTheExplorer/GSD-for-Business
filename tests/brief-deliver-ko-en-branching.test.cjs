'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const ROOT = path.resolve(__dirname, '..');
const TYPE_B_DIR = path.join(ROOT, 'brief/templates/deliver/type-b');
const FIXTURE_ROOT = path.join(ROOT, 'tests/fixtures/deliver/korea-b2c-canary-with-9-workstreams');

let deliver;
try { deliver = require(path.join(ROOT, 'brief/bin/lib/deliver.cjs')); } catch { deliver = null; }

// Workstream filename → folder mapping (mirrors Plan 01 test pattern)
const WORKSTREAM_FILES = {
  'business-model-canvas/canvas.md': 'canvas.md',
  'go-to-market/go-to-market.md': 'go-to-market.md',
  'operations/operations.md': 'operations.md',
  'compliance/compliance.md': 'compliance.md',
  'tech-arch/tech-arch.md': 'tech-arch.md',
  'roadmap/roadmap.md': 'roadmap.md',
  'risk/risk.md': 'risk.md',
};

function buildTmpCwd(regionOverride) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brief-koen-'));
  const planning = path.join(tmp, '.planning');
  fs.mkdirSync(planning, { recursive: true });

  // Copy + optionally mutate config.json
  const config = JSON.parse(fs.readFileSync(path.join(FIXTURE_ROOT, 'config.json'), 'utf8'));
  if (regionOverride !== undefined) {
    if (!config.brief) config.brief = {};
    config.brief.region = regionOverride;
  }
  fs.writeFileSync(path.join(planning, 'config.json'), JSON.stringify(config, null, 2));

  // OBJECTIVES.md: for non-kr regions, write a fresh minimal en-only OBJECTIVES.md
  // so that detectKoreaSignals returns false (Korea fixture's OBJECTIVES contains
  // both Hangul AND English Korea-signal keywords like Korea/PIPA/ISMS/MyData/Seoul).
  let objBody;
  if (regionOverride && regionOverride !== 'kr') {
    objBody = `---
project: us-test-fixture
business_model: b2c
region: us
---

# Project Goal

## Immutable Intent

Build a generic SaaS product for general consumer audiences.

## Mutable Hypotheses

- Target: small business owners
- Channel: digital ads
- Monetization: subscription
`;
  } else {
    objBody = fs.readFileSync(path.join(FIXTURE_ROOT, 'OBJECTIVES.md'), 'utf8');
  }
  fs.writeFileSync(path.join(planning, 'OBJECTIVES.md'), objBody);

  // Copy workstreams
  for (const [target, source] of Object.entries(WORKSTREAM_FILES)) {
    const destDir = path.join(planning, 'workstreams', path.dirname(target));
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(path.join(FIXTURE_ROOT, source), path.join(destDir, path.basename(target)));
  }

  // Copy templates from production location to tmp (Plan 05 templates)
  const tmplSrc = path.join(ROOT, 'brief/templates/deliver/type-a');
  const tmplDst = path.join(tmp, 'brief/templates/deliver/type-a');
  fs.mkdirSync(tmplDst, { recursive: true });
  for (const f of fs.readdirSync(tmplSrc)) {
    if (f.endsWith('.md')) fs.copyFileSync(path.join(tmplSrc, f), path.join(tmplDst, f));
  }

  return tmp;
}

test('ko/en 1: synthesizeTypeA on Korea fixture (region: kr) produces voice.languages: [ko] (default ko-only)', () => {
  assert.ok(deliver, 'deliver.cjs not loadable — Plan 01 must ship first');
  assert.equal(typeof deliver.synthesizeTypeA, 'function', 'synthesizeTypeA function missing');
  const cwd = buildTmpCwd();
  const result = deliver.synthesizeTypeA(cwd, 'product-brief', {});
  assert.ok(result.outPath, 'result.outPath missing');
  const body = fs.readFileSync(result.outPath, 'utf8');
  assert.match(body, /voice\.languages:\s*\[?\s*ko\s*\]?/, `expected voice.languages contains 'ko' for region: kr; got body excerpt:\n${body.slice(0, 600)}`);
  assert.doesNotMatch(body, /voice\.languages:\s*\[\s*ko\s*,\s*en\s*\]/, 'must NOT contain en when options.en absent');
});

test('ko/en 2: synthesizeTypeA with options.en=true produces voice.languages: [ko, en]', () => {
  assert.ok(deliver, 'deliver.cjs not loadable');
  const cwd = buildTmpCwd();
  const result = deliver.synthesizeTypeA(cwd, 'product-brief', { en: true });
  const body = fs.readFileSync(result.outPath, 'utf8');
  assert.match(body, /voice\.languages:\s*\[\s*ko\s*,\s*en\s*\]/, 'expected voice.languages: [ko, en] when options.en=true');
});

test('ko/en 3: synthesizeTypeA with config.brief.region=us produces voice.languages: [en] (no ko)', () => {
  assert.ok(deliver, 'deliver.cjs not loadable');
  const cwd = buildTmpCwd('us');
  const result = deliver.synthesizeTypeA(cwd, 'product-brief', {});
  const body = fs.readFileSync(result.outPath, 'utf8');
  assert.match(body, /voice\.languages:\s*\[?\s*en\s*\]?/, `expected voice.languages contains en for region: us; got:\n${body.slice(0, 500)}`);
  assert.doesNotMatch(body, /voice\.languages:\s*\[\s*ko/, 'region: us must NOT include ko');
});

test('ko/en 4: Type B template (proposal-deck.md) supports voice.languages frontmatter placeholder', () => {
  const body = fs.readFileSync(path.join(TYPE_B_DIR, 'proposal-deck.md'), 'utf8');
  assert.match(body, /voice\.languages:\s*\{\{languages\}\}/, 'proposal-deck.md missing voice.languages: {{languages}} placeholder');
});
