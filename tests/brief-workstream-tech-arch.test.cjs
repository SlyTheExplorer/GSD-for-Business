/**
 * brief-workstream-tech-arch — Phase 7 Plan 6 (DSG-09 / VALIDATION row 07-06-02)
 *
 * Validates the Technology Architecture (HIGH-LEVEL only) workstream bundle:
 *   - spec.yaml has all 7 fields (Phase 2 D-13 + Phase 7 D-13 extension)
 *   - gates_required defaults to [align, audience, compliance] (D-10)
 *   - depends_on lists business-model-canvas + go-to-market (D-07 soft order)
 *   - design-prompts.md has BOTH B2B and B2C conditional blocks (D-14)
 *   - templates/artifact.md has all 7 canonical TECH-ARCH sections (System Component
 *     Map / Component Responsibilities / Data Flow / Build Sequence / External
 *     Dependencies / Out of Scope / Open Questions for Engineering PRD)
 *   - DSG-09 BOUNDARY PROTECTION: design-prompts.md AND templates/artifact.md MUST
 *     contain explicit "NOT detailed design" or "high-level" boundary text >= 2
 *     occurrences combined (T-07-19 mitigation: tampering with the boundary breaks
 *     the contract that this artifact is PRD INPUT, not engineering's detailed design)
 *   - Workstream loads via workstream-loader without throwing
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SPEC = path.join(__dirname, '..', 'brief', 'workstreams', 'tech-arch', 'spec.yaml');
const DESIGN_PROMPTS = path.join(__dirname, '..', 'brief', 'workstreams', 'tech-arch', 'design-prompts.md');
const ARTIFACT = path.join(__dirname, '..', 'brief', 'workstreams', 'tech-arch', 'templates', 'artifact.md');

test('TECH-ARCH spec.yaml has 7 required fields (Phase 2 D-13 + Phase 7 D-13)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  for (const f of ['name', 'description', 'research_prompts', 'design_prompts',
                   'output_artifact_template', 'gates_required', 'depends_on']) {
    assert.match(yaml, new RegExp('^' + f + ':', 'm'),
      `TECH-ARCH spec.yaml missing required field: ${f}`);
  }
});

test('TECH-ARCH spec.yaml gates_required defaults to [align, audience, compliance] (D-10)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /gates_required:\s*\[align,\s*audience,\s*compliance\]/);
});

test('TECH-ARCH spec.yaml depends_on includes business-model-canvas + go-to-market (D-07 soft order)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /depends_on:\s*\[business-model-canvas,\s*go-to-market\]/);
});

test('TECH-ARCH spec.yaml description includes DSG-09 boundary callout (NOT detailed design)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /NOT detailed design|high-level/i,
    'TECH-ARCH spec.yaml description must contain DSG-09 boundary callout');
});

test('TECH-ARCH design-prompts.md has B2B conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2b/i,
    'TECH-ARCH design-prompts.md missing B2B conditional block (D-14 violation)');
});

test('TECH-ARCH design-prompts.md has B2C conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2c/i,
    'TECH-ARCH design-prompts.md missing B2C conditional block (D-14 violation)');
});

test('TECH-ARCH templates/artifact.md has 7 canonical sections (DSG-09)', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  for (const section of ['System Component Map', 'Component Responsibilities',
                          'Data Flow', 'Build Sequence', 'External Dependencies',
                          'Out of Scope', 'Open Questions for Engineering PRD']) {
    assert.match(t, new RegExp(section),
      `TECH-ARCH artifact missing canonical DSG-09 section: ${section}`);
  }
});

test('TECH-ARCH templates/artifact.md frontmatter has audience + workstream + artifact_kind', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /^audience:\s*internal/m);
  assert.match(t, /^workstream:\s*tech-arch/m);
  assert.match(t, /^artifact_kind:\s*tech-arch/m);
});

test('DSG-09 BOUNDARY PROTECTION: design-prompts.md + artifact.md must contain "NOT detailed design" or "high-level" >= 2 combined occurrences (T-07-19 mitigation)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  const art = fs.readFileSync(ARTIFACT, 'utf8');
  // Count occurrences of either boundary phrase across both files
  const re = /NOT detailed design|high-level/gi;
  const dpCount = (dp.match(re) || []).length;
  const artCount = (art.match(re) || []).length;
  const total = dpCount + artCount;
  assert.ok(total >= 2,
    `TECH-ARCH boundary protection: combined "NOT detailed design"/"high-level" occurrences in design-prompts.md (${dpCount}) + artifact.md (${artCount}) = ${total}; required >= 2 (DSG-09 / T-07-19)`);
  // Also assert each file has at least one occurrence
  assert.ok(dpCount >= 1, `design-prompts.md must have at least 1 boundary phrase`);
  assert.ok(artCount >= 1, `artifact.md must have at least 1 boundary phrase`);
});

test('TECH-ARCH design-prompts.md FORBIDS detailed design content (DSG-09 boundary discipline)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  // The DO NOT include section must explicitly forbid these
  for (const forbidden of ['Interface signatures', 'Protocol details',
                            'Database schema columns', 'Class hierarchies']) {
    assert.match(dp, new RegExp(forbidden, 'i'),
      `TECH-ARCH design-prompts.md DO NOT list missing explicit prohibition: ${forbidden}`);
  }
});

test('TECH-ARCH loads via workstream-loader without throwing', () => {
  const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');
  const all = loadWorkstreams(process.cwd());
  const ta = all.find(w => w.slug === 'tech-arch');
  assert.ok(ta, 'TECH-ARCH workstream must be discoverable via loadWorkstreams()');
  assert.strictEqual(ta.name, 'tech-arch');
  assert.ok(Array.isArray(ta.gates_required));
  assert.deepStrictEqual([...ta.gates_required].sort(),
    ['align', 'audience', 'compliance'].sort());
  assert.ok(Array.isArray(ta.depends_on));
  assert.deepStrictEqual([...ta.depends_on].sort(),
    ['business-model-canvas', 'go-to-market'].sort(),
    'TECH-ARCH depends_on must list business-model-canvas + go-to-market (D-07)');
});
