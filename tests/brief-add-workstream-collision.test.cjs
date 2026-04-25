/**
 * Plan 07-04 Task 3 — Wave 0 unit test for /brief-add-workstream collision + role-overlap
 * detection.
 *
 * Mitigates T-07-10 (Tampering — name collision check). Tests:
 *   - check-collision BLOCKs on existing slug (_example baseline + canonical alias BMC)
 *   - check-collision passes on novel slug
 *   - check-overlap detects > 50% word-set overlap with existing description
 *   - workflow documents the BLOCK error message in user-facing prose
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CLI = path.join(REPO_ROOT, 'brief', 'bin', 'brief-tools.cjs');

test('check-collision BLOCKs on existing slug (_example baseline)', () => {
  const out = execSync('node ' + JSON.stringify(CLI) + ' add-workstream check-collision --name _example', {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const result = JSON.parse(out);
  assert.strictEqual(result.collides, true, 'existing _example must collide');
  assert.strictEqual(result.existing_slug, '_example');
});

test('check-collision BLOCKs on canonical alias (BMC → business-model-canvas)', () => {
  const out = execSync('node ' + JSON.stringify(CLI) + ' add-workstream check-collision --name BMC', {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  const result = JSON.parse(out);
  assert.strictEqual(result.collides, true, 'BMC alias must resolve to business-model-canvas and collide');
  assert.strictEqual(result.existing_slug, 'business-model-canvas');
});

test('check-collision passes on novel slug', () => {
  const novel = 'brand-new-xyz-' + Date.now();
  const out = execSync(
    'node ' + JSON.stringify(CLI) + ' add-workstream check-collision --name ' + novel,
    { cwd: REPO_ROOT, encoding: 'utf8' },
  );
  const result = JSON.parse(out);
  assert.strictEqual(result.collides, false, 'novel slug must not collide');
});

test('check-overlap detects > 50% word-set overlap with existing description (_example baseline)', () => {
  // _example's actual description: "Example workstream proving the loader picks up
  // a spec.yaml without code changes (FND-08 acceptance demo; Phase 7 replaces this
  // with real workstreams)."
  // Overlapping description re-uses the load-bearing tokens.
  const overlapDesc = 'Example workstream proving the loader picks up a spec yaml without code changes';
  const out = execSync(
    'node ' +
      JSON.stringify(CLI) +
      ' add-workstream check-overlap --name new-example --description ' +
      JSON.stringify(overlapDesc),
    { cwd: REPO_ROOT, encoding: 'utf8' },
  );
  const result = JSON.parse(out);
  assert.ok(
    result.overlap === true && Array.isArray(result.candidates) && result.candidates.includes('_example'),
    'must report overlap with _example: ' + out,
  );
});

test('check-overlap returns false on disjoint description', () => {
  // A genuinely unrelated description should not overlap with any existing
  // workstream's description.
  const disjointDesc = 'kgkfafd zwxy plumbus quirxnoz brrptpra wynnyx zyzzyx fnordling';
  const out = execSync(
    'node ' +
      JSON.stringify(CLI) +
      ' add-workstream check-overlap --name unique-name --description ' +
      JSON.stringify(disjointDesc),
    { cwd: REPO_ROOT, encoding: 'utf8' },
  );
  const result = JSON.parse(out);
  assert.strictEqual(result.overlap, false, 'disjoint description must not overlap');
  assert.deepStrictEqual(result.candidates, []);
});

test('add-workstream.md workflow contains BLOCK error message', () => {
  const wf = fs.readFileSync(
    path.join(REPO_ROOT, 'brief', 'workflows', 'add-workstream.md'),
    'utf8',
  );
  // BLOCK error message in Korean and English
  assert.match(wf, /이미 (이미 )?존재합니다|already exists/i, 'workflow must include "already exists" BLOCK error');
  assert.match(wf, /다른 이름|different name/i, 'workflow must instruct user to use a different name');
});

test('add-workstream.md workflow contains role-overlap fork-or-new prompt', () => {
  const wf = fs.readFileSync(
    path.join(REPO_ROOT, 'brief', 'workflows', 'add-workstream.md'),
    'utf8',
  );
  // The "extend or new" 2-branch prompt (D-11)
  assert.match(wf, /extend|확장/i, 'workflow must include extend-existing branch');
  assert.match(wf, /new workstream|새로운 workstream|진짜 새로운/i, 'workflow must include genuinely-new branch');
  assert.match(wf, /Cancel|취소/i, 'workflow must include cancel branch');
});
