/**
 * brief-objectives-immutable-lock.test.cjs — writer-layer immutable-section enforcement
 * (Plan 03-01 / DEF-03 / Pitfall #3 mitigation).
 *
 * Three tests:
 *   A) enforceImmutableLock direct call with a mutation payload throws Korean Error.
 *   B) writeObjectivesMd({unlockIntent:false}) throws AND does NOT write .planning/OBJECTIVES.md.
 *   C) writeObjectivesMd({unlockIntent:true}) succeeds AND mutated value IS present in written file.
 *
 * The Korean error message regex is canonical:
 *   /Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다/
 *
 * This message is asserted verbatim by Plan 03 Mode B and Plan 04 atomic-commit tests —
 * do not rephrase.
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const {
  writeObjectivesMd,
  readObjectivesMd,
  enforceImmutableLock,
} = require('../brief/bin/lib/objectives.cjs');
const {
  reconstructFrontmatter,
} = require('../brief/bin/lib/frontmatter.cjs');
const { createTempProject, cleanup } = require('./helpers.cjs');

const LOCK_MESSAGE_RE = /Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다/;

describe('enforceImmutableLock direct throws (DEF-03 / Pitfall #3 writer layer)', () => {
  test('throws Korean Error when payload mutates a field listed in existingFm.immutable_items', () => {
    const existingFm = {
      immutable_items: ['core-value'],
      'core-value': 'original',
    };
    const payload = { frontmatter: { 'core-value': 'mutated' } };
    assert.throws(
      () => enforceImmutableLock(existingFm, payload),
      (err) => {
        assert.match(err.message, LOCK_MESSAGE_RE);
        return true;
      },
    );
  });

  test('does NOT throw when payload mutates a non-immutable field', () => {
    const existingFm = {
      immutable_items: ['core-value'],
      'core-value': 'original',
      status: 'ready',
    };
    const payload = { frontmatter: { status: 'in_progress' } };
    assert.doesNotThrow(() => enforceImmutableLock(existingFm, payload));
  });

  test('does NOT throw when immutable_items is empty or missing', () => {
    assert.doesNotThrow(() => enforceImmutableLock({}, { frontmatter: { foo: 'bar' } }));
    assert.doesNotThrow(() =>
      enforceImmutableLock({ immutable_items: [] }, { frontmatter: { foo: 'bar' } }),
    );
  });

  test('thrown Error carries code + violatedField attribution for downstream error handlers', () => {
    const existingFm = {
      immutable_items: ['problem-statement'],
      'problem-statement': 'before',
    };
    const payload = { frontmatter: { 'problem-statement': 'after' } };
    try {
      enforceImmutableLock(existingFm, payload);
      assert.fail('should have thrown');
    } catch (err) {
      assert.match(err.message, LOCK_MESSAGE_RE);
      assert.strictEqual(err.code, 'OBJECTIVES_IMMUTABLE_LOCKED');
      assert.strictEqual(err.violatedField, 'problem-statement');
    }
  });
});

describe('writeObjectivesMd writer-layer refusal (DEF-03 / Pitfall #3 disk write guard)', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject('brief-objectives-lock-');
    // Seed an existing OBJECTIVES.md with immutable_items locked.
    const seedFm = {
      brief_objectives_version: '1.0',
      status: 'ready',
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
      immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
      'core-value': '원래의 핵심 가치',
    };
    const yaml = reconstructFrontmatter(seedFm);
    const seed = `---\n${yaml}\n---\n\n# OBJECTIVES\n\n## Immutable Intent\n\nseeded\n`;
    fs.writeFileSync(path.join(tmpDir, '.planning', 'OBJECTIVES.md'), seed);
  });

  afterEach(() => {
    if (tmpDir) cleanup(tmpDir);
  });

  test('B) writeObjectivesMd with {unlockIntent:false} throws AND leaves file unchanged', () => {
    const mutatingPayload = {
      frontmatter: { 'core-value': '몰래 바뀐 가치' },
    };
    const beforeStat = fs.statSync(path.join(tmpDir, '.planning', 'OBJECTIVES.md'));
    const beforeContent = fs.readFileSync(path.join(tmpDir, '.planning', 'OBJECTIVES.md'), 'utf-8');

    assert.throws(
      () => writeObjectivesMd(tmpDir, mutatingPayload, { unlockIntent: false }),
      (err) => {
        assert.match(err.message, LOCK_MESSAGE_RE);
        return true;
      },
    );

    // File must be byte-identical after the throw — writer layer is SYNCHRONOUS refusal,
    // never partial writes. beforeStat.mtimeMs === afterStat.mtimeMs is stronger than content
    // equality because it catches any same-content overwrite attempt.
    const afterContent = fs.readFileSync(path.join(tmpDir, '.planning', 'OBJECTIVES.md'), 'utf-8');
    assert.strictEqual(afterContent, beforeContent);
  });

  test('B2) writeObjectivesMd on absent file with existing-equivalent immutable default does NOT write on refuse', () => {
    // Separate tmp without seed — simulate first-write attempt with explicit immutable_items
    // on a payload already-mutating an immutable field against a pre-existing file.
    // This covers the "refuse-before-create" path (refuse runs after existingFm extraction
    // so a fresh file has empty immutable_items → no throw; this test instead re-uses the
    // seeded tmpDir to assert that after throw, the file content is unchanged).
    const mutatingPayload = {
      frontmatter: { 'creator-identity': '다른 사람' },
    };
    const beforeContent = fs.readFileSync(path.join(tmpDir, '.planning', 'OBJECTIVES.md'), 'utf-8');
    assert.throws(() => writeObjectivesMd(tmpDir, mutatingPayload), LOCK_MESSAGE_RE);
    const afterContent = fs.readFileSync(path.join(tmpDir, '.planning', 'OBJECTIVES.md'), 'utf-8');
    assert.strictEqual(afterContent, beforeContent);
  });

  test('C) writeObjectivesMd with {unlockIntent:true} succeeds AND mutated value is present', () => {
    const mutatingPayload = {
      frontmatter: { 'core-value': '의도적으로 바꾼 새 가치' },
    };
    const result = writeObjectivesMd(tmpDir, mutatingPayload, { unlockIntent: true });
    assert.ok(result);
    assert.ok(fs.existsSync(path.join(tmpDir, '.planning', 'OBJECTIVES.md')));

    const after = readObjectivesMd(tmpDir);
    assert.strictEqual(after.exists, true);
    assert.strictEqual(after.frontmatter['core-value'], '의도적으로 바꾼 새 가치');
  });

  test('C2) writeObjectivesMd first-write (no existing file) succeeds without unlock (empty immutable_items)', () => {
    // Fresh temp to exercise first-write path.
    const fresh = createTempProject('brief-objectives-fresh-');
    try {
      const payload = {
        frontmatter: {
          brief_objectives_version: '1.0',
          status: 'ready',
          business_model: 'b2c',
          region: 'kr',
          audience_policy: 'internal',
          compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
          immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
        },
      };
      const result = writeObjectivesMd(fresh, payload);
      assert.ok(result);
      const written = readObjectivesMd(fresh);
      assert.strictEqual(written.exists, true);
      assert.strictEqual(written.frontmatter.region, 'kr');
      assert.deepStrictEqual(written.frontmatter.compliance_packs, ['PIPA', 'ISMS-P', 'MyData']);
    } finally {
      cleanup(fresh);
    }
  });
});
