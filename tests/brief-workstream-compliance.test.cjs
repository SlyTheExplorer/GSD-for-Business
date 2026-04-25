/**
 * brief-workstream-compliance — Phase 7 Plan 5 (T-07-20 / VALIDATION row 07-05-08)
 *
 * Validates the COMPLIANCE workstream bundle (DSG-05; DISTINCT FROM CC-01 checker):
 *   - spec.yaml has all 7 fields (Phase 2 D-13 + Phase 7 D-13 extension)
 *   - gates_required defaults to [align, audience, compliance] (D-10)
 *   - depends_on includes business-model-canvas (D-07)
 *   - design-prompts.md has BOTH B2B and B2C conditional blocks (D-14)
 *   - templates/artifact.md has 7 canonical sections (Applicable Regulations /
 *     Documented Obligations Addressed / Obligations Needing Further Work /
 *     Obligations BRIEF Cannot Verify / CEO Personal Liability Surface /
 *     Mitigation Roadmap / Mandatory Legal Counsel Disclaimer)
 *   - design-prompts.md references all 3 Korea primers
 *   - design-prompts.md cites compliance-vocabulary.md ban-list discipline
 *   - design-prompts.md OR spec.yaml description has explicit "distinct from CC-01"
 *     wording (T-07-20 anti-spoofing guard, RESEARCH line 549)
 *   - templates/artifact.md frontmatter mentions Korean disclaimer condition
 *   - Workstream loads via workstream-loader without throwing
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SPEC = path.join(__dirname, '..', 'brief', 'workstreams', 'compliance', 'spec.yaml');
const DESIGN_PROMPTS = path.join(__dirname, '..', 'brief', 'workstreams', 'compliance', 'design-prompts.md');
const ARTIFACT = path.join(__dirname, '..', 'brief', 'workstreams', 'compliance', 'templates', 'artifact.md');

test('COMPLIANCE spec.yaml has 7 required fields (Phase 2 D-13 + Phase 7 D-13)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  for (const f of ['name', 'description', 'research_prompts', 'design_prompts',
                   'output_artifact_template', 'gates_required', 'depends_on']) {
    assert.match(yaml, new RegExp('^' + f + ':', 'm'),
      `COMPLIANCE spec.yaml missing required field: ${f}`);
  }
});

test('COMPLIANCE spec.yaml gates_required defaults to [align, audience, compliance] (D-10)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /gates_required:\s*\[align,\s*audience,\s*compliance\]/);
});

test('COMPLIANCE spec.yaml depends_on includes business-model-canvas (D-07)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /depends_on:\s*\[business-model-canvas\]/);
});

test('COMPLIANCE design-prompts.md has B2B conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2b/i,
    'COMPLIANCE design-prompts.md missing B2B conditional block (D-14 violation)');
});

test('COMPLIANCE design-prompts.md has B2C conditional block (D-14)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /If business_model in \[b2c/i,
    'COMPLIANCE design-prompts.md missing B2C conditional block (D-14 violation)');
});

test('COMPLIANCE templates/artifact.md has 7 canonical sections (DSG-05)', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  for (const section of [
    'Applicable Regulations',
    'Documented Obligations Addressed',
    'Obligations Needing Further Work',
    'Obligations BRIEF Cannot Verify',
    'CEO Personal Liability Surface',
    'Mitigation Roadmap',
    'Mandatory Legal Counsel Disclaimer',
  ]) {
    assert.match(t, new RegExp(section),
      `COMPLIANCE artifact missing canonical section: ${section}`);
  }
});

test('COMPLIANCE design-prompts.md references all 3 Korea primer paths', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  for (const primer of [
    'brief/references/compliance/korea/pipa-2026.md',
    'brief/references/compliance/korea/isms-p.md',
    'brief/references/compliance/korea/mydata-2026.md',
  ]) {
    assert.match(dp, new RegExp(primer.replace(/\//g, '\\/').replace(/\./g, '\\.')),
      `COMPLIANCE design-prompts.md must reference primer file: ${primer}`);
  }
});

test('COMPLIANCE design-prompts.md cites compliance-vocabulary.md ban-list discipline', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /compliance-vocabulary\.md/,
    'COMPLIANCE design-prompts.md must cite the compliance-vocabulary.md ban-list reference');
});

test('COMPLIANCE design-prompts.md frames vocabulary discipline as ban-list (mentions DO NOT or banned)', () => {
  // The design-prompts.md MENTIONS banned tokens as part of the ban-list, but it must
  // frame them as forbidden — i.e. the file contains a "DO NOT use" instruction that
  // names the banned tokens. This distinguishes "mentioning ban-list as instruction"
  // (allowed) from "USING banned tokens as findings vocabulary" (forbidden).
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /DO NOT use/i,
    'COMPLIANCE design-prompts.md must frame vocabulary as DO NOT use (ban-list discipline)');
  // The document must explicitly mention the canonical ban-list tokens AS items in the
  // ban-list (so the reader knows what NOT to write).
  assert.match(dp, /"compliant"/,
    'COMPLIANCE design-prompts.md must list "compliant" as banned token');
  assert.match(dp, /"passed"/,
    'COMPLIANCE design-prompts.md must list "passed" as banned token');
});

test('COMPLIANCE spec.yaml description has explicit "distinct from CC-01" wording (T-07-20)', () => {
  // T-07-20: anti-spoofing — must explicitly disambiguate from the CC-01 checker
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /distinct from CC-01/i,
    'COMPLIANCE spec.yaml description must explicitly say "distinct from CC-01" (T-07-20)');
});

test('COMPLIANCE design-prompts.md also has the CC-01 distinction (defense in depth)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  assert.match(dp, /distinct from .*CC-01|distinct from the CC-01/i,
    'COMPLIANCE design-prompts.md must reinforce the CC-01 distinction');
});

test('COMPLIANCE templates/artifact.md frontmatter mentions Korean disclaimer condition', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  // Either an explicit korean_disclaimer_when_region_is field or a {{korea}} template
  // variable, per plan acceptance criteria
  const hasKoreanCondition = /korean_disclaimer_when_region_is|\{\{korea\}\}/.test(t);
  assert.ok(hasKoreanCondition,
    'COMPLIANCE templates/artifact.md frontmatter must indicate the Korean disclaimer condition (korean_disclaimer_when_region_is or {{korea}} template variable)');
});

test('COMPLIANCE templates/artifact.md frontmatter has audience + workstream + artifact_kind', () => {
  const t = fs.readFileSync(ARTIFACT, 'utf8');
  assert.match(t, /^audience:\s*internal/m);
  assert.match(t, /^workstream:\s*compliance/m);
  assert.match(t, /^artifact_kind:\s*compliance-plan/m);
});

test('COMPLIANCE loads via workstream-loader without throwing', () => {
  const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');
  const all = loadWorkstreams(process.cwd());
  const compliance = all.find(w => w.slug === 'compliance');
  assert.ok(compliance, 'COMPLIANCE workstream must be discoverable via loadWorkstreams()');
  assert.strictEqual(compliance.name, 'compliance');
  assert.deepStrictEqual([...compliance.gates_required].sort(),
    ['align', 'audience', 'compliance'].sort());
  assert.deepStrictEqual(compliance.depends_on, ['business-model-canvas']);
});
