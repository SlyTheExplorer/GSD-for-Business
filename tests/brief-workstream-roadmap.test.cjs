/**
 * brief-workstream-roadmap — Phase 7 Plan 5 (T-07-15 / T-07-16 / VALIDATION row 07-05-04)
 *
 * Validates the ROADMAP workstream bundle:
 *   - spec.yaml has all 7 fields (Phase 2 D-13 + Phase 7 D-13 extension)
 *   - gates_required defaults to [align, audience, compliance] (D-10)
 *   - depends_on includes business-model-canvas + go-to-market (D-07)
 *   - design-prompts.md has BOTH B2B and B2C conditional blocks (D-14)
 *   - templates/artifact.md has all 4 horizons (Now / Near / Mid / Far)
 *   - design-prompts.md OR artifact.md OR spec.yaml CONTAINS the explicit distinction
 *     "distinct from BRIEF tool's .planning/ROADMAP.md" (T-07-15 anti-spoofing guard)
 *   - Workstream loads via workstream-loader without throwing
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SPEC = path.join(__dirname, '..', 'brief', 'workstreams', 'roadmap', 'spec.yaml');
const DESIGN_PROMPTS = path.join(__dirname, '..', 'brief', 'workstreams', 'roadmap', 'design-prompts.md');
const ARTIFACT = path.join(__dirname, '..', 'brief', 'workstreams', 'roadmap', 'templates', 'artifact.md');

test('ROADMAP spec.yaml has 7 required fields (Phase 2 D-13 + Phase 7 D-13)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  for (const f of ['name', 'description', 'research_prompts', 'design_prompts',
                   'output_artifact_template', 'gates_required', 'depends_on']) {
    assert.match(yaml, new RegExp('^' + f + ':', 'm'),
      `ROADMAP spec.yaml missing required field: ${f}`);
  }
});

test('ROADMAP spec.yaml gates_required defaults to [align, audience, compliance] (D-10)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /gates_required:\s*\[align,\s*audience,\s*compliance\]/);
});

test('ROADMAP spec.yaml depends_on includes business-model-canvas + go-to-market (D-07)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /depends_on:\s*\[business-model-canvas,\s*go-to-market\]/);
});

test('ROADMAP design-prompts.md has B2B conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2b/i,
    'ROADMAP design-prompts.md missing B2B conditional block (D-14 violation)');
});

test('ROADMAP design-prompts.md has B2C conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2c/i,
    'ROADMAP design-prompts.md missing B2C conditional block (D-14 violation)');
});

test('ROADMAP templates/artifact.md has 4 horizons (Now / Near / Mid / Far) (DSG-06)', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  for (const horizon of ['Now', 'Near', 'Mid', 'Far']) {
    assert.match(t, new RegExp('^##.*' + horizon, 'm'),
      `ROADMAP artifact missing horizon header: ${horizon}`);
  }
});

test('ROADMAP templates/artifact.md has Critical Path + Risks + Assumptions sections', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /Critical Path/i, 'ROADMAP artifact missing Critical Path section');
  assert.match(t, /^##.*Risks/m, 'ROADMAP artifact missing Risks section');
  assert.match(t, /Assumptions/i, 'ROADMAP artifact missing Assumptions section');
});

test('ROADMAP artifact OR design-prompts OR spec.yaml has explicit distinction from BRIEF tool ROADMAP.md (T-07-15)', () => {
  // T-07-15 anti-spoofing: must explicitly distinguish from .planning/ROADMAP.md
  const sources = [
    fs.readFileSync(SPEC, 'utf8'),
    fs.readFileSync(DESIGN_PROMPTS, 'utf8'),
    fs.readFileSync(ARTIFACT, 'utf8'),
  ].join('\n');
  // Accept either "distinct from" or "Distinct from" wording referencing BRIEF tool's ROADMAP.md
  assert.match(sources, /distinct from .*ROADMAP\.md|DISTINCT FROM .*ROADMAP\.md/i,
    'ROADMAP must have explicit "distinct from BRIEF tool ROADMAP.md" disambiguation (T-07-15)');
});

test('ROADMAP templates/artifact.md frontmatter has audience + workstream + artifact_kind', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /^audience:\s*internal/m);
  assert.match(t, /^workstream:\s*roadmap/m);
  assert.match(t, /^artifact_kind:\s*business-roadmap/m);
});

test('ROADMAP loads via workstream-loader without throwing', () => {
  const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');
  const all = loadWorkstreams(process.cwd());
  const roadmap = all.find(w => w.slug === 'roadmap');
  assert.ok(roadmap, 'ROADMAP workstream must be discoverable via loadWorkstreams()');
  assert.strictEqual(roadmap.name, 'roadmap');
  assert.deepStrictEqual([...roadmap.gates_required].sort(),
    ['align', 'audience', 'compliance'].sort());
  assert.deepStrictEqual(roadmap.depends_on, ['business-model-canvas', 'go-to-market']);
});
