/**
 * workstream-loader — discover and validate business-workstream YAML specs
 *
 * Sibling module to brief/bin/lib/workstream (which handles the DIFFERENT
 * parallel-milestone workstream concept under .planning/workstreams/). Per
 * Phase 2 Plan 5 / R-2, this loader MUST NOT import or extend that adjacent
 * module — they are different concepts with no shared consumer surface.
 *
 * Contract (D-11, D-13):
 *   loadWorkstreams(cwd) → WorkstreamSpec[]
 *     - Globs brief/workstreams/*\/spec.yaml
 *     - Parses each via yaml-mini.cjs
 *     - Validates required fields: name, description, research_prompts[],
 *       design_prompts[], output_artifact_template
 *     - Enforces: name === parent-dir, all referenced paths resolve WITHIN
 *       the workstream directory (T-02-05-02 directory-traversal guard)
 *     - Throws Error with workstream slug + rule on any violation
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseYamlDocument } = require('./yaml-mini.cjs');

function validatePathWithin(workstreamDir, rel, fieldLabel, slug) {
  const abs = path.resolve(workstreamDir, rel);
  const boundary = workstreamDir + path.sep;
  if (abs !== workstreamDir && !abs.startsWith(boundary)) {
    throw new Error(
      `Workstream "${slug}": ${fieldLabel} "${rel}" resolves outside workstream ` +
      `directory (directory traversal rejected — T-02-05-02)`
    );
  }
  if (!fs.existsSync(abs)) {
    throw new Error(
      `Workstream "${slug}": ${fieldLabel} "${rel}" does not exist`
    );
  }
}

function loadWorkstreams(cwd) {
  const root = path.join(cwd, 'brief', 'workstreams');
  if (!fs.existsSync(root)) return [];

  const entries = fs.readdirSync(root, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => e.name)
    .sort();

  const specs = [];
  for (const dir of entries) {
    const workstreamDir = path.join(root, dir);
    const specPath = path.join(workstreamDir, 'spec.yaml');
    if (!fs.existsSync(specPath)) continue;

    const content = fs.readFileSync(specPath, 'utf-8');
    const parsed = parseYamlDocument(content);

    // D-13 required-field validation
    if (parsed.name !== dir) {
      throw new Error(
        `Workstream "${dir}": name "${parsed.name}" does not match directory name "${dir}"`
      );
    }
    if (!parsed.description || typeof parsed.description !== 'string') {
      throw new Error(`Workstream "${dir}": missing required description`);
    }
    if (!Array.isArray(parsed.research_prompts) || parsed.research_prompts.length === 0) {
      throw new Error(
        `Workstream "${dir}": missing required research_prompts (non-empty list)`
      );
    }
    if (!Array.isArray(parsed.design_prompts) || parsed.design_prompts.length === 0) {
      throw new Error(
        `Workstream "${dir}": missing required design_prompts (non-empty list)`
      );
    }
    if (!parsed.output_artifact_template || typeof parsed.output_artifact_template !== 'string') {
      throw new Error(
        `Workstream "${dir}": missing required output_artifact_template`
      );
    }

    // Phase 7 D-13 extension: gates_required + depends_on (additive — Phase 2 D-13
    // 5-field validation above is preserved unchanged).
    //
    //   gates_required: array; each entry MUST be in VALID_GATES; default below.
    //   depends_on:     array of slug strings; forward-references allowed
    //                   (referenced workstream may not exist at load time;
    //                   resolution happens at /brief-status render time per D-07).
    const VALID_GATES = new Set(['align', 'audience', 'compliance']);
    if (parsed.gates_required !== undefined) {
      if (!Array.isArray(parsed.gates_required)) {
        throw new Error(
          `Workstream "${dir}": gates_required must be a list ` +
          `(got ${typeof parsed.gates_required})`
        );
      }
      for (const g of parsed.gates_required) {
        if (!VALID_GATES.has(g)) {
          throw new Error(
            `Workstream "${dir}": gates_required contains invalid gate "${g}" ` +
            `(valid: align, audience, compliance)`
          );
        }
      }
    }
    if (parsed.depends_on !== undefined) {
      if (!Array.isArray(parsed.depends_on)) {
        throw new Error(
          `Workstream "${dir}": depends_on must be a list of slugs ` +
          `(got ${typeof parsed.depends_on})`
        );
      }
      for (const slug of parsed.depends_on) {
        if (typeof slug !== 'string' || slug.length === 0) {
          throw new Error(
            `Workstream "${dir}": depends_on contains non-string entry`
          );
        }
        // Forward-references allowed per D-13: a depends_on entry may name a
        // workstream that has not yet been added. /brief-status render-time
        // derivation skips dangling deps gracefully.
      }
    }

    // T-02-05-02 directory-traversal + existence for output_artifact_template
    validatePathWithin(workstreamDir, parsed.output_artifact_template, 'output_artifact_template', dir);

    // Optional path fields — same validation
    if (parsed.business_model_variants && typeof parsed.business_model_variants === 'object') {
      for (const [variant, rel] of Object.entries(parsed.business_model_variants)) {
        if (typeof rel !== 'string') continue;
        validatePathWithin(workstreamDir, rel, `business_model_variants.${variant}`, dir);
      }
    }
    if (parsed.region_overrides && typeof parsed.region_overrides === 'object') {
      for (const [region, rel] of Object.entries(parsed.region_overrides)) {
        if (typeof rel !== 'string') continue;
        validatePathWithin(workstreamDir, rel, `region_overrides.${region}`, dir);
      }
    }

    // Emit spec object with slug prepended; parsed has null-prototype so copy
    // fields explicitly into a plain object for downstream predictability.
    const spec = { slug: dir };
    for (const k of Object.keys(parsed)) spec[k] = parsed[k];

    // Phase 7 D-13 + D-10 defaults (applied AFTER copy so explicit values win).
    if (spec.gates_required === undefined) {
      spec.gates_required = ['align', 'audience', 'compliance'];
    }
    if (spec.depends_on === undefined) {
      spec.depends_on = [];
    }

    specs.push(spec);
  }

  return specs;
}

module.exports = { loadWorkstreams };
