/**
 * brief-gap-detect-no-hook.test.cjs — Phase 6 Plan 08 Task 2 (1 of 4).
 *
 * Anti-pattern #2 structural test: gap-detect is an orchestrator step,
 * NEVER a hook. This is the Phase 6 replication of
 * tests/brief-align-no-hook.test.cjs + tests/brief-audience-no-hook.test.cjs.
 * Phase 7 COMPLIANCE copies this shape verbatim.
 *
 * 5 structural invariants enforced:
 *
 *   1. hooks/ directory contains zero references to gap-detect /
 *      brief-gap-detector / gap_detect / gap-detect.cjs / gap-detect.md.
 *      06-CONTEXT.md D-02 + 06-RESEARCH.md Anti-patterns forbid hook-based
 *      gate invocation.
 *
 *   2. hooks/config.json (if present) is clean of gap-detect refs —
 *      covers the case where a config.json declares hooks by agent/workflow
 *      name rather than a file under hooks/.
 *
 *   3. Every in-tree reference to gap-detect routes through an allowed
 *      orchestrator surface (brief/workflows/, agents/, brief/bin/,
 *      brief/bin/lib/, brief/references/, tests/, or CLAUDE.md). hooks/
 *      is explicitly disallowed.
 *
 *   4. brief/workflows/gap-detect.md carries the <no_hooks_assertion>
 *      block or equivalent "NOT a hook" / "NO PostToolUse" phrase.
 *
 *   5. brief/workflows/align-gate.md Step 8 (Phase 6 addition) references
 *      gap-detect AND contains a gap-detect-specific <no_hooks_assertion>
 *      citation.
 *
 * References:
 *   - 06-08-PLAN.md Task 2 (EXACT CONTENT)
 *   - 06-CONTEXT.md D-02 (trigger after ALIGN only; zero hook surfaces)
 *   - .planning/research/ARCHITECTURE.md Anti-pattern #2
 *   - tests/brief-audience-no-hook.test.cjs (Phase 5 precedent)
 *   - tests/brief-align-no-hook.test.cjs (Phase 4 precedent)
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const REPO = path.join(__dirname, '..');
const HOOKS_DIR = path.join(REPO, 'hooks');
const NEEDLES = [
  'gap-detect',
  'brief-gap-detector',
  'gap_detect',
  'gap-detect.cjs',
  'gap-detect.md',
];

// ─── Test 1: hooks/ has zero references to the gap-detect subsystem ─────

test('Anti-pattern #2: hooks/ directory has ZERO references to gap-detect subsystem', () => {
  const hits = [];
  for (const needle of NEEDLES) {
    try {
      const out = execSync(
        `grep -rl '${needle}' '${HOOKS_DIR}' 2>/dev/null || true`,
        { encoding: 'utf-8' },
      );
      if (out.trim() !== '') hits.push(`'${needle}':\n${out}`);
    } catch (err) {
      // grep exits 1 when no matches — happy path.
      if (err.status !== 1) throw err;
    }
  }
  assert.strictEqual(
    hits.length,
    0,
    `Anti-pattern #2 violation — hooks/ references gap-detect:\n${hits.join('\n')}`,
  );
});

// ─── Test 2: hooks/config.json (if present) clean of gap-detect refs ────

test('Anti-pattern #2: hooks config files (if present) contain no gap-detect references', () => {
  const cfgPaths = [
    path.join(HOOKS_DIR, 'config.json'),
    path.join(REPO, '.claude/hooks/config.json'),
  ];
  for (const p of cfgPaths) {
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, 'utf-8');
    for (const needle of NEEDLES) {
      assert.ok(
        !content.toLowerCase().includes(needle.toLowerCase()),
        `hooks config ${p} references '${needle}' — Anti-pattern #2`,
      );
    }
  }
});

// ─── Test 3: gap-detect refs route through allowed orchestrator surfaces ──

test('Every in-tree reference to gap-detect routes through allowed surfaces (not hooks/)', () => {
  let out = '';
  try {
    out = execSync(
      `grep -rl 'gap-detect' '${REPO}' `
        + `--include='*.md' --include='*.cjs' --include='*.js' `
        + `--exclude-dir='.planning' --exclude-dir='node_modules' `
        + `--exclude-dir='.git' --exclude-dir='.claude' 2>/dev/null || true`,
      { encoding: 'utf-8' },
    );
  } catch (err) {
    if (err.status !== 1) throw err;
  }
  const paths = out.split('\n').filter(Boolean);
  for (const p of paths) {
    const rel = p.replace(REPO + '/', '');
    const allowed = rel.startsWith('brief/workflows/')
      || rel.startsWith('agents/')
      || rel.startsWith('brief/bin/lib/')
      || rel.startsWith('brief/bin/')
      || rel.startsWith('brief/references/')
      || rel.startsWith('tests/')
      || rel === 'CLAUDE.md';
    assert.ok(
      allowed,
      `gap-detect reference from disallowed location: ${rel}`,
    );
    assert.ok(
      !rel.startsWith('hooks/'),
      `gap-detect reference from hooks/: ${rel}`,
    );
  }
});

// ─── Test 4: gap-detect.md workflow carries <no_hooks_assertion> block ──

test('brief/workflows/gap-detect.md <no_hooks_assertion> block present', () => {
  const wf = fs.readFileSync(
    path.join(REPO, 'brief/workflows/gap-detect.md'),
    'utf-8',
  );
  assert.ok(
    /<no_hooks_assertion>/.test(wf)
      || /NO PostToolUse/.test(wf)
      || /NOT a hook/i.test(wf)
      || /never.*hook/i.test(wf),
    'brief/workflows/gap-detect.md must document the Anti-pattern #2 invariant '
      + 'via <no_hooks_assertion> block or equivalent "NOT a hook" / "NO PostToolUse" phrase.',
  );
});

// ─── Test 5: align-gate.md Step 8 references gap-detect + no-hook block ──

test('brief/workflows/align-gate.md Step 8 references gap-detect and carries gap-detect no-hook citation', () => {
  const wf = fs.readFileSync(
    path.join(REPO, 'brief/workflows/align-gate.md'),
    'utf-8',
  );
  assert.ok(
    wf.includes('## Step 8'),
    'brief/workflows/align-gate.md missing Step 8 heading (Phase 6 D-02 gap-detect post-verdict spawn)',
  );
  assert.ok(
    wf.includes('gap-detect'),
    'brief/workflows/align-gate.md Step 8 should reference gap-detect workflow',
  );
  assert.ok(
    /<no_hooks_assertion>/.test(wf)
      || /NOT a hook/i.test(wf)
      || /never.*hook/i.test(wf),
    'brief/workflows/align-gate.md must carry <no_hooks_assertion> block '
      + '(extended by Phase 6 with gap-detect citation).',
  );
});
