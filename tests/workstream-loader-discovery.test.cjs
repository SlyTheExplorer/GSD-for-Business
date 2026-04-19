/**
 * workstream-loader discovery + yaml-mini tests (FND-08 / Phase 2 Plan 5)
 *
 * Covers:
 *   - End-to-end discovery of brief/workstreams/_example in the real repo tree
 *   - FND-08 success criterion: a second workstream dir is picked up WITHOUT
 *     any .cjs source change
 *   - yaml-mini scalar / list / nested-map parsing
 *   - Prototype pollution guard (T-02-05-01)
 *   - Missing brief/workstreams/ graceful handling
 *   - Dotfile-directory skip (Pitfall 3 guard)
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProject, cleanup } = require('./helpers.cjs');
const { loadWorkstreams } = require('../brief/bin/lib/workstream-loader.cjs');
const { parseYamlDocument } = require('../brief/bin/lib/yaml-mini.cjs');

describe('workstream-loader discovery + yaml-mini (FND-08)', () => {
  let tmpDir;
  beforeEach(() => { tmpDir = createTempProject(); });
  afterEach(() => cleanup(tmpDir));

  test('loads _example workstream from real project tree', () => {
    const specs = loadWorkstreams(process.cwd());
    const example = specs.find(s => s.slug === '_example');
    assert.ok(example, '_example workstream must be discovered');
    assert.strictEqual(example.name, '_example');
    assert.ok(Array.isArray(example.research_prompts));
    assert.ok(example.research_prompts.length >= 2,
      'research_prompts must have at least 2 entries per FND-08 fixture');
    assert.ok(Array.isArray(example.design_prompts));
    assert.ok(example.design_prompts.length >= 1);
    assert.strictEqual(example.output_artifact_template, 'templates/artifact.md');
  });

  test('adding a second workstream dir beyond _example is picked up without .cjs change (FND-08 success criterion)', () => {
    const wsEx = path.join(tmpDir, 'brief', 'workstreams', '_example');
    fs.mkdirSync(path.join(wsEx, 'templates'), { recursive: true });
    fs.writeFileSync(
      path.join(wsEx, 'spec.yaml'),
      'name: _example\n' +
      'description: demo\n' +
      'research_prompts:\n' +
      '  - "r1"\n' +
      '  - "r2"\n' +
      'design_prompts:\n' +
      '  - "d1"\n' +
      'output_artifact_template: templates/artifact.md\n'
    );
    fs.writeFileSync(
      path.join(wsEx, 'templates', 'artifact.md'),
      '---\naudience: internal\n---\n\n# Ex\n'
    );

    const wsBeta = path.join(tmpDir, 'brief', 'workstreams', 'beta');
    fs.mkdirSync(path.join(wsBeta, 'templates'), { recursive: true });
    fs.writeFileSync(
      path.join(wsBeta, 'spec.yaml'),
      'name: beta\n' +
      'description: second workstream\n' +
      'research_prompts:\n' +
      '  - "r1"\n' +
      '  - "r2"\n' +
      'design_prompts:\n' +
      '  - "d1"\n' +
      'output_artifact_template: templates/artifact.md\n'
    );
    fs.writeFileSync(
      path.join(wsBeta, 'templates', 'artifact.md'),
      '---\naudience: internal\n---\n\n# Beta\n'
    );

    const specs = loadWorkstreams(tmpDir);
    assert.strictEqual(specs.length, 2, 'both workstream dirs must be discovered');
    assert.deepStrictEqual(
      specs.map(s => s.slug).sort(),
      ['_example', 'beta'],
      'slugs must match the directory names'
    );
  });

  test('parseYamlDocument handles string, number, boolean, null, block list, inline list, nested map', () => {
    const yaml = [
      'key: value',
      'quoted: "hello"',
      'num: 42',
      'floatnum: 3.14',
      'flag: true',
      'falseflag: false',
      'nothing: null',
      'tildenull: ~',
      'list:',
      '  - one',
      '  - two',
      'inline: [a, b, c]',
      'nested:',
      '  level2:',
      '    level3: deep',
    ].join('\n');
    const parsed = parseYamlDocument(yaml);
    assert.strictEqual(parsed.key, 'value');
    assert.strictEqual(parsed.quoted, 'hello');
    assert.strictEqual(parsed.num, 42);
    assert.strictEqual(parsed.floatnum, 3.14);
    assert.strictEqual(parsed.flag, true);
    assert.strictEqual(parsed.falseflag, false);
    assert.strictEqual(parsed.nothing, null);
    assert.strictEqual(parsed.tildenull, null);
    assert.deepStrictEqual(parsed.list, ['one', 'two']);
    assert.deepStrictEqual(parsed.inline, ['a', 'b', 'c']);
    assert.strictEqual(parsed.nested.level2.level3, 'deep');
  });

  test('parseYamlDocument rejects __proto__ key (prototype pollution guard T-02-05-01)', () => {
    const hostile = '__proto__:\n  polluted: true\nname: test\n';
    assert.throws(
      () => parseYamlDocument(hostile),
      /__proto__|reserved|prototype/i
    );
  });

  test('parseYamlDocument rejects constructor key (prototype pollution guard T-02-05-01)', () => {
    const hostile = 'constructor:\n  evil: true\n';
    assert.throws(
      () => parseYamlDocument(hostile),
      /constructor|reserved|prototype/i
    );
  });

  test('parseYamlDocument result has null prototype (no inherited keys)', () => {
    const yaml = 'name: ok\n';
    const parsed = parseYamlDocument(yaml);
    assert.strictEqual(Object.getPrototypeOf(parsed), null,
      'parser result must use Object.create(null) to prevent prototype pollution');
  });

  test('loader returns empty array when brief/workstreams/ does not exist', () => {
    const specs = loadWorkstreams(tmpDir);
    assert.deepStrictEqual(specs, []);
  });

  test('loader skips dotfile directories (Pitfall 3 guard)', () => {
    const wsDot = path.join(tmpDir, 'brief', 'workstreams', '.DS_Store');
    fs.mkdirSync(wsDot, { recursive: true });
    fs.writeFileSync(
      path.join(wsDot, 'spec.yaml'),
      'name: .DS_Store\ndescription: hostile\n'
    );

    const specs = loadWorkstreams(tmpDir);
    assert.strictEqual(specs.length, 0,
      'dotfile directories must be skipped even when spec.yaml exists inside');
  });

  test('loader skips directories that lack spec.yaml (permits WIP dirs)', () => {
    const wip = path.join(tmpDir, 'brief', 'workstreams', 'wip');
    fs.mkdirSync(wip, { recursive: true });
    // no spec.yaml — planner is still drafting

    const specs = loadWorkstreams(tmpDir);
    assert.strictEqual(specs.length, 0,
      'directories without spec.yaml must be silently skipped, not errored');
  });
});
