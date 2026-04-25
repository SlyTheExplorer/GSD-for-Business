/**
 * brief-workstream-operations — Phase 7 Plan 6 (DSG-04 / VALIDATION row 07-06-01)
 *
 * Validates the Operations workstream bundle:
 *   - spec.yaml has all 7 fields (Phase 2 D-13 + Phase 7 D-13 extension)
 *   - gates_required defaults to [align, audience, compliance] (D-10)
 *   - depends_on lists business-model-canvas + go-to-market (D-07 soft order)
 *   - design-prompts.md has BOTH B2B and B2C conditional blocks (D-14)
 *   - templates/artifact.md has all 5 canonical sections (Org & Hiring / Process & SOP
 *     / Tool Stack / Cadence / Decision Rights & Escalation)
 *   - Workstream loads via workstream-loader without throwing
 *   - B2B fixture for Plan 02 false-positive prevention exists at the expected path
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SPEC = path.join(__dirname, '..', 'brief', 'workstreams', 'operations', 'spec.yaml');
const DESIGN_PROMPTS = path.join(__dirname, '..', 'brief', 'workstreams', 'operations', 'design-prompts.md');
const ARTIFACT = path.join(__dirname, '..', 'brief', 'workstreams', 'operations', 'templates', 'artifact.md');

test('OPERATIONS spec.yaml has 7 required fields (Phase 2 D-13 + Phase 7 D-13)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  for (const f of ['name', 'description', 'research_prompts', 'design_prompts',
                   'output_artifact_template', 'gates_required', 'depends_on']) {
    assert.match(yaml, new RegExp('^' + f + ':', 'm'),
      `OPERATIONS spec.yaml missing required field: ${f}`);
  }
});

test('OPERATIONS spec.yaml gates_required defaults to [align, audience, compliance] (D-10)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /gates_required:\s*\[align,\s*audience,\s*compliance\]/);
});

test('OPERATIONS spec.yaml depends_on includes business-model-canvas + go-to-market (D-07 soft order)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /depends_on:\s*\[business-model-canvas,\s*go-to-market\]/);
});

test('OPERATIONS design-prompts.md has B2B conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2b/i,
    'OPERATIONS design-prompts.md missing B2B conditional block (D-14 violation)');
});

test('OPERATIONS design-prompts.md has B2C conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2c/i,
    'OPERATIONS design-prompts.md missing B2C conditional block (D-14 violation)');
});

test('OPERATIONS templates/artifact.md has 5 canonical sections (DSG-04)', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  for (const section of ['Org & Hiring', 'Process & SOP', 'Tool Stack',
                          'Cadence', 'Decision Rights']) {
    assert.match(t, new RegExp(section),
      `OPERATIONS artifact missing canonical DSG-04 section: ${section}`);
  }
});

test('OPERATIONS templates/artifact.md frontmatter has audience + workstream + artifact_kind', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /^audience:\s*internal/m);
  assert.match(t, /^workstream:\s*operations/m);
  assert.match(t, /^artifact_kind:\s*operations/m);
});

test('OPERATIONS design-prompts.md mentions FINANCIAL runway alignment (cross-workstream awareness)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /FINANCIAL.*runway|runway.*alignment|runway.*sustain/i,
    'OPERATIONS design-prompts.md must reference FINANCIAL runway alignment for hiring sequencing');
});

test('OPERATIONS loads via workstream-loader without throwing', () => {
  const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');
  const all = loadWorkstreams(process.cwd());
  const ops = all.find(w => w.slug === 'operations');
  assert.ok(ops, 'OPERATIONS workstream must be discoverable via loadWorkstreams()');
  assert.strictEqual(ops.name, 'operations');
  assert.ok(Array.isArray(ops.gates_required),
    'OPERATIONS spec.yaml gates_required must parse as array');
  assert.deepStrictEqual([...ops.gates_required].sort(),
    ['align', 'audience', 'compliance'].sort());
  assert.ok(Array.isArray(ops.depends_on),
    'OPERATIONS spec.yaml depends_on must parse as array');
  assert.deepStrictEqual([...ops.depends_on].sort(),
    ['business-model-canvas', 'go-to-market'].sort(),
    'OPERATIONS depends_on must list business-model-canvas + go-to-market (D-07)');
});

test('B2B canary fixture exists at tests/fixtures/objectives-b2b-enterprise-saas.md (Plan 02 false-positive prevention)', () => {
  const fixturePath = path.join(__dirname, 'fixtures', 'objectives-b2b-enterprise-saas.md');
  assert.ok(fs.existsSync(fixturePath),
    'B2B fixture must exist for Plan 02 false-positive test');
  const content = fs.readFileSync(fixturePath, 'utf8');
  assert.match(content, /business_context\.region:\s*us/m,
    'B2B fixture must declare region: us (NOT kr — false-positive prevention path)');
  assert.match(content, /business_context\.model:\s*enterprise/m,
    'B2B fixture must declare business_model: enterprise');
  assert.match(content, /business_context\.compliance_packs:\s*\[\s*\]/m,
    'B2B fixture must have empty compliance_packs (NO PIPA / ISMS-P / MyData) — false-positive prevention');
});
