'use strict';

/**
 * /brief-discover block gate — Plan 03-05 (DEF-05, D-12, Pitfall 5).
 *
 * Covers:
 *   1. Incomplete OBJECTIVES.md missing compliance_packs → non-zero exit
 *      + Korean recovery-oriented block-gate message.
 *   2. Complete OBJECTIVES.md → exit 0 + Phase 5 placeholder.
 *   3. Missing OBJECTIVES.md file entirely → non-zero exit + distinct Korean
 *      "OBJECTIVES.md 파일이 아직 없습니다" message.
 *
 * W-6 guard: the failing path must NOT leak the English substring
 * `validation failed` to stderr. cmdValidate uses `process.exit(1)` directly
 * after writing the Korean block-gate — no core.error() call that would emit
 * English developer terminology.
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProject, cleanup, runGsdTools } = require('./helpers.cjs');
const objectives = require('../brief/bin/lib/objectives.cjs');

describe('/brief-discover block gate (DEF-05, D-12, Pitfall 5)', () => {
  let tmpDir;

  beforeEach(() => { tmpDir = createTempProject(); });
  afterEach(() => { cleanup(tmpDir); });

  test('Missing compliance_packs → exit non-zero + Korean recovery-oriented message', () => {
    const objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    // Seed OBJECTIVES.md with all required fields EXCEPT compliance_packs.
    fs.writeFileSync(objPath,
`---
brief_objectives_version: "1.0"
status: ready
mode: greenfield
business_model: b2c
region: kr
audience_policy: internal
immutable_items:
  - creator-identity
  - core-value
  - problem-statement
---

# OBJECTIVES

## Immutable Intent

### Creator Identity
seed

### Core Value
seed

### Problem Statement
seed
`);
    const r = runGsdTools(['discover'], tmpDir);
    assert.ok(!r.success, `expected non-zero exit, got success=${r.success}`);

    const combined = (r.output || '') + (r.error || '');
    assert.match(combined, /⚠/, 'warning glyph present');
    assert.match(combined, /compliance_packs/, 'missing field named');
    assert.match(combined, /\/brief-define --amend/, 'recovery command present');
    assert.match(combined, /그대로 남아있습니다/, 'Korean content-preservation reassurance');

    // Pitfall 5 guards:
    assert.doesNotMatch(combined, /ERROR:/, 'no dev-terminology ERROR: prefix');
    assert.doesNotMatch(combined, /\['compliance_packs'\]/,
      'no Python-list-syntax squares around missing field');

    // W-6 guard: no English `validation failed` leakage (case-insensitive).
    assert.doesNotMatch(combined, /validation failed/i,
      'W-6: no English `validation failed` phrase in stderr output');
  });

  test('Complete OBJECTIVES.md → exit 0 + Phase 5 placeholder', () => {
    objectives.writeObjectivesMd(tmpDir, {
      frontmatter: {
        brief_objectives_version: '1.0',
        status: 'ready',
        mode: 'greenfield',
        business_model: 'b2c',
        region: 'kr',
        audience_policy: 'internal',
        compliance_packs: ['PIPA', 'ISMS-P', 'MyData'],
        immutable_items: ['creator-identity', 'core-value', 'problem-statement'],
        'creator-identity': 'seed',
        'core-value': 'seed',
        'problem-statement': 'seed',
      },
      body: {
        immutable: { 'creator-identity': 'seed', 'core-value': 'seed', 'problem-statement': 'seed' },
        mutable: {},
      },
    }, { unlockIntent: false });

    const r = runGsdTools(['discover'], tmpDir);
    assert.ok(r.success, `expected success, got output=${r.output} error=${r.error}`);
    const combined = r.output + (r.error || '');
    assert.match(combined, /Phase 5/, 'Phase 5 reference present');
    assert.match(combined, /coming in Phase 5/i, 'Phase 5 placeholder text present');
  });

  test('Missing OBJECTIVES.md entirely → distinct file-absent message + non-zero exit', () => {
    // No seed — tmpDir has no OBJECTIVES.md
    const r = runGsdTools(['discover'], tmpDir);
    assert.ok(!r.success, `expected non-zero exit, got success=${r.success}`);
    const combined = (r.output || '') + (r.error || '');
    assert.match(combined, /OBJECTIVES\.md 파일이 아직 없습니다/,
      'file-absent path emits dedicated Korean message');

    // W-6 guard applies to file-absent path too.
    assert.doesNotMatch(combined, /validation failed/i,
      'W-6: no English `validation failed` phrase in file-absent stderr');
  });
});
