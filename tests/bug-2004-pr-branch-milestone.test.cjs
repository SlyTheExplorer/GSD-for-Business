/**
 * Regression tests for bug #2004
 *
 * /brief-pr-branch must not exclude milestone archive and structural planning
 * commits. The previous implementation filtered ALL .planning/-only commits,
 * including STATE.md, ROADMAP.md, MILESTONES.md, and milestones/** updates
 * that are needed to preserve repository planning state after a merge.
 *
 * Fixed: pr-branch.md now distinguishes:
 *   - Transient planning commits (phase plans, summaries, research, context) → EXCLUDE
 *   - Structural planning commits (STATE.md, ROADMAP.md, MILESTONES.md,
 *     PROJECT.md, milestones/**) → INCLUDE
 *   - Code commits (any non-.planning/ file) → INCLUDE
 *   - Mixed commits (code + planning) → INCLUDE
 */

'use strict';

// HRD-05a closure: pr-branch.md is a GSD milestone PR flow file intentionally absent in
// BRIEF v1 (FND-02 dev-surface removal). Not in LOCKED_12 lineup. All assertions removed
// per PATTERNS.md ALL-DELETE rubric (none tied to LOCKED_12). See
// .planning/HRD-05-CLOSURE-RATIONALE.md for the per-test triage record.

const { describe, test } = require('node:test');

describe.skip('bug #2004: pr-branch preserves structural planning commits — HRD-05a closure: pr-branch.md not in LOCKED_12', () => {
  test('removed: pr-branch.md is GSD-only and not in locked-12 lineup (HRD-05a closure)', () => {});
});
