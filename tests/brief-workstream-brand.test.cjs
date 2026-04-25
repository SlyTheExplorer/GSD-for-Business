/**
 * brief-workstream-brand — Phase 7 Plan 5 (T-07-17 / VALIDATION row 07-05-05)
 *
 * Validates the BRAND workstream bundle:
 *   - spec.yaml has all 7 fields (Phase 2 D-13 + Phase 7 D-13 extension)
 *   - gates_required defaults to [align, audience, compliance] (D-10)
 *   - depends_on includes business-model-canvas + go-to-market (D-07)
 *   - design-prompts.md has BOTH B2B and B2C conditional blocks (D-14)
 *   - templates/artifact.md has 4 canonical sections (Positioning / Voice / Tone / Messaging)
 *   - Workstream loads via workstream-loader without throwing
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SPEC = path.join(__dirname, '..', 'brief', 'workstreams', 'brand', 'spec.yaml');
const DESIGN_PROMPTS = path.join(__dirname, '..', 'brief', 'workstreams', 'brand', 'design-prompts.md');
const ARTIFACT = path.join(__dirname, '..', 'brief', 'workstreams', 'brand', 'templates', 'artifact.md');

test('BRAND spec.yaml has 7 required fields (Phase 2 D-13 + Phase 7 D-13)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  for (const f of ['name', 'description', 'research_prompts', 'design_prompts',
                   'output_artifact_template', 'gates_required', 'depends_on']) {
    assert.match(yaml, new RegExp('^' + f + ':', 'm'),
      `BRAND spec.yaml missing required field: ${f}`);
  }
});

test('BRAND spec.yaml gates_required defaults to [align, audience, compliance] (D-10)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /gates_required:\s*\[align,\s*audience,\s*compliance\]/);
});

test('BRAND spec.yaml depends_on includes business-model-canvas and go-to-market (D-07)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /depends_on:\s*\[business-model-canvas,\s*go-to-market\]/);
});

test('BRAND design-prompts.md has B2B conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2b/i,
    'BRAND design-prompts.md missing B2B conditional block (D-14 violation)');
});

test('BRAND design-prompts.md has B2C conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2c/i,
    'BRAND design-prompts.md missing B2C conditional block (D-14 violation)');
});

test('BRAND templates/artifact.md has 4 canonical sections (DSG-07 / T-07-17)', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  for (const section of ['Positioning Statement', 'Brand Voice', 'Tone Matrix',
                          'Messaging Framework']) {
    assert.match(t, new RegExp(section),
      `BRAND artifact missing canonical section: ${section}`);
  }
});

test('BRAND templates/artifact.md has Korean variant section (region:kr only)', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /Korean Variant/i,
    'BRAND artifact must have a Korean Variant section for region:kr');
});

test('BRAND templates/artifact.md frontmatter has audience + workstream + artifact_kind', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /^audience:\s*internal/m);
  assert.match(t, /^workstream:\s*brand/m);
  assert.match(t, /^artifact_kind:\s*brand-strategy/m);
});

test('BRAND loads via workstream-loader without throwing', () => {
  const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');
  const all = loadWorkstreams(process.cwd());
  const brand = all.find(w => w.slug === 'brand');
  assert.ok(brand, 'BRAND workstream must be discoverable via loadWorkstreams()');
  assert.strictEqual(brand.name, 'brand');
  assert.deepStrictEqual([...brand.gates_required].sort(),
    ['align', 'audience', 'compliance'].sort());
  assert.deepStrictEqual(brand.depends_on, ['business-model-canvas', 'go-to-market']);
});
