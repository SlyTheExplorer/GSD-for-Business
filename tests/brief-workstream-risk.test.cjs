/**
 * brief-workstream-risk — Phase 7 Plan 5 (T-07-18 / VALIDATION row 07-05-06)
 *
 * Validates the RISK workstream bundle:
 *   - spec.yaml has all 7 fields (Phase 2 D-13 + Phase 7 D-13 extension)
 *   - gates_required defaults to [align, audience, compliance] (D-10)
 *   - depends_on includes business-model-canvas (D-07)
 *   - design-prompts.md has BOTH B2B and B2C conditional blocks (D-14)
 *   - templates/artifact.md has all 5 risk categories (Technology / Market /
 *     Regulatory / Financial / Operational) plus Top 5 + Quarterly Review Cadence
 *   - Workstream loads via workstream-loader without throwing
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SPEC = path.join(__dirname, '..', 'brief', 'workstreams', 'risk', 'spec.yaml');
const DESIGN_PROMPTS = path.join(__dirname, '..', 'brief', 'workstreams', 'risk', 'design-prompts.md');
const ARTIFACT = path.join(__dirname, '..', 'brief', 'workstreams', 'risk', 'templates', 'artifact.md');

test('RISK spec.yaml has 7 required fields (Phase 2 D-13 + Phase 7 D-13)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  for (const f of ['name', 'description', 'research_prompts', 'design_prompts',
                   'output_artifact_template', 'gates_required', 'depends_on']) {
    assert.match(yaml, new RegExp('^' + f + ':', 'm'),
      `RISK spec.yaml missing required field: ${f}`);
  }
});

test('RISK spec.yaml gates_required defaults to [align, audience, compliance] (D-10)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /gates_required:\s*\[align,\s*audience,\s*compliance\]/);
});

test('RISK spec.yaml depends_on includes business-model-canvas (D-07)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /depends_on:\s*\[business-model-canvas\]/);
});

test('RISK design-prompts.md has B2B conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2b/i,
    'RISK design-prompts.md missing B2B conditional block (D-14 violation)');
});

test('RISK design-prompts.md has B2C conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2c/i,
    'RISK design-prompts.md missing B2C conditional block (D-14 violation)');
});

test('RISK templates/artifact.md has all 5 risk categories (DSG-08 / T-07-18)', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  for (const category of ['Technology Risks', 'Market Risks', 'Regulatory Risks',
                           'Financial Risks', 'Operational Risks']) {
    assert.match(t, new RegExp(category),
      `RISK artifact missing canonical category: ${category}`);
  }
});

test('RISK templates/artifact.md has Top 5 cross-category section', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /Top 5 Risks/i,
    'RISK artifact must have Top 5 Risks Across Categories section');
});

test('RISK templates/artifact.md has Quarterly Review Cadence section', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /Quarterly Review Cadence/i,
    'RISK artifact must have Quarterly Review Cadence section');
});

test('RISK templates/artifact.md frontmatter has audience + workstream + artifact_kind', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /^audience:\s*internal/m);
  assert.match(t, /^workstream:\s*risk/m);
  assert.match(t, /^artifact_kind:\s*risk-register/m);
});

test('RISK loads via workstream-loader without throwing', () => {
  const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');
  const all = loadWorkstreams(process.cwd());
  const risk = all.find(w => w.slug === 'risk');
  assert.ok(risk, 'RISK workstream must be discoverable via loadWorkstreams()');
  assert.strictEqual(risk.name, 'risk');
  assert.deepStrictEqual([...risk.gates_required].sort(),
    ['align', 'audience', 'compliance'].sort());
  assert.deepStrictEqual(risk.depends_on, ['business-model-canvas']);
});
