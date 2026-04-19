/**
 * workstream-loader D-13 validation tests (FND-08 / Phase 2 Plan 5)
 *
 * Every D-13 rejection rule surfaces as a thrown Error (BRIEF convention).
 * Security mitigations tested:
 *   - T-02-05-02 Elevation of Privilege: directory-traversal on path fields
 *   - T-02-05-01 Tampering covered in discovery test
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProject, cleanup } = require('./helpers.cjs');
const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');

describe('workstream-loader validation (FND-08 D-13)', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = createTempProject(); });
  afterEach(() => cleanup(tmpDir));

  test('rejects spec where name does not match parent directory', () => {
    const wsDir = path.join(tmpDir, 'brief', 'workstreams', 'actualname');
    fs.mkdirSync(path.join(wsDir, 'templates'), { recursive: true });
    fs.writeFileSync(
      path.join(wsDir, 'spec.yaml'),
      'name: differentname\n' +
      'description: demo\n' +
      'research_prompts:\n  - "r1"\n' +
      'design_prompts:\n  - "d1"\n' +
      'output_artifact_template: templates/artifact.md\n'
    );
    fs.writeFileSync(path.join(wsDir, 'templates', 'artifact.md'), '# x\n');

    assert.throws(
      () => loadWorkstreams(tmpDir),
      /differentname.*actualname|actualname.*differentname/
    );
  });

  test('rejects spec missing output_artifact_template', () => {
    const wsDir = path.join(tmpDir, 'brief', 'workstreams', 'noartifact');
    fs.mkdirSync(wsDir, { recursive: true });
    fs.writeFileSync(
      path.join(wsDir, 'spec.yaml'),
      'name: noartifact\n' +
      'description: demo\n' +
      'research_prompts:\n  - "r1"\n' +
      'design_prompts:\n  - "d1"\n'
    );

    assert.throws(
      () => loadWorkstreams(tmpDir),
      /output_artifact_template/
    );
  });

  test('rejects spec where output_artifact_template path does not exist', () => {
    const wsDir = path.join(tmpDir, 'brief', 'workstreams', 'missingtpl');
    fs.mkdirSync(wsDir, { recursive: true });
    fs.writeFileSync(
      path.join(wsDir, 'spec.yaml'),
      'name: missingtpl\n' +
      'description: demo\n' +
      'research_prompts:\n  - "r1"\n' +
      'design_prompts:\n  - "d1"\n' +
      'output_artifact_template: templates/ghost.md\n'
    );

    assert.throws(
      () => loadWorkstreams(tmpDir),
      /ghost\.md|does not exist/
    );
  });

  test('rejects spec with directory-traversal output_artifact_template path (T-02-05-02)', () => {
    const wsDir = path.join(tmpDir, 'brief', 'workstreams', 'evil');
    fs.mkdirSync(wsDir, { recursive: true });
    fs.writeFileSync(
      path.join(wsDir, 'spec.yaml'),
      'name: evil\n' +
      'description: demo\n' +
      'research_prompts:\n  - "r1"\n' +
      'design_prompts:\n  - "d1"\n' +
      'output_artifact_template: ../../../etc/passwd\n'
    );

    assert.throws(
      () => loadWorkstreams(tmpDir),
      /outside workstream|directory traversal/i
    );
  });

  test('rejects spec with business_model_variants path that does not exist', () => {
    const wsDir = path.join(tmpDir, 'brief', 'workstreams', 'bmv');
    fs.mkdirSync(path.join(wsDir, 'templates'), { recursive: true });
    fs.writeFileSync(path.join(wsDir, 'templates', 'artifact.md'), '# x\n');
    fs.writeFileSync(
      path.join(wsDir, 'spec.yaml'),
      'name: bmv\n' +
      'description: demo\n' +
      'research_prompts:\n  - "r1"\n' +
      'design_prompts:\n  - "d1"\n' +
      'output_artifact_template: templates/artifact.md\n' +
      'business_model_variants:\n' +
      '  b2b: templates/missing-b2b.md\n'
    );

    assert.throws(
      () => loadWorkstreams(tmpDir),
      /b2b|missing-b2b|does not exist/
    );
  });

  test('rejects spec with directory-traversal business_model_variants path (T-02-05-02)', () => {
    const wsDir = path.join(tmpDir, 'brief', 'workstreams', 'bmvevil');
    fs.mkdirSync(path.join(wsDir, 'templates'), { recursive: true });
    fs.writeFileSync(path.join(wsDir, 'templates', 'artifact.md'), '# x\n');
    fs.writeFileSync(
      path.join(wsDir, 'spec.yaml'),
      'name: bmvevil\n' +
      'description: demo\n' +
      'research_prompts:\n  - "r1"\n' +
      'design_prompts:\n  - "d1"\n' +
      'output_artifact_template: templates/artifact.md\n' +
      'business_model_variants:\n' +
      '  b2b: ../../../etc/shadow\n'
    );

    assert.throws(
      () => loadWorkstreams(tmpDir),
      /outside workstream|directory traversal/i
    );
  });

  test('rejects spec missing research_prompts', () => {
    const wsDir = path.join(tmpDir, 'brief', 'workstreams', 'noresearch');
    fs.mkdirSync(path.join(wsDir, 'templates'), { recursive: true });
    fs.writeFileSync(path.join(wsDir, 'templates', 'artifact.md'), '# x\n');
    fs.writeFileSync(
      path.join(wsDir, 'spec.yaml'),
      'name: noresearch\n' +
      'description: demo\n' +
      'design_prompts:\n  - "d1"\n' +
      'output_artifact_template: templates/artifact.md\n'
    );

    assert.throws(
      () => loadWorkstreams(tmpDir),
      /research_prompts/
    );
  });

  test('rejects spec missing description', () => {
    const wsDir = path.join(tmpDir, 'brief', 'workstreams', 'nodesc');
    fs.mkdirSync(path.join(wsDir, 'templates'), { recursive: true });
    fs.writeFileSync(path.join(wsDir, 'templates', 'artifact.md'), '# x\n');
    fs.writeFileSync(
      path.join(wsDir, 'spec.yaml'),
      'name: nodesc\n' +
      'research_prompts:\n  - "r1"\n' +
      'design_prompts:\n  - "d1"\n' +
      'output_artifact_template: templates/artifact.md\n'
    );

    assert.throws(
      () => loadWorkstreams(tmpDir),
      /description/
    );
  });
});
