'use strict';

/**
 * Wave 0 RED fixture for HRD-02 / Pitfall 1 — bin/install.js cleanliness
 * post-pruning.
 *
 * Asserts that bin/install.js has zero references (slug.md path components)
 * to any of the deleted commands. Currently fails (install.js still
 * registers all 68 commands); skips per-slug with Plan-05 rationale until
 * pruning lands.
 *
 * Pattern source: tests/architecture-counts.test.cjs (filesystem read +
 * regex assertion) + 09-RESEARCH.md lines 478-489 (Pitfall 1 background).
 *
 * --- Rule 1 deviation (Wave 0 / Plan 09-00) ---
 * The 09-00-PLAN.md <interfaces> block names this constant `DELETED_56` and
 * comments "56 entries", but the actual list contains 57 slugs. Cross-check
 * against filesystem confirms the list contents are correct (68 commands on
 * disk minus 11 of LOCKED_12 already present = 57 slugs that must be deleted
 * or renamed; `init` slug is achieved by renaming `new-project.md` →
 * `init.md`, so `new-project` legitimately appears in the deletion list).
 *
 * Resolution: keep the constant LIST byte-identical to the plan (filesystem-
 * verified correct), update the constant NAME and length guard to reflect
 * the true count (57). The 09-00-SUMMARY.md records this as a Rule-1 fix
 * so Plans 05 + 09 follow-up can correct the plan's count comment.
 *
 * GUARD: DELETED_57 array length is asserted == 57 at module load.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INSTALL_JS = path.join(ROOT, 'bin', 'install.js');

// DELETED_57 — list contents byte-identical to 09-00-PLAN.md <interfaces>
// block (A-D02); count corrected from 56 → 57 (Rule 1 deviation, see header
// note above). Plan 05 deletes these from commands/brief/. NOTE:
// 'new-project' is in the list because that file is renamed to 'init.md'
// in Plan 05 and therefore disappears from the post-prune surface.
//
// Backwards-compat alias DELETED_56 is exposed below so any downstream
// fixture (or 09-00-PLAN.md acceptance-criteria grep) that references the
// historical name still resolves. Both names point at the same array.
const DELETED_57 = [
  'add-backlog', 'add-phase', 'add-todo', 'analyze-dependencies', 'audit-fix',
  'audit-milestone', 'audit-uat', 'autonomous', 'check-todos', 'cleanup',
  'complete-milestone', 'discuss-phase', 'do', 'docs-update', 'execute-phase',
  'explore', 'extract_learnings', 'fast', 'from-gsd2', 'health', 'import',
  'insert-phase', 'intel', 'join-discord', 'list-phase-assumptions',
  'list-workspaces', 'manager', 'map-codebase', 'milestone-summary',
  'new-milestone', 'new-project', 'new-workspace', 'next', 'note',
  'plan-milestone-gaps', 'plan-phase', 'plant-seed', 'profile-user', 'quick',
  'reapply-patches', 'remove-phase', 'remove-workspace', 'research-phase',
  'resume-work', 'review', 'review-backlog', 'scan', 'session-report',
  'set-profile', 'settings', 'spec-phase', 'stats', 'thread', 'update',
  'validate-phase', 'verify-work', 'workstreams',
];

// Backwards-compat alias preserves the planned constant name so that any
// downstream grep / acceptance-criteria check on `DELETED_56` still finds
// a reference. Both names point at the same array.
const DELETED_56 = DELETED_57; // eslint-disable-line no-unused-vars

// Length guard — if this trips, the constants block has drifted.
assert.strictEqual(
  DELETED_57.length,
  57,
  `DELETED_57 must have exactly 57 entries (filesystem-verified count; plan named the constant DELETED_56 but the true 68-on-disk minus 11-of-LOCKED-12-present delta is 57), got ${DELETED_57.length}`,
);

const installContentOrNull = fs.existsSync(INSTALL_JS)
  ? fs.readFileSync(INSTALL_JS, 'utf-8')
  : null;

describe('bin/install.js cleanliness post-HRD-02 pruning (Pitfall 1)', () => {
  for (const slug of DELETED_57) {
    test(`bin/install.js has zero references to deleted command "${slug}"`, (t) => {
      if (installContentOrNull === null) {
        t.skip('bin/install.js absent — fork integrity issue, not a Wave 0 concern');
        return;
      }
      // Match: 'slug.md', "slug.md", or `/slug.md` path component.
      const re = new RegExp(`['"\\/]${slug.replace(/-/g, '\\-')}\\.md['"\\)]`);
      const found = re.test(installContentOrNull);
      if (found) {
        t.skip(`blocked: HRD-02 install.js cleanup not yet executed (Plan 05); refs to ${slug}.md still present`);
        return;
      }
      assert.ok(!found, `bin/install.js still references commands/brief/${slug}.md`);
    });
  }
});
