/**
 * brief-align-no-hook.test.cjs — Phase 4 Plan 04-06 Task 2 (File 2 of 2).
 *
 * Structural CI assertion that the ALIGN gate is invoked ONLY from
 * orchestrator markdown (Pattern 4 visibility) — never via hooks.
 *
 * Three structural invariants enforced here:
 *
 *   1. hooks/ directory contains no file that references align-gate,
 *      brief-align-gate, or align.cjs.  ROADMAP Phase 4 Success Criterion #3 +
 *      04-RESEARCH.md Anti-pattern #2 forbid PostToolUse / SubagentStop hook
 *      attachment of the gate. If this grep ever fires, Phase 5 AUDIENCE and
 *      Phase 7 COMPLIANCE inherit a broken-pattern precedent.
 *
 *   2. No user-facing slash command file exists for align (Surface Caps
 *      net = 0 for Phase 4). Specifically: commands/brief/align.md,
 *      commands/brief/align-gate.md, commands/brief/realign.md must NOT
 *      exist. (The orchestrator workflow lives under brief/workflows/,
 *      not commands/brief/.) 04-CONTEXT.md D-08 exit criterion +
 *      CLAUDE.md Surface Caps.
 *
 *   3. agents/brief-align-gate.md frontmatter does NOT declare a `hooks:`
 *      key. Commented-out lines (e.g., "# hooks:") are documentation of
 *      what NOT to do and allowed; a live `hooks:` key is a violation.
 *
 * References:
 *   - 04-06-PLAN.md Task 2 (tests/brief-align-no-hook.test.cjs behaviors)
 *   - 04-CONTEXT.md Area A1 (D-01: explicitly-spawned subagent, not hook)
 *   - 04-RESEARCH.md §Common Pitfalls Anti-pattern #2 (hook-spawned gates)
 *   - .planning/ROADMAP.md Phase 4 Success Criterion #3
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.join(__dirname, '..');

// ─── walkFiles ─────────────────────────────────────────────────────────────
// Recursive file walk. Used to scan the hooks/ directory (and any nested
// dist/ subdirectory that might ship bundled hook files with accidental
// align references).

function walkFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

// ─── Test 1: hooks/ directory contains no reference to align ──────────────

test('hooks/ directory contains no file referencing the ALIGN gate (ROADMAP Phase 4 SC #3)', () => {
  const hooksDir = path.join(REPO_ROOT, 'hooks');
  if (!fs.existsSync(hooksDir)) {
    // hooks/ not present — vacuously passes. Guard in case BRIEF ever drops
    // hooks/ entirely in a future phase.
    return;
  }
  const hits = [];
  for (const file of walkFiles(hooksDir)) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf-8');
    } catch {
      // Binary or unreadable file — skip. Defensive: esbuild-bundled hooks
      // under hooks/dist/ are JS source, so will read as utf-8.
      continue;
    }
    for (const needle of ['align-gate', 'brief-align-gate', 'align.cjs']) {
      if (content.includes(needle)) {
        hits.push(`${file} contains '${needle}'`);
      }
    }
  }
  if (hits.length > 0) {
    assert.fail(
      `ALIGN gate must NOT be referenced in hooks/ (ROADMAP Phase 4 Success ` +
        `Criterion #3, 04-RESEARCH.md Anti-pattern #2). Hits:\n  ` +
        hits.join('\n  '),
    );
  }
});

// ─── Test 2: Surface Caps — no user-facing align command ──────────────────
// ALIGN is orchestrator-internal. Any user-visible /brief-align* slash command
// would violate Phase 4 D-08 canary exit criterion + CLAUDE.md Surface Caps.

test('Surface Caps — no user-facing align command file exists (Phase 4 net = 0)', () => {
  const forbidden = [
    'commands/brief/align.md',
    'commands/brief/align-gate.md',
    'commands/brief/realign.md',
  ];
  const existing = forbidden.filter((p) =>
    fs.existsSync(path.join(REPO_ROOT, p)),
  );
  assert.deepStrictEqual(
    existing,
    [],
    `Surface Caps violation: user-facing ALIGN command file(s) found: ${existing.join(', ')}. ` +
      `ALIGN is orchestrator-internal (Phase 4 D-08 + CLAUDE.md Surface Caps). ` +
      `Move the workflow content under brief/workflows/ and delete the command file.`,
  );
});

// ─── Test 3: brief/workflows/align-gate.md is visibly invoked from define.md ──
// ROADMAP Phase 4 SC #3 (gate is orchestrator-visible): the align-gate
// workflow must be referenced from at least one orchestrator workflow.
// Phase 4 canary binds to /brief-define Mode A wrap-up at Step 3.5.

test('brief/workflows/align-gate.md exists AND is referenced from brief/workflows/define.md', () => {
  const alignGatePath = path.join(REPO_ROOT, 'brief/workflows/align-gate.md');
  assert.ok(
    fs.existsSync(alignGatePath),
    'brief/workflows/align-gate.md must exist — ALIGN gate orchestrator workflow.',
  );
  const defineContent = fs.readFileSync(
    path.join(REPO_ROOT, 'brief/workflows/define.md'),
    'utf-8',
  );
  // The canary wiring must reference the workflow by path. Accept either the
  // bare filename or the fully-qualified path — both appear in prior waves.
  assert.ok(
    /brief\/workflows\/align-gate\.md|align-gate\.md/.test(defineContent),
    'brief/workflows/define.md must reference align-gate.md (Phase 4 SC #3: gate is orchestrator-visible). ' +
      'Phase 4 Plan 04-05 wires this at Step 3.5 of define.md.',
  );
  // Also verify define.md's Step 3.5 exists (defense-in-depth; the canary
  // test locks step positioning elsewhere but we want a self-contained
  // structural check here too).
  assert.ok(
    /^## Step 3\.5/m.test(defineContent),
    'brief/workflows/define.md must have a `## Step 3.5` heading (Phase 4 Plan 04-05 canary positioning).',
  );
});

// ─── Test 4: agents/brief-align-gate.md frontmatter has no `hooks:` key ───
// 04-RESEARCH.md Anti-pattern #2: auto-attach via agent-level
// PostToolUse/SubagentStop is forbidden. Some runtimes express hook
// registration as a frontmatter `hooks:` key; this test asserts no such
// live key exists. Commented-out lines (e.g., "# hooks:") are preserved —
// they document what NOT to do.

test('agents/brief-align-gate.md frontmatter declares no live `hooks:` key (Anti-pattern #2)', () => {
  const content = fs.readFileSync(
    path.join(REPO_ROOT, 'agents/brief-align-gate.md'),
    'utf-8',
  );
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(
    fmMatch,
    'agents/brief-align-gate.md must carry a YAML frontmatter block.',
  );
  const fm = fmMatch[1];
  const lines = fm.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) continue; // commented out → documentation OK
    if (/^hooks:/i.test(trimmed)) {
      assert.fail(
        `agents/brief-align-gate.md frontmatter contains a live 'hooks:' key — ` +
          `Anti-pattern #2 forbids auto-attach. Line: '${line}'`,
      );
    }
  }
});
