/**
 * brief-workstream-gtm — Phase 7 Plan 5 (T-07-14 / VALIDATION row 07-05-02)
 *
 * Validates the Go-to-Market workstream bundle:
 *   - spec.yaml has all 7 fields (Phase 2 D-13 + Phase 7 D-13 extension)
 *   - gates_required defaults to [align, audience, compliance] (D-10)
 *   - depends_on includes business-model-canvas (D-07 soft order)
 *   - design-prompts.md has BOTH B2B and B2C conditional blocks (D-14)
 *   - templates/artifact.md has all 9 canonical GTM sections
 *   - Workstream loads via workstream-loader without throwing
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SPEC = path.join(__dirname, '..', 'brief', 'workstreams', 'go-to-market', 'spec.yaml');
const DESIGN_PROMPTS = path.join(__dirname, '..', 'brief', 'workstreams', 'go-to-market', 'design-prompts.md');
const ARTIFACT = path.join(__dirname, '..', 'brief', 'workstreams', 'go-to-market', 'templates', 'artifact.md');

test('GTM spec.yaml has 7 required fields (Phase 2 D-13 + Phase 7 D-13)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  for (const f of ['name', 'description', 'research_prompts', 'design_prompts',
                   'output_artifact_template', 'gates_required', 'depends_on']) {
    assert.match(yaml, new RegExp('^' + f + ':', 'm'),
      `GTM spec.yaml missing required field: ${f}`);
  }
});

test('GTM spec.yaml gates_required defaults to [align, audience, compliance] (D-10)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /gates_required:\s*\[align,\s*audience,\s*compliance\]/);
});

test('GTM spec.yaml depends_on includes business-model-canvas (D-07 soft order)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /depends_on:\s*\[business-model-canvas\]/);
});

test('GTM design-prompts.md has B2B conditional block (D-14 / T-07-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2b/i,
    'GTM design-prompts.md missing B2B conditional block (D-14 / T-07-14 violation)');
});

test('GTM design-prompts.md has B2C conditional block (D-14 / T-07-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2c/i,
    'GTM design-prompts.md missing B2C conditional block (D-14 / T-07-14 violation)');
});

test('GTM templates/artifact.md has 9 canonical GTM sections (DSG-02)', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  // 9 GTM sections per CONTEXT.md lines 412-422
  for (const section of ['Target Market', 'Positioning', 'Pricing', 'Sales',
                          'Channels', 'Demand Generation', 'Sales Enablement',
                          'Launch Plan', 'KPIs']) {
    assert.match(t, new RegExp(section),
      `GTM artifact missing canonical section: ${section}`);
  }
});

test('GTM templates/artifact.md frontmatter has audience + workstream + artifact_kind', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /^audience:\s*internal/m);
  assert.match(t, /^workstream:\s*go-to-market/m);
  assert.match(t, /^artifact_kind:\s*gtm/m);
});

test('GTM loads via workstream-loader without throwing', () => {
  const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');
  const all = loadWorkstreams(process.cwd());
  const gtm = all.find(w => w.slug === 'go-to-market');
  assert.ok(gtm, 'GTM workstream must be discoverable via loadWorkstreams()');
  assert.strictEqual(gtm.name, 'go-to-market');
  assert.ok(Array.isArray(gtm.gates_required),
    'GTM spec.yaml gates_required must parse as array');
  assert.deepStrictEqual([...gtm.gates_required].sort(),
    ['align', 'audience', 'compliance'].sort());
  assert.ok(Array.isArray(gtm.depends_on),
    'GTM spec.yaml depends_on must parse as array');
  assert.deepStrictEqual(gtm.depends_on, ['business-model-canvas'],
    'GTM depends_on must list business-model-canvas (D-07 soft order)');
});
