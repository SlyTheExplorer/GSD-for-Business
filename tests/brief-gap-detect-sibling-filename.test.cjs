/**
 * brief-gap-detect-sibling-filename.test.cjs — Plan 06-04 Task 1.
 *
 * Locks the D-04 paired-sibling filename derivation for gap-detect:
 *   {artifact-dir}/{artifact-basename}.gaps.md
 *
 * Reuses siblingReportPath helper from audience.cjs (re-exported by
 * gap-detect.cjs). Asserts:
 *   - Standard .md path: business-model.md → business-model.gaps.md
 *   - Nested path under .planning/discover: market-sizing.md → market-sizing.gaps.md
 *   - Extensionless path: custom-topic → custom-topic.gaps.md
 *
 * Reference: 06-04-PLAN.md Task 1 behaviors 4-6.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { siblingReportPath } = require('../brief/bin/lib/gap-detect.cjs');

test('siblingReportPath: workstream nested path → .gaps.md sibling', () => {
  assert.equal(
    siblingReportPath('/tmp/.planning/workstreams/go-to-market/business-model.md', 'gaps'),
    '/tmp/.planning/workstreams/go-to-market/business-model.gaps.md',
  );
});

test('siblingReportPath: discover nested path → .gaps.md sibling', () => {
  assert.equal(
    siblingReportPath('/tmp/.planning/discover/market-sizing.md', 'gaps'),
    '/tmp/.planning/discover/market-sizing.gaps.md',
  );
});

test('siblingReportPath: extensionless artifact → .gaps.md sibling', () => {
  assert.equal(
    siblingReportPath('/tmp/.planning/discover/custom-topic', 'gaps'),
    '/tmp/.planning/discover/custom-topic.gaps.md',
  );
});

test('siblingReportPath: deep nested path retains directory structure', () => {
  assert.equal(
    siblingReportPath('/abs/repo/.planning/workstreams/financial/driver-model.md', 'gaps'),
    '/abs/repo/.planning/workstreams/financial/driver-model.gaps.md',
  );
});

test('siblingReportPath: handles paths with multiple dots before .md', () => {
  // Only the trailing .md extension is stripped. Inner dots are preserved.
  assert.equal(
    siblingReportPath('/a/b/file.v2.md', 'gaps'),
    '/a/b/file.v2.gaps.md',
  );
});
