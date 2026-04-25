/**
 * BRIEF Phase 7 Plan 07 — workstream-loader.cjs Phase 7 D-13 extension tests
 *
 * Validates the additive extension to the Phase 2 D-13 5-field validator:
 *   - gates_required: subset of [align, audience, compliance]; defaults to all 3
 *   - depends_on:     array of slug strings; forward-references warn-not-throw
 *
 * Phase 2 D-13 5-field validation regression-preserved (existing _example loads).
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');

/**
 * Create a temporary brief/workstreams/<slug>/ directory with spec.yaml AND
 * the templates/x.md path it references (loader validates path existence).
 * Returns { tmp, wsDir } — caller is responsible for cleanup.
 */
function makeTmpWorkstream(slug, specYaml) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'wsl-ext-'));
  const wsDir = path.join(tmp, 'brief', 'workstreams', slug);
  fs.mkdirSync(path.join(wsDir, 'templates'), { recursive: true });
  fs.writeFileSync(path.join(wsDir, 'templates', 'x.md'), '# placeholder\n');
  fs.writeFileSync(path.join(wsDir, 'spec.yaml'), specYaml);
  return { tmp, wsDir };
}

test('Phase 2 D-13 5-field validation regression — built-in _example still loads', () => {
  const ws = loadWorkstreams(process.cwd());
  const example = ws.find(w => (w.slug || w.name) === '_example');
  assert.ok(example, '_example workstream still loadable after Phase 7 extension');
});

test('gates_required: valid subset [align, audience, compliance] accepted', () => {
  const { tmp } = makeTmpWorkstream('test-valid', `name: test-valid
description: "ok"
research_prompts: ["a"]
design_prompts: ["b"]
output_artifact_template: templates/x.md
gates_required: [align, audience, compliance]
`);
  try {
    const ws = loadWorkstreams(tmp);
    const t = ws.find(w => (w.slug || w.name) === 'test-valid');
    assert.ok(t, 'test-valid loaded');
    assert.deepStrictEqual(
      [...t.gates_required].sort(),
      ['align', 'audience', 'compliance'],
      'all 3 gates round-trip from explicit subset'
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('gates_required: invalid value "foo" throws with descriptive error', () => {
  const { tmp } = makeTmpWorkstream('test-bad-gate', `name: test-bad-gate
description: "ok"
research_prompts: ["a"]
design_prompts: ["b"]
output_artifact_template: templates/x.md
gates_required: [align, foo]
`);
  try {
    assert.throws(() => loadWorkstreams(tmp), /invalid gate "foo"/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('gates_required: non-array (string) throws', () => {
  const { tmp } = makeTmpWorkstream('test-not-array', `name: test-not-array
description: "ok"
research_prompts: ["a"]
design_prompts: ["b"]
output_artifact_template: templates/x.md
gates_required: align
`);
  try {
    assert.throws(() => loadWorkstreams(tmp), /gates_required must be a list/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('gates_required: defaults to [align, audience, compliance] when absent (D-10)', () => {
  const { tmp } = makeTmpWorkstream('test-default', `name: test-default
description: "ok"
research_prompts: ["a"]
design_prompts: ["b"]
output_artifact_template: templates/x.md
`);
  try {
    const ws = loadWorkstreams(tmp);
    const t = ws.find(w => (w.slug || w.name) === 'test-default');
    assert.ok(t, 'test-default loaded');
    assert.deepStrictEqual(
      [...t.gates_required].sort(),
      ['align', 'audience', 'compliance'],
      'gates_required defaults applied per D-10'
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('depends_on: valid array of strings accepted', () => {
  const { tmp } = makeTmpWorkstream('test-deps', `name: test-deps
description: "ok"
research_prompts: ["a"]
design_prompts: ["b"]
output_artifact_template: templates/x.md
depends_on: [bmc, gtm]
`);
  try {
    const ws = loadWorkstreams(tmp);
    const t = ws.find(w => (w.slug || w.name) === 'test-deps');
    assert.ok(t, 'test-deps loaded');
    assert.deepStrictEqual(t.depends_on, ['bmc', 'gtm']);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('depends_on: array of non-strings (numbers) throws', () => {
  const { tmp } = makeTmpWorkstream('test-bad-deps', `name: test-bad-deps
description: "ok"
research_prompts: ["a"]
design_prompts: ["b"]
output_artifact_template: templates/x.md
depends_on: [123]
`);
  try {
    assert.throws(() => loadWorkstreams(tmp), /depends_on contains non-string entry/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('depends_on: defaults to [] when absent', () => {
  const { tmp } = makeTmpWorkstream('test-nodeps', `name: test-nodeps
description: "ok"
research_prompts: ["a"]
design_prompts: ["b"]
output_artifact_template: templates/x.md
`);
  try {
    const ws = loadWorkstreams(tmp);
    const t = ws.find(w => (w.slug || w.name) === 'test-nodeps');
    assert.ok(t, 'test-nodeps loaded');
    assert.deepStrictEqual(t.depends_on, [], 'depends_on defaults to empty array');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('depends_on: forward-reference (non-existent workstream) does NOT throw — warn-not-throw per D-13', () => {
  const { tmp } = makeTmpWorkstream('test-fwd-ref', `name: test-fwd-ref
description: "ok"
research_prompts: ["a"]
design_prompts: ["b"]
output_artifact_template: templates/x.md
depends_on: [non-existent-future-workstream]
`);
  try {
    // Loader allows forward-refs: render-time derivation in /brief-status
    // skips dangling deps gracefully (per D-07 + D-13).
    assert.doesNotThrow(() => loadWorkstreams(tmp));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
