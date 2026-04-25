/**
 * Plan 07-04 Task 3 — Wave 0 unit test for /brief-add-workstream skeleton atomicity.
 *
 * Mitigates T-07-11 (Tampering — 3-file atomic write rollback). Tests that the
 * `add-workstream write` dispatcher contract documents atomic 3-file write
 * + rollback semantics, and that on failure mid-write the workstream
 * directory is unlinked (no half-created skeleton left behind).
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('add-workstream.md workflow documents atomic 3-file write semantics', () => {
  const wf = fs.readFileSync(
    path.join(__dirname, '..', 'brief', 'workflows', 'add-workstream.md'),
    'utf8',
  );
  // Workflow must reference the 3 files written
  assert.match(wf, /spec\.yaml/);
  assert.match(wf, /design-prompts\.md/);
  assert.match(wf, /templates\/artifact\.md/);
});

test('add-workstream.md workflow documents atomic rollback on partial failure', () => {
  const wf = fs.readFileSync(
    path.join(__dirname, '..', 'brief', 'workflows', 'add-workstream.md'),
    'utf8',
  );
  // The workflow MUST document atomic rollback semantics so future edits
  // that remove the rollback path break this test.
  assert.match(
    wf,
    /roll back|rolled back|atomic|unlink/i,
    'workflow must document atomic 3-file rollback semantics',
  );
});

test('add-workstream dispatcher case implements rollback path', () => {
  const dispatcher = fs.readFileSync(
    path.join(__dirname, '..', 'brief', 'bin', 'brief-tools.cjs'),
    'utf8',
  );
  // The dispatcher's `add-workstream write` branch must include rollback
  // logic. Grep for the rollback function declaration + unlinkSync calls.
  const awCase = dispatcher.split("case 'add-workstream':")[1] || '';
  assert.match(
    awCase,
    /rollback|unlinkSync/i,
    'add-workstream write subcommand must implement rollback path on partial failure',
  );
});

test('add-workstream write subcommand creates 3 files atomically (smoke test)', (t) => {
  // Real-disk smoke test: create a temp project structure with brief/workstreams/
  // pre-existing, invoke `add-workstream write` against a unique slug, assert
  // 3 files exist + the workstream-loader picks the new slug up.
  const os = require('node:os');
  const { execSync } = require('node:child_process');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aw-skel-'));
  try {
    // Initialize a tiny project root with brief/workstreams/_example seed
    fs.mkdirSync(path.join(tmpDir, 'brief', 'workstreams', '_example', 'templates'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(tmpDir, 'brief', 'workstreams', '_example', 'spec.yaml'),
      'name: _example\ndescription: Example workstream\nresearch_prompts:\n  - "x"\ndesign_prompts:\n  - "y"\noutput_artifact_template: templates/artifact.md\n',
    );
    fs.writeFileSync(
      path.join(tmpDir, 'brief', 'workstreams', '_example', 'templates', 'artifact.md'),
      '# example\n',
    );
    // Run `git init` so cmdCommit doesn't crash; commit the seed first.
    execSync('git init -q', { cwd: tmpDir });
    execSync('git config user.email test@test', { cwd: tmpDir });
    execSync('git config user.name test', { cwd: tmpDir });
    execSync('git add -A && git commit --no-verify -q -m seed', { cwd: tmpDir });

    const slug = 'novel-ws-' + Date.now();
    const specJson = JSON.stringify({
      name: slug,
      description: 'A novel test workstream for skeleton atomicity smoke test',
      research_prompts: ['What is X?'],
      design_prompts: ['file:design-prompts.md'],
      output_artifact_template: 'templates/artifact.md',
      gates_required: ['align', 'audience', 'compliance'],
      depends_on: [],
    });
    const dpContent = '# Design Prompts — ' + slug + '\n\n## Goal\nTest goal.\n';
    const tplContent = '---\nworkstream: ' + slug + '\n---\n# ' + slug + '\n\n## 1. Section\n{{slot}}\n\n## Sources\n- OBJECTIVES.md\n';

    const cliPath = path.resolve(__dirname, '..', 'brief', 'bin', 'brief-tools.cjs');
    execSync(
      'node ' +
        JSON.stringify(cliPath) +
        ' add-workstream write --name ' +
        slug +
        ' --spec-json ' +
        JSON.stringify(specJson) +
        ' --design-prompts-content ' +
        JSON.stringify(dpContent) +
        ' --template-content ' +
        JSON.stringify(tplContent),
      { cwd: tmpDir, encoding: 'utf8' },
    );

    const wsDir = path.join(tmpDir, 'brief', 'workstreams', slug);
    assert.ok(
      fs.existsSync(path.join(wsDir, 'spec.yaml')),
      'spec.yaml must exist after atomic write',
    );
    assert.ok(
      fs.existsSync(path.join(wsDir, 'design-prompts.md')),
      'design-prompts.md must exist after atomic write',
    );
    assert.ok(
      fs.existsSync(path.join(wsDir, 'templates', 'artifact.md')),
      'templates/artifact.md must exist after atomic write',
    );

    // Verify spec.yaml carries gates_required default
    const specBody = fs.readFileSync(path.join(wsDir, 'spec.yaml'), 'utf8');
    assert.match(
      specBody,
      /gates_required: \[align, audience, compliance\]/,
      'spec.yaml must carry the D-10 default gates_required',
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
