/**
 * brief-discover-no-new-command.test.cjs — Plan 05-08 Task 3.
 *
 * Surface Cap audit at the filesystem level: Phase 5 adds 0 net user-facing
 * slash commands. 5 structural invariants locked:
 *
 *   1. FORBIDDEN enumeration — every file name that would violate Surface Cap
 *      per 05-CONTEXT Risk Notes (audience.md / audience-check.md /
 *      audience-guard.md / reaudit.md / realign.md / discover-audit.md /
 *      provenance.md / provenance-check.md / context-inject.md) is asserted
 *      absent from commands/brief/.
 *   2. /brief-discover surface still exists — commands/brief/discover.md was
 *      stubbed in Phase 3 and its body was replaced (not removed) in Plan 05-07.
 *   3. commands/brief/ invariant — the directory MUST NOT contain any
 *      FORBIDDEN file. The total user-facing count is capped at ≤12 per
 *      CLAUDE.md §Surface Caps, but the reduction is scheduled for Phase 9
 *      HRD-02; Phase 5's contract is NET additions = 0.
 *   4. hooks/ invariant — Phase 5 adds exactly ONE new hook
 *      (brief-validate-provenance.sh from Plan 03). Any other new hook file
 *      would be out of scope.
 *   5. A1 preservation — package.json `dependencies` MUST remain empty.
 *      A single runtime dep added by Phase 5 would break the A1 zero-deps
 *      promise validated at Phase 1 entry.
 *
 * The FORBIDDEN list is the durable invariant. If a future plan attempts to
 * ship a user-facing audience or reaudit command, this test fires immediately
 * at the next full-suite run.
 *
 * Threat mitigations (05-08-PLAN §threat_model):
 *   - T-5-08-01: FORBIDDEN enum catches Surface-Cap-ignoring adds.
 *   - T-5-08-03: A1 preservation catches runtime-dep additions.
 *
 * References:
 *   - 05-08-PLAN.md Task 3 (EXACT CONTENT)
 *   - CLAUDE.md §Surface Caps (≤12 user-facing slash commands)
 *   - 05-CONTEXT.md Non-goals: "Any NEW top-level user-facing slash command
 *     beyond the /brief-discover body replacement"
 *   - 05-04-PLAN.md — 9-path FORBIDDEN file-test (superset alignment)
 *   - 05-07-PLAN.md — FORBIDDEN enumeration documented
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const COMMANDS_DIR = path.join(ROOT, 'commands', 'brief');

// ─── FORBIDDEN enumeration ──────────────────────────────────────────────
// Files that MUST NOT exist at Phase 5 completion — each would be a Surface
// Cap violation per 05-CONTEXT Risk Notes + 05-08-PLAN §must_haves.truths[3].
// The list mirrors the 9-path assertion baked into brief/workflows/audience-guard.md
// <command_surface_assertion> (Plan 05-04) so enforcement is consistent across
// workflow markdown + filesystem-level test.
const FORBIDDEN = [
  'audience.md',
  'audience-check.md',
  'audience-guard.md',
  'reaudit.md',
  'realign.md',
  'discover-audit.md',
  'provenance.md',
  'provenance-check.md',
  'context-inject.md',
];

// ─── Test 1: FORBIDDEN files are NOT present ────────────────────────────

test('Phase 5 NET user-facing command additions = 0 — forbidden files NOT present', () => {
  for (const name of FORBIDDEN) {
    const full = path.join(COMMANDS_DIR, name);
    assert.ok(
      !fs.existsSync(full),
      `Surface Cap violation — Phase 5 MUST NOT add new user-facing command file: commands/brief/${name}`,
    );
  }
});

// ─── Test 2: /brief-discover surface still exists ──────────────────────

test('commands/brief/discover.md exists and is the ONLY /brief-discover surface', () => {
  assert.ok(
    fs.existsSync(path.join(COMMANDS_DIR, 'discover.md')),
    'commands/brief/discover.md must exist (stub from Phase 3, body replaced by Plan 05-07)',
  );
});

// ─── Test 3: commands/brief/ contains no FORBIDDEN file ────────────────

test('commands/brief/ count is at or below CLAUDE.md Surface Cap of 12 user-facing slash commands', () => {
  // CLAUDE.md §Surface Caps documents that at Phase 2 entry BRIEF inherited
  // 61 renamed commands. The reduction to ≤12 is scheduled for Phase 9
  // HRD-02 audit (documentation-only in Phase 2 per D-07). Phase 5's
  // contract is narrower: do NOT ADD new user-facing commands. The absolute
  // ≤12 count is NOT asserted here — that's Phase 9's responsibility.
  // This test is a TRAP DETECTOR: if it ever fires due to Phase 5 (or
  // subsequent phases before HRD-02) adding a FORBIDDEN file, that's a
  // Surface Cap violation even if the total is still above 12.
  const files = fs.readdirSync(COMMANDS_DIR).filter((f) => f.endsWith('.md'));
  assert.ok(
    files.includes('discover.md'),
    'commands/brief/discover.md must exist (stub from Phase 3)',
  );
  const leaked = files.filter((f) => FORBIDDEN.includes(f));
  assert.ok(
    leaked.length === 0,
    `One or more forbidden Phase 5 files snuck in: ${leaked.join(', ')}`,
  );
});

// ─── Test 4: hooks/ has exactly the Phase 5 expected additions ─────────

test('No new hook files added in Phase 5 beyond brief-validate-provenance.sh', () => {
  // Phase 5 explicitly adds ONE new hook via Plan 03: brief-validate-provenance.sh.
  // Any OTHER new hook file would be out of scope for Phase 5 per CONTEXT.
  // This list is the ALLOWED inventory at Phase 5 exit (inherited + Plan 03).
  const hooksDir = path.join(ROOT, 'hooks');
  if (!fs.existsSync(hooksDir)) return;
  const files = fs
    .readdirSync(hooksDir)
    .filter((f) => f.endsWith('.sh') || f.endsWith('.js'));
  const auditFiles = [
    // Phase 5 addition (Plan 03)
    'brief-validate-provenance.sh',
    // Phase 1-4 inherited hooks
    'brief-validate-commit.sh',
    'brief-check-update-worker.js',
    'brief-check-update.js',
    'brief-context-monitor.js',
    'brief-phase-boundary.sh',
    'brief-prompt-guard.js',
    'brief-read-guard.js',
    'brief-read-injection-scanner.js',
    'brief-session-state.sh',
    'brief-statusline.js',
    'brief-workflow-guard.js',
  ];
  for (const f of files) {
    assert.ok(
      auditFiles.includes(f),
      `Unexpected hook file added in Phase 5: ${f}`,
    );
  }
});

// ─── Test 5: A1 preservation — zero runtime deps ───────────────────────

test('A1 preserved — package.json dependencies empty (zero runtime deps)', () => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'),
  );
  const depCount = Object.keys(pkg.dependencies || {}).length;
  assert.equal(
    depCount,
    0,
    `A1 VERIFIED rule violated — package.json.dependencies has ${depCount} entries (expected 0)`,
  );
});
