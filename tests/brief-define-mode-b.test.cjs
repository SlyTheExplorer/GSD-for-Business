'use strict';

/**
 * Integration test for /brief-define Mode B amendment (Plan 03-03).
 *
 * Covers the D-07 immutable-lock + --unlock-intent escape contract through the
 * dispatcher-layer primitive `applyModeBAmendment`. The writer-layer lock
 * itself is already tested in tests/brief-objectives-immutable-lock.test.cjs;
 * this suite extends coverage to the dispatcher path Plan 03-03 introduces.
 *
 * Pitfall #3 mitigation — writer-layer refusal (Test A).
 * D-07 --unlock-intent escape + audit log emission (Test B).
 * Mutable-only edits unaffected by the lock (Test C — no audit noise).
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { createTempProject, cleanup } = require('./helpers.cjs');
const { extractFrontmatter } = require('../brief/bin/lib/frontmatter.cjs');
const objectives = require('../brief/bin/lib/objectives.cjs');
const define = require('../brief/bin/lib/define.cjs');

describe('/brief-define Mode B amendment (D-07, Pitfall #3 mitigation)', () => {
  let tmpDir;
  let objPath;
  let auditPath;

  beforeEach(() => {
    tmpDir = createTempProject();
    objPath = path.join(tmpDir, '.planning', 'OBJECTIVES.md');
    auditPath = path.join(tmpDir, '.planning', 'OBJECTIVES-UNLOCK-AUDIT.log');
    // Seed a complete OBJECTIVES.md via the Plan 01 writer.
    objectives.writeObjectivesMd(
      tmpDir,
      {
        frontmatter: {
          brief_objectives_version: '1.0',
          status: 'ready',
          mode: 'greenfield',
          immutable_items: [
            'creator-identity',
            'core-value',
            'problem-statement',
          ],
          'creator-identity': 'seed creator',
          'core-value': 'seed core value',
          'problem-statement': 'seed problem',
          business_model: 'b2c',
          region: 'kr',
          audience_policy: 'internal',
          compliance_packs: ['PIPA'],
        },
        body: {
          immutable: {
            'creator-identity': 'seed creator',
            'core-value': 'seed core value',
            'problem-statement': 'seed problem',
          },
          mutable: {},
        },
      },
      { unlockIntent: false },
    );
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('A — Mode B refuses immutable mutation WITHOUT --unlock-intent (writer-layer thrown, no audit log)', () => {
    const contentBefore = fs.readFileSync(objPath, 'utf-8');
    assert.throws(
      () =>
        define.applyModeBAmendment(
          tmpDir,
          ['target-audience'],
          { frontmatter: { 'core-value': 'MUTATED' } },
          { unlockIntent: false },
        ),
      /Immutable Intent 항목은 --unlock-intent 플래그 없이 수정할 수 없습니다/,
      'Korean error message raised with --unlock-intent callout',
    );
    const contentAfter = fs.readFileSync(objPath, 'utf-8');
    assert.strictEqual(
      contentAfter,
      contentBefore,
      'OBJECTIVES.md content unchanged after rejected write',
    );
    assert.ok(
      !fs.existsSync(auditPath),
      'no audit log created on rejected write',
    );
  });

  test('B — Mode B permits immutable mutation WITH --unlock-intent + writes audit log', () => {
    define.applyModeBAmendment(
      tmpDir,
      ['core-value'],
      { frontmatter: { 'core-value': 'MUTATED' } },
      { unlockIntent: true },
    );
    const fm = extractFrontmatter(fs.readFileSync(objPath, 'utf-8'));
    assert.strictEqual(
      fm['core-value'],
      'MUTATED',
      'immutable field updated when --unlock-intent supplied',
    );
    assert.ok(fs.existsSync(auditPath), 'audit log written on unlock event');
    const audit = fs.readFileSync(auditPath, 'utf-8').trim();
    assert.match(
      audit,
      /\d{4}-\d{2}-\d{2}T[\d:.]+Z\s+UNLOCK\s+core-value/,
      'audit log line format: <ISO8601> UNLOCK <field>',
    );
  });

  test('C — Mode B mutable-only edit without --unlock-intent succeeds; NO audit log', () => {
    define.applyModeBAmendment(
      tmpDir,
      ['target-audience'],
      { frontmatter: { 'target-audience': 'new audience text' } },
      { unlockIntent: false },
    );
    const fm = extractFrontmatter(fs.readFileSync(objPath, 'utf-8'));
    assert.strictEqual(
      fm['target-audience'],
      'new audience text',
      'mutable field updated without unlock',
    );
    assert.deepStrictEqual(
      fm.immutable_items,
      ['creator-identity', 'core-value', 'problem-statement'],
      'immutable_items list preserved unchanged on mutable-only edit',
    );
    assert.ok(
      !fs.existsSync(auditPath),
      'no audit log on mutable-only edit',
    );
  });

  test('D — Acceptance guard: brief/workflows/define.md contains >= 4 🔒 markers (Task 2 wiring)', () => {
    const workflowPath = path.resolve(
      __dirname,
      '..',
      'brief',
      'workflows',
      'define.md',
    );
    const content = fs.readFileSync(workflowPath, 'utf-8');
    const matches = content.match(/🔒/g) || [];
    assert.ok(
      matches.length >= 4,
      `workflow has only ${matches.length} 🔒 marker(s); expected >= 4 (picker header + 3 immutable items)`,
    );
  });
});
