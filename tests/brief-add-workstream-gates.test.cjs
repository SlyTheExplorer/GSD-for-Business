/**
 * Plan 07-04 Task 3 — Wave 0 unit test for /brief-add-workstream gates_required default
 * + 7-required-fields schema (Phase 7 D-10 + D-13).
 *
 * Mitigates T-07-12 (Spoofing — gates_required default). Tests:
 *   - workflow's spec.yaml template carries `gates_required: [align, audience, compliance]`
 *     (Phase 7 D-10 default — locked literal)
 *   - workflow's spec.yaml template includes all 7 D-13 required fields
 *   - dispatcher write subcommand defaults gates_required when caller omits it
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const WF_PATH = path.join(REPO_ROOT, 'brief', 'workflows', 'add-workstream.md');
const DISPATCHER_PATH = path.join(REPO_ROOT, 'brief', 'bin', 'brief-tools.cjs');

test('add-workstream.md workflow generates spec.yaml with gates_required default [align, audience, compliance] (D-10)', () => {
  const wf = fs.readFileSync(WF_PATH, 'utf8');
  // Workflow must reference the 3-gate default explicitly — locked literal.
  // Future edits removing this default fail this test (T-07-12 mitigation).
  assert.match(
    wf,
    /gates_required:\s*\[align,\s*audience,\s*compliance\]/,
    'workflow MUST carry the D-10 default gates_required literal',
  );
});

test('add-workstream.md Step 4 spec.yaml template includes 7 required fields (D-13)', () => {
  const wf = fs.readFileSync(WF_PATH, 'utf8');
  // Phase 7 D-13: 5 inherited (Phase 2) + 2 new (Phase 7) = 7 required fields.
  for (const field of [
    'name',
    'description',
    'research_prompts',
    'design_prompts',
    'output_artifact_template',
    'gates_required',
    'depends_on',
  ]) {
    assert.match(
      wf,
      new RegExp('\\b' + field + '\\b'),
      'Step 4 spec.yaml template missing field: ' + field,
    );
  }
});

test('add-workstream dispatcher locks gates_required default when caller omits it', () => {
  const dispatcher = fs.readFileSync(DISPATCHER_PATH, 'utf8');
  // The dispatcher's `add-workstream write` branch has a defensive lock that
  // backfills `[align, audience, compliance]` when `spec.gates_required` is
  // missing or empty (T-07-12 defense in depth).
  const awCase = dispatcher.split("case 'add-workstream':")[1] || '';
  assert.match(
    awCase,
    /\[\s*['"]?align['"]?\s*,\s*['"]?audience['"]?\s*,\s*['"]?compliance['"]?\s*\]/,
    'dispatcher must defensively lock the D-10 gates_required default',
  );
});

test('add-workstream dispatcher emits gates_required in spec.yaml output', () => {
  // Smoke test: write a spec.yaml without gates_required in the input JSON;
  // the dispatcher's emitYaml MUST backfill the default.
  const os = require('node:os');
  const { execSync } = require('node:child_process');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-gates-'));
  try {
    fs.mkdirSync(path.join(tmpDir, 'brief', 'workstreams'), { recursive: true });
    execSync('git init -q', { cwd: tmpDir });
    execSync('git config user.email t@t', { cwd: tmpDir });
    execSync('git config user.name t', { cwd: tmpDir });
    // Need at least one commit for git to be ready; create a placeholder.
    fs.writeFileSync(path.join(tmpDir, 'README.md'), '# seed\n');
    execSync('git add -A && git commit --no-verify -q -m seed', { cwd: tmpDir });

    const slug = 'gates-smoke-' + Date.now();
    // Note: spec-json INTENTIONALLY omits gates_required to test the default
    const specJson = JSON.stringify({
      description: 'gates smoke test description',
      research_prompts: ['x'],
      design_prompts: ['file:design-prompts.md'],
      output_artifact_template: 'templates/artifact.md',
      depends_on: [],
    });
    execSync(
      'node ' +
        JSON.stringify(path.join(REPO_ROOT, 'brief', 'bin', 'brief-tools.cjs')) +
        ' add-workstream write --name ' +
        slug +
        ' --spec-json ' +
        JSON.stringify(specJson) +
        ' --design-prompts-content "# Design\n" --template-content "---\nworkstream: ' +
        slug +
        '\n---\n# t\n"',
      { cwd: tmpDir, encoding: 'utf8' },
    );

    const written = fs.readFileSync(
      path.join(tmpDir, 'brief', 'workstreams', slug, 'spec.yaml'),
      'utf8',
    );
    assert.match(
      written,
      /gates_required: \[align, audience, compliance\]/,
      'emitted spec.yaml MUST carry D-10 gates_required default even when caller omits it: ' +
        written,
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
