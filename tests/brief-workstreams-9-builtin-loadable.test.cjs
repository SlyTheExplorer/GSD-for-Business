/**
 * BRIEF Phase 7 Plan 07 — All 9 built-in workstreams loadable + 7-field schema
 *
 * Asserts that loadWorkstreams(cwd) returns the 9 canonical built-in workstreams
 * (BMC, GTM, BRAND, OPERATIONS, FINANCIAL, RISK, ROADMAP, TECH-ARCH, COMPLIANCE)
 * + _example WITHOUT throwing, and each built-in carries the 7 required fields
 * per Phase 2 D-13 (5 inherited) + Phase 7 D-13 (2 new).
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');

const REPO_ROOT = path.join(__dirname, '..');

const EXPECTED_BUILTIN_SLUGS = [
  '_example',
  'brand',
  'business-model-canvas',
  'compliance',
  'financial',
  'go-to-market',
  'operations',
  'risk',
  'roadmap',
  'tech-arch',
];

const EXPECTED_NON_EXAMPLE_BUILTINS = EXPECTED_BUILTIN_SLUGS.filter(s => s !== '_example');

test('All 9 built-in workstreams + _example loadable without throwing', () => {
  const ws = loadWorkstreams(REPO_ROOT);
  const slugs = ws.map(w => w.slug || w.name).sort();
  for (const expected of EXPECTED_BUILTIN_SLUGS) {
    assert.ok(
      slugs.includes(expected),
      `Missing built-in workstream "${expected}". Got: ${slugs.join(',')}`
    );
  }
});

test('Each built-in workstream has 7 required fields (Phase 2 D-13 + Phase 7 D-13)', () => {
  const ws = loadWorkstreams(REPO_ROOT);
  const builtins = ws.filter(w => (w.slug || w.name) !== '_example');
  assert.ok(
    builtins.length >= 9,
    `Expected at least 9 built-ins; got ${builtins.length}`
  );
  for (const w of builtins) {
    const slug = w.slug || w.name;
    if (!EXPECTED_NON_EXAMPLE_BUILTINS.includes(slug)) continue; // skip user-added
    assert.ok(w.name, `${slug}: Phase 2 D-13 — missing required field 'name'`);
    assert.ok(w.description, `${slug}: Phase 2 D-13 — missing required field 'description'`);
    assert.ok(
      Array.isArray(w.research_prompts) && w.research_prompts.length > 0,
      `${slug}: Phase 2 D-13 — missing required field 'research_prompts' (non-empty array)`
    );
    assert.ok(
      Array.isArray(w.design_prompts) && w.design_prompts.length > 0,
      `${slug}: Phase 2 D-13 — missing required field 'design_prompts' (non-empty array)`
    );
    assert.ok(
      typeof w.output_artifact_template === 'string',
      `${slug}: Phase 2 D-13 — missing required field 'output_artifact_template'`
    );
    assert.ok(
      Array.isArray(w.gates_required),
      `${slug}: Phase 7 D-13 — missing required field 'gates_required'`
    );
    assert.ok(
      Array.isArray(w.depends_on),
      `${slug}: Phase 7 D-13 — missing required field 'depends_on'`
    );
  }
});

test('All 9 built-in workstreams declare gates_required as subset of [align, audience, compliance]', () => {
  const ws = loadWorkstreams(REPO_ROOT);
  const VALID_GATES = new Set(['align', 'audience', 'compliance']);
  for (const w of ws) {
    const slug = w.slug || w.name;
    if (slug === '_example') continue;
    if (!EXPECTED_NON_EXAMPLE_BUILTINS.includes(slug)) continue;
    for (const g of w.gates_required) {
      assert.ok(
        VALID_GATES.has(g),
        `${slug}: gates_required contains invalid gate "${g}"`
      );
    }
  }
});

test('All 9 built-in workstreams declare depends_on with valid slug strings', () => {
  const ws = loadWorkstreams(REPO_ROOT);
  for (const w of ws) {
    const slug = w.slug || w.name;
    if (slug === '_example') continue;
    if (!EXPECTED_NON_EXAMPLE_BUILTINS.includes(slug)) continue;
    for (const dep of w.depends_on) {
      assert.ok(
        typeof dep === 'string' && dep.length > 0,
        `${slug}: depends_on contains invalid entry: ${JSON.stringify(dep)}`
      );
    }
  }
});
