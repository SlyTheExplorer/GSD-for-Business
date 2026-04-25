/**
 * brief-financial-driver-questions — Phase 7 Plan 6 Task 2 (DSG-03 / VALIDATION 07-06-03)
 *
 * Validates the FINANCIAL workstream's 12-question / 5-category driver Q&A discipline:
 *   - design-prompts.md and templates/drivers.md mention all 5 driver categories
 *     (revenue / cost / customer / capital / time)
 *   - templates/drivers.md schema lists 12 named drivers (one row per question)
 *   - Each category-keyword group is represented at least once in design-prompts.md
 *   - Workstream loads via workstream-loader without throwing
 *
 * Pitfall #6 mitigation: drivers come from the user, NOT LLM imagination — the
 * workflow's Q&A surface (design.md Step 4.5 in Plan 06 Task 3) collects them.
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SPEC = path.join(__dirname, '..', 'brief', 'workstreams', 'financial', 'spec.yaml');
const DESIGN_PROMPTS = path.join(__dirname, '..', 'brief', 'workstreams', 'financial', 'design-prompts.md');
const ARTIFACT = path.join(__dirname, '..', 'brief', 'workstreams', 'financial', 'templates', 'artifact.md');
const DRIVERS = path.join(__dirname, '..', 'brief', 'workstreams', 'financial', 'templates', 'drivers.md');

test('FINANCIAL spec.yaml has 7 required fields (Phase 2 D-13 + Phase 7 D-13)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  for (const f of ['name', 'description', 'research_prompts', 'design_prompts',
                   'output_artifact_template', 'gates_required', 'depends_on']) {
    assert.match(yaml, new RegExp('^' + f + ':', 'm'),
      `FINANCIAL spec.yaml missing required field: ${f}`);
  }
});

test('FINANCIAL spec.yaml gates_required defaults to [align, audience, compliance] (D-10)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /gates_required:\s*\[align,\s*audience,\s*compliance\]/);
});

test('FINANCIAL spec.yaml depends_on includes business-model-canvas + go-to-market (D-07 soft order)', () => {
  const yaml = fs.readFileSync(SPEC, 'utf8');
  assert.match(yaml, /depends_on:\s*\[business-model-canvas,\s*go-to-market\]/);
});

test('FINANCIAL design-prompts.md mentions all 5 driver categories (revenue / cost / customer / capital / time)', () => {
  const dp = fs.readFileSync(DESIGN_PROMPTS, 'utf8');
  // category 1: revenue keywords
  assert.match(dp, /revenue|ARPU|arpu/i, 'FINANCIAL design-prompts.md missing revenue category keywords');
  // category 2: cost keywords
  assert.match(dp, /cost|CAC|fixed|variable/i, 'FINANCIAL design-prompts.md missing cost category keywords');
  // category 3: customer keywords
  assert.match(dp, /customer|lifetime|churn/i, 'FINANCIAL design-prompts.md missing customer category keywords');
  // category 4: capital keywords
  assert.match(dp, /capital|cash|funding|gross margin/i, 'FINANCIAL design-prompts.md missing capital category keywords');
  // category 5: time keywords
  assert.match(dp, /seasonality|payment terms|month/i, 'FINANCIAL design-prompts.md missing time category keywords');
});

test('FINANCIAL templates/drivers.md schema has all 5 category sections', () => {
  const drv = fs.readFileSync(DRIVERS, 'utf8');
  for (const cat of ['Revenue', 'Customer', 'Cost', 'Capital', 'Time']) {
    assert.match(drv, new RegExp('^## ' + cat, 'm'),
      `FINANCIAL drivers.md missing section: ${cat}`);
  }
});

test('FINANCIAL templates/drivers.md has 12 named driver rows across 5 sections', () => {
  const drv = fs.readFileSync(DRIVERS, 'utf8');
  // The 12 canonical driver names per 07-RESEARCH.md lines 770-833
  const drivers = [
    'revenue_unit_anchor', 'arpu_year1', 'cac',
    'customer_lifetime_months', 'initial_customer_count',
    'fixed_monthly_cost', 'variable_cost_per_customer', 'hiring_plan',
    'starting_cash', 'target_gross_margin_pct',
    'payment_terms', 'seasonality',
  ];
  for (const d of drivers) {
    assert.match(drv, new RegExp(d),
      `FINANCIAL drivers.md missing canonical driver: ${d}`);
  }
});

test('FINANCIAL templates/drivers.md mentions reporting_currency (Q12b time category)', () => {
  const drv = fs.readFileSync(DRIVERS, 'utf8');
  assert.match(drv, /reporting_currency/, 'drivers.md must include reporting_currency driver (Q12b)');
});

test('FINANCIAL loads via workstream-loader without throwing', () => {
  const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');
  const all = loadWorkstreams(process.cwd());
  const fin = all.find(w => w.slug === 'financial');
  assert.ok(fin, 'FINANCIAL workstream must be discoverable via loadWorkstreams()');
  assert.strictEqual(fin.name, 'financial');
  assert.ok(Array.isArray(fin.gates_required));
  assert.deepStrictEqual([...fin.gates_required].sort(),
    ['align', 'audience', 'compliance'].sort());
  assert.ok(Array.isArray(fin.depends_on));
  assert.deepStrictEqual([...fin.depends_on].sort(),
    ['business-model-canvas', 'go-to-market'].sort());
});
