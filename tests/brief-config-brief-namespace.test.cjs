'use strict';

/**
 * config.json `brief.*` namespace merge semantics (DEF-04, Plan 03-04).
 *
 * writeConfigBrief extends `.planning/config.json` with a new `brief` key
 * carrying the 4 inferred configs (business_model, region, audience_policy,
 * compliance_packs) WITHOUT clobbering any pre-existing top-level key.
 *
 * Uses Shared Pattern 3 from PATTERNS.md: read-merge-write under
 * withPlanningLock. Relies on the baseline config seed from
 * createTempProjectWithConfig (B-2) so assertions on preservation of
 * model_profile / workflow / mode / granularity have a real source.
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProjectWithConfig, cleanup } = require('./helpers.cjs');
const { writeConfigBrief } = require('../brief/bin/lib/define.cjs');

describe('config.json brief.* namespace merge (DEF-04)', () => {
  let tmpDir;
  let configPath;

  beforeEach(() => {
    tmpDir = createTempProjectWithConfig();
    configPath = path.join(tmpDir, '.planning', 'config.json');
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('writeConfigBrief merges brief.* under config.json preserving all existing keys', () => {
    writeConfigBrief(tmpDir, {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
    });
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.deepStrictEqual(cfg.brief, {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
    });
    // createTempProjectWithConfig seeds baseline config.json with these keys;
    // confirm they survived the merge.
    assert.strictEqual(cfg.model_profile, 'quality', 'model_profile untouched');
    assert.ok(cfg.workflow, 'workflow block present');
    assert.strictEqual(
      cfg.workflow.nyquist_validation,
      true,
      'workflow.nyquist_validation untouched',
    );
    assert.strictEqual(
      cfg.workflow.text_mode,
      false,
      'workflow.text_mode untouched',
    );
    assert.strictEqual(cfg.mode, 'interactive', 'mode untouched');
    assert.strictEqual(cfg.granularity, 'fine', 'granularity untouched');
    assert.strictEqual(cfg.commit_docs, true, 'commit_docs untouched');
  });

  test('Second writeConfigBrief merges additional brief.* keys without dropping earlier ones', () => {
    writeConfigBrief(tmpDir, {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA'],
    });
    writeConfigBrief(tmpDir, { compliance_packs: [] });
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.strictEqual(
      cfg.brief.business_model,
      'b2c',
      'earlier business_model preserved',
    );
    assert.strictEqual(cfg.brief.region, 'kr', 'earlier region preserved');
    assert.strictEqual(
      cfg.brief.audience_policy,
      'internal',
      'earlier audience_policy preserved',
    );
    assert.deepStrictEqual(
      cfg.brief.compliance_packs,
      [],
      'compliance_packs overridden on second call',
    );
  });

  test('writeConfigBrief on non-existent config.json creates it with only brief.*', () => {
    // Delete the seeded config.json to simulate a fresh project.
    fs.unlinkSync(configPath);
    writeConfigBrief(tmpDir, {
      business_model: 'b2b',
      region: 'us',
      audience_policy: 'partner',
      compliance_packs: [],
    });
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert.deepStrictEqual(cfg.brief, {
      business_model: 'b2b',
      region: 'us',
      audience_policy: 'partner',
      compliance_packs: [],
    });
    // Only key present should be `brief` (since config started empty).
    assert.deepStrictEqual(Object.keys(cfg), ['brief']);
  });

  test('writeConfigBrief returns { updated: true, brief: <merged> }', () => {
    const r = writeConfigBrief(tmpDir, {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA'],
    });
    assert.strictEqual(r.updated, true);
    assert.deepStrictEqual(r.brief, {
      business_model: 'b2c',
      region: 'kr',
      audience_policy: 'internal',
      compliance_packs: ['PIPA'],
    });
  });
});
