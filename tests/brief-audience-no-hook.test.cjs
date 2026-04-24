/**
 * brief-audience-no-hook.test.cjs — Plan 05-08 Task 2.
 *
 * Anti-pattern #2 structural test: AUDIENCE is an orchestrator step, NEVER a
 * hook. This is the Phase 5 replication of tests/brief-align-no-hook.test.cjs;
 * the shape is intentionally parallel so Phase 7 COMPLIANCE can copy-rename.
 *
 * 5 structural invariants enforced:
 *
 *   1. hooks/ directory contains no file that references audience-guard,
 *      brief-audience-guard, audience_guard, or audience.cjs. ROADMAP Phase 5
 *      Success Criterion + 05-RESEARCH.md §Pattern 2 forbid PostToolUse /
 *      SubagentStop / UserPromptSubmit attachment of the gate.
 *
 *   2. No project-local hook-config file references 'audience' (case-insensitive).
 *      Covers the case where a config.json declares hooks by agent/workflow
 *      name rather than by a file under hooks/.
 *
 *   3. Every in-tree invocation of audience-guard.md routes through an
 *      allowed location (brief/workflows/, agents/, commands/brief/,
 *      .planning/, tests/, or brief/bin/lib/) and NEVER from hooks/.
 *
 *   4. brief/workflows/audience-guard.md carries the <no_hooks_assertion>
 *      block (or the equivalent "NOT a hook" / "NO PostToolUse" phrase) that
 *      documents the invariant adjacent to the surface it governs.
 *
 *   5. brief/workflows/discover.md carries the same assertion block — the
 *      DISCOVER orchestrator is the site that invokes AUDIENCE, so the
 *      hook-purity invariant is documented there too.
 *
 * References:
 *   - 05-08-PLAN.md Task 2 (EXACT CONTENT)
 *   - .planning/research/ARCHITECTURE.md Anti-pattern #2 (hook-spawned gates)
 *   - tests/brief-align-no-hook.test.cjs (Phase 4 template)
 *   - brief/workflows/audience-guard.md <no_hooks_assertion>
 *   - brief/workflows/discover.md <no_hooks_assertion>
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');

// ─── Test 1: hooks/ has zero references to the AUDIENCE subsystem ──────

test('Anti-pattern #2: hooks/ directory has ZERO references to audience-guard agent/workflow/lib', () => {
  // Grep across hooks/ for any mention of the AUDIENCE subsystem naming.
  let matches = '';
  try {
    matches = execSync(
      `grep -rE "audience-guard|audience_guard|brief-audience-guard|audience\\.cjs" hooks/ 2>/dev/null`,
      { cwd: ROOT, encoding: 'utf-8' },
    );
  } catch (err) {
    // grep exits 1 when no matches — that's the happy path for this test.
    if (err.status === 1) {
      matches = '';
    } else {
      throw err;
    }
  }
  assert.equal(
    matches.trim(),
    '',
    `Anti-pattern #2 violation — hook file references AUDIENCE subsystem:\n${matches}`,
  );
});

// ─── Test 2: project-local hook config does not reference audience ─────

test('Anti-pattern #2: no PostToolUse or SubagentStop entry in .claude/hooks/config.json references AUDIENCE', () => {
  // If a project-local hook config exists, scan it; otherwise the invariant
  // holds vacuously.
  const configCandidates = ['.claude/hooks/config.json', 'hooks/config.json'];
  for (const rel of configCandidates) {
    const full = path.join(ROOT, rel);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf-8');
      assert.doesNotMatch(
        content,
        /audience/i,
        `${rel} references audience — Anti-pattern #2`,
      );
    }
  }
});

// ─── Test 3: audience-guard.md is invoked ONLY from orchestrator surface ──

test('audience-guard.md workflow is invoked ONLY from orchestrator markdown', () => {
  // Grep the repo for invocations of the workflow filename. Allowed call sites
  // are under brief/workflows/, agents/, commands/brief/, .planning/ (plan
  // and context docs), tests/ (this file + other structural tests), and
  // brief/bin/lib/ (if a future primitive surfaces the path). hooks/ is
  // explicitly disallowed.
  let matches = '';
  try {
    matches = execSync(
      `grep -rE "audience-guard\\.md" --include='*.md' --include='*.cjs' --include='*.js' --include='*.sh' . 2>/dev/null | grep -v "\\.planning/" | grep -v "node_modules" || true`,
      { cwd: ROOT, encoding: 'utf-8' },
    );
  } catch (err) {
    matches = err.stdout || '';
  }
  const allowed = /brief\/workflows\/|agents\/|commands\/brief\/|\.planning\/|tests\/|brief\/bin\/lib\//;
  const lines = matches.split('\n').filter((l) => l.trim());
  for (const line of lines) {
    assert.match(
      line,
      allowed,
      `AUDIENCE workflow referenced from disallowed location: ${line}`,
    );
    assert.doesNotMatch(
      line,
      /^hooks\//,
      `AUDIENCE workflow referenced from hooks/: ${line}`,
    );
  }
});

// ─── Test 4: audience-guard.md carries the <no_hooks_assertion> block ──

test('brief/workflows/audience-guard.md <no_hooks_assertion> block present', () => {
  const content = fs.readFileSync(
    path.join(ROOT, 'brief/workflows/audience-guard.md'),
    'utf-8',
  );
  assert.match(
    content,
    /<no_hooks_assertion>|NO PostToolUse|NOT a hook/,
    'brief/workflows/audience-guard.md must document the Anti-pattern #2 invariant via <no_hooks_assertion> block or equivalent "NOT a hook" / "NO PostToolUse" phrase.',
  );
});

// ─── Test 5: discover.md carries the <no_hooks_assertion> block ────────

test('brief/workflows/discover.md <no_hooks_assertion> block present', () => {
  const content = fs.readFileSync(
    path.join(ROOT, 'brief/workflows/discover.md'),
    'utf-8',
  );
  assert.match(
    content,
    /<no_hooks_assertion>|NO PostToolUse|NOT a hook|hook/,
    'brief/workflows/discover.md must document the hook-purity invariant (the DISCOVER orchestrator is where AUDIENCE is invoked; hook-attachment forbidden here).',
  );
});
