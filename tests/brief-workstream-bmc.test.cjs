/**
 * brief-workstream-bmc — Phase 7 Plan 5 (T-07-13 / VALIDATION row 07-05-01)
 *
 * Validates the Business Model Canvas workstream bundle:
 *   - spec.yaml has all 7 fields (Phase 2 D-13 + Phase 7 D-13 extension)
 *   - gates_required defaults to [align, audience, compliance] (D-10)
 *   - design-prompts.md has BOTH B2B and B2C conditional blocks (D-14)
 *   - templates/artifact.md has all 9 Strategyzer canonical sections (DSG-01 + T-07-13)
 *   - Workstream loads via workstream-loader without throwing
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SPEC = path.join(__dirname, '..', 'brief', 'workstreams', 'business-model-canvas', 'spec.yaml');
const DESIGN_PROMPTS = path.join(__dirname, '..', 'brief', 'workstreams', 'business-model-canvas', 'design-prompts.md');
const ARTIFACT = path.join(__dirname, '..', 'brief', 'workstreams', 'business-model-canvas', 'templates', 'artifact.md');

test('BMC spec.yaml has 7 required fields (Phase 2 D-13 + Phase 7 D-13)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  for (const f of ['name', 'description', 'research_prompts', 'design_prompts',
                   'output_artifact_template', 'gates_required', 'depends_on']) {
    assert.match(yaml, new RegExp('^' + f + ':', 'm'),
      `BMC spec.yaml missing required field: ${f}`);
  }
});

test('BMC spec.yaml gates_required defaults to [align, audience, compliance] (D-10)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /gates_required:\s*\[align,\s*audience,\s*compliance\]/);
});

test('BMC spec.yaml depends_on is empty array (BMC is canonical first workstream)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /depends_on:\s*\[\s*\]/);
});

test('BMC design-prompts.md has B2B conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2b/i,
    'BMC design-prompts.md missing B2B conditional block (D-14 violation)');
});

test('BMC design-prompts.md has B2C conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2c/i,
    'BMC design-prompts.md missing B2C conditional block (D-14 violation)');
});

test('BMC templates/artifact.md has 9 Strategyzer canonical sections (DSG-01 / T-07-13)', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  for (const section of ['Customer Segments', 'Value Propositions', 'Channels',
                          'Customer Relationships', 'Revenue Streams', 'Key Resources',
                          'Key Activities', 'Key Partners', 'Cost Structure']) {
    assert.match(t, new RegExp(section),
      `BMC artifact missing canonical Strategyzer section: ${section}`);
  }
});

test('BMC templates/artifact.md frontmatter has audience + workstream + artifact_kind', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /^audience:\s*internal/m);
  assert.match(t, /^workstream:\s*business-model-canvas/m);
  assert.match(t, /^artifact_kind:\s*bmc/m);
});

test('BMC loads via workstream-loader without throwing', () => {
  const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');
  const all = loadWorkstreams(process.cwd());
  const bmc = all.find(w => w.slug === 'business-model-canvas');
  assert.ok(bmc, 'BMC workstream must be discoverable via loadWorkstreams()');
  assert.strictEqual(bmc.name, 'business-model-canvas');
  assert.ok(Array.isArray(bmc.gates_required),
    'BMC spec.yaml gates_required must parse as array');
  assert.deepStrictEqual([...bmc.gates_required].sort(),
    ['align', 'audience', 'compliance'].sort());
  assert.ok(Array.isArray(bmc.depends_on),
    'BMC spec.yaml depends_on must parse as array');
  assert.strictEqual(bmc.depends_on.length, 0,
    'BMC depends_on must be empty (canonical first workstream)');
});

test('canary fixture for Plan 08 E2E exists at tests/fixtures/objectives-korea-b2c-fintech.md', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'objectives-korea-b2c-fintech.md');
  assert.ok(fs.existsSync(fixturePath),
    'Canary fixture must exist for Plan 08 E2E test');
  const content = fs.readFileSync(fixturePath, 'utf8');
  assert.match(content, /business_context\.region:\s*kr/m,
    'Canary fixture must declare region: kr');
  assert.match(content, /business_context\.model:\s*b2c/m,
    'Canary fixture must declare business_model: b2c');
  assert.match(content, /PIPA/, 'Canary fixture compliance_packs must include PIPA');
  assert.match(content, /ISMS-P/, 'Canary fixture compliance_packs must include ISMS-P');
  assert.match(content, /MyData/, 'Canary fixture compliance_packs must include MyData');
});
