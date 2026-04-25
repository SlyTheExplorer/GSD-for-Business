/**
 * brief-compliance-sibling-path.test.cjs — Plan 07-01 Task 2.
 *
 * Asserts that compliance.cjs `siblingReportPath`:
 *   1. Returns the correct paired-sibling path for the 'compliance' suffix
 *      (`/x/canvas.md` → `/x/canvas.compliance.md`).
 *   2. Is the IDENTICAL function exported by audience.cjs — no fork, no
 *      duplication. compliance.cjs re-exports the canonical helper per
 *      gap-detect.cjs precedent (07-RESEARCH.md §canonical pattern).
 *
 * Reference: 07-01-PLAN.md Task 2 acceptance criterion.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const compliance = require('../brief/bin/lib/compliance.cjs');
const audience = require('../brief/bin/lib/audience.cjs');

test('siblingReportPath derives canvas.md → canvas.compliance.md', () => {
  assert.strictEqual(
    compliance.siblingReportPath('/tmp/canvas.md', 'compliance'),
    '/tmp/canvas.compliance.md',
  );
});

test('siblingReportPath derives nested-path artifact correctly', () => {
  assert.strictEqual(
    compliance.siblingReportPath('/Users/x/.planning/workstreams/business-model-canvas/canvas.md', 'compliance'),
    '/Users/x/.planning/workstreams/business-model-canvas/canvas.compliance.md',
  );
});

test('siblingReportPath handles artifact path without .md extension', () => {
  // The helper's behavior: no .md → append .{suffix}.md straight.
  // This matches the audience.cjs precedent (verified by reference equality below).
  const fromCompliance = compliance.siblingReportPath('/tmp/foo', 'compliance');
  const fromAudience = audience.siblingReportPath('/tmp/foo', 'compliance');
  assert.strictEqual(fromCompliance, fromAudience);
});

test('compliance.siblingReportPath === audience.siblingReportPath (function-identity check)', () => {
  // gap-detect.cjs precedent: re-export the canonical helper from audience.cjs
  // rather than fork. The exact same function reference must be exported.
  assert.strictEqual(
    compliance.siblingReportPath,
    audience.siblingReportPath,
    'compliance.cjs must re-export audience.cjs siblingReportPath (no fork) — gap-detect.cjs precedent',
  );
});

test('siblingReportPath produces sibling in SAME directory as artifact', () => {
  const result = compliance.siblingReportPath('/foo/bar/baz.md', 'compliance');
  assert.strictEqual(result, '/foo/bar/baz.compliance.md');
  // Same directory as input artifact:
  const path = require('path');
  assert.strictEqual(path.dirname(result), '/foo/bar');
});
