/**
 * brief-gap-detect-no-new-command.test.cjs — Phase 6 Plan 08 Task 2 (2 of 4).
 *
 * Surface Cap audit at the filesystem level: Phase 6 adds ZERO net
 * user-facing slash commands. The FORBIDDEN enum (7 paths) is the durable
 * invariant; any future plan that attempts to ship a user-facing gap-detect /
 * gap / return-stack / resume / gap-queue / frame-pop / meta-arbiter command
 * fires this test on the next full-suite run.
 *
 * 5 structural invariants locked:
 *
 *   1. 7-path FORBIDDEN enum — commands/brief/ MUST NOT contain any of:
 *      gap-detect.md, gap.md, return-stack.md, resume.md, gap-queue.md,
 *      frame-pop.md, meta-arbiter.md.
 *
 *   2. /brief-discover surface still exists — commands/brief/discover.md
 *      was stubbed in Phase 3 Plan 05 and is extended (not removed) in
 *      Plan 06-07 (Step 0.5 body append).
 *
 *   3. Intersection check — defense-in-depth against future additions.
 *      readdirSync + .filter(FORBIDDEN.includes) must be empty.
 *
 *   4. hooks/ inventory unchanged by Phase 6 — zero new files with
 *      'gap' prefix. Phase 6's Anti-pattern #2 discipline is reinforced
 *      at the filesystem level.
 *
 *   5. A1 preservation — package.json dependencies count === 0.
 *      Any runtime dep addition breaks the A1 zero-deps promise that lets
 *      BRIEF ride multi-runtime.
 *
 * References:
 *   - 06-08-PLAN.md Task 2 (EXACT CONTENT)
 *   - CLAUDE.md §Surface Caps (≤12 user-facing commands)
 *   - 06-CONTEXT.md D-10 (resume auto-detected inside /brief-discover)
 *   - tests/brief-discover-no-new-command.test.cjs (Phase 5 precedent)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.join(__dirname, '..');
const COMMANDS_DIR = path.join(REPO, 'commands/brief');

// ─── FORBIDDEN enumeration — 7 paths per 06-08-PLAN.md <interfaces> ─────
const FORBIDDEN = [
  'gap-detect.md',
  'gap.md',
  'return-stack.md',
  'resume.md',
  'gap-queue.md',
  'frame-pop.md',
  'meta-arbiter.md',
];

// ─── Test 1: FORBIDDEN filename enum absent ─────────────────────────────

test('Phase 6 NET user-facing command additions = 0 — 7-path FORBIDDEN enum absent', () => {
  for (const fn of FORBIDDEN) {
    const p = path.join(COMMANDS_DIR, fn);
    assert.ok(
      !fs.existsSync(p),
      `Surface Cap violation — Phase 6 MUST NOT add new user-facing command file: commands/brief/${fn}`,
    );
  }
});

// ─── Test 2: /brief-discover still present ──────────────────────────────

test('commands/brief/discover.md exists (Phase 3 stub + Plan 06-07 Step 0.5 extension)', () => {
  assert.ok(
    fs.existsSync(path.join(COMMANDS_DIR, 'discover.md')),
    '/brief-discover command missing — Phase 5/6 broken',
  );
});

// ─── Test 3: Intersection check — defense-in-depth ──────────────────────

test('commands/brief/ contains zero FORBIDDEN entries (intersection check)', () => {
  const entries = fs.existsSync(COMMANDS_DIR)
    ? fs.readdirSync(COMMANDS_DIR)
    : [];
  const intersection = entries.filter((e) => FORBIDDEN.includes(e));
  assert.deepStrictEqual(
    intersection,
    [],
    `commands/brief/ contains FORBIDDEN entries: ${intersection.join(', ')}`,
  );
});

// ─── Test 4: hooks/ unchanged — zero new gap-prefix files ───────────────

test('hooks/ inventory unchanged by Phase 6 — zero new files with gap prefix', () => {
  const hooksDir = path.join(REPO, 'hooks');
  if (!fs.existsSync(hooksDir)) return;
  const entries = fs
    .readdirSync(hooksDir)
    .filter((e) => e.endsWith('.sh') || e.endsWith('.js'));
  const gapRelated = entries.filter((e) => /gap/i.test(e));
  assert.deepStrictEqual(
    gapRelated,
    [],
    `hooks/ contains gap-related files added by Phase 6: ${gapRelated.join(', ')}`,
  );
});

// ─── Test 5: A1 preservation — zero runtime deps ────────────────────────

test('A1 preserved — package.json dependencies count === 0 (zero runtime deps)', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(REPO, 'package.json'), 'utf-8'),
  );
  const depsCount = Object.keys(pkg.dependencies || {}).length;
  assert.strictEqual(
    depsCount,
    0,
    `A1 VERIFIED rule violated — package.json.dependencies has ${depsCount} entries (expected 0)`,
  );
});
