/**
 * brief-deliver-no-hooks.test.cjs — Phase 8 Plan 08-08 Wave 0 RED.
 *
 * Anti-pattern #2 structural test (Phase 4 inheritance + Phase 5/7 replication):
 * Phase 8 must NOT introduce any PostToolUse / SubagentStop / UserPromptSubmit
 * hooks. The ONLY hook addition allowed in Phase 8 is CC-03 — a PreToolUse-on-
 * Bash-matcher hook (`hooks/brief-validate-frontmatter.sh`) per Plan 07.
 *
 * Anti-pattern #2 verbatim:
 *   "Audience/Compliance/Voice-fit gates are explicit orchestrator steps,
 *    NEVER hooks. Hook-spawned gates create a 30-60s latency tax on every
 *    Write/Edit; gate cardinality drift is invisible; user has no way to opt
 *    out per task."
 *
 * Phase 8 NEW files audited:
 *   - commands/brief/deliver.md       (Plan 08 Task 2)
 *   - commands/brief/export.md        (Plan 08 Task 2)
 *   - brief/workflows/deliver.md      (Plan 08 Task 2)
 *   - brief/workflows/export.md       (Plan 08 Task 2)
 *   - agents/brief-deliver-type-a.md  (Plan 05)
 *   - agents/brief-deliver-type-b.md  (Plan 06)
 *   - hooks/brief-validate-frontmatter.sh (Plan 07 — MUST be PreToolUse on Bash, NOT PostToolUse)
 *
 * Wave 0 RED: some files do not exist yet. Tests treat ENOENT as RED failure
 * mode (Task 2 will land them).
 *
 * References:
 *   - .planning/research/ARCHITECTURE.md Anti-pattern #2 (hook-spawned gates)
 *   - tests/brief-audience-no-hook.test.cjs (Phase 5 template)
 *   - tests/brief-compliance-no-hooks.test.cjs (Phase 7 template)
 *   - .planning/phases/08-deliver-type-a-type-b-audience-enforcement-marp/08-RESEARCH.md
 *     Anti-Patterns lines 1049-1059 (Wave 0 gap)
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..');

const PHASE_8_NEW_FILES = [
  'commands/brief/deliver.md',
  'commands/brief/export.md',
  'brief/workflows/deliver.md',
  'brief/workflows/export.md',
  'agents/brief-deliver-type-a.md',
  'agents/brief-deliver-type-b.md',
];

// ─── Test 1: Phase 8 NEW files contain ZERO PostToolUse / SubagentStop refs ─

test('Anti-pattern #2: Phase 8 NEW files contain ZERO PostToolUse / SubagentStop / UserPromptSubmit hook registrations', () => {
  const banned = ['PostToolUse', 'SubagentStop', 'UserPromptSubmit'];
  for (const rel of PHASE_8_NEW_FILES) {
    const abs = path.join(REPO_ROOT, rel);
    if (!fs.existsSync(abs)) {
      assert.fail(`Phase 8 NEW file ${rel} does not exist (Plan 08 Task 2 not yet executed — Wave 0 RED expected)`);
    }
    const content = fs.readFileSync(abs, 'utf-8');
    for (const word of banned) {
      // Anti-pattern #2: any mention is suspicious unless wrapped in NEGATING
      // phrases ("NO PostToolUse", "NOT a hook", "<no_hooks_assertion>").
      // Strip those negation contexts before grepping.
      const negationStripped = content
        .replace(/<no_hooks_assertion>[\s\S]*?<\/no_hooks_assertion>/g, '')
        .replace(/NO PostToolUse[\s\S]{0,80}/g, '')
        .replace(/NOT? (a |attached as )?hooks?[\s\S]{0,80}/g, '')
        .replace(/Anti-pattern #?\s*2[\s\S]{0,200}/g, '')
        .replace(/anti-?patterns?[\s\S]{0,200}/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');
      if (negationStripped.includes(word)) {
        const idx = negationStripped.indexOf(word);
        const snippet = negationStripped.slice(Math.max(0, idx - 60), idx + word.length + 60);
        assert.fail(`${rel} references '${word}' in non-negation context — Anti-pattern #2 violation. Snippet: "${snippet}"`);
      }
    }
  }
});

// ─── Test 2: bin/install.js Phase 8 only adds CC-03 PreToolUse Bash matcher ─

test('Anti-pattern #2: bin/install.js Phase 8 additions are limited to brief-validate-frontmatter (PreToolUse on Bash) — NO PostToolUse on Write', () => {
  // Read bin/install.js for Phase 8 additions.
  const installSrc = fs.readFileSync(path.join(REPO_ROOT, 'bin/install.js'), 'utf-8');
  // Verify brief-validate-frontmatter (CC-03) is registered.
  assert.match(installSrc, /brief-validate-frontmatter/, 'bin/install.js must register brief-validate-frontmatter (CC-03 — Plan 07)');
  // Verify NO new Phase 8 PostToolUse on Write/Edit additions for deliver/export gates.
  // Look for any line that combines "PostToolUse" with "deliver" or "export" (Phase 8 gates).
  const lines = installSrc.split('\n');
  for (const line of lines) {
    if (/PostToolUse/.test(line) && /(deliver|brief-export|export\.cjs|voice-fit|leakage-diff)/i.test(line)) {
      assert.fail(`bin/install.js contains a PostToolUse registration referencing a Phase 8 gate: "${line.trim()}". Anti-pattern #2 forbids hook-spawned gates.`);
    }
  }
});

// ─── Test 3: hooks/ directory does NOT reference deliver/export workflows ─

test('Anti-pattern #2: hooks/ directory has ZERO references to /brief-deliver, /brief-export, voice-fit, leakage-diff', () => {
  let matches = '';
  try {
    matches = execSync(
      `grep -rE "brief-deliver|brief-export|voice-fit|leakage-diff|deliver\\.cjs|export\\.cjs|deliver\\.md|export\\.md" hooks/ 2>/dev/null || true`,
      { cwd: REPO_ROOT, encoding: 'utf-8' },
    );
  } catch (err) {
    // grep exit 1 → no match, happy path
    if (err.status === 1) matches = '';
    else throw err;
  }
  // Allow lines mentioning brief-validate-frontmatter (CC-03 Plan 07) — that's the ONE permitted hook.
  // Otherwise zero references.
  const offending = matches.split('\n').filter((l) => l.trim() && !/validate-frontmatter/i.test(l));
  assert.equal(
    offending.join('\n').trim(),
    '',
    `Anti-pattern #2 violation — hooks/ references Phase 8 gate subsystems:\n${offending.join('\n')}`,
  );
});

// ─── Test 4: brief/workflows/deliver.md + export.md document the no-hooks invariant ─

test('Anti-pattern #2 documentation: brief/workflows/deliver.md carries no_hooks_assertion or NOT a hook phrase', () => {
  const abs = path.join(REPO_ROOT, 'brief/workflows/deliver.md');
  if (!fs.existsSync(abs)) {
    assert.fail('brief/workflows/deliver.md does not exist (Plan 08 Task 2 not yet executed — Wave 0 RED expected)');
  }
  const content = fs.readFileSync(abs, 'utf-8');
  assert.match(
    content,
    /<no_hooks_assertion>|NO PostToolUse|NOT a hook|hook|orchestrator step/i,
    'brief/workflows/deliver.md must document Anti-pattern #2 invariant (no PostToolUse / orchestrator-step discipline).',
  );
});

test('Anti-pattern #2 documentation: brief/workflows/export.md carries no_hooks_assertion or NOT a hook phrase', () => {
  const abs = path.join(REPO_ROOT, 'brief/workflows/export.md');
  if (!fs.existsSync(abs)) {
    assert.fail('brief/workflows/export.md does not exist (Plan 08 Task 2 not yet executed — Wave 0 RED expected)');
  }
  const content = fs.readFileSync(abs, 'utf-8');
  assert.match(
    content,
    /<no_hooks_assertion>|NO PostToolUse|NOT a hook|hook|orchestrator step/i,
    'brief/workflows/export.md must document Anti-pattern #2 invariant.',
  );
});
